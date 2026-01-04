import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session } = body;

    if (!session) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Check session
    const sessionResult = await query(
      `SELECT * FROM oauth_sessions WHERE id = $1`,
      [session]
    );

    const sessionData = sessionResult.rows[0];

    if (!sessionData) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    if (new Date(sessionData.expires_at) < new Date()) {
      await query(`DELETE FROM oauth_sessions WHERE id = $1`, [session]);
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    // Get User
    const userResult = await query(
      `SELECT * FROM users WHERE id = $1`,
      [sessionData.user_id]
    );
    const user = userResult.rows[0];

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate Token
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' } // Longer expiration for app? Or keep 7d.
    );

    // Delete session
    await query(`DELETE FROM oauth_sessions WHERE id = $1`, [session]);

    return NextResponse.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        profile_picture: user.profile_picture,
        // Calendar connection status
        isCalendarConnected: !!user.google_calendar_token,
        google_calendar_token: user.google_calendar_token || null,
      }
    });

  } catch (error) {
    console.error('Exchange Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
