import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Users, BarChart3, PieChart, Briefcase, MessageSquare, 
    Bell, Search, Plus, List, Filter, Download, 
    TrendingUp, TrendingDown, DollarSign, Calendar,
    ChevronRight, MoreVertical, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInvoice } from '../../context/InvoiceContext';

const ConstructionAdminPanel = () => {
    const { currentUser } = useAuth();
    const { companyProfile } = useInvoice();
    const [activeTab, setActiveTab] = useState('finance');
    const [users, setUsers] = useState([
        { id: 1, name: 'Canberk Akkaya', email: 'canberk@firma.com', role: 'Şantiye Şefi', project: 'Azure Villaları', lastSeen: '2 dk önce', avatar: 'https://i.pravatar.cc/100?u=1' },
        { id: 2, name: 'Meltem Yılmaz', email: 'meltem@firma.com', role: 'Mimar', project: 'Skyline Residences', lastSeen: '1 saat önce', avatar: 'https://i.pravatar.cc/100?u=2' },
        { id: 3, name: 'Ahmet Aras', email: 'ahmet@firma.com', role: 'Saha Mühendisi', project: 'Genel Yönetim', lastSeen: 'Bugün', avatar: 'https://i.pravatar.cc/100?u=3' },
        { id: 4, name: 'Selin Gürsoy', email: 'selin@firma.com', role: 'Muhasebe', project: 'Tüm Şantiyeler', lastSeen: 'Dün', avatar: 'https://i.pravatar.cc/100?u=4' },
    ]);

    const deleteUser = (id) => {
        if (window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    const addUser = () => {
        const name = prompt('Ad Soyad:');
        if (!name) return;
        const role = prompt('Rol:');
        const newUser = {
            id: Date.now(),
            name,
            email: name.toLowerCase().replace(' ', '.') + '@firma.com',
            role: role || 'Çalışan',
            project: 'Atanmadı',
            lastSeen: 'Yeni',
            avatar: `https://i.pravatar.cc/100?u=${Date.now()}`
        };
        setUsers([...users, newUser]);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0c', color: '#fff', fontFamily: '"Inter", sans-serif', display: 'flex' }}>
            {/* Sidebar */}
            <div style={{ width: '280px', borderRight: '1px solid #1f1f23', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Briefcase size={22} color="white" />
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: '900', letterSpacing: '-0.02em' }}>{companyProfile?.companyName || 'BayConstruct'}</span>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                        { id: 'finance', label: 'Finans Dashboard', icon: BarChart3 },
                        { id: 'projects', label: 'Şantiyeler', icon: Briefcase },
                        { id: 'users', label: 'Kullanıcı Yönetimi', icon: Users },
                        { id: 'reports', label: 'Raporlar', icon: PieChart },
                        { id: 'messages', label: 'Mesajlar', icon: MessageSquare },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '14px', border: 'none',
                                background: activeTab === item.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                color: activeTab === item.id ? '#818cf8' : '#6b7280',
                                cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', fontWeight: '700', fontSize: '0.9rem'
                            }}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div style={{ marginTop: 'auto', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid #1f1f23' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '8px', fontWeight: '600' }}>HOŞGELDİNİZ</div>
                    <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>{currentUser?.displayName || currentUser?.email?.split('@')[0]}</div>
                    <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '4px', fontWeight: '700' }}>Admin Yetkisi • Aktif</div>
                </div>
            </div>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '48px', overflowY: 'auto' }}>
                {/* Header */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '8px' }}>
                            {activeTab === 'finance' && 'Mali Durum Paneli'}
                            {activeTab === 'projects' && 'Şantiye & İş Akışı'}
                            {activeTab === 'users' && 'Kullanıcı Yönetimi'}
                            {activeTab === 'reports' && 'Raporlar ve Analiz'}
                            {activeTab === 'messages' && 'Mesajlar & Bildirimler'}
                        </h1>
                        <p style={{ color: '#6b7280', fontSize: '1rem', fontWeight: '500' }}>Tüm süreçleri tek bir merkezden kontrol edin.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ background: '#131316', padding: '12px 20px', borderRadius: '16px', border: '1px solid #1f1f23', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '300px' }}>
                            <Search size={18} color="#6b7280" />
                            <input placeholder="Hızlı arama..." style={{ background: 'none', border: 'none', color: '#fff', width: '100%', outline: 'none', fontWeight: '600' }} />
                        </div>
                        <button style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid #1f1f23', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', position: 'relative' }}>
                            <Bell size={20} />
                            <div style={{ position: 'absolute', top: '12px', right: '12px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid #0a0a0c' }} />
                        </button>
                    </div>
                </header>

                {/* ── FINANCE DASHBOARD ── */}
                {activeTab === 'finance' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                            {[
                                { label: 'Toplam Gelir', value: '₺1.450.780', trend: '+12.5%', color: '#10b981', icon: TrendingUp },
                                { label: 'Toplam Gideler', value: '₺890.450', trend: '+4.8%', color: '#f59e0b', icon: TrendingDown },
                                { label: 'Net Kar', value: '₺560.330', trend: '+15.2%', color: '#818cf8', icon: DollarSign },
                                { label: 'Toplam Borç', value: '₺120.000', trend: '-2.1%', color: '#ef4444', icon: AlertCircle },
                            ].map((stat, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, y: 20 }} 
                                    whileInView={{ opacity: 1, y: 0 }} 
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '24px', border: '1px solid #1f1f23' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                                            <stat.icon size={20} />
                                        </div>
                                        <div style={{ padding: '4px 10px', borderRadius: '100px', background: `${stat.color}15`, color: stat.color, fontSize: '0.75rem', fontWeight: '800' }}>{stat.trend}</div>
                                    </div>
                                    <div style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>{stat.label}</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.02em' }}>{stat.value}</div>
                                </motion.div>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '32px', borderRadius: '24px', border: '1px solid #1f1f23', minHeight: '400px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Nakit Akışı (Aylık)</h3>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {['Haftalık', 'Aylık', 'Yıllık'].map((t, i) => <button key={i} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: i === 1 ? '#818cf8' : 'rgba(255,255,255,0.05)', color: i === 1 ? '#fff' : '#6b7280', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}>{t}</button>)}
                                    </div>
                                </div>
                                <div style={{ height: '280px', width: '100%', display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
                                    {[40, 60, 45, 90, 65, 80, 55, 70, 85, 95, 75, 100].map((h, i) => (
                                        <div key={i} style={{ flex: 1, height: `${h}%`, background: 'linear-gradient(to top, #818cf8, #a855f7)', borderRadius: '6px 6px 2px 2px', opacity: 0.8 }} />
                                    ))}
                                </div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '32px', borderRadius: '24px', border: '1px solid #1f1f23' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '24px' }}>Şantiye Dağılımı</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {[
                                        { name: 'Villa Projesi A', value: 45, color: '#818cf8' },
                                        { name: 'Konut Kompleksi B', value: 30, color: '#a855f7' },
                                        { name: 'Ticari Alan C', value: 15, color: '#10b981' },
                                        { name: 'Altyapı D', value: 10, color: '#f59e0b' },
                                    ].map((p, i) => (
                                        <div key={i}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                                                <span style={{ color: '#6b7280', fontWeight: '600' }}>{p.name}</span>
                                                <span style={{ fontWeight: '800' }}>%{p.value}</span>
                                            </div>
                                            <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${p.value}%`, background: p.color }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── PROJECTS PANEL ── */}
                {activeTab === 'projects' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                        {[
                            { name: 'Azure Villaları', status: 'Devam Ediyor', progress: 78, team: 12, budget: '₺1.2M' },
                            { name: 'Skyline Residences', status: 'Planlama', progress: 12, team: 4, budget: '₺4.5M' },
                            { name: 'Merkez İş Merkezi', status: 'Bitti', progress: 100, team: 20, budget: '₺8.2M' },
                            { name: 'Altyapı Modernizasyonu', status: 'Devam Ediyor', progress: 34, team: 8, budget: '₺650K' },
                        ].map((proj, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ opacity: 0, scale: 0.95 }} 
                                whileInView={{ opacity: 1, scale: 1 }} 
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '24px', border: '1px solid #1f1f23' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <div style={{ padding: '6px 12px', borderRadius: '100px', background: proj.status === 'Bitti' ? '#10b98120' : '#818cf820', color: proj.status === 'Bitti' ? '#10b981' : '#818cf8', fontSize: '0.7rem', fontWeight: '800' }}>{proj.status}</div>
                                    <MoreVertical size={18} color="#6b7280" style={{ cursor: 'pointer' }} />
                                </div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '4px' }}>{proj.name}</h3>
                                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '24px' }}>{proj.team} Kişilik Ekip • {proj.budget}</p>
                                
                                <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700' }}>
                                    <span>İlerleme</span>
                                    <span style={{ color: '#818cf8' }}>%{proj.progress}</span>
                                </div>
                                <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${proj.progress}%` }} transition={{ duration: 1 }} style={{ height: '100%', background: 'linear-gradient(90deg, #818cf8, #a855f7)' }} />
                                </div>

                                <button style={{ width: '100%', marginTop: '24px', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>
                                    Detayları Görüntüle
                                </button>
                            </motion.div>
                        ))}
                        <button style={{ background: 'transparent', border: '2px dashed #1f1f23', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer', minHeight: '260px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1f1f23', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                                <Plus size={24} />
                            </div>
                            <span style={{ fontWeight: '700', color: '#6b7280' }}>Yeni Şantiye Ekle</span>
                        </button>
                    </div>
                )}

                {/* ── USERS PANEL ── */}
                {activeTab === 'users' && (
                    <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid #1f1f23', overflow: 'hidden' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #1f1f23', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button style={{ padding: '10px 20px', borderRadius: '12px', background: '#1f1f23', border: 'none', color: '#fff', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Filter size={16} /> Filtrele</button>
                                <button style={{ padding: '10px 20px', borderRadius: '12px', background: '#1f1f23', border: 'none', color: '#fff', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}><List size={16} /> Görünüm</button>
                            </div>
                            <button 
                                onClick={addUser}
                                style={{ padding: '10px 24px', borderRadius: '12px', background: '#818cf8', border: 'none', color: 'white', fontWeight: '800', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                            >
                                <Plus size={18} /> Kullanıcı Ekle
                            </button>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #1f1f23' }}>
                                    <th style={{ padding: '20px 24px', color: '#6b7280', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Çalışan / Kullanıcı</th>
                                    <th style={{ padding: '20px', color: '#6b7280', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Rol</th>
                                    <th style={{ padding: '20px', color: '#6b7280', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Atanan Şantiye</th>
                                    <th style={{ padding: '20px', color: '#6b7280', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Son Görülme</th>
                                    <th style={{ padding: '20px', color: '#6b7280', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, i) => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid #1f1f23', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <img src={user.avatar} style={{ width: '40px', height: '40px', borderRadius: '12px' }} alt="" />
                                                <div>
                                                    <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>{user.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px' }}>
                                            <div style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', fontSize: '0.75rem', fontWeight: '700' }}>{user.role}</div>
                                        </td>
                                        <td style={{ padding: '20px', fontWeight: '600', fontSize: '0.85rem' }}>{user.project}</td>
                                        <td style={{ padding: '20px', color: '#6b7280', fontSize: '0.85rem' }}>{user.lastSeen}</td>
                                        <td style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <button style={{ color: '#818cf8', background: 'none', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>Yönet</button>
                                                <button onClick={() => deleteUser(user.id)} style={{ color: '#ef4444', background: 'none', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>Sil</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── REPORTS PANEL ── */}
                {activeTab === 'reports' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                            {[
                                { title: 'Günlük Raporlar', count: 12, icon: Calendar, color: '#818cf8' },
                                { title: 'Mali Raporlar', count: 4, icon: DollarSign, color: '#10b981' },
                                { title: 'Stok Durumu', count: 8, icon: List, icon: Filter, color: '#f59e0b' },
                                { title: 'İlerleme Analizi', count: 5, icon: TrendingUp, color: '#ef4444' },
                            ].map((cat, i) => (
                                <div key={i} style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid #1f1f23', textAlign: 'center' }}>
                                    <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: `${cat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: cat.color }}>
                                        <cat.icon size={24} />
                                    </div>
                                    <h4 style={{ fontWeight: '800', marginBottom: '4px' }}>{cat.title}</h4>
                                    <div style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: '600' }}>{cat.count} Aktif Rapor</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '32px', borderRadius: '24px', border: '1px solid #1f1f23' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '900' }}>Son Oluşturulan Raporlar</h3>
                                <button style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818cf8', background: 'none', border: 'none', fontWeight: '800', cursor: 'pointer' }}><Download size={18} /> Tümünü İndir</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[
                                    { name: 'Ocak 2025 Hakediş Raporu', date: '01.02.2025', size: '2.4 MB', type: 'PDF' },
                                    { name: 'Azure Villaları Günlük Şantiye Defteri', date: 'Bugün', size: '156 KB', type: 'DOCX' },
                                    { name: 'Q1 Kar-Zarar Tahmin Analizi', date: '30.01.2025', size: '1.1 MB', type: 'XLSX' },
                                ].map((rep, i) => (
                                    <div key={i} style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid #1f1f23', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '10px', color: '#818cf8' }}><PieChart size={18} /></div>
                                            <div>
                                                <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>{rep.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px' }}>{rep.date} • {rep.size}</div>
                                            </div>
                                        </div>
                                        <button style={{ padding: '8px 16px', borderRadius: '8px', background: '#1f1f23', border: 'none', color: '#fff', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>Görüntüle</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── MESSAGES PANEL ── */}
                {activeTab === 'messages' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', height: '600px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid #1f1f23', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '24px', borderBottom: '1px solid #1f1f23' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Sohbetler</h3>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                                {[
                                    { name: 'Canberk Akkaya', lastMsg: 'Beton dökümü tamamlandı...', time: '14:20', unread: 2 },
                                    { name: 'Meltem Yılmaz', lastMsg: 'Planlarda revize yapıldı.', time: '10:05', unread: 0 },
                                    { name: 'Ahmet Aras', lastMsg: 'Yarınki ekip listesi ekte.', time: 'Dün', unread: 0 },
                                ].map((chat, i) => (
                                    <div key={i} style={{ padding: '16px', borderRadius: '16px', background: i === 0 ? 'rgba(99, 102, 241, 0.1)' : 'transparent', marginBottom: '4px', cursor: 'pointer' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>{chat.name}</span>
                                            <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>{chat.time}</span>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', justifyContent: 'space-between' }}>
                                            {chat.lastMsg}
                                            {chat.unread > 0 && <div style={{ background: '#818cf8', color: 'white', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>{chat.unread}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid #1f1f23', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '24px', borderBottom: '1px solid #1f1f23', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>CA</div>
                                    <div>
                                        <div style={{ fontWeight: '800' }}>Canberk Akkaya</div>
                                        <div style={{ fontSize: '0.75rem', color: '#10b981' }}>Çevrimiçi</div>
                                    </div>
                                </div>
                                <button style={{ color: '#6b7280', background: 'none', border: 'none' }}><MoreVertical size={20} /></button>
                            </div>
                            <div style={{ flex: 1, padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
                                <div style={{ alignSelf: 'flex-start', maxWidth: '70%', padding: '16px', background: '#131316', borderRadius: '16px 16px 16px 4px', fontSize: '0.9rem', lineHeight: 1.5, border: '1px solid #1f1f23' }}>
                                    Merhabalar Ömer Bey, Azure Villaları projesinde blok-A beton dökümü sorunsuz tamamlandı.
                                </div>
                                <div style={{ alignSelf: 'flex-end', maxWidth: '70%', padding: '16px', background: '#818cf8', borderRadius: '16px 16px 4px 16px', fontSize: '0.9rem', lineHeight: 1.5, fontWeight: '500' }}>
                                    Harika haber Canberk. Ekibin eline sağlık. Bir sonraki aşama için ekipman hazır mı?
                                </div>
                            </div>
                            <div style={{ padding: '24px', borderTop: '1px solid #1f1f23', display: 'flex', gap: '12px' }}>
                                <input placeholder="Mesajınızı yazın..." style={{ flex: 1, background: '#131316', border: '1px solid #1f1f23', borderRadius: '12px', padding: '0 20px', color: '#fff', outline: 'none' }} />
                                <button style={{ padding: '12px 24px', borderRadius: '12px', background: '#818cf8', border: 'none', color: 'white', fontWeight: '800' }}>Gönder</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ConstructionAdminPanel;
