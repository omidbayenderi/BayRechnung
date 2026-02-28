import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { syncService } from '../lib/SyncService';
import { supabase } from '../lib/supabase';
import { storageService } from '../lib/StorageService';
import { useAuth } from './AuthContext';

const InvoiceContext = createContext();

// Helper: Normalize company profile from snake_case database format
const normalizeProfile = (data, existing = INITIAL_COMPANY_PROFILE) => {
    if (!data) return existing;

    // Separate street and houseNum from address string if present
    let streetStr = data.address || existing.street || '';
    let houseNumStr = data.houseNum || existing.houseNum || '';

    if (data.address && !data.street) {
        // Primitive parsing: look for number at the end
        const match = data.address.match(/^(.*?)\s+(\d+[a-zA-Z]?)$/);
        if (match) {
            streetStr = match[1];
            houseNumStr = match[2];
        }
    }

    return {
        ...existing,
        ...data,
        id: data.id || existing.id,
        companyName: data.company_name || data.companyName || existing.companyName,
        email: data.email || existing.email,
        phone: data.phone || existing.phone,
        owner: data.owner || existing.owner,
        street: streetStr,
        houseNum: houseNumStr,
        zip: data.postal_code || data.zip || existing.zip,
        city: data.city || existing.city,
        taxId: data.tax_id || data.taxId || existing.taxId,
        vatId: data.vat_id || data.vatId || existing.vatId,
        bankName: data.bank_name || data.bankName || existing.bankName,
        iban: data.iban || existing.iban,
        bic: data.bic || existing.bic,
        paymentTerms: data.payment_terms || data.paymentTerms || existing.paymentTerms,
        logo: data.logo_url || data.logo || existing.logo,
        industry: data.industry || existing.industry,
        defaultCurrency: data.default_currency || data.defaultCurrency || existing.defaultCurrency,
        defaultTaxRate: data.default_tax_rate !== undefined ? data.default_tax_rate : (data.defaultTaxRate !== undefined ? data.defaultTaxRate : existing.defaultTaxRate),
        taxExempt: data.tax_exempt !== undefined ? data.tax_exempt : (data.taxExempt !== undefined ? data.taxExempt : existing.taxExempt),
        paypalMe: data.paypal_me || data.paypalMe || existing.paypalMe,
        stripeLink: data.stripe_link || data.stripeLink || existing.stripeLink,
        logoDisplayMode: data.logo_display_mode || data.logoDisplayMode || existing.logoDisplayMode,
        stripeApiKey: data.stripe_api_key || data.stripeApiKey || existing.stripeApiKey,
        stripeWebhookSecret: data.stripe_webhook_secret || data.stripeWebhookSecret || existing.stripeWebhookSecret,
        paypalClientId: data.paypal_client_id || data.paypalClientId || existing.paypalClientId,
        paypalSecret: data.paypal_secret || data.paypalSecret || existing.paypalSecret,
        plan: data.plan || existing.plan
    };
};

const INITIAL_COMPANY_PROFILE = {
    logo: null,
    companyName: '',
    owner: '',
    street: '',
    houseNum: '',
    zip: '',
    city: '',
    phone: '',
    email: '',
    taxId: '',
    vatId: '',
    bankName: '',
    iban: '',
    bic: '',
    paymentTerms: '',
    defaultCurrency: 'EUR',
    defaultTaxRate: 19,
    taxExempt: false,
    paypalMe: '',
    stripeLink: '',

    // Premium Configuration
    plan: 'standard', // 'standard' or 'premium'
    industry: 'general', // Standardized lowercase
    logoDisplayMode: 'both', // 'logoOnly', 'nameOnly', 'both'
    stripeApiKey: '',
    stripeWebhookSecret: '',
    paypalClientId: '',
    paypalSecret: ''
};

export const InvoiceProvider = ({ children }) => {
    const { currentUser, updateUser } = useAuth();
    const [companyProfile, setCompanyProfile] = useState(INITIAL_COMPANY_PROFILE);
    const [invoices, setInvoices] = useState([]);
    const [quotes, setQuotes] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [recurringTemplates, setRecurringTemplates] = useState([]);
    const [expenseCategories, setExpenseCategories] = useState(['spareParts', 'rent', 'marketing', 'software', 'insurance', 'others']);
    const [invoiceCustomization, setInvoiceCustomization] = useState({
        primaryColor: '#8B5CF6',
        accentColor: '#6366F1',
        brandPalette: [],
        signatureUrl: null,
        footerText: '',
        quoteValidityDays: 30
    });
    const [paymentReminders, setPaymentReminders] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [messages, setMessages] = useState([]);
    const [dailyReports, setDailyReports] = useState([]);
    const [loading, setLoading] = useState(true);

    // Helper: Normalize snake_case (DB) to camelCase (Frontend)
    const normalizeInvoice = (inv) => {
        if (!inv) return null;

        // Handle address parsing (fragile but necessary if stored as one field)
        let street = inv.recipientStreet;
        let hnum = inv.recipientHouseNum;
        if (!street && inv.customer_address) {
            const parts = inv.customer_address.split(' ');
            hnum = parts.pop();
            street = parts.join(' ');
        }

        return {
            ...inv,
            id: inv.id,
            invoiceNumber: inv.invoice_number || inv.invoiceNumber,
            recipientName: inv.customer_name || inv.recipientName,
            recipientEmail: inv.customer_email || inv.recipientEmail,
            recipientStreet: street,
            recipientHouseNum: hnum,
            recipientCity: inv.customer_city || inv.recipientCity,
            recipientZip: inv.customer_postal_code || inv.recipientZip,
            subtotal: inv.subtotal,
            taxRate: inv.tax_rate || inv.taxRate,
            tax: inv.tax_amount || inv.tax,
            total: inv.total,
            currency: inv.currency || 'EUR',
            status: inv.status,
            date: inv.issue_date || inv.date,
            dueDate: inv.due_date || inv.dueDate,
            createdAt: inv.created_at || inv.createdAt,
            items: inv.items || [],
            footerNote: inv.notes || inv.footerNote,
            industryData: inv.industry_data || inv.industryData || {},
            vehicleInfo: inv.vehicle_info || inv.industry_data?.vehicle || null,
            senderSnapshot: inv.senderSnapshot || {}
        };
    };

    // Helper: Map camelCase (Frontend) back to snake_case (DB)
    const denormalizeInvoice = (inv) => {
        if (!inv) return null;
        const out = {
            id: inv.id,
            invoice_number: inv.invoiceNumber,
            customer_name: inv.recipientName,
            customer_email: inv.recipientEmail || null,
            customer_address: `${inv.recipientStreet || ''} ${inv.recipientHouseNum || ''}`.trim(),
            customer_city: inv.recipientCity,
            customer_postal_code: inv.recipientZip,
            items: inv.items,
            subtotal: inv.subtotal,
            tax_rate: inv.taxRate,
            tax_amount: inv.tax,
            total: inv.total,
            status: inv.status,
            due_date: inv.dueDate || null,
            issue_date: inv.date,
            notes: inv.footerNote,
            user_id: inv.user_id
        };

        // Only add industry_data and sender_snapshot if they have data
        // to avoid issues with missing columns in old database schemas
        if (inv.industryData && Object.keys(inv.industryData).length > 0) {
            out.industry_data = inv.industryData;
        }
        if (inv.senderSnapshot && Object.keys(inv.senderSnapshot).length > 0) {
            out.sender_snapshot = inv.senderSnapshot;
        }

        return out;
    };

    // Helper: Normalize messages
    const normalizeMessage = (msg) => {
        if (!msg) return null;
        return {
            ...msg,
            status: msg.is_read ? 'read' : 'unread' // Compatibility for components using .status
        };
    };

    // Helper: Normalize expenses
    const normalizeExpense = (exp) => {
        if (!exp) return null;
        return {
            ...exp,
            id: exp.id,
            user_id: exp.user_id,
            date: exp.date || exp.created_at?.split('T')[0],
            title: exp.title,
            amount: parseFloat(exp.amount) || 0,
            category: exp.category,
            currency: exp.currency || 'EUR',
            receiptImage: exp.receipt_image || exp.receiptImage
        };
    };

    const normalizeRecurringTemplate = (t) => {
        if (!t) return null;
        return {
            ...t,
            id: t.id,
            templateName: t.template_name || t.templateName || '',
            customerName: t.customer_name || t.customerName || t.recipientName || '',
            customerEmail: t.customer_email || t.customerEmail || '',
            amount: parseFloat(t.amount) || 0,
            frequency: t.frequency || 'monthly',
            currency: t.currency || 'EUR',
            status: t.status || 'active',
            items: t.items || [],
            description: t.description || t.notes || ''
        };
    };
    // UUID Generator Polyfill
    const uuidv4 = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    // Initial Data Fetch from Supabase
    // Helper: Merge remote data with local offline changes
    const mergeWithLocalQueue = (remoteData, tableName, normalizer = (x) => x) => {
        const safeRemote = remoteData || [];
        let merged = [...safeRemote];

        // Use syncService.queue directly if initialized, otherwise check localStorage fallback
        const queue = (syncService.queue || JSON.parse(localStorage.getItem('bay_sync_queue') || '[]'))
            .filter(q => q.table === tableName);

        // 1. Apply Deletes
        const deleteIds = queue.filter(q => q.action === 'delete').map(q => String(q.targetId));
        merged = merged.filter(item => !deleteIds.includes(String(item.id)));

        // 2. Apply Updates
        const updates = queue.filter(q => q.action === 'update');
        updates.forEach(u => {
            const index = merged.findIndex(item => String(item.id) === String(u.targetId));
            if (index > -1) {
                merged[index] = { ...merged[index], ...u.data };
            }
        });

        // 3. Apply Inserts
        const inserts = queue.filter(q => q.action === 'insert').map(q => q.data);
        inserts.forEach(ins => {
            const existsById = merged.find(m => String(m.id) === String(ins.id));
            if (!existsById) {
                merged.unshift(ins);
            }
        });

        // 4. PROPAGATION LAG PROTECTION:
        // If local storage has items that are neither in DB nor in sync queue, 
        // they might be recently synced items that haven't propagated to the read-replica yet.
        // Also for UPDATES: If local state has a different status/value than DB, and queue is empty,
        // it might be lag.
        const localItemsStr = localStorage.getItem(`bay_${tableName}_${currentUser?.id}`);
        if (localItemsStr) {
            try {
                const localItems = JSON.parse(localItemsStr);
                localItems.forEach(localItem => {
                    const idx = merged.findIndex(m => String(m.id) === String(localItem.id));
                    const isDeleted = queue.find(q => q.action === 'delete' && String(q.targetId) === String(localItem.id));

                    if (idx === -1 && !isDeleted) {
                        // Missing item (likely lag on insert)
                        if (localItem.id && String(localItem.id).length > 5) {
                            merged.push(localItem);
                        }
                    } else if (idx !== -1 && !isDeleted) {
                        // Item exists in DB but might be lagging (lag on update)
                        // Heuristic: If queue is empty for this item, but local differs from remote,
                        // and it's an important field like 'status' for invoices.
                        const hasPendingUpdate = queue.find(q => q.action === 'update' && String(q.targetId) === String(localItem.id));
                        if (!hasPendingUpdate) {
                            // Merge local changes if they look like user-set data
                            // This is risky but helps with status reversion.
                            // We only do this for specific fields or if local is highly trusted.
                            if (tableName === 'invoices' && localItem.status !== merged[idx].status) {
                                merged[idx] = { ...merged[idx], status: localItem.status };
                            }
                        }
                    }
                });
            } catch (e) {
                console.warn("Failed to parse local storage in merge", e);
            }
        }

        return merged.map(normalizer);
    };

    // Initial Data Fetch: LocalStorage (Instant) -> Supabase (Async Merge)
    useEffect(() => {
        const loadData = async () => {
            if (!currentUser?.id) {
                setLoading(false);
                return;
            }

            // 1. Instant Load from LocalStorage
            try {
                const localInvoices = localStorage.getItem(`bay_invoices_${currentUser.id}`);
                const localQuotes = localStorage.getItem(`bay_quotes_${currentUser.id}`);
                const localExpenses = localStorage.getItem(`bay_expenses_${currentUser.id}`);
                const localRecurring = localStorage.getItem(`bay_recurring_templates_${currentUser.id}`);
                const localStaff = localStorage.getItem(`bay_staff_${currentUser.id}`);
                const localProfile = localStorage.getItem(`bay_profile_${currentUser.id}`);

                // Data in localStorage is already normalized to state format, so just parse and set
                if (localInvoices) setInvoices(JSON.parse(localInvoices));
                if (localQuotes) setQuotes(JSON.parse(localQuotes));
                if (localExpenses) setExpenses(JSON.parse(localExpenses));
                if (localRecurring) setRecurringTemplates(JSON.parse(localRecurring));
                if (localStaff) setEmployees(JSON.parse(localStaff));
                if (localProfile) setCompanyProfile(prev => ({ ...prev, ...JSON.parse(localProfile) }));

                // CRITICAL: Set loading to false as soon as local cache is ready.
                // This makes the app "instant" for the user.
                setLoading(false);
            } catch (e) {
                console.error("Error loading from localStorage:", e);
                setLoading(false); // Still stop loading even if local fail
            }

            // 2. Background Fetch from Supabase and Merge
            try {
                // 2.1. If it's a mock user (demo), STOP HERE. 
                // DB sync will fail anyway due to foreign key constraints.
                if (currentUser.authMode === 'mock' || currentUser.id.startsWith('0000')) {
                    console.log('[Invoice] Mock session detected, skipping Supabase sync');
                    setLoading(false);
                    return;
                }

                // 2.0. WAIT for full profile to avoid RLS race conditions
                if (currentUser.isSkeleton) {
                    console.log('[Invoice] Skeleton user detected, waiting for full profile...');
                    return;
                }

                const [invRes, quoteRes, expRes, settingsRes, msgRes, staffRes, recurringRes, customRes, reportRes] = await Promise.all([
                    supabase.from('invoices').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
                    supabase.from('quotes').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
                    supabase.from('expenses').select('*').eq('user_id', currentUser.id).order('date', { ascending: false }),
                    supabase.from('company_settings').select('*').eq('user_id', currentUser.id).maybeSingle(),
                    supabase.from('messages').select('*').or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`).order('created_at', { ascending: false }),
                    supabase.from('staff').select('*').eq('user_id', currentUser.id).order('name', { ascending: true }),
                    supabase.from('recurring_templates').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
                    supabase.from('invoice_customization').select('*').eq('user_id', currentUser.id).maybeSingle(),
                    supabase.from('daily_reports').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false })
                ]);

                // Safety check: If remote returns error, DO NOT overwrite local data
                if (!invRes.error && invRes.data) {
                    setInvoices(mergeWithLocalQueue(invRes.data, 'invoices', normalizeInvoice));
                }

                if (!quoteRes.error && quoteRes.data) {
                    const normalizeQuote = (q) => ({
                        ...q,
                        quoteNumber: q.quote_number,
                        recipientName: q.customer_name,
                        recipientEmail: q.customer_email,
                        recipientStreet: q.customer_address?.split(' ')[0] || '',
                        recipientHouseNum: q.customer_address?.split(' ')[1] || '',
                        date: q.created_at?.split('T')[0]
                    });
                    setQuotes(mergeWithLocalQueue(quoteRes.data, 'quotes', normalizeQuote));
                }

                if (!expRes.error && expRes.data) {
                    setExpenses(mergeWithLocalQueue(expRes.data, 'expenses', normalizeExpense));
                }

                // Merge with pending sync queue for immediate consistency after refresh
                const syncQueue = JSON.parse(localStorage.getItem('bay_sync_queue') || '[]');
                const pendingProfile = syncQueue
                    .filter(item => item.table === 'company_settings' && (item.action === 'insert' || item.action === 'update'))
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

                if (pendingProfile) {
                    setCompanyProfile(prev => normalizeProfile(pendingProfile.data, prev));
                } else if (settingsRes.data) {
                    setCompanyProfile(prev => normalizeProfile(settingsRes.data, prev));
                }

                if (msgRes.data) setMessages(msgRes.data.map(normalizeMessage));
                if (staffRes.data) setEmployees(mergeWithLocalQueue(staffRes.data, 'staff'));
                if (recurringRes.data) {
                    setRecurringTemplates(mergeWithLocalQueue(recurringRes.data, 'recurring_templates', normalizeRecurringTemplate));
                }
                const pendingCustom = syncQueue
                    .filter(item => item.table === 'invoice_customization' && (item.action === 'insert' || item.action === 'update'))
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

                if (pendingCustom) {
                    setInvoiceCustomization(prev => ({ ...prev, ...pendingCustom.data }));
                } else if (customRes.data) {
                    setInvoiceCustomization(prev => ({
                        ...prev,
                        ...customRes.data,
                        brandPalette: customRes.data.brand_palette || []
                    }));
                }

                if (reportRes.data) setDailyReports(reportRes.data);

            } catch (err) {
                console.error('Error loading Supabase data:', err);
            } finally {
                // setLoading(false); // Already false
            }
        };

        loadData();
    }, [currentUser?.id, currentUser?.isSkeleton]);

    // Real-time listener for messages
    useEffect(() => {
        if (!currentUser?.id) return;

        const messageChannel = supabase
            .channel('public:messages')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'messages',
                filter: `sender_id=eq.${currentUser.id}`
            }, payload => {
                // Handle new messages or updates
                if (payload.eventType === 'INSERT') {
                    setMessages(prev => [normalizeMessage(payload.new), ...prev]);
                } else if (payload.eventType === 'UPDATE') {
                    setMessages(prev => prev.map(msg => msg.id === payload.old.id ? normalizeMessage(payload.new) : msg));
                } else if (payload.eventType === 'DELETE') {
                    setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
                }
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=eq.${currentUser.id}`
            }, payload => {
                // Handle new messages or updates
                if (payload.eventType === 'INSERT') {
                    setMessages(prev => [normalizeMessage(payload.new), ...prev]);
                } else if (payload.eventType === 'UPDATE') {
                    setMessages(prev => prev.map(msg => msg.id === payload.old.id ? normalizeMessage(payload.new) : msg));
                } else if (payload.eventType === 'DELETE') {
                    setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
                }
            })
            .subscribe();

        // Real-time listener for daily reports
        const reportChannel = supabase
            .channel('public:daily_reports')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'daily_reports'
            }, payload => {
                if (payload.eventType === 'INSERT') {
                    setDailyReports(prev => [payload.new, ...prev]);
                } else if (payload.eventType === 'UPDATE') {
                    setDailyReports(prev => prev.map(rep => rep.id === payload.old.id ? payload.new : rep));
                } else if (payload.eventType === 'DELETE') {
                    setDailyReports(prev => prev.filter(rep => rep.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(messageChannel);
            supabase.removeChannel(reportChannel);
        };
    }, [currentUser?.id, currentUser?.isSkeleton, currentUser?.isTimeout]);

    // For development, we keep localStorage as a temporary cache
    // LocalStorage Persistence - Granular syncing to prevent regression
    useEffect(() => {
        if (currentUser?.id && !loading) {
            // Prevent wiping localStorage with empty initial state if we already have data
            const isPopulated = companyProfile.companyName || companyProfile.email || companyProfile.street || companyProfile.bankName;
            if (isPopulated) {
                localStorage.setItem(`bay_profile_${currentUser.id}`, JSON.stringify(companyProfile));
                localStorage.setItem('bay_profile', JSON.stringify(companyProfile));
            }
        }
    }, [companyProfile, currentUser?.id, loading]);

    useEffect(() => {
        if (currentUser?.id && !loading) {
            localStorage.setItem(`bay_invoices_${currentUser.id}`, JSON.stringify(invoices));
        }
    }, [invoices, currentUser?.id, loading]);

    useEffect(() => {
        if (currentUser?.id && !loading) {
            localStorage.setItem(`bay_quotes_${currentUser.id}`, JSON.stringify(quotes));
        }
    }, [quotes, currentUser?.id, loading]);

    useEffect(() => {
        if (currentUser?.id && !loading) {
            localStorage.setItem(`bay_expenses_${currentUser.id}`, JSON.stringify(expenses));
        }
    }, [expenses, currentUser?.id, loading]);

    useEffect(() => {
        if (currentUser?.id && !loading) {
            localStorage.setItem(`bay_recurring_templates_${currentUser.id}`, JSON.stringify(recurringTemplates));
        }
    }, [recurringTemplates, currentUser?.id, loading]);

    useEffect(() => {
        if (currentUser?.id && !loading) {
            localStorage.setItem(`bay_staff_${currentUser.id}`, JSON.stringify(employees));
        }
    }, [employees, currentUser?.id, loading]);

    const addExpenseCategory = (newCategory) => {
        if (!newCategory) return;
        if (!expenseCategories.includes(newCategory)) {
            setExpenseCategories(prev => [...prev, newCategory]);
        }
    };

    const deleteExpenseCategory = (cat) => {
        const nonDeletable = ['spareParts', 'rent', 'marketing', 'software', 'insurance', 'others'];
        if (nonDeletable.includes(cat)) return;
        setExpenseCategories(prev => prev.filter(c => c !== cat));
    };

    const saveInvoice = async (invoiceData) => {
        if (!currentUser?.id) return null;

        const id = invoiceData.id || uuidv4();
        const denormalized = denormalizeInvoice({ ...invoiceData, user_id: currentUser.id, id });

        const normalized = normalizeInvoice(denormalized);

        // Optimistic UI state update
        setInvoices(prev => {
            const exists = prev.find(i => String(i.id) === String(id));
            if (exists) return prev.map(i => String(i.id) === String(id) ? normalized : i);
            return [normalized, ...prev];
        });

        // Reliable enqueue
        syncService.enqueue('invoices', 'insert', denormalized, id);
        return normalized;
    };

    const deleteInvoice = (id) => {
        setInvoices(prev => prev.filter(inv => String(inv.id) !== String(id)));
        syncService.enqueue('invoices', 'delete', null, id);
        return true;
    };

    const saveQuote = async (quoteData) => {
        if (!currentUser?.id) return null;

        const id = quoteData.id || uuidv4();
        const dbQuote = {
            id,
            user_id: currentUser.id,
            quote_number: quoteData.quoteNumber,
            customer_name: quoteData.recipientName,
            customer_email: quoteData.recipientEmail,
            customer_address: `${quoteData.recipientStreet || ''} ${quoteData.recipientHouseNum || ''}`.trim(),
            items: quoteData.items,
            subtotal: quoteData.subtotal,
            tax: quoteData.tax,
            tax_rate: quoteData.taxRate,
            total: quoteData.total,
            currency: quoteData.currency,
            status: quoteData.status || 'pending',
            notes: quoteData.footerNote,
            valid_until: quoteData.validUntil
        };

        const normalizedQuote = {
            ...quoteData,
            id,
            recipientStreet: quoteData.recipientStreet,
            recipientHouseNum: quoteData.recipientHouseNum
        };

        // UI Update
        setQuotes(prev => {
            const exists = prev.find(q => String(q.id) === String(id));
            if (exists) return prev.map(q => String(q.id) === String(id) ? normalizedQuote : q);
            return [normalizedQuote, ...prev];
        });

        syncService.enqueue('quotes', 'insert', dbQuote, id);
        return normalizedQuote;
    };

    const deleteQuote = async (id) => {
        setQuotes(prev => prev.filter(q => String(q.id) !== String(id)));
        syncService.enqueue('quotes', 'delete', null, id);
        return true;
    };

    const updateQuote = async (id, newData) => {
        setQuotes(prev => prev.map(q => String(q.id) === String(id) ? { ...q, ...newData } : q));
        syncService.enqueue('quotes', 'update', newData, id);
    };

    const saveExpense = async (expenseData) => {
        if (!currentUser?.id) return;

        const id = expenseData.id || uuidv4();
        const expenseItem = {
            id,
            user_id: currentUser.id,
            date: expenseData.date || new Date().toISOString().split('T')[0],
            title: expenseData.title,
            amount: parseFloat(expenseData.amount) || 0,
            category: expenseData.category,
            currency: expenseData.currency || 'EUR',
            receiptImage: expenseData.receiptImage
        };

        const dbExpense = {
            id,
            user_id: currentUser.id,
            date: expenseItem.date,
            title: expenseItem.title,
            amount: expenseItem.amount,
            category: expenseItem.category,
            currency: expenseItem.currency,
            receipt_image: expenseItem.receiptImage // Map to DB snake_case
        };

        // Optimistic UI update
        setExpenses(prev => {
            const exists = prev.find(e => String(e.id) === String(id));
            if (exists) return prev.map(e => String(e.id) === String(id) ? expenseItem : e);
            return [expenseItem, ...prev];
        });

        syncService.enqueue('expenses', 'insert', dbExpense, id);
    };

    const deleteExpense = async (id) => {
        setExpenses(prev => prev.filter(exp => String(exp.id) !== String(id)));
        syncService.enqueue('expenses', 'delete', null, id);
    };

    const saveRecurringTemplate = async (templateData) => {
        if (!currentUser?.id) return;
        const id = templateData.id || uuidv4();

        const normalized = normalizeRecurringTemplate({ ...templateData, id });

        const dbTemplate = {
            id,
            user_id: currentUser.id,
            template_name: normalized.templateName || `Tpl - ${normalized.customerName}`,
            customer_name: normalized.customerName,
            customer_email: normalized.customerEmail,
            items: normalized.items,
            frequency: normalized.frequency,
            amount: normalized.amount,
            currency: normalized.currency,
            status: normalized.status
        };
        // Description field removed from DB sync as columns 'notes' and 'description' are missing in schema.

        setRecurringTemplates(prev => {
            const exists = prev.find(t => String(t.id) === String(id));
            if (exists) return prev.map(t => String(t.id) === String(id) ? normalized : t);
            return [normalized, ...prev];
        });

        syncService.enqueue('recurring_templates', 'insert', dbTemplate, id);
    };

    const deleteRecurringTemplate = async (id) => {
        setRecurringTemplates(prev => prev.filter(t => String(t.id) !== String(id)));
        syncService.enqueue('recurring_templates', 'delete', null, id);
    };

    const updateProfile = async (newData, logoFile = null) => {
        let logoUrl = newData.logo || companyProfile.logo;

        if (logoFile && currentUser?.id) {
            const uploadRes = await storageService.uploadLogo(currentUser.id, logoFile);
            if (uploadRes.success) {
                logoUrl = uploadRes.url;
            }
        }

        const updatedProfile = { ...companyProfile, ...newData, logo: logoUrl };
        setCompanyProfile(updatedProfile);

        if (currentUser?.id) {
            const dbData = {
                user_id: currentUser.id,
                company_name: updatedProfile.companyName,
                email: updatedProfile.email,
                phone: updatedProfile.phone,
                address: `${updatedProfile.street || ''} ${updatedProfile.houseNum || ''}`.trim(),
                city: updatedProfile.city,
                postal_code: updatedProfile.zip,
                tax_id: updatedProfile.taxId,
                vat_id: updatedProfile.vatId,
                bank_name: updatedProfile.bankName,
                iban: updatedProfile.iban,
                logo_url: logoUrl,
                industry: updatedProfile.industry,
                owner: updatedProfile.owner,
                bic: updatedProfile.bic,
                payment_terms: updatedProfile.paymentTerms,
                default_currency: updatedProfile.defaultCurrency,
                default_tax_rate: updatedProfile.defaultTaxRate,
                tax_exempt: updatedProfile.taxExempt,
                paypal_me: updatedProfile.paypalMe,
                stripe_link: updatedProfile.stripeLink,
                stripe_api_key: updatedProfile.stripeApiKey,
                stripe_webhook_secret: updatedProfile.stripeWebhookSecret,
                paypal_client_id: updatedProfile.paypalClientId,
                paypal_secret: updatedProfile.paypalSecret,
                logo_display_mode: updatedProfile.logoDisplayMode
            };

            syncService.enqueue('company_settings', 'update', dbData);
        }
    };

    const generatePortalLink = async (entityType, entityId) => {
        if (!currentUser?.id) return null;
        const { data: existing } = await supabase.from('public_tokens').select('token').eq('entity_id', entityId).maybeSingle();
        if (existing) return `${window.location.origin}/portal/${existing.token}`;

        const token = uuidv4().replace(/-/g, '');
        const { error } = await supabase.from('public_tokens').insert({
            user_id: currentUser.id,
            entity_type: entityType,
            entity_id: entityId,
            token: token
        });
        if (error) return null;
        return `${window.location.origin}/portal/${token}`;
    };

    const updateInvoiceStatus = async (id, newStatus) => {
        // Find existing record to get user_id if possible
        const existing = invoices.find(i => String(i.id) === String(id));

        setInvoices(prev => prev.map(inv =>
            String(inv.id) === String(id) ? { ...inv, status: newStatus } : inv
        ));

        if (currentUser?.id) {
            syncService.enqueue('invoices', 'update', {
                status: newStatus,
                user_id: existing?.user_id || currentUser.id
            }, id);
        }
    };

    const updateInvoice = async (id, newData) => {
        setInvoices(prev => prev.map(inv => String(inv.id) === String(id) ? { ...inv, ...newData } : inv));

        if (currentUser?.id) {
            const denormalized = denormalizeInvoice({ ...newData, id, user_id: currentUser.id });
            // Only include non-undefined fields to allow partial updates
            Object.keys(denormalized).forEach(key => {
                if (denormalized[key] === undefined) delete denormalized[key];
            });

            syncService.enqueue('invoices', 'update', denormalized, id);
        }
    };

    const importInvoices = (newInvoices) => {
        const processed = newInvoices.map(inv => ({
            ...inv,
            id: inv.id || uuidv4(),
            createdAt: inv.createdAt || new Date().toISOString(),
            status: inv.status || 'paid'
        }));
        setInvoices(prev => [...processed, ...prev]);

        processed.forEach(inv => {
            const denorm = denormalizeInvoice({ ...inv, user_id: currentUser.id });
            syncService.enqueue('invoices', 'insert', denorm, denorm.id);
        });
    };

    // Customization Management
    const updateCustomization = async (newData) => {
        const merged = { ...invoiceCustomization, ...newData };
        setInvoiceCustomization(merged);

        if (currentUser?.id) {
            const dbData = {
                user_id: currentUser.id,
                primary_color: merged.primaryColor,
                accent_color: merged.accentColor,
                signature_url: merged.signatureUrl,
                footer_text: merged.footerText,
                quote_validity_days: merged.quoteValidityDays,
                brand_palette: merged.brandPalette || []
            };
            syncService.enqueue('invoice_customization', 'update', dbData);
        }
    };

    // Payment Reminders Management
    const addPaymentReminder = (reminderData) => {
        const newReminder = {
            id: Date.now(),
            createdAt: new Date().toISOString(),
            emailSent: false,
            ...reminderData
        };
        setPaymentReminders(prev => [newReminder, ...prev]);
    };

    const deletePaymentReminder = (id) => {
        setPaymentReminders(prev => prev.filter(r => r.id !== id));
    };

    // Employee Management
    const saveEmployee = async (empData) => {
        if (!currentUser?.id) return;
        const id = empData.id || uuidv4();
        const dbEmp = {
            id,
            user_id: currentUser.id,
            name: empData.name,
            full_name: empData.name, // compatibility
            email: empData.email || '',
            role: empData.role || 'Worker',
            status: empData.status || 'Active',
            sites: empData.sites || ['Main'],
            color: empData.color || '#3b82f6'
        };

        setEmployees(prev => {
            const exists = prev.find(e => String(e.id) === String(id));
            if (exists) return prev.map(e => String(e.id) === String(id) ? { ...empData, id } : e);
            return [{ ...empData, id }, ...prev];
        });

        syncService.enqueue('staff', 'insert', dbEmp, id);
    };

    const deleteEmployee = async (id) => {
        setEmployees(prev => prev.filter(e => String(e.id) !== String(id)));
        syncService.enqueue('staff', 'delete', null, id);
    };

    const updateEmployee = async (id, newData) => {
        setEmployees(prev => prev.map(e => String(e.id) === String(id) ? { ...e, ...newData } : e));
        syncService.enqueue('staff', 'update', newData, id);
    };

    // Message Management
    const sendMessage = async (msgData) => {
        if (!currentUser?.id) return;
        const id = uuidv4();
        const newMessage = {
            id,
            sender_id: currentUser.id,
            receiver_id: msgData.receiverId || null,
            content: msgData.message,
            category: msgData.category || 'internal',
            type: msgData.type || 'message',
            title: msgData.title || null,
            metadata: msgData.metadata || {},
            is_read: false,
            created_at: new Date().toISOString()
        };

        setMessages(prev => [normalizeMessage(newMessage), ...prev]);
        syncService.enqueue('messages', 'insert', newMessage, id);
        return newMessage;
    };

    const sendBroadcastMessage = async (broadcastData) => {
        return sendMessage({
            ...broadcastData,
            receiverId: null
        });
    };

    const markMessageAsRead = async (id) => {
        setMessages(prev => prev.map(m => String(m.id) === String(id) ? { ...m, is_read: true } : m));
        syncService.enqueue('messages', 'update', { is_read: true }, id);
    };

    const deleteMessage = async (id) => {
        setMessages(prev => prev.filter(m => String(m.id) !== String(id)));
        syncService.enqueue('messages', 'delete', null, id);
    };

    const fetchDailyReports = async () => {
        if (!currentUser?.id) return;
        const { data, error } = await supabase.from('daily_reports').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false });
        if (!error && data) setDailyReports(data);
        return data;
    };

    // Export Helper
    const exportToCSV = (data, filename) => {
        if (!data || data.length === 0) return;

        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj => {
            return Object.values(obj).map(val => {
                const str = String(val).replace(/"/g, '""');
                return `"${str}"`;
            }).join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToDATEV = (data) => {
        // Simplified DATEV CSV format for accounting
        const datevHeaders = [
            'Umsatz', 'S/H', 'Währung', 'Kontonummer', 'Gegenkonto', 'Belegdatum', 'Belegfeld 1', 'Buchungstext'
        ].join(';');

        const rows = data.map(inv => {
            const date = new Date(inv.date);
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            return [
                inv.total.toString().replace('.', ','),
                'H', // Haben (Revenue)
                'EUR',
                '8400', // Typical revenue account
                '10000', // Typical customer account
                formattedDate,
                inv.invoiceNumber,
                inv.recipientName
            ].join(';');
        });

        const content = "data:text/csv;charset=utf-8," + [datevHeaders, ...rows].join('\n');
        const encodedUri = encodeURI(content);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `DATEV_Export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const CURRENCIES = [
        { code: 'EUR', symbol: '€', label: 'Euro' },
        { code: 'USD', symbol: '$', label: 'US Dollar' },
        { code: 'TRY', symbol: '₺', label: 'Türk Lirası' },
        { code: 'GBP', symbol: '£', label: 'British Pound' }
    ];

    const STATUSES = {
        draft: { label: 'Entwurf', color: '#94a3b8' },
        sent: { label: 'Gesendet', color: '#3b82f6' },
        viewed: { label: 'Gesehen', color: '#8b5cf6' },
        paid: { label: 'Bezahlt', color: '#10b981' },
        partial: { label: 'Teilweise', color: '#f59e0b' },
        overdue: { label: 'Überfällig', color: '#ef4444' }
    };

    const invoiceValue = useMemo(() => ({
        companyProfile,
        invoices,
        quotes,
        expenses,
        recurringTemplates,
        invoiceCustomization,
        paymentReminders,
        saveInvoice,
        deleteInvoice,
        saveQuote,
        deleteQuote,
        updateQuote,
        saveExpense,
        deleteExpense,
        saveRecurringTemplate,
        deleteRecurringTemplate,
        updateProfile,
        updateInvoiceStatus,
        updateInvoice,
        updateCustomization,
        addPaymentReminder,
        deletePaymentReminder,
        exportToCSV,
        expenseCategories,
        addExpenseCategory,
        deleteExpenseCategory,
        CURRENCIES,
        STATUSES,
        employees,
        saveEmployee,
        deleteEmployee,
        updateEmployee,
        messages,
        sendMessage,
        sendBroadcastMessage,
        markMessageAsRead,
        deleteMessage,
        dailyReports,
        fetchDailyReports,
        importInvoices,
        exportToDATEV,
        syncStatus: syncService.getStatus() // Expose sync status
    }), [
        companyProfile, invoices, quotes, expenses, recurringTemplates,
        invoiceCustomization, paymentReminders, expenseCategories, employees, messages, dailyReports
    ]);

    return (
        <InvoiceContext.Provider value={invoiceValue}>
            {children}
        </InvoiceContext.Provider>
    );
};

export const useInvoice = () => useContext(InvoiceContext);
