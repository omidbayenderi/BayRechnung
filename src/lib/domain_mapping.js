import { supabase } from './supabase';

/**
 * Detects the current tenant based on the hostname.
 * Supports: 
 * 1. Subdomains (e.g., companyA.bayzenit.com)
 * 2. Custom domains (e.g., portal.companya.de)
 */
export const getTenantFromDomain = async () => {
    const hostname = window.location.hostname;

    // Skip for localhost during dev
    if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
        return null;
    }

    // Try to find matching company settings
    const { data: settings, error } = await supabase
        .from('company_settings')
        .select('*')
        .or(`subdomain.eq.${hostname.split('.')[0]},custom_domain.eq.${hostname}`)
        .single();

    if (error || !settings) {
        console.warn('Tenant not found for domain:', hostname);
        return null;
    }

    return settings;
};

export const getDnsInstructions = (domain) => {
    return [
        { type: 'A', name: '@', value: '76.76.21.21' }, // Vercel IP (example)
        { type: 'CNAME', name: 'www', value: 'cname.bayzenit.com' }
    ];
};
