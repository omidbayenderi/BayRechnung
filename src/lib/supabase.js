import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ceqitkloquydkgxwikvk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlcWl0a2xvcXV5ZGtneHdpa3ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMzA0OTMsImV4cCI6MjA4NTkwNjQ5M30.RM606q67oDJ8nuusrSC4QM5UEbtTWChd1DonuWU79uU';

console.log('[Supabase] Env Check:', {
    hasURL: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlStart: supabaseUrl ? supabaseUrl.substring(0, 15) : 'NONE',
    keyStart: supabaseAnonKey ? supabaseAnonKey.substring(0, 5) : 'NONE'
});

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables are missing! Projects must have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

// Custom storage wrapper to handle potential Navigator LockManager issues
const customStorage = {
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
    removeItem: (key) => localStorage.removeItem(key),
};

// Ensure we don't pass undefined/null to createClient which would cause a crash
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            storage: customStorage, // Using direct storage skip complex locking in some versions
            detectSessionInUrl: true,
            autoRefreshToken: true,
            flowType: 'pkce'
        }
    })
    : null;

/**
 * Perform a lock-free health check on the database.
 * This avoids Navigator LockManager timeouts associated with auth.getSession().
 */
export const checkDbHealth = async () => {
    if (!supabase) return { success: false, error: 'Client not initialized' };
    try {
        // Use a timeout for the health check itself
        const checkPromise = supabase.from('users').select('count', { count: 'exact', head: true }).limit(0);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 5000));

        const { error } = await Promise.race([checkPromise, timeoutPromise]);
        if (error) {
            console.error('[Supabase Doctor] Health check error:', error);
            return { success: false, error: error.message };
        }
        return { success: true };
    } catch (e) {
        console.error('[Supabase Doctor] Diagnostic error:', e);
        return { success: false, error: e.message };
    }
};

export const isSupabaseConfigured = () => {
    return !!supabase && !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== 'https://your-project.supabase.co';
};
