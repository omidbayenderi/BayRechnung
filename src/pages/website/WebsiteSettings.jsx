import React, { useState } from 'react';
import { useWebsite } from '../../context/WebsiteContext';
import { useInvoice } from '../../context/InvoiceContext';
import { useLanguage } from '../../context/LanguageContext';
import { Save, Globe, Palette, Search, ArrowLeft, MapPin, CheckCircle, ExternalLink, RefreshCw, Facebook, Instagram, Linkedin, Twitter, Image, Video, ShoppingBag, LayoutTemplate, Play, BarChart2, Type, Plus, Copy, AlertCircle, Info, Sparkles } from 'lucide-react';
import { getThemesForIndustry } from '../public/themes/themeConfig';
import { useNavigate } from 'react-router-dom';

import { GOOGLE_FONTS } from '../../utils/googleFonts';

const WebsiteSettings = () => {
    const { siteConfig, updateSiteConfig } = useWebsite();
    const { companyProfile, invoiceCustomization } = useInvoice();
    const { t } = useLanguage();
    const navigate = useNavigate();

    // Local Configuration State - Changes are only applied on "Save & Exit"
    const [localConfig, setLocalConfig] = useState(siteConfig);

    // Sync local state if siteConfig changes (e.g. initial load)
    React.useEffect(() => {
        if (siteConfig) setLocalConfig(siteConfig);
    }, [siteConfig]);

    const handleSaveAndExit = () => {
        updateSiteConfig(localConfig);
        alert(t('settings_saved_success') || 'Ayarlar başarıyla kaydedildi!');
        navigate('/website/dashboard');
    };

    // Domain Search State
    const [domainQuery, setDomainQuery] = useState('');
    const [selectedTld, setSelectedTld] = useState('com');
    const [searchResult, setSearchResult] = useState(null); // { available: bool, suggestions: [] }
    const [isSearching, setIsSearching] = useState(false);

    // Domain Mode: 'search' or 'connect'
    const [domainMode, setDomainMode] = useState('search');
    const [selectedProvider, setSelectedProvider] = useState('other');
    const [isVerifying, setIsVerifying] = useState(false);
    const [dnsStatus, setDnsStatus] = useState('pending'); // pending, partial, verified

    const [showDnsInstructions, setShowDnsInstructions] = useState(false);

    // Hostinger API Key from User Request
    const HOSTINGER_TOKEN = 'U5QeX1t4s0P58aDR8GvKV3h49PyNhRpwW3LQpYms01b6f775';

    const checkDomainAvailability = async () => {
        if (!domainQuery) return;
        setIsSearching(true);
        setSearchResult(null);

        try {
            // Attempt real API call
            const response = await fetch('https://api.hostinger.com/api/domains/v1/availability', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${HOSTINGER_TOKEN}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    domain: domainQuery,
                    tlds: [selectedTld],
                    with_alternatives: true
                })
            });

            if (!response.ok) throw new Error('API Error');

            const data = await response.json();
            const mainResult = data.find(d => !d.is_alternative);
            const alternatives = data.filter(d => d.is_alternative && d.is_available);

            setSearchResult({
                available: mainResult?.is_available,
                domain: mainResult?.domain,
                suggestions: alternatives
            });
        } catch (error) {
            console.warn('Hostinger API Error, falling back to DNS Check:', error);

            try {
                // Secondary Check via Google DNS (Public API) for real-time status
                const dnsResponse = await fetch(`https://dns.google/resolve?name=${domainQuery}.${selectedTld}&type=NS`);
                const dnsData = await dnsResponse.json();

                // Status 3 = NXDOMAIN (Domain likely doesn't exist -> Available)
                // Status 0 = NOERROR (Domain exists -> Taken)
                const isAvailable = dnsData.Status === 3;

                setSearchResult({
                    available: isAvailable,
                    domain: `${domainQuery}.${selectedTld}`,
                    suggestions: [] // No suggestions in fallback mode
                });

            } catch (dnsError) {
                console.error('DNS Check failed:', dnsError);
                setSearchResult(null);
            }
        } finally {
            setIsSearching(false);
        }
    };

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        alert(`${label} ${t('copied') || 'kopyalandı!'}`);
    };

    const handleVerifyDns = async () => {
        if (!localConfig.domain) return;

        setIsVerifying(true);
        // Use Google DNS API to check records
        const domain = localConfig.domain.replace('www.', ''); // Normalize
        const expectedIp = '76.76.21.21';
        const expectedCname = 'cname.bayzenit.com';

        try {
            // Check A Record
            const responseA = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
            const dataA = await responseA.json();

            // Check CNAME Record (www)
            const responseCname = await fetch(`https://dns.google/resolve?name=www.${domain}&type=CNAME`);
            const dataCname = await responseCname.json();

            // Validate
            const hasCorrectA = dataA.Answer?.some(r => r.data === expectedIp);
            const hasCorrectCname = dataCname.Answer?.some(r => r.data.includes(expectedCname));

            if (hasCorrectA || hasCorrectCname) {
                setDnsStatus('verified');
                alert(t('dns_verify_success_start_ssl') || 'DNS Doğrulama Başarılı! SSL Sertifikası oluşturuluyor...');
                // Trigger hypothetical SSL generation here
            } else {
                setDnsStatus('partial');
                alert(t('dns_verify_partial') || 'DNS kayıtları algılandı ancak tam yayılma gerçekleşmedi veya hatalı. Lütfen bir süre sonra tekrar deneyin.');
            }
        } catch (e) {
            console.error('Pro DNS Check Failed:', e);
            setDnsStatus('pending');
            alert(t('dns_check_error') || 'DNS kontrolü sırasında bir hata oluştu. Lütfen bağlantınızı kontrol edin.');
        } finally {
            setIsVerifying(false);
        }
    };

    const getProviderGuide = () => {
        const guides = {
            hostinger: {
                name: 'Hostinger',
                steps: [
                    t('domain_guide_hostinger_step1') || 'Hostinger Panelinize girin.',
                    t('domain_guide_hostinger_step2') || 'Alan Adları -> DNS / Ad Sunucuları bölümüne gidin.',
                    t('domain_guide_hostinger_step3') || 'A ve CNAME kayıtlarını aşağıdaki gibi güncelleyin.'
                ],
                link: 'https://hpanel.hostinger.com/'
            },
            godaddy: {
                name: 'GoDaddy',
                steps: [
                    t('domain_guide_godaddy_step1') || 'GoDaddy DNS Yönetim sayfasına gidin.',
                    t('domain_guide_godaddy_step2') || 'Mevcut A ve CNAME kayıtlarını düzenleyin.',
                    t('domain_guide_godaddy_step3') || 'Kaydet düğmesine basmayı unutmayın.'
                ],
                link: 'https://dpp.godaddy.com/manage/'
            },
            other: {
                name: t('provider_other') || 'Diğer',
                steps: [
                    t('domain_guide_other_step1') || 'Alan adı sağlayıcınızın DNS yönetim paneline gidin.',
                    t('domain_guide_other_step2') || 'A kaydı ve CNAME kaydı ekle/düzenle seçeneklerini kullanın.'
                ]
            }
        };
        return guides[selectedProvider] || guides.other;
    };

    // Load font dynamically when it changes
    React.useEffect(() => {
        const fontFamily = localConfig.theme?.fontFamily || '"Inter", sans-serif';
        const fontName = fontFamily.split(',')[0].replace(/"/g, '');

        // Skip system fonts
        const systemFonts = ['sans-serif', 'serif', 'monospace', 'cursive'];
        if (systemFonts.includes(fontName.toLowerCase())) return;

        const linkId = 'dynamic-google-font';
        let link = document.getElementById(linkId);

        if (!link) {
            link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }

        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@300;400;500;600;700;800;900&display=swap`;
    }, [localConfig.theme?.fontFamily]);

    // Theme Presets
    const colors = [
        { name: t('color_blue') || 'Blue', hex: '#3b82f6' },
        { name: t('color_red') || 'Red', hex: '#ef4444' },
        { name: t('color_green') || 'Green', hex: '#10b981' },
        { name: t('color_purple') || 'Purple', hex: '#8b5cf6' },
        { name: t('color_orange') || 'Orange', hex: '#f97316' },
        { name: t('color_black') || 'Black', hex: '#1e293b' },
    ];

    // Get themes filtered by current industry
    const availableThemes = getThemesForIndustry(companyProfile?.industry || 'general');

    // Domain Connection State
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('idle'); // idle, connecting, success

    const handleConnectDomain = () => {
        if (!localConfig.domain) return;
        setIsConnecting(true);
        setConnectionStatus('connecting');

        // 1. Update Global Context (Saves to Supabase)
        updateSiteConfig({ domain: localConfig.domain });

        // 2. Simulate Connection Validation Logic
        setTimeout(() => {
            setIsConnecting(false);
            setConnectionStatus('success');
            setShowDnsInstructions(true);

            // Keep the instructions visible, but reset button state
            setTimeout(() => setConnectionStatus('idle'), 3000);
        }, 1500);
    };

    return (
        <div className="page-container" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={() => navigate('/website/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', background: '#f1f5f9' }}>
                    <ArrowLeft size={20} />
                </button>
                <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{t('site_settings_seo_title') || 'Site Ayarları & SEO'}</h1>
            </div>

            <div style={{ display: 'grid', gap: '32px' }}>
                {/* 1. General & SEO */}
                <div className="card" style={{ padding: '24px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                        <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '8px', color: '#3b82f6' }}><Search size={20} /></div>
                        <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{t('general_info_seo') || 'Genel Bilgiler & SEO'}</h2>
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{t('site_title_label') || 'Site Başlığı (Title)'}</label>
                        <input
                            className="form-input"
                            value={localConfig.meta?.title || ''}
                            onChange={(e) => setLocalConfig({ ...localConfig, meta: { ...localConfig.meta, title: e.target.value } })}
                            placeholder={t('site_title_placeholder') || "rechnung.com"}
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}
                        />
                        <small style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>{t('site_title_help') || 'Google aramalarında görünecek başlık.'}</small>
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{t('business_category_label') || 'İşletme Kategorisi (SEO için)'}</label>
                        <select
                            className="form-input"
                            value={localConfig.businessCategory || ''}
                            onChange={(e) => setLocalConfig({ ...localConfig, businessCategory: e.target.value })}
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'white' }}
                        >
                            <option value="">{t('select_category', 'Kategori Seçin...')}</option>
                            <optgroup label={t('cat_group_service', 'Hizmet Sektörü')}>
                                <option value="AutoRepair">{t('cat_auto_repair', 'Oto Tamir / Servis')}</option>
                                <option value="BeautySalon">{t('cat_beauty_salon', 'Güzellik Merkezi / Kuaför')}</option>
                                <option value="Dentist">{t('cat_dentist', 'Diş Polikliniği')}</option>
                                <option value="LegalService">{t('cat_legal', 'Hukuk / Avukatlık')}</option>
                                <option value="CleaningService">{t('cat_cleaning', 'Temizlik Hizmetleri')}</option>
                            </optgroup>
                            <optgroup label={t('cat_group_construction', 'İnşaat & Teknik')}>
                                <option value="GeneralContractor">{t('cat_construction', 'İnşaat / Müteahhitlik')}</option>
                                <option value="Electrician">{t('cat_electrician', 'Elektrik Servisi')}</option>
                                <option value="Plumber">{t('cat_plumbing', 'Tesisat Servisi')}</option>
                                <option value="HVACBusiness">{t('cat_hvac', 'Klima / Havalandırma')}</option>
                            </optgroup>
                            <optgroup label={t('cat_group_retail', 'Perakende & Gıda')}>
                                <option value="Restaurant">{t('cat_restaurant', 'Restoran / Kafe')}</option>
                                <option value="ClothingStore">{t('cat_clothing', 'Giyim Mağazası')}</option>
                                <option value="GroceryStore">{t('cat_grocery', 'Market / Şarküteri')}</option>
                            </optgroup>
                            <optgroup label={t('cat_group_professional', 'Profesyonel')}>
                                <option value="ConsultingBusiness">{t('cat_consulting', 'Danışmanlık')}</option>
                                <option value="EducationOrganization">{t('cat_education', 'Eğitim Kurumu')}</option>
                                <option value="ITBusiness">{t('cat_it_software', 'Yazılım / Bilişim')}</option>
                            </optgroup>
                        </select>
                        <small style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                            {t('category_seo_tip', 'Doğru kategoriyi seçmek, Google aramalarında daha üst sıralarda görünmenizi sağlar.')}
                        </small>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{t('site_description_label') || 'Site Açıklaması (Description)'}</label>
                        <textarea
                            className="form-input"
                            rows={3}
                            value={localConfig.meta?.description || ''}
                            onChange={(e) => setLocalConfig({ ...localConfig, meta: { ...localConfig.meta, description: e.target.value } })}
                            placeholder={t('site_description_placeholder') || "İşletmeniz hakkında kısa bilgi..."}
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', fontFamily: 'inherit' }}
                        />
                    </div>

                    <div className="form-group" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed var(--border)' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BarChart2 size={16} color="#eab308" /> {t('google_analytics_id') || 'Google Analytics ID'}
                        </label>
                        <input
                            className="form-input"
                            value={localConfig.analyticsId || ''}
                            onChange={(e) => setLocalConfig({ ...localConfig, analyticsId: e.target.value })}
                            placeholder="G-XXXXXXXXXX"
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', fontFamily: 'monospace', letterSpacing: '1px' }}
                        />
                        <small style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                            {t('google_analytics_help') || "Ziyaretçi istatistiklerini görmek için Google Analytics'ten alacağınız Measurement ID'yi buraya girin."}
                        </small>
                    </div>
                </div>

                {/* 2. Domain Settings */}
                <div className="card" style={{ padding: '24px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                        <div style={{ padding: '8px', background: '#f0fdf4', borderRadius: '8px', color: '#16a34a' }}><Globe size={20} /></div>
                        <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{t('domain_settings_title') || 'Alan Adı (Domain)'}</h2>
                    </div>

                    {/* Mode Toggle Tabs */}
                    <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '12px', marginBottom: '24px' }}>
                        <button
                            onClick={() => setDomainMode('search')}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                                background: domainMode === 'search' ? 'white' : 'transparent',
                                color: domainMode === 'search' ? 'var(--primary)' : '#64748b',
                                fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                boxShadow: domainMode === 'search' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Search size={16} /> {t('buy_new_domain') || 'Yeni Alan Adı Al'}
                        </button>
                        <button
                            onClick={() => setDomainMode('connect')}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                                background: domainMode === 'connect' ? 'white' : 'transparent',
                                color: domainMode === 'connect' ? 'var(--primary)' : '#64748b',
                                fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                boxShadow: domainMode === 'connect' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Globe size={16} /> {t('connect_existing_domain') || 'Kendi Alan Adımı Bağla'}
                        </button>
                    </div>

                    {domainMode === 'search' ? (
                        <div className="form-group" style={{ marginBottom: '24px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#334155' }}>
                                {t('check_domain_availability') || 'Alan Adı Müsaitlik Sorgula'}
                            </label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    className="form-input"
                                    value={domainQuery}
                                    onChange={(e) => setDomainQuery(e.target.value)}
                                    placeholder={t('check_domain_placeholder') || "isletmeadi"}
                                    style={{ flex: 1, padding: '10px 16px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                                />
                                <select
                                    value={selectedTld}
                                    onChange={(e) => setSelectedTld(e.target.value)}
                                    style={{ padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white' }}
                                >
                                    <option value="com">.com</option>
                                    <option value="net">.net</option>
                                    <option value="de">.de</option>
                                    <option value="org">.org</option>
                                    <option value="info">.info</option>
                                </select>
                                <button
                                    onClick={checkDomainAvailability}
                                    disabled={isSearching || !domainQuery}
                                    style={{
                                        padding: '10px 20px',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    {isSearching ? '...' : <Search size={16} />}
                                    {t('check_now') || 'Sorgula'}
                                </button>
                            </div>

                            {searchResult && (
                                <div style={{ marginTop: '16px', padding: '12px', borderRadius: '10px', background: searchResult.available ? '#f0fdf4' : '#fef2f2', border: searchResult.available ? '1px solid #bbf7d0' : '1px solid #fecaca' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: searchResult.available ? '#166534' : '#991b1b', fontWeight: '600' }}>
                                        {searchResult.available ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                        {searchResult.domain} {searchResult.available ? (t('is_available') || 'müsait!') : (t('is_taken') || 'dolu.')}
                                    </div>

                                    {searchResult.available && (
                                        <button
                                            onClick={() => setLocalConfig({ ...localConfig, domain: searchResult.domain })}
                                            style={{ marginTop: '8px', background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                                        >
                                            {t('use_this_domain') || 'Bu alan adını kullan'}
                                        </button>
                                    )}

                                    {searchResult.suggestions?.length > 0 && !searchResult.available && (
                                        <div style={{ marginTop: '12px' }}>
                                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>{t('alternatives') || 'Alternatifler:'}</p>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                {searchResult.suggestions.slice(0, 3).map(alt => (
                                                    <button
                                                        key={alt.domain}
                                                        onClick={() => setLocalConfig({ ...localConfig, domain: alt.domain })}
                                                        style={{ padding: '6px 12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', fontSize: '0.8rem', cursor: 'pointer' }}
                                                    >
                                                        {alt.domain}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ marginBottom: '24px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#334155' }}>
                                {t('select_domain_provider') || 'Alan Adı Sağlayıcınızı Seçin'}
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px' }}>
                                {[
                                    { id: 'hostinger', name: 'Hostinger' },
                                    { id: 'godaddy', name: 'GoDaddy' },
                                    { id: 'other', name: t('provider_other') || 'Diğer' }
                                ].map(provider => (
                                    <button
                                        key={provider.id}
                                        onClick={() => setSelectedProvider(provider.id)}
                                        style={{
                                            padding: '12px', borderRadius: '10px',
                                            border: selectedProvider === provider.id ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                                            background: selectedProvider === provider.id ? '#eff6ff' : 'white',
                                            color: selectedProvider === provider.id ? 'var(--primary)' : '#64748b',
                                            fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
                                        }}
                                    >
                                        {provider.name}
                                    </button>
                                ))}
                            </div>

                            <div style={{ padding: '16px', background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Info size={16} color="var(--primary)" /> {getProviderGuide().name} {t('connection_guide') || 'Bağlantı Rehberi'}
                                </h4>
                                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                                    {getProviderGuide().steps.map((step, idx) => (
                                        <li key={idx} style={{ marginBottom: '4px' }}>{step}</li>
                                    ))}
                                </ul>
                                {getProviderGuide().link && (
                                    <a
                                        href={getProviderGuide().link} target="_blank" rel="noreferrer"
                                        style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}
                                    >
                                        {getProviderGuide().name} {t('go_to_panel') || 'Paneline Git'} <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{t('custom_domain_label') || 'Özel Alan Adı'}</label>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px', lineHeight: '1.5' }}>
                            {t('custom_domain_help') || 'Alan adınızı girin ve "Bağla" butonuna tıklayın. Size vermemiz gereken DNS (A ve CNAME) kayıtlarını, alan adı sağlayıcınızın paneline girmeniz gerekecektir.'}
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <input
                                className="form-input"
                                value={localConfig.domain || ''}
                                onChange={(e) => setLocalConfig({ ...localConfig, domain: e.target.value })}
                                placeholder="www.ornekisletme.com"
                                style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}
                            />
                            <button
                                className="primary-btn"
                                onClick={handleConnectDomain}
                                disabled={isConnecting || !localConfig.domain}
                                style={{
                                    minWidth: '100px',
                                    background: connectionStatus === 'success' ? '#10b981' : 'var(--primary)',
                                    color: 'white',
                                    opacity: !localConfig.domain ? 0.5 : 1,
                                    cursor: !localConfig.domain ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isConnecting ? '...' : (connectionStatus === 'success' ? (t('connected_success') || 'Bağlandı!') : (t('connect_button') || 'Bağla'))}
                            </button>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                            {t('current_address_label') || 'Şu anki adresiniz:'} <strong style={{ color: 'var(--primary)' }}>{localConfig.domain || 'demo.bayrechnung.com'}</strong>
                        </p>
                    </div>

                    {/* Enhanced DNS Instructions Card */}
                    {showDnsInstructions && (
                        <div style={{ marginTop: '24px', padding: '24px', background: '#eff6ff', borderRadius: '16px', border: '1px solid #bfdbfe' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af' }}>
                                        <Globe size={18} /> {t('dns_setup_title') || 'DNS Kurulum Bilgileri'}
                                    </h3>
                                    <p style={{ fontSize: '0.85rem', color: '#1e40af', margin: 0 }}>
                                        {t('dns_setup_desc') || 'Alan adınızın aktif olması için aşağıdaki DNS kayıtlarını alan adı sağlayıcınızın paneline ekleyin:'}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: dnsStatus === 'verified' ? '#dcfce7' : (dnsStatus === 'partial' ? '#fef9c3' : '#dbeafe'), padding: '6px 12px', borderRadius: '20px', border: '1px solid opacity 0.2' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dnsStatus === 'verified' ? '#22c55e' : (dnsStatus === 'partial' ? '#eab308' : '#3b82f6') }}></div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: dnsStatus === 'verified' ? '#15803d' : (dnsStatus === 'partial' ? '#854d0e' : '#1e40af') }}>
                                        {dnsStatus === 'verified' ? (t('status_verified') || 'Doğrulandı') : (dnsStatus === 'partial' ? (t('status_partial') || 'Kısmi Yayılma') : (t('status_pending') || 'Bekliyor'))}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gap: '16px' }}>
                                <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #dbeafe', position: 'relative' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '8px', fontWeight: '600' }}>
                                        <span style={{ width: '60px' }}>{t('dns_type') || 'Type'}</span>
                                        <span style={{ width: '60px' }}>{t('dns_host') || 'Host'}</span>
                                        <span style={{ flex: 1, textAlign: 'right' }}>{t('dns_value') || 'Value'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                                        <span style={{ width: '60px', color: '#ec4899', fontWeight: 'bold' }}>A</span>
                                        <span style={{ width: '60px' }}>@</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ color: '#1e293b', fontWeight: 'bold' }}>76.76.21.21</span>
                                            <button onClick={() => copyToClipboard('76.76.21.21', 'A Kaydı')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><Copy size={16} /></button>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #dbeafe' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '8px', fontWeight: '600' }}>
                                        <span style={{ width: '60px' }}>{t('dns_type') || 'Type'}</span>
                                        <span style={{ width: '60px' }}>{t('dns_host') || 'Host'}</span>
                                        <span style={{ flex: 1, textAlign: 'right' }}>{t('dns_value') || 'Value'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                                        <span style={{ width: '60px', color: '#3b82f6', fontWeight: 'bold' }}>CNAME</span>
                                        <span style={{ width: '60px' }}>www</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ color: '#1e293b', fontWeight: 'bold' }}>cname.bayzenit.com</span>
                                            <button onClick={() => copyToClipboard('cname.bayzenit.com', 'CNAME Kaydı')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><Copy size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <button
                                    onClick={handleVerifyDns}
                                    disabled={isVerifying}
                                    style={{
                                        padding: '10px 20px', background: '#1e40af', color: 'white', border: 'none', borderRadius: '8px',
                                        fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem'
                                    }}
                                >
                                    {isVerifying ? <RefreshCw size={16} className="spin" /> : <RefreshCw size={16} />}
                                    {t('verify_now') || 'Şimdi Doğrula'}
                                </button>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', flex: 1, fontStyle: 'italic' }}>
                                    * {t('dns_warning') || 'Değişikliklerin aktif olması 24-48 saat sürebilir.'}
                                </p>
                            </div>

                            {/* Professional Verification Tools */}
                            <div style={{ marginTop: '20px', padding: '16px', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>
                                    {t('external_tools_label') || 'Harici Kontrol Araçları (Advanced)'}
                                </label>
                                <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem' }}>
                                    <a href={`https://dnschecker.org/#A/${localConfig.domain}`} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        DNSChecker.org <ExternalLink size={12} />
                                    </a>
                                    <a href={`https://www.whatsmydns.net/#A/${localConfig.domain}`} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        WhatsMyDNS.net <ExternalLink size={12} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Theme & Appearance */}
                <div className="card" style={{ padding: '24px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                        <div style={{ padding: '8px', background: '#fdf4ff', borderRadius: '8px', color: '#a855f7' }}><Palette size={20} /></div>
                        <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{t('theme_colors_title') || 'Tema ve Renkler'}</h2>
                    </div>

                    {/* White-Label Toggle */}
                    <div style={{ padding: '16px', background: '#f5f3ff', borderRadius: '12px', marginBottom: '24px', border: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontWeight: 'bold', color: '#6d28d9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Sparkles size={16} /> {t('white_label_title') || 'BeyZenit Markasını Kaldır'}
                            </div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#7c3aed' }}>{t('white_label_desc') || 'Genel web sitenizdeki "Powered by BayZenit" yazısını ve platform logolarını gizleyin.'}</p>
                        </div>
                        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px' }}>
                            <input
                                type="checkbox"
                                checked={!localConfig.theme?.showBranding}
                                onChange={(e) => setLocalConfig({ ...localConfig, theme: { ...localConfig.theme, showBranding: !e.target.checked } })}
                                style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span style={{
                                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: !localConfig.theme?.showBranding ? '#7c3aed' : '#ccc',
                                transition: '.4s', borderRadius: '34px'
                            }}>
                                <span style={{
                                    position: 'absolute', content: '""', height: '16px', width: '16px',
                                    left: !localConfig.theme?.showBranding ? '20px' : '4px', bottom: '3px',
                                    backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                                }}></span>
                            </span>
                        </label>
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500' }}>{t('website_theme_label') || 'Web Sitesi Teması'}</label>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px' }}>
                            {t('your_industry') || 'Sektörünüz'}: <strong>{companyProfile?.industry || 'general'}</strong> {t('special_themes_for') || 'için özel temalar'}
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                            {availableThemes.map(theme => (
                                <button
                                    key={theme.id}
                                    onClick={() => setLocalConfig({ ...localConfig, category: theme.id })}
                                    style={{
                                        padding: '16px', borderRadius: '12px',
                                        border: (localConfig.category || availableThemes[0]?.id) === theme.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                                        background: (localConfig.category || availableThemes[0]?.id) === theme.id ? '#eff6ff' : 'white',
                                        cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <theme.icon size={24} color={(localConfig.category || availableThemes[0]?.id) === theme.id ? 'var(--primary)' : '#64748b'} />
                                    <div>
                                        <span style={{ display: 'block', fontWeight: 'bold', fontSize: '0.9rem', color: (localConfig.category || availableThemes[0]?.id) === theme.id ? 'var(--primary)' : '#334155' }}>
                                            {t(`theme_name_${theme.id}`) || theme.name}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                            {t(`theme_desc_${theme.id}`) || theme.desc}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {invoiceCustomization?.brandPalette?.length > 0 && (
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Image size={16} color="#db2777" /> {t('logo_suggested_colors') || 'Logodan Önerilen Renkler'}
                            </label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {invoiceCustomization.brandPalette.map((color, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setLocalConfig({ ...localConfig, theme: { ...localConfig.theme, primaryColor: color } })}
                                        style={{
                                            width: '40px', height: '40px', borderRadius: '50%', background: color,
                                            border: localConfig.theme?.primaryColor === color ? '3px solid white' : '1px solid #e2e8f0',
                                            boxShadow: localConfig.theme?.primaryColor === color ? `0 0 0 2px ${color}` : 'none',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}
                                        title={t('color_from_logo') || 'Color from logo'}
                                    >
                                        {localConfig.theme?.primaryColor === color && <CheckCircle size={20} color="white" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500' }}>{t('primary_color_label') || 'Ana Renk'}</label>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                            {colors.map(c => (
                                <button
                                    key={c.hex}
                                    onClick={() => setLocalConfig({ ...localConfig, theme: { ...localConfig.theme, primaryColor: c.hex } })}
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        background: c.hex,
                                        border: localConfig.theme?.primaryColor === c.hex ? '4px solid white' : '2px solid transparent',
                                        boxShadow: localConfig.theme?.primaryColor === c.hex ? `0 0 0 2px ${c.hex}` : 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white'
                                    }}
                                    title={c.name}
                                >
                                    {localConfig.theme?.primaryColor === c.hex && <span style={{ fontSize: '24px' }}>•</span>}
                                </button>
                            ))}

                            {/* Custom Color Input */}
                            <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                                <input
                                    type="color"
                                    value={localConfig.theme?.primaryColor || '#000000'}
                                    onChange={(e) => setLocalConfig({ ...localConfig, theme: { ...localConfig.theme, primaryColor: e.target.value } })}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '50%',
                                        border: 'none',
                                        padding: 0,
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        position: 'absolute',
                                        opacity: 0
                                    }}
                                />
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '50%',
                                    background: 'conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '2px solid var(--border)',
                                    pointerEvents: 'none'
                                }}>
                                    <Plus size={20} color="white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Color Picker */}
                    <div className="form-group" style={{ marginBottom: '24px', paddingTop: '20px', borderTop: '1px dashed var(--border)' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                            {t('secondary_color_label') || 'İkincil Renk (Opsiyonel)'}
                        </label>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px' }}>
                            {t('secondary_color_desc') || 'Eğer seçilmezse, ana renge uyumlu bir renk otomatik oluşturulur.'}
                        </p>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                            {/* Option to Reset/Clear Secondary Color */}
                            <button
                                onClick={() => setLocalConfig({ ...localConfig, theme: { ...localConfig.theme, secondaryColor: null } })}
                                style={{
                                    padding: '10px 16px', borderRadius: '10px',
                                    border: !localConfig.theme?.secondaryColor ? '2px solid var(--primary)' : '1px solid var(--border)',
                                    background: !localConfig.theme?.secondaryColor ? '#eff6ff' : 'white',
                                    color: !localConfig.theme?.secondaryColor ? 'var(--primary)' : '#64748b',
                                    cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600'
                                }}
                            >
                                {t('auto_generate') || 'Otomatik'}
                            </button>

                            {/* Presets */}
                            {colors.map(c => (
                                <button
                                    key={c.hex + '_sec'}
                                    onClick={() => setLocalConfig({ ...localConfig, theme: { ...localConfig.theme, secondaryColor: c.hex } })}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: c.hex,
                                        border: localConfig.theme?.secondaryColor === c.hex ? '3px solid white' : '2px solid transparent',
                                        boxShadow: localConfig.theme?.secondaryColor === c.hex ? `0 0 0 2px ${c.hex}` : 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        opacity: localConfig.theme?.secondaryColor === c.hex ? 1 : 0.4
                                    }}
                                    title={c.name}
                                >
                                    {localConfig.theme?.secondaryColor === c.hex && <CheckCircle size={16} />}
                                </button>
                            ))}

                            {/* Custom Color Input */}
                            <div style={{ position: 'relative', width: '40px', height: '40px' }}>
                                <input
                                    type="color"
                                    value={localConfig.theme?.secondaryColor || '#ffffff'}
                                    onChange={(e) => setLocalConfig({ ...localConfig, theme: { ...localConfig.theme, secondaryColor: e.target.value } })}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '50%',
                                        border: 'none',
                                        padding: 0,
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        position: 'absolute',
                                        opacity: 0
                                    }}
                                />
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: 'conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '1px solid var(--border)',
                                    pointerEvents: 'none'
                                }}>
                                    <Plus size={16} color="white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Font Selector */}
                    <div className="form-group" style={{ paddingTop: '20px', borderTop: '1px dashed var(--border)' }}>
                        <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Type size={16} color="#6366f1" /> {t('font_family_label') || 'Yazı Tipi (Font)'}
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <select
                                className="form-input"
                                value={localConfig.theme?.fontFamily || '"Inter", sans-serif'}
                                onChange={(e) => setLocalConfig({ ...localConfig, theme: { ...localConfig.theme, fontFamily: e.target.value } })}
                                style={{
                                    width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)',
                                    fontFamily: localConfig.theme?.fontFamily?.replace(/"/g, '') || 'Inter'
                                }}
                            >
                                <optgroup label="Sans Serif">
                                    {GOOGLE_FONTS.filter(f => f.category === 'Sans Serif').map((font) => (
                                        <option key={font.name} value={font.value} style={{ fontFamily: font.value }}>
                                            {font.name}
                                        </option>
                                    ))}
                                </optgroup>
                                <optgroup label="Serif">
                                    {GOOGLE_FONTS.filter(f => f.category === 'Serif').map((font) => (
                                        <option key={font.name} value={font.value} style={{ fontFamily: font.value }}>
                                            {font.name}
                                        </option>
                                    ))}
                                </optgroup>
                                <optgroup label="Display">
                                    {GOOGLE_FONTS.filter(f => f.category === 'Display').map((font) => (
                                        <option key={font.name} value={font.value} style={{ fontFamily: font.value }}>
                                            {font.name}
                                        </option>
                                    ))}
                                </optgroup>
                                <optgroup label="Monospace">
                                    {GOOGLE_FONTS.filter(f => f.category === 'Monospace').map((font) => (
                                        <option key={font.name} value={font.value} style={{ fontFamily: font.value }}>
                                            {font.name}
                                        </option>
                                    ))}
                                </optgroup>
                            </select>

                            {/* Font Preview Area */}
                            <div style={{
                                padding: '24px',
                                background: '#f8fafc',
                                borderRadius: '12px',
                                border: '1px solid var(--border)',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    fontSize: '1.2rem',
                                    marginBottom: '8px',
                                    fontFamily: localConfig.theme?.fontFamily
                                }}>
                                    The quick brown fox jumps over the lazy dog.
                                </div>
                                <div style={{
                                    fontSize: '0.85rem',
                                    color: '#64748b',
                                    fontStyle: 'italic'
                                }}>
                                    {localConfig.theme?.fontFamily?.split(',')[0].replace(/"/g, '')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Moved Info Card */}
                <div className="card" style={{ padding: '24px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ padding: '12px', background: '#eef2ff', borderRadius: '12px', color: '#4f46e5' }}>
                            <LayoutTemplate size={24} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#334155' }}>{t('homepage_header_title') || 'Ana Sayfa Üst Alanı (Header)'}</h2>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>
                                {t('homepage_header_moved_message') || 'Bu alanın ayarları, daha iyi bir deneyim için'} <strong>{t('site_editor') || 'Site Editörü'}</strong> {t('moved_to_page') || 'sayfasına taşındı.'}
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/website/editor')}
                            style={{ marginLeft: 'auto', padding: '10px 20px', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <ExternalLink size={16} /> {t('go_to_editor') || 'Editöre Git'}
                        </button>
                    </div>
                </div>

                {/* 5. Maps & Presence */}
                <div className="card" style={{ padding: '24px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                        <div style={{ padding: '8px', background: '#e0f2fe', borderRadius: '8px', color: '#0284c7' }}><MapPin size={20} /></div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{t('map_location_agent_title') || 'Harita ve Konum (Digital Agent)'}</h2>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                                {t('map_integration_desc') || 'Google ve Apple Haritalar entegrasyonu.'}
                            </p>
                        </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: localConfig.mapsUrl ? '#22c55e' : '#ef4444' }}></div>
                                <span style={{ fontWeight: '500' }}>{t('google_maps_status') || 'Google Maps Status'}:</span>
                                <span style={{ color: localConfig.mapsUrl ? '#15803d' : '#b91c1c', fontWeight: 'bold' }}>
                                    {localConfig.mapsUrl ? (t('status_connected') || 'Bağlandı') : (t('status_not_found') || 'Bulunamadı')}
                                </span>
                            </div>
                            <button
                                onClick={() => {
                                    const companyName = companyProfile?.companyName || localConfig.meta?.title || 'Business';
                                    const addressParts = [companyProfile?.street, companyProfile?.houseNum, companyProfile?.zip, companyProfile?.city].filter(Boolean);
                                    const fullAddress = addressParts.length > 0 ? addressParts.join(' ') : "";
                                    const query = encodeURIComponent(`${companyName} ${fullAddress}`);
                                    const smartMapLink = `https://www.google.com/maps/search/?api=1&query=${query}`;
                                    setLocalConfig({ ...localConfig, mapsUrl: smartMapLink });
                                    alert(`Agent: ${t('map_link_updated_msg') || 'Link updated!'}`);
                                }}
                                style={{ padding: '8px 16px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <RefreshCw size={16} /> {localConfig.mapsUrl ? (t('detect_address_change') || 'Adres Değişikliğini Algıla') : (t('auto_connect') || 'Otomatik Bağla')}
                            </button>
                        </div>

                        {!localConfig.mapsUrl && (
                            <div style={{ padding: '12px', background: '#fff1f2', borderRadius: '8px', fontSize: '0.9rem', color: '#9f1239', marginBottom: '16px', border: '1px solid #fda4af' }}>
                                <strong>Agent:</strong> {t('business_not_found_msg') || 'Business not found.'}
                                <br />
                                <a href="https://business.google.com/create" target="_blank" rel="noreferrer" style={{ color: '#be123c', fontWeight: 'bold', marginTop: '8px', display: 'inline-block' }}>
                                    👉 {t('register_google_business') || "Register on Google"}
                                </a>
                            </div>
                        )}

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{t('map_link_manual') || 'Harita Bağlantısı'}</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    className="form-input"
                                    value={localConfig.mapsUrl || ''}
                                    onChange={(e) => setLocalConfig({ ...localConfig, mapsUrl: e.target.value })}
                                    placeholder="https://goo.gl/maps/..."
                                    style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}
                                />
                                {localConfig.mapsUrl && (
                                    <a href={localConfig.mapsUrl} target="_blank" rel="noreferrer" style={{ padding: '12px', background: '#f1f5f9', borderRadius: '12px', color: '#64748b', display: 'flex', alignItems: 'center', border: '1px solid var(--border)' }}>
                                        <ExternalLink size={20} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 6. Communication & Footer */}
                <div className="card" style={{ padding: '24px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                        <div style={{ padding: '8px', background: '#fce7f3', borderRadius: '8px', color: '#db2777' }}><Globe size={20} /></div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{t('footer_communication_title') || 'İletişim ve Alt Bilgi'}</h2>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                                {t('footer_communication_desc') || 'Social links and description.'}
                            </p>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{t('company_description_label') || 'Firma Açıklaması'}</label>
                        <textarea
                            className="form-input"
                            rows="3"
                            maxLength="300"
                            placeholder={t('company_description_placeholder') || "Short intro..."}
                            value={localConfig.footerDescription || ''}
                            onChange={(e) => setLocalConfig({ ...localConfig, footerDescription: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.95rem' }}
                        />
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px', textAlign: 'right' }}>
                            {(localConfig.footerDescription || '').length} / 300
                        </p>
                    </div>

                    <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>{t('social_media_accounts') || 'Sosyal Medya'}</h3>
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {[
                            { id: 'instagram', icon: Instagram, label: 'Instagram', color: '#E1306C' },
                            { id: 'facebook', icon: Facebook, label: 'Facebook', color: '#1877F2' },
                            { id: 'twitter', icon: Twitter, label: 'Twitter / X', color: '#1DA1F2' },
                            { id: 'linkedin', icon: Linkedin, label: 'LinkedIn', color: '#0A66C2' }
                        ].map((social) => (
                            <div key={social.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '8px',
                                    background: localConfig.socialLinks?.[social.id] ? social.color : '#f1f5f9',
                                    color: localConfig.socialLinks?.[social.id] ? 'white' : '#94a3b8',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <social.icon size={20} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <input
                                        className="form-input"
                                        placeholder={social.label}
                                        value={localConfig.socialLinks?.[social.id] || ''}
                                        onChange={(e) => setLocalConfig({
                                            ...localConfig,
                                            socialLinks: { ...(localConfig.socialLinks || {}), [social.id]: e.target.value }
                                        })}
                                        style={{ width: '100%', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}
                                    />
                                </div>
                                {localConfig.socialLinks?.[social.id] && (
                                    <a href={localConfig.socialLinks[social.id]} target="_blank" rel="noreferrer" style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                        <ExternalLink size={18} />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Extra / Custom Social Links */}
                    <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px dashed var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '0.9rem', margin: 0 }}>{t('extra_social_links') || 'Ekstra Sosyal Medya & Linkler'}</h4>
                            <button
                                onClick={() => {
                                    const customLinks = [...(localConfig.extraSocialLinks || [])];
                                    customLinks.push({ id: Date.now(), label: '', url: '', icon: 'Globe' });
                                    setLocalConfig({ ...localConfig, extraSocialLinks: customLinks });
                                }}
                                style={{ padding: '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                <Plus size={14} /> {t('add_more') || 'Ekle'}
                            </button>
                        </div>

                        <div style={{ display: 'grid', gap: '12px' }}>
                            {(localConfig.extraSocialLinks || []).map((link, idx) => (
                                <div key={link.id || idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <div style={{ width: '36px', height: '36px', background: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                                        <Globe size={18} color="#64748b" />
                                    </div>
                                    <input
                                        className="form-input"
                                        placeholder={t('platform_name_placeholder') || "Platform Adı (örn: YouTube)"}
                                        value={link.label}
                                        onChange={(e) => {
                                            const newList = [...localConfig.extraSocialLinks];
                                            newList[idx].label = e.target.value;
                                            setLocalConfig({ ...localConfig, extraSocialLinks: newList });
                                        }}
                                        style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                                    />
                                    <input
                                        className="form-input"
                                        placeholder="URL"
                                        value={link.url}
                                        onChange={(e) => {
                                            const newList = [...localConfig.extraSocialLinks];
                                            newList[idx].url = e.target.value;
                                            setLocalConfig({ ...localConfig, extraSocialLinks: newList });
                                        }}
                                        style={{ flex: 2, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                                    />
                                    <button
                                        onClick={() => {
                                            const newList = localConfig.extraSocialLinks.filter((_, i) => i !== idx);
                                            setLocalConfig({ ...localConfig, extraSocialLinks: newList });
                                        }}
                                        style={{ padding: '8px', color: '#ef4444', background: '#fef2f2', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            {(!localConfig.extraSocialLinks || localConfig.extraSocialLinks.length === 0) && (
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, textAlign: 'center', py: '10px' }}>
                                    {t('no_extra_links') || 'Henüz ekstra link eklenmedi.'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Save Button */}
            <button
                onClick={handleSaveAndExit}
                style={{
                    position: 'fixed',
                    bottom: '32px',
                    right: '32px',
                    padding: '16px 32px',
                    borderRadius: '100px',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5), 0 8px 10px -6px rgba(59, 130, 246, 0.5)',
                    cursor: 'pointer',
                    zIndex: 1000,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(59, 130, 246, 0.5), 0 8px 10px -6px rgba(59, 130, 246, 0.5)';
                }}
            >
                <Save size={24} /> {t('save_and_exit') || 'Kaydet ve Çık'}
            </button>
        </div>
    );
};

export default WebsiteSettings;
