import React from 'react';
import { MapPin, Star, Utensils, Wind, ShieldCheck, Bed } from 'lucide-react';

export const PropertyCard = ({ property, onSelectProperty, onBookDirect }) => {
  const formatGender = (gender) => {
    if (gender === 'male') return "Men's PG";
    if (gender === 'female') return "Women's PG";
    return 'Unisex Coliving';
  };

  return (
    <div className="card property-card card-hover">
      <div className="property-image-wrap">
        <img
          src={property.coverImage}
          alt={property.name}
          className="property-image"
          loading="lazy"
        />
        <span className="property-badge-gender">{formatGender(property.genderPolicy)}</span>
        {property.vacantBeds > 0 ? (
          <span className="property-badge-vacant">
            {property.vacantBeds} Beds Vacant
          </span>
        ) : (
          <span className="property-badge-vacant" style={{ background: 'var(--coral-500)' }}>
            Waitlist Only
          </span>
        )}
      </div>

      <div className="property-content">
        <div className="property-header">
          <h3 className="property-title">{property.name}</h3>
          <div className="property-rating">
            <Star size={14} fill="currentColor" />
            <span>{property.rating}</span>
          </div>
        </div>

        <div className="property-location">
          <MapPin size={15} color="var(--slate-400)" />
          <span>{property.locality}, {property.city}</span>
        </div>

        <div className="property-tags">
          {property.foodIncluded && (
            <span className="amenity-chip" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Utensils size={12} /> Food Included
            </span>
          )}
          {property.acAvailable && (
            <span className="amenity-chip" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Wind size={12} /> AC Available
            </span>
          )}
          {property.verified && (
            <span className="amenity-chip" style={{ background: 'var(--success-bg)', color: 'var(--success-text)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ShieldCheck size={12} /> Verified
            </span>
          )}
        </div>

        <div className="property-footer">
          <div className="property-price">
            <span className="price-sub">Starting from</span>
            <div>
              <span className="price-amount">₹{property.startingPrice.toLocaleString('en-IN')}</span>
              <span className="price-period"> / mo</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onSelectProperty(property)}
            >
              Details
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onBookDirect(property)}
            >
              <Bed size={15} /> Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
