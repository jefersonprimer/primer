import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const pollId = searchParams.get('poll_id');

  if (!pollId) {
    return NextResponse.json({ error: 'Missing poll_id' }, { status: 400 });
  }

  try {
    // Check if a session exists for this poll_id (stored in source as 'desktop:poll_id')
    // We also need to make sure we don't return expired sessions, although exchange handles that.
    const dbSource = `desktop:${pollId}`;
    // console.log('[Auth Poll] Checking for:', dbSource);
    
    const result = await query(
      `SELECT id FROM oauth_sessions WHERE source = $1`,
      [dbSource]
    );

    const session = result.rows[0];

    if (session) {
      console.log('[Auth Poll] Session FOUND for:', dbSource, 'Session:', session.id);
      return NextResponse.json({ session: session.id });
    } else {
      // Not found yet (pending)
      return NextResponse.json({ status: 'pending' });
    }

  } catch (error) {
    console.error('Poll Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
