import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { usePanel } from '../context/PanelContext';
import { useInvoice } from '../context/InvoiceContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    LayoutDashboard,
    Settings as SettingsIcon,
    Users,
    MessageSquare,
    LogOut,
    Menu,
    X,
    Grid,
    ChevronDown,
    ChevronRight,
    Command,
    Calendar,
    ShoppingCart,
    Globe,
    Shield,
    CreditCard,
    FileText,
    Map,
    Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlanGuard } from '../hooks/usePlanGuard';

// Import Panels
import SystemOverview from './admin/SystemOverview';
import SiteManagement from './admin/SiteManagement';
import Settings from './Settings';
import UserManagement from './UserManagement';
import MessagesCenter from './MessagesCenter';
import AdminMessagingView from '../components/admin/AdminMessagingView';
import SubscriptionManagement from './admin/SubscriptionManagement';
import IntegrationSettings from './admin/IntegrationSettings';
import Reports from './admin/Reports';
import Dashboard from './Dashboard';

const AdminDashboard = () => {
    const { t } = useLanguage();
    const { companyProfile } = useInvoice();
    const [searchParams] = useSearchParams();
    const { isPremium } = usePlanGuard();

    const activeTab = searchParams.get('tab') || 'overview';

    const renderContent = () => {
        try {
            switch (activeTab) {
                case 'overview': return <SystemOverview />;
                case 'subscription': return <SubscriptionManagement />;
                case 'integrations': return <IntegrationSettings />;
                case 'reports': return <Reports />;
                case 'sites':
                    const ind = companyProfile?.industry?.toLowerCase();
                    return (['construction', 'general'].includes(ind) && isPremium()) ? <SiteManagement /> : <SystemOverview />;
                case 'users':
                    // Safe guard for tab
                    return isPremium() ? <UserManagement /> : <SystemOverview />;
                case 'messages': return <AdminMessagingView />;
                case 'settings': return <Settings />;
                default: return <SystemOverview />;
            }
        } catch (err) {
            console.error('[AdminDashboard] Render Error:', err);
            return (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                    <h2>Ops! Bir hata oluştu.</h2>
                    <p>Bu bölüm şu an görüntülenemiyor. Lütfen sayfayı yenileyin.</p>
                    <button className="primary-btn" onClick={() => window.location.reload()}>Yenile</button>
                </div>
            );
        }
    };

    return (
        <div className="admin-dashboard-unified-wrapper" style={{ minHeight: 'calc(100vh - 80px)', background: '#f8fafc' }}>
            <main style={{ padding: '0' }}>
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminDashboard;
