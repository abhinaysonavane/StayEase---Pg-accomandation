import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { ShieldCheck, QrCode, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const PayRentModal = ({ isOpen, onClose, invoice, onPaymentSubmitted }) => {
  const { showToast } = useToast();
  const [method, setMethod] = useState('upi');
  const [transactionRef, setTransactionRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!invoice) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (method !== 'cash' && !transactionRef.trim()) {
      showToast('Please enter the transaction reference / UTR number', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onPaymentSubmitted({
        invoiceId: invoice.id,
        method: method === 'upi' ? 'UPI (Google Pay / PhonePe)' : method === 'bank' ? 'Bank Transfer (NEFT/IMPS)' : 'Cash at Desk',
        transactionRef: transactionRef.trim() || 'CASH-HANDOVER',
        date: new Date().toISOString().split('T')[0]
      });
      setIsSubmitting(false);
      showToast('Payment record submitted for owner verification! Status updated to Under Review.', 'success');
      onClose();
    }, 600);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Submit Rent Payment — ${invoice.month}`}>
      <form onSubmit={handleSubmit}>
        <div style={{ background: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>Invoice ID:</span>
            <strong>{invoice.id}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>Due Date:</span>
            <span>{invoice.dueDate}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800 }}>
            <span>Total Payable:</span>
            <span style={{ color: 'var(--primary-700)' }}>₹{invoice.amount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Payment Safe Workflow Notice */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', background: 'var(--info-bg)', border: '1px solid var(--info-border)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.8rem', color: 'var(--info-text)' }}>
          <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Safe Payment Workflow:</strong> Transfer rent directly to the owner's official UPI/bank account and submit the reference ID below. The PG owner verifies the credit and generates your authenticated digital receipt.
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Select Payment Method</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <button
              type="button"
              className={`btn btn-secondary ${method === 'upi' ? 'active' : ''}`}
              style={{
                borderColor: method === 'upi' ? 'var(--primary-500)' : 'var(--slate-200)',
                background: method === 'upi' ? 'var(--primary-50)' : 'white',
                color: method === 'upi' ? 'var(--primary-700)' : 'var(--slate-700)',
                fontSize: '0.8rem',
                flexDirection: 'column',
                padding: '0.6rem 0.2rem'
              }}
              onClick={() => setMethod('upi')}
            >
              <QrCode size={18} /> UPI / QR
            </button>
            <button
              type="button"
              className={`btn btn-secondary ${method === 'bank' ? 'active' : ''}`}
              style={{
                borderColor: method === 'bank' ? 'var(--primary-500)' : 'var(--slate-200)',
                background: method === 'bank' ? 'var(--primary-50)' : 'white',
                color: method === 'bank' ? 'var(--primary-700)' : 'var(--slate-700)',
                fontSize: '0.8rem',
                flexDirection: 'column',
                padding: '0.6rem 0.2rem'
              }}
              onClick={() => setMethod('bank')}
            >
              <CreditCard size={18} /> Net Banking
            </button>
            <button
              type="button"
              className={`btn btn-secondary ${method === 'cash' ? 'active' : ''}`}
              style={{
                borderColor: method === 'cash' ? 'var(--primary-500)' : 'var(--slate-200)',
                background: method === 'cash' ? 'var(--primary-50)' : 'white',
                color: method === 'cash' ? 'var(--primary-700)' : 'var(--slate-700)',
                fontSize: '0.8rem',
                flexDirection: 'column',
                padding: '0.6rem 0.2rem'
              }}
              onClick={() => setMethod('cash')}
            >
              <CheckCircle2 size={18} /> Cash at Desk
            </button>
          </div>
        </div>

        {method === 'upi' && (
          <div style={{ background: 'var(--slate-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--slate-500)', display: 'block', marginBottom: '0.2rem' }}>Property UPI ID:</span>
            <code style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-800)' }}>greenleaf.verma@okhdfcbank</code>
          </div>
        )}

        {method !== 'cash' && (
          <div className="form-group">
            <label className="form-label">Transaction Reference / UTR Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. UPI/428901239822 or IMPS8899220011"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
            />
            <span className="form-hint">Found in your payment app confirmation screen</span>
          </div>
        )}

        <div className="modal-footer" style={{ margin: '-1.5rem', marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Recording...' : 'Submit Payment for Approval'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
