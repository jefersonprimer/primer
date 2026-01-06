import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    const userRes = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userRes.rows[0].id;

    // Invalidate old codes
    await query(
        "UPDATE email_verification_codes SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL",
        [userId]
    );

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await query(
      "INSERT INTO email_verification_codes (user_id, code, expires_at) VALUES ($1, $2, NOW() + INTERVAL '10 minutes')",
      [userId, code]
    );

    await sendVerificationEmail(email, code);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Resend Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
