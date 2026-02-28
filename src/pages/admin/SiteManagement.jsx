import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import ProjectKanban from './ProjectKanban';
import SiteControlCenter from '../../components/SiteControlCenter';
import { Layout, Map, Kanban, Calendar } from 'lucide-react';
import TimelineGantt from '../../components/admin/TimelineGantt';
import { useInvoice } from '../../context/InvoiceContext';

const SiteManagement = () => {
    const { t } = useLanguage();
    const { invoices } = useInvoice();
    const [view, setView] = useState('kanban'); // 'kanban', 'map', 'timeline'

    // Mock projects for timeline if real ones aren't enough
    const timelineData = [
        { id: 1, name: 'Kuzey Rezidans', start_date: '2024-02-01', due_date: '2024-05-15', progress: 65, color: '#4f46e5', category: 'İnşaat' },
        { id: 2, name: 'Güney Metro', start_date: '2024-03-10', due_date: '2024-08-20', progress: 20, color: '#8b5cf6', category: 'Altyapı' },
        { id: 3, name: 'Doğu İş Merkezi', start_date: '2024-01-15', due_date: '2024-04-10', progress: 95, color: '#10b981', category: 'İnşaat' }
    ];

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Sub-Header for View Switching */}
            <div style={{
                padding: '16px 24px',
                background: 'white',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                        {t('site_management')}
                    </h2>
                </div>

                <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                    <button
                        onClick={() => setView('kanban')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '6px',
                            background: view === 'kanban' ? 'white' : 'transparent',
                            color: view === 'kanban' ? '#0f172a' : '#64748b',
                            boxShadow: view === 'kanban' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            fontWeight: '500',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Kanban size={16} />
                        {t('project_kanban')}
                    </button>
                    <button
                        onClick={() => setView('timeline')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '6px',
                            background: view === 'timeline' ? 'white' : 'transparent',
                            color: view === 'timeline' ? '#0f172a' : '#64748b',
                            boxShadow: view === 'timeline' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            fontWeight: '500',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Calendar size={16} />
                        {t('timeline')}
                    </button>
                    <button
                        onClick={() => setView('map')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '6px',
                            background: view === 'map' ? 'white' : 'transparent',
                            color: view === 'map' ? '#0f172a' : '#64748b',
                            boxShadow: view === 'map' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            fontWeight: '500',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Map size={16} />
                        {t('site_control_center')}
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                {view === 'kanban' ? (
                    <div style={{ height: '100%' }}>
                        <ProjectKanban />
                    </div>
                ) : view === 'timeline' ? (
                    <TimelineGantt title={t('site_timeline') || 'Şantiye İş Programı'} data={timelineData} />
                ) : (
                    <div className="page-container" style={{ padding: 0 }}>
                        <SiteControlCenter t={t} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SiteManagement;
