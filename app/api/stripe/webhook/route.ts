import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { query } from '@/lib/database';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // You would typically update your database here
      // const userId = session.metadata?.userId;
      // const stripeCustomerId = session.customer;
      // ... update user to set as 'pro' or similar
      console.log('Checkout session completed:', session.id);
      break;
    case 'customer.subscription.deleted':
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      console.log('Subscription updated/deleted:', subscription.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
