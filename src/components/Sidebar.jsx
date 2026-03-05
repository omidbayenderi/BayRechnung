import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, PlusCircle, Archive, BarChart3, Receipt, Repeat, X, LogOut, Users, Building, MessageSquare, Briefcase, Grid, Lock, Clock, Calendar, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { usePanel } from '../context/PanelContext';
import { useInvoice } from '../context/InvoiceContext';
import { useAppointments } from '../context/AppointmentContext';
import ConnectionDiagnostics from './Debug/ConnectionDiagnostics';

const Sidebar = ({ isOpen, closeSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t, appLanguage } = useLanguage();
    const { currentUser, logout } = useAuth();
    const { activePanel, switchPanel, modules, getMenuItems } = usePanel();
    const { companyProfile } = useInvoice();
    const { pendingCount } = useAppointments();
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

            {/* Notification Badge Animation Component */}
            <style>
                {`
                    @keyframes pulse-red {
                        0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                        70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                        100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                    }
                    .badge-pulse {
                        animation: pulse-red 2s infinite;
                    }
                `}
            </style>

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
                        <div className="logo-icon" style={{ background: currentModule.color }}>
                            {currentModule.name?.charAt(0) || 'B'}
                        </div>
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
                                                {mod.id === 'appointments' && pendingCount > 0 && (
                                                    <div
                                                        className="badge-pulse"
                                                        style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: 'white', borderRadius: '50%', width: '12px', height: '12px', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid white' }}
                                                    >
                                                        {pendingCount}
                                                    </div>
                                                )}
                                                {isLocked && (
                                                    <div style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#1e293b', color: 'white', borderRadius: '50%', padding: '1px', border: '1px solid white' }}>
                                                        <Lock size={8} />
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: isActive ? '700' : '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {mod.name}
                                                    {isLocked && <span style={{ fontSize: '0.6rem', background: '#fef3c7', color: '#92400e', padding: '1px 5px', borderRadius: '4px', textTransform: 'uppercase' }}>{t('pro') || 'Pro'}</span>}
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
                    const isActive = item.path.includes('?')
                        ? (currentFullPath === item.path || (currentFullPath === '/admin' && item.path.includes('tab=overview')))
                        : (location.pathname === item.path && !location.search);

                    const isLocked = item.premium && currentUser?.plan !== 'premium';

                    return (
                        <motion.div
                            key={item.path}
                            onClick={() => {
                                if (isLocked) {
                                    navigate('/admin?tab=subscription');
                                } else {
                                    navigate(item.path);
                                }
                                closeSidebar();
                            }}
                            className={`nav-item ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                            style={{ cursor: 'pointer', opacity: isLocked ? 0.7 : 1, position: 'relative' }}
                        >
                            <item.icon size={20} />
                            <span style={{ flex: 1 }}>{item.label}</span>

                            {isLocked && (
                                <div style={{
                                    background: '#fef3c7',
                                    color: '#92400e',
                                    padding: '2px 6px',
                                    borderRadius: '6px',
                                    fontSize: '0.65rem',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    <Lock size={10} />
                                    {t('pro') || 'PRO'}
                                </div>
                            )}

                            {item.path.includes('bookings') && pendingCount > 0 && (
                                <span
                                    className="badge-pulse"
                                    style={{
                                        fontSize: '0.7rem',
                                        background: '#ef4444',
                                        color: 'white',
                                        padding: '2px 6px',
                                        borderRadius: '100px',
                                        fontWeight: '700'
                                    }}
                                >
                                    {pendingCount}
                                </span>
                            )}
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
                >
                    <LogOut size={16} />
                    {t('logout')}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
