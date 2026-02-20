import { supabase } from '../lib/supabase';

export const useStripeCheckout = () => {
    const redirectToCheckout = async (priceId, trial = false) => {
        try {
            if (!priceId || priceId.startsWith('price_xxx') || priceId.startsWith('price_test')) {
                alert('⚠️ Stripe not configured yet!\n\nPlease create products in Stripe Dashboard and update .env file with actual Price IDs.');
                return;
            }

            // Call Supabase Edge Function to create checkout session
            const { data, error } = await supabase.functions.invoke('create-checkout-session', {
                body: {
                    priceId,
                    trial, // Pass trial flag
                    successUrl: import.meta.env.VITE_SUCCESS_URL || window.location.origin + '/BayRechnung/success',
                    cancelUrl: import.meta.env.VITE_CANCEL_URL || window.location.origin + '/BayRechnung/',
                },
            });

            if (error) {
                console.error('Checkout session creation error:', error);

                // Fallback for missing edge function during development/MVP
                if (error.message.includes('Failed to send a request') || error.message.includes('not found')) {
                    alert('⚠️ Payment Gateway Not Fully Configured!\n\nStripe Edge Function is not deployed to your Supabase project yet.\n\nFor this MVP/Demo, please imagine you are redirected to a secure Stripe Checkout page to complete your subscription.');
                    return;
                }

                alert('❌ Failed to create checkout session: ' + error.message);
                return;
            }

            if (data?.url) {
                // Redirect to Stripe Checkout
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (err) {
            console.error('Stripe checkout error:', err);
            alert('❌ Failed to initialize payment: ' + err.message);
        }
    };

    return { redirectToCheckout };
};
