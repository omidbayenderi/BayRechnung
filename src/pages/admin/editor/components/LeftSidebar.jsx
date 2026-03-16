import React from 'react';
import { Type, Image, Square, Layout, List, Video, MessageSquare } from 'lucide-react';

const ELEMENTS = [
    { id: 'text', label: 'Metin', icon: Type, defaultProps: { type: 'text', text: 'Yeni Metin', fontSize: 16, color: '#1e293b' } },
    { id: 'heading', label: 'Başlık', icon: Type, defaultProps: { type: 'heading', text: 'Yeni Başlık', fontSize: 32, fontWeight: 'bold', color: '#0f172a' } },
    { id: 'image', label: 'Görsel', icon: Image, defaultProps: { type: 'image', src: 'https://via.placeholder.com/300x200', objectFit: 'cover' } },
    { id: 'button', label: 'Buton', icon: Square, defaultProps: { type: 'button', text: 'Tıkla', bg: '#3b82f6', color: '#ffffff', borderRadius: 8 } },
    { id: 'video', label: 'Video', icon: Video, defaultProps: { type: 'video', src: '' } },
    { id: 'box', label: 'Kutu', icon: Layout, defaultProps: { type: 'box', bg: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12 } },
    { id: 'divider', label: 'Ayırıcı', icon: List, defaultProps: { type: 'divider', height: 1, bg: '#e2e8f0' } },
    { id: 'contact', label: 'İletişim Formu', icon: MessageSquare, defaultProps: { type: 'form' } }
];

const LeftSidebar = () => {
    const handleDragStart = (e, elementType) => {
        e.dataTransfer.setData('application/react-builder', JSON.stringify(elementType));
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <div style={{
            width: '280px',
            background: 'white',
            borderRight: '1px solid #e2e8f0',
            height: 'calc(100vh - 60px)',
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
        }}>
            <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>Bileşen Ekle</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {ELEMENTS.map(el => {
                        const Icon = el.icon;
                        return (
                            <div
                                key={el.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, el.defaultProps)}
                                style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    padding: '16px 8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'grab',
                                    background: '#f8fafc',
                                    transition: 'all 0.2s',
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    color: '#475569',
                                    textAlign: 'center'
                                }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                            >
                                <Icon size={24} color="#3b82f6" strokeWidth={1.5} />
                                {el.label}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                    Bir bileşeni tutup ortadaki tuvale sürükleyin. Oradan serbestçe konumlandırabilir ve boyutlandırabilirsiniz.
                </p>
            </div>
        </div>
    );
};

export default LeftSidebar;
