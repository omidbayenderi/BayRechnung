import React, { useRef } from 'react';
import { useEditor } from '../../../../context/EditorContext';
import DraggableElement from './DraggableElement';

const CanvasArea = () => {
    const { elements, addElement, setSelectedElementId, deviceMode, zoom } = useEditor();
    const dropRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/react-builder');
        if (!data) return;
        
        try {
            const elementTemplate = JSON.parse(data);
            const rect = dropRef.current.getBoundingClientRect();
            
            // Calculate scale drop point
            const x = (e.clientX - rect.left) / zoom;
            const y = (e.clientY - rect.top) / zoom;
            
            // Default size approximations based on type
            let width = 200;
            let height = 60;
            
            if (elementTemplate.type === 'image') { width = 300; height = 200; }
            if (elementTemplate.type === 'button') { width = 160; height = 48; }
            if (elementTemplate.type === 'box') { width = 400; height = 300; }
            if (elementTemplate.type === 'divider') { width = '100%'; height = 20; }
            if (elementTemplate.type === 'form') { width = 360; height = 400; }

            // Convert string percentages to number if needed, or leave for Rnd to handle later.. Rnd can take strings
            if (elementTemplate.type === 'divider') width = rect.width / zoom - (x * 2); 
            
            addElement({
                ...elementTemplate,
                x, y,
                width: typeof width === 'number' ? width : 300,
                height,
                zIndex: elements.length + 1
            });
        } catch (err) {
            console.error('Failed to parse dropped element', err);
        }
    };

    // Device dimensions
    const getDeviceWidth = () => {
        if (deviceMode === 'mobile') return '375px';
        if (deviceMode === 'tablet') return '768px';
        return '100%';
    };

    return (
        <div 
            style={{
                flex: 1,
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'auto',
                position: 'relative'
            }}
            onClick={() => setSelectedElementId(null)}
        >
            <div 
                ref={dropRef}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{
                    width: getDeviceWidth(),
                    minHeight: deviceMode === 'desktop' ? '1200px' : '812px',
                    height: deviceMode === 'desktop' ? '2000px' : '812px',
                    background: 'white',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    position: 'relative',
                    transition: 'width 0.3s ease',
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top center',
                    margin: '40px auto 100px auto',
                    overflow: 'hidden',
                    // Grid background
                    backgroundImage: `linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                }}
            >
                {elements.map(el => (
                    <DraggableElement key={el.id} element={el} />
                ))}
            </div>
        </div>
    );
};

export default CanvasArea;
