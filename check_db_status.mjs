import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ceqitkloquydkgxwikvk.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlcWl0a2xvcXV5ZGtneHdpa3ZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDMzMDQ5MywiZXhwIjoyMDg1OTA2NDkzfQ.TLcKqpwo_-B16Bh5Lp151vf5ovwpXmw-nY-WUXAJzr0";

const supabase = createClient(supabaseUrl, serviceKey);

async function checkDatabase() {
    console.log("--- Supabase Integrity Check ---");

    // 1. Check Tables
    const tables = ['users', 'company_settings', 'subscriptions', 'invoices', 'audit_logs', 'staff', 'projects'];

    for (const table of tables) {
        try {
            const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
            if (error) {
                console.log(`❌ Table [${table}]: ERROR - ${error.message} (${error.code})`);
            } else {
                console.log(`✅ Table [${table}]: EXISTS - Row count: ${count}`);
            }
        } catch (e) {
            console.log(`❌ Table [${table}]: EXCEPTION - ${e.message}`);
        }
    }

    // 2. Check Admin User
    try {
        const { data, error } = await supabase.from('users').select('*').eq('email', 'admin@bayrechnung.com').maybeSingle();
        if (error) {
            console.log(`❌ Admin User Check: ERROR - ${error.message}`);
        } else if (data) {
            console.log(`✅ Admin User: FOUND (ID: ${data.id})`);
        } else {
            console.log(`⚠️ Admin User: NOT FOUND in users table.`);
        }
    } catch (e) {
        console.log(`❌ Admin User Check: EXCEPTION - ${e.message}`);
    }
    // 3. Inspect last 10 audit logs
    try {
        const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(10);
        if (error) {
            console.log(`❌ Audit Logs Fetch: ERROR - ${error.message}`);
        } else {
            console.log("--- Latest Audit Logs ---");
            data.forEach(log => {
                console.log(`[${log.created_at}] ${log.action} - ${log.entity_type}: ${JSON.stringify(log.metadata)}`);
            });
        }
    } catch (e) {
        console.log(`❌ Audit Logs Fetch: EXCEPTION - ${e.message}`);
    }
    // 4. Inspect Invoices
    try {
        const { data, error } = await supabase.from('invoices').select('id, user_id, invoice_number').limit(5);
        if (error) {
            console.log(`❌ Invoices Fetch: ERROR - ${error.message}`);
        } else {
            console.log("--- Latest Invoices ---");
            data.forEach(inv => {
                console.log(`- Inv: ${inv.invoice_number} (Owner: ${inv.user_id})`);
            });
        }
    } catch (e) {
        console.log(`❌ Invoices Fetch: EXCEPTION - ${e.message}`);
    }
}

checkDatabase();
