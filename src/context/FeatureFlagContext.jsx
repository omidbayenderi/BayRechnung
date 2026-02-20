import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const FeatureFlagContext = createContext();

export const FeatureFlagProvider = ({ children }) => {
    const [flags, setFlags] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    const fetchFlags = async () => {
        try {
            console.log('[FeatureFlags] Fetching system flags...');
            const { data, error } = await supabase
                .from('feature_flags')
                .select('*');

            if (error) throw error;
            setFlags(data || []);
        } catch (err) {
            console.error('[FeatureFlags] Error loading flags:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlags();

        // Optional: Real-time updates for flags
        const subscription = supabase
            .channel('public:feature_flags')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'feature_flags' }, () => {
                fetchFlags();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    /**
     * core evaluation logic
     * @param {string} flagKey - The key of the flag (e.g. 'KANBAN_VIEW')
     * @returns {boolean} - Whether the feature is accessible
     */
    const isFeatureEnabled = (flagKey) => {
        const flag = flags.find(f => f.flag_key === flagKey);
        if (!flag) return false;

        // 1. Check global toggle
        if (!flag.is_enabled) return false;

        // 2. Check plan access
        // If user is super admin, they get everything
        if (currentUser?.email === 'admin@bayrechnung.com') return true;

        if (flag.allowed_plans && flag.allowed_plans.length > 0) {
            const userPlan = currentUser?.plan || 'free';
            return flag.allowed_plans.includes(userPlan);
        }

        return true;
    };

    return (
        <FeatureFlagContext.Provider value={{ flags, loading, isFeatureEnabled, refreshFlags: fetchFlags }}>
            {children}
        </FeatureFlagContext.Provider>
    );
};

export const useFeatureFlags = () => {
    const context = useContext(FeatureFlagContext);
    if (!context) {
        throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
    }
    return context;
};
