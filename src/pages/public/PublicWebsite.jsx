import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Phone, Mail, MapPin, Calendar, ArrowRight, CheckCircle,
    Facebook, Instagram, Linkedin, Twitter, Menu, X, ShoppingBag, CreditCard, Trash2, User, LogIn, ChevronLeft, Clock
} from 'lucide-react';

import CustomerPanel from './components/common/CustomerPanel'; // Moved to common
import CheckoutModal from './components/common/CheckoutModal';
import BeautyTheme from './themes/BeautyTheme';
import ServiceTheme from './themes/ServiceTheme';
import ConstructionTheme from './themes/ConstructionTheme';
import { generateTheme } from './utils/ColorEngine';
import { getCategoryFromThemeId, getVariantFromThemeId } from './themes/themeConfig';
import SeoAgent from '../../components/SeoAgent';
import PublicAIAgent from './components/common/PublicAIAgent';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

// Remote Data Fetcher (Supabase)
const fetchPublicSiteData = async (domainOrSlug) => {
    try {
        console.warn('🔍 [Public] Starting fetch for:', domainOrSlug);
        const platformDomain = 'bayzenit.com';
        let effectiveSlug = domainOrSlug;
        let isPlatformSubdomain = false;

        // 1. Detect if it's a platform subdomain (e.g. firma.bayzenit.com)
        if (domainOrSlug && domainOrSlug.endsWith(platformDomain) && domainOrSlug !== platformDomain) {
            effectiveSlug = domainOrSlug.replace(`.${platformDomain}`, '').replace('www.', '');
            isPlatformSubdomain = true;
            console.warn('🔹 [Public] Platform subdomain detected:', effectiveSlug);
        }

        let userId = null;

        // 2. Smart Search: Find User/Tenant
        let profiles = null;
        try {
            const { data, error } = await supabase
                .from('company_settings')
                .select('user_id, company_name'); // Only select safe columns
            if (error) throw error;
            profiles = data;
        } catch (e) {
            console.warn('⚠️ [Public] Profile query failed (likely column mismatch):', e);
        }

        if (profiles) {
            console.warn('✅ [Public] Company Profiles found:', profiles.length);
            const slugify = (text) => text?.toLowerCase().trim().replace(/[ğğ]/g, 'g').replace(/[üü]/g, 'u').replace(/[şş]/g, 's').replace(/[ii]/g, 'i').replace(/[öö]/g, 'o').replace(/[çç]/g, 'c').replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
            const match = profiles.find(p => slugify(p.company_name) === effectiveSlug.toLowerCase());

            if (match) {
                userId = match.user_id;
                console.warn('🎯 [Public] MATCH FOUND! ID:', userId, 'Company:', match.company_name);
            } else {
                console.warn('⚠️ [Public] No match for slug:', effectiveSlug);
            }
        }

        // Search by direct domain if not found via slug
        if (!userId && domainOrSlug && domainOrSlug !== 'demo') {
            const { data: config } = await supabase.from('website_configs').select('user_id').eq('domain', domainOrSlug).maybeSingle();
            userId = config?.user_id;
        }

        // Fallback for demo
        if (!userId && (!domainOrSlug || domainOrSlug === 'demo')) {
            const { data: firstConfig } = await supabase.from('website_configs').select('user_id').limit(1).maybeSingle();
            userId = firstConfig?.user_id;
        }

        // SaaS Fallback: If no tenant found for subdomain, pick the first active site
        if (!userId) {
            console.warn('⚠️ [Public] No specific tenant found, using first active site as fallback.');
            const { data: first } = await supabase.from('website_configs').select('user_id').limit(1).maybeSingle();
            userId = first?.user_id;
        }

        if (!userId) {
            console.error('🛑 [Public] USER NOT FOUND (Site cannot load). Checked slug:', effectiveSlug);
            return null;
        }

        console.warn('🎯 [Public] Loading final data for User ID:', userId);

        // 3. Parallel Fetch all data for this user
        const [configRes, svcRes, staffRes, prodRes, settingsRes, profileRes] = await Promise.all([
            supabase.from('website_configs').select('*').eq('user_id', userId).maybeSingle(),
            supabase.from('services').select('*').eq('user_id', userId).order('name', { ascending: true }),
            supabase.from('staff').select('*').eq('user_id', userId).order('name', { ascending: true }),
            supabase.from('products').select('*').eq('user_id', userId).order('name', { ascending: true }),
            supabase.from('appointment_settings').select('*').eq('user_id', userId).maybeSingle(),
            supabase.from('company_settings').select('*').eq('user_id', userId).maybeSingle()
        ]);

        // 4. SaaS Intelligence: Provide dynamic boilerplate if config doesn't exist
        const profileData = profileRes?.data || {};
        const config = configRes?.data?.config?.siteConfig || {
            isPublished: true,
            theme: { primaryColor: '#3b82f6', mode: 'light', fontFamily: 'Inter' },
            category: profileData.industry || 'standard'
        };

        const sections = configRes?.data?.config?.sections || [
            { id: 'hero', type: 'hero', visible: true, data: { title: profileData.company_name || 'BayZenit Üyesi İşletme', subtitle: 'Kaliteli hizmetin adresi.' } },
            { id: 'products', type: 'products', visible: true, data: { autoPull: true, source: 'stock' } },
            { id: 'contact', type: 'contact', visible: true, data: { showMap: false } }
        ];

        // 5. Normalize Appointment Settings
        const rawSettings = settingsRes.data || {};
        const normalizedSettings = {
            services: svcRes.data || [],
            staff: staffRes.data || [],
            workingHours: {
                start: rawSettings.working_hours_start || config?.workingHours?.start || '09:00',
                end: rawSettings.working_hours_end || config?.workingHours?.end || '18:00'
            },
            workingDays: rawSettings.working_days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            holidays: rawSettings.holidays || [],
            breaks: rawSettings.breaks || { start: '13:00', end: '14:00', enabled: false }
        };

        return {
            domain: domainOrSlug,
            config,
            sections,
            profile: {
                companyName: profileData.company_name,
                email: profileData.email,
                phone: profileData.phone,
                address: profileData.address,
                industry: profileData.industry,
                city: profileData.city,
                zip: profileData.zip,
                street: profileData.street,
                houseNum: profileData.house_num
            },
            products: prodRes.data || [],
            appointmentSettings: normalizedSettings
        };
    } catch (err) {
        console.error('[Public] Error in fetchPublicSiteData:', err);
        return null;
    }
};

const getPublicSiteData = (domainOrSlug, userId = null) => {
    // Local fallback/preview logic (SAME as before)
    // Priority: If userId is provided (admin preview), use it. Otherwise fallback to global/demo keys.
    const getLocal = (key) => {
        if (userId) {
            const val = localStorage.getItem(`${key}_${userId}`);
            if (val) return val;
        }
        return localStorage.getItem(key);
    };

    const savedConfig = localStorage.getItem('website_config'); // Website config is usually not user-prefixed yet
    const savedSections = localStorage.getItem('website_sections');
    const companyProfile = getLocal('bay_profile');
    const stockProducts = getLocal('bay_products');
    const savedServices = getLocal('bay_services');
    const savedStaff = getLocal('bay_staff');
    const savedSettings = getLocal('bay_appointment_settings');
    const savedCustomization = getLocal('bay_invoice_customization');

    let appointmentSettings = savedSettings ? JSON.parse(savedSettings) : {
        workingHours: { start: '09:00', end: '18:00' },
        workingHoursWeekend: { start: '10:00', end: '16:00' },
        workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        holidays: []
    };
    if (savedServices) {
        appointmentSettings.services = JSON.parse(savedServices);
    }
    if (savedStaff) {
        appointmentSettings.staff = JSON.parse(savedStaff);
    }

    // Deep merge or ensure properties exist for local preview consistency
    if (!appointmentSettings.workingHours) appointmentSettings.workingHours = { start: '09:00', end: '18:00' };
    if (!appointmentSettings.workingHoursWeekend) appointmentSettings.workingHoursWeekend = { start: '10:00', end: '16:00' };
    if (!appointmentSettings.workingDays) appointmentSettings.workingDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    if (!appointmentSettings.holidays) appointmentSettings.holidays = [];

    // Explicitly extract the daily schedule for themes
    appointmentSettings.schedule = appointmentSettings.breaks?.schedule || null;

    return {
        config: savedConfig ? JSON.parse(savedConfig) : null,
        sections: savedSections ? JSON.parse(savedSections) : null,
        profile: companyProfile ? JSON.parse(companyProfile) : null,
        products: stockProducts ? JSON.parse(stockProducts) : [],
        customization: savedCustomization ? JSON.parse(savedCustomization) : null,
        appointmentSettings: appointmentSettings
    };
};

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Website Theme Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
                    <h2 style={{ color: '#ef4444' }}>Bir şeyler ters gitti.</h2>
                    <p style={{ color: '#64748b', marginBottom: '20px' }}>Site teması oluşturulurken bir hata oluştu.</p>
                    <button
                        onClick={() => {
                            localStorage.removeItem('website_config'); // Reset corrupt config if needed
                            window.location.reload();
                        }}
                        style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                        Ayarları Sıfırla ve Yenile
                    </button>
                    <details style={{ marginTop: '20px', color: '#94a3b8', fontSize: '0.8rem', textAlign: 'left', maxWidth: '600px', margin: '20px auto' }}>
                        <summary>Hata Detayları</summary>
                        <pre>{this.state.error?.toString()}</pre>
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

const PublicWebsite = ({ customDomain }) => {
    const { domain: urlDomain } = useParams(); // Capture /s/:domain for simulating subdomains locally
    const effectiveDomain = customDomain || urlDomain || 'demo';

    const [siteData, setSiteData] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null); // Amount or percentage
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);
    const { currentUser: adminUser } = useAuth(); // Logged-in admin previewing
    const { t: tApp, getT, appLanguage, serviceLanguages, setServiceLanguage, LANGUAGES } = useLanguage();
    // Dynamic Language Logic: If website language is set, use it. Otherwise use app language.
    const currentLang = serviceLanguages?.website || appLanguage || 'de';
    // Create specific translation function for the current language
    const t = getT ? getT(currentLang) : tApp;

    // Customer & Auth States
    const [currentUser, setCurrentUser] = useState(null);
    const [isCustomerPanelOpen, setIsCustomerPanelOpen] = useState(false);
    const [checkoutStep, setCheckoutStep] = useState('cart'); // cart, auth, address, payment
    const [authForm, setAuthForm] = useState({ email: '', password: '', name: '', phone: '', address: '' });
    const [authMode, setAuthMode] = useState('login'); // login, register

    useEffect(() => {
        const savedUser = localStorage.getItem('bay_current_user');
        if (savedUser) {
            const parsed = JSON.parse(savedUser);
            setCurrentUser(parsed);
            setAuthForm(prev => ({ ...prev, ...parsed }));
        }
    }, []);

    const handleAuthAction = (e) => {
        e.preventDefault();
        // MOCK AUTH
        if (authMode === 'login') {
            // Find user in local storage users array OR just mock success for demo
            const savedUser = {
                ...authForm,
                name: authForm.name || 'Demo Müşteri',
                address: authForm.address || 'Örnek Mah. Demo Cad. No:1',
                phone: authForm.phone || '05550000000'
            };
            setCurrentUser(savedUser);
            localStorage.setItem('bay_current_user', JSON.stringify(savedUser));
        } else {
            // Register
            const newUser = { ...authForm, id: Date.now() };
            setCurrentUser(newUser);
            localStorage.setItem('bay_current_user', JSON.stringify(newUser));
        }

        // Post-Auth Navigation
        if (cart.length > 0) {
            setCheckoutStep('address'); // Continue checkout flow
        } else {
            // Just logging in -> Show User Panel
            setIsCartOpen(false);
            setIsCustomerPanelOpen(true);
        }
    };

    const handleLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem('bay_current_user');
        setIsCustomerPanelOpen(false);
        setAuthForm({ email: '', password: '', name: '', phone: '', address: '' });
    };

    const handlePlaceOrder = () => {
        if (!currentUser) return;

        const newOrder = {
            id: `ORD-${Math.floor(Math.random() * 10000)}`,
            date: new Date().toISOString(),
            items: cart,
            total: document.getElementById('final-total-display')?.innerText || '0,00 €',
            status: 'pending',
            userEmail: currentUser.email,
            shippingAddress: currentUser.address
        };

        const allOrders = JSON.parse(localStorage.getItem('all_orders') || '[]');
        allOrders.push(newOrder);
        localStorage.setItem('all_orders', JSON.stringify(allOrders));

        setCart([]);
        setIsCartOpen(false);
        setCheckoutStep('cart');
        alert(`Siparişiniz alındı! Sipariş No: ${newOrder.id}`);
        setIsCustomerPanelOpen(true);
    };

    // Cart Actions
    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        setIsCartOpen(true); // Open cart to show feedback
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }));
    };

    const handleApplyDiscount = () => {
        // Mock Discount Logic (In a real app, this would check backend or config)
        if (discountCode.toUpperCase() === 'VIP10') {
            setAppliedDiscount({ type: 'percent', value: 10, code: 'VIP10' });
            alert("✨ %10 İndirim Uygulandı!");
        } else if (discountCode.toUpperCase() === 'BAY20') {
            setAppliedDiscount({ type: 'fixed', value: 20, code: 'BAY20' });
            alert("✨ 20€ İndirim Uygulandı!");
        } else {
            alert("❌ Geçersiz İndirim Kodu");
            setAppliedDiscount(null);
        }
    };

    // Calculate Totals
    const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const discountAmount = appliedDiscount
        ? (appliedDiscount.type === 'percent' ? (subtotal * appliedDiscount.value / 100) : appliedDiscount.value)
        : 0;
    const total = Math.max(0, subtotal - discountAmount);

    // Auto-Slide Effect
    useEffect(() => {
        if (siteData?.config?.hero?.mode === 'slider' && siteData?.products?.length > 0) {
            const interval = setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % siteData.products.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [siteData]);

    useEffect(() => {
        const loadData = async () => {
            console.warn('🎬 [Public] useEffect/loadData firing for:', effectiveDomain);
            // 1. Try Local First (Instant for Admin)
            // Use adminUser.id if logged in, otherwise default to demo/global keys
            const localData = getPublicSiteData(effectiveDomain, adminUser?.id);

            // If we have local data and it looks valid, show it first (optimistic)
            if (localData && localData.config) {
                setSiteData(localData);
                setLoading(false);
            }

            // 2. Fetch Fresh from Supabase (Source of Truth)
            try {
                console.warn('🌐 [Public] Fetching remote data for:', effectiveDomain);
                const remoteData = await fetchPublicSiteData(effectiveDomain);
                if (remoteData) {
                    setSiteData(prev => {
                        if (!prev) return remoteData;

                        // Helper for null-safe merge
                        const safeMerge = (local = {}, remote = {}) => {
                            const result = { ...local };
                            Object.entries(remote).forEach(([key, val]) => {
                                if (val !== null && val !== undefined && val !== '' && (Array.isArray(val) ? val.length > 0 : true)) {
                                    result[key] = val;
                                }
                            });
                            return result;
                        };

                        return {
                            ...prev,
                            config: safeMerge(prev.config, remoteData.config),
                            sections: (remoteData.sections && remoteData.sections.length > 0) ? remoteData.sections : prev.sections,
                            profile: safeMerge(prev.profile, remoteData.profile),
                            products: (remoteData.products && remoteData.products.length > 0) ? remoteData.products : prev.products,
                            appointmentSettings: (remoteData.appointmentSettings && Object.keys(remoteData.appointmentSettings).length > 0)
                                ? remoteData.appointmentSettings
                                : prev.appointmentSettings
                        };
                    });
                }
            } catch (err) {
                console.warn('[Public] Remote fetch failed, staying with local.', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();

        // --- REAL-TIME SUBSCRIPTION ---
        let subscription = null;
        if (effectiveDomain !== 'demo') {
            subscription = supabase.channel('public-site-changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'appointment_settings' }, async (payload) => {
                    console.log('[Public] Settings updated:', payload);
                    // Re-fetch everything to ensure consistent state
                    const remoteData = await fetchPublicSiteData(effectiveDomain);
                    if (remoteData) setSiteData(prev => ({ ...prev, ...remoteData }));
                })
                .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, async () => {
                    const remoteData = await fetchPublicSiteData(effectiveDomain);
                    if (remoteData) setSiteData(prev => ({ ...prev, appointmentSettings: { ...prev.appointmentSettings, services: remoteData.appointmentSettings.services } }));
                })
                .subscribe();
        }

        // Listen for storage events (for admin live preview in same browser)
        const handleStorageChange = () => {
            const data = getPublicSiteData(effectiveDomain, adminUser?.id);
            if (data && data.config) setSiteData(data);
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            if (subscription) supabase.removeChannel(subscription);
        };
    }, [effectiveDomain, adminUser?.id]);

    const inputStyle = {
        width: '100%', padding: '12px 16px', borderRadius: '10px',
        border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none',
        transition: 'border-color 0.2s', marginBottom: '8px'
    };

    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Yükleniyor...</div>;

    if (!siteData || !siteData.config) return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>Site Henüz Hazır Değil</h1>
            <p style={{ color: '#64748b' }}>Bu alan adı için yapılandırma bulunamadı. Lütfen yönetici panelinden site ayarlarını tamamlayın.</p>
        </div>
    );

    // --- THEME & COLOR ENGINE ---
    // Determine the primary brand color from various possible sources
    // PRIORITY: 1. Website Specific Config (WebsiteSettings) > 2. Global/Invoice Customization > 3. Profile Defaults
    const brandColor = siteData.config?.theme?.primaryColor
        || siteData.customization?.primaryColor
        || siteData.config?.primaryColor
        || siteData.profile?.brandColor
        || siteData.profile?.logoColor
        || '#3b82f6';

    // Determine secondary brand color
    const brandSecondaryColor = siteData.config?.theme?.secondaryColor
        || siteData.customization?.secondaryColor
        || null;

    const generatedPalette = generateTheme(brandColor, brandSecondaryColor);

    const theme = {
        ...generatedPalette, // Include all generated colors (primary, surface, text, etc.)
        primaryColor: generatedPalette.primary, // Legacy support
        secondaryColor: generatedPalette.primaryMedium, // Legacy support
        font: siteData.config?.theme?.fontFamily || '"Inter", sans-serif',
        borderRadius: '8px'
    };

    // --- THEME ENGINE DISPATCHER ---
    // Rule: Profile industry is the primary source of truth for the business type.
    // If it differs from the website config's category, we should prioritize the profile setting.


    const profileIndustry = siteData.profile?.industry || siteData.profile?.sector || 'general';
    const activeCategory = siteData.config.category || profileIndustry;


    const category = getCategoryFromThemeId(activeCategory.toLowerCase());
    const variant = getVariantFromThemeId(activeCategory.toLowerCase());



    // Props Bundle for Themes
    const themeProps = {
        siteData,
        themeColors: theme,
        variant, // Pass variant to theme components
        cartActions: { addToCart, removeFromCart, updateQuantity, setIsCartOpen, setCheckoutStep, handleApplyDiscount },
        userActions: { currentUser, setCurrentUser, isCustomerPanelOpen, setIsCustomerPanelOpen, handleLogout, handleAuthAction, handlePlaceOrder, authForm, setAuthForm, authMode, setAuthMode },
        state: { cart, isCartOpen, checkoutStep, discountCode, setDiscountCode, appliedDiscount, discountAmount, total, subtotal },
        languageActions: { t, currentLang, setServiceLanguage, LANGUAGES }
    };

    // Shared Overlay Logic (to avoid duplication in every if block)
    const renderOverlays = () => (
        <>
            <CheckoutModal
                isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} theme={theme}
                step={checkoutStep} setStep={setCheckoutStep}
                cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart}
                total={total} subtotal={subtotal}
                discountCode={discountCode} setDiscountCode={setDiscountCode} handleApplyDiscount={handleApplyDiscount} discountAmount={discountAmount} appliedDiscount={appliedDiscount}
                currentUser={currentUser} setCurrentUser={setCurrentUser}
                authMode={authMode} setAuthMode={setAuthMode} authForm={authForm} setAuthForm={setAuthForm} handleAuthAction={handleAuthAction}
                handlePlaceOrder={handlePlaceOrder} profile={siteData.profile}
                t={t}
            />

            {isCustomerPanelOpen && currentUser && (
                <CustomerPanel
                    user={currentUser}
                    onClose={() => setIsCustomerPanelOpen(false)}
                    onLogout={handleLogout}
                    theme={theme}
                    t={t}
                />
            )}

            {/* AI Assistant Agent */}
            <PublicAIAgent siteData={siteData} addToCart={addToCart} currentUser={currentUser} />
        </>
    );

    // --- THEME COMPONENT MAPPER ---
    // Map every industry category to a theme component
    const THEME_MAP = {
        // Service / Technical themes (Industrial but standard)
        general: ServiceTheme,
        automotive: ServiceTheme,
        crafts: ServiceTheme,
        it: ServiceTheme,

        // Elegant / Soft themes
        beauty: BeautyTheme,
        gastronomy: BeautyTheme,
        healthcare: BeautyTheme,
        retail: BeautyTheme,

        // Sharp / Professional / Corporate themes
        construction: ConstructionTheme,
        consulting: ConstructionTheme,
        education: ConstructionTheme,
    };

    const MatchedTheme = THEME_MAP[category];

    if (MatchedTheme) {
        return (
            <ErrorBoundary>
                <SeoAgent websiteData={{ sections: siteData.sections, hero: siteData.sections.find(s => s.type === 'hero')?.data, config: siteData.config }} profile={siteData.profile} />
                <MatchedTheme {...themeProps} />
                {renderOverlays()}
            </ErrorBoundary>
        );
    }

    // --- STANDARD THEME ---
    const { config, sections, profile, products } = siteData;
    // Helper to get visible sections sorted or by order
    const visibleSections = sections.filter(s => s.visible !== false);

    // Filter active products
    const activeProducts = (products || []).filter(p => Number(p.stock) > 0);

    // Check if any payment method is available for E-Commerce features
    const hasPaymentMethods = !!(profile?.stripeLink || profile?.stripeApiKey || profile?.paypalMe || profile?.iban);

    return (
        <ErrorBoundary>
            <div style={{ fontFamily: '"Inter", sans-serif', color: '#1e293b', lineHeight: 1.6 }}>
                <SeoAgent websiteData={{ sections, hero: sections.find(s => s.type === 'hero')?.data, config: siteData.config }} profile={profile} />

                {/* FLOATING CART BUTTON */}
                {cart.length > 0 && !isCartOpen && (
                    <button
                        onClick={() => setIsCartOpen(true)}
                        style={{
                            position: 'fixed', bottom: '30px', right: '30px', zIndex: 1900,
                            background: theme.primaryColor, color: 'white', border: 'none', borderRadius: '50%',
                            width: '64px', height: '64px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            animation: 'bounce 0.5s'
                        }}
                    >
                        <ShoppingBag size={28} />
                        <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white', fontSize: '0.8rem', fontWeight: 'bold', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                            {cart.reduce((a, b) => a + b.quantity, 0)}
                        </span>
                    </button>
                )}

                {/* AI Assistant Agent */}
                <PublicAIAgent siteData={siteData} addToCart={addToCart} currentUser={currentUser} />

                {/* CART & CHECKOUT MODAL (Modular) */}
                <CheckoutModal
                    isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} theme={theme}
                    step={checkoutStep} setStep={setCheckoutStep}
                    cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart}
                    total={total} subtotal={subtotal}
                    discountCode={discountCode} setDiscountCode={setDiscountCode} handleApplyDiscount={handleApplyDiscount} discountAmount={discountAmount} appliedDiscount={appliedDiscount}
                    currentUser={currentUser} setCurrentUser={setCurrentUser}
                    authMode={authMode} setAuthMode={setAuthMode} authForm={authForm} setAuthForm={setAuthForm} handleAuthAction={handleAuthAction}
                    handlePlaceOrder={handlePlaceOrder} profile={siteData.profile}
                    t={t}
                />
                {/* Navbar */}
                <header style={{
                    position: 'sticky', top: 0, zIndex: 1000,
                    background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid #e2e8f0'
                }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.primaryColor }}>
                            {profile?.companyName || 'Logo'}
                        </div>

                        {/* Desktop Nav */}
                        <nav className="desktop-nav" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                            {visibleSections.map(s => (
                                <a
                                    key={s.id}
                                    href={`#${s.id}`}
                                    style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500', textTransform: 'capitalize', fontSize: '0.95rem' }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                >
                                    {s.data.title || s.id}
                                </a>
                            ))}
                            <button
                                onClick={() => {
                                    if (currentUser) {
                                        setIsCustomerPanelOpen(true);
                                    } else {
                                        setAuthMode('login');
                                        setCheckoutStep('auth');
                                        setIsCartOpen(true);
                                    }
                                }}
                                style={{
                                    background: 'transparent', color: '#64748b', border: 'none',
                                    fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                    marginRight: '16px', fontSize: '0.95rem'
                                }}
                            >
                                {currentUser ? <User size={20} /> : <LogIn size={20} />}
                                {currentUser ? t('theme_nav_account') : t('theme_nav_login')}
                            </button>

                            {/* Language Selector */}
                            <select
                                value={currentLang}
                                onChange={(e) => setServiceLanguage('website', e.target.value)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '50px',
                                    padding: '8px 12px',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    color: theme.primaryColor,
                                    marginRight: '8px'
                                }}
                            >
                                {LANGUAGES?.map(lang => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.flag} {lang.code.toUpperCase()}
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={() => navigate(`/booking?domain=${effectiveDomain}`)}
                                style={{
                                    padding: '10px 24px',
                                    background: theme.primaryColor,
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    textDecoration: 'none',
                                    display: 'inline-block',
                                    boxShadow: `0 4px 12px ${theme.primaryColor}40`,
                                    transition: 'transform 0.2s',
                                    fontSize: '0.95rem'
                                }}
                                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {t('theme_cta_book')}
                            </button>
                        </nav>

                        {/* Customer Panel Overlay */}
                        {isCustomerPanelOpen && currentUser && (
                            <CustomerPanel
                                user={currentUser}
                                onClose={() => setIsCustomerPanelOpen(false)}
                                onLogout={handleLogout}
                                theme={theme}
                                t={t}
                            />
                        )}

                        {/* Mobile & Responsive CSS Injection */}
                        <button
                            className="mobile-toggle"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: theme.primaryColor }}
                        >
                            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>

                        {/* Mobile Language Selector */}
                        <select
                            value={currentLang}
                            onChange={(e) => setServiceLanguage('website', e.target.value)}
                            style={{
                                display: 'none', // Hidden on desktop via CSS if needed, but here inline first
                                marginLeft: '8px'
                            }}
                            className="mobile-lang-selector"
                        >
                            {LANGUAGES?.map(lang => (
                                <option key={lang.code} value={lang.code}>{lang.flag}</option>
                            ))}
                        </select>
                    </div>

                    {/* Mobile Menu Overlay */}
                    {mobileMenuOpen && (
                        <div style={{
                            position: 'absolute', top: '100%', left: 0, width: '100%', height: 'calc(100vh - 80px)',
                            background: 'white', borderTop: '1px solid #e2e8f0', padding: '24px',
                            display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center',
                            zIndex: 999
                        }}>
                            {visibleSections.map(s => (
                                <a
                                    key={s.id}
                                    href={`#${s.id}`}
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    style={{
                                        fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', textDecoration: 'none', textTransform: 'capitalize',
                                        padding: '12px', width: '100%', textAlign: 'center', borderBottom: '1px solid #f1f5f9'
                                    }}
                                >
                                    {s.data.title || s.id}
                                </a>
                            ))}
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    navigate(`/booking?domain=${effectiveDomain}`);
                                }}
                                style={{
                                    width: '100%', padding: '16px', background: theme.primaryColor, color: 'white',
                                    border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '12px'
                                }}
                            >
                                {t('theme_cta_book')}
                            </button>
                        </div>
                    )}
                </header>

                <style>{`
                @media (max-width: 768px) {
                    .desktop-nav { display: none !important; }
                    .mobile-toggle { display: block !important; }
                    .mobile-lang-selector { display: block !important; }
                }
                @media (min-width: 769px) {
                    .mobile-toggle, .mobile-lang-selector { display: none !important; }
                }
                @keyframes bounce {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
            `}</style>

                <main>
                    {visibleSections.map(section => (
                        <section
                            key={section.id}
                            id={section.id}
                            style={{
                                padding: '80px 24px',
                                background: section.id === 'hero' ? '#f8fafc' : 'white',
                                borderBottom: '1px solid #f1f5f9'
                            }}
                        >
                            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                                {/* HERO SECTION */}
                                {section.id === 'hero' && (
                                    <div style={{
                                        position: 'relative',
                                        overflow: 'hidden',
                                        minHeight: (config?.hero?.mode === 'slider' && window.innerWidth > 768) ? '600px' : '500px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: config?.hero?.mode === 'slider' ? '#f8fafc' : '#0f172a',
                                        marginBottom: '0'
                                    }}>
                                        {/* --- STATIC MODE BACKGROUND --- */}
                                        {config?.hero?.mode !== 'slider' && (
                                            <>
                                                {config?.hero?.type === 'video' && config.hero.url && (
                                                    <video autoPlay loop muted playsInline style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 1 }}>
                                                        <source src={config.hero.url} type="video/mp4" />
                                                    </video>
                                                )}
                                                {config?.hero?.type === 'image' && config.hero.url && (
                                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `url(${config.hero.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                                                )}
                                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: config?.hero?.type === 'color' ? theme.primaryColor : 'black', opacity: config?.hero?.overlay ?? 0.4 }} />

                                                {/* Static Content */}
                                                <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 20px', maxWidth: '800px', width: '100%' }}>
                                                    <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '800', lineHeight: 1.1, marginBottom: '24px', color: 'white', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
                                                        {section.data.title || 'Hoş Geldiniz'}
                                                    </h1>
                                                    <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'rgba(255,255,255,0.9)', maxWidth: '700px', margin: '0 auto 40px auto', whiteSpace: 'pre-line', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                                                        {section.data.text || section.data.subtitle || 'İşletmemiz size en iyi hizmeti sunmak için burada.'}
                                                    </p>
                                                    <button
                                                        onClick={() => navigate(`/booking?domain=${effectiveDomain}`)}
                                                        style={{
                                                            padding: '16px 48px', fontSize: '1.1rem', background: 'white', color: theme.primaryColor,
                                                            border: 'none', borderRadius: '50px', fontWeight: '700', cursor: 'pointer',
                                                            boxShadow: '0 10px 30px rgba(0,0,0,0.2)', transition: 'all 0.2s transform'
                                                        }}
                                                        onMouseOver={e => { e.target.style.transform = 'scale(1.05)'; }}
                                                        onMouseOut={e => { e.target.style.transform = 'scale(1)'; }}
                                                    >
                                                        {section.data.buttonText || 'Keşfet'}
                                                    </button>
                                                </div>
                                            </>
                                        )}

                                        {/* --- SLIDER MODE --- */}
                                        {config?.hero?.mode === 'slider' && products && products.length > 0 && (
                                            <div style={{
                                                display: 'grid',
                                                width: '100%',
                                                height: '100%',
                                                maxWidth: '1200px',
                                                position: 'relative'
                                            }}>
                                                {products.map((prod, idx) => {
                                                    const isActive = idx === (currentSlide % products.length);

                                                    return (
                                                        <div key={prod.id} style={{
                                                            gridArea: '1 / 1',
                                                            opacity: isActive ? 1 : 0,
                                                            pointerEvents: isActive ? 'auto' : 'none',
                                                            transition: 'opacity 0.8s ease-in-out',
                                                            padding: '40px 20px',
                                                            display: 'grid',
                                                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                                            gap: '40px',
                                                            alignItems: 'center',
                                                            width: '100%',
                                                            height: '100%'
                                                        }}>
                                                            <div style={{ order: 2, textAlign: 'left', transform: isActive ? 'translateY(0)' : 'translateY(20px)', transition: 'transform 0.8s ease-out', transitionDelay: '0.1s' }}>
                                                                <span style={{ display: 'inline-block', padding: '6px 12px', background: '#ecfdf5', color: '#047857', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '16px' }}>
                                                                    ✨ ÖNE ÇIKAN ÜRÜN
                                                                </span>
                                                                <h2 style={{ fontSize: '3rem', fontWeight: '800', lineHeight: 1.1, color: '#0f172a', marginBottom: '16px' }}>
                                                                    {prod.name}
                                                                </h2>
                                                                <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '24px', lineHeight: 1.6 }}>
                                                                    {prod.description?.substring(0, 150) || 'Ürün detaylarını incelemek için tıklayın.'}...
                                                                </p>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                                                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: theme.primaryColor }}>
                                                                        {Number(prod.price).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                                                    </span>
                                                                    <button
                                                                        style={{
                                                                            padding: '14px 32px', background: '#0f172a', color: 'white', borderRadius: '12px',
                                                                            border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                                                                        }}
                                                                        onClick={() => addToCart(prod)}
                                                                    >
                                                                        {hasPaymentMethods ? 'Sepete Ekle' : 'İncele'}
                                                                        {hasPaymentMethods ? <ShoppingBag size={18} /> : <ArrowRight size={18} />}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div style={{ order: 1, display: 'flex', justifyContent: 'center', transform: isActive ? 'scale(1)' : 'scale(0.95)', transition: 'transform 0.8s ease-out' }}>
                                                                <div style={{
                                                                    position: 'relative', width: '100%', maxWidth: '450px', aspectRatio: '1/1',
                                                                    background: 'white', borderRadius: '30px', boxShadow: '0 20px 50px -10px rgba(0,0,0,0.1)',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                                                                }}>
                                                                    {prod.image ? (
                                                                        <img src={prod.image} alt={prod.name} style={{ width: '90%', height: '90%', objectFit: 'contain' }} />
                                                                    ) : (
                                                                        <ShoppingBag size={80} color="#cbd5e1" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Slider Fallback */}
                                        {config?.hero?.mode === 'slider' && (!products || products.length === 0) && (
                                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                                <p style={{ fontSize: '1.2rem', color: '#64748b' }}>Stokta henüz ürün bulunmamaktadır.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* SERVICES / PRODUCTS */}
                                {(section.id === 'services' || section.id === 'products') && (
                                    <div>
                                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                            <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '16px' }}>{section.data.title}</h2>
                                            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>{section.data.subtitle || section.data.text}</p>
                                        </div>
                                        {section.id === 'products' ? (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                                                {activeProducts.length > 0 ? activeProducts.map(product => (
                                                    <div key={product.id} style={{ padding: '24px', borderRadius: '16px', background: '#fff', border: '1px solid #e2e8f0', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column' }}>
                                                        <div style={{ height: '160px', background: '#ffffff', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                                                            {product.image ? (
                                                                <img
                                                                    src={product.image}
                                                                    alt={product.name}
                                                                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }}
                                                                />
                                                            ) : (
                                                                <CheckCircle size={48} color={theme.primaryColor} opacity={0.5} />
                                                            )}
                                                        </div>
                                                        <div style={{ marginBottom: 'auto' }}>
                                                            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '600', marginBottom: '4px' }}>
                                                                {product.category || 'Genel'}
                                                            </div>
                                                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: '#1e293b' }}>{product.name}</h3>
                                                            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 }}>{product.description || 'Ürün açıklaması bulunmuyor.'}</p>
                                                        </div>
                                                        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: theme.primaryColor }}>
                                                                {Number(product.price).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                                            </div>
                                                            <button
                                                                style={{
                                                                    padding: '8px 16px', background: hasPaymentMethods ? theme.primaryColor : '#0f172a',
                                                                    color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer',
                                                                    display: 'flex', alignItems: 'center', gap: '6px'
                                                                }}
                                                                onClick={() => addToCart(product)}
                                                            >
                                                                {hasPaymentMethods ? 'Sepete Ekle' : 'İncele'}
                                                                {hasPaymentMethods ? <ShoppingBag size={16} /> : <ArrowRight size={16} />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px', color: '#64748b' }}>
                                                        Henüz listelenecek aktif ürün bulunmuyor.
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                                                {siteData.appointmentSettings?.services && siteData.appointmentSettings.services.length > 0 ? (
                                                    siteData.appointmentSettings.services.map(service => (
                                                        <div key={service.id} style={{ padding: '30px', borderRadius: '16px', background: '#fff', border: '1px solid #e2e8f0', transition: 'transform 0.2s', cursor: 'default', display: 'flex', flexDirection: 'column' }}>
                                                            <div style={{
                                                                width: '60px', height: '60px',
                                                                background: service.color ? `${service.color}15` : `${theme.primaryColor}10`,
                                                                borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                color: service.color || theme.primaryColor, marginBottom: '20px'
                                                            }}>
                                                                <CheckCircle size={32} />
                                                            </div>
                                                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '10px', color: '#1e293b' }}>{service.name}</h3>
                                                            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, flex: 1 }}>{service.description || 'Bu hizmet için bir açıklama bulunmuyor.'}</p>
                                                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                                                                <span style={{ fontWeight: '700', color: theme.primaryColor }}>
                                                                    {Number(service.price).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                                                </span>
                                                                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{service.duration} dk</span>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    [1, 2, 3].map(i => (
                                                        <div key={i} style={{ padding: '30px', borderRadius: '16px', background: '#fff', border: '1px solid #e2e8f0', transition: 'transform 0.2s', cursor: 'default' }}>
                                                            <div style={{ width: '60px', height: '60px', background: `${theme.primaryColor}10`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.primaryColor, marginBottom: '20px' }}>
                                                                <CheckCircle size={32} />
                                                            </div>
                                                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '10px' }}>Örnek Hizmet {i}</h3>
                                                            <p style={{ color: '#64748b' }}>Hizmetlerinizi eklediğinizde burada görünecektir.</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* GENERIC TEXT SECTION */}
                                {section.type === 'text' && section.id !== 'hero' && (
                                    <div>
                                        <h2 style={{ fontSize: '2.2rem', fontWeight: '700', marginBottom: '24px' }}>{section.data.title}</h2>
                                        <div style={{ fontSize: '1.1rem', color: '#475569', lineHeight: 1.8 }}>
                                            {section.data.text}
                                        </div>
                                    </div>
                                )}

                                {/* GALLERY SECTION */}
                                {section.type === 'gallery' && (
                                    <div>
                                        <h2 style={{ fontSize: '2.2rem', fontWeight: '700', marginBottom: '24px', textAlign: 'center' }}>{section.data.title}</h2>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                                            {section.data.images && section.data.images.map((img, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        aspectRatio: '4/3',
                                                        background: '#f1f5f9',
                                                        borderRadius: '12px',
                                                        overflow: 'hidden',
                                                        cursor: 'pointer',
                                                        transition: 'transform 0.3s'
                                                    }}
                                                    onClick={() => window.open(img, '_blank')}
                                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                                >
                                                    <img src={img} alt={`${section.data.title} ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                            ))}
                                            {(!section.data.images || section.data.images.length === 0) && (
                                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px', color: '#94a3b8' }}>
                                                    Sizin için seçtiğimiz görseller yakında burada olacak.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* BLOG / NEWS SECTION */}
                                {section.type === 'blog' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                                        {section.data.posts && section.data.posts.map((post, i) => (
                                            <div key={post.id || i} style={{
                                                background: 'white', borderRadius: '20px', overflow: 'hidden',
                                                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)',
                                                transition: 'transform 0.3s, box-shadow 0.3s', display: 'flex', flexDirection: 'column'
                                            }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                                    e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.1)';
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(0,0,0,0.05)';
                                                }}
                                            >
                                                {/* Image */}
                                                <div style={{ height: '200px', background: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
                                                    {post.image ? (
                                                        <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#cbd5e1' }}>
                                                            <span style={{ fontSize: '3rem' }}>📰</span>
                                                        </div>
                                                    )}
                                                    <div style={{
                                                        position: 'absolute', top: '16px', right: '16px', background: 'white',
                                                        padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                                                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                                    }}>
                                                        {new Date(post.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '12px', lineHeight: 1.4 }}>{post.title}</h3>
                                                    <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                        {post.content}
                                                    </p>
                                                    <button style={{
                                                        marginTop: '16px', padding: '0', background: 'transparent', border: 'none',
                                                        color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', textAlign: 'left',
                                                        display: 'flex', alignItems: 'center', gap: '6px'
                                                    }}>
                                                        Devamını Oku →
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>
                    ))}
                </main>

                {/* Footer */}
                <footer style={{ background: '#0f172a', color: 'white', padding: '60px 24px' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px' }}>
                        <div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px' }}>{profile?.companyName || 'Firma Adı'}</h3>
                            <p style={{ color: '#94a3b8', lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: '24px' }}>
                                {config?.footerDescription || 'Profesyonel hizmetlerimizle yanınızdayız. Her türlü soru ve görüşünüz için bize ulaşın.'}
                            </p>

                            {/* Dynamic Working Hours */}
                            {(siteData?.appointmentSettings?.workingHours || (siteData?.appointmentSettings?.holidays && siteData.appointmentSettings.holidays.length > 0)) && (
                                <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#e2e8f0', fontWeight: '600' }}>
                                        <Clock size={16} color={theme.primaryColor} /> {t('footer_working_hours')}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: '#cbd5e1' }}>
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(dayCode => {
                                            const isOpen = siteData.appointmentSettings?.workingDays?.includes(dayCode);
                                            const dayMap = { 'Mon': 'monday', 'Tue': 'tuesday', 'Wed': 'wednesday', 'Thu': 'thursday', 'Fri': 'friday', 'Sat': 'saturday', 'Sun': 'sunday' };

                                            // 1. Try independent daily schedule
                                            // 2. Fallback to weekend/weekday grouping
                                            const schedule = siteData.appointmentSettings?.schedule;
                                            const isWeekend = ['Sat', 'Sun'].includes(dayCode);

                                            const hours = (schedule && schedule[dayCode])
                                                ? schedule[dayCode]
                                                : (isWeekend
                                                    ? (siteData.appointmentSettings?.workingHoursWeekend?.start ? siteData.appointmentSettings.workingHoursWeekend : siteData.appointmentSettings?.workingHours)
                                                    : siteData.appointmentSettings?.workingHours);

                                            const tKey = `day_${dayMap[dayCode] || dayCode.toLowerCase()}`;

                                            return (
                                                <div key={dayCode} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.05)', paddingBottom: '2px' }}>
                                                    <span style={{ color: isOpen ? '#cbd5e1' : '#64748b' }}>{t(tKey)}:</span>
                                                    <span style={{ fontWeight: isOpen ? '600' : 'normal', color: isOpen ? 'white' : '#64748b', fontStyle: isOpen ? 'normal' : 'italic' }}>
                                                        {isOpen ? `${hours?.start} - ${hours?.end}` : t('day_closed')}
                                                    </span>
                                                </div>
                                            );
                                        })}

                                        {siteData.appointmentSettings?.holidays?.length > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', marginTop: '4px' }}>
                                                <span style={{ color: '#ef4444' }}>{t('footer_holidays')}:</span>
                                                <span style={{ color: '#ef4444', fontStyle: 'italic' }}>{t('footer_closed')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '20px' }}>Hızlı Linkler</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {visibleSections.map(s => (
                                    <a key={s.id} href={`#${s.id}`} style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>{s.data.title || s.id}</a>
                                ))}
                                <a href="/login" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Yönetici Girişi</a>
                            </div>
                        </div>
                        <div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '20px' }}>İletişim</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: '#cbd5e1' }}>
                                {profile?.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Phone size={18} /> {profile.phone}</div>}
                                {profile?.email && <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Mail size={18} /> {profile.email}</div>}
                                {profile?.address && <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><MapPin size={18} /> {profile.address}</div>}
                            </div>
                            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                                {config?.socialLinks?.facebook && (
                                    <a href={config.socialLinks.facebook} target="_blank" rel="noopener noreferrer" style={{ color: '#cbd5e1' }}>
                                        <Facebook size={20} style={{ cursor: 'pointer' }} />
                                    </a>
                                )}
                                {config?.socialLinks?.instagram && (
                                    <a href={config.socialLinks.instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#cbd5e1' }}>
                                        <Instagram size={20} style={{ cursor: 'pointer' }} />
                                    </a>
                                )}
                                {config?.socialLinks?.linkedin && (
                                    <a href={config.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#cbd5e1' }}>
                                        <Linkedin size={20} style={{ cursor: 'pointer' }} />
                                    </a>
                                )}
                                {config?.socialLinks?.twitter && (
                                    <a href={config.socialLinks.twitter} target="_blank" rel="noopener noreferrer" style={{ color: '#cbd5e1' }}>
                                        <Twitter size={20} style={{ cursor: 'pointer' }} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                    <div style={{ maxWidth: '1200px', margin: '40px auto 0', paddingTop: '24px', borderTop: '1px solid #1e293b', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                        &copy; {new Date().getFullYear()} {profile?.companyName}. {t('theme_footer_rights')}
                        {siteData.config?.theme?.showBranding !== false && (
                            <div style={{ marginTop: '8px', opacity: 0.6, fontSize: '0.75rem' }}>
                                Powered by <span style={{ fontWeight: 'bold', color: theme.primaryColor }}>BayZenit</span>
                            </div>
                        )}
                    </div>
                </footer>
            </div >
        </ErrorBoundary>
    );
};

export default PublicWebsite;

