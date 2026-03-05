// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 1. Authenticate the user
        const authHeader = req.headers.get('Authorization')!;
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !user) throw new Error('Unauthorized');

        // Security Check: Don't allow deleting specific system admins if needed
        const protectedEmails = ['admin@bayrechnung.com', 'admin@bayzenit.com'];
        if (protectedEmails.includes(user.email?.toLowerCase())) {
            throw new Error('System administrators cannot be deleted via API. Please contact support.');
        }

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        console.log(`Deleting account for user: ${user.id} (${user.email})`);

        // 2. Clean up Stripe if applicable
        // This is a "nice to have" - we would need to fetch the customer ID 
        // and delete it from Stripe. Skipping for now to focus on DB safety.

        // 3. Delete from Auth.Users (Cascades to public.users and then to all related tables via FKs)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

        if (deleteError) throw deleteError;

        return new Response(
            JSON.stringify({ success: true, message: 'Account deleted successfully' }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );

    } catch (error) {
        console.error('Delete Account Error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
});
