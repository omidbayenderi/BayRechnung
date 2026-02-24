import { supabase, isSupabaseConfigured, checkDbHealth } from './supabase';

class SyncService {
    constructor() {
        this.queue = [];
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

    /**
     * Enqueue a database operation
     * @param {string} table - Supabase table name
     * @param {string} action - 'insert', 'update', or 'delete'
     * @param {object} data - The payload
     * @param {string} id - The primary key value (optional for insert)
     */
    enqueue(table, action, data, id = null) {
        // Consolidate: If there's already a pending operation for this specific record, 
        // update it instead of adding a new one to prevent queue bloating.
        const recordId = id || data?.id;
        const userId = data?.user_id || data?.userId;

        // SKIP sync for mock/demo users - they exist locally only
        if (userId && (String(userId).startsWith('0000'))) {
            console.log(`[Sync] Skipping enqueue for mock record on ${table}`);
            return;
        }

        // Consolidation Logic
        // For tables identify by 'id', look for matching id
        // For settings tables, look for matching user_id
        const settingsTables = ['company_settings', 'appointment_settings', 'stock_settings', 'invoice_customization'];
        const isSettingsTable = settingsTables.includes(table);

        if (action === 'insert' || action === 'update') {
            const existingIndex = this.queue.findIndex(q => {
                if (q.table !== table) return false;
                if (q.action !== 'insert' && q.action !== 'update') return false;

                if (isSettingsTable) {
                    return (q.data?.user_id === userId || q.data?.userId === userId);
                } else if (recordId) {
                    return (q.targetId === recordId || q.data?.id === recordId);
                }
                return false;
            });

            if (existingIndex !== -1) {
                // Update existing item with latest data
                this.queue[existingIndex].data = { ...this.queue[existingIndex].data, ...data };
                this.queue[existingIndex].timestamp = new Date().toISOString();
                this.saveQueue();
                return;
            }
        }

        const item = {
            id: Date.now() + Math.random(), // internal queue id
            table,
            action,
            data,
            targetId: id || data?.id,
            timestamp: new Date().toISOString(),
            retryCount: 0
        };

        this.queue.push(item);
        this.saveQueue();

        // Debounced trigger for immediate sync
        if (this.processTimer) clearTimeout(this.processTimer);
        this.processTimer = setTimeout(() => {
            if (navigator.onLine) {
                this.processQueue();
            }
        }, 500); // 500ms debounce to group rapid inputs
    }

    /**
     * Patch the user_id for all items in the queue.
     * Useful when transitioning from a mock session to a real Supabase session.
     */
    patchUserId(newUserId) {
        if (!newUserId) return;
        console.log(`[Sync] Patching queue with new user_id: ${newUserId}`);

        let patchedCount = 0;
        this.queue = this.queue.map(item => {
            if (item.data && (item.data.user_id?.startsWith('0000') || !item.data.user_id)) {
                patchedCount++;
                return {
                    ...item,
                    data: { ...item.data, user_id: newUserId }
                };
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

        // Update local bit
        this.isConfigured = true;
        if (this.queue.length === 0) return;

        console.log(`[Sync] Processing queue (${this.queue.length} items, force=${force})...`);
        this.isProcessing = true;
        this.notifyListeners();

        try {
            const BATCH_SIZE = 3;

            while (this.queue.length > 0 && (navigator.onLine || force)) {
                const batch = this.queue.slice(0, BATCH_SIZE);

                const results = await Promise.all(batch.map(async (item) => {
                    const success = await this.syncItem(item);
                    return { itemId: item.id, success };
                }));

                for (const res of results) {
                    if (res.success) {
                        this.queue = this.queue.filter(q => q.id !== res.itemId);
                    } else {
                        const itemInQueue = this.queue.find(q => q.id === res.itemId);
                        if (itemInQueue) {
                            itemInQueue.retryCount = (itemInQueue.retryCount || 0) + 1;

                            if (itemInQueue.retryCount > 20) {
                                console.error("[Sync] Item reached max retries:", itemInQueue);
                                const deadQueue = JSON.parse(localStorage.getItem('bay_dead_sync_queue') || '[]');
                                deadQueue.push({ ...itemInQueue, retiredAt: new Date().toISOString() });
                                localStorage.setItem('bay_dead_sync_queue', JSON.stringify(deadQueue.slice(-50)));
                                this.queue = this.queue.filter(q => q.id !== res.itemId);
                            }
                        }
                    }
                }

                this.saveQueue();

                if (results.some(r => !r.success)) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
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

            let query;
            if (action === 'insert' || action === 'update') {
                // Use upsert for both to ensure we don't fail on duplicate keys or missing records
                // Important: conflict target depends on the table schema
                let conflictTarget = 'id';
                if (['company_settings', 'appointment_settings', 'stock_settings', 'invoice_customization'].includes(table)) {
                    conflictTarget = 'user_id';
                }

                if (table === 'company_settings' && data) {
                    // All industries allowed
                }

                // --- SCHEMA SAFETY LAYER ---
                // Strip fields that might be missing in some DB environments to prevent total sync failure
                const tableSchemas = {
                    services: ['id', 'user_id', 'name', 'description', 'duration', 'price', 'color', 'created_at'], // Keep description
                    products: ['id', 'user_id', 'name', 'category', 'price', 'stock', 'min_stock', 'sku', 'image_url', 'created_at', 'updated_at'], // Strip supplier_info
                    staff: ['id', 'user_id', 'name', 'role', 'color', 'created_at'] // Strip title (JS uses role)
                };

                const finalData = { ...data };

                // If it's a known table with potential extra fields, clean it
                if (tableSchemas[table]) {
                    Object.keys(finalData).forEach(key => {
                        if (!tableSchemas[table].includes(key)) {
                            delete finalData[key];
                        }
                    });
                }

                // Temporary fix: If DB is missing columns, strip them before sync
                if (table === 'invoice_customization') {
                    delete finalData.brand_palette;
                    delete finalData.quote_validity_days;
                    delete finalData.signature_url;
                }

                if (targetId && !finalData.id && conflictTarget === 'id') {
                    finalData.id = targetId;
                }

                query = supabase.from(table).upsert(finalData, { onConflict: conflictTarget });
            } else if (action === 'delete') {
                query = supabase.from(table).delete().eq('id', targetId);
            }

            const { error } = await query;
            if (error) {
                console.error(`Sync error on ${table} (${action}):`, error);
                // If it's a real network error, we might be offline
                if (error.message?.includes('FetchError') || error.message?.includes('Network Error')) {
                    this.lastSuccess = 0;
                }
                return false;
            }
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

    // Manual trigger for UI
    async forceSync() {
        console.log("[Sync] User requested manual sync...");
        await this.checkConnectivity();
        return this.processQueue(true);
    }
}

export const syncService = new SyncService();
