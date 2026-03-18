import React, { useState } from 'react';
import { useStock } from '../../context/StockContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { Package, TrendingUp, AlertTriangle, DollarSign, Search, ShoppingBag, Truck, Download, Share2, MessageCircle, Mail, ExternalLink, CheckCircle, XCircle, RotateCcw, Clock, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const actionBtnStyle = (bg, color) => ({
    padding: '8px', borderRadius: '8px', background: bg, color: color, border: `1px solid ${bg}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
});

const StockDashboard = () => {
    const { products, sales, updateSaleStatus } = useStock();
    const { t } = useLanguage();
    const { showNotification } = useNotification();
    const [searchTerm, setSearchTerm] = useState('');
    const [trackingModal, setTrackingModal] = useState({ isOpen: false, saleId: null });
    const [trackingInput, setTrackingInput] = useState({ company: 'DHL', code: '' });

    // New: Return Modal State
    const [returnModal, setReturnModal] = useState({ isOpen: false, saleId: null, reason: '' });

    // Stats Calculations - Memoized (Scenario 1)
    const stats = React.useMemo(() => {
        const totalProducts = products.length;
        const lowStockCount = products.filter(p => p.stock <= (p.minStock || 5)).length;
        const totalValue = products.reduce((acc, curr) => acc + (parseFloat(curr.price || 0) * (curr.stock || 0)), 0);
        const totalSalesVal = sales.reduce((acc, curr) => acc + (parseFloat(curr.total || 0)), 0);

        return {
            totalProducts,
            lowStockCount,
            totalValue: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(totalValue),
            totalSales: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(totalSalesVal)
        };
    }, [products, sales]);

    // Filter Sales - Memoized (Scenario 2)
    const filteredSales = React.useMemo(() => {
        const searchLow = searchTerm.toLowerCase();
        return sales.filter(s =>
            (s.customerName?.toLowerCase() || '').includes(searchLow) ||
            s.id?.toString().includes(searchTerm)
        );
    }, [sales, searchTerm]);

    // Status Helpers - Stable references
    const statusBadges = React.useMemo(() => ({
        shipped: <span style={{ padding: '4px 8px', borderRadius: '6px', background: '#eff6ff', color: '#3b82f6', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><Truck size={12} /> {t('status_shipped')}</span>,
        delivered: <span style={{ padding: '4px 8px', borderRadius: '6px', background: '#ecfdf5', color: '#10b981', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> {t('status_delivered')}</span>,
        returned: <span style={{ padding: '4px 8px', borderRadius: '6px', background: '#fef2f2', color: '#ef4444', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><RotateCcw size={12} /> {t('status_returned')}</span>,
        pending: <span style={{ padding: '4px 8px', borderRadius: '6px', background: '#f1f5f9', color: '#64748b', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {t('status_pending')}</span>
    }), [t]);

    const getStatusBadge = (status) => statusBadges[status] || statusBadges.pending;

    // Tracking Logic
    const trackingProviders = {
        'DHL': 'https://www.dhl.de/track/ng/result?tracking-id=',
        'Hermes': 'https://www.myhermes.de/sendungsverfolgung/suche-web.html#',
        'UPS': 'https://www.ups.com/track?tracknum=',
        'DPD': 'https://tracking.dpd.de/status/de_DE/parcel/',
        'GLS': 'https://www.gls-pakete.de/sendungsverfolgung?match=',
        'Other': ''
    };

    const handleOpenTracking = (saleId) => {
        setTrackingModal({ isOpen: true, saleId });
        setTrackingInput({ company: 'DHL', code: '' });
    };

    const submitTracking = () => {
        const { company, code } = trackingInput;
        const trackingUrl = company !== 'Other' ? `${trackingProviders[company]}${code}` : '';

        updateSaleStatus(trackingModal.saleId, 'shipped', {
            trackingCompany: company,
            trackingCode: code,
            trackingUrl: trackingUrl
        });

        // Auto-Generate Message
        const sale = sales.find(s => s.id === trackingModal.saleId);
        const message = `Merhaba ${sale.customerName}, siparişiniz kargoya verildi! 🚚\nKargo Firması: ${company}\nTakip No: ${code}\nTakip Linki: ${trackingUrl}\nTeşekkürler!`;

        if (window.confirm(`Kargo Kaydedildi! Müşteriye WhatsApp gönderilsin mi?\n\n"${message}"`)) {
            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        }

        setTrackingModal({ isOpen: false, saleId: null });
    };

    const handleMarkDelivered = (sale) => {
        if (window.confirm('Bu siparişi "Teslim Edildi" olarak işaretlemek istiyor musunuz?')) {
            updateSaleStatus(sale.id, 'delivered');
            const message = `Merhaba ${sale.customerName}, kargonuzun teslim edildiği görünüyor. Umarız memnun kalmışsınızdır! ⭐ Bir sorununuz olursa buradayız.`;
            if (window.confirm('Müşteriye teslimat teyit mesajı gönderilsin mi?')) {
                window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
            }
        }
    };

    const handleMarkReturned = (sale) => {
        setReturnModal({ isOpen: true, saleId: sale.id, reason: '' });
    };

    const submitReturn = () => {
        if (returnModal.saleId) {
            updateSaleStatus(returnModal.saleId, 'returned', { returnReason: returnModal.reason });
            setReturnModal({ isOpen: false, saleId: null, reason: '' });
        }
    };

    const handleShareDigital = (sale, item) => {
        const product = item?.product;
        if (!product || !product.downloadUrl) {
            return showNotification({
                type: 'error',
                message: 'İndirme linki yok.'
            });
        }

        const message = `Merhaba ${sale.customerName || 'Değerli Müşterimiz'}, ${product.name} siparişiniz için teşekkürler! 📥 İşte indirme linkiniz: ${product.downloadUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="page-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <TrendingUp size={32} color="var(--primary)" />
                {t('stockDashboard') || 'Stok & Satış Paneli'}
            </h1>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <StatsCard icon={Package} label={t('totalProducts') || 'Toplam Ürün'} value={stats.totalProducts} color="#3b82f6" />
                <StatsCard icon={AlertTriangle} label={t('lowStock') || 'Kritik Stok'} value={stats.lowStockCount} color="#ef4444" bg="#fef2f2" />
                <StatsCard icon={DollarSign} label={t('inventoryValue') || 'Stok Değeri'} value={stats.totalValue} color="#10b981" />
                <StatsCard icon={ShoppingBag} label={t('totalSales') || 'Toplam Ciro'} value={stats.totalSales} color="#8b5cf6" />
            </div>

            {/* Sales Section */}
            <div className="card" style={{ padding: '0', overflow: 'hidden', background: 'white', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{t('recentSales') || 'Sipariş Yönetimi'}</h2>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder={t('searchSales') || 'Sipariş Ara...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.9rem', width: '200px' }}
                        />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', color: 'var(--text-secondary)', textAlign: 'left' }}>
                                <th style={{ padding: '12px 20px', fontWeight: '600' }}>{t('table_id')}</th>
                                <th style={{ padding: '12px 20px', fontWeight: '600' }}>{t('table_customer')}</th>
                                <th style={{ padding: '12px 20px', fontWeight: '600' }}>{t('table_status')}</th>
                                <th style={{ padding: '12px 20px', fontWeight: '600' }}>{t('table_products')}</th>
                                <th style={{ padding: '12px 20px', fontWeight: '600', textAlign: 'right' }}>{t('table_amount')}</th>
                                <th style={{ padding: '12px 20px', fontWeight: '600', textAlign: 'center' }}>{t('table_actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.slice(0, 10).map((sale) => (
                                <tr key={sale.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '16px 20px', fontFamily: 'monospace' }}>#{sale.id.toString().slice(-6)}</td>
                                    <td style={{ padding: '16px 20px', fontWeight: '500' }}>{sale.customerName || 'Ziyaretçi'}</td>
                                    <td style={{ padding: '16px 20px' }}>{getStatusBadge(sale.status)}</td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            {(sale.items || []).map((item, idx) => (
                                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>x{item.quantity}</span>
                                                    <span>{item.product?.name || 'Bilinmeyen Ürün'}</span>
                                                    {item.product?.type === 'digital' && <Download size={14} color="#2563eb" />}
                                                </div>
                                            ))}
                                            {sale.trackingCode && (
                                                <div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#64748b' }}>
                                                    <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '4px', color: 'var(--text-main)' }}>{sale.items?.[0]?.product?.name || 'Ürün'}</div>
                                                    <a href={sale.trackingUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#3b82f6', textDecoration: 'none' }}>
                                                        <ExternalLink size={10} /> {sale.trackingCompany}: {sale.trackingCode}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: '600' }}>
                                        {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(sale.total)}
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            {/* Digital Share */}
                                            {(sale.items || []).some(i => i.product?.type === 'digital') && (
                                                <button onClick={() => handleShareDigital(sale, sale.items.find(i => i.product?.type === 'digital'))} title="Link Paylaş" style={actionBtnStyle('#eff6ff', '#2563eb')}>
                                                    <Share2 size={16} />
                                                </button>
                                            )}

                                            {/* Physical Actions */}
                                            {(sale.items || []).some(i => !i.product?.type || i.product?.type === 'physical') && (
                                                <>
                                                    {(!sale.status || sale.status === 'pending') && (
                                                        <button onClick={() => handleOpenTracking(sale.id)} title="Kargola" style={actionBtnStyle('#fff7ed', '#ea580c')}>
                                                            <Truck size={16} />
                                                        </button>
                                                    )}
                                                    {sale.status === 'shipped' && (
                                                        <button onClick={() => handleMarkDelivered(sale)} title="Teslim Edildi İşaretle" style={actionBtnStyle('#ecfdf5', '#10b981')}>
                                                            <CheckCircle size={16} />
                                                        </button>
                                                    )}
                                                </>
                                            )}

                                            {/* Return Action (Always available if not returned) */}
                                            {sale.status !== 'returned' && (
                                                <button onClick={() => handleMarkReturned(sale)} title="İade Al" style={actionBtnStyle('#fef2f2', '#ef4444')}>
                                                    <RotateCcw size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredSales.length === 0 && (
                                <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>{t('no_orders')}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modern Tracking Modal */}
            <AnimatePresence>
                {trackingModal.isOpen && (
                    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{ background: 'white', padding: '32px', borderRadius: '24px', width: '420px', maxWidth: '90%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '12px', color: '#2563eb' }}>
                                        <Truck size={24} />
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{t('tracking_modal_title') || 'Kargo Bilgisi Gir'}</h3>
                                </div>
                                <button onClick={() => setTrackingModal({ isOpen: false, saleId: null })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><XCircle size={24} /></button>
                            </div>

                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>{t('tracking_company') || 'Kargo Firması'}</label>
                                <select
                                    className="form-input"
                                    value={trackingInput.company}
                                    onChange={e => setTrackingInput({ ...trackingInput, company: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '1rem' }}
                                >
                                    {Object.keys(trackingProviders).map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>{t('tracking_code') || 'Takip Numarası'}</label>
                                <input
                                    className="form-input"
                                    value={trackingInput.code}
                                    onChange={e => setTrackingInput({ ...trackingInput, code: e.target.value })}
                                    placeholder="Örn: 123456789"
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '1rem' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => setTrackingModal({ isOpen: false, saleId: null })}
                                    className="secondary-btn"
                                    style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'white', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    {t('cancel') || 'İptal'}
                                </button>
                                <button
                                    onClick={submitTracking}
                                    className="primary-btn"
                                    style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <Save size={18} />
                                    {t('save') || 'Kaydet'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modern Return Modal */}
            <AnimatePresence>
                {returnModal.isOpen && (
                    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{ background: 'white', padding: '32px', borderRadius: '24px', width: '420px', maxWidth: '90%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ padding: '10px', background: '#fef2f2', borderRadius: '12px', color: '#ef4444' }}>
                                        <RotateCcw size={24} />
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#991b1b' }}>{t('return_modal_title') || 'İade Oluştur'}</h3>
                                </div>
                                <button onClick={() => setReturnModal({ isOpen: false, saleId: null, reason: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><XCircle size={24} /></button>
                            </div>

                            <div className="form-group" style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>{t('return_reason') || 'İade Sebebi (Opsiyonel)'}</label>
                                <textarea
                                    className="form-input"
                                    value={returnModal.reason}
                                    onChange={e => setReturnModal({ ...returnModal, reason: e.target.value })}
                                    placeholder="Örn: Ürün hasarlı, yanlış sipariş..."
                                    style={{ width: '100%', height: '100px', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '1rem', resize: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => setReturnModal({ isOpen: false, saleId: null, reason: '' })}
                                    className="secondary-btn"
                                    style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'white', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    {t('cancel') || 'İptal'}
                                </button>
                                <button
                                    onClick={submitReturn}
                                    className="primary-btn"
                                    style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: '#ef4444', color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <RotateCcw size={18} />
                                    {t('confirm_return') || 'İadeyi Onayla'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Helper Component for Stats
const StatsCard = ({ icon: Icon, label, value, color, bg }) => (
    <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: bg || `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
            <Icon size={24} />
        </div>
        <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1.2' }}>{value}</div>
        </div>
    </div>
);

export default StockDashboard;
