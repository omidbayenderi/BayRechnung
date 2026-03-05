import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listUsers() {
    console.log("Listing all users in public.users...");
    const { data, error } = await supabase.from('users').select('*');

    if (error) {
        console.error("Error listing users:", error);
        return;
    }

    console.log(`Found ${data.length} users:`);
    console.table(data.map(u => ({ id: u.id, email: u.email, full_name: u.full_name, role: u.role })));

    console.log("\nListing all subscriptions...");
    const { data: subs, error: subError } = await supabase.from('subscriptions').select('*');
    if (subError) {
        console.error("Error listing subscriptions:", subError);
    } else {
        console.log(`Found ${subs.length} subscriptions:`);
        console.table(subs);
    }
}

listUsers();
