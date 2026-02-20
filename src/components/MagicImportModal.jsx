import React, { useState } from 'react';
import { Upload, X, Check, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MagicImportModal = ({ isOpen, onClose, onImport, t }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState([]);
    const [mapping, setMapping] = useState({});
    const [step, setStep] = useState(1); // 1: Upload, 2: Mapping, 3: Success

    const handleFileUpload = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const rows = text.split('\n').filter(r => r.trim());
            const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
            const data = rows.slice(1).map(row => {
                const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
                return headers.reduce((acc, header, i) => {
                    acc[header] = values[i];
                    return acc;
                }, {});
            });

            setFile(selectedFile);
            setPreview(data);
            autoMapHeaders(headers);
            setStep(2);
        };
        reader.readAsText(selectedFile);
    };

    const autoMapHeaders = (headers) => {
        const newMapping = {};
        const BaySchema = ['recipientName', 'date', 'total', 'invoiceNumber', 'status', 'description'];

        headers.forEach(h => {
            const lowH = h.toLowerCase();
            if (lowH.includes('name') || lowH.includes('kunde') || lowH.includes('customer')) newMapping[h] = 'recipientName';
            if (lowH.includes('date') || lowH.includes('datum')) newMapping[h] = 'date';
            if (lowH.includes('total') || lowH.includes('tutar') || lowH.includes('betrag') || lowH.includes('amount')) newMapping[h] = 'total';
            if (lowH.includes('number') || lowH.includes('no') || lowH.includes('fatura')) newMapping[h] = 'invoiceNumber';
            if (lowH.includes('status') || lowH.includes('durum')) newMapping[h] = 'status';
            if (lowH.includes('desc') || lowH.includes('item') || lowH.includes('aciklama')) newMapping[h] = 'description';
        });
        setMapping(newMapping);
    };

    const handleFinalImport = () => {
        const finalData = preview.map(row => {
            const item = {};
            Object.keys(mapping).forEach(csvHeader => {
                const bayKey = mapping[csvHeader];
                if (bayKey) {
                    item[bayKey] = bayKey === 'total' ? parseFloat(row[csvHeader]) || 0 : row[csvHeader];
                }
            });
            return item;
        });

        onImport(finalData);
        setStep(3);
        setTimeout(onClose, 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="modal-container"
                style={{ maxWidth: '600px', width: '90%' }}
            >
                <div className="modal-header">
                    <h3>Magic Import (AI Powered)</h3>
                    <button className="close-btn" onClick={onClose}><X /></button>
                </div>

                <div className="modal-body">
                    {step === 1 && (
                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <div style={{ marginBottom: '20px', color: 'var(--primary)', opacity: 0.5 }}>
                                <Upload size={48} />
                            </div>
                            <h4>Eski Verilerinizi Saniyeler İçinde Aktarın</h4>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>
                                Excel veya CSV dosyanızı yükleyin, AI alanları otomatik eşleştirsin.
                            </p>
                            <input
                                type="file"
                                id="csv-upload"
                                hidden
                                accept=".csv"
                                onChange={handleFileUpload}
                            />
                            <label
                                htmlFor="csv-upload"
                                className="primary-btn"
                                style={{ display: 'inline-block', cursor: 'pointer' }}
                            >
                                Dosya Seçin
                            </label>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '16px' }}>
                                Alan eşleştirmelerini kontrol edin:
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {Object.keys(preview[0] || {}).map(header => (
                                    <div key={header} style={{
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        background: '#f8fafc', padding: '10px', borderRadius: '8px'
                                    }}>
                                        <div style={{ flex: 1, fontWeight: '600', fontSize: '0.85rem' }}>{header}</div>
                                        <ArrowRight size={14} color="#94a3b8" />
                                        <select
                                            value={mapping[header] || ''}
                                            onChange={(e) => setMapping({ ...mapping, [header]: e.target.value })}
                                            style={{
                                                flex: 1, padding: '6px', borderRadius: '6px',
                                                border: '1px solid #e2e8f0', fontSize: '0.85rem'
                                            }}
                                        >
                                            <option value="">İptal Et</option>
                                            <option value="recipientName">Müşteri Adı</option>
                                            <option value="date">Tarih</option>
                                            <option value="total">Toplam Tutar</option>
                                            <option value="invoiceNumber">Fatura No</option>
                                            <option value="status">Durum</option>
                                            <option value="description">Açıklama</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                            <button
                                className="primary-btn"
                                style={{ width: '100%', marginTop: '24px' }}
                                onClick={handleFinalImport}
                            >
                                {preview.length} Kaydı Aktar
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <div style={{ marginBottom: '20px', color: '#10b981' }}>
                                <Check size={48} />
                            </div>
                            <h4>Aktarım Başarılı!</h4>
                            <p style={{ color: '#64748b' }}>Verileriniz başarıyla BayZenit formatına çevrildi ve eklendi.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default MagicImportModal;
