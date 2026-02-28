import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
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
    const [currentUser, setCurrentUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const isMockSession = useRef(false);
    const isUpdating = useRef(false);
    const currentUserRef = useRef(null);
    const [useSupabase, setUseSupabase] = useState(isSupabaseConfigured());

    // Keep ref in sync
    useEffect(() => {
        currentUserRef.current = currentUser;
    }, [currentUser]);

    console.log('[Auth] Supabase Configured:', useSupabase);
    if (useSupabase) {
        // Log URL (anonymized) to verify it is loaded
        const url = import.meta.env.VITE_SUPABASE_URL;
        console.log('[Auth] Supabase URL starts with:', url ? url.substring(0, 15) : 'undefined');
    }

    const fetchUserData = async (userId, userEmail = '') => {
        if (!userId) return null;
        console.log('[Auth] Fetching user data for:', userId);
        try {
            // Use try-catch for individual requests to avoid Promise.all hanging if a table doesn't exist
            const profileReq = supabase.from('users').select('*').eq('id', userId).single();
            const subReq = supabase.from('subscriptions').select('*').eq('user_id', userId).maybeSingle();
            const companyReq = supabase.from('company_settings').select('*').eq('user_id', userId).maybeSingle();

            const [profileRes, subRes, companyRes] = await Promise.all([profileReq, subReq, companyReq]);

            const email = profileRes.data?.email || userEmail || '';
            const isAdminEmail = ['admin@bayrechnung.com', 'omidbayenderi@gmail.com'].includes(email.toLowerCase());

            if (profileRes.error) {
                console.warn('[Auth] Profile not found or table missing:', profileRes.error.message);

                // If it's a "Not Found" error (PGRST116), try to create a basic profile
                if (profileRes.error.code === 'PGRST116') {
                    const defaultName = email.split('@')[0].split('.')[0].charAt(0).toUpperCase() + email.split('@')[0].split('.')[0].slice(1);
                    await supabase.from('users').upsert({
                        id: userId,
                        email: email,
                        full_name: defaultName
                    });

                    // ALSO ENSURE COMPANY SETTINGS EXIST
                    if (!companyRes.data) {
                        await supabase.from('company_settings').upsert({
                            user_id: userId,
                            company_name: 'My Company'
                        });
                    }

                    return {
                        id: userId,
                        email: email,
                        name: defaultName,
                        plan: isAdminEmail ? 'premium' : 'free',
                        role: isAdminEmail ? 'admin' : 'admin',
                        isSupabase: true,
                        authMode: 'cloud',
                        isSkeleton: false
                    };
                }

                // For other errors (like 404 table missing), return minimal data without failing
                return {
                    id: userId,
                    email: email,
                    name: isAdminEmail ? 'Admin' : 'User',
                    plan: isAdminEmail ? 'premium' : 'free',
                    role: isAdminEmail ? 'admin' : 'admin',
                    isSupabase: true,
                    authMode: 'cloud',
                    isSkeleton: false
                };
            }

            const data = {
                id: userId,
                email: email,
                name: profileRes.data?.full_name || 'Admin',
                avatar: profileRes.data?.avatar_url,
                plan: (isAdminEmail || subRes.data?.plan_type === 'premium') ? 'premium' : (subRes.data?.plan_type || 'free'),
                companyName: companyRes.data?.company_name || 'My Company',
                industry: companyRes.data?.industry || 'general',
                phone: companyRes.data?.phone,
                address: companyRes.data?.address,
                city: companyRes.data?.city,
                zip: companyRes.data?.zip,
                street: companyRes.data?.street,
                house_num: companyRes.data?.house_num,
                role: profileRes.data?.role || 'admin',
                stripePublicKey: companyRes.data?.stripe_public_key,
                stripeSecretKey: companyRes.data?.stripe_secret_key,
                paypalClientId: companyRes.data?.paypal_client_id,
                isSupabase: true,
                authMode: 'cloud',
                isSkeleton: false // Crucial: mark as loaded
            };
            console.log('[Auth] FETCH_SUCCESS:', data);

            // Notify sync service (using property check to avoid dynamic import hang)
            import('../lib/SyncService').then(({ syncService }) => {
                syncService.patchUserId(userId);
            }).catch(e => console.warn('[Auth] SyncService patch failed:', e));

            return data;
        } catch (err) {
            console.error('[Auth] FETCH_ERROR:', err);

            return {
                id: userId,
                email: userEmail,
                name: 'User',
                role: isAdminEmail ? 'admin' : 'worker',
                dbError: err.code === '42P01' ? 'MIGRATION_REQUIRED' : 'CONNECTION_ERROR',
                isSkeleton: false, // Ensure we clear the spinner
                authMode: 'cloud'
            };
        }
    };

    // Helper: Fetch with timeout
    const fetchUserDataWithTimeout = (userId, email) => {
        return Promise.race([
            fetchUserData(userId, email),
            new Promise((resolve) => setTimeout(() => {
                console.warn('[Auth] Fetch timed out, using minimal local profile for initialization');
                const isAdmin = ['admin@bayrechnung.com', 'omidbayenderi@gmail.com'].includes(email?.toLowerCase());

                // Try to get cached name if available
                let cachedName = 'Local User';
                try {
                    const localProfile = localStorage.getItem(`bay_profile_${userId}`);
                    if (localProfile) {
                        const parsed = JSON.parse(localProfile);
                        if (parsed.companyName) cachedName = parsed.owner || parsed.companyName;
                    }
                } catch (e) { }

                resolve({
                    id: userId,
                    email: email,
                    name: cachedName,
                    role: isAdmin ? 'admin' : 'worker',
                    isSkeleton: false,
                    authMode: 'cloud',
                    isTimeout: true
                });
            }, 12000)) // Increased to 12s for better tolerance or DB wake-ups
        ]);
    };

    useEffect(() => {
        // FAST INITIAL CHECK: If there is a Supabase token in storage, 
        // stay in loading state to allow session recovery.
        const hasSessionToken = Object.keys(localStorage).some(key =>
            (key.includes('auth-token') && key.includes('sb-')) || key === 'bay-simple-auth'
        );

        if (hasSessionToken && !currentUser && useSupabase) {
            console.log('[Auth] Recovery token detected, holding loading state...');
            setLoading(true);
        }

        // Global safety timeout to ensure loading always finishes
        const safetyTimeout = setTimeout(() => {
            console.log('[Auth] Safety timeout reached, clearing loading state');
            setLoading(false);
        }, 8000); // 8s for cloud recovery

        let subscription = null;
        const lastFetchedId = { current: null };

        if (useSupabase) {
            // Unify Auth initialization: rely on onAuthStateChange below for initial load to avoid duplicate fetches.
            console.log('[Auth] Setting up AuthStateChange listener...');
            const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
                if (event === 'SIGNED_OUT') {
                    console.log('[Auth] User signed out');
                    setCurrentUser(null);
                    setSession(null);
                    setLoading(false);
                    return;
                }

                // Deduplicate consecutive identical session updates to prevent loops
                const newUserId = newSession?.user?.id;

                const existingUser = currentUserRef.current;

                if (newUserId === lastFetchedId.current && existingUser && !existingUser.isSkeleton) {
                    console.log('[Auth] Session update for already fetched user, ignoring');
                    return;
                }

                lastFetchedId.current = newUserId;

                // Defensive check: If we are restoring a mock session, or have one in localStorage, ignore Supabase events
                const hasMock = localStorage.getItem('bay_is_mock') === 'true';

                if (isMockSession.current || hasMock) {
                    console.log('[Auth] Ignoring Supabase auth change due to active mock session');
                    return;
                }

                if (isUpdating.current) {
                    console.log('[Auth] Ignoring auth change during manual update flow');
                    return;
                }

                console.log('[Auth] Auth state changed:', event, newSession?.user?.id);
                setSession(newSession);

                if (newSession?.user) {
                    // Prevent duplicate fetches if same user
                    const current = currentUserRef.current;
                    if (current?.id === newSession.user.id && !current.isSkeleton) {
                        return;
                    }

                    // FAST PASS: Immediately set minimal user to prevent "Access Denied" or long loading
                    const isAdmin = ['admin@bayrechnung.com', 'omidbayenderi@gmail.com'].includes(newSession.user.email?.toLowerCase());
                    setCurrentUser(prev => {
                        if (prev && prev.id === newSession.user.id && !prev.isSkeleton) return prev;
                        return {
                            id: newSession.user.id,
                            email: newSession.user.email,
                            role: isAdmin ? 'admin' : 'worker', // Assume role based on email to bypass loading block
                            plan: isAdmin ? 'premium' : 'free',
                            isSkeleton: true,
                            authMode: 'cloud' // Match Supabase mode
                        };
                    });

                    setLoading(false);

                    // Background fetch for detailed profile
                    try {
                        // 1. First attempt with timeout for fast UI unblocking
                        const userData = await fetchUserDataWithTimeout(newSession.user.id, newSession.user.email);
                        if (userData) {
                            setCurrentUser(userData);
                        }

                        // 2. If it was a timeout, trigger a second "silent" fetch that will overwrite whenever it returns
                        if (userData?.isTimeout) {
                            console.log('[Auth] Timeout occurred earlier. Triggering silent background refresh...');
                            fetchUserData(newSession.user.id, newSession.user.email).then(finalData => {
                                if (finalData && !finalData.isTimeout) {
                                    console.log('[Auth] Background refresh successful, overwriting identity.');
                                    setCurrentUser(finalData);
                                }
                            });
                        }
                    } catch (fetchErr) {
                        console.error('[Auth] AuthChange fetch error:', fetchErr);
                        setCurrentUser(prev => ({ ...prev, isSkeleton: false, dbError: 'FETCH_FAILED' }));
                    }
                } else {
                    // Only clear if we are NOT in a mock session
                    setCurrentUser(null);
                    setLoading(false);
                }
            });
            subscription = data.subscription;
        } else {
            const saved = localStorage.getItem('bay_current_user');
            setCurrentUser(saved ? JSON.parse(saved) : null);
            setLoading(false);
        }

        return () => {
            clearTimeout(safetyTimeout);
            if (subscription) subscription.unsubscribe();
        };
    }, [useSupabase]);

    // Save to localStorage for mock sessions or fallback mode
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

    const login = async (emailInput, password) => {
        const email = emailInput.toLowerCase().trim();
        console.log('Login attempt started for:', email);

        // 1. FIRST: Try Supabase (Enterprise/Cloud Auth)
        if (useSupabase) {
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (!error && data?.user) {
                    console.log('[Auth] Supabase login successful for:', data.user.id);
                    setSession(data.session);
                    const userData = await fetchUserData(data.user.id, data.user.email);
                    setCurrentUser({ ...userData, authMode: 'cloud' });
                    return { success: true };
                }

                if (error) {
                    console.warn('[Auth] Supabase login failed:', error.message);
                    // Special handling for admin accounts - do not allow fallback
                    if (email.includes('admin@bayrechnung.com') || email.includes('admin@bayzenit.com')) {
                        return { success: false, error: `Supabase Auth Error: ${error.message}` };
                    }
                }
            } catch (err) {
                console.error('[Auth] Supabase login exception:', err);
            }
        }
        // 2. SECOND: Check Mock/Local Users (Fallback for Demo/Local Dev)
        if (IS_PROD) return { success: false, error: 'Invalid credentials' };

        const mockUser = MOCK_USERS.find(u => u.email.toLowerCase() === email && u.password === password);
        const registeredUsers = JSON.parse(localStorage.getItem('bay_registered_users') || '[]');
        const registeredUser = registeredUsers.find(u => u.email.toLowerCase() === email && u.password === password);

        const authenticatedUser = mockUser || registeredUser;

        if (authenticatedUser) {
            console.log('Login successful via Mock/Local system');
            // Ensure ID is a valid UUID to prevent Postgres errors
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
    };

    const sendPasswordReset = async (email) => {
        if (!useSupabase) {
            // Local mode fallback
            console.log('[Auth] Mock password reset sent for:', email);
            return { success: true };
        }
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('[Auth] Password reset error:', error);
            return { success: false, error: error.message };
        }
    };

    const register = async (userData, logoFile = null) => {
        const { email, password, name, companyName, plan, industry } = userData;

        if (useSupabase) {
            // Supabase registration
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        company_name: companyName,
                        industry: industry || 'general',
                        phone: metadata?.phone || '',
                        street: metadata?.address?.street || '',
                        city: metadata?.address?.city || '',
                        zip: metadata?.address?.zip || ''
                    }
                }
            });

            if (error) {
                console.error('Registration error:', error);
                return { success: false, error: error.message };
            }

            // User profile and subscription are auto-created via trigger
            // But we need to manually create company_settings
            if (data?.user) {
                let logoUrl = null;
                if (logoFile) {
                    const uploadRes = await storageService.uploadLogo(data.user.id, logoFile);
                    if (uploadRes.success) {
                        logoUrl = uploadRes.url;
                    }
                }

                const { error: companyError } = await supabase.from('company_settings').upsert({
                    user_id: data.user.id,
                    company_name: companyName,
                    industry: industry || 'general',
                    logo_url: logoUrl
                }, { onConflict: 'user_id' });
                if (companyError) console.error('Error creating/updating company settings:', companyError);
            }

            return { success: true, data };
        } else {
            // Fallback localStorage registration
            const registeredUsers = JSON.parse(localStorage.getItem('bay_registered_users') || '[]');
            if (registeredUsers.find(u => u.email === email) || MOCK_USERS.find(u => u.email === email)) {
                return { success: false, error: 'Email already registered' };
            }

            const newUser = {
                id: crypto.randomUUID?.() || '00000000-0000-0000-0000-000000000010',
                email,
                password,
                name,
                companyName,
                plan: plan || 'standard',
                industry: industry || 'general'
            };
            registeredUsers.push(newUser);
            localStorage.setItem('bay_registered_users', JSON.stringify(registeredUsers));

            setCurrentUser({
                email: newUser.email,
                name: newUser.name,
                plan: newUser.plan,
                companyName: newUser.companyName
            });

            return { success: true };
        }
    };

    const logout = async () => {
        if (useSupabase) {
            await supabase.auth.signOut();
        }

        // Force cleanup regardless of provider
        isMockSession.current = false;
        setCurrentUser(null);
        setSession(null);
        localStorage.removeItem('bay_current_user');
        localStorage.removeItem('bay_is_mock');

        // Optionally clear other app state if needed
        console.log('[Auth] User logged out, local state cleared');
        return { success: true };
    };

    // Update user profile (for avatar, name, etc.)
    const updateUser = async (updatedData) => {
        if (useSupabase && !isMockSession.current) {
            try {
                isUpdating.current = true;

                // 0. Ensure we have a fresh session before write
                const { data: { session: activeSession } } = await supabase.auth.getSession();
                if (!activeSession) {
                    throw new Error('Auth session missing or expired! Please re-login.');
                }

                const userId = activeSession.user.id;
                console.log(`[Auth] Deep Trace - User IDs match: ${userId === currentUser?.id}. Session ID: ${userId}`);

                // 1. Handle Avatar Upload if it's a File
                let avatarUrl = updatedData.avatar;
                if (updatedData.avatarFile instanceof File) {
                    const uploadRes = await storageService.uploadAvatar(userId, updatedData.avatarFile);
                    if (uploadRes.success) {
                        avatarUrl = uploadRes.url;
                    }
                }

                // 2. Update Auth metadata (This fires USER_UPDATED event)
                const { error: authError } = await supabase.auth.updateUser({
                    data: {
                        full_name: updatedData.name,
                        avatar: avatarUrl,
                    }
                });

                if (authError) throw authError;

                // 3. Update Public User Profile
                const roleMap = {
                    'Administrator': 'admin',
                    'Manager': 'site_lead',
                    'Accountant': 'finance',
                    'Employee': 'worker'
                };
                const normalizedRole = roleMap[updatedData.role] || updatedData.role || currentUser.role;

                const { error: profileError } = await supabase
                    .from('users')
                    .upsert({
                        id: userId,
                        email: updatedData.email || currentUser.email,
                        full_name: updatedData.name,
                        avatar_url: avatarUrl,
                        role: normalizedRole
                    }, { onConflict: 'id' });

                if (profileError) throw profileError;

                // 3. Update Company Settings
                const { error: companyError } = await supabase
                    .from('company_settings')
                    .upsert({
                        user_id: userId,
                        company_name: updatedData.companyName,
                        industry: updatedData.industry,
                        phone: updatedData.phone,
                        street: updatedData.street,
                        house_num: updatedData.house_num || updatedData.houseNum,
                        city: updatedData.city,
                        postal_code: updatedData.zip,
                        address: `${updatedData.street || ''} ${updatedData.house_num || updatedData.houseNum || ''}`.trim(),
                        stripe_public_key: updatedData.stripePublicKey,
                        stripe_secret_key: updatedData.stripeSecretKey,
                        paypal_client_id: updatedData.paypalClientId
                    }, { onConflict: 'user_id' });

                console.log('[Auth] Deep Trace - company_settings payload:', {
                    user_id: userId,
                    company_name: updatedData.companyName,
                    address: `${updatedData.street || ''} ${updatedData.house_num || updatedData.houseNum || ''}`.trim()
                });

                if (companyError) {
                    if (companyError.code === '42P01') {
                        throw new Error('Veritabanı tabloları eksik. Lütfen migrasyonları çalıştırın.');
                    }
                    throw companyError;
                }

                // 4. Update local state with fresh data
                const userData = await fetchUserData(userId, updatedData.email || currentUser.email);
                if (userData && userData.id) {
                    setCurrentUser({ ...userData, authMode: 'cloud' });
                }
                return { success: true };
            } catch (error) {
                console.error('[Auth] Error updating user profile:', error);

                // Detailed error for missing tables
                if (error.code === '42P01') {
                    return {
                        success: false,
                        error: 'Veritabanı tabloları eksik (Table missing). Lütfen Supabase SQL Editor üzerinden migrasyonları çalıştırın.'
                    };
                }

                return { success: false, error: error.message };
            } finally {
                isUpdating.current = false;
            }
        } else {
            // Fallback: update in state and localStorage
            const updated = { ...currentUser, ...updatedData };
            setCurrentUser(updated);

            const registeredUsers = JSON.parse(localStorage.getItem('bay_registered_users') || '[]');
            const identifier = currentUser?.id || currentUser?.email;
            const idx = registeredUsers.findIndex(u => (u.id && u.id === identifier) || u.email === currentUser?.email);

            if (idx !== -1) {
                registeredUsers[idx] = { ...registeredUsers[idx], ...updatedData };
                localStorage.setItem('bay_registered_users', JSON.stringify(registeredUsers));
            }
            return { success: true };
        }
    };

    // Zero Trust Security: Manual Audit Logging
    const logSecurityAction = async (action, entityType, entityId = null, metadata = {}, severity = 'info') => {
        if (!currentUser) return;

        console.log(`[Security] Action logged: ${action} on ${entityType} (${severity})`);

        if (useSupabase) {
            try {
                await supabase.from('audit_logs').insert({
                    user_id: currentUser.id,
                    action,
                    entity_type: entityType,
                    entity_id: entityId,
                    metadata: metadata,
                    severity: severity,
                    source: isMockSession.current ? 'mock-client' : 'client'
                });
            } catch (err) {
                console.error('[Security] Failed to write audit log to Supabase:', err);
            }
        } else {
            // Log to local storage for demo/mock mode
            const logs = JSON.parse(localStorage.getItem('bay_audit_logs') || '[]');
            logs.unshift({
                id: `log-${Date.now()}`,
                user_id: currentUser.id,
                action,
                entity_type: entityType,
                entity_id: entityId,
                metadata,
                severity,
                created_at: new Date().toISOString()
            });
            localStorage.setItem('bay_audit_logs', JSON.stringify(logs.slice(0, 100)));
        }
    };

    // Zero Trust Security: MFA Management
    const enrollMFA = async () => {
        if (!useSupabase) return { success: false, error: 'MFA only supported in cloud mode' };
        try {
            const { data, error } = await supabase.auth.mfa.enroll({
                factorType: 'totp'
            });
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('[Security] MFA enrollment error:', error);
            return { success: false, error: error.message };
        }
    };

    const verifyMFA = async (factorId, code) => {
        if (!useSupabase) return { success: true };
        try {
            const { data, error } = await supabase.auth.mfa.challenge({ factorId });
            if (error) throw error;

            const challengeId = data.id;
            const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
                factorId,
                challengeId,
                code
            });

            if (verifyError) throw verifyError;

            logSecurityAction('MFA_VERIFIED', 'user_id', currentUser?.id);
            return { success: true, data: verifyData };
        } catch (error) {
            console.error('[Security] MFA verification error:', error);
            return { success: false, error: error.message };
        }
    };

    const unenrollMFA = async (factorId) => {
        if (!useSupabase) return { success: true };
        try {
            const { data, error } = await supabase.auth.mfa.unenroll({ factorId });
            if (error) throw error;
            logSecurityAction('MFA_DISABLED', 'user_id', currentUser?.id);
            return { success: true, data };
        } catch (error) {
            console.error('[Security] MFA unenrollment error:', error);
            return { success: false, error: error.message };
        }
    };

    const listMFAFactors = async () => {
        if (!useSupabase) return { success: true, factors: [] };
        try {
            const { data, error } = await supabase.auth.mfa.listFactors();
            if (error) throw error;
            return { success: true, factors: data.all };
        } catch (error) {
            console.error('[Security] Error listing MFA factors:', error);
            return { success: false, error: error.message };
        }
    };

    // Authenticated if we have a valid currentUser (works for both Supabase and Mock sessions)
    const isAuthenticated = !!currentUser;

    const authValue = useMemo(() => ({
        currentUser,
        session,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated,
        loading,
        useSupabase,
        enrollMFA,
        verifyMFA,
        unenrollMFA,
        listMFAFactors,
        sendPasswordReset,
        logSecurityAction
    }), [currentUser, session, loading, useSupabase, isAuthenticated]);

    return (
        <AuthContext.Provider value={authValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
