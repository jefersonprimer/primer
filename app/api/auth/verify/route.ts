import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { sendWelcomeEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { email, code, source, poll_id } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 1. Verify Code
    const codeRes = await query(
      `SELECT c.id, c.user_id, c.expires_at, u.full_name
       FROM email_verification_codes c
       JOIN users u ON u.id = c.user_id
       WHERE u.email = $1 AND c.code = $2 AND c.used_at IS NULL`,
      [email, code]
    );

    if (codeRes.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    }

    const { id: codeId, user_id: userId, expires_at, full_name } = codeRes.rows[0];

    if (new Date() > new Date(expires_at)) {
      return NextResponse.json({ error: 'Code expired' }, { status: 400 });
    }

    // 2. Mark User as Verified
    await query('UPDATE users SET email_verified = true WHERE id = $1', [userId]);

    // 3. Mark Code as Used
    await query('UPDATE email_verification_codes SET used_at = NOW() WHERE id = $1', [codeId]);

    // 4. Send Welcome Email (async, don't await)
    sendWelcomeEmail(email, full_name).catch(console.error);

    // 5. Handle Desktop/Dev flow with polling (same as Google OAuth)
    if (source === 'desktop' || source === 'dev') {
      const sessionId = uuidv4();
      const dbSource = poll_id ? `desktop:${poll_id}` : source;

      console.log('[Email Verify] Desktop flow - Session:', sessionId, 'DBSource:', dbSource);

      // Insert into oauth_sessions for polling
      await query(
        `INSERT INTO oauth_sessions (id, user_id, source, provider, expires_at)
         VALUES ($1, $2, $3, 'email', NOW() + INTERVAL '1 minute')`,
        [sessionId, userId, dbSource]
      );

      return NextResponse.json({ success: true, session: sessionId, source });
    }

    // 6. Standard Web flow - Create Session JWT
    const token = jwt.sign(
      { id: userId, email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({ success: true, token });
  } catch (error) {
    console.error('Verify Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

