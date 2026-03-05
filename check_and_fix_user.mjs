import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkUser() {
    const email = 'devtelpek@gmail.com';
    console.log(`Checking auth.users for ${email}...`);

    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error("Error listing users:", error);
        return;
    }

    const user = users.find(u => u.email === email);

    if (user) {
        console.log("User found in auth.users:");
        console.log(`ID: ${user.id}`);
        console.log(`Email: ${user.email}`);
        console.log(`Metadata:`, user.user_metadata);

        // Now check if they are in public.users
        console.log(`Checking public.users for ID: ${user.id}...`);
        const { data: publicUser, error: publicError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (publicError) {
            console.error("Error checking public.users:", publicError);
        } else if (publicUser) {
            console.log("User found in public.users:", publicUser);
        } else {
            console.log("User NOT found in public.users. Creating record...");
            const { error: insertError } = await supabase
                .from('users')
                .insert({
                    id: user.id,
                    email: user.email,
                    full_name: user.user_metadata?.full_name || 'User',
                    role: 'admin'
                });

            if (insertError) {
                console.error("Error creating public.users record:", insertError);
            } else {
                console.log("public.users record created successfully.");
            }
        }

        // Check subscription
        console.log(`Checking subscriptions for ID: ${user.id}...`);
        const { data: sub, error: subError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

        if (subError) {
            console.error("Error checking subscription:", subError);
        } else if (sub) {
            console.log("Current subscription:", sub);
            if (sub.plan_type === 'premium') {
                console.log("Updating subscription to standard...");
                const { error: updateError } = await supabase
                    .from('subscriptions')
                    .update({ plan_type: 'standard' })
                    .eq('user_id', user.id);

                if (updateError) {
                    console.error("Error updating subscription:", updateError);
                } else {
                    console.log("Subscription updated to standard.");
                }
            }
        } else {
            console.log("No subscription found. Creating standard subscription...");
            const { error: insertSubError } = await supabase
                .from('subscriptions')
                .insert({
                    user_id: user.id,
                    plan_type: 'standard',
                    status: 'active'
                });

            if (insertSubError) {
                console.error("Error creating subscription:", insertSubError);
            } else {
                console.log("Standard subscription created.");
            }
        }

    } else {
        console.log(`User ${email} NOT found in auth.users.`);
    }
}

checkUser();
