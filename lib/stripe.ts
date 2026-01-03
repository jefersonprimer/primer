import Stripe from 'stripe';

const apiKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_for_build';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Warning: STRIPE_SECRET_KEY is missing. Using placeholder for build.');
}

export const stripe = new Stripe(apiKey, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});
