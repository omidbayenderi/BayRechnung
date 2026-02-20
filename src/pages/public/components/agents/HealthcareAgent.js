
import { BaseAgent } from './BaseAgent';

export class HealthcareAgent extends BaseAgent {
    getSynonymMap() {
        return {
            ...super.getSynonymMap(),
            'doktor': 'doctor', 'hekim': 'doctor', 'muayene': 'examination',
            'kontrol': 'checkup', 'sağlık': 'health', 'tedavi': 'treatment',
            'klinik': 'clinic', 'tahlil': 'test', 'reçete': 'prescription'
        };
    }

    getSpecialistResponse(normQ, expandedWords) {
        const keywords = ['doktor', 'hekim', 'muayene', 'kontrol', 'sağlık', 'tedavi', 'klinik', 'tahlil', 'hastane'];

        if (expandedWords.some(w => keywords.includes(w)) || keywords.some(k => normQ.includes(k))) {
            const product = this.findBestProductMatch(expandedWords, normQ);

            let response = "Sağlığınız bizim için en değerli önceliktir. Uzman doktorlarımız, modern tıbbi ekipmanlarımız ve şevkatli bakım anlayışımızla size en iyi sağlık hizmetini sunmak için buradayız.\n\nŞikayetlerinizle ilgili en doğru teşhis ve tedavi planı için lütfen bir muayene randevusu oluşturun.";

            if (product) {
                response += `\n\nBaşvurduğunuz "${product.name}" hizmetimiz için detaylı bilgilendirme ve randevu alabilirsiniz.`;
                return response + `\n\n[ACTION:BOOK:/Rechnung/booking?service=${product.id}] [ACTION:CART:${product.id}]`;
            }

            return response + `\n\n[ACTION:BOOK:/Rechnung/booking] [ACTION:CALL:tel:${this.profile?.phone}]`;
        }

        return null;
    }

    getGreeting() {
        return `Merhaba! Ben ${this.profile?.companyName} sağlık danışmanı dijital asistanınızım. Muayene, check-up programlarımız veya tedavi süreçleri hakkında size nasıl yardımcı olabilirim?`;
    }

    getDesignAdviceResponse() {
        return `Kliniğiniz için hastalarınıza güven verecek 3 farklı tasarım yaklaşımı hazırladım:
        
1. **Klinik (V1)**: Geleneksel ve güvenilir. Mavi ve beyaz tonlar, temiz bir hiyerarşi ve profesyonel bir duruş.
2. **Modern (V2)**: Teknoloji ve sağlık odaklı. Dinamik ögeler, modern yazı tipleri ve yenilikçi bir sağlık vizyonu.
3. **Seren (V3)**: Sakin ve huzurlu. Yumuşak renkler (nane yeşili, yumuşak gri), geniş boşluklar ve stres azaltıcı bir atmosfer.

Genel bir poliklinik iseniz V1, butik bir estetik veya diş kliniği iseniz V2/V3 seçenekleri daha etkileyicidir.`;
    }

    getThemeSpecs(variant = 'v1') {
        const primary = this.profile?.brandColor || '#0ea5e9'; // Sky-500 default

        const specs = {
            v1: { // Clinical / Standard
                primary: '#0369a1', // Clinical Blue
                accent: '#f0f9ff',
                bg: '#f8fafc',
                surface: '#ffffff',
                text: '#0c4a6e',
                textSecondary: '#0369a1',
                radius: '6px',
                fontPrimary: "'Inter', sans-serif",
                fontHeader: "'Inter', sans-serif",
                shadow: '0 1px 3px rgba(0,0,0,0.1)',
                shadowHover: '0 4px 6px rgba(0,0,0,0.1)'
            },
            v2: { // Modern / Tech
                primary: '#6366f1', // Indigo
                accent: '#eef2ff',
                bg: '#ffffff',
                surface: '#f5f7ff',
                text: '#1e1b4b',
                textSecondary: '#4338ca',
                radius: '12px',
                fontPrimary: "'Inter', sans-serif",
                fontHeader: "'Montserrat', sans-serif",
                shadow: '0 10px 15px -3px rgba(99, 102, 241, 0.1)',
                shadowHover: '0 20px 25px -5px rgba(99, 102, 241, 0.2)'
            },
            v3: { // Serene / Calm
                primary: '#0d9488', // Teal
                accent: '#f0fdfa',
                bg: '#fcfcfc',
                surface: '#ffffff',
                text: '#134e4a',
                textSecondary: '#0d9488',
                radius: '30px', // Friendly rounded
                fontPrimary: "'Inter', sans-serif",
                fontHeader: "'Outfit', sans-serif", // Soft modern font
                shadow: 'none',
                border: '1px solid #f1f5f9',
                shadowHover: '0 15px 30px rgba(0,0,0,0.03)'
            }
        };

        return specs[variant] || specs.v1;
    }
}
