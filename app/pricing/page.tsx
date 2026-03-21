import { Suspense } from 'react';
import { getUser, getGoogleLoginUrl } from '@/lib/auth';
import { PricingClient } from './client';

export default async function PricingPage() {
  const user = await getUser();
  const loginUrl = getGoogleLoginUrl();

  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <PricingClient user={user} loginUrl={loginUrl} />
    </Suspense>
  );
}
