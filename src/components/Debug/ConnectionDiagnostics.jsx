import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Activity, CheckCircle, XCircle, Database, Shield, Key, RefreshCw, AlertTriangle } from 'lucide-react';
import { syncService } from '../../lib/SyncService';

const ConnectionDiagnostics = () => {
    const { currentUser } = useAuth();
    const [status, setStatus] = useState({
        config: 'checking',
        auth: 'checking',
        read: 'checking',
        write: 'checking'
    });
    const [details, setDetails] = useState({});
    const [syncStats, setSyncStats] = useState(syncService.getStatus());

    useEffect(() => {
        const unsubscribe = syncService.subscribe((stats) => {
            setSyncStats(stats);
        });
        return () => unsubscribe();
    }, []);

    const runDiagnostics = async () => {
        const results = { ...status };
        const newDetails = {};

        // 1. Config Check
        const isConfigured = isSupabaseConfigured();
        results.config = isConfigured ? 'success' : 'error';
        newDetails.config = isConfigured
            ? 'Supabase URL and Key are detected.'
            : 'Supabase URL or Key is missing in .env';

        // 2. Auth Check
        const { data: { session } } = await supabase.auth.getSession();
        results.auth = session ? 'success' : 'error';
        newDetails.auth = session
            ? `Logged in as ${session.user.email}`
            : 'No active Supabase session found.';

        // 3. Read Check
        if (session) {
            try {
                const { error: readError } = await supabase.from('users').select('id').limit(1);
                results.read = readError ? 'error' : 'success';
                newDetails.read = readError ? `Read failed: ${readError.message}` : 'Successfully read from users table.';
            } catch (e) {
                results.read = 'error';
                newDetails.read = e.message;
            }
        }

        // 4. Write Check (Small ping)
        if (session) {
            try {
                const { error: writeError } = await supabase.from('audit_logs').insert({
                    user_id: session.user.id,
                    action: 'connection_diag_ping',
                    entity_type: 'diagnostics',
                    severity: 'info'
                });
                results.write = writeError ? 'error' : 'success';
                newDetails.write = writeError ? `Write failed: ${writeError.message}` : 'Successfully wrote ping to audit_logs.';
            } catch (e) {
                results.write = 'error';
                newDetails.write = e.message;
            }
        }

        setStatus(results);
        setDetails(newDetails);
    };

    useEffect(() => {
        runDiagnostics();
    }, []);

    if (!currentUser || currentUser.email?.toLowerCase() !== 'admin@bayrechnung.com') return null;

    return (
        <div style={{
            position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
            padding: '16px', color: 'white', width: '300px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            fontSize: '13px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                <Activity size={16} color="#3b82f6" />
                <span style={{ fontWeight: 'bold' }}>Supabase Health Doctor</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <StatusItem label="Config (.env)" status={status.config} detail={details.config} icon={Key} />
                <StatusItem label="Auth Session" status={status.auth} detail={details.auth} icon={Shield} />
                <StatusItem label="DB Read" status={status.read} detail={details.read} icon={Database} />
                <StatusItem label="DB Write" status={status.write} detail={details.write} icon={CheckCircle} />
            </div>

            <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <RefreshCw size={14} className={syncStats.isProcessing ? "animate-spin" : ""} color={syncStats.queueLength > 0 ? "#f59e0b" : "#10b981"} />
                        <span style={{ fontWeight: '600' }}>Sync Queue</span>
                    </div>
                    <span style={{ background: syncStats.queueLength > 0 ? '#f59e0b' : '#10b981', padding: '1px 6px', borderRadius: '10px', fontSize: '10px' }}>
                        {syncStats.queueLength} pending
                    </span>
                </div>

                {syncStats.queueLength > 0 && (
                    <div style={{ fontSize: '11px', color: '#fca5a5', display: 'flex', alignItems: 'start', gap: '4px', background: 'rgba(239, 68, 68, 0.1)', padding: '6px', borderRadius: '4px' }}>
                        <AlertTriangle size={12} style={{ marginTop: '2px' }} />
                        <span>Veriler Supabase'e henüz ulaşmadı. İnternet bağlantınızı kontrol edin veya bekleyin. Giriş yapmamış olabilirsiniz.</span>
                    </div>
                )}
            </div>

            <button
                onClick={() => { runDiagnostics(); syncService.processQueue(); }}
                style={{
                    marginTop: '16px', width: '100%', padding: '6px',
                    borderRadius: '6px', background: '#3b82f6', color: 'white',
                    border: 'none', cursor: 'pointer', fontWeight: '600'
                }}
            >
                Re-scan & Force Sync
            </button>
        </div>
    );
};

const StatusItem = ({ label, status, detail, icon: Icon }) => {
    const getColor = (s) => s === 'success' ? '#10b981' : s === 'error' ? '#ef4444' : '#94a3b8';

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon size={14} color={getColor(status)} />
                    <span>{label}</span>
                </div>
                {status === 'success' ? <CheckCircle size={14} color="#10b981" /> : <XCircle size={14} color="#ef4444" />}
            </div>
            {status === 'error' && (
                <div style={{ color: '#ef4444', fontSize: '10px', marginTop: '2px', opacity: 0.8 }}>
                    {detail}
                </div>
            )}
        </div>
    );
};

export default ConnectionDiagnostics;
