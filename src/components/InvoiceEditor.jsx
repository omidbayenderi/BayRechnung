import React from 'react';
import '../index.css';

const InvoiceEditor = ({ data, onChange, onItemChange, onAddItem, onDeleteItem, onPdf, totals }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    return (
        <div className="editor-card">
            <div className="editor-header">
                <h2>Rechnung erstellen</h2>
                <button onClick={onPdf} className="primary-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    PDF Generieren
                </button>
            </div>

            <div className="form-row">
                {/* Column 1: Identities */}
                <div className="form-group" style={{ flex: 1.5 }}>
                    <h3>Werkstatt (Absender)</h3>
                    <div className="form-group">
                        <label>Firmenname</label>
                        <input className="form-input" name="senderCompany" value={data.senderCompany} onChange={onChange} />
                    </div>

                    <div className="form-row">
                        <div className="form-group" style={{ flex: 3 }}>
                            <label>Straße</label>
                            <input className="form-input" name="senderStreet" value={data.senderStreet} onChange={onChange} placeholder="Straße" />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Hausnr.</label>
                            <input className="form-input" name="senderHouseNum" value={data.senderHouseNum} onChange={onChange} placeholder="Nr." />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>PLZ</label>
                            <input className="form-input" name="senderZip" value={data.senderZip} onChange={onChange} placeholder="12345" />
                        </div>
                        <div className="form-group" style={{ flex: 3 }}>
                            <label>Stadt</label>
                            <input className="form-input" name="senderCity" value={data.senderCity} onChange={onChange} placeholder="Musterstadt" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Telefon</label>
                            <input className="form-input" name="senderPhone" value={data.senderPhone} onChange={onChange} placeholder="+49..." />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input className="form-input" name="senderEmail" value={data.senderEmail} onChange={onChange} placeholder="email@..." />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Steuernummer</label>
                            <input className="form-input" name="senderTaxId" value={data.senderTaxId} onChange={onChange} placeholder="123/..." />
                        </div>
                        <div className="form-group">
                            <label>USt-IdNr</label>
                            <input className="form-input" name="senderVatId" value={data.senderVatId} onChange={onChange} placeholder="DE..." />
                        </div>
                    </div>

                    <h3 style={{ marginTop: '20px' }}>Kunde (Empfänger)</h3>
                    <div className="form-group">
                        <label>Name / Firma</label>
                        <input className="form-input" name="recipientName" value={data.recipientName} onChange={onChange} placeholder="Max Mustermann" />
                    </div>

                    <div className="form-row">
                        <div className="form-group" style={{ flex: 3 }}>
                            <label>Straße</label>
                            <input className="form-input" name="recipientStreet" value={data.recipientStreet} onChange={onChange} placeholder="Straße" />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Hausnr.</label>
                            <input className="form-input" name="recipientHouseNum" value={data.recipientHouseNum} onChange={onChange} placeholder="Nr." />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>PLZ</label>
                            <input className="form-input" name="recipientZip" value={data.recipientZip} onChange={onChange} placeholder="12345" />
                        </div>
                        <div className="form-group" style={{ flex: 3 }}>
                            <label>Stadt</label>
                            <input className="form-input" name="recipientCity" value={data.recipientCity} onChange={onChange} placeholder="Musterstadt" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Steuernummer (Opt.)</label>
                            <input className="form-input" name="recipientTaxId" value={data.recipientTaxId} onChange={onChange} placeholder="" />
                        </div>
                        <div className="form-group">
                            <label>USt-IdNr (Opt.)</label>
                            <input className="form-input" name="recipientVatId" value={data.recipientVatId} onChange={onChange} placeholder="" />
                        </div>
                    </div>
                </div>

                {/* Column 2: Meta Data */}
                <div className="form-group" style={{ flex: 1 }}>
                    <h3>Rechnungsdaten</h3>
                    <div className="form-group">
                        <label>Rechnungs-Nr.</label>
                        <input className="form-input" name="invoiceNumber" value={data.invoiceNumber} onChange={onChange} />
                    </div>
                    <div className="form-group">
                        <label>Datum</label>
                        <input type="date" className="form-input" name="date" value={data.date} onChange={onChange} />
                    </div>

                    <h3 style={{ marginTop: '20px' }}>Fahrzeugdaten</h3>
                    <div className="form-group">
                        <label>Modell</label>
                        <input className="form-input" name="vehicle" value={data.vehicle} onChange={onChange} />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Kennzeichen</label>
                            <input className="form-input" name="plate" value={data.plate} onChange={onChange} />
                        </div>
                        <div className="form-group">
                            <label>KM-Stand</label>
                            <input className="form-input" name="km" value={data.km} onChange={onChange} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Positions Table */}
            <div className="form-section">
                <h3>Positionen</h3>
                <table className="items-editor-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40%' }}>Beschreibung</th>
                            <th style={{ width: '15%' }}>Menge</th>
                            <th style={{ width: '20%' }}>Einzelpreis (€)</th>
                            <th style={{ width: '20%', textAlign: 'right' }}>Gesamt (€)</th>
                            <th style={{ width: '5%' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    <input className="form-input" value={item.description} onChange={(e) => onItemChange(index, 'description', e.target.value)} placeholder="Leistung..." />
                                </td>
                                <td>
                                    <input type="number" className="form-input" value={item.quantity} onChange={(e) => onItemChange(index, 'quantity', e.target.value)} />
                                </td>
                                <td>
                                    <input type="number" className="form-input" value={item.price} onChange={(e) => onItemChange(index, 'price', e.target.value)} />
                                </td>
                                <td style={{ textAlign: 'right', verticalAlign: 'middle', fontWeight: 500 }}>
                                    {formatCurrency((parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0))}
                                </td>
                                <td>
                                    <button onClick={() => onDeleteItem(index)} className="delete-btn" title="Löschen">×</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button onClick={onAddItem} className="add-btn">+ Position hinzufügen</button>

                <div className="editor-totals">
                    <div className="total-row">
                        <span>Netto (Subtotal):</span>
                        <span>{formatCurrency(totals.subtotal)}</span>
                    </div>
                    <div className="total-row">
                        <span>MwSt (19%):</span>
                        <span>{formatCurrency(totals.tax)}</span>
                    </div>
                    <div className="total-row grand-total">
                        <span>Gesamtbetrag:</span>
                        <span>{formatCurrency(totals.total)}</span>
                    </div>
                </div>
            </div>

            {/* Footer / Notes */}
            <div className="form-section">
                <h3>Fußzeile / Hinweise</h3>
                <div className="form-group">
                    <label>Zahlungsbedingungen & Bankdaten</label>
                    <textarea className="form-input" rows="6" name="footerPayment" value={data.footerPayment} onChange={onChange} />
                </div>
                <div className="form-group">
                    <label>Abschluss-Hinweis</label>
                    <textarea className="form-input" rows="2" name="footerNote" value={data.footerNote} onChange={onChange} />
                </div>
            </div>
        </div>
    );
};

export default InvoiceEditor;
