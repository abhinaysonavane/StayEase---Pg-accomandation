/**
 * StayEase API Client Service
 * Centralized HTTP service communicating with the Python FastAPI backend on Port 8000.
 */

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

/**
 * Returns stored auth token from localStorage.
 */
export const getStoredToken = () => {
  return localStorage.getItem('stayease_token') || null;
};

/**
 * Saves auth token to localStorage.
 */
export const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem('stayease_token', token);
  } else {
    localStorage.removeItem('stayease_token');
  }
};

/**
 * Base fetch wrapper with automatic JSON parsing and Bearer auth injection.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getStoredToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      credentials: 'include', // Transmits HttpOnly cookies across origins/ports
      ...options,
      headers,
    });
  } catch (netErr) {
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
    let userMsg;
    if (isOffline) {
      userMsg = 'Network connection offline. Please check your internet connection.';
    } else {
      userMsg = `Unable to connect to StayEase server at ${API_BASE_URL}. Please verify the FastAPI backend server is running on port 8000.`;
    }
    const error = new Error(userMsg);
    error.isNetworkError = true;
    error.originalError = netErr;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let errorMessage = data?.detail || data?.message;
    if (!errorMessage) {
      if (response.status === 401) {
        errorMessage = 'Invalid email or password. Please verify your credentials.';
      } else if (response.status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (response.status === 404) {
        errorMessage = 'The requested resource was not found.';
      } else if (response.status === 422) {
        if (Array.isArray(data?.detail) && data.detail[0]?.msg) {
          const field = data.detail[0]?.loc?.slice(-1)[0] || 'input';
          errorMessage = `Validation error on ${field}: ${data.detail[0].msg}`;
        } else {
          errorMessage = 'Validation error. Please verify the submitted information.';
        }
      } else if (response.status >= 500) {
        errorMessage = 'StayEase service is currently experiencing technical difficulties. Please try again shortly.';
      } else {
        errorMessage = `Request failed (HTTP ${response.status})`;
      }
    }
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------
export const checkHealthApi = () => {
  return request('/health');
};

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------
export const registerApi = async (userData) => {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  if (data?.access_token) {
    setStoredToken(data.access_token);
  }
  return data;
};

export const loginApi = async (credentials) => {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  if (data?.access_token) {
    setStoredToken(data.access_token);
  }
  return data;
};

export const logoutApi = async () => {
  try {
    await request('/auth/logout', { method: 'POST' });
  } finally {
    setStoredToken(null);
  }
};

export const getCurrentUserApi = () => {
  return request('/auth/me');
};

export const getGoogleStatusApi = () => {
  return request('/auth/google/status');
};

export const googleAuthApi = async (idToken, role = 'tenant') => {
  const data = await request('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ id_token: idToken, role }),
  });
  if (data?.access_token) {
    setStoredToken(data.access_token);
  }
  return data;
};

export const forgotPasswordApi = (email) => {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

export const resetPasswordApi = (token, newPassword) => {
  return request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, new_password: newPassword }),
  });
};

// ---------------------------------------------------------------------------
// Properties
// ---------------------------------------------------------------------------
export const fetchPropertiesApi = (params = {}) => {
  const query = new URLSearchParams();
  if (params.city) query.append('city', params.city);
  if (params.minRent !== undefined) query.append('min_rent', params.minRent);
  if (params.maxRent !== undefined) query.append('max_rent', params.maxRent);
  if (params.genderPolicy && params.genderPolicy !== 'all') query.append('gender_policy', params.genderPolicy);
  if (params.keyword) query.append('keyword', params.keyword);
  if (params.onlyVacant) query.append('only_vacant', 'true');
  if (params.page) query.append('page', params.page);
  if (params.pageSize) query.append('page_size', params.pageSize);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request(`/properties${queryString}`);
};

export const fetchPropertyDetailApi = (propertyId) => {
  return request(`/properties/${propertyId}`);
};

export const createPropertyApi = (propertyData) => {
  return request('/properties', {
    method: 'POST',
    body: JSON.stringify(propertyData),
  });
};

export const updatePropertyApi = (propertyId, propertyData) => {
  return request(`/properties/${propertyId}`, {
    method: 'PUT',
    body: JSON.stringify(propertyData),
  });
};

export const deletePropertyApi = (propertyId) => {
  return request(`/properties/${propertyId}`, {
    method: 'DELETE',
  });
};

// ---------------------------------------------------------------------------
// Rooms
// ---------------------------------------------------------------------------
export const fetchRoomsApi = (propertyId = null) => {
  const queryString = propertyId ? `?property_id=${propertyId}` : '';
  return request(`/rooms${queryString}`);
};

export const createRoomApi = (roomData) => {
  return request('/rooms', {
    method: 'POST',
    body: JSON.stringify(roomData),
  });
};

// ---------------------------------------------------------------------------
// Join Requests
// ---------------------------------------------------------------------------
export const submitJoinRequestApi = (joinData) => {
  return request('/join-requests', {
    method: 'POST',
    body: JSON.stringify(joinData),
  });
};

export const fetchJoinRequestsApi = (params = {}) => {
  const query = new URLSearchParams();
  if (params.status) query.append('status_filter', params.status);
  if (params.propertyId) query.append('property_id', params.propertyId);
  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request(`/join-requests${queryString}`);
};

export const updateJoinRequestStatusApi = (requestId, statusData) => {
  return request(`/join-requests/${requestId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(statusData),
  });
};

// ---------------------------------------------------------------------------
// Beds
// ---------------------------------------------------------------------------
export const fetchBedsApi = (params = {}) => {
  const query = new URLSearchParams();
  if (params.roomId) query.append('room_id', params.roomId);
  if (params.status) query.append('status', params.status);
  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request(`/beds${queryString}`);
};

export const fetchBedDetailApi = (bedId) => {
  return request(`/beds/${bedId}`);
};

export const updateBedApi = (bedId, bedData) => {
  return request(`/beds/${bedId}`, {
    method: 'PATCH',
    body: JSON.stringify(bedData),
  });
};

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------
export const fetchPaymentsApi = (params = {}) => {
  const query = new URLSearchParams();
  if (params.propertyId) query.append('property_id', params.propertyId);
  if (params.status) query.append('status', params.status);
  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request(`/payments${queryString}`);
};

export const fetchPaymentDetailApi = (paymentId) => {
  return request(`/payments/${paymentId}`);
};

export const createPaymentInvoiceApi = (paymentData) => {
  return request('/payments', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  });
};

export const updatePaymentStatusApi = (paymentId, statusData) => {
  return request(`/payments/${paymentId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(statusData),
  });
};

// ---------------------------------------------------------------------------
// Complaints
// ---------------------------------------------------------------------------
export const fetchComplaintsApi = (params = {}) => {
  const query = new URLSearchParams();
  if (params.propertyId) query.append('property_id', params.propertyId);
  if (params.status) query.append('status', params.status);
  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request(`/complaints${queryString}`);
};

export const fetchComplaintDetailApi = (complaintId) => {
  return request(`/complaints/${complaintId}`);
};

export const createComplaintApi = (complaintData) => {
  return request('/complaints', {
    method: 'POST',
    body: JSON.stringify(complaintData),
  });
};

export const updateComplaintApi = (complaintId, complaintData) => {
  return request(`/complaints/${complaintId}`, {
    method: 'PATCH',
    body: JSON.stringify(complaintData),
  });
};

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------
export const fetchNotificationsApi = () => {
  return request('/notifications');
};

export const markNotificationReadApi = (notificationId) => {
  return request(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
};

export const markAllNotificationsReadApi = () => {
  return request('/notifications/read-all', {
    method: 'POST',
  });
};

// ---------------------------------------------------------------------------
// Admin & Super Admin Management
// ---------------------------------------------------------------------------
export const fetchAdminStatsApi = () => {
  return request('/admin/stats');
};

export const fetchAdminUsersApi = (role = null) => {
  const queryString = role ? `?role=${role}` : '';
  return request(`/admin/users${queryString}`);
};

export const createAdminUserApi = (userData) => {
  return request('/admin/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const updateAdminUserRoleApi = (userId, newRole) => {
  return request(`/admin/users/${userId}/role?new_role=${encodeURIComponent(newRole)}`, {
    method: 'PATCH',
  });
};

export const updateAdminUserStatusApi = (userId, newStatus) => {
  return request(`/admin/users/${userId}/status?new_status=${encodeURIComponent(newStatus)}`, {
    method: 'PATCH',
  });
};

export const moderatePropertyApi = (propertyId, { verified, isAvailable } = {}) => {
  const query = new URLSearchParams();
  if (verified !== undefined) query.append('verified', verified);
  if (isAvailable !== undefined) query.append('is_available', isAvailable);
  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request(`/admin/properties/${propertyId}/moderate${queryString}`, {
    method: 'PATCH',
  });
};

export const fetchAuditLogsApi = (limit = 50) => {
  return request(`/admin/audit-logs?limit=${limit}`);
};



