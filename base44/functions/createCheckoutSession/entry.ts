import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

const PLANS = {
  monthly: {
    price_id: 'price_1TUXDOD3Hb4wOTs9UyylABgH',
    name: 'Monthly Listing — €20/month',
  },
  annual: {
    price_id: 'price_1TUXDOD3Hb4wOTs9XXNQzmDF',
    name: 'Annual Listing — €200/year',
  },
  // Legacy plans (keep for existing subscribers)
  standard: {
    price_id: 'price_1TjyQvL1Hdd45gUuZViwfxuc',
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

    const { plan, listing_name, contact_name, email, success_url, cancel_url } = await req.json();

    const planConfig = PLANS[plan];
    if (!planConfig) return Response.json({ error: 'Invalid plan' }, { status: 400 });

    if (!email) return Response.json({ error: 'Email is required' }, { status: 400 });

    // Look up or create Stripe customer by email
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email,
        name: contact_name || '',
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: planConfig.price_id, quantity: 1 }],
      mode: 'subscription',
      success_url: success_url || `${Deno.env.get('BASE44_APP_URL') || 'https://hub4community.ie'}?submitted=1`,
      cancel_url: cancel_url || `${Deno.env.get('BASE44_APP_URL') || 'https://hub4community.ie'}`,
      customer_email: customers.data.length === 0 ? email : undefined,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        listing_name: listing_name || '',
        plan,
        user_email: email,
      },
      subscription_data: {
        metadata: {
          listing_name: listing_name || '',
          plan,
          user_email: email,
        },
      },
    });

    return Response.json({ url: session.url, session_id: session.id });
  } catch (error) {
    console.error('createCheckoutSession error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});