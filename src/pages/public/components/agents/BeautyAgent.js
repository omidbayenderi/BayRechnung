
import { BaseAgent } from './BaseAgent';

export class BeautyAgent extends BaseAgent {
    getSynonymMap() {
        return {
            ...super.getSynonymMap(),
            'cilt': 'skin', 'yüz': 'face', 'maske': 'mask',
            'saç': 'hair', 'kesim': 'cut', 'bakım': 'care',
            'tırnak': 'nail', 'manikür': 'manicure', 'lazer': 'laser',
            'epilasyon': 'epilation', 'kaş': 'brow'
        };
    }

    getSpecialistResponse(normQ, expandedWords) {
        const keywords = ['cilt', 'saç', 'tırnak', 'lazer', 'bakım', 'epilasyon', 'maske', 'yüz', 'makyaj'];

        if (expandedWords.some(w => keywords.includes(w)) || keywords.some(k => normQ.includes(k))) {
            const product = this.findBestProductMatch(expandedWords, normQ);

            let response = "Güzellik ve özbakım uygulamalarında süreklilik ve doğru ürün seçimi esastır. Cilt tipinize veya saç yapınıza uygun profesyonel seanslar için uzmanlarımız hizmetinizde.\n\nSize en uygun bakımı belirlemek için hemen bir ön görüşme randevusu alabilirsiniz.";

            if (product) {
                response += `\n\nSitemizde bulunan "${product.name}" hizmetimiz sizin için harika bir seçim olabilir. Fiyat: ${product.price} ${this.config?.currency || '€'}.`;
                return response + `\n\n[ACTION:BOOK:/Rechnung/booking?service=${product.id}] [ACTION:CART:${product.id}]`;
            }

            return response + `\n\n[ACTION:BOOK:/Rechnung/booking] [ACTION:CALL:tel:${this.profile?.phone}]`;
        }

        return null;
    }

    getGreeting() {
        return `Merhaba! Ben ${this.profile?.companyName} güzellik ve bakım uzmanı dijital asistanınızım. Cilt bakımı, saç tasarımı veya özel uygulamalarımız hakkında size nasıl yardımcı olabilirim?`;
    }

    getDesignAdviceResponse() {
        return `Güzellik merkeziniz için hazırladığım 3 profesyonel tasarım konsepti:
        
1. **Elegant (V1)**: Lüks ve hikaye odaklı. Bej ve pastel tonlar, Serif yazı tipleri ile "Sessiz Lüks" hissi verir.
2. **Modern (V2)**: Canlı ve dinamik. Mücevher tonları, interaktif efektler ve yüksek enerji içerir.
3. **Minimal (V3)**: Saf ve huzurlu. Beyaz ve açık gri ağırlıklı, zen felsefesine uygun ferahlık sunar.

Önerim: VIP müşterilere hitap ediyorsanız V1, genç ve trend bir kitleye odaklıysanız V2'yi seçebilirsiniz.`;
    }

    getThemeSpecs(variant = 'v1') {
        const primary = this.profile?.brandColor || '#ec4899'; // Pink-500 default

        const specs = {
            v1: { // Luxury / Elegant
                primary: '#7c2d12', // Deep brown/bronze
                accent: '#fff7ed',
                bg: '#fffbf7',
                surface: '#ffffff',
                text: '#431407',
                textSecondary: '#9a3412',
                radius: '20px',
                fontPrimary: "'Inter', sans-serif",
                fontHeader: "'Playfair Display', serif",
                shadow: '0 4px 20px rgba(124, 45, 18, 0.05)',
                shadowHover: '0 10px 30px rgba(124, 45, 18, 0.1)'
            },
            v2: { // Vibrant / Modern
                primary: '#8b5cf6', // Violet-500
                accent: '#f5f3ff',
                bg: '#ffffff',
                surface: '#f5f3ff',
                text: '#2e1065',
                textSecondary: '#6d28d9',
                radius: '12px',
                fontPrimary: "'Inter', sans-serif",
                fontHeader: "'Montserrat', sans-serif",
                shadow: '0 4px 15px rgba(139, 92, 246, 0.1)',
                shadowHover: '0 15px 30px rgba(139, 92, 246, 0.2)'
            },
            v3: { // Pure / Zen
                primary: '#14b8a6', // Teal-500
                accent: '#f0fdfa',
                bg: '#fcfcfc',
                surface: '#ffffff',
                text: '#0f172a',
                textSecondary: '#64748b',
                radius: '4px',
                fontPrimary: "'Inter', sans-serif",
                fontHeader: "'Inter', sans-serif",
                shadow: 'none',
                border: '1px solid #f1f5f9',
                shadowHover: '0 10px 20px rgba(0,0,0,0.02)'
            }
        };

        return specs[variant] || specs.v1;
    }
}
