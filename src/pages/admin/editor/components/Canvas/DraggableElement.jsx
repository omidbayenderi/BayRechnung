import React, { useRef } from 'react';
import { Rnd } from 'react-rnd';
import { useEditor } from '../../../../context/EditorContext';
import { Upload, Link as LinkIcon, Type, Play, Plus, X, Trash2, MapPin, Bot, Video } from 'lucide-react';

const DraggableElement = ({ element }) => {
    const { 
        selectedElementId, setSelectedElementId, 
        setHoveredElementId, hoveredElementId,
        updateElement 
    } = useEditor();
    
    const fileInputRef = useRef(null);
    const isSelected = selectedElementId === element.id;
    const isHovered = hoveredElementId === element.id;

    // --- Interaction Handlers ---
    const handleDragStop = (e, d) => {
        if (d.x !== element.x || d.y !== element.y) {
            updateElement(element.id, { x: d.x, y: d.y });
        }
    };

    const handleResizeStop = (e, direction, ref, delta, position) => {
        updateElement(element.id, {
            width: ref.style.width,
            height: ref.style.height,
            x: position.x,
            y: position.y
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateElement(element.id, { src: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddGalleryImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const currentImages = element.images || [];
                updateElement(element.id, { images: [...currentImages, reader.result] });
            };
            reader.readAsDataURL(file);
        }
    };

    // --- Content Renderers ---
    const renderContent = () => {
        switch (element.type) {
            case 'text':
            case 'heading':
                return (
                    <div style={{
                        width: '100%', height: '100%',
                        fontSize: element.fontSize, fontWeight: element.fontWeight || 'normal',
                        color: element.color, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', textAlign: 'center', whiteSpace: 'pre-wrap'
                    }}>
                        {element.text}
                    </div>
                );
            case 'button':
                return (
                    <div style={{
                        width: '100%', height: '100%', background: element.bg,
                        color: element.color, borderRadius: element.borderRadius,
                        fontSize: element.fontSize, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontWeight: '600', cursor: 'default'
                    }}>
                        {element.text}
                    </div>
                );
            case 'image':
                return (
                    <img 
                        src={element.src || 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=800&auto=format&fit=crop'}
                        alt="element"
                        style={{ width: '100%', height: '100%', objectFit: element.objectFit || 'cover', borderRadius: element.borderRadius || 0, pointerEvents: 'none' }}
                    />
                );
            case 'gallery':
                const images = element.images || [];
                const mediaType = element.mediaType || 'images'; // 'images' or 'video'

                if (mediaType === 'video') {
                    const videoSrc = element.videoSrc || element.url;
                    const isYouTube = videoSrc?.includes('youtube.com') || videoSrc?.includes('youtu.be');
                    let videoId = null;
                    if (isYouTube) {
                        const match = videoSrc.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]{11})/);
                        videoId = match ? match[1] : null;
                    }

                    return (
                        <div style={{ width: '100%', height: '100%', background: '#000', position: 'relative', borderRadius: element.borderRadius || 12, overflow: 'hidden' }}>
                            {videoSrc ? (
                                isYouTube && videoId ? (
                                    <iframe 
                                        width="100%" height="100%" 
                                        src={`https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1`} 
                                        frameBorder="0" allowFullScreen 
                                        style={{ pointerEvents: isSelected ? 'none' : 'auto' }}
                                    />
                                ) : (
                                    <video src={videoSrc} width="100%" height="100%" controls style={{ pointerEvents: isSelected ? 'none' : 'auto' }} />
                                )
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                    <Play size={32} style={{ marginBottom: 8 }} />
                                    <span style={{ fontSize: '11px' }}>Video URL veya Dosya Bekleniyor</span>
                                </div>
                            )}
                        </div>
                    );
                }

                return (
                    <div style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '10px', background: '#f8fafc', borderRadius: 12 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
                            {images.map((img, i) => (
                                <div key={i} style={{ aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    {isSelected && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                updateElement(element.id, { images: images.filter((_, idx) => idx !== i) });
                                            }} 
                                            style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '4px', padding: '3px', cursor: 'pointer', display: 'flex' }}
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {images.length === 0 && (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: '11px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                    <Upload size={24} opacity={0.5} />
                                    <span>Galeriye resimlerinizi yükleyin</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'faq':
                return (
                    <div style={{
                        width: '100%', height: '100%', padding: '15px',
                        background: '#ffffff', border: '1px solid #e2e8f0',
                        borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '6px'
                    }}>
                        <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {element.question || 'Soru Buraya?'}
                            <Plus size={16} color="#3b82f6" />
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                            {element.answer || 'Cevap metni...'}
                        </div>
                    </div>
                );
            default:
                return <div style={{ padding: 20 }}>{element.type} Bileşeni</div>;
        }
    };

    return (
        <Rnd
            size={{ width: element.width || 200, height: element.height || 100 }}
            position={{ x: element.x, y: element.y }}
            onDragStop={handleDragStop}
            onResizeStop={handleResizeStop}
            onClick={(e) => { e.stopPropagation(); setSelectedElementId(element.id); }}
            onMouseEnter={() => setHoveredElementId(element.id)}
            onMouseLeave={() => setHoveredElementId(null)}
            bounds="parent"
            style={{
                zIndex: element.zIndex || 1,
                border: isSelected ? '2px solid #3b82f6' : isHovered ? '2px dashed #94a3b8' : '1px solid transparent',
                borderRadius: '4px',
                transition: 'border 0.2s ease-in-out'
            }}
            enableResizing={isSelected}
            resizeHandleClasses={{
                bottomRight: 'rh-br',
                bottomLeft: 'rh-bl',
                topRight: 'rh-tr',
                topLeft: 'rh-tl',
                right: 'rh-r',
                left: 'rh-l',
                top: 'rh-t',
                bottom: 'rh-b'
            }}
        >
            <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                {renderContent()}

                {/* --- QUICK EDIT OVERLAY --- */}
                {isSelected && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(59, 130, 246, 0.05)', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'
                    }}>
                        {/* High-Level Control Bar */}
                        <div style={{
                            position: 'absolute', top: '-45px', left: '50%', transform: 'translateX(-50%)',
                            background: '#1e293b', padding: '6px 12px', borderRadius: '8px', display: 'flex',
                            gap: '12px', alignItems: 'center', pointerEvents: 'auto', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                            whiteSpace: 'nowrap'
                        }}>
                            {element.type === 'gallery' && (
                                <>
                                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', padding: '2px', marginRight: '4px' }}>
                                        <button 
                                            onClick={() => updateElement(element.id, { mediaType: 'images' })}
                                            style={{ 
                                                background: (element.mediaType || 'images') === 'images' ? '#3b82f6' : 'transparent',
                                                border: 'none', color: '#fff', fontSize: '10px', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer'
                                            }}
                                        >
                                            Galeri
                                        </button>
                                        <button 
                                            onClick={() => updateElement(element.id, { mediaType: 'video' })}
                                            style={{ 
                                                background: element.mediaType === 'video' ? '#3b82f6' : 'transparent',
                                                border: 'none', color: '#fff', fontSize: '10px', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer'
                                            }}
                                        >
                                            Video
                                        </button>
                                    </div>

                                    {(element.mediaType || 'images') === 'images' ? (
                                        <button 
                                            onClick={() => fileInputRef.current?.click()} 
                                            style={{ background: '#3b82f6', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '4px' }}
                                        >
                                            <Upload size={14} /> Resim Ekle
                                        </button>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <LinkIcon size={14} color="#94a3b8" />
                                            <input 
                                                defaultValue={element.videoSrc || element.url}
                                                placeholder="YouTube URL..."
                                                onBlur={(e) => updateElement(element.id, { videoSrc: e.target.value })}
                                                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', width: '130px', outline: 'none' }}
                                            />
                                            <button 
                                                onClick={() => fileInputRef.current?.click()} 
                                                style={{ background: '#3b82f6', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' , borderRadius: '4px' }}
                                            >
                                                <Upload size={14} />
                                            </button>
                                        </div>
                                    )}
                                    <input 
                                        type="file" ref={fileInputRef} hidden 
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                if (element.mediaType === 'video' || file.type.startsWith('video')) {
                                                    updateElement(element.id, { videoSrc: reader.result, mediaType: 'video' });
                                                } else {
                                                    const currentImages = element.images || [];
                                                    updateElement(element.id, { images: [...currentImages, reader.result], mediaType: 'images' });
                                                }
                                            };
                                            reader.readAsDataURL(file);
                                        }} 
                                        accept={element.mediaType === 'video' ? "video/*" : "image/*,video/*"} 
                                    />
                                </>
                            )}
                            {element.type === 'image' && (
                                <>
                                    <button 
                                        onClick={() => fileInputRef.current?.click()} 
                                        style={{ background: '#3b82f6', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '4px' }}
                                    >
                                        <Upload size={14} /> Resmi Değiştir
                                    </button>
                                    <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
                                </>
                            )}
                            {(element.type === 'text' || element.type === 'heading' || element.type === 'button' || element.type === 'faq') && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Type size={14} color="#94a3b8" />
                                    <input 
                                        defaultValue={element.type === 'faq' ? element.question : element.text}
                                        onBlur={(e) => updateElement(element.id, element.type === 'faq' ? { question: e.target.value } : { text: e.target.value })}
                                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', width: '120px', outline: 'none' }}
                                        placeholder={element.type === 'faq' ? "Soru..." : "İçerik yaz..."}
                                    />
                                    {element.type === 'faq' && (
                                        <input 
                                            defaultValue={element.answer}
                                            onBlur={(e) => updateElement(element.id, { answer: e.target.value })}
                                            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', width: '150px', outline: 'none' }}
                                            placeholder="Cevap..."
                                        />
                                    )}
                                </div>
                            )}
                            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
                            <button 
                                onClick={() => setSelectedElementId(null)} 
                                style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Resize Handles Styling */}
            <style>{`
                .rh-br, .rh-bl, .rh-tr, .rh-tl { width: 10px !important; height: 10px !important; background: #fff !important; border: 2px solid #3b82f6 !important; border-radius: 50% !important; z-index: 100 !important; }
                .rh-br { bottom: -5px !important; right: -5px !important; }
                .rh-bl { bottom: -5px !important; left: -5px !important; }
                .rh-tr { top: -5px !important; right: -5px !important; }
                .rh-tl { top: -5px !important; left: -5px !important; }
                
                .rh-r, .rh-l { width: 4px !important; height: 15px !important; background: #3b82f6 !important; border-radius: 2px !important; top: 50% !important; margin-top: -7.5px !important; }
                .rh-r { right: -2px !important; }
                .rh-l { left: -2px !important; }
                
                .rh-t, .rh-b { height: 4px !important; width: 15px !important; background: #3b82f6 !important; border-radius: 2px !important; left: 50% !important; margin-left: -7.5px !important; }
                .rh-t { top: -2px !important; }
                .rh-b { bottom: -2px !important; }
            `}</style>
        </Rnd>
    );
};

export default DraggableElement;
