const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ceqitkloquydkgxwikvk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlcWl0a2xvcXV5ZGtneHdpa3ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMzA0OTMsImV4cCI6MjA4NTkwNjQ5M30.RM606q67oDJ8nuusrSC4QM5UEbtTWChd1DonuWU79uU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
    console.log('--- Checking db_outbox_events schema ---');
    const { data, error } = await supabase.from('db_outbox_events').select('*').limit(1);

    if (error) {
        console.error('Error fetching db_outbox_events:', error.message);
    } else {
        if (data && data.length > 0) {
            console.log('Columns:', Object.keys(data[0]));
        } else {
            console.log('No data found. Probing column names...');
            // Try to select common columns
            const { error: probeError } = await supabase.from('db_outbox_events').select('id, task_type, status, payload, created_at, processed_at');
            if (probeError) {
                console.log('Probe failed:', probeError.message);
            } else {
                console.log('Columns [id, task_type, status, payload, created_at, processed_at] exist.');
            }
        }
    }
}

checkSchema();
