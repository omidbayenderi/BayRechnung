import React from 'react';
import { useBayGuard } from '../../context/BayGuardContext';
import { Shield, AlertTriangle, CheckCircle, Activity, Trash2, Clock, Terminal, Zap } from 'lucide-react';

const SystemHealth = () => {
    const { health, logs, interventions, clearLogs, resolveIssue } = useBayGuard();

    const getStatusColor = () => {
        switch (health) {
            case 'green': return '#10b981';
            case 'yellow': return '#f59e0b';
            case 'red': return '#ef4444';
            default: return '#6b7280';
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header / Stats */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Shield size={32} color={getStatusColor()} />
                        BayGuard AI <span style={{ fontSize: '0.8rem', background: '#e5e7eb', padding: '4px 10px', borderRadius: '50px', marginLeft: '8px' }}>v1.0.0</span>
                    </h1>
                    <p style={{ color: '#6b7280', marginTop: '4px' }}>Sistem bütünlüğü ve otomatik hata giderme merkezi.</p>
                </div>
                <button
                    onClick={clearLogs}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                    <Trash2 size={16} /> Günlükleri Temizle
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div style={{ padding: '20px', borderRadius: '16px', background: 'white', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '500' }}>Sistem Sağlığı</span>
                        <Zap size={20} color={getStatusColor()} />
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '12px', color: getStatusColor(), textTransform: 'uppercase' }}>
                        {health === 'green' ? 'Mükemmel' : health === 'yellow' ? 'Dikkat' : 'Kritik'}
                    </div>
                </div>
                <div style={{ padding: '20px', borderRadius: '16px', background: 'white', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '500' }}>Aktif Hatalar</span>
                        <AlertTriangle size={20} color="#ef4444" />
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '12px' }}>
                        {logs.filter(l => !l.fixed).length}
                    </div>
                </div>
                <div style={{ padding: '20px', borderRadius: '16px', background: 'white', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '500' }}>Otomatik Müdahaleler</span>
                        <Activity size={20} color="#3b82f6" />
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '12px' }}>
                        {interventions.length}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                {/* Intervention History */}
                <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={18} /> Müdahale Geçmişi
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {interventions.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', background: '#f9fafb', borderRadius: '12px', border: '1px dashed #e5e7eb' }}>
                                Henüz bir müdahale gerçekleştirilmedi.
                            </div>
                        ) : (
                            interventions.map(item => (
                                <div key={item.id} style={{ padding: '16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#166534', textTransform: 'uppercase' }}>{item.type}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}><Clock size={12} style={{ verticalAlign: 'middle' }} /> {new Date(item.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: '#14532d', fontWeight: '500' }}>{item.message}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Error Logs */}
                <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Terminal size={18} /> Hata Kayıtları (Interceptor)
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {logs.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', background: '#f9fafb', borderRadius: '12px', border: '1px dashed #e5e7eb' }}>
                                Tertemiz! Yakalanan bir hata yok.
                            </div>
                        ) : (
                            logs.slice().reverse().map(log => (
                                <div key={log.id} style={{
                                    padding: '16px',
                                    background: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '12px',
                                    opacity: log.fixed ? 0.6 : 1
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: log.fixed ? '#10b981' : '#ef4444' }}>
                                            {log.fixed ? 'ÇÖZÜLDÜ' : 'YAKALANDI'}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '8px', fontFamily: 'monospace' }}>{log.message}</p>
                                    {!log.fixed && (
                                        <button
                                            onClick={() => resolveIssue(log.id)}
                                            style={{ padding: '4px 10px', background: '#ecfdf5', color: '#059669', border: '1px solid #10b981', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
                                        >
                                            El İle Onayla
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemHealth;
