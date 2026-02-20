import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useInvoice } from '../../context/InvoiceContext';
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
    AlertCircle
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const ReportCard = ({ title, date, size, type, author }) => (
    <div className="report-card" style={{
        background: 'white',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
        transition: 'all 0.2s ease',
        cursor: 'pointer'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: type === 'PDF' ? '#fee2e2' : '#e0e7ff',
                color: type === 'PDF' ? '#ef4444' : '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '0.8rem'
            }}>
                {type}
            </div>
            <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#1e293b' }}>{title}</h4>
                <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{date}</span>
                    <span>•</span>
                    <span>{size}</span>
                    <span>•</span>
                    <span>{author}</span>
                </div>
            </div>
        </div>
        <button className="icon-btn" style={{ color: '#94a3b8' }}>
            <Download size={18} />
        </button>
    </div>
);

const Reports = () => {
    const { t } = useLanguage();
    const { invoices, expenses, companyProfile, dailyReports, employees } = useInvoice(); // Get real data
    const [activeTab, setActiveTab] = useState('daily');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState('thisMonth');

    // Filter Logic for Charts
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

    // Chart Data Calculations
    const totalIncome = filteredInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const profit = totalIncome - totalExpenses;

    const vatCollected = filteredInvoices.reduce((sum, inv) => sum + (inv.tax || 0), 0);
    const vatPaid = filteredExpenses.reduce((sum, exp) => {
        if (typeof exp.tax !== 'undefined') return sum + exp.tax;
        return sum + (exp.amount - (exp.amount / 1.19));
    }, 0);
    const netVat = vatCollected - vatPaid;

    // Prepare Bar Chart Data
    const chartData = [];
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
        Object.values(dataMap).sort((a, b) => a.name - b.name).forEach(d => chartData.push(d));
    } else {
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

    // Pie Chart Data
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

    // Dynamic Tabs based on Industry
    const isConstruction = companyProfile?.industry === 'construction';

    const tabs = [
        { id: 'daily', label: t('dailyReports') || 'Daily Reports', icon: FileText },
        { id: 'financial', label: t('financial_reports') || 'Financial', icon: TrendingUp },
        { id: 'stock', label: t('stock_reports') || 'Stock', icon: Package },
    ];

    if (isConstruction) {
        tabs.push({ id: 'progress', label: t('site_progress') || 'Site Progress', icon: BarChart2 });
    }

    // Format Daily Reports from Supabase
    const dailyReportsFormatted = dailyReports.map(report => {
        const worker = employees.find(e => e.id === report.user_id);
        const date = new Date(report.created_at);
        return {
            id: report.id,
            title: `DAILY-${report.site_id || 'SITE'}-${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`,
            date: date.toLocaleDateString(),
            size: report.content ? `${Math.round(report.content.length / 100)} KB` : '0.1 MB',
            type: 'REP',
            author: worker?.name || 'Worker'
        };
    });

    // Mock Data for other List Views (to be replaced later as well)
    const reportsData = {
        daily: dailyReportsFormatted,
        stock: [
            { id: 1, title: 'STOCK-AUDIT-Q1', date: '10.02.2024', size: '3.8 MB', type: 'PDF', author: 'Depo Sorumlusu' },
        ],
        progress: [
            { id: 1, title: 'PROGRESS-SITE-A', date: '12.02.2024', size: '5.6 MB', type: 'PDF', author: 'Proje Müdürü' },
        ]
    };

    const currentReports = reportsData[activeTab] || [];

    const [generatingReport, setGeneratingReport] = useState(false);

    const handleGenerateReport = (type) => {
        setGeneratingReport(true);
        // Simulate background generation
        setTimeout(() => {
            setGeneratingReport(false);
            alert(`${type} report generated successfully!`);
        }, 2000);
    };

    // ... inside component
    return (
        <div className="page-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>

            {/* Header */}
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
                        {t('reports_hub') || 'Reports Hub'}
                    </h1>
                    <p style={{ color: '#64748b' }}>
                        {t('reports_hub_desc') || 'Centralized document management for your business operations.'}
                    </p>
                </div>
                <button
                    className="primary-btn"
                    onClick={() => handleGenerateReport(activeTab)}
                    disabled={generatingReport}
                    style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.5)' }}
                >
                    {generatingReport ? <RotateCw size={18} className="animate-spin" /> : <Printer size={18} />}
                    {generatingReport ? 'Generating...' : (t('generate_report') || 'Generate Report')}
                </button>
            </header>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '24px',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '16px',
                overflowX: 'auto'
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            background: activeTab === tab.id ? '#4f46e5' : 'transparent',
                            color: activeTab === tab.id ? 'white' : '#64748b',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Filter Bar (Only show usually, but for Financial Charts we have specific date picker inside) */}
            {activeTab !== 'financial' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%', maxWidth: '400px' }}>
                        <Search size={18} color="#94a3b8" />
                        <input
                            type="text"
                            placeholder={t('search_reports')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="secondary-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Filter size={18} /> {t('filter')}
                        </button>
                        <button className="secondary-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={18} /> {t('date_range')}
                        </button>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                {/* FINANCIAL CHARTS VIEW */}
                {activeTab === 'financial' ? (
                    <div className="financial-dashboard">
                        {/* Date Range Selector for Charts */}
                        <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <span style={{ fontWeight: '500', color: '#64748b' }}>{t('period')}:</span>
                                {['thisMonth', 'lastMonth', 'thisYear', 'allTime'].map(range => (
                                    <button
                                        key={range}
                                        onClick={() => setDateRange(range)}
                                        style={{
                                            background: dateRange === range ? '#4f46e5' : 'white',
                                            color: dateRange === range ? 'white' : '#64748b',
                                            border: dateRange === range ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            fontSize: '0.9rem',
                                            padding: '6px 12px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {t(range)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Top Stats Cards */}
                        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                            <div className="card stat-card" style={{ padding: '20px', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>{t('revenue')}</p>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981', margin: '4px 0' }}>{formatCurr(totalIncome)}</h3>
                                    </div>
                                    <div style={{ background: '#dcfce7', padding: '10px', borderRadius: '8px', color: '#166534' }}><TrendingUp size={20} /></div>
                                </div>
                            </div>
                            <div className="card stat-card" style={{ padding: '20px', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>{t('expenses')}</p>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444', margin: '4px 0' }}>{formatCurr(totalExpenses)}</h3>
                                    </div>
                                    <div style={{ background: '#fee2e2', padding: '10px', borderRadius: '8px', color: '#b91c1c' }}><TrendingDown size={20} /></div>
                                </div>
                            </div>
                            <div className="card stat-card" style={{ padding: '20px', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>{t('netProfit')}</p>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: profit >= 0 ? '#10b981' : '#ef4444', margin: '4px 0' }}>{formatCurr(profit)}</h3>
                                    </div>
                                    <div style={{ background: profit >= 0 ? '#dcfce7' : '#fee2e2', padding: '10px', borderRadius: '8px', color: profit >= 0 ? '#166534' : '#b91c1c' }}><Receipt size={20} /></div>
                                </div>
                            </div>
                        </div>

                        {/* Charts Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                            {/* Bar Chart */}
                            <div className="card" style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>{t('revenueParams')}</h3>
                                <div style={{ height: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                            <RechartsTooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                formatter={(value) => formatCurr(value)}
                                            />
                                            <Legend />
                                            <Bar dataKey="income" name={t('income')} fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={30} />
                                            <Bar dataKey="expense" name={t('expense')} fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Side Panel: Pie + Taxes */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {/* Pie Chart */}
                                <div className="card" style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>{t('expenseBreakdown')}</h3>
                                    <div style={{ height: '200px' }}>
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
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '80px' }}>{t('noData')}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Tax Card */}
                                <div className="card" style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>{t('taxEstimation')}</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                            <span style={{ color: '#64748b' }}>{t('vatCollected')}</span>
                                            <span style={{ fontWeight: '600' }}>{formatCurr(vatCollected)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                            <span style={{ color: '#64748b' }}>{t('vatPaid')}</span>
                                            <span style={{ fontWeight: '600' }}>{formatCurr(vatPaid)}</span>
                                        </div>
                                        <div style={{ borderTop: '1px solid #e2e8f0', margin: '4px 0' }}></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 'bold', color: '#4f46e5' }}>
                                            <span>{t('netVatPayable')}</span>
                                            <span>{formatCurr(netVat)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Legacy Reports List for Financial (below charts) */}
                        <div style={{ marginTop: '24px' }}>
                            <h3 style={{ fontSize: '1rem', color: '#64748b', marginBottom: '12px' }}>{t('archived_reports') || 'Arşivlenmiş Raporlar'}</h3>
                            {reportsData.financial && reportsData.financial.map(report => (
                                <ReportCard
                                    key={report.id}
                                    title={report.title}
                                    date={report.date}
                                    size={report.size}
                                    type={report.type}
                                    author={report.author}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    // STANDARD LIST VIEW (for Daily, Stock, Progress)
                    <>
                        {currentReports.length > 0 ? (
                            currentReports.map(report => (
                                <ReportCard
                                    key={report.id}
                                    title={report.title}
                                    date={report.date}
                                    size={report.size}
                                    type={report.type}
                                    author={report.author}
                                />
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '64px', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                                <FileType size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                                <p>{t('no_reports_found')}</p>
                            </div>
                        )}
                    </>
                )}
            </motion.div>

        </div>
    );
};

export default Reports;
