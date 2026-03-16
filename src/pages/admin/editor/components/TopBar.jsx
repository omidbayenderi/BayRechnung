import React, { useState } from 'react';
import { useEditor } from '../../../context/EditorContext';
import { ArrowLeft, Undo, Redo, Save, Monitor, Tablet, Smartphone, Eye, Send, FileText, ChevronDown, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PageSelector = () => {
    const { pages, currentPageId, changePage, addPage, deletePage, updatePageTitle } = useEditor();
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');

    const currentPage = pages.find(p => p.id === currentPageId) || pages[0];

    const handleAdd = () => {
        const id = addPage('Yeni Sayfa');
        changePage(id);
        setIsOpen(false);
    };

    const startEdit = (e, page) => {
        e.stopPropagation();
        setEditingId(page.id);
        setEditTitle(page.title);
    };

    const saveEdit = (e, id) => {
        e.stopPropagation();
        if (editTitle.trim()) {
            updatePageTitle(id, editTitle.trim());
        }
        setEditingId(null);
    };

    return (
        <div style={{ position: 'relative' }}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500', color: '#1e293b' }}
            >
                <FileText size={16} color="#64748b" />
                {currentPage?.title || 'Sayfa Seç'}
                <ChevronDown size={16} color="#64748b" />
            </button>

            {isOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, width: '260px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', zIndex: 1000, overflow: 'hidden' }}>
                    <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Sayfalarınız</span>
                        <button onClick={handleAdd} style={{ background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: '4px', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <Plus size={14} />
                        </button>
                    </div>
                    
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {pages.map(page => (
                            <div 
                                key={page.id} 
                                onClick={() => { if(editingId !== page.id) { changePage(page.id); setIsOpen(false); } }}
                                style={{ 
                                    padding: '10px 12px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between', 
                                    cursor: editingId === page.id ? 'default' : 'pointer',
                                    background: currentPageId === page.id ? '#f0fdf4' : 'white',
                                    borderBottom: '1px solid #f1f5f9',
                                    transition: 'background 0.2s'
                                }}
                            >
                                {editingId === page.id ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%' }}>
                                        <input 
                                            autoFocus 
                                            value={editTitle} 
                                            onChange={e => setEditTitle(e.target.value)}
                                            onKeyDown={e => { if(e.key === 'Enter') saveEdit(e, page.id) }} 
                                            style={{ flex: 1, padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }} 
                                        />
                                        <button onClick={(e) => saveEdit(e, page.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981', padding: '4px' }}><Check size={14} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}><X size={14} /></button>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <FileText size={14} color={currentPageId === page.id ? '#10b981' : '#94a3b8'} />
                                            <span style={{ fontSize: '14px', color: currentPageId === page.id ? '#15803d' : '#334155', fontWeight: currentPageId === page.id ? '600' : '400' }}>{page.title}</span>
                                        </div>
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <button onClick={(e) => startEdit(e, page)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }} title="Düzenle">
                                                <Edit2 size={14} />
                                            </button>
                                            {pages.length > 1 && (
                                                <button onClick={(e) => { e.stopPropagation(); deletePage(page.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }} title="Sil">
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const TopBar = ({ onSave, onPublish }) => {
    const { undo, redo, canUndo, canRedo, deviceMode, setDeviceMode } = useEditor();
    const navigate = useNavigate();

    return (
        <div style={{
            height: '60px',
            background: 'white',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            zIndex: 100
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button
                    onClick={() => navigate('/admin')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontWeight: '500' }}
                >
                    <ArrowLeft size={18} />
                    Panele Dön
                </button>
                <div style={{ height: '24px', width: '1px', background: '#e2e8f0' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={undo} disabled={!canUndo} style={{ background: 'none', border: 'none', color: canUndo ? '#1e293b' : '#cbd5e1', cursor: canUndo ? 'pointer' : 'not-allowed', padding: '6px' }} title="Geri Al">
                        <Undo size={18} />
                    </button>
                    <button onClick={redo} disabled={!canRedo} style={{ background: 'none', border: 'none', color: canRedo ? '#1e293b' : '#cbd5e1', cursor: canRedo ? 'pointer' : 'not-allowed', padding: '6px' }} title="İleri Al">
                        <Redo size={18} />
                    </button>
                </div>
            </div>

            {/* Page Selector (Center) */}
            <div style={{ display: 'flex', flex: 1, justifyContent: 'center' }}>
                <PageSelector />
            </div>

            {/* Device Toggle & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
                <button
                    onClick={() => setDeviceMode('desktop')}
                    style={{ background: deviceMode === 'desktop' ? 'white' : 'transparent', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', boxShadow: deviceMode === 'desktop' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', color: deviceMode === 'desktop' ? '#3b82f6' : '#64748b' }}
                >
                    <Monitor size={18} />
                </button>
                <button
                    onClick={() => setDeviceMode('tablet')}
                    style={{ background: deviceMode === 'tablet' ? 'white' : 'transparent', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', boxShadow: deviceMode === 'tablet' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', color: deviceMode === 'tablet' ? '#3b82f6' : '#64748b' }}
                >
                    <Tablet size={18} />
                </button>
                <button
                    onClick={() => setDeviceMode('mobile')}
                    style={{ background: deviceMode === 'mobile' ? 'white' : 'transparent', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', boxShadow: deviceMode === 'mobile' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', color: deviceMode === 'mobile' ? '#3b82f6' : '#64748b' }}
                >
                    <Smartphone size={18} />
                </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                    style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', cursor: 'pointer', color: '#1e293b' }}
                    onClick={() => window.open('/s/preview', '_blank')}
                >
                    <Eye size={18} />
                    Önizleme
                </button>
                <button
                    onClick={onSave}
                    style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', cursor: 'pointer', color: '#1e293b' }}
                >
                    <Save size={18} />
                    Taslağı Kaydet
                </button>
                <button
                    onClick={onPublish}
                    style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                    <Send size={18} />
                    Yayınla
                </button>
            </div>
            </div>
        </div>
    );
};

export default TopBar;
