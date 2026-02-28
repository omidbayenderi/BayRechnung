import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useInvoice } from './InvoiceContext';
import { useStock } from './StockContext';
import { useAppointments } from './AppointmentContext';
import { useWebsite } from './WebsiteContext';
import { useLanguage } from './LanguageContext';

const BayVisionContext = createContext();

export const useBayVision = () => {
    const context = useContext(BayVisionContext);
    if (!context) throw new Error('useBayVision must be used within a BayVisionProvider');
    return context;
};

export const BayVisionProvider = ({ children }) => {
    const { t } = useLanguage();
    const auth = useAuth() || {};
    const currentUser = auth.currentUser;

    const invoiceData = useInvoice() || {};
    const { invoices = [], expenses = [] } = invoiceData;

    const stockData = useStock() || {};
    const { products = [] } = stockData;

    const apptData = useAppointments() || {};
    const { appointments = [] } = apptData;

    const webData = useWebsite() || {};
    const { siteConfig = {} } = webData;

    const [intelligence, setIntelligence] = useState({
        alerts: [],
        opportunities: [],
        summary: t('analyzing_system'),
        lastUpdate: new Date()
    });

    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const runFullAnalysis = useCallback(() => {
        if (!currentUser) return;
        setIsAnalyzing(true);

        const newAlerts = [];
        const newOpportunities = [];

        // 1. Financial Analysis (via BayAccountant logic)
        const unpaidCount = invoices?.filter(i => i.status === 'sent' || i.status === 'overdue').length || 0;
        if (unpaidCount > 3) {
            newAlerts.push({
                id: 'unpaid-invoices',
                type: 'financial',
                severity: 'warning',
                title: t('payment_followup_needed'),
                message: t('unpaid_invoices_warning_msg').replace('{count}', unpaidCount),
                agent: 'BayAccountant'
            });
        }

        // 2. Stock Analysis (via BayInStock logic)
        const lowStockItems = products?.filter(p => p.stock <= p.minStock) || [];
        if (lowStockItems.length > 0) {
            newAlerts.push({
                id: 'low-stock',
                type: 'inventory',
                severity: 'danger',
                title: t('stock_critical_level'),
                message: t('low_stock_warning_msg').replace('{count}', lowStockItems.length),
                agent: 'BayInStock'
            });
        }

        // 3. Growth Analysis (via BayMarketer logic)
        if (invoices?.length > 10 && siteConfig?.isPublished) {
            newOpportunities.push({
                id: 'ads-opportunity',
                type: 'growth',
                title: t('new_ad_opportunity'),
                message: t('ad_opportunity_msg'),
                agent: 'BayMarketer'
            });
        }

        // 4. Creative Analysis (via BayCreative logic)
        if (!siteConfig?.theme?.logoUrl && currentUser) {
            newOpportunities.push({
                id: 'logo-gen',
                type: 'creative',
                title: t('missing_brand_identity'),
                message: t('logo_generation_suggestion_msg'),
                agent: 'BayCreative'
            });
        }

        setIntelligence({
            alerts: newAlerts,
            opportunities: newOpportunities,
            summary: t('analysis_summary_msg')
                .replace('{alertCount}', newAlerts.length)
                .replace('{oppCount}', newOpportunities.length),
            lastUpdate: new Date()
        });

        setIsAnalyzing(false);
    }, [currentUser, invoices, products, siteConfig, t]);

    useEffect(() => {
        const timer = setTimeout(() => {
            runFullAnalysis();
        }, 2000);
        return () => clearTimeout(timer);
    }, [runFullAnalysis]);

    return (
        <BayVisionContext.Provider value={{
            intelligence,
            isAnalyzing,
            runFullAnalysis
        }}>
            {children}
        </BayVisionContext.Provider>
    );
};
