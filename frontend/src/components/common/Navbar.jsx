import React, { useState } from 'react';
import { Home, Compass, LayoutDashboard, Bell, LogOut, LogIn, User, Building, ShieldCheck, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockNotifications } from '../../data/mockData';

export const Navbar = ({ currentView, setCurrentView }) => {
  const { currentUser, role, isLoggedIn, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Brand Logo */}
        <div className="brand-logo" onClick={() => setCurrentView('home')}>
          <div className="brand-icon">
            <Building size={22} />
          </div>
          <span>Stay<span style={{ color: 'var(--primary-600)' }}>Ease</span></span>
        </div>

        {/* Navigation Links */}
        <ul className="nav-links">
          <li
            className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentView('home')}
          >
            <Home size={18} /> Home
          </li>
          <li
            className={`nav-link ${currentView === 'find-pg' ? 'active' : ''}`}
            onClick={() => setCurrentView('find-pg')}
          >
            <Compass size={18} /> Find PG
          </li>

          {role === 'tenant' && (
            <li
              className={`nav-link ${currentView === 'tenant-dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('tenant-dashboard')}
            >
              <LayoutDashboard size={18} /> Tenant Portal
            </li>
          )}

          {role === 'owner' && (
            <li
              className={`nav-link ${currentView === 'owner-dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('owner-dashboard')}
            >
              <Building size={18} /> Owner Portal
            </li>
          )}

          {role === 'admin' && (
            <li
              className={`nav-link ${currentView === 'admin-dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('admin-dashboard')}
            >
              <ShieldCheck size={18} /> Admin Console
            </li>
          )}

          {role === 'super_admin' && (
            <li
              className={`nav-link ${currentView === 'superadmin-dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('superadmin-dashboard')}
              style={{ color: '#fda4af' }}
            >
              <ShieldCheck size={18} /> Super Admin Portal
            </li>
          )}
        </ul>

        {/* Navigation Actions */}
        <div className="nav-actions">
          {/* Notifications Popover Toggle */}
          {isLoggedIn && (
            <div style={{ position: 'relative' }}>
              <button
                className="btn-secondary"
                style={{ borderRadius: 'var(--radius-full)', padding: '0.45rem', position: 'relative' }}
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-3px',
                      right: '-3px',
                      background: 'var(--coral-500)',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  className="card"
                  style={{
                    position: 'absolute',
                    top: '46px',
                    right: 0,
                    width: '320px',
                    padding: '1rem',
                    zIndex: 200,
                    boxShadow: 'var(--shadow-xl)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.95rem' }}>Notifications</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary-600)', cursor: 'pointer' }}>Mark all read</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {mockNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        style={{
                          padding: '0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          background: notif.read ? 'transparent' : 'var(--slate-50)',
                          borderLeft: notif.read ? 'none' : '3px solid var(--primary-500)',
                        }}
                      >
                        <strong style={{ fontSize: '0.85rem', color: 'var(--slate-800)', display: 'block' }}>{notif.title}</strong>
                        <p style={{ fontSize: '0.78rem', color: 'var(--slate-600)', margin: '0.2rem 0' }}>{notif.message}</p>
                        <span style={{ fontSize: '0.7rem', color: 'var(--slate-400)' }}>{notif.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User profile or Auth links */}
          {isLoggedIn ? (
            <div style={{ position: 'relative' }}>
              <button
                className="btn-secondary"
                style={{ padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => setShowUserDropdown(!showUserDropdown)}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--primary-600)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {currentUser?.avatar || 'U'}
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{currentUser?.name?.split(' ')[0]}</span>
                <ChevronDown size={14} />
              </button>

              {showUserDropdown && (
                <div
                  className="card"
                  style={{
                    position: 'absolute',
                    top: '44px',
                    right: 0,
                    width: '200px',
                    padding: '0.5rem',
                    zIndex: 200,
                    boxShadow: 'var(--shadow-xl)',
                  }}
                >
                  <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-light)', marginBottom: '0.35rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{currentUser?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{currentUser?.email}</div>
                  </div>
                  <button
                    className="sidebar-nav-item"
                    style={{ width: '100%', border: 'none', background: 'none' }}
                    onClick={() => {
                      setShowUserDropdown(false);
                      if (role === 'tenant') setCurrentView('tenant-dashboard');
                      else if (role === 'owner') setCurrentView('owner-dashboard');
                      else if (role === 'super_admin') setCurrentView('superadmin-dashboard');
                      else setCurrentView('admin-dashboard');
                    }}
                  >
                    <User size={16} /> My Dashboard
                  </button>
                  <button
                    className="sidebar-nav-item"
                    style={{ width: '100%', border: 'none', background: 'none', color: 'var(--coral-600)', cursor: 'pointer' }}
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                      setCurrentView('home');
                    }}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setCurrentView('login')}>
                <LogIn size={16} /> Login
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => setCurrentView('register')}>
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
