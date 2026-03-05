import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Phone, Mail, MapPin, Calendar, ArrowRight, CheckCircle,
    Facebook, Instagram, Linkedin, Twitter, Menu, X, ShoppingBag, CreditCard, Trash2, User, LogIn, ChevronLeft, Clock,
    Wrench, CircleDot, Disc, Wind, Droplet, Zap, Car, Scissors, Briefcase, Sparkles,
    Utensils, Stethoscope, Heart, Search, Eye
} from 'lucide-react';

import CustomerPanel from './components/common/CustomerPanel'; // Moved to common
import CheckoutModal from './components/common/CheckoutModal';
import BeautyTheme from './themes/BeautyTheme';
import ConstructionTheme from './themes/ConstructionTheme';
import ServiceTheme from './themes/ServiceTheme';

import { generateTheme } from './utils/ColorEngine';
import { getCategoryFromThemeId, getVariantFromThemeId } from './themes/themeConfig';
import SeoAgent from '../../components/SeoAgent';
import PublicAIAgent from './components/common/PublicAIAgent';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const getServiceIconComponent = (serviceName = '', savedIcon = null) => {
    const icons = {
        Wrench, CircleDot, Disc, Wind, Droplet, Zap, Car, Scissors, Briefcase, Sparkles,
        Utensils, Stethoscope, Heart, ShoppingBag, CheckCircle
    };

    if (savedIcon && icons[savedIcon]) return icons[savedIcon];

    const lower = serviceName.toLowerCase();
    if (lower.includes('motor') || lower.includes('mekanik') || lower.includes('tamir')) return Wrench;
    if (lower.includes('lastik') || lower.includes('jant') || lower.includes('balans')) return CircleDot;
    if (lower.includes('fren') || lower.includes('disk')) return Disc;
    if (lower.includes('klima') || lower.includes('gaz') || lower.includes('havalandırma')) return Wind;
    if (lower.includes('yağ') || lower.includes('sıvı') || lower.includes('yıkama') || lower.includes('temiz')) return Droplet;
    if (lower.includes('akü') || lower.includes('elektrik') || lower.includes('şarj') || lower.includes('lamba')) return Zap;
    if (lower.includes('kaporta') || lower.includes('boya')) return Car;
    if (lower.includes('saç') || lower.includes('sakal') || lower.includes('kesim') || lower.includes('bakım')) return Scissors;
    if (lower.includes('danışman') || lower.includes('muhasebe') || lower.includes('görüşme')) return Briefcase;

    return CheckCircle;
};

const fetchPublicSiteData = async (domainOrSlug) => {
    try {
        const slugify = (text) => {
            if (!text) return '';
            return text.toString().toLowerCase().trim()
                .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
        };

        console.warn('🔍 [Public] Starting fetch for:', domainOrSlug);
        // 1. Detect if it's a platform subdomain (e.g. firma.bayzenit.com)
        const platformDomains = ['bayzenit.com', 'bayrechnung.com', 'vercel.app'];
        let effectiveSlug = domainOrSlug;

        const matchedPlatform = platformDomains.find(d => domainOrSlug && domainOrSlug.includes(d) && domainOrSlug !== d);
        if (matchedPlatform) {
            effectiveSlug = domainOrSlug.split(`.${matchedPlatform}`)[0].replace('www.', '');
            console.warn('🔹 [Public] Platform subdomain detected:', effectiveSlug);
        } else if (domainOrSlug && domainOrSlug.includes('.') && !domainOrSlug.includes('localhost')) {
            // Probably a custom domain, use the first part as slug fallback or exact
            effectiveSlug = domainOrSlug.split('.')[0].replace('www.', '');
        }


        // 2. Direct Search by Domain or Exact Slug
        let userId = null;

        try {
            const orConditions = [];
            if (domainOrSlug && domainOrSlug !== 'demo') orConditions.push(`domain.eq."${domainOrSlug}"`, `slug.eq."${domainOrSlug}"`);
            if (effectiveSlug && effectiveSlug !== domainOrSlug) orConditions.push(`slug.eq."${effectiveSlug}"`);

            if (orConditions.length > 0) {
                const { data: configCheck } = await supabase
                    .from('website_configs')
                    .select('user_id')
                    .or(orConditions.join(','))
                    .maybeSingle();

                if (configCheck?.user_id) {
                    userId = configCheck.user_id;
                    console.warn('🎯 [Public] Found via website_configs:', userId);
                }
            }
        } catch (e) {
            console.warn('⚠️ [Public] website_configs query failed (likely missing columns):', e.message);
        }

        if (!userId) {
            // Fallback Search in company_settings
            const { data: profiles } = await supabase.from('company_settings').select('user_id, company_name');
            if (profiles) {
                const cleanEffective = slugify(effectiveSlug);
                console.warn('🔍 [Public] Fallback search profiles:', profiles.length);

                const match = profiles.find(p => {
                    const s = slugify(p.company_name);
                    const isMatch = s === cleanEffective || s === effectiveSlug.toLowerCase() || p.company_name.toLowerCase() === effectiveSlug.toLowerCase();
                    if (isMatch) console.warn('✅ [Public] Match found in profiles:', p.company_name, 'ID:', p.user_id);
                    return isMatch;
                });

                if (match) {
                    userId = match.user_id;
                    console.warn('🎯 [Public] Found via company_settings matching:', userId);
                } else {
                    console.error('🛑 [Public] No match in profiles for slug:', cleanEffective);
                }
            }
        }

        // Global Fallback for Demo
        if (!userId && (!domainOrSlug || domainOrSlug === 'demo')) {
            const { data: first } = await supabase.from('website_configs').select('user_id').limit(1).maybeSingle();
            userId = first?.user_id;
        }

        if (!userId) {
            console.error('🛑 [Public] USER NOT FOUND. Checked slug:', effectiveSlug);
            return null;
        }

        // 3. Parallel Fetch all data (Ensure RLS is open)
        let configRes = { data: null }, svcRes = { data: [] }, staffRes = { data: [] }, prodRes = { data: [] }, settingsRes = { data: null }, profileRes = { data: null };

        try {
            const results = await Promise.allSettled([
                supabase.from('website_configs').select('*').eq('user_id', userId).maybeSingle(),
                supabase.from('services').select('*').eq('user_id', userId).order('name', { ascending: true }),
                supabase.from('staff').select('*').eq('user_id', userId).order('name', { ascending: true }),
                supabase.from('products').select('*').eq('user_id', userId).order('name', { ascending: true }),
                supabase.from('appointment_settings').select('*').eq('user_id', userId).maybeSingle(),
                supabase.from('company_settings').select('*').eq('user_id', userId).maybeSingle()
            ]);

            if (results[0].status === 'fulfilled') configRes = results[0].value;
            if (results[1].status === 'fulfilled') svcRes = results[1].value;
            if (results[2].status === 'fulfilled') staffRes = results[2].value;
            if (results[3].status === 'fulfilled') prodRes = results[3].value;
            if (results[4].status === 'fulfilled') settingsRes = results[4].value;
            if (results[5].status === 'fulfilled') profileRes = results[5].value;

            console.warn('📊 [Public] Parallel Fetch Results:', {
                config: !!configRes.data,
                services: svcRes.data?.length || 0,
                staff: staffRes.data?.length || 0,
                products: prodRes.data?.length || 0,
                settings: !!settingsRes.data,
                profile: !!profileRes.data
            });

            if (svcRes.error) console.error('🛑 [Public] Services fetch error:', svcRes.error.message);
            if (prodRes.error) console.error('🛑 [Public] Products fetch error:', prodRes.error.message);
        } catch (e) {
            console.error('🛑 [Public] Parallel fetch CRITICAL error:', e.message);
        }

        const profileData = profileRes?.data || {};
        const config = configRes?.data?.config?.siteConfig || {
            isPublished: true,
            theme: { primaryColor: '#3b82f6', mode: 'light', fontFamily: 'Inter' },
            category: profileData.industry || 'standard'
        };

        const sections = configRes?.data?.config?.sections || [
            { id: 'hero', type: 'hero', visible: true, data: { title: profileData.company_name || 'BayZenit Üyesi İşletme', subtitle: 'Kaliteli hizmetin adresi.' } },
            { id: 'services', type: 'services', visible: true, data: { autoPull: true, title: 'Hizmetlerimiz' } },
            { id: 'products', type: 'products', visible: true, data: { autoPull: true, title: 'Ürünlerimiz' } },
            { id: 'contact', type: 'contact', visible: true, data: { showMap: true, title: 'İletişim' } }
        ];

        // 5. Normalize Appointment Settings
        const rawSettings = settingsRes.data || {};
        const normalizedSettings = {
            services: (svcRes.data || []).map(s => ({
                ...s,
                color: s.color || null,
                icon: s.icon || null,
                image_url: s.image_url || null
            })),
            staff: staffRes.data || [],
            workingHours: {
                start: rawSettings.working_hours_start || '09:00',
                end: rawSettings.working_hours_end || '18:00'
            },
            workingDays: rawSettings.working_days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            workingHoursWeekend: {
                start: rawSettings.working_hours_weekend_start || '10:00',
                end: rawSettings.working_hours_weekend_end || '16:00'
            }
        };

        // 4. SMART RECOVERY: If core data exists but section is missing from config, inject it.
        const finalSections = [...sections];
        if (svcRes.data?.length > 0 && !finalSections.find(s => s.type === 'services')) {
            console.warn('🛠️ [Public] Smart Recovery: Injecting missing Services section');
            finalSections.push({ id: 'recovered-services', type: 'services', visible: true, data: { autoPull: true, title: 'Hizmetlerimiz' } });
        }
        if (prodRes.data?.length > 0 && !finalSections.find(s => s.type === 'products')) {
            console.warn('🛠️ [Public] Smart Recovery: Injecting missing Products section');
            finalSections.push({ id: 'recovered-products', type: 'products', visible: true, data: { autoPull: true, title: 'Ürünlerimiz' } });
        }

        return {
            domain: domainOrSlug,
            slug: effectiveSlug,
            config,
            sections: finalSections,
            profile: {
                companyName: profileData.company_name || 'BayZenit Üyesi İşletme',
                email: profileData.email || '',
                phone: profileData.phone || '',
                address: profileData.address || '',
                logo: profileData.logo_url || null,
                social: profileData.social_links || {},
                industry: profileData.industry || 'general',
                city: profileData.city || '',
                zip: profileData.postal_code || profileData.zip || '',
                street: profileData.street || profileData.address || '',
                houseNum: profileData.house_num || profileData.houseNum || '',
                brand_palette: profileData.brand_palette || null,
                user_id: userId
            },
            userId,
            products: (prodRes.data || []).map(p => ({
                ...p,
                image: p.image_url // Map image_url for templates
            })),
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
    if (savedServices && appointmentSettings) {
        appointmentSettings.services = JSON.parse(savedServices);
    }
    if (savedStaff && appointmentSettings) {
        appointmentSettings.staff = JSON.parse(savedStaff);
    }

    if (!appointmentSettings) {
        appointmentSettings = {
            workingHours: { start: '09:00', end: '18:00' },
            workingHoursWeekend: { start: '10:00', end: '16:00' },
            workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            holidays: []
        };
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
        appointmentSettings: appointmentSettings,
        slug: domainOrSlug // Ensure slug is always available
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

const PublicWebsite = ({ customDomain, overrideData }) => {
    const { domain: urlDomain } = useParams(); // Capture /s/:domain for simulating subdomains locally
    const effectiveDomain = customDomain || urlDomain || 'demo';
    const navigate = useNavigate();

    const [siteData, setSiteData] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null); // Amount or percentage
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);
    const { currentUser: adminUser } = useAuth(); // Logged-in admin previewing
    const { showNotification } = useNotification();
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
    const [hoveredProductId, setHoveredProductId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

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
        showNotification(`Siparişiniz alındı! Sipariş No: ${newOrder.id}`, 'success', 'Sipariş Onaylandı');
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
        // Mock Discount Logic
        if (discountCode.toUpperCase() === 'VIP10') {
            setAppliedDiscount({ type: 'percent', value: 10, code: 'VIP10' });
            showNotification("%10 İndirim Uygulandı!", 'success', 'İndirim Aktif');
        } else if (discountCode.toUpperCase() === 'BAY20') {
            setAppliedDiscount({ type: 'fixed', value: 20, code: 'BAY20' });
            showNotification("20€ İndirim Uygulandı!", 'success', 'İndirim Aktif');
        } else {
            showNotification("Geçersiz İndirim Kodu", 'error', 'Hata');
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

    // Dynamic Data Sync (Remote vs Local vs Override)
    useEffect(() => {
        if (overrideData) {
            setSiteData(overrideData);
            setLoading(false);
            return;
        }

        const loadData = async () => {
            console.warn('🎬 [Public] useEffect/loadData firing for:', effectiveDomain);
            const localData = getPublicSiteData(effectiveDomain, adminUser?.id);
            if (localData && localData.config) {
                setSiteData(localData);
                setLoading(false);
            }

            try {
                const remoteData = await fetchPublicSiteData(effectiveDomain);
                if (remoteData) {
                    setSiteData(prev => {
                        if (!prev) return remoteData;
                        const mergedProducts = (remoteData.products?.length > 0)
                            ? remoteData.products.map(p => ({ ...p, image: p.image || p.image_url || null }))
                            : prev.products;

                        return {
                            ...prev,
                            config: { ...prev.config, ...remoteData.config },
                            sections: remoteData.sections?.length > 0 ? remoteData.sections : prev.sections,
                            profile: { ...prev.profile, ...remoteData.profile },
                            products: mergedProducts,
                            appointmentSettings: remoteData.appointmentSettings || prev.appointmentSettings
                        };
                    });
                }
            } catch (err) {
                console.warn('[Public] Remote fetch failed.', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [effectiveDomain, adminUser?.id, overrideData]);

    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Yükleniyor...</div>;

    if (!siteData || !siteData.config || !siteData.sections) return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>Site Hazırlanıyor</h1>
            <p style={{ color: '#64748b' }}>Yapılandırma yüklenirken bir hata oluştu veya site henüz oluşturulmadı.</p>
        </div>
    );

    // --- THEME & COLOR ENGINE (Enhanced with Light/Dark & Backgrounds) ---
    const getAutoMode = () => {
        const hour = new Date().getHours();
        const isNight = hour >= 18 || hour < 6;
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return systemPrefersDark || isNight ? 'dark' : 'light';
    };

    const activeMode = siteData.config?.theme?.mode === 'auto' || !siteData.config?.theme?.mode
        ? getAutoMode()
        : siteData.config?.theme?.mode;

    const brandColor = siteData.config?.theme?.primaryColor || '#3b82f6';
    const brandSecondaryColor = siteData.config?.theme?.secondaryColor || null;
    const generatedPalette = generateTheme(brandColor, brandSecondaryColor);

    const theme = {
        ...generatedPalette,
        mode: activeMode,
        primaryColor: generatedPalette.primary,
        font: siteData.config?.theme?.fontFamily || '"Inter", sans-serif',
        borderRadius: siteData.config?.theme?.radius || '8px',
        // Dynamic Surface Colors based on Mode
        surface: activeMode === 'dark' ? '#0f172a' : '#ffffff',
        text: activeMode === 'dark' ? '#f8fafc' : '#1e293b',
        border: activeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        backgrounds: siteData.config?.theme?.backgrounds || {
            hero: { type: 'color', value: 'default' },
            body: { type: 'color', value: 'default' },
            footer: { type: 'color', value: 'default' }
        }
    };

    // --- MESSAGE HANDLER (Contact Form Integration) ---
    const handleSubmitMessage = async (messageData) => {
        try {
            const { error } = await supabase.from('messages').insert([{
                ...messageData,
                domain: effectiveDomain,
                created_at: new Date().toISOString()
            }]);
            if (error) throw error;
            return { success: true };
        } catch (err) {
            console.error('Error sending message:', err);
            return { success: false, error: err.message };
        }
    };

    // --- THEME ENGINE DISPATCHER ---
    const profileIndustry = siteData.profile?.industry || 'general';
    const activeCategory = siteData.config?.category || profileIndustry;
    const activeThemeId = siteData.config?.theme?.themeId || activeCategory;

    const normalizeKey = (k) => String(k || 'general').toLowerCase().split(/[ &-]+/)[0];
    const themeCategory = getCategoryFromThemeId(activeThemeId);
    const resolvedCategory = normalizeKey(themeCategory);
    const resolvedVariant = getVariantFromThemeId(activeThemeId);

    const editorActions = {
        onSectionSelect: overrideData?.onSectionSelect,
        activeSectionId: overrideData?.activeSectionId
    };

    const isEditor = !!overrideData;
    const finalSections = (siteData.sections || []).filter(s => {
        if (!s.visible && !isEditor) return false;
        if (!isEditor && s.type === 'pricing') return false;
        return true;
    });


    const categories = Array.from(new Set([
        ...(siteData?.products || []).map(p => p?.category),
        ...(siteData?.appointmentSettings?.services || []).map(s => s?.category || 'Hizmetler')
    ].filter(Boolean)));

    const activeProducts = (siteData.products || []).filter(p => {
        if (!p || p.visible === false) return false;
        const search = searchQuery.toLowerCase();
        if (!search) return true;

        // If the search matches the category exactly, it's a category filter
        const isCategoryMatch = p.category?.toLowerCase() === search;
        const isNameMatch = p.name?.toLowerCase().includes(search);
        const isDescMatch = p.description?.toLowerCase().includes(search);

        return isCategoryMatch || isNameMatch || isDescMatch;
    });

    const enrichedSiteData = {
        ...siteData,
        sections: finalSections,
        products: activeProducts,
        isEditor,
        mode: activeMode,
        categories,
        searchQuery,
        setSearchQuery
    };

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
                <CustomerPanel user={currentUser} onClose={() => setIsCustomerPanelOpen(false)} onLogout={handleLogout} theme={theme} t={t} />
            )}
            <PublicAIAgent siteData={enrichedSiteData} addToCart={addToCart} currentUser={currentUser} />
        </>
    );

    const themeProps = {
        siteData: enrichedSiteData,
        themeColors: theme,
        variant: resolvedVariant,
        cartActions: { addToCart, removeFromCart, updateQuantity, setIsCartOpen, setCheckoutStep, handleApplyDiscount },
        userActions: { currentUser, setCurrentUser, isCustomerPanelOpen, setIsCustomerPanelOpen, handleLogout, handleAuthAction, handlePlaceOrder, authForm, setAuthForm, authMode, setAuthMode },
        state: { cart, isCartOpen, checkoutStep, discountCode, setDiscountCode, appliedDiscount, discountAmount, total, subtotal },
        languageActions: { t, currentLang, setServiceLanguage, LANGUAGES },
        editorActions,
        handleSubmitMessage
    };

    // --- THEME COMPONENT MAPPER ---
    const THEME_MAP = {
        general: ServiceTheme,
        automotive: ServiceTheme,
        crafts: ServiceTheme,
        it: ServiceTheme,
        beauty: BeautyTheme,
        gastronomy: BeautyTheme,
        healthcare: BeautyTheme,
        retail: BeautyTheme,
        construction: ConstructionTheme,
        consulting: ConstructionTheme,
        education: ConstructionTheme,
        medical: BeautyTheme,
        legal: ConstructionTheme,
        software: ServiceTheme,
        fitness: BeautyTheme
    };

    const MatchedTheme = THEME_MAP[resolvedCategory] || THEME_MAP.general;

    if (MatchedTheme) {
        return (
            <ErrorBoundary>
                <SeoAgent websiteData={{ sections: enrichedSiteData.sections, hero: enrichedSiteData.sections.find(s => s.type === 'hero')?.data, config: siteData.config }} profile={siteData.profile} />
                <div className={`theme-wrapper theme-${resolvedCategory} variant-${resolvedVariant}`} style={{ height: '100%', minHeight: '100vh' }}>
                    <MatchedTheme
                        key={`${siteData.slug}-${siteData?.userId}-${theme.primaryColor}`}
                        {...themeProps}
                    />
                </div>
                {renderOverlays()}
            </ErrorBoundary>
        );
    }


    // --- STANDARD THEME ---
    const { config, sections, profile } = siteData;
    const products = siteData.products || [];
    const visibleSections = sections.filter(s => s.visible !== false);
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

                {/* SHARED OVERLAYS (Cart, Checkout, AIAgent) */}
                {renderOverlays()}

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

                        {/* Mobile Toggle Button */}
                        <button
                            className="mobile-toggle"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: theme.primaryColor, display: 'none' }}
                        >
                            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>

                    {/* MEGA MENU / CATEGORY BAR */}
                    <div style={{ background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '50px' }}>
                            <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none' }} className="category-scroll">
                                <button
                                    onClick={() => setSearchQuery('')}
                                    style={{ border: 'none', background: 'transparent', padding: '12px 0', fontSize: '0.85rem', fontWeight: searchQuery === '' ? '700' : '500', color: searchQuery === '' ? theme.primaryColor : '#64748b', cursor: 'pointer', borderBottom: searchQuery === '' ? `2px solid ${theme.primaryColor}` : 'none' }}
                                >
                                    {t('all') || 'Tümü'}
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSearchQuery(cat)}
                                        style={{ border: 'none', background: 'transparent', padding: '12px 0', fontSize: '0.85rem', fontWeight: searchQuery === cat ? '700' : '500', color: searchQuery === cat ? theme.primaryColor : '#64748b', cursor: 'pointer', borderBottom: searchQuery === cat ? `2px solid ${theme.primaryColor}` : 'none' }}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Search Input */}
                            <div style={{ position: 'relative', width: '240px', display: 'flex', alignItems: 'center' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    placeholder={t('search_placeholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%', padding: '8px 12px 8px 36px', borderRadius: '100px', border: '1px solid #e2e8f0', background: 'white',
                                        fontSize: '0.8rem', outline: 'none', transition: 'all 0.2s'
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = theme.primaryColor}
                                    onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                                />
                            </div>
                        </div>
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

                <style>{`
                    @media (max-width: 768px) {
                        .desktop-nav { display: none !important; }
                        .mobile-toggle { display: block !important; }
                        .category-scroll { mask-image: linear-gradient(to right, black 85%, transparent); }
                    }
                    @media (min-width: 769px) {
                        .mobile-toggle { display: none !important; }
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
                                        borderRadius: '32px'
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

                                                {/* Content */}
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
                                            <div style={{ display: 'grid', width: '100%', height: '100%', maxWidth: '1200px', position: 'relative' }}>
                                                {products.map((prod, idx) => {
                                                    const isActive = idx === (currentSlide % products.length);
                                                    return (
                                                        <div key={prod.id} style={{
                                                            gridArea: '1 / 1', opacity: isActive ? 1 : 0, pointerEvents: isActive ? 'auto' : 'none',
                                                            transition: 'opacity 0.8s ease-in-out', padding: '40px 20px', display: 'grid',
                                                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center', width: '100%', height: '100%'
                                                        }}>
                                                            <div style={{ order: 2, textAlign: 'left', transform: isActive ? 'translateY(0)' : 'translateY(20px)', transition: 'transform 0.8s ease-out' }}>
                                                                <span style={{ display: 'inline-block', padding: '6px 12px', background: `${theme.primaryColor}15`, color: theme.primaryColor, borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '16px' }}>
                                                                    ✨ ÖNE ÇIKAN ÜRÜN
                                                                </span>
                                                                <h2 style={{ fontSize: '3rem', fontWeight: '800', lineHeight: 1.1, color: '#0f172a', marginBottom: '16px' }}>{prod.name}</h2>
                                                                <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '24px', lineHeight: 1.6 }}>{prod.description?.substring(0, 150)}...</p>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                                                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: theme.primaryColor }}>{Number(prod.price).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                                                                    <button style={{ padding: '14px 32px', background: '#0f172a', color: 'white', borderRadius: '12px', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => addToCart(prod)}>
                                                                        {hasPaymentMethods ? 'Sepete Ekle' : 'İncele'}
                                                                        <ShoppingBag size={18} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div style={{ order: 1, display: 'flex', justifyContent: 'center' }}>
                                                                <div style={{ position: 'relative', width: '100%', maxWidth: '450px', aspectRatio: '1/1', background: 'white', borderRadius: '30px', boxShadow: '0 20px 50px -10px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                                    {prod.image ? <img src={prod.image} alt={prod.name} style={{ width: '90%', height: '90%', objectFit: 'contain' }} /> : <ShoppingBag size={80} color="#cbd5e1" />}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
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
                                                    <div
                                                        key={product.id}
                                                        onMouseEnter={() => setHoveredProductId(product.id)}
                                                        onMouseLeave={() => setHoveredProductId(null)}
                                                        style={{
                                                            padding: '24px', borderRadius: '24px', background: '#fff', border: '1px solid #e2e8f0', transition: 'all 0.4s ease',
                                                            display: 'flex', flexDirection: 'column', transform: hoveredProductId === product.id ? 'translateY(-8px)' : 'none',
                                                            boxShadow: hoveredProductId === product.id ? '0 20px 40px -15px rgba(0,0,0,0.1)' : 'none'
                                                        }}
                                                    >
                                                        <div style={{ height: '240px', background: '#f8fafc', borderRadius: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                                                            {product.image ? <img src={product.image} alt={product.name} style={{ width: '90%', height: '90%', objectFit: 'contain', transition: 'transform 0.6s ease', transform: hoveredProductId === product.id ? 'scale(1.1)' : 'scale(1)' }} /> : <ShoppingBag size={64} color={theme.primaryColor} opacity={0.2} />}
                                                            <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: `translateX(-50%) translateY(${hoveredProductId === product.id ? '0' : '20px'})`, opacity: hoveredProductId === product.id ? 1 : 0, transition: 'all 0.3s ease', display: 'flex', gap: '8px' }}>
                                                                <button style={{ padding: '10px', background: 'white', borderRadius: '50%', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', cursor: 'pointer', color: theme.primaryColor }}><Eye size={18} /></button>
                                                                <button style={{ padding: '10px', background: 'white', borderRadius: '50%', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', cursor: 'pointer', color: '#ef4444' }}><Heart size={18} /></button>
                                                            </div>
                                                        </div>
                                                        <div style={{ marginBottom: 'auto' }}>
                                                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: theme.primaryColor, fontWeight: '700', marginBottom: '8px' }}>{product.category || 'Genel'}</div>
                                                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: '#1e293b' }}>{product.name}</h3>
                                                            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>{product.description || 'Ürün açıklaması bulunmuyor.'}</p>
                                                        </div>
                                                        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>{Number(product.price).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                                                            <button style={{ padding: '10px 20px', background: theme.primaryColor, color: 'white', border: 'none', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => addToCart(product)}>
                                                                {hasPaymentMethods ? 'Sepete Ekle' : 'İncele'} <ShoppingBag size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px', color: '#64748b' }}>Henüz listelenecek aktif ürün bulunmuyor.</div>
                                                )}
                                            </div>
                                        ) : (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                                                {(siteData.appointmentSettings?.services || []).map(service => {
                                                    const ServiceIcon = getServiceIconComponent(service.name, service.icon);
                                                    return (
                                                        <div key={service.id} style={{ padding: '30px', borderRadius: '24px', background: '#fff', border: '1px solid #e2e8f0', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column' }}>
                                                            {service.image_url ? (
                                                                <div style={{ width: '100%', height: '140px', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px' }}>
                                                                    <img src={service.image_url} alt={service.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                </div>
                                                            ) : (
                                                                <div style={{ width: '60px', height: '60px', background: `${service.color || theme.primaryColor}15`, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: service.color || theme.primaryColor, marginBottom: '20px' }}>
                                                                    <ServiceIcon size={32} />
                                                                </div>
                                                            )}
                                                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '10px', color: '#1e293b' }}>{service.name}</h3>
                                                            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, flex: 1 }}>{service.description}</p>
                                                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                                                                <span style={{ fontWeight: '700', color: theme.primaryColor }}>{Number(service.price).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                                                                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{service.duration} dk</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* GENERIC TEXT SECTION */}
                                {section.type === 'text' && section.id !== 'hero' && (
                                    <div>
                                        <h2 style={{ fontSize: '2.2rem', fontWeight: '700', marginBottom: '24px' }}>{section.data.title}</h2>
                                        <div style={{ fontSize: '1.1rem', color: '#475569', lineHeight: 1.8 }}>{section.data.text}</div>
                                    </div>
                                )}

                                {/* GALLERY SECTION */}
                                {section.type === 'gallery' && (
                                    <div>
                                        <h2 style={{ fontSize: '2.2rem', fontWeight: '700', marginBottom: '24px', textAlign: 'center' }}>{section.data.title}</h2>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                                            {section.data.images?.map((img, i) => (
                                                <div key={i} style={{ aspectRatio: '4/3', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.3s' }} onClick={() => window.open(img, '_blank')} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                                                    <img src={img} alt={`${section.data.title} ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    ))}
                </main>

                {/* Footer */}
                <footer style={{ background: '#0f172a', color: 'white', padding: '80px 24px' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '60px' }}>
                        <div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px' }}>{profile?.companyName || 'Firma Adı'}</h3>
                            <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: '32px' }}>{config?.footerDescription || 'Profesyonel hizmetlerimizle yanınızdayız.'}</p>

                            {/* Working Hours */}
                            {(siteData?.appointmentSettings?.workingHours) && (
                                <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', fontWeight: '600' }}><Clock size={18} color={theme.primaryColor} /> Çalışma Saatleri</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                            <div key={day} style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                                                <span>{t(`day_${day.toLowerCase()}`)}:</span>
                                                <span style={{ color: 'white', fontWeight: '600' }}>{siteData.appointmentSettings?.workingDays?.includes(day) ? `${siteData.appointmentSettings?.workingHours?.start || '09:00'} - ${siteData.appointmentSettings?.workingHours?.end || '18:00'}` : 'Kapalı'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '24px' }}>Hızlı Linkler</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {visibleSections.map(s => <a key={s.id} href={`#${s.id}`} style={{ color: '#cbd5e1', textDecoration: 'none' }}>{s.data.title || s.id}</a>)}
                                <a href="/login" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Giriş Yap</a>
                            </div>
                        </div>
                        <div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '24px' }}>İletişim</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: '#cbd5e1' }}>
                                {profile?.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Phone size={20} /> {profile.phone}</div>}
                                {profile?.email && <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Mail size={20} /> {profile.email}</div>}
                                {profile?.address && <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}><MapPin size={20} /> {profile.address}</div>}
                            </div>
                        </div>
                    </div>
                    <div style={{ maxWidth: '1200px', margin: '60px auto 0', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', color: '#64748b' }}>
                        &copy; {new Date().getFullYear()} {profile?.companyName}. Tüm hakları saklıdır.
                    </div>
                </footer>
            </div>
        </ErrorBoundary>
    );
};

export default PublicWebsite;

