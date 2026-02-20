import React, { useState } from 'react';
import {
    Plus, Trash2, Edit2, Save, X, Wrench, Clock, DollarSign,
    Car, Droplet, Wind, Zap, Scissors, Briefcase, Sparkles, Disc, CircleDot
} from 'lucide-react';
import { useAppointments } from '../../context/AppointmentContext';
import { useLanguage } from '../../context/LanguageContext';

const ServiceSettings = () => {
    const { t } = useLanguage();
    const { services, addService, updateService, deleteService } = useAppointments();
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        duration: 30,
        color: '#3b82f6'
    });

    // Helper to select icon based on service name
    const getServiceIcon = (serviceName) => {
        const lower = serviceName.toLowerCase();
        if (lower.includes('motor') || lower.includes('mekanik') || lower.includes('tamir')) return Wrench;
        if (lower.includes('lastik') || lower.includes('jant') || lower.includes('balans')) return CircleDot;
        if (lower.includes('fren') || lower.includes('disk')) return Disc;
        if (lower.includes('klima') || lower.includes('gaz') || lower.includes('havalandırma')) return Wind;
        if (lower.includes('yağ') || lower.includes('sıvı') || lower.includes('yıkama') || lower.includes('temiz')) return Droplet;
        if (lower.includes('akü') || lower.includes('elektrik') || lower.includes('şarj') || lower.includes('lamba')) return Zap;
        if (lower.includes('kaporta') || lower.includes('boya')) return Car;
        if (lower.includes('saç') || lower.includes('sakal') || lower.includes('kesim') || lower.includes('bakım')) return Scissors;
        if (lower.includes('danışman') || lower.includes('muhasebe') || lower.includes('görüşme')) return Briefcase;

        return Sparkles; // Default generic icon
    };

    const handleAddClick = () => {
        setEditingService(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            duration: 30,
            color: '#3b82f6'
        });
        setShowModal(true);
    };

    const handleEditClick = (service) => {
        setEditingService(service);
        setFormData(service);
        setShowModal(true);
    };

    const handleDeleteClick = (id) => {
        if (window.confirm(t('confirm_delete_service', 'Bu hizmeti silmek istediğinizden emin misiniz?'))) {
            deleteService(id);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingService) {
            updateService({ ...formData, id: editingService.id });
        } else {
            addService(formData);
        }

        setShowModal(false);
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }} >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>{t('service_management', 'Hizmet Yönetimi')}</h1>
                    <p style={{ color: '#64748b' }}>{t('service_management_desc', 'Randevu sisteminde gösterilecek hizmetleri buradan yönetebilirsiniz.')}</p>
                </div>
                <button
                    onClick={handleAddClick}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: '#3b82f6', color: 'white', border: 'none',
                        padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold',
                        cursor: 'pointer', transition: 'background 0.2s'
                    }}
                >
                    <Plus size={20} /> {t('add_new_service', 'Yeni Hizmet Ekle')}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {services.length > 0 ? (
                    services.map(service => {
                        const ServiceIcon = getServiceIcon(service.name);
                        return (
                            <div key={service.id} style={{
                                background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0',
                                padding: '24px', position: 'relative', overflow: 'hidden',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                            }}>
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, width: '6px', height: '100%',
                                    background: service.color
                                }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', paddingLeft: '12px' }}>
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '10px',
                                        background: `${service.color}15`, color: service.color,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <ServiceIcon size={24} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => handleEditClick(service)}
                                            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(service.id)}
                                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div style={{ paddingLeft: '12px' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>{service.name}</h3>
                                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5', height: '42px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical' }}>
                                        {service.description || (t('no_description', 'Açıklama yok'))}
                                    </p>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '14px' }}>
                                            <Clock size={16} /> {service.duration} dk
                                        </div>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>
                                            {Number(service.price).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div style={{ gridColumn: '1 / -1', padding: '48px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0', color: '#94a3b8' }}>
                        <Wrench size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>{t('no_services_added', 'Henüz hizmet eklenmedi')}</h3>
                        <p>{t('add_new_service_start', 'Yeni bir hizmet ekleyerek başlayın.')}</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '500px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', position: 'relative'
                    }}>
                        <button
                            onClick={() => setShowModal(false)}
                            style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                        >
                            <X size={24} />
                        </button>

                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#1e293b' }}>
                            {editingService ? (t('edit_service', 'Hizmeti Düzenle')) : (t('add_new_service', 'Yeni Hizmet Ekle'))}
                        </h2>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>{t('service_name', 'Hizmet Adı')}</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder={t('service_name_placeholder') || "Örn: Motor Bakımı"}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>{t('description', 'Açıklama')}</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder={t('service_desc_placeholder') || "Hizmet detayları..."}
                                    rows="3"
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>{t('price', 'Fiyat')} (€)</label>
                                    <div style={{ position: 'relative' }}>
                                        <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            style={{ width: '100%', padding: '12px 12px 12px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>{t('duration', 'Süre')} (dk)</label>
                                    <div style={{ position: 'relative' }}>
                                        <Clock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input
                                            type="number"
                                            required
                                            min="5"
                                            step="5"
                                            value={formData.duration}
                                            onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                            style={{ width: '100%', padding: '12px 12px 12px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>{t('color_tag', 'Renk Etiketi')}</label>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'].map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color })}
                                            style={{
                                                width: '32px', height: '32px', borderRadius: '50%', background: color,
                                                border: formData.color === color ? '3px solid white' : 'none',
                                                boxShadow: formData.color === color ? '0 0 0 2px #94a3b8' : 'none',
                                                cursor: 'pointer'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                style={{
                                    marginTop: '8px',
                                    background: '#0f172a', color: 'white', border: 'none',
                                    padding: '16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px',
                                    cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}
                            >
                                <Save size={20} /> {t('save', 'Kaydet')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div >
    );
};

export default ServiceSettings;
