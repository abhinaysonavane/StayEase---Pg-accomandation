import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { resetPasswordApi } from '../services/api';
import { KeyRound, Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const ResetPasswordPage = ({ initialToken = '', onNavigateLogin }) => {
  const { showToast } = useToast();
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // If token is provided in URL params (?token=...)
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [initialToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!token || token.trim().length < 10) {
      setErrorMessage('Please provide a valid password reset token.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPasswordApi(token.trim(), newPassword);
      setIsSuccess(true);
      showToast(res.message || 'Password reset successfully!', 'success');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to reset password. The link may have expired or was already used.');
      showToast('Password reset failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 180px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem', boxShadow: 'var(--shadow-xl)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary-600), var(--primary-700))',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
            }}
          >
            <KeyRound size={28} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>Set New Password</h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
            Choose a strong new password for your StayEase account
          </p>
        </div>

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <CheckCircle2 size={52} color="var(--success-solid)" style={{ margin: '0 auto 1.25rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--slate-800)' }}>Password Updated!</h3>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
              Your password has been securely updated. You can now log into your StayEase portal with your new password.
            </p>
            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              onClick={onNavigateLogin}
            >
              Sign In to StayEase <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {errorMessage && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Reset Security Token</label>
              <input
                type="text"
                required
                placeholder="Paste token or load from email link"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password * (Min 6 chars)</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password *</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={isLoading}
            >
              {isLoading ? 'Updating Password...' : 'Save New Password'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
              <button
                type="button"
                onClick={onNavigateLogin}
                style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontWeight: 600, cursor: 'pointer' }}
              >
                Return to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
