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
        // Parse state
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

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // 1. Exchange code for access token
        const clientId = process.env.NOTION_CLIENT_ID!;
        const clientSecret = process.env.NOTION_CLIENT_SECRET!;
        const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/oauth/notion/callback`;

        const tokenResponse = await fetch('https://api.notion.com/v1/oauth/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            console.error('Notion Token Error:', tokenData.error);
            return NextResponse.json({ error: tokenData.error }, { status: 400 });
        }

        const {
            access_token,
            bot_id,
            workspace_id,
            workspace_name,
            workspace_icon,
            owner,
            duplicated_template_id,
        } = tokenData;

        // 2. Save Notion integration to database
        await query(
            `INSERT INTO notion_integrations 
        (user_id, access_token, bot_id, workspace_id, workspace_name, workspace_icon, owner_type, duplicated_template_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       ON CONFLICT (user_id) DO UPDATE
       SET access_token = EXCLUDED.access_token,
           bot_id = EXCLUDED.bot_id,
           workspace_id = EXCLUDED.workspace_id,
           workspace_name = EXCLUDED.workspace_name,
           workspace_icon = EXCLUDED.workspace_icon,
           owner_type = EXCLUDED.owner_type,
           duplicated_template_id = EXCLUDED.duplicated_template_id,
           updated_at = NOW()`,
            [
                userId,
                access_token,
                bot_id,
                workspace_id,
                workspace_name || null,
                workspace_icon || null,
                owner?.type || 'user',
                duplicated_template_id || null,
            ]
        );

        // 3. Handle desktop flow
        const cookieStore = await cookies();
        const cookieSource = cookieStore.get('auth_source')?.value;
        const finalSource = source || cookieSource || 'web';

        if (finalSource === 'desktop' || finalSource === 'dev') {
            const sessionId = uuidv4();
            const dbSource = pollId ? `${finalSource}:${pollId}` : finalSource;

            // Insert into oauth_sessions
            await query(
                `INSERT INTO oauth_sessions (id, user_id, source, provider, expires_at)
         VALUES ($1, $2, $3, 'notion', NOW() + INTERVAL '1 minute')`,
                [sessionId, userId, dbSource]
            );

            cookieStore.delete('auth_source');

            return NextResponse.redirect(
                new URL(`/auth-success?session=${sessionId}&source=${finalSource}&type=notion`, req.url)
            );
        }

        // 4. Web flow - redirect back to settings
        cookieStore.delete('auth_source');
        return NextResponse.redirect(new URL('/settings?tab=notion&connected=true', req.url));

    } catch (error) {
        console.error('Notion Auth Error:', error instanceof Error ? error.message : error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
