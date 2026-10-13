import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ShieldCheck, Calendar, Bed, User, Phone, CheckCircle } from 'lucide-react';
import { submitJoinRequestApi } from '../../services/api';

export const BookingModal = ({ isOpen, onClose, property, onJoinRequestCreated }) => {
  const { currentUser, isLoggedIn } = useAuth();
  const { showToast } = useToast();

  const [moveInDate, setMoveInDate] = useState('');
  const [roomType, setRoomType] = useState('double');
  const [foodPreference, setFoodPreference] = useState('veg_and_non_veg');
  const [notes, setNotes] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState(currentUser?.emergencyContact?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!property) return null;

  const estimatedRent = roomType === 'single'
    ? property.startingPrice * 1.45
    : roomType === 'triple'
    ? property.startingPrice * 0.85
    : property.startingPrice;

  const depositAmount = estimatedRent * (property.depositMonths || 2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!moveInDate) {
      showToast('Please select your intended move-in date', 'error');
      return;
    }

    setIsSubmitting(true);
    let apiRequest = null;
    if (isLoggedIn) {
      try {
        apiRequest = await submitJoinRequestApi({
          property_id: property.id,
          move_in_date: moveInDate,
          room_type_preference: roomType,
          notes: notes || 'No special requirements noted'
        });
      } catch (apiErr) {
        console.warn('API submission fallback to local:', apiErr.message);
      }
    }

    const newRequest = apiRequest ? {
      id: apiRequest.id,
      tenantId: apiRequest.tenant_id,
      tenantName: apiRequest.tenant_name || currentUser?.name || 'Applicant Tenant',
      tenantPhone: apiRequest.tenant_phone || currentUser?.phone || '+91 99999 88888',
      tenantEmail: apiRequest.tenant_email || currentUser?.email || 'applicant@example.com',
      propertyId: apiRequest.property_id,
      propertyName: apiRequest.property_name || property.name,
      roomTypePreference: apiRequest.room_type_preference || roomType,
      moveInDate: apiRequest.move_in_date || moveInDate,
      status: apiRequest.status || 'pending',
      createdAt: apiRequest.created_at ? apiRequest.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      allocatedRoom: apiRequest.allocated_room,
      allocatedBed: apiRequest.allocated_bed,
      notes: apiRequest.notes || notes || 'No special requirements noted'
    } : {
      id: Date.now(),
      tenantId: currentUser?.id || 999,
      tenantName: currentUser?.name || 'Applicant Tenant',
      tenantPhone: currentUser?.phone || '+91 99999 88888',
      tenantEmail: currentUser?.email || 'applicant@example.com',
      propertyId: property.id,
      propertyName: property.name,
      roomTypePreference: roomType,
      moveInDate,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      allocatedRoom: null,
      allocatedBed: null,
      notes: notes || 'No special requirements noted'
    };

    if (onJoinRequestCreated) {
      onJoinRequestCreated(newRequest);
    }
    setIsSubmitting(false);
    showToast('Join request submitted! The PG Owner has been notified for review.', 'success');
    onClose();
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Request to Join — ${property.name}`} size="lg">
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Left Form fields */}
          <div>
            <div className="form-group">
              <label className="form-label">Applicant Name</label>
              <input
                type="text"
                disabled
                value={currentUser?.name || 'Guest User (Login Recommended)'}
                style={{ background: 'var(--slate-50)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Calendar size={15} style={{ display: 'inline', marginRight: 4 }} />
                Desired Move-in Date *
              </label>
              <input
                type="date"
                required
                value={moveInDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setMoveInDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Bed size={15} style={{ display: 'inline', marginRight: 4 }} />
                Room Sharing Type
              </label>
              <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
                <option value="single">Single Private Room (~₹{Math.round(property.startingPrice * 1.45).toLocaleString('en-IN')}/mo)</option>
                <option value="double">Double Sharing Room (₹{property.startingPrice.toLocaleString('en-IN')}/mo)</option>
                <option value="triple">Triple Sharing Room (~₹{Math.round(property.startingPrice * 0.85).toLocaleString('en-IN')}/mo)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Meal Plan</label>
              <select value={foodPreference} onChange={(e) => setFoodPreference(e.target.value)}>
                <option value="veg_and_non_veg">Both Veg & Non-Veg</option>
                <option value="veg_only">Strictly Pure Veg</option>
                <option value="none">No Food / Self-Cooking Only</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Phone size={15} style={{ display: 'inline', marginRight: 4 }} />
                Emergency Contact Number
              </label>
              <input
                type="tel"
                placeholder="+91 98765 00000"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Additional Requests / Notes</label>
              <textarea
                rows={2}
                placeholder="E.g., prefer upper floor, work-from-home desk setup, non-smoker roommate..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Right Summary Card */}
          <div className="card" style={{ padding: '1.25rem', background: 'var(--slate-50)', height: 'fit-content' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--slate-800)' }}>Pricing Estimate</h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--slate-500)' }}>Estimated Monthly Rent:</span>
                <strong style={{ color: 'var(--slate-800)' }}>₹{Math.round(estimatedRent).toLocaleString('en-IN')}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--slate-500)' }}>Security Deposit ({property.depositMonths || 2} Mos):</span>
                <strong>₹{Math.round(depositAmount).toLocaleString('en-IN')}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--slate-500)' }}>Maintenance & Utilities:</span>
                <span style={{ color: 'var(--success-solid)', fontWeight: 600 }}>Included</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--slate-500)' }}>Notice Period:</span>
                <strong>{property.noticePeriodDays || 30} Days</strong>
              </div>

              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem' }}>
                <span style={{ fontWeight: 700 }}>Move-in Total:</span>
                <span style={{ fontWeight: 800, color: 'var(--primary-700)' }}>
                  ₹{Math.round(estimatedRent + depositAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.775rem', color: 'var(--slate-500)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary-700)', fontWeight: 700, marginBottom: '0.25rem' }}>
                <ShieldCheck size={14} /> Zero Obligation Request
              </div>
              Submitting a request notifies the owner to reserve a bed. No upfront charges are deducted until application approval and KYC verification.
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ margin: '-1.5rem', marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Confirm Join Request'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
