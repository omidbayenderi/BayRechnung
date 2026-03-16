import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const EditorContext = createContext();

// initialPages should be an array of objects: { id, title, customElements }
export const EditorProvider = ({ children, initialPages = [], initialData = {} }) => {
    // Default fallback if empty
    const defaultPages = initialPages.length > 0 ? initialPages : [{ id: 'home', title: 'Ana Sayfa', customElements: [] }];
    
    const [pages, setPages] = useState(defaultPages);
    const [currentPageId, setCurrentPageId] = useState(defaultPages[0].id);

    // Track global site settings
    const [siteConfig, setSiteConfig] = useState(initialData?.config || { themeMode: 'light', primaryColor: '#3b82f6' });

    const updateSiteConfig = useCallback((updates) => {
        setSiteConfig(prev => ({ ...prev, ...updates }));
    }, []);

    // Track elements for the current active page
    const [elements, setElements] = useState(defaultPages[0].customElements || []);
    
    const [selectedElementId, setSelectedElementId] = useState(null);
    const [hoveredElementId, setHoveredElementId] = useState(null);
    
    // device: 'desktop', 'tablet', 'mobile'
    const [deviceMode, setDeviceMode] = useState('desktop'); 
    
    // For zooming/panning the canvas
    const [zoom, setZoom] = useState(1);
    
    const [history, setHistory] = useState([defaultPages[0].customElements || []]);
    const [historyStep, setHistoryStep] = useState(0);

    const updateHistory = useCallback((newElements) => {
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push(newElements);
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
        
        // Sync to pages
        setPages(prev => prev.map(p => p.id === currentPageId ? { ...p, customElements: newElements } : p));
    }, [history, historyStep, currentPageId]);

    const addElement = useCallback((element) => {
        setElements(prev => {
            const upd = [...prev, { ...element, id: element.id || `el_${Date.now()}` }];
            updateHistory(upd);
            return upd;
        });
    }, [updateHistory]);

    const updateElement = useCallback((id, updates) => {
        setElements(prev => {
            const upd = prev.map(el => el.id === id ? { ...el, ...updates } : el);
            updateHistory(upd);
            return upd;
        });
    }, [updateHistory]);

    const removeElement = useCallback((id) => {
        setElements(prev => {
            const upd = prev.filter(el => el.id !== id);
            updateHistory(upd);
            return upd;
        });
        if (selectedElementId === id) setSelectedElementId(null);
    }, [updateHistory, selectedElementId]);

    const undo = useCallback(() => {
        if (historyStep > 0) {
            const newStep = historyStep - 1;
            const newElements = history[newStep];
            setHistoryStep(newStep);
            setElements(newElements);
            setSelectedElementId(null);
            setPages(prev => prev.map(p => p.id === currentPageId ? { ...p, customElements: newElements } : p));
        }
    }, [historyStep, history, currentPageId]);

    const redo = useCallback(() => {
        if (historyStep < history.length - 1) {
            const newStep = historyStep + 1;
            const newElements = history[newStep];
            setHistoryStep(newStep);
            setElements(newElements);
            setSelectedElementId(null);
            setPages(prev => prev.map(p => p.id === currentPageId ? { ...p, customElements: newElements } : p));
        }
    }, [historyStep, history, currentPageId]);

    const selectedElement = useMemo(
        () => elements.find(el => el.id === selectedElementId) || null,
        [elements, selectedElementId]
    );

    const changePage = useCallback((pageId) => {
        const newPage = pages.find(p => p.id === pageId);
        if (newPage) {
            setCurrentPageId(newPage.id);
            setElements(newPage.customElements || []);
            setHistory([newPage.customElements || []]);
            setHistoryStep(0);
            setSelectedElementId(null);
        }
    }, [pages]);

    const addPage = useCallback((title) => {
        const id = `page_${Date.now()}`;
        const newPage = { id, title, customElements: [] };
        setPages(prev => [...prev, newPage]);
        return id;
    }, []);

    const deletePage = useCallback((id) => {
        if (pages.length <= 1) return; // don't delete last page
        setPages(prev => {
            const upd = prev.filter(p => p.id !== id);
            if (currentPageId === id) {
                // we deleted the current page, switch to the first available
                const fallback = upd[0];
                setCurrentPageId(fallback.id);
                setElements(fallback.customElements || []);
                setHistory([fallback.customElements || []]);
                setHistoryStep(0);
                setSelectedElementId(null);
            }
            return upd;
        });
    }, [pages.length, currentPageId]);

    const updatePageTitle = useCallback((id, newTitle) => {
        setPages(prev => prev.map(p => p.id === id ? { ...p, title: newTitle } : p));
    }, []);

    const value = {
        pages, currentPageId, changePage, addPage, deletePage, updatePageTitle,
        siteConfig, updateSiteConfig,
        elements, setElements,
        selectedElementId, setSelectedElementId,
        selectedElement,
        hoveredElementId, setHoveredElementId,
        deviceMode, setDeviceMode,
        zoom, setZoom,
        addElement, updateElement, removeElement,
        undo, redo, canUndo: historyStep > 0, canRedo: historyStep < history.length - 1
    };

    return (
        <EditorContext.Provider value={value}>
            {children}
        </EditorContext.Provider>
    );
};

export const useEditor = () => useContext(EditorContext);
