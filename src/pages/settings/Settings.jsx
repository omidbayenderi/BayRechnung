import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoice } from '../../context/InvoiceContext';
import { useAuth } from '../../context/AuthContext';
import { Save, Languages, User, Camera, LayoutDashboard, Mail, Shield, ChevronRight, XCircle, Trash2, X, Palette, RotateCcw, Check, Zap, Lock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { AnimatePresence } from 'framer-motion';
import PremiumUpgradeModal from '../../components/admin/PremiumUpgradeModal';

const Settings = () => {
    const navigate = useNavigate();
    const { companyProfile, updateProfile, invoiceCustomization, updateCustomization } = useInvoice();
    const { currentUser, updateUser } = useAuth();
    const { appLanguage, setAppLanguage, invoiceLanguage, setInvoiceLanguage, t, LANGUAGES } = useLanguage();
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState(companyProfile);
    const [customizationData, setCustomizationData] = useState(invoiceCustomization);
    const [managedItem, setManagedItem] = useState(null); // 'logo' or 'signature'
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [isSyncEnabled, setIsSyncEnabled] = useState(appLanguage === invoiceLanguage);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const PLAN_HIERARCHY = {
        'free': 0,
        'standard': 1,
        'premium': 2
    };

    // Fix: Sync local state when remote data loads
    useEffect(() => {
        if (companyProfile) {
            setFormData(companyProfile);
        }
    }, [companyProfile]);

    useEffect(() => {
        if (formData.logo && (!customizationData.brandPalette || customizationData.brandPalette.length === 0)) {
            extractColors(formData.logo).then(palette => {
                setCustomizationData(prev => ({ ...prev, brandPalette: palette }));
            });
        }
    }, [formData.logo]);

    const extractColors = (imageSrc) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 50; // High performance small scale
                canvas.height = 50;
                ctx.drawImage(img, 0, 0, 50, 50);

                const imageData = ctx.getImageData(0, 0, 50, 50).data;
                const colorMap = {};

                for (let i = 0; i < imageData.length; i += 4) {
                    const r = imageData[i];
                    const g = imageData[i + 1];
                    const b = imageData[i + 2];
                    const a = imageData[i + 3];

                    if (a < 128) continue; // Skip transparency

                    // Simple grouping to avoid too many similar colors
                    const rG = Math.round(r / 20) * 20;
                    const gG = Math.round(g / 20) * 20;
                    const bG = Math.round(b / 20) * 20;
                    const rgb = `rgb(${rG},${gG},${bG})`;

                    // Filter out greys (too close to each other)
                    const diff = Math.max(r, g, b) - Math.min(r, g, b);
                    if (diff < 30) continue;

                    // Filter out very light colors (backgrounds)
                    if (r > 240 && g > 240 && b > 240) continue;

                    colorMap[rgb] = (colorMap[rgb] || 0) + 1;
                }

                let sortedColors = Object.entries(colorMap)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 8) // More options
                    .map(c => c[0]);

                // If no colors found (maybe all filtered out), try again without strict filters
                if (sortedColors.length < 2) {
                    const fallbackMap = {};
                    for (let i = 0; i < imageData.length; i += 4) {
                        const r = imageData[i], g = imageData[i + 1], b = imageData[i + 2], a = imageData[i + 3];
                        if (a < 128 || (r > 250 && g > 250 && b > 250)) continue;
                        const rgb = `rgb(${Math.round(r / 10) * 10},${Math.round(g / 10) * 10},${Math.round(b / 10) * 10})`;
                        fallbackMap[rgb] = (fallbackMap[rgb] || 0) + 1;
                    }
                    sortedColors = Object.entries(fallbackMap)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 8)
                        .map(c => c[0]);
                }

                resolve(sortedColors);

            };
            img.src = imageSrc;
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePlanSelect = (targetPlan) => {
        const currentPlanLevel = PLAN_HIERARCHY[currentUser?.plan || 'free'];
        const targetPlanLevel = PLAN_HIERARCHY[targetPlan];

        if (targetPlanLevel > currentPlanLevel) {
            setShowUpgradeModal(true);
            return;
        }

        setFormData(prev => ({ ...prev, plan: targetPlan }));
    };

    const handleFileChange = (e, directItem = null) => {
        const file = e.target.files[0];
        if (file) {
            const itemType = directItem || managedItem;
            const reader = new FileReader();
            reader.onloadend = async () => {
                const result = reader.result;
                if (itemType === 'logo') {
                    setFormData(prev => ({ ...prev, logo: result }));
                    const palette = await extractColors(result);
                    setCustomizationData(prev => ({ ...prev, brandPalette: palette }));
                } else if (itemType === 'signature') {
                    setCustomizationData(prev => ({ ...prev, signatureUrl: result }));
                }
                setManagedItem(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteItem = () => {
        if (managedItem === 'logo') {
            setFormData(prev => ({ ...prev, logo: null }));
        } else if (managedItem === 'signature') {
            setCustomizationData(prev => ({ ...prev, signatureUrl: null }));
        }
        setManagedItem(null);
    };

    const handleSave = () => {
        updateProfile(formData);
        updateCustomization(customizationData);
        showNotification({
            type: 'success',
            title: t('saved') || 'Gespeichert!',
            message: t('saveSuccessful') || 'Ihre Änderungen wurden erfolgreich übernommen.'
        });
    };

    const handleLanguageChange = (code) => {
        setAppLanguage(code);
        if (isSyncEnabled) {
            setInvoiceLanguage(code);
        }
        setIsLangOpen(false);
    };

    return (
        <div className="page-container">
            {/* Unified Management Modal */}
            {managedItem && (
                <div className="modal-overlay" onClick={() => setManagedItem(null)}>
                    <div className="modal-content confirm-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <button className="modal-close" onClick={() => setManagedItem(null)}>
                            <X size={20} />
                        </button>

                        <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>
                            {managedItem === 'logo' ? (t('manageLogo') || 'Logo verwalten') : (t('manageSignature') || 'Signatur verwalten')}
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                            {managedItem === 'logo' ? (t('logoActionDescription') || 'Was möchten Sie mit Ihrem Logo tun?') : (t('signatureActionDescription') || 'Was möchten Sie mit Ihrer Signatur tun?')}
                        </p>

                        <div className="signature-modal-actions">
                            <label className="signature-action-option">
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: '#eff6ff', borderRadius: '8px', color: 'var(--primary)' }}>
                                    <Camera size={20} />
                                </span>
                                <div style={{ flex: 1 }}>
                                    <span style={{ fontWeight: '600', display: 'block' }}>
                                        {managedItem === 'logo' ? (t('changeLogo') || 'Logo ändern') : (t('changeSignature') || 'Signatur ändern')}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{t('changeImageDesc')}</span>
                                </div>
                                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                            </label>

                            <button className="signature-action-option delete" onClick={handleDeleteItem}>
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: '#fef2f2', borderRadius: '8px', color: '#ef4444' }}>
                                    <Trash2 size={20} />
                                </span>
                                <div style={{ flex: 1 }}>
                                    <span style={{ fontWeight: '600', display: 'block' }}>
                                        {managedItem === 'logo' ? (t('deleteLogo') || 'Logo löschen') : (t('deleteSignature') || 'Signatur löschen')}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{t('deleteImageDesc')}</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <header className="page-header">
                <div>
                    <h1>{t('settings')}</h1>
                    <p>{t('companySettings')}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {/* Modern Apple-style Language Dropdown */}
                    <div style={{ position: 'relative' }}>
                        <button
                            className="secondary-btn"
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'white',
                                borderRadius: '12px',
                                padding: '8px 16px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                border: '1px solid #e2e8f0',
                                width: '160px',
                                justifyContent: 'space-between'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>{LANGUAGES.find(l => l.code === appLanguage)?.flag}</span>
                                <span style={{ fontWeight: '500' }}>{LANGUAGES.find(l => l.code === appLanguage)?.label}</span>
                            </div>
                            <ChevronRight size={16} style={{ transform: isLangOpen ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform 0.2s' }} />
                        </button>

                        {isLangOpen && (
                            <>
                                <div
                                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}
                                    onClick={() => setIsLangOpen(false)}
                                />
                                <div style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 8px)',
                                    right: 0,
                                    width: '180px',
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '14px',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    padding: '6px',
                                    zIndex: 101,
                                    overflow: 'hidden'
                                }}>
                                    {LANGUAGES.map(lang => (
                                        <button
                                            key={lang.code}
                                            onClick={() => handleLanguageChange(lang.code)}
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '10px 12px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: appLanguage === lang.code ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                                color: appLanguage === lang.code ? 'var(--primary)' : '#475569',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s',
                                                fontSize: '0.9rem',
                                                fontWeight: appLanguage === lang.code ? '600' : '500',
                                                textAlign: 'left'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (appLanguage !== lang.code) e.target.style.background = 'rgba(0, 0, 0, 0.03)';
                                            }}
                                            onMouseLeave={(e) => {
                                                if (appLanguage !== lang.code) e.target.style.background = 'transparent';
                                            }}
                                        >
                                            <span style={{ fontSize: '1.1rem' }}>{lang.flag}</span>
                                            {lang.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        className="secondary-btn"
                        onClick={() => navigate('/settings/profile')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white' }}
                    >
                        <User size={18} />
                        {t('profileText') || 'Profile'}
                    </button>
                    <button
                        className="secondary-btn"
                        onClick={() => navigate('/settings/security')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #10b981' }}
                    >
                        <Shield size={18} color="#10b981" />
                        <span style={{ color: '#10b981', fontWeight: 600 }}>{t('securityText') || 'Security'}</span>
                    </button>
                    <button className="primary-btn" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Save size={18} />
                        {t('save')}
                    </button>
                </div>
            </header>

            <div className="settings-grid">
                <div className="settings-card card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                        <Camera size={22} color="var(--primary)" />
                        <h3 style={{ margin: 0 }}>{t('logoAndSignature') || 'Logo & Signature'}</h3>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', marginBottom: '1.5rem' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Logo</label>
                            <div className="logo-preview-box" style={{ width: '100%', height: '100px' }}>
                                {formData.logo ? (
                                    <div className="signature-overlay-container" onClick={() => setManagedItem('logo')}>
                                        <img src={formData.logo} alt="Logo" style={{ maxHeight: '80px', maxWidth: '100%', objectFit: 'contain' }} />
                                        <button className="signature-action-btn" type="button">
                                            <XCircle size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
                                        <span className="overlay">{t('edit')}</span>
                                    </>
                                )}
                            </div>

                            {/* Brand Color Palette */}
                            {formData.logo && customizationData?.brandPalette?.length > 0 && (
                                <div style={{
                                    marginTop: '12px',
                                    padding: '12px',
                                    background: '#f8fafc',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Palette size={14} />
                                            {t('colorsFromLogo') || 'Colors from Logo'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setCustomizationData(prev => ({ ...prev, primaryColor: '#8B5CF6', accentColor: '#f1f5f9' }))}
                                            style={{
                                                fontSize: '0.7rem',
                                                background: 'none',
                                                border: 'none',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                        >
                                            <RotateCcw size={12} />
                                            {t('resetText') || 'Reset'}
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {customizationData.brandPalette.map((color, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setCustomizationData(prev => ({ ...prev, primaryColor: color, accentColor: `${color}15` }))}
                                                style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '50%',
                                                    background: color,
                                                    border: customizationData.primaryColor === color ? '2px solid white' : 'none',
                                                    boxShadow: customizationData.primaryColor === color ? '0 0 0 2px var(--primary)' : 'none',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    padding: 0
                                                }}
                                            >
                                                {customizationData.primaryColor === color && <Check size={14} color="white" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="form-group" style={{ flex: 1 }}>
                            <label>{t('signature')}</label>
                            <div className="logo-preview-box" style={{ width: '100%', height: '100px', borderStyle: customizationData?.signatureUrl ? 'solid' : 'dashed' }}>
                                {customizationData?.signatureUrl ? (
                                    <div className="signature-overlay-container" onClick={() => setManagedItem('signature')}>
                                        <img
                                            src={customizationData.signatureUrl}
                                            alt="Signature"
                                            style={{ height: '70px', width: 'auto', objectFit: 'contain' }}
                                        />
                                        <button className="signature-action-btn" type="button">
                                            <XCircle size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'signature')} />
                                        <span className="overlay">{t('uploadSignature')}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Languages size={18} color="var(--primary)" />
                                {t('invoiceLanguageLabel')}
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => {
                                const newSync = !isSyncEnabled;
                                setIsSyncEnabled(newSync);
                                if (newSync) setInvoiceLanguage(appLanguage);
                            }}>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{t('syncWithAppLanguage')}</span>
                                <div style={{
                                    width: '36px',
                                    height: '20px',
                                    background: isSyncEnabled ? 'var(--primary)' : '#cbd5e1',
                                    borderRadius: '10px',
                                    position: 'relative',
                                    transition: 'background 0.2s'
                                }}>
                                    <div style={{
                                        width: '16px',
                                        height: '16px',
                                        background: 'white',
                                        borderRadius: '50%',
                                        position: 'absolute',
                                        top: '2px',
                                        left: isSyncEnabled ? '18px' : '2px',
                                        transition: 'left 0.2s'
                                    }} />
                                </div>
                            </div>
                        </div>

                        {!isSyncEnabled && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px' }}>
                                {LANGUAGES.map(lang => (
                                    <button
                                        key={lang.code}
                                        onClick={() => setInvoiceLanguage(lang.code)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '8px',
                                            borderRadius: '8px',
                                            border: invoiceLanguage === lang.code ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                                            background: invoiceLanguage === lang.code ? '#eff6ff' : 'white',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        <span>{lang.flag}</span>
                                        <span style={{ fontWeight: invoiceLanguage === lang.code ? '600' : '400' }}>{lang.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {isSyncEnabled && (
                            <div style={{
                                padding: '10px 14px',
                                background: '#f8fafc',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <span style={{ fontSize: '1.2rem' }}>{LANGUAGES.find(l => l.code === invoiceLanguage)?.flag}</span>
                                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                    {t('invoiceLanguageLabel')}: <strong>{LANGUAGES.find(l => l.code === invoiceLanguage)?.label}</strong> (Otomatik Senkron)
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="form-group" style={{ marginTop: '1.5rem' }}>
                        <label>{t('logoDisplayMode')}</label>
                        <select className="form-input" name="logoDisplayMode" value={formData.logoDisplayMode || 'both'} onChange={handleChange}>
                            <option value="logoOnly">{t('logoOnly')}</option>
                            <option value="nameOnly">{t('nameOnly')}</option>
                            <option value="both">{t('bothLogoOnTop')}</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>{t('industry')}</label>
                        <select className="form-input" name="industry" value={formData.industry} onChange={handleChange}>
                            <option value="automotive">🚗 {t('automotive')}</option>
                            <option value="beauty">✨ {t('beauty')}</option>
                            <option value="cleaning">🧹 {t('cleaning')}</option>
                            <option value="general">💼 {t('generalService')}</option>
                            <option value="construction">🏗️ Bauwesen / İnşaat</option>
                            <option value="gastronomy">🍽️ Gastronomie / Gastronomi</option>
                            <option value="healthcare">🏥 Gesundheitswesen / Sağlık</option>
                            <option value="it">💻 IT & Technologie / Teknoloji</option>
                            <option value="retail">🛒 Einzelhandel / Perakende</option>
                            <option value="crafts">🔧 Handwerk / Zanaatkar</option>
                            <option value="consulting">📊 Beratung / Danışmanlık</option>
                            <option value="education">📚 Bildung / Eğitim</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>{t('companyName')}</label>
                            <input className="form-input" name="companyName" value={formData.companyName} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>{t('owner')}</label>
                            <input className="form-input" name="owner" value={formData.owner} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>{t('email')}</label>
                            <input className="form-input" name="email" value={formData.email} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>{t('phone')}</label>
                            <input className="form-input" name="phone" value={formData.phone} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div className="settings-card card">
                    <h3>{t('generalInfo')}</h3>
                    <div className="form-row">
                        <div className="form-group" style={{ flex: 2 }}>
                            <label>{t('street')}</label>
                            <input className="form-input" name="street" value={formData.street} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>{t('houseNum')}</label>
                            <input className="form-input" name="houseNum" value={formData.houseNum} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>{t('zip')}</label>
                            <input className="form-input" name="zip" value={formData.zip} onChange={handleChange} />
                        </div>
                        <div className="form-group" style={{ flex: 2 }}>
                            <label>{t('city')}</label>
                            <input className="form-input" name="city" value={formData.city} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>{t('taxId')}</label>
                            <input className="form-input" name="taxId" value={formData.taxId} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>{t('vatId')}</label>
                            <input className="form-input" name="vatId" value={formData.vatId} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div className="settings-card card full-width">
                    <h3>{t('bankDetails')}</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>{t('bankName')}</label>
                            <input className="form-input" name="bankName" value={formData.bankName} onChange={handleChange} />
                        </div>
                        <div className="form-group" style={{ flex: 2 }}>
                            <label>{t('iban')}</label>
                            <input className="form-input" name="iban" value={formData.iban} onChange={handleChange} placeholder="DE89 3704 0044 0532 0130 00" />
                        </div>
                        <div className="form-group">
                            <label>BIC / SWIFT</label>
                            <input className="form-input" name="bic" value={formData.bic || ''} onChange={handleChange} placeholder="COBADEFFXXX" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>{t('paymentTerms')}</label>
                        <textarea className="form-input" rows="3" name="paymentTerms" value={formData.paymentTerms} onChange={handleChange} />
                    </div>
                </div>

            </div>

            <div className="floating-actions">
                <button className="primary-btn" onClick={handleSave}>
                    <Save size={20} />
                    {t('save')}
                </button>
            </div>

            <AnimatePresence>
                {showUpgradeModal && (
                    <PremiumUpgradeModal
                        isOpen={showUpgradeModal}
                        onClose={() => setShowUpgradeModal(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Settings;
