import React from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const WebsiteContext = React.createContext();

export const useWebsite = () => React.useContext(WebsiteContext);

const DEFAULT_CONFIG = {
    isPublished: false,
    domain: '',
    slug: '',
    theme: {
        primaryColor: '#3b82f6',
        secondaryColor: '#64748b',
        backgroundColor: '#ffffff',
        textColor: '#1e293b',
        fontHeading: '"Outfit", sans-serif',
        fontBody: '"Inter", sans-serif',
        mode: 'light',
        showBranding: true,
        radius: '12px'
    },
    seo: {
        title: '',
        description: '',
        keywords: '',
        ogImage: '',
        favicon: ''
    },
    advanced: {
        customCss: '',
        headScripts: '',
        bodyScripts: ''
    },
    analyticsId: '',
    category: 'standard',
    hero: {
        mode: 'static',
        type: 'color',
        overlay: 0.4
    }
};

const DEFAULT_SECTIONS = [
    { id: 'hero', type: 'hero', visible: true, data: { title: 'Modern SaaS Solution', subtitle: 'Elevate your business with our premium platform.', buttonText: 'Get Started', type: 'color' } },
    { id: 'features', type: 'features', visible: true, data: { title: 'Premium Features', items: [{ title: 'Secure', description: 'Enterprise grade security' }, { title: 'Fast', description: 'Optimized performance' }] } },
    { id: 'about', type: 'about', visible: true, data: { title: 'About Us', content: 'We provided industry-leading solutions for modern businesses.' } },
    { id: 'services', type: 'services', visible: true, data: { autoPull: true, source: 'appointments' } },
    { id: 'pricing', type: 'pricing', visible: true, data: { title: 'Choose Your Plan', items: [{ name: 'Basic', price: '29', features: ['Feature 1', 'Feature 2'] }] } },
    { id: 'contact', type: 'contact', visible: true, data: { showMap: true, phone: true, email: true } }
];

export const WebsiteProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const { showNotification } = useNotification();
    const [siteConfig, setSiteConfig] = React.useState(DEFAULT_CONFIG);
    const [pages, setPages] = React.useState([{ id: 'home', title: 'Home', slug: '/', sections: DEFAULT_SECTIONS }]);
    const [activePageId, setActivePageId] = React.useState('home');
    const [loading, setLoading] = React.useState(true);
    const [isDbError, setIsDbError] = React.useState(false);

    // Initial Fetch from Supabase
    React.useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const fetchSiteData = async () => {
            try {
                // 1. Fetch main site config
                const { data: configData, error: configError } = await supabase
                    .from('website_configs')
                    .select('*')
                    .eq('user_id', currentUser.id)
                    .maybeSingle();

                if (configError) throw configError;

                if (configData) {
                    setSiteConfig(prev => ({
                        ...prev,
                        ...configData,
                        theme: configData.theme || prev.theme,
                        seo: configData.seo || prev.seo,
                    }));
                } else {
                    // Create default config if it doesn't exist
                    const { data: newConfig, error: createError } = await supabase
                        .from('website_configs')
                        .insert([{ 
                            user_id: currentUser.id, 
                            ...DEFAULT_CONFIG,
                            slug: currentUser.companyName?.toLowerCase().replace(/\s+/g, '-') || `site-${currentUser.id.substring(0, 8)}`
                        }])
                        .select()
                        .single();
                    
                    if (!createError && newConfig) setSiteConfig(newConfig);
                }

                // 2. Fetch pages and their sections
                const { data: pagesData, error: pagesError } = await supabase
                    .from('website_pages')
                    .select('*')
                    .eq('user_id', currentUser.id)
                    .order('order_index', { ascending: true });

                if (pagesError) throw pagesError;

                if (pagesData && pagesData.length > 0) {
                    setPages(pagesData);
                    setActivePageId(pagesData[0].id);
                } else {
                    // Create default home page if none exists
                    const { data: newPage, error: createPageError } = await supabase
                        .from('website_pages')
                        .insert([{
                            user_id: currentUser.id,
                            title: 'Home',
                            slug: '/',
                            sections: DEFAULT_SECTIONS,
                            order_index: 0
                        }])
                        .select()
                        .single();
                    
                    if (!createPageError && newPage) {
                        setPages([newPage]);
                        setActivePageId(newPage.id);
                    }
                }
             } catch (err) {
                console.error('[WebsiteContext] Error fetching site data:', err);
                if (err.code === 'PGRST205' || err.message?.includes('website_pages')) {
                    setIsDbError(true);
                    showNotification({
                        title: 'Sistem Güncellemesi Gerekli',
                        message: 'Web sitesi sayfaları için gerekli tablo (website_pages) bulunamadı. Lütfen migrasyonları kontrol edin.',
                        type: 'error'
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSiteData();
    }, [currentUser]);

    // Derived sections for the current active page
    const sections = React.useMemo(() => {
        const activePage = pages.find(p => p.id === activePageId);
        return activePage?.sections || [];
    }, [pages, activePageId]);

    // UPDATE Site Config
    const updateSiteConfig = React.useCallback(async (updates) => {
        if (!currentUser) return { success: false, error: 'Not authenticated' };

        const newConfig = { ...siteConfig, ...updates };
        setSiteConfig(newConfig); // Optimistic update

        const { error } = await supabase
            .from('website_configs')
            .upsert({ user_id: currentUser.id, ...newConfig, updated_at: new Date().toISOString() });

        if (error) {
            console.error('[WebsiteContext] Error updating site config:', error);
            return { success: false, error: error.message };
        }
        return { success: true };
    }, [currentUser, siteConfig]);

    // UPDATE Single Section
    const updateSection = React.useCallback(async (sectionId, sectionUpdates) => {
        if (!currentUser) return { success: false, error: 'Not authenticated' };

        const activePage = pages.find(p => p.id === activePageId);
        if (!activePage) return { success: false, error: 'No active page' };

        const newSections = activePage.sections.map(s => 
            s.id === sectionId ? { ...s, data: { ...s.data, ...sectionUpdates } } : s
        );

        // Optimistic update
        setPages(prev => prev.map(p => p.id === activePageId ? { ...p, sections: newSections } : p));

        const { error } = await supabase
            .from('website_pages')
            .update({ sections: newSections, updated_at: new Date().toISOString() })
            .eq('id', activePageId)
            .eq('user_id', currentUser.id);

        if (error) {
            console.error('[WebsiteContext] Error updating section:', error);
            return { success: false, error: error.message };
        }
        return { success: true };
    }, [currentUser, pages, activePageId]);

    // ADD Section
    const addSection = React.useCallback(async (newSection) => {
        if (!currentUser) return { success: false };
        const activePage = pages.find(p => p.id === activePageId);
        if (!activePage) return { success: false };

        const sectionWithId = {
            ...newSection,
            id: newSection.id || `section-${Date.now()}`,
            visible: true
        };

        const newSections = [...(activePage.sections || []), sectionWithId];
        
        setPages(prev => prev.map(p => p.id === activePageId ? { ...p, sections: newSections } : p));

        const { error } = await supabase
            .from('website_pages')
            .update({ sections: newSections })
            .eq('id', activePageId);

        return { success: !error, error: error?.message };
    }, [currentUser, pages, activePageId]);

    // DELETE Section
    const deleteSection = React.useCallback(async (sectionId) => {
        if (!currentUser) return { success: false };
        const activePage = pages.find(p => p.id === activePageId);
        if (!activePage) return { success: false };

        const newSections = activePage.sections.filter(s => s.id !== sectionId);
        
        setPages(prev => prev.map(p => p.id === activePageId ? { ...p, sections: newSections } : p));

        const { error } = await supabase
            .from('website_pages')
            .update({ sections: newSections })
            .eq('id', activePageId);

        return { success: !error, error: error?.message };
    }, [currentUser, pages, activePageId]);

    // MOVE Section
    const moveSection = React.useCallback(async (sectionId, direction) => {
        if (!currentUser) return { success: false };
        const activePage = pages.find(p => p.id === activePageId);
        if (!activePage) return { success: false };

        const newSections = [...activePage.sections];
        const index = newSections.findIndex(s => s.id === sectionId);
        if (index === -1) return { success: false };

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= newSections.length) return { success: false };

        const temp = newSections[index];
        newSections[index] = newSections[newIndex];
        newSections[newIndex] = temp;

        setPages(prev => prev.map(p => p.id === activePageId ? { ...p, sections: newSections } : p));

        const { error } = await supabase
            .from('website_pages')
            .update({ sections: newSections })
            .eq('id', activePageId);

        return { success: !error, error: error?.message };
    }, [currentUser, pages, activePageId]);

    // TOGGLE Visibility
    const toggleSectionVisibility = React.useCallback(async (sectionId) => {
        if (!currentUser) return { success: false };
        const activePage = pages.find(p => p.id === activePageId);
        if (!activePage) return { success: false };

        const newSections = activePage.sections.map(s => 
            s.id === sectionId ? { ...s, visible: !s.visible } : s
        );

        setPages(prev => prev.map(p => p.id === activePageId ? { ...p, sections: newSections } : p));

        const { error } = await supabase
            .from('website_pages')
            .update({ sections: newSections })
            .eq('id', activePageId);

        return { success: !error, error: error?.message };
    }, [currentUser, pages, activePageId]);

    // PUBLISH Logic
    const publishSite = React.useCallback(async () => {
        return updateSiteConfig({ isPublished: true });
    }, [updateSiteConfig]);

    const unpublishSite = React.useCallback(async () => {
        return updateSiteConfig({ isPublished: false });
    }, [updateSiteConfig]);

    // PAGE Management
    const addPage = React.useCallback(async (title, slug) => {
        if (!currentUser) return { success: false, error: 'Oturum açılmamış' };

        try {
            const { data, error } = await supabase
                .from('website_pages')
                .insert([{
                    user_id: currentUser.id,
                    title,
                    slug: slug.startsWith('/') ? slug : `/${slug}`,
                    sections: DEFAULT_SECTIONS,
                    order_index: pages.length
                }])
                .select()
                .single();

            if (error) {
                console.error('[WebsiteContext] Insert error:', error);
                
                if (error.code === 'PGRST205' || error.message?.includes('website_pages')) {
                    showNotification({
                        title: 'Veritabanı Hatası',
                        message: 'Sayfa tablosu (website_pages) veritabanında mevcut değil. Lütffen SQL migrasyonunu (037) çalıştırın.',
                        type: 'error'
                    });
                } else {
                    showNotification({
                        title: 'Hata',
                        message: error.message,
                        type: 'error'
                    });
                }
                return { success: false, error: error.message };
            }
            
            setPages(prev => [...prev, data]);
            return { success: true, pageId: data.id };
        } catch (err) {
            console.error('[WebsiteContext] Unexpected error:', err);
            return { success: false, error: err.message };
        }
    }, [currentUser, pages.length]);

    const deletePage = React.useCallback(async (pageId) => {
        if (!currentUser || pages.length <= 1) return { success: false };

        const { error } = await supabase
            .from('website_pages')
            .delete()
            .eq('id', pageId)
            .eq('user_id', currentUser.id);

        if (error) return { success: false, error: error.message };
        
        setPages(prev => {
            const upd = prev.filter(p => p.id !== pageId);
            if (activePageId === pageId) setActivePageId(upd[0].id);
            return upd;
        });
        return { success: true };
    }, [currentUser, pages, activePageId]);

    const reorderSections = React.useCallback(async (newSections) => {
        if (!currentUser) return { success: false };
        const activePage = pages.find(p => p.id === activePageId);
        if (!activePage) return { success: false };

        setPages(prev => prev.map(p => p.id === activePageId ? { ...p, sections: newSections } : p));

        const { error } = await supabase
            .from('website_pages')
            .update({ sections: newSections })
            .eq('id', activePageId);

        return { success: !error, error: error?.message };
    }, [currentUser, pages, activePageId]);

    const value = {
        siteConfig,
        pages,
        activePageId,
        setActivePageId,
        sections,
        loading,
        updateSiteConfig,
        updateConfig: updateSiteConfig, // Backward compatibility alias
        updateSection,
        addSection,
        deleteSection,
        moveSection,
        reorderSections,
        toggleSectionVisibility,
        publishSite,
        unpublishSite,
        addPage,
        deletePage
    };

    return (
        <WebsiteContext.Provider value={value}>
            {children}
        </WebsiteContext.Provider>
    );
};
