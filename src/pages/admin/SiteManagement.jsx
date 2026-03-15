import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import ProjectKanban from './ProjectKanban';
import SiteControlCenter from '../../components/SiteControlCenter';
import { Layout, Map, Kanban, Calendar, Layers, Activity, Plus } from 'lucide-react';
import TimelineGantt from '../../components/admin/TimelineGantt';
import { useInvoice } from '../../context/InvoiceContext';
import { motion, AnimatePresence } from 'framer-motion';
import './SiteManagement.css';

const SiteManagement = () => {
    const { t } = useLanguage();
    const { invoices } = useInvoice();
    const [view, setView] = useState('kanban'); // 'kanban', 'map', 'timeline'

    const timelineData = [
        { id: 1, name: 'Kuzey Rezidans', start_date: '2024-02-01', due_date: '2024-05-15', progress: 65, color: '#4f46e5', category: 'İnşaat' },
        { id: 2, name: 'Güney Metro', start_date: '2024-03-10', due_date: '2024-08-20', progress: 20, color: '#8b5cf6', category: 'Altyapı' },
        { id: 3, name: 'Doğu İş Merkezi', start_date: '2024-01-15', due_date: '2024-04-10', progress: 95, color: '#10b981', category: 'İnşaat' }
    ];

    return (
        <div className="site-management-wrapper animate-in">
            <header className="site-subheader glass-header">
                <div className="site-title-container">
                    <h2 style={{ 
                        fontSize: '2rem', 
                        fontWeight: '800', 
                        margin: 0, 
                        background: 'linear-gradient(135deg, var(--text-main) 0%, var(--primary) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        {t('site_management')}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500, margin: '4px 0 0 0' }}>
                        {t('track_all_locations_and_workflows')}
                    </p>
                </div>

                <div className="view-switcher" style={{ background: 'rgba(15, 23, 42, 0.05)', padding: '6px', borderRadius: '14px' }}>
                    <button
                        onClick={() => setView('kanban')}
                        className={`view-btn ${view === 'kanban' ? 'active' : ''}`}
                    >
                        <Kanban size={18} />
                        <span>{t('workflow')}</span>
                    </button>
                    <button
                        onClick={() => setView('timeline')}
                        className={`view-btn ${view === 'timeline' ? 'active' : ''}`}
                    >
                        <Calendar size={18} />
                        <span>{t('gantt_chart')}</span>
                    </button>
                    <button
                        onClick={() => setView('map')}
                        className={`view-btn ${view === 'map' ? 'active' : ''}`}
                    >
                        <Map size={18} />
                        <span>{t('site_map')}</span>
                    </button>
                </div>

                <div className="header-actions">
                    <button className="primary-btn-premium" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 16px rgba(79, 70, 229, 0.15)' }}>
                        <Plus size={20} />
                        {t('add_new_site')}
                    </button>
                </div>
            </header>

            <div className="site-content-area" style={{ background: 'linear-gradient(to bottom, #f8fafc, #ffffff)' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={view}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        style={{ height: '100%' }}
                    >
                        {view === 'kanban' ? (
                            <div className="kanban-view-container">
                                <ProjectKanban />
                            </div>
                        ) : view === 'timeline' ? (
                            <TimelineGantt title={t('site_timeline') || 'Şantiye İş Programı'} data={timelineData} />
                        ) : (
                            <div style={{ height: '100%', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(15, 23, 42, 0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
                                <SiteControlCenter t={t} />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SiteManagement;
