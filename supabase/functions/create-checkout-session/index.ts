// @ts-nocheck
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { priceId, successUrl, cancelUrl, trial } = await req.json();

        if (!priceId) {
            throw new Error('Price ID is required');
        }

        // 1. Authenticate the user
        const authHeader = req.headers.get('Authorization')!;
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !user) throw new Error('Unauthorized');

        // 2. Initialize Stripe
        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
        if (!stripeKey) {
            throw new Error('STRIPE_SECRET_KEY is missing');
        }

        const stripe = new Stripe(stripeKey, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        });

        // 3. Check for existing customer ID
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { data: subData } = await supabaseAdmin
            .from('subscriptions')
            .select('stripe_customer_id')
            .eq('user_id', user.id)
            .maybeSingle();

        let customerId = subData?.stripe_customer_id;

        // 4. Create or fetch customer
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    supabase_user_id: user.id
                }
            });
            customerId = customer.id;

            // Save it immediately to avoid duplicates
            await supabaseAdmin.from('subscriptions').upsert({
                user_id: user.id,
                stripe_customer_id: customerId
            });
        }

        console.log('Creating checkout session for user:', user.id, 'Price:', priceId, 'Trial:', trial);

        const origin = req.headers.get('origin') || 'http://localhost:5173';

        const sessionConfig = {
            customer: customerId,
            client_reference_id: user.id,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: successUrl || `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl || origin,
            allow_promotion_codes: true,
            subscription_data: {}
        };

        if (trial) {
            sessionConfig.subscription_data.trial_period_days = 14;
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);

        console.log('Session created:', session.id);

        return new Response(
            JSON.stringify({ url: session.url }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
});
