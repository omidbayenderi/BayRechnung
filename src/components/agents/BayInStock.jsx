import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Receipt, ArrowRight, CheckCircle, Zap, TrendingUp } from 'lucide-react';
import { useStock } from '../../context/StockContext';
import { useInvoice } from '../../context/InvoiceContext';
import { useLanguage } from '../../context/LanguageContext';

const BayInStock = () => {
    const { sales, products } = useStock();
    const { saveInvoice } = useInvoice();
    const { t } = useLanguage();

    const [notifications, setNotifications] = useState([]);

    const processedSalesRef = React.useRef(new Set());
    const { invoices } = useInvoice();

    // 1. AUTO-ACCOUNTING (Post-Sale Sync)
    useEffect(() => {
        const processSales = async () => {
            // Find sales that haven't been reported yet and haven't been processed in this session Ref
            const pendingSales = sales.filter(s =>
                s.status === 'completed' &&
                !s.reported_to_accounting &&
                !processedSalesRef.current.has(s.id)
            );

            if (pendingSales.length === 0) return;

            for (const sale of pendingSales) {
                // Mark as processing in Ref immediately to prevent concurrent effect runs from picking it up
                processedSalesRef.current.add(sale.id);

                // Double check if an invoice already exists for this POS sale to prevent duplicates
                const invoiceNum = `POS-${sale.id.toString().substring(0, 8)}`;
                const alreadyExists = invoices.some(inv => inv.invoiceNumber === invoiceNum);

                if (alreadyExists) {
                    console.log(`[BayInStock] Invoice ${invoiceNum} already exists, skipping.`);
                    continue;
                }

                // Map sale items to Invoice items
                const invoiceItems = sale.items.map(item => {
                    const product = products.find(p => p.id === item.product_id);
                    return {
                        description: product ? product.name : `Ürün #${item.product_id}`,
                        quantity: item.quantity,
                        price: item.price,
                        tax: 19 // Default
                    };
                });

                // Create the invoice with a deterministic ID based on sale ID
                // to ensure Supabase upsert handles it if retried.
                try {
                    await saveInvoice({
                        id: `inv-pos-${sale.id}`, // Deterministic ID
                        invoiceNumber: invoiceNum,
                        recipientName: sale.customer_name || 'Hızlı Satış Müşterisi',
                        items: invoiceItems,
                        subtotal: sale.total / 1.19, // Basic reverse calc
                        tax: sale.total - (sale.total / 1.19),
                        total: sale.total,
                        status: 'paid',
                        date: new Date().toISOString().split('T')[0],
                        dueDate: new Date().toISOString().split('T')[0],
                        notes: `POS Satışı (BayInStock tarafından otomatik oluşturuldu)`
                    });

                    addNotification(`🧾 Satış Muhasebeleştirildi: ${sale.customer_name || 'POS Satışı'} için fatura oluşturuldu.`);
                } catch (err) {
                    console.error('[BayInStock] Error generating invoice for sale:', sale.id, err);
                    // Remove from processed set so it can be retried on next render if it failed
                    processedSalesRef.current.delete(sale.id);
                }
            }
        };

        if (sales.length > 0 && products.length > 0) {
            processSales();
        }
    }, [sales, products, invoices]);

    const addNotification = (msg) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, msg }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    };

    if (notifications.length === 0) return null;

    return (
        <div style={{ position: 'fixed', bottom: '160px', left: '24px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <AnimatePresence>
                {notifications.map(n => (
                    <motion.div
                        key={n.id}
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        style={{
                            background: 'rgba(5, 150, 105, 0.95)', // Green for success/finance
                            color: 'white',
                            padding: '12px 20px',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            boxShadow: '0 10px 25px rgba(5,150,105,0.3)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <Receipt size={16} />
                        {n.msg}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default BayInStock;
