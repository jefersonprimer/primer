import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getGoogleCalendarConnectUrl } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const source = searchParams.get('source') || 'web';
    const pollId = searchParams.get('poll_id');
    const userId = searchParams.get('user_id');

    if (!userId) {
        return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    cookieStore.set('auth_source', source, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 10, // 10 minutes
    });

    const stateObj: any = { source, userId, type: 'calendar_connect' };
    if (pollId) {
        stateObj.pollId = pollId;
    }

    const state = JSON.stringify(stateObj);
    const redirectUri = getGoogleCalendarConnectUrl(state);

    if (redirectUri.startsWith('#')) {
        return NextResponse.json({ error: 'Configuration error: ' + redirectUri }, { status: 500 });
    }

    return NextResponse.redirect(redirectUri);
}
