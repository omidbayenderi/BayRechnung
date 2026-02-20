import React, { useState } from 'react';
import { useInvoice } from '../context/InvoiceContext';
import { Download, TrendingUp, TrendingDown, AlertCircle, Receipt, BarChart3 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const Reports = () => {
    const { invoices, expenses, exportToCSV } = useInvoice();
    const { t } = useLanguage();

    const [activeTab, setActiveTab] = useState('financial');
    const [dateRange, setDateRange] = useState('thisMonth');

    // Filter logic
    const getFilteredData = () => {
        const now = new Date();
        let start = new Date(0); // Epoch
        let end = new Date(); // Now

        if (dateRange === 'thisMonth') {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (dateRange === 'lastMonth') {
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        } else if (dateRange === 'thisYear') {
            start = new Date(now.getFullYear(), 0, 1);
        }
        // 'allTime' uses default epoch start

        const filteredInvoices = invoices.filter(inv => {
            const d = new Date(inv.date);
            return d >= start && d <= end;
        });

        const filteredExpenses = expenses.filter(exp => {
            const d = new Date(exp.date || exp.created_at);
            return d >= start && d <= end;
        });

        return { filteredInvoices, filteredExpenses };
    };

    const { filteredInvoices, filteredExpenses } = getFilteredData();

    // Recalculate totals based on filter
    const totalIncome = filteredInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const profit = totalIncome - totalExpenses;

    // Global Stats (Independent of filter - usually user wants filtered, but "Overdue" is always relevant)
    const openInvoices = invoices.filter(inv => inv.status !== 'paid');
    const totalOpenAmount = openInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

    // Client turnover (Top 5 - Filtered)
    const clientTurnover = filteredInvoices.reduce((acc, inv) => {
        const name = inv.recipientName || 'Unbekannt';
        acc[name] = (acc[name] || 0) + (inv.total || 0);
        return acc;
    }, {});

    const topClients = Object.entries(clientTurnover)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    // Tax Calculations for selected period
    const vatCollected = filteredInvoices.reduce((sum, inv) => sum + (inv.tax || 0), 0);
    const vatPaid = filteredExpenses.reduce((sum, exp) => {
        // Estimate VAT for expenses if not present (assuming gross amount)
        // If exp.tax exists, use it. Else calculate 19% included.
        if (typeof exp.tax !== 'undefined') return sum + exp.tax;
        return sum + (exp.amount - (exp.amount / 1.19));
    }, 0);
    const netVat = vatCollected - vatPaid;


    // Prepare Chart Data
    const chartData = [];
    const isMonthlyView = dateRange === 'thisMonth' || dateRange === 'lastMonth';

    if (isMonthlyView) {
        // Daily breakdown
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

        Object.values(dataMap).sort((a, b) => a.name - b.name).forEach(d => chartData.push(d));
    } else {
        // Monthly breakdown
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dataMap = {};

        filteredInvoices.forEach(inv => {
            const month = new Date(inv.date).getMonth();
            if (!dataMap[month]) dataMap[month] = { name: months[month], income: 0, expense: 0, sortDetails: month };
            dataMap[month].income += inv.total;
        });
        filteredExpenses.forEach(exp => {
            const month = new Date(exp.date || exp.created_at).getMonth();
            if (!dataMap[month]) dataMap[month] = { name: months[month], income: 0, expense: 0, sortDetails: month };
            dataMap[month].expense += exp.amount;
        });

        Object.values(dataMap).sort((a, b) => a.sortDetails - b.sortDetails).forEach(d => chartData.push(d));
    }

    // Expense Pie Chart Data
    const expenseCategories = filteredExpenses.reduce((acc, exp) => {
        const cat = exp.category || 'Uncategorized';
        acc[cat] = (acc[cat] || 0) + exp.amount;
        return acc;
    }, {});

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
    const expenseChartData = Object.entries(expenseCategories).map(([name, value], index) => ({
        name, value, color: COLORS[index % COLORS.length]
    }));

    const formatCurr = (val) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1>{t('reports')} & {t('netProfit')}</h1>
                    <p>{t('overviewText')}</p>
                </div>
                <div className="actions">
                    <button className="primary-btn" onClick={() => exportToCSV(invoices, 'Finanz_Report')}>
                        <Download size={20} /> DATEV / CSV Export
                    </button>
                </div>
            </header>

            {/* Date Range Selector */}
            <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontWeight: '500', color: '#64748b' }}>{t('period') || 'Dönem'}:</span>
                    {['thisMonth', 'lastMonth', 'thisYear', 'allTime'].map(range => (
                        <button
                            key={range}
                            className={`secondary-btn ${dateRange === range ? 'active' : ''}`}
                            onClick={() => setDateRange(range)}
                            style={{
                                background: dateRange === range ? 'var(--primary)' : 'white',
                                color: dateRange === range ? 'white' : 'var(--text)',
                                borderColor: dateRange === range ? 'var(--primary)' : 'var(--border)',
                                fontSize: '0.9rem',
                                padding: '6px 12px'
                            }}
                        >
                            {t(range) || (range === 'thisMonth' ? 'Bu Ay' : range === 'lastMonth' ? 'Geçen Ay' : range === 'thisYear' ? 'Bu Yıl' : 'Tüm Zamanlar')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#dcfce7', color: '#166534' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>{t('revenue')}</h3>
                        <p>{formatCurr(totalIncome)}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#fee2e2', color: '#b91c1c' }}>
                        <TrendingDown size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>{t('expenses')}</h3>
                        <p>{formatCurr(totalExpenses)}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: profit >= 0 ? '#dcfce7' : '#fee2e2', color: profit >= 0 ? '#166534' : '#b91c1c' }}>
                        <Receipt size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>{t('netProfit')}</h3>
                        <p>{formatCurr(profit)}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#fef9c3', color: '#854d0e' }}>
                        <AlertCircle size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>{t('overdue')}</h3>
                        <p>{formatCurr(totalOpenAmount)}</p>
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
                    {['financial', 'daily', 'stock', 'progress'].map(tab => (
                        <h3
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                margin: 0, paddingBottom: '12px',
                                borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                                color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                                cursor: 'pointer',
                                textTransform: 'capitalize'
                            }}
                        >
                            {t(tab + 'Reports') || (tab === 'financial' ? 'Finansal Raporlar' : tab === 'daily' ? 'Günlük Raporlar' : tab === 'stock' ? 'Stok Raporları' : 'İlerleme Raporları')}
                        </h3>
                    ))}
                </div>

                {activeTab === 'financial' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Revenue vs Expenses Chart */}
                        <div className="card full-width">
                            <h3>{t('revenueParams') || 'Gelir & Gider Analizi'}</h3>
                            <div style={{ height: '300px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={chartData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                        <RechartsTooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value) => formatCurr(value)}
                                        />
                                        <Legend />
                                        <Bar dataKey="income" name={t('income') || 'Gelir'} fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                                        <Bar dataKey="expense" name={t('expense') || 'Gider'} fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="settings-grid">
                            {/* Expense Breakdown */}
                            <div className="card">
                                <h3>{t('expenseBreakdown') || 'Gider Dağılımı'}</h3>
                                <div style={{ height: '250px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {expenseChartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={expenseChartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {expenseChartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip formatter={(value) => formatCurr(value)} />
                                                <Legend layout="vertical" align="right" verticalAlign="middle" />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <p style={{ color: '#94a3b8' }}>{t('noData')}</p>
                                    )}
                                </div>
                            </div>

                            {/* Tax Estimation */}
                            <div className="card">
                                <h3>{t('taxEstimation') || 'Vergi Tahmini (KDV)'}</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '4px' }}>{t('vatCollected') || 'Tahsil Edilen KDV'}</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1e293b' }}>{formatCurr(vatCollected)}</div>
                                    </div>
                                    <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '4px' }}>{t('vatPaid') || 'Ödenen KDV (Giderler)'}</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1e293b' }}>{formatCurr(vatPaid)}</div>
                                    </div>
                                    <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #dbeafe' }}>
                                        <div style={{ fontSize: '0.9rem', color: '#1e40af', marginBottom: '4px' }}>{t('netVatPayable') || 'Ödenecek KDV'}</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>{formatCurr(netVat)}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#3b82f6', marginTop: '4px' }}>* {t('estimatedValue') || 'Tahmini değerdir'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Clients List */}
                        <div className="card">
                            <h3>{t('topClients')}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {topClients.map(([name, amount], i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>{name[0]}</div>
                                            <span style={{ fontWeight: '500' }}>{name}</span>
                                        </div>
                                        <span style={{ fontWeight: '600' }}>{formatCurr(amount)}</span>
                                    </div>
                                ))}
                                {topClients.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center' }}>{t('noData')}</p>}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'daily' && (
                    <div className="card">
                        <h3>{t('dailyReports') || 'Günlük Raporlar'}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { user: 'Ahmet Y.', site: 'Skyline Plaza', status: 'Tamamlandı', time: '14:20' },
                                { user: 'Mehmet K.', site: 'Harbor View', status: 'Devam Ediyor', time: '11:05' },
                                { user: 'Can D.', site: 'Skyline Plaza', status: 'Gecikme', time: '09:15' },
                            ].map((rep, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ fontWeight: '600' }}>{rep.user}</div>
                                        <div style={{ color: 'var(--text-muted)' }}>{rep.site}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem', color: rep.status === 'Tamamlandı' ? '#10b981' : '#f59e0b' }}>{rep.status}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rep.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'stock' && (
                    <div className="settings-grid">
                        <div className="card">
                            <h3>{t('lowStock') || 'Kritik Stok'}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[
                                    { name: 'Çimento (C30)', stock: '5 Palet', min: '10 Palet' },
                                    { name: 'İskele Kelepçesi', stock: '45 Adet', min: '100 Adet' },
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid #f1f5f9' }}>
                                        <span>{item.name}</span>
                                        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{item.stock}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="card">
                            <h3>{t('inventoryOverview') || 'Envanter Özeti'}</h3>
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>124</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('totalItems') || 'Toplam Kalem Ürün'}</div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'progress' && (
                    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                        <BarChart3 size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <p>{t('noData')} - {activeTab.toUpperCase()} {t('reports').toUpperCase()}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
