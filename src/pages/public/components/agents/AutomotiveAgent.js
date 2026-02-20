
import { BaseAgent } from './BaseAgent';

export class AutomotiveAgent extends BaseAgent {
    getSynonymMap() {
        return {
            ...super.getSynonymMap(),
            'yağ': 'oil', 'yag': 'oil', 'yağı': 'oil', 'yaği': 'oil',
            'fren': 'brake', 'disk': 'brake', 'balata': 'brake',
            'filtre': 'filter', 'filitre': 'filter',
            'buji': 'plug', 'ateşleme': 'plug',
            'silecek': 'wiper', 'blade': 'wiper',
            'bakım': 'service', 'servis': 'service',
            'lastik': 'tire', 'teker': 'tire',
            'motor': 'engine', 'akü': 'battery', 'egzoz': 'exhaust'
        };
    }

    getSpecialistResponse(normQ, expandedWords) {
        const keywords = ['yağ', 'fren', 'lastik', 'motor', 'bakım', 'muayene', 'balata', 'akü', 'egzoz'];

        if (expandedWords.some(w => keywords.includes(w)) || keywords.some(k => normQ.includes(k))) {
            const product = this.findBestProductMatch(expandedWords, normQ);

            let response = "Düzenli araç bakımı, sürüş güvenliğiniz ve aracınızın ömrü için kritiktir. Özellikle 10-15 bin km'de bir yağ ve filtre değişimi yapılması motorunuzu korur.\n\nAracınızın modeline en uygun parçayı ve yağı belirlemek için profesyonel ekibimize danışabilirsiniz.";

            if (product) {
                response += `\n\nSitemizde bulunan "${product.name}" hizmetimiz sizin için uygun olabilir. Fiyat: ${product.price} ${this.config?.currency || '€'}.`;
                return response + `\n\n[ACTION:BOOK:/Rechnung/booking?service=${product.id}] [ACTION:CART:${product.id}]`;
            }

            return response + `\n\n[ACTION:BOOK:/Rechnung/booking] [ACTION:CALL:tel:${this.profile?.phone}]`;
        }

        return null;
    }

    getGreeting() {
        return `Merhaba! Ben ${this.profile?.companyName} otomobil uzmanı dijital asistanınızım. Aracınızın bakımı, yedek parça veya servis randevuları hakkında size nasıl yardımcı olabilirim?`;
    }

    getDesignAdviceResponse() {
        return `Oto servisiniz için size özel 3 farklı tasarım stratejisi hazırladım:
        
1. **Profesyonel (V1)**: Kurumsal bir güven verir. Lacivert ve gri tonları ağırlıklıdır.
2. **Dinamik (V2)**: Hız ve teknoloji odaklıdır. Kırmızı vurgular ve yuvarlak hatlar içerir.
3. **Minimal (V3)**: Modern ve sade bir görünüm sunar. Ferah bir tasarım isteyenler içindir.

Benim önerim, müşteri kitleniz klasik otomobiller ise V1, modifiye veya modern araçlar ise V2 seçeneğidir.`;
    }

    getThemeSpecs(variant = 'v1') {
        const primary = this.profile?.brandColor || '#f97316';

        const specs = {
            v1: { // Trust & Tradition
                primary: '#0B1F3B',
                accent: '#f1f5f9',
                bg: '#f8fafc',
                surface: '#ffffff',
                text: '#0f172a',
                textSecondary: '#475569',
                radius: '2px', // Sharp
                fontPrimary: "'Inter', sans-serif",
                fontHeader: "'Inter', sans-serif",
                shadow: '0 1px 3px rgba(0,0,0,0.1)',
                shadowHover: '0 4px 6px rgba(0,0,0,0.1)'
            },
            v2: { // Speed & Tech
                primary: '#e11d48', // Rose-600
                accent: '#fff1f2',
                bg: '#0f172a', // Dark BG
                surface: '#1e293b',
                text: '#f8fafc',
                textSecondary: '#94a3b8',
                radius: '16px', // Rounded
                fontPrimary: "'Inter', sans-serif",
                fontHeader: "'Exo 2', sans-serif",
                shadow: '0 0 20px rgba(225, 29, 72, 0.2)',
                shadowHover: '0 0 40px rgba(225, 29, 72, 0.4)'
            },
            v3: { // Clean & Minimal
                primary: primary,
                accent: '#fafaf9',
                bg: '#ffffff',
                surface: '#fafaf9',
                text: '#1c1917',
                textSecondary: '#78716c',
                radius: '0px', // Ultra sharp
                fontPrimary: "'Inter', sans-serif",
                fontHeader: "'Playfair Display', serif",
                shadow: 'none',
                border: '1px solid #e7e5e4',
                shadowHover: '0 10px 15px -3px rgba(0,0,0,0.05)'
            }
        };

        return specs[variant] || specs.v1;
    }
}
