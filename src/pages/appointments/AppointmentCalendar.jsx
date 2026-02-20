import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, Plus, X, Lock } from 'lucide-react';
import { useAppointments } from '../../context/AppointmentContext';
import { useLanguage } from '../../context/LanguageContext';

const AppointmentCalendar = () => {
    const { t } = useLanguage();
    const { appointments, services, settings, addAppointment, addBlock, deleteAppointment } = useAppointments();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('week'); // week, day
    const [selectedSlot, setSelectedSlot] = useState(null); // { date: 'YYYY-MM-DD', time: 'HH:MM' }
    const [showModal, setShowModal] = useState(false);
    const [newApptData, setNewApptData] = useState({ customerName: '', customerPhone: '', serviceId: '' });

    const handlePrev = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
        else newDate.setDate(newDate.getDate() - 1);
        setCurrentDate(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
        else newDate.setDate(newDate.getDate() + 1);
        setCurrentDate(newDate);
    };

    const getWeekDays = (date) => {
        const start = new Date(date);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        start.setDate(diff);

        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const weekDays = getWeekDays(currentDate);

    // Generate time slots based on working hours
    const startHour = parseInt(settings.workingHours?.start?.split(':')[0] || '09');
    const endHour = parseInt(settings.workingHours?.end?.split(':')[0] || '18');
    const timeSlots = [];
    for (let i = startHour; i < endHour; i++) {
        timeSlots.push(`${i.toString().padStart(2, '0')}:00`);
        timeSlots.push(`${i.toString().padStart(2, '0')}:30`);
    }

    const handleSlotClick = (dateStr, time) => {
        // Toggle selection
        if (selectedSlot?.date === dateStr && selectedSlot?.time === time) {
            setSelectedSlot(null);
        } else {
            setSelectedSlot({ date: dateStr, time });
        }
    };

    const handleAddBlock = () => {
        if (!selectedSlot) return;
        addBlock(selectedSlot.date, selectedSlot.time, 60, t('break_closed', 'Mola / Kapalı'));
        setSelectedSlot(null);
    };

    const handleAddAppointmentClick = (e) => {
        e.stopPropagation();
        setNewApptData({ customerName: '', customerPhone: '', serviceId: services[0]?.id || '' });
        setShowModal(true);
    };

    const submitAppointment = async (e) => {
        e.preventDefault();
        if (!selectedSlot || !newApptData.serviceId) return;

        await addAppointment({
            date: selectedSlot.date,
            time: selectedSlot.time,
            customerName: newApptData.customerName,
            customerPhone: newApptData.customerPhone,
            serviceId: parseInt(newApptData.serviceId),
            notes: 'Calendar quick add'
        });

        setShowModal(false);
        setSelectedSlot(null);
    };

    // Check if a time is within the daily break period
    const isBreakTime = (time) => {
        if (!settings.breaks?.enabled) return false;
        return time >= settings.breaks.start && time < settings.breaks.end;
    };

    return (
        <div className="page-container" style={{ position: 'relative' }}>
            <header className="page-header">
                <div>
                    <h1>{t('appointment_calendar', 'Randevu Takvimi')}</h1>
                    <p>{t('weekly_daily_view', 'Haftalık ve Günlük Görünüm')}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className={`btn ${viewMode === 'week' ? 'primary' : 'secondary'}`} onClick={() => setViewMode('week')}>{t('week', 'Hafta')}</button>
                    <button className={`btn ${viewMode === 'day' ? 'primary' : 'secondary'}`} onClick={() => setViewMode('day')}>{t('day', 'Gün')}</button>
                </div>
            </header>

            <div className="card" style={{ padding: '0', overflow: 'hidden', height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
                {/* Calendar Controls */}
                <div className="calendar-header" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
                    <button onClick={handlePrev} className="icon-btn"><ChevronLeft /></button>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                        {currentDate.toLocaleDateString(t('locale', 'tr-TR'), { month: 'long', year: 'numeric' })}
                        {viewMode === 'week' && ` - ${t('week', 'Hafta')} ${Math.ceil(currentDate.getDate() / 7)}`}
                    </h2>
                    <button onClick={handleNext} className="icon-btn"><ChevronRight /></button>
                </div>

                {/* Calendar Grid */}
                <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', flex: 1, overflow: 'auto' }}>

                    {/* Header Row (Days) */}
                    <div style={{ padding: '12px', background: '#f8fafc', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid var(--border)' }}></div>
                    {weekDays.map((day, i) => (
                        <div key={i} style={{
                            padding: '12px',
                            background: '#f8fafc',
                            textAlign: 'center',
                            borderBottom: '1px solid var(--border)',
                            borderRight: '1px solid var(--border)',
                            position: 'sticky', top: 0, zIndex: 10,
                            color: day.toDateString() === new Date().toDateString() ? 'var(--primary)' : 'inherit',
                            opacity: settings.workingDays.includes(day.toLocaleDateString('en-US', { weekday: 'short' })) ? 1 : 0.5
                        }}>
                            <div style={{ fontWeight: '600' }}>{day.toLocaleDateString(t('locale', 'tr-TR'), { weekday: 'short' })}</div>
                            <div style={{ fontSize: '1.2rem' }}>{day.getDate()}</div>
                        </div>
                    ))}

                    {/* Time Slots */}
                    {timeSlots.map(time => (
                        <React.Fragment key={time}>
                            {/* Time Label */}
                            <div style={{ padding: '8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', borderBottom: '1px solid var(--border)', position: 'sticky', left: 0, background: 'white', zIndex: 5 }}>
                                {time}
                            </div>

                            {/* Day Cells */}
                            {weekDays.map((day, i) => {
                                const dayStr = day.toISOString().split('T')[0];
                                const isSelected = selectedSlot?.date === dayStr && selectedSlot?.time === time;
                                const isDailyBreak = isBreakTime(time);

                                // Find appointments or blocks
                                const slotItems = appointments.filter(a => {
                                    if (!a.date || !a.time) return false;
                                    return a.date === dayStr && a.time === time; // Simplified exact match for now
                                });

                                return (
                                    <div
                                        key={i}
                                        onClick={() => !isDailyBreak && handleSlotClick(dayStr, time)}
                                        style={{
                                            borderRight: '1px solid var(--border)',
                                            borderBottom: '1px solid var(--border)',
                                            position: 'relative',
                                            background: isDailyBreak ? '#f3f4f6' : isSelected ? 'var(--primary-light)' : 'white',
                                            cursor: isDailyBreak ? 'not-allowed' : 'pointer',
                                            minHeight: '60px'
                                        }}
                                    >
                                        {/* Daily Break Check */}
                                        {isDailyBreak && (
                                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.75rem', letterSpacing: '1px' }}>
                                                {t('break_time', 'MOLA')}
                                            </div>
                                        )}

                                        {/* Render items */}
                                        {slotItems.map(item => {
                                            if (item.type === 'block') {
                                                return (
                                                    <div key={item.id} style={{
                                                        position: 'absolute', top: 1, left: 1, right: 1, bottom: 1,
                                                        background: '#e5e7eb', borderRadius: '4px', padding: '4px',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', zIndex: 2
                                                    }}>
                                                        <Lock size={12} style={{ marginRight: '4px' }} /> {item.notes}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); deleteAppointment(item.id); }}
                                                            style={{ position: 'absolute', top: 2, right: 2, border: 'none', background: 'none', cursor: 'pointer', padding: 2 }}
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                );
                                            }

                                            const service = services?.find(s => s.id === parseInt(item.serviceId));
                                            return (
                                                <div key={item.id} style={{
                                                    position: 'absolute', top: 1, left: 1, right: 1, bottom: 1,
                                                    background: `${service?.color || 'var(--primary)'}20`,
                                                    borderLeft: `3px solid ${service?.color || 'var(--primary)'}`,
                                                    borderRadius: '4px', padding: '4px', fontSize: '0.75rem', overflow: 'hidden', zIndex: 3
                                                }}>
                                                    <div style={{ fontWeight: '600' }}>{item.customerName}</div>
                                                    <div>{service?.name}</div>
                                                </div>
                                            );
                                        })}

                                        {/* Selection Popup */}
                                        {isSelected && slotItems.length === 0 && !isDailyBreak && (
                                            <div style={{
                                                position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                                                background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: '8px', padding: '8px',
                                                zIndex: 20, minWidth: '140px', display: 'flex', flexDirection: 'column', gap: '4px'
                                            }}>
                                                <button
                                                    className="btn"
                                                    style={{ fontSize: '0.8rem', justifyContent: 'flex-start' }}
                                                    onClick={handleAddAppointmentClick}
                                                >
                                                    <Plus size={14} /> {t('add_appointment', 'Randevu Ekle')}
                                                </button>
                                                <button
                                                    className="btn"
                                                    style={{ fontSize: '0.8rem', justifyContent: 'flex-start', color: '#ef4444' }}
                                                    onClick={(e) => { e.stopPropagation(); handleAddBlock(); }}
                                                >
                                                    <Lock size={14} /> {t('block_time', 'Saati Kapat')}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Quick Add Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', position: 'relative'
                    }}>
                        <button
                            onClick={() => { setShowModal(false); setSelectedSlot(null); }}
                            style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                        >
                            <X size={24} />
                        </button>

                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: '#1e293b' }}>
                            {t('add_appointment', 'Yeni Randevu Ekle')}
                        </h2>

                        <form onSubmit={submitAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '14px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                                <span>{selectedSlot?.date}</span>
                                <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{selectedSlot?.time}</span>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>{t('customer_name', 'Müşteri Adı')}</label>
                                <input
                                    type="text"
                                    required
                                    value={newApptData.customerName}
                                    onChange={e => setNewApptData({ ...newApptData, customerName: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>{t('phone', 'Telefon')}</label>
                                <input
                                    type="text"
                                    value={newApptData.customerPhone}
                                    onChange={e => setNewApptData({ ...newApptData, customerPhone: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>{t('service', 'Hizmet')}</label>
                                <select
                                    required
                                    value={newApptData.serviceId}
                                    onChange={e => setNewApptData({ ...newApptData, serviceId: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }}
                                >
                                    <option value="" disabled>{t('select_service', 'Hizmet Seçin...')}</option>
                                    {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.duration} dk)</option>)}
                                </select>
                            </div>

                            <button
                                type="submit"
                                style={{
                                    marginTop: '8px',
                                    background: '#0f172a', color: 'white', border: 'none',
                                    padding: '16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px',
                                    cursor: 'pointer', transition: 'background 0.2s', width: '100%'
                                }}
                            >
                                {t('save', 'Kaydet')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentCalendar;
