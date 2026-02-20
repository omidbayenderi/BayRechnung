
import { BaseAgent } from './BaseAgent';

export class GastroAgent extends BaseAgent {
    getSynonymMap() {
        return {
            ...super.getSynonymMap(),
            'yemek': 'food', 'menü': 'menu', 'rezervasyon': 'reservation',
            'masa': 'table', 'içecek': 'drink', 'tatlı': 'dessert',
            'vegan': 'vegan', 'vejetaryen': 'vegetarian', 'gluten': 'gluten'
        };
    }

    getSpecialistResponse(normQ, expandedWords) {
        const keywords = ['yemek', 'menü', 'rezervasyon', 'masa', 'içecek', 'lezzet', 'mutfak', 'şef'];

        if (expandedWords.some(w => keywords.includes(w)) || keywords.some(k => normQ.includes(k))) {
            const product = this.findBestProductMatch(expandedWords, normQ);

            let response = "Özenle seçilmiş malzemeler ve usta şeflerimizin maharetiyle hazırlanan menümüzü deneyimleyin. Hijyen ve kalite standartlarımızdan ödün vermeden size en lezzetli seçenekleri sunuyoruz.\n\nGünün menüsü veya özel rezervasyon talepleriniz için bize ulaşabilirsiniz.";

            if (product) {
                response += `\n\nMenümüzde yer alan "${product.name}" lezzetimizi denemenizi kesinlikle öneririz. Fiyat: ${product.price} ${this.config?.currency || '€'}.`;
                return response + `\n\n[ACTION:BOOK:/Rechnung/booking?service=${product.id}] [ACTION:CART:${product.id}]`;
            }

            return response + `\n\n[ACTION:BOOK:/Rechnung/booking] [ACTION:CALL:tel:${this.profile?.phone}]`;
        }

        return null;
    }

    getGreeting() {
        return `Merhaba! Ben ${this.profile?.companyName} lezzet uzmanı dijital asistanınızım. Menümüz, rezervasyon veya özel yemek organizasyonlarınız hakkında size nasıl yardımcı olabilirim?`;
    }

    getDesignAdviceResponse() {
        return `Restoranınız için 3 farklı gastronomi tasarımı hazırladım:
        
1. **Michelin (V1)**: Yüksek mutfak ve prestij. Koyu arka plan, altın vurgular ve zarif tipografi.
2. **Dinamik (V2)**: Sosyal ve enerjik. Modern renkler, büyük görseller ve hızlı rezervasyon odağı.
3. **Bistro (V3)**: Sıcak ve samimi. Rustik dokular, klasik yazı tipleri ve rahat bir atmosfer.

Şehrin en iyi fine-dining mekanıysanız V1, gençlerin favori burgercisiyseniz V2 tam size göre.`;
    }

    getThemeSpecs(variant = 'v1') {
        const primary = this.profile?.brandColor || '#f59e0b'; // Amber-500 default

        const specs = {
            v1: { // Michelin / Fine Dining
                primary: '#d4af37', // Gold
                accent: '#1c1917',
                bg: '#0c0a09', // Deep dark
                surface: '#1c1917',
                text: '#f5f5f4',
                textSecondary: '#a8a29e',
                radius: '0px',
                fontPrimary: "'Inter', sans-serif",
                fontHeader: "'Playfair Display', serif",
                shadow: '0 4px 30px rgba(0,0,0,0.5)',
                shadowHover: '0 10px 50px rgba(0,0,0,0.7)'
            },
            v2: { // Vibrant / Modern
                primary: '#ef4444', // Red-500
                accent: '#fef2f2',
                bg: '#ffffff',
                surface: '#fef2f2',
                text: '#450a0a',
                textSecondary: '#991b1b',
                radius: '12px',
                fontPrimary: "'Inter', sans-serif",
                fontHeader: "'Montserrat', sans-serif",
                shadow: '0 4px 20px rgba(239, 68, 68, 0.1)',
                shadowHover: '0 10px 40px rgba(239, 68, 68, 0.2)'
            },
            v3: { // Bistro / Classic
                primary: '#166534', // Green-800
                accent: '#f0fdf4',
                bg: '#fffdfa',
                surface: '#ffffff',
                text: '#14532d',
                textSecondary: '#166534',
                radius: '8px',
                fontPrimary: "'Inter', sans-serif",
                fontHeader: "'Crimson Text', serif",
                shadow: '0 2px 10px rgba(0,0,0,0.05)',
                shadowHover: '0 8px 25px rgba(0,0,0,0.1)'
            }
        };

        return specs[variant] || specs.v1;
    }
}
