
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom'; // Added Link import
import {
    Phone, Mail, MapPin, Clock, Calendar, ChevronRight,
    ArrowRight, Star, Quote, CheckCircle, Search, ShoppingCart,
    Menu, X, Facebook, Instagram, Twitter, Linkedin, User, LogOut, Settings, Globe,
    Wrench, Car, Zap, Scissors, Briefcase, Sparkles, Disc, CircleDot, Shield, ShoppingBag, PenTool
} from 'lucide-react';
import { generateTheme } from '../utils/ColorEngine';

import { AgentFactory } from '../components/agents/AgentFactory';
import { useLanguage } from '../../../context/LanguageContext';

const ServiceTheme = ({ siteData, themeColors, variant = 'v1', cartActions, userActions, state, languageActions }) => {
    const { profile, config, sections, products } = siteData;
    const { cart, isCartOpen } = state;
    const { addToCart, setIsCartOpen } = cartActions;
    const { currentUser, setIsCustomerPanelOpen, handleLogout } = userActions;
    const t = languageActions?.t || useLanguage().t;
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 900);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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

    const industry = profile?.industry || 'general';
    const isAutomotive = industry === 'automotive';
    const isIT = industry === 'it';
    const isCrafts = industry === 'crafts';

    // Helper to select icon based on service name
    const getServiceIcon = (serviceName) => {
        const lower = serviceName.toLowerCase();
        if (lower.includes('motor') || lower.includes('mekanik') || lower.includes('tamir')) return Wrench;
        if (lower.includes('lastik') || lower.includes('jant') || lower.includes('balans')) return CircleDot;
        if (lower.includes('fren') || lower.includes('disk')) return Disc;
        if (lower.includes('klima') || lower.includes('gaz') || lower.includes('havalandırma')) return Wind;
        if (lower.includes('yağ') || lower.includes('sıvı') || lower.includes('yıkama') || lower.includes('temiz')) return Droplet;
        if (lower.includes('akü') || lower.includes('elektrik') || lower.includes('şarj') || lower.includes('lamba')) return Zap;
        if (lower.includes('kaporta') || lower.includes('boya')) return Car;
        if (lower.includes('saç') || lower.includes('sakal') || lower.includes('kesim') || lower.includes('bakım')) return Scissors;
        if (lower.includes('danışman') || lower.includes('muhasebe') || lower.includes('görüşme')) return Briefcase;

        return Sparkles;
    };

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

    // Update global styles for fonts
    const globalStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700;800;900&family=Montserrat:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&family=Oswald:wght@300;400;500;600;700&family=Crimson+Text:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');
    `;


    // Scroll Handler for Smooth Navigation with Offset
    const scrollToSection = (e, id) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const headerOffset = 100; // Adjust for sticky header
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    const sectionStyle = {
        padding: '100px 24px',
        maxWidth: '1280px',
        margin: '0 auto'
    };

    return (
        <div style={{
            fontFamily: DS.fontPrimary,
            background: DS.bg,
            color: DS.text,
            color: DS.text,
            minHeight: '100vh',
            overflowX: 'hidden'
        }}>
            <style>{`
                @media (max-width: 900px) {
                    .desktop-nav { display: none !important; }
                    .mobile-only { display: block !important; }
                    .hero-title { fontSize: 3rem !important; }
                    .section-padding { padding: 60px 20px !important; }
                    .product-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (min-width: 901px) {
                    .mobile-only { display: none !important; }
                    .desktop-nav { display: flex !important; }
                    .product-grid { grid-template-columns: repeat(3, 1fr) !important; }
                }
            `}</style>


            {/* Top Bar (Professional Info) */}
            <div style={{ background: DS.primary, color: 'rgba(255,255,255,0.7)', padding: '12px 24px', fontSize: '0.85rem', fontWeight: '500' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={14} style={{ color: DS.accent }} />
                            {(() => {
                                const days = siteData.appointmentSettings?.workingDays || [];
                                const defaultHrs = { start: '09:00', end: '18:00' };
                                const schedule = siteData.appointmentSettings?.schedule;
                                const workingHours = siteData.appointmentSettings?.workingHours || defaultHrs;
                                const workingHoursWeekend = siteData.appointmentSettings?.workingHoursWeekend || workingHours;

                                if (days.length === 0) return t('day_closed');

                                const dayMap = { 'Mon': 'monday', 'Tue': 'tuesday', 'Wed': 'wednesday', 'Thu': 'thursday', 'Fri': 'friday', 'Sat': 'saturday', 'Sun': 'sunday' };

                                // Determine hours for the first and last working day
                                const getHoursForDay = (dayCode) => {
                                    if (schedule && schedule[dayCode]) {
                                        return schedule[dayCode];
                                    }
                                    const isWeekend = ['Sat', 'Sun'].includes(dayCode);
                                    return isWeekend ? workingHoursWeekend : workingHours;
                                };

                                const firstDayCode = days[0];
                                const lastDayCode = days[days.length - 1];

                                const firstDayHours = getHoursForDay(firstDayCode);
                                const lastDayHours = getHoursForDay(lastDayCode);

                                const startDayName = t(`day_${dayMap[firstDayCode] || firstDayCode.toLowerCase()}`).substring(0, 3);
                                const endDayName = t(`day_${dayMap[lastDayCode] || lastDayCode.toLowerCase()}`).substring(0, 3);

                                // If all working days have the same hours, display a single range
                                const allSameHours = days.every(dayCode => {
                                    const hrs = getHoursForDay(dayCode);
                                    return hrs.start === firstDayHours.start && hrs.end === firstDayHours.end;
                                });

                                if (allSameHours) {
                                    return `${startDayName}-${endDayName}: ${firstDayHours.start} - ${firstDayHours.end}`;
                                } else {
                                    // If hours vary, display a more general message or just the range of days
                                    // For simplicity in the top bar, we'll show the overall range of days and a general "check schedule"
                                    return `${startDayName}-${endDayName}: ${t('theme_check_schedule')}`;
                                }
                            })()}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={14} style={{ color: DS.accent }} /> {profile?.city || t('general')}, {profile?.country || 'EU'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            {(config?.socialLinks?.instagram || config?.social?.instagram || profile?.social?.instagram) && (
                                <a href={config?.socialLinks?.instagram || config?.social?.instagram || profile?.social?.instagram} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', display: 'flex', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>
                                    <Instagram size={16} />
                                </a>
                            )}
                            {(config?.socialLinks?.facebook || config?.social?.facebook || profile?.social?.facebook) && (
                                <a href={config?.socialLinks?.facebook || config?.social?.facebook || profile?.social?.facebook} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', display: 'flex', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>
                                    <Facebook size={16} />
                                </a>
                            )}
                            {(config?.socialLinks?.twitter || config?.social?.twitter || profile?.social?.twitter) && (
                                <a href={config?.socialLinks?.twitter || config?.social?.twitter || profile?.social?.twitter} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', display: 'flex', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>
                                    <Twitter size={16} />
                                </a>
                            )}
                            {(config?.socialLinks?.linkedin || config?.social?.linkedin || profile?.social?.linkedin) && (
                                <a href={config?.socialLinks?.linkedin || config?.social?.linkedin || profile?.social?.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', display: 'flex', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>
                                    <Linkedin size={16} />
                                </a>
                            )}
                            {config?.extraSocialLinks?.map((link, idx) => (
                                <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" title={link.label} style={{ color: 'inherit', display: 'flex', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>
                                    <Globe size={16} />
                                </a>
                            ))}
                        </div>
                        <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.2)' }}></div>
                        {isAutomotive && (
                            <a href={`tel:${profile?.phone?.replace(/\s+/g, '')}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '700', color: DS.accent, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                <Phone size={14} /> {t('theme_service_cta_emergency')}
                            </a>
                        )}
                        {!isAutomotive && profile?.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: 'white' }}>
                                <Phone size={14} /> {profile.phone}
                            </div>
                        )}
                        {/* Emergency contact fallback for other industries if config exists */}
                        {!isAutomotive && config?.emergencyContact && (
                            <a href={`tel:${config.emergencyContact.replace(/\s+/g, '')}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '700', color: DS.accent, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                <Phone size={14} /> {config.emergencyLabel || t('theme_service_cta_emergency_general')}
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{
                background: 'white', borderBottom: '1px solid ' + DS.border,
                position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
            }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {profile?.logo ? (
                            <img src={profile.logo} alt="Logo" style={{ height: '48px', objectFit: 'contain' }} />
                        ) : (
                            <div style={{
                                width: '44px', height: '44px', background: DS.primary,
                                borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                            }}>
                                {isAutomotive ? <Car size={24} /> : isIT ? <Zap size={24} /> : isCrafts ? <PenTool size={24} /> : <Briefcase size={24} />}
                            </div>
                        )}
                        <div>
                            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: DS.primary, textTransform: 'uppercase', letterSpacing: '-0.5px', margin: 0, lineHeight: 1, fontFamily: DS.fontHeader }}>
                                {profile?.companyName || (isAutomotive ? 'AUTO SERVICE' : 'BUSINESS PROFILE')}
                            </h1>
                        </div>
                    </div>

                    {/* Desktop Actions */}
                    <div className="desktop-nav" style={{ alignItems: 'center', gap: '40px' }}>
                        <div style={{ display: 'flex', gap: '32px' }}>
                            <a href="#services" onClick={(e) => scrollToSection(e, 'services')} style={{ textDecoration: 'none', color: DS.text, fontWeight: '700', textTransform: 'uppercase', fontSize: '0.8rem', cursor: 'pointer', letterSpacing: '0.5px' }}>{t('theme_nav_services')}</a>
                            <Link to={`/booking?domain=${siteData.domain || 'demo'}`} style={{ textDecoration: 'none', color: DS.text, fontWeight: '700', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.5px' }}>{t('theme_cta_book')}</Link>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <button
                                onClick={() => setIsCartOpen(true)}
                                style={{ position: 'relative', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', padding: '8px' }}
                            >
                                <ShoppingBag size={22} color={DS.text} strokeWidth={2.2} />
                                {cart.length > 0 && (
                                    <span style={{
                                        position: 'absolute', top: 2, right: 2,
                                        background: DS.accent, color: 'white',
                                        borderRadius: '50%', width: '18px', height: '18px',
                                        fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800'
                                    }}>
                                        {cart.length}
                                    </span>
                                )}
                            </button>

                            {currentUser ? (
                                <button
                                    onClick={() => userActions.setIsCustomerPanelOpen(true)}
                                    style={{
                                        background: '#f1f5f9', border: 'none', borderRadius: '10px',
                                        padding: '12px 20px', fontWeight: 'bold', color: DS.text, cursor: 'pointer'
                                    }}
                                >
                                    {t('theme_nav_account')}
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        userActions.setAuthMode('login');
                                        cartActions.setCheckoutStep('auth');
                                        cartActions.setIsCartOpen(true);
                                    }}
                                    style={{
                                        background: DS.primary, border: 'none', borderRadius: '10px',
                                        padding: '12px 24px', fontWeight: 'bold', color: DS.buttonText, cursor: 'pointer',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    {t('theme_nav_login')}
                                </button>
                            )}
                            {/* Language Selector */}
                            {languageActions && (
                                <select
                                    value={languageActions.currentLang}
                                    onChange={(e) => languageActions.setServiceLanguage('website', e.target.value)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        fontSize: '0.8rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        color: DS.text,
                                        marginLeft: '8px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
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
                            <a href="#services" onClick={(e) => { scrollToSection(e, 'services'); setMobileMenuOpen(false); }} style={{ textDecoration: 'none', color: DS.text }}>{t('theme_nav_services')}</a>
                            <Link to={`/booking?domain=${siteData.domain || 'demo'}`} onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none', color: DS.text }}>{t('theme_cta_book')}</Link>
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
                                    <label style={{ fontSize: '0.9rem', color: DS.textSecondary, marginBottom: '8px', display: 'block' }}>Language / Dil</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {languageActions.LANGUAGES?.map(lang => (
                                            <button
                                                key={lang.code}
                                                onClick={() => { languageActions.setServiceLanguage('website', lang.code); setMobileMenuOpen(false); }}
                                                style={{
                                                    padding: '8px 16px', borderRadius: '8px',
                                                    background: languageActions.currentLang === lang.code ? DS.primary : '#f1f5f9',
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
                background: config?.hero?.type === 'color'
                    ? DS.primary
                    : (config?.hero?.type === 'image' && config?.hero?.url
                        ? `url(${config.hero.url}) center/cover no-repeat`
                        : `linear-gradient(rgba(11, 31, 59, 0.8), rgba(11, 31, 59, 0.95)), url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80')`),
                backgroundSize: 'cover', backgroundPosition: 'center',
                padding: '140px 24px', textAlign: 'center', color: 'white',
                borderBottom: `8px solid ${DS.accent}`,
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Overlay for dynamic image/video */}
                {(config?.hero?.type === 'image' || config?.hero?.type === 'video') && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: `rgba(0,0,0,${config.hero.overlay ?? 0.6})`,
                        zIndex: 0
                    }}></div>
                )}

                {/* Video Background Support */}
                {config?.hero?.type === 'video' && config?.hero?.url && (
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            minWidth: '100%',
                            minHeight: '100%',
                            width: 'auto',
                            height: 'auto',
                            zIndex: -1,
                            transform: 'translateX(-50%) translateY(-50%)',
                            objectFit: 'cover'
                        }}
                    >
                        <source src={config.hero.url} type="video/mp4" />
                    </video>
                )}
                <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '10px 20px',
                        background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
                        color: 'white', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem',
                        marginBottom: '32px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.2)',
                        letterSpacing: '2px'
                    }}>
                        <Shield size={14} style={{ color: DS.accent }} /> {isAutomotive ? t('theme_service_hero_label_auto') : t('theme_service_hero_label_general')}
                    </div>
                    <h1 style={{
                        fontSize: '5rem',
                        lineHeight: '0.95', marginBottom: '24px', textTransform: 'uppercase',
                        fontWeight: '900', letterSpacing: '-2px'
                    }}>
                        {config?.hero?.title || (isAutomotive ? t('theme_service_hero_title_auto') : t('theme_service_hero_title_general'))}
                    </h1>
                    <p style={{ fontSize: '1.4rem', color: 'rgba(246, 247, 251, 0.8)', marginBottom: '56px', maxWidth: '750px', margin: '0 auto 56px auto', lineHeight: '1.6', fontWeight: '400' }}>
                        {config?.hero?.description || (isAutomotive ? t('theme_service_hero_desc_auto') : t('theme_service_hero_desc_general'))}
                    </p>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                        <Link to={`/booking?domain=${siteData.domain || 'demo'}`} style={{ textDecoration: 'none' }}>
                            <button style={{
                                background: DS.accent, color: 'white',
                                border: 'none', padding: '20px 56px', borderRadius: DS.radius,
                                fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer',
                                textTransform: 'uppercase', letterSpacing: '1px',
                                boxShadow: '0 20px 30px -10px rgba(249, 115, 22, 0.3)',
                                transition: 'all 0.2s'
                            }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {t('theme_cta_book')}
                            </button>
                        </Link>
                        <a href="#services" onClick={(e) => scrollToSection(e, 'services')} style={{ textDecoration: 'none' }}>
                            <button style={{
                                background: 'transparent', color: 'white',
                                border: '2px solid rgba(255,255,255,0.3)', padding: '18px 48px', borderRadius: DS.radius,
                                fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer',
                                textTransform: 'uppercase', letterSpacing: '1px',
                                transition: 'all 0.2s'
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                {t('theme_cta_services')}
                            </button>
                        </a>
                    </div>
                </div>
            </header >


            {/* Services Grid */}
            {
                siteData.appointmentSettings?.services?.length > 0 && (
                    <section id="services" style={{ ...sectionStyle, background: DS.bg }}>
                        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                            <div style={{
                                display: 'inline-block', padding: '8px 20px', background: `${DS.primary}10`,
                                color: DS.primary, fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem',
                                marginBottom: '20px', borderRadius: '6px', letterSpacing: '1px'
                            }}>
                                {t('theme_service_specialties_title')}
                            </div>
                            <h2 style={{ fontSize: '3.5rem', fontWeight: '900', color: DS.primary, marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '-1px' }}>
                                {config?.services?.title || t('theme_cta_services')}
                            </h2>
                            <p style={{ color: DS.textSecondary, fontSize: '1.2rem', maxWidth: '750px', margin: '0 auto', lineHeight: '1.6' }}>
                                {config?.services?.description || (isAutomotive ? t('theme_service_footer_desc_auto') : t('theme_section_services_desc_retail'))}
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
                            {siteData.appointmentSettings.services.map(service => {
                                const ServiceIcon = getServiceIcon(service.name);
                                return (
                                    <div key={service.id} style={{
                                        background: 'white', borderRadius: DS.radius, padding: '40px',
                                        border: '1px solid ' + DS.border, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        cursor: 'pointer', display: 'flex', flexDirection: 'column',
                                        boxShadow: DS.shadow, position: 'relative', overflow: 'hidden'
                                    }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.transform = 'translateY(-8px)';
                                            e.currentTarget.style.boxShadow = DS.shadowHover;
                                            e.currentTarget.style.borderColor = DS.accent;
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = DS.shadow;
                                            e.currentTarget.style.borderColor = DS.border;
                                        }}
                                    >
                                        <div style={{
                                            width: '64px', height: '64px',
                                            background: service.color ? `${service.color}15` : `${DS.primary}10`,
                                            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: service.color || DS.primary, marginBottom: '32px'
                                        }}>
                                            <ServiceIcon size={32} strokeWidth={1.5} />
                                        </div>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '16px', color: DS.primary }}>{service.name}</h3>
                                        <p style={{ color: DS.textSecondary, marginBottom: '32px', flex: 1, fontSize: '1rem', lineHeight: '1.6' }}>
                                            {service.description || 'Bu hizmet için detaylı bilgi ve randevu seçenekleri aşağıda sunulmuştur.'}
                                        </p>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: '#64748b', marginBottom: '32px', background: '#f8fafc', padding: '10px 16px', borderRadius: '8px', width: 'fit-content' }}>
                                            <Clock size={16} style={{ color: DS.accent }} /> <strong>{service.duration} {t('unit_min')}</strong>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: 'auto', paddingTop: '32px', borderTop: '1px solid #f1f5f9' }}>
                                            <span style={{ fontSize: '1.8rem', fontWeight: '900', color: DS.primary, letterSpacing: '-1px', textAlign: 'center' }}>
                                                {Number(service.price).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                            </span>
                                            <Link
                                                to={`/booking?domain=${siteData.domain || 'demo'}&service=${service.id}`}
                                                style={{
                                                    background: DS.primary, color: DS.buttonText, border: 'none', textDecoration: 'none',
                                                    padding: '14px 28px', borderRadius: '10px', fontWeight: '800',
                                                    cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.5px',
                                                    textAlign: 'center', width: '100%'
                                                }}
                                            >
                                                {t('theme_cta_book')}
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )
            }


            {/* Products Grid (From Inventory) */}
            {
                products && products.length > 0 && (
                    <section id="products" style={{ ...sectionStyle, background: 'transparent' }}>
                        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                            <div style={{
                                display: 'inline-block', padding: '8px 20px', background: `${DS.primary}10`,
                                color: DS.primary, fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem',
                                marginBottom: '20px', borderRadius: '6px', letterSpacing: '1px'
                            }}>
                                {t('theme_service_products_title')}
                            </div>
                            <h2 style={{ fontSize: '3.5rem', fontWeight: '900', color: DS.primary, marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '-1px' }}>
                                {t('theme_section_products_title')}
                            </h2>
                            <p style={{ color: DS.textSecondary, fontSize: '1.2rem', maxWidth: '750px', margin: '0 auto', lineHeight: '1.6' }}>
                                {config?.products?.description || (isAutomotive ? t('theme_service_products_desc_auto') : t('theme_service_products_desc_general'))}
                            </p>
                        </div>

                        <div className="product-grid" style={{ display: 'grid', gap: '32px' }}>
                            {products.map(product => (
                                <div key={product.id} style={{
                                    background: 'white', border: '1px solid ' + DS.border,
                                    borderRadius: DS.radius, overflow: 'hidden',
                                    transition: 'all 0.3s ease', position: 'relative',
                                    boxShadow: DS.shadow
                                }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'translateY(-8px)';
                                        e.currentTarget.style.boxShadow = DS.shadowHover;
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = DS.shadow;
                                    }}
                                >
                                    <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', borderBottom: '1px solid #f1f5f9', padding: '32px' }}>
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            <div style={{ width: '80px', height: '80px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <ShoppingBag size={40} color="#cbd5e1" />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
                                        <h4 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '12px', color: DS.primary, height: '2.4em', overflow: 'hidden' }}>{product.name}</h4>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                                            <span style={{ fontSize: '1.6rem', fontWeight: '900', color: DS.primary, textAlign: 'center' }}>
                                                {Number(product.price).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                            </span>
                                            <button
                                                onClick={() => addToCart(product)}
                                                style={{
                                                    background: DS.primary,
                                                    border: 'none', padding: '12px 24px', borderRadius: '10px',
                                                    color: DS.buttonText, cursor: 'pointer', fontWeight: '800', fontSize: '0.85rem',
                                                    textTransform: 'uppercase', letterSpacing: '0.5px', width: '100%'
                                                }}
                                            >
                                                {t('theme_btn_add_to_cart')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )
            }

            {/* Footer */}
            <footer style={{ background: DS.primary, color: 'rgba(255,255,255,0.6)', padding: '100px 24px 40px', borderTop: `1px solid rgba(255,255,255,0.05)` }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '64px' }}>
                    {/* Brand Column */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                            <div style={{ width: '36px', height: '36px', background: DS.accent, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                {isAutomotive ? <Car size={20} /> : isIT ? <Zap size={20} /> : isCrafts ? <PenTool size={20} /> : <Briefcase size={20} />}
                            </div>
                            <h4 style={{ fontSize: '1.8rem', color: 'white', margin: 0, fontWeight: '800', letterSpacing: '-1px' }}>{profile?.companyName}</h4>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '1.8', fontSize: '1.05rem', marginBottom: '32px' }}>
                            {config?.footer?.description || (isAutomotive ? t('theme_service_footer_desc_auto') : t('theme_service_footer_desc_general'))}
                        </p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            {(config?.socialLinks?.instagram || config?.social?.instagram || profile?.social?.instagram) && (
                                <a href={config?.socialLinks?.instagram || config?.social?.instagram || profile?.social?.instagram} target="_blank" rel="noopener noreferrer" style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = DS.accent} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                                    <Instagram size={20} />
                                </a>
                            )}
                            {(config?.socialLinks?.facebook || config?.social?.facebook || profile?.social?.facebook) && (
                                <a href={config?.socialLinks?.facebook || config?.social?.facebook || profile?.social?.facebook} target="_blank" rel="noopener noreferrer" style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = DS.accent} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                                    <Facebook size={20} />
                                </a>
                            )}
                            {(config?.socialLinks?.twitter || config?.social?.twitter || profile?.social?.twitter) && (
                                <a href={config?.socialLinks?.twitter || config?.social?.twitter || profile?.social?.twitter} target="_blank" rel="noopener noreferrer" style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = DS.accent} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                                    <Twitter size={20} />
                                </a>
                            )}
                            {(config?.socialLinks?.linkedin || config?.social?.linkedin || profile?.social?.linkedin) && (
                                <a href={config?.socialLinks?.linkedin || config?.social?.linkedin || profile?.social?.linkedin} target="_blank" rel="noopener noreferrer" style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = DS.accent} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                                    <Linkedin size={20} />
                                </a>
                            )}
                            {config?.extraSocialLinks?.map((link, idx) => (
                                <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" title={link.label} style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = DS.accent} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                                    <Globe size={20} />
                                </a>
                            ))}
                        </div>

                        {/* Dynamic Working Hours */}
                        {(siteData?.appointmentSettings?.workingHours || (siteData?.appointmentSettings?.holidays && siteData.appointmentSettings.holidays.length > 0)) && (
                            <div style={{ marginTop: '32px', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'white', fontWeight: '700', fontSize: '0.95rem' }}>
                                    <Clock size={16} color={DS.accent} /> {t('footer_working_hours')}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
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
                                            <div key={dayCode} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.05)', paddingBottom: '2px' }}>
                                                <span style={{ color: isOpen ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)' }}>{t(tKey)}:</span>
                                                <span style={{ fontWeight: isOpen ? '600' : 'normal', color: isOpen ? 'white' : 'rgba(255,255,255,0.3)', fontStyle: isOpen ? 'normal' : 'italic' }}>
                                                    {isOpen ? `${hours?.start} - ${hours?.end}` : t('day_closed')}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    {siteData.appointmentSettings?.holidays?.length > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px dashed rgba(255,255,255,0.1)', marginTop: '4px' }}>
                                            <span>{t('footer_holidays')}:</span>
                                            <span style={{ color: '#ef4444', fontStyle: 'italic' }}>{t('day_closed')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 style={{ fontWeight: '800', color: 'white', marginBottom: '32px', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px' }}>{t('theme_footer_links')}</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <li style={{ marginBottom: '16px' }}><Link to="/" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'white'}>{t('theme_nav_home')}</Link></li>
                            <li style={{ marginBottom: '16px' }}><a href="#services" onClick={(e) => scrollToSection(e, 'services')} style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}>{t('theme_nav_services')}</a></li>
                            <li style={{ marginBottom: '16px' }}><Link to={`/booking?domain=${siteData.domain || 'demo'}`} style={{ color: 'inherit', textDecoration: 'none' }}>{t('theme_cta_book')}</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 style={{ fontWeight: '800', color: 'white', marginBottom: '32px', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px' }}>{t('theme_nav_contact')}</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <li style={{ marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <MapPin size={22} style={{ color: DS.accent, flexShrink: 0, marginTop: '4px' }} />
                                <div style={{ lineHeight: '1.6' }}>
                                    <strong>{t('theme_contact_address')}</strong><br />
                                    {profile?.street} {profile?.houseNum}<br />
                                    {profile?.zip} {profile?.city}<br />
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${profile?.street} ${profile?.houseNum}, ${profile?.zip} ${profile?.city}`)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: DS.accent, textDecoration: 'none', marginTop: '8px', fontWeight: '700', fontSize: '0.9rem' }}
                                    >
                                        <ArrowRight size={16} /> {t('theme_btn_directions')}
                                    </a>
                                </div>
                            </li>
                            <li style={{ marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <Phone size={20} style={{ color: DS.accent }} />
                                <div><strong>{t('theme_contact_phone')}</strong> {profile?.phone}</div>
                            </li>
                        </ul>
                    </div>
                </div>
                <div style={{ maxWidth: '1280px', margin: '80px auto 0', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                    &copy; {new Date().getFullYear()} {profile?.companyName}. {t('theme_footer_rights')}
                    {siteData.config?.theme?.showBranding !== false && (
                        <div style={{ marginTop: '12px', opacity: 0.5, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            Powered by <span style={{ fontWeight: 'bold', color: 'white' }}>BayZenit</span>
                        </div>
                    )}
                </div>
            </footer>

        </div >
    );
};

export default ServiceTheme;
