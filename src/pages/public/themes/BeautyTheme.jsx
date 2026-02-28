import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Phone, Mail, MapPin, Clock, Calendar, ChevronRight,
    ArrowRight, Star, ShoppingCart, Menu, X, Facebook, Instagram, Twitter, Linkedin,
    Heart, Sparkles, User, LogOut, Settings, Globe, CheckCircle, ShoppingBag, Utensils, Stethoscope, Scissors
} from 'lucide-react';
import { generateTheme } from '../utils/ColorEngine';

import { AgentFactory } from '../components/agents/AgentFactory';
import { useLanguage } from '../../../context/LanguageContext';

const BeautyTheme = ({ siteData, themeColors, variant = 'v1', cartActions, userActions, state, languageActions }) => {
    const { profile, config, sections, products } = siteData;
    const { cart, isCartOpen } = state;
    const { addToCart, setIsCartOpen } = cartActions;
    const { currentUser, setIsCustomerPanelOpen, handleLogout } = userActions;
    const t = languageActions?.t || useLanguage().t;
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }, []);

    // --- AGENT-LED DESIGN SYSTEM ---
    const agent = AgentFactory.getAgent(siteData);
    const agentSpecs = agent.getThemeSpecs(variant);

    // MERGE: User's Theme Choice (themeColors) overrides Agent's Base Colors
    // This ensures that the "Smart Contrast Rule" from ColorEngine is applied.
    const DS = {
        ...agentSpecs,
        // Override colors with calculated themeColors (from PublicWebsite -> ColorEngine)
        primary: themeColors.primary,
        primaryDark: themeColors.primaryDark,
        primaryLight: themeColors.primaryLight,
        accent: themeColors.secondary, // Map ColorEngine secondary to accent
        // Use the smart contrast text color for buttons/headers
        buttonText: themeColors.buttonText,
        // Keep Agent's structural choices (radius, fonts, shadow) unless generic
        bg: themeColors.background,
        text: themeColors.text,
        // Override fonts if user selected one
        fontPrimary: themeColors.font || agentSpecs.fontPrimary,
        fontHeader: themeColors.font || agentSpecs.fontHeader
    };

    // Industry Detection
    const industry = (profile?.industry || 'beauty').toLowerCase();
    const isBeauty = industry === 'beauty';
    const isGastronomy = industry === 'gastronomy';
    const isHealthcare = industry === 'healthcare';
    const isRetail = industry === 'retail';

    // Dynamic Font Loading
    useEffect(() => {
        const fonts = [DS.fontPrimary, DS.fontHeader].map(f => {
            const match = f.match(/"([^"]+)"/) || f.match(/'([^']+)'/);
            return match ? match[1].replace(/\s+/g, '+') : f.split(',')[0].trim().replace(/\s+/g, '+');
        }).filter((v, i, a) => a.indexOf(v) === i);
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?${fonts.map(f => `family=${f}:wght@300;400;500;600;700;800;900`).join('&')}&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }, [DS.fontPrimary, DS.fontHeader]);

    const glassStyle = {
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${DS.border}`
    };

    // Icon Selector based on industry and service name
    const getServiceIcon = (name = '') => {
        const lower = name.toLowerCase();
        if (isBeauty) {
            if (lower.includes('kesim') || lower.includes('saç')) return Scissors;
            return Sparkles;
        }
        if (isGastronomy) {
            return Utensils;
        }
        if (isHealthcare) {
            if (lower.includes('kontrol') || lower.includes('muayene')) return Stethoscope;
            return Heart;
        }
        if (isRetail) return ShoppingBag;
        return Sparkles;
    };

    const BrandIcon = isBeauty ? Star : isGastronomy ? Utensils : isHealthcare ? Heart : ShoppingBag;

    return (
        <div style={{
            fontFamily: DS.fontPrimary,
            background: DS.bg,
            color: DS.text,
            minHeight: '100vh'
        }}>

            {/* Top Bar - Elegant Accent */}
            <div style={{ background: DS.accent, color: DS.primary, padding: '8px 0', fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.05em' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        {profile?.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={12} /> {profile.phone}</span>}
                        {profile?.email && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12} /> {profile.email}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        {(config?.socialLinks?.instagram || config?.social?.instagram || profile?.social?.instagram) && (
                            <a href={config?.socialLinks?.instagram || config?.social?.instagram || profile?.social?.instagram} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                                <Instagram size={12} style={{ cursor: 'pointer' }} />
                            </a>
                        )}
                        {(config?.socialLinks?.facebook || config?.social?.facebook || profile?.social?.facebook) && (
                            <a href={config?.socialLinks?.facebook || config?.social?.facebook || profile?.social?.facebook} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                                <Facebook size={12} style={{ cursor: 'pointer' }} />
                            </a>
                        )}
                        {(config?.socialLinks?.twitter || config?.social?.twitter || profile?.social?.twitter) && (
                            <a href={config?.socialLinks?.twitter || config?.social?.twitter || profile?.social?.twitter} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                                <Twitter size={12} style={{ cursor: 'pointer' }} />
                            </a>
                        )}
                        {(config?.socialLinks?.linkedin || config?.social?.linkedin || profile?.social?.linkedin) && (
                            <a href={config?.socialLinks?.linkedin || config?.social?.linkedin || profile?.social?.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                                <Linkedin size={12} style={{ cursor: 'pointer' }} />
                            </a>
                        )}
                        {config?.extraSocialLinks?.map((link, idx) => (
                            <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" title={link.label} style={{ color: 'inherit' }}>
                                <Globe size={12} style={{ cursor: 'pointer' }} />
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .desktop-nav { display: none !important; }
                    .mobile-only { display: block !important; }
                    h2 { font-size: 3rem !important; }
                    .section-padding { padding: 60px 20px !important; }
                    .product-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (min-width: 901px) {
                    .mobile-only { display: none !important; }
                    .desktop-nav { display: flex !important; }
                    .product-grid { grid-template-columns: repeat(3, 1fr) !important; }
                }
            `}</style>

            {/* Navigation */}
            <nav style={{ position: 'sticky', top: 0, zIndex: 1000, ...glassStyle }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', background: DS.primary, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: DS.buttonText }}>
                            <BrandIcon size={20} />
                        </div>
                        <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', fontWeight: '700', color: DS.primary, margin: 0 }}>
                            {profile?.companyName || (isBeauty ? 'Beauty Salon' : isGastronomy ? 'Gastro Cafe' : isHealthcare ? 'Medical Center' : 'Retail Store')}
                        </h1>
                    </div>

                    <div className="desktop-nav" style={{ alignItems: 'center', gap: '32px' }}>
                        <div style={{ display: 'flex', gap: '24px', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '0.1em' }}>
                            <a href="#services" style={{ textDecoration: 'none', color: DS.text }}>{t('theme_nav_services')}</a>
                            <a href="#products" style={{ textDecoration: 'none', color: DS.text }}>{t('theme_nav_products')}</a>
                            <a href="#contact" style={{ textDecoration: 'none', color: DS.text }}>{t('theme_nav_contact')}</a>
                        </div>

                        <div style={{ borderLeft: `1px solid ${DS.border}`, height: '24px', margin: '0 8px' }}></div>

                        <button
                            onClick={() => setIsCartOpen(true)}
                            style={{ position: 'relative', border: 'none', background: 'transparent', cursor: 'pointer', color: DS.text }}
                        >
                            <ShoppingBag size={20} />
                            {cart.length > 0 && (
                                <span style={{ position: 'absolute', top: -5, right: -5, background: DS.primary, color: DS.buttonText, borderRadius: '50%', width: '16px', height: '16px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {cart.length}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => {
                                if (currentUser) {
                                    userActions.setIsCustomerPanelOpen(true);
                                } else {
                                    userActions.setAuthMode('login');
                                    cartActions.setCheckoutStep('auth');
                                    cartActions.setIsCartOpen(true);
                                }
                            }}
                            style={{ background: DS.primary, color: DS.buttonText, border: 'none', padding: '10px 24px', borderRadius: '50px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', boxShadow: `0 4px 15px ${DS.primary}33` }}
                        >
                            {currentUser ? t('theme_nav_account') : t('theme_nav_login')}
                        </button>

                        {/* Language Selector */}
                        {languageActions && (
                            <select
                                value={languageActions.currentLang}
                                onChange={(e) => languageActions.setServiceLanguage('website', e.target.value)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    fontSize: '0.85rem',
                                    fontFamily: DS.fontPrimary,
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    color: DS.text,
                                    marginLeft: '12px',
                                    letterSpacing: '0.05em'
                                }}
                            >
                                {languageActions.LANGUAGES?.map(lang => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.code.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button className="mobile-only" onClick={() => setMobileMenuOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Menu size={28} color={DS.primary} />
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div style={{
                        position: 'fixed', inset: 0, background: DS.bg, zIndex: 2000,
                        display: 'flex', flexDirection: 'column', padding: '24px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: DS.primary, margin: 0 }}>MENU</h2>
                            <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={28} color={DS.text} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '1.25rem', fontWeight: '700', fontFamily: DS.fontHeader || '"Playfair Display", serif' }}>
                            <a href="#services" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none', color: DS.text }}>{t('theme_nav_services')}</a>
                            <a href="#products" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none', color: DS.text }}>{t('theme_nav_products')}</a>
                            <a href="#contact" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none', color: DS.text }}>{t('theme_nav_contact')}</a>
                            <div onClick={() => { setIsCartOpen(true); setMobileMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                {t('cart_title')} ({cart.length})
                            </div>
                            <div style={{ height: '1px', background: DS.border, margin: '10px 0' }}></div>
                            {currentUser ? (
                                <button onClick={() => { userActions.setIsCustomerPanelOpen(true); setMobileMenuOpen(false); }} style={{ textAlign: 'left', background: 'none', border: 'none', fontSize: '1.25rem', fontWeight: '700', color: DS.primary, cursor: 'pointer', padding: 0 }}>
                                    {t('theme_nav_account')}
                                </button>
                            ) : (
                                <button onClick={() => { userActions.setAuthMode('login'); cartActions.setCheckoutStep('auth'); cartActions.setIsCartOpen(true); setMobileMenuOpen(false); }} style={{ textAlign: 'left', background: 'none', border: 'none', fontSize: '1.25rem', fontWeight: '700', color: DS.primary, cursor: 'pointer', padding: 0 }}>
                                    {t('theme_nav_login')}
                                </button>
                            )}
                            {/* Language Selector Mobile */}
                            {languageActions && (
                                <div style={{ marginTop: '20px' }}>
                                    <label style={{ fontSize: '0.9rem', color: DS.textSecondary, marginBottom: '8px', display: 'block' }}>Language</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {languageActions.LANGUAGES?.map(lang => (
                                            <button
                                                key={lang.code}
                                                onClick={() => { languageActions.setServiceLanguage('website', lang.code); setMobileMenuOpen(false); }}
                                                style={{
                                                    padding: '8px 16px', borderRadius: '50px',
                                                    background: languageActions.currentLang === lang.code ? DS.primary : '#fce7f3',
                                                    color: languageActions.currentLang === lang.code ? 'white' : DS.text,
                                                    border: 'none', fontWeight: 'bold'
                                                }}
                                            >
                                                {lang.code.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <header style={{
                position: 'relative',
                padding: '120px 24px',
                textAlign: 'center',
                overflow: 'hidden',
                background: config?.hero?.type === 'color'
                    ? DS.bg
                    : (config?.hero?.type === 'image' && config?.hero?.url
                        ? `url(${config.hero.url}) center/cover no-repeat`
                        : `linear-gradient(to bottom, ${DS.accent}, white)`)
            }}>
                {/* Overlay for background image */}
                {config?.hero?.type === 'image' && config?.hero?.url && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: `rgba(0,0,0,${config.hero.overlay || 0.4})`,
                        zIndex: 0
                    }}></div>
                )}
                <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto' }}>
                    <span style={{ display: 'inline-block', background: 'white', color: DS.primary, padding: '6px 16px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.1em', marginBottom: '24px', boxShadow: DS.shadow }}>
                        {config?.hero?.subtitle || (isBeauty ? t('theme_hero_subtitle_beauty') : isGastronomy ? t('theme_hero_subtitle_gastro') : isHealthcare ? t('theme_hero_subtitle_health') : t('theme_hero_subtitle_retail'))}
                    </span>
                    <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '4.5rem', lineHeight: '1.1', marginBottom: '24px', color: DS.text }}>
                        {config?.hero?.title || (isBeauty ? t('theme_hero_title_beauty') : isGastronomy ? t('theme_hero_title_gastro') : isHealthcare ? t('theme_hero_title_health') : t('theme_hero_title_retail'))}
                    </h2>
                    <p style={{ fontSize: '1.25rem', color: DS.textSecondary, marginBottom: '40px', lineHeight: '1.8', maxWidth: '700px', margin: '0 auto 40px' }}>
                        {config?.hero?.description || (isBeauty ? t('theme_hero_desc_beauty') : isGastronomy ? t('theme_hero_desc_gastro') : isHealthcare ? t('theme_hero_desc_health') : t('theme_hero_desc_retail'))}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        <Link to={`/booking?domain=${siteData.domain || 'demo'}`} style={{ background: DS.primary, color: DS.buttonText, textDecoration: 'none', padding: '18px 48px', borderRadius: '50px', fontSize: '1rem', fontWeight: '700', boxShadow: `0 20px 40px -10px ${DS.primary}66` }}>
                            {t('theme_cta_book')}
                        </Link>
                        <a href="#services" style={{ background: 'white', color: DS.text, textDecoration: 'none', padding: '18px 48px', borderRadius: '50px', fontSize: '1rem', fontWeight: '700', border: `1px solid ${DS.border}` }}>
                            {t('theme_cta_services')}
                        </a>
                    </div>
                </div>
            </header>

            {/* Services Grid */}
            <section id="services" style={{ padding: '100px 24px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.5rem', marginBottom: '16px' }}>
                        {t('theme_cta_services')}
                    </h3>
                    <p style={{ color: DS.textSecondary, maxWidth: '600px', margin: '0 auto' }}>
                        {isBeauty ? t('theme_section_services_desc_beauty') : isGastronomy ? t('theme_section_services_desc_gastro') : isHealthcare ? t('theme_section_services_desc_health') : t('theme_section_services_desc_retail')}
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
                    {(siteData.appointmentSettings?.services || []).map(service => (
                        <div key={service.id} style={{
                            background: DS.surface, borderRadius: DS.radius, padding: '40px', textAlign: 'center', transition: 'all 0.3s',
                            boxShadow: DS.shadow, border: `1px solid ${DS.border}`, display: 'flex', flexDirection: 'column'
                        }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'white', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: DS.primary, boxShadow: DS.shadow }}>
                                {React.createElement(getServiceIcon(service.name), { size: 28 })}
                            </div>
                            <h4 style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', marginBottom: '16px' }}>{service.name}</h4>
                            <p style={{ color: DS.textSecondary, marginBottom: 'auto', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                {service.description || (isBeauty ? `${service.duration} dakikalık profesyonel uygulama.` : isGastronomy ? 'Özel tarifimizle hazırlanan eşsiz lezzet.' : isHealthcare ? 'Uzman kadromuz tarafından sunulan sağlık hizmeti.' : 'Kaliteli ve güvenilir ürün seçeneği.')}
                            </p>
                            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: `1px solid ${DS.border}`, display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.75rem', color: DS.textSecondary, textTransform: 'uppercase', fontWeight: '700' }}>{t('theme_price')}</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: DS.primary }}>{Number(service.price).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                                </div>
                                <Link to={`/booking?domain=${siteData.domain || 'demo'}&service=${service.id}`} style={{ background: DS.primary, width: '100%', textAlign: 'center', color: DS.buttonText, textDecoration: 'none', padding: '12px 24px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: '700' }}>
                                    {t('theme_cta_book')}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Products Section */}
            {
                products && products.length > 0 && (
                    <section id="products" style={{ padding: '100px 24px', background: DS.surface }}>
                        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' }}>
                                <div>
                                    <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.5rem', marginBottom: '12px' }}>{t('theme_nav_products')}</h3>
                                    <p style={{ color: DS.textSecondary }}>{t('theme_section_products_desc') || "Qualitätsprodukte für Sie."}</p>
                                </div>
                                <button style={{ background: 'none', border: `1px solid ${DS.border}`, padding: '12px 24px', borderRadius: '50px', color: DS.text, fontWeight: '600', cursor: 'pointer' }}>
                                    {t('theme_btn_view_all')}
                                </button>
                            </div>

                            <div className="product-grid" style={{ display: 'grid', gap: '24px' }}>
                                {products.map(product => (
                                    <div key={product.id} style={{ background: 'white', borderRadius: DS.radius, padding: '24px', boxShadow: DS.shadow, transition: 'all 0.3s', display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ height: '220px', background: DS.accent, borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <ShoppingBag size={48} color={DS.primary} style={{ opacity: 0.2 }} />
                                            )}
                                        </div>
                                        <h4 style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.2rem', marginBottom: '8px' }}>{product.name}</h4>
                                        <p style={{ color: DS.textSecondary, fontSize: '0.85rem', marginBottom: '20px', flex: 1 }}>{product.description || 'Özel içerikli bakım ürünü.'}</p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: 'auto', paddingTop: '20px', borderTop: `1px solid ${DS.border}`, alignItems: 'center' }}>
                                            <span style={{ fontSize: '1.2rem', fontWeight: '700', color: DS.text }}>{Number(product.price).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                                            <button
                                                onClick={() => addToCart(product)}
                                                style={{
                                                    width: '100%', padding: '12px', borderRadius: '50px',
                                                    background: DS.primary, color: DS.buttonText, border: 'none',
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                    fontWeight: '600', fontSize: '0.9rem'
                                                }}
                                            >
                                                <ShoppingBag size={18} /> {t('theme_btn_add_to_cart')}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )
            }

            {/* Footer */}
            <footer style={{ background: 'white', padding: '80px 24px', borderTop: `1px solid ${DS.border}` }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '60px' }}>
                    <div>
                        <h4 style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.8rem', color: DS.primary, marginBottom: '24px' }}>{profile?.companyName}</h4>
                        <p style={{ color: DS.textSecondary, lineHeight: '1.8', marginBottom: '24px' }}>
                            {config?.footer?.description || (isBeauty ? 'Profesyonel güzellik ve bakım hizmetleri ile kendinizi özel hissedin.' : isGastronomy ? 'En taze malzemeler ve kusursuz servis anlayışıyla hizmetinizdeyiz.' : isHealthcare ? 'Modern teknoloji ve şevkatli bakım anlayışını birleştiriyoruz.' : 'Stilinizi yansıtan en seçkin ürünleri beğeninize sunuyoruz.')}
                        </p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            {(config?.socialLinks?.instagram || config?.social?.instagram || profile?.social?.instagram) && (
                                <a href={config?.socialLinks?.instagram || config?.social?.instagram || profile?.social?.instagram} target="_blank" rel="noopener noreferrer" style={{ color: DS.primary }}>
                                    <Instagram style={{ cursor: 'pointer' }} />
                                </a>
                            )}
                            {(config?.socialLinks?.facebook || config?.social?.facebook || profile?.social?.facebook) && (
                                <a href={config?.socialLinks?.facebook || config?.social?.facebook || profile?.social?.facebook} target="_blank" rel="noopener noreferrer" style={{ color: DS.primary }}>
                                    <Facebook style={{ cursor: 'pointer' }} />
                                </a>
                            )}
                            {(config?.socialLinks?.twitter || config?.social?.twitter || profile?.social?.twitter) && (
                                <a href={config?.socialLinks?.twitter || config?.social?.twitter || profile?.social?.twitter} target="_blank" rel="noopener noreferrer" style={{ color: DS.primary }}>
                                    <Twitter style={{ cursor: 'pointer' }} />
                                </a>
                            )}
                            {(config?.socialLinks?.linkedin || config?.social?.linkedin || profile?.social?.linkedin) && (
                                <a href={config?.socialLinks?.linkedin || config?.social?.linkedin || profile?.social?.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: DS.primary }}>
                                    <Linkedin style={{ cursor: 'pointer' }} />
                                </a>
                            )}
                            {config?.extraSocialLinks?.map((link, idx) => (
                                <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" title={link.label} style={{ color: DS.primary }}>
                                    <Globe style={{ cursor: 'pointer' }} />
                                </a>
                            ))}
                        </div>

                        {/* Dynamic Working Hours */}
                        {(siteData?.appointmentSettings?.workingHours || (siteData?.appointmentSettings?.holidays && siteData.appointmentSettings.holidays.length > 0)) && (
                            <div style={{ marginTop: '32px', padding: '24px', background: '#f5f5f4', borderRadius: DS.radius, border: `1px solid ${DS.border}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: DS.primary, fontWeight: '700', fontSize: '1rem', fontFamily: '"Playfair Display", serif' }}>
                                    <Calendar size={18} /> {t('footer_working_hours')}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: DS.textSecondary }}>
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(dayCode => {
                                        const isOpen = siteData.appointmentSettings?.workingDays?.includes(dayCode);
                                        const dayMap = { 'Mon': 'monday', 'Tue': 'tuesday', 'Wed': 'wednesday', 'Thu': 'thursday', 'Fri': 'friday', 'Sat': 'saturday', 'Sun': 'sunday' };

                                        const schedule = siteData.appointmentSettings?.schedule;
                                        const isWeekend = ['Sat', 'Sun'].includes(dayCode);

                                        const hours = (schedule && schedule[dayCode])
                                            ? schedule[dayCode]
                                            : (isWeekend
                                                ? (siteData.appointmentSettings?.workingHoursWeekend?.start ? siteData.appointmentSettings.workingHoursWeekend : siteData.appointmentSettings?.workingHours)
                                                : siteData.appointmentSettings?.workingHours);

                                        const tKey = `day_${dayMap[dayCode] || dayCode.toLowerCase()}`;

                                        return (
                                            <div key={dayCode} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px dashed ${DS.border}`, paddingBottom: '4px' }}>
                                                <span style={{ color: isOpen ? DS.textSecondary : 'rgba(0,0,0,0.3)' }}>{t(tKey)}:</span>
                                                <span style={{ fontWeight: isOpen ? '600' : 'normal', color: isOpen ? DS.text : 'rgba(0,0,0,0.3)', fontStyle: isOpen ? 'normal' : 'italic' }}>
                                                    {isOpen ? `${hours?.start} - ${hours?.end}` : t('day_closed')}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    {siteData.appointmentSettings?.holidays?.length > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: `1px dashed ${DS.border}`, marginTop: '4px' }}>
                                            <span>{t('footer_holidays')}:</span>
                                            <span style={{ color: '#ef4444', fontStyle: 'italic' }}>{t('day_closed')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        <h5 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '24px', letterSpacing: '0.1em' }}>{t('theme_nav_services')}</h5>
                        <ul style={{ listStyle: 'none', padding: 0, color: DS.textSecondary, lineHeight: '2.5' }}>
                            {(siteData.appointmentSettings?.services || []).slice(0, 5).map(s => (
                                <li key={s.id}>{s.name}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h5 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '24px', letterSpacing: '0.1em' }}>{t('theme_nav_contact')}</h5>
                        <div style={{ color: DS.textSecondary, lineHeight: '1.8' }}>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><MapPin size={16} /> {profile?.street} {profile?.houseNum} {profile?.city}</p>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Phone size={16} /> {profile?.phone}</p>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Mail size={16} /> {profile?.email}</p>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${profile?.street} ${profile?.houseNum}, ${profile?.zip} ${profile?.city}`)}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: DS.primary, textDecoration: 'none', marginTop: '12px', fontWeight: '700', fontSize: '0.9rem' }}
                            >
                                <ArrowRight size={16} /> {t('theme_btn_directions')}
                            </a>
                        </div>
                    </div>
                </div>
                <div style={{ maxWidth: '1200px', margin: '40px auto 0', paddingTop: '40px', borderTop: `1px solid ${DS.border}`, textAlign: 'center', color: DS.textSecondary, fontSize: '0.85rem' }}>
                    &copy; {new Date().getFullYear()} {profile?.companyName}. {t('theme_footer_rights')}
                </div>
            </footer >
        </div >
    );
};

export default BeautyTheme;
