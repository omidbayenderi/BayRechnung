import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function findUser() {
    const email = 'devtelpek@gmail.com';
    console.log(`Searching for ${email} in public tables...`);

    const tables = ['company_settings', 'staff', 'invoices', 'quotes', 'daily_reports'];

    for (const table of tables) {
        console.log(`Checking table: ${table}...`);
        const { data, error } = await supabase.from(table).select('*').eq('email', email);
        if (!error && data && data.length > 0) {
            console.log(`FOUND in ${table}:`, data[0]);
            console.log(`User ID is: ${data[0].user_id || data[0].id}`);
            return;
        }
    }

    console.log("Searching for user ID via company_settings name search (fuzzy)...");
    // Maybe they used a different email in profile?

    console.log("NOT FOUND in any scanned table.");
}

findUser();
