import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Users, Building, AlertTriangle, Activity,
  CheckCircle, Filter, Search, Eye, FileText, Clock, RefreshCw, Send
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  fetchAdminStatsApi,
  fetchAdminUsersApi,
  moderatePropertyApi,
  fetchJoinRequestsApi,
  fetchComplaintsApi,
  updateComplaintApi,
  fetchPaymentsApi
} from '../services/api';

export const AdminDashboard = ({ properties = [], onPropertyModerated }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  // Operational metrics
  const [stats, setStats] = useState(null);

  // User Directory (Tenants & PG Owners only)
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Operational data
  const [joinRequests, setJoinRequests] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [payments, setPayments] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, reqsData, complaintsData, paymentsData] = await Promise.all([
        fetchAdminStatsApi().catch(() => null),
        fetchAdminUsersApi().catch(() => []),
        fetchJoinRequestsApi().catch(() => []),
        fetchComplaintsApi().catch(() => []),
        fetchPaymentsApi().catch(() => []),
      ]);
      setStats(statsData);
      setUsersList(usersData || []);
      setJoinRequests(reqsData || []);
      setComplaints(complaintsData || []);
      setPayments(paymentsData || []);
    } catch (err) {
      console.warn('Admin dashboard load notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Moderation handler
  const handleToggleVerifyProperty = async (property) => {
    const nextVerified = !property.verified;
    try {
      await moderatePropertyApi(property.id, { verified: nextVerified });
      showToast(`Property '${property.name}' ${nextVerified ? 'verified' : 'unverified'}`, 'success');
      if (onPropertyModerated) {
        onPropertyModerated(property.id, { verified: nextVerified });
      }
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Complaint escalation / coordination handler
  const handleEscalateComplaint = async (complaintId) => {
    try {
      await updateComplaintApi(complaintId, {
        priority: 'urgent',
        resolution_notes: 'Escalated to Super Administrator for priority intervention.'
      });
      showToast('Complaint marked as URGENT and escalated to Super Administrator.', 'success');
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Filtered users (Tenants & Owners)
  const filteredUsers = usersList.filter((u) => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesSearch =
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      String(u.id).includes(userSearch);
    return matchesRole && matchesSearch;
  });

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar-header">
          <div className="user-badge-role">
            <div className="user-avatar" style={{ background: 'linear-gradient(135deg, #4338ca, #312e81)' }}>
              <ShieldCheck size={22} color="white" />
            </div>
            <div className="user-info-text">
              <h4>{currentUser?.name || 'Administrator'}</h4>
              <span style={{ color: '#a5b4fc', fontWeight: 600 }}>Moderation Authority</span>
            </div>
          </div>
        </div>

        <ul className="sidebar-nav">
          <li
            className={`sidebar-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Activity size={18} /> Operations Overview
          </li>
          <li
            className={`sidebar-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} /> Tenants & PG Owners
            <span className="badge-count">{usersList.length}</span>
          </li>
          <li
            className={`sidebar-nav-item ${activeTab === 'listings' ? 'active' : ''}`}
            onClick={() => setActiveTab('listings')}
          >
            <Building size={18} /> Listing Moderation
            <span className="badge-count">{properties.length}</span>
          </li>
          <li
            className={`sidebar-nav-item ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <Clock size={18} /> Join Requests
            <span className="badge-count">{joinRequests.length}</span>
          </li>
          <li
            className={`sidebar-nav-item ${activeTab === 'complaints' ? 'active' : ''}`}
            onClick={() => setActiveTab('complaints')}
          >
            <AlertTriangle size={18} /> Maintenance Tickets
            <span className="badge-count">{complaints.length}</span>
          </li>
        </ul>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* TAB 1: OPERATIONS OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="dashboard-title-area">
                <h1>Platform Operations & Moderation</h1>
                <p>Monitor community activity, quality standards, and operational escalations.</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={loadData}>
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon indigo"><Users size={24} /></div>
                <div className="stat-details">
                  <h4>Managed Residents</h4>
                  <div className="stat-number">{stats?.users?.tenants ?? 0} Tenants</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon emerald"><Building size={24} /></div>
                <div className="stat-details">
                  <h4>PG Properties</h4>
                  <div className="stat-number">{properties.length} Active</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon amber"><Clock size={24} /></div>
                <div className="stat-details">
                  <h4>Pending Requests</h4>
                  <div className="stat-number">{stats?.requests?.pending ?? joinRequests.filter(r => r.status === 'pending').length}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon rose"><AlertTriangle size={24} /></div>
                <div className="stat-details">
                  <h4>Open Tickets</h4>
                  <div className="stat-number">{stats?.complaints?.open ?? complaints.filter(c => c.status !== 'resolved').length}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Operational Authority Scope</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--slate-600)', lineHeight: '1.5' }}>
                  As an <strong>Administrator</strong>, you have moderation privileges to audit PG listings,
                  inspect tenant applications, and coordinate resolution of resident complaints.
                  Privileged account creation and role changes are restricted to <strong>Super Admin</strong>.
                </p>
              </div>

              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Financial Invoicing Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span>Total Invoices Generated:</span>
                    <strong>{payments.length}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                    <span>Paid Transactions Verified:</span>
                    <strong style={{ color: 'var(--emerald-600)' }}>
                      {payments.filter(p => p.status === 'paid').length}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TENANTS & OWNERS DIRECTORY */}
        {activeTab === 'users' && (
          <div>
            <div className="dashboard-header">
              <div className="dashboard-title-area">
                <h1>Tenants & PG Owners Directory</h1>
                <p>Inspect registered community members, KYC status, and contact details.</p>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--slate-400)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '32px' }}
                  placeholder="Search resident or owner name, email, ID..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={16} color="var(--slate-500)" />
                <select
                  className="form-input"
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  style={{ width: '160px' }}
                >
                  <option value="all">All Community Roles</option>
                  <option value="tenant">Tenants Only</option>
                  <option value="owner">PG Owners Only</option>
                </select>
              </div>
            </div>

            <div className="table-card">
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Full Name</th>
                      <th>Email Address</th>
                      <th>Account Role</th>
                      <th>KYC Status</th>
                      <th>Account Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-400)' }}>
                          No matching tenant or owner records found.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id}>
                          <td><strong>#USR-{u.id}</strong></td>
                          <td>{u.name}</td>
                          <td style={{ color: 'var(--slate-500)' }}>{u.email}</td>
                          <td><Badge status={u.role} text={u.role.toUpperCase()} /></td>
                          <td><Badge status={u.kyc_status || 'verified'} text={(u.kyc_status || 'verified').toUpperCase()} /></td>
                          <td><Badge status={u.status} /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LISTINGS MODERATION */}
        {activeTab === 'listings' && (
          <div>
            <div className="dashboard-header">
              <div className="dashboard-title-area">
                <h1>Property Listings Moderation</h1>
                <p>Audit accommodations for safety compliance and grant or revoke verified badges.</p>
              </div>
            </div>

            <div className="table-card">
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Property Name</th>
                      <th>Location</th>
                      <th>Capacity</th>
                      <th>Starting Rent</th>
                      <th>Verification Status</th>
                      <th style={{ textAlign: 'right' }}>Moderation Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((p) => (
                      <tr key={p.id}>
                        <td><strong>{p.name}</strong></td>
                        <td>{p.locality}, {p.city}</td>
                        <td>{p.totalBeds} Beds ({p.vacantBeds} Vacant)</td>
                        <td><strong>₹{p.startingPrice?.toLocaleString('en-IN')}</strong></td>
                        <td>
                          <Badge status={p.verified ? 'verified' : 'pending'} text={p.verified ? 'Verified' : 'Pending Audit'} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className={`btn ${p.verified ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                            onClick={() => handleToggleVerifyProperty(p)}
                          >
                            {p.verified ? 'Revoke Badge' : 'Grant Verified Badge'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: JOIN REQUESTS OVERSIGHT */}
        {activeTab === 'requests' && (
          <div>
            <div className="dashboard-header">
              <div className="dashboard-title-area">
                <h1>Tenant Applications & Join Requests</h1>
                <p>Inspect tenant booking submissions across all managed properties.</p>
              </div>
            </div>

            <div className="table-card">
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Req ID</th>
                      <th>Applicant Name</th>
                      <th>Property Target</th>
                      <th>Move-in Date</th>
                      <th>Room Preference</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {joinRequests.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-400)' }}>
                          No join requests registered on the platform.
                        </td>
                      </tr>
                    ) : (
                      joinRequests.map((r) => (
                        <tr key={r.id}>
                          <td><strong>#REQ-{r.id}</strong></td>
                          <td>{r.tenant_name || `Tenant #${r.tenant_id}`}</td>
                          <td>{r.property_name || `Property #${r.property_id}`}</td>
                          <td>{r.move_in_date}</td>
                          <td>{r.room_type_preference || 'Standard'}</td>
                          <td><Badge status={r.status} /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: COMPLAINTS & ESCALATIONS */}
        {activeTab === 'complaints' && (
          <div>
            <div className="dashboard-header">
              <div className="dashboard-title-area">
                <h1>Maintenance & Support Oversight</h1>
                <p>Coordinate resolution of resident issues and escalate sensitive cases to Super Admin.</p>
              </div>
            </div>

            <div className="table-card">
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Ticket #</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Escalation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-400)' }}>
                          No active maintenance tickets reported.
                        </td>
                      </tr>
                    ) : (
                      complaints.map((c) => (
                        <tr key={c.id}>
                          <td><strong>{c.complaint_number || `#CMP-${c.id}`}</strong></td>
                          <td>{c.title}</td>
                          <td>{c.category}</td>
                          <td>
                            <Badge
                              status={c.priority === 'urgent' ? 'rejected' : c.priority === 'high' ? 'pending' : 'active'}
                              text={c.priority?.toUpperCase()}
                            />
                          </td>
                          <td><Badge status={c.status} /></td>
                          <td style={{ textAlign: 'right' }}>
                            {c.priority !== 'urgent' ? (
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleEscalateComplaint(c.id)}
                              >
                                <Send size={13} /> Escalate to Super Admin
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: 'var(--coral-600)', fontWeight: 600 }}>
                                Escalated (Urgent)
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
