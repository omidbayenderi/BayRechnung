import { useEffect, useRef } from 'react';

/**
 * SEO AGENT 🕵️‍♂️
 * 
 * Bu bileşen arka planda çalışan bir "Yapay Zeka" gibi davranır.
 * Kullanıcının girdiği verileri (başlıklar, hizmetler, iletişim) analiz eder
 * ve Google/Bing/LLM'lerin anlayacağı en optimize SEO etiketlerini ve
 * JSON-LD yapısal verilerini otomatik olarak oluşturur.
 */
const SeoAgent = ({ websiteData, profile }) => {

    const lastKeyRef = useRef('');

    // Build a stable dependency key from actual content values
    const stableKey = JSON.stringify([
        profile?.companyName,
        profile?.industry,
        websiteData?.config?.businessCategory,
        websiteData?.hero?.title,
        websiteData?.sections?.length
    ]);

    useEffect(() => {
        if (!websiteData) return;
        // Prevent duplicate runs for the same data
        if (lastKeyRef.current === stableKey) return;
        lastKeyRef.current = stableKey;

        // 1. DATA EXTRACTION & INTELLIGENCE
        // ------------------------------------------------
        const industry = websiteData.config?.businessCategory || profile?.industry || 'LocalBusiness';
        const companyName = profile?.companyName || websiteData.hero?.title || 'İşletme Adı';
        const rawDescription = websiteData.sections?.find(s => s.type === 'text')?.data?.text ||
            websiteData.hero?.subtitle ||
            "Profesyonel hizmetler ve kaliteli çözümler.";

        // Remove HTML tags for meta description
        const cleanDescription = rawDescription.replace(/<[^>]*>?/gm, '').substring(0, 160).trim();

        // Extract Keywords from Features/Services
        const serviceKeywords = websiteData.sections
            ?.filter(s => s.type === 'features')
            .flatMap(s => s.data.items?.map(i => i.title))
            .filter(Boolean)
            .join(', ');

        const baseKeywords = `${companyName}, ${industry}, ${serviceKeywords || ''}, profesyonel, kaliteli, uygun fiyat`;


        // Canonical Link
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = window.location.href;

        // Favicon
        if (profile?.logo || websiteData.hero?.image) {
            let favicon = document.querySelector('link[rel="icon"]');
            if (!favicon) {
                favicon = document.createElement('link');
                favicon.rel = 'icon';
                document.head.appendChild(favicon);
            }
            favicon.href = profile?.logo || websiteData.hero?.image;
        }

        // Title
        document.title = `${companyName} | ${websiteData.config?.siteSlugLine || 'Profesyonel Çözümler'}`;

        // Meta Tags Helper
        const setMeta = (name, content) => {
            let element = document.querySelector(`meta[name="${name}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.name = name;
                document.head.appendChild(element);
            }
            element.content = content || '';
        };

        const setOgMeta = (property, content) => {
            let element = document.querySelector(`meta[property="${property}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute('property', property);
                document.head.appendChild(element);
            }
            element.content = content || '';
        };

        // Standard SEO
        setMeta('description', cleanDescription);
        setMeta('keywords', baseKeywords);
        setMeta('robots', 'index, follow');
        setMeta('viewport', 'width=device-width, initial-scale=1, maximum-scale=5');
        setMeta('author', companyName);
        setMeta('geo.region', 'TR');
        if (profile?.city) setMeta('geo.placename', profile.city);

        // Open Graph
        setOgMeta('og:title', companyName);
        setOgMeta('og:description', cleanDescription);
        setOgMeta('og:type', 'website');
        setOgMeta('og:url', window.location.href);
        setOgMeta('og:site_name', companyName);
        if (profile?.logo || websiteData.hero?.image) {
            setOgMeta('og:image', profile?.logo || websiteData.hero?.image);
        }

        // Twitter Card
        setMeta('twitter:card', 'summary_large_image');
        setMeta('twitter:title', companyName);
        setMeta('twitter:description', cleanDescription);
        if (profile?.logo || websiteData.hero?.image) {
            setMeta('twitter:image', profile?.logo || websiteData.hero?.image);
        }

        // 3. STRUCTURED DATA (JSON-LD)
        const services = websiteData.sections?.find(s => s.type === 'services')?.data?.items || [];
        const jsonLd = {
            "@context": "https://schema.org",
            "@type": industry === 'Construction' ? 'HomeAndConstructionBusiness' : (industry === 'Beauty' ? 'BeautySalon' : 'LocalBusiness'),
            "name": companyName,
            "image": profile?.logo || websiteData.hero?.image || "",
            "description": cleanDescription,
            "telephone": profile?.phone || "",
            "email": profile?.email || "",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": `${profile?.street || ''} ${profile?.houseNum || ''}`,
                "addressLocality": profile?.city || "",
                "postalCode": profile?.zip || "",
                "addressCountry": "TR"
            },
            "url": window.location.href,
            "priceRange": "$$",
            "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Services",
                "itemListElement": services.map((s, idx) => ({
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": s.name || s.title,
                        "description": s.description || s.desc
                    }
                }))
            }
        };

        // Inject JSON-LD
        let scriptTag = document.getElementById('seo-json-ld');
        if (!scriptTag) {
            scriptTag = document.createElement('script');
            scriptTag.id = 'seo-json-ld';
            scriptTag.type = 'application/ld+json';
            document.head.appendChild(scriptTag);
        }
        scriptTag.text = JSON.stringify(jsonLd);

        console.log("🕵️‍♂️ SEO Agent: Site optimized.", { title: document.title });

        // AGENT ORCHESTRATION: Log SEO success
        import('../lib/supabase').then(({ supabase }) => {
            supabase.from('audit_logs').insert([{
                action: 'SEO_OPTIMIZED',
                source: 'BaySEO',
                severity: 'info',
                metadata: {
                    title: document.title,
                    description: cleanDescription.substring(0, 50) + '...',
                    keywords_count: baseKeywords.split(',').length,
                    json_ld: industry
                }
            }]).catch(() => { });
        });

        // 4. ANALYTICS INJECTION (Google Analytics)
        // ------------------------------------------------
        const analyticsId = websiteData.config?.analyticsId || profile?.analyticsId;

        // Clean up previous script if ID changes or is removed
        const existingScript = document.getElementById('ga-script');
        const existingConfig = document.getElementById('ga-config');

        if (analyticsId && !existingScript) {
            // Inject gtag.js
            const script = document.createElement('script');
            script.id = 'ga-script';
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;
            document.head.appendChild(script);

            // Inject config
            const configScript = document.createElement('script');
            configScript.id = 'ga-config';
            configScript.innerHTML = `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${analyticsId}');
             `;
            document.head.appendChild(configScript);
            console.log(`📊 SEO Agent: Google Analytics (${analyticsId}) injected.`);
        }


    }, [stableKey]); // Only re-run when actual content values change

    return null; // This component renders nothing visually
};

export default SeoAgent;
