import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Building2, Upload, Briefcase, ChevronRight,
    CheckCircle2, Store, HardHat, Car, Laptop
} from 'lucide-react';
import { useInvoice } from '../../context/InvoiceContext';
import { useLanguage } from '../../context/LanguageContext';

const Onboarding = () => {
    const { t } = useLanguage();
    const { companyProfile, updateProfile } = useInvoice();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [localData, setLocalData] = useState({
        logo: companyProfile?.logo || null,
        industry: companyProfile?.industry || 'general',
        taxId: companyProfile?.taxId || '',
        vatId: companyProfile?.vatId || '',
        bankName: companyProfile?.bankName || '',
        iban: companyProfile?.iban || ''
    });

    const industries = [
        { id: 'construction', icon: HardHat, label: 'İnşaat / Mimarlık' },
        { id: 'automotive', icon: Car, label: 'Otomotiv' },
        { id: 'retail', icon: Store, label: 'Perakende / Satış' },
        { id: 'service', icon: Briefcase, label: 'Hizmet Sektörü' },
        { id: 'technology', icon: Laptop, label: 'Teknoloji / Yazılım' }
    ];

    const handleNext = async () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            setLoading(true);
            try {
                await updateProfile(localData);
                navigate('/admin');
            } catch (err) {
                console.error('Onboarding update error:', err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // In a real app, you'd upload to Supabase storage here.
            // For now, we simulate.
            const reader = new FileReader();
            reader.onloadend = () => {
                setLocalData({ ...localData, logo: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="landing-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="landing-bg-glow"></div>

            <motion.div
                className="glass-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ maxWidth: '600px', width: '100%', padding: '40px', position: 'relative', overflow: 'hidden' }}
            >
                {/* Progress Bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)' }}>
                    <motion.div
                        animate={{ width: `${(step / 3) * 100}%` }}
                        style={{ height: '100%', background: 'linear-gradient(90deg, #4f46e5, #3b82f6)' }}
                    />
                </div>

                <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                        {step === 1 && 'Markanızı Tanıtalım'}
                        {step === 2 && 'Sektörünüzü Seçin'}
                        {step === 3 && 'Finansal Detaylar'}
                    </h2>
                    <p style={{ color: '#94a3b8' }}>
                        {step === 1 && 'Faturanızda yer alacak kurum logonuzu yükleyerek başlayın.'}
                        {step === 2 && 'Size en uygun araçları sunabilmemiz için sektörünüzü belirtin.'}
                        {step === 3 && 'Ödemelerinizi alabilmeniz için banka bilgilerinizi ekleyin.'}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            style={{ textAlign: 'center' }}
                        >
                            <label className="logo-upload-zone" style={{
                                display: 'block', padding: '40px', border: '2px dashed rgba(255,255,255,0.2)',
                                borderRadius: '16px', background: 'rgba(255,255,255,0.03)', cursor: 'pointer'
                            }}>
                                <input type="file" hidden onChange={handleLogoUpload} accept="image/*" />
                                {localData.logo ? (
                                    <img src={localData.logo} alt="Preview" style={{ maxHeight: '100px', margin: '0 auto' }} />
                                ) : (
                                    <>
                                        <Upload size={40} color="#6366f1" style={{ marginBottom: '12px' }} />
                                        <div style={{ fontWeight: 600, color: '#fff' }}>Logo Yükle</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>PNG, JPG (Max 2MB)</div>
                                    </>
                                )}
                            </label>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}
                        >
                            {industries.map(ind => {
                                const Icon = ind.icon;
                                const isSelected = localData.industry === ind.id;
                                return (
                                    <button
                                        key={ind.id}
                                        onClick={() => setLocalData({ ...localData, industry: ind.id })}
                                        style={{
                                            padding: '16px', borderRadius: '12px', border: isSelected ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                                            background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.03)',
                                            color: isSelected ? '#fff' : '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                                            cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center'
                                        }}
                                    >
                                        <Icon size={24} />
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{ind.label}</span>
                                    </button>
                                );
                            })}
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                        >
                            <div className="form-group">
                                <label style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>Vergi Dairesi / No</label>
                                <input
                                    className="form-input"
                                    value={localData.taxId}
                                    onChange={e => setLocalData({ ...localData, taxId: e.target.value })}
                                    placeholder="Kadıköy V.D / 1234567890"
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>Banka Adı</label>
                                <input
                                    className="form-input"
                                    value={localData.bankName}
                                    onChange={e => setLocalData({ ...localData, bankName: e.target.value })}
                                    placeholder="BayBank"
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>IBAN</label>
                                <input
                                    className="form-input"
                                    value={localData.iban}
                                    onChange={e => setLocalData({ ...localData, iban: e.target.value })}
                                    placeholder="TR00 0000..."
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        Adım {step} / 3
                    </div>
                    <button
                        className="cta-button"
                        onClick={handleNext}
                        disabled={loading}
                        style={{ padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                        {loading ? 'Kaydediliyor...' : (step === 3 ? 'Tamamla' : 'Devam Et')}
                        {!loading && <ChevronRight size={18} />}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Onboarding;
