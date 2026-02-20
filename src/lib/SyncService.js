import { supabase, isSupabaseConfigured } from './supabase';

class SyncService {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
        this.listeners = [];

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

        // Listen for online status
        window.addEventListener('online', () => this.processQueue());

        // Periodic check every 30 seconds
        setInterval(() => this.processQueue(), 30000);
    }

    /**
     * Enqueue a database operation
     * @param {string} table - Supabase table name
     * @param {string} action - 'insert', 'update', or 'delete'
     * @param {object} data - The payload
     * @param {string} id - The primary key value (optional for insert)
     */
    enqueue(table, action, data, id = null) {
        const item = {
            id: Date.now() + Math.random(), // internal queue id
            table,
            action,
            data,
            targetId: id,
            timestamp: new Date().toISOString(),
            retryCount: 0
        };

        this.queue.push(item);
        this.saveQueue();

        // Try to process immediately if online
        if (navigator.onLine) {
            this.processQueue();
        }
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

    async processQueue() {
        if (this.isProcessing || !navigator.onLine || !isSupabaseConfigured()) return;
        if (this.queue.length === 0) return;

        this.isProcessing = true;

        // Work on a copy to avoid mutation issues during async calls
        const currentQueue = [...this.queue];

        for (const item of currentQueue) {
            const success = await this.syncItem(item);
            if (success) {
                this.queue = this.queue.filter(q => q.id !== item.id);
                this.saveQueue();
            } else {
                // If one fails, we might want to stop or continue based on error type
                // For now, increment retry and leave in queue
                item.retryCount = (item.retryCount || 0) + 1;
                if (item.retryCount > 10) {
                    // Prevent infinite loops on dead items
                    this.queue = this.queue.filter(q => q.id !== item.id);
                    console.error("Sync item failed too many times:", item);
                    this.saveQueue();
                }
                break; // Stop processing this batch
            }
        }

        this.isProcessing = false;
        this.notifyListeners();
    }

    async syncItem(item) {
        try {
            const { table, action, data, targetId } = item;

            let query;
            if (action === 'insert' || action === 'update') {
                // Use upsert for both to ensure we don't fail on duplicate keys or missing records
                query = supabase.from(table).upsert(data, { onConflict: 'id' });
            } else if (action === 'delete') {
                query = supabase.from(table).delete().eq('id', targetId);
            }

            const { error } = await query;
            if (error) {
                console.error(`Sync error on ${table} (${action}):`, error);
                return false;
            }
            return true;
        } catch (e) {
            console.error("Sync exception:", e);
            return false;
        }
    }

    notifyListeners() {
        this.listeners.forEach(cb => cb({
            queueLength: this.queue.length,
            isProcessing: this.isProcessing
        }));
    }

    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    getStatus() {
        return {
            isOnline: navigator.onLine,
            queueLength: this.queue.length,
            isProcessing: this.isProcessing
        };
    }
}

export const syncService = new SyncService();
