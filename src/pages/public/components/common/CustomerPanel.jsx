import React, { useState, useEffect } from 'react';
import {
    Package, User, MapPin, MessageSquare, LogOut,
    ChevronRight, Clock, CheckCircle, XCircle, Download, ExternalLink
} from 'lucide-react';

const CustomerPanel = ({ user, onClose, onLogout, theme, t }) => {
    const safeT = t || ((key) => key);
    const [activeTab, setActiveTab] = useState('orders'); // orders, profile, messages
    const [orders, setOrders] = useState([]);
    const [messages, setMessages] = useState([]); // Mock messages
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        // Mock Data Fetching from LocalStorage specific to this user
        const allOrders = JSON.parse(localStorage.getItem('all_orders') || '[]');
        const myOrders = allOrders.filter(o => o.userEmail === user.email);
        setOrders(myOrders);

        // Mock Messages & Auto-Notifications
        const initialMessages = [
            { id: 1, sender: 'admin', text: safeT('cp_msg_welcome') || 'Hoş geldiniz! Size nasıl yardımcı olabilirim?', date: new Date(Date.now() - 86400000).toISOString() }
        ];

        // Simulate "Shipped" notification
        myOrders.filter(o => o.status === 'shipped').forEach(order => {
            initialMessages.push({
                id: `auto-${order.id}`,
                sender: 'admin',
                text: `${safeT('cp_msg_shipped') || 'Siparişiniz kargoya verildi!'} (#${order.id.slice(-6).toUpperCase()}) ${order.trackingNumber ? `${safeT('cp_tracking_no') || 'Takip No'}: ${order.trackingNumber}` : ''}`,
                date: new Date().toISOString()
            });
        });

        // Merge with existing manual mock msgs if any (for demo consistency)
        setMessages(initialMessages);
    }, [user, safeT]);

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;
        const msg = {
            id: Date.now(),
            sender: 'user',
            text: newMessage,
            date: new Date().toISOString()
        };
        setMessages([...messages, msg]);
        setNewMessage('');
        // In real app: api.post('/messages', msg)
        // Also simulate automated reply or admin notification
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'admin',
                text: safeT('cp_msg_received') || 'Mesajınız alındı, en kısa sürede dönüş yapacağız.',
                date: new Date().toISOString()
            }]);
        }, 1000);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 2500,
            background: '#f8fafc', display: 'flex', flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{
                background: 'white', padding: '16px 24px', borderBottom: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '50%', background: theme.primaryColor,
                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                    }}>
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>{safeT('cp_title') || 'Hesabım'}</h2>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>{user.email}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '8px',
                        fontWeight: '600', cursor: 'pointer', color: '#475569'
                    }}
                >
                    {safeT('cp_close') || 'Kapat'}
                </button>
            </div>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Sidebar Navigation */}
                <div style={{
                    width: '260px', background: 'white', borderRight: '1px solid #e2e8f0',
                    padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px'
                }}>
                    <NavButton
                        active={activeTab === 'orders'}
                        icon={<Package size={20} />}
                        label={safeT('cp_tab_orders') || 'Siparişlerim'}
                        onClick={() => setActiveTab('orders')}
                        theme={theme}
                    />
                    <NavButton
                        active={activeTab === 'profile'}
                        icon={<User size={20} />}
                        label={safeT('cp_tab_profile') || 'Profil & Adres'}
                        onClick={() => setActiveTab('profile')}
                        theme={theme}
                    />
                    <NavButton
                        active={activeTab === 'messages'}
                        icon={<MessageSquare size={20} />}
                        label={safeT('cp_tab_messages') || 'Mesajlar'}
                        onClick={() => setActiveTab('messages')}
                        theme={theme}
                    />

                    <div style={{ height: '1px', background: '#e2e8f0', margin: '16px 0' }} />

                    <button
                        onClick={onLogout}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                            background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '12px',
                            fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
                        }}
                    >
                        <LogOut size={20} /> {safeT('cp_logout') || 'Çıkış Yap'}
                    </button>
                </div>

                {/* Main Content Area */}
                <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>

                    {/* ORDERS TAB */}
                    {activeTab === 'orders' && (
                        <div>
                            <h2 style={{ fontSize: '1.75rem', marginBottom: '24px', color: '#1e293b' }}>{safeT('cp_orders_title') || 'Sipariş Geçmişi'}</h2>
                            {orders.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                                    <Package size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                                    <p style={{ color: '#64748b' }}>{safeT('cp_orders_empty') || 'Henüz bir siparişiniz bulunmuyor.'}</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    {orders.map(order => (
                                        <div key={order.id} style={{
                                            background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0',
                                            padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                                    <div style={{
                                                        padding: '12px', borderRadius: '12px',
                                                        background: getStatusColor(order.status).bg,
                                                        color: getStatusColor(order.status).text
                                                    }}>
                                                        {getStatusIcon(order.status)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1e293b' }}>#{order.id.slice(-6).toUpperCase()}</div>
                                                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{new Date(order.date).toLocaleDateString('tr-TR')} • {order.items.length} {safeT('cp_item_unit') || 'Ürün'}</div>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontWeight: '800', fontSize: '1.25rem', color: '#1e293b' }}>{order.total}</div>
                                                    <div style={{
                                                        display: 'inline-block', padding: '4px 10px', borderRadius: '20px',
                                                        fontSize: '0.8rem', fontWeight: '600', marginTop: '6px',
                                                        background: getStatusColor(order.status).bg, color: getStatusColor(order.status).text
                                                    }}>
                                                        {getStatusText(order.status, safeT)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Tracking & Items */}
                                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {order.trackingNumber && (
                                                    <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#1e40af' }}>
                                                        <Package size={16} />
                                                        <span>{safeT('cp_tracking_no') || 'Kargo Takip No'}: <strong>{order.trackingNumber}</strong></span>
                                                        <a href="#" onClick={e => e.preventDefault()} style={{ marginLeft: 'auto', color: '#2563eb', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                                                            {safeT('cp_track_btn') || 'Takip Et'} <ExternalLink size={14} />
                                                        </a>
                                                    </div>
                                                )}

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {order.items.map((item, idx) => {
                                                        const isDigital = item.type === 'digital' || item.name.toLowerCase().includes('dijital') || item.name.toLowerCase().includes('e-kitap');
                                                        return (
                                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                                                                <span style={{ color: '#475569' }}>{item.quantity}x {item.name}</span>
                                                                {isDigital && (
                                                                    <button onClick={() => alert('Demo: İndirme işlemi başlatıldı.')} style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                        <Download size={14} /> {safeT('cp_download') || 'İndir'}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div style={{ maxWidth: '600px' }}>
                            <h2 style={{ fontSize: '1.75rem', marginBottom: '8px', color: '#1e293b' }}>{safeT('cp_profile_title') || 'Profilim'}</h2>
                            <p style={{ color: '#64748b', marginBottom: '32px' }}>{safeT('cp_profile_desc') || 'Kişisel bilgilerinizi ve teslimat adresinizi güncelleyin.'}</p>

                            <div style={{ background: 'white', padding: '32px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>{safeT('form_fullname') || 'Ad Soyad'}</label>
                                    <input type="text" defaultValue={user.name} style={inputStyle} />
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>{safeT('form_email') || 'E-Posta'}</label>
                                    <input type="email" defaultValue={user.email} disabled style={{ ...inputStyle, background: '#f1f5f9', cursor: 'not-allowed' }} />
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>{safeT('form_phone') || 'Telefon'}</label>
                                    <input type="tel" defaultValue={user.phone} placeholder="0555 123 45 67" style={inputStyle} />
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>{safeT('form_address_title') || 'Teslimat Adresi'}</label>
                                    <textarea defaultValue={user.address} placeholder={safeT('form_full_address_placeholder') || "Tam adresiniz..."} rows="3" style={inputStyle} />
                                </div>
                                <button style={{
                                    width: '100%', padding: '14px', background: theme.primaryColor, color: 'white',
                                    border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer',
                                    fontSize: '1rem'
                                }}>
                                    {safeT('btn_update_info') || 'Bilgileri Güncelle'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* MESSAGES TAB */}
                    {activeTab === 'messages' && (
                        <div style={{ height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
                            <h2 style={{ fontSize: '1.75rem', marginBottom: '24px', color: '#1e293b' }}>{safeT('cp_messages_title') || 'Mesajlar'}</h2>

                            <div style={{ flex: 1, background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: '#f8fafc' }}>
                                    {messages.map(msg => (
                                        <div key={msg.id} style={{
                                            display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                            marginBottom: '16px'
                                        }}>
                                            <div style={{
                                                maxWidth: '70%', padding: '12px 16px', borderRadius: '16px',
                                                background: msg.sender === 'user' ? theme.primaryColor : 'white',
                                                color: msg.sender === 'user' ? 'white' : '#1e293b',
                                                border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                borderBottomRightRadius: msg.sender === 'user' ? '4px' : '16px',
                                                borderBottomLeftRadius: msg.sender !== 'user' ? '4px' : '16px',
                                            }}>
                                                <div style={{ fontSize: '0.95rem' }}>{msg.text}</div>
                                                <div style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.7, textAlign: 'right' }}>
                                                    {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ padding: '16px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px' }}>
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                        placeholder={safeT('cp_msg_placeholder') || "Mesajınızı yazın..."}
                                        style={{ ...inputStyle, marginBottom: 0 }}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        style={{
                                            padding: '0 24px', background: theme.primaryColor, color: 'white',
                                            border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer'
                                        }}
                                    >
                                        {safeT('btn_send') || 'Gönder'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// UI Helpers
const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: '10px',
    border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none',
    transition: 'border-color 0.2s'
};

const NavButton = ({ active, icon, label, onClick, theme }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
            background: active ? `${theme.primaryColor}10` : 'transparent',
            color: active ? theme.primaryColor : '#475569',
            border: 'none', borderRadius: '12px',
            fontWeight: active ? '600' : '500', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
        }}
    >
        {icon}
        {label}
        {active && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
    </button>
);

const getStatusColor = (status) => {
    switch (status) {
        case 'pending': return { bg: '#fff7ed', text: '#d97706' };
        case 'shipped': return { bg: '#eff6ff', text: '#3b82f6' };
        case 'delivered': return { bg: '#ecfdf5', text: '#059669' };
        case 'cancelled': return { bg: '#fef2f2', text: '#ef4444' };
        default: return { bg: '#f1f5f9', text: '#64748b' };
    }
};

const getStatusText = (status, t) => {
    const map = {
        'pending': t('status_pending') || 'Hazırlanıyor',
        'shipped': t('status_shipped') || 'Kargoya Verildi',
        'delivered': t('status_delivered') || 'Teslim Edildi',
        'cancelled': t('status_cancelled') || 'İptal Edildi'
    };
    return map[status] || status;
};

const getStatusIcon = (status) => {
    switch (status) {
        case 'pending': return <Clock size={20} />;
        case 'shipped': return <Package size={20} />;
        case 'delivered': return <CheckCircle size={20} />;
        case 'cancelled': return <XCircle size={20} />;
        default: return <Clock size={20} />;
    }
};

export default CustomerPanel;
