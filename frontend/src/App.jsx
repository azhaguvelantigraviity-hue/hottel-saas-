import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminHotels from './pages/AdminHotels';
import AdminSubscriptions from './pages/AdminSubscriptions';
import HotelDashboard from './pages/HotelDashboard';
import RoomsPage from './pages/RoomsPage';
import BookingsPage from './pages/BookingsPage';
import GuestCRMPage from './pages/GuestCRMPage';
import EmployeesPage from './pages/EmployeesPage';
import HousekeepingPage from './pages/HousekeepingPage';
import RestaurantPOS from './pages/RestaurantPOS';
import MaintenancePage from './pages/MaintenancePage';
import ChannelManagerPage from './pages/ChannelManagerPage';
import ReportsPage from './pages/ReportsPage';
import RevenueAIPage from './pages/RevenueAIPage';
import SettingsPage from './pages/SettingsPage';
import LockedPage from './pages/LockedPage';
import ComingSoon from './pages/ComingSoon';
import AuditLogs from './pages/AuditLogs';
import AdminRevenue from './pages/AdminRevenue';
import SmartCheckInPage from './pages/SmartCheckInPage';
import InventoryPage from './pages/InventoryPage';
import LoyaltyPage from './pages/LoyaltyPage';
import EventsPage from './pages/EventsPage';
import LaundryPage from './pages/LaundryPage';
import TravelDeskPage from './pages/TravelDeskPage';
import BillingPage from './pages/BillingPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import SecurityPage from './pages/SecurityPage';
import IoTPage from './pages/IoTPage';
import WhatsAppPage from './pages/WhatsAppPage';
import NotificationsPage from './pages/NotificationsPage';
import MarketingPage from './pages/MarketingPage';
import AttendancePage from './pages/AttendancePage';
import MultiBranchPage from './pages/MultiBranchPage';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ProtectedRoute from './components/ProtectedRoute';

import * as authService from './services/authService';

const safeGetStorage = (key, fallback = null) => {
  try { return localStorage.getItem(key) ?? fallback; }
  catch { return fallback; }
};

const safeSetStorage = (key, value) => {
  try { localStorage.setItem(key, value); }
  catch { }
};

// ── ADMIN APP ─────────────────────────────────────────────────────────────────
const AdminApp = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  const page = pathParts[2] || 'dashboard';

  const setPage = (newPage) => navigate(`/admin/${newPage}`);

  const pages = {
    dashboard: <AdminDashboard onNav={setPage} />,
    hotels: <AdminHotels />,
    subscriptions: <AdminSubscriptions />,
    revenue: <AdminRevenue />,
    analytics: <AnalyticsDashboard />,
    multibranch: <MultiBranchPage />,
    audit: <AuditLogs />,
    settings: <SettingsPage role="admin" />,
  };

  const titles = {
    dashboard: 'Platform Overview', hotels: 'Managed Hotels', subscriptions: 'Subscriptions',
    revenue: 'Revenue', analytics: 'Analytics', multibranch: 'Multi-Branch Management',
    audit: 'Audit Logs', settings: 'Settings',
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)' }}>
      <Sidebar role="admin" active={page} onNav={setPage} onLogout={onLogout} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar title={titles[page] || 'Admin'} subtitle="StayOS Platform Administration" role="admin" onNav={setPage} />
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {pages[page] || pages.dashboard}
        </div>
      </div>
    </div>
  );
};

// ── HOTEL APP ─────────────────────────────────────────────────────────────────
const HotelApp = ({ onLogout, initialPlan = 'enterprise', role = 'manager', hotelDetails = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  const page = pathParts[2] || 'dashboard';

  const setPage = (newPage) => navigate(`/hotel/${newPage}`);
  const plan = initialPlan;

  const planFeatures = {
    starter:      ['dashboard','rooms','bookings','billing','notifications','reports','settings','employees','analytics','attendance'],
    professional: ['dashboard','rooms','bookings','billing','notifications','guests','loyalty','employees','housekeeping','restaurant','laundry','maintenance','channel','analytics','marketing','whatsapp','inventory','reports','settings','attendance'],
    enterprise:   ['dashboard','rooms','bookings','billing','notifications','checkin','guests','loyalty','restaurant','laundry','travel','events','employees','housekeeping','maintenance','channel','revenue','analytics','marketing','whatsapp','inventory','iot','security','reports','settings','attendance'],
  };
  const allowed = planFeatures[plan] || planFeatures.starter;

  const titles = {
    dashboard: 'Dashboard', rooms: 'Room Management', bookings: 'Bookings',
    checkin: 'Smart Check-In', billing: 'Billing & Invoices',
    guests: 'Guest CRM', loyalty: 'Loyalty Program', restaurant: 'Restaurant POS',
    laundry: 'Laundry Management', travel: 'Travel Desk', events: 'Events & Halls',
    employees: 'Employee Management', housekeeping: 'Housekeeping', maintenance: 'Maintenance',
    channel: 'Channel Manager', revenue: 'Revenue AI', analytics: 'Analytics Dashboard',
    marketing: 'Marketing & SEO', whatsapp: 'WhatsApp Integration',
    inventory: 'Inventory Management', iot: 'IoT & Door Locks',
    attendance: 'Attendance',
    security: 'Security & CCTV',
    notifications: 'Notifications', reports: 'Reports & Analytics', settings: 'Settings',
  };

  const reqPlans = {
    rooms: 'starter', bookings: 'starter', billing: 'starter',
    notifications: 'starter', reports: 'starter', settings: 'starter',
    employees: 'starter', analytics: 'starter',
    guests: 'professional', loyalty: 'professional',
    housekeeping: 'professional', restaurant: 'professional', laundry: 'professional',
    attendance: 'starter', channel: 'professional',
    marketing: 'professional', whatsapp: 'professional', inventory: 'professional',
    checkin: 'enterprise', travel: 'enterprise', events: 'enterprise',
    iot: 'enterprise', security: 'enterprise',
    revenue: 'enterprise',
  };

  const subtitles = {
    starter: 'Starter Plan',
    professional: 'Professional Plan',
    enterprise: 'Enterprise Plan',
  };

  const getPage = () => {
    if (!allowed.includes(page)) {
      return <LockedPage feature={titles[page]} requiredPlan={reqPlans[page] || 'professional'} onNav={setPage} />;
    }
    switch (page) {
      case 'dashboard': return <HotelDashboard plan={plan} onNav={setPage} />;
      case 'rooms': return <RoomsPage onNav={setPage} role={role} hotelDetails={hotelDetails} />;
      case 'bookings': return <BookingsPage />;
      case 'checkin': return <SmartCheckInPage />;
      case 'billing': return <BillingPage />;
      case 'guests': return <GuestCRMPage />;
      case 'loyalty': return <LoyaltyPage />;
      case 'restaurant': return <RestaurantPOS role={role} hotelDetails={hotelDetails} />;
      case 'laundry': return <LaundryPage />;
      case 'travel': return <TravelDeskPage />;
      case 'events': return <EventsPage />;
      case 'employees': return <EmployeesPage role={role} hotelDetails={hotelDetails} plan={plan} />;
      case 'attendance': return <AttendancePage />;
      case 'housekeeping': return <HousekeepingPage />;
      case 'maintenance': return <MaintenancePage />;
      case 'channel': return <ChannelManagerPage />;
      case 'revenue': return <RevenueAIPage />;
      case 'analytics': return <AnalyticsDashboard />;
      case 'marketing': return <MarketingPage />;
      case 'whatsapp': return <WhatsAppPage />;
      case 'inventory': return <InventoryPage />;
      case 'iot': return <IoTPage />;
      case 'security': return <SecurityPage />;
      case 'notifications': return <NotificationsPage plan={plan} />;
      case 'reports': return <ReportsPage />;
      case 'settings': return <SettingsPage role="hotel" plan={plan} onNav={setPage} />;
      default: return <ComingSoon title={titles[page] || page} icon="hotel" color="var(--gold)" />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)' }}>
      <Sidebar role={role} active={page} onNav={setPage} onLogout={onLogout} plan={plan} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar title={titles[page] || 'Hotel'} subtitle={subtitles[plan]} role={role} onNav={setPage} />
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {getPage()}
        </div>
      </div>
    </div>
  );
};

// ── ROOT ──────────────────────────────────────────────────────────────────────
const App = () => {
  const navigate = useNavigate();
  const [authReady, setAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginType, setLoginType] = useState(null);
  const [hotelPlan, setHotelPlan] = useState('enterprise');
  const [hotelRole, setHotelRole] = useState('manager');
  const [currentHotel, setCurrentHotel] = useState(null);
  const [theme, setTheme] = useState(() => safeGetStorage('stayos_theme', 'light'));

  // ── Theme sync ──
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    safeSetStorage('stayos_theme', theme);
  }, [theme]);

  // ── Session restore ──
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      authService.getMe()
        .then((user) => {
          setIsAuthenticated(true);
          if (user.role === 'platform_admin') {
            setLoginType('admin');
          } else {
            setLoginType('hotel');
            setHotelRole(user.role || 'manager');
            setHotelPlan(user.hotel?.plan || 'enterprise');
            setCurrentHotel(user.hotel);
          }
          setAuthReady(true);
        })
        .catch(() => {
          authService.logout();
          setAuthReady(true);
        });
    } else {
      setAuthReady(true);
    }
  }, []);

  // ── Auth handlers ──
  const handleLogin = (type) => {
    setLoginType(type);
    navigate(`/login/${type}`);
  };

  const handleHotelSuccess = (plan, role, hotelDetails) => {
    setHotelPlan(plan || 'enterprise');
    setHotelRole(role || 'manager');
    setCurrentHotel(hotelDetails || null);
    setIsAuthenticated(true);
    navigate('/hotel/dashboard');
  };

  const handleLogout = () => {
    authService.logout().catch(() => {});
    setLoginType(null);
    setIsAuthenticated(false);
    setHotelPlan('enterprise');
    setHotelRole('manager');
    setCurrentHotel(null);
    navigate('/');
  };

  return (
    <Routes>
      <Route path="/" element={<Landing onLogin={handleLogin} theme={theme} setTheme={setTheme} />} />
      <Route path="/login/admin" element={<Login type="admin" onSuccess={() => { setIsAuthenticated(true); navigate('/admin/dashboard'); }} onBack={() => navigate('/')} />} />
      <Route path="/login/hotel" element={<Login type="hotel" onSuccess={handleHotelSuccess} onBack={() => navigate('/')} />} />
      <Route path="/admin/*" element={
        <ProtectedRoute isAuthenticated={isAuthenticated} authReady={authReady}>
          <AdminApp onLogout={handleLogout} theme={theme} setTheme={setTheme} />
        </ProtectedRoute>
      } />
      <Route path="/hotel/*" element={
        <ProtectedRoute isAuthenticated={isAuthenticated} authReady={authReady}>
          <HotelApp onLogout={handleLogout} initialPlan={hotelPlan} role={hotelRole} hotelDetails={currentHotel} theme={theme} setTheme={setTheme} />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
