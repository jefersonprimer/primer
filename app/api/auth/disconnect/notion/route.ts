import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { user_id } = body;

        if (!user_id) {
            return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
        }

        // Remove Notion integration from user
        await query(
            `DELETE FROM notion_integrations WHERE user_id = $1`,
            [user_id]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Disconnect Notion Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
