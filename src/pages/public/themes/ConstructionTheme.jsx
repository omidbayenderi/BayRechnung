
import React, { useEffect } from 'react';
import {
    Phone, Hammer, HardHat, MapPin, Calendar, CheckSquare,
    ArrowRight, Ruler, Briefcase, Building, Layers, Navigation, TrendingUp, GraduationCap, Book, Mail, Menu, X
} from 'lucide-react';
import { generateTheme } from '../utils/ColorEngine';

import { AgentFactory } from '../components/agents/AgentFactory';
import { useLanguage } from '../../../context/LanguageContext';

const ConstructionTheme = ({ siteData, themeColors, variant = 'v1', cartActions, userActions, state, languageActions }) => {
    const { profile, config, sections, products } = siteData;
    const { cart, isCartOpen } = state;
    const { addToCart, setIsCartOpen } = cartActions;
    const { currentUser, setIsCustomerPanelOpen, handleLogout } = userActions;
    const t = languageActions?.t || useLanguage().t;
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;500;600;700;800;900&display=swap';
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
    const industry = (profile?.industry || 'construction').toLowerCase();
    const isConstruction = industry === 'construction';
    const isConsulting = industry === 'consulting';
    const isEducation = industry === 'education';

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

    return (
        <div style={{
            fontFamily: DS.fontPrimary,
            background: DS.bg,
            color: DS.text,
            minHeight: '100vh'
        }}>
            <style>{`
                @media (max-width: 900px) {
                    .desktop-nav { display: none !important; }
                    .mobile-only { display: block !important; }
                    h2 { font-size: 2.5rem !important; }
                    .hero-grid { grid-template-columns: 1fr !important; }
                    .product-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (min-width: 901px) {
                    .mobile-only { display: none !important; }
                    .desktop-nav { display: flex !important; }
                    .hero-grid { grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); }
                    .product-grid { grid-template-columns: repeat(3, 1fr) !important; }
                }
            `}</style>

            {/* Top Bar - High Contrast */}

            {/* Top Bar - High Contrast */}
            <div style={{ background: DS.accent, color: 'white', padding: '10px 0', fontSize: '0.8rem', fontWeight: '500' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        {profile?.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={14} /> {profile.phone}</span>}
                        {profile?.email && <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={14} /> {profile.email}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <span>{isEducation ? t('theme_cons_top_edu') : isConsulting ? t('theme_cons_top_consul') : t('theme_cons_top_const')}</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <header style={{ background: 'white', borderBottom: `2px solid ${DS.primary}`, padding: '16px 0', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: DS.primary, color: DS.buttonText, padding: '10px', borderRadius: '4px' }}>
                            {isEducation ? <GraduationCap size={32} /> : isConsulting ? <Briefcase size={32} /> : <HardHat size={32} />}
                        </div>
                        <div>
                            <h1 style={{ fontFamily: '"Roboto Slab", serif', fontSize: '1.5rem', fontWeight: '800', lineHeight: 1, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {profile?.companyName || (isEducation ? t('theme_cons_brand_suffix_edu') : isConsulting ? t('theme_cons_brand_suffix_consul') : t('theme_cons_brand_suffix_const'))}
                            </h1>
                            <span style={{ fontSize: '0.75rem', color: DS.textSecondary, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>{profile?.city || t('theme_cons_hq')}</span>
                        </div>
                    </div>

                    <div className="desktop-nav" style={{ alignItems: 'center', gap: '40px' }}>
                        <nav style={{ display: 'flex', gap: '32px', fontWeight: '700', fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                            <a href="#projects" style={{ textDecoration: 'none', color: DS.text }}>{isEducation ? t('theme_cons_nav_projects_edu') : isConsulting ? t('theme_cons_nav_projects_consul') : t('theme_cons_nav_projects_const')}</a>
                            <a href="#services" style={{ textDecoration: 'none', color: DS.text }}>{t('theme_nav_services')}</a>
                            <a href="#contact" style={{ textDecoration: 'none', color: DS.text }}>{t('theme_nav_contact')}</a>
                        </nav>

                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
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
                                style={{ background: 'transparent', border: `2px solid ${DS.primary}`, color: DS.primary, padding: '10px 24px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s', textTransform: 'uppercase', fontSize: '0.85rem' }}
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
                                        fontSize: '0.9rem',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        color: DS.text,
                                        marginLeft: '16px',
                                        textTransform: 'uppercase'
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '1.25rem', fontWeight: '700' }}>
                            <a href="#projects" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none', color: DS.text }}>{isEducation ? t('theme_cons_nav_projects_edu') : isConsulting ? t('theme_cons_nav_projects_consul') : t('theme_cons_nav_projects_const')}</a>
                            <a href="#services" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none', color: DS.text }}>{t('theme_nav_services')}</a>
                            <a href="#contact" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none', color: DS.text }}>{t('theme_nav_contact')}</a>
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
                                                    padding: '8px 16px', borderRadius: '4px',
                                                    background: languageActions.currentLang === lang.code ? DS.primary : '#e7e5e4',
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
            </header>

            {/* Hero Section */}
            <section className="hero-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', minHeight: '650px', background: 'white' }}>
                <div style={{ padding: '80px 10% 80px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '1280px', margin: '0 0 0 auto' }}>
                    <div style={{ width: '60px', height: '6px', background: DS.primary, marginBottom: '32px' }} />
                    <h2 style={{ fontFamily: '"Roboto Slab", serif', fontSize: '4rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '24px', color: DS.text }}>
                        {config?.hero?.title || (isEducation ? t('theme_cons_hero_title_edu') : isConsulting ? t('theme_cons_hero_title_consul') : t('theme_cons_hero_title_const'))}
                    </h2>
                    <p style={{ fontSize: '1.25rem', color: DS.textSecondary, lineHeight: '1.7', marginBottom: '48px', maxWidth: '550px' }}>
                        {config?.hero?.description || (isEducation ? t('theme_cons_hero_desc_edu') : isConsulting ? t('theme_cons_hero_desc_consul') : t('theme_cons_hero_desc_const'))}
                    </p>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button style={{ background: DS.accent, color: 'white', padding: '20px 40px', fontSize: '0.9rem', fontWeight: '700', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', textTransform: 'uppercase' }}>
                            {isEducation ? t('theme_cons_btn_edu') : isConsulting ? t('theme_cons_btn_consul') : t('theme_cons_btn_const')} <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                <div style={{
                    position: 'relative',
                    minHeight: '500px',
                    clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0 100%)',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        backgroundImage: config?.hero?.type === 'image' && config?.hero?.url
                            ? `url(${config.hero.url})`
                            : 'url(https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'absolute',
                        inset: 0
                    }} />
                    {/* Overlay for dynamic image */}
                    {config?.hero?.type === 'image' && config?.hero?.url && (
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: `rgba(0,0,0,${config.hero.overlay || 0.3})`,
                            zIndex: 1
                        }}></div>
                    )}
                </div>
            </section>

            {/* Services Grid */}
            <section id="services" style={{ padding: '100px 24px', maxWidth: '1280px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' }}>
                    <div>
                        <span style={{ color: DS.primary, fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.8rem' }}>{t('theme_cons_what_we_do')}</span>
                        <h3 style={{ fontFamily: '"Roboto Slab", serif', fontSize: '2.5rem', fontWeight: '800', margin: '12px 0 0 0' }}>{t('theme_cta_services')}</h3>
                    </div>
                    <div style={{ width: '200px', height: '1px', background: DS.border, marginBottom: '20px' }} />
                </div>

                <div className="product-grid" style={{ display: 'grid', gap: '32px' }}>
                    {(products || []).map(product => (
                        <div key={product.id} style={{ background: 'white', border: `1px solid ${DS.border}`, transition: 'all 0.3s', position: 'relative' }}>
                            <div style={{ height: '280px', background: '#f5f5f4', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderBottom: `4px solid ${DS.primary}` }}>
                                {product.image ? (
                                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ textAlign: 'center' }}>
                                        {isEducation ? <Book size={64} color="#d6d3d1" /> : isConsulting ? <TrendingUp size={64} color="#d6d3d1" /> : <Building size={64} color="#d6d3d1" />}
                                        <div style={{ marginTop: '12px', color: '#d6d3d1', fontWeight: 'bold', fontSize: '0.7rem', letterSpacing: '2px' }}>{isEducation ? 'EĞİTİM MATERYALİ' : isConsulting ? 'HİZMET GÖRSELİ' : 'PROJE GÖRSELİ'}</div>
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '40px' }}>
                                <div style={{ background: DS.primary, width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: DS.buttonText, marginTop: '-60px', position: 'relative', zIndex: 1, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                                    {isEducation ? <GraduationCap size={20} /> : isConsulting ? <TrendingUp size={20} /> : <Hammer size={20} />}
                                </div>
                                <h4 style={{ fontFamily: '"Roboto Slab", serif', fontSize: '1.5rem', margin: '20px 0 16px 0', fontWeight: '700' }}>{product.name}</h4>
                                <p style={{ color: DS.textSecondary, lineHeight: '1.7', marginBottom: '32px', fontSize: '0.95rem' }}>{product.description || (isEducation ? t('theme_cons_hero_desc_edu') : isConsulting ? t('theme_cons_hero_desc_consul') : t('theme_cons_hero_desc_const'))}</p>
                                <button
                                    onClick={() => addToCart(product)}
                                    style={{ background: 'transparent', border: `1px solid ${DS.border}`, padding: '12px 24px', color: DS.text, fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', fontSize: '0.85rem' }}
                                >
                                    {t('theme_cons_btn_offer')} <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: DS.accent, color: '#a8a29e', padding: '100px 24px 60px' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '80px', marginBottom: '80px' }}>
                        <div>
                            <h4 style={{ color: 'white', fontFamily: '"Roboto Slab", serif', fontSize: '2rem', marginBottom: '24px', fontWeight: '800' }}>{profile?.companyName}</h4>
                            <p style={{ maxWidth: '400px', lineHeight: '1.8', fontSize: '0.95rem' }}>{config?.footer?.description || 'İnşaat sektöründe güven ve kalitenin adresi. Modern yapılar, sürdürülebilir çözümler.'}</p>

                            {/* Dynamic Working Hours */}
                            {(siteData?.appointmentSettings?.workingHours || (siteData?.appointmentSettings?.holidays && siteData.appointmentSettings.holidays.length > 0)) && (
                                <div style={{ marginTop: '32px', padding: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', borderLeft: `4px solid ${DS.primary}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'white', fontWeight: '800', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        <Calendar size={18} color={DS.primary} /> {t('footer_working_hours')}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: '#d6d3d1' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                                            <span style={{ fontWeight: '600' }}>{t('footer_weekdays')}:</span>
                                            <span style={{ fontWeight: '700', color: 'white' }}>
                                                {siteData.appointmentSettings?.workingHours?.start} - {siteData.appointmentSettings?.workingHours?.end}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
                                            <span style={{ fontWeight: '600' }}>{t('footer_weekend')}:</span>
                                            <span style={{ color: '#a8a29e' }}>
                                                {siteData.appointmentSettings?.workingDays?.some(d => ['Sat', 'Sun'].includes(d))
                                                    ? `${siteData.appointmentSettings?.workingHours?.start} - ${siteData.appointmentSettings?.workingHours?.end}`
                                                    : t('footer_closed')}
                                            </span>
                                        </div>
                                        {siteData.appointmentSettings?.holidays?.length > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '4px' }}>
                                                <span style={{ fontWeight: '600' }}>{t('footer_holidays')}:</span>
                                                <span style={{ color: '#f87171', fontWeight: '700' }}>{t('footer_closed')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                            <div>
                                <h5 style={{ color: 'white', fontWeight: '800', marginBottom: '24px', fontSize: '0.9rem', letterSpacing: '1px' }}>{t('theme_contact_address').toUpperCase().replace(':', '')}</h5>
                                <div style={{ lineHeight: '1.8', fontSize: '0.9rem' }}>
                                    <p>{profile?.street} {profile?.houseNum}<br />{profile?.zip} {profile?.city}</p>
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${profile?.street} ${profile?.houseNum}, ${profile?.zip} ${profile?.city}`)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ color: DS.primary, textDecoration: 'none', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px' }}
                                    >
                                        <ArrowRight size={14} /> {t('theme_btn_directions')}
                                    </a>
                                </div>
                            </div>
                            <div>
                                <h5 style={{ color: 'white', fontWeight: '800', marginBottom: '24px', fontSize: '0.9rem', letterSpacing: '1px' }}>{t('theme_nav_contact')}</h5>
                                <div style={{ lineHeight: '1.8', fontSize: '0.9rem' }}>
                                    <p>{profile?.phone}</p>
                                    <p>{profile?.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ borderTop: '1px solid #44403c', paddingTop: '40px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>&copy; {new Date().getFullYear()} {profile?.companyName}. {t('theme_footer_rights')}</span>
                        <div style={{ display: 'flex', gap: '24px' }}>
                            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>{t('theme_footer_privacy')}</a>
                            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>{t('theme_footer_terms')}</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ConstructionTheme;
