import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured, checkDbHealth } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Activity, CheckCircle, XCircle, Database, Shield, Key, RefreshCw, AlertTriangle, Cloud, Monitor } from 'lucide-react';
import { syncService } from '../../lib/SyncService';

import { motion } from 'framer-motion';

const ConnectionDiagnostics = ({ variant = 'floating' }) => {
    const { currentUser, session: authSession } = useAuth();
    const [status, setStatus] = useState({
        config: 'checking',
        auth: 'checking',
        read: 'checking',
        write: 'checking'
    });
    const [details, setDetails] = useState({});
    const [syncStats, setSyncStats] = useState(syncService.getStatus());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const lastCheckRef = useRef(0);

    useEffect(() => {
        const unsubscribe = syncService.subscribe((stats) => {
            setSyncStats(stats);
        });
        return () => unsubscribe();
    }, []);

    const runDiagnostics = useCallback(async (isAuto = false) => {
        // Prevent spamming
        const now = Date.now();
        if (isAuto && now - lastCheckRef.current < 10000) return;
        lastCheckRef.current = now;

        setIsRefreshing(true);
        const results = { config: 'checking', auth: 'checking', read: 'checking', write: 'checking' };
        const newDetails = {};

        // 1. Config Check
        const isConfigured = isSupabaseConfigured();
        results.config = isConfigured ? 'success' : 'error';

        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (isConfigured) {
            newDetails.config = `URL OK... Key OK...`;
        } else {
            const hasUrl = !!url;
            const hasKey = !!key;
            newDetails.config = !hasUrl ? 'VITE_SUPABASE_URL is missing.' : !hasKey ? 'VITE_SUPABASE_ANON_KEY is missing.' : 'Configuration placeholders detected.';
            console.error('[Diag] Missing Supabase Config:', { hasUrl, hasKey });
        }

        // 2. Auth Check
        let activeSession = authSession;
        if (!supabase) {
            results.auth = 'error';
            newDetails.auth = 'Supabase client not initialized.';
        } else {
            try {
                // If we have context session, use it first to avoid lock timeout
                if (!activeSession) {
                    const sessionPromise = supabase.auth.getSession();
                    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Auth lock timeout')), 4000));
                    const { data: { session: directSession }, error: authError } = await Promise.race([sessionPromise, timeoutPromise]);
                    activeSession = directSession;
                }

                results.auth = activeSession ? 'success' : 'error';
                newDetails.auth = activeSession
                    ? `Logged in as ${activeSession.user.email}`
                    : 'No active session (Login required).';
            } catch (err) {
                results.auth = 'error';
                if (err.message.includes('LockManager') || err.message === 'Auth lock timeout') {
                    newDetails.auth = `Browser sync busy.`;
                } else {
                    newDetails.auth = `Session error: ${err.message}`;
                }
            }

            // 3. Read Check - Use the lock-free helper
            const health = await checkDbHealth();
            results.read = health.success ? 'success' : 'error';
            newDetails.read = health.success ? 'Success.' : `Read failed: ${health.error || 'Database unreachable'}`;

            // 4. Write Check
            const userId = activeSession?.user?.id || currentUser?.id;
            if (!userId || currentUser?.authMode === 'mock') {
                results.write = 'error';
                newDetails.write = currentUser?.authMode === 'mock' ? 'Write disabled in Mock mode.' : 'Login required to test.';
            } else {
                try {
                    // Try with a very short timeout to detect network/lock issues quickly
                    const writePromise = supabase.from('audit_logs').insert({
                        user_id: userId,
                        action: 'connection_diag_ping',
                        entity_type: 'diagnostics',
                        severity: 'info',
                        metadata: { ts: Date.now(), source: 'diag_doctor' }
                    });
                    const timeoutWrite = new Promise((_, reject) => setTimeout(() => reject(new Error('Write timeout')), 3000));

                    const { error: writeError } = await Promise.race([writePromise, timeoutWrite]);

                    if (writeError) {
                        results.write = 'error';
                        newDetails.write = writeError.code === '42P01' ? 'Audit table missing.' : `Write failed: ${writeError.message}`;
                    } else {
                        results.write = 'success';
                        newDetails.write = 'Success.';
                    }
                } catch (e) {
                    results.write = 'error';
                    newDetails.write = e.message === 'Write timeout' ? 'Write blocked/busy.' : e.message;
                }
            }
        }

        setStatus(results);
        setDetails(newDetails);
        setTimeout(() => setIsRefreshing(false), 500);
    }, [authSession, currentUser]);

    // Initial check and periodic refresh
    useEffect(() => {
        runDiagnostics();
        const interval = setInterval(() => runDiagnostics(true), 30000); // Check every 30s
        return () => clearInterval(interval);
    }, [runDiagnostics]);

    if (!currentUser || currentUser.email?.toLowerCase() !== 'admin@bayrechnung.com') return null;

    if (variant === 'sidebar') {
        const isCloud = currentUser?.authMode === 'cloud';
        return (
            <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 'auto', background: 'rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={14} color="#3b82f6" className={isRefreshing ? "animate-pulse" : ""} />
                        <span style={{ fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px' }}>System Health</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 6px', borderRadius: '4px', background: isCloud ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', border: `1px solid ${isCloud ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}` }}>
                        {isCloud ? <Cloud size={10} color="#10b981" /> : <Monitor size={10} color="#f59e0b" />}
                        <span style={{ fontSize: '9px', fontWeight: 'bold', color: isCloud ? '#10b981' : '#f59e0b' }}>{isCloud ? 'CLOUD' : 'MOCK'}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <StatusItem label="Config" status={status.config} detail={details.config} icon={Key} isMini />
                    <StatusItem label="Session" status={status.auth} detail={details.auth} icon={Shield} isMini />
                    <StatusItem label="Read" status={status.read} detail={details.read} icon={Database} isMini />
                    <StatusItem label="Write" status={status.write} detail={details.write} icon={CheckCircle} isMini />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', padding: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: syncStats.queueLength > 0 ? "#f59e0b" : "#10b981" }}>
                        <RefreshCw size={10} className={syncStats.isProcessing ? "animate-spin" : ""} />
                        <span style={{ fontWeight: '600' }}>Sync: {syncStats.queueLength}</span>
                    </div>
                    <button
                        onClick={() => runDiagnostics()}
                        disabled={isRefreshing}
                        style={{ border: 'none', background: 'none', color: '#3b82f6', fontSize: '10px', cursor: 'pointer', fontWeight: '700' }}
                    >
                        {isRefreshing ? '...' : 'RE-SCAN'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            drag
            dragMomentum={false}
            whileDrag={{ cursor: 'grabbing', scale: 1.02, zIndex: 10000 }}
            style={{
                position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999,
                background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
                padding: '20px', color: 'white', width: '320px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                fontSize: '13px',
                cursor: 'grab',
                touchAction: 'none'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={18} color="#3b82f6" className={isRefreshing ? "animate-spin" : ""} />
                    <span style={{ fontWeight: '800', letterSpacing: '0.5px' }}>SYSTEM DOCTOR</span>
                </div>
                <div style={{ padding: '4px 8px', borderRadius: '6px', background: currentUser?.authMode === 'cloud' ? '#065f46' : '#92400e', fontSize: '10px', fontWeight: 'bold' }}>
                    {currentUser?.authMode === 'cloud' ? 'CLOUD MODE' : 'OFFLINE MODE'}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <StatusItem label="Config (.env)" status={status.config} detail={details.config} icon={Key} />
                <StatusItem label="Auth Session" status={status.auth} detail={details.auth} icon={Shield} />
                <StatusItem label="DB Read" status={status.read} detail={details.read} icon={Database} />
                <StatusItem label="DB Write" status={status.write} detail={details.write} icon={CheckCircle} />
            </div>

            <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <RefreshCw size={14} className={syncStats.isProcessing ? "animate-spin" : ""} color={syncStats.queueLength > 0 ? "#f59e0b" : "#10b981"} />
                        <span style={{ fontWeight: '700' }}>Outbox Queue</span>
                    </div>
                    <span style={{ background: syncStats.queueLength > 0 ? '#f59e0b' : '#10b981', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '800' }}>
                        {syncStats.queueLength} PENDING
                    </span>
                </div>

                {syncStats.queueLength > 0 && (
                    <div style={{ fontSize: '11px', color: '#fca5a5', display: 'flex', alignItems: 'start', gap: '6px', background: 'rgba(239, 68, 68, 0.15)', padding: '8px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                        <AlertTriangle size={14} style={{ marginTop: '1px', flexShrink: 0 }} />
                        <span>Data is waiting to sync. Check internet or migration status.</span>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                    onClick={() => { runDiagnostics(); syncService.processQueue(); }}
                    disabled={isRefreshing}
                    style={{
                        flex: 1, padding: '10px',
                        borderRadius: '8px', background: '#3b82f6', color: 'white',
                        border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '12px',
                        transition: 'all 0.2s'
                    }}
                >
                    {isRefreshing ? 'CHECKING...' : 'RE-SCAN SYSTEM'}
                </button>
                <button
                    onClick={() => {
                        window.location.reload();
                    }}
                    style={{
                        padding: '10px',
                        borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6',
                        border: '1px solid rgba(59, 130, 246, 0.2)', cursor: 'pointer', fontWeight: '700', fontSize: '12px'
                    }}
                >
                    REFRESH
                </button>
                <button
                    onClick={() => {
                        if (window.confirm('Bu işlem ÇEREZLERİ ve YEREL VERİLERİ temizleyecektir. Bağlantı sorunlarını çözebilir. Emin misiniz?')) {
                            localStorage.clear();
                            sessionStorage.clear();
                            window.location.href = '/';
                        }
                    }}
                    style={{
                        padding: '10px',
                        borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer', fontWeight: '700', fontSize: '12px'
                    }}
                >
                    HARD RESET
                </button>
            </div>
        </motion.div>
    );
};

const StatusItem = ({ label, status, detail, icon: Icon, isMini = false }) => {
    const getColor = (s) => s === 'success' ? '#10b981' : s === 'error' ? '#ef4444' : '#94a3b8';

    return (
        <div style={{ marginBottom: isMini ? '0' : '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon size={14} color={getColor(status)} />
                    <span style={{ color: getColor(status) === '#94a3b8' ? '#94a3b8' : 'white' }}>{label}</span>
                </div>
                {status === 'success' ? <CheckCircle size={14} color="#10b981" /> : <XCircle size={14} color="#ef4444" />}
            </div>
            {status === 'error' && (
                <div style={{ color: '#fca5a5', fontSize: '10px', marginTop: '1px', opacity: 0.9, paddingLeft: '20px' }}>
                    {detail}
                </div>
            )}
        </div>
    );
};

export default ConnectionDiagnostics;
