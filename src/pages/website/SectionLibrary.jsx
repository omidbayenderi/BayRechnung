import React from 'react';
import { 
    Layout, Image as ImageIcon, Briefcase, Calendar, Map, Globe, 
    FileText, MessageSquare, Star, Hash, ShoppingCart, Layers, Palette, Plus
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const SectionLibrary = ({ onAddSection }) => {
    const { t } = useLanguage();

    const SECTION_TEMPLATES = [
        { type: 'hero', icon: <Layout />, label: 'Hero / Banner', defaultData: { title: 'Headline', subtitle: 'Sub-headline...' } },
        { type: 'about', icon: <Briefcase />, label: 'About Us', defaultData: { title: 'Who We Are', text: 'Our story...' } },
        { type: 'services', icon: <Calendar />, label: 'Our Services', defaultData: { title: 'What We Offer', autoPull: true } },
        { type: 'products', icon: <ShoppingCart />, label: 'Products', defaultData: { title: 'Featured Products', autoPull: true } },
        { type: 'gallery', icon: <ImageIcon />, label: 'Gallery', defaultData: { title: 'Our Work', images: [] } },
        { type: 'features', icon: <Layers />, label: 'Features', defaultData: { title: 'Key Benefits', items: [{ title: 'Feature', description: '' }] } },
        { type: 'pricing', icon: <Palette />, label: 'Pricing Plans', defaultData: { title: 'Simple Pricing', items: [{ name: 'Standard', price: '99', features: [] }] } },
        { type: 'faq', icon: <FileText />, label: 'FAQ', defaultData: { title: 'Common Questions', items: [{ q: '?', a: '!' }] } },
        { type: 'testimonials', icon: <Star />, label: 'Testimonials', defaultData: { title: 'Client Feedback', items: [{ author: 'Name', quote: '' }] } },
        { type: 'contact', icon: <Map />, label: 'Contact Us', defaultData: { title: 'Get in Touch' } },
        { type: 'stats', icon: <Hash />, label: 'Statistics', defaultData: { items: [{ label: 'Completed Jobs', value: '500+' }] } }
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>
                Drag & Drop to Add
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {SECTION_TEMPLATES.map((tmpl) => (
                    <div
                        key={tmpl.type}
                        draggable
                        onDragStart={(e) => handleDragStart(e, tmpl)}
                        onClick={() => onAddSection(tmpl)}
                        style={{
                            padding: '14px 10px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            cursor: 'grab',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s',
                            userSelect: 'none'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#3b82f6';
                            e.currentTarget.style.background = '#eff6ff';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <div style={{ color: '#3b82f6' }}>{React.cloneElement(tmpl.icon, { size: 20 })}</div>
                        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#1e293b', textAlign: 'center' }}>{tmpl.label}</span>
                    </div>
                ))}
            </div>
            
            <div style={{ marginTop: 20, padding: 16, background: '#f0f9ff', borderRadius: 12, border: '1px solid #bae6fd' }}>
                <div style={{ fontSize: '0.7rem', color: '#0369a1', fontWeight: '700', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Plus size={14} /> Tip
                </div>
                <div style={{ fontSize: '0.65rem', color: '#0c4a6e', marginTop: 4, lineHeight: 1.4 }}>
                    Drag any component from here directly onto the website preview to place it exactly where you want.
                </div>
            </div>
        </div>
    );
};

export default SectionLibrary;
