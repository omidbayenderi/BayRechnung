import { supabase } from './supabase';
import { reportToOrchestrator } from './orchestratorHelper';

/**
 * DB_AGENT_PATCH: Standardized Outbox Enqueue function
 * Instead of writing directly to tables, use this to ensure reliability.
 */
export const enqueueDbEvent = async ({
    app,            // 'invoice' | 'pos' | 'booking' | 'site' | 'admin'
    entity,         // 'invoice', 'product', etc.
    operation,      // 'create', 'update', 'delete'
    payload,
    tenantId,
    userId = null,
    correlationId = null
}) => {
    // DB_AGENT_PATCH: Invariant Validation
    if (!app || !entity || !operation || !payload || !tenantId) {
        const missing = Object.entries({ app, entity, operation, payload, tenantId })
            .filter(([_, v]) => !v).map(([k]) => k);

        throw new Error(`[DB_AGENT] Missing required fields: ${missing.join(', ')}`);
    }

    try {
        const { data, error } = await supabase
            .from('db_outbox_events')
            .insert([{
                app,
                entity,
                operation,
                payload,
                tenant_id: tenantId,
                user_id: userId,
                correlation_id: correlationId || `trace_${Date.now()}`,
                status: 'pending'
            }])
            .select()
            .single();

        if (error) throw error;

        console.log(`[DB_AGENT] Event enqueued: ${entity}:${operation} (ID: ${data.id})`);
        return { success: true, eventId: data.id };

    } catch (err) {
        // DB_AGENT_PATCH: Report failure to Orchestrator
        reportToOrchestrator('db_agent_enqueue_failed', {
            app, entity, operation, error: err.message, tenantId
        });

        console.error("[DB_AGENT] Failed to enqueue event:", err);
        throw err; // Re-throw so UI can handle it
    }
};
