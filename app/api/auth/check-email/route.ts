import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ exists: false });

    const res = await query('SELECT id FROM users WHERE email = $1', [email]);
    return NextResponse.json({ exists: res.rows.length > 0 });
  } catch (error) {
    return NextResponse.json({ exists: false });
  }
}
