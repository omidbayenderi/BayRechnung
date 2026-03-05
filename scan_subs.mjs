import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function scanSubscriptions() {
    console.log('Scanning subscriptions...');
    const { data, error } = await supabase
        .from('subscriptions')
        .select('*');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Found', data.length, 'subscriptions.');
        console.log(data);
    }
}

scanSubscriptions();
