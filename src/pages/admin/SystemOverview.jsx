import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoice } from '../../context/InvoiceContext';
import { useAppointments } from '../../context/AppointmentContext';
import { useStock } from '../../context/StockContext';
import { useWebsite } from '../../context/WebsiteContext';
import { useLanguage } from '../../context/LanguageContext';
import { usePanel } from '../../context/PanelContext';
import {
    Activity,
    CreditCard,
    TrendingUp,
    Users,
    ShoppingCart,
    Calendar,
    Globe,
    AlertTriangle,
    CheckCircle,
    ArrowRight,
    Search,
    Filter,
    MoreVertical,
    Lock,
    Zap,
    Check,
    ShieldCheck,
    X,
    TrendingDown,
    Receipt,
    Sparkles
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useBayVision } from '../../context/BayVisionContext';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumUpgradeModal from '../../components/admin/PremiumUpgradeModal';


const SystemOverview = () => {
    const { t } = useLanguage();
    const { invoices, expenses, employees } = useInvoice();
    const { appointments } = useAppointments();
    const { sales, products } = useStock();
    const { siteConfig } = useWebsite();
    const { switchPanel } = usePanel();
    const { intelligence, isAnalyzing } = useBayVision(); // CEO Intelligence

    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { companyProfile } = useInvoice(); // Need this for active plan
    const [timeRange, setTimeRange] = useState('month'); // week, month, year
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const isPremiumAcct = currentUser?.plan === 'premium';
    const isActivePremium = companyProfile?.plan === 'premium';

    // --- Aggregated Metrics ---

    // 1. Financials (Refined logic for Enterprise accuracy)
    const activeInvoices = (invoices || []).filter(inv => inv && inv.status !== 'cancelled' && inv.status !== 'draft');

    // Revenue is based on paid + pending (sent) invoices
    const invoiceRevenue = activeInvoices.reduce((sum, inv) => sum + (parseFloat(inv?.total) || 0), 0);
    const paidRevenue = (invoices || []).filter(inv => inv && inv.status === 'paid').reduce((sum, inv) => sum + (parseFloat(inv?.total) || 0), 0);

    const stockRevenue = (sales || []).filter(s => s).reduce((sum, sale) => sum + (parseFloat(sale?.total) || 0), 0);
    const totalRevenue = invoiceRevenue + stockRevenue; // Projected Ciro
    const cashInHand = paidRevenue + stockRevenue;     // Actual Liquid Cash

    const totalExpenses = (expenses || []).filter(e => e).reduce((sum, exp) => sum + (parseFloat(exp?.amount) || 0), 0);
    const totalUnpaid = (invoices || []).filter(inv => inv && (inv.status === 'sent' || inv.status === 'overdue')).reduce((sum, inv) => sum + (parseFloat(inv?.total) || 0), 0);
    const netProfit = cashInHand - totalExpenses;

    // 2. Operational
    const activeStaff = (employees || []).filter(e => e).length;
    const criticalStockItems = (products || []).filter(p => p && p.stock <= (p.minStock || 3));
    const lowStockItems = criticalStockItems.length;

    // Filter appointments for TODAY only
    const today = new Date();
    const todaysAppointments = (appointments || []).filter(a => {
        if (!a || !a.date) return false;
        const appDate = new Date(a.date);
        return appDate.getDate() === today.getDate() &&
            appDate.getMonth() === today.getMonth() &&
            appDate.getFullYear() === today.getFullYear();
    }).sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by time

    const upcomingAppointments = todaysAppointments.length;

    // Online Sales Calculation (Mocking 'online' source if not explicit, or using Stock Sales)
    // Assuming 'sales' from useStock() contains online orders. 
    // If not distinguished, we'll treat all stock sales as potential online/POS mix.
    const onlineSalesTotal = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const onlineOrdersCount = sales.length;

    // Website Status
    const isWebsiteLive = siteConfig?.isPublished;

    // --- Trend Calculations (Real vs Mock) ---
    const calculateTrend = (data, valueKey, dateKey = 'date') => {
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(now.getDate() - 60);

        const currentPeriod = data.filter(item => {
            const d = new Date(item[dateKey]);
            return d >= thirtyDaysAgo && d <= now;
        }).reduce((sum, item) => sum + (parseFloat(item[valueKey]) || 0), 0);

        const previousPeriod = data.filter(item => {
            const d = new Date(item[dateKey]);
            return d >= sixtyDaysAgo && d < thirtyDaysAgo;
        }).reduce((sum, item) => sum + (parseFloat(item[valueKey]) || 0), 0);

        if (previousPeriod === 0) return currentPeriod > 0 ? 100 : 0;
        return parseFloat(((currentPeriod - previousPeriod) / previousPeriod * 100).toFixed(1));
    };

    // Prepare combined data for profit trend
    const revenueData = [
        ...invoices.map(inv => ({ total: inv.total, date: inv.date })),
        ...sales.map(sale => ({ total: sale.total, date: sale.createdAt || sale.created_at }))
    ];

    const expenseData = expenses.map(exp => ({ amount: exp.amount, date: exp.date || exp.created_at }));

    const revenueTrend = calculateTrend(revenueData, 'total');
    const expenseTrend = calculateTrend(expenseData, 'amount');

    // Mathematically correct profit trend
    const profitTrend = (() => {
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(now.getDate() - 60);

        const currentRev = revenueData.filter(item => {
            const d = new Date(item.date);
            return d >= thirtyDaysAgo && d <= now;
        }).reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);

        const currentExp = expenseData.filter(item => {
            const d = new Date(item.date);
            return d >= thirtyDaysAgo && d <= now;
        }).reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

        const prevRev = revenueData.filter(item => {
            const d = new Date(item.date);
            return d >= sixtyDaysAgo && d < thirtyDaysAgo;
        }).reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);

        const prevExp = expenseData.filter(item => {
            const d = new Date(item.date);
            return d >= sixtyDaysAgo && d < thirtyDaysAgo;
        }).reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

        const currentProfit = currentRev - currentExp;
        const prevProfit = prevRev - prevExp;

        if (prevProfit === 0) return currentProfit > 0 ? 100 : 0;
        return parseFloat(((currentProfit - prevProfit) / Math.abs(prevProfit) * 100).toFixed(1));
    })();

    const profitMargin = totalRevenue > 0 ? parseFloat(((netProfit / totalRevenue) * 100).toFixed(1)) : 0;
    const expenseRatio = totalRevenue > 0 ? parseFloat(((totalExpenses / totalRevenue) * 100).toFixed(1)) : 0;

    // --- Expense Breakdown Calculation ---
    const expenseBreakdown = expenses.reduce((acc, exp) => {
        const cat = exp.category || t('others') || 'Diğer';
        acc[cat] = (acc[cat] || 0) + (parseFloat(exp.amount) || 0);
        return acc;
    }, {});

    const PIE_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'];
    const pieData = Object.entries(expenseBreakdown)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8); // Top 8 categories

    // --- Strategic Insights ---
    const estimatedTax = totalRevenue * (1 - (1 / (1 + (parseFloat(companyProfile?.taxRate || 19) / 100))));
    const cashReserveHealth = cashInHand > totalExpenses * 1.5 ? 'healthy' : (cashInHand > totalExpenses ? 'warning' : 'critical');

    // --- Chart Data Preparation (Connecting to real historical data) ---
    const generateChartData = () => {
        const data = [];
        const now = new Date();
        const points = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 12;

        // Generate buckets
        for (let i = points - 1; i >= 0; i--) {
            const bucketDate = new Date();
            if (timeRange === 'week') bucketDate.setDate(now.getDate() - i);
            else if (timeRange === 'month') bucketDate.setDate(now.getDate() - i);
            else if (timeRange === 'year') bucketDate.setMonth(now.getMonth() - i);

            const label = timeRange === 'week' ? bucketDate.toLocaleDateString(undefined, { weekday: 'short' }) :
                timeRange === 'month' ? bucketDate.getDate().toString() :
                    bucketDate.toLocaleDateString(undefined, { month: 'short' });

            // Filter data for this bucket
            const bucketRev = revenueData.filter(item => {
                const d = new Date(item.date);
                if (timeRange === 'year') return d.getMonth() === bucketDate.getMonth() && d.getFullYear() === bucketDate.getFullYear();
                return d.getDate() === bucketDate.getDate() && d.getMonth() === bucketDate.getMonth() && d.getFullYear() === bucketDate.getFullYear();
            }).reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);

            const bucketExp = expenseData.filter(item => {
                const d = new Date(item.date);
                if (timeRange === 'year') return d.getMonth() === bucketDate.getMonth() && d.getFullYear() === bucketDate.getFullYear();
                return d.getDate() === bucketDate.getDate() && d.getMonth() === bucketDate.getMonth() && d.getFullYear() === bucketDate.getFullYear();
            }).reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

            data.push({
                name: label,
                revenue: Math.round(bucketRev),
                expenses: Math.round(bucketExp),
                profit: Math.round(bucketRev - bucketExp)
            });
        }

        // If data is too empty, fallback to simple distribution of totals for visual balance
        const hasData = data.some(d => d.revenue > 0 || d.expenses > 0);
        if (!hasData && (totalRevenue > 0 || totalExpenses > 0)) {
            return data.map((d, i) => {
                const revStep = totalRevenue / points;
                const expStep = totalExpenses / points;
                const cumulativeRev = revStep * (i + 1);
                const cumulativeExp = expStep * (i + 1);
                return {
                    ...d,
                    revenue: Math.round(cumulativeRev),
                    expenses: Math.round(cumulativeExp),
                    profit: Math.round(cumulativeRev - cumulativeExp)
                };
            });
        }

        return data;
    };

    const chartData = generateChartData();


    // --- Helper Components ---
    const Counter = ({ value, prefix = '', decimals = 0 }) => {
        const [displayValue, setDisplayValue] = useState(0);

        useEffect(() => {
            let start = 0;
            const end = parseFloat(value);
            if (start === end) {
                setDisplayValue(end);
                return;
            }

            const totalDuration = 1000;
            const frameDuration = 1000 / 60;
            const totalFrames = Math.round(totalDuration / frameDuration);
            let frame = 0;

            const timer = setInterval(() => {
                frame++;
                const progress = frame / totalFrames;
                const easedProgress = progress * (2 - progress); // easeOutQuad
                setDisplayValue(start + (end - start) * easedProgress);

                if (frame === totalFrames) {
                    setDisplayValue(end);
                    clearInterval(timer);
                }
            }, frameDuration);

            return () => clearInterval(timer);
        }, [value]);

        return (
            <span>
                {prefix}{displayValue.toLocaleString(undefined, {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals
                })}
            </span>
        );
    };

    const MetricCard = ({ title, value, numericValue, subtext, icon: Icon, color, trend, isCurrency, percentageType = 'trend' }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                border: '1px solid #f1f5f9',
                transition: 'all 0.3s ease'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: `${color}15`,
                    color: color
                }}>
                    <Icon size={24} />
                </div>
                {trend !== undefined && (
                    <motion.span
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: percentageType === 'ratio' ? '#64748b' : (trend >= 0 ? '#10b981' : '#ef4444'),
                            background: percentageType === 'ratio' ? '#f1f5f9' : (trend >= 0 ? '#d1fae5' : '#fee2e2'),
                            padding: '4px 8px',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            border: percentageType === 'ratio' ? '1px solid #e2e8f0' : 'none'
                        }}
                        title={percentageType === 'ratio' ? 'Ciroya oran' : 'Aylık değişim'}
                    >
                        {percentageType === 'trend' ? (trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />) : null}
                        {percentageType === 'ratio' ? '%' : ''}{Math.abs(trend)}{percentageType === 'trend' ? '%' : ''}
                    </motion.span>
                )}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500', marginBottom: '4px' }}>{title}</div>
            <div style={{ fontSize: '1.875rem', fontWeight: '800', color: '#1e293b', letterSpacing: '-0.5px' }}>
                {numericValue !== undefined ? (
                    <Counter value={numericValue} prefix={isCurrency ? '€' : ''} />
                ) : value}
            </div>
            {subtext && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>{subtext}</div>}
        </motion.div>
    );

    const ModuleStatus = ({ name, status, color, onClick, icon: Icon, isLocked, requirementMet }) => (
        <div
            style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #f1f5f9',
                marginBottom: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: isLocked ? 'grayscale(0.5)' : 'none',
                overflow: 'hidden'
            }}
            onClick={onClick}
            onMouseEnter={(e) => {
                if (!isLocked) e.currentTarget.style.background = '#f8fafc';
                if (isLocked) {
                    const tooltip = e.currentTarget.querySelector('.upgrade-tooltip');
                    if (tooltip) tooltip.style.opacity = '1';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                }
            }}
            onMouseLeave={(e) => {
                if (!isLocked) e.currentTarget.style.background = 'white';
                if (isLocked) {
                    const tooltip = e.currentTarget.querySelector('.upgrade-tooltip');
                    if (tooltip) tooltip.style.opacity = '0';
                    e.currentTarget.style.borderColor = '#f1f5f9';
                    e.currentTarget.style.transform = 'translateY(0)';
                }
            }}
        >
            {isLocked && (
                <div className="upgrade-tooltip" style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    background: 'rgba(59, 130, 246, 0.95)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    opacity: '0',
                    transition: 'opacity 0.2s',
                    zIndex: '2',
                    gap: '8px'
                }}>
                    <Zap size={16} fill="currentColor" />
                    {!requirementMet
                        ? (t('upgrade_to_premium') || 'Upgrade to Premium')
                        : (t('activate_premium') || 'Premium Özelliği Etkinleştir')}
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                    position: 'relative',
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                }}>
                    <Icon size={20} />
                    {isLocked && (
                        <div style={{
                            position: 'absolute',
                            top: '-5px',
                            right: '-5px',
                            background: '#1e293b',
                            borderRadius: '50%',
                            padding: '4px',
                            border: '2px solid white'
                        }}>
                            <Lock size={10} />
                        </div>
                    )}
                </div>
                <div>
                    <div style={{ fontWeight: '600', fontSize: '0.95rem', color: isLocked ? '#94a3b8' : '#1e293b' }}>{name}</div>
                    <div style={{ fontSize: '0.8rem', color: isLocked ? '#cbd5e1' : (status === 'Active' ? '#10b981' : '#f59e0b'), display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {!isLocked && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: status === 'Active' ? '#10b981' : '#f59e0b' }}></div>}
                        {isLocked ? (t('premium_only') || 'Premium Plan Only') : status}
                    </div>
                </div>
            </div>
            <button style={{
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: 'transparent',
                cursor: 'pointer',
                color: isLocked ? '#cbd5e1' : '#64748b'
            }}>
                {isLocked ? <Lock size={16} /> : <ArrowRight size={18} />}
            </button>
        </div>
    );


    return (
        <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>

            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
                        {t('system_overview') || 'System Overview'}
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1rem' }}>
                        {t('real_time_monitoring') || 'Real-time monitoring of all business modules.'}
                    </p>
                </div>
                {/* BayVision Status Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '8px 16px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                    <div style={{
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: isAnalyzing ? '#f59e0b' : '#10b981',
                        boxShadow: isAnalyzing ? '0 0 10px #f59e0b' : 'none'
                    }}></div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>BayVision: {isAnalyzing ? t('analyzing') : t('active')}</span>
                </div>
            </header>

            {/* AI Intelligence Row */}
            <div style={{ marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                {/* Alerts Section */}
                <div style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fff 100%)', border: '1px solid #fee2e2', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}><AlertTriangle size={80} /></div>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: '800', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Zap size={18} fill="#991b1b" /> {t('decision_support_alerts')} ({intelligence.alerts.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {intelligence.alerts.length > 0 ? intelligence.alerts.map(alert => (
                            <div key={alert.id} style={{ background: 'white', padding: '12px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', borderLeft: '4px solid #ef4444' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>{alert.title}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{alert.message}</div>
                                <button
                                    onClick={() => {
                                        if (alert.id === 'unpaid-invoices') {
                                            switchPanel('accounting');
                                            setTimeout(() => navigate('/archive'), 100);
                                        } else if (alert.id === 'low-stock') {
                                            switchPanel('stock');
                                            setTimeout(() => navigate('/stock/products'), 100);
                                        }
                                    }}
                                    style={{ marginTop: '8px', padding: '4px 10px', borderRadius: '6px', border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                                >
                                    {t('take_action', 'Harekete Geç')}
                                </button>
                                <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '4px', fontWeight: '600' }}>{t('source')}: {alert.agent}</div>
                            </div>
                        )) : (
                            <div style={{ color: '#059669', fontSize: '0.9rem', fontStyle: 'italic' }}>{t('no_risks_detected')}</div>
                        )}
                    </div>
                </div>

                {/* Opportunities Section */}
                <div style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #fff 100%)', border: '1px solid #e0f2fe', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}><TrendingUp size={80} /></div>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: '800', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={18} fill="#0369a1" /> {t('growth_opportunities')} ({intelligence.opportunities.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {intelligence.opportunities.length > 0 ? intelligence.opportunities.map(opp => (
                            <div key={opp.id} style={{ background: 'white', padding: '12px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', borderLeft: '4px solid #3b82f6' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>{opp.title}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{opp.message}</div>
                                <button
                                    onClick={() => {
                                        if (opp.id === 'logo-gen') {
                                            switchPanel('website');
                                            setTimeout(() => navigate('/website/editor'), 100);
                                        } else if (opp.id === 'ads-opportunity') {
                                            switchPanel('website');
                                            setTimeout(() => navigate('/website/settings'), 100);
                                        }
                                    }}
                                    style={{ marginTop: '8px', padding: '4px 10px', borderRadius: '6px', border: '1px solid #3b82f6', background: 'transparent', color: '#3b82f6', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                                >
                                    {t('take_action', 'Harekete Geç')}
                                </button>
                            </div>
                        )) : (
                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{t('collecting_data_for_opportunities')}</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Top Metrics Grid */}
            <div className="grid-cols-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                <MetricCard
                    title={t('total_revenue') || 'Toplam Ciro'}
                    value={new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(totalRevenue)}
                    numericValue={totalRevenue}
                    subtext={`${t('cash')}: ${new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cashInHand)}`}
                    icon={TrendingUp}
                    color="#2563eb"
                    trend={revenueTrend}
                />
                <MetricCard
                    title={t('total_expenses') || t('expenses') || 'Toplam Gider'}
                    value={new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(totalExpenses)}
                    numericValue={totalExpenses}
                    subtext={`${expenseData.length} ${t('registered_transactions')}`}
                    icon={TrendingDown}
                    color="#ef4444"
                    trend={expenseRatio}
                    percentageType="ratio"
                />
                <MetricCard
                    title={t('net_profit') || 'Net Kâr'}
                    value={new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(netProfit)}
                    numericValue={netProfit}
                    subtext={t('cash_balance')}
                    icon={Activity}
                    color="#10b981"
                    trend={profitMargin}
                    percentageType="ratio"
                />
                <MetricCard
                    title={t('total_unpaid') || t('unpaid_invoices') || 'Bekleyen Tahsilat'}
                    value={new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(totalUnpaid)}
                    numericValue={totalUnpaid}
                    subtext={t('sent_overdue_invoices_report')}
                    icon={CreditCard}
                    color="#f59e0b"
                />
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                {/* Financial Performance Chart */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>{t('financial_performance')}</h3>
                        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                            {['week', 'month', 'year'].map(range => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    style={{
                                        padding: '6px 12px', border: 'none', borderRadius: '6px',
                                        background: timeRange === range ? 'white' : 'transparent',
                                        color: timeRange === range ? '#0f172a' : '#64748b',
                                        fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer',
                                        boxShadow: timeRange === range ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                                    }}
                                >
                                    {t(range)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(val) => `€${val}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`€${value.toLocaleString()}`, '']}
                                />
                                <Area type="monotone" dataKey="revenue" name={t('income')} stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                                <Area type="monotone" dataKey="expenses" name={t('expense')} stroke="#ef4444" fillOpacity={1} fill="url(#colorExp)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Expense Distribution Pie Chart */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                    <h3 style={{ margin: '0 0 24px 0', fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>{t('expense_distribution') || 'Gider Dağılımı'}</h3>
                    <div style={{ height: '300px', width: '100%', display: 'flex', alignItems: 'center' }}>
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => [`€${value.toLocaleString()}`, 'Tutar']}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend
                                        layout="vertical"
                                        align="right"
                                        verticalAlign="middle"
                                        iconType="circle"
                                        formatter={(value, entry) => (
                                            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{value}</span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ width: '100%', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                                {t('noData') || 'Henüz gider verisi bulunmuyor.'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '32px' }}>

                {/* Main Interaction Area: Online Sales & Stock Intelligent Dashboard */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Online Sales Card */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Globe size={24} className="text-primary" />
                                {t('online_sales_dashboard') || 'Online Sales Dashboard'}
                            </h3>
                            <span className="badge success">{t('live') || 'LIVE'}</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                                <div style={{ fontSize: '0.85rem', color: '#1e40af', marginBottom: '4px' }}>{t('total_online_revenue') || 'Total Online Revenue'}</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e3a8a' }}>€{onlineSalesTotal.toLocaleString()}</div>
                            </div>
                            <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                                <div style={{ fontSize: '0.85rem', color: '#166534', marginBottom: '4px' }}>{t('total_orders') || 'Total Orders'}</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#14532d' }}>{onlineOrdersCount}</div>
                            </div>
                        </div>

                        {/* Critical Stock Alert Section */}
                        <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertTriangle size={18} className="text-danger" />
                                {t('critical_stock_levels') || 'Critical Stock Levels'}
                            </h4>

                            {criticalStockItems.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {criticalStockItems.slice(0, 5).map(item => (
                                        <div key={item.id} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '10px 14px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fee2e2'
                                        }}>
                                            <span style={{ fontWeight: '600', color: '#7f1d1d' }}>{item.name}</span>
                                            <span style={{ fontSize: '0.85rem', color: '#b91c1c', fontWeight: 'bold' }}>
                                                {item.stock} {t('left') || 'left'}
                                            </span>
                                        </div>
                                    ))}
                                    {criticalStockItems.length > 5 && (
                                        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', marginTop: '8px' }}>
                                            + {criticalStockItems.length - 5} {t('more_items') || 'more items'}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center', color: '#64748b' }}>
                                    <CheckCircle size={20} style={{ marginBottom: '4px', opacity: 0.5 }} />
                                    {t('stock_levels_healthy') || 'Stock levels healthy'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Strategic Financial Insights */}
                    <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '24px', borderRadius: '16px', color: 'white', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '10px', color: '#3b82f6' }}>
                                <Sparkles size={20} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>{t('strategic_insights')}</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {t('tax_provision')}
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                                    €{estimatedTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                                    {t('calculated_with_rate').replace('{rate}', companyProfile?.taxRate || 19)}
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {t('cash_safety')}
                                </div>
                                <div style={{
                                    fontSize: '0.85rem', fontWeight: '700', padding: '4px 10px', borderRadius: '6px', display: 'inline-block',
                                    background: cashReserveHealth === 'healthy' ? '#065f46' : (cashReserveHealth === 'warning' ? '#92400e' : '#991b1b'),
                                    color: cashReserveHealth === 'healthy' ? '#34d399' : (cashReserveHealth === 'warning' ? '#fbbf24' : '#f87171')
                                }}>
                                    {cashReserveHealth === 'healthy' ? t('status_healthy') : (cashReserveHealth === 'warning' ? t('status_warning') : t('status_critical'))}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                                    {t('cash_safety_desc')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side Panel: Module Quick Status */}
                <div>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: '700', color: '#475569' }}>{t('module_connections') || 'Module Connections'}</h3>

                    <ModuleStatus
                        name={t('module_accounting_name') || 'Rechnung'}
                        status={t('active') || "Active"}
                        color="var(--primary)"
                        icon={CreditCard}
                        onClick={() => switchPanel('accounting')}
                        isLocked={false} // Accounting is usually basic
                    />

                    <ModuleStatus
                        name={t('module_appointments_name') || 'Appointments'}
                        status={todaysAppointments.length > 0 ? `${todaysAppointments.length} ${t('today') || 'Today'}` : (t('status_idle') || 'Idle')}
                        color="#8b5cf6"
                        icon={Calendar}
                        onClick={() => {
                            if (!isActivePremium) {
                                if (!isPremiumAcct) setShowUpgradeModal(true);
                                else switchPanel('settings'); // Go to settings to activate
                            } else {
                                switchPanel('appointments');
                            }
                        }}
                        isLocked={!isActivePremium}
                        requirementMet={isPremiumAcct}
                    />
                    <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', opacity: !isActivePremium ? 0.6 : 1 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
                            {t('todays_schedule') || "Today's Schedule"}
                        </div>
                        {todaysAppointments.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {todaysAppointments.slice(0, 3).map((apt, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                                        <div style={{ fontWeight: '600', color: 'var(--primary)', minWidth: '45px' }}>
                                            {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {apt.clientName || 'Client'}
                                        </div>
                                    </div>
                                ))}
                                {todaysAppointments.length > 3 && (
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', marginTop: '4px' }}>
                                        + {todaysAppointments.length - 3} more
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                {t('no_appointments_today') || 'No appointments for today.'}
                            </div>
                        )}
                    </div>

                    <ModuleStatus
                        name={t('module_stock_name') || "Stock & Sales"}
                        status={lowStockItems > 0 ? (t('status_attention') || 'Attention') : (t('active') || 'Active')}
                        color="#10b981"
                        icon={ShoppingCart}
                        onClick={() => {
                            if (!isActivePremium) {
                                if (!isPremiumAcct) setShowUpgradeModal(true);
                                else switchPanel('settings');
                            } else {
                                switchPanel('stock');
                            }
                        }}
                        isLocked={!isActivePremium}
                        requirementMet={isPremiumAcct}
                    />
                    {lowStockItems > 0 && (
                        <div style={{
                            background: '#fef2f2',
                            border: '1px solid #fee2e2',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '12px',
                            opacity: !isActivePremium ? 0.6 : 1
                        }}>
                            <AlertTriangle size={14} />
                            <span>{lowStockItems} {t('items_low_stock') || 'items with low stock'}</span>
                        </div>
                    )}

                    <ModuleStatus
                        name={t('live_website') || "Live Website"}
                        status={isWebsiteLive ? (t('active') || 'Active') : (t('status_unpublished') || 'Unpublished')}
                        color="#f59e0b"
                        icon={Globe}
                        onClick={() => {
                            if (!isActivePremium) {
                                if (!isPremiumAcct) setShowUpgradeModal(true);
                                else switchPanel('settings');
                            } else {
                                switchPanel('website');
                            }
                        }}
                        isLocked={!isActivePremium}
                        requirementMet={isPremiumAcct}
                    />
                </div>
            </div>

            <AnimatePresence>
                {showUpgradeModal && (
                    <PremiumUpgradeModal
                        isOpen={showUpgradeModal}
                        onClose={() => setShowUpgradeModal(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default SystemOverview;
