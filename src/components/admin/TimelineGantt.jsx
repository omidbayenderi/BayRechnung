import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const TimelineGantt = ({ data, title, type = 'projects' }) => {
    // data structure: [{ id, name, start_date, due_date, progress, color, category }]

    // Calculate timeline range
    const { startDate, endDate, days } = useMemo(() => {
        if (!data || data.length === 0) {
            const today = new Date();
            const end = new Date();
            end.setDate(today.getDate() + 30);
            return { startDate: today, endDate: end, days: 30 };
        }

        const starts = data.map(d => new Date(d.start_date || d.created_at || Date.now()));
        const ends = data.map(d => new Date(d.due_date || Date.now() + 86400000 * 7));

        const start = new Date(Math.min(...starts));
        start.setDate(1); // Start of month

        const end = new Date(Math.max(...ends));
        end.setMonth(end.getMonth() + 1);
        end.setDate(0); // End of month

        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return { startDate: start, endDate: end, days: diffDays };
    }, [data]);

    const getPosition = (date) => {
        const d = new Date(date);
        const diffTime = Math.abs(d - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return (diffDays / days) * 100;
    };

    const months = useMemo(() => {
        const result = [];
        let current = new Date(startDate);
        while (current <= endDate) {
            result.push({
                name: current.toLocaleString('default', { month: 'short', year: '2-digit' }),
                days: new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate(),
                startPos: getPosition(new Date(current.getFullYear(), current.getMonth(), 1))
            });
            current.setMonth(current.getMonth() + 1);
        }
        return result;
    }, [startDate, endDate, days]);

    return (
        <div className="card glass premium-card" style={{ padding: '0', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Gantt Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '8px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '10px' }}>
                        <Calendar size={20} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>{title || 'Zaman Çizelgesi'}</h3>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="icon-btn" style={{ background: '#f8fafc' }}><ChevronLeft size={18} /></button>
                    <button className="icon-btn" style={{ background: '#f8fafc' }}><ChevronRight size={18} /></button>
                </div>
            </div>

            {/* Gantt Body */}
            <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
                <div style={{ minWidth: '800px', padding: '24px' }}>

                    {/* Time Scale Header */}
                    <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
                        <div style={{ width: '200px', flexShrink: 0, fontWeight: '700', color: '#64748b', fontSize: '0.85rem' }}>ÜRÜN / GÖREV</div>
                        <div style={{ flex: 1, position: 'relative', height: '24px' }}>
                            {months.map((m, i) => (
                                <div key={i} style={{
                                    position: 'absolute',
                                    left: `${m.startPos}%`,
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    color: '#94a3b8',
                                    borderLeft: '1px solid #e2e8f0',
                                    paddingLeft: '8px',
                                    height: '200px', // Grid line
                                    zIndex: 0
                                }}>
                                    {m.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Gantt Rows */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {data.map((item, idx) => {
                            const start = getPosition(item.start_date || item.created_at || Date.now());
                            const end = getPosition(item.due_date || (Date.now() + 86400000 * 7));
                            const width = Math.max(end - start, 2); // At least 2% width

                            return (
                                <div key={item.id} style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{ width: '200px', flexShrink: 0, paddingRight: '20px' }}>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {item.name}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.category || item.client_name || 'Genel'}</div>
                                    </div>

                                    <div style={{ flex: 1, position: 'relative', height: '32px', background: '#f8fafc', borderRadius: '16px' }}>
                                        <motion.div
                                            initial={{ width: 0, opacity: 0 }}
                                            animate={{ width: `${width}%`, opacity: 1 }}
                                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                                            style={{
                                                position: 'absolute',
                                                left: `${start}%`,
                                                height: '100%',
                                                background: item.color || 'linear-gradient(90deg, #4f46e5 0%, #3b82f6 100%)',
                                                borderRadius: '16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '0 12px',
                                                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
                                                cursor: 'pointer',
                                                zIndex: 1
                                            }}
                                            whileHover={{ y: -2, boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4)' }}
                                        >
                                            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', overflow: 'hidden' }}>
                                                <div style={{ width: `${item.progress || 0}%`, height: '100%', background: 'white' }}></div>
                                            </div>
                                            <span style={{
                                                position: 'absolute',
                                                left: '100%',
                                                marginLeft: '8px',
                                                fontSize: '0.7rem',
                                                fontWeight: '700',
                                                color: '#64748b',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                %{item.progress || 0}
                                            </span>
                                        </motion.div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Gantt Footer */}
            <div style={{ padding: '12px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#4f46e5' }}></div>
                    Planlanan
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10b981' }}></div>
                    Tamamlanan
                </div>
            </div>
        </div>
    );
};

export default TimelineGantt;
