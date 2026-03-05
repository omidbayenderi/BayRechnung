import React, { useState, useMemo, useCallback } from 'react';
import { useWebsite } from '../../../context/WebsiteContext';
import { useLanguage } from '../../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Layout, Eye, EyeOff, Trash2, PlusCircle, Monitor,
    Edit3, RefreshCw, ShoppingCart, ArrowLeft, ArrowRight,
    Type, Image as ImageIcon, List, FileText, CheckCircle,
    ChevronRight, Save, LayoutTemplate, X, Briefcase, Calendar, Map, Globe,
    ChevronDown, Plus, MessageSquare, Layers, Paperclip, Star, Hash, Settings, Palette,
    GripVertical, Smartphone, Tablet, Monitor as DesktopIcon, Sun, Moon, FileJson
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
    const [activeTab, setActiveTab] = useState('sections');
    const [bgMode, setBgMode] = useState('light');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingSection, setEditingSection] = useState(null); // section id for modal
    const [editModalTab, setEditModalTab] = useState('content');
    const [previewMode, setPreviewMode] = useState('desktop'); // desktop, tablet, mobile
    const [draggedIdx, setDraggedIdx] = useState(null);

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

    // ─── HANDLERS ───
    const handleAddSection = useCallback((template) => {
        const profile = JSON.parse(localStorage.getItem('bay_profile') || '{}');
        const industry = siteConfig.businessCategory || profile.industry || 'Business';

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
        addSection(newSection);
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

    const previewOverrideData = useMemo(() => {
        const profile = JSON.parse(localStorage.getItem('bay_profile') || '{}');
        const services = JSON.parse(localStorage.getItem('bay_services') || '[]');

        return {
            profile,
            config: siteConfig,
            sections,
            products: JSON.parse(localStorage.getItem('bay_products') || '[]'),
            appointmentSettings: {
                services: services.length > 0 ? services : [
                    { name: 'Consultation', description: 'Expert advice for your business needs.', price: '100' },
                    { name: 'Standard Service', description: 'Our most popular high-quality package.', price: '250' }
                ],
                staff: JSON.parse(localStorage.getItem('bay_staff') || '[]'),
                workingHours: { start: '09:00', end: '18:00' },
                workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            },
            onSectionSelect: openSectionEditor,
            activeSectionId: editingSection
        };
    }, [siteConfig, sections, openSectionEditor, editingSection]);

    // ─── PREVIEW WIDTH ───
    const previewWidth = previewMode === 'mobile' ? '375px' : previewMode === 'tablet' ? '768px' : '100%';

    // ─── RENDER ───
    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0f172a', fontFamily: '"Inter", sans-serif' }}>

            {/* ═══ LEFT SIDEBAR ═══ */}
            <div style={{ width: '300px', minWidth: '300px', background: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', zIndex: 30 }}>

                {/* Header */}
                <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <button onClick={() => navigate('/website/dashboard')} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#64748b' }}>
                            <ArrowLeft size={18} />
                        </button>
                        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', letterSpacing: '-0.02em' }}>WebBuilder Pro</h2>
                    </div>

                    {/* Tab Switcher */}
                    <div style={{ display: 'flex', gap: '2px', padding: '4px', background: '#f1f5f9', borderRadius: '12px' }}>
                        {[
                            { id: 'sections', icon: Layout, label: t('sections') || 'Sections' },
                            { id: 'design', icon: Palette, label: t('design') || 'Design' },
                            { id: 'seo', icon: Globe, label: 'SEO' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    flex: 1, padding: '8px 4px', borderRadius: '10px', border: 'none',
                                    background: activeTab === tab.id ? 'white' : 'transparent',
                                    color: activeTab === tab.id ? '#3b82f6' : '#64748b',
                                    fontWeight: '800', fontSize: '0.7rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                    boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <tab.icon size={13} /> {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sidebar Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

                    {/* ── SECTIONS TAB ── */}
                    {activeTab === 'sections' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button
                                onClick={() => setShowAddModal(true)}
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px dashed #bfdbfe', background: '#eff6ff', color: '#3b82f6', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.8rem', marginBottom: '8px' }}
                            >
                                <PlusCircle size={16} /> {t('add_new_section') || 'Add Section'}
                            </button>

                            {sections.map((section, idx) => (
                                <div
                                    key={section.id}
                                    draggable
                                    onDragStart={() => handleDragStart(idx)}
                                    onDragOver={handleDragOver}
                                    onDrop={() => handleDrop(idx)}
                                    style={{
                                        padding: '12px 14px', borderRadius: '12px', cursor: 'grab',
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        background: editingSection === section.id ? '#eff6ff' : '#f8fafc',
                                        border: '1px solid ' + (editingSection === section.id ? '#93c5fd' : '#f1f5f9'),
                                        opacity: section.visible === false ? 0.5 : 1,
                                        transition: 'all 0.15s'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                                        <GripVertical size={14} color="#cbd5e1" />
                                        <div style={{ color: editingSection === section.id ? '#3b82f6' : '#94a3b8', flexShrink: 0 }}>
                                            {SECTION_TEMPLATES.find(temp => temp.type.toUpperCase() === section.type.toUpperCase())?.icon || <Layout size={16} />}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{section.data?.title || section.type}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                                        <button onClick={(e) => { e.stopPropagation(); openSectionEditor(section.id); }} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: '4px' }}><Edit3 size={14} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'up'); }} title="Move Up" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}><ChevronDown size={14} style={{ transform: 'rotate(180deg)' }} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'down'); }} title="Move Down" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}><ChevronDown size={14} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); toggleSectionVisibility(section.id); }} title="Toggle Visibility" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}>
                                            {section.visible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                                        </button>
                                        {section.type !== 'HERO' && (
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteSection(section.id); }} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', padding: '4px' }}><Trash2 size={14} /></button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── DESIGN TAB ── */}
                    {activeTab === 'design' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Appearance Mode */}
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px' }}>
                                <h4 style={{ margin: '0 0 12px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}>Appearance</h4>
                                <EditorField
                                    label={t('theme_mode') || 'Display Mode'}
                                    type="select"
                                    options={[
                                        { label: 'System / Auto', value: 'auto' },
                                        { label: 'Light Mode', value: 'light' },
                                        { label: 'Dark Mode', value: 'dark' }
                                    ]}
                                    value={siteConfig.mode || 'auto'}
                                    onChange={(val) => updateSiteConfig({ mode: val })}
                                />
                            </div>

                            {/* Brand Color */}
                            <EditorField label={t('primary_color') || 'Brand Color'} type="color" value={siteConfig.theme?.primaryColor} onChange={(val) => updateSiteConfig({ theme: { primaryColor: val } })} />

                            {/* Font Family */}
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px' }}>
                                <h4 style={{ margin: '0 0 12px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}>Typography</h4>
                                <EditorField
                                    label={t('font_family') || 'Font Family'}
                                    type="select"
                                    options={GOOGLE_FONTS.map(f => ({ label: f, value: `"${f}", sans-serif` }))}
                                    value={siteConfig.theme?.fontFamily || '"Inter", sans-serif'}
                                    onChange={(val) => updateSiteConfig({ theme: { fontFamily: val } })}
                                />
                                <EditorField label={t('border_radius') || 'Corner Radius'} type="select" options={[
                                    { label: 'None (Square)', value: '0px' },
                                    { label: 'Small', value: '4px' },
                                    { label: 'Default', value: '12px' },
                                    { label: 'Large', value: '24px' },
                                    { label: 'Full (Pill)', value: '9999px' }
                                ]} value={siteConfig.theme?.radius || '12px'} onChange={(val) => updateSiteConfig({ theme: { radius: val } })} />
                            </div>

                            {/* Global Palette Overrides */}
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <h4 style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}>Global Palette Overrides</h4>
                                    <div style={{ display: 'flex', gap: 2, background: '#e2e8f0', padding: 2, borderRadius: 6 }}>
                                        {['light', 'dark'].map(m => (
                                            <button key={m} onClick={() => setBgMode(m)} style={{ padding: '3px 8px', borderRadius: 4, border: 'none', background: bgMode === m ? 'white' : 'transparent', color: bgMode === m ? '#3b82f6' : '#94a3b8', fontSize: '0.6rem', fontWeight: '800', cursor: 'pointer' }}>{m.toUpperCase()}</button>
                                        ))}
                                    </div>
                                </div>
                                <EditorField label={`Bg Color (${bgMode})`} type="color" value={siteConfig.theme?.colors?.[bgMode]?.bg} onChange={v => updateSiteConfig({ theme: { colors: { ...siteConfig.theme?.colors, [bgMode]: { ...siteConfig.theme?.colors?.[bgMode], bg: v } } } })} />
                                <EditorField label={`Surface (${bgMode})`} type="color" value={siteConfig.theme?.colors?.[bgMode]?.surface} onChange={v => updateSiteConfig({ theme: { colors: { ...siteConfig.theme?.colors, [bgMode]: { ...siteConfig.theme?.colors?.[bgMode], surface: v } } } })} />
                                <EditorField label={`Text Color (${bgMode})`} type="color" value={siteConfig.theme?.colors?.[bgMode]?.text} onChange={v => updateSiteConfig({ theme: { colors: { ...siteConfig.theme?.colors, [bgMode]: { ...siteConfig.theme?.colors?.[bgMode], text: v } } } })} />
                                <EditorField label={`Border (${bgMode})`} type="color" value={siteConfig.theme?.colors?.[bgMode]?.border} onChange={v => updateSiteConfig({ theme: { colors: { ...siteConfig.theme?.colors, [bgMode]: { ...siteConfig.theme?.colors?.[bgMode], border: v } } } })} />
                            </div>

                            {/* Global Backgrounds */}
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #eef2f6' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <h4 style={{ margin: '0', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}><ImageIcon size={12} /> Backgrounds</h4>
                                    <div style={{ display: 'flex', gap: 2, background: '#e2e8f0', padding: 3, borderRadius: 8 }}>
                                        {['light', 'dark'].map(m => (
                                            <button key={m} onClick={() => setBgMode(m)} style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: bgMode === m ? 'white' : 'transparent', color: bgMode === m ? '#3b82f6' : '#64748b', fontSize: '0.65rem', fontWeight: '800', cursor: 'pointer' }}>{m === 'light' ? <Sun size={12} /> : <Moon size={12} />}</button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {['hero', 'body', 'footer'].map(zone => (
                                        <BackgroundSelector
                                            key={zone}
                                            label={zone.charAt(0).toUpperCase() + zone.slice(1)}
                                            bgMode={bgMode}
                                            value={siteConfig.theme?.backgrounds?.[zone]?.[bgMode] || { type: 'color', value: 'default' }}
                                            onChange={(val) => updateSiteConfig({ theme: { backgrounds: { [zone]: { [bgMode]: val } } } })}
                                        />
                                    ))}
                                </div>
                                <div style={{ height: '1px', background: '#eef2f6', margin: '12px 0' }} />
                                <EditorField label="Text Color" type="color" value={siteConfig.theme?.colors?.[bgMode]?.text || (bgMode === 'dark' ? '#ffffff' : '#1e293b')} onChange={(val) => updateSiteConfig({ theme: { colors: { [bgMode]: { text: val } } } })} />
                                <EditorField label="Secondary Color" type="color" value={siteConfig.theme?.colors?.[bgMode]?.textSecondary || (bgMode === 'dark' ? '#94a3b8' : '#64748b')} onChange={(val) => updateSiteConfig({ theme: { colors: { [bgMode]: { textSecondary: val } } } })} />
                            </div>
                        </div>
                    )}

                    {/* ── SEO TAB ── */}
                    {activeTab === 'seo' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <EditorField label={t('seo_title') || 'Meta Title'} value={siteConfig.seo?.title} onChange={(val) => updateSiteConfig({ seo: { title: val } })} />
                            <EditorField label={t('seo_desc') || 'Meta Description'} isTextArea value={siteConfig.seo?.description} onChange={(val) => updateSiteConfig({ seo: { description: val } })} />
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px' }}>
                                <h4 style={{ margin: '0 0 12px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}>Advanced</h4>
                                <EditorField label={t('custom_css') || 'Custom CSS'} isTextArea placeholder="body { ... }" value={siteConfig.advanced?.customCss} onChange={(val) => updateSiteConfig({ advanced: { customCss: val } })} />
                                <EditorField label={t('head_scripts') || 'Header Scripts'} isTextArea placeholder="<!-- Analytics -->" value={siteConfig.advanced?.headScripts} onChange={(val) => updateSiteConfig({ advanced: { headScripts: val } })} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Actions */}
                <div style={{ padding: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => window.open(`/s/demo?domain=${siteConfig.domain || 'demo'}`, '_blank')}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                        <Eye size={16} /> {t('preview') || 'Preview'}
                    </button>
                    <button
                        onClick={() => { publishSite(); alert(t('site_published') || 'Site published!'); }}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', borderRadius: '12px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}
                    >
                        <Globe size={16} /> {siteConfig.isPublished ? (t('republish') || 'Republish') : (t('publish') || 'Publish')}
                    </button>
                </div>
            </div>

            {/* ═══ MAIN PREVIEW AREA ═══ */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                {/* Preview Toolbar */}
                <div style={{ height: '50px', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', borderBottom: '1px solid #334155', flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: '4px', background: '#334155', padding: '4px', borderRadius: '10px' }}>
                        {[
                            { id: 'desktop', icon: DesktopIcon, label: 'Desktop' },
                            { id: 'tablet', icon: Tablet, label: 'Tablet' },
                            { id: 'mobile', icon: Smartphone, label: 'Mobile' }
                        ].map(d => (
                            <button key={d.id} onClick={() => setPreviewMode(d.id)} title={d.label} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: previewMode === d.id ? '#3b82f6' : 'transparent', color: previewMode === d.id ? 'white' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', fontWeight: '700' }}>
                                <d.icon size={14} /> {d.label}
                            </button>
                        ))}
                    </div>
                    <div style={{ position: 'absolute', right: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.5)' }} />
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600' }}>{t('autosaved') || 'Auto-saved'}</span>
                    </div>
                </div>

                {/* Live Preview Container */}
                <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', padding: previewMode !== 'desktop' ? '24px' : '0', background: '#0f172a' }}>
                    <div style={{
                        width: previewWidth,
                        maxWidth: '100%',
                        background: 'white',
                        boxShadow: previewMode !== 'desktop' ? '0 20px 60px rgba(0,0,0,0.5)' : 'none',
                        borderRadius: previewMode !== 'desktop' ? '16px' : '0',
                        overflow: 'hidden',
                        transition: 'width 0.3s ease'
                    }}>
                        <PublicWebsite overrideData={previewOverrideData} />
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

                                        {!['HERO', 'FEATURES', 'PRICING', 'SERVICES', 'PRODUCTS', 'CONTACT'].includes(activeSection.type) && (
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
