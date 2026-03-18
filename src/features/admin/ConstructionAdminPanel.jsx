import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, BarChart3, PieChart, Briefcase, MessageSquare, 
    Bell, Search, Plus, List, Filter, Download, 
    TrendingUp, TrendingDown, DollarSign, Calendar,
    ChevronRight, MoreVertical, CheckCircle2, AlertCircle,
    LayoutDashboard, Map, Settings as SettingsIcon, LogOut,
    FileText, Layers, Kanban, GanttChart, Activity, Info, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInvoice } from '../../context/InvoiceContext';
import { useLanguage } from '../../context/LanguageContext';
import SystemHealth from '../../pages/admin/SystemHealth';
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

const ProjectCard = ({ project, delay }) => {
    const { t } = useLanguage();
    return (
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
                    {project.status === 'completed' ? (t('completed') || 'Tamamlandı') : (t('active') || 'Aktif')}
                </div>
                <MoreVertical size={18} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '4px' }}>{project.name}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {project.client_name || t('customer_not_specified') || 'Müşteri Belirtilmedi'} • ₺{project.budget || '0'}
            </p>
            
            <div style={{ display: 'flex', gap: '6px', marginBottom: '24px' }}>
                {[(t('rough_construction') || 'Kaba İnşaat'), (t('plumbing') || 'Tesisat'), (t('finishing_works') || 'İnce İşler')].map((step, i) => (
                    <div key={i} style={{ fontSize: '0.65rem', padding: '4px 8px', borderRadius: '6px', background: i === 0 ? 'var(--accent-primary)20' : 'rgba(255,255,255,0.03)', color: i === 0 ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: '700' }}>
                        {step}
                    </div>
                ))}
            </div>
            
            <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700' }}>
                <span>{t('progress') || 'İlerleme'}</span>
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
                {t('view_details') || 'Detayları Görüntüle'}
            </button>
        </motion.div>
    );
};

const ConstructionAdminPanel = () => {
    const { currentUser, logout } = useAuth();
    const { companyProfile, projects = [] } = useInvoice();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');

    const navItems = [
        { id: 'overview', label: t('menu_overview') || 'Genel Bakış', icon: LayoutDashboard, desc: t('overview_desc') || 'Tüm firmayı ve şantiyeleri tek ekrandan yönetin.' },
        { id: 'finance', label: t('menu_finance') || 'Finans Dashboard', icon: BarChart3, desc: t('finance_desc') || 'Gelir, gider, ciro ve borç durumunu yönetin.' },
        { id: 'projects', label: t('menu_projects') || 'Şantiye ve İş Akışı', icon: Briefcase, icon2: Kanban, desc: t('projects_desc') || 'Şantiyeleri, aşamaları ve ilerlemeyi takip edin.' },
        { id: 'users', label: t('menu_users') || 'Kullanıcı Yönetimi', icon: Users, desc: t('users_desc') || 'Personel rolleri ve şantiye atamaları.' },
        { id: 'reports', label: t('menu_reports') || 'Raporlar', icon: PieChart, desc: t('reports_desc_detailed') || 'Günlük, stok ve ilerleme raporları.' },
        { id: 'health', label: t('menu_health') || 'Uygulama Sağlığı', icon: Activity, desc: t('health_desc') || 'Sistem sağlığı ve BayGuard AI logları.' },
        { id: 'messages', label: t('menu_messages') || 'Mesajlar / Bildirimler', icon: MessageSquare, desc: t('messages_desc') || 'Yönetici notları ve saha bildirimleri.' },
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
                            title={item.desc}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase' }}>{t('session') || 'Oturum'}</div>
                    <div style={{ fontWeight: '800', fontSize: '0.9rem', marginBottom: '4px' }}>{currentUser?.displayName || 'Yönetici'}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--success)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '6px', height: '6px', background: 'currentColor', borderRadius: '50%' }} />
                        {t('active') || 'Aktif'} • Admin
                    </div>
                    <button onClick={logout} className="nav-item" style={{ marginTop: '20px', padding: '8px 0', border: 'none', background: 'none' }}>
                        <LogOut size={16} />
                        {t('logout') || 'Çıkış Yap'}
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
                            {navItems.find(n => n.id === activeTab)?.label}
                        </motion.h1>
                        <p style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
                            {navItems.find(n => n.id === activeTab)?.desc}
                        </p>
                    </div>
                    
                    <div className="header-actions">
                        <div className="search-bar">
                            <Search size={18} color="var(--text-secondary)" />
                            <input 
                                placeholder={t('search_placeholder_admin') || "Proje, personel veya rapor ara..."} 
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
                    {/* ── OVERVIEW TAB ── */}
                    {activeTab === 'overview' && (
                        <motion.div 
                            key="overview"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="animate-fade"
                        >
                            <div className="stats-grid">
                                <StatCard label="Aktif Şantiyeler" value={projects.length} trend="+1" color="var(--accent-primary)" icon={Map} delay={0.1} />
                                <StatCard label="Toplam Personel" value="48" trend="+2" color="var(--accent-secondary)" icon={Users} delay={0.2} />
                                <StatCard label="Aylık Hakediş" value="₺8.4M" trend="+12%" color="var(--success)" icon={DollarSign} delay={0.3} />
                                <StatCard label="Kritik Uyarılar" value="3" trend="!" color="var(--danger)" icon={AlertCircle} delay={0.4} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                                {/* Active Projects Summary */}
                                <div className="data-table-wrapper" style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Şantiye İlerleme Durumu</h3>
                                        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => setActiveTab('projects')}>Tümünü Gör</button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {projects.slice(0, 3).map((p, i) => (
                                            <div key={i} style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <span style={{ fontWeight: '700' }}>{p.name}</span>
                                                    <span style={{ color: 'var(--accent-primary)', fontWeight: '800' }}>%{p.progress}</span>
                                                </div>
                                                <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: `${p.progress}%`, background: 'var(--accent-primary)', borderRadius: '10px' }} />
                                                </div>
                                            </div>
                                        ))}
                                        {projects.length === 0 && <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Henüz aktif proje yok.</p>}
                                    </div>
                                </div>

                                {/* Recent Activity Feed */}
                                <div className="data-table-wrapper" style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Son Aktiviteler</h3>
                                        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>İşlem Kaydı</button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {[
                                            { icon: CheckCircle2, text: 'Canberk A. günlük raporu onayladı.', time: '12dk önce', color: 'var(--success)' },
                                            { icon: AlertCircle, text: 'Demir stok seviyesi kritik (Koru Konutları)', time: '45dk önce', color: 'var(--danger)' },
                                            { icon: MessageSquare, text: 'Yeni revize planlar mimar tarafından yüklendi.', time: '2sa önce', color: 'var(--accent-primary)' },
                                            { icon: DollarSign, text: 'Azure Villaları hakediş ödemesi alındı.', time: '5sa önce', color: 'var(--success)' }
                                        ].map((act, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '12px', paddingBottom: '12px', borderBottom: i === 3 ? 'none' : '1px solid var(--border-color)' }}>
                                                <div style={{ color: act.color, marginTop: '2px' }}><act.icon size={16} /></div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{act.text}</div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{act.time}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions List */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                {[
                                    { label: 'Personel Ata', icon: Users, color: '#4f46e5' },
                                    { label: 'Yeni Rapor', icon: FileText, color: '#0891b2' },
                                    { label: 'Saha Denetimi', icon: Shield, color: '#059669' },
                                    { label: 'Hakediş Onayı', icon: CheckCircle2, color: '#7c3aed' }
                                ].map((qa, i) => (
                                    <motion.button 
                                        key={i}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        className="btn-secondary"
                                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '24px', borderRadius: '24px', background: `${qa.color}10`, borderColor: `${qa.color}20` }}
                                    >
                                        <div style={{ color: qa.color }}><qa.icon size={24} /></div>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '800' }}>{qa.label}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ── FINANCE TAB ── */}
                    {activeTab === 'finance' && (
                        <motion.div 
                            key="finance"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="animate-fade"
                        >
                            {/* Financial Copilot Alert */}
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                className="stat-card" 
                                style={{ background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.1), transparent)', borderLeft: '4px solid var(--accent-primary)', marginBottom: '32px', padding: '20px 32px' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ color: 'var(--accent-primary)' }}><Info size={24} /></div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>AI Finansal Copilot Önerisi</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Önümüzdeki ay için tahmini %12'lik bir malzeme maliyet artışı öngörülüyor. Tedarik zincirini kontrol etmeniz önerilir.</div>
                                    </div>
                                    <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Detaylar</button>
                                </div>
                            </motion.div>

                            <div className="stats-grid">
                                <StatCard label={t('total_turnover') || 'Yıllık Ciro'} value="₺14.240.000" trend="+22%" color="var(--success)" icon={Activity} delay={0.1} />
                                <StatCard label={t('monthly_revenue') || 'Aylık Gelir'} value="₺1.240.000" trend="+14%" color="var(--success)" icon={TrendingUp} delay={0.2} />
                                <StatCard label={t('total_expense') || 'Aylık Gider'} value="₺840.000" trend="+2%" color="var(--warning)" icon={TrendingDown} delay={0.3} />
                                <StatCard label={t('total_debts') || 'Toplam Borçlar'} value="₺2.150.000" trend="-5%" color="var(--danger)" icon={DollarSign} delay={0.4} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                                <div className="data-table-wrapper" style={{ minHeight: '400px', padding: '32px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{t('cash_flow_analysis') || 'Nakit Akış Analizi'}</h3>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Haftalık</button>
                                            <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem', boxShadow: 'none' }}>Aylık</button>
                                        </div>
                                    </div>
                                    {/* Visual Chart Placeholder */}
                                    <div style={{ height: '280px', width: '100%', display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                                        {[40, 65, 45, 90, 70, 85, 60, 75, 80, 95, 85, 100].map((h, i) => (
                                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '4px' }}>
                                                <motion.div 
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${h}%` }}
                                                    transition={{ delay: i * 0.05, duration: 0.8 }}
                                                    style={{ background: 'linear-gradient(to top, var(--accent-primary), var(--accent-secondary))', borderRadius: '8px 8px 2px 2px', opacity: 0.8 }} 
                                                />
                                                <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textAlign: 'center' }}>{['O', 'Ş', 'M', 'N', 'M', 'H', 'T', 'A', 'E', 'E', 'K', 'A'][i]}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="data-table-wrapper" style={{ padding: '24px' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '24px' }}>{t('expense_distribution') || 'Gider Dağılımı'}</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {[
                                            { label: t('construction_materials') || 'Malzeme Giderleri', val: 55, color: 'var(--accent-primary)' },
                                            { label: t('personnel_salaries') || 'Personel ve Maaş', val: 25, color: 'var(--accent-secondary)' },
                                            { label: t('logistics_fuel') || 'Lojistik ve Yakıt', val: 15, color: 'var(--success)' },
                                            { label: t('other') || 'Diğer Giderler', val: 5, color: 'var(--warning)' },
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
                                    <div style={{ marginTop: '32px', padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Borç/Alacak Durumu</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>₺1.2M / ₺800K</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: '700' }}>Stabil</div>
                                        </div>
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
                            className="animate-fade"
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', background: 'rgba(99, 102, 241, 0.1)' }}>
                                        <Kanban size={18} /> Kanban
                                    </button>
                                    <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <List size={18} /> Liste View
                                    </button>
                                    <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <GanttChart size={18} /> Gantt (Plan)
                                    </button>
                                </div>
                                <div className="search-bar" style={{ minWidth: '200px', height: '40px' }}>
                                    <Filter size={16} />
                                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Şantiye Filtrele</span>
                                </div>
                            </div>

                            <div className="stats-grid">
                                {projects.length > 0 ? projects.map((proj, i) => (
                                    <ProjectCard key={proj.id} project={proj} delay={i * 0.1} />
                                )) : (
                                    <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '60px' }}>
                                        <p style={{ color: 'var(--text-secondary)' }}>Henüz kayıtlı şantiye bulunamadı.</p>
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
                            </div>
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
                                    <div className="search-bar" style={{ minWidth: '240px', height: '40px' }}>
                                        <Search size={16} />
                                        <input placeholder={t('search_personnel') || "Personel ara..."} style={{ fontSize: '0.85rem' }} />
                                    </div>
                                    <button className="btn-secondary" style={{ padding: '0 16px' }}><Filter size={16} /></button>
                                </div>
                                <button className="btn-primary"><Plus size={18} /> {t('new_employee') || 'Yeni Personel Ekle'}</button>
                            </div>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>{t('personnel') || 'Personel'}</th>
                                        <th>{t('role_authority') || 'Rol ve Yetki'}</th>
                                        <th>{t('assigned_site') || 'Atanan Şantiye'}</th>
                                        <th>{t('last_activity') || 'Son Hareket'}</th>
                                        <th>{t('status') || 'Durum'}</th>
                                        <th>{t('action') || 'İşlem'}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { id: 1, name: 'Canberk Akkaya', role: 'Şantiye Şefi', site: 'Azure Villaları', status: 'Aktif', img: 'https://i.pravatar.cc/100?u=1' },
                                        { id: 2, name: 'Meltem Yılmaz', role: 'Mimar', site: 'Ofis', status: 'Aktif', img: 'https://i.pravatar.cc/100?u=2' },
                                        { id: 3, name: 'Selin Gürsoy', role: 'Muhasebe', site: 'Ofis', status: 'İzinde', img: 'https://i.pravatar.cc/100?u=4' },
                                        { id: 4, name: 'Ahmet Yılmaz', role: 'Formen', site: 'Koru Konutları', status: 'Aktif', img: 'https://i.pravatar.cc/100?u=5' },
                                    ].map((user, i) => (
                                        <tr key={user.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                    <img src={user.img} className="user-avatar" alt="" />
                                                    <div>
                                                        <div style={{ fontWeight: '800' }}>{user.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.name.toLowerCase().replace(' ', '.') + '@bayrechnung.com'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <select 
                                                    style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', outline: 'none' }}
                                                    defaultValue={user.role}
                                                >
                                                    <option>{user.role}</option>
                                                    <option>Admin</option>
                                                    <option>Şantiye Şefi</option>
                                                    <option>Mimar</option>
                                                    <option>Formen</option>
                                                    <option>Muhasebe</option>
                                                </select>
                                            </td>
                                            <td>
                                                <select 
                                                    style={{ background: 'rgba(255, 255, 255, 0.03)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', outline: 'none' }}
                                                    defaultValue={user.site}
                                                >
                                                    <option>{user.site}</option>
                                                    <option>Azure Villaları</option>
                                                    <option>Koru Konutları</option>
                                                    <option>Merkez Ofis</option>
                                                    <option>Marina Park</option>
                                                </select>
                                            </td>
                                            <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{i === 0 ? t('just_now') || 'Az önce' : t('hours_ago', { count: i + 1 }) || `${i+1}sa önce`}</td>
                                            <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: (user.status === 'Aktif' || user.status === 'Active') ? 'var(--success)' : 'var(--warning)', fontSize: '0.8rem', fontWeight: '800' }}>
                                                <div style={{ width: '6px', height: '6px', background: 'currentColor', borderRadius: '50%' }} />
                                                {user.status}
                                            </span></td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button className="btn-secondary" style={{ padding: '6px 10px' }}><SettingsIcon size={14} /></button>
                                                    <button className="btn-secondary" style={{ padding: '6px 10px', color: 'var(--danger)' }}><LogOut size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    )}

                    {/* ── REPORTS TAB ── */}
                    {activeTab === 'reports' && (
                        <motion.div 
                            key="reports"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="animate-fade"
                        >
                            <div className="stats-grid">
                                <motion.div whileHover={{ y: -5 }} className="stat-card" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', cursor: 'pointer' }}>
                                    <FileText size={24} color="var(--accent-primary)" style={{ marginBottom: 16 }} />
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: 4 }}>{t('daily_reports') || 'Günlük Raporlar'}</h4>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>24</div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Bugün iletilen saha logları</p>
                                </motion.div>
                                <motion.div whileHover={{ y: -5 }} className="stat-card" style={{ cursor: 'pointer' }}>
                                    <BarChart3 size={24} color="var(--success)" style={{ marginBottom: 16 }} />
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: 4 }}>{t('financial_reports') || 'Gelir-Gider Raporları'}</h4>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>%92</div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Bütçe sadakat oranı</p>
                                </motion.div>
                                <motion.div whileHover={{ y: -5 }} className="stat-card" style={{ cursor: 'pointer' }}>
                                    <Layers size={24} color="var(--warning)" style={{ marginBottom: 16 }} />
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: 4 }}>{t('stock_reports') || 'Stok Raporları'}</h4>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>7</div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tedarik bekleyen kritik kalemler</p>
                                </motion.div>
                                <motion.div whileHover={{ y: -5 }} className="stat-card" style={{ cursor: 'pointer' }}>
                                    <Activity size={24} color="var(--accent-secondary)" style={{ marginBottom: 16 }} />
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: 4 }}>{t('progress_reports') || 'İlerleme Raporları'}</h4>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>%68</div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Genel proje tamamlanma ort.</p>
                                </motion.div>
                            </div>

                            <div className="data-table-wrapper">
                                <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{t('recent_reports') || 'Son Yayınlanan Raporlar'}</h3>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}><Download size={14} /> PDF Dışa Aktar</button>
                                        <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>{t('view_all') || 'Tümünü Gör'}</button>
                                    </div>
                                </div>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>{t('report_name') || 'Rapor Adı'}</th>
                                            <th>{t('type') || 'Tür'}</th>
                                            <th>{t('date') || 'Tarih'}</th>
                                            <th>{t('author') || 'Hazırlayan'}</th>
                                            <th>{t('status') || 'Durum'}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { name: 'Azure Villaları Günlük Log', type: 'Saha Günlüğü', date: 'Bugün', author: 'Canberk A.', status: 'Onaylandı' },
                                            { name: 'Ekim Ayı Malzeme Stok Raporu', type: 'Stok Analizi', date: 'Dün', author: 'Selin G.', status: 'İncelemede' },
                                            { name: 'Merkez Ofis Gelir-Gider Özeti', type: 'Finansal Özet', date: '2 Gün Önce', author: 'Muhasebe', status: 'Onaylandı' },
                                        ].map((rpt, i) => (
                                            <tr key={i}>
                                                <td style={{ fontWeight: '700' }}>{rpt.name}</td>
                                                <td><span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.03)' }}>{rpt.type}</span></td>
                                                <td>{rpt.date}</td>
                                                <td>{rpt.author}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: (rpt.status === 'Onaylandı' || rpt.status === 'Approved') ? 'var(--success)' : 'var(--warning)', fontSize: '0.8rem', fontWeight: '700' }}>
                                                        <div style={{ width: '6px', height: '6px', background: 'currentColor', borderRadius: '50%' }} />
                                                        {rpt.status === 'Onaylandı' || rpt.status === 'Approved' ? 'Onaylandı' : 'Beklemede'}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {/* ── MESSAGES TAB ── */}
                    {activeTab === 'messages' && (
                        <motion.div 
                            key="messages"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="animate-fade"
                            style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 350px) 1fr', gap: '24px', height: 'calc(100vh - 280px)' }}
                        >
                            <div className="data-table-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>{t('notifications_messages') || 'Bildirimler ve Notlar'}</h3>
                                    <span style={{ background: 'var(--danger)', color: 'white', padding: '2px 8px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '800' }}>2</span>
                                </div>
                                <div style={{ flex: 1, overflowY: 'auto' }}>
                                    {[
                                        { user: 'Canberk Akkaya', role: 'Şantiye Şefi', msg: 'Azure projesi için beton mikseri gecikebilir.', time: '10dk önce', unread: true },
                                        { user: 'BayGuard AI', role: 'Sistem', msg: 'Kritik stok seviyesi: Demir (12mm) tükenmek üzere.', time: '1sa önce', unread: true },
                                        { user: 'Meltem Yılmaz', role: 'Mimar', msg: 'Yeni revize planlar sunucuya yüklendi.', time: '3sa önce', unread: false },
                                    ].map((m, i) => (
                                        <div key={i} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', background: m.unread ? 'rgba(99, 102, 241, 0.05)' : 'transparent', cursor: 'pointer', transition: 'background 0.2s' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ fontWeight: '800', fontSize: '0.85rem' }}>{m.user}</span>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{m.time}</span>
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: '700', marginBottom: '4px' }}>{m.role}</div>
                                            <p style={{ fontSize: '0.8rem', color: m.unread ? 'var(--text-primary)' : 'var(--text-secondary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {m.msg}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="data-table-wrapper" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.05), transparent)' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)' }}>
                                    <MessageSquare size={32} color="white" />
                                </div>
                                <h3 style={{ marginBottom: '8px', fontWeight: '900' }}>{t('send_admin_note') || 'Üst Yöneticiye Not Gönder'}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', marginBottom: '32px', fontWeight: '500' }}>
                                    Bu alandan doğrudan genel merkezdeki üst düzey yöneticilere rapor, not veya kritik önerilerinizi iletebilirsiniz.
                                </p>
                                <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <textarea 
                                        placeholder={t('write_message_placeholder') || 'Mesajınızı buraya yazın...'}
                                        style={{ width: '100%', minHeight: '150px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '20px', color: 'white', outline: 'none', resize: 'none', fontSize: '0.95rem', transition: 'border-color 0.2s' }}
                                        onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                                        onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Shield size={14} /> Güvenli ve şifreli iletişim
                                        </div>
                                        <button className="btn-primary" style={{ padding: '12px 32px' }}>
                                            {t('send') || 'Gönder'} <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    
                    {/* ── HEALTH TAB ── */}
                    {activeTab === 'health' && (
                        <motion.div 
                            key="health"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="animate-fade"
                        >
                           <div className="data-table-wrapper" style={{ background: 'white', padding: '24px', borderRadius: '24px' }}>
                                <SystemHealth />
                           </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default ConstructionAdminPanel;
