import React, { useState } from 'react';
import { Search, Plus, Filter, Trash2, Check, XCircle, Clock } from 'lucide-react';
import { useAppointments } from '../../context/AppointmentContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const BookingsList = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { appointments, services, staff, deleteAppointment, updateAppointment } = useAppointments();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const handleStatusChange = async (id, newStatus) => {
        await updateAppointment(id, { status: newStatus });
    };

    const handleReschedule = async (appt) => {
        const newDate = window.prompt(t('enter_new_date', 'Yeni tarihi giriniz (YYYY-MM-DD):'), appt.date);
        if (!newDate) return;
        const newTime = window.prompt(t('enter_new_time', 'Yeni saati giriniz (HH:MM):'), appt.time);
        if (!newTime) return;

        await updateAppointment(appt.id, {
            date: newDate,
            time: newTime,
            status: 'pending' // Mark as pending again when rescheduled
        });
    };

    const filteredAppointments = appointments.filter(a => {
        const matchesSearch = a.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.customerPhone.includes(searchQuery) ||
            a.notes.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return '#10b981';
            case 'pending': return '#f59e0b';
            case 'cancelled': return '#ef4444';
            default: return '#6b7280';
        }
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1>{t('appointment_list', 'Randevu Listesi')}</h1>
                    <p>{t('appointment_list_desc', 'Tüm randevuları yönetin ve detayları görüntüleyin')}</p>
                </div>
                <button className="primary-btn" onClick={() => navigate('/appointments/calendar')}>
                    <Plus size={20} />
                    {t('add_appointment', 'Yeni Randevu')}
                </button>
            </header>

            <div className="card">
                <div className="table-controls" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-body)', padding: '8px 12px', borderRadius: '8px', minWidth: '300px' }}>
                        <Search size={18} className="text-muted" />
                        <input
                            type="text"
                            placeholder={t('search_customers_placeholder', 'Müşteri adı, telefon veya not ara...')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ border: 'none', background: 'transparent', marginLeft: '8px', width: '100%', outline: 'none' }}
                        />
                    </div>

                    <div className="filters" style={{ display: 'flex', gap: '8px' }}>
                        {['all', 'confirmed', 'pending', 'cancelled', 'completed'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`btn ${filterStatus === status ? 'active' : ''}`}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: filterStatus === status ? '1px solid var(--primary)' : '1px solid var(--border)',
                                    background: filterStatus === status ? 'var(--primary-light)' : 'white',
                                    color: filterStatus === status ? 'var(--primary)' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {status === 'all' ? t('all') : t(`status_${status.toLowerCase()}`, status)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="table-container">
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-body)', textAlign: 'left' }}>
                                <th style={{ padding: '12px' }}>{t('date_time', 'Tarih / Saat')}</th>
                                <th style={{ padding: '12px' }}>{t('customer', 'Müşteri')}</th>
                                <th style={{ padding: '12px' }}>{t('service_staff', 'Hizmet / Personel')}</th>
                                <th style={{ padding: '12px' }}>{t('payment', 'Ödeme')}</th>
                                <th style={{ padding: '12px' }}>{t('notes', 'Notlar')}</th>
                                <th style={{ padding: '12px' }}>{t('status', 'Durum')}</th>
                                <th style={{ padding: '12px', textAlign: 'right' }}>{t('actions', 'İşlemler')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAppointments.length > 0 ? (
                                filteredAppointments.map(appt => {
                                    const service = services.find(s => String(s.id) === String(appt.serviceId));
                                    const staffMember = staff?.find(s => String(s.id) === String(appt.staffId));
                                    return (
                                        <tr key={appt.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '12px' }}>
                                                <div style={{ fontWeight: '600' }}>{new Date(appt.date).toLocaleDateString()}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{appt.time}</div>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <div style={{ fontWeight: '500' }}>{appt.customerName}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{appt.customerPhone}</div>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <span className="badge" style={{ background: `${service?.color}20`, color: service?.color, marginBottom: '4px', display: 'inline-block' }}>
                                                    {service?.name || '---'}
                                                </span>
                                                {staffMember && (
                                                    <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: staffMember.color }}></div>
                                                        {staffMember.name}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <span
                                                    className="payment-badge"
                                                    style={{
                                                        color: appt.paymentStatus === 'paid' ? '#10b981' : '#f59e0b',
                                                        fontWeight: '600',
                                                        fontSize: '0.8rem',
                                                        display: 'flex', alignItems: 'center', gap: '4px'
                                                    }}
                                                >
                                                    {appt.paymentStatus === 'paid' ? t('paid', 'Ödendi') : t('unpaid', 'Ödenmedi')}
                                                    <span style={{ color: 'var(--text-main)' }}>({appt.amount}€)</span>
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px', color: 'var(--text-muted)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {appt.notes || '-'}
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <span className="status-badge" style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    background: `${getStatusColor(appt.status)}20`,
                                                    color: getStatusColor(appt.status),
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {t(`status_${appt.status.toLowerCase()}`, appt.status)}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right', display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                                                {appt.status === 'pending' && (
                                                    <button
                                                        className="icon-btn success"
                                                        onClick={() => handleStatusChange(appt.id, 'confirmed')}
                                                        title={t('approve', 'Onayla')}
                                                        style={{ color: '#10b981', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                )}

                                                {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                                                    <button
                                                        className="icon-btn reschedule"
                                                        onClick={() => handleReschedule(appt)}
                                                        title={t('postpone', 'Ertele')}
                                                        style={{ color: '#3b82f6', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                                    >
                                                        <Clock size={18} />
                                                    </button>
                                                )}

                                                {appt.status !== 'cancelled' && (
                                                    <button
                                                        className="icon-btn danger"
                                                        onClick={() => handleStatusChange(appt.id, 'cancelled')}
                                                        title={t('reject', 'Reddet / İptal Et')}
                                                        style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                )}

                                                <button
                                                    className="icon-btn delete"
                                                    onClick={() => {
                                                        if (window.confirm(t('confirm_delete_appointment', 'Bu randevuyu silmek istediğinize emin misiniz?'))) {
                                                            deleteAppointment(appt.id);
                                                        }
                                                    }}
                                                    title={t('delete', 'Sil')}
                                                    style={{ color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        {t('no_records_found', 'Kayıt bulunamadı.')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BookingsList;
