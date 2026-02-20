
import { BaseAgent } from './BaseAgent';
import { AutomotiveAgent } from './AutomotiveAgent';
import { BeautyAgent } from './BeautyAgent';
import { ConstructionAgent } from './ConstructionAgent';
import { GastroAgent } from './GastroAgent';
import { HealthcareAgent } from './HealthcareAgent';

/**
 * AgentFactory - Coordinates and generates specialized agents
 */
export class AgentFactory {
    static getAgent(siteData) {
        const industry = (siteData.profile?.industry || 'general').toLowerCase();

        const AGENT_MAP = {
            automotive: AutomotiveAgent,
            beauty: BeautyAgent,
            construction: ConstructionAgent,
            consulting: ConstructionAgent,
            education: ConstructionAgent,
            gastronomy: GastroAgent,
            healthcare: HealthcareAgent,
            retail: BeautyAgent,
            it: AutomotiveAgent,    // Technical focus
            crafts: AutomotiveAgent, // Service focus
            general: BaseAgent
        };

        const AgentClass = AGENT_MAP[industry];

        if (AgentClass) {
            return new AgentClass(industry, siteData);
        }

        // --- AUTOMATIC AGENT GENERATION FOR NEW CATEGORIES ---
        // If the industry is unknown, we generate a "Specialist" on the fly using BaseAgent
        const generatedAgent = new BaseAgent(industry, siteData);

        // Customize the generated agent's greeting and fallback
        const capitalizedIndustry = industry.charAt(0).toUpperCase() + industry.slice(1);

        generatedAgent.getGreeting = () => {
            return `Merhaba! Ben ${siteData.profile?.companyName} ${capitalizedIndustry} uzmanı dijital asistanınızım. Size ${industry} alanındaki profesyonel hizmetlerimiz hakkında nasıl yardımcı olabilirim?`;
        };

        generatedAgent.getFallbackResponse = (query) => {
            return `Harika bir soru! ${siteData.profile?.companyName} ${capitalizedIndustry} ekibi olarak size özel çözümler sunmak için buradayım. "${query}" konusuyla ilgili detaylı bilgi için bize mesaj atabilir veya randevu alarak uzmanlarımızla görüşebilirsiniz.`;
        };

        return generatedAgent;
    }
}
