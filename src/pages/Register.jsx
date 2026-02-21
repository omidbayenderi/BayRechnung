import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useStripeCheckout } from '../hooks/useStripeCheckout.js'; // fixed import path

import { motion } from 'framer-motion';
import { Mail, Lock, User, Building2, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import BrandLogo from '../components/Branding/BrandLogo';

const Register = () => {
    const { register, isAuthenticated } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // ... inside component
    const urlPlan = searchParams.get('plan');
    const urlBilling = searchParams.get('billing');

    const { redirectToCheckout } = useStripeCheckout();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        companyName: '',
        phone: '',
        street: '',
        city: '',
        zip: '',
        country: 'Germany',
        plan: urlPlan || 'standard',
        agreeTerms: false
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Redirect if already logged in
    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name) newErrors.name = t('required') || 'Required';
        if (!formData.email) newErrors.email = t('required') || 'Required';
        if (!formData.phone) newErrors.phone = t('required') || 'Required';
        if (!formData.street) newErrors.street = t('required') || 'Required';
        if (!formData.city) newErrors.city = t('required') || 'Required';
        if (!formData.zip) newErrors.zip = t('required') || 'Required';

        if (!formData.password) newErrors.password = t('required') || 'Required';
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = t('passwordMismatch') || 'Passwords do not match';
        }
        if (!formData.companyName) newErrors.companyName = t('required') || 'Required';
        if (!formData.agreeTerms) newErrors.agreeTerms = t('mustAcceptTerms') || 'You must accept terms';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setErrors({});

        try {
            const registrationData = {
                ...formData,
                industry: 'general',
                metadata: {
                    phone: formData.phone,
                    address: {
                        street: formData.street,
                        city: formData.city,
                        zip: formData.zip,
                        country: formData.country
                    }
                }
            };
            const result = await register(registrationData);
            if (result.success) {
                // If plan came from URL, redirect to Stripe for Trial
                if (urlPlan && urlBilling) {
                    const priceIds = {
                        standard: {
                            monthly: import.meta.env.VITE_PRICE_STANDARD_MONTHLY,
                            yearly: import.meta.env.VITE_PRICE_STANDARD_YEARLY,
                        },
                        premium: {
                            monthly: import.meta.env.VITE_PRICE_PREMIUM_MONTHLY,
                            yearly: import.meta.env.VITE_PRICE_PREMIUM_YEARLY,
                        },
                    };
                    const priceId = priceIds[urlPlan]?.[urlBilling];

                    if (priceId) {
                        // Pass userId via client_reference_id or metadata if possible in useStripeCheckout
                        // Enable 14-Day Trial
                        redirectToCheckout(priceId, true);
                        return; // Stop execution to allow redirect
                    }
                }
                // Wait for session to be fully established before fetching data
                // In Supabase, if email confirmation is required, session might be null.
                if (result.data?.session) {
                    navigate('/dashboard');
                } else {
                    alert('Please check your email to confirm your registration before logging in.');
                    navigate('/login');
                }
            } else {
                setErrors({ general: result.error });
            }
        } catch (err) {
            setErrors({ general: err.message || 'Registration failed' });
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = () => {
        const { password } = formData;
        if (!password) return null;
        if (password.length < 6) return { label: 'Weak', color: '#ef4444' };
        if (password.length < 10) return { label: 'Medium', color: '#f59e0b' };
        return { label: 'Strong', color: '#10b981' };
    };

    const strength = getPasswordStrength();

    const isYearly = urlBilling === 'yearly';
    const planName = formData.plan === 'premium' ? t('premium') : t('standard');
    const billingText = isYearly ? (t('yearly') || 'Yearly') : (t('monthly') || 'Monthly');

    const selectedPlanName = `${planName} (${billingText})`;

    let selectedPlanPrice = '0.00€';
    if (formData.plan === 'premium') {
        selectedPlanPrice = isYearly ? '799.00€/year' : '79.00€/month';
    } else {
        selectedPlanPrice = isYearly ? '199.00€/year' : '19.00€/month';
    }

    return (
        <div className="auth-container">
            <motion.div
                className="glass-card auth-card register-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ maxWidth: 650 }}
            >
                <div className="auth-header">
                    <BrandLogo size="large" />
                    <p style={{ color: '#94a3b8', marginTop: '1rem', fontWeight: 500 }}>{t('createAccount')}</p>
                </div>

                {errors.general && (
                    <div className="error-message">{errors.general}</div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">

                    <div className="form-row">
                        <div className="form-group">
                            <label><User size={16} />{t('fullName')}</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            {errors.name && <span className="error-text">{errors.name}</span>}
                        </div>
                        <div className="form-group">
                            <label><Building2 size={16} />{t('companyName')}</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Acme Inc."
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            />
                            {errors.companyName && <span className="error-text">{errors.companyName}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group" style={{ flex: 2 }}>
                            <label><Mail size={16} />{t('email')}</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Phone</label>
                            <input
                                type="tel"
                                className="form-input"
                                placeholder="+49..."
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                            {errors.phone && <span className="error-text">{errors.phone}</span>}
                        </div>
                    </div>

                    <div style={{ marginBottom: 16, padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                        <label style={{ color: '#cbd5e1', marginBottom: 12, display: 'block', fontSize: '0.8rem' }}>Business Address</label>
                        <div className="form-group">
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Street & Number"
                                value={formData.street}
                                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                            />
                            {errors.street && <span className="error-text">{errors.street}</span>}
                        </div>
                        <div className="form-row" style={{ marginTop: 12 }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Zip Code"
                                    value={formData.zip}
                                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                                />
                                {errors.zip && <span className="error-text">{errors.zip}</span>}
                            </div>
                            <div className="form-group" style={{ flex: 2 }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="City"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                                {errors.city && <span className="error-text">{errors.city}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label><Lock size={16} />{t('password')}</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            {strength && (
                                <div className="password-strength" style={{ marginTop: '4px' }}>
                                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: formData.password.length < 6 ? '33%' : formData.password.length < 10 ? '66%' : '100%', background: strength.color, transition: 'all 0.3s' }}></div>
                                    </div>
                                    <span style={{ fontSize: '0.7rem', color: strength.color }}>{strength.label}</span>
                                </div>
                            )}
                            {errors.password && <span className="error-text">{errors.password}</span>}
                        </div>
                        <div className="form-group">
                            <label><Lock size={16} />{t('confirmPassword')}</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                        </div>
                    </div>

                    {/* Industry Removed */}

                    {/* Plan Information Display */}
                    <div className="form-group" style={{ background: '#ffffff', padding: 16, borderRadius: 12, border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>{selectedPlanName}</span>
                            <span style={{ color: '#334155', fontWeight: 600 }}>{selectedPlanPrice}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#15803d', fontWeight: 700, fontSize: '0.95rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center' }}><CheckCircle2 size={18} fill="#dcfce7" style={{ marginRight: 6 }} /> 14-Day Free Trial</span>
                            <span>Today: 0.00€</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label" style={{ alignItems: 'flex-start' }}>
                            <input
                                type="checkbox"
                                checked={formData.agreeTerms}
                                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                                style={{ marginTop: 4 }}
                            />
                            <span style={{ fontSize: '0.85rem', lineHeight: 1.5, color: '#94a3b8' }}>
                                I agree to the <a href="/terms" target="_blank" style={{ color: '#fff', fontWeight: 600, textDecoration: 'underline' }}>Terms & Conditions</a> and <a href="/privacy" target="_blank" style={{ color: '#fff', fontWeight: 600, textDecoration: 'underline' }}>Privacy Policy</a>.
                            </span>
                        </label>
                        {errors.agreeTerms && <span className="error-text" style={{ display: 'block', marginTop: 4 }}>{errors.agreeTerms}</span>}
                    </div>

                    <button type="submit" className="cta-button w-full" disabled={loading} style={{ padding: '16px' }}>
                        {loading ? (t('creatingAccount') || 'Creating account...') : <><CheckCircle2 size={20} /> Create My Account</>}
                    </button>
                </form>

                <div className="auth-footer" style={{ marginTop: '2rem' }}>
                    <p style={{ color: '#94a3b8' }}>
                        {t('alreadyHaveAccount')} <Link to="/login" style={{ color: '#fff', fontWeight: 600, textDecoration: 'none' }}>{t('signIn')}</Link>
                    </p>
                    <p style={{ marginTop: 12 }}>
                        <Link to="/" style={{ fontSize: '0.85rem', textDecoration: 'none', color: '#64748b', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#64748b'}>← Back to Home</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
