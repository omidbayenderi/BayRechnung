import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Use SERVICE ROLE to bypass RLS
);

async function fixUser(email) {
    console.log('--- ADMIN SERVICE ROLE FIX ---');
    console.log('Target:', email);

    // 1. Check public.users
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

    if (userError) {
        console.error('Error fetching user:', userError);
        return;
    }

    if (!user) {
        console.log('User not found in public.users. They might be in auth.users only.');
        // We can't easily query auth.users without admin API, but maybe the profile just doesn't exist.
        // Let's try to list all profiles to see what we HAVE.
        const { data: allUsers } = await supabase.from('users').select('email, id');
        console.log('Existing profiles in public.users:', allUsers.map(u => u.email).join(', '));
        return;
    }

    console.log('Found user profile:', user.id);

    // 2. Set subscription to standard
    const { data: sub, error: subError } = await supabase
        .from('subscriptions')
        .upsert({
            user_id: user.id,
            plan_type: 'standard',
            status: 'active',
            updated_at: new Date().toISOString()
        })
        .select();

    if (subError) {
        console.error('Error updating subscription:', subError);
    } else {
        console.log('SUCCESS: Plan set to standard for', email);
        console.log('Result:', sub);
    }
}

fixUser('devtelpek@gmail.com');
