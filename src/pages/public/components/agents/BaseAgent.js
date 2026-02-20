
/**
 * BaseAgent - Common logic for all industry-specific agents
 */
export class BaseAgent {
    constructor(industry, siteData) {
        this.industry = industry;
        this.siteData = siteData;
        this.profile = siteData.profile;
        this.config = siteData.config;
        this.products = siteData.products || [];
    }

    // --- NLP UTILITIES ---
    normalizeText(text) {
        if (!text) return '';
        return text.toLowerCase()
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
            .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^\w\s]/gi, '')
            .trim();
    }

    getExpandedWords(query) {
        const normQ = this.normalizeText(query);
        const queryWords = normQ.split(/\s+/).filter(w => w.length > 2);
        const expandedWords = [...queryWords];

        const synonyms = this.getSynonymMap();
        queryWords.forEach(w => {
            if (synonyms[w]) expandedWords.push(synonyms[w]);
            Object.keys(synonyms).forEach(key => {
                if (key.includes(w) || w.includes(key)) expandedWords.push(synonyms[key]);
            });
        });

        return { normQ, expandedWords };
    }

    getSynonymMap() {
        return {
            'saat': 'time', 'acik': 'open', 'kapali': 'closed',
            'nerede': 'location', 'adres': 'address', 'konum': 'location',
            'randevu': 'appointment', 'kayit': 'booking', 'termin': 'appointment',
            'telefon': 'phone', 'iletisim': 'contact', 'ulasim': 'transport'
        };
    }

    // --- SHARED RESPONSES ---
    getWorkingHoursResponse() {
        return `Hafta içi ve Cumartesi günleri 08:00 - 18:00 saatleri arasındayız. Pazar günleri kapalıyız. Başka bir bilgi lazım mı?`;
    }

    getLocationResponse() {
        return `Adresimiz: ${this.profile?.street} ${this.profile?.houseNum}, ${this.profile?.zip} ${this.profile?.city}. "Yol Tarifi Al" butonuna tıklayarak gelebilirsiniz. Sizi bekliyoruz!`;
    }

    getAppointmentResponse() {
        return `Tabii ki! Web sitemizdeki "Randevu Al" butonuna tıklayarak size en uygun günü ve saati kolayca seçebilirsiniz. [ACTION:BOOK:/Rechnung/booking]`;
    }

    getContactResponse() {
        return `Bize doğrudan ${this.profile?.phone} numaralı telefondan veya ${this.profile?.email} adresinden ulaşabilirsiniz. [ACTION:CALL:tel:${this.profile?.phone}]`;
    }

    // --- PRODUCT SEARCH ENGINE ---
    findBestProductMatch(expandedWords, normQ) {
        if (!this.products.length) return null;

        let bestMatch = null;
        let highestScore = 0;

        this.products.forEach(p => {
            const name = this.normalizeText(p.name);
            const desc = this.normalizeText(p.description || '');
            let score = 0;

            expandedWords.forEach(word => {
                if (name.includes(word)) score += 3;
                if (desc.includes(word)) score += 1;
            });

            if (normQ.includes(name)) score += 10;
            if (score > highestScore) {
                highestScore = score;
                bestMatch = p;
            }
        });

        return highestScore >= 2 ? bestMatch : null;
    }

    // --- DESIGN SPECIFICATIONS (Agent-Led) ---
    getThemeSpecs(variant = 'v1') {
        // Base tokens that specialists will override
        return {
            primary: this.profile?.brandColor || '#3b82f6',
            accent: '#eff6ff',
            bg: '#f8fafc',
            surface: '#ffffff',
            text: '#1e293b',
            textSecondary: '#64748b',
            radius: '12px',
            fontPrimary: "'Inter', sans-serif",
            fontHeader: "'Inter', sans-serif",
            shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            shadowHover: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
        };
    }

    // --- GENERATE RESPONSE ---
    handleQuery(query) {
        const { normQ, expandedWords } = this.getExpandedWords(query);

        // 0. Design Advice (New)
        if (normQ.includes('tema') || normQ.includes('tasarim') || normQ.includes('hangisi')) {
            return this.getDesignAdviceResponse();
        }

        // 1. Working Hours
        if (normQ.includes('saat') || normQ.includes('acik') || normQ.includes('kapali')) {
            return this.getWorkingHoursResponse();
        }

        // 2. Location
        if (normQ.includes('nerede') || normQ.includes('adres') || normQ.includes('konum')) {
            return this.getLocationResponse();
        }

        // 3. Appointment
        if (normQ.includes('randevu') || normQ.includes('kayit') || normQ.includes('termin')) {
            return this.getAppointmentResponse();
        }

        // 4. Contact
        if (normQ.includes('telefon') || normQ.includes('iletisim') || normQ.includes('ulasim')) {
            return this.getContactResponse();
        }

        // 5. Specialist Logic (to be overridden)
        const specialistResponse = this.getSpecialistResponse(normQ, expandedWords);
        if (specialistResponse) return specialistResponse;

        // 6. Generic Product Search
        const product = this.findBestProductMatch(expandedWords, normQ);
        if (product) {
            return `${product.name} ile ilgileniyorsunuz, harika! Fiyat: ${product.price} ${this.config?.currency || '€'}. \n\n[ACTION:BOOK:/Rechnung/booking?service=${product.id}] [ACTION:CART:${product.id}]`;
        }

        // 7. Final Fallback
        return this.getFallbackResponse(query);
    }

    getSpecialistResponse(normQ, expandedWords) {
        return null; // Implemented by sub-classes
    }

    getGreeting() {
        return `Merhaba! Ben ${this.profile?.companyName || 'işletme'} dijital asistanıyım. Size nasıl yardımcı olabilirim?`;
    }

    getDesignAdviceResponse() {
        return `${this.profile?.companyName} için şu an 3 farklı tema seçeneğimiz var. \n\nV1: Profesyonel ve klasik, \nV2: Modern ve dinamik, \nV3: Minimal ve sade. \n\nSektörünüze en uygun olanı seçmek için ayarlar panelinden önizleme yapabilirsiniz.`;
    }

    getFallbackResponse(query) {
        return `Harika bir soru! ${this.profile?.companyName} asistanı olarak size özel çözümler sunmak için buradayım. "${query}" konusuyla ilgili detaylı bilgi için bize mesaj atabilir veya randevu alarak uzmanlarımızla görüşebilirsiniz.`;
    }
}
