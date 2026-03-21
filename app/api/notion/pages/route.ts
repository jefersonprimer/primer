import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { query } from '@/lib/database';

export async function GET(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await query(
      `SELECT * FROM notion_pages 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [user.id]
    );

    return NextResponse.json({ pages: result.rows });
  } catch (error) {
    console.error('List Notion Pages Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { notion_page_id, parent_page_id, title, url, source_chat_id } = body;

    const result = await query(
      `INSERT INTO notion_pages 
       (user_id, notion_page_id, parent_page_id, title, url, source_chat_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user.id, notion_page_id, parent_page_id, title, url, source_chat_id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Create Notion Page Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
