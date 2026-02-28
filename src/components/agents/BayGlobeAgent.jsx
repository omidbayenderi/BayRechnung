import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, RefreshCw, CheckCircle, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * BayGlobe Agent 🌐
 * Responsible for 24/7 Dynamic Localization & i18n Quality Control.
 * - Detects missing translation keys.
 * - Simulates AI translation for unknown terms.
 * - Ensures the UI stays compliant with selected app language.
 */
const BayGlobeAgent = () => {
    const { appLanguage, updateAiTranslation, LANGUAGES, translations, aiTranslations } = useLanguage();
    const [pendingTranslations, setPendingTranslations] = useState([]);
    const [isTranslating, setIsTranslating] = useState(false);
    const [showStatus, setShowStatus] = useState(false);
    const [lastTranslated, setLastTranslated] = useState(null);
    const [auditCount, setAuditCount] = useState(0);

    // Safety ref to prevent loops
    const processedKeys = useRef(new Set());
    const lastAuditedLang = useRef(null);

    useEffect(() => {
        const handleMissingKey = (event) => {
            const { key, lang } = event.detail;

            // Don't process the same key twice in a session if possible
            if (processedKeys.current.has(`${lang}:${key}`)) return;
            processedKeys.current.add(`${lang}:${key}`);

            setPendingTranslations(prev => [...prev, { key, lang }]);
        };

        window.addEventListener('bayglobe-missing-key', handleMissingKey);
        return () => window.removeEventListener('bayglobe-missing-key', handleMissingKey);
    }, []);

    // 7/24 Continuous Quality Guard: Scans the dictionary for impurities
    useEffect(() => {
        const auditInterval = setInterval(() => {
            runLanguageAudit();
        }, 15000); // Audit every 15 seconds or on language change

        runLanguageAudit();
        return () => clearInterval(auditInterval);
    }, [appLanguage, translations, aiTranslations]);

    const runLanguageAudit = () => {
        if (!translations || !translations[appLanguage]) return;

        // Combine static and AI translations for scanning
        const currentData = {
            ...(translations[appLanguage] || {}),
            ...(aiTranslations?.[appLanguage] || {})
        };

        const impurities = [];

        // DETECTION LOGIC:
        // If appLanguage is DE/EN/FR/ES but string contains uniquely Turkish patterns/words
        const isNonTurkish = ['de', 'en', 'fr', 'es'].includes(appLanguage);

        Object.entries(currentData).forEach(([key, value]) => {
            if (typeof value !== 'string') return;
            if (processedKeys.current.has(`audit:${appLanguage}:${key}`)) return;

            let suspicious = false;

            if (isNonTurkish) {
                // Check for common Turkish leftovers (user's specific examples)
                const trMarkers = ['veya', 'borç', 'stok', 'yedek', 'işçilik', 'malzeme', 'kârdasın', 'zarardasın'];
                const hasTrMarker = trMarkers.some(m => value.toLowerCase().includes(m));

                // Check for Turkish specific characters if not in TR context
                // (Avoiding 'ö, ü' as they exist in DE)
                const trChars = /[ğşışİç]/i;
                const hasTrChars = trChars.test(value);

                if (hasTrMarker || hasTrChars) suspicious = true;
            }

            if (suspicious) {
                impurities.push({ key, lang: appLanguage, value });
                processedKeys.current.add(`audit:${appLanguage}:${key}`);
            }
        });

        if (impurities.length > 0) {
            console.log(`🌐 BayGlobe: Detected ${impurities.length} language impurities in ${appLanguage.toUpperCase()}. Auto-correcting...`);
            setPendingTranslations(prev => [...prev, ...impurities]);
        }
    };

    // Watch for pending translations and "process" them
    useEffect(() => {
        if (pendingTranslations.length > 0 && !isTranslating) {
            processTranslations();
        }
    }, [pendingTranslations, isTranslating]);

    const processTranslations = async () => {
        setIsTranslating(true);
        setShowStatus(true);

        const currentBatch = [...pendingTranslations];
        setPendingTranslations([]);

        for (const item of currentBatch) {
            // SIMULATED AI TRANSLATION ENGINE
            // In a real app, this would call an API like OpenAI / DeepL
            await new Promise(resolve => setTimeout(resolve, 1000));

            const simulatedTranslation = simulateTranslation(item.key, item.lang);
            updateAiTranslation(item.lang, item.key, simulatedTranslation);
            setLastTranslated(simulatedTranslation);
            setAuditCount(prev => prev + 1);
        }

        setIsTranslating(false);
        // Hide status after a delay
        setTimeout(() => setShowStatus(false), 4000);
    };

    /**
     * AI Simulation Logic
     * Converts camelCase or snake_case keys into readable language-aware sentences.
     */
    const simulateTranslation = (key, lang) => {
        // 1. Basic cleaning of the key
        let readable = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .trim();
        readable = readable.charAt(0).toUpperCase() + readable.slice(1);

        // 2. Localized Mappings for common simulation terms
        // This makes the "AI simulation" feel more real without a real API
        const commonMap = {
            de: {
                save: 'Speichern',
                delete: 'Löschen',
                cancel: 'Abbrechen',
                total: 'Gesamt',
                revenue: 'Umsatz',
                profit: 'Gewinn',
                active: 'Aktiv',
                analyzing: 'Analysiert...',
                no_risks: 'Keine Risiken erkannt',
                decision_support: 'Entscheidungshilfe',
                alerts: 'Alarme',
                opportunities: 'Wachstumschancen',
                take_action: 'Handeln Sie',
                missing_brand: 'Markenidentität fehlt',
                logo_generation: 'Logo-Erstellungsvorschlag',
                cash: 'Bar / Kasse',
                registered_transactions: 'registrierte Transaktionen',
                cash_balance: 'Kassenbestand',
                sent_overdue: 'versendete/überfällige Rechnungen',
                status_healthy: 'SICHER',
                status_warning: 'WARNUNG',
                status_critical: 'KRITISCH',
                strategic_insights: 'Strategische Einblicke',
                tax_provision: 'Umsatzsteuer-Rückstellung'
            },
            tr: {
                save: 'Kaydet',
                delete: 'Sil',
                cancel: 'İptal',
                total: 'Toplam',
                revenue: 'Ciro',
                profit: 'Kâr',
                active: 'Aktif',
                analyzing: 'Analiz ediliyor...',
                no_risks: 'Risk tespit edilmedi',
                decision_support: 'Karar Destek',
                alerts: 'Alarmlar',
                opportunities: 'Büyüme Fırsatları',
                take_action: 'Harekete Geç',
                missing_brand: 'Marka Kimliği Eksik',
                logo_generation: 'Logo Tasarım Önerisi',
                cash: 'Nakit',
                registered_transactions: 'kayıtlı işlem',
                cash_balance: 'Nakit dengesi',
                sent_overdue: 'Bekleyen faturalar',
                status_healthy: 'GÜVENLİ',
                status_warning: 'UYARI',
                status_critical: 'KRİTİK',
                strategic_insights: 'Stratejik Analiz',
                tax_provision: 'Vergi Karşılığı'
            }
        };

        const lowerKey = key.toLowerCase();
        const langMap = commonMap[lang];

        if (langMap) {
            // Priority 1: Exact Match Search
            if (langMap[lowerKey]) return langMap[lowerKey];

            // Priority 2: Partial Match Search (The "AI Intelligence")
            const match = Object.keys(langMap).find(k => lowerKey.includes(k));
            if (match) return langMap[match];
        }

        // 3. Fallback to cleaned English string (Still No Prefix)
        return readable;
    };

    const currentLangLabel = LANGUAGES.find(l => l.code === appLanguage)?.label || appLanguage.toUpperCase();

    return (
        <AnimatePresence>
            {showStatus && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="no-print"
                    style={{
                        position: 'fixed',
                        bottom: '80px',
                        left: '20px',
                        zIndex: 9998,
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(12px)',
                        padding: '12px 16px',
                        borderRadius: '16px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        minWidth: '240px'
                    }}
                >
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: isTranslating ? '#3b82f6' : '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        {isTranslating ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Globe size={10} /> BayGlobe Agent
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>
                            {isTranslating ? `Translating to ${currentLangLabel}...` : `${currentLangLabel} optimized.`}
                            {auditCount > 0 && <span style={{ marginLeft: '6px', opacity: 0.6, fontSize: '0.7rem' }}>({auditCount} fixed)</span>}
                        </div>
                        {!isTranslating && lastTranslated && (
                            <div style={{ fontSize: '0.7rem', color: '#3b82f6', marginTop: '2px', fontStyle: 'italic' }}>
                                Latest: "{lastTranslated}"
                            </div>
                        )}
                    </div>

                    {isTranslating && (
                        <div style={{ position: 'absolute', top: -5, right: -5 }}>
                            <Sparkles size={16} color="#fbbf24" fill="#fbbf24" />
                        </div>
                    )}
                </motion.div>
            )}

            <style>{`
                .animate-spin {
                    animation: spin 2s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
            `}</style>
        </AnimatePresence>
    );
};

export default BayGlobeAgent;
