import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Check, CreditCard, Shield, Zap, FileText, Download, Rocket, Loader2, Save, Lock as LockIcon, Globe as GlobeIcon, Key, Eye, EyeOff, Copy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import PremiumUpgradeModal from '../../components/admin/PremiumUpgradeModal';
import { supabase } from '../../lib/supabase';
import { useStripeCheckout } from '../../hooks/useStripeCheckout';
import { useInvoice } from '../../context/InvoiceContext';
import { useNotification } from '../../context/NotificationContext';

const SubscriptionManagement = () => {
    const { t, appLanguage } = useLanguage();
    const { currentUser } = useAuth();
    const { redirectToPortal } = useStripeCheckout();
    const { companyProfile, updateProfile } = useInvoice();
    const { showNotification } = useNotification();

    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [subscription, setSubscription] = useState(null);
    const [billingHistory, setBillingHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState(companyProfile || {});
    const [usage, setUsage] = useState({
        invoices: 0,
        users: 0,
        storage: 0
    });

    const isPremium = currentUser?.plan === 'premium' || companyProfile?.plan === 'premium';

    const PLAN_HIERARCHY = {
        'free': 0,
        'standard': 1,
        'premium': 2
    };

    useEffect(() => {
        if (companyProfile) {
            setFormData(companyProfile);
        }
    }, [companyProfile]);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser?.id) return;
            setIsLoading(true);
            try {
                // Fetch Current Subscription
                const { data: sub } = await supabase
                    .from('subscriptions')
                    .select('*')
                    .eq('user_id', currentUser.id)
                    .maybeSingle();

                if (sub) setSubscription(sub);

                // Fetch Billing History
                const { data: history } = await supabase
                    .from('billing_history')
                    .select('*')
                    .eq('user_id', currentUser.id)
                    .order('billing_date', { ascending: false });

                if (history) setBillingHistory(history);

                // Fetch Invoice Count
                const { count: invoiceCount } = await supabase
                    .from('invoices')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', currentUser.id);

                // Fetch User Count
                const { count: userCount } = await supabase
                    .from('staff')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', currentUser.id);

                // Fetch Storage Usage from metrics
                const { data: storageMetrics } = await supabase
                    .from('usage_metrics')
                    .select('value')
                    .eq('user_id', currentUser.id)
                    .eq('metric_name', 'storage_used')
                    .maybeSingle();

                setUsage({
                    invoices: invoiceCount || 0,
                    users: userCount || 0,
                    storage: storageMetrics?.value || 0
                });

            } catch (error) {
                console.error('Error fetching subscription data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString(appLanguage === 'tr' ? 'tr-TR' : appLanguage === 'de' ? 'de-DE' : 'en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    const getLimit = (type) => {
        if (isPremium) return 'unlimited';
        if (type === 'invoices') return 50;
        if (type === 'users') return 3;
        if (type === 'storage') return 1024; // 1GB in MB
        return 0;
    };

    const calculatePercent = (current, limit) => {
        if (limit === 'unlimited') return 0;
        return Math.min(100, (current / limit) * 100);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePlanSelect = (targetPlan) => {
        const currentPlanLevel = PLAN_HIERARCHY[currentUser?.plan || 'free'];
        const targetPlanLevel = PLAN_HIERARCHY[targetPlan];

        if (targetPlanLevel > currentPlanLevel) {
            setShowUpgradeModal(true);
            return;
        }

        setFormData(prev => ({ ...prev, plan: targetPlan }));
    };

    const handleSavePayments = async () => {
        try {
            await updateProfile(formData);
            showNotification({
                type: 'success',
                title: t('saved') || 'Gespeichert!',
                message: t('saveSuccessful') || 'Ödeme ayarları başarıyla güncellendi.'
            });
        } catch (err) {
            showNotification({
                type: 'error',
                title: 'Hata',
                message: err.message
            });
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
                    {t('subscription_title')}
                </h1>
                <p style={{ color: '#64748b' }}>
                    {t('subscription_desc')}
                </p>
            </div>

            {/* Current Plan Card */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                <div style={{
                    background: isPremium ? 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)' : 'linear-gradient(135deg, #64748b 0%, #1e293b 100%)',
                    borderRadius: '20px',
                    padding: '32px',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}>
                                {isPremium ? <Rocket size={24} color="white" /> : <Zap size={24} color="white" />}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{t('current_plan')}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{isPremium ? t('premium') : (subscription?.plan_type === 'standard' ? t('standard') : t('free'))}</div>
                                    {subscription?.status === 'trialing' && (
                                        <span style={{
                                            background: '#fbbf24',
                                            color: '#78350f',
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase'
                                        }}>
                                            {t('trial_badge') || 'Deneme'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                                <span style={{ fontSize: '2.5rem', fontWeight: '800' }}>{isPremium ? '€79' : '€19'}</span>
                                <span style={{ paddingBottom: '8px', opacity: 0.8 }}>/ {t('month_abbr')}</span>
                            </div>
                            <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '8px' }}>
                                {isPremium ? (
                                    (t('renewal_date') || 'Renewal Date') + ': ' +
                                    (subscription?.current_period_end ? formatDate(subscription.current_period_end) : (t('calculating') || 'Calculating...'))
                                ) : t('plan_limit_note')}
                            </div>
                        </div>

                        {subscription?.stripe_customer_id ? (
                            <button
                                onClick={() => redirectToPortal()}
                                style={{
                                    background: 'white',
                                    color: isPremium ? '#4f46e5' : '#1e293b',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '10px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    transition: 'transform 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <CreditCard size={18} />
                                {t('manage_subscription') || 'Aboneliği Yönet'}
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowUpgradeModal(true)}
                                style={{
                                    background: '#fbbf24',
                                    color: '#92400e',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '10px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Zap size={16} fill="currentColor" />
                                {t('upgrade_to_premium') || 'Hemen Yükselt'}
                            </button>
                        )}
                    </div>
                    <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                </div>
            </div>

            {/* Online Payments Section (Moved from Settings) */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '10px', color: '#3b82f6' }}>
                            <CreditCard size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>{t('onlinePayments')}</h3>
                    </div>
                    <button className="primary-btn" onClick={handleSavePayments} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Save size={18} />
                        {t('save')}
                    </button>
                </div>

                <div className="plan-selection-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '20px',
                    marginBottom: '32px'
                }}>
                    <div
                        onClick={() => handlePlanSelect('standard')}
                        style={{
                            padding: '24px',
                            borderRadius: '16px',
                            border: '2px solid',
                            borderColor: formData.plan === 'standard' ? '#3b82f6' : '#f1f5f9',
                            background: formData.plan === 'standard' ? '#eff6ff' : 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div style={{ width: '44px', height: '44px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                                <Shield size={22} />
                            </div>
                            {formData.plan === 'standard' && (
                                <div style={{ background: '#3b82f6', color: 'white', borderRadius: '50%', padding: '4px' }}>
                                    <Check size={16} strokeWidth={3} />
                                </div>
                            )}
                        </div>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>{t('standard')}</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5' }}>{t('standard_plan_desc')}</p>
                    </div>

                    <div
                        onClick={() => handlePlanSelect('premium')}
                        style={{
                            padding: '24px',
                            borderRadius: '16px',
                            border: '2px solid',
                            borderColor: formData.plan === 'premium' ? '#8b5cf6' : '#f1f5f9',
                            background: formData.plan === 'premium' ? '#f5f3ff' : 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: formData.plan === 'premium' ? '0 10px 15px -3px rgba(139, 92, 246, 0.1)' : 'none'
                        }}
                    >
                        {PLAN_HIERARCHY[currentUser?.plan || 'free'] < 2 && (
                            <div style={{ position: 'absolute', top: '16px', right: '16px', color: '#94a3b8' }}>
                                <LockIcon size={18} />
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div style={{ width: '44px', height: '44px', background: '#8b5cf6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 10px rgba(139, 92, 246, 0.3)' }}>
                                <Zap size={22} fill="currentColor" />
                            </div>
                            {formData.plan === 'premium' && (
                                <div style={{ background: '#8b5cf6', color: 'white', borderRadius: '50%', padding: '4px' }}>
                                    <Check size={16} strokeWidth={3} />
                                </div>
                            )}
                        </div>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>{t('premium')}</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5' }}>{t('premium_plan_desc')}</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>{t('currency')}</label>
                        <select className="form-input" name="defaultCurrency" value={formData.defaultCurrency || 'EUR'} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white' }}>
                            <option value="EUR">Euro (€)</option>
                            <option value="USD">US Dollar ($)</option>
                            <option value="TRY">Türk Lirası (₺)</option>
                            <option value="GBP">British Pound (£)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>{t('taxRate')} (MwSt %)</label>
                        <input type="number" className="form-input" name="defaultTaxRate" value={formData.defaultTaxRate || 19} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>PayPal.me Link</label>
                        <input className="form-input" name="paypalMe" value={formData.paypalMe || ''} onChange={handleChange} placeholder="https://paypal.me/profiliniz" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Stripe Checkout Link</label>
                        <input className="form-input" name="stripeLink" value={formData.stripeLink || ''} onChange={handleChange} placeholder="https://buy.stripe.com/..." style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                    </div>
                </div>

                <div style={{ padding: '24px', borderRadius: '16px', background: formData.plan === 'premium' ? '#f8fafc' : '#fafafa', border: '1px solid #e2e8f0', opacity: formData.plan === 'premium' ? 1 : 0.7 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <GlobeIcon size={20} color="#7c3aed" />
                            {t('premiumApiSection')}
                        </h4>
                        {formData.plan !== 'premium' && <span style={{ fontSize: '0.7rem', background: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '20px', fontWeight: '700' }}>{t('premiumOnly')}</span>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                        <div style={{ padding: '20px', background: 'white', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#635bff15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Key size={16} color="#635bff" />
                                </div>
                                <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#334155' }}>Stripe Payments</span>
                            </div>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>Secret Key</label>
                                <input className="form-input" name="stripeApiKey" type="password" disabled={formData.plan !== 'premium'} value={formData.stripeApiKey || ''} onChange={handleChange} placeholder="sk_live_..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '4px' }} />
                            </div>
                            <div className="form-group">
                                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>Webhook Secret</label>
                                <input className="form-input" name="stripeWebhookSecret" type="password" disabled={formData.plan !== 'premium'} value={formData.stripeWebhookSecret || ''} onChange={handleChange} placeholder="whsec_..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '4px' }} />
                            </div>
                        </div>

                        <div style={{ padding: '20px', background: 'white', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#00308715', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <GlobeIcon size={16} color="#003087" />
                                </div>
                                <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#334155' }}>PayPal Business</span>
                            </div>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>Client ID</label>
                                <input className="form-input" name="paypalClientId" disabled={formData.plan !== 'premium'} value={formData.paypalClientId || ''} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '4px' }} />
                            </div>
                            <div className="form-group">
                                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>Client Secret</label>
                                <input className="form-input" name="paypalSecret" type="password" disabled={formData.plan !== 'premium'} value={formData.paypalSecret || ''} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '4px' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Usage Limits */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', marginBottom: '40px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '24px', color: '#1e293b' }}>{t('usage_limits')}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                            <span style={{ color: '#64748b' }}>{t('usage_invoices')}</span>
                            <span style={{ fontWeight: '600', color: '#1e293b' }}>{usage.invoices} {isPremium ? t('of_unlimited') : `/ ${getLimit('invoices')}`}</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${isPremium ? 0 : calculatePercent(usage.invoices, getLimit('invoices'))}%`, height: '100%', background: '#10b981', borderRadius: '4px' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Billing History */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0, color: '#1e293b' }}>{t('billing_history')}</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>{t('date')}</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>{t('total')}</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>{t('status')}</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>{t('invoice_label')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center' }}><Loader2 size={18} className="animate-spin" /></td></tr>
                            ) : billingHistory.length === 0 ? (
                                <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center' }}>{t('no_orders')}</td></tr>
                            ) : (
                                billingHistory.map((inv) => (
                                    <tr key={inv.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '16px 24px' }}>{formatDate(inv.billing_date)}</td>
                                        <td style={{ padding: '16px 24px' }}>{inv.amount} {inv.currency}</td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', background: inv.status === 'paid' ? '#dcfce7' : '#fee2e2', color: inv.status === 'paid' ? '#166534' : '#991b1b' }}>{t('paid')}</span>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            {inv.invoice_url && <button onClick={() => window.open(inv.invoice_url, '_blank')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Download size={14} /></button>}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {showUpgradeModal && <PremiumUpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />}
            </AnimatePresence>
        </div>
    );
};

export default SubscriptionManagement;
