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
        // Fix: If we are in the middle of fetching the true profile (isSkeleton), 
        // and we already assigned a probable role, allow the pass to prevent flicker.
        const userRole = currentUser?.role || 'worker';
        const hasAccess = allowedRoles.includes(userRole);

        // If authenticated but profile still loading, show a tiny delay or just allow if it's the admin shell
        if (isAuthenticated && !hasAccess && currentUser?.isSkeleton) {
            return null; // Silent wait for 0.1s while AuthContext finishes fetchUserData
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
