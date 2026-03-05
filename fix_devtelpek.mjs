import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function fixUser(email) {
    console.log('Attempting to fix user:', email);

    // 1. Get User ID from users table (if visible)
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

    if (userError) {
        console.error('User Fetch Error:', userError);
        return;
    }

    if (!userData) {
        console.log('User not found in public.users. They might not have a profile record yet.');
        return;
    }

    console.log('Found User ID:', userData.id);

    // 2. Update subscription to 'standard'
    const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .update({ plan_type: 'standard' })
        .eq('user_id', userData.id)
        .select();

    if (subError) {
        console.error('Subscription Update Error (expected if not owner/service role):', subError);
    } else {
        console.log('Successfully updated subscription:', subData);
    }
}

fixUser('devtelpek@gmail.com');
