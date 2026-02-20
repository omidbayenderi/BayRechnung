import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { syncService } from '../lib/SyncService';
import { supabase } from '../lib/supabase';
import { storageService } from '../lib/StorageService';
import { useAuth } from './AuthContext';

const InvoiceContext = createContext();

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
    industry: 'general', // Default to general
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
            industryData: inv.vehicle_info || inv.industryData || {},
            senderSnapshot: inv.senderSnapshot || {}
        };
    };

    // Helper: Map camelCase (Frontend) back to snake_case (DB)
    const denormalizeInvoice = (inv) => {
        if (!inv) return null;
        return {
            invoice_number: inv.invoiceNumber,
            customer_name: inv.recipientName,
            customer_email: inv.recipientEmail || null,
            customer_address: inv.recipientStreet + ' ' + (inv.recipientHouseNum || ''),
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
            vehicle_info: inv.industryData || {},
            user_id: inv.user_id,
            sender_snapshot: inv.senderSnapshot
        };
    };

    // Helper: Normalize messages
    const normalizeMessage = (msg) => {
        if (!msg) return null;
        return {
            ...msg,
            status: msg.is_read ? 'read' : 'unread' // Compatibility for components using .status
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
    const mergeWithLocalQueue = (remoteData, tableName) => {
        // If remote is empty, but we have a queue, we use queue.
        // If remote is null (error), return [];
        const safeRemote = remoteData || [];

        let merged = [...safeRemote];
        const queue = syncService.queue.filter(q => q.table === tableName);

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
            // Only add if not already present (avoid duplicates)
            const exists = merged.find(m => String(m.id) === String(ins.id));
            if (!exists) merged.unshift(ins);
        });

        return merged.map(normalizeInvoice);
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
                const localProfile = localStorage.getItem(`bay_profile_${currentUser.id}`);

                if (localInvoices) setInvoices(JSON.parse(localInvoices).map(normalizeInvoice));
                if (localQuotes) setQuotes(JSON.parse(localQuotes).map(normalizeInvoice));
                if (localExpenses) setExpenses(JSON.parse(localExpenses));
                if (localProfile) setCompanyProfile(prev => ({ ...prev, ...JSON.parse(localProfile) }));
            } catch (e) {
                console.error("Error loading from localStorage:", e);
            }

            // 2. Fetch from Supabase and Merge
            try {
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
                    setInvoices(mergeWithLocalQueue(invRes.data, 'invoices'));
                }

                if (!quoteRes.error && quoteRes.data) {
                    setQuotes(quoteRes.data.map(q => ({
                        ...q,
                        quoteNumber: q.quote_number,
                        recipientName: q.customer_name,
                        recipientEmail: q.customer_email,
                        recipientStreet: q.customer_address?.split(' ')[0] || '', // Fallback simplification
                        recipientHouseNum: q.customer_address?.split(' ')[1] || '',
                        date: q.created_at?.split('T')[0]
                    })));
                }

                if (!expRes.error && expRes.data) setExpenses(expRes.data);

                if (settingsRes.data) {
                    setCompanyProfile(prev => ({ ...prev, ...settingsRes.data }));
                }

                if (msgRes.data) setMessages(msgRes.data.map(normalizeMessage));
                if (staffRes.data) setEmployees(staffRes.data);
                if (recurringRes.data) setRecurringTemplates(recurringRes.data);
                if (customRes.data) setInvoiceCustomization(prev => ({ ...prev, ...customRes.data }));
                if (reportRes.data) setDailyReports(reportRes.data);

            } catch (err) {
                console.error('Error loading Supabase data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [currentUser?.id]);

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
    }, [currentUser?.id]);

    // For development, we keep localStorage as a temporary cache
    // LocalStorage Persistence
    useEffect(() => {
        if (currentUser?.id) {
            const profileStr = JSON.stringify(companyProfile);
            localStorage.setItem(`bay_profile_${currentUser.id}`, profileStr);
            localStorage.setItem('bay_profile', profileStr); // Sync to master key for website preview
            localStorage.setItem(`bay_invoices_${currentUser.id}`, JSON.stringify(invoices));
            localStorage.setItem(`bay_quotes_${currentUser.id}`, JSON.stringify(quotes));
            localStorage.setItem(`bay_expenses_${currentUser.id}`, JSON.stringify(expenses));
        }
    }, [companyProfile, invoices, quotes, expenses, currentUser]);

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

        const id = invoiceData.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : uuidv4());

        // Ensure user_id is explicitly correctly set
        const denormalized = denormalizeInvoice({ ...invoiceData, user_id: currentUser.id });

        // Double check user_id presence
        if (!denormalized.user_id) denormalized.user_id = currentUser.id;

        const newInvoice = {
            ...denormalized,
            id: id,
            created_at: new Date().toISOString()
        };

        // UI state update (Optimistic Update)
        setInvoices(prev => {
            const normalized = normalizeInvoice(newInvoice);
            // Replace if exists, else add
            const exists = prev.find(i => i.id === id);
            if (exists) return prev.map(i => i.id === id ? normalized : i);
            return [normalized, ...prev];
        });

        // Sync to Supabase
        const { data, error } = await supabase.from('invoices').upsert(newInvoice).select().single();

        if (error) {
            console.error('Error saving invoice to Supabase:', error);
            // Add to offline queue
            syncService.enqueue('invoices', 'insert', newInvoice);
            // Return optimistic data
            return normalizeInvoice(newInvoice);
        }

        return normalizeInvoice(data);
    };

    const deleteInvoice = (id) => {
        const idStr = String(id);
        setInvoices(prev => prev.filter(inv => String(inv.id) !== idStr));

        // Enqueue sync - assuming the record in DB has the same id (Date.now())
        syncService.enqueue('invoices', 'delete', null, id);

        return true;
    };

    const saveQuote = async (quoteData) => {
        if (!currentUser?.id) return null;

        const id = quoteData.id || uuidv4();
        const newQuote = {
            user_id: currentUser.id,
            quote_number: quoteData.quoteNumber,
            customer_name: quoteData.recipientName,
            customer_email: quoteData.recipientEmail,
            customer_address: `${quoteData.recipientStreet} ${quoteData.recipientHouseNum}`,
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

        // UI Update
        setQuotes(prev => {
            const exists = prev.find(q => q.id === id);
            if (exists) return prev.map(q => q.id === id ? { ...q, ...quoteData } : q);
            return [{ ...quoteData, id }, ...prev];
        });

        // Sync
        const { data, error } = await supabase.from('quotes').upsert({ ...newQuote, id }).select().single();
        if (error) {
            console.error('Error saving quote:', error);
            syncService.enqueue('quotes', 'insert', { ...newQuote, id });
        }
        return data;
    };

    const deleteQuote = async (id) => {
        setQuotes(prev => prev.filter(q => q.id !== id));
        const { error } = await supabase.from('quotes').delete().eq('id', id);
        if (error) syncService.enqueue('quotes', 'delete', null, id);
        return true;
    };

    const updateQuote = async (id, newData) => {
        setQuotes(prev => prev.map(q => q.id === id ? { ...q, ...newData } : q));
        const { error } = await supabase.from('quotes').update(newData).eq('id', id);
        if (error) syncService.enqueue('quotes', 'update', newData, id);
    };

    const saveExpense = async (expenseData) => {
        if (!currentUser?.id) return;

        const newExpense = {
            user_id: currentUser.id,
            date: new Date().toISOString().split('T')[0],
            title: expenseData.title,
            amount: expenseData.amount,
            category: expenseData.category,
            currency: expenseData.currency,
            receipt_image: expenseData.receiptImage
        };

        const { data, error } = await supabase.from('expenses').insert(newExpense).select().single();

        if (error) {
            console.error('Error saving expense:', error);
            syncService.enqueue('expenses', 'insert', newExpense);
            return;
        }

        setExpenses(prev => [data, ...prev]);
    };

    const deleteExpense = (id) => {
        setExpenses(prev => prev.filter(exp => exp.id !== id));
    };

    const saveRecurringTemplate = async (templateData) => {
        if (!currentUser?.id) return;
        const id = templateData.id || uuidv4();
        const dbTemplate = {
            user_id: currentUser.id,
            template_name: templateData.templateName,
            customer_name: templateData.customerName,
            customer_email: templateData.customerEmail,
            items: templateData.items,
            frequency: templateData.frequency,
            amount: templateData.amount,
            currency: templateData.currency,
            status: templateData.status || 'active'
        };

        setRecurringTemplates(prev => [{ ...templateData, id }, ...prev]);
        const { error } = await supabase.from('recurring_templates').upsert({ ...dbTemplate, id });
        if (error) syncService.enqueue('recurring_templates', 'insert', { ...dbTemplate, id });
    };

    const deleteRecurringTemplate = async (id) => {
        setRecurringTemplates(prev => prev.filter(t => t.id !== id));
        const { error } = await supabase.from('recurring_templates').delete().eq('id', id);
        if (error) syncService.enqueue('recurring_templates', 'delete', null, id);
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
                company_name: newData.companyName || companyProfile.companyName,
                email: newData.email || companyProfile.email,
                phone: newData.phone || companyProfile.phone,
                address: newData.address || companyProfile.address,
                city: newData.city || companyProfile.city,
                postal_code: newData.zip || companyProfile.zip,
                tax_id: newData.taxId || companyProfile.taxId,
                vat_id: newData.vatId || companyProfile.vatId,
                bank_name: newData.bankName || companyProfile.bankName,
                iban: newData.iban || companyProfile.iban,
                logo_url: logoUrl
            };
            const { error } = await supabase.from('company_settings').upsert(dbData);
            if (error) syncService.enqueue('company_settings', 'insert', dbData);
        }
    };

    const generatePortalLink = async (entityType, entityId) => {
        if (!currentUser?.id) return null;

        // Check if token already exists
        const { data: existing } = await supabase
            .from('public_tokens')
            .select('token')
            .eq('entity_id', entityId)
            .maybeSingle();

        if (existing) {
            return `${window.location.origin}/portal/${existing.token}`;
        }

        // Generate new token
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        const { error } = await supabase.from('public_tokens').insert({
            user_id: currentUser.id,
            entity_type: entityType,
            entity_id: entityId,
            token: token
        });

        if (error) {
            console.error('Error generating portal link:', error);
            return null;
        }

        return `${window.location.origin}/portal/${token}`;
    };

    const updateInvoiceStatus = async (id, newStatus) => {
        setInvoices(prev => prev.map(inv =>
            String(inv.id) === String(id) || inv.id === id ? { ...inv, status: newStatus } : inv
        ));

        if (currentUser?.id) {
            const { error } = await supabase
                .from('invoices')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) {
                console.error('Error updating invoice status in Supabase:', error);
                syncService.enqueue('invoices', 'update', { status: newStatus }, id);
            }
        }
    };

    const updateInvoice = async (id, newData) => {
        setInvoices(prev => prev.map(inv => {
            if (String(inv.id) === String(id)) {
                return { ...inv, ...newData };
            }
            return inv;
        }));

        if (currentUser?.id) {
            const denormalized = denormalizeInvoice(newData);
            // Remove user_id if present to avoid update issues
            delete denormalized.user_id;

            const { error } = await supabase
                .from('invoices')
                .update(denormalized)
                .eq('id', id);

            if (error) {
                console.error('Error updating invoice:', error);
                syncService.enqueue('invoices', 'update', denormalized, id);
            }
        }
    };

    const importInvoices = (newInvoices) => {
        const processed = newInvoices.map(inv => ({
            id: Date.now() + Math.random(),
            createdAt: new Date().toISOString(),
            status: 'paid', // default for imported
            ...inv
        }));
        setInvoices(prev => [...processed, ...prev]);

        // Background sync for all imported items
        processed.forEach(inv => syncService.enqueue('invoices', 'insert', inv));
    };

    // Customization Management
    const updateCustomization = async (newData) => {
        setInvoiceCustomization(prev => ({ ...prev, ...newData }));
        if (currentUser?.id) {
            const dbData = {
                user_id: currentUser.id,
                primary_color: newData.primaryColor,
                accent_color: newData.accentColor,
                signature_url: newData.signatureUrl,
                footer_text: newData.footerText,
                quote_validity_days: newData.quoteValidityDays
            };
            const { error } = await supabase.from('invoice_customization').upsert(dbData);
            if (error) syncService.enqueue('invoice_customization', 'insert', dbData);
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
            user_id: currentUser.id,
            name: empData.name,
            role: empData.role,
            color: empData.color || '#3b82f6'
        };

        setEmployees(prev => [{ ...empData, id }, ...prev]);
        const { error } = await supabase.from('staff').upsert({ ...dbEmp, id });
        if (error) syncService.enqueue('staff', 'insert', { ...dbEmp, id });
    };

    const deleteEmployee = async (id) => {
        setEmployees(prev => prev.filter(e => e.id !== id));
        const { error } = await supabase.from('staff').delete().eq('id', id);
        if (error) syncService.enqueue('staff', 'delete', null, id);
    };

    const updateEmployee = async (id, newData) => {
        setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...newData } : e));
        const { error } = await supabase.from('staff').update(newData).eq('id', id);
        if (error) syncService.enqueue('staff', 'update', newData, id);
    };

    // Message Management
    const sendMessage = async (msgData) => {
        if (!currentUser?.id) return;

        const newMessage = {
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

        // Optimistic UI Update
        const tempId = Date.now();
        setMessages(prev => [normalizeMessage({ ...newMessage, id: tempId }), ...prev]);

        // Persist to Supabase
        const { data, error } = await supabase.from('messages').insert(newMessage).select().single();

        if (error) {
            console.error('Error sending message:', error);
            return null;
        }

        // Replace temp ID with real ID
        setMessages(prev => prev.map(m => m.id === tempId ? normalizeMessage(data) : m));
        return data;
    };

    const sendBroadcastMessage = async (broadcastData) => {
        // Broadly similar to sendMessage but can target specific roles if needed via metadata
        return sendMessage({
            ...broadcastData,
            receiverId: null // NULL receiver_id indicates broadcast
        });
    };

    const markMessageAsRead = async (id) => {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
        await supabase.from('messages').update({ is_read: true }).eq('id', id);
    };

    const deleteMessage = async (id) => {
        setMessages(prev => prev.filter(m => m.id !== id));
        await supabase.from('messages').delete().eq('id', id);
    };

    const fetchDailyReports = async () => {
        if (!currentUser?.id) return;
        const { data, error } = await supabase
            .from('daily_reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setDailyReports(data);
        }
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
