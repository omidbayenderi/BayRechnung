import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { startAutomatedDuty } from '../../lib/AgentAutomator';

/**
 * InternalAutomator: Component that triggers automated background duties
 * for system agents whenever an admin is logged in.
 */
const InternalAutomator = () => {
    const { currentUser } = useAuth();

    useEffect(() => {
        // Only start for admin or authorized staff
        if (currentUser?.id && (currentUser.role === 'admin' || currentUser.email === 'admin@bayrechnung.com')) {
            const stop = startAutomatedDuty(currentUser.id);
            return () => stop && stop();
        }
    }, [currentUser]);

    return null; // Background component
};

export default InternalAutomator;
