import React, { useState } from 'react';
import Sidebar from './Sidebar';
import CommandPalette from './CommandPalette';
import SmartNotifications from './SmartNotifications';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, LogOut, User, Bell } from 'lucide-react';
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
                <header className="mobile-header no-print" style={{ zIndex: 1000 }}>
                    <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <div className="mobile-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                        <div className="logo-icon">B</div>
                        <h2>{t('appName') || 'Rechnung'}</h2>
                    </div>

                    {currentUser && (
                        <div className="user-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {/* Notification Bell */}
                            <div
                                onClick={() => navigate('/messages')}
                                style={{ position: 'relative', cursor: 'pointer', padding: '8px' }}
                            >
                                <Bell size={20} color="#64748b" />
                                {unreadCount > 0 && (
                                    <span style={{
                                        position: 'absolute', top: '0', right: '0',
                                        background: '#ef4444', color: 'white',
                                        borderRadius: '50%', width: '16px', height: '16px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '10px', fontWeight: 'bold'
                                    }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </div>

                            <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                                <User size={18} />
                                <span className="hide-mobile">{currentUser.name}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    padding: '0.5rem 1rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    color: '#64748b',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.borderColor = '#cbd5e1';
                                    e.target.style.color = '#475569';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.borderColor = '#e2e8f0';
                                    e.target.style.color = '#64748b';
                                }}
                            >
                                <LogOut size={18} />
                                <span className="hide-mobile">Logout</span>
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
