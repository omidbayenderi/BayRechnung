import React, { useState } from 'react';
import { useWebsite } from '../../context/WebsiteContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
    Globe, Shield, Zap, Search, ChevronRight, 
    ExternalLink, BarChart2, CheckCircle, AlertCircle,
    Layout, Settings, History, Plus, Activity,
    TrendingUp, Users, Info, RefreshCw, Target,
    Edit2, Monitor, Rocket, MousePointer2, Link,
    Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WebsiteDashboard = () => {
    const { t } = useLanguage();
    const { currentUser } = useAuth();
    const { siteConfig, publishSite, unpublishSite, updateConfig } = useWebsite();
    const navigate = useNavigate();
    
    const [domain, setDomain] = useState(siteConfig?.domain || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveDomain = async () => {
        setIsSaving(true);
        await updateConfig({ domain });
        setIsSaving(false);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', padding: '40px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <Globe size={20} />
                            </div>
                            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>Website Manager</h1>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>Verwalten Sie Ihre Online-Präsenz und verkaufen Sie Produkte.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                            onClick={() => window.open(`https://${siteConfig?.slug}.bayzenit.com`, '_blank')}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}
                        >
                            <ExternalLink size={18} /> Website ansehen <span style={{ fontSize: '0.7rem', opacity: 0.6, background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px' }}>Vorschau</span>
                        </button>
                        <button 
                            onClick={siteConfig?.isPublished ? unpublishSite : publishSite}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '12px', border: 'none', background: '#2563eb', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
                        >
                            <Rocket size={18} /> {siteConfig?.isPublished ? 'Unpublish' : 'Veröffentlichen'}
                        </button>
                    </div>
                </header>

                {/* Top Statistics Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
                    <StatusCard 
                        icon={Edit2}
                        title={siteConfig?.isPublished ? "Live" : "Entwurf"}
                        subtitle={siteConfig?.isPublished ? "Site is live" : "Noch nicht sichtbar"}
                        color="#f59e0b"
                        isActive={!siteConfig?.isPublished}
                    />
                    <StatusCard 
                        icon={RefreshCw}
                        title="Sync Status"
                        subtitle={<div style={{ fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span><Users size={12} style={{ marginRight: '4px' }} /> Produkte</span>
                                <span style={{ fontWeight: '700' }}>3 Aktiv</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span><History size={12} style={{ marginRight: '4px' }} /> Dienstleistungen</span>
                                <span style={{ fontWeight: '700', color: '#10b981' }}>Live Sync</span>
                            </div>
                        </div>}
                        badge="Auto-Aktiv"
                        color="#3b82f6"
                    />
                    <StatusCard 
                        icon={BarChart2}
                        title="SEO & Analytics"
                        subtitle="Kurze SEO Beschreibung"
                        actionText="Jetzt einrichten"
                        color="#f97316"
                        showChart
                    />
                </div>

                {/* Domain Section */}
                <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '40px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '48px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <Globe size={24} style={{ color: '#3b82f6' }} />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Connect custom domain</h2>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '24px' }}>Domain desc</p>
                        
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <input 
                                type="text"
                                placeholder="www.firmaniz.com"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                style={{ flex: 1, padding: '12px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }}
                            />
                            <button 
                                onClick={handleSaveDomain}
                                disabled={isSaving}
                                style={{ padding: '12px 28px', borderRadius: '12px', background: '#2563eb', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                            >
                                {isSaving ? '...' : 'Speichern'}
                            </button>
                        </div>
                    </div>

                    <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <Shield size={16} />
                            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>DNS Ayarları</span>
                        </div>
                        <table style={{ width: '100%', fontSize: '0.85rem' }}>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '8px 0', color: '#2563eb', fontWeight: '700' }}>A</td>
                                    <td style={{ padding: '8px 0', textAlign: 'center' }}>@</td>
                                    <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600' }}>76.76.21.21</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px 0', color: '#2563eb', fontWeight: '700' }}>CNAME</td>
                                    <td style={{ padding: '8px 0', textAlign: 'center' }}>www</td>
                                    <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600' }}>cname.bayzenit.com</td>
                                </tr>
                            </tbody>
                        </table>
                        <p style={{ margin: '16px 0 0', fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                            * Değişikliklerin aktif olması 24-48 saat sürebilir.
                        </p>
                    </div>
                </div>

                {/* Management Grid */}
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '24px' }}>Verwaltung & Bearbeitung</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '64px' }}>
                    <ActionCard 
                        icon={MousePointer2}
                        title="Inhalt bearbeiten"
                        desc="Startseite und Texte ändern."
                        onClick={() => navigate('/website/editor')}
                        color="#3b82f6"
                    />
                    <ActionCard 
                        icon={Globe}
                        title="Domain & SEO"
                        desc="Google-Suche und Domain-Einstellungen."
                        onClick={() => navigate('/website/settings')}
                        color="#8b5cf6"
                    />
                    <ActionCard 
                        icon={Monitor}
                        title="Design & Farben"
                        desc="Wählen Sie ein Design, das zu Ihrer Marke passt."
                        onClick={() => navigate('/website/themes')}
                        color="#10b981"
                    />
                </div>

                {/* Dashboard Live Preview Section */}
                <div style={{ textAlign: 'center', marginBottom: '100px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px' }}>Live-Vorschau</h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '32px' }}>
                        Aktuelle Ansicht: <span style={{ fontWeight: '700', color: '#1e293b' }}>{siteConfig?.theme?.mode === 'dark' ? 'Dunkel' : 'Hell'}</span> Modus mit Akzent: <span style={{ fontWeight: '700', color: siteConfig?.theme?.primaryColor }}>{siteConfig?.theme?.primaryColor}</span> And font <span style={{ fontWeight: '700', color: '#1e293b' }}>{siteConfig?.theme?.fontBody?.replace(/"/g, '').split(',')[0]}</span>.
                    </p>

                    <div style={{ 
                        width: '100%', 
                        maxWidth: '900px', 
                        margin: '0 auto', 
                        aspectRatio: '16/10',
                        background: 'white',
                        borderRadius: '24px 24px 0 0',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                        border: '8px solid #f1f5f9',
                        borderBottom: 'none',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        {/* Browser Bar */}
                        <div style={{ height: '40px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '8px' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }} />
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }} />
                            </div>
                            <div style={{ flex: 1, margin: '0 20px', background: '#e2e8f0', height: '20px', borderRadius: '6px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                {siteConfig?.slug}.bayzenit.com
                            </div>
                            <div style={{ width: '40px' }} />
                        </div>

                        {/* Preview Content Mockup */}
                        <div style={{ height: 'calc(100% - 40px)', padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: siteConfig?.theme?.backgroundColor || 'white' }}>
                            <h3 style={{ fontSize: '3rem', fontWeight: '900', color: siteConfig?.theme?.textColor || '#1e293b', marginBottom: '24px' }}>Bayenderi</h3>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <button style={{ padding: '12px 24px', borderRadius: '12px', background: siteConfig?.theme?.primaryColor || '#3b82f6', color: 'white', border: 'none', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Activity size={18} /> Inhalt bearbeiten
                                </button>
                                <button style={{ padding: '12px 24px', borderRadius: '12px', background: 'white', color: '#475569', border: '1px solid #e2e8f0', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ExternalLink size={18} /> Open site
                                </button>
                            </div>
                            <div style={{ marginTop: '40px' }}>
                                <button style={{ padding: '10px 32px', borderRadius: '8px', background: siteConfig?.theme?.primaryColor || '#3b82f6', color: 'white', border: 'none', fontWeight: '700' }}>Jetzt buchen</button>
                            </div>
                            
                            <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '100px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', fontSize: '0.8rem', fontWeight: '700', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                                Auf Wolke aktuell
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatusCard = ({ icon: Icon, title, subtitle, badge, actionText, color, isActive, showChart }) => (
    <div style={{ background: 'white', padding: '28px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
        {isActive && <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: color }} />}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${color}10`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={24} />
            </div>
            {badge && <span style={{ fontSize: '0.7rem', color: color, background: `${color}10`, padding: '4px 10px', borderRadius: '100px', fontWeight: '800' }}>{badge}</span>}
            {showChart && <BarChart2 size={24} style={{ color }} />}
        </div>
        
        <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: '800' }}>{title}</h3>
        {typeof subtitle === 'string' ? <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>{subtitle}</p> : <div style={{ marginBottom: '16px' }}>{subtitle}</div>}
        
        {actionText && (
            <button style={{ padding: '6px 16px', borderRadius: '8px', border: `1px solid ${color}40`, background: 'white', color: color, fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}>
                {actionText}
            </button>
        )}
    </div>
);

const ActionCard = ({ icon: Icon, title, desc, onClick, color }) => (
    <motion.div 
        whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
        onClick={onClick}
        style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}
    >
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${color}10`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <Icon size={20} />
        </div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '800' }}>{title}</h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5' }}>{desc}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#3b82f6', fontSize: '0.85rem', fontWeight: '800' }}>
            Los <ChevronRight size={14} />
        </div>
    </motion.div>
);

export default WebsiteDashboard;

