import { createClient } from '@supabase/supabase-js';

/**
 * DB_AGENT_PATCH: Vercel Serverless Function (Node.js)
 * Processes db_outbox_events from Supabase and applies changes to actual tables.
 */

// Use Service Role Key for bypassing RLS
const supabase = createClient(
    process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// DB_AGENT_PATCH: Standardized health reporter for Orchestrator
const reportToOrchestrator = async (type, payload) => {
    const ORCHESTRATOR_URL = process.env.AGENT_ORCHESTRATOR_URL;
    if (!ORCHESTRATOR_URL) return;

    try {
        await fetch(ORCHESTRATOR_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, payload: { ...payload, timestamp: new Date().toISOString() } })
        });
    } catch (e) {
        console.error("[Orchestrator] Failed to send report from worker:", e.message);
    }
};

export default async function handler(req, res) {
    // DB_AGENT_PATCH: Optional secret key check for security
    // if (req.headers['x-api-key'] !== process.env.CRON_SECRET) return res.status(401).json({ error: 'Unauthorized' });

    try {
        // 1. Fetch pending items
        const { data: events, error: fetchError } = await supabase
            .from('db_outbox_events')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: true })
            .limit(10);

        if (fetchError) throw fetchError;

        if (!events || events.length === 0) {
            return res.status(200).json({ processedCount: 0, message: "No pending events" });
        }

        const updatedIds = [];
        const errors = [];

        for (const event of events) {
            try {
                // 2. Mark as processing
                await supabase.from('db_outbox_events').update({ status: 'processing' }).eq('id', event.id);

                // 3. Entity Table Mapping
                const tableMapping = {
                    'invoice': 'invoices',
                    'booking': 'appointments',
                    'product': 'products'
                };
                const targetTable = tableMapping[event.entity] || event.entity;

                let dbError = null;

                // 4. Operation Execution
                // Multi-tenant safety: Inject tenant_id as user_id
                const finalData = { ...event.payload, user_id: event.tenant_id };

                if (event.operation === 'create') {
                    const { error } = await supabase.from(targetTable).insert([finalData]);
                    dbError = error;
                } else if (event.operation === 'update') {
                    const recordId = event.payload.id || event.payload.recordId;
                    const { error } = await supabase.from(targetTable)
                        .update(event.payload)
                        .eq('id', recordId)
                        .eq('user_id', event.tenant_id);
                    dbError = error;
                } else if (event.operation === 'delete') {
                    const recordId = typeof event.payload === 'string' ? event.payload : event.payload.id;
                    const { error } = await supabase.from(targetTable)
                        .delete()
                        .eq('id', recordId)
                        .eq('user_id', event.tenant_id);
                    dbError = error;
                }

                // 5. Finalize Status
                // PGRST204 is column not found, permanent error.
                const isPermanent = dbError && (
                    dbError.code === 'PGRST204' || // Column error
                    dbError.code === '42703' ||    // Raw Postgres column error
                    event.attempts >= 5
                );

                const finalStatus = dbError ? (isPermanent ? 'permanent_error' : 'pending') : 'done';

                await supabase.from('db_outbox_events').update({
                    status: finalStatus,
                    attempts: event.attempts + 1,
                    last_error: dbError?.message || null,
                    updated_at: new Date().toISOString()
                }).eq('id', event.id);

                if (!dbError) {
                    updatedIds.push(event.id);
                    reportToOrchestrator('db_agent_event_processed', { id: event.id, entity: event.entity, operation: event.operation });
                } else {
                    errors.push({ id: event.id, error: dbError.message, code: dbError.code });
                    reportToOrchestrator('db_agent_event_error', { id: event.id, isPermanent, error: dbError.message, entity: event.entity });
                }

            } catch (innerErr) {
                errors.push({ id: event.id, error: innerErr.message });
                reportToOrchestrator('db_agent_event_error', { id: event.id, error: innerErr.message });
            }
        }

        // Report batch health
        reportToOrchestrator('db_agent_health', { processed: updatedIds.length, errors: errors.length });

        return res.status(200).json({
            processedCount: updatedIds.length,
            updatedIds,
            errors
        });

    } catch (globalErr) {
        console.error("[DB_WORKER_CRITICAL]", globalErr);
        return res.status(500).json({ error: globalErr.message });
    }
}
