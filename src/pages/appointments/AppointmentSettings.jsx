import React, { useState } from 'react';
import { useAppointments } from '../../context/AppointmentContext';
import { useLanguage } from '../../context/LanguageContext';
import { Plus, Trash2, Clock, Users, Calendar, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AppointmentSettings = () => {
    const { settings, staff, addStaff, deleteStaff, updateSettings } = useAppointments();
    const { t } = useLanguage();

    const [activeTab, setActiveTab] = useState('schedule');

    // Local state for forms
    const [newStaff, setNewStaff] = useState({ name: '', role: '', color: '#3b82f6' });
    const [localWorkingDays, setLocalWorkingDays] = useState(settings.workingDays || []);
    const [localDailyHours, setLocalDailyHours] = useState(settings.dailyHours || {
        Mon: { start: '09:00', end: '18:00' },
        Tue: { start: '09:00', end: '18:00' },
        Wed: { start: '09:00', end: '18:00' },
        Thu: { start: '09:00', end: '18:00' },
        Fri: { start: '09:00', end: '18:00' },
        Sat: { start: '10:00', end: '16:00' },
        Sun: { start: '10:00', end: '16:00' }
    });

    React.useEffect(() => {
        if (settings.workingDays) setLocalWorkingDays(settings.workingDays);
        if (settings.dailyHours) setLocalDailyHours(settings.dailyHours);
    }, [settings.workingDays, settings.dailyHours]);

    const handleAddStaff = (e) => {
        e.preventDefault();
        addStaff(newStaff);
        setNewStaff({ name: '', role: '', color: '#3b82f6' });
    };

    const tabs = [
        { id: 'schedule', label: t('workingHours', 'Çalışma Saatlerim'), icon: Clock },
        { id: 'staff', label: t('myTeam', 'Ekibim'), icon: Users },
    ];

    return (
        <div className="page-container">
            <header className="page-header" style={{ marginBottom: '24px' }}>
                <div>
                    <h1>{t('businessSettings', 'İşletme Ayarları')}</h1>
                    <p>{t('businessSettingsDesc', 'Hizmetlerinizi, ekibinizi ve çalışma saatlerinizi buradan yönetin.')}</p>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="settings-tabs" style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 16px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                            color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: activeTab === tab.id ? '600' : '500',
                            cursor: 'pointer',
                            fontSize: '0.95rem'
                        }}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="settings-content">
                {/* SCHEDULE TAB */}
                {activeTab === 'schedule' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="settings-grid"
                        style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', maxWidth: '900px' }}
                    >
                        {/* Google Business Style Working Hours */}
                        <div className="card glass premium-card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ background: 'var(--primary-light)', padding: '10px', borderRadius: '12px' }}>
                                        <Calendar className="text-primary" size={24} />
                                    </div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{t('workingHours', 'Çalışma Saatleri')}</h3>
                                </div>
                                <button
                                    onClick={() => {
                                        updateSettings({
                                            workingDays: localWorkingDays,
                                            dailyHours: localDailyHours,
                                            // Compatibility fallbacks for existing code
                                            workingHours: localDailyHours['Mon'],
                                            workingHoursWeekend: localDailyHours['Sat']
                                        });
                                        const btn = document.getElementById('save-all-settings-btn');
                                        if (btn) {
                                            const orig = btn.innerHTML;
                                            btn.innerHTML = '✅ ' + t('saved', 'Kaydedildi');
                                            btn.style.background = '#10b981';
                                            setTimeout(() => {
                                                btn.innerHTML = orig;
                                                btn.style.background = '';
                                            }, 2000);
                                        }
                                    }}
                                    id="save-all-settings-btn"
                                    className="primary-btn"
                                    style={{ padding: '10px 20px', borderRadius: '10px' }}
                                >
                                    <Save size={18} /> {t('save', 'Kaydet')}
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                                    const dayMap = { 'Mon': 'monday', 'Tue': 'tuesday', 'Wed': 'wednesday', 'Thu': 'thursday', 'Fri': 'friday', 'Sat': 'saturday', 'Sun': 'sunday' };
                                    const isOpen = localWorkingDays.includes(day);
                                    const hrs = localDailyHours[day] || { start: '09:00', end: '18:00' };

                                    return (
                                        <div key={day} style={{
                                            display: 'grid',
                                            gridTemplateColumns: '150px 100px 1fr',
                                            alignItems: 'center',
                                            padding: '16px 24px',
                                            background: 'white',
                                            gap: '20px'
                                        }}>
                                            {/* Day Name */}
                                            <div style={{ fontWeight: '600', color: isOpen ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                                {t(`day_${dayMap[day]}`)}
                                            </div>

                                            {/* Toggle */}
                                            <label className="switch" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={isOpen}
                                                    onChange={(e) => {
                                                        const newDays = e.target.checked
                                                            ? [...localWorkingDays, day]
                                                            : localWorkingDays.filter(d => d !== day);
                                                        setLocalWorkingDays(newDays);
                                                    }}
                                                    style={{ display: 'none' }}
                                                />
                                                <div style={{
                                                    width: '40px',
                                                    height: '20px',
                                                    background: isOpen ? 'var(--primary)' : '#e2e8f0',
                                                    borderRadius: '20px',
                                                    position: 'relative',
                                                    transition: 'all 0.3s'
                                                }}>
                                                    <div style={{
                                                        width: '14px',
                                                        height: '14px',
                                                        background: 'white',
                                                        borderRadius: '50%',
                                                        position: 'absolute',
                                                        top: '3px',
                                                        left: isOpen ? '23px' : '3px',
                                                        transition: 'all 0.3s'
                                                    }}></div>
                                                </div>
                                                <span style={{ marginLeft: '8px', fontSize: '0.8rem', fontWeight: '600', color: isOpen ? 'var(--primary)' : 'var(--text-muted)' }}>
                                                    {isOpen ? t('day_open', 'Açık') : t('day_closed', 'Kapalı')}
                                                </span>
                                            </label>

                                            {/* Hours */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: isOpen ? 1 : 0.3, pointerEvents: isOpen ? 'auto' : 'none', flexWrap: 'wrap' }}>
                                                <div style={{ position: 'relative', minWidth: '130px' }}>
                                                    <input
                                                        type="time"
                                                        className="form-input"
                                                        style={{ padding: '8px 12px 8px 34px', fontSize: '0.9rem', height: '38px', borderRadius: '8px', width: '100%' }}
                                                        value={hrs.start}
                                                        onChange={(e) => setLocalDailyHours({
                                                            ...localDailyHours,
                                                            [day]: { ...hrs, start: e.target.value }
                                                        })}
                                                    />
                                                    <Clock size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                                </div>
                                                <span style={{ color: 'var(--text-muted)' }}>-</span>
                                                <div style={{ position: 'relative', minWidth: '130px' }}>
                                                    <input
                                                        type="time"
                                                        className="form-input"
                                                        style={{ padding: '8px 12px 8px 34px', fontSize: '0.9rem', height: '38px', borderRadius: '8px', width: '100%' }}
                                                        value={hrs.end}
                                                        onChange={(e) => setLocalDailyHours({
                                                            ...localDailyHours,
                                                            [day]: { ...hrs, end: e.target.value }
                                                        })}
                                                    />
                                                    <Clock size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.1)', fontSize: '0.85rem', color: '#1e40af' }}>
                                <strong>{t('info')}:</strong> {t('working_hours_info')}
                            </div>
                        </div>

                        {/* BREAKS & HOLIDAYS */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                            {/* Lunch Break */}
                            <div className="card glass premium-card" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ background: 'var(--primary-light)', padding: '10px', borderRadius: '12px' }}>
                                            <Clock className="text-primary" size={20} />
                                        </div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{t('lunchBreak', 'Öğle Molası')}</h3>
                                    </div>
                                    <label className="switch" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={settings.breaks?.enabled || false}
                                            onChange={(e) => updateSettings({ breaks: { ...settings.breaks, enabled: e.target.checked } })}
                                            style={{ display: 'none' }}
                                        />
                                        <div style={{
                                            width: '44px',
                                            height: '24px',
                                            background: settings.breaks?.enabled ? 'var(--primary)' : '#e2e8f0',
                                            borderRadius: '20px',
                                            position: 'relative',
                                            transition: 'all 0.3s'
                                        }}>
                                            <div style={{
                                                width: '18px',
                                                height: '18px',
                                                background: 'white',
                                                borderRadius: '50%',
                                                position: 'absolute',
                                                top: '3px',
                                                left: settings.breaks?.enabled ? '23px' : '3px',
                                                transition: 'all 0.3s',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }}></div>
                                        </div>
                                    </label>
                                </div>

                                {settings.breaks?.enabled && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        style={{ display: 'flex', gap: '12px' }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('startTime')}</label>
                                            <input
                                                type="time"
                                                className="form-input"
                                                value={settings.breaks?.start || '13:00'}
                                                onChange={(e) => updateSettings({ breaks: { ...settings.breaks, start: e.target.value } })}
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('endTime')}</label>
                                            <input
                                                type="time"
                                                className="form-input"
                                                value={settings.breaks?.end || '14:00'}
                                                onChange={(e) => updateSettings({ breaks: { ...settings.breaks, end: e.target.value } })}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Holidays */}
                            <div className="card glass premium-card" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                    <Calendar className="text-danger" size={20} />
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{t('holidays', 'Tatiller')}</h3>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                    <input
                                        type="date"
                                        className="form-input"
                                        id="holiday-picker"
                                        style={{ fontSize: '0.9rem' }}
                                    />
                                    <button
                                        className="primary-btn"
                                        style={{ padding: '0 16px', height: '42px', borderRadius: '10px' }}
                                        onClick={() => {
                                            const date = document.getElementById('holiday-picker').value;
                                            if (date && !settings.holidays?.includes(date)) {
                                                updateSettings({ holidays: [...(settings.holidays || []), date] });
                                            }
                                        }}
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '120px', overflowY: 'auto' }}>
                                    {settings.holidays?.map(date => (
                                        <div key={date} style={{
                                            background: 'rgba(254, 226, 226, 0.5)',
                                            color: '#b91c1c',
                                            padding: '6px 12px',
                                            borderRadius: '10px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            border: '1px solid #fee2e2'
                                        }}>
                                            {new Date(date).toLocaleDateString()}
                                            <button
                                                onClick={() => updateSettings({ holidays: settings.holidays.filter(d => d !== date) })}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex' }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* STAFF TAB */}
                {activeTab === 'staff' && (
                    <div className="card max-w-3xl">
                        <div className="card-header">
                            <h2>{t('teamManagement', 'Personel Yönetimi')}</h2>
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                {t('teamManagementDesc', 'Takım arkadaşlarınızı ekleyin, işleri onlara atayın.')}
                            </p>
                        </div>
                        <div className="staff-list" style={{ marginBottom: '24px' }}>
                            {staff.length === 0 ? (
                                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    {t('no_staff_found')}
                                </div>
                            ) : (
                                staff.map(member => (
                                    <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border)', background: 'white' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: member.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold' }}>
                                                {member.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '1rem' }}>{member.name}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{member.role}</div>
                                            </div>
                                        </div>
                                        {/* Don't allow deleting the last staff member to prevent errors */}
                                        <button
                                            className="icon-btn delete"
                                            onClick={() => deleteStaff(member.id)}
                                            disabled={staff.length <= 1}
                                            title={staff.length <= 1 ? "En az bir personel olmalı" : "Sil"}
                                            style={staff.length <= 1 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                        <form onSubmit={handleAddStaff} style={{ background: 'var(--bg-body)', padding: '24px', borderRadius: '12px' }}>
                            <h4 style={{ margin: '0 0 16px 0' }}>+ {t('addNewStaff', 'Yeni Personel')}</h4>
                            <div className="form-group">
                                <label>{t('fullName', 'Ad Soyad')}</label>
                                <input
                                    className="form-input"
                                    placeholder={t('full_name_placeholder')}
                                    required
                                    value={newStaff.name}
                                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('role', 'Rol / Ünvan')}</label>
                                <input
                                    className="form-input"
                                    placeholder={t('role_placeholder')}
                                    required
                                    value={newStaff.role}
                                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('colorCode', 'Renk Etiketi')}</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'].map(color => (
                                        <div
                                            key={color}
                                            onClick={() => setNewStaff({ ...newStaff, color })}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                background: color,
                                                cursor: 'pointer',
                                                border: newStaff.color === color ? '3px solid var(--text-main)' : '3px solid transparent',
                                                transition: 'all 0.2s'
                                            }}
                                        ></div>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="primary-btn" style={{ width: '100%', padding: '12px' }}>
                                <Plus size={18} /> {t('add', 'Ekle')}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppointmentSettings;
