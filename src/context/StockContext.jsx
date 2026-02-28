import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { syncService } from '../lib/SyncService';
import { useAuth } from './AuthContext';

const StockContext = createContext();

export const useStock = () => useContext(StockContext);

export const StockProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState(['Fluids', 'Parts', 'Filters', 'Accessories', 'Services']);
    const [sales, setSales] = useState([]);
    const [settings, setSettings] = useState({
        taxRate: 19,
        currency: '€',
        storeName: '',
        storeAddress: '',
        storePhone: '',
        defaultLowStock: 5
    });
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);

    const uuidv4 = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    // Helper: Merge remote data with local offline changes
    const mergeWithLocalQueue = (remoteData, tableName, normalizer = (x) => x) => {
        const syncQueue = (syncService.queue || JSON.parse(localStorage.getItem('bay_sync_queue') || '[]'))
            .filter(q => q.table === tableName);

        const safeRemote = remoteData || [];
        let merged = [...safeRemote];

        // 1. Apply Deletes
        const deleteIds = syncQueue.filter(q => q.action === 'delete').map(q => String(q.targetId));
        merged = merged.filter(item => !deleteIds.includes(String(item.id)));

        // 2. Apply Updates
        const updates = syncQueue.filter(q => q.action === 'update');
        updates.forEach(u => {
            const index = merged.findIndex(item => String(item.id) === String(u.targetId));
            if (index > -1) {
                merged[index] = { ...merged[index], ...u.data };
            }
        });

        // 3. Apply Inserts
        const inserts = syncQueue.filter(q => q.action === 'insert').map(q => q.data);
        inserts.forEach(ins => {
            const existsById = merged.find(m => String(m.id) === String(ins.id));
            if (!existsById) {
                merged.unshift(ins);
            }
        });

        // 4. PROPAGATION LAG PROTECTION:
        // If local storage has items that are neither in DB nor in sync queue, 
        // they might be recently synced items that haven't propagated to the read-replica yet.
        const localItemsStr = localStorage.getItem(`bay_${tableName}_${currentUser?.id}`);
        if (localItemsStr) {
            try {
                const localItems = JSON.parse(localItemsStr);
                localItems.forEach(localItem => {
                    const exists = merged.find(m => String(m.id) === String(localItem.id));
                    const isDeleted = syncQueue.find(q => q.action === 'delete' && String(q.targetId) === String(localItem.id));
                    if (!exists && !isDeleted) {
                        console.log(`[Stock] Propagation lag protection: Restoring ${tableName} item ${localItem.id}`);
                        merged.push(localItem);
                    }
                });
            } catch (e) {
                console.warn("Failed to parse local storage in merge", e);
            }
        }

        return merged.map(normalizer);
    };

    // Helper: Merge single object with local offline changes (for settings)
    const mergeSettingsWithLocalQueue = (remoteData, tableName, currentSettings) => {
        let merged = remoteData ? { ...remoteData } : null;

        const queue = (syncService.queue || JSON.parse(localStorage.getItem('bay_sync_queue') || '[]'))
            .filter(q => q.table === tableName && q.action === 'update');

        if (queue.length > 0) {
            const latestUpdate = queue[queue.length - 1];
            merged = { ...(merged || {}), ...latestUpdate.data };
        }

        return merged;
    };

    // Fetch initial data from Supabase
    useEffect(() => {
        const loadStockData = async () => {
            if (!currentUser?.id) {
                setLoading(false);
                return;
            }

            const userId = currentUser.id;

            try {
                // Load from LocalStorage first for instant UI
                const localProds = localStorage.getItem(`bay_products_${userId}`);
                const localSales = localStorage.getItem(`bay_sales_${userId}`);
                if (localProds) setProducts(JSON.parse(localProds));
                if (localSales) setSales(JSON.parse(localSales));

                // CRITICAL: Stop loading when local data is ready
                setLoading(false);

                // 1. If it's a mock user (demo), STOP HERE. 
                // DB sync will fail anyway due to foreign key constraints.
                if (currentUser.authMode === 'mock' || userId.startsWith('0000')) {
                    console.log('[Stock] Mock session detected, skipping Supabase sync');
                    setLoading(false);
                    return;
                }

                // 1.5. WAIT for full profile to avoid RLS race conditions
                if (currentUser.isSkeleton) {
                    console.log('[Stock] Skeleton user detected, waiting for full profile...');
                    return;
                }

                // 2. Individual fetching to prevent one missing table from breaking everything
                const fetchProducts = async () => {
                    const { data, error } = await supabase.from('products').select('*').eq('user_id', userId);
                    if (data || (localProds && !error)) {
                        const normalizeProd = (p) => ({
                            id: p.id,
                            name: p.name,
                            category: p.category,
                            price: parseFloat(p.price) || 0,
                            stock: p.stock || 0,
                            minStock: p.min_stock || 0,
                            sku: p.sku || '',
                            image: p.image_url,
                            supplier_info: p.supplier_info
                        });
                        setProducts(mergeWithLocalQueue(data, 'products', normalizeProd));
                    }
                };

                const fetchSales = async () => {
                    const { data, error } = await supabase.from('sales').select('*').eq('user_id', userId).order('created_at', { ascending: false });
                    if (data || (localSales && !error)) {
                        const normalizeSale = (s) => ({
                            ...s,
                            id: s.id,
                            customerName: s.customer_name || s.customerName,
                            total: s.total,
                            paymentMethod: s.payment_method || s.paymentMethod,
                            items: s.items || [],
                            status: s.status,
                            createdAt: s.created_at || s.createdAt
                        });
                        setSales(mergeWithLocalQueue(data, 'sales', normalizeSale));
                    }
                };

                const fetchSettings = async () => {
                    const { data, error } = await supabase.from('stock_settings').select('*').eq('user_id', userId).maybeSingle();
                    const mergedSettingsData = mergeSettingsWithLocalQueue(data, 'stock_settings', settings);
                    if (mergedSettingsData) {
                        setSettings({
                            taxRate: mergedSettingsData.tax_rate ?? 19,
                            currency: mergedSettingsData.currency || '€',
                            storeName: mergedSettingsData.store_name || '',
                            storeAddress: mergedSettingsData.store_address || '',
                            storePhone: mergedSettingsData.store_phone || '',
                            defaultLowStock: mergedSettingsData.default_low_stock ?? 5
                        });
                        if (mergedSettingsData.categories) setCategories(mergedSettingsData.categories);
                    }
                };

                await Promise.allSettled([fetchProducts(), fetchSales(), fetchSettings()]);

            } catch (err) {
                console.error('Error fetching stock data:', err);
            } finally {
                // setLoading(false); // Already false
            }
        };

        loadStockData();
    }, [currentUser?.id, currentUser?.isSkeleton]);

    // LocalStorage Sync for Public/Local Persistence
    useEffect(() => {
        if (currentUser?.id && !loading) {
            localStorage.setItem(`bay_products_${currentUser.id}`, JSON.stringify(products));
            localStorage.setItem(`bay_sales_${currentUser.id}`, JSON.stringify(sales));
        }
    }, [products, sales, currentUser?.id, loading]);


    // --- Actions ---

    const updateSettings = async (newSettings) => {
        const mergedSettings = { ...settings, ...newSettings };
        setSettings(mergedSettings);
        if (currentUser?.id) {
            const dbData = {
                user_id: currentUser.id,
                tax_rate: mergedSettings.taxRate,
                currency: mergedSettings.currency,
                store_name: mergedSettings.storeName,
                store_address: mergedSettings.storeAddress,
                store_phone: mergedSettings.storePhone,
                default_low_stock: mergedSettings.defaultLowStock
            };
            syncService.enqueue('stock_settings', 'update', dbData);
        }
    };

    // Product Management
    const addProduct = async (product) => {
        if (!currentUser?.id) return null;

        const id = product.id || uuidv4();
        const dbProduct = {
            id,
            user_id: currentUser.id,
            name: product.name,
            category: product.category,
            price: parseFloat(product.price) || 0,
            stock: parseInt(product.stock) || 0,
            min_stock: product.minStock || 5,
            sku: product.sku || '',
            image_url: product.image,
            supplier_info: product.supplier_info || {}
        };

        const mapped = {
            id,
            name: product.name,
            category: product.category,
            price: parseFloat(product.price),
            stock: parseInt(product.stock),
            minStock: product.minStock || 5,
            sku: product.sku,
            image: product.image,
            supplier_info: product.supplier_info || {}
        };

        setProducts(prev => [...prev, mapped]);
        syncService.enqueue('products', 'insert', dbProduct);
        return mapped;
    };

    const updateProduct = async (id, updates) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

        const dbUpdates = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.category) dbUpdates.category = updates.category;
        if (updates.price) dbUpdates.price = updates.price;
        if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
        if (updates.min_stock !== undefined) dbUpdates.min_stock = updates.minStock;
        if (updates.sku) dbUpdates.sku = updates.sku;
        if (updates.image_url !== undefined) dbUpdates.image_url = updates.image;
        if (updates.supplier_info) dbUpdates.supplier_info = updates.supplier_info;

        syncService.enqueue('products', 'update', dbUpdates, id);
    };

    const deleteProduct = async (id) => {
        setProducts(prev => prev.filter(p => p.id !== id));
        syncService.enqueue('products', 'delete', null, id);
    };

    const addCategory = async (category) => {
        if (!categories.includes(category)) {
            const updated = [...categories, category];
            setCategories(updated);
            if (currentUser?.id) {
                syncService.enqueue('stock_settings', 'update', { user_id: currentUser.id, categories: updated });
            }
        }
    };

    const updateCategory = async (oldCat, newCat) => {
        const updated = categories.map(c => c === oldCat ? newCat : c);
        setCategories(updated);
        setProducts(prev => prev.map(p => p.category === oldCat ? { ...p, category: newCat } : p));
        if (currentUser?.id) {
            syncService.enqueue('stock_settings', 'update', { user_id: currentUser.id, categories: updated });
        }
    };

    const deleteCategory = async (category) => {
        const updated = categories.filter(c => c !== category);
        setCategories(updated);
        if (currentUser?.id) {
            syncService.enqueue('stock_settings', 'update', { user_id: currentUser.id, categories: updated });
        }
    };

    const addToCart = (product, quantity = 1) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { product, quantity }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const updateCartQuantity = (productId, delta) => {
        setCart(prev => {
            const index = prev.findIndex(item => item.product.id === productId);
            if (index === -1) return prev;

            const newQuantity = prev[index].quantity + delta;

            if (newQuantity < 1) {
                return prev.filter(item => item.product.id !== productId);
            }

            const newCart = [...prev];
            newCart[index] = { ...newCart[index], quantity: newQuantity };
            return newCart;
        });
    };

    const clearCart = () => {
        setCart([]);
    };

    const updateStock = async (id, quantityChange, type = 'adjustment', reason = '') => {
        const product = products.find(p => p.id === id);
        if (!product || !currentUser?.id) return;

        const newStock = product.stock + quantityChange;

        // Update local state immediately
        setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));

        // Enqueue database updates
        syncService.enqueue('products', 'update', { stock: newStock }, id);
        syncService.enqueue('stock_movements', 'insert', {
            product_id: id,
            user_id: currentUser.id,
            quantity_change: quantityChange,
            type,
            reason: reason || `Manual adjustment by ${currentUser.name}`
        });
    };

    //POS / Cart Management
    const completeSale = async (paymentMethod = 'cash', customerName = 'Walk-in Customer') => {
        if (cart.length === 0 || !currentUser?.id) return null;

        const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        const saleItems = cart.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
            product_name: item.product.name
        }));

        const saleId = `sale-${Date.now()}`;

        // Frontend item (camelCase)
        const saleItem = {
            id: saleId,
            user_id: currentUser.id,
            customerName: customerName,
            total: totalAmount,
            paymentMethod: paymentMethod,
            items: saleItems,
            status: 'completed',
            createdAt: new Date().toISOString()
        };

        // Database record (snake_case)
        const dbSale = {
            id: saleId,
            user_id: currentUser.id,
            customer_name: customerName,
            total: totalAmount,
            payment_method: paymentMethod,
            items: saleItems,
            status: 'completed',
            created_at: saleItem.createdAt
        };

        // Deduct Stock
        for (const item of cart) {
            await updateStock(item.product.id, -item.quantity, 'sale', `Sale #${saleId}`);
        }

        // Add to local state
        setSales(prev => [saleItem, ...prev]);

        // Enqueue Sale record
        syncService.enqueue('sales', 'insert', dbSale);

        clearCart();
        return saleItem;
    };

    const getLowStockProducts = () => {
        return products.filter(p => p.stock <= p.minStock);
    };

    // Update Sale Status & Tracking
    const updateSaleStatus = (saleId, status, trackingData = {}) => {
        setSales(prevSales => prevSales.map(sale => {
            if (sale.id === saleId) {
                const updated = {
                    ...sale,
                    status: status,
                    ...trackingData,
                    lastUpdated: new Date().toISOString()
                };
                syncService.enqueue('sales', 'update', { status, ...trackingData }, saleId);
                return updated;
            }
            return sale;
        }));
    };

    const clearSales = () => {
        setSales([]);
        if (currentUser?.id) {
            localStorage.removeItem(`bay_sales_${currentUser.id}`);
        }
    };

    const factoryReset = () => {
        if (window.confirm('All data will be lost. Continue?')) {
            try {
                const userId = currentUser?.id;
                if (userId) {
                    localStorage.removeItem(`bay_products_${userId}`);
                    localStorage.removeItem(`bay_sales_${userId}`);
                }
                localStorage.removeItem('bay_current_user');
                window.location.reload();
            } catch (e) {
                console.error('Reset failed:', e);
            }
        }
    };

    const stockValue = useMemo(() => ({
        products,
        categories,
        sales,
        cart,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        completeSale,
        updateSaleStatus, // Export new function
        clearSales,
        factoryReset,
        settings,
        updateSettings,
        getLowStockProducts,
        loading
    }), [products, categories, sales, cart, settings, loading]);

    return (
        <StockContext.Provider value={stockValue}>
            {children}
        </StockContext.Provider>
    );
};
