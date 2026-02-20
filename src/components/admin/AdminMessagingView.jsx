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
    Briefcase
} from 'lucide-react';

const AdminMessagingView = () => {
    const { t } = useLanguage();
    const { employees, invoices, messages, sendMessage, sendBroadcastMessage, deleteMessage, markMessageAsRead } = useInvoice();

    const [activeTab, setActiveTab] = useState('compose'); // compose, history
    const [targetGroup, setTargetGroup] = useState('employees'); // employees, customers
    const [messageType, setMessageType] = useState('message'); // message, notification, sms, whatsapp
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedRecipient, setSelectedRecipient] = useState('all'); // 'all' or ID
    const [isSending, setIsSending] = useState(false);
    const [sendSuccess, setSendSuccess] = useState(false);

    // Derived Data
    const customers = useMemo(() => {
        const unique = {};
        invoices.forEach(inv => {
            if (inv.recipientName && !unique[inv.recipientEmail || inv.recipientName]) {
                unique[inv.recipientEmail || inv.recipientName] = {
                    id: inv.recipientEmail || inv.id, // Fallback ID
                    name: inv.recipientName,
                    email: inv.recipientEmail,
                    phone: inv.recipientPhone || '', // If available
                    type: 'Customer'
                };
            }
        });
        return Object.values(unique);
    }, [invoices]);

    const filteredRecipients = useMemo(() => {
        const list = targetGroup === 'employees' ? employees : customers;
        return list.filter(r =>
            r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.email && r.email.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [targetGroup, employees, customers, searchQuery]);

    const handleSend = async (e) => {
        e.preventDefault();
        setIsSending(true);

        try {
            const msgData = {
                title,
                message: content,
                category: targetGroup === 'employees' ? 'internal' : 'customer',
                type: messageType,
                receiverId: selectedRecipient === 'all' ? null : selectedRecipient
            };

            if (selectedRecipient === 'all') {
                await sendBroadcastMessage(msgData);
            } else {
                await sendMessage(msgData);
            }

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

    const getMessageIcon = (type) => {
        switch (type) {
            case 'sms': return <Smartphone size={16} color="#10b981" />;
            case 'whatsapp': return <Phone size={16} color="#22c55e" />;
            case 'notification': return <Bell size={16} color="#f59e0b" />;
            default: return <MessageSquare size={16} color="#3b82f6" />;
        }
    };

    return (
        <div className="admin-messaging-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
                    {t('communicationCenter') || 'Communication Center'}
                </h1>
                <p style={{ color: '#64748b' }}>
                    {t('admin_messaging_desc') || 'Broadcast notifications, send direct messages, and manage all company communication.'}
                </p>
            </header>

            {/* View Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
                <button
                    onClick={() => setActiveTab('compose')}
                    style={{
                        padding: '8px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        background: activeTab === 'compose' ? 'white' : 'transparent',
                        color: activeTab === 'compose' ? '#1e293b' : '#64748b',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: activeTab === 'compose' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                >
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    {t('compose') || 'Yeni Mesaj'}
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    style={{
                        padding: '8px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        background: activeTab === 'history' ? 'white' : 'transparent',
                        color: activeTab === 'history' ? '#1e293b' : '#64748b',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: activeTab === 'history' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                >
                    <Filter size={18} style={{ marginRight: '8px' }} />
                    {t('history') || 'Geçmiş'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
                {/* Main Action Area */}
                <div className="card" style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    {activeTab === 'compose' ? (
                        <div style={{ padding: '24px' }}>
                            <form onSubmit={handleSend}>
                                {/* Target Segmentation */}
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '12px' }}>
                                        {t('recipient_group') || 'Hedef Grup'}
                                    </label>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            type="button"
                                            onClick={() => { setTargetGroup('employees'); setSelectedRecipient('all'); }}
                                            style={{
                                                flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid',
                                                borderColor: targetGroup === 'employees' ? '#3b82f6' : '#e2e8f0',
                                                background: targetGroup === 'employees' ? '#eff6ff' : 'white',
                                                color: targetGroup === 'employees' ? '#1e40af' : '#64748b',
                                                display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600', cursor: 'pointer'
                                            }}
                                        >
                                            <Users size={20} />
                                            {t('allEmployees') || 'Tüm Çalışanlar'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setTargetGroup('customers'); setSelectedRecipient('all'); }}
                                            style={{
                                                flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid',
                                                borderColor: targetGroup === 'customers' ? '#3b82f6' : '#e2e8f0',
                                                background: targetGroup === 'customers' ? '#eff6ff' : 'white',
                                                color: targetGroup === 'customers' ? '#1e40af' : '#64748b',
                                                display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600', cursor: 'pointer'
                                            }}
                                        >
                                            <Briefcase size={20} />
                                            {t('allCustomers') || 'Tüm Müşteriler'}
                                        </button>
                                    </div>
                                </div>

                                {/* Message Type */}
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '12px' }}>
                                        {t('delivery_method') || 'Gönderim Yöntemi'}
                                    </label>
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        {['message', 'notification', 'sms', 'whatsapp'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setMessageType(type)}
                                                style={{
                                                    padding: '8px 16px', borderRadius: '20px', border: '1px solid',
                                                    borderColor: messageType === type ? '#3b82f6' : '#cbd5e1',
                                                    background: messageType === type ? '#3b82f6' : 'white',
                                                    color: messageType === type ? 'white' : '#64748b',
                                                    fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '6px'
                                                }}
                                            >
                                                {getMessageIcon(type)}
                                                {type.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Inputs */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px' }}>{t('subject')}</label>
                                        <input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder={t('enter_subject') || "Mesaj Başlığı..."}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px' }}>{t('message_body')}</label>
                                        <textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder={t('enter_message') || "Mesaj içeriğinizi buraya yazın..."}
                                            style={{ width: '100%', height: '150px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'none' }}
                                            required
                                        />
                                    </div>
                                </div>

                                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px' }}>
                                    <AnimatePresence>
                                        {sendSuccess && (
                                            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                                                <CheckCircle size={18} /> {t('sent_successfully') || 'Başarıyla gönderildi!'}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <button
                                        type="submit"
                                        disabled={isSending}
                                        className="primary-btn"
                                        style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', padding: '12px 32px' }}
                                    >
                                        {isSending ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Send size={18} /></motion.div> : <Send size={18} />}
                                        {isSending ? 'Sending...' : t('send_message')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div style={{ padding: '0' }}>
                            <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Recent Communications</h3>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <span className="badge" style={{ background: '#e0e7ff', color: '#4338ca' }}>{messages.length} Total</span>
                                </div>
                            </div>
                            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                {messages.length > 0 ? messages.map((msg, idx) => (
                                    <div key={msg.id} style={{
                                        padding: '16px 20px', borderBottom: '1px solid #f8fafc',
                                        background: idx % 2 === 0 ? 'white' : '#fcfdfe',
                                        transition: 'background 0.2s'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {getMessageIcon(msg.type)}
                                                <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1e293b' }}>{msg.title || 'Broadcast'}</span>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                {new Date(msg.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>{msg.content}</p>
                                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem' }}>
                                            <span style={{ color: msg.category === 'internal' ? '#3b82f6' : '#8b5cf6', fontWeight: '600', background: msg.category === 'internal' ? '#eff6ff' : '#f5f3ff', padding: '2px 8px', borderRadius: '4px' }}>
                                                {msg.category === 'internal' ? 'Employee' : 'Customer'}
                                            </span>
                                            <span style={{ color: '#64748b' }}>To: {msg.receiver_id ? 'Individual' : 'All'}</span>
                                            <span style={{ color: msg.is_read ? '#10b981' : '#f59e0b' }}>{msg.is_read ? 'Read' : 'Delivered'}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                                        <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                                        <p>No messages found in history.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar - Recipient Selection */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="card" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px' }}>
                                {targetGroup === 'employees' ? 'Select Employees' : 'Select Customers'}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <Search size={16} color="#94a3b8" />
                                <input
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.85rem' }}
                                />
                            </div>
                        </div>

                        <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button
                                onClick={() => setSelectedRecipient('all')}
                                style={{
                                    padding: '10px 12px', borderRadius: '8px', border: '1px solid',
                                    borderColor: selectedRecipient === 'all' ? '#3b82f6' : '#f1f5f9',
                                    background: selectedRecipient === 'all' ? '#eff6ff' : '#f8fafc',
                                    color: selectedRecipient === 'all' ? '#1e40af' : '#475569',
                                    cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', justifySelf: 'space-between', gap: '8px', fontWeight: selectedRecipient === 'all' ? '700' : '500'
                                }}
                            >
                                <Users size={16} />
                                <span style={{ flex: 1 }}>{targetGroup === 'employees' ? 'All Employees' : 'All Customers'}</span>
                                {selectedRecipient === 'all' && <CheckCircle size={14} />}
                            </button>

                            {filteredRecipients.map(r => (
                                <button
                                    key={r.id}
                                    onClick={() => setSelectedRecipient(r.id)}
                                    style={{
                                        padding: '10px 12px', borderRadius: '8px', border: '1px solid',
                                        borderColor: selectedRecipient === r.id ? '#3b82f6' : '#f1f5f9',
                                        background: selectedRecipient === r.id ? '#eff6ff' : 'white',
                                        color: selectedRecipient === r.id ? '#1e40af' : '#475569',
                                        cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', justifySelf: 'space-between', gap: '8px'
                                    }}
                                >
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                                        <User size={12} />
                                    </div>
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{r.name}</div>
                                        {r.email && <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{r.email}</div>}
                                    </div>
                                    {selectedRecipient === r.id && <CheckCircle size={14} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats/Quick Info */}
                    <div className="card" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '16px', padding: '20px', color: 'white' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', opacity: 0.8 }}>Messaging Stats</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{messages.filter(m => m.category === 'internal').length}</div>
                                <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>Internal</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{messages.filter(m => m.category === 'customer').length}</div>
                                <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>External</div>
                            </div>
                        </div>
                        <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <Info size={14} color="#3b82f6" />
                                <span>External messages (SMS/WhatsApp) are simulated for this environment.</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertTriangle size={14} color="#f59e0b" />
                                <span>Broadcasts reach all users in the selected category instantly.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminMessagingView;
