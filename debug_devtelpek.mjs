import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkUser(email) {
    console.log('Checking user:', email);

    // 1. Check users table
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

    if (userError) console.error('User Error:', userError);
    else console.log('User Record:', userData);

    if (userData) {
        // 2. Check subscriptions table
        const { data: subData, error: subError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userData.id)
            .maybeSingle();

        if (subError) console.error('Subscription Error:', subError);
        else console.log('Subscription Record:', subData);

        // 3. Check company_settings table
        const { data: companyData, error: companyError } = await supabase
            .from('company_settings')
            .select('*')
            .eq('user_id', userData.id)
            .maybeSingle();

        if (companyError) console.error('Company Settings Error:', companyError);
        else console.log('Company Settings Record:', companyData);
    } else {
        console.log('No user found with this email in the public.users table.');

        // Maybe checking auth.users via RPC or just logging it doesn't exist
    }
}

const targetEmail = process.argv[2] || 'devtelpek@gmail.com';
checkUser(targetEmail);
