import React from 'react';
import { Rnd } from 'react-rnd';
import { useEditor } from '../../../../context/EditorContext';

const DraggableElement = ({ element }) => {
    const { 
        selectedElementId, setSelectedElementId, 
        setHoveredElementId, hoveredElementId,
        updateElement 
    } = useEditor();
    
    const isSelected = selectedElementId === element.id;
    const isHovered = hoveredElementId === element.id;

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

    const renderContent = () => {
        switch (element.type) {
            case 'text':
            case 'heading':
                return (
                    <div style={{
                        width: '100%',
                        height: '100%',
                        fontSize: element.fontSize,
                        fontWeight: element.fontWeight || 'normal',
                        color: element.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        whiteSpace: 'pre-wrap'
                    }}>
                        {element.text}
                    </div>
                );
            case 'button':
                return (
                    <div style={{
                        width: '100%',
                        height: '100%',
                        background: element.bg,
                        color: element.color,
                        borderRadius: element.borderRadius,
                        fontSize: element.fontSize,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        cursor: 'default'
                    }}>
                        {element.text}
                    </div>
                );
            case 'image':
                return (
                    <img 
                        src={element.src || 'https://via.placeholder.com/300x200'}
                        alt="element"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: element.objectFit || 'cover',
                            borderRadius: element.borderRadius || 0,
                            pointerEvents: 'none'
                        }}
                    />
                );
            case 'video':
                return (
                    <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        Video Placeholder
                    </div>
                );
            case 'box':
                return (
                    <div style={{
                        width: '100%',
                        height: '100%',
                        background: element.bg,
                        border: element.border,
                        borderRadius: element.borderRadius
                    }} />
                );
            case 'divider':
                return (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '100%', height: element.height || 1, background: element.bg || '#e2e8f0' }} />
                    </div>
                );
            case 'form':
                return (
                    <div style={{ width: '100%', height: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ height: 36, background: 'white', border: '1px solid #cbd5e1', borderRadius: 6 }} />
                        <div style={{ height: 36, background: 'white', border: '1px solid #cbd5e1', borderRadius: 6 }} />
                        <div style={{ height: 80, background: 'white', border: '1px solid #cbd5e1', borderRadius: 6 }} />
                        <div style={{ height: 40, background: '#3b82f6', borderRadius: 6, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>Gönder</div>
                    </div>
                );
            default:
                return <div>Bilinmeyen Bileşen</div>;
        }
    };

    return (
        <Rnd
            size={{ width: element.width || 200, height: element.height || 100 }}
            position={{ x: element.x, y: element.y }}
            onDragStop={handleDragStop}
            onResizeStop={handleResizeStop}
            onClick={(e) => {
                e.stopPropagation();
                setSelectedElementId(element.id);
            }}
            onMouseEnter={() => setHoveredElementId(element.id)}
            onMouseLeave={() => setHoveredElementId(null)}
            bounds="parent"
            style={{
                zIndex: element.zIndex || 1,
                border: isSelected ? '2px solid #3b82f6' : isHovered ? '2px dashed #94a3b8' : '2px solid transparent',
                cursor: isSelected ? 'move' : 'pointer'
            }}
            enableResizing={isSelected ? {
                top: true, right: true, bottom: true, left: true,
                topRight: true, bottomRight: true, bottomLeft: true, topLeft: true
            } : false}
            resizeHandleClasses={{
                bottomRight: 'resize-handle-br',
                bottomLeft: 'resize-handle-bl',
                topRight: 'resize-handle-tr',
                topLeft: 'resize-handle-tl',
                right: 'resize-handle-r',
                left: 'resize-handle-l',
                top: 'resize-handle-t',
                bottom: 'resize-handle-b'
            }}
        >
            <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                {renderContent()}
            </div>
            {isSelected && (
                <style>{`
                    .resize-handle-br, .resize-handle-bl, .resize-handle-tr, .resize-handle-tl {
                        width: 10px !important;
                        height: 10px !important;
                        background: white !important;
                        border: 2px solid #3b82f6 !important;
                        border-radius: 50% !important;
                    }
                    .resize-handle-r, .resize-handle-l {
                        width: 6px !important;
                        height: 20px !important;
                        background: white !important;
                        border: 2px solid #3b82f6 !important;
                        border-radius: 4px !important;
                        margin-top: -10px !important;
                    }
                    .resize-handle-t, .resize-handle-b {
                        width: 20px !important;
                        height: 6px !important;
                        background: white !important;
                        border: 2px solid #3b82f6 !important;
                        border-radius: 4px !important;
                        margin-left: -10px !important;
                    }
                `}</style>
            )}
        </Rnd>
    );
};

export default DraggableElement;
