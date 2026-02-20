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
    const { logout, currentUser } = useAuth();
    const { modules, switchPanel } = usePanel();
    const { companyProfile } = useInvoice();
    const [searchParams, setSearchParams] = useSearchParams();
    const { isPremium } = usePlanGuard();

    // Initialize tab from URL or default to 'overview'
    const initialTab = searchParams.get('tab') || 'overview';
    const [activeTab, setActiveTabState] = useState(initialTab);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showPanelSwitcher, setShowPanelSwitcher] = useState(false);
    const navigate = useNavigate();

    // Sync state with URL
    const setActiveTab = (tabId) => {
        setActiveTabState(tabId);
        setSearchParams({ tab: tabId });
    };

    // Ensure state updates if URL changes externally (e.g. back button)
    React.useEffect(() => {
        const currentTab = searchParams.get('tab') || 'overview';
        if (currentTab !== activeTab) {
            setActiveTabState(currentTab);
        }
    }, [searchParams]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <SystemOverview />;
            case 'subscription': return <SubscriptionManagement />;
            case 'integrations': return <IntegrationSettings />;
            case 'reports': return <Reports />;
            case 'sites':
                // Security check: Only render if industry is Construction AND plan is Premium
                return (companyProfile?.industry === 'Construction' && isPremium()) ? <SiteManagement /> : <SystemOverview />;
            case 'users':
                return isPremium() ? <UserManagement /> : <SystemOverview />;
            case 'messages': return <AdminMessagingView />;
            case 'settings': return <Settings />;
            default: return <SystemOverview />;
        }
    };

    const sidebarItems = [
        { id: 'overview', label: t('dashboard'), icon: LayoutDashboard },
        // Conditional Sidebar Item for Site Management (Premium + Construction)
        ...(companyProfile?.industry === 'Construction' && isPremium() ? [{ id: 'sites', label: t('site_management'), icon: Map }] : []),
        { id: 'subscription', label: t('subscription_management'), icon: CreditCard },
        // Premium Only Sections
        ...(isPremium() ? [
            { id: 'integrations', label: t('integration_hub'), icon: Globe },
            { id: 'reports', label: t('reports'), icon: FileText },
            { id: 'users', label: t('users'), icon: Users },
        ] : []),
        { id: 'messages', label: t('messages'), icon: MessageSquare },
        { id: 'settings', label: t('settings'), icon: SettingsIcon },
    ];

    return (
        <div className="admin-dashboard-container" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            {/* Sidebar */}
            <AnimatePresence mode='wait'>
                {isSidebarOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 280, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            background: '#1e293b',
                            color: 'white',
                            height: '100vh',
                            position: 'sticky',
                            top: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            flexShrink: 0,
                            zIndex: 50,
                            boxShadow: '4px 0 15px rgba(0,0,0,0.1)'
                        }}
                    >
                        {/* Admin Brand Header */}
                        <div style={{ padding: '24px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: '#ef4444',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold'
                                }}>
                                    <Shield size={18} color="white" />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: '800', fontSize: '1.1rem', color: 'white', letterSpacing: '0.5px' }}>
                                        {t('admin_panel_title')}
                                    </span>
                                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        {t('system_control')}
                                    </span>
                                </div>
                            </div>
                            <button onClick={toggleSidebar} className="icon-btn" style={{ color: 'white', opacity: 0.7, background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>

                            {/* Panel Switcher */}
                            <div style={{ marginBottom: '24px' }}>
                                <button
                                    onClick={() => setShowPanelSwitcher(!showPanelSwitcher)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '12px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Grid size={16} color="#94a3b8" />
                                        <span>{t('switch_to_app')}</span>
                                    </div>
                                    {showPanelSwitcher ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>

                                <AnimatePresence>
                                    {showPanelSwitcher && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            style={{ overflow: 'hidden', marginTop: '8px', display: 'grid', gap: '8px' }}
                                        >
                                            {modules.filter(m => m.id !== 'admin').map(mod => {
                                                const isLocked = mod.premium && currentUser?.plan !== 'premium';
                                                return (
                                                    <button
                                                        key={mod.id}
                                                        onClick={() => {
                                                            if (isLocked) {
                                                                // If locked, go to subscription management
                                                                setActiveTab('subscription');
                                                                setShowPanelSwitcher(false);
                                                                return;
                                                            }
                                                            switchPanel(mod.id);
                                                        }}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '10px',
                                                            padding: '10px',
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: isLocked ? '#64748b' : '#cbd5e1',
                                                            cursor: 'pointer',
                                                            borderRadius: '6px',
                                                            textAlign: 'left',
                                                            transition: 'background 0.2s',
                                                            fontSize: '0.85rem',
                                                            opacity: isLocked ? 0.7 : 1,
                                                            filter: isLocked ? 'grayscale(0.5)' : 'none'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (!isLocked) e.target.style.background = 'rgba(255,255,255,0.05)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (!isLocked) e.target.style.background = 'transparent';
                                                        }}
                                                    >
                                                        <div style={{ color: mod.color, position: 'relative' }}>
                                                            {mod.icon({ size: 16 })}
                                                            {isLocked && (
                                                                <div style={{
                                                                    position: 'absolute',
                                                                    top: '-6px',
                                                                    right: '-6px',
                                                                    background: '#1e293b',
                                                                    color: 'white',
                                                                    borderRadius: '50%',
                                                                    padding: '2px',
                                                                    border: '1px solid #334155'
                                                                }}>
                                                                    <Lock size={8} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <span>{mod.name}</span>
                                                            {isLocked && (
                                                                <span style={{
                                                                    fontSize: '0.6rem',
                                                                    background: '#fef3c7',
                                                                    color: '#92400e',
                                                                    padding: '1px 4px',
                                                                    borderRadius: '4px',
                                                                    fontWeight: 'bold',
                                                                    textTransform: 'uppercase'
                                                                }}>
                                                                    Pro
                                                                </span>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Main Navigation */}
                            <div style={{ padding: '0 4px' }}>
                                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold', marginBottom: '12px', letterSpacing: '0.5px' }}>
                                    {t('management_section')}
                                </div>
                                <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {sidebarItems.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveTab(item.id)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '12px 14px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: activeTab === item.id ? '#ef4444' : 'transparent', // Red for admin
                                                color: activeTab === item.id ? 'white' : '#cbd5e1',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                fontWeight: activeTab === item.id ? '600' : '400',
                                                textAlign: 'left',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <item.icon size={18} />
                                            {item.label}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {/* User Profile */}
                        <div style={{ padding: '20px', borderTop: '1px solid #334155', background: '#0f172a' }}>
                            <div
                                onClick={() => navigate('/settings/profile')}
                                style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', cursor: 'pointer' }}
                            >
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    {currentUser?.name?.[0] || 'A'}
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.name || 'Admin'}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{currentUser?.email}</div>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    padding: '8px',
                                    borderRadius: '6px',
                                    border: '1px solid #ef4444',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    fontSize: '0.85rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <LogOut size={14} /> {t('logout')}
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div style={{ flex: 1, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {!isSidebarOpen && (
                    <header style={{ padding: '16px 24px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button onClick={toggleSidebar} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                <Menu size={24} />
                            </button>
                            <span style={{ fontWeight: '600', fontSize: '1.1rem', color: '#1e293b' }}>
                                {sidebarItems.find(i => i.id === activeTab)?.label}
                            </span>
                        </div>
                    </header>
                )}

                <main style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
