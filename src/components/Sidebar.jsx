import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, PlusCircle, Archive, BarChart3, Receipt, Repeat, X, LogOut, Users, Building, MessageSquare, Briefcase, Grid, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { usePanel } from '../context/PanelContext';
import { useInvoice } from '../context/InvoiceContext';
import ConnectionDiagnostics from './Debug/ConnectionDiagnostics';

const Sidebar = ({ isOpen, closeSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t, appLanguage } = useLanguage();
    const { currentUser, logout } = useAuth();
    const { activePanel, switchPanel, modules, getMenuItems } = usePanel();
    const { companyProfile } = useInvoice(); // Using import
    const [showPanelSwitcher, setShowPanelSwitcher] = useState(false);
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 1024;

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const currentModule = modules.find(m => m.id === activePanel) || modules[0];
    let menuItems = getMenuItems(t);

    // Filter items based on industry restrictions
    if (companyProfile?.industry) {
        menuItems = menuItems.filter(item => {
            if (item.industryOnly) {
                return item.industryOnly.includes(companyProfile.industry);
            }
            return true;
        });
    }

    // Listen for external trigger (mobile header grid icon)
    React.useEffect(() => {
        const handleOpenSwitcher = () => setShowPanelSwitcher(true);
        window.addEventListener('open-panel-switcher', handleOpenSwitcher);
        return () => window.removeEventListener('open-panel-switcher', handleOpenSwitcher);
    }, []);

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>

            {/* Header with Panel Switcher Trigger */}
            <div className="sidebar-header" style={{ flexDirection: 'column', alignItems: 'flex-start', paddingBottom: '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div
                        className="sidebar-logo"
                        onClick={() => setShowPanelSwitcher(!showPanelSwitcher)}
                        style={{
                            cursor: 'pointer', flex: 1, padding: '8px',
                            background: showPanelSwitcher ? 'rgba(255,255,255,0.05)' : 'transparent',
                            borderRadius: '12px', transition: 'all 0.2s'
                        }}
                    >
                        <div className="logo-icon" style={{ background: currentModule.color }}>{currentModule.name.charAt(0)}</div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <h2 style={{ fontSize: '1.1rem' }}>{currentModule.name}</h2>
                            <span style={{ fontSize: '0.7rem', color: showPanelSwitcher ? 'var(--primary)' : 'rgba(255,255,255,0.5)', fontWeight: '600' }}>
                                {t('module_switch') || 'Sistem Değiştir'} {showPanelSwitcher ? '▴' : '▾'}
                            </span>
                        </div>
                    </div>
                    <button className="close-sidebar no-desktop" onClick={closeSidebar}>
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Panel Switcher Dropdown Area */}
            <AnimatePresence>
                {showPanelSwitcher && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden', padding: '12px', background: 'rgba(0,0,0,0.2)', margin: '0 12px 12px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                        <div style={{ padding: '4px 0' }}>
                            <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: '700', marginBottom: '12px', paddingLeft: '8px' }}>{t('apps_title') || 'AKTİF PANELLER'}</p>
                            <div style={{ display: 'grid', gap: '4px' }}>
                                {modules.map(mod => {
                                    const isLocked = mod.premium && currentUser?.plan !== 'premium';
                                    const isActive = activePanel === mod.id;
                                    return (
                                        <button
                                            key={mod.id}
                                            onClick={() => {
                                                if (isLocked) {
                                                    navigate('/admin?tab=subscription');
                                                    setShowPanelSwitcher(false);
                                                    return;
                                                }
                                                switchPanel(mod.id);
                                                setShowPanelSwitcher(false);
                                            }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '10px',
                                                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                transition: 'all 0.2s',
                                                width: '100%',
                                                color: isActive ? 'white' : 'rgba(255,255,255,0.7)'
                                            }}
                                        >
                                            <div style={{ color: isActive ? 'white' : mod.color, position: 'relative' }}>
                                                {mod.icon({ size: 18 })}
                                                {isLocked && (
                                                    <div style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#1e293b', color: 'white', borderRadius: '50%', padding: '2px', border: '1px solid white' }}>
                                                        <Lock size={8} />
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: isActive ? '700' : '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {mod.name}
                                                    {isLocked && <span style={{ fontSize: '0.6rem', background: '#fef3c7', color: '#92400e', padding: '1px 5px', borderRadius: '4px', textTransform: 'uppercase' }}>Pro</span>}
                                                </div>
                                            </div>
                                            {isActive && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary)' }}></div>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <nav className="sidebar-nav">
                <div style={{ padding: '0 20px', marginBottom: '10px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600' }}>
                    {t('menu')}
                </div>
                {menuItems.map((item) => {
                    const currentFullPath = location.pathname + location.search;

                    // Improved matching: 
                    // 1. If path has query, match full path exactly OR if current path starts with it
                    // 2. If path is simple, match pathname exactly
                    const isActive = item.path.includes('?')
                        ? (currentFullPath === item.path || (currentFullPath === '/admin' && item.path.includes('tab=overview')))
                        : (location.pathname === item.path && !location.search);

                    return (
                        <motion.div
                            key={item.path}
                            onClick={() => { navigate(item.path); closeSidebar(); }}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            style={{ cursor: 'pointer' }}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                            {isActive && (
                                <motion.div
                                    className="nav-active-indicator"
                                    layoutId="activeNav"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </motion.div>
                    );
                })}
            </nav>

            {/* System Health Diagnostics in Sidebar (Admin Only) */}
            <ConnectionDiagnostics variant="sidebar" />

            <div className="sidebar-footer">
                <div
                    className="user-mini-profile"
                    onClick={() => { closeSidebar(); navigate('/settings/profile'); }}
                    style={{ cursor: 'pointer' }}
                    title={t('goToProfileSettings') || 'Go to Profile Settings'}
                >
                    <div className="avatar">
                        {currentUser?.avatar ? (
                            <img src={currentUser.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            currentUser?.name?.charAt(0) || 'U'
                        )}
                    </div>
                    <div className="info">
                        <span className="name">{currentUser?.name || 'User'}</span>
                        <span className="role">{currentUser?.email || currentUser?.role || 'Administrator'}</span>
                    </div>
                </div>
                <button
                    className="logout-btn"
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        marginTop: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '8px',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(239, 68, 68, 0.15)';
                        e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                        e.target.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                    }}
                >
                    <LogOut size={16} />
                    {t('logout')}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
