import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import CommandPalette from './CommandPalette';
import SmartNotifications from './SmartNotifications';
import { Menu, LogOut, User, Bell, Grid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import SyncStatus from './SyncStatus';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    const { t } = useLanguage();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const [unreadCount, setUnreadCount] = useState(0);
    // Poll for notifications
    React.useEffect(() => {
        const checkNotifs = () => {
            const notifs = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
            setUnreadCount(notifs.filter(n => !n.read).length);
        };
        checkNotifs();
        const interval = setInterval(checkNotifs, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="modern-layout">
            <CommandPalette />
            <SmartNotifications />
            <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)}></div>

            <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

            <main className="main-content">
                {currentUser?.dbError === 'MIGRATION_REQUIRED' && (
                    <div style={{ background: '#fef2f2', borderBottom: '1px solid #fee2e2', padding: '12px 24px', color: '#b91c1c', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 2s infinite' }}></div>
                        <strong>Veritabanı Kurulumu Gerekli:</strong> Bazı tablolar eksik görünüyor. Lütfen Supabase SQL Editor üzerinden migrasyonları çalıştırın.
                        <button
                            onClick={() => navigate('/admin/health')}
                            style={{ marginLeft: 'auto', background: '#b91c1c', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                            Health Check
                        </button>
                    </div>
                )}

                <header className="mobile-header no-print" style={{ zIndex: 1100 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
                            <Menu size={24} />
                        </button>
                    </div>
                    <div className="mobile-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                        <div className="logo-icon">B</div>
                        <h2>{t('appName') || 'Rechnung'}</h2>
                    </div>

                    {currentUser && (
                        <div className="user-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* Notification Bell */}
                            <button
                                onClick={() => navigate('/messages')}
                                style={{ position: 'relative', cursor: 'pointer', padding: '6px', background: 'transparent', border: 'none' }}
                            >
                                <Bell size={18} color="#94a3b8" />
                                {unreadCount > 0 && (
                                    <span style={{
                                        position: 'absolute', top: '2px', right: '2px',
                                        background: '#ef4444', color: 'white',
                                        borderRadius: '50%', width: '14px', height: '14px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '8px', fontWeight: 'bold'
                                    }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => navigate('/settings/profile')}
                                style={{ display: 'flex', alignItems: 'center', background: 'transparent', border: 'none', padding: '4px' }}
                            >
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                    {currentUser.avatar ? <img src={currentUser.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : (currentUser.name?.charAt(0) || 'U')}
                                </div>
                            </button>
                        </div>
                    )}
                </header>

                <div className="content-wrapper">
                    <Outlet />
                </div>
            </main>
            <SyncStatus />
        </div>
    );
};

export default Layout;
