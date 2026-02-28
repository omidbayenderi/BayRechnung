import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { syncService } from '../lib/SyncService';

const WebsiteContext = createContext();

export const useWebsite = () => useContext(WebsiteContext);

const DEFAULT_CONFIG = {
    isPublished: false,
    domain: '',
    theme: {
        primaryColor: '#3b82f6',
        fontFamily: '"Inter", sans-serif',
        mode: 'light',
        secondaryColor: '#64748b',
        showBranding: true
    },
    meta: {
        title: '',
        description: '',
        keywords: ''
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
    { id: 'hero', type: 'hero', visible: true, data: { title: '', subtitle: '', buttonText: '', image: null } },
    { id: 'about', type: 'about', visible: true, data: { text: '' } },
    { id: 'services', type: 'services', visible: true, data: { autoPull: true, source: 'appointments' } },
    { id: 'products', type: 'products', visible: true, data: { autoPull: true, source: 'stock', limit: 6 } },
    { id: 'contact', type: 'contact', visible: true, data: { showMap: true, phone: true, email: true } }
];

export const WebsiteProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [siteConfig, setSiteConfig] = useState(DEFAULT_CONFIG);
    const [sections, setSections] = useState(DEFAULT_SECTIONS);
    const [loading, setLoading] = useState(true);

    // Initial Fetch from Supabase
    useEffect(() => {
        const loadWebsiteData = async () => {
            if (!currentUser?.id) {
                setLoading(false);
                return;
            }

            try {
                // 1. Optimistic load from localStorage
                const localConfig = localStorage.getItem('website_config');
                const localSections = localStorage.getItem('website_sections');
                if (localConfig) setSiteConfig(JSON.parse(localConfig));
                if (localSections) setSections(JSON.parse(localSections));

                // 2. Fetch Fresh from Supabase
                const { data, error } = await supabase
                    .from('website_configs')
                    .select('*')
                    .eq('user_id', currentUser.id)
                    .maybeSingle();

                if (data && data.config) {
                    const parsed = data.config;
                    if (parsed.siteConfig) setSiteConfig(parsed.siteConfig);
                    if (parsed.sections) setSections(parsed.sections);

                    // Sync localStorage immediately with fresh data
                    localStorage.setItem('website_config', JSON.stringify(parsed.siteConfig || siteConfig));
                    localStorage.setItem('website_sections', JSON.stringify(parsed.sections || sections));
                }
            } catch (err) {
                console.error('Error loading website config:', err);

                // Fallback to local if remote fails and we haven't already loaded it
                const localConfig = localStorage.getItem('website_config');
                if (localConfig) setSiteConfig(JSON.parse(localConfig));
            } finally {
                setLoading(false);
            }
        };

        loadWebsiteData();
    }, [currentUser?.id]);

    // LocalStorage Sync for Public Preview
    useEffect(() => {
        if (currentUser?.id && !loading) {
            localStorage.setItem('website_config', JSON.stringify(siteConfig));
            localStorage.setItem('website_sections', JSON.stringify(sections));
        }
    }, [siteConfig, sections, currentUser, loading]);

    // Save to Supabase via SyncService
    const saveToSupabase = (newConfig, newSections) => {
        if (!currentUser?.id) return;

        const syncData = {
            user_id: currentUser.id,
            config: { siteConfig: newConfig, sections: newSections },
            domain: newConfig.domain || '',
            is_published: !!newConfig.isPublished,
            updated_at: new Date().toISOString()
        };

        syncService.enqueue('website_configs', 'update', syncData, currentUser.id);
    };

    // Actions
    const updateSiteConfig = (newConfig) => {
        setSiteConfig(prev => {
            const updated = { ...prev, ...newConfig };
            saveToSupabase(updated, sections);
            return updated;
        });
    };

    const updateSection = (id, newData) => {
        setSections(prev => {
            const updated = prev.map(sec => sec.id === id ? { ...sec, data: { ...sec.data, ...newData } } : sec);
            saveToSupabase(siteConfig, updated);
            return updated;
        });
    };

    const toggleSectionVisibility = (id) => {
        setSections(prev => {
            const updated = prev.map(sec => sec.id === id ? { ...sec, visible: !sec.visible } : sec);
            saveToSupabase(siteConfig, updated);
            return updated;
        });
    };

    const publishSite = () => {
        setSiteConfig(prev => {
            const updated = { ...prev, isPublished: true, lastPublished: new Date().toISOString() };
            saveToSupabase(updated, sections);
            return updated;
        });
    };

    const unpublishSite = () => {
        setSiteConfig(prev => {
            const updated = { ...prev, isPublished: false };
            saveToSupabase(updated, sections);
            return updated;
        });
    };

    const addSection = (section) => {
        setSections(prev => {
            const updated = [...prev, section];
            saveToSupabase(siteConfig, updated);
            return updated;
        });
    };

    const deleteSection = (id) => {
        setSections(prev => {
            const updated = prev.filter(s => s.id !== id);
            saveToSupabase(siteConfig, updated);
            return updated;
        });
    };

    return (
        <WebsiteContext.Provider value={{
            siteConfig,
            sections,
            updateSiteConfig,
            updateSection,
            toggleSectionVisibility,
            addSection,
            deleteSection,
            publishSite,
            unpublishSite,
            loading
        }}>
            {children}
        </WebsiteContext.Provider>
    );
};
