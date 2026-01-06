import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyPassword } from '@/lib/password';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { email, password, source, poll_id } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 1. Get User and Auth Method
    const res = await query(
      `SELECT u.id, u.email, u.email_verified, m.password_hash
       FROM users u
       JOIN user_auth_methods m ON m.user_id = u.id
       WHERE u.email = $1 AND m.provider = 'email'`,
      [email]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = res.rows[0];

    // 2. Verify Password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 3. Check Verified
    if (!user.email_verified) {
      return NextResponse.json({ error: 'Email not verified', notVerified: true }, { status: 403 });
    }

    // 4. Handle Desktop/Dev flow with polling (same as Google OAuth)
    if (source === 'desktop' || source === 'dev') {
      const sessionId = uuidv4();
      const dbSource = poll_id ? `desktop:${poll_id}` : source;

      console.log('[Email Login] Desktop flow - Session:', sessionId, 'DBSource:', dbSource);

      // Insert into oauth_sessions for polling
      await query(
        `INSERT INTO oauth_sessions (id, user_id, source, provider, expires_at)
         VALUES ($1, $2, $3, 'email', NOW() + INTERVAL '1 minute')`,
        [sessionId, user.id, dbSource]
      );

      return NextResponse.json({ success: true, session: sessionId, source });
    }

    // 5. Standard Web flow with JWT cookie
    const token = jwt.sign(
      { id: user.id, email: user.email },
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
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
