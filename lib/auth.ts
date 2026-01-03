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

export function getGoogleLoginUrl() {
  if (!process.env.GOOGLE_CLIENT_ID) {
    console.error('Missing GOOGLE_CLIENT_ID');
    return '#error-missing-client-id';
  }
  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    console.error('Missing NEXT_PUBLIC_SITE_URL');
    return '#error-missing-site-url';
  }

  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback/google`,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
}
