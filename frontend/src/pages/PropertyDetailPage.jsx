import React, { useState } from 'react';
import {
  MapPin, Star, ShieldCheck, Utensils, Wind, Bed, Check, Users,
  Calendar, Phone, Clock, FileText, ArrowLeft, Heart, Share2, AlertCircle, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockReviews, mockRoomsAndBeds } from '../data/mockData';

export const PropertyDetailPage = ({ property, onBack, onBookDirect, onNavigateLogin }) => {
  const { isLoggedIn, setRedirectDestination } = useAuth();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedRoomType, setSelectedRoomType] = useState('double');

  if (!property) return null;

  const images = property.images && property.images.length > 0 ? property.images : [property.coverImage];
  const reviews = mockReviews.filter((r) => r.propertyId === property.id || r.propertyId === 1);
  const rooms = mockRoomsAndBeds.filter((r) => r.propertyId === property.id || r.propertyId === 1);

  const estimatedMonthly = selectedRoomType === 'single'
    ? property.startingPrice * 1.45
    : selectedRoomType === 'triple'
    ? property.startingPrice * 0.85
    : property.startingPrice;

  const depositTotal = estimatedMonthly * (property.depositMonths || 2);

  return (
    <div style={{ padding: '2rem 0 5rem' }}>
      <div className="container">
        {/* Navigation Breadcrumb / Back button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={onBack}>
            <ArrowLeft size={16} /> Back to Search Results
          </button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary btn-sm" title="Save to Favorites">
              <Heart size={16} /> Save
            </button>
            <button className="btn btn-secondary btn-sm" title="Share Property">
              <Share2 size={16} /> Share
            </button>
          </div>
        </div>

        {/* Gallery Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ height: '420px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--slate-200)' }}>
            <img
              src={images[activeImageIndex] || property.coverImage}
              alt={property.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '420px', overflowY: 'auto' }}>
            {images.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                style={{
                  height: '130px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: activeImageIndex === idx ? '3px solid var(--primary-600)' : '2px solid transparent',
                  opacity: activeImageIndex === idx ? 1 : 0.75,
                  transition: 'all 0.2s ease',
                }}
              >
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Main Details and Booking Sidebar Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '2.5rem', alignItems: 'flex-start' }}>
          {/* Left Column: Details, Rooms, Amenities, Rules */}
          <div>
            {/* Title Header */}
            <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1.5rem', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ShieldCheck size={14} /> Verified Accommodation
                </span>
                <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                  {property.genderPolicy === 'male' ? "Men's PG" : property.genderPolicy === 'female' ? "Women's PG" : 'Unisex Coliving'}
                </span>
              </div>

              <h1 style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>{property.name}</h1>
              <p style={{ color: 'var(--slate-600)', fontSize: '1.05rem', marginBottom: '0.85rem' }}>{property.tagline}</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.9rem', color: 'var(--slate-500)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={16} color="var(--primary-600)" />
                  <span>{property.address}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-600)', fontWeight: 700 }}>
                  <Star size={16} fill="currentColor" />
                  <span>{property.rating} ({property.reviewsCount} verified reviews)</span>
                </div>
              </div>
            </div>

            {/* Room & Bed Availability Matrix */}
            <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bed size={20} color="var(--primary-600)" /> Room & Live Bed Inventory
              </h3>
              <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                Current live bed availability breakdown. Select a bed or room sharing type to reserve.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                {rooms.map((room) => {
                  const hasVacancy = room.beds.some((b) => b.status === 'vacant');
                  return (
                    <div key={room.roomId} className={`room-card-box ${hasVacancy ? 'has-vacancy' : ''}`}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <strong style={{ fontSize: '1rem' }}>Room {room.roomNumber}</strong>
                        <span className={`badge ${hasVacancy ? 'badge-success' : 'badge-neutral'}`}>
                          {hasVacancy ? 'Beds Available' : 'Full'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginBottom: '0.75rem' }}>
                        {room.roomType.toUpperCase()} Sharing • Floor {room.floor} • {room.ac ? 'AC' : 'Non-AC'}
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-700)', marginBottom: '0.75rem' }}>
                        ₹{room.monthlyRent.toLocaleString('en-IN')} / bed
                      </div>

                      <div className="beds-layout">
                        {room.beds.map((bed) => (
                          <div
                            key={bed.id}
                            className={`bed-chip ${bed.status}`}
                            title={bed.status === 'vacant' ? 'Click to book this bed' : `Occupied by ${bed.tenantName}`}
                            onClick={() => {
                              if (bed.status === 'vacant') {
                                onBookDirect(property);
                              }
                            }}
                          >
                            <span>Bed {bed.bedNumber}</span>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'capitalize' }}>
                              {bed.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Verified Amenities */}
            <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Verified Property Amenities</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {property.amenities.map((amenity, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.925rem', color: 'var(--slate-700)' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: 'var(--primary-50)',
                        color: 'var(--primary-600)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Check size={15} />
                    </div>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* House Rules & Policies */}
            <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} color="var(--primary-600)" /> House Rules & Gate Timings
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {property.houseRules.map((rule, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--slate-600)' }}>
                    <span style={{ color: 'var(--primary-600)', fontWeight: 700 }}>•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Reviews Section */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Tenant Reviews & Ratings</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-600)', fontWeight: 800 }}>
                  <Star size={18} fill="currentColor" /> {property.rating} / 5.0
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {reviews.map((rev) => (
                  <div key={rev.id} style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--slate-800)' }}>{rev.authorName}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>{rev.date}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.2rem', color: 'var(--accent-500)', marginBottom: '0.4rem' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < Math.floor(rev.rating) ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Booking Action Card */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div className="card" style={{ padding: '1.75rem', boxShadow: 'var(--shadow-md)', border: '1.5px solid var(--primary-200)' }}>
              <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--slate-400)' }}>Estimated Rent</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginTop: '0.2rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                    ₹{Math.round(estimatedMonthly).toLocaleString('en-IN')}
                  </span>
                  <span style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>/ month</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Select Sharing Option</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {['single', 'double', 'triple'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`btn btn-secondary ${selectedRoomType === type ? 'active' : ''}`}
                      style={{
                        padding: '0.5rem 0.2rem',
                        fontSize: '0.8rem',
                        textTransform: 'capitalize',
                        borderColor: selectedRoomType === type ? 'var(--primary-500)' : 'var(--slate-200)',
                        background: selectedRoomType === type ? 'var(--primary-50)' : 'white',
                        color: selectedRoomType === type ? 'var(--primary-700)' : 'var(--slate-700)',
                      }}
                      onClick={() => setSelectedRoomType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Breakdown Matrix */}
              <div style={{ background: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--slate-500)' }}>Monthly Rent:</span>
                  <strong>₹{Math.round(estimatedMonthly).toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--slate-500)' }}>Refundable Deposit ({property.depositMonths || 2} mos):</span>
                  <strong>₹{Math.round(depositTotal).toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--slate-500)' }}>Maintenance & Wi-Fi:</span>
                  <span style={{ color: 'var(--success-solid)', fontWeight: 600 }}>₹0 (Included)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--slate-500)' }}>Notice Period:</span>
                  <span>{property.noticePeriodDays || 30} Days</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.6rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.95rem' }}>
                  <span>Total at Move-in:</span>
                  <span style={{ color: 'var(--primary-700)' }}>
                    ₹{Math.round(estimatedMonthly + depositTotal).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginBottom: '1rem' }}
                onClick={() => {
                  if (!isLoggedIn) {
                    setRedirectDestination({ view: 'property-detail', property, openBooking: true });
                    if (onNavigateLogin) onNavigateLogin();
                  } else {
                    onBookDirect(property);
                  }
                }}
              >
                <Bed size={18} /> Request to Join / Book Bed
              </button>

              {/* Owner card */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'var(--slate-200)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: 'var(--slate-700)',
                  }}
                >
                  {property.ownerName.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{property.ownerName}</div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--slate-400)' }}>PG Property Manager</div>
                </div>
                {isLoggedIn ? (
                  <a
                    href={`tel:${property.ownerPhone}`}
                    className="btn btn-secondary btn-sm"
                    style={{ borderRadius: 'var(--radius-full)' }}
                    title="Contact Manager"
                  >
                    <Phone size={14} /> Call {property.ownerPhone}
                  </a>
                ) : (
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ borderRadius: 'var(--radius-full)', fontSize: '0.75rem' }}
                    onClick={() => {
                      setRedirectDestination({ view: 'property-detail', property });
                      if (onNavigateLogin) onNavigateLogin();
                    }}
                    title="Sign in to view contact details"
                  >
                    <Lock size={12} /> Sign in to view
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
