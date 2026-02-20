import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Activity, HardHat, Camera, MoreVertical, CheckCircle2 } from 'lucide-react';

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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px', height: '100%', minHeight: '600px' }}>
            {/* Map Section */}
            <div className="card" style={{ position: 'relative', overflow: 'hidden', minHeight: '500px', background: '#f1f5f9' }}>
                <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{t('site_map') || 'Şantiye Haritası'}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{sites.length} aktif proje</p>
                </div>

                {/* Simulated SVG Map */}
                <svg width="100%" height="100%" viewBox="0 0 400 300" style={{ transform: 'scale(1.2)' }}>
                    {/* Abstract City Grid */}
                    <path d="M0 50 L400 50 M0 100 L400 100 M0 150 L400 150 M0 200 L400 200 M0 250 L400 250" stroke="#cbd5e1" strokeWidth="1" />
                    <path d="M50 0 L50 300 M100 0 L100 300 M150 0 L150 300 M200 0 L200 300 M250 0 L250 300 M300 0 L300 300 M350 0 L350 300" stroke="#cbd5e1" strokeWidth="1" />

                    {/* Site Markers */}
                    {sites.map(site => (
                        <g
                            key={site.id}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSelectedSite(site)}
                        >
                            <motion.circle
                                cx={site.pos.x} cy={site.pos.y} r="12"
                                fill={site.status === 'warning' ? '#fef2f2' : '#f0f9ff'}
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            />
                            <circle
                                cx={site.pos.x} cy={site.pos.y} r="6"
                                fill={site.status === 'warning' ? '#ef4444' : 'var(--primary)'}
                            />
                        </g>
                    ))}
                </svg>

                <AnimatePresence>
                    {selectedSite && (
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            style={{
                                position: 'absolute', bottom: '20px', left: '20px',
                                background: 'white', padding: '16px', borderRadius: '12px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', width: '250px'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <h4 style={{ margin: 0 }}>{selectedSite.name}</h4>
                                <Activity size={16} color={selectedSite.status === 'warning' ? '#ef4444' : '#10b981'} />
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                <p>İlerleme: %{selectedSite.progress}</p>
                                <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', margin: '8px 0' }}>
                                    <div style={{ width: `${selectedSite.progress}%`, height: '100%', background: 'var(--primary)', borderRadius: '2px' }}></div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><HardHat size={14} /> {selectedSite.workers}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>⏰ {selectedSite.lastUpdate}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Logs Section */}
            <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{t('site_logs') || 'Canlı Akış'}</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
                    {logs.map(log => (
                        <div key={log.id} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                            <div style={{
                                width: '2px', height: '100%', background: '#e2e8f0',
                                position: 'absolute', left: '16px', top: '32px'
                            }}></div>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: '#f1f5f9', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', flexShrink: 0, zIndex: 1
                            }}>
                                <CheckCircle2 size={16} color="var(--primary)" />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{log.task}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{log.phase} • {log.user}</div>
                                {log.image && (
                                    <div style={{
                                        marginTop: '8px', width: '100%', height: '80px',
                                        background: '#f8fafc', borderRadius: '8px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: '1px dashed #cbd5e1'
                                    }}>
                                        <Camera size={20} color="#94a3b8" />
                                    </div>
                                )}
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>{log.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SiteControlCenter;
