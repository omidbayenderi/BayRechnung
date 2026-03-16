import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, BarChart3, PieChart, Briefcase, MessageSquare, 
    Bell, Search, Plus, List, Filter, Download, 
    TrendingUp, TrendingDown, DollarSign, Calendar,
    ChevronRight, MoreVertical, CheckCircle2, AlertCircle,
    LayoutDashboard, Map, Settings as SettingsIcon, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInvoice } from '../../context/InvoiceContext';
import { useLanguage } from '../../context/LanguageContext';
import './ConstructionAdminPanel.css';

// ── SUB-COMPONENTS ──

const StatCard = ({ label, value, trend, color, icon: Icon, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay }}
        className="stat-card"
    >
        <div className="stat-header">
            <div className="stat-icon" style={{ background: `${color}15`, color }}>
                <Icon size={24} />
            </div>
            <div className="stat-trend" style={{ background: `${color}15`, color }}>
                {trend}
            </div>
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>{label}</div>
        <div className="stat-value">{value}</div>
    </motion.div>
);

const ProjectCard = ({ project, delay }) => (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ delay }}
        className="stat-card"
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ 
                padding: '6px 12px', borderRadius: '100px', 
                background: project.status === 'completed' ? 'var(--success)15' : 'var(--accent-primary)15',
                color: project.status === 'completed' ? 'var(--success)' : 'var(--accent-primary)',
                fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase'
            }}>
                {project.status || 'Aktif'}
            </div>
            <MoreVertical size={18} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '4px' }}>{project.name}</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {project.client_name || 'Müşteri Belirtilmedi'} • ₺{project.budget || '0'}
        </p>
        
        <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700' }}>
            <span>İlerleme</span>
            <span style={{ color: 'var(--accent-primary)' }}>%{project.progress || 0}</span>
        </div>
        <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
            <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${project.progress || 0}%` }} 
                transition={{ duration: 1, delay: delay + 0.2 }}
                style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }} 
            />
        </div>

        <button className="btn-secondary" style={{ width: '100%', marginTop: '24px', padding: '10px' }}>
            Detayları Görüntüle
        </button>
    </motion.div>
);

const ConstructionAdminPanel = () => {
    const { currentUser, logout } = useAuth();
    const { companyProfile, projects = [] } = useInvoice();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('finance');
    const [searchQuery, setSearchQuery] = useState('');

    const navItems = [
        { id: 'finance', label: 'Finans', icon: BarChart3 },
        { id: 'projects', label: 'Şantiyeler', icon: Briefcase },
        { id: 'users', label: 'Personel', icon: Users },
        { id: 'reports', label: 'Raporlar', icon: PieChart },
        { id: 'messages', label: 'Mesajlar', icon: MessageSquare },
    ];

    return (
        <div className="admin-panel-container">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-logo">
                    <div className="logo-icon">
                        <Briefcase size={22} color="white" />
                    </div>
                    <span className="logo-text">{companyProfile?.companyName || 'BayZenit'}</span>
                </div>

                <nav className="nav-links">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase' }}>Oturum</div>
                    <div style={{ fontWeight: '800', fontSize: '0.9rem', marginBottom: '4px' }}>{currentUser?.displayName || 'Yönetici'}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--success)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '6px', height: '6px', background: 'currentColor', borderRadius: '50%' }} />
                        Aktif • Admin
                    </div>
                    <button onClick={logout} className="nav-item" style={{ marginTop: '20px', padding: '8px 0', border: 'none', background: 'none' }}>
                        <LogOut size={16} />
                        Çıkış Yap
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-title">
                        <motion.h1 
                            key={activeTab}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            {navItems.find(n => n.id === activeTab)?.label} Paneli
                        </motion.h1>
                        <p style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
                            {activeTab === 'finance' && 'Firma genel mali durumunu ve nakit akışını takip edin.'}
                            {activeTab === 'projects' && 'Tüm şantiyeleri ve iş akışlarını gerçek zamanlı yönetin.'}
                            {activeTab === 'users' && 'Ekip üyelerini, rolleri ve şantiye atamalarını organize edin.'}
                            {activeTab === 'reports' && 'Günlük, mali ve stok raporlarını analiz edin.'}
                            {activeTab === 'messages' && 'Üst düzey yöneticiler ve saha ekipleriyle iletişim kurun.'}
                        </p>
                    </div>
                    
                    <div className="header-actions">
                        <div className="search-bar">
                            <Search size={18} color="var(--text-secondary)" />
                            <input 
                                placeholder="Proje, personel veya rapor ara..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="btn-secondary" style={{ width: '48px', height: '48px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bell size={20} />
                        </button>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {/* ── FINANCE TAB ── */}
                    {activeTab === 'finance' && (
                        <motion.div 
                            key="finance"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="animate-fade"
                        >
                            <div className="stats-grid">
                                <StatCard label="Aylık Gelir" value="₺1.240.000" trend="+14%" color="var(--success)" icon={TrendingUp} delay={0.1} />
                                <StatCard label="Toplam Gider" value="₺840.000" trend="+2%" color="var(--warning)" icon={TrendingDown} delay={0.2} />
                                <StatCard label="Net Kâr" value="₺400.000" trend="+18%" color="var(--accent-primary)" icon={DollarSign} delay={0.3} />
                                <StatCard label="Bekleyen Ödemeler" value="₺150.000" trend="-5%" color="var(--danger)" icon={AlertCircle} delay={0.4} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                                <div className="data-table-wrapper" style={{ minHeight: '400px', padding: '32px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Nakit Akışı Analizi</h3>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Haftalık</button>
                                            <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem', boxShadow: 'none' }}>Aylık</button>
                                        </div>
                                    </div>
                                    <div style={{ height: '280px', width: '100%', display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                                        {[40, 65, 45, 90, 70, 85, 60, 75, 80, 95, 85, 100].map((h, i) => (
                                            <motion.div 
                                                key={i} 
                                                initial={{ height: 0 }}
                                                animate={{ height: `${h}%` }}
                                                transition={{ delay: i * 0.05, duration: 0.8 }}
                                                style={{ flex: 1, background: 'linear-gradient(to top, var(--accent-primary), var(--accent-secondary))', borderRadius: '8px 8px 2px 2px', opacity: 0.8 }} 
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="data-table-wrapper" style={{ padding: '24px' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '24px' }}>Gider Dağılımı</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {[
                                            { label: 'İnşaat Malzemeleri', val: 55, color: 'var(--accent-primary)' },
                                            { label: 'Personel Maaşları', val: 25, color: 'var(--accent-secondary)' },
                                            { label: 'Lojistik & Yakıt', val: 15, color: 'var(--success)' },
                                            { label: 'Diğer', val: 5, color: 'var(--warning)' },
                                        ].map((item, i) => (
                                            <div key={i}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                                                    <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>{item.label}</span>
                                                    <span style={{ fontWeight: '800' }}>%{item.val}</span>
                                                </div>
                                                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                                                    <div style={{ height: '100%', width: `${item.val}%`, background: item.color, borderRadius: '10px' }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── PROJECTS TAB ── */}
                    {activeTab === 'projects' && (
                        <motion.div 
                            key="projects"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="stats-grid"
                        >
                            {projects.length > 0 ? projects.map((proj, i) => (
                                <ProjectCard key={proj.id} project={proj} delay={i * 0.1} />
                            )) : (
                                <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '60px' }}>
                                    <p style={{ color: 'var(--text-secondary)' }}>Henüz şantiye kaydı bulunmamaktadır.</p>
                                    <button className="btn-primary" style={{ margin: '20px auto' }}>
                                        <Plus size={20} /> İlk Şantiyeyi Ekle
                                    </button>
                                </div>
                            )}
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                className="stat-card" 
                                style={{ background: 'transparent', border: '2px dashed var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', cursor: 'pointer' }}
                            >
                                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                                    <Plus size={28} />
                                </div>
                                <span style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>Yeni Proje Başlat</span>
                            </motion.button>
                        </motion.div>
                    )}

                    {/* ── USERS TAB ── */}
                    {activeTab === 'users' && (
                        <motion.div 
                            key="users"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="data-table-wrapper"
                        >
                            <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button className="btn-secondary"><Filter size={16} /> Filtrele</button>
                                    <button className="btn-secondary"><Download size={16} /> Dışa Aktar</button>
                                </div>
                                <button className="btn-primary"><Plus size={18} /> Yeni Personel</button>
                            </div>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Personel</th>
                                        <th>Rol</th>
                                        <th>Görev Yeri</th>
                                        <th>Durum</th>
                                        <th>İşlem</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { name: 'Canberk Akkaya', role: 'Şantiye Şefi', site: 'Azure Villaları', status: 'Aktif', img: 'https://i.pravatar.cc/100?u=1' },
                                        { name: 'Meltem Yılmaz', role: 'Mimar', site: 'Ofis', status: 'Aktif', img: 'https://i.pravatar.cc/100?u=2' },
                                        { name: 'Selin Gürsoy', role: 'Muhasebe', site: 'Ofis', status: 'İzinde', img: 'https://i.pravatar.cc/100?u=4' },
                                    ].map((user, i) => (
                                        <tr key={i}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                    <img src={user.img} className="user-avatar" alt="" />
                                                    <div>
                                                        <div style={{ fontWeight: '800' }}>{user.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.name.toLowerCase().replace(' ', '.') + '@firma.com'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', fontSize: '0.75rem', fontWeight: '700' }}>{user.role}</span></td>
                                            <td>{user.site}</td>
                                            <td><span style={{ color: user.status === 'Aktif' ? 'var(--success)' : 'var(--warning)', fontSize: '0.85rem', fontWeight: '700' }}>{user.status}</span></td>
                                            <td><button style={{ color: 'var(--accent-primary)', background: 'none', border: 'none', fontWeight: '700', cursor: 'pointer' }}>Düzenle</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    )}

                    {/* ── REPORTS & MESSAGES Placeholders for next step ── */}
                    {(activeTab === 'reports' || activeTab === 'messages') && (
                        <motion.div 
                            key="placeholder"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{ textAlign: 'center', padding: '100px', background: 'var(--card-bg)', borderRadius: '32px', border: '1px solid var(--border-color)' }}
                        >
                            <LayoutDashboard size={48} style={{ color: 'var(--text-secondary)', marginBottom: '20px' }} />
                            <h3>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Geliştirme Aşamasında</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Bu modül yakında gerçek verilerle aktif hale getirilecektir.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default ConstructionAdminPanel;
