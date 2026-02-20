import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { RefreshCw } from 'lucide-react';

const UserLogsView = () => {
    const [cloudLogs, setCloudLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState({ severity: 'all', source: 'all' });

    const fetchCloudLogs = async () => {
        setLoading(true);
        try {
            console.log('[DCC] Fetching persistent audit protocols...');
            let query = supabase
                .from('audit_logs')
                .select('*')
                .order('created_at', { ascending: false });

            if (filter.severity !== 'all') {
                query = query.eq('severity', filter.severity);
            }
            if (filter.source !== 'all') {
                query = query.eq('source', filter.source);
            }

            const { data, error } = await query.limit(100);

            if (error) throw error;
            setCloudLogs(data || []);
        } catch (err) {
            console.error('[LogsView] Error fetching cloud logs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCloudLogs();
    }, [filter]);

    return (
        <div style={{ background: 'rgba(30, 41, 59, 0.3)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Enterprise Audit Protocol</h3>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <select
                        value={filter.severity}
                        onChange={(e) => setFilter(prev => ({ ...prev, severity: e.target.value }))}
                        style={{ background: '#1e293b', color: 'white', border: '1px solid #334155', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem' }}
                    >
                        <option value="all">All Severities</option>
                        <option value="critical">Critical</option>
                        <option value="warning">Warning</option>
                        <option value="info">Info</option>
                    </select>

                    <select
                        value={filter.source}
                        onChange={(e) => setFilter(prev => ({ ...prev, source: e.target.value }))}
                        style={{ background: '#1e293b', color: 'white', border: '1px solid #334155', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem' }}
                    >
                        <option value="all">All Sources</option>
                        <option value="client">Client</option>
                        <option value="server">Server</option>
                        <option value="kernel">Kernel</option>
                        <option value="BayGuard_Client">BayGuard</option>
                    </select>

                    <button
                        onClick={fetchCloudLogs}
                        disabled={loading}
                        style={{ color: '#3b82f6', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Sync
                    </button>
                </div>
            </div>
            <div style={{
                background: '#0f172a',
                borderRadius: '12px',
                padding: '24px',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                color: '#a5b4fc',
                maxHeight: '600px',
                overflowY: 'auto',
                border: '1px solid #1e293b'
            }}>
                {loading && cloudLogs.length === 0 ? (
                    <div style={{ color: '#475569', textAlign: 'center', padding: '40px' }}>Accessing secure audit tables...</div>
                ) : cloudLogs.length > 0 ? cloudLogs.map(l => (
                    <div key={l.id} style={{ marginBottom: '12px', borderLeft: `3px solid ${l.severity === 'critical' ? '#ef4444' : l.severity === 'warning' ? '#f59e0b' : '#3b82f6'}`, paddingLeft: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#64748b' }}>[{new Date(l.created_at).toLocaleString()}]</span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <span style={{ color: '#475569', fontSize: '0.7rem' }}>{l.source?.toUpperCase()}</span>
                                <span style={{ color: l.severity === 'critical' ? '#ef4444' : l.severity === 'warning' ? '#f59e0b' : '#3b82f6', fontWeight: 'bold', fontSize: '0.7rem' }}>{l.severity?.toUpperCase()}</span>
                            </div>
                        </div>
                        <div style={{ color: 'white', fontWeight: 'bold' }}>{l.action} <span style={{ color: '#475569', fontWeight: 'normal' }}>on {l.entity_type}</span></div>
                        {l.metadata && Object.keys(l.metadata).length > 0 && (
                            <div style={{ fontSize: '0.75rem', color: '#6366f1', marginTop: '4px', opacity: 0.8 }}>
                                META: {JSON.stringify(l.metadata)}
                            </div>
                        )}
                    </div>
                )) : (
                    <div style={{ color: '#475569', textAlign: 'center', padding: '40px' }}>No persistent logs found for this filter.</div>
                )}
            </div>
        </div>
    );
};

export default UserLogsView;
