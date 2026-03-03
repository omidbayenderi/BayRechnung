import React, { useState } from 'react';
import { useWebsite } from '../../context/WebsiteContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    Layout, Eye, EyeOff, Trash2, PlusCircle, Monitor,
    Edit3, RefreshCw, ShoppingCart, ArrowLeft, ArrowRight,
    Type, Image as ImageIcon, List, FileText, CheckCircle,
    ChevronRight, Save, LayoutTemplate, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WebsiteEditor = () => {
    const {
        sections, updateSection, toggleSectionVisibility,
        addSection, deleteSection, siteConfig, updateSiteConfig,
        publishSite
    } = useWebsite();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [selectedSection, setSelectedSection] = useState(sections[0]?.id || 'hero');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newSectionType, setNewSectionType] = useState('text');
    const [newSectionName, setNewSectionName] = useState('');

    const activeSection = sections.find(s => s.id === selectedSection);

    const handleAddSection = () => {
        if (!newSectionName.trim()) return;

        const id = `section-${Date.now()}`;
        const newSection = {
            id,
            type: newSectionType.toUpperCase(),
            visible: true,
            data: {
                title: newSectionName,
                subtitle: '',
                content: '',
                buttonText: t('learn_more') || 'Daha Fazla',
                buttonLink: '#',
                images: [],
                items: [],
                posts: []
            }
        };

        addSection(newSection);
        setSelectedSection(id);
        setIsAddModalOpen(false);
        setNewSectionName('');
    };

    const handleDeleteSection = (id) => {
        if (window.confirm(t('delete_section_confirm') || 'Bu bölümü silmek istediğinize emin misiniz?')) {
            deleteSection(id);
            if (selectedSection === id) {
                setSelectedSection(sections.find(s => s.id !== id)?.id || null);
            }
        }
    };

    return (
        <div className="page-container" style={{ padding: '0', display: 'flex', height: 'calc(100vh - 80px)', overflow: 'hidden', background: '#f1f5f9' }}>

            {/* Premium Sidebar */}
            <div style={{
                width: '340px',
                background: 'white',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '4px 0 20px rgba(0,0,0,0.02)',
                zIndex: 10
            }}>
                <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <button
                            onClick={() => navigate('/website/dashboard')}
                            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#64748b' }}
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>{t('site_builder') || 'Site Oluşturucu'}</h2>
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '14px',
                            border: '2px dashed #bfdbfe',
                            background: '#f0f9ff',
                            color: '#3b82f6',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <PlusCircle size={18} /> {t('add_new_section') || 'Bölüm Ekle'}
                    </button>
                </div>

                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 8px' }}>
                        {t('active_sections') || 'AKTİF BÖLÜMLER'}
                    </h3>

                    {sections.map((section) => (
                        <div
                            key={section.id}
                            onClick={() => setSelectedSection(section.id)}
                            style={{
                                padding: '14px 16px',
                                borderRadius: '14px',
                                background: selectedSection === section.id ? '#eff6ff' : 'white',
                                border: `1px solid ${selectedSection === section.id ? '#3b82f6' : '#e2e8f0'}`,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxShadow: selectedSection === section.id ? '0 4px 12px rgba(59, 130, 246, 0.08)' : 'none'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    background: section.visible ? '#10b981' : '#cbd5e1'
                                }} />
                                <span style={{
                                    fontWeight: '700',
                                    fontSize: '0.9rem',
                                    color: selectedSection === section.id ? 'var(--primary)' : 'var(--text-main)',
                                    opacity: section.visible ? 1 : 0.6
                                }}>
                                    {section.id === 'hero' ? 'Hero' : section.data.title || section.type}
                                </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleSectionVisibility(section.id); }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: section.visible ? '#3b82f6' : '#94a3b8' }}
                                >
                                    {section.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                                {section.id !== 'hero' && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteSection(section.id); }}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#f87171' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Editor Canvas */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
                {activeSection ? (
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        {/* Section Header Controls */}
                        <div style={{
                            background: 'white',
                            padding: '24px 32px',
                            borderRadius: '24px',
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                            border: '1px solid var(--border)'
                        }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>
                                    {t(`section_${activeSection.type.toLowerCase()}`) || activeSection.type}
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                    <div style={{ padding: '4px 8px', background: activeSection.visible ? '#ecfdf5' : '#f1f5f9', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold', color: activeSection.visible ? '#10b981' : '#64748b' }}>
                                        {activeSection.visible ? (t('visible_on_site') || 'SİTEDE GÖRÜNÜR') : (t('hidden_on_site') || 'GİZLENMİŞ')}
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: #{activeSection.id.slice(0, 5)}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => toggleSectionVisibility(activeSection.id)}
                                    className="secondary-btn"
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px' }}
                                >
                                    {activeSection.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                                    {activeSection.visible ? t('hide') || 'Gizle' : t('show') || 'Göster'}
                                </button>
                                {activeSection.id !== 'hero' && (
                                    <button
                                        onClick={() => handleDeleteSection(activeSection.id)}
                                        style={{
                                            padding: '10px 16px', borderRadius: '12px', border: '1px solid #fecaca',
                                            background: '#fef2f2', color: '#ef4444', fontWeight: 'bold',
                                            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                                        }}
                                    >
                                        <Trash2 size={18} /> {t('delete') || 'Sil'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Content Form */}
                        <div style={{
                            background: 'white',
                            padding: '40px',
                            borderRadius: '24px',
                            boxShadow: '0 4px 30px rgba(0,0,0,0.04)',
                            border: '1px solid var(--border)'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                {/* HERO Editor */}
                                {activeSection.type === 'HERO' && (
                                    <>
                                        <EditorField
                                            label={t('hero_title') || 'Ana Başlık'}
                                            value={activeSection.data.title}
                                            onChange={(val) => updateSection(activeSection.id, { title: val })}
                                            placeholder="Göz alıcı bir başlık yazın..."
                                        />
                                        <EditorField
                                            label={t('hero_subtitle') || 'Alt Başlık'}
                                            value={activeSection.data.subtitle}
                                            isTextArea
                                            onChange={(val) => updateSection(activeSection.id, { subtitle: val })}
                                            placeholder="İşinizi kısaca özetleyin..."
                                        />
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            <EditorField
                                                label={t('button_text') || 'Buton Metni'}
                                                value={activeSection.data.buttonText}
                                                onChange={(val) => updateSection(activeSection.id, { buttonText: val })}
                                            />
                                            <EditorField
                                                label={t('button_link') || 'Buton Linki'}
                                                value={activeSection.data.buttonLink}
                                                onChange={(val) => updateSection(activeSection.id, { buttonLink: val })}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* ABOUT Editor */}
                                {activeSection.type === 'ABOUT' && (
                                    <>
                                        <EditorField
                                            label={t('about_title') || 'Bölüm Başlığı'}
                                            value={activeSection.data.title}
                                            onChange={(val) => updateSection(activeSection.id, { title: val })}
                                        />
                                        <EditorField
                                            label={t('about_content') || 'Hakkımızda Metni'}
                                            value={activeSection.data.content}
                                            isTextArea
                                            onChange={(val) => updateSection(activeSection.id, { content: val })}
                                        />
                                    </>
                                )}

                                {/* SERVICES Automated Area */}
                                {activeSection.type === 'SERVICES' && (
                                    <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
                                        <div style={{ width: '64px', height: '64px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#10b981', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)' }}>
                                            <RefreshCw size={32} />
                                        </div>
                                        <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: '800' }}>{t('automated_section') || 'Otomatik Bölüm'}</h4>
                                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                            {t('sync_desc') || 'Bu bölüm Randevu sistemindeki hizmetlerinizle otomatik olarak güncellenir. Bir hizmet eklediğinizde veya sildiğinizde burada anında yansır.'}
                                        </p>
                                        <button
                                            onClick={() => navigate('/services')}
                                            style={{ marginTop: '24px', padding: '12px 24px', borderRadius: '12px', background: 'white', border: '1px solid #cbd5e1', fontWeight: '700', cursor: 'pointer', color: 'var(--text-main)' }}
                                        >
                                            {t('manage_services') || 'Hizmetleri Yönet'}
                                        </button>
                                    </div>
                                )}

                                {/* PRODUCTS Automated Area */}
                                {activeSection.type === 'PRODUCTS' && (
                                    <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
                                        <div style={{ width: '64px', height: '64px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#3b82f6', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)' }}>
                                            <ShoppingCart size={32} />
                                        </div>
                                        <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: '800' }}>{t('smart_store_sync') || 'Akıllı Stok Senkronizasyonu'}</h4>
                                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                            {t('product_sync_desc') || 'Stok modülündeki tüm aktif ürünleriniz otomatik olarak buraya yüklenir. Müşterileriniz ürünlerinizi inceleyebilir.'}
                                        </p>
                                        <button
                                            onClick={() => navigate('/stock')}
                                            style={{ marginTop: '24px', padding: '12px 24px', borderRadius: '12px', background: 'white', border: '1px solid #cbd5e1', fontWeight: '700', cursor: 'pointer', color: 'var(--text-main)' }}
                                        >
                                            {t('manage_inventory') || 'Stok Yönetimi'}
                                        </button>
                                    </div>
                                )}

                                {/* Generic Sections */}
                                {['TEXT', 'GALLERY', 'BLOG'].includes(activeSection.type) && (
                                    <EditorField
                                        label={t('section_title') || 'Bölüm Başlığı'}
                                        value={activeSection.data.title}
                                        onChange={(val) => updateSection(activeSection.id, { title: val })}
                                    />
                                )}

                                <div style={{ marginTop: '20px', padding: '24px', background: '#f0f9ff', borderRadius: '16px', border: '1px solid #e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0369a1' }}>
                                            <CheckCircle size={20} />
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#0369a1', fontWeight: '600' }}>
                                            {t('changes_auto_saved') || 'Tüm değişiklikler anlık olarak taslağınıza kaydedilir.'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            publishSite();
                                            alert(t('site_published') || 'Siteniz başarıyla yayınlandı ve kaydedildi.');
                                        }}
                                        style={{
                                            padding: '8px 16px', borderRadius: '10px', background: 'white',
                                            border: '1px solid #bae6fd', color: '#0369a1', fontSize: '0.8rem',
                                            fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                                        }}
                                    >
                                        <Edit3 size={14} /> {t('save_manually') || 'Manüel Kaydet'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
                            <Layout size={40} color="#cbd5e1" />
                        </div>
                        <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-main)', fontSize: '1.25rem' }}>{t('no_section_selected') || 'Bölüm Seçilmedi'}</h3>
                        <p style={{ margin: 0, maxWidth: '300px', lineHeight: '1.5' }}>{t('select_to_edit') || 'Düzenlemek için sol taraftan bir bölüm seçin.'}</p>
                    </div>
                )}
            </div>

            {/* Add Section Modal */}
            {isAddModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div style={{ background: 'white', padding: '40px', borderRadius: '32px', width: '500px', maxWidth: '95%', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>{t('add_new_section') || 'Yeni Bölüm Ekle'}</h2>
                            <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', color: 'var(--text-main)' }}>{t('section_name') || 'Bölüm Adı'}</label>
                            <input
                                autoFocus
                                className="form-input"
                                placeholder="Örn: Referanslarımız"
                                value={newSectionName}
                                onChange={(e) => setNewSectionName(e.target.value)}
                                style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                            />
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', marginBottom: '12px', fontWeight: '700', color: 'var(--text-main)' }}>{t('select_type') || 'İçerik Tipi'}</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {[
                                    { type: 'text', icon: Type, label: t('text_section') || 'Metin' },
                                    { type: 'gallery', icon: ImageIcon, label: t('gallery_section') || 'Galeri' },
                                    { type: 'blog', icon: FileText, label: t('blog_section') || 'Blog' },
                                    { type: 'features', icon: List, label: t('features_section') || 'Özellikler' }
                                ].map(item => (
                                    <button
                                        key={item.type}
                                        onClick={() => setNewSectionType(item.type)}
                                        style={{
                                            padding: '16px', borderRadius: '16px',
                                            border: `2px solid ${newSectionType === item.type ? 'var(--primary)' : '#f1f5f9'}`,
                                            background: newSectionType === item.type ? '#eff6ff' : 'white',
                                            color: newSectionType === item.type ? 'var(--primary)' : '#64748b',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s'
                                        }}
                                    >
                                        <item.icon size={20} />
                                        <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button onClick={() => setIsAddModalOpen(false)} style={{ flex: 1, padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '700', cursor: 'pointer' }}>{t('cancel') || 'İptal'}</button>
                            <button onClick={handleAddSection} style={{ flex: 1, padding: '16px', borderRadius: '16px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)' }}>{t('add') || 'Ekle'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const EditorField = ({ label, value, onChange, placeholder, isTextArea = false }) => (
    <div className="form-group">
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>{label}</label>
        {isTextArea ? (
            <textarea
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={5}
                style={{
                    width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #cbd5e1',
                    fontSize: '0.95rem', fontFamily: 'inherit', lineHeight: '1.6', resize: 'vertical'
                }}
            />
        ) : (
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #cbd5e1',
                    fontSize: '0.95rem'
                }}
            />
        )}
    </div>
);

export default WebsiteEditor;
