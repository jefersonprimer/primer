import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { user_id } = body;

        if (!user_id) {
            return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
        }

        // Remove calendar tokens from user
        await query(
            `UPDATE users 
       SET google_calendar_token = NULL,
           google_calendar_refresh_token = NULL,
           google_calendar_connected_at = NULL
       WHERE id = $1`,
            [user_id]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Disconnect Calendar Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
