import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Zap, Check, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStripeCheckout } from '../../hooks/useStripeCheckout';

const PremiumUpgradeModal = ({ isOpen, onClose }) => {
    const { t } = useLanguage();
    const [billingCycle, setBillingCycle] = useState('yearly'); // monthly, yearly
    const { redirectToCheckout } = useStripeCheckout();

    if (!isOpen) return null;

    const handleUpgrade = () => {
        const priceId = billingCycle === 'yearly'
            ? import.meta.env.VITE_PRICE_PREMIUM_YEARLY
            : import.meta.env.VITE_PRICE_PREMIUM_MONTHLY;

        redirectToCheckout(priceId, true); // Enable 14-Day Trial
    };

    return (
        <div style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(2, 6, 23, 0.98)', // Basically opaque midnight
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)', // Safari support
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '999999',
            padding: '20px'
        }} onClick={onClose}>
            <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                    background: '#ffffff',
                    maxWidth: '460px',
                    width: '100%',
                    borderRadius: '24px', // Slightly sharper for professional look
                    padding: '40px',
                    position: 'relative',
                    boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', color: '#64748b' }}
                >
                    <X size={20} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ width: '64px', height: '64px', background: 'var(--primary)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', margin: '0 auto 24px auto', boxShadow: '0 10px 20px -5px var(--primary)' }}>
                        <Zap size={32} fill="currentColor" />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>{t('unlock_premium') || 'Unlock Premium Power'}</h2>
                    <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.5' }}>{t('upgrade_desc') || 'Connect all modules, automate your repetitive tasks, and get advanced financial reports.'}</p>
                </div>

                {/* Toggle */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            style={{
                                padding: '10px 24px',
                                borderRadius: '10px',
                                border: 'none',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                background: billingCycle === 'monthly' ? 'white' : 'transparent',
                                color: billingCycle === 'monthly' ? '#1e293b' : '#64748b',
                                boxShadow: billingCycle === 'monthly' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            {t('monthly') || 'Monthly'}
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            style={{
                                padding: '10px 24px',
                                borderRadius: '10px',
                                border: 'none',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                background: billingCycle === 'yearly' ? 'white' : 'transparent',
                                color: billingCycle === 'yearly' ? '#1e293b' : '#64748b',
                                boxShadow: billingCycle === 'yearly' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            {t('yearly') || 'Yearly'}
                            <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '6px' }}>-20%</span>
                        </button>
                    </div>
                </div>

                {/* Pricing */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '3rem', fontWeight: '800', color: '#1e293b', lineHeight: '1' }}>
                        {billingCycle === 'yearly' ? '€799' : '€79'}
                        <span style={{ fontSize: '1.25rem', color: '#94a3b8', fontWeight: '500' }}>/{billingCycle === 'yearly' ? t('year') || 'yr' : t('month') || 'mo'}</span>
                    </div>
                </div>

                {/* Features List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                    {[
                        t('feat_all_modules') || 'Connect All Modules Together',
                        t('feat_unlimited') || 'Unlimited Invoices & Quotes',
                        t('feat_reports') || 'Advanced Financial Progress Reports',
                        t('feat_staff') || 'Staff Roles & Team Management',
                        t('feat_mfa') || 'MFA & 2FA Security Options'
                    ].map((feat, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ background: '#dcfce7', color: '#16a34a', borderRadius: '50%', padding: '4px' }}><Check size={14} strokeWidth={3} /></div>
                            <span style={{ fontSize: '0.925rem', color: '#334155', fontWeight: '500' }}>{feat}</span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleUpgrade}
                    style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '16px',
                        background: 'var(--primary)',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '700',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        boxShadow: '0 10px 15px -3px var(--primary-light)'
                    }}
                >
                    <ShieldCheck size={20} />
                    {t('start_premium_now') || 'Get Premium Access'}
                </button>
            </motion.div>
        </div>
    );
};

export default PremiumUpgradeModal;
