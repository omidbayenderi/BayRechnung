import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, ClipboardList, Bell, LogOut } from 'lucide-react';

const WorkerLayout = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="worker-layout" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            background: '#f8fafc',
            maxWidth: '500px',
            margin: '0 auto',
            borderLeft: '1px solid #e2e8f0',
            borderRight: '1px solid #e2e8f0'
        }}>
            {/* Header */}
            <header style={{
                padding: '16px',
                background: 'white',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#8b5cf6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold'
                    }}>
                        {currentUser?.name?.charAt(0) || 'W'}
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{currentUser?.name}</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>Personel Paneli</div>
                    </div>
                </div>
                <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#64748b' }}>
                    <LogOut size={20} />
                </button>
            </header>

            {/* Main Content */}
            <main style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav style={{
                height: '64px',
                background: 'white',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                paddingBottom: 'env(safe-area-inset-bottom)'
            }}>
                <NavLink to="/worker/home" style={({ isActive }) => ({
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'none',
                    color: isActive ? '#8b5cf6' : '#64748b',
                    fontSize: '12px'
                })}>
                    <Home size={24} />
                    <span>Ana Sayfa</span>
                </NavLink>
                <NavLink to="/worker/report" style={({ isActive }) => ({
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'none',
                    color: isActive ? '#8b5cf6' : '#64748b',
                    fontSize: '12px'
                })}>
                    <ClipboardList size={24} />
                    <span>Günlük Rapor</span>
                </NavLink>
                <NavLink to="/worker/notifications" style={({ isActive }) => ({
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'none',
                    color: isActive ? '#8b5cf6' : '#64748b',
                    fontSize: '12px'
                })}>
                    <Bell size={24} />
                    <span>Bildirimler</span>
                </NavLink>
            </nav>
        </div>
    );
};

export default WorkerLayout;
