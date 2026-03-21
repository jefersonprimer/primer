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
    const { title } = body;

    const result = await query(
      `UPDATE notion_pages 
       SET title = COALESCE($1, title),
           updated_at = now()
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [title, id, user.id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Update Notion Page Error:', error);
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
      'DELETE FROM notion_pages WHERE id = $1 AND user_id = $2',
      [id, user.id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Page deleted from tracking' });
  } catch (error) {
    console.error('Delete Notion Page Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
