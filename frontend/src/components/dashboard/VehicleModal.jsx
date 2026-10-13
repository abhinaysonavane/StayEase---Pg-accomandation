import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { Bike, Car, Shield } from 'lucide-react';

export const VehicleModal = ({ isOpen, onClose, onVehicleAdded }) => {
  const { showToast } = useToast();
  const [vehicleType, setVehicleType] = useState('two_wheeler');
  const [vehicleMake, setVehicleMake] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!vehicleMake.trim() || !plateNumber.trim()) {
      showToast('Please provide both the vehicle make/model and registration plate number', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newVehicle = {
        id: Date.now(),
        tenantId: 1,
        propertyId: 1,
        vehicleType,
        vehicleMake: vehicleMake.trim(),
        plateNumber: plateNumber.toUpperCase().trim(),
        parkingSlot: vehicleType === 'two_wheeler' ? `B-${Math.floor(10 + Math.random() * 80)}` : `C-${Math.floor(1 + Math.random() * 20)}`,
        passNumber: `PASS-${vehicleType === 'two_wheeler' ? '2W' : '4W'}-${Math.floor(100 + Math.random() * 900)}`,
        registrationDate: new Date().toISOString().split('T')[0],
        status: 'active'
      };

      onVehicleAdded(newVehicle);
      setIsSubmitting(false);
      showToast(`Vehicle ${newVehicle.plateNumber} registered! Parking Slot ${newVehicle.parkingSlot} allocated.`, 'success');
      onClose();
      setVehicleMake('');
      setPlateNumber('');
    }, 500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register Vehicle for Parking Pass">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Vehicle Type *</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              type="button"
              className={`btn btn-secondary ${vehicleType === 'two_wheeler' ? 'active' : ''}`}
              style={{
                borderColor: vehicleType === 'two_wheeler' ? 'var(--primary-500)' : 'var(--slate-200)',
                background: vehicleType === 'two_wheeler' ? 'var(--primary-50)' : 'white',
                color: vehicleType === 'two_wheeler' ? 'var(--primary-700)' : 'var(--slate-700)',
                padding: '0.75rem',
              }}
              onClick={() => setVehicleType('two_wheeler')}
            >
              <Bike size={18} /> Two-Wheeler (Bike/Scooter)
            </button>
            <button
              type="button"
              className={`btn btn-secondary ${vehicleType === 'four_wheeler' ? 'active' : ''}`}
              style={{
                borderColor: vehicleType === 'four_wheeler' ? 'var(--primary-500)' : 'var(--slate-200)',
                background: vehicleType === 'four_wheeler' ? 'var(--primary-50)' : 'white',
                color: vehicleType === 'four_wheeler' ? 'var(--primary-700)' : 'var(--slate-700)',
                padding: '0.75rem',
              }}
              onClick={() => setVehicleType('four_wheeler')}
            >
              <Car size={18} /> Four-Wheeler (Car)
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Make & Model *</label>
          <input
            type="text"
            required
            placeholder="e.g. Royal Enfield Hunter 350 or Hyundai i20"
            value={vehicleMake}
            onChange={(e) => setVehicleMake(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Registration Number Plate *</label>
          <input
            type="text"
            required
            placeholder="e.g. KA-01-MJ-4029 or MH-12-AB-1234"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
            style={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}
          />
          <span className="form-hint">Used by security guards and automated plate scanning</span>
        </div>

        <div style={{ background: 'var(--slate-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.775rem', color: 'var(--slate-500)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Shield size={16} color="var(--primary-600)" />
          <span>Vehicle registration grants RFID/Biometric access to the property parking lot.</span>
        </div>

        <div className="modal-footer" style={{ margin: '-1.5rem', marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register & Generate Pass'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
