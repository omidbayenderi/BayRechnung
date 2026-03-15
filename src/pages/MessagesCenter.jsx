import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useInvoice } from '../context/InvoiceContext';
import { useNotification } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bell, 
    MessageSquare, 
    AlertTriangle, 
    Send, 
    CheckCircle, 
    Search, 
    Trash2, 
    X, 
    Plus, 
    Filter, 
    User, 
    Users, 
    Briefcase,
    Mail,
    Smartphone,
    ArrowRight,
    Search as SearchIcon,
    Archive,
    Star,
    MoreVertical,
    Paperclip
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';
import './MessagesCenter.css';

const MessagesCenter = () => {
    const { currentUser } = useAuth();
    const { t } = useLanguage();
    const { messages = [], sendMessage, markMessageAsRead, deleteMessage, employees = [] } = useInvoice() || {};
    const { showNotification } = useNotification();

    const [mainView, setMainView] = useState('messages');
    const [messageTab, setMessageTab] = useState('all');
    const [notificationTab, setNotificationTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showNewMessageModal, setShowNewMessageModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(null);

    const [newMessage, setNewMessage] = useState({
        recipient: '',
        title: '',
        message: '',
        type: 'message',
        category: 'internal'
    });

    const filteredMessages = useMemo(() => {
        return messages.filter(msg => {
            if (!msg) return false;
            const content = (msg.content || msg.message || '').toString();
            const sender = (msg.sender || 'System').toString();
            const title = (msg.title || (msg.content ? msg.content.substring(0, 20) : 'Untitled')).toString();
            const q = searchQuery.toLowerCase();

            const matchesSearch = title.toLowerCase().includes(q) ||
                content.toLowerCase().includes(q) ||
                sender.toLowerCase().includes(q);

            if (!matchesSearch) return false;

            if (mainView === 'messages') {
                if (msg.type === 'alert' || msg.type === 'warning' || msg.category === 'system') return false;
                if (messageTab === 'internal') return msg.category === 'internal' || !msg.category;
                if (messageTab === 'customer') return msg.category === 'customer';
                return true;
            } else {
                if (msg.type !== 'alert' && msg.type !== 'warning' && msg.category !== 'system') return false;
                if (notificationTab === 'unread') return msg.status === 'unread';
                if (notificationTab === 'alerts') return ['alert', 'warning'].includes(msg.type);
                return true;
            }
        });
    }, [messages, mainView, messageTab, notificationTab, searchQuery]);

    const handleMessageClick = (msg) => {
        setSelectedMessage(msg);
        if (msg.status === 'unread') {
            markMessageAsRead(msg.id);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        setIsDeleting(id);
        setTimeout(() => {
            deleteMessage(id);
            if (selectedMessage?.id === id) setSelectedMessage(null);
            setIsDeleting(null);
            showNotification(t('success_delete_msg'), 'success');
        }, 300);
    };

    const handleSend = (e) => {
        e.preventDefault();
        sendMessage({
            message: newMessage.message,
            receiverId: newMessage.recipient === 'all' ? null : employees.find(e => e.name === newMessage.recipient)?.id,
            category: newMessage.category,
            title: newMessage.title
        });
        setShowNewMessageModal(false);
        setNewMessage({ recipient: '', title: '', message: '', type: 'message', category: 'internal' });
        showNotification(t('msg_sent_success'), 'success');
    };

    const getInitials = (name) => {
        if (!name) return 'S';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <div className="messages-container animate-in">
            <header className="messages-header">
                <div>
                    <h1>{t('communicationCenter')}</h1>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{t('manage_internal_and_external_comms')}</p>
                </div>
                <button 
                    className="primary-btn-premium" 
                    onClick={() => setShowNewMessageModal(true)}
                    style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(79, 70, 229, 0.2)' }}
                >
                    <Plus size={22} />
                    {t('compose_new')}
                </button>
            </header>

            <div className="messages-view-toggle">
                <button 
                    className={`view-toggle-btn ${mainView === 'messages' ? 'active' : ''}`}
                    onClick={() => { setMainView('messages'); setSelectedMessage(null); }}
                >
                    <MessageSquare size={20} />
                    {t('messages')}
                    <span className="badge-count" style={{ background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem' }}>
                        {messages.filter(m => m.status === 'unread' && m.type !== 'alert').length}
                    </span>
                </button>
                <button 
                    className={`view-toggle-btn ${mainView === 'notifications' ? 'active' : ''}`}
                    onClick={() => { setMainView('notifications'); setSelectedMessage(null); }}
                >
                    <Bell size={20} />
                    {t('notifications')}
                    <span className="badge-count" style={{ background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem' }}>
                        {messages.filter(m => m.status === 'unread' && m.type === 'alert').length}
                    </span>
                </button>
            </div>

            <div className="messages-grid">
                {/* Sidebar */}
                <div className="messages-sidebar">
                    <div className="sidebar-search-container">
                        <div className="modern-search-box">
                            <SearchIcon size={18} className="text-muted" />
                            <input 
                                type="text" 
                                placeholder={t('search_messages_or_contacts')} 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="sidebar-tabs">
                        {mainView === 'messages' ? (
                            ['all', 'internal', 'customer'].map(tab => (
                                <button 
                                    key={tab} 
                                    className={`sidebar-tab-btn ${messageTab === tab ? 'active' : ''}`}
                                    onClick={() => setMessageTab(tab)}
                                >
                                    {t(tab)}
                                </button>
                            ))
                        ) : (
                            ['all', 'unread', 'alerts', 'archive'].map(tab => (
                                <button 
                                    key={tab} 
                                    className={`sidebar-tab-btn ${notificationTab === tab ? 'active' : ''}`}
                                    onClick={() => setNotificationTab(tab)}
                                >
                                    {t(tab)}
                                </button>
                            ))
                        )}
                    </div>

                    <div className="messages-list">
                        <AnimatePresence>
                            {filteredMessages.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon-circle">
                                        <Mail size={40} />
                                    </div>
                                    <h3>{t('no_messages_found')}</h3>
                                    <p>{t('try_different_filter')}</p>
                                </div>
                            ) : (
                                filteredMessages.map((msg, index) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`message-preview-item ${selectedMessage?.id === msg.id ? 'active' : ''} ${isDeleting === msg.id ? 'deleting' : ''}`}
                                        onClick={() => handleMessageClick(msg)}
                                    >
                                        <div className="msg-avatar" style={{ 
                                            background: msg.category === 'customer' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)'
                                        }}>
                                            {getInitials(msg.sender || 'System')}
                                        </div>
                                        <div className="msg-content-preview">
                                            <div className="msg-meta">
                                                <span className="msg-sender">{msg.sender || 'System'}</span>
                                                <span className="msg-time">{new Date(msg.created_at || msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <div className="msg-title">{msg.title || t('no_subject')}</div>
                                            <div className="msg-snippet">{msg.content || msg.message}</div>
                                            {!msg.is_read && <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', position: 'absolute', right: '20px', bottom: '25px' }}></div>}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Detail View */}
                <div className="detail-view-container">
                    <AnimatePresence mode="wait">
                        {selectedMessage ? (
                            <motion.div 
                                key={selectedMessage.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                            >
                                <div className="detail-header">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', gap: '20px' }}>
                                            <div className="msg-avatar" style={{ width: '64px', height: '64px', borderRadius: '18px', fontSize: '1.4rem' }}>
                                                {getInitials(selectedMessage.sender)}
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>{selectedMessage.sender}</h3>
                                                    <span className={`premium-status-badge ${selectedMessage.type === 'alert' ? 'status-alert' : 'status-unread'}`}>
                                                        {selectedMessage.category === 'customer' ? t('client') : t('staff')}
                                                    </span>
                                                </div>
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
                                                    {new Date(selectedMessage.time).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="detail-actions">
                                            <button className="icon-btn-premium"><Star size={20} /></button>
                                            <button className="icon-btn-premium"><Archive size={20} /></button>
                                            <button 
                                                className="icon-btn-premium" 
                                                onClick={(e) => handleDelete(e, selectedMessage.id)}
                                                style={{ color: '#ef4444' }}
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                    <h2 style={{ fontSize: '2rem', fontWeight: '800', marginTop: '32px', letterSpacing: '-0.5px' }}>{selectedMessage.title}</h2>
                                </div>

                                <div className="detail-body">
                                    <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: '#334155', fontWeight: 400 }}>
                                        {selectedMessage.content || selectedMessage.message}
                                    </p>
                                    
                                    {/* Dummy Attachments */}
                                    {Math.random() > 0.5 && (
                                        <div style={{ marginTop: '40px', padding: '16px', border: '1px dashed rgba(15, 23, 42, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                                <Paperclip size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Project_Brief_v2.pdf</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>2.4 MB • PDF Document</div>
                                            </div>
                                            <button style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }}>{t('download')}</button>
                                        </div>
                                    )}
                                </div>

                                <div className="detail-footer">
                                    <div className="msg-avatar" style={{ width: '40px', height: '40px', fontSize: '0.9rem' }}>
                                        {getInitials(currentUser?.displayName || 'Admin')}
                                    </div>
                                    <input 
                                        type="text" 
                                        className="modern-reply-box" 
                                        placeholder={`${t('reply_to')} ${selectedMessage.sender}...`}
                                    />
                                    <button className="primary-btn-premium" style={{ width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                                        <Send size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon-circle">
                                    <MessageSquare size={48} />
                                </div>
                                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '12px' }}>{t('no_message_selected')}</h2>
                                <p style={{ color: 'var(--text-muted)', maxWidth: '300px' }}>{t('select_a_conversation_to_read_and_reply')}</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Modal for New Message */}
            <AnimatePresence>
                {showNewMessageModal && (
                    <motion.div 
                        className="modal-premium-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <motion.div 
                            className="modal-premium-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{ background: 'white', width: '600px', borderRadius: '32px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>{t('compose_new')}</h2>
                                <button className="icon-btn-premium" onClick={() => setShowNewMessageModal(false)}><X size={24} /></button>
                            </div>

                            <form onSubmit={handleSend}>
                                <div className="form-group-premium" style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontWeight: '700', marginBottom: '10px' }}>{t('recipient')}</label>
                                    <select 
                                        style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid rgba(15, 23, 42, 0.1)', background: '#f8fafc', fontWeight: '600' }}
                                        required
                                        value={newMessage.recipient}
                                        onChange={(e) => setNewMessage({...newMessage, recipient: e.target.value})}
                                    >
                                        <option value="">{t('select_recipient')}</option>
                                        <option value="all">{t('all_staff')}</option>
                                        {employees.map(e => <option key={e.id} value={e.name}>{e.name} ({e.role})</option>)}
                                    </select>
                                </div>

                                <div className="form-group-premium" style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontWeight: '700', marginBottom: '10px' }}>{t('subject')}</label>
                                    <input 
                                        type="text"
                                        style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid rgba(15, 23, 42, 0.1)', background: '#f8fafc', fontWeight: '600' }}
                                        placeholder={t('subject_placeholder')}
                                        required
                                        value={newMessage.title}
                                        onChange={(e) => setNewMessage({...newMessage, title: e.target.value})}
                                    />
                                </div>

                                <div className="form-group-premium" style={{ marginBottom: '32px' }}>
                                    <label style={{ display: 'block', fontWeight: '700', marginBottom: '10px' }}>{t('message')}</label>
                                    <textarea 
                                        style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid rgba(15, 23, 42, 0.1)', background: '#f8fafc', fontWeight: '500', minHeight: '150px' }}
                                        placeholder={t('write_your_message_here')}
                                        required
                                        value={newMessage.message}
                                        onChange={(e) => setNewMessage({...newMessage, message: e.target.value})}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <button 
                                        type="button" 
                                        className="btn-secondary" 
                                        onClick={() => setShowNewMessageModal(false)}
                                        style={{ flex: 1, padding: '16px', borderRadius: '16px', border: '1px solid rgba(15, 23, 42, 0.1)', fontWeight: '700', cursor: 'pointer' }}
                                    >
                                        {t('cancel')}
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn-primary"
                                        style={{ flex: 2, padding: '16px', borderRadius: '16px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                    >
                                        <Send size={20} />
                                        {t('send_now')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MessagesCenter;
