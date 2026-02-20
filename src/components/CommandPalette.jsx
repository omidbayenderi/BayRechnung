import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Package, Users, Command, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const CommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const { currentUser } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    // Toggle on CTRL+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const performSearch = useCallback(async (searchQuery) => {
        if (!searchQuery || searchQuery.length < 2 || !currentUser?.id) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const [invoiceRes, quoteRes, productRes, staffRes] = await Promise.all([
                supabase.from('invoices').select('id, invoice_number, customer_name').eq('user_id', currentUser.id).ilike('customer_name', `%${searchQuery}%`).limit(3),
                supabase.from('quotes').select('id, quote_number, customer_name').eq('user_id', currentUser.id).ilike('customer_name', `%${searchQuery}%`).limit(3),
                supabase.from('products').select('id, name, sku').eq('user_id', currentUser.id).ilike('name', `%${searchQuery}%`).limit(3),
                supabase.from('staff').select('id, name').eq('user_id', currentUser.id).ilike('name', `%${searchQuery}%`).limit(3)
            ]);

            const merged = [
                ...(invoiceRes.data || []).map(i => ({ ...i, type: 'invoice', label: `${i.invoice_number} - ${i.customer_name}` })),
                ...(quoteRes.data || []).map(q => ({ ...q, type: 'quote', label: `${q.quote_number} - ${q.customer_name}` })),
                ...(productRes.data || []).map(p => ({ ...p, type: 'product', label: `${p.name} (${p.sku})` })),
                ...(staffRes.data || []).map(s => ({ ...s, type: 'staff', label: s.name }))
            ];

            setResults(merged);
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setLoading(false);
        }
    }, [currentUser?.id]);

    useEffect(() => {
        const timer = setTimeout(() => {
            performSearch(query);
        }, 300);
        return () => clearTimeout(timer);
    }, [query, performSearch]);

    const handleSelect = (item) => {
        setIsOpen(false);
        setQuery('');
        switch (item.type) {
            case 'invoice': navigate(`/invoice/${item.id}`); break;
            case 'quote': navigate(`/quote/${item.id}`); break;
            case 'product': navigate(`/stock/products`); break;
            case 'staff': navigate(`/settings`); break;
            default: break;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4 backdrop-blur-sm bg-black/40">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                    >
                        {/* Search Input */}
                        <div className="relative p-4 flex items-center border-b border-slate-100 dark:border-slate-800">
                            <Search className="w-5 h-5 text-slate-400 mr-3" />
                            <input
                                autoFocus
                                className="flex-1 bg-transparent border-none outline-none text-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                                placeholder={t('search_placeholder') || "Search invoices, customers, products..."}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-medium text-slate-400 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded uppercase">ESC</span>
                                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="max-h-[60vh] overflow-y-auto p-2">
                            {loading && <div className="p-8 text-center text-slate-400">{t('loading')}...</div>}

                            {!loading && results.length > 0 && (
                                <div className="grid gap-1">
                                    {results.map((item, idx) => (
                                        <button
                                            key={`${item.type}-${item.id}`}
                                            onClick={() => handleSelect(item)}
                                            className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center group transition-all"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mr-3 group-hover:bg-primary/10 transition-colors">
                                                {item.type === 'invoice' && <FileText className="w-5 h-5 text-blue-500" />}
                                                {item.type === 'quote' && <FileText className="w-5 h-5 text-purple-500" />}
                                                {item.type === 'product' && <Package className="w-5 h-5 text-emerald-500" />}
                                                {item.type === 'staff' && <Users className="w-5 h-5 text-amber-500" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{item.label}</div>
                                                <div className="text-[10px] text-slate-400 uppercase tracking-wider">{item.type}</div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {!loading && query && results.length === 0 && (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400">{t('no_results_found') || "No results found for this search."}</p>
                                </div>
                            )}

                            {!query && !loading && (
                                <div className="p-4">
                                    <div className="text-xs font-semibold text-slate-400 mb-3 ml-2 uppercase tracking-widest">{t('shortcuts') || "Shortcuts"}</div>
                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
                                            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                                <Command className="w-4 h-4 mr-2" />
                                                <span>{t('create_new_invoice') || "Create New Invoice"}</span>
                                            </div>
                                            <span className="text-[10px] font-medium text-slate-400 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded uppercase">I</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;
