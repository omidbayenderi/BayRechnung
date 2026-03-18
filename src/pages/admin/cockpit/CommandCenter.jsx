import { useState } from 'react';
import {
    Bell, MessageSquare, Send,
    Check, Clock, Filter, Sparkles,
    StickyNote, AlertCircle, Building, User,
    MoreHorizontal, RefreshCw, Zap,
    Target, Flag, Trash2, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInvoice } from '../../../context/InvoiceContext';
import { useAuth } from '../../../context/AuthContext';

const CommandCenter = () => {
    const { messages, sendMessage } = useInvoice();
    const { currentUser } = useAuth();
    const [note, setNote] = useState('');
    const [sending, setSending] = useState(false);
    const [filter, setFilter] = useState('all');

    const unread = messages.filter(m => !m.is_read).length;

    const handleSend = async () => {
        if (!note.trim()) return;
        setSending(true);
        // Simulate a small delay for better feel
        await new Promise(resolve => setTimeout(resolve, 800));
        await sendMessage({ message: note.trim(), category: 'internal', type: 'note' });
        setNote('');
        setSending(false);
    };

    return (
        <div className="space-y-10 pb-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 cockpit-gradient-primary rounded-lg flex items-center justify-center text-white shadow-lg">
                            <Zap size={18} />
                        </div>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Kontrol Merkezi</span>
                    </div>
                    <h1 className="text-3xl font-black text-main tracking-tight">Mesajlar & Bildirimler</h1>
                    <p className="text-muted font-medium tracking-tight">Ekibinizle senkronize kalın ve AI önerilerini takip edin</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-3 px-6 py-4 bg-card border border-white/5 rounded-2xl text-xs font-black text-muted uppercase tracking-widest hover:bg-white/5 transition-all shadow-sm">
                        <RefreshCw size={16} />
                        Sembolleştir
                    </button>
                    <button className="flex items-center gap-3 px-8 py-4 cockpit-gradient-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-95">
                        <Send size={18} />
                        Duyuru Yayınla
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Messages Feed */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-6">
                            <button 
                                onClick={() => setFilter('all')}
                                className={`text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'text-indigo-500 border-b-2 border-indigo-500 pb-1' : 'text-muted hover:text-main'}`}
                            >
                                Tüm Akış
                            </button>
                            <button 
                                onClick={() => setFilter('unread')}
                                className={`text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filter === 'unread' ? 'text-indigo-500 border-b-2 border-indigo-500 pb-1' : 'text-muted hover:text-main'}`}
                            >
                                Okunmamış
                                {unread > 0 && <span className="w-5 h-5 bg-indigo-500 text-white rounded-full flex items-center justify-center text-[9px]">{unread}</span>}
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-slate-300 hover:text-slate-600"><Filter size={18} /></button>
                            <button className="p-2 text-slate-300 hover:text-slate-600"><MoreHorizontal size={18} /></button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {messages.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-card rounded-[2.5rem] border border-white/5 shadow-xl shadow-black/10 p-20 text-center"
                                >
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <MessageSquare size={32} className="text-muted/30" />
                                    </div>
                                    <h4 className="text-lg font-black text-main mb-2 tracking-tight">Bildirim Kutusu Boş</h4>
                                    <p className="text-muted font-medium max-w-xs mx-auto text-sm leading-relaxed">
                                        Şu an için yeni bir bildirim bulunmuyor. Ekibinizle iletişim kurmak için sağdaki paneli kullanabilirsiniz.
                                    </p>
                                </motion.div>
                            ) : (
                                messages.map((msg, idx) => (
                                    <MessageCard key={msg.id || idx} msg={msg} currentUserId={currentUser?.id} />
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-8">
                    {/* Quick Note Card */}
                    <div className="bg-card p-8 rounded-[2.5rem] border border-white/5 shadow-xl shadow-black/10 relative overflow-hidden group">
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors duration-700"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xs font-black text-main uppercase tracking-widest flex items-center gap-3">
                                    <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                                        <StickyNote size={16} />
                                    </div>
                                    Hızlı Not Bırak
                                </h3>
                            </div>
                            <textarea
                                className="w-full bg-white/5 border border-white/5 rounded-3xl p-5 text-sm font-bold text-main focus:ring-2 focus:ring-amber-500/20 focus:bg-card min-h-[160px] resize-none outline-none transition-all placeholder:text-muted/30"
                                placeholder="Ekibiniz için saha notları..."
                                value={note}
                                onChange={e => setNote(e.target.value)}
                            />
                            <div className="flex items-center justify-between mt-6">
                                <div className="flex gap-2">
                                    <button className="p-3 bg-white/5 text-muted rounded-2xl hover:text-indigo-500 hover:bg-white/10 transition-all border border-transparent hover:border-white/5">
                                        <Building size={18} />
                                    </button>
                                    <button className="p-3 bg-white/5 text-muted rounded-2xl hover:text-indigo-500 hover:bg-white/10 transition-all border border-transparent hover:border-white/5">
                                        <Target size={18} />
                                    </button>
                                </div>
                                <button
                                    onClick={handleSend}
                                    disabled={sending || !note.trim()}
                                    className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                                >
                                    {sending ? <RefreshCw className="animate-spin" size={12} /> : null}
                                    {sending ? 'Yükleniyor' : 'Gönder'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* AI Insights Card */}
                    <div className="text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group shadow-indigo-500/20" style={{ backgroundColor: 'var(--cockpit-primary-dark)' }}>
                        <div className="absolute top-0 right-0 w-40 h-40 cockpit-gradient-primary opacity-20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl">
                                    <Sparkles className="text-indigo-400" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400">BayGuard AI</h3>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Akıllı Analiz</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-300 font-bold leading-relaxed mb-8">
                                Proje ilerleme hızınız %12 arttı. BayPark projesinde 28. kat beton dökümü için yarınki hava durumu %85 uygunluk gösteriyor.
                            </p>
                            <div className="space-y-3">
                                <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 group/btn">
                                    Tam Raporu İncele
                                    <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                                <button className="w-full py-4 bg-indigo-600/20 text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600/30 transition-all">
                                    Önerileri Reddet
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MessageCard = ({ msg, currentUserId }) => {
    const isMine = msg.sender_id === currentUserId;
    const msgType = msg.type || msg.metadata?.category || 'note';
    const isRead = msg.is_read;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`flex gap-4 group cursor-pointer ${!isRead ? 'opacity-100' : 'opacity-80 hover:opacity-100'} transition-opacity`}
        >
            <div className="flex flex-col items-center shrink-0">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 ${
                    msgType === 'alert' ? 'bg-rose-500 text-white shadow-rose-500/20' :
                    msgType === 'action' ? 'bg-emerald-500 text-white shadow-emerald-500/20' :
                    'bg-white/5 border border-white/5 text-muted shadow-xl shadow-black/10'
                }`}>
                    {msgType === 'alert' ? <AlertCircle size={22} /> :
                     msgType === 'action' ? <CheckCircle2 size={22} /> :
                     <MessageSquare size={22} />}
                </div>
                <div className="w-px h-full bg-white/5 group-last:hidden mt-2"></div>
            </div>

            <div className={`flex-1 bg-card p-6 rounded-[2rem] border transition-all ${!isRead ? 'border-indigo-500/30 shadow-xl shadow-indigo-500/10' : 'border-white/5 shadow-sm'}`}>
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-main uppercase tracking-tight">{isMine ? 'Siz' : (msg.sender_name || 'Yönetici')}</span>
                        {msg.metadata?.category && (
                            <span className="px-2 py-0.5 bg-white/5 text-muted text-[8px] font-black uppercase tracking-widest rounded-md">
                                {msg.metadata.category}
                            </span>
                        )}
                        {!isRead && (
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                        )}
                    </div>
                    <span className="text-[10px] text-muted font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <Clock size={10} />
                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : 'Az Önce'}
                    </span>
                </div>
                <p className="text-sm text-muted font-medium leading-relaxed mb-4">{msg.content}</p>
                
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-[9px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1 hover:underline">
                        Yanıtla
                    </button>
                    <button className="text-[9px] font-black text-muted hover:text-main uppercase tracking-widest flex items-center gap-1">
                        Arşivle
                    </button>
                    <button className="text-[9px] font-black text-muted hover:text-rose-500 uppercase tracking-widest flex items-center gap-1 ml-auto">
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const ChevronRight = (props) => (
    <svg 
        {...props}
        xmlns="http://www.w3.org/2000/svg" 
        width="24" height="24" viewBox="0 0 24 24" 
        fill="none" stroke="currentColor" strokeWidth="2" 
        strokeLinecap="round" strokeLinejoin="round"
    >
        <path d="m9 18 6-6-6-6" />
    </svg>
);

export default CommandCenter;

