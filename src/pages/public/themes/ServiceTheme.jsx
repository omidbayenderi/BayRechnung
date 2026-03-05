
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Phone, Mail, MapPin, Clock, ChevronRight,
    Star, Quote, CheckCircle, Moon, Sun,
    Menu, X, Facebook, Instagram, Twitter, Linkedin, Briefcase, Sparkles, Shield, ShoppingBag,
    ChevronDown, Navigation, Scissors, Car, Zap, Disc, CircleDot, Wrench, Utensils, Stethoscope, Heart, Wind, Droplet
} from 'lucide-react';

import { AgentFactory } from '../components/agents/AgentFactory';
import { useLanguage } from '../../../context/LanguageContext';

const ServiceTheme = ({ siteData, themeColors, variant = 'v1', cartActions, userActions, state, languageActions, editorActions = {}, handleSubmitMessage }) => {
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
        surfaceSecondary: isDark ? '#334155' : '#f8fafc',
        text: config?.theme?.colors?.[modeKey]?.text || (isDark ? '#f8fafc' : '#1e293b'),
        textSecondary: config?.theme?.colors?.[modeKey]?.textSecondary || (isDark ? '#94a3b8' : '#64748b'),
        border: config?.theme?.colors?.[modeKey]?.border || (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
        bg: (() => {
            const bgs = config?.theme?.backgrounds?.body;
            const val = bgs?.[modeKey]?.value || bgs?.value;
            if (val && val !== 'default' && !val.startsWith('http')) return val;
            return config?.theme?.colors?.[modeKey]?.bg || (isDark ? '#0f172a' : '#ffffff');
        })(),
        radius: config?.theme?.radius || '16px',
        shadow: isDark ? '0 10px 30px -10px rgba(0,0,0,0.5)' : '0 10px 30px -10px rgba(0,0,0,0.08)'
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
            return { background: zone === 'hero' ? DS.primary : (zone === 'footer' ? DS.surfaceSecondary : DS.bg) };
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
        const icons = { Sparkles, Scissors, Car, Zap, Briefcase, Disc, CircleDot, Wrench, Utensils, Stethoscope, Heart, ShoppingBag, Wind, Droplet };
        if (savedIcon) return icons[savedIcon] || Sparkles;
        return Sparkles;
    };

    const scrollToSection = (e, id) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({ top: element.offsetTop - 80, behavior: "smooth" });
        }
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
                    outline: isActive ? `3px solid ${DS.primary}` : isHovered ? `2px dashed ${DS.primary}88` : 'none',
                    outlineOffset: isActive ? '-3px' : '-2px',
                    transition: 'outline 0.15s, opacity 0.2s',
                    opacity: isHidden ? 0.4 : 1,
                    zIndex: isActive ? 50 : isHovered ? 10 : 1
                }}
            >
                {isActive && (
                    <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', background: DS.primary, color: 'white', padding: '6px 16px', borderRadius: '0 0 10px 10px', fontSize: '0.7rem', fontWeight: '900', zIndex: 100, letterSpacing: '1px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                        ✏️ {type?.toUpperCase()} {isHidden && '(HIDDEN)'}
                    </div>
                )}
                {!isActive && isHovered && (
                    <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '6px 14px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: '700', zIndex: 100, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: 4 }}>
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
        if (res.success) { alert(t('message_sent_success') || 'Sent!'); f.reset(); }
        else { alert(res.error); }
        setSendingMsg(false);
    };

    const renderSection = (section) => {
        const sd = section.data || {};
        if (section.visible === false && !onSectionSelect) return null;
        const isHero = section.type.toLowerCase() === 'hero';

        const sectionBg = getBgStyle(isHero ? 'hero' : 'body', sd);
        const sectionWrapperStyle = {
            ...sectionBg,
            padding: sd.style?.padding === 'compact' ? '40px 24px' : sd.style?.padding === 'spacious' ? '120px 24px' : '80px 24px',
            position: 'relative',
            color: (isHero || sectionBg.backgroundImage) ? 'white' : DS.text
        };

        const content = (() => {
            switch (section.type.toLowerCase()) {
                case 'hero':
                    return (
                        <header id="hero" style={{ ...sectionBg, padding: isMobile ? '100px 24px' : '160px 24px', position: 'relative', minHeight: '600px', display: 'flex', alignItems: 'center' }}>
                            {(sectionBg.backgroundImage || sd.url) && <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${sd.overlay || 0.4})`, zIndex: 0 }}></div>}
                            <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: '60px', alignItems: 'center' }}>
                                <div>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: DS.primary + '15', color: DS.primary, borderRadius: '100px', marginBottom: '24px', fontSize: '0.85rem', fontWeight: '800' }}>
                                        <Sparkles size={16} /> {t('theme_hero_badge') || 'Premium Service'}
                                    </div>
                                    <h1 style={{ fontSize: isMobile ? '2.5rem' : (sd.headingSize || '4.5rem'), color: sd.headingColor || 'inherit', fontWeight: '900', marginBottom: '24px', lineHeight: 1.1 }}>{sd.title || t('hero_title')}</h1>
                                    <p style={{ fontSize: sd.subtitleSize || '1.2rem', color: sd.subtitleColor || 'inherit', marginBottom: '40px', maxWidth: '600px', opacity: 0.9 }}>{sd.subtitle || sd.description}</p>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <Link to={`/booking?domain=${siteData.slug}`}><button style={{ background: 'white', color: DS.primary, padding: '20px 48px', border: 'none', borderRadius: DS.radius, fontWeight: '800', cursor: 'pointer', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)' }}>{sd.buttonText || t('theme_cta_book')}</button></Link>
                                        <a href="#services" onClick={(e) => scrollToSection(e, 'services')}><button style={{ background: 'transparent', color: DS.text, padding: '18px 40px', border: '2px solid ' + DS.border, borderRadius: DS.radius, fontWeight: '800', cursor: 'pointer' }}>{t('theme_nav_services')}</button></a>
                                    </div>
                                </div>
                                {!isMobile && sd.image && <img src={sd.image} alt="Hero" style={{ width: '100%', borderRadius: DS.radius, boxShadow: '0 30px 60px -12px rgba(0,0,0,0.25)' }} />}
                            </div>
                        </header>
                    );
                case 'services':
                    return (
                        <section id="services" style={sectionWrapperStyle}>
                            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                                    <span style={{ color: DS.primary, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>{t('theme_service_specialties_title')}</span>
                                    <h2 style={{ fontSize: '3rem', fontWeight: '900', marginTop: '12px' }}>{sd.title || t('theme_nav_services')}</h2>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
                                    {(siteData.appointmentSettings?.services || []).map((s, i) => {
                                        const Icon = getServiceIcon(s.name, s.icon);
                                        return (
                                            <div key={i} style={{ background: DS.surface, padding: '40px', borderRadius: DS.radius, border: '1px solid ' + DS.border, boxShadow: DS.shadow, display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ width: 60, height: 60, background: DS.primary + '10', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: DS.primary, marginBottom: 24 }}>
                                                    <Icon size={30} />
                                                </div>
                                                <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{s.name}</h3>
                                                <p style={{ color: DS.textSecondary, flex: 1 }}>{s.description}</p>
                                                <div style={{ fontWeight: '900', color: DS.primary, marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span>{s.price} {profile?.currency}</span>
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
                                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                                    <span style={{ color: DS.primary, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>{t('our_products')}</span>
                                    <h2 style={{ fontSize: '3rem', fontWeight: '900', marginTop: '12px' }}>{sd.title || t('label_products')}</h2>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
                                    {products.map((p, i) => (
                                        <div key={i} style={{ background: DS.surface, borderRadius: DS.radius, border: '1px solid ' + DS.border, overflow: 'hidden', boxShadow: DS.shadow, transition: 'transform 0.2s' }}>
                                            <div style={{ height: '200px', background: DS.surfaceSecondary, overflow: 'hidden' }}>
                                                {p.image ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingBag size={48} opacity={0.2} /></div>}
                                            </div>
                                            <div style={{ padding: '24px' }}>
                                                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px' }}>{p.name}</h3>
                                                <p style={{ color: DS.textSecondary, fontSize: '0.9rem', marginBottom: '24px', height: '40px', overflow: 'hidden' }}>{p.description}</p>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: '900', fontSize: '1.2rem', color: DS.primary }}>{p.price} {profile?.currency}</span>
                                                    <button onClick={() => addToCart(p)} style={{ background: DS.primary, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <ShoppingBag size={18} /> {t('add_to_cart')}
                                                    </button>
                                                </div>
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
                            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '80px', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ fontSize: '3rem', fontWeight: '900' }}>{sd.title || t('theme_nav_contact')}</h2>
                                    <p style={{ color: DS.textSecondary, marginBottom: '40px' }}>{sd.subtitle || t('contact_desc')}</p>
                                    {[
                                        { icon: Phone, val: profile?.phone, label: t('phone') },
                                        { icon: Mail, val: profile?.email, label: t('email') },
                                        { icon: MapPin, val: profile?.address, label: t('location') }
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
                                            <div style={{ width: 50, height: 50, background: DS.primary + '15', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><item.icon size={24} color={DS.primary} /></div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: '800', opacity: 0.6, textTransform: 'uppercase' }}>{item.label}</div>
                                                <div style={{ fontWeight: '700' }}>{item.val}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ background: DS.surface, padding: '40px', borderRadius: DS.radius, border: '1px solid ' + DS.border, boxShadow: DS.shadow }}>
                                    <h3 style={{ fontWeight: '900', fontSize: '1.5rem', marginBottom: 24 }}>{t('send_us_a_message')}</h3>
                                    <form onSubmit={onSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <input name="name" required placeholder={t('your_name')} style={{ padding: 16, borderRadius: 12, border: '1px solid ' + DS.border, background: DS.surfaceSecondary, color: DS.text }} />
                                        <input name="email" type="email" required placeholder={t('your_email')} style={{ padding: 16, borderRadius: 12, border: '1px solid ' + DS.border, background: DS.surfaceSecondary, color: DS.text }} />
                                        <textarea name="message" required placeholder={t('your_message')} rows={4} style={{ padding: 16, borderRadius: 12, border: '1px solid ' + DS.border, background: DS.surfaceSecondary, color: DS.text, resize: 'none' }}></textarea>
                                        <button disabled={sendingMsg} style={{ background: DS.primary, color: 'white', padding: 16, borderRadius: 12, border: 'none', fontWeight: '800', cursor: 'pointer' }}>{sendingMsg ? '...' : t('send_message')}</button>
                                    </form>
                                </div>
                            </div>
                        </section>
                    );
                default:
                    return (
                        <section style={sectionWrapperStyle}>
                            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: '900' }}>{sd.title || section.type}</h2>
                                <div style={{ fontSize: '1.2rem', opacity: 0.8, marginTop: 24 }} dangerouslySetInnerHTML={{ __html: sd.content || sd.text }}></div>
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
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap');
                :root { --primary: ${DS.primary}; --accent: ${DS.accent}; --radius: ${DS.radius}; }
                ${config?.advanced?.customCss || ''}
            `}</style>

            <nav style={{ background: isDark ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid ' + DS.border, position: 'sticky', top: 0, zIndex: 1000 }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: '900', fontSize: '1.5rem', color: DS.primary, display: 'flex', alignItems: 'center', gap: 12 }}>
                        {profile?.logo ? <img src={profile.logo} alt="Logo" style={{ height: 40 }} /> : profile?.companyName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                        {!isMobile && (
                            <div style={{ display: 'flex', gap: '32px', fontWeight: '700', fontSize: '0.9rem' }}>
                                <a href="#hero" onClick={(e) => scrollToSection(e, 'hero')} style={{ textDecoration: 'none', color: DS.text }}>{t('theme_nav_home')}</a>
                                <a href="#services" onClick={(e) => scrollToSection(e, 'services')} style={{ textDecoration: 'none', color: DS.text }}>{t('theme_nav_services')}</a>
                                <a href="#products" onClick={(e) => scrollToSection(e, 'products')} style={{ textDecoration: 'none', color: DS.text }}>{t('label_products')}</a>
                                <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} style={{ textDecoration: 'none', color: DS.text }}>{t('theme_nav_contact')}</a>
                            </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button onClick={() => setModeOverride(isDark ? 'light' : 'dark')} style={{ background: 'none', border: 'none', color: DS.text, cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center' }}>
                                {isDark ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                            <button onClick={() => setIsCartOpen(true)} style={{ background: 'none', border: 'none', color: DS.text, position: 'relative', cursor: 'pointer' }}>
                                <ShoppingBag size={24} />
                                {cart.length > 0 && <span style={{ position: 'absolute', top: -5, right: -5, background: DS.primary, color: 'white', width: 18, height: 18, borderRadius: '50%', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>{cart.length}</span>}
                            </button>
                            <Link to={`/booking?domain=${siteData.slug}`}><button style={{ background: DS.primary + '15', color: DS.primary, border: 'none', padding: '12px 24px', borderRadius: '30px', fontWeight: '800', cursor: 'pointer', display: isMobile ? 'none' : 'block' }}>{t('book_appointment')}</button></Link>
                            <button onClick={() => setIsCustomerPanelOpen(true)} style={{ background: DS.primary, color: 'white', border: 'none', padding: '10px 24px', borderRadius: DS.radius, fontWeight: '800', cursor: 'pointer' }}>{currentUser ? t('theme_nav_account') : t('theme_nav_login')}</button>
                            {isMobile && <button onClick={() => setMobileMenuOpen(true)} style={{ background: 'none', border: 'none' }}><Menu size={28} color={DS.primary} /></button>}
                        </div>
                    </div>
                </div>
            </nav>

            <main>{sections.map(renderSection)}</main>

            <footer style={{ ...getBgStyle('footer'), color: DS.text, padding: '80px 24px 40px', borderTop: '1px solid ' + DS.border }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr', gap: '64px', textAlign: 'left', marginBottom: '64px' }}>
                        <div>
                            <div style={{ fontWeight: '900', fontSize: '1.5rem', color: DS.primary, display: 'flex', alignItems: 'center', gap: 12, marginBottom: '24px' }}>
                                {profile?.logo ? <img src={profile.logo} alt="Logo" style={{ height: 40 }} /> : profile?.companyName}
                            </div>
                            <p style={{ opacity: 0.7, lineHeight: 1.8, fontSize: '0.95rem' }}>{profile?.description || config?.footer?.description || t('service_footer_tagline')}</p>
                            <div style={{ display: 'flex', gap: 16, marginTop: '32px' }}>
                                {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => <Icon key={i} size={20} style={{ opacity: 0.6, cursor: 'pointer' }} />)}
                            </div>
                        </div>

                        <div>
                            <h5 style={{ fontWeight: '800', marginBottom: '24px', fontSize: '1.1rem' }}>{t('working_hours') || 'Working Hours'}</h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', opacity: 0.8 }}>
                                {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).map(day => (
                                    <div key={day} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{t(day.toLowerCase()) || day}</span>
                                        <span>{appointmentSettings?.workingDays?.includes(day.substring(0, 3)) ? (
                                            (day === 'Saturday' || day === 'Sunday' ?
                                                ((appointmentSettings?.workingHoursWeekend?.start || '10:00') + ' - ' + (appointmentSettings?.workingHoursWeekend?.end || '16:00')) :
                                                ((appointmentSettings?.workingHours?.start || '09:00') + ' - ' + (appointmentSettings?.workingHours?.end || '18:00'))
                                            )
                                        ) : t('closed', 'Kapalı')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h5 style={{ fontWeight: '800', marginBottom: '24px', fontSize: '1.1rem' }}>{t('navigation') || 'Navigation'}</h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                                <a href="#hero" onClick={(e) => scrollToSection(e, 'hero')} style={{ textDecoration: 'none', color: 'inherit', opacity: 0.8 }}>{t('theme_nav_home')}</a>
                                <a href="#services" onClick={(e) => scrollToSection(e, 'services')} style={{ textDecoration: 'none', color: 'inherit', opacity: 0.8 }}>{t('theme_nav_services')}</a>
                                <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} style={{ textDecoration: 'none', color: 'inherit', opacity: 0.8 }}>{t('theme_nav_contact')}</a>
                            </div>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid ' + DS.border, paddingTop: 32, opacity: 0.5, fontSize: '0.85rem', textAlign: 'center' }}>
                        &copy; {new Date().getFullYear()} {profile?.companyName}. {t('theme_footer_rights')}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ServiceTheme;
