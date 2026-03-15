import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Activity, HardHat, Camera, MoreVertical, CheckCircle2 } from 'lucide-react';

import './SiteControlCenter.css';

const SiteControlCenter = ({ t }) => {
    const [selectedSite, setSelectedSite] = useState(null);

    const sites = [
        { id: 1, name: 'Kuzey Rezidans', pos: { x: 120, y: 80 }, progress: 65, status: 'active', workers: 12, lastUpdate: '10:00' },
        { id: 2, name: 'Güney Metro', pos: { x: 250, y: 150 }, progress: 20, status: 'warning', workers: 8, lastUpdate: '09:30' },
        { id: 3, name: 'Doğu İş Merkezi', pos: { x: 80, y: 220 }, progress: 95, status: 'active', workers: 4, lastUpdate: '11:15' }
    ];

    const logs = [
        { id: 101, siteId: 1, phase: 'Kaba İnşaat', task: 'Beton Dökümü', user: 'Ahmet Şef', time: '1 saat önce', image: true },
        { id: 102, siteId: 2, phase: 'Temel', task: 'Hafriyat', user: 'Mehmet Lider', time: '2 saat önce', image: false },
        { id: 103, siteId: 1, phase: 'Tesisat', task: 'Elektrik Dağıtım', user: 'Can Usta', time: '4 saat önce', image: true }
    ];

    return (
        <div className="control-center-wrapper">
            {/* Map Section */}
            <div className="card map-container">
                <div className="map-overlay-title">
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>{t('site_map') || 'Şantiye Haritası'}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>{sites.length} aktif proje</p>
                </div>

                {/* Simulated SVG Map */}
                <svg width="100%" height="100%" viewBox="0 0 400 300" style={{ transform: 'scale(1.1)' }}>
                    {/* Abstract City Grid */}
                    <path d="M0 50 L400 50 M0 100 L400 100 M0 150 L400 150 M0 200 L400 200 M0 250 L400 250" stroke="#94a3b8" strokeWidth="0.5" opacity="0.3" />
                    <path d="M50 0 L50 300 M100 0 L100 300 M150 0 L150 300 M200 0 L200 300 M250 0 L250 300 M300 0 L300 300 M350 0 L350 300" stroke="#94a3b8" strokeWidth="0.5" opacity="0.3" />

                    {/* Site Markers */}
                    {sites.map(site => (
                        <g
                            key={site.id}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSelectedSite(site)}
                        >
                            <motion.circle
                                cx={site.pos.x} cy={site.pos.y} r="14"
                                fill={site.status === 'warning' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'}
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ repeat: Infinity, duration: 2.5 }}
                            />
                            <circle
                                cx={site.pos.x} cy={site.pos.y} r="7"
                                fill={site.status === 'warning' ? '#ef4444' : 'var(--primary)'}
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
                                    background: selectedSite.status === 'warning' ? '#fee2e2' : '#dcfce7',
                                    color: selectedSite.status === 'warning' ? '#ef4444' : '#10b981',
                                    fontSize: '0.7rem',
                                    fontWeight: '700',
                                    textTransform: 'uppercase'
                                }}>
                                    {selectedSite.status}
                                </div>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span>İlerleme</span>
                                    <span style={{ fontWeight: '800', color: 'var(--primary)' }}>%{selectedSite.progress}</span>
                                </div>
                                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', marginBottom: '16px' }}>
                                    <div style={{ width: `${selectedSite.progress}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px' }}></div>
                                </div>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <HardHat size={16} strokeWidth={2.5} color="#64748b" />
                                        <span style={{ fontWeight: '700' }}>{selectedSite.workers}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Activity size={16} strokeWidth={2.5} color="#64748b" />
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>{t('site_logs') || 'Canlı Akış'}</h3>
                    <div className="badge-premium">Live</div>
                </div>

                <div className="logs-scroll-area">
                    {logs.map(log => (
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
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', fontWeight: '500' }}>{log.phase} • <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{log.user}</span></div>
                                {log.image && (
                                    <div className="log-image-placeholder">
                                        <Camera size={24} color="#cbd5e1" strokeWidth={1.5} />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SiteControlCenter;
