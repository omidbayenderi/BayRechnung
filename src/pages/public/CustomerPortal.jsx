import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Download, CheckCircle, XCircle, Clock, FileText, Calendar, Building } from 'lucide-react';

const CustomerPortal = () => {
    const { token } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [portalData, setPortalData] = useState(null);
    const [entity, setEntity] = useState(null);
    const [company, setCompany] = useState(null);

    useEffect(() => {
        const fetchPortalData = async () => {
            if (!token) return;

            // 1. Validate Token
            const { data: tokenRecord, error: tokenError } = await supabase
                .from('public_tokens')
                .select('*')
                .eq('token', token)
                .single();

            if (tokenError || !tokenRecord) {
                setError('Geçersiz veya süresi dolmuş bağlantı.');
                setLoading(false);
                return;
            }

            // check expiry
            if (tokenRecord.expires_at && new Date(tokenRecord.expires_at) < new Date()) {
                setError('Bu bağlantının süresi dolmuş.');
                setLoading(false);
                return;
            }

            // 2. Fetch Entity (Invoice or Quote)
            const table = tokenRecord.entity_type === 'invoice' ? 'invoices' : 'quotes';
            const { data: entityData, error: entityError } = await supabase
                .from(table)
                .select('*')
                .eq('id', tokenRecord.entity_id)
                .single();

            if (entityError) {
                setError('Belge bulunamadı.');
                setLoading(false);
                return;
            }

            // 3. Fetch Company Info
            const { data: companyData } = await supabase
                .from('company_settings')
                .select('*')
                .eq('user_id', tokenRecord.user_id)
                .single();

            setPortalData(tokenRecord);
            setEntity(entityData);
            setCompany(companyData);
            setLoading(false);
        };

        fetchPortalData();
    }, [token]);

    const handleAction = async (status) => {
        if (portalData.entity_type !== 'quote') return;

        const { error } = await supabase
            .from('quotes')
            .update({ status })
            .eq('id', entity.id);

        if (!error) setEntity(prev => ({ ...prev, status }));
    };

    if (loading) return <div className="portal-loading">Belge yükleniyor...</div>;
    if (error) return (
        <div className="portal-error">
            <XCircle size={48} color="#ef4444" />
            <h2>Hata</h2>
            <p>{error}</p>
            <Link to="/" className="primary-btn">Ana Sayfaya Dön</Link>
        </div>
    );

    return (
        <div className="portal-container" style={{
            minHeight: '100vh',
            background: '#f8fafc',
            padding: '20px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <header style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '32px',
                    padding: '20px',
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: '#3b82f6', color: 'white', padding: '10px', borderRadius: '12px' }}>
                            <Building size={24} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '18px', fontWeight: 'bold' }}>{company?.company_name}</h1>
                            <p style={{ fontSize: '14px', color: '#64748b' }}>Müşteri Portalı</p>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span className="badge" style={{
                            background: entity.status === 'paid' || entity.status === 'accepted' ? '#dcfce7' : '#fef9c3',
                            color: entity.status === 'paid' || entity.status === 'accepted' ? '#166534' : '#854d0e',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                        }}>
                            {entity.status}
                        </span>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
                    {/* Main Document View */}
                    <div className="card" style={{ padding: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                            <div>
                                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                                    {portalData.entity_type === 'invoice' ? 'Fatura' : 'Teklif'}
                                </h2>
                                <p style={{ color: '#64748b' }}>#{entity.invoice_number || entity.quote_number || entity.id.substring(0, 8)}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '14px', color: '#64748b' }}>Tarih</p>
                                <p style={{ fontWeight: 'bold' }}>{new Date(entity.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>Açıklama</p>
                            <p style={{ fontSize: '16px', lineHeight: '1.6' }}>{entity.notes || 'Detaylı açıklama bulunmamaktadır.'}</p>
                        </div>

                        <div style={{ borderTop: '2px dashed #e2e8f0', paddingTop: '20px', marginBottom: '40px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '18px', color: '#64748b' }}>Toplam Tutar</span>
                                <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e293b' }}>
                                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: entity.currency || 'EUR' }).format(entity.total_amount || entity.total || 0)}
                                </span>
                            </div>
                        </div>

                        {portalData.entity_type === 'quote' && entity.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <button
                                    onClick={() => handleAction('accepted')}
                                    style={{ flex: 1, padding: '16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <CheckCircle size={20} /> Onayla
                                </button>
                                <button
                                    onClick={() => handleAction('declined')}
                                    style={{ flex: 1, padding: '16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <XCircle size={20} /> Reddet
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside>
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>İşlemler</h3>
                            <button className="secondary-btn" style={{ width: '100%', justifyContent: 'center', marginBottom: '12px', padding: '12px' }}>
                                <Download size={18} /> PDF İndir
                            </button>
                            <button className="secondary-btn" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                                <Calendar size={18} /> Randevu Planla
                            </button>
                        </div>

                        <div className="card" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e40af', marginBottom: '12px' }}>Destek Hattı</h3>
                            <p style={{ fontSize: '13px', color: '#1e40af', lineHeight: '1.5' }}>
                                Bu belge ile ilgili sorularınız için bizimle iletişime geçebilirsiniz.
                            </p>
                            <div style={{ marginTop: '16px', fontWeight: 'bold', color: '#1e40af' }}>
                                {company?.email}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default CustomerPortal;
