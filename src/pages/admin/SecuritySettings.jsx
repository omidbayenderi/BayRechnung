import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Smartphone, Fingerprint, ShieldAlert, History, ShieldCheck, QrCode, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const SecuritySettings = () => {
    const { enrollMFA, verifyMFA, unenrollMFA, listMFAFactors, logSecurityAction, currentUser, useSupabase } = useAuth();
    const { t } = useLanguage();
    const [factors, setFactors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // MFA Enrollment State
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [enrollmentData, setEnrollmentData] = useState(null);
    const [verificationCode, setVerificationCode] = useState('');

    useEffect(() => {
        loadFactors();
    }, []);

    const loadFactors = async () => {
        setLoading(true);
        const result = await listMFAFactors();
        if (result.success) {
            setFactors(result.factors);
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    const handleStartEnrollment = async () => {
        setLoading(true);
        setError(null);
        const result = await enrollMFA();
        if (result.success) {
            setEnrollmentData(result.data);
            setIsEnrolling(true);
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    const handleVerifyEnrollment = async () => {
        if (!verificationCode || verificationCode.length !== 6) return;
        setLoading(true);
        setError(null);
        const result = await verifyMFA(enrollmentData.id, verificationCode);
        if (result.success) {
            setSuccess('MFA successfully enabled!');
            setIsEnrolling(false);
            setEnrollmentData(null);
            setVerificationCode('');
            await loadFactors();
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    const handleUnenroll = async (factorId) => {
        if (!window.confirm('Are you sure you want to disable MFA? This reduces your account security.')) return;
        setLoading(true);
        const result = await unenrollMFA(factorId);
        if (result.success) {
            setSuccess('MFA factor removed.');
            await loadFactors();
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    const mfaEnabled = factors.some(f => f.status === 'verified');

    return (
        <div className="settings-container">
            <header className="settings-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="settings-icon" style={{ background: '#10b981' }}>
                        <Shield size={24} />
                    </div>
                    <div>
                        <h1>{t('securitySettings') || 'Security Settings'}</h1>
                        <p>{t('securitySettingsSub') || 'Protect your account with advanced security features'}</p>
                    </div>
                </div>
            </header>

            <div className="settings-grid">
                {/* Zero Trust Status Card */}
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <div style={{ padding: 8, background: 'rgba(59, 130, 246, 0.1)', borderRadius: 8, color: '#3b82f6' }}>
                            <ShieldCheck size={20} />
                        </div>
                        <h3 style={{ margin: 0 }}>Zero Trust Status</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <Lock size={18} style={{ color: '#94a3b8' }} />
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600 }}>Data Isolation</span>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>RLS Policies are active</span>
                                </div>
                            </div>
                            <span style={{ fontSize: '0.75rem', padding: '4px 8px', background: '#dcfce7', color: '#15803d', borderRadius: 4, fontWeight: 700 }}>ACTIVE</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <History size={18} style={{ color: '#94a3b8' }} />
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600 }}>Audit Logging</span>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Every sensitive action is tracked</span>
                                </div>
                            </div>
                            <span style={{ fontSize: '0.75rem', padding: '4px 8px', background: '#dcfce7', color: '#15803d', borderRadius: 4, fontWeight: 700 }}>ACTIVE</span>
                        </div>
                    </div>
                </motion.div>

                {/* MFA Card */}
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <div style={{ padding: 8, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 8, color: '#10b981' }}>
                            <Smartphone size={20} />
                        </div>
                        <h3 style={{ margin: 0 }}>Two-Factor Authentication (MFA)</h3>
                    </div>

                    {error && (
                        <div style={{ padding: 12, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 8, marginBottom: 16, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <ShieldAlert size={16} /> {error}
                        </div>
                    )}

                    {success && (
                        <div style={{ padding: 12, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: 8, marginBottom: 16, fontSize: '0.85rem' }}>
                            {success}
                        </div>
                    )}

                    {!isEnrolling ? (
                        <>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 20 }}>
                                Add an extra layer of security to your account by requiring more than just a password to log in.
                            </p>

                            {factors.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {factors.map(factor => (
                                        <div key={factor.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8 }}>
                                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                                <Smartphone size={18} style={{ color: '#10b981' }} />
                                                <div>
                                                    <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600 }}>Authenticator App</span>
                                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Status: {factor.status}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleUnenroll(factor.id)}
                                                style={{ padding: '6px 12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: 6, fontSize: '0.75rem', cursor: 'pointer' }}
                                            >
                                                Disable
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <button
                                    className="cta-button"
                                    disabled={loading}
                                    onClick={handleStartEnrollment}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                                >
                                    <Smartphone size={18} /> Enable MFA
                                </button>
                            )}
                        </>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ marginBottom: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                                    <div style={{ padding: 12, background: '#fff', borderRadius: 12 }}>
                                        <img src={enrollmentData.totp.qr_code} alt="MFA QR Code" style={{ width: 150, height: 150 }} />
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: 16 }}>
                                    Scan this QR code with your authenticator app (e.g., Google Authenticator, Authy).
                                </p>
                            </div>

                            <div className="form-group" style={{ textAlign: 'left' }}>
                                <label style={{ fontSize: '0.8rem' }}>Verification Code</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="123456"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    maxLength={6}
                                    style={{ textAlign: 'center', letterSpacing: 4, fontSize: '1.2rem' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                                <button
                                    className="btn-secondary"
                                    onClick={() => setIsEnrolling(false)}
                                    style={{ flex: 1 }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="cta-button"
                                    disabled={loading || verificationCode.length !== 6}
                                    onClick={handleVerifyEnrollment}
                                    style={{ flex: 1 }}
                                >
                                    Verify & Enable
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default SecuritySettings;
