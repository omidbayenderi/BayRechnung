import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Layout, Sparkles, Wand2, CheckCircle, Smartphone, Monitor } from 'lucide-react';
import { useWebsite } from '../../context/WebsiteContext';
import { useInvoice } from '../../context/InvoiceContext';
import { useLanguage } from '../../context/LanguageContext';

const BayCreative = () => {
    const { siteConfig, sections, updateSiteConfig, updateSection } = useWebsite();
    const { companyProfile } = useInvoice();
    const { t } = useLanguage();
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [lastOptimization, setLastOptimization] = useState(null);
    const [showNotice, setShowNotice] = useState(false);

    // 1. AUTO-ADAPT DESIGN (Industry based)
    useEffect(() => {
        if (!siteConfig.isPublished && companyProfile?.industry && !siteConfig.autoOptimized) {
            optimizeDesign();
        }
    }, [companyProfile?.industry]);

    const optimizeDesign = () => {
        setIsOptimizing(true);

        // Industry Specific Magic
        const industry = companyProfile?.industry?.toLowerCase() || 'default';
        let updates = { autoOptimized: true };

        if (industry.includes('contruction') || industry.includes('inşaat') || industry.includes('bau')) {
            updates.theme = {
                ...siteConfig.theme,
                primaryColor: '#0f172a', // Deep slate for Professional look
                secondaryColor: '#f59e0b', // Amber for construction safety/highlight
            };
        } else if (industry.includes('salon') || industry.includes('beauty') || industry.includes('kuaför')) {
            updates.theme = {
                ...siteConfig.theme,
                primaryColor: '#ec4899', // Pink
                secondaryColor: '#fdf2f8',
            };
        }

        setTimeout(() => {
            updateSiteConfig(updates);
            setIsOptimizing(false);
            setLastOptimization('Industry theme matched');
            setShowNotice(true);
            setTimeout(() => setShowNotice(false), 4000);
        }, 1500);
    };

    // 2. SYNC COMPANY INFO TO WEBSITE
    useEffect(() => {
        if (companyProfile?.name && sections) {
            const heroSection = sections.find(s => s.id === 'hero');
            if (heroSection && !heroSection.data.title) {
                updateSection('hero', {
                    title: companyProfile.name,
                    subtitle: `Professional ${companyProfile.industry || 'Business'} Services`
                });
            }
        }
    }, [companyProfile, sections]);

    if (!isOptimizing && !showNotice) return null;

    return (
        <div style={{ position: 'fixed', top: '80px', left: '24px', zIndex: 1000 }}>
            <AnimatePresence>
                {isOptimizing && (
                    <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        style={{
                            background: 'rgba(15, 23, 42, 0.9)',
                            backdropFilter: 'blur(8px)',
                            padding: '12px 20px',
                            borderRadius: '12px',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <Wand2 size={18} className="animate-pulse" color="#fbbf24" />
                        <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>BayCreative: Tasarım optimize ediliyor...</span>
                    </motion.div>
                )}

                {showNotice && (
                    <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        style={{
                            background: '#10b981',
                            padding: '12px 20px',
                            borderRadius: '12px',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}
                    >
                        <CheckCircle size={18} />
                        <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Web sitesi marka kimliğinizle senkronize edildi.</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BayCreative;
