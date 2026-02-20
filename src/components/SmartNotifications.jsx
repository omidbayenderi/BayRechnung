import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertTriangle, CheckCircle, Info, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const SmartNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser?.id) return;

        // Listen for interesting events (Invoices, Stock, etc.)
        const channel = supabase
            .channel('smart_notifs')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs', filter: `user_id=eq.${currentUser.id}` }, (payload) => {
                const { action, severity, metadata } = payload.new;

                // Only show "Smart" notifications (not every audit log)
                if (severity === 'critical' || severity === 'warning' || action.includes('payment') || action.includes('appointment')) {
                    addNotification({
                        id: payload.new.id,
                        title: action.toUpperCase().replace(/_/g, ' '),
                        message: metadata?.message || `A new security event occurred: ${action}`,
                        type: severity === 'critical' ? 'error' : severity === 'warning' ? 'warning' : 'info'
                    });
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser?.id]);

    const addNotification = (notif) => {
        setNotifications(prev => [notif, ...prev].slice(0, 5));
        // Auto-remove after 5s
        setTimeout(() => {
            removeNotification(notif.id);
        }, 5000);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 w-80">
            <AnimatePresence>
                {notifications.map((n) => (
                    <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                        className={`p-4 rounded-2xl shadow-xl flex items-start gap-3 border ${n.type === 'error' ? 'bg-red-50 border-red-100 dark:bg-red-950/30 dark:border-red-900/50' :
                                n.type === 'warning' ? 'bg-amber-50 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50' :
                                    'bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800'
                            }`}
                    >
                        <div className={`p-2 rounded-lg ${n.type === 'error' ? 'text-red-500 bg-red-100' :
                                n.type === 'warning' ? 'text-amber-500 bg-amber-100' :
                                    'text-primary bg-primary/10'
                            }`}>
                            {n.type === 'error' && <AlertTriangle size={18} />}
                            {n.type === 'warning' && <AlertTriangle size={18} />}
                            {n.type === 'info' && <Info size={18} />}
                        </div>
                        <div className="flex-1">
                            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{n.title}</div>
                            <div className="text-sm text-slate-700 dark:text-slate-300">{n.message}</div>
                        </div>
                        <button onClick={() => removeNotification(n.id)} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={16} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default SmartNotifications;
