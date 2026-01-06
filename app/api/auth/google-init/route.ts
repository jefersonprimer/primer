import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getGoogleLoginUrl } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const source = searchParams.get('source') || 'web';
  const pollId = searchParams.get('poll_id');

  const cookieStore = await cookies();
  cookieStore.set('auth_source', source, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 10, // 10 minutes
  });

  const stateObj: any = { source };
  if (pollId) {
    stateObj.pollId = pollId;
  }
  
  const state = JSON.stringify(stateObj);
  const redirectUri = getGoogleLoginUrl(state);

  if (redirectUri.startsWith('#')) {
      return NextResponse.json({ error: 'Configuration error: ' + redirectUri }, { status: 500 });
  }

  return NextResponse.redirect(redirectUri);
}
