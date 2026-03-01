import { supabase, isSupabaseConfigured, checkDbHealth } from './supabase';
import { syncService as syncServiceInstance } from './SyncService'; // Avoid circular if needed, but here we define the class

const TABLE_SCHEMAS = {
    services: ['id', 'user_id', 'name', 'description', 'duration', 'price', 'image_url', 'color', 'icon', 'created_at'],
    staff: ['id', 'user_id', 'name', 'full_name', 'email', 'status', 'sites', 'role', 'image_url', 'color', 'created_at'],

    recurring_templates: ['id', 'user_id', 'template_name', 'customer_name', 'customer_email', 'items', 'frequency', 'amount', 'currency', 'status', 'created_at'],
    projects: ['id', 'user_id', 'name', 'client_name', 'status', 'budget', 'due_date', 'progress', 'created_at', 'updated_at'],
    messages: ['id', 'sender_id', 'receiver_id', 'content', 'category', 'type', 'title', 'metadata', 'is_read', 'created_at'],
    appointment_settings: [
        'id', 'user_id', 'working_hours_start', 'working_hours_end',
        'working_hours_weekend_start', 'working_hours_weekend_end',
        'working_days', 'slot_duration', 'buffer_time', 'holidays', 'breaks'
    ],
    website_configs: ['id', 'user_id', 'config', 'domain', 'slug', 'is_published', 'updated_at'],
    products: ['id', 'user_id', 'name', 'description', 'category', 'price', 'stock', 'min_stock', 'sku', 'image_url', 'supplier_info', 'created_at'],
    sales: ['id', 'user_id', 'customer_name', 'total', 'payment_method', 'items', 'status', 'created_at'],
    stock_movements: ['id', 'user_id', 'product_id', 'quantity_change', 'type', 'reason', 'created_at'],
    invoices: [
        'id', 'user_id', 'invoice_number', 'customer_name', 'customer_email',
        'customer_address', 'customer_city', 'customer_postal_code',
        'items', 'subtotal', 'tax_rate', 'tax_amount', 'total', 'status',
        'due_date', 'issue_date', 'notes', 'currency', 'industry_data', 'sender_snapshot', 'created_at'
    ],
    expenses: ['id', 'user_id', 'description', 'amount', 'category', 'date', 'receipt_url', 'status', 'created_at'],
    appointments: [
        'id', 'user_id', 'customer_name', 'customer_email', 'customer_phone',
        'client_name', 'client_email', 'client_phone', // Dual support
        'service_id', 'staff_id', 'date', 'start_time', 'end_time', 'status', 'notes', 'created_at'
    ],
    company_settings: [
        'id', 'user_id', 'company_name', 'owner', 'email', 'phone', 'address',
        'street', 'house_num', 'city', 'postal_code',
        'tax_rate', 'currency', 'logo_url', 'industry', 'brand_palette',
        'tax_id', 'vat_id', 'bank_name', 'iban', 'bic', 'payment_terms',
        'stripe_public_key', 'stripe_secret_key', 'stripe_api_key', 'stripe_webhook_secret',
        'paypal_client_id', 'paypal_secret', 'logo_display_mode', 'plan'
    ],
    stock_settings: ['id', 'user_id', 'tax_rate', 'currency', 'store_name', 'store_address', 'store_phone', 'default_low_stock', 'categories'],
    invoice_customization: ['id', 'user_id', 'primary_color', 'accent_color', 'signature_url', 'footer_text', 'quote_validity_days', 'brand_palette']
};

class SyncService {
    constructor() {
        this.queue = [];
        this.errors = [];
        this.isProcessing = false;
        this.listeners = [];
        this.lastSuccess = isSupabaseConfigured() ? Date.now() : 0;
        this.isConfigured = isSupabaseConfigured();

        // Load existing queue from localStorage
        const savedQueue = localStorage.getItem('bay_sync_queue');
        if (savedQueue) {
            try {
                this.queue = JSON.parse(savedQueue);
            } catch (e) {
                console.error("Sync Queue parse error:", e);
                this.queue = [];
            }
        }

        // Debounce timer for processing
        this.processTimer = null;

        // Listen for online status
        window.addEventListener('online', () => {
            console.log("[Sync] Device back online, processing queue...");
            this.processQueue();
        });

        // Periodic hearty check every 30 seconds (more frequent for detection)
        setInterval(() => {
            this.checkConnectivity();
            if (!this.isProcessing && this.queue.length > 0) {
                this.processQueue();
            }
        }, 30000);

        // Initial check
        setTimeout(() => this.checkConnectivity(), 1000);
    }

    enqueue(table, action, data, id = null) {
        const recordId = id || data?.id;
        const userId = data?.user_id || data?.userId;

        if (userId && (String(userId).startsWith('0000'))) {
            console.log(`[Sync] Skipping enqueue for mock record on ${table}`);
            return;
        }

        const settingsTables = ['company_settings', 'appointment_settings', 'stock_settings', 'invoice_customization', 'website_config', 'website_configs'];
        const isSettingsTable = settingsTables.includes(table) || table.endsWith('_settings');

        if (action === 'insert' || action === 'update') {
            const existingIndex = this.queue.findIndex(q => {
                if (q.table !== table) return false;
                if (q.action !== 'insert' && q.action !== 'update') return false;

                if (isSettingsTable) {
                    return (q.data?.user_id === userId || q.data?.userId === userId || q.targetId === userId);
                } else if (recordId) {
                    return (q.targetId === recordId || q.data?.id === recordId);
                }
                return false;
            });

            if (existingIndex !== -1) {
                this.queue[existingIndex].data = { ...this.queue[existingIndex].data, ...data };
                this.queue[existingIndex].timestamp = new Date().toISOString();
                if (isSettingsTable && userId) this.queue[existingIndex].targetId = userId;
                this.saveQueue();
                return;
            }
        }

        const item = {
            id: Date.now() + Math.random(),
            table,
            action,
            data,
            targetId: id || data?.id,
            timestamp: new Date().toISOString(),
            retryCount: 0
        };

        this.queue.push(item);
        this.saveQueue();

        // 1. DYNAMISM: If online, trigger process immediately (High Priority)
        // 2. FALLBACK: If offline, it stays in queue until 'online' event or interval
        if (navigator.onLine) {
            if (this.processTimer) clearTimeout(this.processTimer);
            // Non-blocking immediate attempt (50ms for UI thread breathing room)
            this.processTimer = setTimeout(() => this.processQueue(), 50);
        }
    }

    patchUserId(newUserId) {
        if (!newUserId) return;
        console.log(`[Sync] Patching queue with new user_id: ${newUserId}`);

        let patchedCount = 0;
        this.queue = this.queue.map(item => {
            let changed = false;
            const newData = { ...item.data };

            if (String(newData.user_id || '').startsWith('0000') || !newData.user_id) {
                newData.user_id = newUserId;
                changed = true;
            }

            if (item.table === 'messages' && (String(newData.sender_id || '').startsWith('0000') || !newData.sender_id)) {
                newData.sender_id = newUserId;
                changed = true;
            }

            if (changed) {
                patchedCount++;
                return { ...item, data: newData };
            }
            return item;
        });

        if (patchedCount > 0) {
            console.log(`[Sync] Patched ${patchedCount} items in queue.`);
            this.saveQueue();
            this.processQueue();
        }
    }

    saveQueue() {
        localStorage.setItem('bay_sync_queue', JSON.stringify(this.queue));
    }

    async processQueue(force = false) {
        const isOnline = force || navigator.onLine || (Date.now() - this.lastSuccess < 120000);

        if (this.isProcessing) return;
        if (!isOnline) {
            console.log(`[Sync] Process requested but offline (Queue: ${this.queue.length})`);
            return;
        }
        if (!this.isConfigured && !isSupabaseConfigured()) {
            console.warn('[Sync] Cannot process, Supabase not configured');
            return;
        }

        this.isConfigured = true;
        if (this.queue.length === 0) return;

        console.log(`[Sync] Processing queue (${this.queue.length} items, force=${force})...`);
        this.isProcessing = true;
        this.notifyListeners();

        try {
            while (this.queue.length > 0 && (navigator.onLine || force)) {
                const item = this.queue[0];
                const success = await this.syncItem(item);

                if (success) {
                    this.queue = this.queue.filter(q => q.id !== item.id);
                } else {
                    // Check if it's a schema error (400 Bad Request / missing column)
                    // These errors will NEVER succeed without a database migration.
                    const lastError = this.errors[this.errors.length - 1];
                    const isSchemaError = lastError && lastError.timestamp === new Date().toISOString() &&
                        (lastError.message?.includes('column') || lastError.message?.includes('not found'));

                    item.retryCount = (item.retryCount || 0) + 1;
                    this.queue = this.queue.filter(q => q.id !== item.id);

                    if (item.retryCount > 10 || isSchemaError) {
                        console.error("[Sync] Item retired (Permanent Error or Max Retries):", item);
                        const deadQueue = JSON.parse(localStorage.getItem('bay_dead_sync_queue') || '[]');
                        deadQueue.push({
                            ...item,
                            retiredAt: new Date().toISOString(),
                            reason: isSchemaError ? 'SCHEMA_MISMATCH' : 'MAX_RETRIES'
                        });
                        localStorage.setItem('bay_dead_sync_queue', JSON.stringify(deadQueue.slice(-50)));

                        if (isSchemaError) {
                            console.warn(`🛑 [Sync] Critical schema mismatch on ${item.table}. Migration required!`);
                        }
                    } else {
                        this.queue.push(item);
                    }
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

                this.saveQueue();
                if (this.queue.length > 0) {
                    await new Promise(resolve => setTimeout(resolve, 250));
                }
            }
        } catch (err) {
            console.error("[Sync] Queue processing error:", err);
        } finally {
            this.isProcessing = false;
            this.notifyListeners();
        }
    }

    async syncItem(item) {
        try {
            const { table, action, data, targetId } = item;
            let finalData = data ? { ...data } : null;
            let query;

            if (action === 'insert' || action === 'update') {
                let conflictTarget = 'id';
                const settingsTables = ['company_settings', 'appointment_settings', 'stock_settings', 'invoice_customization', 'website_config', 'website_configs'];
                if (settingsTables.includes(table) || table.endsWith('_settings')) {
                    conflictTarget = 'user_id';
                }

                // SECURITY: Before syncing, strip fields that are NOT in our schema
                // This prevents "Column not found" errors that block the entire sync queue
                if (TABLE_SCHEMAS[table] && finalData) {
                    const validColumns = TABLE_SCHEMAS[table];
                    const cleanData = {};

                    validColumns.forEach(col => {
                        if (finalData[col] !== undefined) {
                            cleanData[col] = finalData[col];
                        }
                    });

                    finalData = cleanData;
                }

                if (targetId && finalData && !finalData.id && conflictTarget === 'id') {
                    finalData.id = targetId;
                }

                query = supabase.from(table).upsert(finalData, { onConflict: conflictTarget });
            } else if (action === 'delete') {
                query = supabase.from(table).delete().eq('id', targetId);
            }

            const { error } = await query;
            if (error) {
                console.error(`🛑 [Sync] Error on ${table} (${action}):`, error.message, '| Payload:', finalData || targetId);

                // Track user-visible error (ignore common network things)
                const errorMsg = error.message || "Unknown error";
                if (!errorMsg.includes('FetchError') && !errorMsg.includes('Network Error')) {
                    if (!this.errors.find(e => e.message === errorMsg)) {
                        this.errors.push({
                            id: Date.now(),
                            table,
                            action,
                            message: errorMsg,
                            timestamp: new Date().toISOString()
                        });
                        this.notifyListeners();
                    }
                }

                if (error.message?.includes('FetchError') || error.message?.includes('Network Error')) {
                    this.lastSuccess = 0;
                }
                return false;
            }
            console.log(`✅ [Sync] Success on ${table} (${action})`);
            this.lastSuccess = Date.now();
            this.notifyListeners();
            return true;
        } catch (e) {
            console.error("Sync exception:", e);
            this.lastSuccess = 0;
            this.notifyListeners();
            return false;
        }
    }

    getErrors() {
        return this.errors || [];
    }

    clearErrors() {
        this.errors = [];
        this.notifyListeners();
    }

    notifyListeners() {
        this.listeners.forEach(cb => cb(this.getStatus()));
    }

    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    async checkConnectivity() {
        if (!isSupabaseConfigured()) return false;

        try {
            const health = await checkDbHealth();
            if (health.success) {
                this.lastSuccess = Date.now();
                if (this.queue.length > 0) this.processQueue();
            }
            this.notifyListeners();
            return health.success;
        } catch (e) {
            return false;
        }
    }

    getStatus() {
        const likelyOnline = navigator.onLine || (this.lastSuccess > 0 && (Date.now() - this.lastSuccess < 120000));

        return {
            isOnline: likelyOnline,
            isConfigured: this.isConfigured || isSupabaseConfigured(),
            queueLength: this.queue.length,
            isProcessing: this.isProcessing,
            lastSuccess: this.lastSuccess
        };
    }

    async forceSync() {
        console.log("[Sync] User requested manual sync...");
        await this.checkConnectivity();
        return this.processQueue(true);
    }
}

export const syncService = new SyncService();
