import React, { useState, useEffect } from 'react';
import { useAppointments } from '../../context/AppointmentContext';
import {
    Calendar, Clock, User, CheckCircle, ChevronLeft, ArrowLeft, Home,
    Wrench, Car, Droplet, Wind, Zap, Scissors, Briefcase, Sparkles, Disc, CircleDot, CreditCard, Wallet
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useWebsite } from '../../context/WebsiteContext';
import { useLanguage } from '../../context/LanguageContext';

const PublicBookingPage = () => {
    const { services, staff, addAppointment, createPublicBooking, settings } = useAppointments();
    const { siteConfig } = useWebsite();
    const { getT, serviceLanguages, appLanguage } = useLanguage();
    // Prioritize 'website' language preference for public facing booking page
    const t = getT(serviceLanguages?.website || appLanguage);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Determine Back URL (Return to the specific tenant site, not SaaS landing)
    const backUrl = siteConfig?.domain ? `/s/${siteConfig.domain}` : '/s/demo';

    // Initialize State
    const [step, setStep] = useState(1); // 1: Service, 2: Staff, 3: Date/Time, 4: Details, 5: Confirm
    const [bookingData, setBookingData] = useState({
        serviceId: null,
        staffId: null,
        date: '',
        time: '',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        notes: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('onsite'); // 'onsite' | 'online'
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    // WERKSTATT MANAGER DESIGN SYSTEM CONSTANTS
    const DS = {
        primary: '#0B1F3B',    // Professional Dark Navy
        accent: '#F97316',     // Energetic Orange
        bg: '#F6F7FB',         // Modern Light Gray
        surface: '#FFFFFF',    // Clean Cards
        text: '#121826',       // High Contrast Slate
        textSecondary: '#5A6472',
        radius: '12px',        // Standard corner radius
        border: '#E8EAEE',
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        shadowHover: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    };

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

        return Sparkles;
    };

    // Load Fonts
    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }, []);


    // Handle URL Params (e.g. ?service=123)
    useEffect(() => {
        const serviceParam = searchParams.get('service');
        // Only auto-select if we haven't selected a service yet
        if (serviceParam && !bookingData.serviceId) {
            // Validate if service exists
            const serviceExists = services.find(s => String(s.id) === String(serviceParam));
            if (serviceExists) {
                setBookingData(prev => ({ ...prev, serviceId: serviceExists.id }));
                setStep(2); // Skip directly to Staff selection
            }
        }
    }, [searchParams, services, bookingData.serviceId]);

    // Enforce Payment Method for Online Services
    useEffect(() => {
        if (bookingData.serviceId) {
            const svc = services.find(s => s.id === bookingData.serviceId);
            if (svc && svc.name.toLowerCase().includes('online')) {
                setPaymentMethod('online');
            }
        }
    }, [bookingData.serviceId, services]);

    const steps = [
        { num: 1, title: t('booking_step_service') },
        { num: 2, title: t('booking_step_staff') },
        { num: 3, title: t('booking_step_time') },
        { num: 4, title: t('booking_step_details') }
    ];

    const handleServiceSelect = (id) => {
        setBookingData({ ...bookingData, serviceId: id });
        setStep(2);
    };

    const handleStaffSelect = (id) => {
        setBookingData({ ...bookingData, staffId: id });
        setStep(3);
    };

    const handleTimeSelect = (date, time) => {
        setBookingData({ ...bookingData, date, time });
        setStep(4);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Mock Payment Processing
        if (paymentMethod === 'online') {
            setIsProcessingPayment(true);
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            // In a real app, verify Stripe payment here
            setIsProcessingPayment(false);
        }

        const booking = {
            customerName: bookingData.customerName,
            customerPhone: bookingData.customerPhone,
            serviceId: bookingData.serviceId,
            staffId: bookingData.staffId,
            date: bookingData.date,
            time: bookingData.time,
            notes: bookingData.notes,
            paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
            paymentMethod: paymentMethod
        };

        createPublicBooking(booking);

        // 🔔 Create Admin Notification
        const notifs = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
        const serviceName = services.find(s => s.id === bookingData.serviceId)?.name || 'Hizmet';
        const paymentTag = paymentMethod === 'online' ? '💳 ONLINE ÖDENDİ' : '🏠 Yerinde Ödeme';

        notifs.unshift({
            id: Date.now(),
            type: 'booking',
            title: '📅 Yeni Randevu!',
            message: `${booking.customerName} - ${serviceName} (${booking.date} @ ${booking.time}) - ${paymentTag}`,
            read: false,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('admin_notifications', JSON.stringify(notifs));

        setStep(5);
    };

    // Helper to generate time slots (simplified)
    const generateTimeSlots = () => {
        // In a real app, this would check availability against existing appointments
        const slots = [];
        const start = parseInt(settings.workingHours.start.split(':')[0]);
        const end = parseInt(settings.workingHours.end.split(':')[0]);
        for (let i = start; i < end; i++) {
            slots.push(`${i}:00`);
            slots.push(`${i}:30`);
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];

    return (
        <div style={{
            minHeight: '100vh',
            background: DS.bg,
            padding: '40px 20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            fontFamily: '"Inter", sans-serif',
            color: DS.text
        }}>
            <div style={{
                width: '100%',
                maxWidth: '650px',
                background: 'white',
                borderRadius: DS.radius,
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
            }}>

                {/* Header */}
                <div style={{ background: DS.primary, padding: '32px', color: 'white', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {step > 1 && step < 5 && (
                                <button onClick={() => setStep(step - 1)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '10px', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                                    <ChevronLeft size={20} />
                                </button>
                            )}
                            <div>
                                <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>{t('booking_title')}</h1>
                                <div style={{ fontSize: '0.75rem', color: DS.accent, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '4px' }}>{t('booking_subtitle')}</div>
                            </div>
                        </div>
                        <Link to={backUrl} style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
                            <Home size={20} />
                        </Link>
                    </div>
                    {step < 5 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 10px' }}>
                            <div style={{ position: 'absolute', top: '12px', left: '40px', right: '40px', height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}></div>
                            {steps.map(s => (
                                <div key={s.num} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                    <div style={{
                                        width: '24px', height: '24px', borderRadius: '50%',
                                        background: step === s.num ? DS.accent : step > s.num ? 'white' : 'rgba(255,255,255,0.1)',
                                        color: step >= s.num && step !== s.num ? DS.primary : 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.75rem', fontWeight: '800',
                                        transition: 'all 0.3s'
                                    }}>
                                        {step > s.num ? <CheckCircle size={14} /> : s.num}
                                    </div>
                                    <span style={{ fontSize: '0.7rem', color: step === s.num ? 'white' : 'rgba(255,255,255,0.4)', fontWeight: step === s.num ? '700' : '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.title}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>


                {/* Content */}
                <div style={{ padding: '24px' }}>



                    {/* Step 1: Services */}
                    {step === 1 && (
                        <div>
                            <div style={{ marginBottom: '32px' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px', color: DS.primary }}>{t('booking_select_service_title')}</h2>
                                <p style={{ fontSize: '0.9rem', color: DS.textSecondary }}>{t('booking_select_service_desc')}</p>
                            </div>
                            <div style={{ display: 'grid', gap: '16px' }}>
                                {services.map(service => {
                                    const ServiceIcon = getServiceIcon(service.name);
                                    return (
                                        <div
                                            key={service.id}
                                            onClick={() => handleServiceSelect(service.id)}
                                            style={{
                                                border: '1px solid ' + DS.border,
                                                borderRadius: '16px',
                                                padding: '24px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                background: 'white',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = DS.accent;
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = DS.shadow;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = DS.border;
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: service.color ? `${service.color}10` : `${DS.primary}08`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: service.color || DS.primary }}>
                                                    <ServiceIcon size={28} strokeWidth={1.5} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '800', fontSize: '1.1rem', color: DS.primary, marginBottom: '4px' }}>{service.name}</div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: DS.textSecondary }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} style={{ color: DS.accent }} /> {service.duration} Dakika</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: '900', color: DS.primary, fontSize: '1.4rem', letterSpacing: '-0.5px' }}>{Number(service.price).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}


                    {/* Step 2: Staff */}
                    {step === 2 && (
                        <div>
                            <div style={{ marginBottom: '32px' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px', color: DS.primary }}>{t('booking_select_staff_title')}</h2>
                                <p style={{ fontSize: '0.9rem', color: DS.textSecondary }}>{t('booking_select_staff_desc')}</p>
                            </div>
                            <div style={{ display: 'grid', gap: '16px' }}>
                                <div
                                    onClick={() => handleStaffSelect('any')}
                                    style={{
                                        border: '1px solid ' + DS.border, borderRadius: '16px', padding: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '20px', transition: 'all 0.2s', background: 'white'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = DS.accent}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = DS.border}
                                >
                                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: DS.textSecondary }}>
                                        <User size={28} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '800', fontSize: '1.1rem', color: DS.primary, marginBottom: '4px' }}>{t('booking_any_staff')}</div>
                                        <div style={{ fontSize: '0.85rem', color: DS.textSecondary }}>{t('booking_any_staff_desc')}</div>
                                    </div>
                                </div>
                                {staff.map(member => (
                                    <div
                                        key={member.id}
                                        onClick={() => handleStaffSelect(member.id)}
                                        style={{ border: '1px solid ' + DS.border, borderRadius: '16px', padding: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '20px', transition: 'all 0.2s', background: 'white' }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = DS.accent}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = DS.border}
                                    >
                                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: member.color + '20', color: member.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.2rem' }}>
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '800', fontSize: '1.1rem', color: DS.primary, marginBottom: '4px' }}>{member.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: DS.accent, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>{member.role}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                    {/* Step 3: Date & Time */}
                    {step === 3 && (
                        <div>
                            <div style={{ marginBottom: '32px' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px', color: DS.primary }}>{t('booking_schedule_title')}</h2>
                                <p style={{ fontSize: '0.9rem', color: DS.textSecondary }}>{t('booking_schedule_desc')}</p>
                            </div>
                            {/* Improved Date Selection */}
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '12px' }}>
                                {[today, tomorrow].map(date => (
                                    <button
                                        key={date}
                                        onClick={() => setBookingData({ ...bookingData, date })}
                                        style={{
                                            padding: '16px 24px',
                                            borderRadius: '12px',
                                            border: bookingData.date === date ? `2px solid ${DS.accent}` : `1px solid ${DS.border}`,
                                            background: bookingData.date === date ? DS.primary : 'white',
                                            color: bookingData.date === date ? 'white' : DS.text,
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                            transition: 'all 0.2s',
                                            minWidth: '140px'
                                        }}
                                    >
                                        <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '4px', textTransform: 'uppercase' }}>{date === today ? 'Bugün' : 'Yarın'}</div>
                                        {new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                                    </button>
                                ))}
                            </div>

                            {bookingData.date && (
                                <div>
                                    <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '16px', color: DS.textSecondary, textTransform: 'uppercase', letterSpacing: '1px' }}>{t('booking_available_hours')}</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                        {timeSlots.map(time => (
                                            <button
                                                key={time}
                                                onClick={() => handleTimeSelect(bookingData.date, time)}
                                                style={{
                                                    padding: '14px',
                                                    borderRadius: '10px',
                                                    border: '1px solid ' + DS.border,
                                                    background: 'white',
                                                    color: DS.primary,
                                                    fontWeight: '700',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.borderColor = DS.accent;
                                                    e.currentTarget.style.background = '#fef3c7';
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.borderColor = DS.border;
                                                    e.currentTarget.style.background = 'white';
                                                }}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}


                    {/* Step 4: Details */}
                    {step === 4 && (
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '32px' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px', color: DS.primary }}>{t('booking_contact_title')}</h2>
                                <p style={{ fontSize: '0.9rem', color: DS.textSecondary }}>{t('booking_contact_desc')}</p>
                            </div>

                            <div style={{ display: 'grid', gap: '24px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: DS.textSecondary }}>Adınız Soyadınız</label>
                                    <input
                                        style={{
                                            padding: '14px 18px', borderRadius: '10px', border: '1px solid ' + DS.border, background: '#f9fafb', fontSize: '1rem', outline: 'none', transition: 'all 0.2s'
                                        }}
                                        onFocus={e => e.currentTarget.style.borderColor = DS.accent}
                                        onBlur={e => e.currentTarget.style.borderColor = DS.border}
                                        required
                                        value={bookingData.customerName}
                                        onChange={(e) => setBookingData({ ...bookingData, customerName: e.target.value })}
                                        placeholder="Örn: Ahmet Yılmaz"
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: DS.textSecondary }}>Telefon Numaranız</label>
                                    <input
                                        style={{
                                            padding: '14px 18px', borderRadius: '10px', border: '1px solid ' + DS.border, background: '#f9fafb', fontSize: '1rem', outline: 'none'
                                        }}
                                        required
                                        value={bookingData.customerPhone}
                                        onChange={(e) => setBookingData({ ...bookingData, customerPhone: e.target.value })}
                                        placeholder="+90 5xx xxx xx xx"
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: DS.textSecondary }}>E-Posta (Opsiyonel)</label>
                                    <input
                                        type="email"
                                        style={{
                                            padding: '14px 18px', borderRadius: '10px', border: '1px solid ' + DS.border, background: '#f9fafb', fontSize: '1rem', outline: 'none'
                                        }}
                                        value={bookingData.customerEmail}
                                        onChange={(e) => setBookingData({ ...bookingData, customerEmail: e.target.value })}
                                        placeholder="ahmet@example.com"
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: DS.textSecondary }}>{t('booking_notes_placeholder')}</label>
                                    <textarea
                                        style={{
                                            padding: '14px 18px', borderRadius: '10px', border: '1px solid ' + DS.border, background: '#f9fafb', fontSize: '1rem', outline: 'none', resize: 'vertical'
                                        }}
                                        rows="3"
                                        value={bookingData.notes}
                                        onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                                        placeholder={t('booking_notes_placeholder')}
                                    />
                                </div>
                            </div>

                            {/* Payment Preference */}
                            <div style={{ marginTop: '24px' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: '700', color: DS.textSecondary, marginBottom: '12px', display: 'block' }}>Ödeme Yöntemi</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                    {/* Onsite Option */}
                                    <div
                                        onClick={() => {
                                            const svc = services.find(s => s.id === bookingData.serviceId);
                                            if (svc && svc.name.toLowerCase().includes('online')) {
                                                alert('Online hizmetler için online ödeme zorunludur.');
                                                return;
                                            }
                                            setPaymentMethod('onsite');
                                        }}
                                        style={{
                                            border: paymentMethod === 'onsite' ? `2px solid ${DS.primary}` : `1px solid ${DS.border}`,
                                            background: paymentMethod === 'onsite' ? '#f8fafc' : 'white',
                                            borderRadius: '12px', padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px',
                                            opacity: services.find(s => s.id === bookingData.serviceId)?.name.toLowerCase().includes('online') ? 0.5 : 1,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: DS.primary }}>
                                            <Home size={18} />
                                            İşletmede Öde
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: DS.textSecondary }}>Randevu saatinde nakit veya kartla ödeyin.</div>
                                    </div>

                                    {/* Stripe Option */}
                                    {settings?.stripePublicKey && (
                                        <div
                                            onClick={() => setPaymentMethod('stripe')}
                                            style={{
                                                border: paymentMethod === 'stripe' ? `2px solid #6366f1` : `1px solid ${DS.border}`,
                                                background: paymentMethod === 'stripe' ? '#eef2ff' : 'white',
                                                borderRadius: '12px', padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#4f46e5' }}>
                                                <CreditCard size={18} />
                                                Kredi Kartı (Stripe)
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: DS.textSecondary }}>Güvenli kredi kartı ödemesi.</div>
                                        </div>
                                    )}

                                    {/* PayPal Option */}
                                    {settings?.paypalClientId && (
                                        <div
                                            onClick={() => setPaymentMethod('paypal')}
                                            style={{
                                                border: paymentMethod === 'paypal' ? `2px solid #003087` : `1px solid ${DS.border}`,
                                                background: paymentMethod === 'paypal' ? '#eff6ff' : 'white',
                                                borderRadius: '12px', padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#003087' }}>
                                                <Wallet size={18} />
                                                PayPal
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: DS.textSecondary }}>PayPal hesabınızla hızlı ödeyin.</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Summary Detail */}
                            <div style={{ marginTop: '32px', padding: '24px', background: DS.primary, borderRadius: '16px', color: 'white' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ opacity: 0.7 }}>Seçili Hizmet:</span>
                                    <span style={{ fontWeight: '700' }}>{services.find(s => s.id === bookingData.serviceId)?.name}</span>
                                </div>
                                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '12px 0' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div>
                                        <div style={{ opacity: 0.7, fontSize: '0.85rem' }}>Toplam Tutar:</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: '900' }}>{Number(services.find(s => s.id === bookingData.serviceId)?.price).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isProcessingPayment}
                                        style={{
                                            background: paymentMethod !== 'onsite' ? (paymentMethod === 'paypal' ? '#003087' : '#6366f1') : DS.accent,
                                            color: 'white',
                                            border: 'none',
                                            padding: '16px 32px',
                                            borderRadius: '10px',
                                            fontWeight: '800',
                                            fontSize: '1rem',
                                            cursor: isProcessingPayment ? 'not-allowed' : 'pointer',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            opacity: isProcessingPayment ? 0.8 : 1
                                        }}
                                    >
                                        {isProcessingPayment ? 'İşleniyor...' : (paymentMethod !== 'onsite' ? `Öde (${paymentMethod}) ve Randevu Al` : 'Randevuyu Onayla')}
                                        {!isProcessingPayment && (paymentMethod !== 'onsite' ? <CreditCard size={18} /> : <CheckCircle size={18} />)}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}


                    {/* Step 5: Success */}
                    {step === 5 && (
                        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <div style={{ width: '100px', height: '100px', background: '#d1fae5', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', boxShadow: '0 20px 40px -10px rgba(16, 185, 129, 0.2)' }}>
                                <CheckCircle size={56} strokeWidth={1.5} />
                            </div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: DS.primary, marginBottom: '16px', letterSpacing: '-0.5px' }}>{t('booking_success_title')}</h2>
                            <p style={{ color: DS.textSecondary, marginBottom: '48px', lineHeight: '1.6', fontSize: '1.1rem' }}>
                                <strong>{bookingData.customerName}</strong>, {t('booking_success_desc')}
                            </p>
                            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                                <button
                                    onClick={() => navigate(backUrl)}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '10px', background: DS.primary, color: 'white', border: 'none', padding: '18px 40px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', letterSpacing: '0.5px', transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <Home size={18} /> Ana Sayfaya Dön
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Footer Progress (Back button for steps < 5) */}
                    {step < 5 && (
                        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid ' + DS.border, textAlign: 'center' }}>
                            <Link to={backUrl} style={{ color: DS.textSecondary, textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <ArrowLeft size={16} /> {t('booking_back_website')}
                            </Link>
                        </div>
                    )}


                </div> {/* End of Card Content */}
            </div> {/* End of Card */}



        </div> // Main Container
    );
};

export default PublicBookingPage;
