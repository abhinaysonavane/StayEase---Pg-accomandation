import React, { useState } from 'react';
import { Modal } from './Modal';
import { useToast } from '../../context/ToastContext';
import { forgotPasswordApi } from '../../services/api';
import { Mail, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await forgotPasswordApi(email.trim());
      setSent(true);
      showToast(`Password reset link sent to ${email}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to dispatch reset link', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSent(false);
    setEmail('');
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reset Your Password">
      {sent ? (
        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
          <CheckCircle2 size={48} color="var(--success-solid)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Check Your Inbox</h3>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            We've dispatched password recovery instructions to <strong>{email}</strong>. Please click the link within 15 minutes.
          </p>
          <button className="btn btn-primary" onClick={handleClose}>
            Back to Sign In
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Enter your registered email address and we'll send you an authenticated password reset link.
          </p>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. rohan.sharma@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="modal-footer" style={{ margin: '-1.5rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Send Reset Link
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
