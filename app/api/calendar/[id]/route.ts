import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { query } from '@/lib/database';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { title, description, start_at, end_at, status } = body;

    const result = await query(
      `UPDATE google_calendar_events 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           start_at = COALESCE($3, start_at),
           end_at = COALESCE($4, end_at),
           status = COALESCE($5, status),
           updated_at = now()
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [title, description, start_at, end_at, status, id, user.id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Update Calendar Event Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const result = await query(
      'UPDATE google_calendar_events SET status = \'canceled\', updated_at = now() WHERE id = $1 AND user_id = $2',
      [id, user.id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Event canceled successfully' });
  } catch (error) {
    console.error('Delete Calendar Event Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
