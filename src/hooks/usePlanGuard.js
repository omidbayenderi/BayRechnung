import { useAuth } from '../context/AuthContext';
import { useInvoice } from '../context/InvoiceContext';

export const usePlanGuard = () => {
    const { currentUser } = useAuth();
    const { companyProfile } = useInvoice();

    // Check if user has premium plan
    const isPremium = () => {
        return currentUser?.plan === 'premium' || companyProfile?.plan === 'premium';
    };

    // Features mapping
    const features = {
        advancedReports: 'premium',
        stockPOS: 'premium',
        employeeManagement: 'premium',
        appointmentSystem: 'premium',
        websiteBuilder: 'premium',
        apiIntegrations: 'premium',
        multiUser: 'premium',
        aiAssistant: 'premium',
        whatsApp: 'premium',
        unlimitedInvoices: 'standard', // Both plans
        mobileAccess: 'standard' // Both plans
    };

    const hasAccess = (featureKey) => {
        const requiredPlan = features[featureKey] || 'standard';

        // If feature requires premium but user is standard
        if (requiredPlan === 'premium' && !isPremium()) {
            return false;
        }

        return true;
    };

    return { isPremium, hasAccess };
};
