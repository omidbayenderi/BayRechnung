import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * RoleGuardian protects components/routes based on user roles.
 * 
 * @param {Array} allowedRoles - List of roles that can access this content (e.g. ['admin', 'finance'])
 * @param {Boolean} redirectToLogin - If true, non-authenticated users are sent to /login
 * @param {React.Node} fallback - Component to show if user doesn't have required role
 */
const RoleGuardian = ({ children, allowedRoles = [], redirectToLogin = true, fallback = null }) => {
    const { currentUser, loading, isAuthenticated } = useAuth();

    // Loading handled by ProtectedRoute

    if (!isAuthenticated && redirectToLogin) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0) {
        // Role Normalization: Map display names to internal codes if needed
        const rawRole = currentUser?.role?.toLowerCase() || 'worker';
        const roleMap = {
            'administrator': 'admin',
            'manager': 'site_lead',
            'accountant': 'finance',
            'employee': 'worker'
        };
        const userRole = roleMap[rawRole] || rawRole;
        const hasAccess = allowedRoles.includes(userRole);

        // If authenticated but profile still loading, show a tiny delay
        if (isAuthenticated && !hasAccess && currentUser?.isSkeleton) {
            const [showRetry, setShowRetry] = React.useState(false);

            React.useEffect(() => {
                const timer = setTimeout(() => {
                    setShowRetry(true);
                }, 5000);
                return () => clearTimeout(timer);
            }, []);

            return (
                <div style={{ padding: '80px', textAlign: 'center' }}>
                    <div style={{ width: '30px', height: '30px', border: '3px solid #e2e8f0', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto' }}></div>
                    <p style={{ marginTop: '20px', color: '#64748b' }}>
                        {showRetry ? 'Bağlantı yavaş, profil hala yükleniyor...' : 'Profil yükleniyor...'}
                    </p>
                    {showRetry && (
                        <button
                            onClick={() => window.location.reload()}
                            style={{ marginTop: '16px', padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}
                        >
                            Sayfayı Yenile
                        </button>
                    )}
                </div>
            );
        }

        if (!hasAccess) {
            return fallback || (
                <div style={{ padding: '40px', textAlign: 'center', background: '#fff', minHeight: '100vh' }}>
                    <h2 style={{ color: '#0f172a', marginBottom: '10px' }}>Erişim Engellendi</h2>
                    <p style={{ color: '#64748b' }}>Bu bölümü görüntülemek için yetkiniz bulunmamaktadır.</p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        style={{ marginTop: '20px', padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        Tekrar Giriş Yap
                    </button>
                </div>
            );
        }
    }

    return children || <Outlet />;
};

export default RoleGuardian;
