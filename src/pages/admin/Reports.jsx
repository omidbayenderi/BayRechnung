import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useInvoice } from '../../context/InvoiceContext';
import { useNotification } from '../../context/NotificationContext';
import { motion } from 'framer-motion';
import {
    FileText,
    TrendingUp,
    Package,
    BarChart2,
    Download,
    Filter,
    Calendar,
    Printer,
    Search,
    ChevronRight,
    FileType,
    TrendingDown,
    Receipt,
    AlertCircle,
    Activity,
    RotateCw,
    LayoutPanelLeft
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import TimelineGantt from '../../components/admin/TimelineGantt';
import './Reports.css';

const ReportCard = ({ title, date, size, type, author }) => (
    <div className="report-item-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="report-type-icon" style={{
                background: type === 'PDF' ? '#fee2e2' : type === 'REP' ? '#dcfce7' : '#e0e7ff',
                color: type === 'PDF' ? '#ef4444' : type === 'REP' ? '#10b981' : '#4f46e5',
            }}>
                {type}
            </div>
            <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>{title}</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                    <span>{date}</span>
                    <span style={{ opacity: 0.5 }}>•</span>
                    <span>{size}</span>
                    <span style={{ opacity: 0.5 }}>•</span>
                    <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{author}</span>
                </div>
            </div>
        </div>
        <button className="icon-btn-premium">
            <Download size={18} />
        </button>
    </div>
);

const Reports = () => {
    // ... existing state and hooks
    const { t } = useLanguage();
    const { showNotification } = useNotification();
    const {
        invoices: contextInvoices,
        expenses: contextExpenses,
        companyProfile,
        dailyReports,
        employees,
        fetchFinancialDataByRange
    } = useInvoice();

    const [activeTab, setActiveTab] = useState('daily');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState('thisMonth');
    const [extraData, setExtraData] = useState({ invoices: [], expenses: [] });
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        const handleRangeFetch = async () => {
            if (dateRange === 'allTime' || !fetchFinancialDataByRange) return;
            const now = new Date();
            let start = new Date(0);
            let end = new Date();
            if (dateRange === 'thisMonth') start = new Date(now.getFullYear(), now.getMonth(), 1);
            else if (dateRange === 'lastMonth') {
                start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
            } else if (dateRange === 'thisYear') start = new Date(now.getFullYear(), 0, 1);
            setIsFetching(true);
            const data = await fetchFinancialDataByRange(start.toISOString(), end.toISOString());
            if (data) setExtraData(data);
            setIsFetching(false);
        };
        handleRangeFetch();
    }, [dateRange, fetchFinancialDataByRange]);

    const combinedInvoices = useMemo(() => {
        const seen = new Set(contextInvoices.map(i => i.id));
        return [...contextInvoices, ...extraData.invoices.filter(i => !seen.has(i.id))];
    }, [contextInvoices, extraData.invoices]);

    const combinedExpenses = useMemo(() => {
        const seen = new Set(contextExpenses.map(e => e.id));
        return [...contextExpenses, ...extraData.expenses.filter(e => !seen.has(e.id))];
    }, [contextExpenses, extraData.expenses]);

    const { filteredInvoices, filteredExpenses } = useMemo(() => {
        const now = new Date();
        let start = new Date(0);
        let end = new Date();
        if (dateRange === 'thisMonth') start = new Date(now.getFullYear(), now.getMonth(), 1);
        else if (dateRange === 'lastMonth') {
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        } else if (dateRange === 'thisYear') start = new Date(now.getFullYear(), 0, 1);
        const fInvoices = combinedInvoices.filter(inv => {
            const d = new Date(inv.date);
            return d >= start && d <= end;
        });
        const fExpenses = combinedExpenses.filter(exp => {
            const d = new Date(exp.date || exp.created_at);
            return d >= start && d <= end;
        });
        return { filteredInvoices: fInvoices, filteredExpenses: fExpenses };
    }, [combinedInvoices, combinedExpenses, dateRange]);

    const financialMetrics = useMemo(() => {
        const income = filteredInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        const expense = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
        const vatIn = filteredInvoices.reduce((sum, inv) => sum + (inv.tax || 0), 0);
        const vatOut = filteredExpenses.reduce((sum, exp) => sum + (exp.tax || (exp.amount - (exp.amount / 1.19))), 0);
        return {
            totalIncome: income,
            totalExpenses: expense,
            profit: income - expense,
            vatCollected: vatIn,
            vatPaid: vatOut,
            netVat: vatIn - vatOut,
            receivables: filteredInvoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + (inv.total || 0), 0),
            payables: filteredExpenses.filter(exp => exp.status !== 'paid').reduce((sum, exp) => sum + (exp.amount || 0), 0)
        };
    }, [filteredInvoices, filteredExpenses]);

    const { totalIncome, totalExpenses, profit, vatCollected, vatPaid, netVat, receivables, payables } = financialMetrics;

    const chartData = useMemo(() => {
        const results = [];
        const isMonthlyView = dateRange === 'thisMonth' || dateRange === 'lastMonth';
        if (isMonthlyView) {
            const dataMap = {};
            filteredInvoices.forEach(inv => {
                const day = new Date(inv.date).getDate();
                if (!dataMap[day]) dataMap[day] = { name: day, income: 0, expense: 0 };
                dataMap[day].income += inv.total;
            });
            filteredExpenses.forEach(exp => {
                const day = new Date(exp.date || exp.created_at).getDate();
                if (!dataMap[day]) dataMap[day] = { name: day, income: 0, expense: 0 };
                dataMap[day].expense += exp.amount;
            });
            Object.values(dataMap).sort((a, b) => a.name - b.name).forEach(d => results.push(d));
        } else {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const dataMap = {};
            filteredInvoices.forEach(inv => {
                const month = new Date(inv.date).getMonth();
                if (!dataMap[month]) dataMap[month] = { name: months[month], income: 0, expense: 0, sort: month };
                dataMap[month].income += inv.total;
            });
            filteredExpenses.forEach(exp => {
                const month = new Date(exp.date || exp.created_at).getMonth();
                if (!dataMap[month]) dataMap[month] = { name: months[month], income: 0, expense: 0, sort: month };
                dataMap[month].expense += exp.amount;
            });
            Object.values(dataMap).sort((a, b) => a.sort - b.sort).forEach(d => results.push(d));
        }
        return results;
    }, [filteredInvoices, filteredExpenses, dateRange]);

    const expenseChartData = useMemo(() => {
        const cats = filteredExpenses.reduce((acc, exp) => {
            const c = exp.category || 'Uncategorized';
            acc[c] = (acc[c] || 0) + exp.amount;
            return acc;
        }, {});
        const COLORS = ['var(--primary)', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
        return Object.entries(cats).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));
    }, [filteredExpenses]);

    const formatCurr = (val) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);
    const isConstruction = String(companyProfile?.industry || '').toLowerCase().includes('bau') || String(companyProfile?.industry || '').toLowerCase().includes('cons');

    const tabs = [
        { id: 'daily', label: t('dailyReports') || 'Günlük Raporlar', icon: FileText },
        { id: 'financial', label: t('financial_reports') || 'Finansal', icon: TrendingUp },
        { id: 'stock', label: t('stock_reports') || 'Stok', icon: Package },
        { id: 'timeline', label: t('timeline_reports') || 'Zaman Çizelgesi', icon: LayoutPanelLeft },
    ];
    if (isConstruction) tabs.push({ id: 'progress', label: t('site_progress') || 'Gelişim', icon: BarChart2 });

    const reportsData = {
        daily: (dailyReports || []).map(r => ({
            id: r.id,
            title: `DAILY-LOG-${new Date(r.created_at).toLocaleDateString()}`,
            date: new Date(r.created_at).toLocaleDateString(),
            size: '0.4 MB', type: 'REP', author: (employees || []).find(e => e.id === r.user_id)?.name || 'Worker'
        })),
        stock: [{ id: 1, title: 'STOK-DURUM-MART', date: '01.03.2024', size: '1.2 MB', type: 'PDF', author: 'Sistem' }],
        progress: [{ id: 1, title: 'SAHA-OZETI-A1', date: '05.03.2024', size: '5.6 MB', type: 'PDF', author: 'Saha Şefi' }]
    };

    const [generatingReport, setGeneratingReport] = useState(false);
    const handleGenerateReport = async (type) => {
        setGeneratingReport(true);
        try {
            const { jsPDF } = await import('jspdf');
            const html2canvas = (await import('html2canvas')).default;
            const element = document.getElementById('report-content-area');
            if (element) {
                const canvas = await html2canvas(element, { scale: 2 });
                const pdf = new jsPDF('p', 'mm', 'a4');
                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
                pdf.save(`Report_${type}_${new Date().toLocaleDateString()}.pdf`);
            }
        } catch (e) {
            console.error(e);
        } finally { setGeneratingReport(false); }
    };

    return (
        <div className="reports-wrapper">
            <header className="reports-header">
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '8px' }}>
                        {t('reports_hub') || 'Rapor Merkezi'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>
                        {t('reports_hub_desc') || 'Tüm firma verilerini ve raporlarını buradan yönetin.'}
                    </p>
                </div>
                <button
                    className="primary-btn-premium"
                    onClick={() => handleGenerateReport(activeTab)}
                    disabled={generatingReport}
                >
                    {generatingReport ? <RotateCw size={18} className="animate-spin" /> : <Printer size={18} />}
                    <span style={{ marginLeft: '10px' }}>{generatingReport ? 'Oluşturuluyor...' : (t('generate_report') || 'Rapor Oluştur')}</span>
                </button>
            </header>

            <div className="reports-tabs-scroll">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`report-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    >
                        <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab !== 'financial' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '12px 18px', borderRadius: '14px', border: '1px solid var(--border)', width: '100%', maxWidth: '450px', boxShadow: 'var(--shadow-sm)' }}>
                        <Search size={18} color="var(--text-muted)" />
                        <input
                            type="text"
                            placeholder={t('search_reports') || 'Raporlarda ara...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem', fontWeight: '500' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="secondary-btn-premium"><Filter size={18} /> {t('filter')}</button>
                    </div>
                </div>
            )}

            <motion.div
                id="report-content-area"
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ minHeight: '500px' }}
            >
                {activeTab === 'timeline' && (
                    <TimelineGantt
                        title={t('business_timeline') || 'Genel İş Akışı Çizelgesi'}
                        data={[
                            { id: 1, name: 'Kuzey Rezidans', start_date: '2024-02-01', due_date: '2024-05-15', progress: 65, color: 'var(--primary)', category: 'Şantiyeler' },
                            { id: 2, name: 'Güney Metro', start_date: '2024-03-10', due_date: '2024-08-20', progress: 20, color: '#ef4444', category: 'Şantiyeler' },
                            { id: 3, name: 'Doğu İş Merkezi', start_date: '2024-01-15', due_date: '2024-04-10', progress: 95, color: '#10b981', category: 'Projeler' },
                        ]}
                    />
                )}

                {activeTab === 'financial' ? (
                    <div className="financial-dashboard">
                        <div className="period-picker">
                            {['thisMonth', 'lastMonth', 'thisYear', 'allTime'].map(range => (
                                <button
                                    key={range}
                                    onClick={() => setDateRange(range)}
                                    className={`period-btn ${dateRange === range ? 'active' : ''}`}
                                >
                                    {t(range) || range}
                                </button>
                            ))}
                        </div>

                        <div className="financial-stats-grid">
                            {[
                                { label: t('revenue'), val: totalIncome, color: '#10b981', icon: TrendingUp, bg: '#dcfce7' },
                                { label: t('expenses'), val: totalExpenses, color: '#ef4444', icon: TrendingDown, bg: '#fee2e2' },
                                { label: t('netProfit'), val: profit, color: 'var(--primary)', icon: Receipt, bg: 'var(--primary-light)' },
                                { label: t('receivables') || 'Alacaklar', val: receivables, color: '#3b82f6', icon: Activity, bg: '#dbeafe' },
                                { label: t('payables') || 'Borçlar', val: payables, color: '#f59e0b', icon: AlertCircle, bg: '#ffedd5' },
                            ].map((stat, i) => (
                                <div key={i} className="card stat-card-premium" style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>{stat.label}</p>
                                            <h3 style={{ fontSize: '1.6rem', fontWeight: '900', color: stat.color, margin: 0 }}>{formatCurr(stat.val)}</h3>
                                        </div>
                                        <div style={{ background: stat.bg, padding: '12px', borderRadius: '12px', color: stat.color }}>
                                            <stat.icon size={22} strokeWidth={2.5} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="financial-charts-layout">
                            <div className="card" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{t('revenueParams') || 'Gelir-Gider Dengesi'}</h3>
                                    <div className="badge-premium">Live</div>
                                </div>
                                <div style={{ height: '350px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                                            <RechartsTooltip cursor={{ fill: 'var(--bg-body)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)' }} />
                                            <Bar dataKey="income" name={t('income')} fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={25} />
                                            <Bar dataKey="expense" name={t('expense')} fill="#ef4444" radius={[6, 6, 0, 0]} barSize={25} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div className="card" style={{ padding: '24px' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '24px' }}>{t('expenseBreakdown') || 'Gider Dağılımı'}</h3>
                                    <div style={{ height: '220px' }}>
                                        {expenseChartData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={expenseChartData} innerRadius={65} outerRadius={85} paddingAngle={8} dataKey="value">
                                                        {expenseChartData.map((e, idx) => <Cell key={idx} fill={e.color} />)}
                                                    </Pie>
                                                    <RechartsTooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : <div style={{ textAlign: 'center', color: '#94a3b8', paddingTop: '80px' }}>Veri Yok</div>}
                                </div>
                                </div>

                                <div className="card" style={{ padding: '24px', background: 'var(--primary)', color: 'white' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '20px' }}>{t('taxEstimation') || 'Vergi Özeti'}</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.9 }}>
                                            <span>Mevcut KDV</span>
                                            <span style={{ fontWeight: '700' }}>{formatCurr(netVat)}</span>
                                        </div>
                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}></div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '900', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Net Durum</span>
                                            <span>{formatCurr(profit)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '16px' }}>
                        {(reportsData[activeTab] || []).length > 0 ? (
                            (reportsData[activeTab] || []).map(r => <ReportCard key={r.id} {...r} />)
                        ) : (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px', background: 'var(--bg-body)', borderRadius: '24px', border: '1px dashed var(--border)' }}>
                                <FileType size={56} color="var(--border)" style={{ marginBottom: '20px' }} />
                                <h3 style={{ color: 'var(--text-main)' }}>{t('no_reports_found') || 'Rapor Bulunamadı'}</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Filtreleri değiştirerek tekrar deneyin.</p>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Reports;
