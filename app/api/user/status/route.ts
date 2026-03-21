import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { query } from '@/lib/database';

export async function GET(req: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Get fresh user data including integrations
    const userResult = await query(
      `SELECT u.*, 
       (SELECT count(*) > 0 FROM notion_integrations WHERE user_id = u.id) as notion_connected,
       (SELECT workspace_name FROM notion_integrations WHERE user_id = u.id LIMIT 1) as notion_workspace
       FROM users u WHERE u.id = $1`,
      [user.id]
    );

    const fullUser = userResult.rows[0];

    return NextResponse.json({
      authenticated: true,
      user: {
        id: fullUser.id,
        email: fullUser.email,
        full_name: fullUser.full_name,
        profile_picture: fullUser.profile_picture,
        plan: fullUser.plan,
        isCalendarConnected: !!fullUser.google_calendar_token,
        isNotionConnected: fullUser.notion_connected,
        notionWorkspace: fullUser.notion_workspace,
      }
    });
  } catch (error) {
    console.error('User Status Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
