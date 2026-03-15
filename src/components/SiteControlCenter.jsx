import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Activity, HardHat, Camera, MoreVertical, CheckCircle2 } from 'lucide-react';

import './SiteControlCenter.css';

const SiteControlCenter = ({ t, projects = [] }) => {
    const [selectedSite, setSelectedSite] = useState(null);

    // Map projects to the simulated SVG coordinate system
    const mappedSites = React.useMemo(() => {
        if (!projects || projects.length === 0) return [];
        
        return projects.map((p, index) => {
            // Deterministic position based on project ID or name
            const hash = p.id ? p.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : index;
            const x = 50 + (hash * 13) % 300;
            const y = 40 + (hash * 7) % 220;
            
            return {
                ...p,
                pos: { x, y },
                progress: p.progress || 10,
                status: p.status === 'lead' ? 'warning' : 'active',
                workers: Math.floor((hash % 15) + 3),
                lastUpdate: '14:30' // Simulated
            };
        });
    }, [projects]);

    const logs = React.useMemo(() => {
        if (!projects || projects.length === 0) return [];
        return projects.slice(0, 3).map((p, i) => ({
            id: `log-${i}`,
            siteName: p.name,
            phase: p.status === 'in_progress' ? 'Kaba İnşaat' : 'Planlama',
            task: i === 0 ? 'Beton Dökümü' : i === 1 ? 'Hafriyat' : 'İlave Malzeme Siparişi',
            user: i === 0 ? 'Ahmet Şef' : 'Mehmet Lider',
            time: `${i + 1} saat önce`,
            image: i % 2 === 0
        }));
    }, [projects]);

    return (
        <div className="control-center-wrapper">
            {/* Map Section */}
            <div className="card map-container">
                <div className="map-overlay-title">
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>{t('site_map') || 'Şantiye Haritası'}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>{mappedSites.length} aktif proje</p>
                </div>

                {/* Simulated SVG Map */}
                <svg width="100%" height="100%" viewBox="0 0 400 300" style={{ transform: 'scale(1.1)' }}>
                    {/* Abstract City Grid */}
                    <path d="M0 50 L400 50 M0 100 L400 100 M0 150 L400 150 M0 200 L400 200 M0 250 L400 250" stroke="#94a3b8" strokeWidth="0.5" opacity="0.3" />
                    <path d="M50 0 L50 300 M100 0 L100 300 M150 0 L150 300 M200 0 L200 300 M250 0 L250 300 M300 0 L300 300 M350 0 L350 300" stroke="#94a3b8" strokeWidth="0.5" opacity="0.3" />

                    {/* Site Markers */}
                    {mappedSites.map(site => (
                        <g
                            key={site.id}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSelectedSite(site)}
                        >
                            <motion.circle
                                cx={site.pos.x} cy={site.pos.y} r="14"
                                fill={site.status === 'warning' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(124, 58, 237, 0.1)'}
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ repeat: Infinity, duration: 2.5 }}
                            />
                            <circle
                                cx={site.pos.x} cy={site.pos.y} r="7"
                                fill={site.status === 'warning' ? '#ef4444' : '#7c3aed'}
                                stroke="white"
                                strokeWidth="2"
                            />
                        </g>
                    ))}
                </svg>

                <AnimatePresence>
                    {selectedSite && (
                        <motion.div
                            initial={{ y: 20, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 20, opacity: 0, scale: 0.95 }}
                            className="site-card-overlay"
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                <h4 style={{ margin: 0, fontWeight: '800' }}>{selectedSite.name}</h4>
                                <div style={{
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    background: selectedSite.status === 'warning' ? '#fee2e2' : '#f5f3ff',
                                    color: selectedSite.status === 'warning' ? '#ef4444' : '#7c3aed',
                                    fontSize: '0.7rem',
                                    fontWeight: '700',
                                    textTransform: 'uppercase'
                                }}>
                                    {selectedSite.status}
                                </div>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span>{t('progress') || 'İlerleme'}</span>
                                    <span style={{ fontWeight: '800', color: 'var(--primary)' }}>%{selectedSite.progress}</span>
                                </div>
                                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', marginBottom: '16px' }}>
                                    <div style={{ width: `${selectedSite.progress}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px' }}></div>
                                </div>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <HardHat size={16} strokeWidth={2} color="#64748b" />
                                        <span style={{ fontWeight: '700' }}>{selectedSite.workers}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Activity size={16} strokeWidth={2} color="#64748b" />
                                        <span style={{ fontWeight: '700' }}>{selectedSite.lastUpdate}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedSite(null)}
                                style={{
                                    position: 'absolute', top: '-10px', right: '-10px',
                                    width: '24px', height: '24px', borderRadius: '50%',
                                    background: 'white', border: '1px solid #e2e8f0',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            >
                                ×
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Logs Section */}
            <div className="card logs-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>{t('site_logs') || 'Canlı Akış'}</h3>
                    <div className="badge-premium">Live</div>
                </div>

                <div className="logs-scroll-area">
                    {logs.length > 0 ? logs.map(log => (
                        <div key={log.id} className="log-item">
                            <div className="log-timeline-line"></div>
                            <div className="log-icon-wrapper">
                                <CheckCircle2 size={18} color="var(--primary)" strokeWidth={3} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-main)' }}>{log.task}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600' }}>{log.time}</div>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', fontWeight: '500' }}>
                                    <span style={{ color: '#1e293b', fontWeight: '700' }}>{log.siteName}</span> • {log.phase} • <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{log.user}</span>
                                </div>
                                {log.image && (
                                    <div className="log-image-placeholder">
                                        <Camera size={24} color="#cbd5e1" strokeWidth={1.5} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                            <Activity size={32} strokeWidth={1.5} style={{ opacity: 0.5, marginBottom: '12px' }} />
                            <p>{t('no_logs_yet') || 'Henüz aktivite kaydı yok.'}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SiteControlCenter;
