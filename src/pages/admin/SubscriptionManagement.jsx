import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Check, CreditCard, Shield, Zap, FileText, Download, Rocket, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import PremiumUpgradeModal from '../../components/admin/PremiumUpgradeModal';
import { supabase } from '../../lib/supabase';

const SubscriptionManagement = () => {
    const { t, appLanguage } = useLanguage();
    const { currentUser } = useAuth();
    const isPremium = currentUser?.plan === 'premium';
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [billingHistory, setBillingHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [usage, setUsage] = useState({
        invoices: 0,
        users: 0,
        storage: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser?.id) return;
            setIsLoading(true);
            try {
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
                // Note: In an enterprise setup, users might belong to a company. 
                // For now, we assume this is the count of users the current admin manages.

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
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{isPremium ? t('premium') : t('standard')}</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                                <span style={{ fontSize: '2.5rem', fontWeight: '800' }}>{isPremium ? '€79' : '€19'}</span>
                                <span style={{ paddingBottom: '8px', opacity: 0.8 }}>/ {t('month_abbr')}</span>
                            </div>
                            <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '8px' }}>
                                {isPremium ? (t('renewal_date') + ': 15 Mart 2026') : t('plan_limit_note')}
                            </div>
                        </div>

                        {isPremium ? (
                            <button
                                onClick={() => alert('Stripe Customer Portal will open here to manage your ' + (currentUser?.plan || 'plan'))}
                                style={{
                                    background: 'white',
                                    color: '#4f46e5',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '10px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    transition: 'transform 0.2s'
                                }}
                            >
                                {t('manage_subscription')}
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
                                {t('upgrade_to_premium')}
                            </button>
                        )}
                    </div>

                    {/* Decorative Circle */}
                    <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                </div>

                {/* Usage Stats */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '24px', color: '#1e293b' }}>{t('usage_limits')}</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                                <span style={{ color: '#64748b' }}>{t('usage_invoices')}</span>
                                <span style={{ fontWeight: '600', color: '#1e293b' }}>
                                    {usage.invoices} {isPremium ? (t('of_unlimited') || '/ Sınırsız') : `/ ${getLimit('invoices')}`}
                                </span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${isPremium ? 0 : calculatePercent(usage.invoices, getLimit('invoices'))}%`,
                                    height: '100%',
                                    background: '#10b981',
                                    borderRadius: '4px'
                                }} />
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                                <span style={{ color: '#64748b' }}>{t('usage_users')}</span>
                                <span style={{ fontWeight: '600', color: '#1e293b' }}>
                                    {usage.users} {isPremium ? (t('of_unlimited') || '/ Sınırsız') : `/ ${getLimit('users')}`}
                                </span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${isPremium ? 0 : calculatePercent(usage.users, getLimit('users'))}%`,
                                    height: '100%',
                                    background: '#3b82f6',
                                    borderRadius: '4px'
                                }} />
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                                <span style={{ color: '#64748b' }}>{t('usage_storage')}</span>
                                <span style={{ fontWeight: '600', color: '#1e293b' }}>
                                    {(usage.storage / 1024).toFixed(1)} GB {isPremium ? (t('of_unlimited') || '/ Sınırsız') : `/ ${(getLimit('storage') / 1024).toFixed(0)} GB`}
                                </span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${isPremium ? 0 : calculatePercent(usage.storage, getLimit('storage'))}%`,
                                    height: '100%',
                                    background: '#f59e0b',
                                    borderRadius: '4px'
                                }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Billing History */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0, color: '#1e293b' }}>{t('billing_history')}</h3>
                    <button style={{ color: '#4f46e5', background: 'none', border: 'none', fontWeight: '500', cursor: 'pointer' }}>
                        {t('view_all')}
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>{t('date')}</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>{t('total')}</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>{t('status')}</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>{t('invoice_label') || 'Fatura'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <Loader2 size={18} className="animate-spin" />
                                            {t('loading')}
                                        </div>
                                    </td>
                                </tr>
                            ) : billingHistory.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                        {t('no_orders') || 'Henüz ödeme kaydı bulunmuyor.'}
                                    </td>
                                </tr>
                            ) : (
                                billingHistory.map((inv, i) => (
                                    <tr key={inv.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '16px 24px', color: '#1e293b' }}>{formatDate(inv.billing_date)}</td>
                                        <td style={{ padding: '16px 24px', fontWeight: '500', color: '#1e293b' }}>{inv.amount} {inv.currency}</td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                background: inv.status === 'paid' ? '#dcfce7' : '#fee2e2',
                                                color: inv.status === 'paid' ? '#166534' : '#991b1b'
                                            }}>
                                                {inv.status === 'paid' ? t('paid') : inv.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            {inv.invoice_url && (
                                                <button
                                                    onClick={() => window.open(inv.invoice_url, '_blank')}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        background: 'transparent',
                                                        border: '1px solid #e2e8f0',
                                                        padding: '6px 12px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        color: '#64748b',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    <Download size={14} /> PDF
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ marginTop: '32px', padding: '24px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <Shield color="#64748b" />
                    <div>
                        <h4 style={{ margin: '0 0 8px', color: '#1e293b' }}>{t('security_note_title') || t('security_note')}</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                            {t('secure_payment_description') || 'Tüm ödemeler şifreli olarak gerçekleştirilmektedir.'}
                        </p>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showUpgradeModal && (
                    <PremiumUpgradeModal
                        isOpen={showUpgradeModal}
                        onClose={() => setShowUpgradeModal(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default SubscriptionManagement;
