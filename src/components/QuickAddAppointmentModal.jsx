import React, { useState } from 'react';
import { X, Check, Calendar, Clock, User, Phone, FileText, Briefcase } from 'lucide-react';
import { useAppointments } from '../context/AppointmentContext';
import { useLanguage } from '../context/LanguageContext';

const QuickAddAppointmentModal = ({ isOpen, onClose }) => {
    const { addAppointment, services, staff } = useAppointments();
    const { t } = useLanguage();

    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        serviceId: services[0]?.id || '',
        staffId: staff[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        notes: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        addAppointment({
            ...formData,
            status: 'confirmed',
            paymentStatus: 'unpaid'
        });
        onClose();
        // Reset form for next use (optional, but good UX)
        setFormData({
            customerName: '',
            customerPhone: '',
            serviceId: services[0]?.id || '',
            staffId: staff[0]?.id || '',
            date: new Date().toISOString().split('T')[0],
            time: '09:00',
            notes: ''
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ width: '500px', maxWidth: '95%' }}>
                <div className="modal-header">
                    <h2>{t('quickAddJob') || 'Hızlı İş/Randevu Ekle'}</h2>
                    <button className="icon-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label><User size={16} /> {t('customerName') || 'Müşteri Adı'}</label>
                        <input
                            type="text"
                            className="form-input"
                            required
                            value={formData.customerName}
                            onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                            placeholder="Örn: Ahmet Yılmaz"
                            autoFocus
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label><Phone size={16} /> {t('phone') || 'Telefon'}</label>
                            <input
                                type="tel"
                                className="form-input"
                                value={formData.customerPhone}
                                onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                                placeholder="+49 ..."
                            />
                        </div>
                        <div className="form-group">
                            <label><Briefcase size={16} /> {t('service') || 'Hizmet / İş Tipi'}</label>
                            <select
                                className="form-input"
                                value={formData.serviceId}
                                onChange={e => setFormData({ ...formData, serviceId: e.target.value })}
                            >
                                {services.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.duration}dk - {s.price}€)</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label><Calendar size={16} /> {t('date') || 'Tarih'}</label>
                            <input
                                type="date"
                                className="form-input"
                                required
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label><Clock size={16} /> {t('time') || 'Saat'}</label>
                            <input
                                type="time"
                                className="form-input"
                                required
                                value={formData.time}
                                onChange={e => setFormData({ ...formData, time: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label><FileText size={16} /> {t('notes') || 'Notlar'}</label>
                        <textarea
                            className="form-input"
                            rows="2"
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="İş detayı, özel istekler..."
                        ></textarea>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="secondary-btn" onClick={onClose}>
                            {t('cancel') || 'İptal'}
                        </button>
                        <button type="submit" className="primary-btn">
                            <Check size={18} /> {t('save') || 'Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuickAddAppointmentModal;
