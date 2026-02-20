import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, PlusCircle, Archive, BarChart3, Receipt, Repeat, X, LogOut, Users, Building, MessageSquare, Briefcase, Grid, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { usePanel } from '../context/PanelContext';

const Sidebar = ({ isOpen, closeSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t, appLanguage } = useLanguage();
    const { currentUser, logout } = useAuth();
    const { activePanel, switchPanel, modules, getMenuItems } = usePanel();
    const [showPanelSwitcher, setShowPanelSwitcher] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const currentModule = modules.find(m => m.id === activePanel) || modules[0];
    const menuItems = getMenuItems(t);

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>

            {/* Header with Panel Switcher Trigger */}
            <div className="sidebar-header" style={{ flexDirection: 'column', alignItems: 'flex-start', paddingBottom: '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div
                        className="sidebar-logo"
                        onClick={() => setShowPanelSwitcher(!showPanelSwitcher)}
                        style={{ cursor: 'pointer', flex: 1 }}
                    >
                        <div className="logo-icon" style={{ background: currentModule.color }}>{currentModule.name.charAt(0)}</div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <h2 style={{ fontSize: '1.1rem' }}>{currentModule.name}</h2>
                            <span style={{ fontSize: '0.7rem', opacity: 0.7, fontWeight: 'normal' }}>{t('module_switch')} ▾</span>
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
                        style={{ overflow: 'hidden', padding: '0 16px', background: 'var(--bg-body)', margin: '0 12px 12px 12px', borderRadius: '12px' }}
                    >
                        <div style={{ padding: '12px 0' }}>
                            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '8px' }}>{t('apps_title')}</p>
                            <div style={{ display: 'grid', gap: '8px' }}>
                                {modules.map(mod => {
                                    const isLocked = mod.premium && currentUser?.plan !== 'premium';
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
                                                gap: '10px',
                                                padding: '10px',
                                                background: activePanel === mod.id ? 'white' : 'transparent',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                transition: 'all 0.2s',
                                                boxShadow: activePanel === mod.id ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
                                                opacity: isLocked ? 0.7 : 1
                                            }}
                                        >
                                            <div style={{ color: mod.color, position: 'relative' }}>
                                                {mod.icon({ size: 18 })}
                                                {isLocked && (
                                                    <div style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#1e293b', color: 'white', borderRadius: '50%', padding: '2px', border: '1px solid white' }}>
                                                        <Lock size={8} />
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: isLocked ? '#94a3b8' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {mod.name}
                                                    {isLocked && <span style={{ fontSize: '0.65rem', background: '#fef3c7', color: '#92400e', padding: '1px 5px', borderRadius: '4px', textTransform: 'uppercase' }}>Pro</span>}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: isLocked ? '#cbd5e1' : 'var(--text-muted)' }}>{isLocked ? (t('premium_only') || 'Premium Plan Only') : mod.desc}</div>
                                            </div>
                                            {activePanel === mod.id && <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: mod.color }}></div>}
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
                    const isActive = location.pathname === item.path;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            onClick={closeSidebar}
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
                        </NavLink>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <div
                    className="user-mini-profile"
                    onClick={() => { closeSidebar(); navigate('/settings/profile'); }}
                    style={{ cursor: 'pointer' }}
                    title={appLanguage === 'tr' ? 'Profil Ayarlarına Git' : 'Zu Profileinstellungen'}
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
