import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { query } from '@/lib/database';

export async function GET(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await query(
      `SELECT * FROM google_calendar_events 
       WHERE user_id = $1 AND status != 'canceled'
       ORDER BY start_at ASC`,
      [user.id]
    );

    return NextResponse.json({ events: result.rows });
  } catch (error) {
    console.error('List Calendar Events Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { google_event_id, title, description, start_at, end_at, timezone, source_chat_id } = body;

    const result = await query(
      `INSERT INTO google_calendar_events 
       (user_id, google_event_id, title, description, start_at, end_at, timezone, source_chat_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'user')
       RETURNING *`,
      [user.id, google_event_id || 'manual', title, description, start_at, end_at, timezone || 'UTC', source_chat_id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Create Calendar Event Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
