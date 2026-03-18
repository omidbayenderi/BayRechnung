import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((msgOrObj, typeFallback = 'success', titleFallback = null) => {
        const id = Math.random().toString(36).substring(2, 9);

        let message, type, title;
        if (typeof msgOrObj === 'object' && msgOrObj !== null) {
            message = msgOrObj.message;
            type = msgOrObj.type || typeFallback;
            title = msgOrObj.title || titleFallback;
        } else {
            message = msgOrObj;
            type = typeFallback;
            title = titleFallback;
        }

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

            {/* Global Notification Portal - Centered Top */}
            <div style={{
                position: 'fixed',
                top: '32px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                pointerEvents: 'none',
                width: 'auto',
                minWidth: '320px',
                maxWidth: '90vw'
            }}>
                <AnimatePresence>
                    {notifications.map((n) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            style={{
                                pointerEvents: 'auto',
                                background: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(12px)',
                                border: `1px solid ${n.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : n.type === 'warning' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                                borderRadius: '24px',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                padding: '16px 20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px'
                            }}
                        >
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: n.type === 'error' ? '#fef2f2' : n.type === 'warning' ? '#fffbeb' : '#ecfdf5',
                                color: n.type === 'error' ? '#ef4444' : n.type === 'warning' ? '#f59e0b' : '#10b981'
                            }}>
                                {n.type === 'success' && <CheckCircle size={22} />}
                                {n.type === 'error' && <AlertCircle size={22} />}
                                {n.type === 'warning' && <AlertTriangle size={22} />}
                                {n.type === 'info' && <Info size={22} />}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b', marginBottom: '1px' }}>
                                    {n.title}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {n.message}
                                </div>
                            </div>

                            <button
                                onClick={() => removeNotification(n.id)}
                                style={{
                                    border: 'none',
                                    background: 'rgba(0,0,0,0.05)',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    padding: '6px',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
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
