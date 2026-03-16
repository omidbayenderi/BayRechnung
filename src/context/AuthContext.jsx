import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
const useMemo = React.useMemo;
const useCallback = React.useCallback;
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { storageService } from '../lib/StorageService';

const AuthContext = createContext();

// Platform owner emails that always get admin role as an emergency fallback
// (only used when DB query fails — normal flow uses the 'role' column)
const PLATFORM_ADMIN_EMAILS = ['admin@bayrechnung.com', 'admin@bayzenit.com'];

export const AuthProvider = ({ children }) => {
    // 1. RECOVERY: Synchronously restore session from localStorage to avoid loading flicker
    const getInitialSession = () => {
        try {
            const authKey = Object.keys(localStorage).find(
                key => key.includes('auth-token') && key.includes('sb-')
            );
            if (authKey) return JSON.parse(localStorage.getItem(authKey));
        } catch (e) { return null; }
        return null;
    };

    const initialSession = getInitialSession();

    const [currentUser, setCurrentUser] = useState(() => {
        if (initialSession?.user) {
            // Skeleton — real role will come from DB
            return {
                id: initialSession.user.id,
                email: initialSession.user.email,
                role: 'worker', // safe default until DB responds
                plan: 'free',
                isSkeleton: true,
                authMode: 'cloud'
            };
        }
        return null;
    });

    const [session, setSession] = useState(initialSession);
    const [loading, setLoading] = useState(!initialSession);
    const isUpdating = useRef(false);
    const isInitializing = useRef(false); // prevents race condition on init
    const currentUserRef = useRef(null);
    const [useSupabase] = useState(isSupabaseConfigured());

    // Keep ref in sync with state
    useEffect(() => {
        currentUserRef.current = currentUser;
    }, [currentUser]);

    // userMeta = session.user.user_metadata (company_name, industry stored at signup)
    const fetchUserData = useCallback(async (userId, userEmail = '', retryCount = 0, userMeta = {}) => {
        if (!userId) return null;

        try {
            if (retryCount === 0) {
                const { wakeUp } = await import('../lib/supabase');
                wakeUp();
            }

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Fetch timeout')), 45000)
            );

            const profileReq = supabase.from('users').select('*').eq('id', userId).single();
            const subReq = supabase.from('subscriptions').select('*').eq('user_id', userId).maybeSingle();

            const [profileRes, subRes] = await Promise.race([
                Promise.all([profileReq, subReq]),
                timeoutPromise
            ]);

            const email = profileRes.data?.email || userEmail || '';

            // Role comes ONLY from DB. Email check is a last-resort fallback for platform owners.
            const dbRole = profileRes.data?.role;
            const isPlatformAdmin = PLATFORM_ADMIN_EMAILS.includes(email.toLowerCase());
            const role = dbRole || (isPlatformAdmin ? 'admin' : 'worker');

            let defaultName = 'User';
            if (email) {
                const first = email.split('@')[0].split('.')[0];
                if (first) defaultName = first.charAt(0).toUpperCase() + first.slice(1);
            }

            const data = {
                id: userId,
                email,
                name: profileRes.data?.full_name || defaultName,
                avatar: profileRes.data?.avatar_url,
                role,
                plan: (isPlatformAdmin || subRes.data?.plan_type === 'premium') ? 'premium' : (subRes.data?.plan_type || 'free'),
                subscriptionStatus: subRes.data?.status || 'active',
                currentPeriodEnd: subRes.data?.current_period_end,
                cancelAtPeriodEnd: subRes.data?.cancel_at_period_end,
                stripeCustomerId: subRes.data?.stripe_customer_id,
                // Company info from auth metadata (set at signup) — full details live in InvoiceContext.companyProfile
                companyName: userMeta.company_name || 'My Company',
                industry: userMeta.industry || 'general',
                isSupabase: true,
                authMode: 'cloud',
                isSkeleton: false
            };

            // Patch any queued offline items with the real user ID
            import('../lib/SyncService').then(({ syncService }) => {
                syncService.patchUserId(userId);
            }).catch(() => {});

            return data;
        } catch (err) {
            console.error('[Auth] fetchUserData error:', err.message);

            if (err.message === 'Fetch timeout' && retryCount < 1) {
                return fetchUserData(userId, userEmail, retryCount + 1, userMeta);
            }

            const isPlatformAdmin = PLATFORM_ADMIN_EMAILS.includes(userEmail?.toLowerCase());
            return {
                id: userId,
                email: userEmail,
                name: isPlatformAdmin ? 'Admin' : 'User',
                role: isPlatformAdmin ? 'admin' : 'worker',
                dbError: err.message === 'Fetch timeout' ? 'TIMEOUT' : 'CONNECTION_ERROR',
                isSkeleton: false,
                authMode: 'cloud',
                isTimeout: err.message === 'Fetch timeout'
            };
        }
    }, []);

    // 2. Auth lifecycle
    useEffect(() => {
        if (!useSupabase) {
            setLoading(false);
            return;
        }

        const initializeAuth = async () => {
            isInitializing.current = true;
            const { data: { session: activeSession } } = await supabase.auth.getSession();
            if (activeSession) {
                setSession(activeSession);
                const userData = await fetchUserData(activeSession.user.id, activeSession.user.email, 0, activeSession.user.user_metadata);
                setCurrentUser({ ...userData, authMode: 'cloud' });
            }
            setLoading(false);
            isInitializing.current = false;
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            setSession(newSession);

            if (event === 'SIGNED_IN' && newSession) {
                // Skip if initializeAuth already handled this session (race condition guard)
                if (isInitializing.current || isUpdating.current) return;
                const userData = await fetchUserData(newSession.user.id, newSession.user.email, 0, newSession.user.user_metadata);
                setCurrentUser({ ...userData, authMode: 'cloud' });

            } else if (event === 'SIGNED_OUT') {
                setCurrentUser(null);
                setSession(null);

            } else if (event === 'USER_UPDATED' && newSession) {
                const userData = await fetchUserData(newSession.user.id, newSession.user.email, 0, newSession.user.user_metadata);
                setCurrentUser({ ...userData, authMode: 'cloud' });
            }

            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [useSupabase, fetchUserData]);

    // 3. Security logging
    const logSecurityAction = useCallback(async (action, entityType = 'security', entityId = null, metadata = {}, severity = 'info') => {
        if (!useSupabase || !currentUserRef.current) return;
        try {
            await supabase.from('audit_logs').insert({
                user_id: currentUserRef.current.id,
                action,
                entity_type: entityType,
                entity_id: entityId,
                metadata,
                severity,
                source: metadata.source || 'Standard_Auth_Logger'
            });
        } catch (err) {
            console.warn('[Audit] Failed to log security action:', err.message);
        }
    }, [useSupabase]);

    const login = useCallback(async (emailInput, password) => {
        const email = emailInput.toLowerCase().trim();

        if (!useSupabase) {
            return { success: false, error: 'Database connection offline. Please check your configuration.' };
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (!error && data?.user) {
                setSession(data.session);
                const userData = await fetchUserData(data.user.id, data.user.email, 0, data.user.user_metadata);
                setCurrentUser({ ...userData, authMode: 'cloud' });
                logSecurityAction('USER_LOGIN', 'users', data.user.id, { email, status: 'SUCCESS' });
                return { success: true };
            }
            if (error) return { success: false, error: error.message };
        } catch (err) {
            console.error('[Auth] Login exception:', err);
            return { success: false, error: 'Sunucuya bağlanılamadı.' };
        }

        return { success: false, error: 'Invalid credentials' };
    }, [useSupabase, logSecurityAction, fetchUserData]);

    const register = useCallback(async (regData) => {
        const email = regData.email.toLowerCase().trim();
        const password = regData.password;

        if (!useSupabase) {
            return { success: false, error: 'Database connection offline. Registration requires an active connection.' };
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: regData.name,
                        company_name: regData.companyName,
                        industry: regData.industry || 'general'
                    }
                }
            });

            if (error) throw error;
            if (!data?.user) throw new Error('No user returned from signup');

            try {
                await supabase.from('users').upsert({
                    id: data.user.id,
                    email,
                    full_name: regData.name,
                    role: 'admin'
                });
            } catch (e) { console.warn('[Auth] users table upsert failed:', e.message); }

            const dbSupportedIndustries = [
                'automotive', 'general', 'construction', 'gastronomy',
                'healthcare', 'it', 'retail', 'crafts', 'consulting', 'education'
            ];
            const safeIndustry = dbSupportedIndustries.includes(regData.industry) ? regData.industry : 'general';

            try {
                await supabase.from('company_settings').upsert({
                    user_id: data.user.id,
                    company_name: regData.companyName,
                    industry: safeIndustry,
                    phone: regData.phone || '',
                    street: regData.street || '',
                    city: regData.city || '',
                    postal_code: regData.zip || '',
                    address: `${regData.street || ''} ${regData.city || ''}`.trim()
                });
            } catch (e) { console.warn('[Auth] company_settings upsert failed:', e.message); }

            try {
                await supabase.from('subscriptions').upsert({
                    user_id: data.user.id,
                    plan_type: regData.plan || 'standard',
                    status: 'active'
                });
            } catch (e) { console.warn('[Auth] subscriptions upsert failed:', e.message); }

            return { success: true, data };
        } catch (err) {
            console.error('[Auth] Signup error:', err.message);
            return { success: false, error: err.message };
        }
    }, [useSupabase]);

    const logout = useCallback(async () => {
        try {
            if (useSupabase) {
                const signOutPromise = supabase.auth.signOut();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('SignOut Timeout')), 2000)
                );
                await Promise.race([signOutPromise, timeoutPromise])
                    .catch(err => console.warn('[Auth] SignOut timed out:', err.message));
            }
        } finally {
            setCurrentUser(null);
            setSession(null);
            localStorage.removeItem('bay_current_user');
            localStorage.removeItem('bay_is_mock');
            Object.keys(localStorage).forEach(key => {
                if (key.includes('auth-token') || key.includes('sb-')) {
                    localStorage.removeItem(key);
                }
            });
        }
        return { success: true };
    }, [useSupabase]);

    const updateUser = useCallback(async (updatedData) => {
        if (!useSupabase) return { success: false, error: 'Offline mode' };

        try {
            isUpdating.current = true;
            const { data: { session: activeSession } } = await supabase.auth.getSession();
            if (!activeSession) throw new Error('Auth session missing or expired. Please re-login.');

            const userId = activeSession.user.id;
            let avatarUrl = updatedData.avatar;
            if (updatedData.avatarFile instanceof File) {
                const uploadRes = await storageService.uploadAvatar(userId, updatedData.avatarFile);
                if (uploadRes.success) avatarUrl = uploadRes.url;
            }

            supabase.auth.updateUser({ data: { full_name: updatedData.name, avatar: avatarUrl } })
                .catch(e => console.warn('[Auth] Metadata sync failed:', e.message));

            const roleMap = { 'Administrator': 'admin', 'Manager': 'site_lead', 'Accountant': 'finance', 'Employee': 'worker' };
            const normalizedRole = roleMap[updatedData.role] || updatedData.role || currentUserRef.current?.role;

            const { syncService: liveSyncService } = await import('../lib/SyncService');
            liveSyncService.enqueue('users', 'update', {
                id: userId,
                email: updatedData.email || currentUserRef.current?.email,
                full_name: updatedData.name,
                avatar_url: avatarUrl,
                role: normalizedRole
            }, userId);

            setCurrentUser({
                ...currentUserRef.current,
                ...updatedData,
                avatar: avatarUrl,
                role: normalizedRole,
                id: userId
            });

            return { success: true };
        } catch (err) {
            console.error('[Auth] Profile Update Failed:', err);
            return { success: false, error: err.message };
        } finally {
            isUpdating.current = false;
        }
    }, [useSupabase]);

    const subscriptionNotice = useMemo(() => {
        if (!currentUser?.currentPeriodEnd) return null;

        const diffDays = Math.ceil((new Date(currentUser.currentPeriodEnd) - new Date()) / 86400000);

        if (currentUser.subscriptionStatus === 'past_due') {
            return { type: 'error', message: 'Ödeme başarısız oldu. Lütfen ödeme yönteminizi güncelleyin.', action: 'manage' };
        }
        if (currentUser.subscriptionStatus === 'trialing' && diffDays <= 3 && diffDays > 0) {
            return { type: 'warning', message: `Deneme süreniz ${diffDays} gün içinde bitecek. Devam etmek için ödeme yöntemi ekleyin.`, action: 'upgrade' };
        }
        if (diffDays <= 3 && diffDays > 0 && !currentUser.cancelAtPeriodEnd) {
            return { type: 'info', message: `Aboneliğiniz ${diffDays} gün içinde yenilecek.`, action: 'none' };
        }
        return null;
    }, [currentUser]);

    const authValue = useMemo(() => ({
        currentUser,
        session,
        login,
        logout,
        updateUser,
        register,
        deleteAccount: async () => {
            if (useSupabase) {
                try {
                    const { error } = await supabase.functions.invoke('delete-account', { body: {} });
                    if (error) throw error;
                    await logout();
                    return { success: true };
                } catch (err) {
                    console.error('[Auth] Account deletion failed:', err);
                    return { success: false, error: err.message };
                }
            }
            setCurrentUser(null);
            localStorage.removeItem('bay_current_user');
            return { success: true };
        },
        isAuthenticated: !!currentUser,
        loading,
        useSupabase,
        subscriptionNotice,
        sendPasswordReset: async (email) => {
            if (!useSupabase) return { success: false, error: 'Offline' };
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            });
            return error ? { success: false, error: error.message } : { success: true };
        },
        logSecurityAction
    }), [currentUser, session, loading, useSupabase, subscriptionNotice, login, logout, logSecurityAction, register, updateUser]);

    return (
        <AuthContext.Provider value={authValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
