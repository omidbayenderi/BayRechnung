import React, { useState, useMemo, useCallback } from 'react';
import { useWebsite } from '../../../context/WebsiteContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useInvoice } from '../../../context/InvoiceContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Layout, Eye, EyeOff, Trash2, PlusCircle, Monitor,
    Edit3, RefreshCw, ShoppingCart, ArrowLeft, ArrowRight,
    Type, Image as ImageIcon, List, FileText, CheckCircle,
    ChevronRight, Save, LayoutTemplate, X, Briefcase, Calendar, Map, Globe,
    ChevronDown, Plus, MessageSquare, Layers, Paperclip, Star, Hash, Settings, Palette,
    GripVertical, Smartphone, Tablet, Monitor as DesktopIcon, Sun, Moon, FileJson,
    Search, PlusSquare, PenTool, MoreHorizontal, HelpCircle, AlertCircle, Info,
    Sparkles, ShoppingBag
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PublicWebsite from '../../../pages/public/PublicWebsite';

// ─── GOOGLE FONTS LIST ───
const GOOGLE_FONTS = [
    'Inter', 'Outfit', 'Poppins', 'Montserrat', 'Roboto', 'Open Sans', 'Lato',
    'Raleway', 'Nunito', 'Playfair Display', 'Merriweather', 'Source Sans Pro',
    'Rubik', 'Work Sans', 'DM Sans', 'Manrope', 'Sora', 'Space Grotesk',
    'Plus Jakarta Sans', 'Figtree', 'Lexend', 'Urbanist', 'Quicksand',
    'Josefin Sans', 'Cabin', 'Mulish', 'Barlow', 'Karla', 'Libre Baskerville',
    'Crimson Text', 'PT Serif', 'Lora', 'Cormorant Garamond', 'Bitter',
    'Spectral', 'Noto Sans', 'IBM Plex Sans', 'Fira Sans', 'Archivo',
    'Red Hat Display', 'Albert Sans', 'Geist', 'Satoshi', 'General Sans',
    'Clash Display', 'Cabinet Grotesk', 'Switzer', 'Synonym', 'Erode'
];

const WebBuilderEditor = () => {
    const {
        sections, updateSection, toggleSectionVisibility,
        addSection, deleteSection, moveSection, siteConfig, updateSiteConfig,
        publishSite
    } = useWebsite();
    const { t } = useLanguage();
    const navigate = useNavigate();

    // UI State
    // React Router URL Search Params
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');

    // UI State
    const [activeTab, setActiveTab] = useState(tabParam || null);

    // Sync activeTab with URL tab parameter
    React.useEffect(() => {
        if (tabParam) {
            setActiveTab(tabParam);
        } else {
            // If no tab in URL, we could either clear activeTab or keep it.
            // But usually being on /website/editor without param means we show the elements tab by default or nothing.
        }
    }, [tabParam]);

    const handleTabChange = (newTab) => {
        if (newTab === activeTab) {
            // Toggle off if same tab clicked? Main sidebar handles navigation though.
            // If we want to allow closing the flyout:
            setSearchParams({});
            setActiveTab(null);
        } else {
            setSearchParams({ tab: newTab });
            setActiveTab(newTab);
        }
    };

    const [bgMode, setBgMode] = useState('light');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingSection, setEditingSection] = useState(null); // section id for modal
    const [editModalTab, setEditModalTab] = useState('content');
    const [previewMode, setPreviewMode] = useState('desktop'); // desktop, tablet, mobile
    const [draggedIdx, setDraggedIdx] = useState(null);
    const [activeEditorPagePath, setActiveEditorPagePath] = useState('/');

    // ─── SECTION TEMPLATES ───
    const SECTION_TEMPLATES = useMemo(() => [
        { type: 'hero', icon: <ImageIcon size={18} />, label: t('theme_section_hero') || 'Hero Banner', defaultData: { title: 'Welcome Home', subtitle: 'Modern solutions for your life.', buttonText: 'Explore More', overlay: 0.4 } },
        { type: 'text', icon: <FileText size={18} />, label: t('theme_section_text') || 'Text Section', defaultData: { title: 'New Section', content: 'Add your text here...' } },
        { type: 'about', icon: <Briefcase size={18} />, label: t('theme_section_about') || 'About Us', defaultData: { title: 'About Us', text: 'Tell your story...' } },
        { type: 'services', icon: <Calendar size={18} />, label: t('theme_section_services') || 'Services', defaultData: { title: 'Our Services', autoPull: true } },
        { type: 'products', icon: <ShoppingCart size={18} />, label: t('theme_section_products') || 'Products', defaultData: { title: 'Our Products', autoPull: true } },
        { type: 'contact', icon: <Map size={18} />, label: t('theme_section_contact') || 'Contact Us', defaultData: { title: 'Contact Us', showMap: true } },
        { type: 'gallery', icon: <ImageIcon size={18} />, label: t('theme_section_gallery') || 'Gallery', defaultData: { title: 'Gallery', images: [] } },
        { type: 'blog', icon: <MessageSquare size={18} />, label: t('theme_section_blog') || 'Blog', defaultData: { title: 'Latest News', posts: [] } },
        { type: 'features', icon: <Layers size={18} />, label: t('theme_section_features') || 'Features', defaultData: { title: 'Our Features', items: [{ title: 'Feature 1', description: 'Desc...' }] } },
        { type: 'pricing', icon: <Palette size={18} />, label: t('theme_section_pricing') || 'Pricing', defaultData: { title: 'Pricing Plans', items: [{ name: 'Basic', price: '29', features: ['Feature 1'] }] } },
        { type: 'faq', icon: <List size={18} />, label: t('theme_section_faq') || 'FAQ', defaultData: { title: 'Frequently Asked Questions', items: [{ q: 'How it works?', a: 'Answer here...' }] } },
        { type: 'testimonials', icon: <Star size={18} />, label: t('theme_section_testimonials') || 'Testimonials', defaultData: { title: 'Customer Love', items: [{ author: 'John Doe', quote: 'Amazing service!' }] } },
        { type: 'stats', icon: <Hash size={18} />, label: t('theme_section_stats') || 'Stats', defaultData: { items: [{ label: 'Happy Customers', value: '1000+' }] } }
    ], [t]);

    // ─── MAIN NAV ITEMS (Integrated into Sidebar) ───

    // ─── HANDLERS ───
    const handleAddSection = useCallback((template, index = -1) => {
        let profile = {};
        try {
            profile = JSON.parse(localStorage.getItem('bay_profile') || '{}');
        } catch (e) {
            console.error("Profile parse error", e);
        }
        const industry = siteConfig?.businessCategory || profile.industry || 'Business';

        let aiData = { ...template.defaultData };

        if (template.type === 'hero') {
            aiData.title = profile.companyName ? `Welcome to ${profile.companyName}` : aiData.title;
            aiData.subtitle = profile.description || `Providing world-class ${industry} services with excellence.`;
        } else if (template.type === 'features' && profile.description) {
            aiData.title = `Why Choose Our ${industry} Experts?`;
        }

        const newSection = {
            id: template.type + '_' + Math.random().toString(36).substr(2, 9),
            type: template.type.toUpperCase(),
            visible: true,
            data: { ...aiData, style: { backgrounds: { light: { type: 'color', value: 'default' }, dark: { type: 'color', value: 'default' } }, padding: 'normal' } }
        };
        addSection(newSection, index);
        setShowAddModal(false);
    }, [addSection, siteConfig.businessCategory]);

    const handleDeleteSection = useCallback((id) => {
        if (window.confirm(t('delete_section_confirm') || 'Bu bölümü silmek istediğinize emin misiniz?')) {
            deleteSection(id);
            if (editingSection === id) setEditingSection(null);
        }
    }, [deleteSection, editingSection, t]);

    const openSectionEditor = useCallback((sectionId) => {
        setEditingSection(sectionId);
        setEditModalTab('content');
    }, []);

    const activeSection = useMemo(() => sections.find(s => s.id === editingSection), [sections, editingSection]);

    // ─── DRAG AND DROP ───
    const handleDragStart = useCallback((idx) => setDraggedIdx(idx), []);
    const handleDragOver = useCallback((e) => e.preventDefault(), []);
    const handleDrop = useCallback((dropIdx) => {
        if (draggedIdx === null || draggedIdx === dropIdx) return;
        const dir = dropIdx > draggedIdx ? 'down' : 'up';
        const steps = Math.abs(dropIdx - draggedIdx);
        for (let j = 0; j < steps; j++) {
            moveSection(sections[draggedIdx].id, dir);
        }
        setDraggedIdx(null);
    }, [draggedIdx, moveSection, sections]);

    const { companyProfile, employees: staff, services } = useInvoice();

    // ─── PREVIEW SITE DATA (Merged siteConfig + Real Business Data) ───
    const previewSiteData = useMemo(() => {
        return {
            profile: companyProfile || {},
            config: siteConfig || {},
            sections: sections || [],
            activeEditorPagePath,
            products: [], // Can be extracted from invoices/services if needed
            appointmentSettings: {
                services: Array.isArray(services) && services.length > 0 ? services : [
                    { name: 'Consultation', description: 'Expert advice for your business needs.', price: '100' },
                    { name: 'Standard Service', description: 'Our most popular high-quality package.', price: '250' }
                ],
                staff: Array.isArray(staff) && staff.length > 0 ? staff : [],
                workingHours: { start: '09:00', end: '18:00' },
                workingHoursWeekend: { start: '10:00', end: '16:00' },
                workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            },
            onSectionSelect: openSectionEditor,
            activeSectionId: editingSection,
            deleteSection,
            moveSection,
            addSection,
            onAddSection: handleAddSection,
            slug: siteConfig.domain || 'demo'
        };
    }, [siteConfig, sections, openSectionEditor, editingSection, companyProfile, staff, services, activeEditorPagePath]);

    // ─── PREVIEW WIDTH ───
    const previewWidth = previewMode === 'mobile' ? '375px' : previewMode === 'tablet' ? '768px' : '100%';

    // ─── RENDER ───
    return (
        <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', background: '#f8fafc', fontFamily: '"Outfit", sans-serif' }}>
            {/* Hostinger Primary Sidebar removed as it is now integrated into the main application sidebar */}

            {/* ═══ SECONDARY PANEL (Flyout) ═══ */}
            <AnimatePresence mode="wait">
                {activeTab && (
                    <motion.div
                        key={activeTab}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        style={{ width: '340px', minWidth: '340px', background: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', zIndex: 40, boxShadow: '20px 0 40px rgba(0,0,0,0.03)' }}
                    >
                        {/* Panel Header */}
                        <div style={{ padding: '28px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em', textTransform: 'capitalize' }}>
                                    {{
                                        setup: 'Kurulum',
                                        elements: 'Öğeler',
                                        pages: 'Sayfalar',
                                        styles: 'Stiller',

                                        blog: 'Blog',
                                        store: 'Mağaza',
                                        seo: 'SEO',
                                        more: 'Daha Fazla'
                                    }[activeTab] || activeTab}
                                </h3>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', fontWeight: '600' }}>
                                    {(activeTab === 'elements' || activeTab === 'setup') && (t('manage_sections_desc') || 'Yapı ve bölümleri yönet')}
                                    {activeTab === 'pages' && (t('manage_pages_desc') || 'Menü ve navigasyonu düzenle')}
                                    {activeTab === 'styles' && (t('manage_styles_desc') || 'Global renkler ve yazı tipleri')}
                                    {activeTab === 'blog' && (t('manage_blog_desc') || 'İçerik ve makaleleri yönet')}
                                    {activeTab === 'store' && (t('manage_store_desc') || 'Satış ve ürün yönetimi')}
                                    {activeTab === 'seo' && (t('manage_seo_desc') || 'Arama motoru optimizasyonu')}

                                    {activeTab === 'more' && (t('manage_more_desc') || 'Ek seçenekler ve ayarlar')}
                                </div>
                            </div>
                            <button onClick={() => setSearchParams({})} style={{ background: '#f8fafc', border: 'none', borderRadius: '12px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Panel Content Scrollable */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                            
                            {/* ── SETUP PANEL ── */}
                            {activeTab === 'setup' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #eef2f6' }}>
                                        <h4 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: '900' }}>Web sitesi kurulumu</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {[
                                                { label: 'Web sitesi yolculuğunuza başlayın!', checked: true },
                                                { label: 'Başlık metnini düzenleyin', checked: !!siteConfig.siteName },
                                                { label: 'Logonuzu güncelleyin', checked: !!siteConfig.logo },
                                                { label: 'Sosyal medya bağlantılarını güncelleyin', checked: !!siteConfig.social },
                                                { label: 'Kurumsal bilgileri kontrol edin', checked: !!companyProfile?.name },
                                                { label: 'Yayınla!', checked: siteConfig.isPublished }
                                            ].map((task, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', fontWeight: '600', color: task.checked ? '#0f172a' : '#94a3b8' }}>
                                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: task.checked ? '2px solid #10b981' : '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: task.checked ? '#f0fdf4' : 'transparent' }}>
                                                        {task.checked && <CheckCircle size={14} color="#10b981" />}
                                                    </div>
                                                    <span style={{ textDecoration: task.checked ? 'line-through' : 'none', opacity: task.checked ? 0.6 : 1 }}>{task.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <button onClick={() => setActiveTab('seo')} style={{ textAlign: 'left', padding: '12px', background: 'none', border: 'none', color: '#6C3BFF', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>Google için optimize edin</button>
                                        <button onClick={() => openSectionEditor('site_header')} style={{ textAlign: 'left', padding: '12px', background: 'none', border: 'none', color: '#6C3BFF', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>Logoyu değiştir</button>
                                    </div>
                                </div>
                            )}

                            {/* ── ELEMENTS PANEL ── */}
                            {activeTab === 'elements' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    {SECTION_TEMPLATES.map((template, i) => (
                                        <div 
                                            key={i} 
                                            draggable
                                            onDragStart={(e) => {
                                                e.dataTransfer.setData('section_template', JSON.stringify(template));
                                            }}
                                            onClick={() => handleAddSection(template)}
                                            style={{ padding: '16px 12px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #eef2f6', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }} 
                                            onMouseEnter={e => e.currentTarget.style.borderColor = '#6C3BFF'}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = '#eef2f6'}
                                        >
                                            <div style={{ color: '#6C3BFF' }}>{template.icon}</div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '800', textAlign: 'center' }}>{template.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ── STYLES PANEL ── */}
                            {activeTab === 'styles' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
                                        {['Renkler', 'Fontlar'].map((tab, i) => (
                                            <button 
                                                key={tab} 
                                                onClick={() => setEditModalTab(tab === 'Renkler' ? 'colors' : 'fonts')}
                                                style={{ flex: 1, padding: '8px 4px', fontSize: '0.7rem', fontWeight: '800', border: 'none', borderRadius: '8px', background: (editModalTab === 'colors' || editModalTab === 'fonts' ? (tab === 'Renkler' ? editModalTab === 'colors' : editModalTab === 'fonts') : i === 0) ? 'white' : 'transparent', color: '#6C3BFF', cursor: 'pointer' }}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    {/* Color Palettes */}
                                    {editModalTab !== 'fonts' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {[
                                                '#3b82f6', '#6C3BFF', '#10b981', '#f59e0b', '#ef4444', 
                                                '#0f172a', '#ec4899', '#8b5cf6', '#06b6d4'
                                            ].map((color, i) => (
                                                <div 
                                                    key={i} 
                                                    onClick={() => updateSiteConfig({ theme: { primaryColor: color } })}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '10px 14px', background: siteConfig.theme?.primaryColor === color ? '#f3efff' : '#f8fafc', borderRadius: '12px', cursor: 'pointer', border: siteConfig.theme?.primaryColor === color ? '1px solid #6C3BFF' : '1px solid transparent' }}
                                                >
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: color, border: '1px solid #e2e8f0' }} />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: '800', fontSize: '0.85rem' }}>{color}</div>
                                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600' }}>{siteConfig.theme?.primaryColor === color ? 'Seçili Renk' : 'Tema Rengi'}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Font List */}
                                    {editModalTab === 'fonts' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {GOOGLE_FONTS.slice(0, 15).map((font, i) => (
                                                <button 
                                                    key={i} 
                                                    onClick={() => updateSiteConfig({ theme: { fontHeading: font, fontBody: font } })}
                                                    style={{ width: '100%', padding: '12px 16px', textAlign: 'left', background: siteConfig.theme?.fontHeading === font ? '#f3efff' : '#f8fafc', border: siteConfig.theme?.fontHeading === font ? '1px solid #6C3BFF' : '1px solid #f1f5f9', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '700', fontFamily: font, cursor: 'pointer' }}
                                                >
                                                    {font}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}



                            {/* ── PAGES PANEL ── */}
                            {activeTab === 'pages' && (() => {
                                const defaultPages = siteConfig?.pages || [
                                    { id: 'default-home', path: '/', title: 'Ana Sayfa', customElements: [], isHidden: false }
                                ];
                                
                                const handleAddPage = () => {
                                    const title = prompt('Yeni sayfa adı:', 'Yeni Sayfa');
                                    if (title) {
                                        const newPage = {
                                            id: `page-${Date.now()}`,
                                            path: `/${title.toLowerCase().replace(/\s+/g, '-')}`,
                                            title,
                                            customElements: [],
                                            isHidden: false
                                        };
                                        updateSiteConfig({ pages: [...defaultPages, newPage] });
                                    }
                                };

                                const togglePageHidden = (pageId) => {
                                    updateSiteConfig({
                                        pages: defaultPages.map(p => p.id === pageId ? { ...p, isHidden: !p.isHidden } : p)
                                    });
                                };

                                const visiblePages = defaultPages.filter(p => !p.isHidden);
                                const hiddenPages = defaultPages.filter(p => p.isHidden);

                                return (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div>
                                            <h4 style={{ fontSize: '0.75rem', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>ANA NAVİGASYON</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {visiblePages.map((page) => (
                                                    <div 
                                                        key={page.id} 
                                                        onClick={() => setActiveEditorPagePath(page.path)}
                                                        style={{ padding: '14px 18px', background: activeEditorPagePath === page.path ? '#e2e8f0' : '#f8fafc', borderRadius: '14px', border: activeEditorPagePath === page.path ? `1px solid #94a3b8` : '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <GripVertical size={14} color="#cbd5e1" />
                                                            <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>{page.title}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <Eye size={16} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); togglePageHidden(page.id); }} />
                                                            <Settings size={16} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={(e) => e.stopPropagation()} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        {hiddenPages.length > 0 && (
                                            <div>
                                                <h4 style={{ fontSize: '0.75rem', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>GİZLİ SAYFALAR</h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {hiddenPages.map((page) => (
                                                        <div 
                                                            key={page.id} 
                                                            onClick={() => setActiveEditorPagePath(page.path)}
                                                            style={{ padding: '14px 18px', background: activeEditorPagePath === page.path ? '#e2e8f0' : '#f8fafc', borderRadius: '14px', border: activeEditorPagePath === page.path ? `1px solid #94a3b8` : '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.7, cursor: 'pointer' }}
                                                        >
                                                            <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>{page.title}</span>
                                                            <EyeOff size={16} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); togglePageHidden(page.id); }} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        <button onClick={handleAddPage} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: '#6C3BFF', color: 'white', fontWeight: '950', border: 'none', cursor: 'pointer', boxShadow: '0 8px 16px -4px rgba(108, 59, 255, 0.4)' }}>
                                            Sayfa Ekle
                                        </button>
                                    </div>
                                );
                            })()}

                            {/* ── BLOG PANEL ── */}
                            {activeTab === 'blog' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
                                        {['Hepsi', 'Taslaklar', 'Planlandı', 'Yayınlanmış'].map((t, i) => (
                                            <button key={i} style={{ flex: 1, padding: '8px 2px', fontSize: '0.65rem', fontWeight: '800', border: 'none', borderRadius: '8px', background: i === 0 ? 'white' : 'transparent', color: i === 0 ? '#6C3BFF' : '#64748b', cursor: 'pointer' }}>{t}</button>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {[
                                            {title: "Winter Reflections: Learning…", date: "2/4/2025", category: "Genel"},
                                            {title: "Wonderful Festival in Our Villa…", date: "6/9/2024", category: "Genel"},
                                            {title: "Hallo World", date: "6/5/2024", category: "Genel"}
                                        ].map((post, i) => (
                                            <div key={i} style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                                <div style={{ fontWeight: '800', fontSize: '0.85rem', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</div>
                                                <div style={{ display: 'flex', gap: '12px', fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600' }}>
                                                    <span>{post.date}</span>
                                                    <span>{post.category}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button style={{ width: '100%', padding: '16px', borderRadius: '16px', background: '#6C3BFF', color: 'white', fontWeight: '950', border: 'none', cursor: 'pointer', marginTop: '10px' }}>Yeni Yazı Oluştur</button>
                                </div>
                            )}

                            {/* ── STORE & APPOINTMENTS PANEL ── */}
                            {activeTab === 'store' && (
                                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                                    <div style={{ width: 80, height: 80, background: '#f5f3ff', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#6C3BFF' }}>
                                        <ShoppingCart size={40} />
                                    </div>
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>Mağaza & Stok</h4>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '24px', fontWeight: '600', lineHeight: 1.5 }}>BayZenit uygulamanız üzerinden ürün, stok ve siparişlerinizi yönetin.</p>
                                    <button onClick={() => navigate('/stock')} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: '#6C3BFF', color: 'white', border: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 8px 16px -4px rgba(108, 59, 255, 0.4)', marginBottom: '16px' }}>
                                        Stok & Satış panelini aç
                                    </button>
                                    
                                    <div style={{ width: 80, height: 80, background: '#f5f3ff', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '24px auto 20px', color: '#6C3BFF' }}>
                                        <Calendar size={40} />
                                    </div>
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>Randevular</h4>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '24px', fontWeight: '600', lineHeight: 1.5 }}>Müşteri randevularını ve hizmet atamalarınızı yönetin.</p>
                                    <button onClick={() => navigate('/appointments')} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'white', color: '#6C3BFF', border: '2px solid #6C3BFF', fontWeight: '900', cursor: 'pointer', fontSize: '0.95rem' }}>
                                        Randevu Yönetimi
                                    </button>
                                </div>
                            )}

                            {/* ── MORE PANEL ── */}
                            {activeTab === 'more' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {[
                                        "Blog", "Randevular", "Genel ayarlar", "Entegrasyonlar", "Form gönderimleri",
                                        "Analizler", "Medya kütüphanesi", "Site Dilleri", "Yedekleri yönet",
                                        "İçeriği WordPress'e aktar", "Yardım ve Kaynaklar", "Yenilikler"
                                    ].map((item, i) => (
                                        <button key={i} style={{ width: '100%', padding: '14px 18px', textAlign: 'left', background: 'none', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.9rem', color: '#334155', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            )}

                             {/* ── SEO PANEL ── */}
                             {activeTab === 'seo' && (
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                     <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                         <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                             <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#64748b' }}>SİTE BAŞLIĞI (SEO)</label>
                                             <input 
                                                 type="text" 
                                                 value={siteConfig.seo?.title || ''} 
                                                 onChange={e => updateSiteConfig({ seo: { title: e.target.value } })}
                                                 placeholder="Google'da nasıl görünecek?"
                                                 style={{ padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', fontWeight: '600' }}
                                             />
                                         </div>
                                         <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                             <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#64748b' }}>SİTE AÇIKLAMASI (META)</label>
                                             <textarea 
                                                 rows={4}
                                                 value={siteConfig.seo?.description || ''} 
                                                 onChange={e => updateSiteConfig({ seo: { description: e.target.value } })}
                                                 placeholder="Siteniz hakkında kısa bir bilgi..."
                                                 style={{ padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', fontWeight: '600', resize: 'none' }}
                                             />
                                         </div>
                                     </div>
                                     <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: '20px', border: '1px solid #dcfce7', display: 'flex', gap: '12px' }}>
                                         <CheckCircle size={20} color="#10b981" />
                                         <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '700', color: '#166534', lineHeight: 1.4 }}>İçeriğiniz yayınlandığında otomatik olarak indekslenecektir.</p>
                                     </div>
                                 </div>
                             )}

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ MAIN CONTENT AREA ═══ */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                
                {/* Modern Top Header (Hostinger-Inspired) */}
                <div style={{ height: '76px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', zIndex: 30, boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 20px', background: '#f1f5f9', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}>
                            <div style={{ width: 10, height: 10, background: '#3b82f6', borderRadius: '3px' }} />
                            <span style={{ fontSize: '0.9rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.01em' }}>{siteConfig.siteName || 'Projem'}</span>
                            <ChevronDown size={16} color="#64748b" />
                         </div>

                         {/* Preview Mode Selector */}
                         <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '6px', borderRadius: '14px' }}>
                            {[
                                { id: 'desktop', icon: DesktopIcon },
                                { id: 'tablet', icon: Tablet },
                                { id: 'mobile', icon: Smartphone }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setPreviewMode(item.id)}
                                    style={{
                                        width: '44px', height: '38px', borderRadius: '10px', border: 'none',
                                        background: previewMode === item.id ? 'white' : 'transparent',
                                        color: previewMode === item.id ? '#3b82f6' : '#64748b',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: previewMode === item.id ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <item.icon size={18} strokeWidth={2.5} />
                                </button>
                            ))}
                         </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', fontSize: '0.8rem', fontWeight: '900', padding: '10px 20px', background: '#f0fdf4', borderRadius: '100px', border: '1px solid #dcfce7' }}>
                            <RefreshCw size={14} />
                            Kaydedildi
                        </div>
                        <button onClick={() => window.open(`https://${siteConfig.domain}.bayrechnung.com`, '_blank')} style={{ background: 'white', border: '1px solid #e2e8f0', color: '#0f172a', padding: '12px 28px', borderRadius: '14px', fontWeight: '900', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}>
                            <Eye size={18} /> Önizle
                        </button>
                        <button onClick={publishSite} style={{ background: 'linear-gradient(135deg, #4f46e5, #3b82f6)', color: 'white', border: 'none', padding: '12px 40px', borderRadius: '14px', fontWeight: '950', fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 12px 24px -6px rgba(79,70,229,0.4)', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                            Yayınla
                        </button>
                    </div>
                </div>

                {/* Live Preview Container */}
                <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: previewMode !== 'desktop' ? '24px' : '0', background: '#0f172a' }}>
                    <div style={{
                        width: previewWidth,
                        maxWidth: '100%',
                        background: 'white',
                        boxShadow: previewMode !== 'desktop' ? '0 20px 60px rgba(0,0,0,0.5)' : 'none',
                        borderRadius: previewMode !== 'desktop' ? '16px' : '0',
                        overflow: 'hidden',
                        transition: 'width 0.3s ease'
                    }}>
                        <PublicWebsite overrideData={previewSiteData} />
                    </div>
                </div>
            </div>

            {/* ═══ SECTION EDITOR MODAL ═══ */}
            <AnimatePresence>
                {editingSection && activeSection && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setEditingSection(null)}>
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }} />
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ position: 'relative', background: 'white', borderRadius: '24px', width: '560px', maxWidth: '95vw', maxHeight: '85vh', overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}
                        >
                            {/* Modal Header */}
                            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900' }}>{activeSection.data?.title || activeSection.type}</h3>
                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>{activeSection.type}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <button onClick={() => setEditingSection(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
                                </div>
                            </div>

                            {/* Modal Tabs */}
                            <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
                                {[
                                    { id: 'content', label: t('content') || 'Content', icon: FileText },
                                    { id: 'style', label: t('style') || 'Style', icon: Palette },
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setEditModalTab(tab.id)}
                                        style={{
                                            flex: 1, padding: '14px', border: 'none', background: 'none',
                                            borderBottom: `3px solid ${editModalTab === tab.id ? '#3b82f6' : 'transparent'}`,
                                            color: editModalTab === tab.id ? '#3b82f6' : '#64748b',
                                            fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                        }}
                                    >
                                        <tab.icon size={14} /> {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Modal Body */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

                                {/* ── CONTENT TAB ── */}
                                {editModalTab === 'content' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {activeSection.type === 'HERO' && (
                                            <>
                                                <EditorField label={t('title')} value={activeSection.data.title} onChange={v => updateSection(activeSection.id, { title: v })} />
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                                    <EditorField label="Size" type="select" options={[{ label: 'S', value: '2rem' }, { label: 'M', value: '3rem' }, { label: 'L', value: '4.5rem' }, { label: 'XL', value: '6rem' }]} value={activeSection.data.headingSize || '4.5rem'} onChange={v => updateSection(activeSection.id, { headingSize: v })} />
                                                    <EditorField label="Color" type="color" value={activeSection.data.headingColor || '#ffffff'} onChange={v => updateSection(activeSection.id, { headingColor: v })} />
                                                </div>
                                                <EditorField label={t('subtitle')} isTextArea value={activeSection.data.subtitle} onChange={v => updateSection(activeSection.id, { subtitle: v })} />
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                                    <EditorField label="Size" type="select" options={[{ label: 'S', value: '1rem' }, { label: 'M', value: '1.2rem' }, { label: 'L', value: '1.5rem' }]} value={activeSection.data.subtitleSize || '1.2rem'} onChange={v => updateSection(activeSection.id, { subtitleSize: v })} />
                                                    <EditorField label="Color" type="color" value={activeSection.data.subtitleColor || '#ffffff'} onChange={v => updateSection(activeSection.id, { subtitleColor: v })} />
                                                </div>
                                                <div style={{ height: '1px', background: '#eef2f6' }} />
                                                <EditorField label={t('button_text')} value={activeSection.data.buttonText} onChange={v => updateSection(activeSection.id, { buttonText: v })} />
                                                <EditorField label="Image Overlay" type="range" value={activeSection.data.overlay || 0.4} onChange={v => updateSection(activeSection.id, { overlay: v })} />
                                            </>
                                        )}

                                        {activeSection.type === 'FEATURES' && (
                                            <>
                                                <EditorField label={t('section_title')} value={activeSection.data.title} onChange={v => updateSection(activeSection.id, { title: v })} />
                                                {(activeSection.data.items || []).map((item, i) => (
                                                    <div key={i} style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px' }}>
                                                        <EditorField label={`${t('title')} ${i + 1}`} value={item.title} onChange={v => {
                                                            const newItems = [...activeSection.data.items]; newItems[i] = { ...item, title: v };
                                                            updateSection(activeSection.id, { items: newItems });
                                                        }} />
                                                        <EditorField label="Description" isTextArea value={item.description} onChange={v => {
                                                            const newItems = [...activeSection.data.items]; newItems[i] = { ...item, description: v };
                                                            updateSection(activeSection.id, { items: newItems });
                                                        }} />
                                                    </div>
                                                ))}
                                                <button onClick={() => updateSection(activeSection.id, { items: [...(activeSection.data.items || []), { title: 'New Feature', description: '' }] })} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px dashed #cbd5e1', background: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }}>+ Add Item</button>
                                            </>
                                        )}

                                        {activeSection.type === 'PRICING' && (
                                            <>
                                                <EditorField label={t('section_title')} value={activeSection.data.title} onChange={v => updateSection(activeSection.id, { title: v })} />
                                                {activeSection.data.items.map((plan, i) => (
                                                    <div key={i} style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #eef2f6', marginBottom: '16px' }}>
                                                        <div style={{ fontWeight: '900', fontSize: '0.75rem', marginBottom: 12, color: '#3b82f6' }}>{plan.name || `Item ${i + 1}`}</div>
                                                        <EditorField label="Name" value={plan.name} onChange={v => { const items = [...activeSection.data.items]; items[i] = { ...plan, name: v }; updateSection(activeSection.id, { items }); }} />
                                                        <EditorField label="Features (One per line)" isTextArea value={plan.features?.join('\n')} onChange={v => { const items = [...activeSection.data.items]; items[i] = { ...plan, features: v.split('\n') }; updateSection(activeSection.id, { items }); }} />
                                                        <EditorField label="Price" value={plan.price} onChange={v => { const items = [...activeSection.data.items]; items[i] = { ...plan, price: v }; updateSection(activeSection.id, { items }); }} />
                                                    </div>
                                                ))}
                                            </>
                                        )}

                                        {['SERVICES', 'PRODUCTS'].includes(activeSection.type) && (
                                            <div style={{ padding: '32px', background: '#f8fafc', borderRadius: '16px', textAlign: 'center', border: '2px dashed #e2e8f0' }}>
                                                <RefreshCw size={28} color="#3b82f6" style={{ marginBottom: '10px' }} />
                                                <h4 style={{ margin: 0, fontSize: '0.9rem' }}>{t('automated_sync') || 'Auto-Synced'}</h4>
                                                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '8px 0 0' }}>{t('synced_from_internal') || 'Data synced from your internal modules.'}</p>
                                            </div>
                                        )}

                                        {activeSection.type === 'CONTACT' && (
                                            <>
                                                <EditorField label={t('title')} value={activeSection.data.title} onChange={v => updateSection(activeSection.id, { title: v })} />
                                                <EditorField label={t('subtitle')} isTextArea value={activeSection.data.subtitle} onChange={v => updateSection(activeSection.id, { subtitle: v })} />
                                            </>
                                        )}

                                        {activeSection.type === 'FAQ' && (
                                            <>
                                                <EditorField label={t('section_title')} value={activeSection.data.title} onChange={v => updateSection(activeSection.id, { title: v })} />
                                                {(activeSection.data.items || []).map((item, i) => (
                                                    <div key={i} style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', marginBottom: '10px', border: '1px solid #eef2f6' }}>
                                                        <EditorField label={`${t('question')} ${i + 1}`} value={item.q} onChange={v => {
                                                            const newItems = [...activeSection.data.items]; newItems[i] = { ...item, q: v };
                                                            updateSection(activeSection.id, { items: newItems });
                                                        }} />
                                                        <EditorField label={`${t('answer')} ${i + 1}`} isTextArea value={item.a} onChange={v => {
                                                            const newItems = [...activeSection.data.items]; newItems[i] = { ...item, a: v };
                                                            updateSection(activeSection.id, { items: newItems });
                                                        }} />
                                                        <button 
                                                            onClick={() => {
                                                                const newItems = activeSection.data.items.filter((_, idx) => idx !== i);
                                                                updateSection(activeSection.id, { items: newItems });
                                                            }}
                                                            style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer', padding: '4px' }}
                                                        >
                                                            {t('remove') || 'Sil'}
                                                        </button>
                                                    </div>
                                                ))}
                                                <button onClick={() => updateSection(activeSection.id, { items: [...(activeSection.data.items || []), { q: 'Yeni Soru?', a: 'Cevap buraya...' }] })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px dashed #cbd5e1', background: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '0.8rem', color: '#3b82f6' }}>+ Yeni Soru Ekle</button>
                                            </>
                                        )}

                                        {activeSection.type === 'GALLERY' && (
                                            <>
                                                <EditorField label={t('section_title')} value={activeSection.data.title} onChange={v => updateSection(activeSection.id, { title: v })} />
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                                                    {(activeSection.data.images || []).map((img, i) => (
                                                        <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                                            <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            <button 
                                                                onClick={() => {
                                                                    const newImages = activeSection.data.images.filter((_, idx) => idx !== i);
                                                                    updateSection(activeSection.id, { images: newImages });
                                                                }}
                                                                style={{ position: 'absolute', top: '5px', right: '5px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.9)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                                                    <EditorField 
                                                        label="Yeni Görsel URL Ekle" 
                                                        placeholder="https://..." 
                                                        value="" 
                                                        onChange={v => {
                                                            if (v.trim()) {
                                                                updateSection(activeSection.id, { images: [...(activeSection.data.images || []), v] });
                                                            }
                                                        }} 
                                                    />
                                                    <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '4px 0 0' }}>Not: Dosya yükleme özelliği yakında eklenecektir. Şimdilik URL yapıştırabilirsiniz.</p>
                                                </div>
                                            </>
                                        )}

                                        {!['HERO', 'FEATURES', 'PRICING', 'SERVICES', 'PRODUCTS', 'CONTACT', 'FAQ', 'GALLERY'].includes(activeSection.type) && (
                                            <>
                                                <EditorField label={t('title')} value={activeSection.data.title} onChange={v => updateSection(activeSection.id, { title: v })} />
                                                <EditorField label={t('content')} isTextArea value={activeSection.data.content || activeSection.data.text} onChange={v => updateSection(activeSection.id, { content: v })} />
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* ── STYLE TAB ── */}
                                {editModalTab === 'style' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: '12px' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase' }}>Editing: {bgMode.toUpperCase()}</span>
                                            <div style={{ display: 'flex', gap: 2, background: '#e2e8f0', padding: 3, borderRadius: 8 }}>
                                                {['light', 'dark'].map(m => (
                                                    <button key={m} onClick={() => setBgMode(m)} style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: bgMode === m ? 'white' : 'transparent', color: bgMode === m ? '#3b82f6' : '#64748b', fontSize: '0.65rem', fontWeight: '800', cursor: 'pointer' }}>{m === 'light' ? <Sun size={12} /> : <Moon size={12} />}</button>
                                                ))}
                                            </div>
                                        </div>

                                        <BackgroundSelector
                                            label={t('section_background') || 'Section Background'}
                                            bgMode={bgMode}
                                            value={activeSection.data.style?.backgrounds?.[bgMode] || { type: 'color', value: activeSection.data.style?.background || 'default' }}
                                            onChange={v => updateSection(activeSection.id, { style: { ...activeSection.data.style, backgrounds: { ...(activeSection.data.style?.backgrounds || {}), [bgMode]: v } } })}
                                        />

                                        <EditorField label="Text Color" type="color" value={activeSection.data.style?.textColor?.[bgMode] || ''} onChange={v => updateSection(activeSection.id, { style: { ...activeSection.data.style, textColor: { ...(activeSection.data.style?.textColor || {}), [bgMode]: v } } })} />

                                        <EditorField
                                            label={t('section_padding') || 'Padding'}
                                            type="select"
                                            options={[
                                                { label: 'Compact', value: 'compact' },
                                                { label: 'Normal', value: 'normal' },
                                                { label: 'Spacious', value: 'spacious' }
                                            ]}
                                            value={activeSection.data.style?.padding || 'normal'}
                                            onChange={v => updateSection(activeSection.id, { style: { ...activeSection.data.style, padding: v } })}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div style={{ padding: '16px 28px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '10px', flexShrink: 0 }}>
                                <button onClick={() => setEditingSection(null)} style={{ padding: '10px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>
                                    {t('close') || 'Close'}
                                </button>
                                <button onClick={() => setEditingSection(null)} style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
                                    <CheckCircle size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> {t('save') || 'Save & Close'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ═══ ADD SECTION MODAL ═══ */}
            <AnimatePresence>
                {showAddModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowAddModal(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ background: 'white', padding: '32px', borderRadius: '24px', width: '520px', maxWidth: '95vw', maxHeight: '80vh', overflow: 'auto', boxShadow: '0 30px 80px rgba(0,0,0,0.3)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900' }}>{t('add_section') || 'Add Section'}</h3>
                                <button onClick={() => setShowAddModal(false)} style={{ border: 'none', background: '#f1f5f9', borderRadius: '10px', padding: '8px', cursor: 'pointer' }}><X size={18} /></button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                {SECTION_TEMPLATES.map(tmpl => (
                                    <button key={tmpl.type} onClick={() => handleAddSection(tmpl)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.15s' }}
                                        onMouseOver={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = '#eff6ff'; }}
                                        onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                                    >
                                        <div style={{ padding: '10px', background: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>{tmpl.icon}</div>
                                        <span style={{ fontWeight: '700', fontSize: '0.75rem', textAlign: 'center' }}>{tmpl.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Google Fonts Loader */}
            <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${(siteConfig.theme?.fontFamily || 'Inter').replace(/"/g, '').split(',')[0].trim().replace(/ /g, '+')}:wght@300;400;500;600;700;800;900&display=swap`} />
        </div>
    );
};

// ─── BACKGROUND SELECTOR COMPONENT ───
const BackgroundSelector = ({ label, value = {}, onChange, bgMode = 'light' }) => {
    const [subTab, setSubTab] = useState(value?.type || 'color');
    const updateType = (type) => { onChange({ ...value, type }); setSubTab(type); };
    const PRESETS = ['#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#0f172a', '#1e293b', '#334155', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #eef2f6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label style={{ fontSize: '0.7rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase' }}>{label}</label>
                <div style={{ display: 'flex', gap: 2, background: '#e2e8f0', padding: 2, borderRadius: 6 }}>
                    {['color', 'gradient', 'image'].map(t => (
                        <button key={t} onClick={() => updateType(t)} style={{ padding: '3px 8px', borderRadius: 4, border: 'none', background: subTab === t ? 'white' : 'transparent', color: subTab === t ? '#3b82f6' : '#94a3b8', fontSize: '0.6rem', fontWeight: '800', cursor: 'pointer' }}>{t.toUpperCase()}</button>
                    ))}
                </div>
            </div>
            {subTab === 'color' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {PRESETS.map(p => (<button key={p} onClick={() => onChange({ ...value, type: 'color', value: p })} style={{ width: 20, height: 20, borderRadius: 4, background: p, border: value.value === p ? '2px solid #3b82f6' : '1px solid #e2e8f0', cursor: 'pointer' }} />))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input type="color" value={value.type === 'color' && value.value?.startsWith('#') ? value.value : '#ffffff'} onChange={e => onChange({ ...value, type: 'color', value: e.target.value })} style={{ width: '36px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer' }} />
                        <input type="text" placeholder="#HEX" value={value.type === 'color' ? value.value : ''} onChange={e => onChange({ ...value, type: 'color', value: e.target.value })} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }} />
                    </div>
                </div>
            )}
            {subTab === 'gradient' && (
                <div>
                    <input type="text" placeholder="linear-gradient(...)" value={value.type === 'gradient' ? value.value : ''} onChange={e => onChange({ ...value, type: 'gradient', value: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }} />
                    <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: 4 }}>e.g. linear-gradient(135deg, #3b82f6, #8b5cf6)</div>
                </div>
            )}
            {subTab === 'image' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input type="text" placeholder="Image URL" value={value.type === 'image' ? value.value : ''} onChange={e => onChange({ ...value, type: 'image', value: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        <select value={value.size || 'cover'} onChange={e => onChange({ ...value, type: 'image', size: e.target.value })} style={{ padding: 8, borderRadius: 6, border: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                            <option value="cover">Cover</option><option value="contain">Contain</option><option value="auto">Original</option>
                        </select>
                        <select value={value.position || 'center'} onChange={e => onChange({ ...value, type: 'image', position: e.target.value })} style={{ padding: 8, borderRadius: 6, border: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                            <option value="center">Center</option><option value="top">Top</option><option value="bottom">Bottom</option><option value="left">Left</option><option value="right">Right</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── EDITOR FIELD COMPONENT ───
const EditorField = ({ label, value, onChange, placeholder, isTextArea, type = 'text', options = [] }) => (
    <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
        {type === 'color' ? (
            <div style={{ display: 'flex', gap: '8px' }}>
                <input type="color" value={value || '#3b82f6'} onChange={e => onChange(e.target.value)} style={{ width: '36px', height: '36px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
                <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="#hex" style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }} />
            </div>
        ) : type === 'select' ? (
            <select value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '600', fontSize: '0.85rem' }}>
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        ) : type === 'range' ? (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input type="range" min="0" max="1" step="0.1" value={value || 0.4} onChange={e => onChange(parseFloat(e.target.value))} style={{ flex: 1 }} />
                <span style={{ fontWeight: '800', width: 28, fontSize: '0.8rem', textAlign: 'center' }}>{value}</span>
            </div>
        ) : isTextArea ? (
            <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e1e8f0', fontSize: '0.85rem', resize: 'vertical' }} />
        ) : (
            <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e1e8f0', fontSize: '0.85rem' }} />
        )}
    </div>
);

export default WebBuilderEditor;
