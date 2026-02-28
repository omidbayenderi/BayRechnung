import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useInvoice } from '../../context/InvoiceContext';
import { useStock } from '../../context/StockContext';
import { useAppointments } from '../../context/AppointmentContext';
import { useBayVision } from '../../context/BayVisionContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, X, Send, Zap, ChevronRight, User, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BayPilot = () => {
    const { currentUser } = useAuth();
    const { t } = useLanguage();
    const { intelligence } = useBayVision(); // Integrated CEO Insights
    // Contexts for Data Access
    const { invoices, expenses, companyProfile } = useInvoice(); // Financials
    const stockContext = useStock(); // Stock (Optional)
    const appointmentContext = useAppointments(); // Appointments (Optional)

    const navigate = useNavigate();
    const location = useLocation();

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Helper: Format Currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    // Initial Greeting
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    id: 1,
                    type: 'bot',
                    text: t('baypilot_greeting').replace('{name}', currentUser?.name || 'User')
                }
            ]);

            // Add initial smart suggestions based on real data states
            setTimeout(() => {
                const suggestions = [
                    { label: t('baypilot_suggestion_invoice'), action: '/new' },
                ];

                // Check for Low Stock (if context exists)
                if (stockContext?.products) {
                    const lowStockCount = stockContext.products.filter(p => p.stock <= p.minStock).length;
                    if (lowStockCount > 0) {
                        suggestions.push({ label: `Check Low Stock (${lowStockCount})`, action: '/stock/dashboard' });
                    } else {
                        suggestions.push({ label: t('baypilot_suggestion_stock'), action: '/stock/dashboard' });
                    }
                }

                // Check for Today's Appointments
                if (appointmentContext?.appointments) {
                    const today = new Date().toISOString().split('T')[0];
                    const todayAppts = appointmentContext.appointments.filter(a => a.date === today).length;
                    if (todayAppts > 0) {
                        suggestions.push({ label: `Today's Appointments (${todayAppts})`, action: '/appointments' });
                    }
                }

                // CEO INSIGHTS (Proactive)
                if (intelligence.alerts.length > 0) {
                    suggestions.unshift({ label: `⚠️ CEO Alert: ${intelligence.alerts[0].title}`, action: '/admin' });
                }

                setMessages(prev => [
                    ...prev,
                    {
                        id: 2,
                        type: 'bot',
                        text: intelligence.alerts.length > 0 ? `Dikkat! ${intelligence.alerts[0].message}` : '💡 ' + t('tip_title'),
                        suggestions: suggestions
                    }
                ]);
            }, 800);
        }
    }, [isOpen, currentUser, companyProfile, t, intelligence]); // Added intelligence dependency

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMsg = { id: Date.now(), type: 'user', text: inputText };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        // Simulate AI thinking time
        setTimeout(() => {
            const response = analyzeIntent(userMsg.text);
            setMessages(prev => [...prev, { ...response, id: Date.now() + 1, type: 'bot' }]);
            setIsTyping(false);
        }, 600);
    };

    const analyzeIntent = (text) => {
        const lower = text.toLowerCase();

        if (lower.includes('vision') || lower.includes('karar') || lower.includes('durum')) {
            return {
                text: `**BayVision CEO Özeti:**\n\n${intelligence.summary}\n\nAktif Alarmlar: ${intelligence.alerts.length}\nFırsatlar: ${intelligence.opportunities.length}`,
                action: { label: 'Analiz Detayları', path: '/admin' }
            }
        }

        // --- 1. FINANCIAL INSIGHTS ---
        if (lower.includes('profit') || lower.includes('revenue') || lower.includes('income') || lower.includes('gewinn') || lower.includes('umsatz')) {
            const totalRevenue = invoices
                .filter(i => i.status !== 'draft' && i.status !== 'cancelled')
                .reduce((sum, i) => sum + (parseFloat(i.total) || 0), 0);

            const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
            const profit = totalRevenue - totalExpenses;

            return {
                text: `Here is your financial snapshot:\n\n📈 Revenue: ${formatCurrency(totalRevenue)}\n📉 Expenses: ${formatCurrency(totalExpenses)}\n\n💰 **Net Profit: ${formatCurrency(profit)}**`,
                action: { label: 'View Reports', path: '/admin?tab=reports' }
            };
        }

        if (lower.includes('unpaid') || lower.includes('open') || lower.includes('overdue') || lower.includes('offen')) {
            const openInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'partial' || i.status === 'overdue');
            const totalOpen = openInvoices.reduce((sum, i) => sum + (parseFloat(i.total) || 0), 0);

            return {
                text: `You have **${openInvoices.length} unpaid invoices** totaling **${formatCurrency(totalOpen)}**.`,
                action: { label: 'View Invoices', path: '/invoices' }
            };
        }

        // --- 2. STOCK INTELLIGENCE ---
        if (stockContext && (lower.includes('stock') || lower.includes('inventory') || lower.includes('lager'))) {
            if (lower.includes('low') || lower.includes('wenig')) {
                const lowStock = stockContext.products.filter(p => p.stock <= p.minStock);
                if (lowStock.length > 0) {
                    return {
                        text: `⚠️ Alert: You have **${lowStock.length} items** running low on stock.`,
                        action: { label: 'Restock Now', path: '/stock/dashboard' }
                    };
                } else {
                    return {
                        text: "All clear! ✅ Inventory levels look healthy.",
                        action: { label: 'Go to Stock', path: '/stock/dashboard' }
                    };
                }
            }
            return {
                text: `You currently have **${stockContext.products.length} unique products** in your inventory.`,
                action: { label: t('stockDashboard'), path: '/stock/dashboard' }
            };
        }

        // --- 3. APPOINTMENTS ---
        if (appointmentContext && (lower.includes('appointment') || lower.includes('booking') || lower.includes('termin'))) {
            const today = new Date().toISOString().split('T')[0];
            const todayAppts = appointmentContext.appointments.filter(a => a.date === today);

            if (lower.includes('today') || lower.includes('heute')) {
                if (todayAppts.length > 0) {
                    return {
                        text: `You have **${todayAppts.length} appointments** today.`,
                        action: { label: 'View Calendar', path: '/appointments' }
                    };
                } else {
                    return { text: "You have no appointments scheduled for today. Time to relax! ☕" };
                }
            }

            return {
                text: `You have a total of **${appointmentContext.appointments.filter(a => a.status !== 'cancelled').length} active bookings**.`,
                action: { label: t('appointmentSystem'), path: '/appointments' }
            };
        }

        // --- 4. NAVIGATION / GENERAL ---
        if (lower.includes('invoice') || lower.includes('fatura') || lower.includes('rechnung')) {
            return {
                text: t('baypilot_finding'),
                action: { label: t('newInvoice'), path: '/new' }
            };
        }

        if (lower.includes('report') || lower.includes('rapor') || lower.includes('bericht')) {
            return {
                text: t('baypilot_finding'),
                action: { label: t('reports'), path: '/admin?tab=reports' }
            };
        }

        if (lower.includes('site') || lower.includes('şantiye') || lower.includes('baustelle')) {
            if (companyProfile?.industry === 'Construction') {
                return {
                    text: t('baypilot_finding'),
                    action: { label: t('site_management'), path: '/admin?tab=sites' }
                };
            } else {
                return { text: t('securityCheck') };
            }
        }

        if (lower.includes('user') || lower.includes('kullanıcı') || lower.includes('benutzer')) {
            return {
                text: t('baypilot_finding'),
                action: { label: t('users'), path: '/users' }
            };
        }

        if (lower.includes('setting') || lower.includes('ayarlar') || lower.includes('einstellung')) {
            return {
                text: t('baypilot_finding'),
                action: { label: t('settings'), path: '/settings' }
            };
        }

        // Default Fallback
        return { text: t('baypilot_not_found') };
    };

    const handleActionClick = (path) => {
        navigate(path);
    };

    if (!currentUser) return null;

    return (
        <>
            {/* Trigger Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '30px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                }}
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'fixed',
                            bottom: '100px',
                            right: '24px',
                            width: '350px',
                            height: '500px',
                            background: 'white',
                            borderRadius: '20px',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            zIndex: 9999,
                            border: '1px solid #eef2ff'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '16px 20px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <div style={{
                                width: '32px', height: '32px',
                                background: 'rgba(255,255,255,0.2)',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Zap size={18} fill="white" />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>BayPilot</h3>
                                <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>AI Assistant</div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#f9fafb', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {messages.map(msg => (
                                <div key={msg.id} style={{
                                    alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '85%'
                                }}>
                                    <div style={{
                                        padding: '12px 16px',
                                        borderRadius: '16px',
                                        background: msg.type === 'user' ? '#6366f1' : 'white',
                                        color: msg.type === 'user' ? 'white' : '#1e293b',
                                        borderTopRightRadius: msg.type === 'user' ? '4px' : '16px',
                                        borderTopLeftRadius: msg.type === 'user' ? '16px' : '4px',
                                        boxShadow: msg.type === 'bot' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
                                        fontSize: '0.9rem',
                                        lineHeight: '1.4',
                                        whiteSpace: 'pre-line' // Allow newlines
                                    }}>
                                        {msg.text}
                                    </div>

                                    {/* Action Button if present */}
                                    {msg.action && (
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleActionClick(msg.action.path)}
                                            style={{
                                                marginTop: '8px',
                                                background: '#4f46e5',
                                                color: 'white',
                                                border: 'none',
                                                padding: '8px 16px',
                                                borderRadius: '20px',
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
                                            }}
                                        >
                                            {msg.action.label} <ChevronRight size={14} />
                                        </motion.button>
                                    )}

                                    {/* Multiple Suggestions */}
                                    {msg.suggestions && (
                                        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {msg.suggestions.map((sug, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleActionClick(sug.action)}
                                                    style={{
                                                        background: 'white',
                                                        border: '1px solid #e2e8f0',
                                                        padding: '8px 12px',
                                                        borderRadius: '8px',
                                                        fontSize: '0.85rem',
                                                        color: '#6366f1',
                                                        cursor: 'pointer',
                                                        textAlign: 'left',
                                                        transition: 'all 0.2s',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between'
                                                    }}
                                                    onMouseEnter={e => e.target.style.background = '#f8fafc'}
                                                    onMouseLeave={e => e.target.style.background = 'white'}
                                                >
                                                    {sug.label}
                                                    <ChevronRight size={14} color="#cbd5e1" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isTyping && (
                                <div style={{ alignSelf: 'flex-start', background: 'white', padding: '12px', borderRadius: '16px', borderTopLeftRadius: '4px' }}>
                                    <span className="dot-flashing">...</span>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div style={{
                            padding: '16px',
                            background: 'white',
                            borderTop: '1px solid #e2e8f0',
                            display: 'flex',
                            gap: '10px'
                        }}>
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={t('baypilot_placeholder')}
                                style={{
                                    flex: 1,
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '24px',
                                    padding: '10px 16px',
                                    fontSize: '0.9rem',
                                    outline: 'none',
                                    background: '#f8fafc'
                                }}
                            />
                            <button
                                onClick={handleSend}
                                style={{
                                    background: '#6366f1',
                                    color: 'white',
                                    border: 'none',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
                                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default BayPilot;
