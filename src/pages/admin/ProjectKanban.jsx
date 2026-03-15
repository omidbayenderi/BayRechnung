import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInvoice } from '../../context/InvoiceContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreVertical, Calendar, DollarSign, User, ArrowRight } from 'lucide-react';

import './ProjectKanban.css';

const ProjectKanban = ({ hideHeader = false }) => {
    const { t } = useLanguage();
    const { projects = [], saveProject, isLoading } = useInvoice(); // Use centralized state
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = useState(false);
    const [newProjectData, setNewProjectData] = useState({ name: '', client_name: '', budget: '' });
    const [confirmModal, setConfirmModal] = useState({ open: false, projectId: null });

    const STAGES = [
        { id: 'lead', title: t('stage_lead'), color: '#94a3b8' },
        { id: 'quoted', title: t('stage_quoted'), color: '#3b82f6' },
        { id: 'in_progress', title: t('stage_in_progress'), color: '#8b5cf6' },
        { id: 'completed', title: t('stage_completed'), color: '#10b981' },
        { id: 'billed', title: t('stage_billed'), color: '#f59e0b' }
    ];

    const handleMove = async (projectId, newStatus) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        
        await saveProject({ ...project, status: newStatus, updated_at: new Date().toISOString() });

        if (newStatus === 'billed') {
            setConfirmModal({ open: true, projectId });
        }
    };

    const handleConfirmBilling = () => {
        const project = projects.find(p => p.id === confirmModal.projectId);
        setConfirmModal({ open: false, projectId: null });
        navigate('/new', {
            state: {
                clientName: project.client_name,
                projectName: project.name,
                amount: project.budget
            }
        });
    };

    const handleAddProject = async () => {
        if (!newProjectData.name) return;
        
        await saveProject({
            name: newProjectData.name,
            client_name: newProjectData.client_name,
            budget: parseFloat(newProjectData.budget) || 0,
            status: 'lead'
        });

        setShowAddModal(false);
        setNewProjectData({ name: '', client_name: '', budget: '' });
    };

    if (isLoading) return <div className="p-8 text-center">{t('loading')}</div>;

    return (
        <div className="kanban-wrapper">
            {!hideHeader && (
                <header className="kanban-header">
                    <div>
                        <h1 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: 0 }}>{t('project_kanban')}</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>{t('overviewText')}</p>
                    </div>
                    <button className="primary-btn" onClick={() => setShowAddModal(true)}>
                        <Plus size={18} />
                        {t('new_project')}
                    </button>
                </header>
            )}

            <div className="kanban-board">
                {STAGES.map(stage => (
                    <div key={stage.id} className="kanban-column">
                        <div className="column-header" style={{ borderBottomColor: stage.color }}>
                            <h3 className="column-title">{stage.title}</h3>
                            <span className="column-count">
                                {projects.filter(p => p.status === stage.id).length}
                            </span>
                        </div>

                        <div className="column-content">
                            {projects
                                .filter(p => p.status === stage.id)
                                .map(project => (
                                    <div key={project.id} className="project-card">
                                        <div className="project-name">{project.name}</div>

                                        <div className="project-meta">
                                            <div className="meta-item">
                                                <User size={14} /> {project.client_name || '-'}
                                            </div>
                                            {project.due_date && (
                                                <div className="meta-item">
                                                    <Calendar size={14} /> {project.due_date}
                                                </div>
                                            )}
                                            {project.budget > 0 && (
                                                <div className="meta-item" style={{ color: 'var(--text-main)', fontWeight: '700' }}>
                                                    <DollarSign size={14} /> {project.budget.toLocaleString()} €
                                                </div>
                                            )}
                                        </div>

                                        <div className="project-progress-container">
                                            <div className="progress-labels">
                                                <span>{t('progress') || 'İlerleme'}</span>
                                                <span style={{ fontWeight: '800', color: stage.color }}>{project.progress || (stage.id === 'completed' || stage.id === 'billed' ? 100 : stage.id === 'in_progress' ? 65 : stage.id === 'quoted' ? 25 : 5)}%</span>
                                            </div>
                                            <div className="progress-bar-bg">
                                                <div className="progress-bar-fill" style={{
                                                    width: `${project.progress || (stage.id === 'completed' || stage.id === 'billed' ? 100 : stage.id === 'in_progress' ? 65 : stage.id === 'quoted' ? 25 : 5)}%`,
                                                    background: stage.color
                                                }} />
                                            </div>
                                        </div>

                                        <div className="project-actions">
                                            {stage.id !== 'billed' && (
                                                <button
                                                    onClick={() => handleMove(project.id, STAGES[STAGES.findIndex(s => s.id === stage.id) + 1].id)}
                                                    className="btn-move"
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


            {/* Modals for Professionalism */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="modal-overlay" style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
                    }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="card"
                            style={{ width: '400px', padding: '30px' }}
                        >
                            <h2 style={{ marginBottom: '20px' }}>{t('new_project')}</h2>
                            <div className="form-group">
                                <label>{t('project_name')}</label>
                                <input
                                    className="form-input"
                                    value={newProjectData.name}
                                    onChange={e => setNewProjectData({ ...newProjectData, name: e.target.value })}
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('client_name')}</label>
                                <input
                                    className="form-input"
                                    value={newProjectData.client_name}
                                    onChange={e => setNewProjectData({ ...newProjectData, client_name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('budget')} (€)</label>
                                <input
                                    className="form-input"
                                    type="number"
                                    value={newProjectData.budget}
                                    onChange={e => setNewProjectData({ ...newProjectData, budget: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button className="secondary-btn" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>{t('cancel')}</button>
                                <button className="primary-btn" onClick={handleAddProject} style={{ flex: 1 }}>{t('save')}</button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {confirmModal.open && (
                    <div className="modal-overlay" style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
                    }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="card"
                            style={{ width: '400px', padding: '30px', textAlign: 'center' }}
                        >
                            <div style={{ color: '#f59e0b', marginBottom: '16px' }}>
                                <DollarSign size={48} style={{ margin: '0 auto' }} />
                            </div>
                            <h3 style={{ marginBottom: '12px', border: 'none' }}>{t('confirm_invoice_creation')}</h3>
                            <p style={{ color: '#64748b', marginBottom: '24px' }}>{t('invoice_now_desc') || 'Proje tamamlandı olarak işaretlendi. Bir fatura oluşturulsun mu?'}</p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button className="secondary-btn" onClick={() => setConfirmModal({ open: false, projectId: null })} style={{ flex: 1 }}>{t('later') || 'Daha Sonra'}</button>
                                <button className="primary-btn" onClick={handleConfirmBilling} style={{ flex: 1 }}>{t('create_invoice') || 'Fatura Oluştur'}</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProjectKanban;
