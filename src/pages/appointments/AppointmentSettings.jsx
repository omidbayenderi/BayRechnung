import React, { useState } from 'react';
import { useAppointments } from '../../context/AppointmentContext';
import { useLanguage } from '../../context/LanguageContext';
import { Plus, Trash2, Clock, Users } from 'lucide-react';

const AppointmentSettings = () => {
    const { settings, staff, addStaff, deleteStaff, updateSettings } = useAppointments();
    const { t } = useLanguage();

    const [activeTab, setActiveTab] = useState('schedule');

    // Local state for forms
    const [newStaff, setNewStaff] = useState({ name: '', role: '', color: '#3b82f6' });

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
                    <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', maxWidth: '800px' }}>
                        <div className="card">
                            <div className="card-header">
                                <h2>{t('workingHours', 'Çalışma Saatleri & Kurallar')}</h2>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label>{t('startTime', 'Başlangıç')}</label>
                                    <input
                                        type="time"
                                        className="form-input"
                                        value={settings.workingHours.start}
                                        onChange={(e) => updateSettings({ workingHours: { ...settings.workingHours, start: e.target.value } })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t('endTime', 'Bitiş')}</label>
                                    <input
                                        type="time"
                                        className="form-input"
                                        value={settings.workingHours.end}
                                        onChange={(e) => updateSettings({ workingHours: { ...settings.workingHours, end: e.target.value } })}
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginTop: '16px' }}>
                                <label>{t('workingDays', 'Çalışma Günleri')}</label>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                        <button
                                            key={day}
                                            onClick={() => {
                                                const newDays = settings.workingDays.includes(day)
                                                    ? settings.workingDays.filter(d => d !== day)
                                                    : [...settings.workingDays, day];
                                                updateSettings({ workingDays: newDays });
                                            }}
                                            className={`btn ${settings.workingDays.includes(day) ? 'primary' : 'secondary'}`}
                                            style={{ flex: 1, minWidth: '40px', padding: '8px' }}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group" style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <label style={{ margin: 0 }}>{t('lunchBreak', 'Öğle Molası')}</label>
                                    <label className="switch" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={settings.breaks?.enabled || false}
                                            onChange={(e) => updateSettings({ breaks: { ...settings.breaks, enabled: e.target.checked } })}
                                            style={{ marginRight: '8px' }}
                                        />
                                        <span style={{ fontSize: '0.85rem', color: settings.breaks?.enabled ? 'var(--primary)' : 'var(--text-muted)' }}>
                                            {settings.breaks?.enabled ? (t('active', 'Aktif')) : (t('inactive', 'Pasif'))}
                                        </span>
                                    </label>
                                </div>
                                {settings.breaks?.enabled && (
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ flex: 1 }}>
                                            <input
                                                type="time"
                                                className="form-input"
                                                value={settings.breaks?.start || '13:00'}
                                                onChange={(e) => updateSettings({ breaks: { ...settings.breaks, start: e.target.value } })}
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <input
                                                type="time"
                                                className="form-input"
                                                value={settings.breaks?.end || '14:00'}
                                                onChange={(e) => updateSettings({ breaks: { ...settings.breaks, end: e.target.value } })}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="form-group" style={{ marginTop: '24px' }}>
                                <label>{t('holidays', 'Tatil Günleri (Kapalı)')}</label>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                    <input
                                        type="date"
                                        className="form-input"
                                        id="holiday-picker"
                                    />
                                    <button
                                        className="secondary-btn"
                                        onClick={() => {
                                            const date = document.getElementById('holiday-picker').value;
                                            if (date && !settings.holidays?.includes(date)) {
                                                updateSettings({ holidays: [...(settings.holidays || []), date] });
                                            }
                                        }}
                                    >
                                        + {t('add', 'Ekle')}
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {settings.holidays?.map(date => (
                                        <div key={date} style={{
                                            background: '#fee2e2',
                                            color: '#b91c1c',
                                            padding: '4px 12px',
                                            borderRadius: '16px',
                                            fontSize: '0.85rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            {new Date(date).toLocaleDateString()}
                                            <button
                                                onClick={() => updateSettings({ holidays: settings.holidays.filter(d => d !== date) })}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex' }}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
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
                                    Ekip üyesi bulunamadı.
                                </div>
                            ) : (
                                staff.map(member => (
                                    <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border)', background: 'white' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: member.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold' }}>
                                                {member.name.charAt(0)}
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
                                    placeholder="Örn: Ali Veli"
                                    required
                                    value={newStaff.name}
                                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('role', 'Rol / Ünvan')}</label>
                                <input
                                    className="form-input"
                                    placeholder="Örn: Usta, Kalfa"
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
