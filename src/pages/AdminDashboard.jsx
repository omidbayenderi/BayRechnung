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
import SystemHealth from './admin/SystemHealth';
import SiteManagement from './admin/SiteManagement';
import Settings from './settings/Settings';
import UserManagement from './settings/UserManagement';
import MessagesCenter from './MessagesCenter';
import AdminMessagingView from '../components/admin/AdminMessagingView';
import SubscriptionManagement from './admin/SubscriptionManagement';
import IntegrationSettings from './admin/IntegrationSettings';
import Reports from './admin/Reports';
import Dashboard from './accounting/Dashboard';
import PremiumUpgradeModal from '../components/admin/PremiumUpgradeModal';
import ConstructionAdminPanel from '../features/admin/ConstructionAdminPanel';

const AdminDashboard = () => {
    const { t } = useLanguage();
    const { companyProfile } = useInvoice();
    const [searchParams, setSearchParams] = useSearchParams();
    const { isPremium } = usePlanGuard();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const activeTab = searchParams.get('tab') || 'overview';

    const renderContent = () => {
        try {
            switch (activeTab) {
                case 'overview': return <SystemOverview />;
                case 'subscription': return <SubscriptionManagement />;
                case 'integrations':
                    return isPremium() ? <IntegrationSettings /> : <SubscriptionManagement />;
                case 'reports': return <Reports />;
                case 'sites':
                    const ind = companyProfile?.industry?.toLowerCase();
                    const hasSites = ['construction', 'general'].includes(ind);
                    if (hasSites && isPremium()) return <SiteManagement />;
                    if (hasSites && !isPremium()) {
                        // Return a placeholder or the Overview with an auto-triggered modal
                        return (
                            <div className="restricted-content" style={{ padding: '40px', textAlign: 'center' }}>
                                <Lock size={48} style={{ color: '#94a3b8', marginBottom: '16px' }} />
                                <h2>{t('premium_only') || 'Premium Özellik'}</h2>
                                <p>{t('sites_premium_desc') || 'Şantiye yönetimi ve iş akışı özellikleri için Premium plana geçin.'}</p>
                                <button className="primary-btn" onClick={() => setShowUpgradeModal(true)} style={{ marginTop: '20px' }}>
                                    {t('upgrade_now') || 'Şimdi Yükselt'}
                                </button>
                            </div>
                        );
                    }
                    return <SystemOverview />;
                case 'users':
                    if (isPremium()) return <UserManagement />;
                    return (
                        <div className="restricted-content" style={{ padding: '40px', textAlign: 'center' }}>
                            <Users size={48} style={{ color: '#94a3b8', marginBottom: '16px' }} />
                            <h2>{t('premium_only') || 'Premium Özellik'}</h2>
                            <p>{t('users_premium_desc') || 'Çoklu kullanıcı ve rol yönetimi için Premium plana geçin.'}</p>
                            <button className="primary-btn" onClick={() => setShowUpgradeModal(true)} style={{ marginTop: '20px' }}>
                                {t('upgrade_now') || 'Şimdi Yükselt'}
                            </button>
                        </div>
                    );
                case 'health': return <SystemHealth />;
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

    if (companyProfile?.industry?.toLowerCase() === 'construction' && isPremium()) {
        return <ConstructionAdminPanel />;
    }

    return (
        <div className="admin-dashboard-unified-wrapper" style={{ minHeight: 'calc(100vh - 80px)', background: '#f8fafc' }}>
            <main style={{ padding: '0' }}>
                {renderContent()}
            </main>
            <PremiumUpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
        </div>
    );
};

export default AdminDashboard;
