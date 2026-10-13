import React from 'react';
import { Building, ShieldCheck, Heart, Mail, Phone } from 'lucide-react';

export const Footer = ({ setCurrentView }) => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div>
            <div className="brand-logo" style={{ color: 'white', marginBottom: '1rem' }}>
              <div className="brand-icon">
                <Building size={22} />
              </div>
              <span>Stay<span style={{ color: 'var(--primary-400)' }}>Ease</span></span>
            </div>
            <p style={{ color: 'var(--slate-400)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              A modern, intelligent PG and coliving accommodation platform built for seamless tenant experiences, automated rent processing, digital vehicle passes, and transparent property operations.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--slate-400)', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={15} /> support@stayease.com
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Phone size={15} /> +91 80 4000 9999
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>For Tenants</h4>
            <ul className="footer-links">
              <li><a href="#find" onClick={(e) => { e.preventDefault(); setCurrentView('find-pg'); }}>Search Verified PGs</a></li>
              <li><a href="#rules" onClick={(e) => { e.preventDefault(); setCurrentView('find-pg'); }}>Sharing & Food Types</a></li>
              <li><a href="#dashboard" onClick={(e) => { e.preventDefault(); setCurrentView('tenant-dashboard'); }}>Tenant Portal</a></li>
              <li><a href="#payments" onClick={(e) => { e.preventDefault(); setCurrentView('tenant-dashboard'); }}>Digital Rent Receipts</a></li>
            </ul>
          </div>

          {/* For PG Owners */}
          <div className="footer-col">
            <h4>For PG Owners</h4>
            <ul className="footer-links">
              <li><a href="#list" onClick={(e) => { e.preventDefault(); setCurrentView('owner-dashboard'); }}>List Your Property</a></li>
              <li><a href="#rooms" onClick={(e) => { e.preventDefault(); setCurrentView('owner-dashboard'); }}>Manage Rooms & Beds</a></li>
              <li><a href="#tenants" onClick={(e) => { e.preventDefault(); setCurrentView('owner-dashboard'); }}>Tenant Verification & KYC</a></li>
              <li><a href="#collections" onClick={(e) => { e.preventDefault(); setCurrentView('owner-dashboard'); }}>Automated Invoicing</a></li>
            </ul>
          </div>

          {/* Top Tech Cities */}
          <div className="footer-col">
            <h4>Popular Hubs</h4>
            <ul className="footer-links">
              <li><a href="#bengaluru" onClick={(e) => { e.preventDefault(); setCurrentView('find-pg'); }}>Bangalore (Koramangala, HSR)</a></li>
              <li><a href="#pune" onClick={(e) => { e.preventDefault(); setCurrentView('find-pg'); }}>Pune (Hinjewadi, Baner)</a></li>
              <li><a href="#hyderabad" onClick={(e) => { e.preventDefault(); setCurrentView('find-pg'); }}>Hyderabad (Gachibowli, Madhapur)</a></li>
              <li><a href="#gurgaon" onClick={(e) => { e.preventDefault(); setCurrentView('find-pg'); }}>Gurgaon (Cyber City, DLF)</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} StayEase Accommodations Inc. All rights reserved.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--coral-500)' }}>
              Built with <Heart size={14} fill="currentColor" /> for Coliving
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
