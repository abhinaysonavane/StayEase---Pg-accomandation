import React, { useState } from 'react';
import {
  Home, FileText, CreditCard, Car, AlertTriangle, Bell, User,
  Calendar, Key, Wifi, ShieldCheck, Plus, CheckCircle, Clock, Printer, ChevronRight
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { ReceiptModal } from '../components/dashboard/ReceiptModal';
import { PayRentModal } from '../components/dashboard/PayRentModal';
import { ComplaintModal } from '../components/dashboard/ComplaintModal';
import { VehicleModal } from '../components/dashboard/VehicleModal';

export const TenantDashboard = ({
  stay,
  joinRequests,
  payments,
  vehicles,
  complaints,
  notifications,
  onPaymentSubmitted,
  onComplaintCreated,
  onVehicleAdded
}) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('my-stay');

  // Modals state
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

  // Complaints filter
  const [complaintStatusFilter, setComplaintStatusFilter] = useState('all');

  const filteredComplaints = complaints.filter((c) => {
    if (complaintStatusFilter === 'all') return true;
    return c.status === complaintStatusFilter;
  });

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar-header">
          <div className="user-badge-role">
            <div className="user-avatar">{currentUser?.avatar || 'RS'}</div>
            <div className="user-info-text">
              <h4>{currentUser?.name || 'Rohan Sharma'}</h4>
              <span>Tenant Portal</span>
            </div>
          </div>
        </div>

        <ul className="sidebar-nav">
          <li
            className={`sidebar-nav-item ${activeTab === 'my-stay' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-stay')}
          >
            <Home size={18} /> My Stay
          </li>
          <li
            className={`sidebar-nav-item ${activeTab === 'my-requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-requests')}
          >
            <FileText size={18} /> My Requests
            <span className="badge-count">{joinRequests.length}</span>
          </li>
          <li
            className={`sidebar-nav-item ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <CreditCard size={18} /> Payments & Receipts
          </li>
          <li
            className={`sidebar-nav-item ${activeTab === 'vehicles' ? 'active' : ''}`}
            onClick={() => setActiveTab('vehicles')}
          >
            <Car size={18} /> My Vehicles
            <span className="badge-count">{vehicles.length}</span>
          </li>
          <li
            className={`sidebar-nav-item ${activeTab === 'complaints' ? 'active' : ''}`}
            onClick={() => setActiveTab('complaints')}
          >
            <AlertTriangle size={18} /> Complaints & Tickets
            <span className="badge-count">{complaints.filter((c) => c.status !== 'resolved').length}</span>
          </li>
          <li
            className={`sidebar-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={18} /> Notifications
            <span className="badge-count">{notifications.filter((n) => !n.read).length}</span>
          </li>
          <li
            className={`sidebar-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} /> Profile & Settings
          </li>
        </ul>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* TAB 1: MY STAY */}
        {activeTab === 'my-stay' && (
          <div>
            <div className="dashboard-header">
              <div className="dashboard-title-area">
                <h1>Active Accommodation Overview</h1>
                <p>Real-time details of your current residency, room allocation, and roommate directory.</p>
              </div>
            </div>

            {/* Hero Stay Card */}
            <div className="stay-hero-card">
              <div className="stay-hero-header">
                <div>
                  <span className="stay-badge">ACTIVE TENANCY</span>
                  <h2 style={{ color: 'white', fontSize: '1.85rem', margin: '0.6rem 0 0.2rem' }}>
                    {stay.propertyName}
                  </h2>
                  <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>{stay.propertyAddress}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Digital Gate Pass</span>
                  <strong style={{ fontSize: '1.2rem', color: '#38bdf8', letterSpacing: '1px' }}>{stay.gatePassId}</strong>
                </div>
              </div>

              <div className="stay-grid-specs">
                <div className="stay-spec-item">
                  <span>Room & Bed</span>
                  <strong>Room {stay.roomNumber} — Bed {stay.bedNumber}</strong>
                </div>
                <div className="stay-spec-item">
                  <span>Room Type</span>
                  <strong>{stay.roomType}</strong>
                </div>
                <div className="stay-spec-item">
                  <span>Monthly Rent</span>
                  <strong>₹{stay.monthlyRent.toLocaleString('en-IN')}</strong>
                </div>
                <div className="stay-spec-item">
                  <span>Next Due Date</span>
                  <strong>{stay.rentDueDate}</strong>
                </div>
                <div className="stay-spec-item">
                  <span>Security Deposit</span>
                  <strong>₹{stay.securityDeposit.toLocaleString('en-IN')} (Held)</strong>
                </div>
              </div>
            </div>

            {/* Room Utilities & Roommates Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              {/* Roommates Directory */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={18} color="var(--primary-600)" /> Roommates in Room {stay.roomNumber}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {stay.roommates.map((rm, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.85rem 1rem',
                        background: 'var(--slate-50)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-light)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: 'var(--primary-100)',
                            color: 'var(--primary-700)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                          }}
                        >
                          {rm.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.925rem', color: 'var(--slate-900)' }}>{rm.name}</strong>
                          <span style={{ fontSize: '0.775rem', color: 'var(--slate-500)', display: 'block' }}>
                            Bed {rm.bed} • {rm.occupation}
                          </span>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--slate-600)', background: 'white', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--slate-200)' }}>
                        Since Nov 2023
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wi-Fi & Quick Amenities Access */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Wifi size={18} color="var(--primary-600)" /> High-Speed Wi-Fi Access
                </h3>
                <div style={{ background: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                  <div style={{ marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textTransform: 'uppercase' }}>Network SSID</span>
                    <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--slate-800)' }}>
                      {stay.wifiDetails.ssid}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textTransform: 'uppercase' }}>Password</span>
                    <code style={{ display: 'block', fontSize: '0.95rem', color: 'var(--primary-700)', fontWeight: 700 }}>
                      {stay.wifiDetails.password}
                    </code>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setActiveTab('complaints')}>
                    Report Room Issue
                  </button>
                  <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => setActiveTab('payments')}>
                    View Invoices
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY REQUESTS */}
        {activeTab === 'my-requests' && (
          <div>
            <div className="dashboard-header">
              <div className="dashboard-title-area">
                <h1>My Accommodation Join Requests</h1>
                <p>Track the approval status of your PG booking and admission requests.</p>
              </div>
            </div>

            <div className="table-card">
              <div className="table-header-bar">
                <h3 style={{ fontSize: '1.1rem' }}>Submitted Applications</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>{joinRequests.length} Total Requests</span>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Property Name</th>
                      <th>Requested Sharing</th>
                      <th>Move-in Date</th>
                      <th>Submission Date</th>
                      <th>Status</th>
                      <th>Allocated Room / Bed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {joinRequests.map((req) => (
                      <tr key={req.id}>
                        <td><strong>#REQ-{req.id}</strong></td>
                        <td>{req.propertyName}</td>
                        <td style={{ textTransform: 'capitalize' }}>{req.roomTypePreference} Room</td>
                        <td>{req.moveInDate}</td>
                        <td style={{ color: 'var(--slate-400)' }}>{req.createdAt}</td>
                        <td><Badge status={req.status} /></td>
                        <td>
                          {req.allocatedRoom ? (
                            <span style={{ fontWeight: 600, color: 'var(--primary-700)' }}>
                              Room {req.allocatedRoom} (Bed {req.allocatedBed})
                            </span>
                          ) : (
                            <span style={{ color: 'var(--slate-400)', fontSize: '0.85rem' }}>Under Review</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENTS & RECEIPTS */}
        {activeTab === 'payments' && (
          <div>
            <div className="dashboard-header">
              <div className="dashboard-title-area">
                <h1>Rent Payments & Digital Receipts</h1>
                <p>View your billing history, record rent payments safely, and download tax receipts.</p>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon emerald"><CreditCard size={24} /></div>
                <div className="stat-details">
                  <h4>Total Paid (Year)</h4>
                  <div className="stat-number">₹25,000</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon amber"><Clock size={24} /></div>
                <div className="stat-details">
                  <h4>Upcoming Rent Due</h4>
                  <div className="stat-number">₹12,500</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon indigo"><ShieldCheck size={24} /></div>
                <div className="stat-details">
                  <h4>Security Deposit Held</h4>
                  <div className="stat-number">₹25,000</div>
                </div>
              </div>
            </div>

            <div className="table-card">
              <div className="table-header-bar">
                <h3 style={{ fontSize: '1.1rem' }}>Rent Invoices & Receipts</h3>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Invoice ID</th>
                      <th>Billing Month</th>
                      <th>Due Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Payment Method / Txn</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((inv) => (
                      <tr key={inv.id}>
                        <td><strong>{inv.id}</strong></td>
                        <td>{inv.month}</td>
                        <td>{inv.dueDate}</td>
                        <td><strong style={{ color: 'var(--primary-700)' }}>₹{inv.amount.toLocaleString('en-IN')}</strong></td>
                        <td><Badge status={inv.status} /></td>
                        <td>
                          {inv.paymentMethod ? (
                            <div>
                              <span>{inv.paymentMethod}</span>
                              <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{inv.transactionRef}</div>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--slate-400)', fontSize: '0.85rem' }}>Awaiting Payment</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {inv.status === 'paid' && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setSelectedInvoiceForReceipt(inv)}
                            >
                              <Printer size={14} /> Receipt
                            </button>
                          )}
                          {inv.status === 'pending' && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => setSelectedInvoiceForPayment(inv)}
                            >
                              <CreditCard size={14} /> Pay Rent
                            </button>
                          )}
                          {inv.status === 'under_review' && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--warning-text)', fontWeight: 600 }}>
                              Owner Verifying...
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MY VEHICLES */}
        {activeTab === 'vehicles' && (
          <div>
            <div className="dashboard-header">
              <div className="dashboard-title-area">
                <h1>Registered Vehicles & Parking Passes</h1>
                <p>Manage your assigned parking slots and digital property gate passes.</p>
              </div>
              <button className="btn btn-primary" onClick={() => setIsVehicleModalOpen(true)}>
                <Plus size={16} /> Register New Vehicle
              </button>
            </div>

            {vehicles.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {vehicles.map((v) => (
                  <div key={v.id} className="parking-pass">
                    <div className="parking-pass-header">
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          PARKING PERMIT
                        </span>
                        <div className="parking-slot-badge">SLOT {v.parkingSlot}</div>
                      </div>
                      <span className="badge badge-success">ACTIVE PASS</span>
                    </div>

                    <div style={{ borderTop: '1px solid #334155', paddingTop: '1rem', marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Vehicle:</span>
                        <strong>{v.vehicleMake}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>License Plate:</span>
                        <code style={{ background: '#334155', padding: '0.15rem 0.5rem', borderRadius: '4px', color: '#38bdf8' }}>
                          {v.plateNumber}
                        </code>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Pass ID:</span>
                        <span style={{ fontSize: '0.85rem' }}>{v.passNumber}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Car className="empty-state-icon" />
                <h3>No Vehicles Registered Yet</h3>
                <p>Register your two-wheeler or four-wheeler to obtain an automated parking slot.</p>
                <button className="btn btn-primary btn-sm" onClick={() => setIsVehicleModalOpen(true)}>
                  <Plus size={15} /> Register Vehicle
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: COMPLAINTS */}
        {activeTab === 'complaints' && (
          <div>
            <div className="dashboard-header">
              <div className="dashboard-title-area">
                <h1>Service Requests & Maintenance Tickets</h1>
                <p>Track reported issues, technician assignments, and repair resolutions.</p>
              </div>
              <button className="btn btn-primary" onClick={() => setIsComplaintModalOpen(true)}>
                <Plus size={16} /> Raise New Complaint
              </button>
            </div>

            {/* Filter pills */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {['all', 'open', 'in_progress', 'resolved'].map((st) => (
                <button
                  key={st}
                  className={`btn btn-secondary btn-sm ${complaintStatusFilter === st ? 'active' : ''}`}
                  style={{
                    textTransform: 'capitalize',
                    background: complaintStatusFilter === st ? 'var(--primary-50)' : 'white',
                    borderColor: complaintStatusFilter === st ? 'var(--primary-500)' : 'var(--slate-200)',
                    color: complaintStatusFilter === st ? 'var(--primary-700)' : 'var(--slate-700)',
                  }}
                  onClick={() => setComplaintStatusFilter(st)}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredComplaints.map((c) => (
                <div key={c.id} className="card" style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--slate-900)' }}>{c.title}</strong>
                      <span className="badge badge-neutral" style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                        {c.category}
                      </span>
                      <span
                        className="badge"
                        style={{
                          background: c.priority === 'urgent' ? 'var(--danger-bg)' : 'var(--slate-100)',
                          color: c.priority === 'urgent' ? 'var(--danger-solid)' : 'var(--slate-600)',
                          fontSize: '0.7rem'
                        }}
                      >
                        Priority: {c.priority}
                      </span>
                    </div>
                    <Badge status={c.status} />
                  </div>

                  <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                    {c.description}
                  </p>

                  <div style={{ background: 'var(--slate-50)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.825rem', borderLeft: '3px solid var(--primary-500)' }}>
                    <strong style={{ color: 'var(--slate-800)' }}>Owner / Technician Update: </strong>
                    <span style={{ color: 'var(--slate-600)' }}>{c.ownerRemark}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.775rem', color: 'var(--slate-400)' }}>
                    <span>Ticket #{c.id} • Room {c.roomNumber}</span>
                    <span>Reported: {c.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div>
            <div className="dashboard-header">
              <div className="dashboard-title-area">
                <h1>Tenant Alerts & Notices</h1>
                <p>Stay informed about building maintenance, rent reminders, and ticket updates.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="card"
                  style={{
                    padding: '1.25rem 1.5rem',
                    background: n.read ? 'white' : 'var(--slate-50)',
                    borderLeft: n.read ? '1px solid var(--border-light)' : '4px solid var(--primary-600)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                    <strong style={{ fontSize: '1rem', color: 'var(--slate-900)' }}>{n.title}</strong>
                    <span style={{ fontSize: '0.775rem', color: 'var(--slate-400)' }}>{n.time}</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)' }}>{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: PROFILE & SETTINGS */}
        {activeTab === 'profile' && (
          <div>
            <div className="dashboard-header">
              <div className="dashboard-title-area">
                <h1>Tenant Profile & KYC Verification</h1>
                <p>Your official records and emergency contact details stored with the PG management.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
              <div className="card" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>Personal Information</h3>

                <div className="form-group">
                  <label className="form-label">Full Legal Name</label>
                  <input type="text" disabled value={currentUser?.name || 'Rohan Sharma'} style={{ background: 'var(--slate-50)' }} />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" disabled value={currentUser?.email || 'rohan.sharma@example.com'} style={{ background: 'var(--slate-50)' }} />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Number</label>
                  <input type="tel" disabled value={currentUser?.phone || '+91 98765 43210'} style={{ background: 'var(--slate-50)' }} />
                </div>

                <div className="form-group">
                  <label className="form-label">Occupation / Employer</label>
                  <input type="text" disabled value={currentUser?.occupation || 'Software Engineer at TechCorp'} style={{ background: 'var(--slate-50)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Emergency Contact</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <div>
                      <span style={{ color: 'var(--slate-400)', fontSize: '0.75rem', display: 'block' }}>Name & Relation</span>
                      <strong>{currentUser?.emergencyContact?.name || 'Suresh Sharma (Father)'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--slate-400)', fontSize: '0.75rem', display: 'block' }}>Emergency Phone</span>
                      <strong>{currentUser?.emergencyContact?.phone || '+91 98765 43211'}</strong>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>KYC Verification Status</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <Badge status="verified" text="Aadhaar KYC Verified" />
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                    Your identity and police verification documents have been authenticated by the PG property manager.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <ReceiptModal
        isOpen={!!selectedInvoiceForReceipt}
        onClose={() => setSelectedInvoiceForReceipt(null)}
        invoice={selectedInvoiceForReceipt}
        stay={stay}
      />

      <PayRentModal
        isOpen={!!selectedInvoiceForPayment}
        onClose={() => setSelectedInvoiceForPayment(null)}
        invoice={selectedInvoiceForPayment}
        onPaymentSubmitted={onPaymentSubmitted}
      />

      <ComplaintModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        onComplaintCreated={onComplaintCreated}
        roomNumber={stay.roomNumber}
      />

      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        onVehicleAdded={onVehicleAdded}
      />
    </div>
  );
};
