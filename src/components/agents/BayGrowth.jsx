import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Globe, Search, BarChart3, Target, Sparkles, Megaphone } from 'lucide-react';
import { useWebsite } from '../../context/WebsiteContext';
import { useLanguage } from '../../context/LanguageContext';

const BayGrowth = () => {
    const { siteConfig, sections, updateSiteConfig } = useWebsite();
    const { t } = useLanguage();

    const [lastTip, setLastTip] = useState(null);
    const [showTip, setShowTip] = useState(false);

    // 1. SEO & CONTENT ANALYSIS
    useEffect(() => {
        const analyzeGrowth = () => {
            // Check if meta description is too short
            if (siteConfig.isPublished && (!siteConfig.meta?.description || siteConfig.meta.description.length < 50)) {
                triggerTip({
                    id: 'seo-meta',
                    icon: <Search size={18} />,
                    msg: t('seo_tip_meta_desc')
                });
            }

            // Check if site is NOT published
            if (!siteConfig.isPublished) {
                triggerTip({
                    id: 'publish-growth',
                    icon: <Globe size={18} />,
                    msg: t('growth_opportunity_publish')
                });
            }

            // Check for missing sections (e.g., About)
            const aboutSection = sections.find(s => s.id === 'about');
            if (aboutSection && !aboutSection.data?.text) {
                triggerTip({
                    id: 'content-about',
                    icon: <Megaphone size={18} />,
                    msg: t('brand_value_about_section')
                });
            }
        };

        // Run analysis periodically or on config change
        const timer = setTimeout(analyzeGrowth, 5000);
        return () => clearTimeout(timer);
    }, [siteConfig, sections]);

    const triggerTip = (tip) => {
        // Don't repeat same tip in a session
        if (sessionStorage.getItem(`growth_tip_${tip.id}`)) return;

        setLastTip(tip);
        setShowTip(true);
        sessionStorage.setItem(`growth_tip_${tip.id}`, 'true');

        setTimeout(() => setShowTip(false), 8000);
    };

    if (!showTip || !lastTip) return null;

    return (
        <div style={{ position: 'fixed', bottom: '220px', left: '24px', zIndex: 1000 }}>
            <AnimatePresence>
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    style={{
                        background: 'rgba(59, 130, 246, 0.95)', // Blue for growth/sky
                        color: 'white',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        boxShadow: '0 10px 25px rgba(59,130,246,0.3)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        maxWidth: '300px'
                    }}
                >
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '8px' }}>
                        {lastTip.icon}
                    </div>
                    <span>{lastTip.msg}</span>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default BayGrowth;
