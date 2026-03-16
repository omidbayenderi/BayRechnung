import { useState } from 'react';
import { useWebsite } from '../../context/WebsiteContext';
import { useStock } from '../../context/StockContext';
import { motion } from 'framer-motion';
import {
    ShoppingBag, Package, Eye, EyeOff, Globe, Settings,
    AlertTriangle, CheckCircle, ExternalLink, RefreshCw, Tag
} from 'lucide-react';

const WebsiteStore = () => {
    const { siteConfig, updateSiteConfig } = useWebsite();
    const { products = [], settings: stockSettings } = useStock();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Store display settings stored inside siteConfig
    const storeConfig = siteConfig?.store || {
        enabled: false,
        showOutOfStock: false,
        featuredCategories: [],
        displayMode: 'grid', // grid | list
        productsPerPage: 12,
    };

    const publishedProducts = products.filter(p => p.stock > 0 || storeConfig.showOutOfStock);
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

    const updateStore = async (patch) => {
        setSaving(true);
        await updateSiteConfig({ store: { ...storeConfig, ...patch } });
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const toggleFeaturedCategory = (cat) => {
        const current = storeConfig.featuredCategories || [];
        const updated = current.includes(cat)
            ? current.filter(c => c !== cat)
            : [...current, cat];
        updateStore({ featuredCategories: updated });
    };

    const rowStyle = {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', background: '#f8fafc', borderRadius: '10px',
        border: '1px solid #f1f5f9'
    };

    const Toggle = ({ value, onChange }) => (
        <div onClick={onChange} style={{
            width: '44px', height: '24px', borderRadius: '12px', position: 'relative',
            cursor: 'pointer', background: value ? '#22c55e' : '#cbd5e1', transition: 'background 0.2s', flexShrink: 0
        }}>
            <div style={{
                position: 'absolute', top: '2px', left: value ? '22px' : '2px',
                width: '20px', height: '20px', borderRadius: '50%', background: 'white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s'
            }} />
        </div>
    );

    return (
        <div style={{ padding: '24px', maxWidth: '840px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ShoppingBag size={24} color="#10b981" /> Website Mağazası
                    </h1>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.875rem' }}>
                        Stok sisteminizdeki ürünleri web sitenizde gösterin.
                    </p>
                </div>
                {saved && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: '600', fontSize: '0.875rem' }}>
                        <CheckCircle size={16} /> Kaydedildi
                    </div>
                )}
            </div>

            {/* Status banner */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{
                    padding: '16px 20px', borderRadius: '12px', marginBottom: '24px',
                    background: storeConfig.enabled ? '#f0fdf4' : '#f8fafc',
                    border: `1.5px solid ${storeConfig.enabled ? '#bbf7d0' : '#e2e8f0'}`,
                    display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                {storeConfig.enabled
                    ? <CheckCircle size={20} color="#16a34a" />
                    : <AlertTriangle size={20} color="#f59e0b" />
                }
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.9rem' }}>
                        {storeConfig.enabled ? 'Mağaza Aktif' : 'Mağaza Kapalı'}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                        {storeConfig.enabled
                            ? `${publishedProducts.length} ürün ziyaretçilere gösteriliyor.`
                            : 'Mağazayı aktif etmek için aşağıdaki ayarı açın.'}
                    </div>
                </div>
                <Toggle value={storeConfig.enabled} onChange={() => updateStore({ enabled: !storeConfig.enabled })} />
            </motion.div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {[
                    { label: 'Toplam Ürün', value: products.length, color: '#6366f1' },
                    { label: 'Stokta', value: products.filter(p => p.stock > 0).length, color: '#10b981' },
                    { label: 'Stok Dışı', value: products.filter(p => p.stock <= 0).length, color: '#f59e0b' },
                ].map(stat => (
                    <div key={stat.label} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: stat.color }}>{stat.value}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Settings */}
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', marginBottom: '20px' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Settings size={16} color="#6366f1" />
                    <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.9rem' }}>Görüntüleme Ayarları</span>
                </div>
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={rowStyle}>
                        <div>
                            <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.875rem' }}>Stok dışı ürünleri göster</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Stok = 0 olan ürünler sitede görünsün</div>
                        </div>
                        <Toggle value={storeConfig.showOutOfStock} onChange={() => updateStore({ showOutOfStock: !storeConfig.showOutOfStock })} />
                    </div>

                    <div style={rowStyle}>
                        <div>
                            <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.875rem' }}>Görünüm</div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {['grid', 'list'].map(mode => (
                                <button key={mode} onClick={() => updateStore({ displayMode: mode })}
                                    style={{
                                        padding: '5px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem',
                                        background: storeConfig.displayMode === mode ? '#6366f1' : '#f1f5f9',
                                        color: storeConfig.displayMode === mode ? 'white' : '#64748b'
                                    }}>
                                    {mode === 'grid' ? 'Izgara' : 'Liste'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={rowStyle}>
                        <div>
                            <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.875rem' }}>Sayfa başına ürün</div>
                        </div>
                        <select value={storeConfig.productsPerPage}
                            onChange={e => updateStore({ productsPerPage: Number(e.target.value) })}
                            style={{ padding: '6px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontWeight: '600', fontSize: '0.875rem' }}>
                            {[6, 9, 12, 24].map(n => <option key={n} value={n}>{n} ürün</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Featured Categories */}
            {categories.length > 0 && (
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', marginBottom: '20px' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Tag size={16} color="#f59e0b" />
                        <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.9rem' }}>Öne Çıkan Kategoriler</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>(boş = hepsi gösterilir)</span>
                    </div>
                    <div style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {categories.map(cat => {
                            const isSelected = (storeConfig.featuredCategories || []).includes(cat);
                            return (
                                <button key={cat} onClick={() => toggleFeaturedCategory(cat)}
                                    style={{
                                        padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem',
                                        background: isSelected ? '#fef3c7' : '#f1f5f9',
                                        color: isSelected ? '#b45309' : '#64748b',
                                        outline: isSelected ? '2px solid #f59e0b' : '2px solid transparent'
                                    }}>
                                    {cat}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Product preview */}
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Package size={16} color="#6366f1" />
                    <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.9rem' }}>Ürün Önizleme</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>({publishedProducts.length} ürün gösterilecek)</span>
                </div>
                {products.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                        <Package size={36} style={{ marginBottom: '12px', opacity: 0.4 }} />
                        <div style={{ fontWeight: '600', marginBottom: '6px' }}>Henüz ürün eklenmemiş</div>
                        <div style={{ fontSize: '0.83rem' }}>Stok modülünden ürün ekleyerek başlayın.</div>
                    </div>
                ) : (
                    <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
                        {publishedProducts.slice(0, 8).map(product => (
                            <div key={product.id} style={{
                                border: '1px solid #f1f5f9', borderRadius: '10px', padding: '12px',
                                opacity: product.stock <= 0 ? 0.6 : 1
                            }}>
                                <div style={{ width: '100%', aspectRatio: '1', background: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                                    {product.image_url
                                        ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                        : <Package size={24} color="#cbd5e1" />
                                    }
                                </div>
                                <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.8rem', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>
                                <div style={{ fontWeight: '800', color: '#6366f1', fontSize: '0.85rem' }}>
                                    {stockSettings?.currency || '€'}{Number(product.price || 0).toFixed(2)}
                                </div>
                                {product.stock <= 0 && (
                                    <div style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: '600', marginTop: '2px' }}>Stok Dışı</div>
                                )}
                            </div>
                        ))}
                        {publishedProducts.length > 8 && (
                            <div style={{ border: '1.5px dashed #e2e8f0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600', minHeight: '80px' }}>
                                +{publishedProducts.length - 8} daha
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WebsiteStore;
