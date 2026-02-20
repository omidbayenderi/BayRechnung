import React from 'react';
import { Calendar, Users, CheckCircle, Clock, AlertCircle, ArrowUpRight, ArrowRight, MoreHorizontal, Filter } from 'lucide-react';
import { useAppointments } from '../../context/AppointmentContext';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';

const AppointmentDashboard = () => {
    const { t } = useLanguage();
    const { appointments, services } = useAppointments();
    const today = new Date().toISOString().split('T')[0];

    const todayAppointments = appointments.filter(a => a.date === today);
    const pendingAppointments = appointments.filter(a => a.status === 'pending');
    const upcomingAppointments = appointments.filter(a => a.date > today).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5);

    const stats = [
        {
            title: t('stats_today_appts'),
            value: todayAppointments.length,
            icon: Calendar,
            color: '#3b82f6',
            bg: '#eff6ff',
            subtext: t('daily_load', 'Daily Load')
        },
        {
            title: t('stats_pending_appts'),
            value: pendingAppointments.length,
            icon: Clock,
            color: '#f59e0b',
            bg: '#fffbeb',
            subtext: t('action_required', 'Action Required')
        },
        {
            title: t('stats_total_services'),
            value: services.length,
            icon: CheckCircle,
            color: '#10b981',
            bg: '#ecfdf5',
            subtext: t('active_catalog', 'Active Catalog')
        },
    ];

    return (
        <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            {/* Header */}
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', letterSpacing: '-1px', marginBottom: '8px' }}>{t('dashboard_overview')}</h1>
                    <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '600px', lineHeight: '1.5' }}>
                        {t('dashboard_subtitle')}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <Link to="/appointments/calendar" style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'white', color: '#0f172a', border: '1px solid #e2e8f0',
                        padding: '12px 24px', borderRadius: '12px', fontWeight: '600',
                        textDecoration: 'none', transition: 'all 0.2s',
                        fontSize: '14px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}>
                        <Calendar size={18} /> {t('view_calendar')}
                    </Link>
                    <Link to="/appointments/bookings" style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: '#0f172a', color: 'white', border: 'none',
                        padding: '12px 24px', borderRadius: '12px', fontWeight: '600',
                        textDecoration: 'none', transition: 'all 0.2s',
                        fontSize: '14px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                        <ArrowUpRight size={18} /> {t('all_records')}
                    </Link>
                </div>
            </header>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} style={{
                            background: 'white', padding: '32px', borderRadius: '20px',
                            border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '24px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.03), 0 4px 6px -2px rgba(0, 0, 0, 0.01)',
                            transition: 'transform 0.2s', cursor: 'default'
                        }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '16px',
                                background: stat.bg, color: stat.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Icon size={32} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', lineHeight: '1', marginBottom: '4px' }}>{stat.value}</h3>
                                <p style={{ color: '#64748b', fontSize: '15px', fontWeight: '500' }}>{stat.title}</p>
                                <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>{stat.subtext}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '32px' }}>

                {/* Left Column: Today's Schedule */}
                <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' }}>
                    <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>{t('todays_schedule')}</h2>
                            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '2px' }}>{new Date().toLocaleDateString(t('locale', 'de-DE'), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <button style={{ background: 'transparent', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b' }}>
                            <Filter size={14} /> {t('filter')}
                        </button>
                    </div>

                    <div style={{ padding: '0' }}>
                        {todayAppointments.length === 0 ? (
                            <div style={{ padding: '64px', textAlign: 'center', color: '#94a3b8' }}>
                                <div style={{ width: '80px', height: '80px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                    <Calendar size={32} opacity={0.4} />
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>{t('free_today')}</h3>
                                <p>{t('free_today_desc')}</p>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: '#f8fafc', color: '#64748b', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    <tr>
                                        <th style={{ padding: '16px 32px', fontWeight: '600', width: '120px' }}>{t('booking_step_time')}</th>
                                        <th style={{ padding: '16px 32px', fontWeight: '600' }}>{t('customer')}</th>
                                        <th style={{ padding: '16px 32px', fontWeight: '600' }}>{t('booking_step_service')}</th>
                                        <th style={{ padding: '16px 32px', fontWeight: '600' }}>{t('status')}</th>
                                        <th style={{ padding: '16px 32px', fontWeight: '600', width: '50px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {todayAppointments.sort((a, b) => a.time.localeCompare(b.time)).map((appt, i) => {
                                        const service = services.find(s => s.id === parseInt(appt.serviceId));
                                        return (
                                            <tr key={appt.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.1s' }}>
                                                <td style={{ padding: '20px 32px', fontFamily: 'monospace', fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>
                                                    {appt.time}
                                                </td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                                                            {appt.customerName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>{appt.customerName}</div>
                                                            <div style={{ fontSize: '13px', color: '#64748b' }}>{appt.customerPhone}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: service?.color || '#cbd5e1' }}></span>
                                                        <span style={{ color: '#334155', fontWeight: '500' }}>{service?.name || 'Bilinmeyen Hizmet'}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <span style={{
                                                        padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                                                        background: appt.status === 'confirmed' ? '#dcfce7' : appt.status === 'pending' ? '#fef3c7' : '#f1f5f9',
                                                        color: appt.status === 'confirmed' ? '#15803d' : appt.status === 'pending' ? '#b45309' : '#64748b'
                                                    }}>
                                                        {appt.status === 'confirmed' ? 'Onaylı' : appt.status === 'pending' ? 'Bekliyor' : 'Diğer'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                                        <MoreHorizontal size={20} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Right Column: Pending & Upcoming */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Pending Requests */}
                    <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>{t('pending_requests')}</h3>
                            <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>{pendingAppointments.length}</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {pendingAppointments.length === 0 ? (
                                <p style={{ color: '#94a3b8', fontSize: '14px', fontStyle: 'italic' }}>{t('no_pending_requests', 'Keine ausstehenden Anfragen')}</p>
                            ) : (
                                pendingAppointments.slice(0, 3).map(appt => (
                                    <div key={appt.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{appt.customerName}</span>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>{appt.time}</span>
                                        </div>
                                        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
                                            {services.find(s => s.id === parseInt(appt.serviceId))?.name || 'Hizmet'}
                                        </p>
                                        <Link to="/appointments/bookings" style={{
                                            display: 'block', width: '100%', textAlign: 'center', padding: '8px',
                                            background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px',
                                            color: '#0f172a', fontSize: '13px', fontWeight: '600', textDecoration: 'none'
                                        }}>
                                            {t('view_details', 'Details')}
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Stats or Tips */}
                    <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '24px', padding: '24px', color: 'white' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>{t('tip_title')}</h3>
                        <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '20px' }}>
                            {t('tip_desc')}
                        </p>
                        <button style={{
                            background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
                            padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', width: '100%'
                        }}>
                            {t('go_to_settings')}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AppointmentDashboard;
