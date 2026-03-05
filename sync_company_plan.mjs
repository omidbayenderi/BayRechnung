import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function syncCompanyPlan() {
    const userId = '45ed21b3-5032-4325-9826-386b256c81a3';
    console.log(`Syncing company_settings plan for user: ${userId}...`);

    const { data, error } = await supabase
        .from('company_settings')
        .update({ plan: 'standard' })
        .eq('user_id', userId);

    if (error) {
        console.error("Error updating company_settings:", error);
    } else {
        console.log("Successfully updated company_settings plan to standard.");
    }
}

syncCompanyPlan();
