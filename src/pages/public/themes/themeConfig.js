import { LayoutTemplate, Sparkles, Zap, Building2, Wrench, Heart, ShoppingBag, Scissors, FileText, GraduationCap } from 'lucide-react';

/**
 * Central Theme Configuration
 * Maps each industry to 3 unique theme variants
 */
export const THEME_REGISTRY = {
    automotive: [
        {
            id: 'automotive-professional',
            name: 'Professional',
            desc: 'Kurumsal ve güvenilir',
            icon: Building2,
            variant: 'v1'
        },
        {
            id: 'automotive-dynamic',
            name: 'Dynamic',
            desc: 'Dinamik ve modern',
            icon: Zap,
            variant: 'v2'
        },
        {
            id: 'automotive-minimal',
            name: 'Minimal',
            desc: 'Sade ve odaklı',
            icon: LayoutTemplate,
            variant: 'v3'
        }
    ],
    beauty: [
        {
            id: 'beauty-elegant',
            name: 'Elegant',
            desc: 'Şık ve zarif',
            icon: Sparkles,
            variant: 'v1'
        },
        {
            id: 'beauty-modern',
            name: 'Modern',
            desc: 'Çağdaş ve canlı',
            icon: Heart,
            variant: 'v2'
        },
        {
            id: 'beauty-minimal',
            name: 'Minimal',
            desc: 'Sade ve temiz',
            icon: LayoutTemplate,
            variant: 'v3'
        }
    ],
    construction: [
        {
            id: 'construction-industrial',
            name: 'Industrial',
            desc: 'Güçlü ve sağlam',
            icon: Building2,
            variant: 'v1'
        },
        {
            id: 'construction-modern',
            name: 'Modern',
            desc: 'Yenilikçi ve profesyonel',
            icon: Zap,
            variant: 'v2'
        },
        {
            id: 'construction-classic',
            name: 'Classic',
            desc: 'Geleneksel ve güvenilir',
            icon: LayoutTemplate,
            variant: 'v3'
        }
    ],
    general: [
        {
            id: 'general-corporate',
            name: 'Corporate',
            desc: 'Profesyonel iş portalı',
            icon: Building2,
            variant: 'v1'
        },
        {
            id: 'general-creative',
            name: 'Creative',
            desc: 'Yaratıcı ve özgün',
            icon: Sparkles,
            variant: 'v2'
        },
        {
            id: 'general-minimal',
            name: 'Minimal',
            desc: 'Sade ve etkili',
            icon: LayoutTemplate,
            variant: 'v3'
        }
    ],
    gastronomy: [
        {
            id: 'gastronomy-deluxe',
            name: 'Deluxe',
            desc: 'Lüks ve zarif',
            icon: Sparkles,
            variant: 'v1'
        },
        {
            id: 'gastronomy-casual',
            name: 'Casual',
            desc: 'Rahat ve samimi',
            icon: Heart,
            variant: 'v2'
        },
        {
            id: 'gastronomy-modern',
            name: 'Modern',
            desc: 'Çağdaş mutfak',
            icon: Zap,
            variant: 'v3'
        }
    ],
    healthcare: [
        {
            id: 'healthcare-clinical',
            name: 'Clinical',
            desc: 'Güvenilir ve profesyonel',
            icon: Building2,
            variant: 'v1'
        },
        {
            id: 'healthcare-friendly',
            name: 'Friendly',
            desc: 'Sıcak ve samimi',
            icon: Heart,
            variant: 'v2'
        },
        {
            id: 'healthcare-modern',
            name: 'Modern',
            desc: 'İnovatif sağlık',
            icon: Zap,
            variant: 'v3'
        }
    ],
    it: [
        {
            id: 'it-tech',
            name: 'Tech',
            desc: 'Keskin ve teknolojik',
            icon: Zap,
            variant: 'v1'
        },
        {
            id: 'it-startup',
            name: 'Startup',
            desc: 'Dinamik ve yenilikçi',
            icon: Sparkles,
            variant: 'v2'
        },
        {
            id: 'it-corporate',
            name: 'Corporate',
            desc: 'Kurumsal BT çözümleri',
            icon: Building2,
            variant: 'v3'
        }
    ],
    retail: [
        {
            id: 'retail-boutique',
            name: 'Boutique',
            desc: 'Özel koleksiyon',
            icon: ShoppingBag,
            variant: 'v1'
        },
        {
            id: 'retail-marketplace',
            name: 'Marketplace',
            desc: 'Geniş ürün ağı',
            icon: LayoutTemplate,
            variant: 'v2'
        },
        {
            id: 'retail-premium',
            name: 'Premium',
            desc: 'Lüks alışveriş',
            icon: Sparkles,
            variant: 'v3'
        }
    ],
    crafts: [
        {
            id: 'crafts-artisan',
            name: 'Artisan',
            desc: 'Usta işçilik',
            icon: Scissors,
            variant: 'v1'
        },
        {
            id: 'crafts-workshop',
            name: 'Workshop',
            desc: 'Atölye tarzı',
            icon: Wrench,
            variant: 'v2'
        },
        {
            id: 'crafts-modern',
            name: 'Modern',
            desc: 'Çağdaş zanaat',
            icon: Zap,
            variant: 'v3'
        }
    ],
    consulting: [
        {
            id: 'consulting-executive',
            name: 'Executive',
            desc: 'Üst düzey danışmanlık',
            icon: Building2,
            variant: 'v1'
        },
        {
            id: 'consulting-strategic',
            name: 'Strategic',
            desc: 'Stratejik çözümler',
            icon: FileText,
            variant: 'v2'
        },
        {
            id: 'consulting-modern',
            name: 'Modern',
            desc: 'Yenilikçi danışmanlık',
            icon: Sparkles,
            variant: 'v3'
        }
    ],
    education: [
        {
            id: 'education-academic',
            name: 'Academic',
            desc: 'Akademik kurumsal',
            icon: GraduationCap,
            variant: 'v1'
        },
        {
            id: 'education-interactive',
            name: 'Interactive',
            desc: 'Etkileşimli öğrenme',
            icon: Zap,
            variant: 'v2'
        },
        {
            id: 'education-friendly',
            name: 'Friendly',
            desc: 'Samimi eğitim',
            icon: Heart,
            variant: 'v3'
        }
    ]
};

/**
 * Get available themes for a specific industry
 * @param {string} industry - Industry type (e.g., 'automotive', 'beauty')
 * @returns {Array} Array of theme objects
 */
export const getThemesForIndustry = (industry) => {
    const normalizedIndustry = String(industry || 'general').toLowerCase();
    return THEME_REGISTRY[normalizedIndustry] || THEME_REGISTRY.general;
};

/**
 * Extract base category from theme ID
 * @param {string} themeId - Full theme ID (e.g., 'beauty-elegant')
 * @returns {string} Base category (e.g., 'beauty')
 */
export const getCategoryFromThemeId = (themeId) => {
    if (!themeId || typeof themeId !== 'string') return 'general';
    return themeId.split('-')[0];
};

/**
 * Extract variant from theme ID
 * @param {string} themeId - Full theme ID (e.g., 'beauty-elegant')
 * @returns {string} Variant code (e.g., 'v1')
 */
export const getVariantFromThemeId = (themeId) => {
    if (!themeId || typeof themeId !== 'string') return 'v1';

    // Find the theme in registry
    const category = getCategoryFromThemeId(themeId);
    const themes = THEME_REGISTRY[category] || THEME_REGISTRY.general;
    const theme = themes.find(t => t.id === themeId);

    return theme?.variant || 'v1';
};
