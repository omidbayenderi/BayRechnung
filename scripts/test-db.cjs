const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function check() {
    console.log('Testing connection to:', url);

    // Test Read
    const { data: readData, error: readError } = await supabase.from('users').select('count', { count: 'exact', head: true }).limit(0);
    if (readError) {
        console.error('READ ERROR:', readError.message, readError.code);
    } else {
        console.log('READ SUCCESS');
    }

    // Test specific table used in health check
    const { data: settingsData, error: settingsError } = await supabase.from('company_settings').select('count', { count: 'exact', head: true }).limit(0);
    if (settingsError) {
        console.error('COMPANY_SETTINGS ERROR:', settingsError.message, settingsError.code);
    } else {
        console.log('COMPANY_SETTINGS SUCCESS');
    }

    // Test Write
    const { error: writeError } = await supabase.from('audit_logs').insert({
        action: 'test_write',
        entity_type: 'test',
        metadata: { ts: Date.now() }
    });
    if (writeError) {
        console.error('WRITE ERROR:', writeError.message, writeError.code);
    } else {
        console.log('WRITE SUCCESS');
    }
}

check();
