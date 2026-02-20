import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Smartphone, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import BrandLogo from '../components/Branding/BrandLogo';

const Login = () => {
    const { login, isAuthenticated, verifyMFA, sendPasswordReset } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // Auth View State
    const [authView, setAuthView] = useState('login'); // 'login', 'mfa', 'forgot-password'
    const [mfaCode, setMfaCode] = useState('');
    const [activeFactorId, setActiveFactorId] = useState('');

    // Redirect if already logged in (and not requiring MFA)
    React.useEffect(() => {
        if (isAuthenticated && authView !== 'mfa') {
            navigate('/admin');
        }
    }, [isAuthenticated, navigate, authView]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!formData.email || !formData.password) {
            setError(t('fillAllFields') || 'Please fill all fields');
            setLoading(false);
            return;
        }

        try {
            const result = await login(formData.email, formData.password);
            if (result.success) {
                if (result.mfaRequired) {
                    setActiveFactorId(result.factors[0].id);
                    setAuthView('mfa');
                } else {
                    navigate('/admin');
                }
            } else {
                setError(result.error || t('invalidCredentials') || 'Invalid email or password');
            }
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleMfaSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (mfaCode.length !== 6) {
            setError('Please enter a valid 6-digit code');
            setLoading(false);
            return;
        }

        try {
            const result = await verifyMFA(activeFactorId, mfaCode);
            if (result.success) {
                navigate('/admin');
            } else {
                setError('Invalid MFA code. Please try again.');
            }
        } catch (err) {
            setError(err.message || 'MFA Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!formData.email) {
            setError('Please enter your email first to reset password');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const result = await sendPasswordReset(formData.email);
            if (result.success) {
                alert('A password reset link has been sent to your email.');
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError(err.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <motion.div
                className="glass-card auth-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="auth-header">
                    <BrandLogo size="large" />
                    <p style={{ color: '#94a3b8', marginTop: '1rem' }}>{t('welcomeBack') || 'Welcome back!'}</p>
                </div>

                {error && (
                    <motion.div
                        className="error-message"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        {error}
                    </motion.div>
                )}

                {authView === 'login' && (
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>
                                <Mail size={18} />
                                {t('email')}
                            </label>
                            <input
                                type="email"
                                className="form-input"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="user@example.com"
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                <Lock size={18} />
                                {t('password')}
                            </label>
                            <input
                                type="password"
                                className="form-input"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="form-extras">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span>{t('rememberMe')}</span>
                            </label>
                            <button
                                type="button"
                                className="link-text"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                                onClick={() => {
                                    setAuthView('forgot-password');
                                    setError('');
                                }}
                            >
                                {t('forgotPassword')}
                            </button>
                        </div>

                        <button type="submit" className="cta-button w-full" disabled={loading}>
                            <LogIn size={20} />
                            {loading ? (t('signingIn') || 'Signing in...') : t('signIn')}
                        </button>
                    </form>
                )}

                {authView === 'mfa' && (
                    <form onSubmit={handleMfaSubmit} className="auth-form">
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                borderRadius: '16px',
                                color: '#10b981',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1rem'
                            }}>
                                <Smartphone size={32} />
                            </div>
                            <h2 style={{ color: 'white', margin: 0 }}>Two-Factor Auth</h2>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                Enter the 6-digit code from your authenticator app.
                            </p>
                        </div>

                        <div className="form-group">
                            <input
                                type="text"
                                className="form-input"
                                value={mfaCode}
                                onChange={(e) => setMfaCode(e.target.value)}
                                placeholder="000000"
                                maxLength={6}
                                style={{
                                    textAlign: 'center',
                                    fontSize: '1.5rem',
                                    letterSpacing: '8px',
                                    fontWeight: 700
                                }}
                                autoFocus
                            />
                        </div>

                        <button type="submit" className="cta-button w-full" disabled={loading || mfaCode.length !== 6}>
                            <ShieldCheck size={20} />
                            {loading ? 'Verifying...' : 'Verify & Sign In'}
                        </button>

                        <button
                            type="button"
                            className="link-text w-full"
                            style={{ marginTop: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}
                            onClick={() => {
                                setAuthView('login');
                                setMfaCode('');
                                setError('');
                            }}
                        >
                            Back to password
                        </button>
                    </form>
                )}

                {authView === 'forgot-password' && (
                    <form onSubmit={handleForgotPassword} className="auth-form">
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ color: 'white', margin: 0, fontSize: '1.5rem' }}>Reset Password</h2>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                        </div>

                        <div className="form-group">
                            <label>
                                <Mail size={18} />
                                {t('email')}
                            </label>
                            <input
                                type="email"
                                className="form-input"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="user@example.com"
                                autoFocus
                            />
                        </div>

                        <button type="submit" className="cta-button w-full" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>

                        <button
                            type="button"
                            className="link-text w-full"
                            style={{ marginTop: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}
                            onClick={() => {
                                setAuthView('login');
                                setError('');
                            }}
                        >
                            Back to Login
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    <p>
                        {t('noAccount')} <Link to="/register" className="link-primary">{t('signUp')}</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
