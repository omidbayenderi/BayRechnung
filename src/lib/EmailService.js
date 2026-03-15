/**
 * BayRechnung Email Service
 * Handles sending invoices, quotes, and notifications to customers and staff.
 * Currently simulates sending for development purposes.
 */

class EmailService {
    constructor() {
        this.provider = import.meta.env.VITE_EMAIL_PROVIDER || 'resend'; // Default to resend for production
        this.apiKey = import.meta.env.VITE_EMAIL_API_KEY || null;
    }

    /**
     * Send an email with an attachment (simulated)
     */
    async sendInvoiceEmail({ to, invoiceNumber, customerName, amount, currency, pdfBlob }) {
        console.log(`[EmailService] Preparing email for ${to}...`);

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const emailData = {
            from: 'BayRechnung <billing@bayrechnung.com>',
            to,
            subject: `Fatura #${invoiceNumber} - BayRechnung`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #334155;">
                    <h2 style="color: #6366f1;">Merhaba ${customerName},</h2>
                    <p>İşleminiz başarıyla tamamlanmıştır. <strong>${invoiceNumber}</strong> numaralı faturanız ekte yer almaktadır.</p>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 24px 0;">
                        <div style="font-size: 0.85rem; color: #64748b; margin-bottom: 4px;">Toplam Tutar</div>
                        <div style="font-size: 1.5rem; font-weight: 700; color: #0f172a;">${amount} ${currency}</div>
                    </div>
                    <p>Ödemenizi vadesinde gerçekleştirdiğiniz için teşekkür ederiz.</p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
                    <p style="font-size: 0.75rem; color: #94a3b8; text-align: center;">
                        Bu e-posta BayRechnung tarafından otomatik olarak gönderilmiştir.
                    </p>
                </div>
            `
        };

        if (this.provider === 'mock' || !this.apiKey) {
            console.log('%c[MOCK EMAIL SENT]', 'background: #10b981; color: white; padding: 4px 8px; border-radius: 4px;', emailData);
            return { success: true, messageId: 'mock_' + Math.random().toString(36).substr(2, 9) };
        }

        // Real API implementation if key is present
        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: emailData.from,
                    to: emailData.to,
                    subject: emailData.subject,
                    html: emailData.html
                })
            });

            if (response.ok) {
                return { success: true, ...(await response.json()) };
            } else {
                const err = await response.json();
                console.error('[EmailService] Resend Error:', err);
                return { success: false, error: err.message || 'Email service error' };
            }
        } catch (error) {
            console.error('[EmailService] API Exception:', error);
            return { success: false, error: error.message };
        }
    }
}

export const emailService = new EmailService();
