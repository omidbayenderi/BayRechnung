import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
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

    // Fetch initial data from Supabase
    useEffect(() => {
        const loadStockData = async () => {
            if (!currentUser?.id) {
                setLoading(false);
                return;
            }

            try {
                const [
                    { data: prodData },
                    { data: saleData },
                    { data: settingsData }
                ] = await Promise.all([
                    supabase.from('products').select('*').eq('user_id', currentUser.id),
                    supabase.from('sales').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
                    supabase.from('stock_settings').select('*').eq('user_id', currentUser.id).maybeSingle()
                ]);

                if (prodData) {
                    setProducts(prodData.map(p => ({
                        id: p.id,
                        name: p.name,
                        category: p.category,
                        price: parseFloat(p.price),
                        stock: p.stock,
                        minStock: p.min_stock,
                        sku: p.sku,
                        image: p.image_url
                    })));
                }

                if (saleData) setSales(saleData);

                if (settingsData) {
                    setSettings({
                        taxRate: settingsData.tax_rate,
                        currency: settingsData.currency,
                        storeName: settingsData.store_name,
                        storeAddress: settingsData.store_address,
                        storePhone: settingsData.store_phone,
                        defaultLowStock: settingsData.default_low_stock
                    });
                    if (settingsData.categories) setCategories(settingsData.categories);
                }
            } catch (err) {
                console.error('Error fetching stock data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadStockData();
    }, [currentUser?.id]);

    // LocalStorage Sync for Public Preview
    useEffect(() => {
        if (currentUser?.id && products.length > 0) {
            localStorage.setItem('bay_products', JSON.stringify(products));
        }
    }, [products, currentUser]);

    // --- Actions ---

    const updateSettings = async (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
        if (currentUser?.id) {
            const dbData = {
                user_id: currentUser.id,
                tax_rate: newSettings.taxRate || settings.taxRate,
                currency: newSettings.currency || settings.currency,
                store_name: newSettings.storeName || settings.storeName,
                store_address: newSettings.storeAddress || settings.storeAddress,
                store_phone: newSettings.storePhone || settings.storePhone,
                default_low_stock: newSettings.defaultLowStock || settings.defaultLowStock
            };
            await supabase.from('stock_settings').upsert(dbData);
        }
    };

    // --- Actions ---

    // Product Management
    const addProduct = async (product) => {
        if (!currentUser?.id) return null;

        const newProduct = {
            user_id: currentUser.id,
            name: product.name,
            category: product.category,
            price: product.price,
            stock: product.stock,
            min_stock: product.minStock || 5,
            sku: product.sku,
            image_url: product.image,
            supplier_info: product.supplier_info || {}
        };

        const { data, error } = await supabase.from('products').insert(newProduct).select().single();

        if (error) {
            console.error('Error adding product to Supabase:', error);
            // If they are not a real Supabase user, alert them that this won't persist
            if (!currentUser?.isSupabase) {
                console.warn('[Stock] Mock session detected - data will only persist in local RAM/Storage');
            }

            // Fallback to local state update even on error to keep UI interactive
            const tempMapped = { ...newProduct, id: `temp-${Date.now()}`, price: parseFloat(newProduct.price), minStock: newProduct.min_stock, image: newProduct.image_url };
            setProducts(prev => [...prev, tempMapped]);
            return tempMapped;
        }

        const mapped = {
            id: data.id,
            name: data.name,
            category: data.category,
            price: parseFloat(data.price),
            stock: data.stock,
            minStock: data.min_stock,
            sku: data.sku,
            image: data.image_url,
            supplier_info: data.supplier_info
        };

        console.log('[Stock] Product successfully added to Supabase:', data.id);
        setProducts(prev => [...prev, mapped]);
        return mapped;
    };

    const updateProduct = async (id, updates) => {
        const dbUpdates = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.category) dbUpdates.category = updates.category;
        if (updates.price) dbUpdates.price = updates.price;
        if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
        if (updates.minStock !== undefined) dbUpdates.min_stock = updates.minStock;
        if (updates.sku) dbUpdates.sku = updates.sku;
        if (updates.image) dbUpdates.image_url = updates.image;
        if (updates.supplier_info) dbUpdates.supplier_info = updates.supplier_info;

        const { error } = await supabase.from('products').update(dbUpdates).eq('id', id);
        if (error) console.error('Error updating product:', error);

        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const deleteProduct = async (id) => {
        await supabase.from('products').delete().eq('id', id);
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const addCategory = async (category) => {
        if (!categories.includes(category)) {
            const updated = [...categories, category];
            setCategories(updated);
            if (currentUser?.id) {
                await supabase.from('stock_settings').upsert({ user_id: currentUser.id, categories: updated });
            }
        }
    };

    const updateCategory = async (oldCat, newCat) => {
        const updated = categories.map(c => c === oldCat ? newCat : c);
        setCategories(updated);
        setProducts(prev => prev.map(p => p.category === oldCat ? { ...p, category: newCat } : p));
        if (currentUser?.id) {
            await supabase.from('stock_settings').upsert({ user_id: currentUser.id, categories: updated });
        }
    };

    const deleteCategory = async (category) => {
        const updated = categories.filter(c => c !== category);
        setCategories(updated);
        if (currentUser?.id) {
            await supabase.from('stock_settings').upsert({ user_id: currentUser.id, categories: updated });
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

    const updateCartQuantity = (productId, quantity) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }
        setCart(prev => prev.map(item =>
            item.product.id === productId ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => {
        setCart([]);
    };

    const updateStock = async (id, quantityChange, type = 'adjustment', reason = '') => {
        const product = products.find(p => p.id === id);
        if (!product || !currentUser?.id) return;

        const newStock = product.stock + quantityChange;

        // 1. Update Product table
        const { error: prodError } = await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', id);

        if (prodError) {
            console.error('Error updating stock level:', prodError);
            return;
        }

        // 2. Record movement
        const { error: moveError } = await supabase
            .from('stock_movements')
            .insert({
                product_id: id,
                user_id: currentUser.id,
                quantity_change: quantityChange,
                type,
                reason
            });

        if (moveError) console.error('Error recording stock movement:', moveError);

        setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
    };

    //POS / Cart Management
    const completeSale = async (paymentMethod = 'cash', customerName = 'Walk-in Customer') => {
        if (cart.length === 0 || !currentUser?.id) return null;

        const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        const saleItems = cart.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
            price: item.product.price
        }));

        const newSaleRequest = {
            user_id: currentUser.id,
            customer_name: customerName,
            total: totalAmount,
            payment_method: paymentMethod,
            items: saleItems,
            status: 'completed'
        };

        // 1. Record Sale
        const { data: saleData, error: saleError } = await supabase
            .from('sales')
            .insert(newSaleRequest)
            .select()
            .single();

        if (saleError) {
            console.error('Error recording sale in Supabase:', saleError);
            if (!currentUser?.isSupabase) {
                console.warn('[Stock] Mock session: Sale recorded in UI only');
                const mockSale = { ...newSaleRequest, id: `sale-${Date.now()}`, created_at: new Date().toISOString() };
                setSales(prev => [mockSale, ...prev]);
                clearCart();
                return mockSale;
            }
            return null;
        }

        console.log('[Stock] Sale successfully recorded in Supabase:', saleData.id);

        // 2. Deduct Stock and Record Movement for each item
        for (const item of cart) {
            await updateStock(item.product.id, -item.quantity, 'sale', `Sale #${saleData.id}`);
        }

        // 3. Update local sales state
        setSales(prev => [saleData, ...prev]);

        // 4. Clear Cart
        clearCart();

        return saleData;
    };

    const getLowStockProducts = () => {
        return products.filter(p => p.stock <= p.minStock);
    };

    // Update Sale Status & Tracking
    const updateSaleStatus = (saleId, status, trackingData = {}) => {
        setSales(prevSales => prevSales.map(sale => {
            if (sale.id === saleId) {
                return {
                    ...sale,
                    status: status, // 'pending', 'shipped', 'delivered', 'returned'
                    ...trackingData, // { trackingCompany, trackingCode, trackingUrl }
                    lastUpdated: new Date().toISOString()
                };
            }
            return sale;
        }));
    };

    const clearSales = () => {
        setSales([]);
        try {
            localStorage.removeItem('bay_sales');
        } catch (e) {
            console.error('Failed to clear sales:', e);
        }
    };

    const factoryReset = () => {
        if (window.confirm('All data will be lost. Continue?')) {
            try {
                localStorage.removeItem('bay_products');
                localStorage.removeItem('bay_product_categories');
                localStorage.removeItem('bay_sales');
                localStorage.removeItem('bay_stock_settings');
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
