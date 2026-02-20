/**
 * Predictive AI Service for BayRechnung
 * Analyzes business data and generates proactive insights.
 */
class AiService {
    /**
     * Generate insights based on the provided business state
     */
    async generateInsights(data) {
        const { invoices, expenses, appointments, companyProfile, t } = data;
        const insights = [];

        // 1. Cash Flow Insight
        const nextMonthExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
        const expectedIncome = appointments
            .filter(app => app.status === 'confirmed')
            .reduce((sum, app) => sum + (app.amount || 0), 0);

        const balance = expectedIncome - nextMonthExpenses;

        if (balance < 0) {
            insights.push({
                id: 'cashflow_warning',
                type: 'warning',
                title: t('ai_cashflow_title') || 'Nakit Akışı Uyarısı',
                message: `Gelecek ay beklenen ödemeler giderleri karşılamıyor. ${Math.abs(balance)}€ açık görünüyor.`,
                action: { label: t('ai_view_quotes') || 'Teklifleri İncele', link: '/quotes' }
            });
        } else if (balance > 1000) {
            insights.push({
                id: 'cashflow_good',
                type: 'success',
                title: t('ai_cashflow_title_good') || 'Finansal Durum Harika',
                message: `Gelecek ay için ${balance}€ pozitif nakit akışı öngörülüyor. Yatırım planlarını değerlendirebilirsiniz.`,
                action: { label: t('ai_view_reports') || 'Raporları Gör', link: '/admin/reports' }
            });
        }

        // 2. Industry Specific: Automotive
        if (companyProfile.industry === 'automotive') {
            const needsService = appointments.filter(app =>
                app.serviceId === 1 && // Assuming 1 is maintenance
                new Date(app.date) < new Date(Date.now() - 31536000000) // 1 year ago
            );

            if (needsService.length > 0) {
                insights.push({
                    id: 'auto_retention',
                    type: 'info',
                    title: t('ai_auto_retention_title') || 'Müşteri Sadakati',
                    message: `${needsService.length} müşterinizin yıllık bakım zamanı gelmiş olabilir. Otomatik hatırlatma gönderelim mi?`,
                    action: { label: t('ai_send_reminders') || 'Hatırlatıcıları Gönder', function: 'sendReminders' }
                });
            }
        }

        // 3. Industry Specific: Construction
        if (companyProfile.industry === 'construction') {
            insights.push({
                id: 'const_forecast',
                type: 'warning',
                title: t('ai_const_progress_title') || 'Şantiye İlerlemesi',
                message: 'Şantiye Kuzey projesinde beton döküm hızı plana göre %15 geride. Malzeme siparişini ertelemek ister misiniz?',
                action: { label: t('ai_view_site') || 'Şantiyeyi İncele', link: '/admin/sites' }
            });
        }

        return insights;
    }

    /**
     * Get a morning summary text
     */
    async getMorningSummary(data) {
        const { appointments, t } = data;
        const today = new Date().toISOString().split('T')[0];
        const todaysApps = appointments.filter(app => app.date === today);

        if (todaysApps.length === 0) {
            return t('ai_morning_empty') || "Günaydın! Bugün için henüz planlanmış bir işiniz yok. Yeni teklifler oluşturmak için harika bir gün.";
        }

        return (t('ai_morning_summary') || "Günaydın! Bugün %N% randevunuz var. Her şey yolunda görünüyor.").replace('%N%', todaysApps.length);
    }
}

export const aiService = new AiService();
