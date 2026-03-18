import React, { useState } from 'react';
import { 
    Users, 
    HardHat, 
    BarChart3, 
    PieChart as PieChartIcon, 
    LayoutDashboard, 
    MessageSquare, 
    Bell, 
    ChevronRight, 
    Plus, 
    ArrowUpRight, 
    ArrowDownRight, 
    Zap, 
    CheckCircle2, 
    Clock, 
    AlertTriangle, 
    Building2,
    Briefcase,
    Calendar,
    Settings,
    Search
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6'];

const ConstructionAdminCockpit = () => {
    const [activeTab, setActiveTab] = useState('overview');

    // Mock Data for Construction Firma
    const worksites = [
        { name: 'Riviera Residence', progress: 75, status: 'On Track', manager: 'Ahmet Y.', budget: '€2.4M' },
        { name: 'Skyline Plaza', progress: 40, status: 'Delayed', manager: 'Mehmet K.', budget: '€5.8M' },
        { name: 'Oksijen Villaları', progress: 95, status: 'Near Completion', manager: 'Zeynep S.', budget: '€1.2M' },
        { name: 'Şehir Hastanesi Ek Blok', progress: 15, status: 'On Track', manager: 'Caner D.', budget: '€12.5M' }
    ];

    const financeData = [
        { name: 'Oca', revenue: 400000, expense: 240000 },
        { name: 'Şub', revenue: 300000, expense: 139800 },
        { name: 'Mar', revenue: 200000, expense: 980000 }, // High expense month
        { name: 'Nis', revenue: 278000, expense: 390800 },
        { name: 'May', revenue: 189000, expense: 480000 },
        { name: 'Haz', revenue: 239000, expense: 380000 },
        { name: 'Tem', revenue: 349000, expense: 430000 },
    ];

    const roleDistribution = [
        { name: 'Mimar/Mühendis', value: 12 },
        { name: 'Saha Personeli', value: 85 },
        { name: 'Yönetim', value: 8 },
        { name: 'Taşeron', value: 45 }
    ];

    const stats = [
        { label: 'Aktif Şantiyeler', value: '4', change: '+1', icon: Building2, color: 'indigo' },
        { label: 'Toplam Çalışan', value: '150+', change: '+12', icon: Users, color: 'emerald' },
        { label: 'Aylık Hakediş', value: '€1.2M', change: '-5.2%', icon: BarChart3, color: 'amber' },
        { label: 'Acil Görevler', value: '3', change: 'Kritik', icon: AlertTriangle, color: 'rose' }
    ];

    return (
        <div className="p-8 bg-[var(--bg-body)] min-h-screen font-sans transition-colors duration-300">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight flex items-center gap-3">
                        <span className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                            <LayoutDashboard size={24} />
                        </span>
                        Admin Dashboard
                    </h1>
                    <p className="text-[var(--text-muted)] font-medium mt-1">İşveren / Firma Genel Bakış Paneli</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                        <input 
                            placeholder="Şantiye, çalışan veya rapor ara..." 
                            className="bg-[var(--bg-card)] border border-[var(--border)] py-3 pl-10 pr-6 rounded-2xl text-sm w-80 focus:ring-2 focus:ring-indigo-500 transition-all outline-none shadow-sm text-[var(--text-main)]"
                        />
                    </div>
                    <button className="p-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-sm text-[var(--text-main)] relative hover:bg-[var(--bg-body)] transition-all">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[var(--bg-card)]"></span>
                    </button>
                    <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 border-none">
                        <Plus size={18} /> Yeni Proje
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {stats.map((s, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border)] shadow-sm hover:shadow-xl hover:shadow-[var(--shadow-color)] transition-all group"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div className={`p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 group-hover:scale-110 transition-transform`}>
                                <s.icon size={20} />
                            </div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase ${s.change.includes('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                {s.change}
                            </span>
                        </div>
                        <h3 className="text-2xl font-black text-[var(--text-main)]">{s.value}</h3>
                        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">{s.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Main Progress & Workflows */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Şantiye İlerleme Listesi */}
                    <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border)] shadow-xl shadow-[var(--shadow-color)] p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-black text-[var(--text-main)] tracking-tight flex items-center gap-2">
                                <Building2 size={24} className="text-indigo-600" />
                                Şantiye & İş Akışı
                            </h2>
                            <button className="text-xs font-black text-indigo-600 uppercase tracking-widest border-none bg-transparent">Tümünü Yönet</button>
                        </div>

                        <div className="space-y-6">
                            {worksites.map((site, i) => (
                                <div key={i} className="group cursor-pointer">
                                    <div className="flex justify-between items-center mb-3">
                                        <div>
                                            <h4 className="font-black text-[var(--text-main)] group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{site.name}</h4>
                                            <p className="text-[10px] text-[var(--text-muted)] font-bold tracking-widest uppercase">Yönetici: {site.manager}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase ${site.status === 'Delayed' ? 'bg-rose-500/10 text-rose-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                                                {site.status}
                                            </span>
                                            <p className="text-xs font-black text-[var(--text-main)] mt-1">{site.budget}</p>
                                        </div>
                                    </div>
                                    <div className="h-3 bg-[var(--bg-body)] rounded-full overflow-hidden p-0.5 border border-[var(--border-subtle)]">
                                        <div 
                                            className={`h-full rounded-full ${site.status === 'Delayed' ? 'bg-rose-500' : 'bg-indigo-600'} transition-all duration-1000`}
                                            style={{ width: `${site.progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">İlerleme: %{site.progress}</span>
                                        <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">Vade: 12 Haz 2024</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Finansal Analiz Grafiği */}
                    <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border)] shadow-xl shadow-[var(--shadow-color)] p-8">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-xl font-black text-[var(--text-main)] tracking-tight">Finansal Dashboard</h2>
                                <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest mt-1">Gelir vs Gider Analizi</p>
                            </div>
                            <select className="bg-[var(--bg-body)] border border-[var(--border)] text-[var(--text-main)] text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl outline-none">
                                <option>Son 6 Ay</option>
                                <option>Yıllık</option>
                            </select>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={financeData}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 10}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 10}} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-main)' }} />
                                    <Area type="monotone" dataKey="revenue" name="Gelir" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                    <Area type="monotone" dataKey="expense" name="Gider" stroke="#F43F5E" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Right: User Management & Notifications */}
                <div className="space-y-8">
                    {/* Ekip / Kullanıcı Yönetimi */}
                    <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border)] shadow-xl shadow-[var(--shadow-color)] p-8">
                        <h2 className="text-sm font-black text-[var(--text-main)] uppercase tracking-widest mb-6 px-1">Ekip Dağılımı</h2>
                        <div className="h-[200px] mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={roleDistribution}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {roleDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-main)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-3">
                            {roleDistribution.map((role, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-[var(--bg-body)] rounded-2xl border border-[var(--border-subtle)]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></div>
                                        <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase transition-all">{role.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-[var(--text-main)]">{role.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mesajlar / Bildirimler */}
                    <div className="rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden ring-1 ring-white/10 text-white" style={{ backgroundColor: 'var(--cockpit-sidebar)', color: 'var(--cockpit-text-main)' }}>
                        <div className="relative z-10">
                            <h2 className="text-sm font-black text-indigo-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <MessageSquare size={16} />
                                İç İletişim & Notlar
                            </h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500 overflow-hidden text-[10px] flex items-center justify-center font-black">MY</div>
                                        <span className="text-[11px] font-black">Mustafa Yılmaz (Saha Şefi)</span>
                                    </div>
                                    <p className="text-xs text-slate-300 font-medium leading-relaxed italic">"Skyline Plaza projesinde beton dökümü sırasında pompa arızası oluştu, vadesinde gecikme olabilir."</p>
                                    <span className="text-[9px] text-white/30 font-bold mt-3 block uppercase tracking-widest">10 Dakika Önce</span>
                                </div>

                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500 overflow-hidden text-[10px] flex items-center justify-center font-black">ES</div>
                                        <span className="text-[11px] font-black">Elif Sencer (Tedarik)</span>
                                    </div>
                                    <p className="text-xs text-slate-300 font-medium leading-relaxed italic">"Haftalık malzeme siparişleri onay bekliyor!"</p>
                                    <span className="text-[9px] text-white/30 font-bold mt-3 block uppercase tracking-widest">1 Saat Önce</span>
                                </div>
                            </div>

                            <button className="w-full mt-6 py-4 bg-white text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-black/20 border-none">
                                Tüm Mesajları Aç <Plus size={14} />
                            </button>
                        </div>
                        {/* Abstract blobs */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-[60px]"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-600/10 rounded-full blur-[60px]"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConstructionAdminCockpit;
