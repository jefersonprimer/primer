import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
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
                redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback/calendar`,
                grant_type: 'authorization_code',
            }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            console.error('Token Error:', tokenData.error);
            return NextResponse.json({ error: tokenData.error }, { status: 400 });
        }

        const { access_token, refresh_token } = tokenData;

        // 2. Get user email from state or token userinfo
        const stateParam = searchParams.get('state');
        let userId: string | null = null;
        let source = 'web';
        let pollId: string | undefined;

        if (stateParam) {
            try {
                const state = JSON.parse(stateParam);
                userId = state.userId;
                source = state.source || 'web';
                pollId = state.pollId;
            } catch (e) {
                console.error('Failed to parse state param:', e);
            }
        }

        // If no userId in state, try to get from email
        if (!userId) {
            const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${access_token}` },
            });
            const userData = await userResponse.json();

            const userResult = await query(
                `SELECT id FROM users WHERE email = $1`,
                [userData.email]
            );

            if (userResult.rows.length === 0) {
                return NextResponse.json({ error: 'User not found. Please login first.' }, { status: 404 });
            }
            userId = userResult.rows[0].id;
        }

        // 3. Update user with calendar tokens
        await query(
            `UPDATE users 
       SET google_calendar_token = $1, 
           google_calendar_refresh_token = COALESCE($2, google_calendar_refresh_token),
           google_calendar_connected_at = NOW()
       WHERE id = $3`,
            [access_token, refresh_token, userId]
        );

        // 4. Handle desktop flow
        const cookieStore = await cookies();
        const cookieSource = cookieStore.get('auth_source')?.value;
        const finalSource = source || cookieSource || 'web';

        if (finalSource === 'desktop' || finalSource === 'dev') {
            const sessionId = uuidv4();
            const dbSource = pollId ? `${finalSource}:${pollId}` : finalSource;

            // Insert into oauth_sessions with calendar_connected flag
            await query(
                `INSERT INTO oauth_sessions (id, user_id, source, provider, expires_at)
         VALUES ($1, $2, $3, 'google_calendar', NOW() + INTERVAL '1 minute')`,
                [sessionId, userId, dbSource]
            );

            cookieStore.delete('auth_source');

            return NextResponse.redirect(
                new URL(`/auth-success?session=${sessionId}&source=${finalSource}&type=calendar`, req.url)
            );
        }

        // 5. Web flow - redirect back to settings
        cookieStore.delete('auth_source');
        return NextResponse.redirect(new URL('/settings?tab=calendar&connected=true', req.url));

    } catch (error) {
        console.error('Calendar Auth Error:', error instanceof Error ? error.message : error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
