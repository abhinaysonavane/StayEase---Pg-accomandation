import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { AlertCircle } from 'lucide-react';

export const ComplaintModal = ({ isOpen, onClose, onComplaintCreated, roomNumber = '204' }) => {
  const { showToast } = useToast();
  const [category, setCategory] = useState('plumbing');
  const [priority, setPriority] = useState('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Please provide a title and detailed description', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newTicket = {
        id: `CMP-${Math.floor(100 + Math.random() * 900)}`,
        tenantId: 1,
        tenantName: 'Rohan Sharma',
        roomNumber,
        category,
        title,
        description,
        priority,
        status: 'open',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        ownerRemark: 'Ticket logged. Awaiting technician assignment.'
      };

      onComplaintCreated(newTicket);
      setIsSubmitting(false);
      showToast(`Complaint #${newTicket.id} registered! The property manager has been notified.`, 'success');
      onClose();
      setTitle('');
      setDescription('');
    }, 500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Raise Maintenance / Service Request">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Category *</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="plumbing">Plumbing (Tap, geyser, leakage, drain)</option>
            <option value="electrical">Electrical (Light, switch, fan, AC, power)</option>
            <option value="wifi">Internet & Wi-Fi issues</option>
            <option value="food">Food Quality / Mess feedback</option>
            <option value="housekeeping">Housekeeping & Room Cleaning</option>
            <option value="security">Security & Biometrics</option>
            <option value="other">General / Other Issue</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Priority Level *</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            {['low', 'medium', 'high', 'urgent'].map((p) => (
              <button
                key={p}
                type="button"
                className={`btn btn-secondary ${priority === p ? 'active' : ''}`}
                style={{
                  fontSize: '0.8rem',
                  textTransform: 'capitalize',
                  padding: '0.5rem 0.2rem',
                  borderColor: priority === p ? 'var(--primary-500)' : 'var(--slate-200)',
                  background: priority === p ? 'var(--primary-50)' : 'white',
                  color: priority === p ? 'var(--primary-700)' : 'var(--slate-700)',
                }}
                onClick={() => setPriority(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Issue Title *</label>
          <input
            type="text"
            required
            placeholder="e.g. Geyser water not heating properly"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Detailed Description *</label>
          <textarea
            rows={4}
            required
            placeholder="Describe the exact issue, location in the room, and when it started..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="modal-footer" style={{ margin: '-1.5rem', marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Register Complaint'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
