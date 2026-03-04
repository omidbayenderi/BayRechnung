import React, { useState } from 'react';
import { useWebsite } from '../../context/WebsiteContext';
import { useLanguage } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Layout, Eye, EyeOff, Trash2, PlusCircle, Monitor,
    Edit3, RefreshCw, ShoppingCart, ArrowLeft, ArrowRight,
    Type, Image as ImageIcon, List, FileText, CheckCircle,
    ChevronRight, Save, LayoutTemplate, X, Briefcase, Calendar, Map, Globe,
    ChevronDown, Plus, MessageSquare, Layers, Paperclip, Star, Hash, Settings, Palette
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WebsiteEditor = () => {
    const {
        sections, updateSection, toggleSectionVisibility,
        addSection, deleteSection, moveSection, siteConfig, updateSiteConfig,
        publishSite
    } = useWebsite();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [selectedSection, setSelectedSection] = useState(sections[0]?.id || 'hero');
    const [activeTab, setActiveTab] = useState('sections'); // sections, design, seo, advanced
    const [editMode, setEditMode] = useState('content'); // content, style, advanced
    const [showAddModal, setShowAddModal] = useState(false);

    const SECTION_TEMPLATES = [
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
    ];

    const handleAddSection = (template) => {
        const newSection = {
            id: template.type + '_' + Math.random().toString(36).substr(2, 9),
            type: template.type.toUpperCase(),
            visible: true,
            data: { ...template.defaultData, style: { background: 'default', padding: 'normal' } }
        };
        addSection(newSection);
        setSelectedSection(newSection.id);
        setShowAddModal(false);
    };

    const handleDeleteSection = (id) => {
        if (window.confirm(t('delete_section_confirm') || 'Bu bölümü silmek istediğinize emin misiniz?')) {
            deleteSection(id);
            if (selectedSection === id) {
                setSelectedSection(sections.find(s => s.id !== id)?.id || null);
            }
        }
    };

    const activeSection = sections.find(s => s.id === selectedSection);

    return (
        <div className="page-container" style={{ padding: '0', display: 'flex', height: 'calc(100vh - 80px)', overflow: 'hidden', background: '#f8fafc' }}>

            {/* Premium Header */}
            <div style={{ position: 'fixed', top: 0, left: '360px', right: 0, height: '80px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)' }}></div>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b' }}>{t('autosaved') || 'Live Editor'}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => window.open(`/theme/demo?domain=${siteConfig.domain || 'demo'}`, '_blank')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        <Eye size={18} /> {t('preview') || 'Preview'}
                    </button>
                    <button
                        onClick={() => { publishSite(); alert(t('site_published')); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '14px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 20px rgba(59, 130, 246, 0.25)' }}
                    >
                        <Globe size={18} /> {siteConfig.isPublished ? (t('republish') || 'Republish') : (t('publish') || 'Publish')}
                    </button>
                </div>
            </div>

            {/* Sidebar */}
            <div style={{ width: '360px', background: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', zIndex: 20 }}>
                <div style={{ padding: '32px 24px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <button onClick={() => navigate('/website/dashboard')} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px', cursor: 'pointer', color: '#64748b' }}>
                            <ArrowLeft size={20} />
                        </button>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-0.02em' }}>{t('site_builder') || 'Site Builder'}</h2>
                    </div>

                    <div style={{ display: 'flex', gap: '4px', padding: '6px', background: '#f1f5f9', borderRadius: '14px', marginBottom: '20px' }}>
                        {[
                            { id: 'sections', icon: Layout, label: t('sections') || 'Sections' },
                            { id: 'design', icon: Palette, label: t('design') || 'Design' },
                            { id: 'seo', icon: Globe, label: 'SEO' },
                            { id: 'advanced', icon: Settings, label: 'Adv' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    flex: 1, padding: '10px 4px', borderRadius: '10px', border: 'none',
                                    background: activeTab === tab.id ? 'white' : 'transparent',
                                    color: activeTab === tab.id ? 'var(--primary)' : '#64748b',
                                    fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                    boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <tab.icon size={14} /> {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'sections' && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '2px dashed #bfdbfe', background: '#eff6ff', color: '#3b82f6', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        >
                            <PlusCircle size={18} /> {t('add_new_section') || 'Add Section'}
                        </button>
                    )}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                    {activeTab === 'sections' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {sections.map((section, idx) => (
                                <div
                                    key={section.id}
                                    onClick={() => setSelectedSection(section.id)}
                                    style={{
                                        padding: '16px 20px', borderRadius: '16px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        background: selectedSection === section.id ? '#f0f7ff' : 'white',
                                        border: '1px solid ' + (selectedSection === section.id ? '#bfdbfe' : '#f1f5f9'),
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{ color: selectedSection === section.id ? '#3b82f6' : '#94a3b8' }}>
                                            {SECTION_TEMPLATES.find(t => t.type.toUpperCase() === section.type.toUpperCase())?.icon || <Layout size={20} />}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '800', color: selectedSection === section.id ? '#1e40af' : '#1e293b' }}>{section.data?.title || section.type}</div>
                                            {!section.visible && <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600' }}>{t('hidden') || 'Hidden'}</div>}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button onClick={(e) => { e.stopPropagation(); toggleSectionVisibility(section.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}>
                                            {section.visible !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                                        </button>
                                        {section.type !== 'HERO' && (
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteSection(section.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', padding: '4px' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'design' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <EditorField label={t('primary_color') || 'Brand Color'} type="color" value={siteConfig.theme?.primaryColor} onChange={(val) => updateSiteConfig({ theme: { ...siteConfig.theme, primaryColor: val } })} />
                            <EditorField label={t('font_heading') || 'Heading Font'} type="select" options={[
                                { label: 'Outfit (Modern)', value: '"Outfit", sans-serif' },
                                { label: 'Inter (Standard)', value: '"Inter", sans-serif' },
                                { label: 'Playfair (Serif)', value: '"Playfair Display", serif' }
                            ]} value={siteConfig.theme?.fontHeading} onChange={(val) => updateSiteConfig({ theme: { ...siteConfig.theme, fontHeading: val } })} />
                            <EditorField label={t('border_radius') || 'Corner Radius'} type="select" options={[
                                { label: 'Small', value: '8px' }, { label: 'Medium', value: '12px' }, { label: 'Large', value: '24px' }
                            ]} value={siteConfig.theme?.radius} onChange={(val) => updateSiteConfig({ theme: { ...siteConfig.theme, radius: val } })} />
                        </div>
                    )}

                    {activeTab === 'seo' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <EditorField label={t('seo_title') || 'Meta Title'} value={siteConfig.seo?.title} onChange={(val) => updateSiteConfig({ seo: { ...siteConfig.seo, title: val } })} />
                            <EditorField label={t('seo_desc') || 'Meta Description'} isTextArea value={siteConfig.seo?.description} onChange={(val) => updateSiteConfig({ seo: { ...siteConfig.seo, description: val } })} />
                        </div>
                    )}

                    {activeTab === 'advanced' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <EditorField label={t('custom_css') || 'Custom CSS'} isTextArea placeholder="body { ... }" value={siteConfig.advanced?.customCss} onChange={(val) => updateSiteConfig({ advanced: { ...siteConfig.advanced, customCss: val } })} />
                            <EditorField label={t('head_scripts') || 'Header Scripts'} isTextArea placeholder="<!-- Analytics tags -->" value={siteConfig.advanced?.headScripts} onChange={(val) => updateSiteConfig({ advanced: { ...siteConfig.advanced, headScripts: val } })} />
                        </div>
                    )}
                </div>
            </div>

            {/* Editor Canvas */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '120px 40px 60px' }}>
                {activeSection ? (
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div style={{ background: 'white', padding: '32px', borderRadius: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #f1f5f9', marginBottom: '32px' }}>
                                {[
                                    { id: 'content', label: t('content') || 'Content', icon: FileText },
                                    { id: 'style', label: t('style') || 'Style', icon: LayoutTemplate }
                                ].map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => setEditMode(m.id)}
                                        style={{
                                            padding: '12px 20px', border: 'none', background: 'none',
                                            borderBottom: `4px solid ${editMode === m.id ? 'var(--primary)' : 'transparent'}`,
                                            color: editMode === m.id ? 'var(--primary)' : '#64748b',
                                            fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '8px'
                                        }}
                                    >
                                        <m.icon size={16} /> {m.label}
                                    </button>
                                ))}
                            </div>

                            {editMode === 'content' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {/* Section specific editors */}
                                    {activeSection.type === 'HERO' && (
                                        <>
                                            <EditorField label={t('title')} value={activeSection.data.title} onChange={v => updateSection(activeSection.id, { title: v })} />
                                            <EditorField label={t('subtitle')} isTextArea value={activeSection.data.subtitle} onChange={v => updateSection(activeSection.id, { subtitle: v })} />
                                            <EditorField label={t('button_text')} value={activeSection.data.buttonText} onChange={v => updateSection(activeSection.id, { buttonText: v })} />
                                        </>
                                    )}

                                    {activeSection.type === 'FEATURES' && (
                                        <>
                                            <EditorField label={t('section_title')} value={activeSection.data.title} onChange={v => updateSection(activeSection.id, { title: v })} />
                                            <div style={{ marginTop: '10px' }}>
                                                <h5 style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>{t('items')}</h5>
                                                {(activeSection.data.items || []).map((item, i) => (
                                                    <div key={i} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', marginBottom: '12px' }}>
                                                        <EditorField label={t('title')} value={item.title} onChange={v => {
                                                            const newItems = [...activeSection.data.items];
                                                            newItems[i] = { ...item, title: v };
                                                            updateSection(activeSection.id, { items: newItems });
                                                        }} />
                                                    </div>
                                                ))}
                                                <button onClick={() => updateSection(activeSection.id, { items: [...(activeSection.data.items || []), { title: 'New Feature', description: '' }] })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px dashed #cbd5e1', background: 'none', cursor: 'pointer' }}>+ Add Item</button>
                                            </div>
                                        </>
                                    )}

                                    {activeSection.type === 'PRICING' && (
                                        <>
                                            <EditorField label={t('section_title')} value={activeSection.data.title} onChange={v => updateSection(activeSection.id, { title: v })} />
                                            {(activeSection.data.items || []).map((plan, i) => (
                                                <div key={i} style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '16px', marginBottom: '16px' }}>
                                                    <EditorField label="Plan Name" value={plan.name} onChange={v => {
                                                        const items = [...activeSection.data.items]; items[i] = { ...plan, name: v };
                                                        updateSection(activeSection.id, { items });
                                                    }} />
                                                    <EditorField label="Price" value={plan.price} onChange={v => {
                                                        const items = [...activeSection.data.items]; items[i] = { ...plan, price: v };
                                                        updateSection(activeSection.id, { items });
                                                    }} />
                                                </div>
                                            ))}
                                        </>
                                    )}

                                    {/* Fallback for other sections */}
                                    {!['HERO', 'FEATURES', 'PRICING', 'SERVICES', 'PRODUCTS'].includes(activeSection.type) && (
                                        <>
                                            <EditorField label={t('title')} value={activeSection.data.title} onChange={v => updateSection(activeSection.id, { title: v })} />
                                            <EditorField label={t('content')} isTextArea value={activeSection.data.content || activeSection.data.text} onChange={v => updateSection(activeSection.id, { content: v })} />
                                        </>
                                    )}

                                    {['SERVICES', 'PRODUCTS'].includes(activeSection.type) && (
                                        <div style={{ padding: '40px', background: '#f8fafc', borderRadius: '24px', textAlign: 'center', border: '2px dashed #e2e8f0' }}>
                                            <RefreshCw size={32} color="#3b82f6" style={{ marginBottom: '12px' }} />
                                            <h4 style={{ margin: 0 }}>{t('automated_sync')}</h4>
                                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{t('synced_from_internal')}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {editMode === 'style' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <EditorField label={t('background')} type="select" options={[
                                        { label: 'Default', value: 'default' },
                                        { label: 'Subtle', value: 'subtle' },
                                        { label: 'Brand', value: 'brand' },
                                        { label: 'Dark', value: 'dark' }
                                    ]} value={activeSection.data.style?.background} onChange={v => updateSection(activeSection.id, { style: { ...activeSection.data.style, background: v } })} />
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                        <Layout size={64} style={{ marginBottom: '20px', opacity: 0.2 }} />
                        <h3>{t('select_to_edit')}</h3>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'white', padding: '40px', borderRadius: '32px', width: '500px', boxShadow: '0 30px 100px rgba(0,0,0,0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900' }}>{t('add_section')}</h3>
                                <button onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={24} /></button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {SECTION_TEMPLATES.map(t => (
                                    <button key={t.type} onClick={() => handleAddSection(t)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '24px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', cursor: 'pointer' }}>
                                        <div style={{ padding: '12px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>{t.icon}</div>
                                        <span style={{ fontWeight: '800', fontSize: '0.85rem' }}>{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const EditorField = ({ label, value, onChange, placeholder, isTextArea, type = 'text', options = [] }) => (
    <div style={{ marginBottom: '0px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
        {type === 'color' ? (
            <div style={{ display: 'flex', gap: '12px' }}>
                <input type="color" value={value || '#3b82f6'} onChange={e => onChange(e.target.value)} style={{ width: '50px', height: '50px', border: 'none', borderRadius: '12px', cursor: 'pointer' }} />
                <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }} />
            </div>
        ) : type === 'select' ? (
            <select value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid #e2e8f0', background: 'white' }}>
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        ) : isTextArea ? (
            <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={5} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '0.95rem', resize: 'vertical' }} />
        ) : (
            <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }} />
        )}
    </div>
);

export default WebsiteEditor;
