import React from 'react';
import { Modal } from '../common/Modal';
import { Printer, Download, CheckCircle, Building } from 'lucide-react';

export const ReceiptModal = ({ isOpen, onClose, invoice, stay }) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Digital Payment Receipt" size="lg">
      <div className="receipt-paper" id="printable-receipt">
        <div className="receipt-header-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <Building size={20} color="var(--primary-600)" />
              <strong style={{ fontSize: '1.25rem', color: 'var(--slate-900)' }}>
                {stay?.propertyName || 'GreenLeaf Luxury Coliving & PG'}
              </strong>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--slate-500)', maxWidth: '350px' }}>
              {stay?.propertyAddress || 'Plot 88, 17th Main Rd, 4th Block, Koramangala, Bengaluru'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="receipt-stamp">PAID & VERIFIED</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)', marginTop: '0.35rem' }}>
              Receipt #{invoice.receiptId || 'REC-2024-10-098'}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <div>
            <span style={{ color: 'var(--slate-400)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Billed To</span>
            <strong style={{ color: 'var(--slate-800)', fontSize: '1rem', display: 'block' }}>{invoice.tenantName || 'Rohan Sharma'}</strong>
            <span style={{ color: 'var(--slate-600)' }}>Room: {stay?.roomNumber || '204'} | Bed: {stay?.bedNumber || 'B'}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: 'var(--slate-400)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Invoice Period</span>
            <strong style={{ color: 'var(--slate-800)', fontSize: '0.95rem', display: 'block' }}>{invoice.month}</strong>
            <span style={{ color: 'var(--slate-600)' }}>Date Paid: {invoice.paidDate || '2024-10-04'}</span>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'var(--slate-50)', borderBottom: '1.5px solid var(--border-light)' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--slate-600)' }}>Description</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--slate-600)' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '0.75rem' }}>Monthly Room Rent ({stay?.roomType || 'Double Sharing AC'})</td>
              <td style={{ padding: '0.75rem', textAlign: 'right' }}>₹{(invoice.breakdown?.rent || 11500).toLocaleString('en-IN')}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '0.75rem' }}>Maintenance, High-Speed Wi-Fi & Housekeeping</td>
              <td style={{ padding: '0.75rem', textAlign: 'right' }}>₹{(invoice.breakdown?.maintenance || 1000).toLocaleString('en-IN')}</td>
            </tr>
            <tr style={{ borderBottom: '2px solid var(--slate-800)', fontWeight: 700 }}>
              <td style={{ padding: '0.9rem 0.75rem', fontSize: '1.05rem' }}>Total Amount Paid</td>
              <td style={{ padding: '0.9rem 0.75rem', textAlign: 'right', fontSize: '1.15rem', color: 'var(--primary-700)' }}>
                ₹{invoice.amount.toLocaleString('en-IN')}
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ background: 'var(--slate-50)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem' }}>
          <div>
            <span style={{ color: 'var(--slate-500)' }}>Payment Method: </span>
            <strong>{invoice.paymentMethod || 'UPI (Google Pay)'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--slate-500)' }}>Txn Reference: </span>
            <code style={{ background: 'var(--slate-200)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
              {invoice.transactionRef || 'UPI/428901239822'}
            </code>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: 'var(--slate-400)' }}>
          This is a computer-generated digital receipt and does not require a physical signature. Powered by StayEase Platform.
        </div>
      </div>

      <div className="modal-footer" style={{ margin: '-1.5rem', marginTop: '1.5rem' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
        <button type="button" className="btn btn-primary" onClick={handlePrint}>
          <Printer size={16} /> Print / Save PDF
        </button>
      </div>
    </Modal>
  );
};
