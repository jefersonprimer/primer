import { getUser, getGoogleLoginUrl } from '@/lib/auth';
import { PricingClient } from './client';

export default async function PricingPage() {
  const user = await getUser();
  const loginUrl = getGoogleLoginUrl();

  return <PricingClient user={user} loginUrl={loginUrl} />;
}
