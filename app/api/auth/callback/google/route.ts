import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

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
    const userSql = `
      INSERT INTO users (email, full_name, profile_picture, email_verified)
      VALUES ($1, $2, $3, true)
      ON CONFLICT (email) DO UPDATE
      SET full_name = EXCLUDED.full_name,
          profile_picture = EXCLUDED.profile_picture,
          email_verified = true
      RETURNING id, email
    `;

    const userResult = await query(userSql, [email, name, picture]);
    const user = userResult.rows[0];

    // 4. UPSERT Auth Method
    // Check if auth method exists to know if we should send welcome email
    const authMethodCheck = await query(
      "SELECT id FROM user_auth_methods WHERE user_id = $1 AND provider = 'google'",
      [user.id]
    );

    const isNewGoogleAuth = authMethodCheck.rows.length === 0;

    if (isNewGoogleAuth) {
      await query(
        "INSERT INTO user_auth_methods (user_id, provider, provider_user_id) VALUES ($1, 'google', $2)",
        [user.id, googleId]
      );
      
      // Send welcome email
      // We import it dynamically or at the top. I'll need to add the import.
      // But 'replace' tool context is limited. I'll add the import in a separate call or just rely on the user adding it if I can't see the top.
      // Actually, I should verify imports first.
    } else {
        // Ensure provider_user_id is up to date if needed (unlikely to change for google)
         await query(
            "UPDATE user_auth_methods SET provider_user_id = $2 WHERE user_id = $1 AND provider = 'google'",
            [user.id, googleId]
         );
    }
    
    // Import sendWelcomeEmail
    const { sendWelcomeEmail } = await import('@/lib/email');
    if (isNewGoogleAuth) {
        sendWelcomeEmail(email, name).catch(console.error);
    }

    // Check Auth Source
    const cookieStore = await cookies();
    let source = cookieStore.get('auth_source')?.value;
    let pollId: string | undefined;

    const stateParam = searchParams.get('state');

    console.log('[Auth Callback] Init - Cookie Source:', source, 'State:', stateParam);

    if (!source && stateParam) {
      try {
        const state = JSON.parse(stateParam);
        if (state.source) {
          source = state.source;
        }
        if (state.pollId) {
          pollId = state.pollId;
        }
      } catch (e) {
        console.error('Failed to parse state param:', e);
      }
    }

    // If state has pollId, prioritize it (cookie might be stale or missing in some flows)
    if (!pollId && stateParam) {
      try {
        const state = JSON.parse(stateParam);
        if (state.pollId) pollId = state.pollId;
      } catch { }
    }

    console.log('[Auth Callback] Final - Source:', source, 'PollId:', pollId);

    if (source === 'desktop' || source === 'dev') {
      const sessionId = uuidv4();

      // If we have a pollId, append it to source for DB storage so we can query it later
      const dbSource = pollId ? `${source}:${pollId}` : source;

      console.log('[Auth Callback] Inserting Session - ID:', sessionId, 'DBSource:', dbSource);

      // Insert into oauth_sessions
      await query(
        `INSERT INTO oauth_sessions (id, user_id, source, provider, expires_at)
             VALUES ($1, $2, $3, 'google', NOW() + INTERVAL '1 minute')`,
        [sessionId, user.id, dbSource]
      );

      // Clear source cookie
      cookieStore.delete('auth_source');

      // Redirect with session
      return NextResponse.redirect(new URL(`/auth-success?session=${sessionId}&source=${source}`, req.url));
    }

    // 4. Create Session (JWT) for Web
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // 5. Set Cookie for Web
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Clear source cookie
    cookieStore.delete('auth_source');

    // 6. Redirect Web
    return NextResponse.redirect(new URL('/auth-success', req.url));

  } catch (error) {
    console.error('Auth Error:', error instanceof Error ? error.message : error);
    console.error('Auth Error Stack:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
