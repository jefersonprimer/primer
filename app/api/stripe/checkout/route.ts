import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { priceId } = body;

    let stripePriceId = '';

    switch (priceId) {
      case 'plus-monthly':
        stripePriceId = process.env.STRIPE_PRICE_PLUS_MONTHLY!;
        break;
      case 'plus-yearly':
        stripePriceId = process.env.STRIPE_PRICE_PLUS_YEARLY!;
        break;
      case 'pro-monthly':
        stripePriceId = process.env.STRIPE_PRICE_PRO_MONTHLY!;
        break;
      case 'pro-yearly':
        stripePriceId = process.env.STRIPE_PRICE_PRO_YEARLY!;
        break;
      default:
        return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 });
    }
    
    // Ensure the environment variable was actually set
    if (!stripePriceId) {
        console.error(`Stripe price ID missing for ${priceId}`);
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
