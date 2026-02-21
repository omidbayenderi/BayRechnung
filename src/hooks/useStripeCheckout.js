import { supabase } from '../lib/supabase';

export const useStripeCheckout = () => {
    const redirectToCheckout = async (priceId, trial = false) => {
        const handleDemoUnlock = async () => {
            alert('🚀 MVP / Demo Mode Active!\n\nStripe payments are not fully configured yet. We are unlocking Premium Power for your account automatically for testing purposes. Please wait a moment...');
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { error } = await supabase.from('subscriptions').update({
                    plan_type: 'premium',
                    status: 'active'
                }).eq('user_id', user.id);

                if (error) {
                    console.error('Failed to update subscription:', error);
                    alert('Hata: Premium yapma işlemi başarısız oldu.');
                } else {
                    window.location.reload();
                }
            } else {
                alert('You must be logged in to test the demo.');
            }
        };

        try {
            if (!priceId || priceId.startsWith('price_xxx') || priceId.startsWith('price_test')) {
                await handleDemoUnlock();
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
                // Treat ANY error as a reason to use the demo unlock fallback
                await handleDemoUnlock();
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
            // Catch-all fallback
            await handleDemoUnlock();
        }
    };

    return { redirectToCheckout };
};
