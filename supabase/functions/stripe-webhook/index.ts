// @ts-nocheck
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')!;
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(stripeKey, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
});

const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

Deno.serve(async (req) => {
    const signature = req.headers.get('stripe-signature');

    try {
        const body = await req.text();
        let event;

        try {
            event = await stripe.webhooks.constructEventAsync(body, signature!, webhookSecret);
        } catch (err) {
            console.error(`Webhook signature verification failed: ${err.message}`);
            return new Response(`Webhook Error: ${err.message}`, { status: 400 });
        }

        console.log(`🔔 Webhook received: ${event.type}`);

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const userId = session.client_reference_id;
                const customerId = session.customer;
                const subscriptionId = session.subscription;

                if (userId && subscriptionId) {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const planType = determinePlan(subscription);

                    await supabaseAdmin.from('subscriptions').upsert({
                        user_id: userId,
                        stripe_customer_id: customerId,
                        stripe_subscription_id: subscriptionId,
                        plan_type: planType,
                        status: subscription.status,
                        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                        cancel_at_period_end: subscription.cancel_at_period_end
                    }, { onConflict: 'user_id' });

                    // Log payment in billing history
                    if (session.amount_total) {
                        await supabaseAdmin.from('billing_history').insert({
                            user_id: userId,
                            amount: session.amount_total / 100,
                            currency: session.currency?.toUpperCase() || 'EUR',
                            status: 'paid',
                            description: `Initial payment for ${planType} plan`
                        });
                    }
                }
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object;
                const customerId = invoice.customer;
                const subscriptionId = invoice.subscription;

                if (subscriptionId) {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const planType = determinePlan(subscription);

                    // Update subscription period
                    await supabaseAdmin.from('subscriptions')
                        .update({
                            plan_type: planType,
                            status: subscription.status,
                            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                            cancel_at_period_end: subscription.cancel_at_period_end,
                            updated_at: new Date().toISOString()
                        })
                        .eq('stripe_customer_id', customerId);

                    // Record recurring payment
                    const { data: subData } = await supabaseAdmin
                        .from('subscriptions')
                        .select('user_id')
                        .eq('stripe_customer_id', customerId)
                        .single();

                    if (subData?.user_id && invoice.amount_paid > 0) {
                        await supabaseAdmin.from('billing_history').insert({
                            user_id: subData.user_id,
                            amount: invoice.amount_paid / 100,
                            currency: invoice.currency?.toUpperCase() || 'EUR',
                            status: 'paid',
                            description: `Subscription renewal: ${planType}`
                        });
                    }
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                const customerId = invoice.customer;

                await supabaseAdmin.from('subscriptions')
                    .update({
                        status: 'past_due',
                        updated_at: new Date().toISOString()
                    })
                    .eq('stripe_customer_id', customerId);

                // Here you could send a triggered email via another service
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                const customerId = subscription.customer;
                const planType = determinePlan(subscription);

                await supabaseAdmin.from('subscriptions')
                    .update({
                        plan_type: planType,
                        status: subscription.status,
                        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                        cancel_at_period_end: subscription.cancel_at_period_end,
                        updated_at: new Date().toISOString()
                    })
                    .eq('stripe_customer_id', customerId);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const customerId = subscription.customer;

                await supabaseAdmin.from('subscriptions')
                    .update({
                        plan_type: 'free',
                        status: 'canceled',
                        updated_at: new Date().toISOString()
                    })
                    .eq('stripe_customer_id', customerId);
                break;
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        });

    } catch (err) {
        console.error(`Webhook handler failed: ${err.message}`);
        return new Response(`Error: ${err.message}`, { status: 500 });
    }
});

function determinePlan(subscription) {
    const priceId = subscription.items.data[0].price.id;

    const premiumMonthly = Deno.env.get('VITE_PRICE_PREMIUM_MONTHLY');
    const premiumYearly = Deno.env.get('VITE_PRICE_PREMIUM_YEARLY');
    const standardMonthly = Deno.env.get('VITE_PRICE_STANDARD_MONTHLY');
    const standardYearly = Deno.env.get('VITE_PRICE_STANDARD_YEARLY');

    if (priceId === premiumMonthly || priceId === premiumYearly) return 'premium';
    if (priceId === standardMonthly || priceId === standardYearly) return 'standard';

    // Fallback detection
    if (priceId.includes('premium')) return 'premium';
    if (priceId.includes('standard')) return 'standard';
    return 'free';
}
