import React from 'react';
import { 
    Layout, Image as ImageIcon, Briefcase, Calendar, Map, Globe, 
    FileText, MessageSquare, Star, Hash, ShoppingCart, Layers, Palette, Plus, List, GripVertical, Type, Newspaper
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const SectionLibrary = ({ onAddSection }) => {
    const { t } = useLanguage();

    const SECTION_TEMPLATES = [
        { type: 'hero', icon: <Layout />, label: t('theme_section_hero') || 'Hero Bereich', defaultData: { title: 'Headline', subtitle: 'Sub-headline...', buttonText: 'Click Me' } },
        { type: 'text', icon: <Type />, label: t('theme_section_text') || 'Text Bereich', defaultData: { title: 'Başlık', content: 'Buraya metninizi ekleyin...' } },
        { type: 'gallery', icon: <ImageIcon />, label: t('theme_section_gallery') || 'Galerie', defaultData: { title: 'Çalışmalarımız', images: [] } },
        { type: 'button', icon: <Plus />, label: t('theme_section_button') || 'Buton Ekleme', defaultData: { text: 'Tıkla', link: '#', style: { textAlign: 'center' } } },
        { type: 'faq', icon: <List />, label: t('theme_section_faq') || 'FAQ (Soru-Cevap)', defaultData: { title: 'Sık Sorulan Sorular', items: [{ q: 'Soru?', a: 'Cevap...' }] } }
    ];

    const handleDragStart = (e, template) => {
        const fullTemplate = {
            id: template.type + '_' + Math.random().toString(36).substr(2, 9),
            type: template.type.toUpperCase(),
            visible: true,
            data: { ...template.defaultData, style: { padding: 'normal' } }
        };
        e.dataTransfer.setData('section_template', JSON.stringify(fullTemplate));
        e.dataTransfer.dropEffect = 'copy';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.05em', paddingLeft: 4 }}>
                {t('drag_n_drop_to_add') || 'Bileşen Ekle'}
            </div>
            
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '12px',
                padding: '4px'
            }}>
                {SECTION_TEMPLATES.map((tmpl) => {
                    const iconColor = {
                        hero: '#3b82f6', text: '#6366f1', gallery: '#ec4899', 
                        button: '#f59e0b', faq: '#8b5cf6'
                    }[tmpl.type] || '#64748b';

                    return (
                        <div
                            key={tmpl.type}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '16px 12px',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '16px',
                                cursor: 'not-allowed',
                                userSelect: 'none',
                                opacity: 0.6,
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: 6,
                                right: -20,
                                background: '#f59e0b',
                                color: 'white',
                                fontSize: '0.5rem',
                                fontWeight: '900',
                                padding: '2px 25px',
                                transform: 'rotate(45deg)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                textTransform: 'uppercase'
                            }}>
                                {t('coming_soon') || 'Çok Yakında'}
                            </div>

                            <div style={{
                                width: '42px',
                                height: '42px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: `${iconColor}12`,
                                color: iconColor,
                                borderRadius: '12px',
                                filter: 'grayscale(1)'
                            }}>
                                {React.cloneElement(tmpl.icon, { size: 22, strokeWidth: 2.5 })}
                            </div>
                            <span style={{ 
                                fontWeight: '700', 
                                fontSize: '0.7rem', 
                                textAlign: 'center', 
                                color: '#94a3b8',
                                lineHeight: 1.2
                            }}>
                                {tmpl.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div style={{ 
                marginTop: 12, 
                padding: '16px', 
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
                borderRadius: '16px', 
                border: '1px solid #bae6fd',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
            }}>
                <div style={{ 
                    padding: '8px', 
                    background: 'white', 
                    borderRadius: '10px', 
                    color: '#0369a1',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                }}>
                    <Plus size={16} strokeWidth={3} />
                </div>
                <div>
                    <div style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: '800', marginBottom: 2 }}>{t('tip') || 'İpucu'}</div>
                    <div style={{ fontSize: '0.65rem', color: '#0c4a6e', lineHeight: 1.4, opacity: 0.8 }}>
                        {t('drag_component_instruction') || 'Bir bileşeni tutup sürükleyerek sitenize ekleyebilirsiniz veya tıklayarak sona ekleyebilirsiniz.'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SectionLibrary;
