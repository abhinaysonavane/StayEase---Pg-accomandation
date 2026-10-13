import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, ShieldCheck, Users, Building, AlertTriangle, Activity,
  CheckCircle, XCircle, Filter, Search, Ban, Eye, FileSpreadsheet,
  UserPlus, DollarSign, RefreshCw, KeyRound, Lock
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  fetchAdminStatsApi,
  fetchAdminUsersApi,
  createAdminUserApi,
  updateAdminUserRoleApi,
  updateAdminUserStatusApi,
  moderatePropertyApi,
  fetchAuditLogsApi
} from '../services/api';

export const SuperAdminDashboard = ({ properties = [], onPropertyModerated }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  // Platform KPIs
  const [stats, setStats] = useState(null);

  // User Management
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // New Admin Provisioning Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'admin',
  });
  const [creatingUser, setCreatingUser] = useState(false);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState([]);

  // Load live data
  const loadStats = async () => {
    try {
      const data = await fetchAdminStatsApi();
      setStats(data);
    } catch (err) {
      console.warn('Failed to load admin stats:', err.message);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await fetchAdminUsersApi();
      setUsersList(data);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const loadAuditLogs = async () => {
    try {
      const data = await fetchAuditLogsApi(100);
      setAuditLogs(data);
    } catch (err) {
      console.warn('Failed to load audit logs:', err.message);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadStats(), loadUsers(), loadAuditLogs()]).finally(() => {
      setLoading(false);
    });
  }, []);

  // Handlers
  const handleToggleUserStatus = async (user) => {
    if (user.id === currentUser?.id) {
      showToast('You cannot suspend your own Super Admin account.', 'error');
      return;
    }
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await updateAdminUserStatusApi(user.id, nextStatus);
      showToast(`User ${user.name} is now ${nextStatus.toUpperCase()}`, 'success');
      loadUsers();
      loadAuditLogs();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUser?.id) {
      showToast('Super Admins cannot modify their own role.', 'error');
      return;
    }
    try {
      await updateAdminUserRoleApi(userId, newRole);
      showToast('User role updated successfully.', 'success');
      loadUsers();
      loadAuditLogs();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.password) {
      showToast('Please fill all required fields.', 'error');
      return;
    }
    setCreatingUser(true);
    try {
      await createAdminUserApi(createForm);
      showToast(`Successfully provisioned ${createForm.role} account!`, 'success');
      setShowCreateModal(false);
      setCreateForm({ name: '', email: '', password: '', phone: '', role: 'admin' });
      loadUsers();
      loadStats();
      loadAuditLogs();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleToggleVerifyProperty = async (property) => {
    const nextVerified = !property.verified;
    try {
      await moderatePropertyApi(property.id, { verified: nextVerified });
      showToast(`Property '${property.name}' ${nextVerified ? 'verified' : 'unverified'}`, 'success');
      if (onPropertyModerated) {
        onPropertyModerated(property.id, { verified: nextVerified });
      }
      loadAuditLogs();
      loadStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Filtered users
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
            <div className="user-avatar" style={{ background: 'linear-gradient(135deg, #e11d48, #9f1239)' }}>
              <ShieldAlert size={22} color="white" />
            </div>
            <div className="user-info-text">
              <h4>{currentUser?.name || 'Super Admin'}</h4>
              <span style={{ color: '#fda4af', fontWeight: 700 }}>Super Administrator</span>
            </div>
          </div>
        </div>

        <ul className="sidebar-nav">
          <li
            className={`sidebar-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Activity size={18} /> Platform Analytics
          </li>
          <li
            className={`sidebar-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} /> User Governance
            <span className="badge-count">{usersList.length}</span>
          </li>
          <li
            className={`sidebar-nav-item ${activeTab === 'listings' ? 'active' : ''}`}
            onClick={() => setActiveTab('listings')}
          >
            <Building size={18} /> Property Oversight
            <span className="badge-count">{properties.length}</span>
          </li>
          <li
            className={`sidebar-nav-item ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <FileSpreadsheet size={18} /> Security & Audit Trail
            <span className="badge-count">{auditLogs.length}</span>
          </li>
        </ul>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* TAB 1: PLATFORM OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="dashboard-title-area">
                <h1>Platform Governance & Intelligence</h1>
                <p>Real-time telemetry, user distribution, and platform health.</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => { loadStats(); loadAuditLogs(); }}>
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon indigo"><Users size={24} /></div>
                <div className="stat-details">
                  <h4>Total Users</h4>
                  <div className="stat-number">{stats?.users?.total ?? usersList.length}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon emerald"><Building size={24} /></div>
                <div className="stat-details">
                  <h4>Properties & PGs</h4>
                  <div className="stat-number">{stats?.properties?.total ?? properties.length} Active</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon amber"><DollarSign size={24} /></div>
                <div className="stat-details">
                  <h4>Verified Revenue</h4>
                  <div className="stat-number">
                    ₹{(stats?.finance?.total_revenue ?? 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon rose"><ShieldCheck size={24} /></div>
                <div className="stat-details">
                  <h4>Vacant Bed Capacity</h4>
                  <div className="stat-number" style={{ color: 'var(--success-solid)' }}>
                    {stats?.inventory?.vacant_beds ?? 0} Beds
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>User Population Breakdown</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span>Tenants & Residents:</span>
                    <strong>{stats?.users?.tenants ?? 0}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span>PG Owners:</span>
                    <strong>{stats?.users?.owners ?? 0}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                    <span>Administrators (Super/Admin):</span>
                    <strong>{stats?.users?.admins ?? 0}</strong>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Operations Pipeline</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span>Pending Join Requests:</span>
                    <strong style={{ color: 'var(--amber-600)' }}>{stats?.requests?.pending ?? 0}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span>Open Maintenance Tickets:</span>
                    <strong style={{ color: 'var(--rose-600)' }}>{stats?.complaints?.open ?? 0}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                    <span>Verified PG Properties:</span>
                    <strong style={{ color: 'var(--emerald-600)' }}>{stats?.properties?.verified ?? 0}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER GOVERNANCE */}
        {activeTab === 'users' && (
          <div>
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="dashboard-title-area">
                <h1>Platform User Governance</h1>
                <p>Provision administrative accounts, assign privileges, and manage account statuses.</p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
                <UserPlus size={16} /> Create Administrator
              </button>
            </div>

            {/* Filter bar */}
            <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--slate-400)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '32px' }}
                  placeholder="Search by name, email, or ID..."
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
                  <option value="all">All Roles</option>
                  <option value="tenant">Tenants</option>
                  <option value="owner">PG Owners</option>
                  <option value="admin">Admins</option>
                  <option value="super_admin">Super Admins</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="table-card">
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User Name</th>
                      <th>Email</th>
                      <th>Current Role</th>
                      <th>Status</th>
                      <th>Change Role</th>
                      <th style={{ textAlign: 'right' }}>Account State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td><strong>#{u.id}</strong></td>
                        <td>{u.name}</td>
                        <td style={{ color: 'var(--slate-500)' }}>{u.email}</td>
                        <td>
                          <Badge
                            status={u.role === 'super_admin' ? 'rejected' : u.role}
                            text={u.role.toUpperCase()}
                          />
                        </td>
                        <td>
                          <Badge status={u.status} />
                        </td>
                        <td>
                          {u.id === currentUser?.id ? (
                            <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)', fontStyle: 'italic' }}>
                              Protected Self
                            </span>
                          ) : (
                            <select
                              className="form-input"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.82rem', width: '130px' }}
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            >
                              <option value="tenant">Tenant</option>
                              <option value="owner">PG Owner</option>
                              <option value="admin">Admin</option>
                              <option value="super_admin">Super Admin</option>
                            </select>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {u.id === currentUser?.id ? (
                            <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>Current User</span>
                          ) : (
                            <button
                              className={`btn ${u.status === 'active' ? 'btn-danger' : 'btn-success'} btn-sm`}
                              onClick={() => handleToggleUserStatus(u)}
                            >
                              {u.status === 'active' ? 'Suspend' : 'Activate'}
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

        {/* TAB 3: LISTINGS OVERSIGHT */}
        {activeTab === 'listings' && (
          <div>
            <div className="dashboard-header">
              <div className="dashboard-title-area">
                <h1>Platform Listing Moderation</h1>
                <p>Audit PG accommodations, verify authenticity badges, and monitor safety credentials.</p>
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
                            {p.verified ? 'Revoke Verification' : 'Grant Verified Badge'}
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

        {/* TAB 4: AUDIT TRAIL */}
        {activeTab === 'logs' && (
          <div>
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="dashboard-title-area">
                <h1>Security Audit Trail & Governance Log</h1>
                <p>Immutable log of administrative operations, account creations, and role updates.</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={loadAuditLogs}>
                <RefreshCw size={14} /> Refresh Logs
              </button>
            </div>

            <div className="table-card">
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Timestamp (UTC)</th>
                      <th>Actor</th>
                      <th>Action</th>
                      <th>Target</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-400)' }}>
                          No administrative events recorded yet.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id}>
                          <td style={{ color: 'var(--slate-400)', whiteSpace: 'nowrap' }}>
                            {log.created_at ? log.created_at.replace('T', ' ').slice(0, 19) : ''}
                          </td>
                          <td>
                            <strong>{log.actor_name}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', display: 'block' }}>
                              ({log.actor_role})
                            </span>
                          </td>
                          <td>
                            <Badge status="active" text={log.action} />
                          </td>
                          <td>
                            <span style={{ fontWeight: 600 }}>{log.target_type}</span>
                            {log.target_id && <span style={{ color: 'var(--slate-400)' }}> #{log.target_id}</span>}
                          </td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                            {log.details}
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

      {/* CREATE ADMIN MODAL */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Provision Administrative Account"
      >
        <form onSubmit={handleCreateAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Vikramaditya Rao"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label">Official Email Address *</label>
            <input
              type="email"
              className="form-input"
              required
              placeholder="admin@stayease.com"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label">Temporary Password *</label>
            <input
              type="password"
              className="form-input"
              required
              placeholder="Minimum 8 characters"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label">Mobile Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="+91 98000 11223"
              value={createForm.phone}
              onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label">Administrative Role Assignment *</label>
            <select
              className="form-input"
              value={createForm.role}
              onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
            >
              <option value="admin">Administrator (Moderation Authority)</option>
              <option value="super_admin">Super Administrator (Full Platform Governance)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={creatingUser}>
              {creatingUser ? 'Provisioning...' : 'Provision Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
