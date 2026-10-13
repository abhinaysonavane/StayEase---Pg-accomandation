import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Building, Lock, Mail, AlertCircle, ArrowRight, User } from 'lucide-react';
import { ForgotPasswordModal } from '../components/common/ForgotPasswordModal';
import { GoogleSignInModal } from '../components/common/GoogleSignInModal';

export const LoginPage = ({ onLoginSuccess, onNavigateRegister }) => {
  const { login, redirectDestination, setRedirectDestination } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // Quick helper to fill credentials during review/testing if requested
  const handleSelectDemoPersona = (personaEmail, personaPassword) => {
    setEmail(personaEmail);
    setPassword(personaPassword);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email address and password.');
      return;
    }

    setIsLoading(true);

    try {
      const user = await login(email.trim().toLowerCase(), password);
      showToast(`Welcome back, ${user.name}!`, 'success');

      if (redirectDestination) {
        const dest = redirectDestination;
        setRedirectDestination(null);
        if (onLoginSuccess) onLoginSuccess(user.role, dest);
      } else {
        if (onLoginSuccess) onLoginSuccess(user.role);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Incorrect email or password. Please try again.');
      showToast(err.message || 'Authentication failed. Check your credentials.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 180px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem', boxShadow: 'var(--shadow-xl)' }}>
        {/* Header */}
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
            <Building size={28} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>Sign In to StayEase</h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
            Access your dedicated tenant, PG owner, or administrator portal
          </p>
        </div>

        {/* Error Alert */}
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

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={() => setIsGoogleModalOpen(true)}
          className="btn btn-secondary"
          style={{
            width: '100%',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            background: 'white',
            borderColor: 'var(--slate-300)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span style={{ fontWeight: 600, color: 'var(--slate-800)', fontSize: '0.925rem' }}>
            Continue with Google
          </span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0 1.25rem', color: 'var(--slate-400)', fontSize: '0.8rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
          <span style={{ padding: '0 0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>or sign in with email</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '1.25rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'} <ArrowRight size={18} />
          </button>
        </form>

        {/* Development Persona Autofill helper */}
        <div style={{ marginTop: '1.5rem', padding: '0.85rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)', display: 'block', marginBottom: '0.4rem' }}>
            Test Accounts:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.725rem', padding: '0.25rem 0.5rem' }}
              onClick={() => handleSelectDemoPersona('rohan.sharma@example.com', 'password123')}
            >
              Tenant (Rohan)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.725rem', padding: '0.25rem 0.5rem' }}
              onClick={() => handleSelectDemoPersona('rajesh.verma@stayliving.com', 'password123')}
            >
              PG Owner (Rajesh)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.725rem', padding: '0.25rem 0.5rem' }}
              onClick={() => handleSelectDemoPersona('admin@stayease.com', 'password123')}
            >
              Admin (Priya)
            </button>
          </div>
        </div>

        {/* Navigation to Registration */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)', fontSize: '0.875rem', color: 'var(--slate-500)' }}>
          New to StayEase?{' '}
          <button
            onClick={onNavigateRegister}
            style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontWeight: 700, cursor: 'pointer' }}
          >
            Create an Account
          </button>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />

      <GoogleSignInModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        selectedRole="tenant"
        onLoginSuccess={onLoginSuccess}
      />
    </div>
  );
};
