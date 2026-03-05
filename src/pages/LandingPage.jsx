import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowRight, Check, FileText, TrendingUp, Globe, Shield, Smartphone,
    Palette, CreditCard, Zap, Calendar, ShoppingCart, Bot, Layout, Star,
    HelpCircle, MessageSquare, BarChart2, Layers, Cpu, Server, Lock,
    Github, Twitter, Linkedin
} from 'lucide-react';
import { useLanguage, detectUserLanguage } from '../context/LanguageContext';
import { useStripeCheckout } from '../hooks/useStripeCheckout';
import { supabase } from '../lib/supabase';

const IconMap = {
    ArrowRight, Check, FileText, TrendingUp, Globe, Shield, Smartphone,
    Palette, CreditCard, Zap, Calendar, ShoppingCart, Bot, Layout, Star,
    HelpCircle, MessageSquare, BarChart2
};

const PriceDisplay = ({ amount, period, t, cycle }) => {
    const formatted = amount.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const [main, decimal] = formatted.split(',');

    return (
        <div className="price-amount" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
            <span style={{ fontSize: '3rem', fontWeight: '800', lineHeight: 1 }}>{main}</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: '4px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: '800', lineHeight: 1 }}>,{decimal}€</span>
                <span className="price-period" style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>{period}</span>
            </div>
        </div>
    );
};

const LandingPage = () => {
    const { t, appLanguage, setAppLanguage } = useLanguage();
    const { redirectToCheckout } = useStripeCheckout();
    const [billingCycle, setBillingCycle] = React.useState('monthly');
    const [activeVideo, setActiveVideo] = React.useState(null);
    const [pricingPlans, setPricingPlans] = React.useState([]);
    const [dynamicVideos, setDynamicVideos] = React.useState([]);
    const [dynamicSections, setDynamicSections] = React.useState([]);
    const [globalConfig, setGlobalConfig] = React.useState({
        primaryColor: '#3b82f6',
        secondaryColor: '#64748b',
        fontHeading: '"Outfit", sans-serif',
        fontBody: '"Inter", sans-serif',
        radius: '12px'
    });
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

                if (!pRes.error && pRes.data?.length >= 2) {
                    // Ensure VIP is present if not in DB
                    let plans = [...pRes.data];
                    if (!plans.find(p => p.plan_id === 'vip')) {
                        plans.push({
                            id: 'temp-vip',
                            plan_id: 'vip',
                            name_key: 'vip',
                            price_monthly: 149,
                            price_yearly: 1490,
                            is_featured: false,
                            features: ["everythingInPremium", "apiIntegrations", "googleAnalytics", "customDomain"]
                        });
                    }
                    // Update prices for existing ones to match new request
                    plans = plans.map(p => {
                        if (p.plan_id === 'standard') return { ...p, price_monthly: 19.9, price_yearly: 199, display_order: 1 };
                        if (p.plan_id === 'premium') return { ...p, price_monthly: 79.9, price_yearly: 799, is_featured: true, display_order: 2 };
                        if (p.plan_id === 'vip') return { ...p, display_order: 3 };
                        return p;
                    }).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
                    setPricingPlans(plans);
                } else {
                    setPricingPlans([
                        { id: 'f-std', plan_id: 'standard', name_key: 'standard', price_monthly: 19.9, price_yearly: 199, is_featured: false, display_order: 1, features: ["unlimitedInvoices", "customerManagement", "basicStock", "multiLanguageInvoices", "emailSupport", "mobileAccess", "pdfExport", "dashboardOverview"] },
                        { id: 'f-prm', plan_id: 'premium', name_key: 'premium', price_monthly: 79.9, price_yearly: 799, is_featured: true, display_order: 2, features: ["everythingInStandard", "advancedReports", "fullStockPOS", "employeeManagement", "appointmentSystem", "websiteBuilder", "prioritySupport", "aiAssistant"] },
                        { id: 'f-vip', plan_id: 'vip', name_key: 'vip', price_monthly: 149, price_yearly: 1490, is_featured: false, display_order: 3, features: ["everythingInPremium", "apiIntegrations", "googleAnalytics", "customDomain"] }
                    ]);
                }
                if (!vRes.error) setDynamicVideos(vRes.data);
                if (!sRes.error) {
                    setDynamicSections(sRes.data);
                    const config = sRes.data.find(s => s.slug === 'global-config');
                    if (config?.content) setGlobalConfig(config.content);
                }
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
    const faqSections = dynamicSections.filter(s => s.type === 'faq' && s.is_active);
    const testimonialSections = dynamicSections.filter(s => s.type === 'testimonial' && s.is_active);
    const statsSections = dynamicSections.filter(s => s.type === 'stats' && s.is_active);

    const heroImage = heroMain?.content?.image_url
        ? (heroMain.content.image_url.startsWith('http') ? heroMain.content.image_url : `${basePath}${heroMain.content.image_url.replace(/^\//, '')}`)
        : `${basePath}hero_unified.png`;

    const plansUI = pricingPlans.map(p => ({
        name: t(p.name_key),
        numericPrice: billingCycle === 'monthly' ? p.price_monthly : p.price_yearly,
        savings: billingCycle === 'yearly' ? t('save17') || 'Save 17%' : null,
        badge: p.is_featured ? t('mostPopular') || 'Most Popular' : (p.plan_id === 'vip' ? 'ENTERPRISE' : null),
        features: (p.features || []).map(f => t(f) || f),
        cta: t('getStarted'),
        plan: p.plan_id
    }));

    return (
        <div className="landing-page" style={{
            '--lp-primary': globalConfig.primaryColor,
            '--lp-secondary': globalConfig.secondaryColor,
            '--lp-radius': globalConfig.radius,
            '--lp-font-h': globalConfig.fontHeading,
            '--lp-font-b': globalConfig.fontBody,
            fontFamily: 'var(--lp-font-b)'
        }}>
            <style>{`
                .hero-modern h1, .section-title-wrapper h2, .footer-modern h3, .bento-content h3, .price-header h3 { font-family: var(--lp-font-h); }
                .btn-modern-primary, .btn-price-modern.primary { background: var(--lp-primary); border-radius: var(--lp-radius); }
                .price-card-modern, .bento-card, .video-card { border-radius: var(--lp-radius); }
                .highlight { color: var(--lp-primary); }
                .check-icon-modern { color: var(--lp-primary); }
            `}</style>
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
                            <span className="highlight">{heroAlert.content.badge || t('landing_new')}</span> {heroAlert.content.text}
                        </motion.div>
                    )}

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="hero-title-modern"
                        style={{ maxWidth: 900, margin: '0 auto 24px' }}
                    >
                        {t('heroTitle')}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="hero-desc-modern"
                        style={{ fontSize: '1.4rem' }}
                    >
                        {t('heroSubtitle')}
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
                        style={{ position: 'relative' }}
                    >
                        <img src={heroImage} alt="BayZenit Unified Platform" style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
                        <div className="hero-glow-overlay" style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'radial-gradient(circle at center, rgba(56, 189, 248, 0.1) 0%, transparent 70%)',
                            pointerEvents: 'none'
                        }}></div>

                        {/* 4-in-1 Floating Badge */}
                        <div style={{
                            position: 'absolute',
                            top: '15%',
                            right: '5%',
                            background: 'rgba(15, 23, 42, 0.8)',
                            backdropFilter: 'blur(12px)',
                            padding: '16px 28px',
                            borderRadius: '24px',
                            border: '1px solid rgba(255,255,255,0.15)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                            textAlign: 'center',
                            zIndex: 20
                        }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, background: 'linear-gradient(135deg, #38bdf8 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>4 IN 1</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginTop: 4, letterSpacing: '1px' }}>BUSINESS ECOSYSTEM</div>
                        </div>
                    </motion.div>
                </section>

                {/* Integration Bar */}
                <div className="integration-bar" style={{
                    padding: '40px 0',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    textAlign: 'center',
                    opacity: 0.6,
                    background: 'rgba(255,255,255,0.02)'
                }}>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 24, letterSpacing: '2px', fontWeight: 700 }}>ENGINEERED FOR MODERN ENTERPRISES</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(20px, 5vw, 60px)', flexWrap: 'wrap', filter: 'grayscale(100%)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}><Layers size={20} /> ARCHITECTURE</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}><Cpu size={20} /> AUTOMATION</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}><Server size={20} /> INFRASTRUCTURE</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}><Lock size={20} /> ENTERPRISE SECURITY</div>
                    </div>
                </div>

                {/* Video Highlights Section */}
                <section className="video-highlights" id="action">
                    <div className="section-title-wrapper">
                        <h2>{t('seeInAction') || 'See it in Action'}</h2>
                        <p>{t('seeInActionDesc') || 'Watch how BayZenit transforms your workflow.'}</p>
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
                                            <div className="video-duration">{video.description || t('workflowDemo')}</div>
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
                        <h2>{t('powerFeatures') || 'Power Features'}</h2>
                        <p>{t('featuresSubtitle') || 'Everything you need to run your business'}</p>
                    </div>

                    <div className="bento-grid">
                        {powerFeatures.length > 0 ? (
                            powerFeatures.map((feat, idx) => {
                                const Icon = IconMap[feat.content.icon] || Zap;
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
                                <motion.div className="bento-card span-8 card-gradient-1" whileHover={{ scale: 1.02 }}>
                                    <div className="bento-content">
                                        <div style={{ color: '#38bdf8', marginBottom: 12, fontWeight: 700, fontSize: '0.8rem', letterSpacing: '1px' }}>MODULE 01</div>
                                        <h3>{t('unlimitedInvoices')}</h3>
                                        <p>{t('easyInvoiceCreationDesc')}</p>
                                        <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                                            <span style={{ padding: '4px 12px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: 100, fontSize: '0.7rem', color: '#38bdf8', fontWeight: 600 }}>Multi-Currency</span>
                                            <span style={{ padding: '4px 12px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: 100, fontSize: '0.7rem', color: '#38bdf8', fontWeight: 600 }}>Tax Automation</span>
                                        </div>
                                    </div>
                                    <FileText size={120} className="bento-icon-bg" style={{ color: '#38bdf8', opacity: 0.1 }} />
                                </motion.div>

                                <motion.div className="bento-card span-4" whileHover={{ scale: 1.02 }}>
                                    <div className="bento-content">
                                        <div style={{ color: '#10b981', marginBottom: 12, fontWeight: 700, fontSize: '0.8rem', letterSpacing: '1px' }}>MODULE 02</div>
                                        <h3>{t('stockDashboard')}</h3>
                                        <p>{t('stockTrackingDesc')}</p>
                                    </div>
                                    <ShoppingCart size={100} className="bento-icon-bg" style={{ color: '#10b981', opacity: 0.1 }} />
                                </motion.div>

                                <motion.div className="bento-card span-4 row-span-2 card-gradient-2" whileHover={{ scale: 1.02 }}>
                                    <div className="bento-content">
                                        <div style={{ color: '#a855f7', marginBottom: 12, fontWeight: 700, fontSize: '0.8rem', letterSpacing: '1px' }}>ORCHESTRATOR</div>
                                        <h3>BayPilot AI</h3>
                                        <p>{t('bayPilotDesc')}</p>
                                        <div style={{ marginTop: 24, background: 'rgba(0,0,0,0.3)', padding: 16, borderRadius: 16, border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                                            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                                                <Bot size={18} color="#a855f7" />
                                                <span style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600 }}>{t('howCanIHelp')}</span>
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>"Generate Q3 revenue report..."</div>
                                        </div>
                                    </div>
                                    <Bot size={120} className="bento-icon-bg" style={{ color: '#a855f7', opacity: 0.1 }} />
                                </motion.div>

                                <motion.div className="bento-card span-8 card-gradient-3" whileHover={{ scale: 1.02 }}>
                                    <div className="bento-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
                                        <div>
                                            <div style={{ color: '#f59e0b', marginBottom: 12, fontWeight: 700, fontSize: '0.8rem', letterSpacing: '1px' }}>MODULE 03</div>
                                            <h3>{t('appointmentSystem')}</h3>
                                            <p>{t('appointmentSystemDesc')}</p>
                                        </div>
                                        <div>
                                            <div style={{ color: '#ec4899', marginBottom: 12, fontWeight: 700, fontSize: '0.8rem', letterSpacing: '1px' }}>MODULE 04</div>
                                            <h3>{t('websiteBuilder')}</h3>
                                            <p>{t('websiteBuilderDesc')}</p>
                                        </div>
                                    </div>
                                    <div style={{ position: 'absolute', bottom: -20, right: 20, display: 'flex', gap: 20 }}>
                                        <Calendar size={100} style={{ color: '#f59e0b', opacity: 0.1 }} />
                                        <Globe size={100} style={{ color: '#ec4899', opacity: 0.1 }} />
                                    </div>
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
                                className={`price-card-modern ${plan.badge ? 'featured' : ''} ${plan.plan === 'vip' ? 'vip' : ''}`}
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
                                    <PriceDisplay
                                        amount={plan.numericPrice}
                                        period={billingCycle === 'monthly' ? t('perMonth') : t('perYear')}
                                        t={t}
                                        cycle={billingCycle}
                                    />
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

                {/* Stats Section */}
                {statsSections.length > 0 && (
                    <section style={{ padding: '60px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '30px', textAlign: 'center' }}>
                            {statsSections.map(s => (
                                <motion.div key={s.id} initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }}>
                                    <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--lp-primary)', marginBottom: 8 }}>{s.content.value}</div>
                                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '2px' }}>{s.content.title?.toUpperCase()}</div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Testimonials */}
                {testimonialSections.length > 0 && (
                    <section style={{ padding: '100px 0' }}>
                        <div className="section-title-wrapper">
                            <h2>What Visionaries Say</h2>
                        </div>
                        <div className="pricing-grid-modern">
                            {testimonialSections.map((s, i) => (
                                <motion.div key={s.id} className="price-card-modern" style={{ padding: '40px' }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                    <div style={{ display: 'flex', gap: '4', marginBottom: 20 }}>{[...Array(5)].map((_, j) => <Star key={j} size={14} fill="var(--lp-primary)" stroke="none" />)}</div>
                                    <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#e2e8f0', marginBottom: 24, fontStyle: 'italic' }}>"{s.content.text}"</p>
                                    <div style={{ fontWeight: 800, color: 'var(--lp-primary)' }}>{s.content.title}</div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Common Questions (FAQ) */}
                {faqSections.length > 0 && (
                    <section style={{ padding: '100px 0', maxWidth: 800, margin: '0 auto' }}>
                        <div className="section-title-wrapper">
                            <h2>{t('questions') || 'Common Questions'}</h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {faqSections.map(s => (
                                <div key={s.id} style={{ padding: '24px 32px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--lp-radius)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12 }}>{s.content.title}</h4>
                                    <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>{s.content.text}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Footer Modern */}
                <footer className="footer-modern">
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 40 }}>
                        <div style={{ maxWidth: 300 }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: 16 }}>BayZenit</h3>
                            <p style={{ color: '#94a3b8' }}>{t('footerTagline')}</p>
                            <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
                                <Twitter size={20} style={{ color: '#94a3b8', cursor: 'pointer' }} />
                                <Github size={20} style={{ color: '#94a3b8', cursor: 'pointer' }} />
                                <Linkedin size={20} style={{ color: '#94a3b8', cursor: 'pointer' }} />
                            </div>
                            <p style={{ color: '#64748b', marginTop: 24 }}>© 2026 BayZenit. {t('allRightsReserved')}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 60, flexWrap: 'wrap' }}>
                            <div>
                                <h4 style={{ color: '#fff', marginBottom: 20 }}>{t('product') || 'Product'}</h4>
                                <ul style={{ listStyle: 'none', padding: 0, color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <li><a href="#features" style={{ color: 'inherit', textDecoration: 'none' }}>{t('features') || 'Features'}</a></li>
                                    <li><a href="#pricing" style={{ color: 'inherit', textDecoration: 'none' }}>{t('pricing') || 'Pricing'}</a></li>
                                    <li><Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>{t('signIn') || 'Login'}</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 style={{ color: '#fff', marginBottom: 20 }}>{t('company') || 'Company'}</h4>
                                <ul style={{ listStyle: 'none', padding: 0, color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>{t('about') || 'About'}</a></li>
                                    <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>{t('contact') || 'Contact'}</a></li>
                                    <li><Link to="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>{t('privacy') || 'Privacy'}</Link></li>
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
                            &times; {t('close') || 'Close'}
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
