import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (import.meta.env.DEV) {
    console.log('[Supabase] Env Check:', {
        hasURL: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
    });
}

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
 * Verifies actual internet connectivity by pinging Supabase.
 * Useful for Safari where navigator.onLine can be inaccurate.
 */
export const isPhysicalConnectionAlive = async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return false;
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-store',
            signal: AbortSignal.timeout(3000)
        });
        return true;
    } catch (err) {
        return false;
    }
};

/**
 * Simple ping to wake up a sleeping Supabase project.
 */
export const wakeUp = async () => {
    if (!supabase) return;
    try {
        // HEAD request is minimal but wakes up the PostgREST instance
        await supabase.from('users').select('id', { head: true }).limit(1);
    } catch (e) { /* ignore */ }
};

export const checkDbHealth = async () => {
    if (!supabase) return { success: false, error: 'Client not initialized' };
    try {
        // Increased timeout to 45s for slow networks and cold starts
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 45000));

        // Try a simple query on 'users'
        const checkPromise = supabase.from('users').select('id', { head: true }).limit(1);

        const { error } = await Promise.race([checkPromise, timeoutPromise]);

        if (error) {
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
