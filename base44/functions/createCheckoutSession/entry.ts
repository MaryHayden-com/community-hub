import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

const PLANS = {
  standard: {
    price_id: 'price_1TMcSjD3Hb4wOTs9FfJ3vMhF',
    name: 'Standard Plan',
  },
  premium: {
    price_id: 'price_1TMcSjD3Hb4wOTs9oil05nJm',
    name: 'Premium Plan',
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { plan, listing_id, success_url, cancel_url } = await req.json();

    const planConfig = PLANS[plan];
    if (!planConfig) return Response.json({ error: 'Invalid plan' }, { status: 400 });

    // Look up existing Stripe customer by email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: planConfig.price_id, quantity: 1 }],
      mode: 'subscription',
      success_url: success_url || 'https://app.base44.com',
      cancel_url: cancel_url || 'https://app.base44.com',
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        listing_id,
        plan,
        user_email: user.email,
      },
      subscription_data: {
        metadata: {
          listing_id,
          plan,
          user_email: user.email,
        },
      },
    });

    return Response.json({ url: session.url, session_id: session.id });
  } catch (error) {
    console.error('createCheckoutSession error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});