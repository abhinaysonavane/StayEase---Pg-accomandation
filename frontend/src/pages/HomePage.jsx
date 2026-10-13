import React, { useState } from 'react';
import { Search, MapPin, ShieldCheck, CheckCircle2, Bed, Sparkles, Building2, Users, Star, ArrowRight, Zap, Coffee, Wifi } from 'lucide-react';
import { PropertyCard } from '../components/property/PropertyCard';

export const HomePage = ({ properties, onSelectProperty, onBookDirect, onSearchRedirect }) => {
  const [selectedCity, setSelectedCity] = useState('');
  const [keyword, setKeyword] = useState('');

  const featuredProperties = properties.slice(0, 3);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    onSearchRedirect({ city: selectedCity, keyword });
  };

  const cities = [
    { name: 'Bangalore', count: '1,420+ Beds', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=400&q=80' },
    { name: 'Pune', count: '890+ Beds', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=400&q=80' },
    { name: 'Hyderabad', count: '950+ Beds', image: 'https://images.unsplash.com/photo-1605007493699-ce65834f8a00?auto=format&fit=crop&w=400&q=80' },
    { name: 'Gurgaon', count: '740+ Beds', image: 'https://images.unsplash.com/photo-1572979203492-714471fe4180?auto=format&fit=crop&w=400&q=80' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
          color: 'white',
          padding: '5.5rem 0 4.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow ambient circle */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center', marginBottom: '2.5rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '0.35rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#c7d2fe',
                marginBottom: '1.25rem',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <Sparkles size={16} color="#fbbf24" /> Verified PG & Coliving Spaces Across India
            </div>

            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', color: 'white', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem' }}>
              Find Your Ideal PG. <br />
              <span style={{ background: 'linear-gradient(90deg, #818cf8, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Live Hassle-Free & Connected.
              </span>
            </h1>

            <p style={{ fontSize: '1.1rem', color: '#cbd5e1', lineHeight: 1.6, maxWidth: '650px', margin: '0 auto' }}>
              Discover fully-managed accommodations with home-cooked meals, high-speed Wi-Fi, transparent rent ledgers, digital vehicle passes, and 24/7 service resolution.
            </p>
          </div>

          {/* Quick Search Floating Box */}
          <form
            onSubmit={handleHeroSearch}
            className="glass-panel"
            style={{
              padding: '1.25rem',
              maxWidth: '940px',
              margin: '0 auto',
              background: 'rgba(255, 255, 255, 0.95)',
              color: 'var(--slate-800)',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr auto', gap: '1rem', alignItems: 'center' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                  <MapPin size={14} color="var(--primary-600)" /> Select City
                </label>
                <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                  <option value="">All Tech Hubs</option>
                  <option value="Bangalore">Bangalore (Koramangala, HSR, Indiranagar)</option>
                  <option value="Pune">Pune (Hinjewadi, Baner, Wakad)</option>
                  <option value="Hyderabad">Hyderabad (Gachibowli, Madhapur)</option>
                  <option value="Gurgaon">Gurgaon (Cyber City, DLF Phase 2)</option>
                  <option value="Chennai">Chennai (OMR, Thoraipakkam)</option>
                  <option value="Noida">Noida (Sector 62, Sector 18)</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                  <Search size={14} color="var(--primary-600)" /> Locality, Landmark or PG Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Koramangala, GreenLeaf, AC room, Single..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', height: '48px', marginTop: '1.2rem' }}
                >
                  <Search size={18} /> Explore PGs
                </button>
              </div>
            </div>
          </form>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '3rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white' }}>5,200+</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Verified Beds</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8' }}>98.2%</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Occupancy Rate</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399' }}>15 Mins</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Ticket Resolution</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24' }}>4.8 / 5.0</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Tenant Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Cities Section */}
      <section style={{ padding: '4.5rem 0 2rem' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
              <span style={{ color: 'var(--primary-600)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Top Destinations
              </span>
              <h2 style={{ fontSize: '1.85rem', marginTop: '0.35rem' }}>Popular Cities for Tech Professionals</h2>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onSearchRedirect({ city: '', keyword: '' })}
            >
              View All Locations <ArrowRight size={15} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
            {cities.map((c) => (
              <div
                key={c.name}
                className="card card-hover"
                style={{ overflow: 'hidden', cursor: 'pointer', position: 'relative', height: '170px' }}
                onClick={() => onSearchRedirect({ city: c.name, keyword: '' })}
              >
                <img
                  src={c.image}
                  alt={c.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.1) 70%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '1.25rem',
                    color: 'white',
                  }}
                >
                  <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '0.2rem' }}>{c.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{c.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Verified PGs */}
      <section style={{ padding: '3rem 0 4.5rem' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
              <span style={{ color: 'var(--primary-600)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Featured Accommodations
              </span>
              <h2 style={{ fontSize: '1.85rem', marginTop: '0.35rem' }}>Top-Rated PG & Coliving Spaces</h2>
            </div>
            <button
              className="btn btn-outline-primary"
              onClick={() => onSearchRedirect({ city: '', keyword: '' })}
            >
              Browse All {properties.length} Properties <ArrowRight size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
            {featuredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onSelectProperty={onSelectProperty}
                onBookDirect={onBookDirect}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose StayEase / Platform Improvements */}
      <section style={{ background: 'var(--slate-100)', padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3.5rem' }}>
            <span style={{ color: 'var(--primary-600)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              The StayEase Advantage
            </span>
            <h2 style={{ fontSize: '2.1rem', marginTop: '0.4rem', marginBottom: '0.8rem' }}>
              Designed from Real PG Experience Insights
            </h2>
            <p style={{ color: 'var(--slate-600)' }}>
              We solved the pain points seen on traditional portals: unclear meal policies, hidden deposits, slow complaint tracking, and manual offline rent books.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
            <div className="card" style={{ padding: '1.75rem' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-50)',
                  color: 'var(--primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <ShieldCheck size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>100% Verified Properties</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                Every PG listed undergoes physical photo verification, owner ID verification, and clear security deposit terms. No surprises on move-in day.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--success-bg)',
                  color: 'var(--success-solid)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <CheckCircle2 size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Automated Rent & Receipts</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                Clear monthly invoices generated on the 1st. Safe payment reference submission, owner verification, and instant official PDF receipts for HRA tax exemption.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--warning-bg)',
                  color: 'var(--warning-solid)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Zap size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Instant Complaint Tracker</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                From leaky taps to Wi-Fi drops, log tickets with priority tags in seconds. Track technician notes and resolution timestamps in real-time.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--info-bg)',
                  color: 'var(--info-solid)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Building2 size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Digital Parking & Gate Passes</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                Register your 2-wheeler or 4-wheeler to get an authenticated digital parking pass and allocated slot badge without manual guard registers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action for PG Owners */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div
            style={{
              background: 'linear-gradient(135deg, var(--primary-700), var(--primary-900))',
              borderRadius: 'var(--radius-xl)',
              padding: '3.5rem 2.5rem',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '2rem',
            }}
          >
            <div style={{ maxWidth: '600px' }}>
              <h2 style={{ color: 'white', fontSize: '2.1rem', marginBottom: '0.75rem' }}>
                Are You a PG or Coliving Owner?
              </h2>
              <p style={{ color: '#c7d2fe', fontSize: '1.05rem', lineHeight: 1.6 }}>
                Automate your bed inventories, collect rent on time, manage tenant KYC, and resolve complaints effortlessly with the StayEase Owner Portal.
              </p>
            </div>
            <div>
              <button
                className="btn btn-primary btn-lg"
                style={{ background: 'white', color: 'var(--primary-800)', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
                onClick={() => onSearchRedirect({ roleSwitch: 'owner' })}
              >
                Explore Owner Portal <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
