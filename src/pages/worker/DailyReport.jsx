import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Send, Camera, CheckCircle } from 'lucide-react';

const DailyReport = () => {
    const { currentUser } = useAuth();
    const [content, setContent] = useState('');
    const [siteId, setSiteId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content || !currentUser?.id) return;

        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('daily_reports')
                .insert({
                    user_id: currentUser.id,
                    content: content,
                    site_id: siteId || 'General',
                    status: 'submitted'
                });

            if (error) throw error;
            setSubmitted(true);
            setContent('');
        } catch (err) {
            console.error('Error submitting report:', err);
            alert('Rapor gönderilemedi. Lütfen tekrar deneyin.');
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <CheckCircle size={64} color="#10b981" style={{ marginBottom: '16px' }} />
                <h2 style={{ marginBottom: '8px' }}>Rapor Başarıyla Gönderildi!</h2>
                <p style={{ color: '#64748b', marginBottom: '24px' }}>Emeğinize sağlık. Bugünlük işiniz kaydedildi.</p>
                <button
                    onClick={() => setSubmitted(false)}
                    style={{
                        padding: '12px 24px',
                        background: '#8b5cf6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 'bold'
                    }}
                >
                    Yeni Rapor Yaz
                </button>
            </div>
        );
    }

    return (
        <div className="daily-report">
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Günlük Rapor</h1>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>Bugün neler yaptınız? Kısaca özetleyin.</p>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Şantiye / Bölge</label>
                    <select
                        value={siteId}
                        onChange={(e) => setSiteId(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            fontSize: '16px',
                            background: 'white'
                        }}
                    >
                        <option value="">Seçiniz...</option>
                        <option value="site-a">Merkez Şantiye</option>
                        <option value="site-b">Kuzey Bölgesi</option>
                        <option value="site-c">B2 Projesi</option>
                    </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Yapılan İşin Özeti</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Örn: Kat 2 sıva işleri tamamlandı. Malzeme eksiği yok."
                        style={{
                            width: '100%',
                            height: '150px',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            fontSize: '16px',
                            lineHeight: '1.5'
                        }}
                        required
                    />
                </div>

                <div style={{ marginBottom: '32px' }}>
                    <button type="button" style={{
                        width: '100%',
                        padding: '12px',
                        background: '#f1f5f9',
                        color: '#64748b',
                        border: '1px dashed #cbd5e1',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontSize: '14px'
                    }}>
                        <Camera size={20} />
                        Fotoğraf Ekle (Opsiyonel)
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    style={{
                        width: '100%',
                        padding: '16px',
                        background: '#8b5cf6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        opacity: submitting ? 0.7 : 1
                    }}
                >
                    {submitting ? 'Gönderiliyor...' : (
                        <>
                            <Send size={20} />
                            Raporu Gönder
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default DailyReport;
