import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

interface ShareChatRequest {
  chatId: string;
  title: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
  }>;
  userId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ShareChatRequest = await req.json();
    
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required and must not be empty' },
        { status: 400 }
      );
    }

    const shareId = uuidv4();
    
    // Create the shared chat snapshot
    const sql = `
      INSERT INTO shared_chats (id, original_chat_id, title, messages, shared_by_user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, created_at
    `;
    
    const result = await query(sql, [
      shareId,
      body.chatId || null,
      body.title || 'Shared Chat',
      JSON.stringify(body.messages),
      body.userId || null,
    ]);

    const sharedChat = result.rows[0];
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://primerai.vercel.app';
    const shareUrl = `${baseUrl}/c/${sharedChat.id}`;

    return NextResponse.json({
      shareId: sharedChat.id,
      shareUrl,
      createdAt: sharedChat.created_at,
    });

  } catch (error) {
    console.error('Share Chat Error:', error);
    return NextResponse.json(
      { error: 'Failed to create shared chat' },
      { status: 500 }
    );
  }
}
