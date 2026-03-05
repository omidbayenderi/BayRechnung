import React from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight, Check, FileText, TrendingUp, Globe, Shield, Smartphone,
    Palette, CreditCard, Zap, Calendar, ShoppingCart, Bot, Layout, Star,
    HelpCircle, MessageSquare, BarChart2
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const IconMap = {
    ArrowRight, Check, FileText, TrendingUp, Globe, Shield, Smartphone,
    Palette, CreditCard, Zap, Calendar, ShoppingCart, Bot, Layout, Star,
    HelpCircle, MessageSquare, BarChart2
};

const PriceDisplay = ({ amount, period }) => {
    const formatted = amount.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const [main, decimal] = formatted.split(',');

    return (
        <div className="price-amount" style={{ display: 'flex', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '2rem', fontWeight: '800', lineHeight: 1 }}>{main}</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: '2px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', lineHeight: 1 }}>,{decimal}€</span>
                <span className="price-period" style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '2px' }}>{period}</span>
            </div>
        </div>
    );
};

const EditableText = ({ text, onUpdate, className, style, multiline = false }) => {
    const handleBlur = (e) => {
        const newText = e.target.innerText;
        if (newText !== text) {
            onUpdate(newText);
        }
    };

    const handleKeyDown = (e) => {
        if (!multiline && e.key === 'Enter') {
            e.preventDefault();
            e.target.blur();
        }
    };

    return (
        <span
            contentEditable
            suppressContentEditableWarning
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`editable-text ${className || ''}`}
            style={{
                ...style,
                outline: 'none',
                cursor: 'text',
                borderBottom: '1px dashed transparent',
                transition: 'border-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.borderBottomColor = 'rgba(59, 130, 246, 0.5)'}
            onMouseOut={(e) => e.target.style.borderBottomColor = 'transparent'}
        >
            {text}
        </span>
    );
};

const LandingPagePreview = ({ pricingPlans, dynamicVideos, dynamicSections, onSelect, activeSection, onUpdateContent, globalConfig }) => {
    const { t } = useLanguage();
    const [billingCycle, setBillingCycle] = React.useState('monthly');
    const basePath = import.meta.env.BASE_URL;

    const heroAlert = dynamicSections.find(s => s.slug === 'hero-alert' && s.is_active);
    const heroMain = dynamicSections.find(s => s.slug === 'hero-main' && s.is_active);
    const powerFeatures = dynamicSections.filter(s => s.type === 'card' && s.is_active).sort((a, b) => a.display_order - b.display_order);
    const faqSections = dynamicSections.filter(s => s.type === 'faq' && s.is_active);
    const testimonialSections = dynamicSections.filter(s => s.type === 'testimonial' && s.is_active);
    const statsSections = dynamicSections.filter(s => s.type === 'stats' && s.is_active);

    const heroImage = heroMain?.content?.image_url
        ? (heroMain.content.image_url.startsWith('http') ? heroMain.content.image_url : `${basePath}${heroMain.content.image_url.replace(/^\//, '')}`)
        : `${basePath}dashboard_v2.png`;

    const plansUI = (pricingPlans || []).map(p => ({
        name: t(p.name_key),
        numericPrice: billingCycle === 'monthly' ? p.price_monthly : p.price_yearly,
        savings: billingCycle === 'yearly' ? t('save17') || 'Save 17%' : null,
        badge: p.is_featured ? t('mostPopular') || 'Most Popular' : null,
        features: (p.features || []).map(f => t(f) || f),
        cta: t('getStarted'),
        plan: p.plan_id,
        id: p.id
    })).sort((a, b) => {
        const orderMap = { standard: 1, premium: 2, vip: 3 };
        return orderMap[a.plan] - orderMap[b.plan];
    });

    const selectionStyle = (id) => ({
        cursor: onSelect ? 'pointer' : 'default',
        outline: activeSection === id ? '2px solid #3b82f6' : 'none',
        outlineOffset: '4px',
        transition: 'all 0.2s ease'
    });

    const updateSection = (slug, field, value) => {
        if (!onUpdateContent) return;
        const section = dynamicSections.find(s => s.slug === slug);
        if (!section) return;

        const updatedSection = {
            ...section,
            content: {
                ...section.content,
                [field]: value
            }
        };
        onUpdateContent('sections', updatedSection);
    };

    const updatePricing = (id, field, value, index = null) => {
        if (!onUpdateContent) return;
        const plan = pricingPlans.find(p => p.id === id);
        if (!plan) return;

        let updatedPlan;
        if (field === 'features' && index !== null) {
            const newFeatures = [...plan.features];
            newFeatures[index] = value;
            updatedPlan = { ...plan, features: newFeatures };
        } else {
            updatedPlan = { ...plan, [field]: value };
        }
        onUpdateContent('pricing', updatedPlan);
    };

    const updateVideo = (id, field, value) => {
        if (!onUpdateContent) return;
        const video = dynamicVideos.find(v => v.id === id);
        if (!video) return;

        const updatedVideo = { ...video, [field]: value };
        onUpdateContent('videos', updatedVideo);
    };

    return (
        <div className="landing-page preview-mode" style={{
            transform: 'scale(0.8)',
            transformOrigin: 'top center',
            width: '125%', // Compensate for scale
            fontSize: '0.9rem',
            pointerEvents: onSelect ? 'auto' : 'none', // Enable interaction if callback exists
            userSelect: 'none',
            opacity: 0.9,
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            background: '#020617'
        }}>
            <style>{`
                .landing-page.preview-mode::-webkit-scrollbar { display: none; }
                .landing-page.preview-mode { -ms-overflow-style: none; scrollbar-width: none; }
                .interactive-section:hover { background: rgba(59, 130, 246, 0.05); }
                .editable-text:focus { background: rgba(59, 130, 246, 0.1); border-radius: 4px; padding: 0 4px; }
                
                :root {
                    --lp-primary: ${globalConfig?.primaryColor || '#3b82f6'};
                    --lp-secondary: ${globalConfig?.secondaryColor || '#64748b'};
                    --lp-radius: ${globalConfig?.radius || '12px'};
                    --lp-font-h: ${globalConfig?.fontHeading || '"Outfit", sans-serif'};
                    --lp-font-b: ${globalConfig?.fontBody || '"Inter", sans-serif'};
                }

                .landing-page.preview-mode {
                    font-family: var(--lp-font-b);
                }
                .landing-page.preview-mode h1, 
                .landing-page.preview-mode h2, 
                .landing-page.preview-mode h3 {
                    font-family: var(--lp-font-h);
                }
                .btn-lp-primary {
                    background: var(--lp-primary);
                    border-radius: var(--lp-radius);
                }
                .card-lp {
                    border-radius: var(--lp-radius);
                }
            `}</style>

            <div className="landing-bg-glow" style={{ position: 'fixed' }}></div>

            <div className="landing-container" style={{ padding: '0 20px' }}>
                {/* Navbar */}
                <header style={{ padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 24, height: 24, background: 'white', borderRadius: 6, color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>B</div>
                        BayZenit
                    </div>
                </header>

                {/* Hero */}
                <section
                    className="hero-modern interactive-section"
                    onClick={() => onSelect?.('cms-sections')}
                    style={{ padding: '40px 0', ...selectionStyle('cms-sections') }}
                >
                    {heroAlert && (
                        <div className="hero-batch" style={{ fontSize: '0.7rem' }}>
                            <span className="highlight">
                                <EditableText
                                    text={heroAlert.content.badge || 'New'}
                                    onUpdate={(val) => updateSection('hero-alert', 'badge', val)}
                                />
                            </span>
                            <EditableText
                                text={heroAlert.content.text}
                                onUpdate={(val) => updateSection('hero-alert', 'text', val)}
                            />
                        </div>
                    )}

                    <h1 className="hero-title-modern" style={{ fontSize: '2.5rem', marginBottom: '12px' }}>
                        {heroMain ? (
                            <EditableText
                                text={heroMain.content.title}
                                onUpdate={(val) => updateSection('hero-main', 'title', val)}
                            />
                        ) : (t('heroTitle') || 'Professional Invoices in Seconds')}
                    </h1>

                    <p className="hero-desc-modern" style={{ fontSize: '1rem', marginBottom: '24px' }}>
                        {heroMain ? (
                            <EditableText
                                text={heroMain.content.text}
                                onUpdate={(val) => updateSection('hero-main', 'text', val)}
                                multiline
                            />
                        ) : (t('heroSubtitle') || 'The operating system for your business. Invoices, Stock, Website, and AI in one place.')}
                    </p>

                    <div className="hero-visual-modern" style={{ marginTop: '30px' }}>
                        <img src={heroImage} alt="Dashboard Preview" style={{ borderRadius: '12px' }} />
                    </div>
                </section>

                {/* Pricing Preview */}
                <section
                    className="pricing-section-modern interactive-section"
                    onClick={() => onSelect?.('pricing')}
                    style={{ padding: '40px 0', ...selectionStyle('pricing') }}
                >
                    <div className="pricing-grid-modern" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        {plansUI.map((plan, i) => (
                            <div className={`price-card-modern ${plan.badge ? 'featured' : ''}`} key={i} style={{ padding: '20px' }}>
                                <div className="price-header">
                                    <h3 style={{ fontSize: '1rem' }}>
                                        <EditableText
                                            text={plan.name}
                                            onUpdate={(val) => updatePricing(plan.id, 'name_key', val)}
                                        />
                                    </h3>
                                    <PriceDisplay
                                        amount={plan.numericPrice}
                                        period={billingCycle === 'monthly' ? t('perMonth') : t('perYear')}
                                    />
                                </div>
                                <ul className="feature-list-modern" style={{ fontSize: '0.75rem' }}>
                                    {plan.features.map((f, index) => (
                                        <li key={index}>
                                            <Check size={12} style={{ marginRight: '6px' }} />
                                            <EditableText
                                                text={f}
                                                onUpdate={(val) => updatePricing(plan.id, 'features', val, index)}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Video Gallery Preview */}
                {dynamicVideos.length > 0 && (
                    <section
                        className="section-modern interactive-section"
                        onClick={() => onSelect?.('videos')}
                        style={{ padding: '40px 0', ...selectionStyle('videos') }}
                    >
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '24px', textAlign: 'center' }}>Watch & Learn</h2>
                        <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
                            {dynamicVideos.map(video => (
                                <div key={video.id} style={{ minWidth: '250px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--lp-radius)', padding: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ aspectRatio: '16/9', background: '#000', borderRadius: 'calc(var(--lp-radius) / 2)', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Video Player</div>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '4px' }}>
                                        <EditableText
                                            text={video.title}
                                            onUpdate={(val) => updateVideo(video.id, 'title', val)}
                                        />
                                    </h4>
                                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{video.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Stats Preview */}
                {statsSections.length > 0 && (
                    <section className="interactive-section" onClick={() => onSelect?.('cms-sections')} style={{ padding: '40px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '20px', textAlign: 'center' }}>
                        {statsSections.map(s => (
                            <div key={s.id}>
                                <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--lp-primary)' }}>{s.content.value || '10k+'}</div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{s.content.title}</div>
                            </div>
                        ))}
                    </section>
                )}

                {/* Testimonials Preview */}
                {testimonialSections.length > 0 && (
                    <section className="interactive-section" onClick={() => onSelect?.('cms-sections')} style={{ padding: '40px 0' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                            {testimonialSections.map(s => (
                                <div key={s.id} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--lp-radius)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', gap: '2px', marginBottom: '12px' }}>{[...Array(5)].map((_, i) => <Star key={i} size={10} fill="var(--lp-primary)" stroke="none" />)}</div>
                                    <p style={{ fontSize: '0.8rem', fontStyle: 'italic', marginBottom: '12px' }}>"{s.content.text}"</p>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '700' }}>{s.content.title}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* FAQ Preview */}
                {faqSections.length > 0 && (
                    <section className="interactive-section" onClick={() => onSelect?.('cms-sections')} style={{ padding: '40px 0' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '24px', textAlign: 'center' }}>Common Questions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {faqSections.map(s => (
                                <div key={s.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--lp-radius)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{s.content.title}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>{s.content.text}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Features (Bento) Preview */}
                <section
                    className="section-modern interactive-section"
                    onClick={() => onSelect?.('cms-sections')}
                    style={{ padding: '40px 0', ...selectionStyle('cms-sections') }}
                >
                    <div className="bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '10px' }}>
                        {powerFeatures.map((feat, idx) => {
                            const Icon = IconMap[feat.content.icon] || Zap;
                            return (
                                <div key={feat.id} className="bento-card" style={{ gridColumn: 'span 6', padding: '15px', minHeight: '120px' }}>
                                    <h3 style={{ fontSize: '0.9rem' }}>
                                        <EditableText
                                            text={feat.content.title}
                                            onUpdate={(val) => updateSection(feat.slug, 'title', val)}
                                        />
                                    </h3>
                                    <p style={{ fontSize: '0.75rem' }}>
                                        <EditableText
                                            text={feat.content.text}
                                            onUpdate={(val) => updateSection(feat.slug, 'text', val)}
                                            multiline
                                        />
                                    </p>
                                    <Icon size={40} className="bento-icon-bg" style={{ opacity: 0.1 }} />
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
};



export default LandingPagePreview;
