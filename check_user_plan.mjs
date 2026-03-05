
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ceqitkloquydkgxwikvk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlcWl0a2xvcXV5ZGtneHdpa3ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMzA0OTMsImV4cCI6MjA4NTkwNjQ5M30.RM606q67oDJ8nuusrSC4QM5UEbtTWChd1DonuWU79uU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkUser(email) {
    console.log(`Checking user records for: ${email}`);

    // Check company_settings
    const { data: companyData, error: companyError } = await supabase
        .from('company_settings')
        .select('*')
        // email might not be in company_settings, but we can try to search in fields
        .or(`email.eq.${email},owner.eq.${email}`);

    if (companyError) {
        console.error('Error fetching company:', companyError);
    } else if (companyData && companyData.length > 0) {
        console.log('Company Records Found:', companyData);

        // Search subscriptions by user_id from company
        for (const company of companyData) {
            const { data: subData } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', company.user_id)
                .maybeSingle();
            console.log(`Subscription for user ${company.user_id}:`, subData);
        }
    } else {
        console.log('No company records found by email.');
    }

    // Try to list first 5 users to see schema/content
    const { data: recentUsers } = await supabase.from('users').select('*').limit(5);
    console.log('Recent Users in table:', recentUsers);
}

checkUser('devtelpek@gmail.com');
