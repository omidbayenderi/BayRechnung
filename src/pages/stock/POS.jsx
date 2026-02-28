import React, { useState, useEffect, useMemo } from 'react';
import { useStock } from '../../context/StockContext';
import { Search, ShoppingCart, Package, AlertTriangle, ChevronRight, X, Trash2, CreditCard, Banknote, Droplet, Wrench, Settings, Box, Zap, Plus, Wallet, Smartphone, QrCode } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useInvoice } from '../../context/InvoiceContext';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

// --- Icons for Categories ---
const CategoryIcon = ({ category, size = 24, className }) => {
    // Normalize category name for matching
    const cat = category?.toLowerCase() || '';
    if (cat.includes('fluid') || cat.includes('oil')) return <Droplet size={size} className={className} />;
    if (cat.includes('part') || cat.includes('brake')) return <Settings size={size} className={className} />; // Gear/Settings icon for parts
    if (cat.includes('filter')) return <Zap size={size} className={className} />; // Abstract shape for filters
    if (cat.includes('service')) return <Wrench size={size} className={className} />;
    return <Box size={size} className={className} />;
};

const CategoryWheel = ({ categories, selectedCategory, onSelect, t }) => {
    const itemHeight = 48; // Height of each item
    const containerHeight = 160;
    const containerRef = React.useRef(null);
    const isScrollingRef = React.useRef(false); // To prevent loop updates during manual scroll

    // Scroll handler to detect center item
    const handleScroll = () => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const scrollTop = container.scrollTop;
        const centerOffset = containerHeight / 2;

        // Calculate the center point in the scrollable area
        const centerPoint = scrollTop + centerOffset;

        // Each item is itemHeight px tall.
        // We have top padding of paddingY.
        // The effective index at center is:
        // (centerPoint - paddingY) / itemHeight

        const paddingY = (containerHeight - itemHeight) / 2;
        const rawIndex = (centerPoint - paddingY) / itemHeight;

        // Adjust rawIndex by -0.5 because the item is centered at index + 0.5 * height
        // actually simpler: scrollTop represents the top edge of visible area.
        // Center of visible area is scrollTop + (containerHeight/2).
        // Center of item i is paddingY + (i * itemHeight) + (itemHeight/2).
        // Equating them: scrollTop + (containerHeight/2) = paddingY + (i * itemHeight) + (itemHeight/2)
        // Since paddingY = (containerHeight - itemHeight)/2
        // scrollTop + containerHeight/2 = (containerHeight/2 - itemHeight/2) + i*itemHeight + itemHeight/2
        // scrollTop + containerHeight/2 = containerHeight/2 + i*itemHeight
        // scrollTop = i * itemHeight

        // So index = scrollTop / itemHeight
        const index = Math.round(scrollTop / itemHeight);
        const clampedIndex = Math.max(0, Math.min(index, categories.length - 1));

        // Only update if changed and user is actively scrolling (interacting)
        if (categories[clampedIndex] !== selectedCategory) {
            // Use a timeout or debounce in real app, but direct update here is fine if logic is stable
            // We mark as scrolling to differentiate from programatic scroll
            isScrollingRef.current = true;
            onSelect(categories[clampedIndex]);
        }
    };

    // Sync scroll position when selectedCategory changes externally (or initially)
    useEffect(() => {
        if (!containerRef.current) return;

        const index = categories.indexOf(selectedCategory);
        if (index === -1) return;

        const targetScrollTop = index * itemHeight;

        // If the difference is small (e.g. from handleScroll update), don't scroll again to avoid jitter
        if (Math.abs(containerRef.current.scrollTop - targetScrollTop) > 2) {
            containerRef.current.scrollTo({
                top: targetScrollTop,
                behavior: 'smooth'
            });
        }

        // Reset scrolling flag after animation (roughly)
        setTimeout(() => { isScrollingRef.current = false; }, 300);

    }, [selectedCategory, categories]);

    return (
        <div style={{ position: 'relative', height: containerHeight, overflow: 'hidden', background: '#f8fafc', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', userSelect: 'none' }}>
            {/* Gradient Masks */}
            <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '50px', background: 'linear-gradient(to bottom, #f8fafc 20%, transparent)', zIndex: 2, pointerEvents: 'none' }}></div>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '50px', background: 'linear-gradient(to top, #f8fafc 20%, transparent)', zIndex: 2, pointerEvents: 'none' }}></div>

            {/* Center Highlight */}
            <div style={{
                position: 'absolute', left: '10%', right: '10%', top: '50%', height: '48px', marginTop: '-24px',
                borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.3)', background: 'rgba(59, 130, 246, 0.05)',
                zIndex: 1, pointerEvents: 'none', boxShadow: '0 2px 8px rgba(59, 130, 246, 0.1)'
            }}></div>

            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="hide-scrollbar"
                style={{
                    height: '100%',
                    overflowY: 'auto',
                    scrollSnapType: 'y mandatory',
                    paddingTop: `${(containerHeight - itemHeight) / 2}px`,
                    paddingBottom: `${(containerHeight - itemHeight) / 2}px`,
                    boxSizing: 'border-box',
                    position: 'relative',
                    zIndex: 0
                }}
            >
                {categories.map((cat, i) => {
                    const isSelected = selectedCategory === cat;
                    return (
                        <div
                            key={cat}
                            onClick={() => onSelect(cat)}
                            style={{
                                height: itemHeight,
                                scrollSnapAlign: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                width: '100%',
                                cursor: 'pointer',
                                opacity: isSelected ? 1 : 0.4,
                                transform: isSelected ? 'scale(1.15) perspective(500px) rotateX(0deg)' : `scale(0.9) perspective(500px) rotateX(${i < categories.indexOf(selectedCategory) ? 20 : -20}deg)`,
                                transition: 'all 0.2s ease-out',
                                color: isSelected ? '#2563eb' : 'var(--text-secondary)',
                                fontWeight: isSelected ? '800' : '500',
                            }}
                        >
                            {cat !== 'All' && <CategoryIcon category={cat} size={isSelected ? 20 : 18} />}
                            <span style={{ fontSize: isSelected ? '1.1rem' : '0.95rem' }}>
                                {cat === 'All' ? (t('allCategories') || 'Tümü') : cat}
                            </span>
                        </div>
                    );
                })}
            </div>
            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

const POS = () => {
    const { products, categories, cart, addToCart, removeFromCart, updateCartQuantity, clearCart, completeSale } = useStock();
    const { t } = useLanguage();
    const { currentUser } = useAuth();
    const { companyProfile } = useInvoice();

    // Defensive check: Ensure products are valid before deriving cart total
    const safeCart = useMemo(() => {
        return cart.map(item => {
            if (item.product) return item;
            // Try to find product in the products list if missing from item object
            const foundProduct = products.find(p => p.id === item.productId || p.id === item.id);
            return { ...item, product: foundProduct || { name: 'Unknown Product', price: 0 } };
        });
    }, [cart, products]);

    const cartTotal = useMemo(() => {
        return safeCart.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);
    }, [safeCart]);
    const [searchTerm, setSearchTerm] = useState('');
    // Initialize with 'All' or the first available category if 'All' isn't explicitly in the list (though we usually add it manually)
    // Ensure selectedCategory is never null/undefined
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Safety check: if categories change and selectedCategory is no longer valid (except 'All'), revert to 'All'
    useEffect(() => {
        if (selectedCategory !== 'All' && categories.length > 0 && !categories.includes(selectedCategory)) {
            setSelectedCategory('All');
        }
    }, [categories, selectedCategory]);

    const [showCheckout, setShowCheckout] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentStep, setPaymentStep] = useState('select'); // 'select' | 'processing'
    const [checkoutId, setCheckoutId] = useState(null);
    const [qrError, setQrError] = useState(false);
    const [lastAddedCategory, setLastAddedCategory] = useState(null);

    // --- Sound Effects (Web Audio API) ---
    const playBeep = () => {
        // ... (Keep existing sound logic or reuse helper if extracted)
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    };

    const playSuccessSound = () => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        const playNote = (freq, time) => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.type = 'triangle';
            oscillator.frequency.value = freq;

            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime + time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + time + 0.3);

            oscillator.start(audioCtx.currentTime + time);
            oscillator.stop(audioCtx.currentTime + time + 0.3);
        };

        // Play a major chord (C-E-G)
        playNote(523.25, 0);   // C5
        playNote(659.25, 0.1); // E5
        playNote(783.99, 0.2); // G5
        playNote(1046.50, 0.4); // C6
    };

    const handleAddToCart = (product) => {
        addToCart(product);
        playBeep();
        setLastAddedCategory(product.category);
    };

    // --- Upsell Logic ---
    const getRelatedCategory = (cat) => {
        const c = cat?.toLowerCase() || '';
        // Enhance logic based on typical automotive pairs
        if (c.includes('oil')) return 'Filters'; // Oils -> Filters
        if (c.includes('filter')) return 'Fluids'; // Filters -> Fluids (e.g. Brake fluid)
        if (c.includes('brake')) return 'Parts'; // Brakes -> General Parts
        if (c.includes('tire')) return 'Services'; // Tires -> Alignment Service
        return 'Accessories';
    };

    const relatedCategory = getRelatedCategory(lastAddedCategory);

    // Find products in related category that are NOT in the cart
    const upsellProducts = products
        .filter(p => p.category === relatedCategory && !cart.find(c => c.product.id === p.id))
        .slice(0, 2); // Show max 2 suggestions

    // Filter Products - Memoized for performance to prevent flicker during heavy renders
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const name = product.name || '';
            const sku = product.sku || '';
            const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sku.toLowerCase().includes(searchTerm.toLowerCase());

            // Loose matching for category to avoid case/whitespace issues
            const productCat = product.category || '';
            const selectedCat = selectedCategory || 'All';

            const matchesCategory = selectedCat === 'All' || productCat === selectedCat;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchTerm, selectedCategory]);

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleCheckout = () => {
        if (cart.length === 0) return;
        setCheckoutId(Date.now().toString());
        setQrError(false);
        setPaymentStep('select');
        setShowCheckout(true);
    };

    const handleSelectPaymentMethod = (method) => {
        setPaymentMethod(method);
        // Ensure we have a checkout ID if we are jumping into online payment
        if (!checkoutId) setCheckoutId(Date.now().toString());
        setQrError(false);

        if (method === 'stripe' || method === 'paypal' || method === 'card') {
            setPaymentStep('processing');
        }
    };

    const confirmPayment = async () => {
        try {
            const sale = await completeSale(paymentMethod);
            if (sale) {
                playSuccessSound();
                alert(t('saleComplete') || 'Satış Tamamlandı!');
                setShowCheckout(false);
                setPaymentStep('select');
                setLastAddedCategory(null);
            } else {
                alert(t('saleFailed') || 'Satış işlemi kaydedilemedi. Lütfen bağlantınızı kontrol edin.');
            }
        } catch (err) {
            console.error('Confirm payment error:', err);
            alert('Ödeme onayı sırasında bir hata oluştu: ' + err.message);
        }
    };

    const paymentData = useMemo(() => {
        if (!checkoutId) return '';
        if (paymentMethod === 'paypal') {
            return companyProfile?.paypalMe || `https://paypal.me/bayzenit/${cartTotal}`;
        } else if (paymentMethod === 'stripe') {
            return companyProfile?.stripeLink || `https://buy.stripe.com/bayzenit_demo?amount=${cartTotal * 100}`;
        }
        return `https://bayzenit.com/pay/${checkoutId}`;
    }, [paymentMethod, checkoutId, cartTotal, companyProfile]);

    const paymentQrUrl = useMemo(() => {
        if (!paymentData) return '';
        // Using Google Charts QR API for maximum compatibility
        const baseUrl = "https://chart.googleapis.com/chart?cht=qr&chs=350x350&chl=";
        const url = `${baseUrl}${encodeURIComponent(paymentData)}`;
        console.log('[POS] Generated QR URL:', url);
        return url;
    }, [paymentData]);

    return (
        <div className="pos-container" style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 80px)', // Adjusted for header
            gap: '16px',
            fontFamily: 'Inter, sans-serif',
            overflow: 'hidden', // Prevent body scroll, handle inner scrolls
            position: 'relative'
        }}>
            {/* Desktop: Side-by-side, Mobile: Stacked checks via CSS media queries would be ideal, but for inline styles we use flex-wrap and calc */}
            <div style={{
                display: 'flex',
                flex: 1,
                gap: '24px',
                overflow: 'hidden',
                flexWrap: 'wrap', // Allow stacking on small screens
            }}>

                {/* Left: Product Grid */}
                <div className="product-selection" style={{
                    flex: '1 1 600px', // Grow, Shake, Basis - allows wrapping
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    overflow: 'hidden',
                    height: '100%',
                    minWidth: '0' // Prevent flex overflowing
                }}>

                    {/* Categories & Search Header */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        {/* Search Bar */}
                        <div className="search-bar" style={{ position: 'relative', width: '100%' }}>
                            <Search className="search-icon" size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder={t('searchProduct') || 'Ürün veya Kod (SKU) Ara...'}
                                className="form-input"
                                style={{
                                    paddingLeft: '48px',
                                    height: '56px',
                                    fontSize: '1.05rem',
                                    borderRadius: '14px',
                                    border: '1px solid rgba(0,0,0,0.08)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                                    width: '100%'
                                }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Category Pills - Horizontal Scroll */}
                        {/* Apple-style Vertical Category Picker with Snap & Auto-Select */}
                        <CategoryWheel
                            categories={['All', ...categories]}
                            selectedCategory={selectedCategory}
                            onSelect={setSelectedCategory}
                            t={t}
                        />

                    </div>

                    {/* Grid */}
                    <div className="products-grid custom-scrollbar" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', // Slightly smaller min-width for mobile
                        gap: '16px',
                        overflowY: 'auto',
                        paddingRight: '4px',
                        paddingBottom: '80px', // Extra space for mobile floating buttons if needed
                        flex: 1,
                        alignContent: 'start'
                    }}>
                        {filteredProducts.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: '16px' }}>
                                <Package size={48} style={{ opacity: 0.3 }} />
                                <p style={{ fontSize: '1.1rem' }}>{t('noProductsFound') || 'Ürün bulunamadı.'}</p>
                                <a href="/stock/products" style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '10px 20px', background: 'var(--primary)', color: 'white',
                                    borderRadius: '12px', textDecoration: 'none', fontWeight: '600'
                                }}>
                                    <Plus size={18} /> {t('addNewProduct') || 'Yeni Ürün Ekle'}
                                </a>
                            </div>
                        ) : (
                            filteredProducts.map(product => {
                                const isLowStock = product.stock <= product.minStock;
                                return (
                                    <motion.div
                                        key={product.id}
                                        layoutId={`product-${product.id}`}
                                        whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => addToCart(product)}
                                        className="product-card"
                                        style={{
                                            background: 'white',
                                            borderRadius: '20px',
                                            padding: '12px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '10px',
                                            cursor: 'pointer',
                                            minHeight: '260px', // Slightly taller minimum
                                            height: 'auto', // Allow it to grow if needed
                                            justifyContent: 'space-between',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                            border: '1px solid rgba(0,0,0,0.04)',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {/* Stock Check Badge */}
                                        <div style={{
                                            position: 'absolute', top: '12px', right: '12px',
                                            background: isLowStock ? '#fee2e2' : '#ecfdf5',
                                            color: isLowStock ? '#ef4444' : '#10b981',
                                            padding: '4px 8px', borderRadius: '8px',
                                            fontSize: '0.75rem', fontWeight: '700',
                                            display: 'flex', alignItems: 'center', gap: '4px',
                                            zIndex: 2,
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                        }}>
                                            {isLowStock && <AlertTriangle size={12} />}
                                            {product.stock}
                                        </div>

                                        <div className="product-image-area" style={{
                                            aspectRatio: '1/1', // Force square aspect ratio
                                            width: '100%',
                                            background: '#ffffff',
                                            borderRadius: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--text-muted)',
                                            position: 'relative',
                                            marginBottom: '4px',
                                            overflow: 'hidden', // Ensure image doesn't spill out
                                            border: '1px solid #f1f5f9' // Optional: Add a subtle border since background is white now
                                        }}>
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }} />
                                            ) : (
                                                <CategoryIcon category={product.category} size={48} className="placeholder-icon" style={{ opacity: 0.3 }} />
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                                            <h4 style={{
                                                fontSize: '0.95rem',
                                                fontWeight: '700',
                                                margin: 0,
                                                color: 'var(--text-main)',
                                                lineHeight: '1.3',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2, // Allow 2 lines for name
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {product.name}
                                            </h4>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                color: 'var(--text-muted)',
                                                fontFamily: 'monospace',
                                                background: '#f1f5f9',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                alignSelf: 'flex-start',
                                                maxWidth: '100%',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }} title={product.sku}>
                                                {product.sku}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span className="price-tag" style={{
                                                fontWeight: '800',
                                                color: 'var(--primary)',
                                                fontSize: '1.1rem',
                                                background: 'rgba(59, 130, 246, 0.1)',
                                                padding: '4px 10px',
                                                borderRadius: '8px'
                                            }}>
                                                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(product.price)}
                                            </span>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                                <Plus size={18} />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right: Cart Panel */}
                <div className="pos-cart" style={{
                    flex: '0 0 400px', // Basis 400px, don't grow/shrink on desktop if possible
                    width: '100%',
                    maxWidth: '100%', // Mobile Reset
                    background: 'white',
                    borderRadius: '24px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    overflow: 'hidden',
                    border: '1px solid rgba(0,0,0,0.03)',
                    // On mobile, this will be stacked or we can hide it behind a toggle. 
                    // For a responsive web app without media queries in JS, we rely on flex-wrap.
                    // To make it truly responsive inline, we need a hook or CSS class. 
                    // Assuming "tablet/desktop" first. Ideally, use a CSS class locally.
                }}>
                    <style>{`
                    @media (max-width: 1024px) {
                        .pos-container { flex-direction: column !important; height: auto !important; overflow-y: auto !important; }
                        .product-selection { flex: none !important; height: auto !important; overflow: visible !important; }
                        .products-grid { overflow: visible !important; padding-bottom: 20px !important; }
                        .pos-cart { flex: none !important; width: 100% !important; height: auto !important; margin-top: 20px; }
                        /* Optional: Sticky cart footer on mobile */
                        /* .cart-footer { position: sticky; bottom: 0; z-index: 10; } */
                    }
                `}</style>
                    <div className="cart-header" style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ padding: '8px', background: 'var(--primary)', borderRadius: '10px', color: 'white' }}>
                                <ShoppingCart size={20} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>{t('cart') || 'Sepet'}</h3>
                        </div>
                        <div className="badge" style={{ background: '#f1f5f9', color: 'var(--text-main)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '600' }}>
                            {totalItems} Parça
                        </div>
                    </div>

                    <div className="cart-items custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {cart.length === 0 ? (
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', opacity: 0.5 }}>
                                <div style={{ width: '80px', height: '80px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                                    <Package size={40} />
                                </div>
                                <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{t('cartEmpty') || 'Sepet Boş'}</p>
                                <small>{t('scanOrSelect') || 'Ürün seçin veya barkod okutun'}</small>
                            </div>
                        ) : (
                            <AnimatePresence>
                                {safeCart.map((item, idx) => (
                                    <motion.div
                                        key={item.product?.id || idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="cart-item"
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '16px',
                                            borderRadius: '16px',
                                            background: '#f8fafc',
                                            border: '1px solid transparent',
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '4px', color: 'var(--text-main)' }}>{item.product?.name || 'Ürün'}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>
                                                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(item.product?.price || 0)}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '4px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => item.product?.id && updateCartQuantity(item.product.id, -1)}
                                                style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}
                                            >
                                                -
                                            </motion.button>
                                            <span style={{ width: '24px', textAlign: 'center', fontWeight: '700', fontSize: '1rem' }}>{item.quantity}</span>
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => item.product?.id && updateCartQuantity(item.product.id, 1)}
                                                style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
                                            >
                                                +
                                            </motion.button>
                                        </div>

                                        <button
                                            onClick={() => item.product?.id && removeFromCart(item.product.id)}
                                            style={{ marginLeft: '12px', color: '#ff4d4f', background: 'rgba(255, 77, 79, 0.1)', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>

                    {/* Upsell Recommendations */}
                    {cart.length > 0 && upsellProducts.length > 0 && (
                        <div className="upsell-container" style={{ padding: '16px', background: '#f0f9ff', borderTop: '1px solid #bfdbfe', borderBottom: '1px solid #bfdbfe' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#1e40af', fontSize: '0.9rem', fontWeight: '700' }}>
                                <Zap size={16} fill="currentColor" /> {t('recommendedForYou') || 'Bunu da eklemek ister misiniz?'}
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {upsellProducts.map(p => (
                                    <motion.div
                                        key={p.id}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleAddToCart(p)}
                                        style={{
                                            flex: 1,
                                            background: 'white',
                                            padding: '10px',
                                            borderRadius: '12px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                            cursor: 'pointer',
                                            border: '1px solid rgba(0,0,0,0.05)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '6px'
                                        }}
                                    >
                                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary)' }}>
                                                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(p.price)}
                                            </span>
                                            <div style={{ padding: '4px', background: '#eff6ff', borderRadius: '50%', color: 'var(--primary)' }}>
                                                <Plus size={14} />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer Totals */}
                    <div className="cart-footer" style={{ padding: '24px', background: '#ffffff', boxShadow: '0 -4px 20px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                            <span>{t('subtotal') || 'Ara Toplam'}:</span>
                            <span>{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cartTotal * 0.81)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                            <span>{t('tax') || 'KDV'} (19%):</span>
                            <span>{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cartTotal * 0.19)}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '16px' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-main)' }}>{t('total') || 'Toplam'}:</span>
                            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)' }}>{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cartTotal)}</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                            <button
                                className="secondary-btn"
                                onClick={clearCart}
                                disabled={cart.length === 0}
                                style={{ justifyContent: 'center', height: '56px', borderRadius: '14px', border: '1px solid #e2e8f0', color: '#64748b' }}
                            >
                                {t('cancel') || 'İptal'}
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="primary-btn"
                                onClick={handleCheckout}
                                disabled={cart.length === 0}
                                style={{
                                    justifyContent: 'center',
                                    background: 'var(--primary)',
                                    height: '56px',
                                    borderRadius: '14px',
                                    fontSize: '1.1rem',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                                }}
                            >
                                {t('checkout') || 'Ödeme Al'} <ChevronRight size={20} />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Checkout Modal */}
            <AnimatePresence>
                {showCheckout && (
                    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="modal-content"
                            style={{ background: 'white', padding: '40px', borderRadius: '24px', width: '480px', maxWidth: '90%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>{t('paymentMethod') || 'Ödeme Yöntemi'}</h2>
                                <button onClick={() => setShowCheckout(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', background: '#f1f5f9' }}><X size={24} /></button>
                            </div>

                            {paymentStep === 'select' ? (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setPaymentMethod('cash')}
                                            style={{
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '24px',
                                                border: `2px solid ${paymentMethod === 'cash' ? 'var(--primary)' : '#e2e8f0'}`,
                                                background: paymentMethod === 'cash' ? 'rgba(59, 130, 246, 0.05)' : 'white',
                                                borderRadius: '20px', cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ padding: '12px', background: paymentMethod === 'cash' ? 'white' : '#f1f5f9', borderRadius: '50%', boxShadow: paymentMethod === 'cash' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none' }}>
                                                <Banknote size={32} color={paymentMethod === 'cash' ? 'var(--primary)' : '#94a3b8'} />
                                            </div>
                                            <span style={{ fontSize: '1.1rem', fontWeight: '600', color: paymentMethod === 'cash' ? 'var(--primary)' : 'var(--text-main)' }}>{t('cash') || 'Nakit'}</span>
                                        </motion.button>

                                        {/* Generic Card / Manual POS */}
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleSelectPaymentMethod('card')}
                                            style={{
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '24px',
                                                border: `2px solid ${paymentMethod === 'card' ? 'var(--primary)' : '#e2e8f0'}`,
                                                background: paymentMethod === 'card' ? 'rgba(59, 130, 246, 0.05)' : 'white',
                                                borderRadius: '20px', cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ padding: '12px', background: paymentMethod === 'card' ? 'white' : '#f1f5f9', borderRadius: '50%', boxShadow: paymentMethod === 'card' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none' }}>
                                                <CreditCard size={32} color={paymentMethod === 'card' ? 'var(--primary)' : '#94a3b8'} />
                                            </div>
                                            <span style={{ fontSize: '1.1rem', fontWeight: '600', color: paymentMethod === 'card' ? 'var(--primary)' : 'var(--text-main)' }}>POS / Kart</span>
                                        </motion.button>

                                        {/* Dynamic Stripe Option */}
                                        {currentUser?.stripePublicKey && (
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleSelectPaymentMethod('stripe')}
                                                style={{
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '24px',
                                                    border: `2px solid ${paymentMethod === 'stripe' ? '#6366f1' : '#e2e8f0'}`,
                                                    background: paymentMethod === 'stripe' ? '#eef2ff' : 'white',
                                                    borderRadius: '20px', cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{ padding: '12px', background: paymentMethod === 'stripe' ? 'white' : '#f1f5f9', borderRadius: '50%', boxShadow: paymentMethod === 'stripe' ? '0 4px 12px rgba(99, 102, 241, 0.2)' : 'none' }}>
                                                    <CreditCard size={32} color={paymentMethod === 'stripe' ? '#4f46e5' : '#94a3b8'} />
                                                </div>
                                                <span style={{ fontSize: '1.1rem', fontWeight: '600', color: paymentMethod === 'stripe' ? '#4f46e5' : 'var(--text-main)' }}>Stripe</span>
                                                <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: '#e0e7ff', color: '#4338ca', borderRadius: '10px' }}>Temassız</span>
                                            </motion.button>
                                        )}

                                        {/* Dynamic PayPal Option */}
                                        {currentUser?.paypalClientId && (
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleSelectPaymentMethod('paypal')}
                                                style={{
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '24px',
                                                    border: `2px solid ${paymentMethod === 'paypal' ? '#003087' : '#e2e8f0'}`,
                                                    background: paymentMethod === 'paypal' ? '#eff6ff' : 'white',
                                                    borderRadius: '20px', cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{ padding: '12px', background: paymentMethod === 'paypal' ? 'white' : '#f1f5f9', borderRadius: '50%', boxShadow: paymentMethod === 'paypal' ? '0 4px 12px rgba(0, 48, 135, 0.2)' : 'none' }}>
                                                    <Wallet size={32} color={paymentMethod === 'paypal' ? '#003087' : '#94a3b8'} />
                                                </div>
                                                <span style={{ fontSize: '1.1rem', fontWeight: '600', color: paymentMethod === 'paypal' ? '#003087' : 'var(--text-main)' }}>PayPal</span>
                                                <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: '#dbeafe', color: '#1e40af', borderRadius: '10px' }}>Temassız</span>
                                            </motion.button>
                                        )}
                                    </div>

                                    <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '20px', marginBottom: '32px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                        <span style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-1px' }}>
                                            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cartTotal)}
                                        </span>
                                        <span style={{ display: 'block', fontSize: '1rem', color: 'var(--text-muted)', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>{t('totalToPay') || 'Ödenecek Tutar'}</span>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="primary-btn"
                                        onClick={confirmPayment}
                                        style={{
                                            width: '100%',
                                            justifyContent: 'center',
                                            padding: '20px',
                                            fontSize: '1.2rem',
                                            fontWeight: '700',
                                            borderRadius: '16px',
                                            background: '#10b981',
                                            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
                                        }}
                                    >
                                        {t('confirmPayment') || 'Ödemeyi Tamamla'}
                                    </motion.button>
                                </>
                            ) : (
                                /* --- Processing / QR Step --- */
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', animation: 'fadeIn 0.3s ease-out' }}>

                                    {/* QR Code Container */}
                                    <div style={{
                                        padding: '24px',
                                        background: 'white',
                                        borderRadius: '24px',
                                        border: `4px solid ${paymentMethod === 'paypal' ? '#003087' : '#6366f1'}`,
                                        marginBottom: '24px',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                                    }}>
                                        <div style={{ position: 'relative' }}>
                                            {/* We use a robust QR generator API for the demo to ensure it works without npm install */}
                                            {!qrError && paymentQrUrl ? (
                                                <img
                                                    src={paymentQrUrl}
                                                    alt="Payment QR"
                                                    style={{ width: '220px', height: '220px', minWidth: '220px', minHeight: '220px', display: 'block', borderRadius: '12px', background: '#fff' }}
                                                    onError={() => {
                                                        console.error('QR Image failed to load:', paymentQrUrl);
                                                        setQrError(true);
                                                    }}
                                                />
                                            ) : (
                                                <div style={{ width: '220px', height: '220px', background: '#f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', padding: '20px' }}>
                                                    <QrCode size={48} color="#94a3b8" style={{ marginBottom: '12px' }} />
                                                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>QR Kod Yüklenemedi</span>
                                                    <a href={paymentData} target="_blank" rel="noreferrer" style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '600' }}>Ödeme Linkini Aç</a>
                                                </div>
                                            )}
                                            {/* Center Logo Overlay */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                                background: 'white', padding: '8px', borderRadius: '50%',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                            }}>
                                                {paymentMethod === 'paypal' ?
                                                    <Wallet size={32} color="#003087" /> :
                                                    <CreditCard size={32} color="#6366f1" />
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>
                                        {paymentMethod === 'paypal' ? 'PayPal ile Öde' : (paymentMethod === 'stripe' ? 'Stripe ile Öde' : 'Kart ile Öde')}
                                    </h3>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '300px' }}>
                                        {t('scanQrInstruction') || 'Müşterinin kamerasıyla bu QR kodu okutmasını sağlayın.'}
                                    </p>

                                    {/* Amount Display */}
                                    <div style={{
                                        fontSize: '2rem', fontWeight: '900', color: 'var(--text-main)',
                                        padding: '12px 24px', background: '#f8fafc', borderRadius: '16px', marginBottom: '32px'
                                    }}>
                                        {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cartTotal)}
                                    </div>

                                    {/* Status Indicator */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
                                        <div className="spinner" style={{ width: '20px', height: '20px', border: '3px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--primary)' }}>Ödeme Bekleniyor...</span>
                                    </div>
                                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                                        <button
                                            onClick={() => setPaymentStep('select')}
                                            style={{ flex: 1, padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '600', cursor: 'pointer' }}
                                        >
                                            İptal
                                        </button>
                                        <button
                                            onClick={confirmPayment}
                                            style={{ flex: 2, padding: '16px', borderRadius: '14px', border: 'none', background: '#10b981', color: 'white', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
                                        >
                                            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                                                <span>Müşteri Ödedi</span>
                                                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>(Simüle Et)</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default POS;
