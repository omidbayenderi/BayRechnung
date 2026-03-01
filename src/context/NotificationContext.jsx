
import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, X, Bell } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((notif) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newNotif = {
            id,
            type: 'info', // default
            duration: 5000,
            ...notif
        };

        setNotifications((prev) => [newNotif, ...prev].slice(0, 5));

        if (newNotif.duration !== Infinity) {
            setTimeout(() => {
                removeNotification(id);
            }, newNotif.duration);
        }
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle size={20} className="text-emerald-500" />;
            case 'error': return <AlertTriangle size={20} className="text-rose-500" />;
            case 'warning': return <AlertTriangle size={20} className="text-amber-500" />;
            default: return <Info size={20} className="text-blue-500" />;
        }
    };

    const getColors = (type) => {
        switch (type) {
            case 'success': return 'border-emerald-100/50 bg-emerald-50/80 dark:bg-emerald-900/20';
            case 'error': return 'border-rose-100/50 bg-rose-50/80 dark:bg-rose-900/20';
            case 'warning': return 'border-amber-100/50 bg-amber-50/80 dark:bg-amber-900/20';
            default: return 'border-blue-100/50 bg-blue-50/80 dark:bg-blue-900/20';
        }
    };

    return (
        <NotificationContext.Provider value={{ showNotification, removeNotification }}>
            {children}
            <div className="fixed top-6 right-6 z-[10000] flex flex-col gap-3 w-[360px] pointer-events-none">
                <AnimatePresence>
                    {notifications.map((n) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, y: -20, x: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            layout
                            className={`pointer-events-auto relative overflow-hidden backdrop-blur-xl border-t border-x border-white/20 shadow-2xl rounded-3xl p-5 flex items-start gap-4 ${getColors(n.type)}`}
                            style={{
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            }}
                        >
                            {/* Glass background overlay */}
                            <div className="absolute inset-0 bg-white/40 dark:bg-black/10 -z-10" />

                            <div className={`mt-0.5 p-2.5 rounded-2xl shadow-sm border border-white/40 ${n.type === 'success' ? 'bg-emerald-100/50 text-emerald-600' :
                                    n.type === 'error' ? 'bg-rose-100/50 text-rose-600' :
                                        n.type === 'warning' ? 'bg-amber-100/50 text-amber-600' :
                                            'bg-blue-100/50 text-blue-600'
                                }`}>
                                {getIcon(n.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                                {n.title && (
                                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white mb-0.5 tracking-tight">
                                        {n.title}
                                    </h4>
                                )}
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-semibold opacity-90">
                                    {n.message}
                                </p>
                            </div>

                            <button
                                onClick={() => removeNotification(n.id)}
                                className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white group"
                            >
                                <X size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>

                            {/* Progress bar */}
                            <motion.div
                                initial={{ width: '100%' }}
                                animate={{ width: '0%' }}
                                transition={{ duration: n.duration / 1000, ease: 'linear' }}
                                className={`absolute bottom-0 left-0 h-1.5 ${n.type === 'success' ? 'bg-emerald-500' :
                                        n.type === 'error' ? 'bg-rose-500' :
                                            n.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                                    }`}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};
