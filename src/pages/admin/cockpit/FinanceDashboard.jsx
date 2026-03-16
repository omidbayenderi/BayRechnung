import { useMemo } from 'react';
import {
    TrendingUp, TrendingDown, Activity, CreditCard,
    ArrowUpRight, ArrowDownRight, MoreHorizontal,
    Target, Zap, Wallet, Receipt,
    LayoutDashboard
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useInvoice } from '../../../context/InvoiceContext';
import { motion } from 'framer-motion';

const MONTH_NAMES = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

const FinanceDashboard = () => {
    const { invoices, expenses, companyProfile } = useInvoice();
    const currency = companyProfile?.defaultCurrency || 'EUR';
    const fmt = (n) => new Intl.NumberFormat('de-DE', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);

    const stats = useMemo(() => {
        const paidRevenue = invoices
            .filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
        const pendingRevenue = invoices
            .filter(inv => inv.status === 'pending' || inv.status === 'sent')
            .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        const netProfit = paidRevenue - totalExpenses;
        const margin = paidRevenue > 0 ? (netProfit / paidRevenue) * 100 : 0;
        return { paidRevenue, pendingRevenue, totalExpenses, netProfit, margin };
    }, [invoices, expenses]);

    const chartData = useMemo(() => {
        const now = new Date();
        const months = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - 6 + i, 1);
            return { year: d.getFullYear(), month: d.getMonth(), name: MONTH_NAMES[d.getMonth()], gelir: 0, gider: 0 };
        });
        invoices.filter(inv => inv.status === 'paid').forEach(inv => {
            const d = new Date(inv.date || inv.createdAt);
            const idx = months.findIndex(m => m.year === d.getFullYear() && m.month === d.getMonth());
            if (idx > -1) months[idx].gelir += Number(inv.total) || 0;
        });
        expenses.forEach(exp => {
            const d = new Date(exp.date || exp.createdAt);
            const idx = months.findIndex(m => m.year === d.getFullYear() && m.month === d.getMonth());
            if (idx > -1) months[idx].gider += Number(exp.amount) || 0;
        });
        return months.map(m => ({ name: m.name, gelir: Math.round(m.gelir), gider: Math.round(m.gider) }));
    }, [invoices, expenses]);

    const recentInvoices = useMemo(() =>
        invoices
            .filter(inv => inv.status === 'pending' || inv.status === 'sent')
            .sort((a, b) => new Date(b.dueDate || b.date) - new Date(a.dueDate || a.date))
            .slice(0, 5),
        [invoices]
    );

    return (
        <div className="space-y-10 pb-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 cockpit-gradient-primary rounded-lg flex items-center justify-center text-white shadow-lg">
                            <LayoutDashboard size={18} />
                        </div>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Finans Paneli</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mali Durum Özeti</h1>
                    <p className="text-slate-500 font-medium">Firma genel mali sağlığı ve nakit akışı analizi</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center gap-2">
                        <TrendingDown size={14} className="text-slate-400" />
                        Gider Gir
                    </button>
                    <button className="px-6 py-3 cockpit-gradient-primary text-white rounded-2xl text-xs font-bold shadow-xl shadow-indigo-100/50 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
                        <TrendingUp size={14} />
                        Fatura Oluştur
                    </button>
                </div>
            </header>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard 
                    title="Tahsil Edilen" 
                    value={fmt(stats.paidRevenue)} 
                    sub={`${invoices.filter(i => i.status === 'paid').length} Fatura`} 
                    icon={TrendingUp} 
                    color="#4F46E5" 
                    trend="+12%" 
                    positive 
                />
                <MetricCard 
                    title="Toplam Gider" 
                    value={fmt(stats.totalExpenses)} 
                    sub={`${expenses.length} Kayıt`} 
                    icon={TrendingDown} 
                    color="#F43F5E" 
                    trend="-2%" 
                    positive={false} 
                />
                <MetricCard 
                    title="Net Kâr" 
                    value={fmt(stats.netProfit)} 
                    sub={`%${stats.margin.toFixed(1)} Marj`} 
                    icon={Zap} 
                    color="#10B981" 
                    trend="+4.5%" 
                    positive={stats.netProfit >= 0} 
                />
                <MetricCard 
                    title="Bekleyen Alacak" 
                    value={fmt(stats.pendingRevenue)} 
                    sub={`${invoices.filter(i => i.status === 'pending' || i.status === 'sent').length} Fatura`} 
                    icon={Wallet} 
                    color="#F59E0B" 
                    trend="Kritik" 
                    positive={false} 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Gelir & Gider Karşılaştırması</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Son 7 Aylık Veri</p>
                        </div>
                        <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-100 shrink-0">
                            {['Aylık', 'Haftalık'].map(t => (
                                <button key={t} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${t === 'Aylık' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorGelir" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorGider" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.05} />
                                        <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }} 
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }} 
                                />
                                <Tooltip
                                    content={<CustomTooltip currency={currency} fmt={fmt} />}
                                    cursor={{ stroke: '#4F46E5', strokeWidth: 1, strokeDasharray: '5 5' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="gelir" 
                                    name="Tahsilat" 
                                    stroke="#4F46E5" 
                                    strokeWidth={4} 
                                    fillOpacity={1} 
                                    fill="url(#colorGelir)" 
                                    animationDuration={2000}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="gider" 
                                    name="Giderler" 
                                    stroke="#F43F5E" 
                                    strokeWidth={3} 
                                    strokeDasharray="8 5" 
                                    fillOpacity={1} 
                                    fill="url(#colorGider)" 
                                    animationDuration={2500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Column: Goal & Pending */}
                <div className="space-y-8">
                    {/* Goal Progress */}
                    <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-white/10 rounded-2xl">
                                    <Target size={24} className="text-indigo-400" />
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Aylık Tahsilat Hedefi</p>
                                    <p className="text-sm font-black text-white mt-1">€125.000 / €200.000</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-4 bg-white/10 rounded-full overflow-hidden p-1 shadow-inner">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: '62.5%' }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full shadow-lg shadow-indigo-500/50"
                                    ></motion.div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className="text-[11px] text-white/50 font-bold leading-tight">Geçen aya göre %18 daha hızlı ilerliyorsunuz.</p>
                                    <span className="text-2xl font-black text-white">%62.5</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[60px]"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-[80px]"></div>
                    </div>

                    {/* Pending Invoices */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/30 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Bekleyen Ödemeler</h3>
                            <button className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">Tümünü Gör</button>
                        </div>
                        {recentInvoices.length === 0 ? (
                            <div className="py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                <Receipt size={24} className="text-slate-300 mx-auto mb-2" />
                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Kayıt Bulunamadı</p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {recentInvoices.map(inv => (
                                    <PendingItem
                                        key={inv.id}
                                        title={inv.recipientName || 'İsimsiz Müşteri'}
                                        amount={fmt(inv.total || 0)}
                                        date={inv.dueDate || inv.date}
                                        isCritical={inv.dueDate && new Date(inv.dueDate) < new Date()}
                                    />
                                ))}
                            </div>
                        )}
                        <button className="w-full mt-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black text-slate-500 hover:bg-slate-100 transition-all uppercase tracking-widest">
                            Finansal Rapor Al
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, sub, icon: Icon, color, trend, positive }) => (
    <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50 group hover:-translate-y-1 transition-all duration-300">
        <div className="flex justify-between items-start mb-6">
            <div className="p-3.5 rounded-2xl transition-transform group-hover:scale-110" style={{ backgroundColor: `${color}12`, color: color }}>
                <Icon size={22} />
            </div>
            {trend && (
                <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                    {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {trend}
                </div>
            )}
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{title}</p>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h2>
            {sub && <p className="text-[11px] text-slate-400 font-bold mt-1 opacity-60">{sub}</p>}
        </div>
    </div>
);

const PendingItem = ({ title, amount, date, isCritical }) => (
    <div className="flex justify-between items-center group cursor-pointer">
        <div className="flex items-center gap-4">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isCritical ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] animate-pulse' : 'bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]'}`}></div>
            <div>
                <p className="text-xs font-black text-slate-800 truncate max-w-[140px] group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{title}</p>
                {date && <p className="text-[10px] text-slate-400 font-bold mt-0.5">{new Date(date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>}
            </div>
        </div>
        <div className="text-sm font-black text-slate-900 shrink-0">{amount}</div>
    </div>
);

const CustomTooltip = ({ active, payload, label, fmt }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 shadow-2xl rounded-2xl p-4 border border-white/10 text-white min-w-[160px] animate-in fade-in zoom-in duration-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-white/5">{label} Analizi</p>
                <div className="space-y-2">
                    {payload.map((entry, index) => (
                        <div key={index} className="flex justify-between items-center gap-6">
                            <span className="flex items-center gap-2 text-[11px] font-bold">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                {entry.name}
                            </span>
                            <span className="text-xs font-black">{fmt(entry.value)}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export default FinanceDashboard;

