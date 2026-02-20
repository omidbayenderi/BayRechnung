
import { BaseAgent } from './BaseAgent';

export class ConstructionAgent extends BaseAgent {
    getSynonymMap() {
        return {
            ...super.getSynonymMap(),
            'beton': 'concrete', 'yalıtım': 'insulation', 'boya': 'paint',
            'çatı': 'roof', 'temel': 'foundation', 'demir': 'iron',
            'mimari': 'architecture', 'proje': 'project', 'tadilat': 'renovation'
        };
    }

    getSpecialistResponse(normQ, expandedWords) {
        const keywords = ['beton', 'yalıtım', 'boya', 'çatı', 'temel', 'proje', 'mimari', 'inşaat', 'yapı'];

        if (expandedWords.some(w => keywords.includes(w)) || keywords.some(k => normQ.includes(k))) {
            const product = this.findBestProductMatch(expandedWords, normQ);

            let response = "İnşaat ve yapı projelerinde sağlamlık, doğru malzeme seçimi ve uzman işçilik en önemli unsurlardır. Yüksek standartlarda mimari çözümler ve zamanında teslimat prensibi ile çalışıyoruz.\n\nİhtiyacınıza en uygun proje veya taahhüt çözümünü belirlemek için teknik ekibimize danışabilirsiniz.";

            if (product) {
                response += `\n\nŞu an yayında olan "${product.name}" çözümümüz projeleriniz için uygun olabilir.`;
                return response + `\n\n[ACTION:BOOK:/Rechnung/booking?service=${product.id}] [ACTION:CART:${product.id}]`;
            }

            return response + `\n\n[ACTION:BOOK:/Rechnung/booking] [ACTION:CALL:tel:${this.profile?.phone}]`;
        }

        return null;
    }

    getGreeting() {
        return `Merhaba! Ben ${this.profile?.companyName} yapı ve inşaat uzmanı dijital asistanınızım. Projeleriniz, teknik detaylar veya taahhüt hizmetlerimiz hakkında size nasıl yardımcı olabilirim?`;
    }

    getDesignAdviceResponse() {
        return `İnşaat firmanız için 3 farklı kurumsal tasarım rotası hazırladım:
        
1. **Endüstriyel (V1)**: Güç ve ölçek odaklı. Turuncu ve çelik grisi tonları, sert köşeler ve projeleri vurgulayan bir yapı.
2. **Mimari (V2)**: Tasarım odaklı. Temiz çizgiler, yenilikçi düzenler ve modern bir mavi/gri paleti.
3. **Yönetici (V3)**: Güven ve basitlik. Koyu lacivert ve beyaz, sade bir kahraman alanı ve başarı odaklı sunum.

Ağır iş ve taahhüt odaklıysanız V1, mimari ofis veya modern yapılar yapıyorsanız V2 idealdir.`;
    }

    getThemeSpecs(variant = 'v1') {
        const primary = this.profile?.brandColor || '#c2410c'; // Orange-700 default

        const specs = {
            v1: { // Industrial / Robust
                primary: '#c2410c', // Construction Orange
                accent: '#fff7ed',
                bg: '#f8fafc',
                surface: '#ffffff',
                text: '#0f172a',
                textSecondary: '#475569',
                radius: '2px', // Hard edges
                fontPrimary: "'Inter', sans-serif",
                fontHeader: "'Oswald', sans-serif", // Strong industrial font
                shadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                shadowHover: '0 10px 15px -3px rgba(0,0,0,0.1)'
            },
            v2: { // Modern / Architectural
                primary: '#2563eb', // Blue-600
                accent: '#eff6ff',
                bg: '#ffffff',
                surface: '#f8fafc',
                text: '#1e293b',
                textSecondary: '#64748b',
                radius: '8px',
                fontPrimary: "'Inter', sans-serif",
                fontHeader: "'Inter', sans-serif",
                shadow: '0 4px 12px rgba(37, 99, 235, 0.05)',
                shadowHover: '0 12px 24px rgba(37, 99, 235, 0.1)'
            },
            v3: { // Executive / Trust
                primary: '#0f172a', // Navy
                accent: '#f1f5f9',
                bg: '#ffffff',
                surface: '#ffffff',
                text: '#0f172a',
                textSecondary: '#64748b',
                radius: '0px', // Professional sharp
                fontPrimary: "'Inter', sans-serif",
                fontHeader: "'Playfair Display', serif",
                shadow: 'none',
                border: '1px solid #e2e8f0',
                shadowHover: '0 8px 16px rgba(0,0,0,0.04)'
            }
        };

        return specs[variant] || specs.v1;
    }
}
