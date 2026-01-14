import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: 'Share ID is required' },
                { status: 400 }
            );
        }

        // Fetch the shared chat
        const sql = `
      SELECT id, title, messages, created_at, expires_at
      FROM shared_chats
      WHERE id = $1
        AND (expires_at IS NULL OR expires_at > NOW())
    `;

        const result = await query(sql, [id]);

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Shared chat not found or has expired' },
                { status: 404 }
            );
        }

        const sharedChat = result.rows[0];

        return NextResponse.json({
            id: sharedChat.id,
            title: sharedChat.title,
            messages: sharedChat.messages,
            createdAt: sharedChat.created_at,
        });

    } catch (error) {
        console.error('Get Shared Chat Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch shared chat' },
            { status: 500 }
        );
    }
}
