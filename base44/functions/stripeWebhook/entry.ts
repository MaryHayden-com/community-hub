import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret || !sig) {
      console.error('stripeWebhook: missing signature or webhook secret');
      return Response.json({ error: 'Missing signature' }, { status: 400 });
    }

    const event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);

    console.log('Stripe webhook event:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { listing_id, plan, user_email } = session.metadata || {};

      if (listing_id && plan) {
        const subscriptionId = session.subscription;
        let renewalDate = null;

        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          renewalDate = new Date(sub.current_period_end * 1000).toISOString().split('T')[0];
        }

        const listings = await base44.asServiceRole.entities.CommunityListing.filter({ id: listing_id });
        if (listings.length > 0) {
          await base44.asServiceRole.entities.CommunityListing.update(listing_id, {
            plan,
            plan_status: 'active',
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: session.customer,
            plan_renewal_date: renewalDate,
            owner_email: user_email || listings[0].owner_email,
            is_featured: plan === 'premium',
          });
          console.log(`Updated listing ${listing_id} to plan: ${plan}`);
        }
      }
    }

    if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
      const sub = event.data.object;
      const { listing_id } = sub.metadata || {};

      if (listing_id) {
        const isActive = sub.status === 'active';
        const plan = sub.metadata?.plan || 'basic';
        await base44.asServiceRole.entities.CommunityListing.update(listing_id, {
          plan: isActive ? plan : 'basic',
          plan_status: isActive ? 'active' : 'cancelled',
          plan_renewal_date: isActive ? new Date(sub.current_period_end * 1000).toISOString().split('T')[0] : null,
          is_featured: isActive && plan === 'premium',
        });
        console.log(`Subscription ${event.type} for listing ${listing_id}, status: ${sub.status}`);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('stripeWebhook error:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
});