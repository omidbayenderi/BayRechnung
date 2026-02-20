import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { RefreshCw } from 'lucide-react';

const FeatureManagementView = () => {
    const [flags, setFlags] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchFlags = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('feature_flags').select('*').order('flag_key');
            if (error) throw error;
            setFlags(data || []);
        } catch (err) {
            console.error('[FlagsView] Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleFlag = async (id, currentStatus) => {
        try {
            const { error } = await supabase
                .from('feature_flags')
                .update({ is_enabled: !currentStatus })
                .eq('id', id);
            if (error) throw error;
            fetchFlags();
        } catch (err) {
            alert('Failed to toggle flag');
        }
    };

    useEffect(() => {
        fetchFlags();
    }, []);

    return (
        <div style={{ background: 'rgba(30, 41, 59, 0.3)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Feature Management System</h3>
                <button onClick={fetchFlags} style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer' }}>
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>
            <div style={{ display: 'grid', gap: '16px' }}>
                {flags.map(f => (
                    <div key={f.id} style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: '700', color: 'white', marginBottom: '4px' }}>{f.flag_key}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{f.description}</div>
                            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                                {f.allowed_plans?.map(p => (
                                    <span key={p} style={{ fontSize: '0.65rem', padding: '2px 8px', background: '#3b82f633', color: '#3b82f6', borderRadius: '4px', border: '1px solid #3b82f655' }}>{p.toUpperCase()}</span>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={() => toggleFlag(f.id, f.is_enabled)}
                            style={{
                                padding: '8px 20px',
                                borderRadius: '12px',
                                border: 'none',
                                background: f.is_enabled ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'rgba(255,255,255,0.05)',
                                color: f.is_enabled ? 'white' : '#64748b',
                                cursor: 'pointer',
                                fontWeight: '700',
                                transition: 'all 0.2s'
                            }}
                        >
                            {f.is_enabled ? 'ACTIVE' : 'DISABLED'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeatureManagementView;
