import React from 'react';
import { useEditor } from '../../../context/EditorContext';
import { Trash2, Copy, Layers, Image as ImageIcon } from 'lucide-react';
import MediaGalleryModal from './Gallery/MediaGalleryModal';

const RightSidebar = () => {
    const { selectedElement, updateElement, removeElement, addElement } = useEditor();
    const [isGalleryOpen, setIsGalleryOpen] = React.useState(false);

    if (!selectedElement) {
        const { siteConfig, updateSiteConfig } = useEditor();

        return (
            <div style={{
                width: '320px',
                background: 'white',
                borderLeft: '1px solid #e2e8f0',
                height: 'calc(100vh - 60px)',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>Genel Site Ayarları</h3>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Tüm sayfayı etkileyen ayarlar</p>
                </div>

                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* THEME MODE */}
                    <div>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>Görünüm Modu</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <button 
                                onClick={() => updateSiteConfig({ themeMode: 'light' })}
                                style={{ 
                                    padding: '10px', 
                                    borderRadius: '8px', 
                                    border: siteConfig?.themeMode === 'light' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                                    background: siteConfig?.themeMode === 'light' ? '#eff6ff' : 'white',
                                    color: siteConfig?.themeMode === 'light' ? '#2563eb' : '#475569',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.85rem'
                                }}
                            >
                                ☀️ Aydınlık
                            </button>
                            <button 
                                onClick={() => updateSiteConfig({ themeMode: 'dark' })}
                                style={{ 
                                    padding: '10px', 
                                    borderRadius: '8px', 
                                    border: siteConfig?.themeMode === 'dark' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                                    background: siteConfig?.themeMode === 'dark' ? '#eff6ff' : 'white',
                                    color: siteConfig?.themeMode === 'dark' ? '#2563eb' : '#475569',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.85rem'
                                }}
                            >
                                🌙 Karanlık
                            </button>
                        </div>
                    </div>

                    {/* BRANDING */}
                    <div>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>Kurumsal Renkler</h4>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '6px', display: 'block' }}>Ana Tema Rengi</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input 
                                    type="color" 
                                    value={siteConfig?.primaryColor || '#3b82f6'} 
                                    onChange={e => updateSiteConfig({ primaryColor: e.target.value })} 
                                    style={{ width: '40px', height: '40px', padding: 0, border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }} 
                                />
                                <input 
                                    type="text" 
                                    value={siteConfig?.primaryColor || '#3b82f6'} 
                                    onChange={e => updateSiteConfig({ primaryColor: e.target.value })} 
                                    style={{ ...inputStyle, flex: 1 }} 
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ 
                        marginTop: '40px',
                        padding: '20px',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        textAlign: 'center',
                        border: '1px dashed #e2e8f0'
                    }}>
                        <Layers size={32} color="#94a3b8" style={{ marginBottom: '12px' }} />
                        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Özelliklerini düzenlemek için tuvalden bir öğe seçin.</p>
                    </div>
                </div>
            </div>
        );
    }

    const handleChange = (key, value) => {
        updateElement(selectedElement.id, { [key]: value });
    };

    const handleDuplicate = () => {
        const newEl = { ...selectedElement, id: `el_${Date.now()}`, x: selectedElement.x + 20, y: selectedElement.y + 20 };
        addElement(newEl);
    };

    return (
        <div style={{
            width: '320px',
            background: 'white',
            borderLeft: '1px solid #e2e8f0',
            height: 'calc(100vh - 60px)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', textTransform: 'capitalize' }}>
                        {selectedElement.type} Ayarları
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: {selectedElement.id}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleDuplicate} style={{ background: '#f1f5f9', border: 'none', padding: '8px', cursor: 'pointer', borderRadius: '6px', color: '#475569' }} title="Çoğalt">
                        <Copy size={16} />
                    </button>
                    <button onClick={() => removeElement(selectedElement.id)} style={{ background: '#fef2f2', border: 'none', padding: '8px', cursor: 'pointer', borderRadius: '6px', color: '#ef4444' }} title="Sil">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* POSITION & SIZE */}
                <div>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>Konum ve Boyut</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '4px', display: 'block' }}>X (px)</label>
                            <input type="number" value={Math.round(selectedElement.x) || 0} onChange={e => handleChange('x', Number(e.target.value))} style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '4px', display: 'block' }}>Y (px)</label>
                            <input type="number" value={Math.round(selectedElement.y) || 0} onChange={e => handleChange('y', Number(e.target.value))} style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '4px', display: 'block' }}>Genişlik</label>
                            <input type="text" value={selectedElement.width || 'auto'} onChange={e => handleChange('width', e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '4px', display: 'block' }}>Yükseklik</label>
                            <input type="text" value={selectedElement.height || 'auto'} onChange={e => handleChange('height', e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '4px', display: 'block' }}>Z-Index</label>
                            <input type="number" value={selectedElement.zIndex || 1} onChange={e => handleChange('zIndex', Number(e.target.value))} style={inputStyle} />
                        </div>
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0' }} />

                {/* TEXT / CONTENT PROPERTIES */}
                {(selectedElement.type === 'text' || selectedElement.type === 'heading' || selectedElement.type === 'button') && (
                    <div>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>İçerik</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {selectedElement.type !== 'button' ? (
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '4px', display: 'block' }}>Metin</label>
                                    <textarea rows={4} value={selectedElement.text || ''} onChange={e => handleChange('text', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} />
                                </div>
                            ) : (
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '4px', display: 'block' }}>Buton Metni</label>
                                    <input type="text" value={selectedElement.text || ''} onChange={e => handleChange('text', e.target.value)} style={inputStyle} />
                                </div>
                            )}

                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '4px', display: 'block' }}>Font Boyutu (px)</label>
                                <input type="number" value={selectedElement.fontSize || 16} onChange={e => handleChange('fontSize', Number(e.target.value))} style={inputStyle} />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '4px', display: 'block' }}>Yazı Rengi</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input type="color" value={selectedElement.color || '#000000'} onChange={e => handleChange('color', e.target.value)} style={{ width: '40px', height: '36px', padding: 0, border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer' }} />
                                    <input type="text" value={selectedElement.color || '#000000'} onChange={e => handleChange('color', e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* BUTTON SPECIFIC OR BOX */}
                {(selectedElement.type === 'button' || selectedElement.type === 'box') && (
                    <div>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px', marginTop: '12px' }}>Görünüm</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '4px', display: 'block' }}>Arka Plan Rengi</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input type="color" value={selectedElement.bg || '#ffffff'} onChange={e => handleChange('bg', e.target.value)} style={{ width: '40px', height: '36px', padding: 0, border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer' }} />
                                    <input type="text" value={selectedElement.bg || '#ffffff'} onChange={e => handleChange('bg', e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '4px', display: 'block' }}>Köşe Yuvarlama (px)</label>
                                <input type="number" value={selectedElement.borderRadius || 0} onChange={e => handleChange('borderRadius', Number(e.target.value))} style={inputStyle} />
                            </div>
                        </div>
                    </div>
                )}

                {/* IMAGE SPECIFIC */}
                {selectedElement.type === 'image' && (
                    <div>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>Görsel</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '4px', display: 'block' }}>Görsel URL</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input type="text" value={selectedElement.src || ''} onChange={e => handleChange('src', e.target.value)} style={inputStyle} />
                                    <button 
                                        onClick={() => setIsGalleryOpen(true)} 
                                        style={{ 
                                            padding: '8px', 
                                            background: '#f1f5f9', 
                                            border: '1px solid #cbd5e1', 
                                            borderRadius: '6px', 
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        title="Galeriden Seç"
                                    >
                                        <ImageIcon size={16} color="#64748b" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '4px', display: 'block' }}>Sığdırma Şekli</label>
                                <select value={selectedElement.objectFit || 'cover'} onChange={e => handleChange('objectFit', e.target.value)} style={inputStyle}>
                                    <option value="cover">Kırp ve Sığdır (Cover)</option>
                                    <option value="contain">Tam Sığdır (Contain)</option>
                                    <option value="fill">Uzat (Fill)</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '4px', display: 'block' }}>Köşe Yuvarlama (px)</label>
                                <input type="number" value={selectedElement.borderRadius || 0} onChange={e => handleChange('borderRadius', Number(e.target.value))} style={inputStyle} />
                            </div>
                        </div>
                    </div>
                )}

                {/* VIDEO SPECIFIC */}
                {selectedElement.type === 'video' && (
                    <div>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>Video</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '4px', display: 'block' }}>Video URL (YouTube/MP4)</label>
                                <input type="text" value={selectedElement.src || ''} onChange={e => handleChange('src', e.target.value)} style={inputStyle} placeholder="https://..." />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <input type="checkbox" checked={selectedElement.autoplay} onChange={e => handleChange('autoplay', e.target.checked)} />
                                <label style={{ fontSize: '0.85rem' }}>Otomatik Oynat</label>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <input type="checkbox" checked={selectedElement.muted} onChange={e => handleChange('muted', e.target.checked)} />
                                <label style={{ fontSize: '0.85rem' }}>Sessiz Başlat</label>
                            </div>
                        </div>
                    </div>
                )}

                {/* MAP SPECIFIC */}
                {selectedElement.type === 'map' && (
                    <div>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>Harita</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '4px', display: 'block' }}>Adres / Konum</label>
                                <input type="text" value={selectedElement.address || ''} onChange={e => handleChange('address', e.target.value)} style={inputStyle} placeholder="İstanbul, Türkiye" />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '4px', display: 'block' }}>Yakınlaştırma (1-20)</label>
                                <input type="number" value={selectedElement.zoom || 14} onChange={e => handleChange('zoom', Number(e.target.value))} style={inputStyle} />
                            </div>
                        </div>
                    </div>
                )}

                {/* AI AGENT SPECIFIC */}
                {selectedElement.type === 'agent' && (
                    <div>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>AI Agent</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '4px', display: 'block' }}>Agent ID</label>
                                <input type="text" value={selectedElement.agentId || ''} onChange={e => handleChange('agentId', e.target.value)} style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '4px', display: 'block' }}>Karşılama Mesajı</label>
                                <textarea rows={3} value={selectedElement.welcomeMessage || ''} onChange={e => handleChange('welcomeMessage', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} />
                            </div>
                        </div>
                    </div>
                )}
                
                {selectedElement.type === 'button' && (
                    <div>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px', marginTop: '12px' }}>Aksiyon</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '4px', display: 'block' }}>Link / Action</label>
                                <select value={selectedElement.action || 'booking'} onChange={e => handleChange('action', e.target.value)} style={inputStyle}>
                                    <option value="booking">Booking Modalı Aç</option>
                                    <option value="url">URL'ye Git</option>
                                </select>
                            </div>
                            {selectedElement.action === 'url' && (
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '4px', display: 'block' }}>Hedef URL</label>
                                    <input type="text" value={selectedElement.actionUrl || ''} onChange={e => handleChange('actionUrl', e.target.value)} style={inputStyle} placeholder="https://..." />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const inputStyle = {
    width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', color: '#1e293b', outline: 'none'
};

export default RightSidebar;
