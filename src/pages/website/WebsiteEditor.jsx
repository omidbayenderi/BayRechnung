import React, { useState } from 'react';
import { useWebsite } from '../../context/WebsiteContext';
import { useLanguage } from '../../context/LanguageContext';
import { ArrowLeft, Save, Eye, EyeOff, Layout, Type, Image as ImageIcon, Check, Plus, Trash2, List, FileText, Video, ShoppingBag, Palette, CheckCircle, LayoutTemplate } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WebsiteEditor = () => {
    const { sections, updateSection, toggleSectionVisibility, addSection, deleteSection, siteConfig, updateSiteConfig } = useWebsite();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id || 'hero');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newSectionType, setNewSectionType] = useState('text');
    const [newSectionName, setNewSectionName] = useState('');

    const activeSection = sections.find(s => s.id === activeSectionId);

    const handleAddSection = () => {
        if (!newSectionName.trim()) return;

        const id = newSectionName.toLowerCase().replace(/\s+/g, '-');
        // Prevent duplicate IDs simple check
        if (sections.find(s => s.id === id)) {
            alert(t('section_already_exists') || 'Bu isimde bir bölüm zaten var.');
            return;
        }

        const newSection = {
            id,
            type: newSectionType,
            visible: true,
            data: {
                title: newSectionName,
                // Default data based on type
                ...(newSectionType === 'text' && { text: t('text_section_default') || 'Buraya içeriğinizi yazın...' }),
                ...(newSectionType === 'gallery' && { images: [] }),
                ...(newSectionType === 'features' && { items: [{ title: t('feature_1') || 'Özellik 1', desc: t('description') || 'Açıklama' }] }),
                ...(newSectionType === 'blog' && {
                    posts: [
                        { id: 1, title: t('blog_welcome_title') || 'Web Sitemiz Yayında!', date: new Date().toISOString().split('T')[0], content: t('blog_welcome_content') || 'Yeni web sitemiz ile sizlere daha iyi hizmet vermeyi amaçlıyoruz.', image: null }
                    ]
                })
            }
        };

        addSection(newSection);
        setActiveSectionId(id);
        setIsAddModalOpen(false);
        setNewSectionName('');
    };

    const handleDeleteSection = (id) => {
        if (window.confirm(t('delete_section_confirm') || 'Bu bölümü silmek istediğinize emin misiniz?')) {
            deleteSection(id);
            if (activeSectionId === id) {
                setActiveSectionId(sections[0]?.id || null);
            }
        }
    };

    return (
        <div className="page-container" style={{ padding: '0', display: 'flex', height: 'calc(100vh - 80px)', overflow: 'hidden' }}>

            {/* Sidebar: Sections List */}
            <div style={{ width: '300px', background: 'white', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => navigate('/website/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{t('site_editor_title') || 'Site Editörü'}</h2>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                    <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 12px 12px', letterSpacing: '0.5px' }}>{t('sections_title') || 'Bölümler'}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {sections.map(section => (
                            <div
                                key={section.id}
                                onClick={() => setActiveSectionId(section.id)}
                                style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    background: activeSectionId === section.id ? '#eff6ff' : 'transparent',
                                    border: activeSectionId === section.id ? '1px solid #bfdbfe' : '1px solid transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span style={{ fontWeight: activeSectionId === section.id ? '600' : '400', color: activeSectionId === section.id ? '#1e40af' : 'var(--text-main)', textTransform: 'capitalize' }}>
                                    {section.data.title || section.id}
                                </span>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleSectionVisibility(section.id); }}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: section.visible ? '#10b981' : '#94a3b8', padding: '4px' }}
                                        title={section.visible ? t('hide') || 'Gizle' : t('show') || 'Göster'}
                                    >
                                        {section.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </button>
                                    {/* Allow deleting custom sections (simple logic: not core ones) */}
                                    {!['hero', 'about', 'services', 'products', 'contact'].includes(section.id) && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteSection(section.id); }}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                                            title={t('delete') || 'Sil'}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        style={{
                            width: '100%',
                            marginTop: '16px',
                            padding: '12px',
                            border: '1px dashed var(--primary)',
                            borderRadius: '8px',
                            background: '#f0f9ff',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        <Plus size={18} /> {t('add_new_section') || 'Yeni Bölüm Ekle'}
                    </button>
                </div>
            </div>

            {/* Main Area: Editor Form */}
            <div style={{ flex: 1, background: '#f8fafc', padding: '32px', overflowY: 'auto' }}>
                {activeSection ? (
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h1 style={{ margin: 0, textTransform: 'capitalize' }}>{activeSection.data.title || activeSection.id}</h1>
                                <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{t('content_type') || 'Türü'}: <span style={{ padding: '2px 8px', background: '#e2e8f0', borderRadius: '4px', fontSize: '0.8rem' }}>{activeSection.type}</span></p>
                            </div>
                        </div>

                        <div className="card" style={{ padding: '24px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)' }}>

                            {/* HERO SPECIFIC CONFIGURATION */}
                            {activeSection.id === 'hero' && (
                                <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px dashed var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#4f46e5' }}>
                                        <LayoutTemplate size={20} />
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{t('hero_appearance_title') || 'Görünüm ve Arkaplan'}</h3>
                                    </div>

                                    {/* Mode Selection */}
                                    <div className="form-group" style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500' }}>{t('appearance_mode') || 'Görünüm Modu'}</label>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button
                                                onClick={() => updateSiteConfig({ ...siteConfig, hero: { ...(siteConfig.hero || {}), mode: 'static' } })}
                                                style={{
                                                    flex: 1, padding: '12px', borderRadius: '8px', border: siteConfig.hero?.mode !== 'slider' ? '2px solid #4f46e5' : '1px solid var(--border)',
                                                    background: siteConfig.hero?.mode !== 'slider' ? '#eef2ff' : 'white', cursor: 'pointer', textAlign: 'center', fontSize: '0.9rem'
                                                }}
                                            >
                                                <ImageIcon size={18} style={{ display: 'block', margin: '0 auto 6px auto' }} />
                                                {t('static_visual_video') || 'Sabit Görsel / Video'}
                                            </button>
                                            <button
                                                onClick={() => updateSiteConfig({ ...siteConfig, hero: { ...(siteConfig.hero || {}), mode: 'slider' } })}
                                                style={{
                                                    flex: 1, padding: '12px', borderRadius: '8px', border: siteConfig.hero?.mode === 'slider' ? '2px solid #4f46e5' : '1px solid var(--border)',
                                                    background: siteConfig.hero?.mode === 'slider' ? '#eef2ff' : 'white', cursor: 'pointer', textAlign: 'center', fontSize: '0.9rem'
                                                }}
                                            >
                                                <ShoppingBag size={18} style={{ display: 'block', margin: '0 auto 6px auto' }} />
                                                {t('product_showcase_slider') || 'Ürün Vitrini (Slider)'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Static Content Settings */}
                                    {siteConfig.hero?.mode !== 'slider' && (
                                        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>{t('background_type') || 'Arkaplan Tipi'}</label>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {['image', 'video', 'color'].map(type => (
                                                        <button
                                                            key={type}
                                                            onClick={() => updateSiteConfig({ ...siteConfig, hero: { ...(siteConfig.hero || {}), type } })}
                                                            style={{
                                                                flex: 1, padding: '8px', borderRadius: '6px', border: siteConfig.hero?.type === type ? '1px solid #4f46e5' : '1px solid var(--border)',
                                                                background: siteConfig.hero?.type === type ? 'white' : 'transparent', color: siteConfig.hero?.type === type ? '#4f46e5' : 'inherit', cursor: 'pointer', fontSize: '0.85rem', textTransform: 'capitalize'
                                                            }}
                                                        >
                                                            {type === 'image' ? t('image') || 'Resim' : type === 'video' ? t('video') || 'Video' : t('color') || 'Renk'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {siteConfig.hero?.type !== 'color' && (
                                                <div className="form-group">
                                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>
                                                        {siteConfig.hero?.type === 'video' ? (t('video_url') || 'Video URL (MP4)') : (t('image_url') || 'Görsel URL')}
                                                    </label>
                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                                                        <input
                                                            className="form-input"
                                                            value={siteConfig.hero?.url || ''}
                                                            onChange={(e) => updateSiteConfig({ ...siteConfig, hero: { ...(siteConfig.hero || {}), url: e.target.value } })}
                                                            placeholder="https://..."
                                                            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.9rem' }}
                                                        />
                                                        {siteConfig.hero?.type === 'image' && (
                                                            <>
                                                                <label
                                                                    style={{
                                                                        padding: '0 12px',
                                                                        height: '36px',
                                                                        background: '#eff6ff',
                                                                        color: '#3b82f6',
                                                                        border: '1px solid #bfdbfe',
                                                                        borderRadius: '6px',
                                                                        cursor: 'pointer',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        whiteSpace: 'nowrap',
                                                                        fontSize: '0.85rem',
                                                                        fontWeight: '500'
                                                                    }}
                                                                    title={t('upload_image') || 'Resim Yükle'}
                                                                >
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        style={{ display: 'none' }}
                                                                        onChange={(e) => {
                                                                            const file = e.target.files[0];
                                                                            if (file) {
                                                                                if (file.size > 500000) { // Limit to ~500KB
                                                                                    alert(t('upload_file_size_error') || 'Dosya boyutu çok büyük (Max 500KB). Lütfen daha küçük bir görsel seçin.');
                                                                                    return;
                                                                                }
                                                                                const reader = new FileReader();
                                                                                reader.onloadend = () => {
                                                                                    updateSiteConfig({ ...siteConfig, hero: { ...(siteConfig.hero || {}), url: reader.result } });
                                                                                };
                                                                                reader.readAsDataURL(file);
                                                                            }
                                                                        }}
                                                                    />
                                                                    <ImageIcon size={16} style={{ marginRight: '4px' }} /> {t('upload_image') || 'Yükle'}
                                                                </label>
                                                                <button
                                                                    onClick={() => {
                                                                        const randomId = Math.floor(Math.random() * 1000);
                                                                        const randomUrl = `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80&random=${randomId}`;
                                                                        updateSiteConfig({ ...siteConfig, hero: { ...(siteConfig.hero || {}), url: randomUrl } });
                                                                    }}
                                                                    style={{ padding: '0 12px', height: '36px', background: 'white', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer' }}
                                                                    title={t('random_image') || 'Rastgele Resim'}
                                                                >
                                                                    🎲
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="form-group" style={{ marginTop: '16px' }}>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>
                                                    {t('overlay_opacity') || 'Koyuluk Filtresi'} %{Math.round((siteConfig.hero?.overlay || 0.4) * 100)}
                                                </label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="0.9"
                                                    step="0.1"
                                                    value={siteConfig.hero?.overlay ?? 0.4}
                                                    onChange={(e) => updateSiteConfig({ ...siteConfig, hero: { ...(siteConfig.hero || {}), overlay: parseFloat(e.target.value) } })}
                                                    style={{ width: '100%', cursor: 'pointer' }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {siteConfig.hero?.mode === 'slider' && (
                                        <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', color: '#166534', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <CheckCircle size={16} />
                                            <span>{t('slider_active_msg') || 'Slider aktif. Stoktaki ürünler otomatik dönecektir.'}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Common: Title */}
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{t('section_title_label') || 'Başlık'}</label>
                                <input
                                    className="form-input"
                                    value={activeSection.data.title || ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        updateSection(activeSection.id, { title: val });
                                        // Sync with siteConfig for Premium Themes (like ServiceTheme)
                                        if (activeSection.id === 'hero') {
                                            updateSiteConfig({ ...siteConfig, hero: { ...(siteConfig.hero || {}), title: val } });
                                        }
                                    }}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                                />
                            </div>

                            {/* Common: Text/Description */}
                            {(activeSection.data.subtitle !== undefined || activeSection.data.text !== undefined) && (
                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{t('section_content_label') || 'İçerik Metni'}</label>
                                    <textarea
                                        className="form-input"
                                        rows={6}
                                        value={activeSection.data.subtitle || activeSection.data.text || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            updateSection(activeSection.id, activeSection.data.subtitle !== undefined ? { subtitle: val } : { text: val });
                                            // Sync with siteConfig for Premium Themes
                                            if (activeSection.id === 'hero') {
                                                updateSiteConfig({ ...siteConfig, hero: { ...(siteConfig.hero || {}), description: val } });
                                            }
                                        }}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: 'inherit' }}
                                    />
                                </div>
                            )}

                            {/* Type Specific: Features/List */}
                            {activeSection.type === 'features' && (
                                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <p style={{ fontWeight: '600', marginBottom: '12px' }}>{t('features_list_coming_soon') || 'Özellik Listesi (Yakında)'}</p>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('features_editor_desc') || 'Liste elemanlarını düzenleme özelliği eklenecek.'}</p>
                                </div>
                            )}

                            {/* Type Specific: Gallery */}
                            {activeSection.type === 'gallery' && (
                                <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <p style={{ fontWeight: '600', margin: 0 }}>{t('gallery_images') || 'Galeri Görselleri'}</p>
                                        <label className="secondary-btn" style={{ fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', background: 'white' }}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            const currentImages = activeSection.data.images || [];
                                                            updateSection(activeSection.id, {
                                                                images: [...currentImages, reader.result]
                                                            });
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                            <Plus size={14} /> {t('add_new') || 'Yeni Ekle'}
                                        </label>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
                                        {(activeSection.data.images || []).map((img, idx) => (
                                            <div key={idx} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                                <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <button
                                                    style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    onClick={() => {
                                                        const newImages = activeSection.data.images.filter((_, i) => i !== idx);
                                                        updateSection(activeSection.id, { images: newImages });
                                                    }}
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        {(!activeSection.data.images || activeSection.data.images.length === 0) && (
                                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '20px', color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: '8px', fontSize: '0.9rem' }}>
                                                {t('no_images_added') || 'Henüz resim eklenmedi.'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Button Text (Hero Section Only usually) */}
                            {activeSection.data.buttonText !== undefined && (
                                <div className="form-group" style={{ marginTop: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{t('button_text_label') || 'Buton Yazısı'}</label>
                                    <input
                                        className="form-input"
                                        value={activeSection.data.buttonText}
                                        onChange={(e) => updateSection(activeSection.id, { buttonText: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                                    />
                                </div>
                            )}

                            {/* Special Logic Info */}
                            {activeSection.data.autoPull !== undefined && (
                                <div style={{ marginTop: '20px', padding: '16px', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0369a1', fontWeight: '600' }}>
                                        <Layout size={20} />
                                        <span>{t('auto_content_pull') || 'Otomatik İçerik'}</span>
                                    </div>
                                    <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: '#0c4a6e' }}>
                                        {t('this_section_pulls') || 'Bu bölüm,'} <strong>{activeSection.data.source === 'stock' ? (t('auto_pull_stock') || 'Stoktaki Ürünleri') : (t('auto_pull_services') || 'Tanımlı Randevu Hizmetlerini')}</strong> {t('auto_pulls_suffix') || 'otomatik çeker.'}
                                    </p>
                                </div>
                            )}

                            {activeSection.data.showMap !== undefined && (
                                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <input
                                        type="checkbox"
                                        checked={activeSection.data.showMap}
                                        onChange={(e) => updateSection(activeSection.id, { showMap: e.target.checked })}
                                        style={{ width: '20px', height: '20px' }}
                                    />
                                    <label>{t('show_map') || 'Haritayı Göster'}</label>
                                </div>
                            )}

                            {/* Type Specific: Blog / News */}
                            {activeSection.type === 'blog' && (
                                <div style={{ marginTop: '20px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--primary)', fontWeight: 'bold' }}>
                                        <FileText size={20} />
                                        <span>{t('news_announcements_title') || 'Haber ve Duyuru Yönetimi'}</span>
                                    </div>

                                    {/* Add New Post Form */}
                                    <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '24px' }}>
                                        <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem' }}>{t('add_new_content') || 'Yeni İçerik Ekle'}</h4>

                                        <div className="form-group">
                                            <input
                                                className="form-input"
                                                placeholder={t('post_title_placeholder') || 'Başlık (Örn: Bayram İndirimi)'}
                                                id="new-post-title"
                                                style={{ width: '100%', marginBottom: '12px', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                                            />
                                            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                                <input
                                                    type="date"
                                                    className="form-input"
                                                    id="new-post-date"
                                                    defaultValue={new Date().toISOString().split('T')[0]}
                                                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                                                />
                                                <label style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '10px', border: '1px dashed var(--primary)', borderRadius: '8px', cursor: 'pointer', color: 'var(--primary)', justifyContent: 'center', gap: '8px', background: '#eff6ff' }}>
                                                    <input type="file" accept="image/*" id="new-post-image-input" style={{ display: 'none' }} onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                document.getElementById('post-img-preview').src = reader.result;
                                                                document.getElementById('post-img-preview').style.display = 'block';
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }} />
                                                    <ImageIcon size={18} /> {t('select_image') || 'Resim Seç'}
                                                </label>
                                            </div>
                                            <img id="post-img-preview" src="" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', display: 'none', marginBottom: '12px' }} />
                                            <textarea
                                                className="form-input"
                                                placeholder={t('post_content_placeholder') || 'İçerik...'}
                                                id="new-post-content"
                                                rows={4}
                                                style={{ width: '100%', marginBottom: '12px', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', resize: 'none' }}
                                            />
                                            <button
                                                className="primary-btn"
                                                style={{ width: '100%', padding: '12px', borderRadius: '8px', fontWeight: 'bold' }}
                                                onClick={() => {
                                                    const title = document.getElementById('new-post-title').value;
                                                    const date = document.getElementById('new-post-date').value;
                                                    const content = document.getElementById('new-post-content').value;
                                                    const image = document.getElementById('post-img-preview').src;

                                                    if (!title || !content) {
                                                        alert(t('fill_required_fields') || 'Lütfen başlık ve içerik girin.');
                                                        return;
                                                    }

                                                    const newPost = {
                                                        id: Date.now(),
                                                        title,
                                                        date,
                                                        content,
                                                        image: image && image.startsWith('data:') ? image : null
                                                    };

                                                    const currentPosts = activeSection.data.posts || [];
                                                    updateSection(activeSection.id, { posts: [newPost, ...currentPosts] });

                                                    // Clear fields
                                                    document.getElementById('new-post-title').value = '';
                                                    document.getElementById('new-post-content').value = '';
                                                    document.getElementById('post-img-preview').src = '';
                                                    document.getElementById('post-img-preview').style.display = 'none';
                                                }}
                                            >
                                                {t('publish_button') || 'Yayınla'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Post List */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {activeSection.data.posts && activeSection.data.posts.map((post, idx) => (
                                            <div key={post.id || idx} style={{ display: 'flex', gap: '12px', padding: '12px', background: 'white', borderRadius: '12px', border: '1px solid var(--border)', alignItems: 'center' }}>
                                                <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: '#f1f5f9', overflow: 'hidden', flexShrink: 0 }}>
                                                    {post.image ? <img src={post.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#cbd5e1' }}><FileText size={24} /></div>}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <h5 style={{ margin: '0 0 4px 0', fontSize: '0.95rem' }}>{post.title}</h5>
                                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{post.date} • {post.content?.substring(0, 30)}...</p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const newPosts = activeSection.data.posts.filter(p => p.id !== post.id);
                                                        updateSection(activeSection.id, { posts: newPosts });
                                                    }}
                                                    style={{ padding: '8px', color: '#ef4444', background: '#fee2e2', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                        <p>{t('edit_select_section_msg') || 'Düzenlemek için soldan bir bölüm seçin veya yeni ekleyin.'}</p>
                    </div>
                )}
            </div>

            {/* Add Section Modal */}
            {isAddModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '400px', maxWidth: '90%' }}>
                        <h2 style={{ margin: '0 0 20px 0', fontSize: '1.25rem' }}>{t('add_page_section_title') || 'Yeni Sayfa/Bölüm Ekle'}</h2>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{t('model_section_name') || 'Bölüm Adı'}</label>
                            <input
                                autoFocus
                                className="form-input"
                                placeholder="Örn: Referanslar"
                                value={newSectionName}
                                onChange={(e) => setNewSectionName(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{t('model_content_type') || 'İçerik Tipi'}</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <button className="select-btn" onClick={() => setNewSectionType('text')} style={{ ...typeBtnStyle(newSectionType === 'text') }}>
                                    <Type size={18} /> {t('text_section') || 'Metin Yazısı'}
                                </button>
                                <button className="select-btn" onClick={() => setNewSectionType('gallery')} style={{ ...typeBtnStyle(newSectionType === 'gallery') }}>
                                    <ImageIcon size={18} /> {t('gallery_section') || 'Resim/Galeri'}
                                </button>
                                <button className="select-btn" onClick={() => setNewSectionType('features')} style={{ ...typeBtnStyle(newSectionType === 'features') }}>
                                    <List size={18} /> {t('features_section') || 'Özellik Listesi'}
                                </button>
                                <button className="select-btn" onClick={() => setNewSectionType('blog')} style={{ ...typeBtnStyle(newSectionType === 'blog') }}>
                                    <FileText size={18} /> {t('blog_section') || 'Duyurular / Blog'}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="secondary-btn" onClick={() => setIsAddModalOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', cursor: 'pointer' }}>{t('cancel') || 'İptal'}</button>
                            <button className="primary-btn" onClick={handleAddSection} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer' }}>{t('add') || 'Ekle'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const typeBtnStyle = (isActive) => ({
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid ' + (isActive ? 'var(--primary)' : 'var(--border)'),
    background: isActive ? '#eff6ff' : 'white',
    color: isActive ? 'var(--primary)' : '#64748b',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer'
});

export default WebsiteEditor;
