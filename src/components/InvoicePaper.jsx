import React, { forwardRef } from 'react';
import '../index.css';

const InvoicePaper = forwardRef(({ data, totals }, ref) => {
    const { subtotal, tax, total } = totals;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    return (
        <div className="invoice-paper" ref={ref}>
            {/* Header */}
            <div className="header-row">
                <div className="company-block">
                    <h1>{data.senderCompany}</h1>
                    <p style={{ whiteSpace: 'pre-line' }}>
                        {data.senderStreet} {data.senderHouseNum}<br />
                        {data.senderZip} {data.senderCity}<br />
                        Tel: {data.senderPhone}<br />
                        Email: {data.senderEmail}<br />
                        St-Nr: {data.senderTaxId}<br />
                        USt-IdNr: {data.senderVatId}
                    </p>
                </div>
            </div>

            {/* Sender Line Removed */}


            {/* Recipient Block */}
            <div className="recipient-block">
                <div className="recipient-input bold">{data.recipientName}</div>
                <div className="recipient-textarea">
                    {data.recipientStreet} {data.recipientHouseNum}<br />
                    {data.recipientZip} {data.recipientCity}<br />
                    {data.recipientTaxId && `St-Nr: ${data.recipientTaxId}`}<br />
                    {data.recipientVatId && `USt-IdNr: ${data.recipientVatId}`}
                </div>
            </div>

            {/* Meta Data */}
            <div className="meta-section">
                <div className="meta-grid">
                    <label>Rechnungsdatum:</label>
                    <div className="input-like">{new Date(data.date).toLocaleDateString('de-DE')}</div>

                    <label>Rechnungsnummer:</label>
                    <div className="input-like">{data.invoiceNumber}</div>

                    <label>Fahrzeug:</label>
                    <div className="input-like">{data.vehicle}</div>

                    <label>Kennzeichen:</label>
                    <div className="input-like">{data.plate}</div>

                    <label>KM-Stand:</label>
                    <div className="input-like">{data.km}</div>
                </div>
            </div>

            {/* Table */}
            <table className="invoice-table">
                <thead>
                    <tr>
                        <th style={{ width: '50px', textAlign: 'center' }}>Pos</th>
                        <th>Leistung / Ersatzteil</th>
                        <th style={{ width: '60px', textAlign: 'center' }}>Menge</th>
                        <th style={{ width: '100px', textAlign: 'right' }}>Einzelpreis</th>
                        <th style={{ width: '100px', textAlign: 'right' }}>Gesamt (€)</th>
                    </tr>
                </thead>
                <tbody>
                    {data.items.map((item, index) => {
                        const q = parseFloat(item.quantity) || 0;
                        const p = parseFloat(item.price) || 0;
                        const rowTotal = q * p;

                        return (
                            <tr key={index}>
                                <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                <td>{item.description}</td>
                                <td style={{ textAlign: 'center' }}>{q}</td>
                                <td style={{ textAlign: 'right' }}>{formatCurrency(p)}</td>
                                <td style={{ textAlign: 'right' }}>{formatCurrency(rowTotal)}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            {/* Totals */}
            <div className="totals-container">
                <div className="totals-box">
                    <div className="totals-row divider">
                        <span>Gesamtsumme netto (€)</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="totals-row divider">
                        <span>zzgl. 19% MwSt (€)</span>
                        <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="totals-row final">
                        <span>Gesamtsumme brutto (€)</span>
                        <span>{formatCurrency(total)}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="invoice-footer">
                <div className="footer-section">
                    <p style={{ whiteSpace: 'pre-line' }}>
                        {data.footerPayment}
                    </p>
                </div>
                <div className="footer-section">
                    <p style={{ whiteSpace: 'pre-line' }}>
                        {data.footerNote}
                    </p>
                </div>
            </div>
        </div>
    );
});

export default InvoicePaper;
