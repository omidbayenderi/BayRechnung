import { useMemo } from 'react';
import { useStock } from '../../../context/StockContext';
import { useAppointments } from '../../../context/AppointmentContext';
import { useLanguage } from '../../../context/LanguageContext';

/**
 * useSyncData
 * Aggregates read-only data from the BayZenit ecosystem for the WebBuilder.
 * Ensures strict multi-tenant isolation by relying on established contexts.
 */
export const useSyncData = () => {
    const { products, categories: stockCategories, loading: stockLoading, settings: stockSettings } = useStock();
    const { services, staff, loading: apptLoading, settings: apptSettings } = useAppointments();
    const { t } = useLanguage();

    const aggregatedData = useMemo(() => {
        return {
            products: products || [],
            categories: stockCategories || [],
            services: services || [],
            staff: staff || [],
            businessInfo: {
                name: apptSettings?.storeName || stockSettings?.storeName || '',
                phone: apptSettings?.storePhone || stockSettings?.storePhone || '',
                address: apptSettings?.storeAddress || stockSettings?.storeAddress || '',
                currency: stockSettings?.currency || '€',
            },
            status: {
                loading: stockLoading || apptLoading,
                hasProducts: products?.length > 0,
                hasServices: services?.length > 0,
            }
        };
    }, [products, stockCategories, stockLoading, stockSettings, services, staff, apptLoading, apptSettings]);

    return {
        ...aggregatedData,
        t
    };
};
