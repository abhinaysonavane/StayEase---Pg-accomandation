import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Building, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { GoogleSignInModal } from '../components/common/GoogleSignInModal';

export const RegisterPage = ({ onRegisterSuccess, onNavigateLogin }) => {
  const { register, redirectDestination, setRedirectDestination } = useAuth();
  const { showToast } = useToast();

  const [role, setRole] = useState('tenant');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // Field validation
  const isNameValid = fullName.trim().length >= 2;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = password.length >= 6;
  const isConfirmValid = confirmPassword.length >= 6 && confirmPassword === password;
  const isFormValid = isNameValid && isEmailValid && isPasswordValid && isConfirmValid;

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isFormValid) {
      setTouched({ fullName: true, email: true, password: true, confirmPassword: true });
      if (!isNameValid) setErrorMessage('Please enter your full name (minimum 2 characters).');
      else if (!isEmailValid) setErrorMessage('Please enter a valid email address.');
      else if (!isPasswordValid) setErrorMessage('Password must be at least 6 characters long.');
      else if (!isConfirmValid) setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
        password,
        role: role === 'owner' ? 'owner' : 'tenant'
      });

      showToast(`Account created successfully! Welcome, ${user.name}.`, 'success');

      if (redirectDestination) {
        const dest = redirectDestination;
        setRedirectDestination(null);
        if (onRegisterSuccess) onRegisterSuccess(user.role, dest);
      } else {
        if (onRegisterSuccess) onRegisterSuccess(user.role);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check your inputs.');
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 180px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '2.5rem', boxShadow: 'var(--shadow-xl)' }}>
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
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>Create Your Account</h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>Join StayEase to discover or manage modern accommodations</p>
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

        {/* Account Role Selector: strictly Tenant or PG Owner */}
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">I want to register as a:</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              type="button"
              className={`btn btn-secondary ${role === 'tenant' ? 'active' : ''}`}
              style={{
                padding: '0.75rem',
                borderColor: role === 'tenant' ? 'var(--primary-500)' : 'var(--slate-200)',
                background: role === 'tenant' ? 'var(--primary-50)' : 'white',
                color: role === 'tenant' ? 'var(--primary-700)' : 'var(--slate-700)',
                fontWeight: 600,
              }}
              onClick={() => setRole('tenant')}
            >
              <User size={18} /> Tenant / Resident
            </button>
            <button
              type="button"
              className={`btn btn-secondary ${role === 'owner' ? 'active' : ''}`}
              style={{
                padding: '0.75rem',
                borderColor: role === 'owner' ? 'var(--primary-500)' : 'var(--slate-200)',
                background: role === 'owner' ? 'var(--primary-50)' : 'white',
                color: role === 'owner' ? 'var(--primary-700)' : 'var(--slate-700)',
                fontWeight: 600,
              }}
              onClick={() => setRole('owner')}
            >
              <Building size={18} /> PG Owner
            </button>
          </div>
        </div>

        {/* Google Registration Option */}
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
            Register with Google as {role === 'tenant' ? 'Tenant' : 'Owner'}
          </span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', color: 'var(--slate-400)', fontSize: '0.8rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
          <span style={{ padding: '0 0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>or create with email</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Rohan Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={() => handleBlur('fullName')}
              style={{
                borderColor: touched.fullName && !isNameValid ? 'var(--danger-solid)' : undefined
              }}
            />
            {touched.fullName && !isNameValid && (
              <span style={{ color: 'var(--danger-solid)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                Full name must be at least 2 characters.
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                style={{
                  borderColor: touched.email && !isEmailValid ? 'var(--danger-solid)' : undefined
                }}
              />
              {touched.email && !isEmailValid && (
                <span style={{ color: 'var(--danger-solid)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  Please enter a valid email address.
                </span>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Password * (Min 6 chars)</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                style={{
                  borderColor: touched.password && !isPasswordValid ? 'var(--danger-solid)' : undefined
                }}
              />
              {touched.password && !isPasswordValid && (
                <span style={{ color: 'var(--danger-solid)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  Password must be at least 6 characters.
                </span>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                style={{
                  borderColor: touched.confirmPassword && !isConfirmValid ? 'var(--danger-solid)' : undefined
                }}
              />
              {touched.confirmPassword && !isConfirmValid && (
                <span style={{ color: 'var(--danger-solid)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  Passwords do not match.
                </span>
              )}
              {touched.confirmPassword && isConfirmValid && (
                <span style={{ color: 'var(--success-solid)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircle2 size={12} /> Passwords match
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Complete Registration'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)', fontSize: '0.875rem', color: 'var(--slate-500)' }}>
          Already have an account?{' '}
          <button
            onClick={onNavigateLogin}
            style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontWeight: 700, cursor: 'pointer' }}
          >
            Sign In Here
          </button>
        </div>
      </div>

      <GoogleSignInModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        selectedRole={role}
        onLoginSuccess={onRegisterSuccess}
      />
    </div>
  );
};
