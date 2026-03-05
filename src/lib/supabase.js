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
        // Increased timeout for wake-up/slow networks
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 20000));

        // Try a simple query on 'company_settings' or 'users'
        // Using 'users' as it's the most basic metadata table
        const checkPromise = supabase.from('users').select('id', { head: true }).limit(1);

        const { error } = await Promise.race([checkPromise, timeoutPromise]);

        if (error) {
            // PGRST301: Missing JWT/Auth (DB is alive, just needs login)
            // 42P01: Table not found (DB is alive, schema is wrong)
            if (error.code === 'PGRST301' || error.code === '42P01' || error.message?.includes('JWT')) {
                return { success: true, note: `Alive (${error.code || 'Restricted'})` };
            }
            console.error('[Supabase Doctor] Health check error:', error);
            return { success: false, error: error.message || 'Connection Refused' };
        }
        return { success: true };
    } catch (e) {
        if (e.message === 'DB Timeout') {
            console.warn('[Supabase Doctor] Connection is slow or DB is sleeping.');
            return { success: false, error: 'Timeout (Slow Connection)' };
        }
        console.error('[Supabase Doctor] Diagnostic error:', e);
        return { success: false, error: e.message || 'Unknown Network Error' };
    }
};

export const isSupabaseConfigured = () => {
    return !!supabase && !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== 'https://your-project.supabase.co';
};
