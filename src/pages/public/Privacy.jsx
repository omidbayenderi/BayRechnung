import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const Privacy = () => {
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
                        <div style={{ background: '#10b981', padding: 12, borderRadius: 12, color: 'white' }}>
                            <Lock size={32} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>{t('privacy_title')}</h1>
                            <p style={{ color: '#94a3b8', margin: '4px 0 0 0' }}>{t('last_updated') || 'Last updated'}: {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div style={{ color: '#f8fafc', lineHeight: 1.7 }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 32, marginBottom: 16, color: '#ffffff' }}>1. Introduction</h2>
                        <p style={{ color: '#cbd5e1' }}>{t('privacy_intro') || 'We respect your privacy and are committed to protecting it. This policy explains how we collect and use your data.'}</p>
                    </div>

                    <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.9rem' }}>
                        {t('contact_us_privacy') || 'If you have any questions about this Privacy Policy, please contact us at privacy@bayzenit.com.'}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Privacy;
