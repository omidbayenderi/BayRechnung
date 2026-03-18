
import React, { useState } from 'react';
import { 
    Check, ChevronDown, Star, ArrowRight, Minus, Plus, 
    Image as ImageIcon, Zap, Shield, Heart, Share2, 
    ExternalLink, CreditCard, HelpCircle, MessageSquare,
    TrendingUp, Users, Award, Target
} from 'lucide-react';

/**
 * ModularSections - A shared library for rendering premium website sections
 * Handles: GALLERY, FEATURES, PRICING, FAQ, TESTIMONIALS, STATS
 */

// 1. Gallery Section
export const GallerySection = ({ data, DS, t, isMobile }) => {
    const images = data.images || [];
    const [activeImage, setActiveImage] = useState(null);

    return (
        <div style={{ padding: isMobile ? '40px 0' : '60px 0' }}>
            {data.title && (
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: isMobile ? '2rem' : '3rem', fontWeight: '900', marginBottom: '16px', color: DS.text }}>
                        {data.title}
                    </h2>
                    {data.description && <p style={{ color: DS.textSecondary, maxWidth: '700px', margin: '0 auto', opacity: 0.8 }}>{data.description}</p>}
                </div>
            )}
            
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '24px' 
            }}>
                {images.length > 0 ? images.map((img, i) => (
                    <div 
                        key={i} 
                        onClick={() => setActiveImage(img.url)}
                        style={{ 
                            height: '300px', 
                            borderRadius: DS.radius, 
                            overflow: 'hidden', 
                            position: 'relative',
                            cursor: 'pointer',
                            boxShadow: DS.shadow,
                            transition: 'transform 0.3s ease'
                        }}
                    >
                        <img 
                            src={img.url} 
                            alt={img.caption || 'Gallery'} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                        {img.caption && (
                            <div style={{ 
                                position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                                display: 'flex', alignItems: 'flex-end', padding: '20px', color: 'white'
                            }}>
                                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{img.caption}</span>
                            </div>
                        )}
                    </div>
                )) : (
                    <div style={{ 
                        gridColumn: '1 / -1', padding: '80px', background: DS.surfaceSecondary, 
                        borderRadius: DS.radius, textAlign: 'center', color: DS.textSecondary 
                    }}>
                        <ImageIcon size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                        <p>{t('no_images_yet') || 'Henüz görsel eklenmemiş'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// 2. Features Section
export const FeaturesSection = ({ data, DS, isMobile }) => {
    const features = data.features || [];
    
    return (
        <div style={{ padding: isMobile ? '40px 0' : '60px 0' }}>
            {data.title && (
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{ fontSize: isMobile ? '2.5rem' : '3.5rem', fontWeight: '900', color: DS.text }}>{data.title}</h2>
                    {data.subtitle && <p style={{ color: DS.textSecondary, marginTop: '16px', fontSize: '1.2rem' }}>{data.subtitle}</p>}
                </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                {features.map((f, i) => (
                    <div key={i} style={{ 
                        padding: '40px', background: DS.surface, borderRadius: DS.radius, 
                        border: '1px solid ' + DS.border, boxShadow: DS.shadow,
                        transition: 'transform 0.3s ease'
                    }}>
                        <div style={{ width: '60px', height: '60px', background: DS.primary + '15', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: DS.primary, marginBottom: '24px' }}>
                            <Zap size={28} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '16px', color: DS.text }}>{f.title}</h3>
                        <p style={{ color: DS.textSecondary, lineHeight: 1.7, fontSize: '1rem' }}>{f.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 3. Pricing Section
export const PricingSection = ({ data, DS, isMobile, currency = '€' }) => {
    const plans = data.plans || [];
    
    return (
        <div style={{ padding: isMobile ? '40px 0' : '80px 0' }}>
            {data.title && (
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{ fontSize: isMobile ? '2.5rem' : '3.5rem', fontWeight: '900', color: DS.text }}>{data.title}</h2>
                </div>
            )}
            
            <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                {plans.map((p, i) => (
                    <div key={i} style={{ 
                        flex: isMobile ? '1 1 100%' : '1 1 350px', maxWidth: '400px',
                        background: p.highlight ? DS.primary : DS.surface, 
                        color: p.highlight ? 'white' : DS.text,
                        padding: '48px', borderRadius: DS.radius, 
                        border: '1px solid ' + DS.border, 
                        boxShadow: p.highlight ? '0 25px 50px -12px ' + DS.primary + '40' : DS.shadow,
                        position: 'relative',
                        transform: p.highlight ? 'scale(1.05)' : 'scale(1)',
                        zIndex: p.highlight ? 2 : 1
                    }}>
                        {p.highlight && <div style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800' }}>POPÜLER</div>}
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px', opacity: p.highlight ? 0.9 : 0.6 }}>{p.name}</h3>
                        <div style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '32px' }}>{p.price}<span style={{ fontSize: '1rem', fontWeight: '600' }}>{currency}</span></div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                            {(p.features || []).map((feat, fi) => (
                                <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem' }}>
                                    <Check size={18} color={p.highlight ? 'white' : DS.primary} strokeWidth={3} />
                                    <span>{feat}</span>
                                </div>
                            ))}
                        </div>
                        
                        <button style={{ 
                            width: '100%', padding: '16px', borderRadius: '12px', border: 'none', 
                            background: p.highlight ? 'white' : DS.primary, 
                            color: p.highlight ? DS.primary : 'white', 
                            fontWeight: '800', cursor: 'pointer' 
                        }}>{p.cta}</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 4. FAQ Section
export const FAQSection = ({ data, DS, isMobile }) => {
    const questions = data.questions || [];
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <div style={{ padding: isMobile ? '40px 0' : '60px 0', maxWidth: '800px', margin: '0 auto' }}>
            {data.title && <h2 style={{ fontSize: isMobile ? '2rem' : '3rem', fontWeight: '900', textAlign: 'center', marginBottom: '48px', color: DS.text }}>{data.title}</h2>}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {questions.map((q, i) => (
                    <div key={i} style={{ 
                        background: DS.surface, borderRadius: isMobile ? '16px' : '24px', 
                        overflow: 'hidden', border: '1px solid ' + DS.border, boxShadow: DS.shadow 
                    }}>
                        <button 
                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                            style={{ 
                                width: '100%', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', 
                                alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                                color: DS.text, fontWeight: '700', fontSize: '1.2rem'
                            }}
                        >
                            <span>{q.q}</span>
                            <div style={{ transition: 'transform 0.3s', transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0)' }}><ChevronDown /></div>
                        </button>
                        {openIndex === i && (
                            <div style={{ padding: '0 32px 32px', color: DS.textSecondary, lineHeight: 1.7, fontSize: '1.05rem' }}>
                                {q.a}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// 5. Testimonials Section
export const TestimonialsSection = ({ data, DS, isMobile }) => {
    const reviews = data.reviews || [];
    
    return (
        <div style={{ padding: isMobile ? '40px 0' : '60px 0' }}>
            {data.title && <h2 style={{ fontSize: isMobile ? '2.5rem' : '3.5rem', fontWeight: '900', textAlign: 'center', marginBottom: '60px', color: DS.text }}>{data.title}</h2>}
            
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
                {reviews.map((r, i) => (
                    <div key={i} style={{ 
                        background: DS.surface, padding: '40px', borderRadius: DS.radius, 
                        border: '1px solid ' + DS.border, boxShadow: DS.shadow, position: 'relative' 
                    }}>
                        <div style={{ display: 'flex', gap: '4px', color: '#fbbf24', marginBottom: '24px' }}>
                            {[...Array(5)].map((_, si) => <Star key={si} size={18} fill={si < (r.rating || 5) ? '#fbbf24' : 'none'} />)}
                        </div>
                        <p style={{ fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '32px', fontStyle: 'italic', color: DS.text }}>"{r.text}"</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {r.image ? (
                                <img src={r.image} alt={r.author} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '56px', height: '56px', background: DS.primary + '20', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: DS.primary }}><Users size={24} /></div>
                            )}
                            <div>
                                <div style={{ fontWeight: '800', color: DS.text }}>{r.author}</div>
                                <div style={{ fontSize: '0.85rem', color: DS.textSecondary, fontWeight: '600' }}>{r.role}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 6. Stats Section
export const StatsSection = ({ data, DS, isMobile }) => {
    const stats = data.stats || [];
    
    return (
        <div style={{ 
            padding: '80px 40px', background: DS.primary, borderRadius: DS.radius, 
            color: 'white', display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : `repeat(${Math.min(stats.length, 4)}, 1fr)`, 
            gap: '40px', textAlign: 'center' 
        }}>
            {stats.map((s, i) => (
                <div key={i}>
                    <div style={{ fontSize: isMobile ? '3rem' : '4rem', fontWeight: '900', marginBottom: '8px' }}>{s.value}</div>
                    <div style={{ fontSize: '1rem', fontWeight: '700', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</div>
                </div>
            ))}
        </div>
    );
};

// 7. About Section (Standard Content)
export const AboutSection = ({ data, DS, isMobile }) => {
    return (
        <div style={{ 
            padding: isMobile ? '60px 0' : '100px 0', 
            display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
            gap: '80px', alignItems: 'center' 
        }}>
            {data.image && (
                <div style={{ 
                    position: 'relative', height: isMobile ? '300px' : '500px', 
                    borderRadius: DS.radius, overflow: 'hidden', boxShadow: DS.shadow 
                }}>
                    <img src={data.image} alt="About Us" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            )}
            <div style={{ order: (isMobile || !data.image) ? 0 : (data.imagePosition === 'right' ? -1 : 0) }}>
                <h2 style={{ fontSize: isMobile ? '2.5rem' : '3.5rem', fontWeight: '900', marginBottom: '32px', color: DS.text, letterSpacing: '-1px' }}>{data.title}</h2>
                <div style={{ fontSize: '1.2rem', lineHeight: 1.8, color: DS.textSecondary }} dangerouslySetInnerHTML={{ __html: data.content }}></div>
                {data.cta && (
                    <button style={{ 
                        marginTop: '40px', padding: '18px 40px', borderRadius: DS.radius, 
                        background: DS.primary, color: 'white', border: 'none', 
                        fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' 
                    }}>
                        {data.cta} <ArrowRight size={20} />
                    </button>
                )}
            </div>
        </div>
    );
};

// Main dispatcher
export const ModularSection = (props) => {
    const type = props.section.type.toLowerCase();
    const data = props.section.data || {};
    
    switch(type) {
        case 'gallery': return <GallerySection {...props} data={data} />;
        case 'features': return <FeaturesSection {...props} data={data} />;
        case 'pricing': return <PricingSection {...props} data={data} />;
        case 'faq': return <FAQSection {...props} data={data} />;
        case 'testimonials': return <TestimonialsSection {...props} data={data} />;
        case 'stats': return <StatsSection {...props} data={data} />;
        case 'about': return <AboutSection {...props} data={data} />;
        default: return null;
    }
};
