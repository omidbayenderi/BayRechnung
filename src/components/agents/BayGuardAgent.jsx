import React, { useEffect, useState } from 'react';
import { useBayGuard } from '../../context/BayGuardContext';
import { useLanguage } from '../../context/LanguageContext'; // Imported
import { Shield, AlertTriangle, CheckCircle, RefreshCw, Globe } from 'lucide-react'; // Added Globe icon

const BayGuardAgent = () => {
    const { addLog, addIntervention, logs, health, logMtdEvent, mtdState } = useBayGuard();
    const { appLanguage, serviceLanguages, t } = useLanguage(); // Get language context
    const [showNotice, setShowNotice] = useState(false);
    const [latestAction, setLatestAction] = useState(null);

    useEffect(() => {
        // ... (Error Listeners - Unchanged)
        const handleError = (event) => {
            const error = event.error || { message: event.message };
            addLog(error, { severity: 'critical', type: 'runtime' });
            analyzeAndHeal(error);
        };

        const handleRejection = (event) => {
            addLog(new Error(event.reason), { severity: 'warning', type: 'promise' });
        };

        const handleContentIssue = (event) => {
            const { key, lang } = event.detail;
            const error = new Error(`Eksik Çeviri: ${key} (${lang})`);
            addLog(error, { severity: 'warning', type: 'content' });
        };

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleRejection);
        window.addEventListener('bayguard-content-issue', handleContentIssue);

        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleRejection);
            window.removeEventListener('bayguard-content-issue', handleContentIssue);
        };
    }, []);

    // 3. LOCALIZATION AGENT (New Feature)
    useEffect(() => {
        // Check if Stock panel is out of sync with Main App Language
        if (serviceLanguages && appLanguage) {
            if (serviceLanguages.stock !== appLanguage) {
                // This state should be transient as LanguageContext auto-fixes it now.
                // But if it persists or we catch it, we log it.
                addIntervention('localization-sync', `Language sync: Stock Panel (${appLanguage.toUpperCase()})`);
                triggerNotice(`${t('language_synced')}: ${appLanguage.toUpperCase()}`);
            }
        }
    }, [appLanguage, serviceLanguages]); // Re-run when languages change

    // 2. SELF-HEALING ENGINE
    const analyzeAndHeal = (error) => {
        const msg = (error.message || '').toLowerCase();

        // Scenario: Storage Quota Exceeded (Common for localStorage apps)
        if (msg.includes('quotaexceeded') || msg.includes('storage full')) {
            addIntervention('storage-cleanup', 'LocalStorage doluluğu nedeniyle eski loglar temizlendi.');
            localStorage.removeItem('bayguard_logs'); // Critical reset
            triggerNotice('Veri alanı temizlendi, sistem stabil hale getirildi.');
        }

        // Scenario: Component Crash / Infinity Loop Detection (Simplified)
        if (msg.includes('too many re-renders') || msg.includes('infinite loop')) {
            addIntervention('state-reset', 'Sonsuz döngü tespit edildi, ana sayfaya yönlendiriliyor.');
            triggerNotice('Uygulama hatası giderildi, güvenli bölgeye dönüldü.');
            setTimeout(() => window.location.href = '/dashboard', 2000);
        }

        // Scenario: Routing Errors
        if (msg.includes('route') && msg.includes('not found')) {
            addIntervention('redirect', 'Geçersiz rota düzeltildi.');
        }
    };

    const triggerNotice = (message) => {
        setLatestAction(message);
        setShowNotice(true);
        setTimeout(() => setShowNotice(false), 5000);
    };

    if (!showNotice && health === 'green') return null;

    return (
        <div className="no-print" style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        }}>
            {showNotice && (
                <div style={{
                    background: '#10b981',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    animation: 'slideUp 0.3s ease-out'
                }}>
                    {latestAction?.includes('Dil') ? <Globe size={18} /> : <Shield size={18} />}
                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{latestAction}</span>
                </div>
            )}

            {health !== 'green' && (
                <div style={{
                    background: health === 'red' ? '#ef4444' : '#f59e0b',
                    color: 'white',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    cursor: 'pointer'
                }} title="System Health Status">
                    {health === 'red' ? <AlertTriangle size={20} /> : <RefreshCw className="animate-spin" size={20} />}
                </div>
            )}

            {/* MTD Honey-Token: Invisible trap for bots/attackers */}
            <div
                id="sys-config-debug-gate"
                style={{
                    position: 'absolute',
                    width: '1px',
                    height: '1px',
                    opacity: 0.01,
                    pointerEvents: 'auto',
                    cursor: 'default',
                    top: '-100px',
                    left: '-100px'
                }}
                onClick={() => {
                    logMtdEvent('honey-token-triggered', 'sys-config-debug-gate', {
                        ua: navigator.userAgent,
                        nonce: mtdState.sessionNonce
                    });
                }}
            />

            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-spin {
                    animation: spin 2s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default BayGuardAgent;
