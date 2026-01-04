import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const source = searchParams.get('source') || 'web';
    const pollId = searchParams.get('poll_id');
    const userId = searchParams.get('user_id');

    if (!userId) {
        return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const clientId = process.env.NOTION_CLIENT_ID;
    if (!clientId) {
        return NextResponse.json({ error: 'NOTION_CLIENT_ID not configured' }, { status: 500 });
    }

    const cookieStore = await cookies();
    cookieStore.set('auth_source', source, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 10, // 10 minutes
    });

    const stateObj: Record<string, string> = { source, userId, type: 'notion_connect' };
    if (pollId) {
        stateObj.pollId = pollId;
    }

    const state = JSON.stringify(stateObj);
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/oauth/notion/callback`;

    const authUrl = new URL('https://api.notion.com/v1/oauth/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('owner', 'user');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);

    return NextResponse.redirect(authUrl.toString());
}
