import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

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
                const { data, error } = await supabase
                    .from('website_configs')
                    .select('*')
                    .eq('user_id', currentUser.id)
                    .maybeSingle();

                if (data) {
                    const parsed = data.config;
                    if (parsed.siteConfig) setSiteConfig(parsed.siteConfig);
                    if (parsed.sections) setSections(parsed.sections);
                }
            } catch (err) {
                console.error('Error loading website config:', err);
            } finally {
                setLoading(false);
            }
        };

        loadWebsiteData();
    }, [currentUser?.id]);

    // LocalStorage Sync for Public Preview
    useEffect(() => {
        if (currentUser?.id) {
            localStorage.setItem('website_config', JSON.stringify(siteConfig));
            localStorage.setItem('website_sections', JSON.stringify(sections));
        }
    }, [siteConfig, sections, currentUser]);

    // Save to Supabase (debounced or on change)
    const saveToSupabase = async (newConfig, newSections) => {
        if (!currentUser?.id) return;

        try {
            const { error } = await supabase
                .from('website_configs')
                .upsert({
                    user_id: currentUser.id,
                    config: { siteConfig: newConfig, sections: newSections },
                    domain: newConfig.domain,
                    is_published: newConfig.isPublished,
                    updated_at: new Date().toISOString()
                });
            if (error) throw error;
        } catch (err) {
            console.error('Error saving website config to Supabase:', err);
        }
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
