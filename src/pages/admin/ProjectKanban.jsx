import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { syncService } from '../../lib/SyncService';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreVertical, Calendar, DollarSign, User, ArrowRight } from 'lucide-react';

const ProjectKanban = () => {
    const { t } = useLanguage();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const STAGES = [
        { id: 'lead', title: t('stage_lead'), color: '#94a3b8' },
        { id: 'quoted', title: t('stage_quoted'), color: '#3b82f6' },
        { id: 'in_progress', title: t('stage_in_progress'), color: '#8b5cf6' },
        { id: 'completed', title: t('stage_completed'), color: '#10b981' },
        { id: 'billed', title: t('stage_billed'), color: '#f59e0b' }
    ];

    useEffect(() => {
        const fetchProjects = async () => {
            if (!currentUser?.id) return;
            // Mock data if no supabase connection or empty
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false });

            if (error) {
                // Fallback for demo/dev if table doesn't exist
                console.log('Using mock data for Kanban');
                setProjects([
                    { id: 1, name: 'Villa Renovation', client_name: 'Schmidt GmbH', status: 'in_progress', budget: 15000, due_date: '2024-05-20' },
                    { id: 2, name: 'Office Complex A', client_name: 'TechStart Inc', status: 'lead', budget: 45000, due_date: '2024-06-15' },
                    { id: 3, name: 'Kitchen Remodel', client_name: 'Mrs. Weber', status: 'completed', budget: 8500, due_date: '2024-04-10' },
                ]);
            }
            else setProjects(data || []);
            setLoading(false);
        };

        fetchProjects();
    }, [currentUser?.id]);

    const handleMove = async (projectId, newStatus) => {
        // Optimistic update
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: newStatus } : p));

        // Enqueue update for background sync
        syncService.enqueue('projects', 'update', { status: newStatus, updated_at: new Date().toISOString() }, projectId);

        if (newStatus === 'billed') {
            const project = projects.find(p => p.id === projectId);
            if (window.confirm(t('confirm_invoice_creation') || 'Proje faturalandı olarak işaretlendi. Şimdi fatura oluşturmak ister misiniz?')) {
                navigate('/new', {
                    state: {
                        clientName: project.client_name,
                        projectName: project.name,
                        amount: project.budget
                    }
                });
            }
        }
    };

    const addProject = async () => {
        const name = prompt(t('project_name') + ':');
        if (!name) return;
        const client = prompt(t('client_name') + ':');

        const id = crypto.randomUUID?.() || `proj-${Date.now()}`;
        const newProject = {
            id,
            user_id: currentUser?.id,
            name,
            client_name: client,
            status: 'lead',
            created_at: new Date().toISOString(),
            progress: 5
        };

        // Update UI immediately (Optimistic)
        setProjects(prev => [newProject, ...prev]);

        // Enqueue insert for background sync
        syncService.enqueue('projects', 'insert', newProject, id);
    };

    if (loading) return <div className="p-8 text-center">{t('loading')}</div>;

    return (
        <div className="kanban-container" style={{ maxWidth: '100%', overflowX: 'auto', height: '100%' }}>
            <header className="page-header" style={{ marginBottom: '24px' }}>
                <div>
                    <h1>{t('project_kanban')}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{t('overviewText')}</p>
                </div>
                <button className="primary-btn" onClick={addProject}>
                    <Plus size={20} />
                    {t('new_project')}
                </button>
            </header>

            <div style={{
                display: 'flex',
                gap: '20px',
                paddingBottom: '20px',
                height: 'calc(100vh - 220px)',
                minHeight: '500px'
            }}>
                {STAGES.map(stage => (
                    <div key={stage.id} style={{
                        flex: '1',
                        minWidth: '280px',
                        maxWidth: '350px',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid #e2e8f0',
                        height: '100%'
                    }}>
                        <div style={{
                            padding: '16px',
                            borderBottom: '3px solid ' + stage.color,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'white',
                            borderTopLeftRadius: '12px',
                            borderTopRightRadius: '12px'
                        }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#334155' }}>{stage.title}</h3>
                            <span style={{
                                background: '#f1f5f9',
                                color: '#64748b',
                                padding: '2px 10px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '600'
                            }}>
                                {projects.filter(p => p.status === stage.id).length}
                            </span>
                        </div>

                        <div style={{ padding: '12px', flex: 1, overflowY: 'auto' }}>
                            {projects
                                .filter(p => p.status === stage.id)
                                .map(project => (
                                    <div key={project.id} className="card" style={{
                                        padding: '16px',
                                        marginBottom: '12px',
                                        cursor: 'grab',
                                        position: 'relative',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '0.95rem' }}>{project.name}</div>

                                        <div style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#64748b' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <User size={14} className="text-muted" /> {project.client_name || '-'}
                                            </div>
                                            {project.due_date && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Calendar size={14} className="text-muted" /> {project.due_date}
                                                </div>
                                            )}
                                            {project.budget > 0 && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: '600' }}>
                                                    <DollarSign size={14} className="text-muted" /> {project.budget}
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ marginTop: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                                                <span>{t('progress') || 'İlerleme'}</span>
                                                <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{project.progress || (stage.id === 'completed' || stage.id === 'billed' ? 100 : stage.id === 'in_progress' ? 65 : stage.id === 'quoted' ? 25 : 5)}%</span>
                                            </div>
                                            <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: `${project.progress || (stage.id === 'completed' || stage.id === 'billed' ? 100 : stage.id === 'in_progress' ? 65 : stage.id === 'quoted' ? 25 : 5)}%`,
                                                    background: stage.color,
                                                    transition: 'width 0.3s ease'
                                                }} />
                                            </div>
                                        </div>

                                        <div style={{
                                            marginTop: '16px',
                                            display: 'flex',
                                            justifyContent: 'flex-end',
                                            gap: '8px',
                                            borderTop: '1px solid #f1f5f9',
                                            paddingTop: '12px'
                                        }}>
                                            {stage.id !== 'billed' && (
                                                <button
                                                    onClick={() => handleMove(project.id, STAGES[STAGES.findIndex(s => s.id === stage.id) + 1].id)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: '1px solid #e2e8f0',
                                                        color: '#3b82f6',
                                                        fontSize: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        cursor: 'pointer',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    {t('move_forward')} <ArrowRight size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectKanban;
