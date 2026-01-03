import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    // 1. Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback/google`,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Token Error:', tokenData.error);
      return NextResponse.json({ error: tokenData.error }, { status: 400 });
    }

    const { access_token } = tokenData;

    // 2. Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const userData = await userResponse.json();
    const { id: googleId, email, name, picture } = userData;

    // 3. UPSERT User
    const sql = `
      INSERT INTO users (email, google_id, full_name, profile_picture, password_hash)
      VALUES ($1, $2, $3, $4, 'google_auth_placeholder')
      ON CONFLICT (email) DO UPDATE
      SET google_id = EXCLUDED.google_id,
          full_name = EXCLUDED.full_name,
          profile_picture = EXCLUDED.profile_picture
      RETURNING id, email
    `;

    const result = await query(sql, [email, googleId, name, picture]);
    const user = result.rows[0];

    // 4. Create Session (JWT)
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // 5. Set Cookie
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // 6. Redirect
    return NextResponse.redirect(new URL('/pricing', req.url));

  } catch (error) {
    console.error('Auth Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
