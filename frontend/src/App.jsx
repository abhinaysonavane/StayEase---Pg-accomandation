import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { FindPGPage } from './pages/FindPGPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { TenantDashboard } from './pages/TenantDashboard';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';
import { BookingModal } from './components/property/BookingModal';
import {
  mockProperties,
  mockRoomsAndBeds,
  mockTenantStay,
  mockJoinRequests,
  mockPayments,
  mockVehicles,
  mockComplaints,
  mockNotifications,
} from './data/mockData';
import {
  fetchPropertiesApi,
  fetchJoinRequestsApi,
  updateJoinRequestStatusApi,
  updateBedApi
} from './services/api';
import './styles/index.css';
import './styles/components.css';
import './styles/dashboard.css';

const normalizeProperty = (p) => ({
  ...p,
  id: p.id,
  name: p.name,
  description: p.description || p.tagline,
  tagline: p.tagline || p.description,
  address: p.address,
  locality: p.locality || '',
  city: p.city,
  startingPrice: p.startingPrice || p.monthly_rent || 8000,
  monthlyRent: p.monthly_rent || p.startingPrice || 8000,
  deposit: p.deposit || (p.monthly_rent ? p.monthly_rent * 2 : 16000),
  depositMonths: p.deposit_months || p.depositMonths || 2,
  noticePeriodDays: p.notice_period_days || p.noticePeriodDays || 30,
  genderPolicy: p.gender_policy || p.genderPolicy || 'unisex',
  totalBeds: p.total_beds !== undefined ? p.total_beds : (p.totalBeds || 10),
  vacantBeds: p.vacant_beds !== undefined ? p.vacant_beds : (p.vacantBeds || 5),
  isAvailable: p.is_available !== undefined ? p.is_available : (p.isAvailable ?? true),
  foodIncluded: p.food_included !== undefined ? p.food_included : (p.foodIncluded ?? true),
  foodType: p.food_type || p.foodType || 'veg_and_non_veg',
  acAvailable: p.ac_available !== undefined ? p.ac_available : (p.acAvailable ?? true),
  rating: p.rating || 4.8,
  reviewsCount: p.reviews_count || p.reviewsCount || 1,
  verified: p.verified ?? true,
  coverImage: p.cover_image || p.coverImage || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
  images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.cover_image || p.coverImage || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80'],
  amenities: Array.isArray(p.amenities) ? p.amenities : [],
  houseRules: Array.isArray(p.house_rules || p.houseRules) ? (p.house_rules || p.houseRules) : [],
});

const AppContent = () => {
  const { role, isLoggedIn } = useAuth();

  // Navigation state
  const [currentView, setCurrentView] = useState('home');
  const [selectedProperty, setSelectedProperty] = useState(mockProperties[0]);
  const [searchParams, setSearchParams] = useState({ city: '', keyword: '' });

  // Detect direct reset-password links from email
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'reset-password' || params.get('token')) {
      setCurrentView('reset-password');
    }
  }, []);

  // Strict role-based route isolation:
  // When logged in, a user can ONLY view their dedicated dashboard!
  useEffect(() => {
    if (isLoggedIn) {
      if (role === 'tenant' && (currentView === 'owner-dashboard' || currentView === 'admin-dashboard')) {
        setCurrentView('tenant-dashboard');
      } else if (role === 'owner' && (currentView === 'tenant-dashboard' || currentView === 'admin-dashboard')) {
        setCurrentView('owner-dashboard');
      } else if (role === 'admin' && (currentView === 'tenant-dashboard' || currentView === 'owner-dashboard')) {
        setCurrentView('admin-dashboard');
      }
    } else {
      // Guests cannot access dashboards
      if (['tenant-dashboard', 'owner-dashboard', 'admin-dashboard'].includes(currentView)) {
        setCurrentView('login');
      }
    }
  }, [role, isLoggedIn, currentView]);

  // Data states (Initial UI driven by verified sample data with live backend sync)
  const [properties, setProperties] = useState(mockProperties);
  const [roomsAndBeds, setRoomsAndBeds] = useState(mockRoomsAndBeds);
  const [stay, setStay] = useState(mockTenantStay);
  const [joinRequests, setJoinRequests] = useState(mockJoinRequests);
  const [payments, setPayments] = useState(mockPayments);
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [complaints, setComplaints] = useState(mockComplaints);
  const [notifications, setNotifications] = useState(mockNotifications);

  // Fetch live properties from backend
  useEffect(() => {
    let isMounted = true;
    async function loadProperties() {
      try {
        const res = await fetchPropertiesApi();
        if (isMounted && res?.items && res.items.length > 0) {
          const normalized = res.items.map(normalizeProperty);
          setProperties(normalized);
          setSelectedProperty(normalized[0]);
        }
      } catch (err) {
        console.warn('Backend properties endpoint unreachable, using fallback catalog:', err.message);
      }
    }
    loadProperties();
    return () => { isMounted = false; };
  }, []);

  // Fetch live join requests when logged in
  useEffect(() => {
    let isMounted = true;
    async function loadJoinRequests() {
      if (!isLoggedIn) return;
      try {
        const res = await fetchJoinRequestsApi();
        if (isMounted && Array.isArray(res) && res.length > 0) {
          const mapped = res.map((r) => ({
            id: r.id,
            tenantId: r.tenant_id,
            tenantName: r.tenant_name || 'Applicant',
            tenantPhone: r.tenant_phone || '+91 99999 88888',
            tenantEmail: r.tenant_email || 'tenant@example.com',
            propertyId: r.property_id,
            propertyName: r.property_name || 'StayEase PG',
            roomTypePreference: r.room_type_preference || 'double',
            moveInDate: r.move_in_date || '',
            status: r.status || 'pending',
            createdAt: r.created_at ? r.created_at.split('T')[0] : '',
            allocatedRoom: r.allocated_room,
            allocatedBed: r.allocated_bed,
            notes: r.notes || ''
          }));
          setJoinRequests(mapped);
        }
      } catch (err) {
        console.warn('Backend join requests unreachable, using local state:', err.message);
      }
    }
    loadJoinRequests();
    return () => { isMounted = false; };
  }, [isLoggedIn, role]);

  // Booking Modal
  const [bookingModalProperty, setBookingModalProperty] = useState(null);

  // Handlers
  const handleSelectProperty = (prop) => {
    setSelectedProperty(prop);
    setCurrentView('property-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookDirect = (prop) => {
    setBookingModalProperty(prop);
  };

  const handleSearchRedirect = ({ city, keyword, roleSwitch }) => {
    if (roleSwitch === 'owner') {
      if (role === 'owner') {
        setCurrentView('owner-dashboard');
      } else {
        setCurrentView('login');
      }
      return;
    }
    setSearchParams({ city: city || '', keyword: keyword || '' });
    setCurrentView('find-pg');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJoinRequestCreated = (newReq) => {
    setJoinRequests([newReq, ...joinRequests]);
    // Also decrease vacant beds count for property
    setProperties(
      properties.map((p) =>
        p.id === newReq.propertyId ? { ...p, vacantBeds: Math.max(0, p.vacantBeds - 1) } : p
      )
    );
  };

  const handlePaymentSubmitted = ({ invoiceId, method, transactionRef, date }) => {
    setPayments(
      payments.map((p) =>
        p.id === invoiceId
          ? {
              ...p,
              status: 'under_review',
              paymentMethod: method,
              transactionRef,
              paidDate: date,
            }
          : p
      )
    );
  };

  const handleVerifyPayment = (invoiceId) => {
    setPayments(
      payments.map((p) =>
        p.id === invoiceId
          ? {
              ...p,
              status: 'paid',
              paidDate: new Date().toISOString().split('T')[0],
              receiptId: `REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
            }
          : p
      )
    );
  };

  const handleComplaintCreated = (newTicket) => {
    setComplaints([newTicket, ...complaints]);
  };

  const handleResolveComplaint = (complaintId) => {
    setComplaints(
      complaints.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              status: 'resolved',
              updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
              ownerRemark: 'Technician completed the inspection and maintenance repair.',
            }
          : c
      )
    );
  };

  const handleVehicleAdded = (newVehicle) => {
    setVehicles([newVehicle, ...vehicles]);
  };

  const handlePropertyAdded = (newProperty) => {
    setProperties([newProperty, ...properties]);
  };

  const handlePropertyModerated = (propertyId, { verified, isAvailable }) => {
    setProperties(
      properties.map((p) => {
        if (p.id === propertyId) {
          return {
            ...p,
            verified: verified !== undefined ? verified : p.verified,
            isAvailable: isAvailable !== undefined ? isAvailable : p.isAvailable,
          };
        }
        return p;
      })
    );
  };

  const handleToggleBedStatus = async (roomId, bedId) => {
    let nextStatus = 'occupied';
    setRoomsAndBeds(
      roomsAndBeds.map((room) => {
        if (room.roomId === roomId) {
          return {
            ...room,
            beds: room.beds.map((bed) => {
              if (bed.id === bedId) {
                nextStatus = bed.status === 'vacant' ? 'occupied' : 'vacant';
                return {
                  ...bed,
                  status: nextStatus,
                  tenantName: nextStatus === 'occupied' ? 'Assigned Tenant' : null,
                };
              }
              return bed;
            }),
          };
        }
        return room;
      })
    );

    try {
      if (typeof bedId === 'number' && bedId < 1000000000) {
        await updateBedApi(bedId, {
          availability_status: nextStatus,
          tenant_name: nextStatus === 'occupied' ? 'Assigned Tenant' : null
        });
      }
    } catch (e) {
      console.warn('Backend bed toggle sync notice:', e.message);
    }
  };

  const handleApproveRequest = async (reqId) => {
    setJoinRequests(
      joinRequests.map((r) =>
        r.id === reqId
          ? {
              ...r,
              status: 'approved',
              allocatedRoom: '101',
              allocatedBed: 'A',
            }
          : r
      )
    );

    try {
      if (typeof reqId === 'number' && reqId < 1000000000) {
        await updateJoinRequestStatusApi(reqId, {
          status: 'approved',
          allocated_room: '101',
          allocated_bed: 'A'
        });
      }
    } catch (e) {
      console.warn('Backend join request approve notice:', e.message);
    }
  };

  const handleRejectRequest = async (reqId) => {
    setJoinRequests(
      joinRequests.map((r) =>
        r.id === reqId
          ? {
              ...r,
              status: 'rejected',
            }
          : r
      )
    );

    try {
      if (typeof reqId === 'number' && reqId < 1000000000) {
        await updateJoinRequestStatusApi(reqId, {
          status: 'rejected'
        });
      }
    } catch (e) {
      console.warn('Backend join request reject notice:', e.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      <main className="main-content">
        {currentView === 'home' && (
          <HomePage
            properties={properties}
            onSelectProperty={handleSelectProperty}
            onBookDirect={handleBookDirect}
            onSearchRedirect={handleSearchRedirect}
          />
        )}

        {currentView === 'find-pg' && (
          <FindPGPage
            properties={properties}
            initialCity={searchParams.city}
            initialKeyword={searchParams.keyword}
            onSelectProperty={handleSelectProperty}
            onBookDirect={handleBookDirect}
          />
        )}

        {currentView === 'property-detail' && (
          <PropertyDetailPage
            property={selectedProperty}
            onBack={() => setCurrentView('find-pg')}
            onBookDirect={handleBookDirect}
            onNavigateLogin={() => setCurrentView('login')}
          />
        )}

        {currentView === 'login' && (
          <LoginPage
            onLoginSuccess={(loggedRole, returnDest) => {
              if (returnDest) {
                if (returnDest.view === 'property-detail' && returnDest.property) {
                  setSelectedProperty(returnDest.property);
                  setCurrentView('property-detail');
                  if (returnDest.openBooking) {
                    setBookingModalProperty(returnDest.property);
                  }
                  return;
                }
              }
              if (loggedRole === 'tenant') setCurrentView('tenant-dashboard');
              else if (loggedRole === 'owner') setCurrentView('owner-dashboard');
              else if (loggedRole === 'admin') setCurrentView('admin-dashboard');
              else if (loggedRole === 'super_admin') setCurrentView('superadmin-dashboard');
              else setCurrentView('home');
            }}
            onNavigateRegister={() => setCurrentView('register')}
          />
        )}

        {currentView === 'register' && (
          <RegisterPage
            onRegisterSuccess={(registeredRole, returnDest) => {
              if (returnDest) {
                if (returnDest.view === 'property-detail' && returnDest.property) {
                  setSelectedProperty(returnDest.property);
                  setCurrentView('property-detail');
                  if (returnDest.openBooking) {
                    setBookingModalProperty(returnDest.property);
                  }
                  return;
                }
              }
              if (registeredRole === 'tenant') setCurrentView('tenant-dashboard');
              else if (registeredRole === 'owner') setCurrentView('owner-dashboard');
              else setCurrentView('home');
            }}
            onNavigateLogin={() => setCurrentView('login')}
          />
        )}

        {currentView === 'reset-password' && (
          <ResetPasswordPage
            onNavigateLogin={() => setCurrentView('login')}
          />
        )}

        {currentView === 'tenant-dashboard' && (
          <TenantDashboard
            stay={stay}
            joinRequests={joinRequests}
            payments={payments}
            vehicles={vehicles}
            complaints={complaints}
            notifications={notifications}
            onPaymentSubmitted={handlePaymentSubmitted}
            onComplaintCreated={handleComplaintCreated}
            onVehicleAdded={handleVehicleAdded}
          />
        )}

        {currentView === 'owner-dashboard' && (
          <OwnerDashboard
            properties={properties}
            roomsAndBeds={roomsAndBeds}
            joinRequests={joinRequests}
            payments={payments}
            complaints={complaints}
            onPropertyAdded={handlePropertyAdded}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
            onVerifyPayment={handleVerifyPayment}
            onResolveComplaint={handleResolveComplaint}
            onToggleBedStatus={handleToggleBedStatus}
          />
        )}

        {currentView === 'admin-dashboard' && (
          <AdminDashboard
            properties={properties}
            onPropertyModerated={handlePropertyModerated}
          />
        )}

        {currentView === 'superadmin-dashboard' && (
          <SuperAdminDashboard
            properties={properties}
            onPropertyModerated={handlePropertyModerated}
          />
        )}
      </main>

      <Footer setCurrentView={setCurrentView} />

      {/* Join Request Booking Modal */}
      <BookingModal
        isOpen={!!bookingModalProperty}
        onClose={() => setBookingModalProperty(null)}
        property={bookingModalProperty}
        onJoinRequestCreated={handleJoinRequestCreated}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
