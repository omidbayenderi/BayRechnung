import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, X, Send, Sparkles, Bot, User, Loader2, Search, Clock, Calendar, MapPin, Phone, ShoppingBag } from 'lucide-react';
import { AgentFactory } from '../agents/AgentFactory';

const PublicAIAgent = ({ siteData, addToCart }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    const { profile, products } = siteData;

    // Initialize the Specialist Agent (The Brain)
    const agent = useRef(null);
    useEffect(() => {
        if (siteData) {
            agent.current = AgentFactory.getAgent(siteData);
        }
    }, [siteData]);

    // Initial greeting
    useEffect(() => {
        if (isOpen && messages.length === 0 && agent.current) {
            setMessages([
                {
                    role: 'assistant',
                    content: agent.current.getGreeting()
                }
            ]);
        }
    }, [isOpen, messages.length]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!input.trim() || !agent.current) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsTyping(true);

        // Modular Specialist Action
        setTimeout(() => {
            const response = agent.current.handleQuery(userMsg);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
            setIsTyping(false);
        }, 1200);
    };

    return (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 10000, fontFamily: 'inherit' }}>
            {/* AI Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '32px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        border: 'none',
                        color: 'white',
                        boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        animation: 'pulse 2s infinite'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <Sparkles size={32} />
                </button>
            )}

            {/* AI Assistant Window */}
            {isOpen && (
                <div style={{
                    width: '380px',
                    height: '600px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    overflow: 'hidden',
                    animation: 'slideIn 0.4s ease-out'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '24px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ padding: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}>
                                <Bot size={24} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>AI Asistan</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{profile?.companyName} Dijital Rehberi</div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div
                        ref={scrollRef}
                        style={{
                            flex: 1,
                            padding: '20px',
                            overflowY: 'auto',
                            background: 'rgba(248, 250, 252, 0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                        }}
                    >
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
                            }}>
                                <div style={{
                                    padding: '12px 16px',
                                    borderRadius: msg.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                                    background: msg.role === 'user' ? '#6366f1' : 'white',
                                    color: msg.role === 'user' ? 'white' : '#1e293b',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.5',
                                    boxShadow: msg.role === 'user' ? '0 4px 12px rgba(99, 102, 241, 0.2)' : '0 2px 5px rgba(0,0,0,0.05)',
                                    whiteSpace: 'pre-line'
                                }}>
                                    {/* Advanced Action Parser */}
                                    {msg.content.includes('[ACTION:') ? (
                                        <>
                                            {msg.content.split('[ACTION:')[0]}
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                                                {msg.content.match(/\[ACTION:[^\]]+\]/g)?.map((action, actionIdx) => {
                                                    const [type, payload] = action.replace('[ACTION:', '').replace(']', '').split(':');
                                                    const isBook = type === 'BOOK';
                                                    const isCart = type === 'CART';

                                                    const buttonStyle = {
                                                        display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
                                                        background: isBook ? 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' : (isCart ? '#10b981' : '#f1f5f9'),
                                                        color: isBook || isCart ? 'white' : '#475569',
                                                        textDecoration: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '0.8rem',
                                                        boxShadow: isBook ? '0 4px 10px rgba(99, 102, 241, 0.3)' : 'none',
                                                        border: (isBook || isCart) ? 'none' : '1px solid #e2e8f0', cursor: 'pointer'
                                                    };

                                                    if (isCart) {
                                                        return (
                                                            <button
                                                                key={actionIdx}
                                                                onClick={() => {
                                                                    const product = products.find(p => String(p.id) === String(payload));
                                                                    if (product && addToCart) {
                                                                        addToCart(product);
                                                                        // Optional: Add visual feedback here
                                                                    }
                                                                }}
                                                                style={buttonStyle}
                                                            >
                                                                <ShoppingBag size={14} /> Sepete Ekle
                                                            </button>
                                                        );
                                                    }

                                                    if (isBook) {
                                                        const targetPath = payload.replace('/BayRechnung', '').replace('/Rechnung', '');
                                                        return (
                                                            <button key={actionIdx} onClick={() => navigate(targetPath)} style={buttonStyle}>
                                                                <Calendar size={14} /> Randevu Al
                                                            </button>
                                                        );
                                                    }

                                                    // Fallback for Call
                                                    return (
                                                        <a key={actionIdx} href={payload === 'tel' ? `tel:${profile?.phone}` : payload.startsWith('/tel') ? payload.replace('/tel', 'tel') : payload} style={buttonStyle}>
                                                            <Phone size={14} /> Hemen Ara
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                            {msg.content.split(/\[ACTION:[^\]]+\]/).pop()}
                                        </>
                                    ) : (
                                        msg.content
                                    )}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>
                                    {msg.role === 'assistant' ? 'AI Rehber' : 'Siz'}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div style={{ display: 'flex', gap: '8px', padding: '12px', background: 'white', borderRadius: '18px', width: 'fit-content' }}>
                                <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Yazıyor...</span>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSearch} style={{ padding: '20px', background: 'white', borderTop: '1px solid #f1f5f9' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Size nasıl yardımcı olabilirim?"
                                style={{
                                    width: '100%',
                                    padding: '12px 45px 12px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    outline: 'none',
                                    fontSize: '0.95rem'
                                }}
                            />
                            <button
                                type="submit"
                                style={{
                                    position: 'absolute',
                                    right: '8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: '#6366f1',
                                    cursor: 'pointer'
                                }}
                                disabled={!input.trim()}
                            >
                                <Send size={20} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                            <button
                                type="button"
                                onClick={() => setInput('Çalışma saatleriniz nedir?')}
                                style={{
                                    fontSize: '0.75rem', padding: '6px 12px', borderRadius: '20px',
                                    background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer'
                                }}
                            >
                                <Clock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Saatler
                            </button>
                            <button
                                type="button"
                                onClick={() => setInput('Randevu nasıl alabilirim?')}
                                style={{
                                    fontSize: '0.75rem', padding: '6px 12px', borderRadius: '20px',
                                    background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer'
                                }}
                            >
                                <Calendar size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Randevu
                            </button>
                            <button
                                type="button"
                                onClick={() => setInput('Adresiniz nerede?')}
                                style={{
                                    fontSize: '0.75rem', padding: '6px 12px', borderRadius: '20px',
                                    background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer'
                                }}
                            >
                                <MapPin size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Konum
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4); }
                    50% { transform: scale(1.05); box-shadow: 0 15px 35px rgba(99, 102, 241, 0.6); }
                    100% { transform: scale(1); box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4); }
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default PublicAIAgent;
