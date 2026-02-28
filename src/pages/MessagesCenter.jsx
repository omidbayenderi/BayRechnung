import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useInvoice } from '../context/InvoiceContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, MessageSquare, AlertTriangle, Send, CheckCircle, Search, Trash2, X, Plus, Filter, User, Users, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';

const MessagesCenter = () => {
    const { currentUser } = useAuth();
    const { t: translate } = useLanguage();
    // Helper to use correct translation key or fallback
    const _t = (key) => {
        const val = translate(key);
        return val !== key ? val : key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
    };

    const invoiceContext = useInvoice();
    const { messages = [], sendMessage, markMessageAsRead, deleteMessage, employees = [] } = invoiceContext || {};

    // Main View State: 'messages' or 'notifications'
    const [mainView, setMainView] = useState('messages');

    // Sub-tab State
    const [messageTab, setMessageTab] = useState('all'); // all, internal, customer
    const [notificationTab, setNotificationTab] = useState('all'); // all, unread, alerts

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showNewMessageModal, setShowNewMessageModal] = useState(false);

    // New Message Form State
    const [newMessage, setNewMessage] = useState({
        recipient: '',
        title: '',
        message: '',
        type: 'message',
        category: 'internal'
    });

    // Filter Logic
    const filteredMessages = (messages || []).filter(msg => {
        if (!msg) return false;
        // 1. Search Filter
        const content = (msg.content || msg.message || '').toString();
        const sender = (msg.sender || 'System').toString();
        const title = (msg.title || (msg.content ? msg.content.substring(0, 20) : 'No Subject')).toString();
        const q = (searchQuery || '').toLowerCase();

        const matchesSearch = title.toLowerCase().includes(q) ||
            content.toLowerCase().includes(q) ||
            sender.toLowerCase().includes(q);

        if (!matchesSearch) return false;

        // 2. Main View Filter
        if (mainView === 'messages') {
            // Include both internal and customer messages, exclude system alerts
            if (msg.type === 'alert' || msg.type === 'warning' || msg.category === 'system') return false;

            // 3. Sub-tab Filter for Messages
            if (messageTab === 'internal') return msg.category === 'internal' || !msg.category;
            if (messageTab === 'customer') return msg.category === 'customer';
            return true;
        } else {
            // Include system alerts/notifications
            if (msg.type !== 'alert' && msg.type !== 'warning' && msg.category !== 'system') return false;

            // 3. Sub-tab Filter for Notifications
            if (notificationTab === 'unread') return msg.status === 'unread';
            if (notificationTab === 'alerts') return ['alert', 'warning'].includes(msg.type);
            return true;
        }
    });

    const getIcon = (type, category) => {
        if (category === 'customer') return <Briefcase size={20} className="text-primary" />;
        switch (type) {
            case 'alert': return <AlertTriangle size={20} className="text-danger" />;
            case 'warning': return <AlertTriangle size={20} className="text-warning" />;
            case 'success': return <CheckCircle size={20} className="text-success" />;
            default: return <MessageSquare size={20} className="text-primary" />;
        }
    };

    const handleMessageClick = (msg) => {
        setSelectedMessage(msg);
        if (msg.status === 'unread') {
            markMessageAsRead(msg.id);
        }
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        deleteMessage(id);
        if (selectedMessage?.id === id) {
            setSelectedMessage(null);
        }
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
    };

    return (
        <div className="page-container">
            <header className="page-header" style={{ marginBottom: '24px' }}>
                <div>
                    <h1>{_t('communicationCenter')}</h1>
                    <p>{_t('manageMessagesAndAlerts')}</p>
                </div>
                <button className="primary-btn" onClick={() => setShowNewMessageModal(true)}>
                    <Send size={20} />
                    {_t('compose')}
                </button>
            </header>

            {/* Main View Toggles */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <button
                    className={`btn ${mainView === 'messages' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => { setMainView('messages'); setSelectedMessage(null); }}
                    style={{ flex: 1, justifyContent: 'center', padding: '16px', fontSize: '1.1rem' }}
                >
                    <MessageSquare size={24} />
                    {_t('messages')}
                </button>
                <button
                    className={`btn ${mainView === 'notifications' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => { setMainView('notifications'); setSelectedMessage(null); }}
                    style={{ flex: 1, justifyContent: 'center', padding: '16px', fontSize: '1.1rem' }}
                >
                    <Bell size={24} />
                    {_t('notifications')}
                </button>
            </div>

            <div className="messages-layout" style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px', height: 'calc(100vh - 260px)', minHeight: '500px' }}>

                {/* Sidebar List */}
                <div className="card" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                        <div className="search-bar" style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--bg-body)', padding: '8px 12px', borderRadius: '8px', marginBottom: '16px' }}>
                            <Search className="text-muted" size={18} />
                            <input
                                type="text"
                                placeholder={_t('search')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem' }}
                            />
                        </div>

                        {/* Sub-tabs based on Main View */}
                        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto' }}>
                            {mainView === 'messages' ? (
                                <>
                                    {['all', 'internal', 'customer'].map(tab => (
                                        <button key={tab} onClick={() => setMessageTab(tab)} style={subTabStyle(messageTab === tab)}>
                                            {tab === 'customer' && <Briefcase size={14} />}
                                            {tab === 'internal' && <Users size={14} />}
                                            {_t(tab)}
                                        </button>
                                    ))}
                                </>
                            ) : (
                                <>
                                    {['all', 'unread', 'alerts'].map(tab => (
                                        <button key={tab} onClick={() => setNotificationTab(tab)} style={subTabStyle(notificationTab === tab)}>
                                            {_t(tab)}
                                        </button>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="notifications-list" style={{ flex: 1, overflowY: 'auto' }}>
                        {filteredMessages.length === 0 ? (
                            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                {mainView === 'messages' ? <MessageSquare size={32} style={{ opacity: 0.3 }} /> : <Bell size={32} style={{ opacity: 0.3 }} />}
                                <p style={{ marginTop: '12px' }}>{_t('noItemsFound')}</p>
                            </div>
                        ) : (
                            filteredMessages.map((msg) => (
                                <div
                                    key={msg.id}
                                    onClick={() => handleMessageClick(msg)}
                                    style={{
                                        padding: '16px',
                                        borderBottom: '1px solid var(--border)',
                                        cursor: 'pointer',
                                        background: selectedMessage?.id === msg.id ? 'var(--primary-light)' : (msg.is_read ? 'white' : '#f8fafc'),
                                        borderLeft: !msg.is_read ? '3px solid var(--primary)' : '3px solid transparent',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {getIcon(msg.type, msg.category)}
                                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>
                                                {msg.sender || (msg.sender_id === currentUser?.id ? 'Benden' : 'Sistem')}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                            {new Date(msg.created_at || msg.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: !msg.is_read ? '700' : '500', color: 'var(--text-main)' }}>
                                        {msg.title || (msg.content ? msg.content.substring(0, 30) + '...' : 'İletişim')}
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {msg.content || msg.message}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Detail View */}
                <div className="card" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {selectedMessage ? (
                        <>
                            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        {getIcon(selectedMessage.type, selectedMessage.category)}
                                        <span className={`badge ${selectedMessage.type === 'alert' ? 'warning' : 'success'}`} style={{ textTransform: 'uppercase' }}>
                                            {selectedMessage.category === 'customer' ? _t('customer_message_log') : _t(selectedMessage.type)}
                                        </span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            {new Date(selectedMessage.time).toLocaleString()}
                                        </span>
                                    </div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '8px 0', lineHeight: '1.3' }}>{selectedMessage.title}</h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
                                        <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}>
                                            {selectedMessage.sender[0]}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>{selectedMessage.sender}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {selectedMessage.category === 'customer' ? _t('msg_external_client') : _t('msg_internal_user')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="icon-btn delete"
                                    onClick={(e) => handleDelete(e, selectedMessage.id)}
                                    title={_t('delete')}
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>

                            <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
                                <p style={{ fontSize: '1.05rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>
                                    {selectedMessage.message}
                                </p>
                            </div>

                            {/* Reply Box */}
                            <div style={{ padding: '24px', borderTop: '1px solid var(--border)', background: 'var(--bg-body)' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <input
                                        type="text"
                                        placeholder={selectedMessage.category === 'customer' ? _t('replyToCustomer') : _t('replyToColleague')}
                                        style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                                    />
                                    <button className="primary-btn" style={{ padding: '0 24px' }}>
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                            <div style={{ width: '80px', height: '80px', background: 'var(--bg-body)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                                {mainView === 'messages' ? <MessageSquare size={40} style={{ opacity: 0.5 }} /> : <Bell size={40} style={{ opacity: 0.5 }} />}
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{_t('selectItemToView')}</h3>
                            <p>{mainView === 'messages' ? _t('selectMessageDesc') : _t('selectNotificationDesc')}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* New Message Modal */}
            {showNewMessageModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ width: '500px', padding: '24px' }}>
                        <div className="modal-header">
                            <h2>{_t('composeNew')}</h2>
                            <button className="icon-btn" onClick={() => setShowNewMessageModal(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSend}>
                            <div className="form-group">
                                <label>{_t('category')}</label>
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'normal' }}>
                                        <input
                                            type="radio"
                                            name="category"
                                            value="internal"
                                            checked={newMessage.category === 'internal'}
                                            onChange={(e) => setNewMessage({ ...newMessage, category: e.target.value })}
                                        />
                                        {_t('internal_message')}
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'normal' }}>
                                        <input
                                            type="radio"
                                            name="category"
                                            value="customer"
                                            checked={newMessage.category === 'customer'}
                                            onChange={(e) => setNewMessage({ ...newMessage, category: e.target.value })}
                                        />
                                        {_t('customer_message_log')}
                                    </label>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>{_t('recipient')}</label>
                                {newMessage.category === 'internal' ? (
                                    <select
                                        className="form-input"
                                        required
                                        value={newMessage.recipient}
                                        onChange={(e) => setNewMessage({ ...newMessage, recipient: e.target.value })}
                                    >
                                        <option value="">{_t('selectRecipient')}</option>
                                        <option value="all">{_t('allEmployees')}</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.name}>{emp.name} ({emp.role})</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        className="form-input"
                                        placeholder={_t('customer_placeholder')}
                                        required
                                        value={newMessage.recipient}
                                        onChange={(e) => setNewMessage({ ...newMessage, recipient: e.target.value })}
                                    />
                                )}
                            </div>

                            {newMessage.category === 'internal' && (
                                <div className="form-group">
                                    <label>{_t('priority')}</label>
                                    <select
                                        className="form-input"
                                        value={newMessage.type}
                                        onChange={(e) => setNewMessage({ ...newMessage, type: e.target.value })}
                                    >
                                        <option value="message">{_t('standard')}</option>
                                        <option value="alert">{_t('highPriority')}</option>
                                    </select>
                                </div>
                            )}

                            <div className="form-group">
                                <label>{_t('subject')}</label>
                                <input
                                    className="form-input"
                                    required
                                    value={newMessage.title}
                                    onChange={(e) => setNewMessage({ ...newMessage, title: e.target.value })}
                                    placeholder={_t('enterSubject')}
                                />
                            </div>
                            <div className="form-group">
                                <label>{_t('message')}</label>
                                <textarea
                                    className="input"
                                    required
                                    rows="5"
                                    value={newMessage.message}
                                    onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                                    placeholder={_t('enterMessage')}
                                    style={{ width: '100%', padding: '12px' }}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="secondary-btn" onClick={() => setShowNewMessageModal(false)}>
                                    {_t('cancel')}
                                </button>
                                <button type="submit" className="primary-btn">
                                    <Send size={18} /> {_t('send')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const subTabStyle = (active) => ({
    border: 'none',
    background: active ? 'var(--primary-light)' : 'transparent',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: active ? '600' : '500',
    color: active ? 'var(--primary)' : 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s'
});

export default MessagesCenter;
