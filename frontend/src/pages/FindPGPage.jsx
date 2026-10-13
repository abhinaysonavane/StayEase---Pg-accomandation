import React, { useState, useMemo } from 'react';
import { Search, MapPin, Filter, RotateCcw, Bed, SlidersHorizontal } from 'lucide-react';
import { PropertyCard } from '../components/property/PropertyCard';

export const FindPGPage = ({ properties, initialCity = '', initialKeyword = '', onSelectProperty, onBookDirect }) => {
  const [city, setCity] = useState(initialCity);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [maxRent, setMaxRent] = useState(20000);
  const [minRent, setMinRent] = useState(5000);
  const [roomSharing, setRoomSharing] = useState('all'); // all, single, double, triple
  const [foodType, setFoodType] = useState('all'); // all, veg_only, veg_and_non_veg
  const [acRequired, setAcRequired] = useState(false);
  const [genderPolicy, setGenderPolicy] = useState('all'); // all, unisex, male, female
  const [onlyVacant, setOnlyVacant] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('featured'); // featured, price_asc, price_desc, rating_desc

  const allAmenitiesList = [
    'High-Speed Wi-Fi',
    '24x7 Power Backup',
    'Daily Housekeeping',
    'Biometric Door Lock',
    'CCTV Security',
    'Fitness Gym',
    'Fully Automatic Laundry',
    'RO Drinking Water',
  ];

  const handleAmenityToggle = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleResetFilters = () => {
    setCity('');
    setKeyword('');
    setMaxRent(20000);
    setMinRent(5000);
    setRoomSharing('all');
    setFoodType('all');
    setAcRequired(false);
    setGenderPolicy('all');
    setOnlyVacant(false);
    setSelectedAmenities([]);
    setSortBy('featured');
  };

  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      // City check
      if (city && prop.city.toLowerCase() !== city.toLowerCase()) return false;

      // Keyword check
      if (keyword) {
        const query = keyword.toLowerCase();
        const matchesName = prop.name.toLowerCase().includes(query);
        const matchesLocality = prop.locality.toLowerCase().includes(query);
        const matchesAddress = prop.address.toLowerCase().includes(query);
        const matchesAmenities = prop.amenities.some((a) => a.toLowerCase().includes(query));
        if (!matchesName && !matchesLocality && !matchesAddress && !matchesAmenities) return false;
      }

      // Rent range check
      if (prop.startingPrice < minRent || prop.startingPrice > maxRent) return false;

      // Room sharing check
      if (roomSharing !== 'all' && !prop.roomTypes.includes(roomSharing)) return false;

      // Food type check
      if (foodType === 'veg_only' && prop.foodType !== 'veg_only') return false;
      if (foodType === 'veg_and_non_veg' && !prop.foodIncluded) return false;

      // AC check
      if (acRequired && !prop.acAvailable) return false;

      // Gender policy check
      if (genderPolicy !== 'all' && prop.genderPolicy !== genderPolicy) return false;

      // Availability check
      if (onlyVacant && prop.vacantBeds <= 0) return false;

      // Selected amenities check
      if (selectedAmenities.length > 0) {
        const hasAll = selectedAmenities.every((selected) =>
          prop.amenities.some((a) => a.toLowerCase().includes(selected.toLowerCase()))
        );
        if (!hasAll) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.startingPrice - b.startingPrice;
      if (sortBy === 'price_desc') return b.startingPrice - a.startingPrice;
      if (sortBy === 'rating_desc') return b.rating - a.rating;
      return 0;
    });
  }, [properties, city, keyword, minRent, maxRent, roomSharing, foodType, acRequired, genderPolicy, onlyVacant, selectedAmenities, sortBy]);

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.1rem', marginBottom: '0.35rem' }}>Explore Verified PG Accommodations</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Browse through verified hostels, PGs, and premium coliving spaces across premier Indian IT hubs.
          </p>
        </div>

        {/* Search & Filter Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', alignItems: 'flex-start' }}>
          {/* Filters Sidebar */}
          <aside className="card" style={{ padding: '1.5rem', position: 'sticky', top: '90px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '1rem' }}>
                <Filter size={18} color="var(--primary-600)" /> Filter Options
              </div>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', border: 'none' }}
                onClick={handleResetFilters}
              >
                <RotateCcw size={12} style={{ display: 'inline', marginRight: 3 }} /> Reset
              </button>
            </div>

            {/* City Filter */}
            <div className="form-group">
              <label className="form-label">City</label>
              <select value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">All Cities</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Pune">Pune</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Gurgaon">Gurgaon</option>
                <option value="Chennai">Chennai</option>
                <option value="Noida">Noida</option>
              </select>
            </div>

            {/* Keyword Search */}
            <div className="form-group">
              <label className="form-label">Keyword / Area</label>
              <input
                type="text"
                placeholder="e.g. Koramangala, Gym, WiFi"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            {/* Price Slider */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Max Monthly Rent</label>
                <span style={{ fontWeight: 700, color: 'var(--primary-700)', fontSize: '0.875rem' }}>
                  ₹{maxRent.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="25000"
                step="1000"
                value={maxRent}
                onChange={(e) => setMaxRent(Number(e.target.value))}
                style={{ accentColor: 'var(--primary-600)', padding: 0 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                <span>₹5,000</span>
                <span>₹25,000+</span>
              </div>
            </div>

            {/* Sharing Type */}
            <div className="form-group">
              <label className="form-label">Room Sharing</label>
              <select value={roomSharing} onChange={(e) => setRoomSharing(e.target.value)}>
                <option value="all">Any Sharing</option>
                <option value="single">Single Private Room</option>
                <option value="double">Double Sharing</option>
                <option value="triple">Triple Sharing</option>
              </select>
            </div>

            {/* Gender Policy */}
            <div className="form-group">
              <label className="form-label">Occupant Gender</label>
              <select value={genderPolicy} onChange={(e) => setGenderPolicy(e.target.value)}>
                <option value="all">All / Any Gender</option>
                <option value="unisex">Unisex Coliving</option>
                <option value="male">Men's PG Only</option>
                <option value="female">Women's PG Only</option>
              </select>
            </div>

            {/* Food Filter */}
            <div className="form-group">
              <label className="form-label">Food & Meals</label>
              <select value={foodType} onChange={(e) => setFoodType(e.target.value)}>
                <option value="all">All Food Options</option>
                <option value="veg_only">Strictly Pure Veg</option>
                <option value="veg_and_non_veg">Food Included (Veg & Non-Veg)</option>
              </select>
            </div>

            {/* Toggles: AC & Vacancy */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  style={{ width: 'auto' }}
                  checked={acRequired}
                  onChange={(e) => setAcRequired(e.target.checked)}
                />
                Air Conditioned (AC) Only
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  style={{ width: 'auto' }}
                  checked={onlyVacant}
                  onChange={(e) => setOnlyVacant(e.target.checked)}
                />
                Vacant Beds Available Now
              </label>
            </div>

            {/* Amenities Multi-select */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '0.75rem' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>Specific Amenities</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {allAmenitiesList.map((amenity) => (
                  <label key={amenity} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: 'var(--slate-600)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      style={{ width: 'auto' }}
                      checked={selectedAmenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                    />
                    {amenity}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Listings Results Area */}
          <main>
            {/* Top Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                  Showing {filteredProperties.length} Properties
                </span>
                {city && <span style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}> in {city}</span>}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)', whiteSpace: 'nowrap' }}>Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ width: 'auto', padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                >
                  <option value="featured">Featured / Recommended</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Listings Grid */}
            {filteredProperties.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.5rem' }}>
                {filteredProperties.map((prop) => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    onSelectProperty={onSelectProperty}
                    onBookDirect={onBookDirect}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Bed className="empty-state-icon" />
                <h3>No Properties Match Your Search</h3>
                <p>
                  Try widening your price range or clearing specific amenity filters to find available PGs.
                </p>
                <button className="btn btn-primary btn-sm" onClick={handleResetFilters}>
                  <RotateCcw size={15} /> Reset All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
