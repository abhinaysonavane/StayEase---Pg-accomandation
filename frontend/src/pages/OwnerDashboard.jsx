import React, { useState } from 'react';
import {
  Building, Bed, Users, CreditCard, AlertTriangle, Plus, CheckCircle, XCircle,
  Clock, Check, MapPin, DollarSign, Filter, Search, ShieldCheck
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AddPropertyModal } from '../components/dashboard/AddPropertyModal';

export const OwnerDashboard = ({
  properties,
  roomsAndBeds,
  joinRequests,
  payments,
  complaints,
  onPropertyAdded,
  onApproveRequest,
  onRejectRequest,
  onVerifyPayment,
  onResolveComplaint,
  onToggleBedStatus
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);

  // Stats calculation
  const totalBeds = properties.reduce((acc, p) => acc + p.totalBeds, 0);
  const totalVacant = properties.reduce((acc, p) => acc + p.vacantBeds, 0);
  const totalOccupied = totalBeds - totalVacant;
  const occupancyPercent = totalBeds > 0 ? Math.round((totalOccupied / totalBeds) * 100) : 0;
  const pendingRequestsCount = joinRequests.filter((r) => r.status === 'pending').length;
  const openComplaintsCount = complaints.filter((c) => c.status !== 'resolved').length;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar-header">
          <div className="user-badge-role">
            <div className="user-avatar" style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)' }}>
              {currentUser?.avatar || 'RV'}
            </div>
            <div className="user-info-text">
              <h4>{currentUser?.name || 'Rajesh Verma'}</h4>
              <span>PG Owner Console</span>
            </div>
          </div>
        </div>

        <ul className="sidebar-nav">
          <li
            className={`sidebar-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Building size={18} /> Overview & KPIs
          </li>
          <li
            className={`sidebar-nav-item ${activeTab === 'properties' ? 'active' : ''}`}
            onClick={() => setActiveTab('properties')}
          >
            <Building size={18} /> Manage Properties
            <span className="badge-count">{properties.length}</span>
          </li>
          <li
            className={`sidebar-nav-item ${activeTab === 'rooms-beds' ? 'active' : ''}`}
            onClick={() => setActiveTab('rooms-beds')}
          >
            <Bed size={18} /> Rooms & Beds Matrix
          </li>
          <li
            className={`sidebar-nav-item ${activeTab === 'tenants-requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('tenants-requests')}
          >
            <Users size={18} /> Tenants & Join Requests
            {pendingRequestsCount > 0 && <span className="badge-count">{pendingRequestsCount}</span>}
          </li>
          <li
            className={`sidebar-nav-item ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <CreditCard size={18} /> Rent Collections
          </li>
          <li
            className={`sidebar-nav-item ${activeTab === 'complaints' ? 'active' : ''}`}
            onClick={() => setActiveTab('complaints')}
          >
            <AlertTriangle size={18} /> Complaint Tickets
            {openComplaintsCount > 0 && <span className="badge-count">{openComplaintsCount}</span>}
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* TAB 1: OVERVIEW & KPIS */}
        {activeTab === 'overview' && (
          <div>
            <div className="dashboard-header">
              <div className="dashboard-title-area">
                <h1>Property Portfolio Executive Summary</h1>
                <p>Real-time occupancy metrics, collection totals, and pending operational requests.</p>
              </div>
              <button className="btn btn-primary" onClick={() => setIsAddPropertyModalOpen(true)}>
                <Plus size={16} /> Add Property
              </button>
            </div>

            {/* Metrics cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon emerald"><Users size={24} /></div>
                <div className="stat-details">
                  <h4>Occupancy Rate</h4>
                  <div className="stat-number">{occupancyPercent}%</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon indigo"><Bed size={24} /></div>
                <div className="stat-details">
                  <h4>Total Beds (Occupied / Cap)</h4>
                  <div className="stat-number">{totalOccupied} / {totalBeds}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon amber"><Clock size={24} /></div>
                <div className="stat-details">
                  <h4>Pending Join Requests</h4>
                  <div className="stat-number">{pendingRequestsCount}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon rose"><AlertTriangle size={24} /></div>
                <div className="stat-details">
                  <h4>Open Complaints</h4>
                  <div className="stat-number">{openComplaintsCount}</div>
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Queue */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              {/* Pending Join Requests Quick Panel */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.15rem' }}>Pending Tenant Applications</h3>
                  <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('tenants-requests')}>
                    View All
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {joinRequests.filter((r) => r.status === 'pending').map((req) => (
                    <div
                      key={req.id}
                      style={{
                        padding: '1rem',
                        background: 'var(--slate-50)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-light)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--slate-900)' }}>{req.tenantName}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                          Prefers: {req.roomTypePreference.toUpperCase()} • Move-in: {req.moveInDate}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => {
                            onApproveRequest(req.id);
                            showToast(`Approved applicant ${req.tenantName}!`, 'success');
                          }}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            onRejectRequest(req.id);
                            showToast(`Declined request #${req.id}`, 'info');
                          }}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                  {pendingRequestsCount === 0 && (
                    <div style={{ color: 'var(--slate-400)', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0' }}>
                      No pending tenant applications right now.
                    </div>
                  )}
                </div>
              </div>

              {/* Maintenance tickets needing attention */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.15rem' }}>Open Complaint Tickets</h3>
                  <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('complaints')}>
                    View All
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {complaints.filter((c) => c.status !== 'resolved').map((c) => (
                    <div
                      key={c.id}
                      style={{
                        padding: '0.85rem 1rem',
                        background: 'var(--slate-50)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-light)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <strong style={{ fontSize: '0.9rem' }}>{c.title}</strong>
                        <Badge status={c.status} />
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginBottom: '0.5rem' }}>
                        {c.description}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                          Ticket {c.id} • Room {c.roomNumber}
                        </span>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={() => {
                            onResolveComplaint(c.id);
                            showToast(`Ticket ${c.id} marked as resolved!`, 'success');
                          }}
                        >
                          Mark Resolved
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE PROPERTIES */}
        {activeTab === 'properties' && (
          <div>
            <div className="dashboard-header">
              <div className="dashboard-title-area">
                <h1>My Listed Accommodations</h1>
                <p>View, update or expand your registered PG properties across cities.</p>
              </div>
              <button className="btn btn-primary" onClick={() => setIsAddPropertyModalOpen(true)}>
                <Plus size={16} /> Add New Property
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {properties.map((p) => (
                <div key={p.id} className="card" style={{ overflow: 'hidden' }}>
                  <div style={{ height: '160px', position: 'relative' }}>
                    <img src={p.coverImage} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span className="property-badge-gender" style={{ top: 8, left: 8 }}>
                      {p.genderPolicy.toUpperCase()}
                    </span>
                    <span className="property-badge-vacant" style={{ top: 8, right: 8 }}>
                      {p.vacantBeds} Beds Vacant
                    </span>
                  </div>

                  <div style={{ padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>{p.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--slate-500)', fontSize: '0.825rem', marginBottom: '1rem' }}>
                      <MapPin size={14} /> {p.locality}, {p.city}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: 'var(--slate-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.825rem' }}>
                      <div>
                        <span style={{ color: 'var(--slate-400)', display: 'block' }}>Capacity:</span>
                        <strong>{p.totalBeds} Total Beds</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--slate-400)', display: 'block' }}>Starting Rent:</span>
                        <strong style={{ color: 'var(--primary-700)' }}>₹{p.startingPrice.toLocaleString('en-IN')}/mo</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setActiveTab('rooms-beds')}>
                        Rooms & Beds
                      </button>
                      <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => setActiveTab('tenants-requests')}>
                        Tenants
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ROOMS & BEDS MATRIX */}
        {activeTab === 'rooms-beds' && (
          <div>
            <div className="dashboard-header">
              <div className="dashboard-title-area">
                <h1>Interactive Bed Inventory Visualizer</h1>
                <p>Click any bed to toggle occupancy or inspect assigned tenant profiles.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {roomsAndBeds.map((room) => {
                const vacantCount = room.beds.filter((b) => b.status === 'vacant').length;
                return (
                  <div key={room.roomId} className="room-card-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <strong style={{ fontSize: '1.1rem' }}>Room {room.roomNumber}</strong>
                      <span className={`badge ${vacantCount > 0 ? 'badge-success' : 'badge-neutral'}`}>
                        {vacantCount} Vacant
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginBottom: '0.85rem' }}>
                      Floor {room.floor} • {room.roomType.toUpperCase()} Sharing • {room.ac ? 'AC' : 'Non-AC'} • ₹{room.monthlyRent.toLocaleString('en-IN')}/mo
                    </div>

                    <div className="beds-layout">
                      {room.beds.map((bed) => (
                        <div
                          key={bed.id}
                          className={`bed-chip ${bed.status}`}
                          style={{ cursor: 'pointer' }}
                          title={`Click to toggle bed status (${bed.status})`}
                          onClick={() => {
                            onToggleBedStatus(room.roomId, bed.id);
                            showToast(`Toggled Bed ${bed.bedNumber} in Room ${room.roomNumber}`, 'info');
                          }}
                        >
                          <span style={{ fontWeight: 700 }}>Bed {bed.bedNumber}</span>
                          <span style={{ fontSize: '0.7rem', textTransform: 'capitalize' }}>
                            {bed.status}
                          </span>
                          {bed.tenantName && (
                            <span style={{ fontSize: '0.65rem', color: 'var(--primary-700)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {bed.tenantName}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: TENANTS & JOIN REQUESTS */}
        {activeTab === 'tenants-requests' && (
          <div>
            <div className="dashboard-header">
              <div className="dashboard-title-area">
                <h1>Tenant Applications & Roster</h1>
                <p>Approve incoming join requests and manage resident contact rosters.</p>
              </div>
            </div>

            {/* Applications Queue */}
            <div className="table-card" style={{ marginBottom: '2rem' }}>
              <div className="table-header-bar">
                <h3 style={{ fontSize: '1.1rem' }}>Incoming Join Requests Queue</h3>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Applicant Name</th>
                      <th>Contact</th>
                      <th>Room Preference</th>
                      <th>Move-in Date</th>
                      <th>Notes</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {joinRequests.map((req) => (
                      <tr key={req.id}>
                        <td><strong>{req.tenantName}</strong></td>
                        <td>
                          <div>{req.tenantPhone}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{req.tenantEmail}</div>
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>{req.roomTypePreference} Room</td>
                        <td>{req.moveInDate}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--slate-600)', maxWidth: '200px' }}>{req.notes}</td>
                        <td><Badge status={req.status} /></td>
                        <td style={{ textAlign: 'right' }}>
                          {req.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => {
                                  onApproveRequest(req.id);
                                  showToast(`Approved applicant ${req.tenantName}!`, 'success');
                                }}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                  onRejectRequest(req.id);
                                  showToast(`Declined request #${req.id}`, 'info');
                                }}
                              >
                                Decline
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Current Tenant Directory */}
            <div className="table-card">
              <div className="table-header-bar">
                <h3 style={{ fontSize: '1.1rem' }}>Active Resident Directory</h3>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Resident</th>
                      <th>Room & Bed</th>
                      <th>Phone Number</th>
                      <th>KYC Status</th>
                      <th>Rent Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Rohan Sharma</strong></td>
                      <td>Room 204 — Bed B</td>
                      <td>+91 98765 43210</td>
                      <td><Badge status="verified" text="Verified" /></td>
                      <td><Badge status="paid" text="Paid Oct" /></td>
                    </tr>
                    <tr>
                      <td><strong>Vikram Mehta</strong></td>
                      <td>Room 204 — Bed A</td>
                      <td>+91 98444 33003</td>
                      <td><Badge status="verified" text="Verified" /></td>
                      <td><Badge status="paid" text="Paid Oct" /></td>
                    </tr>
                    <tr>
                      <td><strong>Amitabh Sen</strong></td>
                      <td>Room 201 — Bed A</td>
                      <td>+91 98222 11001</td>
                      <td><Badge status="verified" text="Verified" /></td>
                      <td><Badge status="paid" text="Paid Oct" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PAYMENTS */}
        {activeTab === 'payments' && (
          <div>
            <div className="dashboard-header">
              <div className="dashboard-title-area">
                <h1>Rent Collections & Verification</h1>
                <p>Approve tenant payment submissions, verify bank references, and generate receipts.</p>
              </div>
            </div>

            <div className="table-card">
              <div className="table-header-bar">
                <h3 style={{ fontSize: '1.1rem' }}>Payment Transactions</h3>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Invoice ID</th>
                      <th>Tenant</th>
                      <th>Billing Month</th>
                      <th>Amount</th>
                      <th>Payment Channel</th>
                      <th>Transaction Reference</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Verification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td><strong>{p.id}</strong></td>
                        <td>{p.tenantName || 'Rohan Sharma'}</td>
                        <td>{p.month}</td>
                        <td><strong style={{ color: 'var(--primary-700)' }}>₹{p.amount.toLocaleString('en-IN')}</strong></td>
                        <td>{p.paymentMethod || 'Awaiting'}</td>
                        <td>
                          {p.transactionRef ? (
                            <code style={{ background: 'var(--slate-100)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                              {p.transactionRef}
                            </code>
                          ) : (
                            <span style={{ color: 'var(--slate-400)' }}>—</span>
                          )}
                        </td>
                        <td><Badge status={p.status} /></td>
                        <td style={{ textAlign: 'right' }}>
                          {p.status === 'under_review' && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => {
                                onVerifyPayment(p.id);
                                showToast(`Verified payment for invoice ${p.id}. Receipt issued!`, 'success');
                              }}
                            >
                              Verify & Issue Receipt
                            </button>
                          )}
                          {p.status === 'paid' && (
                            <span style={{ color: 'var(--success-solid)', fontWeight: 600, fontSize: '0.85rem' }}>
                              Verified
                            </span>
                          )}
                          {p.status === 'pending' && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                onVerifyPayment(p.id);
                                showToast(`Marked invoice ${p.id} as paid in cash.`, 'success');
                              }}
                            >
                              Mark Paid (Cash)
                            </button>
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

        {/* TAB 6: COMPLAINTS */}
        {activeTab === 'complaints' && (
          <div>
            <div className="dashboard-header">
              <div className="dashboard-title-area">
                <h1>Maintenance & Service Tickets</h1>
                <p>Assign technicians and update status on tenant-reported issues.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {complaints.map((c) => (
                <div key={c.id} className="card" style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '1.05rem' }}>{c.title}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                        Reported by {c.tenantName} • Room {c.roomNumber} • Category: {c.category.toUpperCase()} • Priority: {c.priority}
                      </div>
                    </div>
                    <Badge status={c.status} />
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', margin: '0.5rem 0 1rem' }}>
                    {c.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--slate-50)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.825rem' }}>
                      <strong style={{ color: 'var(--slate-700)' }}>Current Remark: </strong>
                      <span style={{ color: 'var(--slate-600)' }}>{c.ownerRemark}</span>
                    </div>

                    {c.status !== 'resolved' ? (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => {
                          onResolveComplaint(c.id);
                          showToast(`Ticket ${c.id} marked as resolved!`, 'success');
                        }}
                      >
                        Mark Resolved
                      </button>
                    ) : (
                      <span style={{ color: 'var(--success-solid)', fontWeight: 600, fontSize: '0.85rem' }}>
                        Issue Resolved
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <AddPropertyModal
        isOpen={isAddPropertyModalOpen}
        onClose={() => setIsAddPropertyModalOpen(false)}
        onPropertyAdded={onPropertyAdded}
      />
    </div>
  );
};
