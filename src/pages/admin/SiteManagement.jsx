import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import ProjectKanban from './ProjectKanban';
import SiteControlCenter from '../../components/SiteControlCenter';
import { Layout, Map, Kanban } from 'lucide-react';

const SiteManagement = () => {
    const { t } = useLanguage();
    const [view, setView] = useState('kanban'); // 'kanban' or 'map'

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
                    // ProjectKanban has its own container styling, we might need to adjust it slightly if it's too much padding
                    <div style={{ height: '100%' }}>
                        <ProjectKanban />
                    </div>
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
