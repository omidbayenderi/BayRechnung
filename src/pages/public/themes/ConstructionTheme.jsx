
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Phone, Mail, MapPin, Clock, Calendar, ChevronRight,
    ArrowRight, Star, Menu, X, Facebook, Instagram, Twitter, Linkedin,
    Briefcase, Sparkles, Shield, ShoppingBag, HardHat, Hammer, Ruler,
    ChevronDown, Navigation, Wrench, Zap, Car, Disc, CircleDot, Utensils, Stethoscope, Heart, Wind, Droplet, Sun, Moon
} from 'lucide-react';

import { AgentFactory } from '../components/agents/AgentFactory';
import { useLanguage } from '../../../context/LanguageContext';

const ConstructionTheme = ({ siteData, themeColors, variant = 'v1', cartActions, userActions, state, languageActions, editorActions = {}, handleSubmitMessage }) => {
    const { profile, config, sections = [], products = [], appointmentSettings } = siteData;
    const { onSectionSelect, activeSectionId } = editorActions;
    const { cart } = state;
    const { addToCart, setIsCartOpen } = cartActions;
    const { currentUser, setIsCustomerPanelOpen } = userActions;
    const { t: hookT } = useLanguage();
    const t = languageActions?.t || hookT;

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
    const [sendingMsg, setSendingMsg] = useState(false);
    const [modeOverride, setModeOverride] = useState(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getAutoMode = () => {
        const hour = new Date().getHours();
        const isNight = hour >= 18 || hour < 6;
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return systemPrefersDark || isNight ? 'dark' : 'light';
    };

    const activeMode = modeOverride || (siteData.mode === 'auto' || !siteData.mode ? getAutoMode() : siteData.mode);
    const isDark = activeMode === 'dark';
    const modeKey = isDark ? 'dark' : 'light';

    const agent = AgentFactory.getAgent(siteData);
    const agentSpecs = agent.getThemeSpecs(variant);

    const DS = {
        ...agentSpecs,
        primary: config?.theme?.primaryColor || themeColors.primary,
        accent: config?.theme?.secondaryColor || themeColors.secondary,
        surface: config?.theme?.colors?.[modeKey]?.surface || (isDark ? '#1e293b' : '#ffffff'),
        surfaceSecondary: isDark ? '#334155' : '#f8f9fa',
        text: config?.theme?.colors?.[modeKey]?.text || (isDark ? '#f8fafc' : '#1a1a1a'),
        textSecondary: config?.theme?.colors?.[modeKey]?.textSecondary || (isDark ? '#94a3b8' : '#6c757d'),
        border: config?.theme?.colors?.[modeKey]?.border || (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
        bg: (() => {
            const bgs = config?.theme?.backgrounds?.body;
            const val = bgs?.[modeKey]?.value || bgs?.value;
            if (val && val !== 'default' && !val.startsWith('http')) return val;
            return config?.theme?.colors?.[modeKey]?.bg || (isDark ? '#0f172a' : '#ffffff');
        })(),
        radius: config?.theme?.radius || '4px',
        shadow: isDark ? '0 10px 30px -10px rgba(0,0,0,0.5)' : '0 10px 30px -10px rgba(0,0,0,0.1)'
    };

    const getBgStyle = (zone, sectionData = {}) => {
        const override = sectionData.style?.backgrounds?.[modeKey] || sectionData.style?.background;

        let cfg = (typeof override === 'object') ? override : null;
        if (!cfg) {
            const globalZone = config?.theme?.backgrounds?.[zone];
            cfg = globalZone?.[modeKey] || globalZone;
        }

        if (!cfg || !cfg.value || cfg.value === 'default') {
            const fallbackVal = (typeof override === 'string' && override !== 'default') ? override : null;
            if (fallbackVal) return { background: fallbackVal };
            return { background: zone === 'hero' ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), #333` : (zone === 'footer' ? DS.surfaceSecondary : DS.bg) };
        }

        if (cfg.type === 'color' || cfg.type === 'gradient') return { background: cfg.value };
        if (cfg.type === 'image') {
            return {
                backgroundImage: `url(${cfg.value})`,
                backgroundSize: cfg.size || 'cover',
                backgroundPosition: cfg.position || 'center',
                backgroundRepeat: 'no-repeat'
            };
        }
        return { background: cfg.value };
    };

    const getServiceIcon = (name = '', savedIcon = null) => {
        const icons = { Sparkles, HardHat, Hammer, Ruler, Zap, Wrench, Car, Disc, CircleDot, Utensils, Stethoscope, Heart, ShoppingBag, Wind, Droplet };
        if (savedIcon) return icons[savedIcon] || HardHat;
        return HardHat;
    };

    const [hoveredSection, setHoveredSection] = useState(null);

    const SectionWrapper = ({ id, children, type }) => {
        const isActive = activeSectionId === id;
        const isEditable = !!onSectionSelect;
        const section = sections.find(s => s.id === id);
        const isHidden = section?.visible === false;
        const isHovered = hoveredSection === id;
        if (!isEditable) return children;
        return (
            <div
                onClick={(e) => { e.stopPropagation(); onSectionSelect(id); }}
                onMouseEnter={() => setHoveredSection(id)}
                onMouseLeave={() => setHoveredSection(null)}
                style={{
                    position: 'relative', cursor: 'pointer',
                    outline: isActive ? `4px solid ${DS.primary}` : isHovered ? `2px dashed ${DS.primary}88` : 'none',
                    outlineOffset: isActive ? '-4px' : '-2px',
                    transition: 'outline 0.15s, opacity 0.2s',
                    opacity: isHidden ? 0.4 : 1,
                    zIndex: isActive ? 50 : isHovered ? 10 : 1
                }}
            >
                {isActive && (
                    <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', background: DS.primary, color: isDark ? '#000' : '#fff', padding: '6px 16px', fontWeight: '900', zIndex: 100, fontSize: '0.75rem', textTransform: 'uppercase', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                        ✏️ {type?.toUpperCase()} {isHidden && '(HIDDEN)'}
                    </div>
                )}
                {!isActive && isHovered && (
                    <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '6px 14px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '700', zIndex: 100, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        ✏️ Click to Edit
                    </div>
                )}
                {children}
            </div>
        );
    };

    const onSendMessage = async (e) => {
        e.preventDefault();
        if (sendingMsg) return;
        setSendingMsg(true);
        const f = e.target;
        const res = await handleSubmitMessage({ name: f.name.value, email: f.email.value, message: f.message.value });
        if (res.success) { alert(hookT('message_sent_success') || 'Sent!'); f.reset(); }
        else { alert(res.error); }
        setSendingMsg(false);
    };

    const scrollToSection = (e, id) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({ top: element.offsetTop - 80, behavior: "smooth" });
        }
    };

    const renderSection = (section) => {
        const sd = section.data || {};
        const style = sd.style || {};
        if (section.visible === false && !onSectionSelect) return null;
        const isHero = section.type.toLowerCase() === 'hero';
        const sectionBg = getBgStyle(isHero ? 'hero' : 'body', sd);
        const sectionWrapperStyle = {
            ...sectionBg,
            padding: style.padding === 'compact' ? '60px 24px' : style.padding === 'spacious' ? '140px 24px' : '100px 24px',
            position: 'relative',
            color: (isHero || sectionBg.backgroundImage) ? 'white' : DS.text
        };

        const content = (() => {
            switch (section.type.toLowerCase()) {
                case 'hero':
                    return (
                        <header id="hero" style={{ ...sectionBg, padding: isMobile ? '140px 24px' : '200px 24px', position: 'relative', minHeight: '700px', display: 'flex', alignItems: 'center' }}>
                            {(sectionBg.backgroundImage || sd.url) && <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${sd.overlay || 0.6})`, zIndex: 0 }}></div>}
                            <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1, width: '100%' }}>
                                <div style={{ borderLeft: `8px solid ${DS.primary}`, paddingLeft: isMobile ? 12 : 32 }}>
                                    <span style={{ background: DS.primary, color: isDark ? '#000' : '#fff', padding: '4px 12px', fontWeight: '900', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: 24, display: 'inline-block' }}>{t('construction_excellence') || 'Excellence'}</span>
                                    <h1 style={{ fontSize: isMobile ? '2rem' : (sd.headingSize || '4.5rem'), color: sd.headingColor || 'inherit', fontWeight: '900', marginBottom: '24px', textTransform: 'uppercase', lineHeight: 1.1 }}>{sd.title || t('hero_title')}</h1>
                                    <p style={{ fontSize: sd.subtitleSize || '1.25rem', color: sd.subtitleColor || 'inherit', marginBottom: '48px', opacity: 0.9, maxWidth: '700px' }}>{sd.subtitle || sd.description}</p>
                                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                        <Link to={`/booking?domain=${siteData.slug}`}><button style={{ background: 'white', color: DS.primary, padding: '20px 48px', border: 'none', borderRadius: DS.radius, fontWeight: '800', cursor: 'pointer', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)' }}>{sd.buttonText || t('theme_cta_book')}</button></Link>
                                        <a href="#services" onClick={(e) => scrollToSection(e, 'services')}><button style={{ background: 'transparent', color: 'white', padding: '20px 48px', border: '2px solid white', borderRadius: DS.radius, fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase' }}>{t('theme_nav_services')}</button></a>
                                    </div>
                                </div>
                            </div>
                        </header>
                    );
                case 'services':
                    return (
                        <section id="services" style={sectionWrapperStyle}>
                            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 80, flexWrap: 'wrap', gap: 32 }}>
                                    <div>
                                        <h2 style={{ fontSize: '3rem', fontWeight: '900', textTransform: 'uppercase' }}>{sd.title || t('theme_nav_services')}</h2>
                                        <div style={{ width: 80, height: 6, background: DS.primary, marginTop: 16 }}></div>
                                    </div>
                                    <p style={{ maxWidth: 500, color: DS.textSecondary, fontSize: '1.1rem' }}>{t('construction_services_desc')}</p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1px', background: DS.border, border: '1px solid ' + DS.border }}>
                                    {(siteData.appointmentSettings?.services || []).map((s, i) => {
                                        const Icon = getServiceIcon(s.name, s.icon);
                                        return (
                                            <div key={i} style={{ background: DS.surface, padding: isMobile ? '40px 24px' : '60px 48px', color: DS.text, cursor: 'pointer', transition: 'all 0.3s' }}>
                                                <Icon size={48} color={DS.primary} style={{ marginBottom: 32 }} />
                                                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: 16 }}>{s.name}</h3>
                                                <p style={{ color: DS.textSecondary, marginBottom: 32, lineHeight: 1.8 }}>{s.description}</p>
                                                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: '900', fontSize: '1.2rem' }}>{s.price} {profile?.currency}</span>
                                                    <Link to={`/booking?domain=${siteData.slug}&serviceId=${s.id}`} style={{ background: DS.primary, color: 'white', padding: '12px 24px', borderRadius: '30px', textDecoration: 'none', fontWeight: '800', fontSize: '0.9rem' }}>{t('book_now')}</Link>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>
                    );
                case 'products':
                    return (
                        <section id="products" style={sectionWrapperStyle}>
                            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 80, flexWrap: 'wrap', gap: 32 }}>
                                    <div>
                                        <h2 style={{ fontSize: '3rem', fontWeight: '900', textTransform: 'uppercase' }}>{sd.title || t('our_products')}</h2>
                                        <div style={{ width: 80, height: 6, background: DS.primary, marginTop: 16 }}></div>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
                                    {products.map((p, i) => (
                                        <div key={i} style={{ background: DS.surface, border: '1px solid ' + DS.border, transition: 'all 0.3s' }}>
                                            <div style={{ height: '250px', background: DS.surfaceSecondary, position: 'relative' }}>
                                                {p.image ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingBag size={48} opacity={0.2} /></div>}
                                                <div style={{ position: 'absolute', top: 20, right: 20, background: DS.primary, color: isDark ? '#000' : '#fff', padding: '8px 16px', fontWeight: '900', fontSize: '0.9rem' }}>{p.price} {profile?.currency}</div>
                                            </div>
                                            <div style={{ padding: '32px' }}>
                                                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: 16 }}>{p.name}</h3>
                                                <p style={{ color: DS.textSecondary, marginBottom: 32, lineHeight: 1.6, height: '4.8em', overflow: 'hidden' }}>{p.description}</p>
                                                <button onClick={() => addToCart(p)} style={{ width: '100%', background: 'transparent', color: DS.text, border: '2px solid ' + DS.primary, padding: '16px', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                                    <ShoppingBag size={20} /> {t('add_to_cart')}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    );
                case 'contact':
                    return (
                        <section id="contact" style={sectionWrapperStyle}>
                            <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '40px' : '80px' }}>
                                <div>
                                    <h2 style={{ fontSize: '3rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: 32 }}>{sd.title || t('theme_nav_contact')}</h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                                        {[
                                            { icon: Phone, val: profile?.phone, label: t('phone') },
                                            { icon: Mail, val: profile?.email, label: t('email') },
                                            { icon: MapPin, val: profile?.address, label: t('location') }
                                        ].map((item, i) => (
                                            <div key={i} style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                                                <div style={{ background: DS.primary, color: isDark ? '#000' : '#fff', padding: 12, borderRadius: 4 }}><item.icon size={24} /></div>
                                                <div>
                                                    <div style={{ fontSize: '0.8rem', fontWeight: '900', opacity: 0.6, textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                                                    <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{item.val}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ background: DS.surface, padding: isMobile ? '32px 24px' : '48px', border: '1px solid ' + DS.border, position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: 6, height: '100%', background: DS.primary }}></div>
                                    <h3 style={{ fontWeight: '900', fontSize: '1.5rem', marginBottom: 32, textTransform: 'uppercase' }}>{t('send_us_a_message')}</h3>
                                    <form onSubmit={onSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <input name="name" required placeholder={t('your_name')} style={{ padding: 16, borderRadius: 0, border: '1px solid ' + DS.border, background: DS.surfaceSecondary, color: DS.text, outline: 'none' }} />
                                        <input name="email" type="email" required placeholder={t('your_email')} style={{ padding: 16, borderRadius: 0, border: '1px solid ' + DS.border, background: DS.surfaceSecondary, color: DS.text, outline: 'none' }} />
                                        <textarea name="message" required placeholder={t('your_message')} rows={4} style={{ padding: 16, borderRadius: 0, border: '1px solid ' + DS.border, background: DS.surfaceSecondary, color: DS.text, resize: 'none', outline: 'none' }}></textarea>
                                        <button disabled={sendingMsg} style={{ background: DS.primary, color: isDark ? '#000' : '#fff', padding: 16, border: 'none', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase' }}>{sendingMsg ? '...' : t('send_message')}</button>
                                    </form>
                                </div>
                            </div>
                        </section>
                    );
                default:
                    return (
                        <section style={sectionWrapperStyle}>
                            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                                <h2 style={{ fontSize: '3rem', fontWeight: '900', textTransform: 'uppercase' }}>{sd.title || section.type}</h2>
                                <div style={{ fontSize: '1.2rem', opacity: 0.8, marginTop: 40, lineHeight: 2 }} dangerouslySetInnerHTML={{ __html: sd.content || sd.text }}></div>
                            </div>
                        </section>
                    );
            }
        })();

        return <SectionWrapper key={section.id} id={section.id} type={section.type}>{content}</SectionWrapper>;
    };

    return (
        <div style={{ fontFamily: DS.fontPrimary, background: DS.bg, color: DS.text, minHeight: '100vh', overflowX: 'hidden' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
                :root { --primary: ${DS.primary}; --accent: ${DS.accent}; --radius: ${DS.radius}; }
                ${config?.advanced?.customCss || ''}
            `}</style>

            <nav style={{ background: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)', borderBottom: `4px solid ${DS.primary}`, position: 'sticky', top: 0, zIndex: 1000 }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '16px 24px' : '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: '900', fontSize: isMobile ? '1.25rem' : '1.75rem', textTransform: 'uppercase', letterSpacing: '-1px' }}>
                        {profile?.logo ? <img src={profile.logo} alt="Logo" style={{ height: isMobile ? 40 : 50 }} /> : profile?.companyName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '16px' : '48px' }}>
                        {!isMobile && (
                            <div style={{ display: 'flex', gap: '32px', fontWeight: '900', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                                <a href="#hero" onClick={(e) => scrollToSection(e, 'hero')} style={{ textDecoration: 'none', color: DS.text }}>{t('theme_nav_home')}</a>
                                <a href="#services" onClick={(e) => scrollToSection(e, 'services')} style={{ textDecoration: 'none', color: DS.text }}>{t('theme_nav_services')}</a>
                                <a href="#products" onClick={(e) => scrollToSection(e, 'products')} style={{ textDecoration: 'none', color: DS.text }}>{t('label_products')}</a>
                                <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} style={{ textDecoration: 'none', color: DS.text }}>{t('theme_nav_contact')}</a>
                            </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 24 }}>
                            <button onClick={() => setModeOverride(isDark ? 'light' : 'dark')} style={{ background: 'none', border: 'none', color: DS.text, cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center' }}>
                                {isDark ? <Sun size={isMobile ? 20 : 24} /> : <Moon size={isMobile ? 20 : 24} />}
                            </button>
                            <button onClick={() => setIsCartOpen(true)} style={{ background: 'none', border: 'none', color: DS.text, cursor: 'pointer', position: 'relative' }}>
                                <ShoppingBag size={isMobile ? 22 : 26} />
                                {cart.length > 0 && <span style={{ position: 'absolute', top: -5, right: -5, background: DS.primary, color: isDark ? '#000' : '#fff', width: 18, height: 18, borderRadius: '50%', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>{cart.length}</span>}
                            </button>
                            <Link to={`/booking?domain=${siteData.slug}`}><button style={{ background: DS.primary + '20', color: DS.text, border: `2px solid ${DS.primary}`, padding: isMobile ? '8px 16px' : '12px 24px', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer', fontSize: isMobile ? '0.7rem' : '0.85rem', display: isMobile ? 'none' : 'block' }}>{t('book_appointment')}</button></Link>
                            <button onClick={() => setIsCustomerPanelOpen(true)} style={{ background: DS.primary, color: isDark ? '#000' : '#fff', border: 'none', padding: isMobile ? '8px 16px' : '12px 32px', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer', fontSize: isMobile ? '0.75rem' : '1rem' }}>{currentUser ? t('theme_nav_account') : t('theme_nav_login')}</button>
                            {isMobile && <button onClick={() => setMobileMenuOpen(true)} style={{ background: 'none', border: 'none' }}><Menu size={28} color={DS.primary} /></button>}
                        </div>
                    </div>
                </div>
            </nav>

            <main>{sections.map(renderSection)}</main>

            <footer style={{ ...getBgStyle('footer'), color: DS.text, padding: isMobile ? '60px 24px 40px' : '100px 24px 80px', borderTop: `1px solid ${DS.border}` }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr', gap: isMobile ? '40px' : '80px', textAlign: 'left', marginBottom: '80px' }}>
                        <div>
                            <div style={{ fontWeight: '900', fontSize: '2rem', textTransform: 'uppercase', marginBottom: 32 }}>
                                {profile?.logo ? <img src={profile.logo} alt="Logo" style={{ height: 50 }} /> : profile?.companyName}
                            </div>
                            <p style={{ opacity: 0.7, lineHeight: 2, fontSize: '1.1rem', maxWidth: '500px' }}>{profile?.description || config?.footer?.description || t('construction_footer_desc')}</p>
                            <div style={{ display: 'flex', gap: 24, marginTop: '40px' }}>
                                {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => <Icon key={i} size={24} style={{ opacity: 0.6, cursor: 'pointer' }} />)}
                            </div>
                        </div>

                        <div>
                            <h5 style={{ fontWeight: '900', textTransform: 'uppercase', marginBottom: 24, fontSize: '0.9rem', color: DS.primary, borderLeft: `4px solid ${DS.primary}`, paddingLeft: 12 }}>{t('working_hours') || 'Working Hours'}</h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: '0.95rem', opacity: 0.8 }}>
                                {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).map(day => (
                                    <div key={day} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${DS.border}`, paddingBottom: 8 }}>
                                        <span style={{ fontWeight: '700' }}>{t(day.toLowerCase()) || day}</span>
                                        <span>{siteData.appointmentSettings?.workingDays?.includes(day.substring(0, 3)) ? (
                                            (day === 'Saturday' || day === 'Sunday' ?
                                                ((siteData.appointmentSettings?.workingHoursWeekend?.start || '10:00') + ' - ' + (siteData.appointmentSettings?.workingHoursWeekend?.end || '16:00')) :
                                                ((siteData.appointmentSettings?.workingHours?.start || '09:00') + ' - ' + (siteData.appointmentSettings?.workingHours?.end || '18:00'))
                                            )
                                        ) : t('closed', 'Kapalı')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h5 style={{ fontWeight: '900', textTransform: 'uppercase', marginBottom: 24, fontSize: '0.9rem', color: DS.primary, borderLeft: `4px solid ${DS.primary}`, paddingLeft: 12 }}>{t('contact_info')}</h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{ display: 'flex', gap: 12 }}><Phone size={18} color={DS.primary} /> <span style={{ fontWeight: '700' }}>{profile?.phone}</span></div>
                                <div style={{ display: 'flex', gap: 12 }}><Mail size={18} color={DS.primary} /> <span style={{ fontWeight: '700' }}>{profile?.email}</span></div>
                                <div style={{ display: 'flex', gap: 12 }}><MapPin size={18} color={DS.primary} /> <span style={{ fontWeight: '700' }}>{profile?.address}</span></div>
                            </div>
                        </div>
                    </div>

                    <div style={{ borderTop: `1px solid ${DS.border}`, paddingTop: 40, opacity: 0.5, fontSize: '0.85rem', textAlign: 'center' }}>
                        &copy; {new Date().getFullYear()} {profile?.companyName}. {t('theme_footer_rights')}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ConstructionTheme;
