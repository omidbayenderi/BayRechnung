import React from 'react';
import { Sparkles, TrendingUp, TrendingDown, AlertCircle, BarChart3, Edit3 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const AiInsights = ({ invoices = [], expenses = [] }) => {
    const { t } = useLanguage();
    // Basic AI-Simulated Logic
    const totalIncome = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const margin = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    const insights = [
        {
            id: 1,
            title: t('insight_title_1') || 'Karlılık Analizi',
            text: margin > 20 ? t('insight_profit_high') || 'Kâr marjınız sektör ortalamasının üzerinde.' : t('insight_profit_low') || 'Kâr marjınız düşük seyrediyor.',
            icon: margin > 20 ? <TrendingUp size={20} color="#10b981" /> : <TrendingDown size={20} color="#f59e0b" />,
            color: margin > 20 ? '#ecfdf5' : '#fffbeb'
        },
        {
            id: 2,
            title: t('insight_title_2') || 'Harcama Trendi',
            text: totalExpenses > totalIncome * 0.5 ? t('insight_expense_high') || 'Giderleriniz gelirinizin %50\'sini aştı.' : t('insight_expense_normal') || 'Gider/Gelir dengeniz sağlıklı görünüyor.',
            icon: <AlertCircle size={20} color="#3b82f6" />,
            color: '#eff6ff'
        }
    ];

    return (
        <div className="ai-insights-widget" style={{
            background: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)',
            borderRadius: '24px',
            padding: '24px',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
                <Sparkles size={120} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ background: '#0f172a', color: 'white', padding: '8px', borderRadius: '10px' }}>
                    <Sparkles size={20} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>{t('ai_financial_copilot') || 'AI Finansal Copilot'}</h3>
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
                {insights.map(insight => (
                    <div key={insight.id} style={{
                        background: 'rgba(255,255,255,0.7)',
                        backdropFilter: 'blur(10px)',
                        padding: '16px',
                        borderRadius: '16px',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start',
                        border: '1px solid white'
                    }}>
                        <div style={{ marginTop: '2px' }}>{insight.icon}</div>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }}>{insight.title}</div>
                            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', lineHeight: '1.4' }}>{insight.text}</div>
                        </div>
                    </div>
                ))}
            </div>

            <button style={{
                width: '100%',
                marginTop: '20px',
                padding: '12px',
                background: '#0f172a',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
            }}>
                <BarChart3 size={16} /> {t('get_detailed_ai_report') || 'Detaylı AI Raporu Al'}
            </button>
        </div>
    );
};

export default AiInsights;
