import React, { useState, useEffect } from 'react';
import { syncService } from '../lib/SyncService';
import { Cloud, CloudOff, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const SyncStatus = () => {
    const { t } = useLanguage();
    const [status, setStatus] = useState(syncService.getStatus());
    const [lastSync, setLastSync] = useState(null);

    useEffect(() => {
        const unsubscribe = syncService.subscribe((newStatus) => {
            setStatus(newStatus);
            if (newStatus.queueLength === 0 && !newStatus.isProcessing) {
                setLastSync(new Date().toLocaleTimeString());
            }
        });

        // Also listen for general online/offline
        const handleOnline = () => setStatus(syncService.getStatus());
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOnline);

        return () => {
            unsubscribe();
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOnline);
        };
    }, []);

    const isOnline = status.isOnline;
    const isConfigured = status.isConfigured !== false;
    const isSyncing = status.isProcessing || status.queueLength > 0;

    if (!isConfigured) {
        return (
            <div className="no-print" style={{
                position: 'fixed', bottom: '20px', right: '250px', zIndex: 1000,
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444',
                borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', color: '#ef4444'
            }}>
                <XCircle size={14} />
                <span>{t('system_error_config_missing', 'Sistem Hatası: Yapılandırma Eksik')}</span>
            </div>
        );
    }

    return (
        <div className="no-print" style={{
            position: 'fixed',
            bottom: '20px',
            right: '250px', // Shift left to stay away from the main sidebar if needed, or adjust
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: isOnline ? 'rgba(255, 255, 255, 0.9)' : 'rgba(254, 242, 242, 0.95)',
            border: `1px solid ${isOnline ? '#e2e8f0' : '#fecaca'}`,
            borderRadius: '20px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(8px)',
            fontSize: '0.75rem',
            fontWeight: '600',
            color: isOnline ? '#64748b' : '#ef4444',
            transition: 'all 0.3s ease'
        }}>
            <AnimatePresence mode="wait">
                {!isOnline ? (
                    <motion.div
                        key="offline"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <div
                            onClick={() => syncService.checkConnectivity()}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                            title={t('retry_check', 'Yeniden kontrol et')}
                        >
                            <CloudOff size={14} />
                            <span>
                                {status.queueLength > 0
                                    ? t('sync_pending', '{count} Veri Bekliyor').replace('{count}', status.queueLength)
                                    : t('sync_offline', 'Çevrimdışı')}
                            </span>
                        </div>
                        {status.queueLength > 0 && (
                            <button
                                onClick={() => syncService.forceSync()}
                                style={{
                                    border: 'none',
                                    background: '#ef4444',
                                    color: 'white',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    fontSize: '9px',
                                    cursor: 'pointer',
                                    fontWeight: '800'
                                }}
                            >
                                {t('sync_button', 'BULUTA GÖNDER')}
                            </button>
                        )}
                    </motion.div>
                ) : isSyncing ? (
                    <motion.div
                        key="syncing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <RefreshCw size={14} className="animate-spin" style={{ color: 'var(--primary)' }} />
                        <span style={{ color: 'var(--primary)' }}>
                            {t('syncing', 'Eşitleniyor')} ({status.queueLength})
                        </span>
                    </motion.div>
                ) : (
                    <motion.div
                        key="online"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <CheckCircle size={14} style={{ color: '#10b981' }} />
                        <span>{t('sync_up_to_date', 'Bulut ile Güncel')}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SyncStatus;
