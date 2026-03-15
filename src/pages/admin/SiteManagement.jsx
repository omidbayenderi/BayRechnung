import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import ProjectKanban from './ProjectKanban';
import SiteControlCenter from '../../components/SiteControlCenter';
import { Layout, Map, Kanban, Calendar, Layers, Activity, Plus, DollarSign } from 'lucide-react';
import TimelineGantt from '../../components/admin/TimelineGantt';
import { useInvoice } from '../../context/InvoiceContext';
import { motion, AnimatePresence } from 'framer-motion';
import './SiteManagement.css';

const SiteManagement = () => {
    const { t } = useLanguage();
    const { projects = [], saveProject } = useInvoice();
    const [view, setView] = useState('kanban'); // 'kanban', 'map', 'timeline'
    const [showAddModal, setShowAddModal] = useState(false);
    const [newSiteData, setNewSiteData] = useState({ name: '', client_name: '', budget: '' });

    const timelineData = React.useMemo(() => {
        if (!projects || projects.length === 0) {
            return [
                { id: 1, name: 'Kuzey Rezidans', start_date: '2024-02-01', due_date: '2024-05-15', progress: 65, color: '#4f46e5', category: 'İnşaat' },
                { id: 2, name: 'Güney Metro', start_date: '2024-03-10', due_date: '2024-08-20', progress: 20, color: '#8b5cf6', category: 'Altyapı' },
                { id: 3, name: 'Doğu İş Merkezi', start_date: '2024-01-15', due_date: '2024-04-10', progress: 95, color: '#10b981', category: 'İnşaat' }
            ];
        }
        return projects.map(p => ({
            id: p.id,
            name: p.name,
            start_date: p.start_date || p.created_at,
            due_date: p.due_date || new Date(new Date(p.created_at).getTime() + 86400000 * 30).toISOString(),
            progress: p.progress || 0,
            color: p.color || '#4f46e5',
            category: p.category || 'Şantiye'
        }));
    }, [projects]);

    const handleAddSite = async () => {
        if (!newSiteData.name) return;
        await saveProject(newSiteData);
        setShowAddModal(false);
        setNewSiteData({ name: '', client_name: '', budget: '' });
    };

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
                    <button 
                        className="primary-btn-premium" 
                        onClick={() => setShowAddModal(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 16px rgba(79, 70, 229, 0.15)' }}
                    >
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
                                <ProjectKanban hideHeader={true} />
                            </div>
                        ) : view === 'timeline' ? (
                            <TimelineGantt title={t('site_timeline') || 'Şantiye İş Programı'} data={timelineData} />
                        ) : (
                            <div style={{ height: '100%', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(15, 23, 42, 0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
                                <SiteControlCenter t={t} projects={projects} />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Add Site Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div 
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ 
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 
                        }}
                    >
                        <motion.div 
                            className="modal-content premium-card"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            style={{ 
                                maxWidth: '500px', width: '95%', background: 'white',
                                padding: '32px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: '#1e293b' }}>{t('add_new_site')}</h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>{t('fill_details_to_start_project') || 'Projeyi başlatmak için bilgileri doldurun'}</p>
                                </div>
                                <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '12px', borderRadius: '16px' }}>
                                    <Plus size={24} />
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '700', color: '#1e293b', fontSize: '0.9rem' }}>
                                        <Layers size={16} color="var(--primary)" />
                                        {t('project_name')}
                                    </label>
                                    <input 
                                        type="text" 
                                        value={newSiteData.name}
                                        onChange={(e) => setNewSiteData({...newSiteData, name: e.target.value})}
                                        placeholder="Örn: Kuzey Rezidans"
                                        style={{ 
                                            width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', 
                                            fontSize: '1rem', transition: 'all 0.2s', outline: 'none'
                                        }}
                                        autoFocus
                                    />
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '700', color: '#1e293b', fontSize: '0.9rem' }}>
                                        <Activity size={16} color="var(--primary)" />
                                        {t('client_name')}
                                    </label>
                                    <input 
                                        type="text" 
                                        value={newSiteData.client_name}
                                        onChange={(e) => setNewSiteData({...newSiteData, client_name: e.target.value})}
                                        placeholder="Örn: Bay İnşaat A.Ş."
                                        style={{ 
                                            width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', 
                                            fontSize: '1rem', transition: 'all 0.2s', outline: 'none'
                                        }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '700', color: '#1e293b', fontSize: '0.9rem' }}>
                                        <DollarSign size={16} color="var(--primary)" />
                                        {t('budget')} (€)
                                    </label>
                                    <input 
                                        type="number" 
                                        value={newSiteData.budget}
                                        onChange={(e) => setNewSiteData({...newSiteData, budget: e.target.value})}
                                        placeholder="0.00"
                                        style={{ 
                                            width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', 
                                            fontSize: '1rem', transition: 'all 0.2s', outline: 'none'
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="modal-actions" style={{ display: 'flex', gap: '12px', marginTop: '40px' }}>
                                <button 
                                    className="secondary-btn" 
                                    onClick={() => setShowAddModal(false)}
                                    style={{ 
                                        flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', 
                                        background: 'white', fontWeight: '700', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s' 
                                    }}
                                >
                                    {t('cancel')}
                                </button>
                                <button 
                                    className="primary-btn-premium" 
                                    onClick={handleAddSite}
                                    style={{ 
                                        flex: 1, padding: '14px', borderRadius: '12px', background: 'var(--primary)', 
                                        color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', 
                                        boxShadow: '0 8px 16px rgba(79, 70, 229, 0.2)', transition: 'all 0.2s' 
                                    }}
                                >
                                    {t('save')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SiteManagement;
