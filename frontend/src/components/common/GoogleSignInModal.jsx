import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getGoogleStatusApi } from '../../services/api';
import { AlertCircle, User, Building, ArrowRight, ShieldAlert } from 'lucide-react';

export const GoogleSignInModal = ({ isOpen, onClose, selectedRole = 'tenant', onLoginSuccess }) => {
  const { loginWithGoogle, redirectDestination, setRedirectDestination } = useAuth();
  const { showToast } = useToast();

  const [roleChoice, setRoleChoice] = useState(selectedRole === 'owner' ? 'owner' : 'tenant');
  const [isConfigured, setIsConfigured] = useState(null);
  const [googleClientId, setGoogleClientId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const buttonContainerRef = useRef(null);

  // Sync roleChoice with selectedRole prop when opening
  useEffect(() => {
    if (selectedRole === 'owner' || selectedRole === 'tenant') {
      setRoleChoice(selectedRole);
    }
  }, [selectedRole]);

  // Check Google OAuth configuration status on mount or open
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    async function checkStatus() {
      try {
        const status = await getGoogleStatusApi();
        if (isMounted) {
          setIsConfigured(status.configured);
          setGoogleClientId(status.client_id || import.meta.env?.VITE_GOOGLE_CLIENT_ID || null);
        }
      } catch (err) {
        if (isMounted) {
          setIsConfigured(false);
        }
      }
    }

    checkStatus();
    return () => { isMounted = false; };
  }, [isOpen]);

  // Initialize genuine Google Identity Services SDK when configured
  useEffect(() => {
    if (!isOpen || !isConfigured || !googleClientId) return;

    let isMounted = true;

    const handleGoogleCredential = async (response) => {
      if (!response.credential) {
        showToast('Google authentication failed to produce an ID token', 'error');
        return;
      }

      setIsLoading(true);
      setErrorMessage('');

      try {
        const user = await loginWithGoogle(response.credential, roleChoice);
        showToast(`Successfully authenticated as ${user.name}!`, 'success');
        onClose();

        if (redirectDestination) {
          const dest = redirectDestination;
          setRedirectDestination(null);
          if (onLoginSuccess) onLoginSuccess(user.role, dest);
        } else {
          if (onLoginSuccess) onLoginSuccess(user.role);
        }
      } catch (err) {
        setErrorMessage(err.message || 'Google authentication failed');
        showToast(err.message || 'Google sign-in failed', 'error');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    function loadAndInitGIS() {
      if (typeof window.google !== 'undefined' && window.google.accounts) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredential,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          if (buttonContainerRef.current) {
            buttonContainerRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(buttonContainerRef.current, {
              theme: 'outline',
              size: 'large',
              width: 380,
              text: 'continue_with',
              shape: 'rectangular',
            });
          }
        } catch (e) {
          console.warn('GIS initialization notice:', e);
        }
      } else {
        // Dynamically load script if not loaded
        const existingScript = document.getElementById('google-gsi-client');
        if (!existingScript) {
          const script = document.createElement('script');
          script.id = 'google-gsi-client';
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          script.onload = () => {
            if (isMounted) loadAndInitGIS();
          };
          document.body.appendChild(script);
        }
      }
    }

    loadAndInitGIS();

    return () => {
      isMounted = false;
    };
  }, [isOpen, isConfigured, googleClientId, roleChoice]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sign in with Google">
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" style={{ margin: '0 auto 0.5rem' }}>
          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"/>
          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
        </svg>
        <h3 style={{ fontSize: '1.2rem', color: 'var(--slate-800)', margin: '0 0 0.25rem' }}>Genuine Google Authentication</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', margin: 0 }}>
          Direct OpenID Connect authentication with Google Identity Services
        </p>
      </div>

      {errorMessage && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Account Type choice: strictly Tenant or PG Owner */}
      <div style={{ background: 'var(--slate-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-light)' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)', display: 'block', marginBottom: '0.5rem' }}>
          Select Account Type for New Registrations:
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <button
            type="button"
            className={`btn btn-secondary btn-sm ${roleChoice === 'tenant' ? 'active' : ''}`}
            style={{
              borderColor: roleChoice === 'tenant' ? 'var(--primary-500)' : 'var(--slate-200)',
              background: roleChoice === 'tenant' ? 'var(--primary-50)' : 'white',
              color: roleChoice === 'tenant' ? 'var(--primary-700)' : 'var(--slate-700)',
              fontWeight: 700,
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
            onClick={() => setRoleChoice('tenant')}
          >
            <User size={16} /> Tenant / Resident
          </button>
          <button
            type="button"
            className={`btn btn-secondary btn-sm ${roleChoice === 'owner' ? 'active' : ''}`}
            style={{
              borderColor: roleChoice === 'owner' ? 'var(--primary-500)' : 'var(--slate-200)',
              background: roleChoice === 'owner' ? 'var(--primary-50)' : 'white',
              color: roleChoice === 'owner' ? 'var(--primary-700)' : 'var(--slate-700)',
              fontWeight: 700,
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
            onClick={() => setRoleChoice('owner')}
          >
            <Building size={16} /> PG Owner
          </button>
        </div>
        <small style={{ color: 'var(--slate-500)', fontSize: '0.72rem', display: 'block', marginTop: '0.4rem' }}>
          Existing accounts retain their previously registered role automatically.
        </small>
      </div>

      {/* When Google OAuth is configured */}
      {isConfigured ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <div ref={buttonContainerRef} style={{ minHeight: '44px', display: 'flex', justifyContent: 'center', width: '100%' }}>
            {isLoading && <span>Authenticating with Google...</span>}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textAlign: 'center', margin: 0 }}>
            Google will securely verify your identity with StayEase. No passwords are shared.
          </p>
        </div>
      ) : (
        /* When Google OAuth is NOT configured */
        <div style={{ marginBottom: '1.25rem' }}>
          <div
            style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              color: '#92400e',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              display: 'flex',
              gap: '0.65rem',
            }}
          >
            <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: '2px', color: '#b45309' }} />
            <div>
              <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#78350f' }}>
                Google Sign-In Is Not Configured
              </strong>
              <span>
                To activate Google authentication, configure <code>GOOGLE_CLIENT_ID</code> in your backend <code>.env</code> file.
                In the meantime, please use standard email & password registration below.
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem' }}
            onClick={onClose}
          >
            Use Email & Password Instead <ArrowRight size={16} />
          </button>
        </div>
      )}
    </Modal>
  );
};
