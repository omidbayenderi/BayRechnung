import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePricing() {
    console.log('Updating Landing Pricing with UUIDs...');

    // 1. Standard
    const { error: e1 } = await supabase.from('landing_pricing').upsert({
        id: '7a0c066a-092c-430c-b88b-248867283060',
        plan_id: 'standard',
        name_key: 'standard',
        price_monthly: 19.9,
        price_yearly: 199,
        is_featured: false,
        features: ["unlimitedInvoices", "customerManagement", "basicStock", "multiLanguageInvoices", "emailSupport", "mobileAccess", "pdfExport", "dashboardOverview"]
    });
    if (e1) console.error('E1:', e1);

    // 2. Premium (Featured)
    const { error: e2 } = await supabase.from('landing_pricing').upsert({
        id: '4cef1e07-6ec8-4532-a0fa-a0f277d7a7c4',
        plan_id: 'premium',
        name_key: 'premium',
        price_monthly: 79.9,
        price_yearly: 799,
        is_featured: true,
        features: ["everythingInStandard", "advancedReports", "fullStockPOS", "employeeManagement", "appointmentSystem", "websiteBuilder", "prioritySupport", "aiAssistant"]
    });
    if (e2) console.error('E2:', e2);

    // 3. VIP (Insert new if not exists, but I'll use upsert without ID for now or find if it exists)
    // Actually, I'll just use the plan_id to find if it exists, or just insert.
    const { data: vipData } = await supabase.from('landing_pricing').select('id').eq('plan_id', 'vip').single();

    const { error: e3 } = await supabase.from('landing_pricing').upsert({
        id: vipData?.id,
        plan_id: 'vip',
        name_key: 'vip',
        price_monthly: 149,
        price_yearly: 1490,
        is_featured: false,
        features: ["everythingInPremium", "apiIntegrations", "googleAnalytics", "customDomain"]
    });
    if (e3) console.error('E3:', e3);

    console.log('Update Complete!');
}

updatePricing();
