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

    const fetchUserData = async (userId, userEmail = '') => {
        if (!userId) return null;
        console.log('[Auth] Fetching user data for:', userId);
        try {
            const profileReq = supabase.from('users').select('*').eq('id', userId).single();
            const subReq = supabase.from('subscriptions').select('*').eq('user_id', userId).maybeSingle();
            const companyReq = supabase.from('company_settings').select('*').eq('user_id', userId).maybeSingle();

            const [profileRes, subRes, companyRes] = await Promise.all([profileReq, subReq, companyReq]);

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
                companyName: companyRes.data?.company_name || 'My Company',
                industry: companyRes.data?.industry || 'general',
                phone: companyRes.data?.phone,
                address: companyRes.data?.address,
                city: companyRes.data?.city,
                zip: companyRes.data?.zip,
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
            }).catch(e => console.warn('[Auth] SyncService patch failed:', e));

            return data;
        } catch (err) {
            console.error('[Auth] FETCH_ERROR:', err);
            const isAdmin = ['admin@bayrechnung.com', 'omidbayenderi@gmail.com', 'admin@bayzenit.com'].includes(userEmail?.toLowerCase());
            return {
                id: userId,
                email: userEmail,
                name: isAdmin ? 'Admin' : 'User',
                role: isAdmin ? 'admin' : 'worker',
                dbError: err.code === '42P01' ? 'MIGRATION_REQUIRED' : 'CONNECTION_ERROR',
                isSkeleton: false,
                authMode: 'cloud'
            };
        }
    };

    const fetchUserDataWithTimeout = (userId, email) => {
        return Promise.race([
            fetchUserData(userId, email),
            new Promise((resolve) => setTimeout(() => {
                console.warn('[Auth] Fetch timed out, using minimal local profile for initialization');
                const isAdmin = ['admin@bayrechnung.com', 'omidbayenderi@gmail.com', 'admin@bayzenit.com'].includes(email?.toLowerCase());

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
                    plan: isAdmin ? 'premium' : 'free',
                    industry: 'general',
                    companyName: 'My Company',
                    isSkeleton: false,
                    authMode: 'cloud',
                    isTimeout: true
                });
            }, 12000))
        ]);
    };

    useEffect(() => {
        const hasSessionToken = Object.keys(localStorage).some(key =>
            (key.includes('auth-token') && key.includes('sb-')) || key === 'bay-simple-auth'
        );

        if (hasSessionToken && !currentUser && useSupabase) {
            setLoading(true);
        }

        const safetyTimeout = setTimeout(() => {
            setLoading(false);
        }, 8000);

        let subscription = null;
        const lastFetchedId = { current: null };

        if (useSupabase) {
            const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
                if (event === 'SIGNED_OUT') {
                    setCurrentUser(null);
                    setSession(null);
                    setLoading(false);
                    return;
                }

                const newUserId = newSession?.user?.id;
                const existingUser = currentUserRef.current;

                if (newUserId === lastFetchedId.current && existingUser && !existingUser.isSkeleton) {
                    return;
                }

                lastFetchedId.current = newUserId;
                const hasMock = localStorage.getItem('bay_is_mock') === 'true';

                if (isMockSession.current || hasMock) return;
                if (isUpdating.current) return;

                setSession(newSession);

                if (newSession?.user) {
                    const current = currentUserRef.current;
                    if (current?.id === newSession.user.id && !current.isSkeleton) {
                        return;
                    }

                    const isAdmin = ['admin@bayrechnung.com', 'omidbayenderi@gmail.com', 'admin@bayzenit.com'].includes(newSession.user.email?.toLowerCase());
                    setCurrentUser(prev => {
                        if (prev && prev.id === newSession.user.id && !prev.isSkeleton) return prev;
                        return {
                            id: newSession.user.id,
                            email: newSession.user.email,
                            role: isAdmin ? 'admin' : 'worker',
                            plan: isAdmin ? 'premium' : 'free',
                            isSkeleton: true,
                            authMode: 'cloud'
                        };
                    });

                    setLoading(false);

                    try {
                        const userData = await fetchUserDataWithTimeout(newSession.user.id, newSession.user.email);
                        if (userData) {
                            setCurrentUser(userData);
                        }

                        if (userData?.isTimeout) {
                            fetchUserData(newSession.user.id, newSession.user.email).then(finalData => {
                                if (finalData && !finalData.isTimeout) {
                                    setCurrentUser(finalData);
                                }
                            });
                        }
                    } catch (fetchErr) {
                        setCurrentUser(prev => ({ ...prev, isSkeleton: false, dbError: 'FETCH_FAILED' }));
                    }
                } else {
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
        if (useSupabase) {
            try {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (!error && data?.user) {
                    setSession(data.session);
                    const userData = await fetchUserData(data.user.id, data.user.email);
                    setCurrentUser({ ...userData, authMode: 'cloud' });
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
        if (IS_PROD) return { success: false, error: 'Invalid credentials' };

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
    };

    const logout = async () => {
        if (useSupabase) await supabase.auth.signOut();
        isMockSession.current = false;
        setCurrentUser(null);
        setSession(null);
        localStorage.removeItem('bay_current_user');
        localStorage.removeItem('bay_is_mock');
        return { success: true };
    };

    const updateUser = async (updatedData) => {
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

                await supabase.auth.updateUser({ data: { full_name: updatedData.name, avatar: avatarUrl } });

                const roleMap = { 'Administrator': 'admin', 'Manager': 'site_lead', 'Accountant': 'finance', 'Employee': 'worker' };
                const normalizedRole = roleMap[updatedData.role] || updatedData.role || currentUser.role;

                await supabase.from('users').upsert({
                    id: userId,
                    email: updatedData.email || currentUser.email,
                    full_name: updatedData.name,
                    avatar_url: avatarUrl,
                    role: normalizedRole
                }, { onConflict: 'id' });

                await supabase.from('company_settings').upsert({
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

                const userData = await fetchUserData(userId, updatedData.email || currentUser.email);
                if (userData) setCurrentUser({ ...userData, authMode: 'cloud' });
                return { success: true };
            } catch (error) {
                return { success: false, error: error.message };
            } finally {
                isUpdating.current = false;
            }
        } else {
            const updated = { ...currentUser, ...updatedData };
            setCurrentUser(updated);
            const registeredUsers = JSON.parse(localStorage.getItem('bay_registered_users') || '[]');
            const idx = registeredUsers.findIndex(u => u.id === currentUser?.id || u.email === currentUser?.email);
            if (idx !== -1) {
                registeredUsers[idx] = { ...registeredUsers[idx], ...updatedData };
                localStorage.setItem('bay_registered_users', JSON.stringify(registeredUsers));
            }
            return { success: true };
        }
    };

    const authValue = useMemo(() => ({
        currentUser,
        session,
        login,
        logout,
        updateUser,
        isAuthenticated: !!currentUser,
        loading,
        useSupabase,
        sendPasswordReset: async (email) => {
            if (!useSupabase) return { success: true };
            const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
            return error ? { success: false, error: error.message } : { success: true };
        },
        logSecurityAction: async (action, type) => {
            console.log(`[Security] ${action} on ${type}`);
        }
    }), [currentUser, session, loading, useSupabase]);

    return (
        <AuthContext.Provider value={authValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
