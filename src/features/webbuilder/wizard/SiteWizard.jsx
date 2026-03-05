import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight, ChevronLeft, Check, Sparkles, Layout,
    Palette, Settings, Globe, Phone, MapPin, ShoppingBag, Calendar, CheckCircle2
} from 'lucide-react';
import { useSyncData } from '../hooks/useSyncData';
import { useWebsite } from '../../../context/WebsiteContext';
import { useNavigate } from 'react-router-dom';

const SiteWizard = () => {
    const { businessInfo, services, products, t } = useSyncData();
    const { updateSiteConfig, publishSite } = useWebsite();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [wizardData, setWizardData] = useState({
        name: businessInfo.name || '',
        phone: businessInfo.phone || '',
        address: businessInfo.address || '',
        theme: 'general',
        showServices: services.length > 0,
        showProducts: products.length > 0,
        slug: '',
    });

    const steps = [
        { id: 1, title: 'Identity', icon: Layout },
        { id: 2, title: 'Style', icon: Palette },
        { id: 3, title: 'Features', icon: Settings },
        { id: 4, title: 'Launch', icon: Globe },
    ];

    const THEMES = [
        { id: 'general', label: 'Professional', color: '#1e40af', desc: 'Sleek & modern business layout' },
        { id: 'beauty', label: 'Elegant', color: '#db2777', desc: 'Soft & premium aesthetic' },
        { id: 'construction', label: 'Solid', color: '#ea580c', desc: 'Technical & trustworthy feel' },
    ];

    const handleNext = () => step < 4 ? setStep(s => s + 1) : handleFinish();
    const handleBack = () => step > 1 && setStep(s => s - 1);

    const handleFinish = async () => {
        const config = {
            domain: wizardData.slug,
            slug: wizardData.slug,
            theme: {
                ...THEMES.find(t => t.id === wizardData.theme)?.config, // In case we add more detail
                primaryColor: THEMES.find(t => t.id === wizardData.theme)?.color || '#3b82f6',
            },
            category: wizardData.theme,
        };

        await updateSiteConfig(config);
        navigate('/website/editor');
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ width: '100%', maxWidth: '900px', background: 'white', borderRadius: '32px', boxShadow: '0 40px 100px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'flex' }}
            >
                {/* Fixed Side Progress */}
                <div style={{ width: '280px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '60px 40px', color: 'white' }}>
                    <div style={{ marginBottom: '60px' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ padding: '6px', background: '#3b82f6', borderRadius: '8px' }}><Sparkles size={20} /></div>
                            Aninda Website
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {steps.map(s => (
                            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', opacity: step >= s.id ? 1 : 0.4 }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '10px', background: step > s.id ? '#10b981' : (step === s.id ? '#3b82f6' : 'rgba(255,255,255,0.1)'),
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold'
                                }}>
                                    {step > s.id ? <Check size={16} /> : s.id}
                                </div>
                                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{s.title}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div style={{ flex: 1, padding: '60px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1 }}>
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '12px' }}>Your Business Identity</h2>
                                    <p style={{ color: '#64748b', marginBottom: '40px' }}>Let's start with the basics. These will be pre-filled on your site.</p>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        <Input label="Business Name" value={wizardData.name} onChange={v => setWizardData({ ...wizardData, name: v })} icon={<Layout size={18} />} />
                                        <Input label="Phone Number" value={wizardData.phone} onChange={v => setWizardData({ ...wizardData, phone: v })} icon={<Phone size={18} />} />
                                        <Input label="Address" value={wizardData.address} onChange={v => setWizardData({ ...wizardData, address: v })} icon={<MapPin size={18} />} />
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '12px' }}>Pick Your Theme</h2>
                                    <p style={{ color: '#64748b', marginBottom: '40px' }}>Choose a style that best represents your brand.</p>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {THEMES.map(t => (
                                            <div
                                                key={t.id}
                                                onClick={() => setWizardData({ ...wizardData, theme: t.id })}
                                                style={{
                                                    padding: '24px', borderRadius: '20px', border: `2px solid ${wizardData.theme === t.id ? t.color : '#f1f5f9'}`,
                                                    background: wizardData.theme === t.id ? `${t.color}05` : 'white', cursor: 'pointer', transition: 'all 0.2s',
                                                    display: 'flex', alignItems: 'center', gap: '20px'
                                                }}
                                            >
                                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                                    <Palette size={20} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{t.label}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{t.desc}</div>
                                                </div>
                                                {wizardData.theme === t.id && <CheckCircle2 size={24} color={t.color} />}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '12px' }}>Feature Integration</h2>
                                    <p style={{ color: '#64748b', marginBottom: '40px' }}>We've detected data from your other modules. What should we show?</p>

                                    <Toggle label="Services Section" desc="Show your services from the Booking module" active={wizardData.showServices} onToggle={() => setWizardData({ ...wizardData, showServices: !wizardData.showServices })} icon={<Calendar size={18} />} />
                                    <Toggle label="Product Showcase" desc="Display items from your Stock module" active={wizardData.showProducts} onToggle={() => setWizardData({ ...wizardData, showProducts: !wizardData.showProducts })} icon={<ShoppingBag size={18} />} />
                                    <Toggle label="Appointment Widget" desc="Allow customers to book directly on site" active={true} disabled={true} icon={<CheckCircle size={18} />} />
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '12px' }}>Almost There!</h2>
                                    <p style={{ color: '#64748b', marginBottom: '40px' }}>Give your website a unique address.</p>

                                    <div style={{ background: '#f8fafc', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' }}>Site Address</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                                            <Globe size={18} color="#94a3b8" />
                                            <input
                                                value={wizardData.slug}
                                                onChange={e => setWizardData({ ...wizardData, slug: e.target.value })}
                                                placeholder="your-business"
                                                style={{ flex: 1, border: 'none', outline: 'none', fontWeight: '700', fontSize: '1rem' }}
                                            />
                                            <span style={{ color: '#94a3b8', fontWeight: '600' }}>.bayzenit.com</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px' }}>
                        <button
                            onClick={handleBack}
                            style={{ padding: '16px 32px', borderRadius: '16px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '700', cursor: 'pointer', visibility: step === 1 ? 'hidden' : 'visible' }}
                        >
                            Back
                        </button>
                        <button
                            onClick={handleNext}
                            style={{
                                padding: '16px 40px', borderRadius: '16px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: '800', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.2)'
                            }}
                        >
                            {step === 4 ? 'Launch Website' : 'Continue'} <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const Input = ({ label, value, onChange, icon }) => (
    <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>{label}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
            <div style={{ color: '#94a3b8' }}>{icon}</div>
            <input
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontWeight: '600', fontSize: '1rem' }}
            />
        </div>
    </div>
);

const Toggle = ({ label, desc, active, onToggle, icon, disabled }) => (
    <div
        onClick={!disabled ? onToggle : undefined}
        style={{
            padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9', background: active ? '#eff6ff' : 'white',
            marginBottom: '16px', cursor: disabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '20px', opacity: disabled ? 0.6 : 1
        }}
    >
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: active ? '#3b82f6' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? 'white' : '#94a3b8' }}>
            {icon}
        </div>
        <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '800' }}>{label}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{desc}</div>
        </div>
        <div style={{ width: '50px', height: '26px', borderRadius: '50px', background: active ? '#10b981' : '#e2e8f0', position: 'relative', transition: 'all 0.3s' }}>
            <div style={{ width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', top: '4px', left: active ? '28px' : '4px', transition: 'all 0.3s' }}></div>
        </div>
    </div>
);

export default SiteWizard;
