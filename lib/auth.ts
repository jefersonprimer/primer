import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    return payload as { id: string; email: string };
  } catch (error) {
    return null;
  }
}

/**
 * Get Google OAuth URL for basic login (email + profile only)
 */
export function getGoogleLoginUrl(state?: string) {
  if (!process.env.GOOGLE_CLIENT_ID) {
    console.error('Missing GOOGLE_CLIENT_ID');
    return '#error-missing-client-id';
  }
  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    console.error('Missing NEXT_PUBLIC_SITE_URL');
    return '#error-missing-site-url';
  }

  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options: Record<string, string> = {
    redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback/google`,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: 'online', // No refresh token needed for basic login
    response_type: 'code',
    prompt: 'select_account', // Just select account, no consent needed for basic scopes
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };

  if (state) {
    options.state = state;
  }

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
}

/**
 * Get Google OAuth URL for connecting Google Calendar (calendar scope)
 * Requires offline access for refresh token to maintain long-term access
 */
export function getGoogleCalendarConnectUrl(state?: string) {
  if (!process.env.GOOGLE_CLIENT_ID) {
    console.error('Missing GOOGLE_CLIENT_ID');
    return '#error-missing-client-id';
  }
  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    console.error('Missing NEXT_PUBLIC_SITE_URL');
    return '#error-missing-site-url';
  }

  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options: Record<string, string> = {
    redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback/calendar`,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: 'offline', // Need refresh token for calendar
    response_type: 'code',
    prompt: 'consent', // Always prompt to ensure we get refresh token
    scope: [
      'https://www.googleapis.com/auth/userinfo.email', // Need email to identify user
      'https://www.googleapis.com/auth/calendar',
    ].join(' '),
  };

  if (state) {
    options.state = state;
  }

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
}
