import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft, Camera, User, Mail, Shield, Key, Save, Check, Globe, CreditCard, AlertCircle } from 'lucide-react';

const ProfileSettings = () => {
    const navigate = useNavigate();
    const { currentUser, updateUser } = useAuth();
    const { appLanguage, setAppLanguage, serviceLanguages, setServiceLanguage, t, LANGUAGES } = useLanguage();

    // ... (rest of state)

    // Helper to render language options
    const renderLanguageOptions = () => {
        // Fallback if LANGUAGES is undefined
        const langs = LANGUAGES || [
            { code: 'de', label: 'Deutsch' },
            { code: 'en', label: 'English' },
            { code: 'tr', label: 'Türkçe' },
            { code: 'fr', label: 'Français' },
            { code: 'es', label: 'Español' }
        ];
        return langs.map(lang => (
            <option key={lang.code} value={lang.code}>
                {lang.flag ? `${lang.flag} ` : ''}{lang.label}
            </option>
        ));
    };

    const [formData, setFormData] = useState({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        role: currentUser?.role || 'Administrator',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        stripePublicKey: currentUser?.stripePublicKey || '',
        stripeSecretKey: currentUser?.stripeSecretKey || '',
        paypalClientId: currentUser?.paypalClientId || ''
    });

    // Sync form data with currentUser once loaded/updated
    useEffect(() => {
        if (currentUser) {
            setFormData(prev => ({
                ...prev,
                name: currentUser.name || prev.name,
                email: currentUser.email || prev.email,
                role: currentUser.role || prev.role,
                stripePublicKey: currentUser.stripePublicKey || prev.stripePublicKey,
                stripeSecretKey: currentUser.stripeSecretKey || prev.stripeSecretKey,
                paypalClientId: currentUser.paypalClientId || prev.paypalClientId
            }));
        }
    }, [currentUser]);
    const [saved, setSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                if (updateUser) {
                    setIsLoading(true);
                    await updateUser({ ...currentUser, avatar: reader.result });
                    setIsLoading(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (updateUser) {
            setIsLoading(true);
            const result = await updateUser({
                ...currentUser,
                name: formData.name,
                email: formData.email,
                role: formData.role,
                stripePublicKey: formData.stripePublicKey,
                stripeSecretKey: formData.stripeSecretKey,
                paypalClientId: formData.paypalClientId
            });
            setIsLoading(false);

            if (result.success) {
                setSaved(true);
                showToast(t('saveSuccessful') || 'Başarıyla güncellendi!', 'success');
                setTimeout(() => setSaved(false), 2000);
            } else {
                showToast(result.error || 'Update failed', 'error');
            }
        }
    };

    return (
        <div className="page-container" style={{ position: 'relative' }}>
            {/* Custom Toast Notification */}
            {toast && (
                <div style={{
                    position: 'fixed',
                    top: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: toast.type === 'error' ? '#fee2e2' : '#dcfce7',
                    color: toast.type === 'error' ? '#b91c1c' : '#15803d',
                    padding: '12px 24px',
                    borderRadius: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    zIndex: 9999,
                    animation: 'slideDown 0.3s ease-out forwards',
                    fontWeight: '600',
                    fontSize: '14px',
                    border: `1px solid ${toast.type === 'error' ? '#fca5a5' : '#86efac'}`
                }}>
                    {toast.type === 'error' ? <AlertCircle size={20} /> : <Check size={20} />}
                    {toast.message}
                </div>
            )}

            <header className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button className="icon-btn" onClick={() => navigate('/settings')}>
                        <ArrowLeft />
                    </button>
                    <div>
                        <h1>{t('profileSettings') || (appLanguage === 'tr' ? 'Profil Ayarları' : 'Profileinstellungen')}</h1>
                        <p>{t('backToSettings') || (appLanguage === 'tr' ? 'Ayarlara Geri Dön' : 'Zurück zu Einstellungen')}</p>
                    </div>
                </div>
                <button
                    className="primary-btn"
                    onClick={handleSave}
                    disabled={isLoading}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '140px', justifyContent: 'center' }}
                >
                    {isLoading ? <span className="spinner" style={{ width: '18px', height: '18px' }}></span> : (saved ? <Check size={20} /> : <Save size={20} />)}
                    {saved ? t('saved') : t('saveChanges') || (appLanguage === 'tr' ? 'Değişiklikleri Kaydet' : 'Änderungen speichern')}
                </button>
            </header>

            <div className="settings-grid">
                {/* Profile Picture Card */}
                <div className="settings-card card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '48px',
                            fontWeight: '700',
                            color: 'white',
                            margin: '0 auto',
                            overflow: 'hidden',
                            border: '4px solid #e2e8f0'
                        }}>
                            {currentUser?.avatar ? (
                                <img src={currentUser.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                currentUser?.name?.charAt(0) || 'U'
                            )}
                        </div>
                        <label style={{
                            position: 'absolute',
                            bottom: '4px',
                            right: 'calc(50% - 60px)',
                            width: '36px',
                            height: '36px',
                            background: 'var(--primary)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            border: '3px solid white'
                        }}>
                            <Camera size={16} color="white" />
                            <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                        </label>
                    </div>
                    <h3 style={{ margin: '0 0 4px 0' }}>{currentUser?.name || 'User'}</h3>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{currentUser?.email}</p>
                    <span style={{
                        display: 'inline-block',
                        marginTop: '12px',
                        padding: '4px 12px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500'
                    }}>
                        {currentUser?.role || 'Administrator'}
                    </span>
                </div>

                {/* Personal Information */}
                <div className="settings-card card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                        <User size={22} color="var(--primary)" />
                        <h3 style={{ margin: 0 }}>{t('personalInfo') || (appLanguage === 'tr' ? 'Kişisel Bilgiler' : 'Persönliche Informationen')}</h3>
                    </div>

                    <div className="form-group">
                        <label>{t('fullName')}</label>
                        <input
                            type="text"
                            className="form-input"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Max Mustermann"
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('email')}</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="email"
                                className="form-input"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                style={{ paddingLeft: '40px' }}
                                placeholder="email@example.com"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>{t('role')}</label>
                        <div style={{ position: 'relative' }}>
                            <Shield size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <select
                                className="form-input"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                style={{ paddingLeft: '40px' }}
                            >
                                <option value="admin">Administrator</option>
                                <option value="site_lead">Manager / Site Lead</option>
                                <option value="finance">Accountant / Finance</option>
                                <option value="worker">Employee / Worker</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="settings-card card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                        <Key size={22} color="var(--primary)" />
                        <h3 style={{ margin: 0 }}>{t('security') || (appLanguage === 'tr' ? 'Güvenlik' : 'Sicherheit')}</h3>
                    </div>

                    <div className="form-group">
                        <label>{t('currentPassword') || (appLanguage === 'tr' ? 'Mevcut Şifre' : 'Aktuelles Passwort')}</label>
                        <input
                            type="password"
                            className="form-input"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('newPassword') || (appLanguage === 'tr' ? 'Yeni Şifre' : 'Neues Passwort')}</label>
                        <input
                            type="password"
                            className="form-input"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('confirmPassword')}</label>
                        <input
                            type="password"
                            className="form-input"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                        />
                    </div>
                </div>



                {/* Language & Region */}
                <div className="settings-card card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                        <Globe size={22} color="var(--primary)" />
                        <h3 style={{ margin: 0 }}>{t('language') || (appLanguage === 'tr' ? 'Dil ve Bölge' : 'Sprache & Region')}</h3>
                    </div>

                    <div className="form-group">
                        <label>{t('appLanguageLabel') || (appLanguage === 'tr' ? 'Uygulama Dili (Arayüz)' : 'Anwendungs-Sprache')}</label>
                        <select
                            className="form-input"
                            value={appLanguage}
                            onChange={(e) => setAppLanguage(e.target.value)}
                        >
                            {renderLanguageOptions()}
                        </select>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            {appLanguage === 'tr' ? 'Menüler ve butonlar bu dilde görünecektir.' : 'Menüs und Schaltflächen werden in dieser Sprache angezeigt.'}
                        </p>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
