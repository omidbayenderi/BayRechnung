import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((message, type = 'success', title = null) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newNotif = { id, message, type, title: title || type.toUpperCase() };

        setNotifications(prev => [...prev, newNotif]);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    }, []);

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}

            {/* Global Notification Portal */}
            <div style={{
                position: 'fixed',
                top: '24px',
                right: '24px',
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                pointerEvents: 'none'
            }}>
                <AnimatePresence>
                    {notifications.map((n) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                            style={{
                                pointerEvents: 'auto',
                                width: '320px',
                                background: n.type === 'error' ? '#fff1f2' : n.type === 'warning' ? '#fffbeb' : '#f0fdf4',
                                border: `1px solid ${n.type === 'error' ? '#fecdd3' : n.type === 'warning' ? '#fde68a' : '#bbf7d0'}`,
                                borderRadius: '16px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                padding: '16px',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px'
                            }}
                        >
                            <div style={{
                                padding: '8px',
                                borderRadius: '10px',
                                background: 'white',
                                color: n.type === 'error' ? '#e11d48' : n.type === 'warning' ? '#d97706' : '#16a34a'
                            }}>
                                {n.type === 'success' && <CheckCircle size={20} />}
                                {n.type === 'error' && <AlertCircle size={20} />}
                                {n.type === 'warning' && <AlertTriangle size={20} />}
                                {n.type === 'info' && <Info size={20} />}
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b', marginBottom: '2px' }}>
                                    {n.title}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.4 }}>
                                    {n.message}
                                </div>
                            </div>

                            <button
                                onClick={() => removeNotification(n.id)}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    padding: '4px'
                                }}
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within a NotificationProvider');
    return context;
};
