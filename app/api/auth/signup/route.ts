import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { hashPassword } from '@/lib/password';
import { sendVerificationEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName } = await req.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 1. Ensure User Exists or Create
    let userId: string;

    const existingUserRes = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUserRes.rows.length > 0) {
      userId = existingUserRes.rows[0].id;
    } else {
      const insertUserRes = await query(
        'INSERT INTO users (email, full_name) VALUES ($1, $2) RETURNING id',
        [email, fullName]
      );
      userId = insertUserRes.rows[0].id;
    }

    // 2. Add Auth Method (Email)
    // Check if email auth already exists
    const existingAuthRes = await query(
      "SELECT id FROM user_auth_methods WHERE user_id = $1 AND provider = 'email'",
      [userId]
    );

    if (existingAuthRes.rows.length > 0) {
      return NextResponse.json({ error: 'User already registered with email' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    await query(
      "INSERT INTO user_auth_methods (user_id, provider, password_hash) VALUES ($1, 'email', $2)",
      [userId, hashedPassword]
    );

    // 3. Create Verification Code
    // Invalidate old codes
    await query(
        "UPDATE email_verification_codes SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL",
        [userId]
    );

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    await query(
      "INSERT INTO email_verification_codes (user_id, code, expires_at) VALUES ($1, $2, NOW() + INTERVAL '10 minutes')",
      [userId, code]
    );

    // 4. Send Email
    await sendVerificationEmail(email, code);

    return NextResponse.json({ success: true, userId });
  } catch (error) {
    console.error('Signup Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
