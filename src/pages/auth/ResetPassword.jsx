import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [errorMsg, setErrorMsg] = useState('');
    const [sessionReady, setSessionReady] = useState(false);

    // Supabase sends the user to /reset-password#access_token=... — we need to wait
    // for the onAuthStateChange PASSWORD_RECOVERY event before allowing the update.
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setSessionReady(true);
            }
        });
        // Also check if there's already an active session (e.g. user refreshed page)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) setSessionReady(true);
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (password.length < 8) {
            setErrorMsg('Şifre en az 8 karakter olmalıdır.');
            return;
        }
        if (password !== confirmPassword) {
            setErrorMsg('Şifreler eşleşmiyor.');
            return;
        }

        setStatus('loading');
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            setStatus('success');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setErrorMsg(err.message || 'Şifre güncellenemedi. Lütfen tekrar deneyin.');
            setStatus('error');
        }
    };

    const inputStyle = {
        width: '100%', padding: '12px 16px 12px 44px',
        border: '1.5px solid #e2e8f0', borderRadius: '10px',
        fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
        transition: 'border-color 0.2s', background: '#f8fafc'
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px'
        }}>
            <div style={{
                background: 'white', borderRadius: '20px', padding: '48px 40px',
                width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px'
                    }}>
                        <Lock size={28} color="white" />
                    </div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>
                        Yeni Şifre Belirle
                    </h1>
                    <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                        Hesabınız için güçlü bir şifre seçin.
                    </p>
                </div>

                {/* Success state */}
                {status === 'success' ? (
                    <div style={{
                        textAlign: 'center', padding: '32px 16px',
                        background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0'
                    }}>
                        <CheckCircle size={48} color="#16a34a" style={{ marginBottom: '16px' }} />
                        <h3 style={{ margin: '0 0 8px', color: '#15803d', fontWeight: '700' }}>
                            Şifre Güncellendi!
                        </h3>
                        <p style={{ margin: 0, color: '#16a34a', fontSize: '0.9rem' }}>
                            Giriş sayfasına yönlendiriliyorsunuz…
                        </p>
                    </div>
                ) : !sessionReady ? (
                    /* Waiting for Supabase magic link session */
                    <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b' }}>
                        <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', marginBottom: '16px', color: '#6366f1' }} />
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>Bağlantı doğrulanıyor…</p>
                        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
                    </div>
                ) : (
                    /* Reset form */
                    <form onSubmit={handleSubmit}>
                        {errorMsg && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px',
                                background: '#fee2e2', borderRadius: '10px', marginBottom: '20px',
                                border: '1px solid #fca5a5'
                            }}>
                                <AlertCircle size={18} color="#b91c1c" style={{ flexShrink: 0 }} />
                                <span style={{ color: '#b91c1c', fontSize: '0.875rem', fontWeight: '500' }}>{errorMsg}</span>
                            </div>
                        )}

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                Yeni Şifre
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="En az 8 karakter"
                                    style={{ ...inputStyle, paddingRight: '44px' }}
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(p => !p)}
                                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                Şifre Tekrar
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="Şifreyi tekrar girin"
                                    style={{
                                        ...inputStyle,
                                        paddingRight: '44px',
                                        borderColor: confirmPassword && password !== confirmPassword ? '#f87171' : undefined
                                    }}
                                    required
                                />
                                <button type="button" onClick={() => setShowConfirm(p => !p)}
                                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}>
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            style={{
                                width: '100%', padding: '13px', borderRadius: '10px', border: 'none',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white', fontWeight: '700', fontSize: '0.95rem',
                                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                                opacity: status === 'loading' ? 0.7 : 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            {status === 'loading' ? (
                                <>
                                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                    Güncelleniyor…
                                </>
                            ) : 'Şifremi Güncelle'}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            style={{
                                width: '100%', marginTop: '12px', padding: '12px', borderRadius: '10px',
                                border: '1.5px solid #e2e8f0', background: 'white', color: '#64748b',
                                fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer'
                            }}
                        >
                            Giriş Sayfasına Dön
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
