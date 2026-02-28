import React from 'react';
import { useInvoice } from '../context/InvoiceContext';
import { useAppointments } from '../context/AppointmentContext';
import { motion } from 'framer-motion';
import {
    FileText, TrendingUp, TrendingDown, Users, Clock, Send, BarChart3,
    Sparkles, ArrowRight, LayoutDashboard, AlertCircle, CheckCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import DashboardChart from '../components/DashboardChart';
import QuickAddAppointmentModal from '../components/QuickAddAppointmentModal';
import QuickAddExpenseModal from '../components/QuickAddExpenseModal';
import AiInsights from '../components/dashboard/AiInsights';
import { usePlanGuard } from '../hooks/usePlanGuard';
import { aiService } from '../services/AiService';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="card stat-card"
        style={{ borderTop: `4px solid ${color}` }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
    >
        <div className="stat-icon" style={{ color: color, background: `${color}15` }}>
            <Icon size={24} />
        </div>
        <div className="stat-content">
            <h3>{title}</h3>
            <p className="stat-value">{value}</p>
        </div>
    </motion.div>
);

const Dashboard = () => {
    const { totalInvoices, invoices, expenses, companyProfile } = useInvoice();
    const { appointments, services } = useAppointments(); // Get appointments
    const { t } = useLanguage();
    const { isPremium } = usePlanGuard();

    const totalRevenue = (invoices || []).filter(inv => inv).reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
    const totalExpenses = (expenses || []).filter(e => e).reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    const debts = (invoices || []).filter(inv => inv && inv.status !== 'paid').reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
    const profit = totalRevenue - totalExpenses;

    const isProfit = profit >= 0;
    const profitColor = isProfit ? '#10b981' : '#ef4444';
    const ProfitIcon = isProfit ? TrendingUp : TrendingDown;

    const formatCurr = (val) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);

    // Filter appointments for Today
    const today = new Date().toISOString().split('T')[0];
    const todaysAppointments = appointments
        .filter(app => app.date === today && app.status !== 'cancelled')
        .sort((a, b) => a.time.localeCompare(b.time));

    const getServiceName = (id) => {
        const s = services.find(srv => srv.id === parseInt(id));
        return s ? s.name : 'Unknown Service';
    };

    const navigate = useNavigate();
    const [showQuickAdd, setShowQuickAdd] = React.useState(false);
    const [showQuickExpense, setShowQuickExpense] = React.useState(false);
    const [aiInsights, setAiInsights] = React.useState([]);
    const [morningSummary, setMorningSummary] = React.useState('');
    const [isLoadingAi, setIsLoadingAi] = React.useState(true);

    React.useEffect(() => {
        const loadAi = async () => {
            setIsLoadingAi(true);
            const insights = await aiService.generateInsights({ invoices, expenses, appointments, companyProfile, t });
            const summary = await aiService.getMorningSummary({ appointments, t });
            setAiInsights(insights);
            setMorningSummary(summary);
            setIsLoadingAi(false);
        };
        loadAi();
    }, [invoices, expenses, appointments, companyProfile, t]);

    // Smart Reminders Logic
    // Find appointments that are:
    // 1. Date is today or in the past
    // 2. Status is 'confirmed' (assuming confirmed means the job is active/done)
    // 3. PaymentStatus is 'unpaid'
    const todayStr = new Date().toISOString().split('T')[0];
    const unpaidJobs = appointments.filter(app => {
        return app.status === 'confirmed' &&
            app.paymentStatus === 'unpaid' &&
            app.date <= todayStr;
    });

    const handleConvertToInvoice = (app) => {
        const serviceName = getServiceName(app.serviceId);
        navigate('/new', {
            state: {
                prefill: {
                    recipientName: app.customerName,
                    items: [{
                        description: serviceName,
                        quantity: 1,
                        price: app.amount || 0
                    }]
                }
            }
        });
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1>{t('welcome')}, {(companyProfile?.owner || 'User').split(' ')[0]}</h1>
                    <p>{t('overviewText')}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="primary-btn" onClick={() => setShowQuickAdd(true)} style={{ backgroundColor: '#8b5cf6' }}>
                        + {t('addJob') || 'Hızlı İş Ekle'}
                    </button>
                    <button className="secondary-btn" onClick={() => setShowQuickExpense(true)} style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                        - {t('addExpense') || 'Gider Ekle'}
                    </button>
                    <Link to="/new" className="primary-btn">
                        + {t('newInvoice')}
                    </Link>
                </div>
            </header>

            <QuickAddAppointmentModal isOpen={showQuickAdd} onClose={() => setShowQuickAdd(false)} />
            <QuickAddExpenseModal isOpen={showQuickExpense} onClose={() => setShowQuickExpense(false)} />

            {/* AI Smart Summary & Professional Insights */}
            <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '24px' }}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                    style={{
                        background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                        border: '1px solid #ddd6fe',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <div style={{ background: 'var(--primary)', color: 'white', padding: '6px', borderRadius: '8px' }}>
                            <Sparkles size={18} />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#4c1d95' }}>{t('ai_title') || 'BayZenit Akıllı Özet'}</h2>
                    </div>

                    <p style={{ fontSize: '1.2rem', color: '#5b21b6', fontWeight: '500', margin: 0, lineHeight: '1.6' }}>
                        {isLoadingAi ? (
                            <span style={{ display: 'block', height: '20px', background: 'rgba(76, 29, 149, 0.1)', borderRadius: '4px', width: '80%', animation: 'pulse 1.5s infinite linear' }}></span>
                        ) : morningSummary}
                    </p>
                </motion.div>

                {isPremium() && <AiInsights invoices={invoices} expenses={expenses} />}

                {/* Manager Quick Actions (Only for Premium) */}
                {isPremium() && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card glass premium-card"
                        style={{ padding: '24px', gridColumn: 'span 1' }}
                    >
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                            {t('manager_quick_actions')}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <button className="secondary-btn" onClick={() => navigate('/users')} style={{ padding: '12px', fontSize: '0.9rem' }}>
                                <Users size={18} /> {t('addWorker')}
                            </button>
                            <button className="secondary-btn" onClick={() => navigate('/messages')} style={{ padding: '12px', fontSize: '0.9rem' }}>
                                <Send size={18} /> {t('sendSiteNotice')}
                            </button>
                            <button className="secondary-btn" onClick={() => navigate('/reports')} style={{ padding: '12px', fontSize: '0.9rem' }}>
                                <BarChart3 size={18} /> {t('financeReport')}
                            </button>
                            <button className="primary-btn" onClick={() => navigate('/admin/analytics')} style={{ padding: '12px', fontSize: '0.9rem' }}>
                                <TrendingUp size={18} /> {t('usageAnalytics')}
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Smart Reminders Section */}
            {unpaidJobs.length > 0 && (
                <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {unpaidJobs.slice(0, 3).map(job => (
                        <div key={job.id} className="alert-card" style={{
                            background: '#fff7ed',
                            border: '1px solid #fdba74',
                            color: '#c2410c',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <AlertCircle size={20} />
                                <div>
                                    <strong>{t('reminder') || 'Hatırlatma'}:</strong> {job.customerName} - {getServiceName(job.serviceId)} ({job.date})
                                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{t('jobDoneNotPaid') || 'İş tamamlandı ama henüz fatura kesilmedi.'}</div>
                                </div>
                            </div>
                            <button
                                className="primary-btn"
                                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                                onClick={() => handleConvertToInvoice(job)}
                            >
                                <FileText size={14} style={{ marginRight: '4px' }} />
                                {t('createInvoice') || 'Fatura Kes'}
                            </button>
                        </div>
                    ))}
                    {unpaidJobs.length > 3 && (
                        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            + {unpaidJobs.length - 3} {t('morePendingJobs') || 'bekleyen iş daha var...'}
                        </div>
                    )}
                </div>
            )}

            <div className="stats-grid">
                <StatCard
                    title={t('revenue')}
                    value={formatCurr(totalRevenue)}
                    icon={TrendingUp}
                    color="#3b82f6"
                />
                <StatCard
                    title={t('netProfit')}
                    value={formatCurr(profit)}
                    icon={ProfitIcon}
                    color={profitColor}
                />
                <StatCard
                    title={t('expenses')}
                    value={formatCurr(totalExpenses)}
                    icon={Clock}
                    color="#ef4444"
                />
                <StatCard
                    title={t('debts')}
                    value={formatCurr(debts)}
                    icon={TrendingDown}
                    color="#f59e0b"
                />
            </div>

            {/* Main Content Grid: Chart + Agenda */}
            <div className="dashboard-main-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '24px' }}>

                {/* Left: Financial Chart */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <DashboardChart
                        revenue={totalRevenue}
                        profit={profit}
                        expenses={totalExpenses}
                    />
                </div>

                {/* Right: Today's Agenda */}
                <div className="card" style={{ height: 'fit-content', minHeight: '400px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={20} className="text-primary" />
                            {t('todaysAgenda') || 'Bugünün İşleri'}
                        </h3>
                        <Link to="/appointments/bookings" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>
                            {t('viewAll') || 'Tümünü Gör'}
                        </Link>
                    </div>

                    <div className="agenda-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {todaysAppointments.length === 0 ? (
                            <div className="empty-state-small" style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                                <Clock size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                                <p>{t('noAppointmentsToday') || 'Bugün için planlanmış iş yok.'}</p>
                                <button className="secondary-btn" onClick={() => setShowQuickAdd(true)} style={{ marginTop: '12px', fontSize: '0.8rem' }}>
                                    + {t('addJob') || 'İş Ekle'}
                                </button>
                            </div>
                        ) : (
                            todaysAppointments.map(app => (
                                <div key={app.id} className="agenda-item" style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    display: 'flex',
                                    gap: '12px',
                                    alignItems: 'center',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer'
                                }}>
                                    <div className="time-badge" style={{
                                        background: 'var(--bg-body)',
                                        padding: '6px 10px',
                                        borderRadius: '6px',
                                        fontWeight: '600',
                                        color: 'var(--text-main)',
                                        fontSize: '0.9rem',
                                        minWidth: '60px',
                                        textAlign: 'center'
                                    }}>
                                        {app.time}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{app.customerName}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{getServiceName(app.serviceId)}</div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleConvertToInvoice(app); }}
                                            title={t('convertToInvoice') || 'Faturaya Dönüştür'}
                                            style={{
                                                background: '#ecfdf5',
                                                color: '#10b981',
                                                border: '1px solid #10b981',
                                                borderRadius: '6px',
                                                padding: '4px',
                                                cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                        >
                                            <FileText size={14} />
                                        </button>
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: app.status === 'confirmed' ? '#10b981' : '#f59e0b'
                                        }} title={app.status}></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="recent-section" style={{ marginTop: '24px' }}>
                <h2>{t('recentInvoices')}</h2>
                <div className="invoice-list card">
                    {invoices.length === 0 ? (
                        <div className="empty-state">
                            <p>{t('loading')}</p>
                        </div>
                    ) : (
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>{t('invoiceNumber')}</th>
                                    <th>{t('customer')}</th>
                                    <th>{t('date')}</th>
                                    <th>{t('total')}</th>
                                    <th>{t('status')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.slice(0, 5).map(inv => (
                                    <tr key={inv.id}>
                                        <td>{inv.invoiceNumber}</td>
                                        <td>{inv.recipientName}</td>
                                        <td>{new Date(inv.date).toLocaleDateString('de-DE')}</td>
                                        <td>{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(inv.total)}</td>
                                        <td><span className="badge success">{t(inv.status || 'paid')}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
