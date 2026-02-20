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
    const useSupabase = isSupabaseConfigured();

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
            const isAdminEmail = email.toLowerCase() === 'admin@bayrechnung.com';

            if (profileRes.error) {
                console.warn('[Auth] Profile not found or table missing - attempting manual create:', profileRes.error.message);
                // MANUALLY CREATE PROFILE IF MISSING (Trigger fallback)
                await supabase.from('users').upsert({
                    id: userId,
                    email: email,
                    full_name: 'Admin'
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
                    name: 'New User',
                    plan: isAdminEmail ? 'premium' : 'free',
                    role: isAdminEmail ? 'admin' : 'admin',
                    isSupabase: true
                };
            }

            const data = {
                id: userId,
                email: email,
                name: profileRes.data?.full_name || 'Admin',
                avatar: profileRes.data?.avatar_url,
                // admin@bayrechnung.com always gets premium, others follow subscription
                plan: (isAdminEmail || subRes.data?.plan_type === 'premium') ? 'premium' : (subRes.data?.plan_type || 'free'),
                companyName: companyRes.data?.company_name || 'My Company',
                industry: companyRes.data?.industry || 'general',
                role: profileRes.data?.role || 'admin',
                isSupabase: true
            };
            console.log('[Auth] User data bundle fetched from Supabase:', data);

            // Patch any offline items from previous mock session
            const { syncService } = await import('../lib/SyncService');
            syncService.patchUserId(userId);

            return data;
        } catch (err) {
            console.error('[Auth] Critical error in fetchUserData:', err);
            // Return minimal data to allow app to proceed
            return { id: userId, name: 'User', role: 'admin' };
        }
    };

    useEffect(() => {
        // Global safety timeout to ensure loading always finishes
        const safetyTimeout = setTimeout(() => {
            setLoading(false);
        }, 5000);

        let subscription = null;

        if (useSupabase) {
            const initSession = async () => {
                // If we are already in a mock session (e.g. from a previous login that persisted via state/localstorage if we add persistence later), skip.
                // However, on mount, isMockSession.current is reset to false.
                // We can check localStorage to see if we should restore a mock session.
                const savedMock = localStorage.getItem('bay_current_user');
                const isMock = localStorage.getItem('bay_is_mock');
                if (savedMock && isMock === 'true') {
                    console.log('[Auth] Restoring mock session from persistence');
                    isMockSession.current = true;
                    setCurrentUser(JSON.parse(savedMock));
                    setLoading(false);
                    return;
                }

                console.log('[Auth] Initializing session...');
                try {
                    const { data: { session: initialSession }, error } = await supabase.auth.getSession();
                    if (error) throw error;

                    setSession(initialSession);
                    if (initialSession?.user) {
                        console.log('[Auth] Found active session for:', initialSession.user.id);
                        const userData = await fetchUserData(initialSession.user.id, initialSession.user.email);
                        setCurrentUser(userData);
                    } else {
                        console.log('[Auth] No active session found');
                    }
                } catch (err) {
                    console.error('[Auth] Initial session fetch error:', err);
                } finally {
                    setLoading(false);
                }
            };

            initSession();

            console.log('[Auth] Setting up AuthStateChange listener...');
            const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
                // Defensive check: If we are restoring a mock session, or have one in localStorage, ignore Supabase SIGNED_OUT
                const hasMock = localStorage.getItem('bay_is_mock') === 'true';

                if (isMockSession.current || hasMock) {
                    console.log('[Auth] Ignoring Supabase auth change due to active mock session');
                    return;
                }

                console.log('[Auth] Auth state changed:', event, newSession?.user?.id);
                setSession(newSession);

                if (newSession?.user) {
                    // FAST PASS: Immediately set minimal user to prevent "Access Denied" or long loading
                    const isAdmin = newSession.user.email?.toLowerCase() === 'admin@bayrechnung.com';
                    setCurrentUser(prev => prev || {
                        id: newSession.user.id,
                        email: newSession.user.email,
                        role: 'admin',
                        plan: isAdmin ? 'premium' : 'free',
                        isSkeleton: true
                    });

                    setLoading(false); // Stop blocking the UI immediately

                    // Background fetch for detailed profile
                    const userData = await fetchUserData(newSession.user.id, newSession.user.email);
                    if (userData) {
                        setCurrentUser(userData);
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
                    console.log('[Auth] Supabase login successful');
                    // Check if MFA is required
                    const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
                    if (!factorsError && factorsData?.all?.length > 0) {
                        const verifiedFactors = factorsData.all.filter(f => f.status === 'verified');
                        if (verifiedFactors.length > 0) {
                            console.log('[Auth] MFA required for user:', data.user.id);
                            return { success: true, mfaRequired: true, factors: verifiedFactors };
                        }
                    }
                    return { success: true };
                }

                if (error) {
                    // CRITICAL: If Supabase is configured, we DO NOT allow admin accounts to fall through to Mock
                    // This prevents data loss when someone uses a wrong password but enters a "mock-valid" one.
                    if (email.includes('admin@bayrechnung.com') || email.includes('admin@bayzenit.com')) {
                        console.error('[Auth] Supabase login failed for admin:', error.message);
                        return { success: false, error: `Supabase Login error: ${error.message}` };
                    }

                    // If user not found in Supabase or wrong password, we fall through to Mock
                    // But only if it's an "Invalid login credentials" - other errors should be bubble up
                    if (!error.message.includes('Invalid login credentials')) {
                        console.error('[Auth] Supabase login unexpected error:', error.message);
                        return { success: false, error: error.message };
                    }
                }
            } catch (err) {
                console.error('[Auth] Supabase login exception:', err);
                if (email.includes('admin@')) {
                    return { success: false, error: 'Database connection error. Please check your internet.' };
                }
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
                industry: authenticatedUser.industry || 'general'
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
                // 1. Handle Avatar Upload if it's a File
                let avatarUrl = updatedData.avatar;
                if (updatedData.avatarFile instanceof File) {
                    const uploadRes = await storageService.uploadAvatar(currentUser.id, updatedData.avatarFile);
                    if (uploadRes.success) {
                        avatarUrl = uploadRes.url;
                    }
                }

                // 2. Update Auth metadata
                const { data: authData, error: authError } = await supabase.auth.updateUser({
                    data: {
                        full_name: updatedData.name,
                        avatar: avatarUrl,
                    }
                });

                if (authError) throw authError;

                // 3. Update Public User Profile
                const { error: profileError } = await supabase
                    .from('users')
                    .update({
                        full_name: updatedData.name,
                        avatar_url: avatarUrl
                    })
                    .eq('id', currentUser.id);

                if (profileError) throw profileError;

                // 3. Update Company Settings if needed
                if (updatedData.companyName || updatedData.industry) {
                    const { error: companyError } = await supabase
                        .from('company_settings')
                        .update({
                            company_name: updatedData.companyName,
                            industry: updatedData.industry
                        })
                        .eq('user_id', currentUser.id);
                    if (companyError) throw companyError;
                }

                const userData = await fetchUserData(currentUser.id);
                setCurrentUser(userData);
                return { success: true };
            } catch (error) {
                console.error('Error updating user profile:', error);
                return { success: false, error: error.message };
            }
        } else {
            // Fallback: update in state and localStorage
            const updated = { ...currentUser, ...updatedData };
            setCurrentUser(updated);

            // Also update in registered users list
            const registeredUsers = JSON.parse(localStorage.getItem('bay_registered_users') || '[]');
            // Try to find by id first (if we add it), otherwise by email
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
