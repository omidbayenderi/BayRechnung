import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useInvoice } from '../../context/InvoiceContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    MessageSquare,
    Bell,
    Smartphone,
    Users,
    User,
    Search,
    Plus,
    Filter,
    X,
    CheckCircle,
    Info,
    AlertTriangle,
    Mail,
    Phone,
    Briefcase,
    Zap,
    Sparkles,
    FileText,
    Target
} from 'lucide-react';
import './AdminMessaging.css';

const AdminMessagingView = () => {
    const { t } = useLanguage();
    const { employees = [], invoices = [], messages = [], sendMessage, sendBroadcastMessage } = useInvoice();

    const [activeTab, setActiveTab] = useState('compose'); // compose, history
    const [targetGroup, setTargetGroup] = useState('management'); // management, employees, customers
    const [messageType, setMessageType] = useState('announcement'); // announcement, urgent, suggestion, note
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedRecipient, setSelectedRecipient] = useState('all'); 
    const [isSending, setIsSending] = useState(false);
    const [sendSuccess, setSendSuccess] = useState(false);

    // Derived Data for segmentation
    const management = useMemo(() => employees.filter(e => ['admin', 'site_lead', 'finance'].includes(e.role?.toLowerCase())), [employees]);
    const workers = useMemo(() => employees.filter(e => !['admin', 'site_lead', 'finance'].includes(e.role?.toLowerCase())), [employees]);
    const customers = useMemo(() => {
        const unique = {};
        (invoices || []).forEach(inv => {
            if (inv && inv.recipientName && !unique[inv.recipientEmail || inv.recipientName]) {
                unique[inv.recipientEmail || inv.recipientName] = {
                    id: inv.recipientEmail || inv.id,
                    name: inv.recipientName,
                    email: inv.recipientEmail,
                    type: 'Customer'
                };
            }
        });
        return Object.values(unique);
    }, [invoices]);

    const filteredRecipients = useMemo(() => {
        let list = [];
        if (targetGroup === 'management') list = management;
        else if (targetGroup === 'employees') list = employees;
        else if (targetGroup === 'customers') list = customers;
        
        const q = (searchQuery || '').toLowerCase();
        return list.filter(r => (r.name || '').toLowerCase().includes(q) || (r.email || '').toLowerCase().includes(q));
    }, [targetGroup, management, employees, customers, searchQuery]);

    const handleSend = async (e) => {
        e.preventDefault();
        setIsSending(true);

        try {
            const msgData = {
                title,
                message: content,
                category: targetGroup,
                type: messageType,
                receiverId: selectedRecipient === 'all' ? null : selectedRecipient,
                isUrguent: messageType === 'urgent',
                createdAt: new Date().toISOString()
            };

            if (selectedRecipient === 'all') await sendBroadcastMessage(msgData);
            else await sendMessage(msgData);

            setSendSuccess(true);
            setTitle('');
            setContent('');
            setTimeout(() => setSendSuccess(false), 3000);
        } catch (err) {
            console.error("Message send failed:", err);
        } finally {
            setIsSending(false);
        }
    };

    const getTypeStyles = (type) => {
        switch (type) {
            case 'urgent': return { color: '#ef4444', bg: '#fef2f2', icon: <AlertTriangle size={18} /> };
            case 'suggestion': return { color: '#8b5cf6', bg: '#f5f3ff', icon: <Sparkles size={18} /> };
            case 'note': return { color: '#f59e0b', bg: '#fffbeb', icon: <FileText size={18} /> };
            default: return { color: '#3b82f6', bg: '#eff6ff', icon: <Bell size={18} /> };
        }
    };

    return (
        <div className="admin-messaging-wrapper animate-in">
            <header className="messaging-header-premium">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="icon-box-premium">
                        <MessageSquare size={28} />
                    </div>
                    <div>
                        <h1 className="premium-title">{t('executive_communication')}</h1>
                        <p className="premium-subtitle">{t('broadcast_notes_and_suggestions_to_management')}</p>
                    </div>
                </div>

                <div className="tab-switcher-premium">
                    <button onClick={() => setActiveTab('compose')} className={activeTab === 'compose' ? 'active' : ''}>
                        <Plus size={18} /> {t('compose')}
                    </button>
                    <button onClick={() => setActiveTab('history')} className={activeTab === 'history' ? 'active' : ''}>
                        <Filter size={18} /> {t('history')}
                    </button>
                </div>
            </header>

            <div className="messaging-layout-grid">
                <div className="main-messaging-area card-premium">
                    {activeTab === 'compose' ? (
                        <div className="compose-container">
                            <form onSubmit={handleSend}>
                                <div className="segmentation-row">
                                    <h3 className="section-title-premium"><Target size={18} /> {t('target_audience')}</h3>
                                    <div className="segment-chips">
                                        {['management', 'employees', 'customers'].map(group => (
                                            <button 
                                                key={group} 
                                                type="button" 
                                                className={`chip ${targetGroup === group ? 'active' : ''}`}
                                                onClick={() => setTargetGroup(group)}
                                            >
                                                {t(`group_${group}`)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="type-row">
                                    <h3 className="section-title-premium"><Zap size={18} /> {t('message_type')}</h3>
                                    <div className="type-selector">
                                        {['announcement', 'urgent', 'suggestion', 'note'].map(type => {
                                            const styles = getTypeStyles(type);
                                            return (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    className={`type-btn ${messageType === type ? 'active' : ''}`}
                                                    onClick={() => setMessageType(type)}
                                                    style={{ '--active-color': styles.color }}
                                                >
                                                    {React.cloneElement(styles.icon, { size: 16 })}
                                                    {t(`type_${type}`)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="compose-inputs">
                                    <input 
                                        className="premium-input" 
                                        value={title} 
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder={t('subject_placeholder')}
                                        required 
                                    />
                                    <textarea 
                                        className="premium-textarea" 
                                        value={content} 
                                        onChange={e => setContent(e.target.value)}
                                        placeholder={t('message_body_placeholder')}
                                        required 
                                    />
                                </div>

                                <div className="action-footer">
                                    <AnimatePresence>
                                        {sendSuccess && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="success-msg">
                                                <CheckCircle size={18} /> {t('sent_successfully')}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <button type="submit" disabled={isSending} className="send-btn-premium">
                                        {isSending ? <div className="spinner" /> : <Send size={18} />}
                                        {t('send_now')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="history-container">
                            <div className="history-list">
                                {messages.length > 0 ? messages.map((msg, idx) => {
                                    const styles = getTypeStyles(msg.type);
                                    return (
                                        <motion.div 
                                            key={msg.id} 
                                            className="history-item"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <div className="item-header">
                                                <div className="type-badge" style={{ background: styles.bg, color: styles.color }}>
                                                    {styles.icon}
                                                    {t(`type_${msg.type}`)}
                                                </div>
                                                <span className="timestamp">{new Date(msg.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <h4 className="item-title">{msg.title}</h4>
                                            <p className="item-preview">{msg.message}</p>
                                        </motion.div>
                                    );
                                }) : (
                                    <div className="empty-state">
                                        <MessageSquare size={48} />
                                        <p>{t('no_messages_history')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <aside className="messaging-sidebar">
                    <div className="recipient-selector card-premium">
                        <div className="search-box-premium">
                            <Search size={16} />
                            <input placeholder={t('search_recipients')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        <div className="recipients-list">
                            <button className={`recipient-item ${selectedRecipient === 'all' ? 'active' : ''}`} onClick={() => setSelectedRecipient('all')}>
                                <Users size={16} /> {t('all_selected_group')}
                            </button>
                            {filteredRecipients.map(r => (
                                <button key={r.id} className={`recipient-item ${selectedRecipient === r.id ? 'active' : ''}`} onClick={() => setSelectedRecipient(r.id)}>
                                    <User size={16} /> {r.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="impact-stats card-premium dark">
                        <h3>{t('communication_impact')}</h3>
                        <div className="impact-grid">
                            <div className="stat">
                                <span>{messages.length}</span>
                                <label>{t('sent')}</label>
                            </div>
                            <div className="stat">
                                <span>98%</span>
                                <label>{t('delivered')}</label>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default AdminMessagingView;
