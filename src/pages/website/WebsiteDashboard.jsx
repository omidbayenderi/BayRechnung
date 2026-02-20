import React, { useState } from 'react';
import { useWebsite } from '../../context/WebsiteContext';
import { useLanguage } from '../../context/LanguageContext';
import { useStock } from '../../context/StockContext';
import { useInvoice } from '../../context/InvoiceContext';
import {
    Layout, Globe, Edit3, Monitor, CheckCircle, BarChart2, Eye, Share2,
    ShoppingCart, Calendar, ArrowRight, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDnsInstructions } from '../../lib/domain_mapping';
import { Shield } from 'lucide-react';

const WebsiteDashboard = () => {
    const { siteConfig, sections, updateSection, updateSiteConfig, publishSite, unpublishSite } = useWebsite();
    const { t } = useLanguage();
    const { products } = useStock();
    const { companyProfile } = useInvoice();
    const navigate = useNavigate();

    // Stats Logic
    const activeProducts = products.filter(p => p.stock > 0).length;
    // Dynamic Site URL Logic
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const subDomain = companyProfile?.companyName?.toLowerCase().replace(/ /g, '-') || 'demo';

    // In production: tenant.bayrechnung.com
    // In local: localhost:5173/s/tenant
    const siteUrl = isLocalhost
        ? `${window.location.origin}/s/${subDomain}`
        : `https://${subDomain}.bayrechnung.com`;

    // Load font dynamically when it changes
    React.useEffect(() => {
        const fontFamily = siteConfig.theme?.fontFamily || '"Inter", sans-serif';
        const fontName = fontFamily.split(',')[0].replace(/"/g, '');
        const systemFonts = ['sans-serif', 'serif', 'monospace', 'cursive'];
        if (systemFonts.includes(fontName.toLowerCase())) return;

        const linkId = 'dashboard-google-font';
        let link = document.getElementById(linkId);
        if (!link) {
            link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@300;400;500;600;700;800;900&display=swap`;
    }, [siteConfig.theme?.fontFamily]);

    return (
        <div className="page-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header Area */}
            <header style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                        <Globe size={32} color="var(--primary)" />
                        {t('websiteManager') || 'Website Manager'}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                        {t('websiteDesc') || 'Introduce your business and sell products online.'}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    {siteConfig.isPublished ? (
                        <button
                            className="secondary-btn"
                            onClick={() => window.open(siteUrl, '_blank')}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white' }}
                        >
                            <ExternalLink size={18} />
                            {t('view_site') || 'View Site'}
                        </button>
                    ) : null}

                    <button
                        className={siteConfig.isPublished ? 'secondary-btn' : 'primary-btn'}
                        onClick={siteConfig.isPublished ? unpublishSite : publishSite}
                        style={{
                            background: siteConfig.isPublished ? '#fee2e2' : 'var(--primary)',
                            color: siteConfig.isPublished ? '#ef4444' : 'white',
                            borderColor: siteConfig.isPublished ? '#fecaca' : 'transparent',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                    >
                        {siteConfig.isPublished ? <Eye size={18} /> : <Share2 size={18} />}
                        {siteConfig.isPublished ? (t('unpublish') || 'Unpublish') : (t('publishLive') || 'Publish Live')}
                    </button>
                </div>
            </header>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {/* Status Card */}
                <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: `6px solid ${siteConfig.isPublished ? '#10b981' : '#f59e0b'}` }}>
                    <div style={{ padding: '16px', borderRadius: '50%', background: siteConfig.isPublished ? '#ecfdf5' : '#fffbeb', color: siteConfig.isPublished ? '#10b981' : '#f59e0b' }}>
                        {siteConfig.isPublished ? <CheckCircle size={32} /> : <Edit3 size={32} />}
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{siteConfig.isPublished ? (t('siteLive') || 'Live') : (t('siteDraft') || 'Draft')}</h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            {siteConfig.isPublished ? `${t('lastUpdate') || 'Last Update'}: ${t('just_now') || 'Just now'}` : (t('notVisibleYet') || 'Not visible yet')}
                        </p>
                    </div>
                </div>

                {/* Content Health */}
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>{t('content_status') || 'Content Status'}</span>
                        <BarChart2 size={20} color="var(--primary)" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ShoppingCart size={14} /> {t('label_products') || 'Products'}</span>
                            <span style={{ fontWeight: 'bold' }}>{activeProducts} {t('active') || 'Active'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {t('label_services') || 'Services'}</span>
                            <span style={{ fontWeight: 'bold' }}>{t('automatic') || 'Automatic'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Layout size={14} /> {t('label_pages') || 'Pages'}</span>
                            <span style={{ fontWeight: 'bold' }}>{sections.filter(s => s.visible).length} {t('section_unit') || 'Section(s)'}</span>
                        </div>
                    </div>
                </div>

                {/* Traffic / Analytics Status */}
                <div className="card" style={{ padding: '24px', background: siteConfig.analyticsId ? '#f0fdf4' : '#fffbeb', border: siteConfig.analyticsId ? '1px solid #bbf7d0' : '1px solid #fde68a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span style={{ fontWeight: '600', color: siteConfig.analyticsId ? '#15803d' : '#b45309' }}>
                            {siteConfig.analyticsId ? 'Google Analytics' : (t('visitors_month') || 'Monthly Visitors')}
                        </span>
                        <BarChart2 size={20} color={siteConfig.analyticsId ? '#16a34a' : '#d97706'} />
                    </div>

                    {siteConfig.analyticsId ? (
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', lineHeight: 1, color: '#166534', marginBottom: '8px' }}>{t('status_active') || 'Active'}</div>
                            <div style={{ fontSize: '0.85rem', color: '#15803d', fontFamily: 'monospace' }}>{siteConfig.analyticsId}</div>
                            <a
                                href="https://analytics.google.com/"
                                target="_blank"
                                rel="noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '12px', fontSize: '0.85rem', color: '#15803d', fontWeight: '600', textDecoration: 'none' }}
                            >
                                {t('go_to_report') || 'Go to Report'} <ExternalLink size={12} />
                            </a>
                        </div>
                    ) : (
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: '800', lineHeight: 1, color: '#92400e' }}>---</div>
                            <button
                                onClick={() => navigate('/website/settings')}
                                style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.85rem', color: '#b45309', marginTop: '8px', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                {t('analytics_pending') || 'Setup Required'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Domain Management Area */}
            <div className="card" style={{ marginBottom: '40px', padding: '32px', border: '1px solid var(--primary-light)', background: 'linear-gradient(to right, #fff, #f0f7ff)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Globe size={20} color="var(--primary)" />
                            Özel Alan Adı Bağla
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                            Kendi alan adınızı (örneğin: www.firmaniz.com) bu siteye bağlayarak profesyonel bir görünüm kazanın.
                        </p>

                        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                            <input
                                type="text"
                                placeholder="örneğin: www.firmaniz.com"
                                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.95rem' }}
                            />
                            <button className="primary-btn" style={{ whiteSpace: 'nowrap' }}>Bağla</button>
                        </div>
                    </div>

                    <div style={{ flex: 1, minWidth: '300px', background: 'rgba(255,255,255,0.5)', padding: '20px', borderRadius: '16px', border: '1px solid white' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Shield size={16} /> DNS Ayarları
                        </h3>
                        <div style={{ fontSize: '0.85rem' }}>
                            {getDnsInstructions('example.com').map((dns, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: idx < 1 ? '1px solid var(--border)' : 'none' }}>
                                    <span style={{ fontWeight: '600', color: 'var(--primary)', width: '60px' }}>{dns.type}</span>
                                    <span style={{ color: 'var(--text-muted)' }}>{dns.name}</span>
                                    <span style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>{dns.value}</span>
                                </div>
                            ))}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '16px', fontStyle: 'italic' }}>
                            * Değişikliklerin aktif olması 24-48 saat sürebilir.
                        </p>
                    </div>
                </div>
            </div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>{t('management_edit') || 'Management & Edit'}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                <ActionCard
                    t={t}
                    title={t('edit_content') || 'Edit Content'}
                    desc={t('edit_content_desc') || 'Update your site sections and text.'}
                    icon={Edit3}
                    color="#3b82f6"
                    onClick={() => navigate('/website/editor')}
                />
                <ActionCard
                    t={t}
                    title={t('domain_seo') || 'Domain & SEO'}
                    desc={t('domain_seo_desc') || 'Connect your domain and optimize for Google.'}
                    icon={Globe}
                    color="#8b5cf6"
                    onClick={() => navigate('/website/settings')}
                />
                <ActionCard
                    t={t}
                    title={t('theme_colors') || 'Theme & Colors'}
                    desc={t('theme_colors_desc') || 'Pick your theme and primary colors.'}
                    icon={Monitor}
                    color="#10b981"
                    onClick={() => navigate('/website/settings')}
                />
            </div>

            {/* Preview Section */}
            <div style={{ marginTop: '40px', padding: '32px', background: '#f8fafc', borderRadius: '24px', textAlign: 'center', border: '2px dashed var(--border)' }}>
                <h3 style={{ marginTop: 0 }}>{t('live_preview') || 'Live Preview'}</h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 24px auto' }}>
                    {t('currently_viewing_as') || 'Currently viewing as'} <strong>{siteConfig.theme?.mode === 'dark' ? (t('dark_mode') || 'Dark') : (t('light_mode') || 'Light')}</strong> {t('mode_with_accent') || 'mode with accent'}
                    <strong> {siteConfig.theme?.primaryColor || '#3b82f6'}</strong> {t('and_font' || 'and font')} <strong>{siteConfig.theme?.fontFamily?.split(',')[0].replace(/"/g, '') || 'Inter'}</strong>.
                </p>

                <div style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    height: '400px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 20px 50px -12px rgba(0,0,0,0.25)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                }}>
                    {/* Fake Browser Header */}
                    <div style={{ height: '32px', background: '#e2e8f0', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '6px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></div>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></div>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }}></div>
                        <div style={{ flex: 1, textAlign: 'center', fontSize: '10px', color: '#64748b', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                            <span>{siteUrl.replace('https://', '')}</span>
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>EN ▾</div>
                    </div>

                    {/* Simple Content Preview */}
                    <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: siteConfig.theme?.fontFamily }}>
                        <h1 style={{ fontSize: '2rem', marginBottom: '12px', color: 'var(--text-main)', fontFamily: 'inherit' }}>{companyProfile?.companyName || 'Your Business'}</h1>
                        <p style={{ fontFamily: 'inherit' }}>{companyProfile?.industry ? `${t(companyProfile.industry)} ${t('expert' || 'Expert')}` : (t('professional_services' || 'Professional Services'))}</p>
                        <button style={{ marginTop: '20px', padding: '10px 24px', background: siteConfig.theme?.primaryColor || '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontFamily: 'inherit' }}>
                            {t('book_now') || 'Book Now'}
                        </button>
                    </div>

                    {/* Overlay for Action */}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <button
                            className="primary-btn"
                            style={{ boxShadow: '0 10px 25px rgba(59, 130, 246, 0.5)' }}
                            onClick={() => navigate('/website/editor')}
                        >
                            <Edit3 size={18} /> {t('edit_content') || 'Edit Content'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ActionCard = ({ title, desc, icon: Icon, color, onClick, t }) => (
    <div
        className="card action-card"
        onClick={onClick}
        style={{ padding: '24px', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', border: '1px solid transparent' }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = color; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'transparent'; }}
    >
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, marginBottom: '16px' }}>
            <Icon size={24} />
        </div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>{title}</h3>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{desc}</p>
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: color, fontWeight: '600' }}>
            {t('action_go') || 'Go'} <ArrowRight size={14} />
        </div>
    </div>
);

export default WebsiteDashboard;
