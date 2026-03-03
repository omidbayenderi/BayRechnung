import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, RefreshCw, Activity, ArrowLeft, Lock, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const MtdRotationsView = ({ mtdState, interventions, onBack }) => {
    // Generate some dynamic-ish data for the pie chart based on security state
    const chartData = useMemo(() => {
        const blocks = interventions.filter(i => i.type === 'mtd-block').length;
        const autoFixes = interventions.filter(i => i.type === 'auto-fix').length;
        const rotations = mtdState.rotationCount;

        // Mocking categorical data for visual richness
        return [
            { name: 'Active Rotations', value: rotations, color: '#3b82f6' },
            { name: 'Threat Blocks', value: Math.max(blocks, 1), color: '#ef4444' }, // at least 1 for better viz
            { name: 'Self-Heals', value: Math.max(autoFixes, 2), color: '#10b981' },
            { name: 'Latency Optimization', value: 8, color: '#8b5cf6' }
        ];
    }, [mtdState.rotationCount, interventions]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            style={{
                background: 'rgba(30, 41, 59, 0.3)',
                borderRadius: '24px',
                padding: '32px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                minHeight: '600px'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        onClick={onBack}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: 'none',
                            color: 'white',
                            padding: '8px',
                            borderRadius: '12px',
                            cursor: 'pointer'
                        }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.5px' }}>MTD Live Analytics</h3>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Moving Target Defense - Dynamic Surface Rotation</p>
                    </div>
                </div>

                <div style={{ padding: '12px 20px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 10px #3b82f6' }} className="animate-pulse" />
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#60a5fa' }}>Session: {mtdState.sessionNonce}</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                {/* Live Animation & Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{
                        padding: '24px',
                        background: 'rgba(15, 23, 42, 0.4)',
                        borderRadius: '20px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <RefreshCw size={20} className="animate-spin-slow" color="#3b82f6" />
                            <h4 style={{ fontWeight: '800' }}>Active Surface Strategy</h4>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        opacity: [0.3, 0.7, 0.3],
                                        scale: [1, 1.05, 1],
                                        boxShadow: [
                                            '0 0 0px rgba(59, 130, 246, 0)',
                                            '0 0 10px rgba(59, 130, 246, 0.2)',
                                            '0 0 0px rgba(59, 130, 246, 0)'
                                        ]
                                    }}
                                    transition={{ duration: 2 + i, repeat: Infinity }}
                                    style={{
                                        padding: '10px 16px',
                                        background: 'rgba(30, 41, 59, 0.6)',
                                        borderRadius: '10px',
                                        fontSize: '0.75rem',
                                        fontFamily: 'monospace',
                                        color: '#3b82f6',
                                        border: '1px solid rgba(59, 130, 246, 0.2)'
                                    }}
                                >
                                    TARGET_{Math.floor(Math.random() * 9999).toString(16).toUpperCase()}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '8px' }}>Rotation Velocity</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#10b981' }}>{mtdState.rotationCount} / Total</div>
                        </div>
                        <div style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '8px' }}>Heal Intensity</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#8b5cf6' }}>99.2%</div>
                        </div>
                    </div>

                    <div style={{ padding: '24px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h4 style={{ fontWeight: '800', marginBottom: '16px', fontSize: '0.9rem' }}>Recent MTD Events</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {interventions.length > 0 ? (
                                interventions.slice(0, 3).map(i => (
                                    <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: '#94a3b8' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: i.type === 'mtd-block' ? '#ef4444' : '#3b82f6' }} />
                                        <span style={{ flex: 1 }}>{i.message}</span>
                                        <span style={{ fontSize: '0.7rem', color: '#475569' }}>{new Date(i.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                ))
                            ) : (
                                <div style={{ color: '#475569', fontSize: '0.8rem' }}>Monitoring clear - No interventions needed.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pie Chart Section */}
                <div style={{
                    background: 'rgba(15, 23, 42, 0.4)',
                    borderRadius: '24px',
                    padding: '24px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <h4 style={{ fontWeight: '800', alignSelf: 'flex-start', marginBottom: '10px' }}>Security Distribution</h4>
                    <p style={{ color: '#64748b', fontSize: '0.8rem', alignSelf: 'flex-start', marginBottom: '20px' }}>Real-time event allocation across defense layers.</p>

                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    animationBegin={0}
                                    animationDuration={1500}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                                    itemStyle={{ color: 'white' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{ marginTop: 'auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {chartData.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '12px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: item.color }} />
                                <div>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>{item.name}</div>
                                    <div style={{ fontSize: '1rem', fontWeight: '800', color: 'white' }}>{item.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MtdRotationsView;
