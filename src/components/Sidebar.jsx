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
// import ThemeToggle from './ThemeToggle';

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
        try {
            await logout();
        } catch (err) {
            console.error('[Sidebar] Logout error:', err);
        } finally {
            navigate('/login');
        }
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
            <div className="sidebar-header flex flex-col items-start pb-0">

                <div className="flex items-center w-full justify-between mb-1">
                    <div
                        className="sidebar-logo group"
                        onClick={() => setShowPanelSwitcher(!showPanelSwitcher)}
                        style={{
                            cursor: 'pointer', flex: 1, padding: '8px',
                            background: showPanelSwitcher ? 'rgba(255,255,255,0.05)' : 'transparent',
                            borderRadius: '12px', transition: 'all 0.2s'
                        }}
                    >
                        <div className="logo-icon shadow-lg transition-transform group-hover:scale-105" style={{ background: currentModule.color }}>
                            {companyProfile?.company_name?.charAt(0) || currentModule.name?.charAt(0) || 'B'}
                        </div>
                        <div className="flex flex-col ml-3">
                            <h2 className="text-white text-base font-bold leading-tight truncate max-w-[140px]">
                                {companyProfile?.company_name || 'BayRechnung'}
                            </h2>
                            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${showPanelSwitcher ? 'text-indigo-400' : 'text-white/40'}`}>
                                {currentModule.name} {showPanelSwitcher ? '▴' : '▾'}
                            </span>
                        </div>
                    </div>
                    {/* Close button removed as per user request */}

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
                                                background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                                                border: '1px solid',
                                                borderColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                transition: 'all 0.2s',
                                                width: '100%',
                                                color: isActive ? 'white' : 'rgba(255,255,255,0.5)'
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

            <div className="sidebar-footer px-4 py-6 flex flex-col gap-3">
                {/* User profile with glassmorphism */}
                <div
                    className="user-mini-profile flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all group shadow-lg"
                    onClick={() => { closeSidebar(); navigate('/settings/profile'); }}
                    style={{ cursor: 'pointer' }}
                    title={t('goToProfileSettings') || 'Go to Profile Settings'}
                >
                    <div className="avatar w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/80 to-purple-600/80 flex items-center justify-center font-bold overflow-hidden shadow-inner backdrop-blur-sm">
                        {currentUser?.avatar ? (
                            <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            currentUser?.name?.charAt(0) || 'U'
                        )}
                    </div>
                    <div className="info flex-1">
                        <span className="name text-sm font-bold text-white block truncate">{currentUser?.name || 'User'}</span>
                        <span className="role text-[10px] font-bold text-white/40 block uppercase tracking-wider">{currentUser?.role || 'Yönetici'}</span>
                    </div>
                </div>

                {/* Logout button with glassmorphism */}
                <button
                    className="logout-btn w-full p-3 flex items-center gap-3 rounded-2xl bg-white/5 hover:bg-rose-500/10 backdrop-blur-md transition-all group active:scale-95 shadow-lg"
                    onClick={handleLogout}
                    style={{ border: 'none' }}
                >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 group-hover:bg-rose-500/20 transition-colors backdrop-blur-sm">
                        <LogOut size={16} className="text-white/40 group-hover:text-rose-400" />
                    </div>
                    <span className="text-[14px] font-black uppercase tracking-[0.1em] text-white/40 group-hover:text-rose-300">{t('logout')}</span>
                </button>
            </div>


        </aside>
    );
};

export default Sidebar;
