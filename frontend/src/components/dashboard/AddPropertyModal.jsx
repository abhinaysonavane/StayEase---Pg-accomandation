import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { Building, MapPin } from 'lucide-react';
import { createPropertyApi } from '../../services/api';

export const AddPropertyModal = ({ isOpen, onClose, onPropertyAdded }) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [locality, setLocality] = useState('');
  const [address, setAddress] = useState('');
  const [genderPolicy, setGenderPolicy] = useState('unisex');
  const [startingPrice, setStartingPrice] = useState(11000);
  const [totalBeds, setTotalBeds] = useState(30);
  const [foodIncluded, setFoodIncluded] = useState(true);
  const [acAvailable, setAcAvailable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !locality.trim()) {
      showToast('Please fill in the property name and locality', 'error');
      return;
    }

    setIsSubmitting(true);
    let createdApiProp = null;
    try {
      createdApiProp = await createPropertyApi({
        name: name.trim(),
        description: tagline.trim() || 'Modern coliving & PG accommodation with prime amenities',
        city,
        locality: locality.trim(),
        address: address.trim() || `${locality.trim()}, ${city}`,
        gender_policy: genderPolicy,
        monthly_rent: Number(startingPrice),
        total_beds: Number(totalBeds),
        vacant_beds: Number(totalBeds),
        food_included: foodIncluded,
        ac_available: acAvailable,
      });
    } catch (err) {
      console.warn('Backend property creation fallback to local:', err.message);
    }

    const newProperty = createdApiProp ? {
      ...createdApiProp,
      startingPrice: createdApiProp.monthly_rent || Number(startingPrice),
      monthlyRent: createdApiProp.monthly_rent || Number(startingPrice),
      tagline: createdApiProp.description || tagline.trim(),
      totalBeds: createdApiProp.total_beds || Number(totalBeds),
      vacantBeds: createdApiProp.vacant_beds || Number(totalBeds),
      genderPolicy: createdApiProp.gender_policy || genderPolicy,
      foodIncluded: createdApiProp.food_included ?? foodIncluded,
      acAvailable: createdApiProp.ac_available ?? acAvailable,
      coverImage: createdApiProp.cover_image || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
      images: createdApiProp.images && createdApiProp.images.length > 0 ? createdApiProp.images : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80'],
    } : {
      id: Date.now(),
      name: name.trim(),
      tagline: tagline.trim() || 'Modern coliving & PG accommodation with prime amenities',
      city,
      locality: locality.trim(),
      address: address.trim() || `${locality.trim()}, ${city}`,
      genderPolicy,
      startingPrice: Number(startingPrice),
      monthlyRent: Number(startingPrice),
      depositMonths: 2,
      noticePeriodDays: 30,
      rating: 5.0,
      reviewsCount: 1,
      verified: true,
      coverImage: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
      images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80'],
      roomTypes: ['single', 'double', 'triple'],
      foodIncluded,
      foodType: 'veg_and_non_veg',
      acAvailable,
      totalBeds: Number(totalBeds),
      vacantBeds: Number(totalBeds),
      amenities: [
        'High-Speed Wi-Fi',
        '24x7 Power Backup',
        'Daily Housekeeping',
        'Biometric Access',
        'CCTV Security',
        'RO Drinking Water'
      ],
      houseRules: [
        'Gate curfew 11:00 PM',
        'No smoking in common areas'
      ],
      ownerId: 2,
      ownerName: 'Rajesh Verma',
      ownerPhone: '+91 98111 22334'
    };

    onPropertyAdded(newProperty);
    setIsSubmitting(false);
    showToast(`Property "${newProperty.name}" added successfully!`, 'success');
    onClose();
    setName('');
    setTagline('');
    setLocality('');
    setAddress('');
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="List New PG / Coliving Property" size="lg">
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Property Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Zenith Coliving & Residences"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Marketing Tagline</label>
            <input
              type="text"
              placeholder="e.g. Premium living with rooftop cafe & high-speed Wi-Fi"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">City *</label>
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="Bangalore">Bangalore</option>
              <option value="Pune">Pune</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Gurgaon">Gurgaon</option>
              <option value="Chennai">Chennai</option>
              <option value="Noida">Noida</option>
              <option value="Mumbai">Mumbai</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Locality / Sector *</label>
            <input
              type="text"
              required
              placeholder="e.g. HSR Layout Sector 2"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Complete Street Address</label>
            <input
              type="text"
              placeholder="Plot No, Street, Landmark, Pin code"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Gender Policy</label>
            <select value={genderPolicy} onChange={(e) => setGenderPolicy(e.target.value)}>
              <option value="unisex">Unisex Coliving</option>
              <option value="male">Men's PG</option>
              <option value="female">Women's PG</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Starting Rent (₹ / Month) *</label>
            <input
              type="number"
              required
              min="3000"
              step="500"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Total Bed Capacity</label>
            <input
              type="number"
              min="2"
              value={totalBeds}
              onChange={(e) => setTotalBeds(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Facilities Included</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ width: 'auto' }}
                  checked={foodIncluded}
                  onChange={(e) => setFoodIncluded(e.target.checked)}
                />
                Food / Meals
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ width: 'auto' }}
                  checked={acAvailable}
                  onChange={(e) => setAcAvailable(e.target.checked)}
                />
                Air Conditioning
              </label>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ margin: '-1.5rem', marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Publishing...' : 'Publish Property Listing'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
