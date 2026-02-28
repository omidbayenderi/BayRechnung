import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const Terms = () => {
    const { t } = useLanguage();
    return (
        <div className="landing-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div className="landing-bg-glow"></div>

            <div className="landing-container" style={{ flex: 1, padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ maxWidth: '800px', width: '100%', padding: '40px' }}
                >
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#94a3b8', textDecoration: 'none', marginBottom: 32, fontWeight: 500 }}>
                        <ArrowLeft size={18} /> {t('backToHome') || 'Back to Home'}
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                        <div style={{ background: '#3b82f6', padding: 12, borderRadius: 12, color: 'white' }}>
                            <Shield size={32} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>{t('terms_title')}</h1>
                            <p style={{ color: '#94a3b8', margin: '4px 0 0 0' }}>{t('last_updated') || 'Last updated'}: {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div style={{ color: '#f8fafc', lineHeight: 1.7 }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 32, marginBottom: 16, color: '#ffffff' }}>{t('terms_section1_title') || '1. Introduction'}</h2>
                        <p style={{ color: '#cbd5e1' }}>{t('terms_intro') || 'Welcome to BayZenit. By using our services, you agree to these terms. Please read them carefully.'}</p>

                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 32, marginBottom: 16, color: '#ffffff' }}>{t('terms_section2_title') || '2. Trial Period & Billing'}</h2>
                        <ul style={{ paddingLeft: 20, margin: 0, color: '#cbd5e1' }}>
                            <li style={{ marginBottom: 12 }}><strong style={{ color: '#ffffff' }}>{t('terms_trial_heading') || '14-Day Free Trial:'}</strong> {t('terms_trial_desc') || 'We offer a 14-day free trial for all new accounts. You will not be charged until the trial period ends.'}</li>
                        </ul>
                    </div>

                    <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.9rem' }}>
                        {t('contact_us_terms') || 'If you have any questions about these Terms, please contact us at support@bayzenit.com.'}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Terms;
