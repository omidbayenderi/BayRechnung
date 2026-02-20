import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const BayGuardContext = createContext();

export const useBayGuard = () => useContext(BayGuardContext);

export const BayGuardProvider = ({ children }) => {
    const [health, setHealth] = useState('green'); // green, yellow, red
    const [logs, setLogs] = useState(() => {
        const saved = localStorage.getItem('bayguard_logs');
        return saved ? JSON.parse(saved) : [];
    });
    const [interventions, setInterventions] = useState(() => {
        const saved = localStorage.getItem('bayguard_interventions');
        return saved ? JSON.parse(saved) : [];
    });

    // Helper to fetch persistent interventions from Supabase
    const syncInterventions = async () => {
        try {
            console.log('[BayGuard] Syncing interventions from Cloud...');
            const { data, error } = await supabase
                .from('audit_logs')
                .select('*')
                .eq('entity_type', 'security_intervention')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            if (data && data.length > 0) {
                const formatted = data.map(d => ({
                    id: d.id,
                    timestamp: d.created_at,
                    type: d.action,
                    message: d.metadata?.message || d.action,
                    details: d.metadata || {}
                }));
                setInterventions(formatted);
            }
        } catch (err) {
            console.error('[BayGuard] Failed to sync interventions:', err);
        }
    };

    useEffect(() => {
        syncInterventions();

        // Phase 2: Supabase Realtime Stream for Security Interventions
        console.log('[BayGuard] Subscribing to Cloud Security Stream...');
        const channel = supabase
            .channel('security_updates')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'audit_logs',
                    filter: `entity_type=eq.security_intervention`
                },
                (payload) => {
                    console.log('[BayGuard] Real-time security event received:', payload.new);
                    const newEntry = {
                        id: payload.new.id,
                        timestamp: payload.new.created_at,
                        type: payload.new.action,
                        message: payload.new.metadata?.message || payload.new.action,
                        details: payload.new.metadata || {}
                    };

                    setInterventions(prev => {
                        // Avoid duplicates if sync hits same record
                        if (prev.some(i => i.id === newEntry.id)) return prev;
                        return [newEntry, ...prev].slice(0, 50);
                    });

                    // Trigger visual alert
                    setHealth('yellow');
                }
            )
            .subscribe();

        return () => {
            console.log('[BayGuard] Unsubscribing from Cloud Security Stream...');
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        // Keep a local cache for offline/instant start
        localStorage.setItem('bayguard_logs', JSON.stringify(logs.slice(-50)));
        localStorage.setItem('bayguard_interventions', JSON.stringify(interventions.slice(-20)));
    }, [logs, interventions]);

    const addLog = (error, info = {}) => {
        const severity = info.severity || 'high'; // high, medium, low OR critical, warning, info

        const newLog = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            message: error.message || 'Unknown Error',
            stack: error.stack,
            component: info.componentStack,
            severity: severity,
            type: info.type || 'error',
            fixed: false
        };

        // Prevent duplicate logs (simple check)
        setLogs(prev => {
            const isDuplicate = prev.some(l =>
                l.message === newLog.message &&
                (new Date(newLog.timestamp) - new Date(l.timestamp)) < 5000 // 5 seconds debounce
            );
            if (isDuplicate) return prev;
            return [...prev, newLog];
        });

        // Smart Health Update
        setHealth(currentHealth => {
            if (severity === 'critical' || severity === 'high') {
                return 'red';
            }
            if (severity === 'warning' || severity === 'medium' || severity === 'content') {
                return currentHealth === 'red' ? 'red' : 'yellow';
            }
            return currentHealth;
        });
    };

    const addIntervention = async (type, message, details = {}) => {
        const newIntervention = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            type, // 'auto-fix', 'storage-cleanup', 'redirect'
            message,
            details
        };

        setInterventions(prev => [newIntervention, ...prev].slice(0, 50));
        setHealth('yellow');

        // Persist to Cloud if possible (Quietly)
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('audit_logs').insert({
                    user_id: user.id,
                    action: type,
                    entity_type: 'security_intervention',
                    metadata: { ...details, message },
                    severity: 'warning',
                    source: 'BayGuard_Client'
                });
            }
        } catch (err) {
            console.warn('[BayGuard] Cloud persistence failed:', err);
        }
    };

    const clearLogs = () => {
        setLogs([]);
        setHealth('green');
    };

    const resolveIssue = (logId) => {
        setLogs(prev => prev.map(log => log.id === logId ? { ...log, fixed: true } : log));
        if (logs.every(log => log.fixed || log.id === logId)) {
            setHealth('green');
        }
    };

    const [mtdState, setMtdState] = useState({
        sessionNonce: Math.random().toString(36).substring(7),
        targets: {},
        rotationCount: 0,
        lastRotation: new Date().toISOString()
    });

    const rotateMtdTargets = () => {
        const newNonce = Math.random().toString(36).substring(7);
        setMtdState(prev => ({
            ...prev,
            sessionNonce: newNonce,
            rotationCount: prev.rotationCount + 1,
            lastRotation: new Date().toISOString()
        }));
        console.log('[MTD] Targets rotated. New Session Nonce:', newNonce);
    };

    const logMtdEvent = (type, targetId, metadata = {}) => {
        const event = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            type, // 'honey-token-triggered', 'suspicious-activity'
            targetId,
            metadata,
            severity: 'critical'
        };
        addLog(new Error(`MTD Security Alert: ${type} on ${targetId}`), { severity: 'critical', type: 'security' });
        addIntervention('mtd-block', `Security threat blocked on target: ${targetId}`, event);
    };

    useEffect(() => {
        // Auto-rotate MTD targets every 5 minutes
        const interval = setInterval(rotateMtdTargets, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <BayGuardContext.Provider value={{
            health,
            logs,
            interventions,
            mtdState,
            addLog,
            addIntervention,
            clearLogs,
            resolveIssue,
            rotateMtdTargets,
            logMtdEvent
        }}>
            {children}
        </BayGuardContext.Provider>
    );
};
