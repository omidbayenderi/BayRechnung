import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

import './TimelineGantt.css';

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
        <div className="gantt-wrapper premium-card">
            {/* Gantt Header */}
            <div className="gantt-header">
                <div className="gantt-title">
                    <div className="gantt-icon-box">
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
            <div className="gantt-body">
                <div className="gantt-scroll-content">

                    {/* Time Scale Header */}
                    <div className="time-scale-header">
                        <div className="task-column-header">ÜRÜN / GÖREV</div>
                        <div style={{ flex: 1, position: 'relative', height: '24px' }}>
                            {months.map((m, i) => (
                                <div key={i} className="month-label" style={{ left: `${m.startPos}%` }}>
                                    {m.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Gantt Rows */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {data.map((item, idx) => {
                            const start = getPosition(item.start_date || item.created_at || Date.now());
                            const end = getPosition(item.due_date || (Date.now() + 86400000 * 7));
                            const width = Math.max(end - start, 2); // At least 2% width

                            return (
                                <div key={item.id} className="gantt-row">
                                    <div className="task-info">
                                        <div className="task-name">{item.name}</div>
                                        <div className="task-category">{item.category || item.client_name || 'Genel'}</div>
                                    </div>

                                    <div className="bar-container">
                                        <motion.div
                                            initial={{ width: 0, opacity: 0 }}
                                            animate={{ width: `${width}%`, opacity: 1 }}
                                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                                            className="progress-bar-premium"
                                            style={{
                                                left: `${start}%`,
                                                background: item.color || 'linear-gradient(90deg, #4f46e5 0%, #3b82f6 100%)'
                                            }}
                                            whileHover={{ y: -2, boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.2)' }}
                                        >
                                            <div className="inner-progress-track">
                                                <div className="inner-progress-fill" style={{ width: `${item.progress || 0}%` }}></div>
                                            </div>
                                            <span className="percentage-label">
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
            <div className="gantt-footer">
                <div className="legend-item">
                    <div className="legend-dot" style={{ background: '#4f46e5' }}></div>
                    Planlanan
                </div>
                <div className="legend-item">
                    <div className="legend-dot" style={{ background: '#10b981' }}></div>
                    Tamamlanan
                </div>
            </div>
        </div>
    );
};

export default TimelineGantt;
