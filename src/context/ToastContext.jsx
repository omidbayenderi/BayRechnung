import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration !== Infinity) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, removeToast }}>
            {children}
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] flex flex-col items-center gap-3 w-full pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            className="pointer-events-auto"
                        >
                            <div className={`
                                px-6 py-4 rounded-3xl shadow-2xl shadow-black/10 flex items-center gap-4 border min-w-[320px] max-w-[90vw]
                                backdrop-blur-xl
                                ${toast.type === 'error' ? 'bg-red-50/90 border-red-200 text-red-800' : 
                                  toast.type === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800' : 
                                  'bg-white/90 border-slate-200 text-slate-800'}
                            `}>
                                <div className={`
                                    p-2 rounded-xl
                                    ${toast.type === 'error' ? 'bg-red-100/80 text-red-600' : 
                                      toast.type === 'success' ? 'bg-emerald-100/80 text-emerald-600' : 
                                      'bg-slate-100 text-slate-600'}
                                `}>
                                    {toast.type === 'error' ? <AlertCircle size={20} /> : 
                                     toast.type === 'success' ? <CheckCircle size={20} /> : 
                                     <Info size={20} />}
                                </div>
                                <div className="flex-1 font-semibold text-sm">
                                    {toast.message}
                                </div>
                                <button 
                                    onClick={() => removeToast(toast.id)}
                                    className="p-1 hover:bg-black/5 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};
