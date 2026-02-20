import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowRight, Check, FileText, TrendingUp, Globe, Shield, Smartphone,
    Palette, CreditCard, Zap, Calendar, ShoppingCart, Bot, Layout, Star
} from 'lucide-react';
import { useLanguage, detectUserLanguage } from '../context/LanguageContext';
import { useStripeCheckout } from '../hooks/useStripeCheckout';
import { supabase } from '../lib/supabase';

const IconMap = {
    FileText, TrendingUp, Globe, Shield, Smartphone,
    Palette, CreditCard, Zap, Calendar, ShoppingCart, Bot, Layout, Star
};

const LandingPage = () => {
    const { t, appLanguage, setAppLanguage } = useLanguage();
    const { redirectToCheckout } = useStripeCheckout();
    const [billingCycle, setBillingCycle] = React.useState('monthly');
    const [activeVideo, setActiveVideo] = React.useState(null);
    const [pricingPlans, setPricingPlans] = React.useState([]);
    const [dynamicVideos, setDynamicVideos] = React.useState([]);
    const [dynamicSections, setDynamicSections] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const basePath = import.meta.env.BASE_URL;
    const navigate = useNavigate();

    // Fetch dynamic content
    React.useEffect(() => {
        const fetchContent = async () => {
            try {
                const [pRes, vRes, sRes] = await Promise.all([
                    supabase.from('landing_pricing').select('*').order('created_at', { ascending: true }),
                    supabase.from('landing_videos').select('*').order('display_order', { ascending: true }),
                    supabase.from('landing_sections').select('*').order('display_order', { ascending: true })
                ]);

                if (!pRes.error) setPricingPlans(pRes.data);
                if (!vRes.error) setDynamicVideos(vRes.data);
                if (!sRes.error) setDynamicSections(sRes.data);
            } catch (err) {
                console.error('LandingPage Content Load Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    // Handle Trial Signup
    const handleTrialSignup = (plan, cycle) => {
        navigate(`/register?plan=${plan}&billing=${cycle}`);
    };

    const handleVideoOpen = (url) => {
        if (url) setActiveVideo(url);
    };

    // Auto-detect language
    React.useEffect(() => {
        const landingLangPreference = localStorage.getItem('landing_language_set');
        if (!landingLangPreference) {
            const detectedLang = detectUserLanguage();
            setAppLanguage(detectedLang);
        }
    }, []);

    React.useEffect(() => {
        localStorage.setItem('landing_language_set', 'true');
    }, [appLanguage]);

    const heroAlert = dynamicSections.find(s => s.slug === 'hero-alert' && s.is_active);
    const heroMain = dynamicSections.find(s => s.slug === 'hero-main' && s.is_active);
    const powerFeatures = dynamicSections.filter(s => s.type === 'card' && s.is_active).sort((a, b) => a.display_order - b.display_order);

    const heroImage = heroMain?.content?.image_url
        ? (heroMain.content.image_url.startsWith('http') ? heroMain.content.image_url : `${basePath}${heroMain.content.image_url.replace(/^\//, '')}`)
        : `${basePath}dashboard_v2.png`;

    // Mapping DB model to UI model
    const plansUI = pricingPlans.map(p => ({
        name: t(p.name_key),
        priceMonthly: `${p.price_monthly}€`,
        priceYearly: `${p.price_yearly}€`,
        savings: billingCycle === 'yearly' ? t('save17') || 'Save 17%' : null,
        badge: p.is_featured ? t('mostPopular') || 'Most Popular' : null,
        features: p.features.map(f => t(f) || f),
        cta: t('getStarted'),
        plan: p.plan_id
    }));

    return (
        <div className="landing-page">
            <div className="landing-bg-glow"></div>

            <div className="landing-container">
                {/* Navbar Placeholder (Logo) */}
                <header style={{ padding: '24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 32, height: 32, background: 'white', borderRadius: 8, color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>B</div>
                        BayZenit
                    </div>
                    <div>
                        <Link to="/login" style={{ color: '#fff', textDecoration: 'none', fontWeight: 500, marginRight: 24 }}>{t('signIn')}</Link>
                        <a href="#pricing" className="btn-modern-primary" style={{ display: 'inline-flex', padding: '10px 24px' }}>{t('getStarted')}</a>
                    </div>
                </header>

                {/* Hero Modern */}
                <section className="hero-modern">
                    {heroAlert && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="hero-batch"
                            onClick={() => heroAlert.content.link && (window.location.hash = heroAlert.content.link)}
                            style={{ cursor: 'pointer' }}
                        >
                            <span className="highlight">{heroAlert.content.badge || 'New'}</span> {heroAlert.content.text}
                        </motion.div>
                    )}

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="hero-title-modern"
                    >
                        {t('heroTitle') || 'Professional Invoices in Seconds'}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="hero-desc-modern"
                    >
                        {t('heroSubtitle') || 'The operating system for your business. Invoices, Stock, Website, and AI in one place.'}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="hero-buttons"
                    >
                        <a href="#pricing" className="btn-modern-primary">
                            {t('getStarted')} <ArrowRight size={18} />
                        </a>
                        <a href="#action" className="btn-modern-secondary">
                            {t('learnMore')}
                        </a>
                    </motion.div>


                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="hero-visual-modern"
                    >
                        <img src={heroImage} alt="Dashboard Preview" />
                    </motion.div>
                </section>

                {/* Video Highlights Section */}
                <section className="video-highlights" id="action">
                    <div className="section-title-wrapper">
                        <h2>See it in Action</h2>
                        <p>Watch how BayZenit transforms your workflow.</p>
                    </div>

                    <div className="video-grid">
                        {(dynamicVideos.length > 0 ? dynamicVideos : []).map((video, idx) => {
                            const Icon = IconMap[video.icon_name] || TrendingUp;
                            return (
                                <motion.div
                                    key={video.id || idx}
                                    className="video-card"
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => handleVideoOpen(video.video_url)}
                                >
                                    <div className="video-placeholder">
                                        <div className="sim-ui">
                                            {idx === 0 && (
                                                <>
                                                    <div className="sim-row" style={{ width: '80%' }}></div>
                                                    <div className="sim-row" style={{ width: '50%' }}></div>
                                                    <div className="sim-row" style={{ width: '70%' }}></div>
                                                </>
                                            )}
                                            {idx === 1 && (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                                    <Bot size={32} color="#a855f7" />
                                                    <div className="sim-row" style={{ width: '40%', height: 4 }}></div>
                                                </div>
                                            )}
                                            {idx === 2 && (
                                                <div style={{ border: 'none', background: 'transparent', display: 'flex', gap: 4, flexWrap: 'wrap', padding: 10 }}>
                                                    <div style={{ width: '48%', height: 40, background: '#334155', borderRadius: 4 }}></div>
                                                    <div style={{ width: '48%', height: 40, background: '#334155', borderRadius: 4 }}></div>
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div className="play-button">
                                                <Icon size={24} fill="white" strokeWidth={0} />
                                            </div>
                                        </div>
                                        <div className="video-overlay">
                                            <div className="video-title">{video.title}</div>
                                            <div className="video-duration">{video.description || 'Workflow Demo'}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>


                {/* Bento Grid Features */}
                <section className="section-modern" id="features">
                    <div className="section-title-wrapper">
                        <h2>Power Features</h2>
                        <p>{t('featuresSubtitle') || 'Everything you need to run your business'}</p>
                    </div>

                    <div className="bento-grid">
                        {powerFeatures.length > 0 ? (
                            powerFeatures.map((feat, idx) => {
                                const Icon = IconMap[feat.content.icon] || Zap;
                                // Map display order/index to specific spans to keep the layout interesting
                                const spanClass = idx === 0 ? 'span-8 card-gradient-1' : (idx === 1 ? 'span-4' : (idx === 2 ? 'span-4 row-span-2 card-gradient-2' : 'span-8'));
                                return (
                                    <motion.div key={feat.id} className={`bento-card ${spanClass}`} whileHover={{ scale: 1.02 }}>
                                        <div className="bento-content">
                                            <h3>{t(feat.content.title) || feat.content.title}</h3>
                                            <p>{t(feat.content.text) || feat.content.text}</p>
                                        </div>
                                        <Icon size={120} className="bento-icon-bg" />
                                    </motion.div>
                                );
                            })
                        ) : (
                            <>
                                {/* Invoice - Large */}
                                <motion.div
                                    className="bento-card span-8 card-gradient-1"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="bento-content">
                                        <h3>{t('unlimitedInvoices')}</h3>
                                        <p>{t('easyInvoiceCreationDesc')}</p>
                                    </div>
                                    <FileText size={120} className="bento-icon-bg" />
                                </motion.div>

                                {/* Stock - Small */}
                                <motion.div className="bento-card span-4" whileHover={{ scale: 1.02 }}>
                                    <div className="bento-content">
                                        <h3>{t('module_stock_name')}</h3>
                                        <p>Track inventory & POS sales in real-time.</p>
                                    </div>
                                    <ShoppingCart size={100} className="bento-icon-bg" />
                                </motion.div>

                                {/* AI - Tall */}
                                <motion.div className="bento-card span-4 row-span-2 card-gradient-2" whileHover={{ scale: 1.02 }}>
                                    <div className="bento-content">
                                        <h3>BayPilot AI</h3>
                                        <p>Your personal AI assistant. "Create an invoice for John", "Check stock". Just ask.</p>
                                        <div style={{ marginTop: 20, background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 12 }}>
                                            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                                <Bot size={16} color="#a855f7" />
                                                <span style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>How can I help?</span>
                                            </div>
                                            <div style={{ background: '#3b82f6', padding: '6px 12px', borderRadius: '12px 12px 0 12px', fontSize: '0.8rem', marginLeft: 'auto', width: 'fit-content' }}>
                                                Create invoice
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Website - Medium */}
                                <motion.div className="bento-card span-8" whileHover={{ scale: 1.02 }}>
                                    <div className="bento-content">
                                        <h3>{t('websiteBuilder')}</h3>
                                        <p>No-code website builder. Get your business online with one click.</p>
                                    </div>
                                    <Globe size={120} className="bento-icon-bg" />
                                </motion.div>

                                {/* Appointments - Medium */}
                                <motion.div className="bento-card span-8 card-gradient-3" whileHover={{ scale: 1.02 }}>
                                    <div className="bento-content">
                                        <h3>{t('appointmentSystem')}</h3>
                                        <p>Accept bookings 24/7. Auto-reminders via WhatsApp & SMS.</p>
                                    </div>
                                    <Calendar size={120} className="bento-icon-bg" />
                                </motion.div>
                            </>
                        )}
                    </div>
                </section>

                {/* Pricing Modern */}
                <section className="pricing-section-modern" id="pricing">
                    <div className="section-title-wrapper">
                        <h2>{t('pricing')}</h2>
                        <p>{t('pricingSubtitle')}</p>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <div className="pricing-tabs">
                            <button
                                className={`pricing-tab ${billingCycle === 'monthly' ? 'active' : ''}`}
                                onClick={() => setBillingCycle('monthly')}
                            >
                                {t('monthly')}
                            </button>
                            <button
                                className={`pricing-tab ${billingCycle === 'yearly' ? 'active' : ''}`}
                                onClick={() => setBillingCycle('yearly')}
                            >
                                {t('yearly')}
                                <span style={{ marginLeft: 8, fontSize: '0.7em', color: '#10b981' }}>-17%</span>
                            </button>
                        </div>
                    </div>

                    <div className="trust-badges-modern">
                        <div className="trust-item"><Check size={14} /> {t('trialBanner') || '14 Days Free Trial'}</div>
                        <div className="trust-item"><Shield size={14} /> {t('moneyBack') || '30-Day Money-Back Guarantee'}</div>
                        <div className="trust-item"><CreditCard size={14} /> {t('noCreditCard') || 'No Credit Card Required'}</div>
                    </div>

                    <div className="pricing-grid-modern" style={{ marginTop: 40 }}>
                        {plansUI.map((plan, i) => (
                            <motion.div
                                className={`price-card-modern ${plan.badge ? 'featured' : ''}`}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={i}
                            >
                                {plan.badge && (
                                    <div style={{
                                        position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                                        background: '#38bdf8', color: '#000', padding: '4px 12px', borderRadius: 100,
                                        fontSize: '0.75rem', fontWeight: 700
                                    }}>
                                        {plan.badge}
                                    </div>
                                )}
                                <div className="price-header">
                                    <h3>{plan.name}</h3>
                                    <div className="price-amount">
                                        {billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly}
                                        <span className="price-period">{billingCycle === 'monthly' ? '/mo' : '/yr'}</span>
                                    </div>
                                </div>
                                <button className={`btn-price-modern ${plan.badge ? 'primary' : ''}`} onClick={() => handleTrialSignup(plan.plan, billingCycle)}>
                                    {t('startFreeTrial') || 'Start 14-Day Free Trial'}
                                </button>
                                <ul className="feature-list-modern">
                                    {plan.features.map((f, index) => (
                                        <li key={index}>
                                            <Check size={16} className="check-icon-modern" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Footer Modern */}
                <footer className="footer-modern">
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 40 }}>
                        <div style={{ maxWidth: 300 }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: 16 }}>BayZenit</h3>
                            <p style={{ color: '#94a3b8' }}>{t('footerTagline')}</p>
                            <p style={{ color: '#64748b', marginTop: 20 }}>© 2026 BayZenit. All rights reserved.</p>
                        </div>
                        <div style={{ display: 'flex', gap: 60, flexWrap: 'wrap' }}>
                            <div>
                                <h4 style={{ color: '#fff', marginBottom: 20 }}>Product</h4>
                                <ul style={{ listStyle: 'none', padding: 0, color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <li><a href="#features" style={{ color: 'inherit', textDecoration: 'none' }}>Features</a></li>
                                    <li><a href="#pricing" style={{ color: 'inherit', textDecoration: 'none' }}>Pricing</a></li>
                                    <li><Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Login</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 style={{ color: '#fff', marginBottom: 20 }}>Company</h4>
                                <ul style={{ listStyle: 'none', padding: 0, color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>About</a></li>
                                    <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</a></li>
                                    <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
            {/* Video Modal Overlay */}
            {activeVideo && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 20
                }} onClick={() => setActiveVideo(null)}>
                    <div style={{ position: 'relative', width: '100%', maxWidth: 900, aspectRatio: '16/9' }} onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setActiveVideo(null)}
                            style={{ position: 'absolute', top: -40, right: 0, background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}
                        >
                            &times; Close
                        </button>
                        <iframe
                            src={activeVideo}
                            style={{ width: '100%', height: '100%', borderRadius: 12, border: 'none' }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPage;
