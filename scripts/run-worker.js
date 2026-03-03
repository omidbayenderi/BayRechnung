/**
 * Local DB Worker Runner
 * Use this to process db_outbox_events from your terminal during development.
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error("❌ Missing environment variables! Ensure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function runWorker() {
    console.log("🚀 Starting local DB Worker...");

    try {
        const { data: events, error: fetchError } = await supabase
            .from('db_outbox_events')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: true })
            .limit(10);

        if (fetchError) throw fetchError;

        if (!events || events.length === 0) {
            console.log("📍 No pending events found.");
            return;
        }

        console.log(`📦 Found ${events.length} pending events. Processing...`);

        for (const event of events) {
            console.log(`\n--- Processing Event: ${event.id} ---`);
            console.log(`Entity: ${event.entity}, Op: ${event.operation}`);

            try {
                // Table Mapping
                const tableMapping = {
                    'invoice': 'invoices',
                    'booking': 'appointments',
                    'product': 'products'
                };
                const targetTable = tableMapping[event.entity] || event.entity;

                const finalData = { ...event.payload, user_id: event.tenant_id };
                let dbError = null;

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
                }

                const finalStatus = dbError ? 'permanent_error' : 'done';
                await supabase.from('db_outbox_events').update({
                    status: finalStatus,
                    attempts: (event.attempts || 0) + 1,
                    last_error: dbError?.message || null,
                    updated_at: new Date().toISOString()
                }).eq('id', event.id);

                if (!dbError) {
                    console.log(`✅ SUCCESS: ${event.entity} synchronized.`);
                } else {
                    console.error(`❌ FAILED: ${dbError.message}`);
                }

            } catch (innerErr) {
                console.error(`💥 CRITICAL: ${innerErr.message}`);
            }
        }

        console.log("\n✅ Batch processing complete.");

    } catch (err) {
        console.error("🛑 Worker Exception:", err.message);
    }
}

runWorker();
