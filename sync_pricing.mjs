import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function syncPricing() {
    console.log('Syncing pricing plans...');

    const plans = [
        {
            plan_id: 'standard',
            name_key: 'standard',
            price_monthly: 19.9,
            price_yearly: 199,
            is_featured: false,
            features: ["unlimitedInvoices", "customerManagement", "basicStock", "multiLanguageInvoices", "emailSupport", "mobileAccess", "pdfExport", "dashboardOverview"]
        },
        {
            plan_id: 'premium',
            name_key: 'premium',
            price_monthly: 79.9,
            price_yearly: 799,
            is_featured: true,
            features: ["everythingInStandard", "advancedReports", "fullStockPOS", "employeeManagement", "appointmentSystem", "websiteBuilder", "prioritySupport", "aiAssistant"]
        },
        {
            plan_id: 'vip',
            name_key: 'vip',
            price_monthly: 149,
            price_yearly: 1490,
            is_featured: false,
            features: ["everythingInPremium", "apiIntegrations", "googleAnalytics", "customDomain"]
        }
    ];

    for (const plan of plans) {
        const { error } = await supabase
            .from('landing_pricing')
            .upsert(plan, { onConflict: 'plan_id' });

        if (error) {
            console.error(`Error upserting ${plan.plan_id}:`, error.message);
        } else {
            console.log(`Successfully synced ${plan.plan_id}`);
        }
    }
}

syncPricing();
