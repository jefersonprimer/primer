import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { query } from '@/lib/database';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

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
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const stripeCustomerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (!userId || !subscriptionId) {
        console.error('Missing userId or subscriptionId in session');
        break;
      }

      try {
        // Buscar detalhes da subscription
        const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subscription = subscriptionResponse as any;
        const priceId = subscription.items.data[0].price.id;

        // Mapear price ID para nome do plano
        let plan = 'free';
        if (priceId === process.env.STRIPE_PRICE_PLUS_MONTHLY || priceId === process.env.STRIPE_PRICE_PLUS_YEARLY) {
          plan = 'plus';
        } else if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY || priceId === process.env.STRIPE_PRICE_PRO_YEARLY) {
          plan = 'pro';
        }

        const periodStart = subscription.current_period_start || Math.floor(Date.now() / 1000);
        const periodEnd = subscription.current_period_end || Math.floor(Date.now() / 1000) + 2592000; // 30 days

        // Upsert subscription no banco
        await query(`
          INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_start, current_period_end)
          VALUES ($1, $2, $3, $4, 'active', to_timestamp($5), to_timestamp($6))
          ON CONFLICT (user_id) DO UPDATE SET
            stripe_customer_id = EXCLUDED.stripe_customer_id,
            stripe_subscription_id = EXCLUDED.stripe_subscription_id,
            plan = EXCLUDED.plan,
            status = 'active',
            current_period_start = EXCLUDED.current_period_start,
            current_period_end = EXCLUDED.current_period_end,
            updated_at = now()
        `, [userId, stripeCustomerId, subscriptionId, plan, periodStart, periodEnd]);

        console.log(`Subscription saved for user ${userId}: ${plan}`);
      } catch (dbError) {
        console.error('Error saving subscription to database:', dbError);
      }
      break;

    case 'customer.subscription.updated':
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedSubscription = event.data.object as any;
      const updatedPriceId = updatedSubscription.items?.data?.[0]?.price?.id;

      let updatedPlan = 'free';
      if (updatedPriceId === process.env.STRIPE_PRICE_PLUS_MONTHLY || updatedPriceId === process.env.STRIPE_PRICE_PLUS_YEARLY) {
        updatedPlan = 'plus';
      } else if (updatedPriceId === process.env.STRIPE_PRICE_PRO_MONTHLY || updatedPriceId === process.env.STRIPE_PRICE_PRO_YEARLY) {
        updatedPlan = 'pro';
      }

      const updatedPeriodStart = updatedSubscription.current_period_start || Math.floor(Date.now() / 1000);
      const updatedPeriodEnd = updatedSubscription.current_period_end || Math.floor(Date.now() / 1000) + 2592000;

      try {
        await query(`
          UPDATE subscriptions
          SET plan = $1, status = $2, current_period_start = to_timestamp($3), current_period_end = to_timestamp($4), updated_at = now()
          WHERE stripe_subscription_id = $5
        `, [updatedPlan, updatedSubscription.status, updatedPeriodStart, updatedPeriodEnd, updatedSubscription.id]);

        console.log(`Subscription updated: ${updatedSubscription.id}`);
      } catch (dbError) {
        console.error('Error updating subscription:', dbError);
      }
      break;

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription;

      try {
        await query(`
          UPDATE subscriptions
          SET status = 'canceled', plan = 'free', updated_at = now()
          WHERE stripe_subscription_id = $1
        `, [deletedSubscription.id]);

        console.log(`Subscription canceled: ${deletedSubscription.id}`);
      } catch (dbError) {
        console.error('Error canceling subscription:', dbError);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
