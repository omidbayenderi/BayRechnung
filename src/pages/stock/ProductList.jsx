import React, { useState } from 'react';
import { useStock } from '../../context/StockContext';
import { useLanguage } from '../../context/LanguageContext';
import { Plus, Edit, Trash2, Search, Filter, X, Save, AlertTriangle, Package, Download, Link, Image as ImageIcon, Check, Tag } from 'lucide-react';

const ProductList = () => {
    const { products, addProduct, updateProduct, deleteProduct, categories, addCategory, deleteCategory } = useStock();
    const { t } = useLanguage();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);

    // Category Management State
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        category: 'Parts',
        price: '',
        stock: '',
        minStock: 5,
        sku: '',
        image: '',
        description: ''
    });

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData(product);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm(t('confirmDelete', 'Bu ürünü silmek istediğinize emin misiniz?'))) {
            deleteProduct(id);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            minStock: parseInt(formData.minStock)
        };

        if (editingProduct) {
            updateProduct(editingProduct.id, data);
        } else {
            addProduct(data);
        }
        setIsModalOpen(false);
        setEditingProduct(null);
        setFormData({ name: '', category: categories[0] || 'Products', price: '', stock: '', minStock: 5, sku: '', image: '', description: '' });
    };

    const handleAddCategory = () => {
        if (newCategoryName.trim()) {
            addCategory(newCategoryName.trim());
            setFormData({ ...formData, category: newCategoryName.trim() });
            setNewCategoryName('');
            setIsAddingCategory(false);
        }
    };

    const handleDeleteCategory = (e, cat) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm(`${cat} ${t('confirmDeleteCategory', 'kategorisini silmek istediğinize emin misiniz?')}`)) {
            deleteCategory(cat);
            // If the selected category was deleted, fallback to default or empty
            if (formData.category === cat) {
                setFormData({ ...formData, category: categories[0] || '' });
            }
        }
    };

    const filteredProducts = products.filter(product => {
        const name = product.name || '';
        const sku = product.sku || '';
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sku.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="product-list-page" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>

            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>{t('products', 'Ürünler')}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{t('manageInventory', 'Envanter yönetimi')}</p>
                </div>
                <button
                    className="primary-btn"
                    onClick={() => {
                        setEditingProduct(null);
                        setFormData({ name: '', category: categories[0] || '', price: '', stock: '', minStock: 5, sku: '', image: '', description: '' });
                        setIsModalOpen(true);
                    }}
                    style={{ padding: '12px 24px', borderRadius: '12px', fontSize: '1rem', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}
                >
                    <Plus size={20} /> {t('addProduct', 'Yeni Ürün Ekle')}
                </button>
            </div>

            {/* Search and Filter Bar */}
            <div style={{ background: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', gap: '16px', marginBottom: '24px', border: '1px solid var(--border)' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder={t('searchProductPlaceholder', 'Ürün ara...')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input"
                        style={{ paddingLeft: '48px', height: '48px', borderRadius: '12px', fontSize: '1rem' }}
                    />
                </div>
                {/* Future: Add more filters here if needed */}
            </div>

            {/* Products Table */}
            <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <table className="modern-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            <th style={{ padding: '16px 24px', textAlign: 'center', width: '80px', color: 'var(--text-muted)' }}>{t('image', 'Görsel')}</th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem' }}>{t('productName', 'Ürün Adı')}</th>
                            <th style={{ padding: '16px 24px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem' }}>{t('category', 'Kategori')}</th>
                            <th style={{ padding: '16px 24px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem' }}>{t('sku', 'Kod (SKU)')}</th>
                            <th style={{ padding: '16px 24px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem' }}>{t('price', 'Fiyat')}</th>
                            <th style={{ padding: '16px 24px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem' }}>{t('stock', 'Stok')}</th>
                            <th style={{ padding: '16px 24px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem' }}>{t('actions', 'İşlemler')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <Package size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
                                    <p>{t('noProductsFound', 'Ürün bulunamadı.')}</p>
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map(product => {
                                const isLowStock = product.stock <= product.minStock;
                                return (
                                    <tr key={product.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                                {product.image ? (
                                                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                ) : (
                                                    <Package size={24} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{product.name}</div>
                                            {isLowStock && (
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#ef4444', marginTop: '4px', background: '#fee2e2', padding: '2px 8px', borderRadius: '4px' }}>
                                                    <AlertTriangle size={12} /> {t('lowStockBadge', 'Kritik Stok')}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                            <span style={{ padding: '6px 12px', background: '#f1f5f9', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                                {product.category}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'center', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                                            {product.sku}
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '700', color: 'var(--text-main)' }}>
                                            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(product.price)}
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                            <div style={{
                                                display: 'inline-block',
                                                padding: '4px 12px',
                                                borderRadius: '8px',
                                                fontWeight: '700',
                                                background: isLowStock ? '#fee2e2' : '#ecfdf5',
                                                color: isLowStock ? '#ef4444' : '#10b981'
                                            }}>
                                                {product.stock}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    style={{ padding: '8px', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#ef4444', cursor: 'pointer' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Product Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '32px', borderRadius: '24px', width: '500px', maxWidth: '90%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)' }}>
                                {editingProduct ? (t('editProduct') || 'Ürünü Düzenle') : (t('addProduct') || 'Yeni Ürün Ekle')}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', background: '#f1f5f9' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>{t('productName', 'Ürün Adı')}</label>
                                <input
                                    className="form-input"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder={`${t('eg', 'Örn:')} Motor Yağı 5W-30`}
                                    style={{ width: '100%', height: '48px', padding: '0 16px', borderRadius: '12px', border: '1px solid var(--border)' }}
                                />
                            </div>

                            {/* Product Type Selector */}
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                                    {t('productType', 'Ürün Tipi')}
                                </label>
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'physical' })}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            borderRadius: '12px',
                                            border: (formData.type || 'physical') === 'physical' ? '2px solid var(--primary)' : '1px solid var(--border)',
                                            background: (formData.type || 'physical') === 'physical' ? '#eff6ff' : 'white',
                                            color: (formData.type || 'physical') === 'physical' ? 'var(--primary)' : 'var(--text-muted)',
                                            fontWeight: (formData.type || 'physical') === 'physical' ? 'bold' : 'normal',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Package size={20} />
                                        {t('physicalProduct', 'Fiziksel Ürün')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'digital' })}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            borderRadius: '12px',
                                            border: formData.type === 'digital' ? '2px solid var(--primary)' : '1px solid var(--border)',
                                            background: formData.type === 'digital' ? '#eff6ff' : 'white',
                                            color: formData.type === 'digital' ? 'var(--primary)' : 'var(--text-muted)',
                                            fontWeight: formData.type === 'digital' ? 'bold' : 'normal',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Download size={20} />
                                        {t('digitalProduct', 'Dijital / Hizmet')}
                                    </button>
                                </div>
                            </div>

                            {/* Conditional Inputs Based on Type */}
                            {formData.type === 'digital' && (
                                <div className="form-group" style={{ marginBottom: '20px', padding: '16px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Link size={16} />
                                        {t('downloadLink', 'İndirme Linki')}
                                    </label>
                                    <input
                                        className="form-input"
                                        value={formData.downloadUrl || ''}
                                        onChange={e => setFormData({ ...formData, downloadUrl: e.target.value })}
                                        placeholder="https://dropbox.com/..."
                                        style={{ width: '100%', height: '48px', padding: '0 16px', borderRadius: '12px', border: '1px solid #bbf7d0' }}
                                    />
                                    <small style={{ color: '#166534', marginTop: '6px', display: 'block' }}>
                                        {t('digitalDownloadUrlHelp', '* Bu link, satın alma sonrası müşteriye otomatik gönderilir.')}
                                    </small>
                                </div>
                            )}

                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>{t('description', 'Açıklama')}</label>
                                <textarea
                                    className="form-input"
                                    rows="2"
                                    value={formData.description || ''}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder={t('productDescriptionPlaceholder', 'Ürün hakkında kısa bilgi...')}
                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', fontFamily: 'inherit', resize: 'vertical' }}
                                />
                            </div>

                            {/* Media Manager Section */}
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>{t('productMedia', 'Ürün Görselleri ve Video')}</label>

                                {/* 1. Upload Buttons Area */}
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                    {/* Upload Images */}
                                    <label style={{
                                        flex: 1, height: '48px', borderRadius: '12px', border: '1px dashed var(--primary)', background: '#eff6ff',
                                        color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500'
                                    }}>
                                        <input
                                            type="file" multiple accept="image/*" style={{ display: 'none' }}
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files);
                                                if (files.length > 0) {
                                                    const newImages = [];
                                                    let processedCount = 0;
                                                    files.forEach(file => {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            newImages.push(reader.result);
                                                            processedCount++;
                                                            if (processedCount === files.length) {
                                                                // Add new images to existing list
                                                                const updatedImages = [...(formData.images || []), ...newImages];
                                                                setFormData({
                                                                    ...formData,
                                                                    images: updatedImages,
                                                                    image: updatedImages.length > 0 ? updatedImages[0] : '' // Sync main image
                                                                });
                                                            }
                                                        };
                                                        reader.readAsDataURL(file);
                                                    });
                                                }
                                            }}
                                        />
                                        <ImageIcon size={18} /> {t('addImagesMulti', 'Resim Ekle (Çoklu)')}
                                    </label>

                                    {/* Upload Video */}
                                    <label style={{
                                        flex: 1, height: '48px', borderRadius: '12px', border: '1px dashed #f59e0b', background: '#fffbeb',
                                        color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500'
                                    }}>
                                        <input
                                            type="file" accept="video/*" style={{ display: 'none' }}
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    if (file.size > 50 * 1024 * 1024) { // 50MB Limit Alert
                                                        alert(t('videoSizeError', 'Video boyutu çok yüksek! Lütfen 50MB altı yükleyin.'));
                                                        return;
                                                    }
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        // In a real app, upload to server. Here we store base64 (risky for large files but requested functionality)
                                                        setFormData({ ...formData, video: reader.result });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                                            {t('addVideo', 'Video Ekle')}
                                        </div>
                                    </label>
                                </div>

                                {/* 2. Gallery Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>

                                    {/* Images List */}
                                    {(formData.images || (formData.image ? [formData.image] : [])).map((imgUrl, index) => (
                                        <div key={index} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: formData.image === imgUrl ? '2px solid var(--primary)' : '1px solid var(--border)' }}>
                                            <img src={imgUrl} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                                            {/* Action Overlay */}
                                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                                onMouseLeave={e => e.currentTarget.style.opacity = 0}
                                            >
                                                {/* Pin/Set Main Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, image: imgUrl })}
                                                    title={t('setAsMainImage', 'Ana Görsel Yap')}
                                                    style={{ background: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: formData.image === imgUrl ? '#fbbf24' : '#94a3b8' }}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill={formData.image === imgUrl ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                                </button>

                                                {/* Delete Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newImages = (formData.images || [formData.image]).filter((_, i) => i !== index);
                                                        setFormData({
                                                            ...formData,
                                                            images: newImages,
                                                            image: newImages.length > 0 ? newImages[0] : '' // Re-assign main if deleted
                                                        });
                                                    }}
                                                    style={{ background: '#fee2e2', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444' }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>

                                            {/* Main Badge */}
                                            {formData.image === imgUrl && (
                                                <div style={{ position: 'absolute', top: '4px', left: '4px', background: 'var(--primary)', color: 'white', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{t('main', 'ANA')}</div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Video Preview */}
                                    {formData.video && (
                                        <div style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #f59e0b', background: '#000' }}>
                                            <video src={formData.video} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                                                <div style={{ padding: '8px', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', color: 'white' }}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, video: null })}
                                                style={{ position: 'absolute', top: '4px', right: '4px', background: '#fee2e2', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444' }}
                                            >
                                                <X size={14} />
                                            </button>
                                            <div style={{ position: 'absolute', bottom: '4px', left: '4px', background: '#f59e0b', color: 'white', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>VIDEO</div>
                                        </div>
                                    )}

                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>{t('sku', 'Kod (SKU)')}</label>
                                    <input
                                        className="form-input"
                                        required
                                        value={formData.sku}
                                        onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                        placeholder={`${t('eg', 'Örn:')} OIL-001`}
                                        style={{ width: '100%', height: '48px', padding: '0 16px', borderRadius: '12px', border: '1px solid var(--border)' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>{t('category', 'Kategori')}</label>

                                    {!isAddingCategory ? (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <div style={{ position: 'relative', flex: 1 }}>
                                                <select
                                                    className="form-input"
                                                    value={formData.category}
                                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                    style={{ width: '100%', height: '48px', padding: '0 16px', borderRadius: '12px', border: '1px solid var(--border)', appearance: 'none' }}
                                                >
                                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                                {/* Custom Arrow or Icon */}
                                            </div>

                                            {/* Add New Category Button */}
                                            <button
                                                type="button"
                                                onClick={() => setIsAddingCategory(true)}
                                                style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0f9ff', color: 'var(--primary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                title={t('addNewCategory', 'Yeni Kategori Ekle')}
                                            >
                                                <Plus size={20} />
                                            </button>

                                            {/* Delete Category Button (Optional - careful with this) */}
                                            <button
                                                type="button"
                                                onClick={(e) => handleDeleteCategory(e, formData.category)}
                                                style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fee2e2', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                title={t('deleteCategory', 'Seçili Kategoriyi Sil')}
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input
                                                autoFocus
                                                type="text"
                                                value={newCategoryName}
                                                onChange={(e) => setNewCategoryName(e.target.value)}
                                                placeholder={t('newCategoryName', 'Kategori adı...')}
                                                style={{ flex: 1, height: '48px', padding: '0 16px', borderRadius: '12px', border: '1px solid var(--primary)', outline: 'none' }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddCategory();
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddCategory}
                                                style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#10b981', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <Check size={20} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsAddingCategory(false)}
                                                style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f1f5f9', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>{t('price', 'Fiyat')}</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="form-input"
                                        required
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        style={{ width: '100%', height: '48px', padding: '0 16px', borderRadius: '12px', border: '1px solid var(--border)' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>{t('stock', 'Stok')}</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        required
                                        value={formData.stock}
                                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                        style={{ width: '100%', height: '48px', padding: '0 16px', borderRadius: '12px', border: '1px solid var(--border)' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>{t('minStockAlert', 'Kritik Stok Uyarı Limiti')}</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.minStock}
                                    onChange={e => setFormData({ ...formData, minStock: e.target.value })}
                                    style={{ width: '100%', height: '48px', padding: '0 16px', borderRadius: '12px', border: '1px solid var(--border)' }}
                                />
                                <small style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>{t('minStockAlertHelp', 'Stok bu sayının altına düşerse uyarı verir.')}</small>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                                <button type="button" className="secondary-btn" onClick={() => setIsModalOpen(false)} style={{ flex: 1, height: '56px', borderRadius: '14px', border: '1px solid var(--border)', background: 'white', color: 'var(--text-secondary)', fontWeight: '600' }}>
                                    {t('cancel', 'İptal')}
                                </button>
                                <button type="submit" className="primary-btn" style={{ flex: 2, height: '56px', borderRadius: '14px', background: 'var(--primary)', color: 'white', fontWeight: '600', border: 'none', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
                                    {t('save', 'Kaydet')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;
