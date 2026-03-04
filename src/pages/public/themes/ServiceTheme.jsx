
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Phone, Mail, MapPin, Clock, Calendar, ChevronRight,
    ArrowRight, Star, Quote, CheckCircle, Search, ShoppingCart,
    Menu, X, Facebook, Instagram, Twitter, Linkedin, User, LogOut, Settings, Globe,
    Wrench, Car, Zap, Scissors, Briefcase, Sparkles, Disc, CircleDot, Shield, ShoppingBag, PenTool,
    Utensils, Stethoscope, Heart, Wind, Droplet, Hash, ChevronDown
} from 'lucide-react';

import { AgentFactory } from '../components/agents/AgentFactory';
import { useLanguage } from '../../../context/LanguageContext';

const ServiceTheme = ({ siteData, themeColors, variant = 'v1', cartActions, userActions, state, languageActions }) => {
    const { profile, config, sections = [], products = [] } = siteData;
    const { cart, isCartOpen } = state;
    const { addToCart, setIsCartOpen } = cartActions;
    const { currentUser, setIsCustomerPanelOpen } = userActions;
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

    const DS = {
        ...agentSpecs,
        primary: config?.theme?.primaryColor || themeColors.primary,
        primaryDark: themeColors.primaryDark,
        primaryLight: themeColors.primaryLight,
        accent: config?.theme?.secondaryColor || themeColors.secondary,
        buttonText: themeColors.buttonText,
        bg: themeColors.background,
        text: themeColors.text,
        fontPrimary: config?.theme?.fontBody || themeColors.font || agentSpecs.fontPrimary,
        fontHeader: config?.theme?.fontHeading || themeColors.font || agentSpecs.fontHeader,
        radius: config?.theme?.radius || '16px',
        shadow: '0 10px 30px -10px rgba(0,0,0,0.08)',
        shadowHover: '0 20px 40px -15px rgba(0,0,0,0.15)',
        border: 'rgba(0,0,0,0.05)'
    };

    const industry = profile?.industry || 'general';
    const isAutomotive = industry === 'automotive';

    const getServiceIcon = (serviceName = '', savedIcon = null) => {
        if (savedIcon) {
            const icons = { Sparkles, Scissors, Car, Zap, Briefcase, Disc, CircleDot, Wrench, Utensils, Stethoscope, Heart, ShoppingBag, Wind, Droplet };
            return icons[savedIcon] || Sparkles;
        }
        return Sparkles;
    };

    const scrollToSection = (e, id) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
    };

    // Render logic for different section types
    const renderSection = (section) => {
        const sd = section.data || {};
        const style = sd.style || {};
        const isVisible = section.visible !== false;
        if (!isVisible) return null;

        const bgStyles = {
            default: { background: DS.bg },
            gray: { background: '#f8fafc' },
            primary: { background: DS.primary, color: 'white' },
            gradient: { background: `linear-gradient(135deg, ${DS.primary}, ${DS.primaryDark})`, color: 'white' }
        };

        const sectionWrapperStyle = {
            ...bgStyles[style.background || 'default'],
            padding: style.padding === 'compact' ? '60px 24px' : style.padding === 'spacious' ? '140px 24px' : '100px 24px',
            position: 'relative'
        };

        switch (section.type.toLowerCase()) {
            case 'hero':
                return (
                    <header key={section.id} id="hero" style={{
                        background: sd.type === 'color' ? DS.primary : (sd.url ? `url(${sd.url}) center/cover no-repeat` : DS.primary),
                        padding: '160px 24px', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden'
                    }}>
                        {sd.url && <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${sd.overlay || 0.5})`, zIndex: 0 }}></div>}
                        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', backdropFilter: 'blur(8px)', marginBottom: '24px', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '1px' }}>
                                <Shield size={14} color={DS.accent} /> {isAutomotive ? t('theme_service_hero_label_auto') : t('theme_service_hero_label_general')}
                            </div>
                            <h1 style={{ fontSize: isMobile ? '3rem' : '4.5rem', fontWeight: '900', marginBottom: '24px', lineHeight: 1.1 }}>{sd.title || t('hero_title')}</h1>
                            <p style={{ fontSize: '1.25rem', marginBottom: '40px', opacity: 0.9, maxWidth: '700px', margin: '0 auto 40px' }}>{sd.subtitle || sd.description}</p>
                            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Link to="/booking">
                                    <button style={{ background: DS.accent, color: 'white', padding: '18px 48px', border: 'none', borderRadius: DS.radius, fontWeight: '800', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 15px 30px -10px ' + DS.accent + '60' }}>
                                        {sd.buttonText || t('theme_cta_book')}
                                    </button>
                                </Link>
                                <a href="#services" onClick={(e) => scrollToSection(e, 'services')}>
                                    <button style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '18px 48px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: DS.radius, fontWeight: '800', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
                                        {t('theme_cta_services')}
                                    </button>
                                </a>
                            </div>
                        </div>
                    </header>
                );

            case 'services':
                return (
                    <section key={section.id} id="services" style={sectionWrapperStyle}>
                        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                                <span style={{ color: DS.accent, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem' }}>{t('theme_service_specialties_title')}</span>
                                <h2 style={{ fontSize: '3rem', fontWeight: '900', marginTop: '12px' }}>{sd.title || t('theme_nav_services')}</h2>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
                                {(siteData.appointmentSettings?.services || []).map(s => {
                                    const ServiceIcon = getServiceIcon(s.name, s.icon);
                                    return (
                                        <div key={s.id} style={{ background: 'white', padding: '40px', borderRadius: DS.radius, boxShadow: DS.shadow, color: DS.text, border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ width: '60px', height: '60px', background: DS.primary + '10', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: DS.primary, marginBottom: '24px' }}>
                                                <ServiceIcon size={30} />
                                            </div>
                                            <h3 style={{ fontWeight: '800', fontSize: '1.5rem', marginBottom: '16px' }}>{s.name}</h3>
                                            <p style={{ opacity: 0.7, marginBottom: '24px', flex: 1, lineHeight: 1.6 }}>{s.description}</p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                                                <div style={{ fontWeight: '900', fontSize: '1.4rem', color: DS.primary }}>{Number(s.price).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                                                <Link to={`/booking?service=${s.id}`} style={{ color: DS.accent, fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    {t('theme_cta_book')} <ChevronRight size={16} />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                );

            case 'pricing':
                return (
                    <section key={section.id} id="pricing" style={sectionWrapperStyle}>
                        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                                <h2 style={{ fontSize: '3rem', fontWeight: '900' }}>{sd.title || t('pricing_plans')}</h2>
                                {sd.subtitle && <p style={{ opacity: 0.7, marginTop: '12px' }}>{sd.subtitle}</p>}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                                {(sd.items || []).map((plan, i) => (
                                    <div key={i} style={{ background: 'white', padding: '48px', borderRadius: DS.radius, border: '1px solid #f1f5f9', boxShadow: DS.shadow, textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', textTransform: 'uppercase', color: DS.primary, marginBottom: '12px' }}>{plan.name}</h3>
                                        <div style={{ marginBottom: '32px' }}>
                                            <span style={{ fontSize: '3.5rem', fontWeight: '900' }}>€{plan.price}</span>
                                            <span style={{ opacity: 0.5 }}>/mt</span>
                                        </div>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', flex: 1 }}>
                                            {(plan.features || []).map((f, fi) => (
                                                <li key={fi} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', fontSize: '0.95rem' }}>
                                                    <CheckCircle size={18} color="#10b981" /> {f}
                                                </li>
                                            ))}
                                        </ul>
                                        <button style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: DS.primary, color: 'white', fontWeight: '800', cursor: 'pointer' }}>{t('choose_plan')}</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                );

            case 'faq':
                return (
                    <section key={section.id} id="faq" style={sectionWrapperStyle}>
                        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                                <h2 style={{ fontSize: '3rem', fontWeight: '900' }}>{sd.title || t('faq')}</h2>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {(sd.items || []).map((item, i) => (
                                    <details key={i} style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9', cursor: 'pointer' }}>
                                        <summary style={{ fontWeight: '800', fontSize: '1.1rem', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            {item.q} <ChevronDown size={20} />
                                        </summary>
                                        <p style={{ marginTop: '16px', opacity: 0.7, lineHeight: 1.6 }}>{item.a}</p>
                                    </details>
                                ))}
                            </div>
                        </div>
                    </section>
                );

            case 'testimonials':
                return (
                    <section key={section.id} style={sectionWrapperStyle}>
                        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                                <h2 style={{ fontSize: '3rem', fontWeight: '900' }}>{sd.title || t('customer_love')}</h2>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
                                {(sd.items || []).map((item, i) => (
                                    <div key={i} style={{ background: 'white', padding: '40px', borderRadius: DS.radius, border: '1px solid #f1f5f9', boxShadow: DS.shadow }}>
                                        <Quote size={40} color={DS.primary + '30'} style={{ marginBottom: '24px' }} />
                                        <p style={{ fontSize: '1.1rem', fontStyle: 'italic', marginBottom: '32px', lineHeight: 1.7 }}>"{item.quote}"</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eee' }}></div>
                                            <div>
                                                <h4 style={{ margin: 0, fontWeight: '800' }}>{item.author}</h4>
                                                <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill={DS.accent} color={DS.accent} />)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                );

            case 'stats':
                return (
                    <section key={section.id} style={{ ...sectionWrapperStyle, background: DS.primary, color: 'white' }}>
                        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', textAlign: 'center' }}>
                            {(sd.items || []).map((item, i) => (
                                <div key={i}>
                                    <div style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '8px' }}>{item.value}</div>
                                    <div style={{ fontSize: '1rem', fontWeight: '700', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                );

            case 'gallery':
                return (
                    <section key={section.id} id="gallery" style={sectionWrapperStyle}>
                        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                                <h2 style={{ fontSize: '3rem', fontWeight: '900' }}>{sd.title || t('gallery_section')}</h2>
                                {sd.subtitle && <p style={{ opacity: 0.7, marginTop: '12px' }}>{sd.subtitle}</p>}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                                {(sd.items || sd.images || []).map((img, i) => (
                                    <div key={i} style={{ height: '350px', borderRadius: DS.radius, overflow: 'hidden', boxShadow: DS.shadow, position: 'relative', cursor: 'pointer' }}>
                                        <img src={img.url || 'https://images.unsplash.com/photo-1541888941297-1f2048482f0c?auto=format&fit=crop&q=60&w=600'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Gallery Item" />
                                        {img.title && (
                                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', color: 'white' }}>
                                                <h4 style={{ margin: 0 }}>{img.title}</h4>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                );

            case 'features':
                return (
                    <section key={section.id} id="features" style={sectionWrapperStyle}>
                        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                                <h2 style={{ fontSize: '3rem', fontWeight: '900' }}>{sd.title || t('theme_section_features')}</h2>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
                                {(sd.items || []).map((item, i) => (
                                    <div key={i} style={{ textAlign: 'center', background: 'white', padding: '40px', borderRadius: DS.radius, border: '1px solid #f1f5f9', boxShadow: DS.shadow }}>
                                        <div style={{ width: '80px', height: '80px', background: DS.accent + '15', color: DS.accent, borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                            <Sparkles size={40} />
                                        </div>
                                        <h3 style={{ fontWeight: '800', marginBottom: '16px', fontSize: '1.5rem' }}>{item.title || 'Feature ' + (i + 1)}</h3>
                                        <p style={{ opacity: 0.7, lineHeight: 1.6 }}>{item.description || 'Description of the amazing feature provided by our company.'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                );

            case 'about':
            case 'text':
                return (
                    <section key={section.id} id={section.id} style={sectionWrapperStyle}>
                        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                            <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '32px' }}>{sd.title || t('theme_nav_about')}</h2>
                            <div style={{ fontSize: '1.2rem', lineHeight: '1.8', opacity: 0.8 }} dangerouslySetInnerHTML={{ __html: sd.content || sd.text }}></div>
                        </div>
                    </section>
                );

            default: return null;
        }
    };

    return (
        <div style={{ fontFamily: DS.fontPrimary, background: DS.bg, color: DS.text, minHeight: '100vh', overflowX: 'hidden' }}>
            {/* SEO & Meta Tags (Simplified for React context) */}
            <title>{config?.seo?.title || profile?.companyName}</title>

            {/* Custom CSS Injection */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap');
                
                :root {
                    --primary: ${DS.primary};
                    --accent: ${DS.accent};
                    --radius: ${DS.radius};
                }

                h1, h2, h3, h4, h5, h6 {
                    font-family: ${DS.fontHeader};
                }

                ${config?.advanced?.customCss || ''}
                
                * { transition: background-color 0.3s, border-color 0.3s; }
            `}</style>

            {/* Advanced Scripts */}
            {config?.advanced?.headScripts && <div dangerouslySetInnerHTML={{ __html: config.advanced.headScripts }} style={{ display: 'none' }} />}

            {/* Top Bar */}
            <div style={{ background: DS.primary, color: 'rgba(255,255,255,0.7)', padding: '12px 24px', fontSize: '0.85rem', fontWeight: '500' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={14} style={{ color: DS.accent }} /> {t('theme_working_hours')}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={14} style={{ color: DS.accent }} /> {profile?.city}, {profile?.country || 'DE'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        {profile?.phone && <span style={{ fontWeight: '700', color: 'white' }}>{profile.phone}</span>}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid ' + DS.border, position: 'sticky', top: 0, zIndex: 1000 }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {profile?.logo ? (
                            <img src={profile.logo} alt="Logo" style={{ height: '50px', objectFit: 'contain' }} />
                        ) : (
                            <div style={{ width: '44px', height: '44px', background: DS.primary, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <Briefcase size={22} />
                            </div>
                        )}
                        <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: DS.primary, textTransform: 'uppercase', margin: 0, letterSpacing: '-0.5px' }}>{profile?.companyName}</h1>
                    </div>
                    <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                        {!isMobile && (
                            <>
                                <a href="#home" onClick={(e) => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ textDecoration: 'none', color: DS.text, fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>{t('theme_nav_home')}</a>
                                <a href="#services" onClick={(e) => scrollToSection(e, 'services')} style={{ textDecoration: 'none', color: DS.text, fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>{t('theme_nav_services')}</a>
                            </>
                        )}
                        <button onClick={() => setIsCartOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '8px' }}>
                            <ShoppingBag size={24} color={DS.primary} />
                            {cart.length > 0 && <span style={{ position: 'absolute', top: 2, right: 2, background: DS.accent, color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>{cart.length}</span>}
                        </button>
                        {currentUser ? (
                            <button onClick={() => setIsCustomerPanelOpen(true)} style={{ background: DS.primary, color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>{t('theme_nav_account')}</button>
                        ) : (
                            <Link to="/login" style={{ textDecoration: 'none' }}><button style={{ background: DS.primary, color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>{t('theme_nav_login')}</button></Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Dynamic Sections Content */}
            <main>
                {sections.length > 0 ? (
                    sections.map(renderSection)
                ) : (
                    <div style={{ padding: '100px 24px', textAlign: 'center' }}>
                        <p>{t('site_no_content') || 'Kein Inhalt verfügbar. Bitte fügen Sie Sektionen im Editor hinzu.'}</p>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer style={{ background: DS.primary, color: 'white', padding: '100px 24px 60px' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '60px' }}>
                    <div>
                        <h4 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '24px' }}>{profile?.companyName}</h4>
                        <p style={{ opacity: 0.6, lineHeight: 1.8, marginBottom: '32px' }}>{config?.footer?.description || t('theme_footer_desc')}</p>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <Instagram size={20} style={{ opacity: 0.6 }} />
                            <Facebook size={20} style={{ opacity: 0.6 }} />
                            <Linkedin size={20} style={{ opacity: 0.6 }} />
                        </div>
                    </div>
                    <div>
                        <h4 style={{ fontWeight: '800', marginBottom: '24px', textTransform: 'uppercase', fontSize: '0.9rem' }}>{t('theme_nav_contact')}</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <MapPin size={20} color={DS.accent} />
                                <span style={{ opacity: 0.7 }}>{profile?.street} {profile?.houseNum}, {profile?.city}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Phone size={20} color={DS.accent} />
                                <span style={{ opacity: 0.7 }}>{profile?.phone}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Mail size={20} color={DS.accent} />
                                <span style={{ opacity: 0.7 }}>{profile?.email}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 style={{ fontWeight: '800', marginBottom: '24px', textTransform: 'uppercase', fontSize: '0.9rem' }}>{t('footer_working_hours')}</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                                const isOpen = siteData.appointmentSettings?.workingDays?.includes(day);
                                return (
                                    <div key={day} style={{ display: 'flex', justifyContent: 'space-between', opacity: isOpen ? 1 : 0.3 }}>
                                        <span>{t('day_' + day.toLowerCase())}</span>
                                        <span>{isOpen ? '09:00 - 18:00' : t('day_closed')}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div style={{ maxWidth: '1280px', margin: '80px auto 0', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', opacity: 0.5, fontSize: '0.85rem' }}>
                    &copy; {new Date().getFullYear()} {profile?.companyName}. {t('theme_footer_rights')}
                </div>
            </footer>
        </div>
    );
};

export default ServiceTheme;
