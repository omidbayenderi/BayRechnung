import { enqueueDbEvent } from './lib/dbAgentClient';

/**
 * DB_AGENT_PATCH: End-to-End Test for DB Agent architecture.
 * Enqueues a dummy event to 'invoices' via the outbox.
 */
export const runDbAgentTest = async (currentUserId) => {
    if (!currentUserId) {
        console.warn("⚠️ [Test] No user ID provided. Please log in first.");
        return;
    }

    console.log("🚀 [Test] DB Agent Test Started...");

    const testPayload = {
        invoice_number: `E2E-${Math.floor(Math.random() * 10000)}`,
        customer_name: "BayZenit Test User",
        total: 1250.50,
        currency: 'EUR',
        status: 'draft',
        issue_date: new Date().toISOString()
    };

    try {
        // Step 1: Enqueue event in Supabase outbox table
        const result = await enqueueDbEvent({
            app: 'invoice',
            entity: 'invoice',
            operation: 'create',
            payload: testPayload,
            tenantId: currentUserId,
            correlationId: `test_trace_${Date.now()}`
        });

        console.log("✅ [Test] Step 1: Event successfully written to Supabase outbox. ID:", result.eventId);
        console.log("👉 [Test] Step 2: Now trigger the Vercel endpoint: /api/db-worker");

        return result;
    } catch (err) {
        console.error("❌ [Test] Step 1 FAILED:", err.message);
    }
};
