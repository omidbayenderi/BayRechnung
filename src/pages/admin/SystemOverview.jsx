import React, { useState, useEffect } from 'react';
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
    X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumUpgradeModal from '../../components/admin/PremiumUpgradeModal';


const SystemOverview = () => {
    const { t } = useLanguage();
    const { invoices, expenses, employees } = useInvoice();
    const { appointments } = useAppointments();
    const { sales, products } = useStock();
    const { siteConfig } = useWebsite();
    const { switchPanel } = usePanel();

    const { currentUser } = useAuth();
    const { companyProfile } = useInvoice(); // Need this for active plan
    const [timeRange, setTimeRange] = useState('month'); // week, month, year
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const isPremiumAcct = currentUser?.plan === 'premium';
    const isActivePremium = companyProfile?.plan === 'premium';

    // --- Aggregated Metrics ---

    // 1. Financials (Invoices + POS Sales - Expenses)
    const invoiceRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const stockRevenue = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const totalRevenue = invoiceRevenue + stockRevenue;
    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;

    // 2. Operational
    const activeStaff = employees.length;
    const criticalStockItems = products.filter(p => p.stock <= (p.minStock || 3));
    const lowStockItems = criticalStockItems.length;

    // Filter appointments for TODAY only
    const today = new Date();
    const todaysAppointments = appointments.filter(a => {
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

    // --- Chart Data Preparation (Mock Simulated History based on current totals) ---
    const generateChartData = () => {
        // In a real app, we would group actual dated records.
        // For visual demo, we'll distribute the totals over a curve.
        const data = [];
        const points = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 12;
        const labels = timeRange === 'week' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] :
            timeRange === 'year' ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] :
                Array.from({ length: 30 }, (_, i) => i + 1);

        let currentRevenue = totalRevenue * 0.4; // Start lower
        let currentExpense = totalExpenses * 0.4;

        for (let i = 0; i < points; i++) {
            // Add some randomness and trend up
            const revStep = (totalRevenue * 0.6) / points;
            const expStep = (totalExpenses * 0.6) / points;

            currentRevenue += revStep * (0.8 + Math.random() * 0.4);
            currentExpense += expStep * (0.8 + Math.random() * 0.4);

            data.push({
                name: labels[i % labels.length],
                revenue: Math.round(currentRevenue),
                expenses: Math.round(currentExpense),
                profit: Math.round(currentRevenue - currentExpense)
            });
        }
        return data;
    };

    const chartData = generateChartData();


    // --- Helper Components ---
    const MetricCard = ({ title, value, subtext, icon: Icon, color, trend }) => (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            border: '1px solid #f1f5f9'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: `${color}15`, // 15% opacity
                    color: color
                }}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: trend > 0 ? '#10b981' : '#ef4444',
                        background: trend > 0 ? '#d1fae5' : '#fee2e2',
                        padding: '4px 8px',
                        borderRadius: '20px'
                    }}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500', marginBottom: '4px' }}>{title}</div>
            <div style={{ fontSize: '1.875rem', fontWeight: '800', color: '#1e293b', letterSpacing: '-0.5px' }}>{value}</div>
            {subtext && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>{subtext}</div>}
        </div>
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

            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
                    {t('system_overview') || 'System Overview'}
                </h1>
                <p style={{ color: '#64748b', fontSize: '1rem' }}>
                    {t('real_time_monitoring') || 'Real-time monitoring of all business modules.'}
                </p>
            </header>

            {/* Top Metrics Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
                marginBottom: '40px'
            }}>
                <MetricCard
                    title={t('total_revenue') || 'Total Revenue'}
                    value={`€${totalRevenue.toLocaleString()}`}
                    subtext={t('accounting_pos_sales') || "Accounting + POS Sales"}
                    icon={Activity}
                    color="#3b82f6"
                    trend={12.5}
                />
                <MetricCard
                    title={t('net_profit') || 'Net Profit'}
                    value={`€${netProfit.toLocaleString()}`}
                    subtext={t('revenue_expenses') || "Revenue - Expenses"}
                    icon={TrendingUp}
                    color="#10b981"
                    trend={8.2}
                />
                <MetricCard
                    title={t('active_staff') || 'Active Staff'}
                    value={activeStaff}
                    subtext={t('users_with_access') || "Users with access"}
                    icon={Users}
                    color="#8b5cf6"
                />
                <MetricCard
                    title={t('system_health') || 'System Health'}
                    value="98%"
                    subtext={t('all_modules_operational') || "All modules operational"}
                    icon={CheckCircle}
                    color="#f59e0b"
                />
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
                                    <div>{t('stock_levels_healthy') || 'Stock levels helpthy'}</div>
                                </div>
                            )}
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
