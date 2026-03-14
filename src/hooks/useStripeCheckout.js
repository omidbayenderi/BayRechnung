import { supabase } from '../lib/supabase';

export const useStripeCheckout = () => {
    const IS_PROD = import.meta.env.VITE_PROD_MODE === 'true';

    const redirectToCheckout = async (priceId, trial = false) => {
        const handleDemoUnlock = async (errorMessage = null) => {
            if (IS_PROD) {
                const technicalDetail = errorMessage ? `\n\nDetay: ${errorMessage}` : '';
                alert(`Ödeme sistemi şu anda yapılandırılıyor. Lütfen destek ile iletişime geçin.${technicalDetail}`);
                return;
            }
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
                    successUrl: import.meta.env.VITE_SUCCESS_URL || window.location.origin + '/success',
                    cancelUrl: import.meta.env.VITE_CANCEL_URL || window.location.origin + '/',
                },
            });

            if (error) {
                console.error('Checkout session creation error:', error);
                
                // Inspect the error object to get more details
                let msg = error.message || 'Bilinmeyen bir hata oluştu.';
                if (error.context) {
                    try {
                        const body = await error.context.json();
                        if (body.error) msg = body.error;
                    } catch (e) {
                         // ignore
                    }
                }
                
                await handleDemoUnlock(msg);
                return;
            }

            if (data?.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (err) {
            console.error('Stripe checkout error:', err);
            await handleDemoUnlock(err.message);
        }
    };

    const redirectToPortal = async (returnUrl = null) => {
        try {
            const { data, error } = await supabase.functions.invoke('create-portal-session', {
                body: { returnUrl: returnUrl || window.location.href },
            });

            if (error) {
                console.error('Portal redirect error:', error);
                alert('Müşteri portalına yönlendirilemedi: ' + error.message);
                return;
            }

            if (data?.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No portal URL returned');
            }
        } catch (err) {
            console.error('Portal session error:', err);
            alert('Hata: Ödeme yönetim paneline ulaşılamıyor.');
        }
    };

    return { redirectToCheckout, redirectToPortal };
};
