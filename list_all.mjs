
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ceqitkloquydkgxwikvk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlcWl0a2xvcXV5ZGtneHdpa3ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMzA0OTMsImV4cCI6MjA4NTkwNjQ5M30.RM606q67oDJ8nuusrSC4QM5UEbtTWChd1DonuWU79uU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkAll() {
    console.log('Listing all records...');

    const { data: subs, error: subError } = await supabase.from('subscriptions').select('*');
    if (subError) console.error('Sub Error:', subError);
    else console.log('All Subscriptions:', subs);

    const { data: profiles, error: profileError } = await supabase.from('users').select('*');
    if (profileError) console.error('Profile Error:', profileError);
    else console.log('All Users:', profiles);
}

checkAll();
