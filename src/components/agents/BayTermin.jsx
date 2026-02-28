import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, CheckCircle, AlertCircle, MessageSquare, Zap, Smartphone } from 'lucide-react';
import { useAppointments } from '../../context/AppointmentContext';
import { useStock } from '../../context/StockContext';
import { useInvoice } from '../../context/InvoiceContext';
import { useLanguage } from '../../context/LanguageContext';

const BayTermin = () => {
    const { appointments, services, updateAppointment } = useAppointments();
    const { products, updateStock } = useStock();
    const { sendMessage } = useInvoice(); // Using internal messaging as simulate SMS/WhatsApp
    const { t } = useLanguage();

    const [lastProcessedAppt, setLastProcessedAppt] = useState(null);
    const [notifications, setNotifications] = useState([]);

    // 1. AUTO-CONSUME MATERIALS
    // logic: when appointment is 'confirmed' or 'completed', check if the service has linked products
    useEffect(() => {
        const checkAppointments = async () => {
            const completed = appointments.filter(a => a.status === 'confirmed' && !a.processedByAI);

            for (const appt of completed) {
                // Find service name
                const service = services.find(s => s.id === appt.serviceId);
                if (!service) continue;

                // RULE: If service name matches a product category or name (Construction mockup)
                // In a real app we'd have explicit links. Here we simulate.
                const linkedProduct = products.find(p =>
                    p.name.toLowerCase().includes(service.name.toLowerCase()) ||
                    service.name.toLowerCase().includes(p.name.toLowerCase())
                );

                if (linkedProduct && linkedProduct.stock > 0) {
                    await updateStock(linkedProduct.id, -1, 'usage', `Randevu: ${appt.customerName} için sarf edildi.`);
                    addNotification(`📦 Stok Güncellendi: ${service.name} hizmeti için ${linkedProduct.name} kullanıldı.`);
                }

                // Mark processed
                await updateAppointment(appt.id, { processedByAI: true });
                setLastProcessedAppt(appt.id);
            }
        };

        checkAppointments();
    }, [appointments, services, products]);

    // 2. AUTO-REMINDERS (Simulated)
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const upcoming = appointments.filter(a => a.date === today && a.status === 'confirmed' && !a.reminded);

        upcoming.forEach(appt => {
            // Trigger a mock "WhatsApp" message via Invoice Messages
            sendMessage({
                title: 'Randevu Hatırlatması (BayTermin)',
                message: `Sayın ${appt.customerName}, bugünkü ${appt.time} randevunuzu hatırlatmak isteriz.`,
                category: 'customer',
                type: 'whatsapp',
                receiverId: appt.customerPhone || 'unknown'
            });
            updateAppointment(appt.id, { reminded: true });
            addNotification(`📱 Hatırlatma Gönderildi: ${appt.customerName}`);
        });
    }, [appointments]);

    const addNotification = (msg) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, msg }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    };

    if (notifications.length === 0) return null;

    return (
        <div style={{ position: 'fixed', bottom: '100px', left: '24px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <AnimatePresence>
                {notifications.map(n => (
                    <motion.div
                        key={n.id}
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        style={{
                            background: 'rgba(79, 70, 229, 0.95)',
                            color: 'white',
                            padding: '12px 20px',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            boxShadow: '0 10px 25px rgba(79,70,229,0.3)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <Zap size={16} />
                        {n.msg}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default BayTermin;
