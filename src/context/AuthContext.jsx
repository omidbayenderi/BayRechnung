import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { storageService } from '../lib/StorageService';

const AuthContext = createContext();

// Fallback mock users for when Supabase is not configured
const MOCK_USERS = [
    { id: '00000000-0000-0000-0000-000000000001', email: 'demo@bayrechnung.com', password: 'demo123', name: 'Caner Arslan', plan: 'standard', companyName: 'Arslan İnşaat ve Mimarlık', role: 'admin' },
    { id: '00000000-0000-0000-0000-000000000002', email: 'demo@bayzenit.com', password: 'demo123', name: 'Elif Yılmaz', plan: 'standard', companyName: 'Vizyon Yapı Proje', role: 'admin' },
    { id: '00000000-0000-0000-0000-000000000005', email: 'worker@bayrechnung.com', password: 'demo', name: 'Ahmet Kaya', plan: 'standard', companyName: 'BayRechnung LTD', role: 'worker' }
];

const IS_PROD = import.meta.env.VITE_PROD_MODE === 'true';

export const AuthProvider = ({ children }) => {
    // 1. RECOVERY: Synchronously check for existing session
    const getInitialSession = () => {
        try {
            const authKey = Object.keys(localStorage).find(key => key.includes('auth-token') && key.includes('sb-'));
            if (authKey) return JSON.parse(localStorage.getItem(authKey));
            const simpleAuth = localStorage.getItem('bay-simple-auth');
            if (simpleAuth) return JSON.parse(simpleAuth);
        } catch (e) { return null; }
        return null;
    };

    const initialSession = getInitialSession();

    const [currentUser, setCurrentUser] = useState(() => {
        if (initialSession?.user) {
            const email = initialSession.user.email;
            const isAdmin = ['admin@bayrechnung.com', 'omidbayenderi@gmail.com', 'admin@bayzenit.com'].includes(email?.toLowerCase());
            return {
                id: initialSession.user.id,
                email: email,
                role: isAdmin ? 'admin' : 'worker',
                plan: isAdmin ? 'premium' : 'free',
                isSkeleton: true,
                authMode: 'cloud'
            };
        }
        return null;
    });

    const [session, setSession] = useState(initialSession);
    const [loading, setLoading] = useState(!initialSession);
    // Loading only if NO recovered session
    const isMockSession = useRef(localStorage.getItem('bay_is_mock') === 'true');
    const isUpdating = useRef(false);
    const currentUserRef = useRef(null);
    const [useSupabase, setUseSupabase] = useState(isSupabaseConfigured());

    // Keep ref in sync
    useEffect(() => {
        currentUserRef.current = currentUser;
    }, [currentUser]);

    const fetchUserData = useCallback(async (userId, userEmail = '') => {
        if (!userId) return null;
        console.log('[Auth] Fetching user data for:', userId);
        try {
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Fetch timeout')), 10000));

            const profileReq = supabase.from('users').select('*').eq('id', userId).single();
            const subReq = supabase.from('subscriptions').select('*').eq('user_id', userId).maybeSingle();
            const companyReq = supabase.from('company_settings').select('*').eq('user_id', userId).maybeSingle();

            const [profileRes, subRes, companyRes] = await Promise.race([
                Promise.all([profileReq, subReq, companyReq]),
                timeoutPromise
            ]);

            const email = profileRes.data?.email || userEmail || '';
            const isAdminEmail = ['admin@bayrechnung.com', 'omidbayenderi@gmail.com', 'admin@bayzenit.com'].includes(email.toLowerCase());

            // Determine default name safely
            let defaultName = 'User';
            if (email) {
                const parts = email.split('@')[0].split('.');
                const first = parts[0];
                if (first) {
                    defaultName = first.charAt(0).toUpperCase() + first.slice(1);
                }
            }

            const data = {
                id: userId,
                email: email,
                name: profileRes.data?.full_name || defaultName,
                avatar: profileRes.data?.avatar_url,
                plan: (isAdminEmail || subRes.data?.plan_type === 'premium') ? 'premium' : (subRes.data?.plan_type || 'free'),
                subscriptionStatus: subRes.data?.status || 'active',
                currentPeriodEnd: subRes.data?.current_period_end,
                cancelAtPeriodEnd: subRes.data?.cancel_at_period_end,
                stripeCustomerId: subRes.data?.stripe_customer_id,
                companyName: companyRes.data?.company_name || 'My Company',
                industry: companyRes.data?.industry || 'general',
                phone: companyRes.data?.phone,
                address: companyRes.data?.address,
                city: companyRes.data?.city,
                zip: companyRes.data?.postal_code || companyRes.data?.zip,
                street: companyRes.data?.street,
                house_num: companyRes.data?.house_num,
                role: profileRes.data?.role || (isAdminEmail ? 'admin' : 'worker'),
                stripePublicKey: companyRes.data?.stripe_public_key,
                stripeSecretKey: companyRes.data?.stripe_secret_key,
                paypalClientId: companyRes.data?.paypal_client_id,
                isSupabase: true,
                authMode: 'cloud',
                isSkeleton: false
            };

            console.log('[Auth] FETCH_SUCCESS:', data);

            // Notify sync service
            import('../lib/SyncService').then(({ syncService }) => {
                syncService.patchUserId(userId);
            }).then(null, e => console.warn('[Auth] SyncService patch failed:', e));

            return data;
        } catch (err) {
            console.error('[Auth] FETCH_ERROR:', err);
            const isAdmin = ['admin@bayrechnung.com', 'omidbayenderi@gmail.com', 'admin@bayzenit.com'].includes(userEmail?.toLowerCase());
            return {
                id: userId,
                email: userEmail,
                name: isAdmin ? 'Admin' : 'User',
                role: isAdmin ? 'admin' : 'worker',
                dbError: err.message === 'Fetch timeout' ? 'TIMEOUT' : (err.code === '42P01' ? 'MIGRATION_REQUIRED' : 'CONNECTION_ERROR'),
                isSkeleton: false,
                authMode: 'cloud',
                isTimeout: err.message === 'Fetch timeout'
            };
        }
    }, [useSupabase]);

    // 2. Initial Auth Listener
    useEffect(() => {
        if (!useSupabase) {
            setLoading(false);
            return;
        }

        const initializeAuth = async () => {
            const { data: { session: initialSession } } = await supabase.auth.getSession();
            if (initialSession) {
                setSession(initialSession);
                const userData = await fetchUserData(initialSession.user.id, initialSession.user.email);
                setCurrentUser({ ...userData, authMode: 'cloud' });
            }
            setLoading(false);
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            console.log('[Auth] State Change:', event);
            setSession(newSession);

            if (event === 'SIGNED_IN' && newSession) {
                if (!isUpdating.current) {
                    const userData = await fetchUserData(newSession.user.id, newSession.user.email);
                    setCurrentUser({ ...userData, authMode: 'cloud' });
                }
            } else if (event === 'SIGNED_OUT') {
                setCurrentUser(null);
                setSession(null);
                isMockSession.current = false;
            } else if (event === 'USER_UPDATED' && newSession) {
                const userData = await fetchUserData(newSession.user.id, newSession.user.email);
                setCurrentUser({ ...userData, authMode: 'cloud' });
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [useSupabase, fetchUserData]);

    // 3. Mock Session Monitoring
    useEffect(() => {
        if (!useSupabase || isMockSession.current) {
            if (currentUser) {
                localStorage.setItem('bay_current_user', JSON.stringify(currentUser));
                if (isMockSession.current) localStorage.setItem('bay_is_mock', 'true');
            } else {
                localStorage.removeItem('bay_current_user');
                localStorage.removeItem('bay_is_mock');
            }
        }
    }, [currentUser, useSupabase]);

    // 7. Security Logging (Unified)
    const logSecurityAction = useCallback(async (action, entityType = 'security', entityId = null, metadata = {}, severity = 'info') => {
        console.log(`[Audit] ${action} on ${entityType}`);
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
            console.warn('[Audit] Failed to log security action:', err);
        }
    }, [useSupabase]);

    const login = useCallback(async (emailInput, password) => {
        const email = emailInput.toLowerCase().trim();
        if (useSupabase) {
            try {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (!error && data?.user) {
                    setSession(data.session);
                    const userData = await fetchUserData(data.user.id, data.user.email);
                    setCurrentUser({ ...userData, authMode: 'cloud' });

                    // Orchestrator Log
                    logSecurityAction('USER_LOGIN', 'users', data.user.id, { email, status: 'SUCCESS' });

                    return { success: true };
                }
                if (error) {
                    if (email.includes('admin@bayrechnung.com') || email.includes('admin@bayzenit.com')) {
                        return { success: false, error: error.message };
                    }
                }
            } catch (err) {
                console.error(err);
            }
        }
        if (IS_PROD) {
            console.warn('[Auth] Mock login attempt blocked in production.');
            return { success: false, error: 'Invalid credentials' };
        }

        const mockUser = MOCK_USERS.find(u => u.email.toLowerCase() === email && u.password === password);
        const registeredUsers = JSON.parse(localStorage.getItem('bay_registered_users') || '[]');
        const registeredUser = registeredUsers.find(u => u.email.toLowerCase() === email && u.password === password);
        const authenticatedUser = mockUser || registeredUser;

        if (authenticatedUser) {
            const validId = authenticatedUser.id && authenticatedUser.id.length === 36 ? authenticatedUser.id : '00000000-0000-0000-0000-000000000009';
            isMockSession.current = true;
            setCurrentUser({
                id: validId,
                email: authenticatedUser.email,
                name: authenticatedUser.name,
                plan: authenticatedUser.plan,
                companyName: authenticatedUser.companyName,
                role: authenticatedUser.role || 'admin',
                industry: authenticatedUser.industry || 'general',
                authMode: 'mock'
            });
            return { success: true };
        }
        return { success: false, error: 'Invalid credentials' };
    }, [useSupabase, logSecurityAction, fetchUserData]);

    const register = useCallback(async (regData) => {
        const email = regData.email.toLowerCase().trim();
        const password = regData.password;

        if (useSupabase || IS_PROD) {
            try {
                console.log('[Auth] Attempting Supabase signup for:', email);
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
                if (!data?.user) throw new Error("No user returned from signup");

                console.log('[Auth] Supabase Auth Signup Success:', data.user.id);

                // Try to create profile tables, but don't let failure here block registration
                try {
                    await supabase.from('users').upsert({
                        id: data.user.id,
                        email: email,
                        full_name: regData.name,
                        role: 'admin'
                    });
                } catch (e) { console.warn('[Auth] users table upsert failed:', e.message); }

                try {
                    const dbSupportedIndustries = [
                        'automotive', 'general', 'construction', 'gastronomy',
                        'healthcare', 'it', 'retail', 'crafts', 'consulting', 'education'
                    ];

                    const safeIndustry = dbSupportedIndustries.includes(regData.industry)
                        ? regData.industry
                        : 'general';

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
                console.error('[Auth] Supabase Signup Error:', err.message);
                return { success: false, error: err.message };
            }
        }

        // Mock Registration
        const newUser = {
            id: crypto.randomUUID?.() || Math.random().toString(36).substring(2),
            email: email,
            password: password,
            name: regData.name,
            companyName: regData.companyName,
            plan: regData.plan || 'standard',
            role: 'admin',
            industry: regData.industry || 'general'
        };

        const registeredUsers = JSON.parse(localStorage.getItem('bay_registered_users') || '[]');
        registeredUsers.push(newUser);
        localStorage.setItem('bay_registered_users', JSON.stringify(registeredUsers));

        isMockSession.current = true;
        setCurrentUser({ ...newUser, authMode: 'mock' });

        return { success: true, data: { user: newUser } };
    }, [useSupabase]);

    const logout = useCallback(async () => {
        try {
            if (useSupabase) {
                // Use a short timeout for signOut to avoid hanging the UI on network issues
                const signOutPromise = supabase.auth.signOut();
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('SignOut Timeout')), 2000));
                await Promise.race([signOutPromise, timeoutPromise]).catch(err => console.warn('[Auth] SignOut failed or timed out:', err));
            }
        } catch (err) {
            console.warn('[Auth] Logout warning:', err);
        } finally {
            // ALWAYS clear local state
            isMockSession.current = false;
            setCurrentUser(null);
            setSession(null);
            localStorage.removeItem('bay_current_user');
            localStorage.removeItem('bay_is_mock');

            // Clear any potential auth tokens manually to be safe
            Object.keys(localStorage).forEach(key => {
                if (key.includes('auth-token') || key.includes('sb-')) {
                    localStorage.removeItem(key);
                }
            });
        }
        return { success: true };
    }, [useSupabase]);

    const updateUser = useCallback(async (updatedData) => {
        if (useSupabase && !isMockSession.current) {
            try {
                isUpdating.current = true;
                const { data: { session: activeSession } } = await supabase.auth.getSession();
                if (!activeSession) throw new Error('Auth session missing or expired! Please re-login.');

                const userId = activeSession.user.id;
                let avatarUrl = updatedData.avatar;
                if (updatedData.avatarFile instanceof File) {
                    const uploadRes = await storageService.uploadAvatar(userId, updatedData.avatarFile);
                    if (uploadRes.success) avatarUrl = uploadRes.url;
                }

                // Auth Service metadata
                supabase.auth.updateUser({ data: { full_name: updatedData.name, avatar: avatarUrl } }).then(null, e => console.warn('[Auth] Metadata sync failed:', e));

                const roleMap = { 'Administrator': 'admin', 'Manager': 'site_lead', 'Accountant': 'finance', 'Employee': 'worker' };
                const normalizedRole = roleMap[updatedData.role] || updatedData.role || currentUserRef.current?.role;

                // 1. Prepare User Table Update
                const userUpdateItems = {
                    id: userId,
                    email: updatedData.email || currentUserRef.current?.email,
                    full_name: updatedData.name,
                    avatar_url: avatarUrl,
                    role: normalizedRole
                };

                // 2. Prepare Company Settings Update
                const dbSupportedIndustries = [
                    'automotive', 'general', 'construction', 'gastronomy',
                    'healthcare', 'it', 'retail', 'crafts', 'consulting', 'education'
                ];

                const safeIndustry = dbSupportedIndustries.includes(updatedData.industry)
                    ? updatedData.industry
                    : 'general';

                const companyUpdateItems = {
                    user_id: userId,
                    company_name: updatedData.companyName,
                    industry: safeIndustry,
                    phone: updatedData.phone,
                    street: updatedData.street,
                    house_num: updatedData.houseNum,
                    city: updatedData.city,
                    postal_code: updatedData.zip,
                    address: `${updatedData.street || ''} ${updatedData.houseNum || ''}`.trim(),
                    stripe_public_key: updatedData.stripePublicKey,
                    stripe_secret_key: updatedData.stripeSecretKey,
                    paypal_client_id: updatedData.paypalClientId
                };

                // 3. Enqueue to Sync Service
                const { syncService: liveSyncService } = await import('../lib/SyncService');
                liveSyncService.enqueue('users', 'update', userUpdateItems, userId);
                liveSyncService.enqueue('company_settings', 'update', companyUpdateItems, userId);

                // 4. Optimistic UI Update
                const newUserData = {
                    ...currentUserRef.current,
                    ...updatedData,
                    name: updatedData.name,
                    avatar: avatarUrl,
                    role: normalizedRole,
                    id: userId
                };
                setCurrentUser(newUserData);

                return { success: true };
            } catch (err) {
                console.error('[Auth] Profile Update Failed:', err);
                return { success: false, error: err.message };
            } finally {
                isUpdating.current = false;
            }
        } else {
            // Mock Update
            const updated = { ...currentUserRef.current, ...updatedData };
            setCurrentUser(updated);
            localStorage.setItem('bay_current_user', JSON.stringify(updated));
            return { success: true };
        }
    }, [useSupabase]);

    const subscriptionNotice = useMemo(() => {
        if (!currentUser || !currentUser.currentPeriodEnd) return null;

        const end = new Date(currentUser.currentPeriodEnd);
        const now = new Date();
        const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

        if (currentUser.subscriptionStatus === 'past_due') {
            return {
                type: 'error',
                message: 'Ödeme başarısız oldu. Lütfen ödeme yönteminizi güncelleyin.',
                action: 'manage'
            };
        }

        if (currentUser.subscriptionStatus === 'trialing' && diffDays <= 3 && diffDays > 0) {
            return {
                type: 'warning',
                message: `Deneme süreniz ${diffDays} gün içinde bitecek. Devam etmek için ödeme yöntemi ekleyin.`,
                action: 'upgrade'
            };
        }

        if (diffDays <= 3 && diffDays > 0 && !currentUser.cancelAtPeriodEnd) {
            return {
                type: 'info',
                message: `Aboneliğiniz ${diffDays} gün içinde yenilecek.`,
                action: 'none'
            };
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
            if (useSupabase && !isMockSession.current) {
                try {
                    const { error } = await supabase.functions.invoke('delete-account', {
                        body: {},
                    });
                    if (error) throw error;
                    await logout();
                    return { success: true };
                } catch (err) {
                    console.error('[Auth] Account deletion failed:', err);
                    return { success: false, error: err.message };
                }
            } else {
                localStorage.removeItem('bay_current_user');
                setCurrentUser(null);
                return { success: true };
            }
        },
        isAuthenticated: !!currentUser,
        loading,
        useSupabase,
        subscriptionNotice,
        sendPasswordReset: async (email) => {
            if (!useSupabase) return { success: true };
            const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
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
