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
import DailyRevenueReportPage from './pages/DailyRevenueReportPage';
import SettingsPage from './pages/SettingsPage';
import LockedPage from './pages/LockedPage';
import ComingSoon from './pages/ComingSoon';
import AuditLogs from './pages/AuditLogs';
import AdminRevenue from './pages/AdminRevenue';
import SmartCheckInPage from './pages/SmartCheckInPage';
import CheckInOutPage from './pages/CheckInOutPage';
import InventoryPage from './pages/InventoryPage';
import LoyaltyPage from './pages/LoyaltyPage';
import EventsPage from './pages/EventsPage';
import ComplaintsPage from './pages/ComplaintsPage';
import LaundryPage from './pages/LaundryPage';
import TravelDeskPage from './pages/TravelDeskPage';
import TravelsManagementPage from './pages/TravelsManagementPage';
import BillingPage from './pages/BillingPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import SecurityPage from './pages/SecurityPage';
import IoTPage from './pages/IoTPage';
import WhatsAppPage from './pages/WhatsAppPage';
import NotificationsPage from './pages/NotificationsPage';
import MarketingPage from './pages/MarketingPage';
import AttendancePage from './pages/AttendancePage';
import MultiBranchPage from './pages/MultiBranchPage';
import PayrollPage from './pages/PayrollPage';
import AdminAccounts from './pages/AdminAccounts';
import AdminAlerts from './pages/AdminAlerts';
import AdminRoles from './pages/AdminRoles';
import AdminNotifications from './pages/AdminNotifications';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ProtectedRoute from './components/ProtectedRoute';
import { NotificationProvider } from './context/NotificationContext';

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
import { AdminNotificationProvider } from './context/AdminNotificationContext';

const AdminApp = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  const page = pathParts[2] || 'dashboard';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const setPage = (newPage) => navigate(`/admin/${newPage}`);

  const pages = {
    dashboard: <AdminDashboard onNav={setPage} />,
    hotels: <AdminHotels />,
    multibranch: <MultiBranchPage />,
    accounts: <AdminAccounts />,
    subscriptions: <AdminSubscriptions />,
    analytics: <AnalyticsDashboard />,
    alerts: <AdminAlerts />,
    audit: <AuditLogs />,
    roles: <AdminRoles />,
    notifications: <AdminNotifications />,
    settings: <SettingsPage role="admin" />,
  };

  const titles = {
    dashboard: 'Platform Overview', hotels: 'Registered Hotels', multibranch: 'Multi-Branch Management', accounts: 'Account Management',
    subscriptions: 'Subscriptions & Payments', analytics: 'Analytics Dashboard', alerts: 'Trial & Renewal Alerts',
    audit: 'Audit Logs', roles: 'Roles & Permissions', notifications: 'Platform Notifications', settings: 'Settings',
  };

  return (
    <AdminNotificationProvider>
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)' }}>
      <Sidebar role="admin" active={page} onNav={setPage} onLogout={onLogout} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar title={titles[page] || 'Admin'} subtitle="StayOS Platform Administration" role="admin" onNav={setPage} toggleSidebar={() => setIsSidebarOpen(true)} />
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {pages[page] || pages.dashboard}
        </div>
      </div>
    </div>
    </AdminNotificationProvider>
  );
};

// ── HOTEL APP ─────────────────────────────────────────────────────────────────
const HotelApp = ({ onLogout, initialPlan = 'enterprise', role = 'manager', hotelDetails = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  const page = pathParts[2] || 'dashboard';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const setPage = (newPage) => navigate(`/hotel/${newPage}`);
  const plan = initialPlan;

  const planFeatures = {
    starter: ['dashboard', 'rooms', 'bookings', 'billing', 'notifications', 'reports', 'settings', 'employees', 'analytics', 'attendance', 'checkin', 'revenue', 'complaints', 'restaurant', 'housekeeping', 'maintenance'],
    professional: ['dashboard', 'rooms', 'bookings', 'billing', 'notifications', 'guests', 'loyalty', 'employees', 'housekeeping', 'restaurant', 'laundry', 'maintenance', 'channel', 'analytics', 'marketing', 'whatsapp', 'inventory', 'reports', 'settings', 'attendance', 'payroll', 'checkin', 'revenue', 'complaints'],
    enterprise: ['dashboard', 'rooms', 'bookings', 'billing', 'notifications', 'checkin', 'guests', 'loyalty', 'restaurant', 'laundry', 'travel', 'travels', 'events', 'employees', 'housekeeping', 'maintenance', 'channel', 'revenue', 'analytics', 'marketing', 'whatsapp', 'inventory', 'iot', 'security', 'reports', 'settings', 'attendance', 'payroll', 'complaints'],
  };
  const allowed = planFeatures[plan] || planFeatures.starter;

  const titles = {
    dashboard: 'Dashboard', rooms: 'Room Management', bookings: 'Bookings',
    checkin: 'Smart Check-In', billing: 'Billing & Invoices',
    guests: 'Guest CRM', loyalty: 'Loyalty Program', restaurant: 'Restaurant POS',
    laundry: 'Laundry Management', travel: 'Travel Desk', travels: 'Travels Management', events: 'Events & Halls',
    employees: 'Employee Management', housekeeping: 'Housekeeping', maintenance: 'Maintenance',
    channel: 'Channel Manager', revenue: 'Revenue AI', analytics: 'Analytics Dashboard',
    marketing: 'Marketing & SEO', whatsapp: 'WhatsApp Integration',
    inventory: 'Inventory Management', iot: 'IoT & Door Locks',
    attendance: 'Attendance', payroll: 'Payroll Management',
    security: 'Security & CCTV', complaints: 'Customer Complaints',
    notifications: 'Notifications', reports: 'Reports & Analytics', settings: 'Settings',
  };

  const reqPlans = {
    rooms: 'starter', bookings: 'starter', billing: 'starter',
    notifications: 'starter', reports: 'starter', settings: 'starter',
    employees: 'starter', analytics: 'starter',
    guests: 'professional', loyalty: 'professional',
    housekeeping: 'professional', restaurant: 'professional', laundry: 'professional',
    attendance: 'starter', payroll: 'professional', channel: 'professional',
    marketing: 'professional', whatsapp: 'professional', inventory: 'professional',
    checkin: 'starter', travel: 'enterprise', travels: 'enterprise', events: 'enterprise',
    iot: 'enterprise', security: 'enterprise',
    revenue: 'starter', complaints: 'starter',
  };

  const roleAllowedPages = {
    manager: Object.keys(titles), // Manager gets everything
    hotel_admin: Object.keys(titles),
    platform_admin: Object.keys(titles),
    reception: ['dashboard', 'rooms', 'bookings', 'checkin', 'guests', 'billing', 'restaurant', 'laundry', 'attendance', 'complaints', 'settings', 'travel', 'travels'],
    housekeeping: ['dashboard', 'housekeeping', 'maintenance', 'settings'],
    hotel_staff: ['dashboard', 'settings']
  };

  const currentRolePages = roleAllowedPages[role] || roleAllowedPages['hotel_staff'];
  const hasRoleAccess = currentRolePages.includes(page);
  const hasPlanAccess = allowed.includes(page);

  const subtitles = {
    starter: 'Starter Plan',
    professional: 'Professional Plan',
    enterprise: 'Enterprise Plan',
  };

  const getPage = () => {
    if (!hasPlanAccess) {
      return <LockedPage feature={titles[page]} requiredPlan={reqPlans[page] || 'professional'} onNav={setPage} />;
    }
    if (!hasRoleAccess) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--rose)' }}>
          <h2>Access Denied</h2>
          <p>Your role ({role}) does not have permission to view this module.</p>
        </div>
      );
    }
    switch (page) {
      case 'dashboard': return <HotelDashboard plan={plan} onNav={setPage} />;
      case 'rooms': return <RoomsPage onNav={setPage} role={role} hotelDetails={hotelDetails} />;
      case 'bookings': return <BookingsPage />;
      case 'checkin': return <CheckInOutPage />;
      case 'billing': return <BillingPage />;
      case 'guests': return <GuestCRMPage />;
      case 'loyalty': return <LoyaltyPage />;
      case 'restaurant': return <RestaurantPOS role={role} hotelDetails={hotelDetails} />;
      case 'laundry': return <LaundryPage />;
      case 'travel': return <TravelDeskPage />;
      case 'travels': return <TravelsManagementPage />;
      case 'events': return <EventsPage />;
      case 'employees': return <EmployeesPage role={role} hotelDetails={hotelDetails} plan={plan} />;
      case 'attendance': return <AttendancePage />;
      case 'housekeeping': return <HousekeepingPage />;
      case 'maintenance': return <MaintenancePage />;
      case 'payroll': return <PayrollPage />;
      case 'channel': return <ChannelManagerPage />;
      case 'revenue': return <DailyRevenueReportPage />;
      case 'analytics': return <AnalyticsDashboard />;
      case 'marketing': return <MarketingPage />;
      case 'whatsapp': return <WhatsAppPage />;
      case 'inventory': return <InventoryPage />;
      case 'iot': return <IoTPage />;
      case 'security': return <SecurityPage />;
      case 'notifications': return <NotificationsPage plan={plan} />;
      case 'reports': return <ReportsPage />;
      case 'settings': return <SettingsPage role="hotel" plan={plan} onNav={setPage} />;
      case 'pos': return <ComingSoon title="Restaurant POS" icon="restaurant" color="var(--amber)" />;
      case 'complaints': return <ComplaintsPage />;
      default: return <ComingSoon title={titles[page] || page} icon="hotel" color="var(--gold)" />;
    }
  };

  return (
    <NotificationProvider hotelDetails={hotelDetails}>
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)' }}>
      <Sidebar role={role} active={page} onNav={setPage} onLogout={onLogout} plan={plan} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar
          title={titles[page] || 'Dashboard'}
          subtitle={subtitles[plan] || 'StayOS Platform'}
          role={role}
          onNav={setPage}
          hotelDetails={hotelDetails}
          toggleSidebar={() => setIsSidebarOpen(true)}
        />
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {getPage()}
        </div>
      </div>
    </div>
    </NotificationProvider>
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

  // ── Clear legacy mock data ──
  useEffect(() => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('stayos_') && !['stayos_theme', 'stayos_token', 'stayos_user'].includes(key)) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  // ── Session restore ──
  useEffect(() => {
    const token = authService.getToken();
    const cachedUser = authService.getUser();
    
    const getUIRole = (u) => {
      if (u.role === 'platform_admin' || u.role === 'hotel_admin' || u.department === 'Manager') return 'manager';
      if (u.role === 'receptionist' || u.department === 'Front Desk') return 'reception';
      if (u.role === 'housekeeping' || u.department === 'Housekeeping') return 'housekeeping';
      return 'staff';
    };

    // Quick optimistic restore
    if (token && cachedUser) {
      setIsAuthenticated(true);
      if (cachedUser.role === 'platform_admin') {
        setLoginType('admin');
        setHotelRole('manager');
        setHotelPlan('enterprise');
      } else {
        setLoginType('hotel');
        setHotelRole(getUIRole(cachedUser));
        setHotelPlan(cachedUser.hotel?.plan || 'enterprise');
        setCurrentHotel(cachedUser.hotel);
      }
      setAuthReady(true);
    }
    
    if (token) {
      authService.getMe()
        .then((user) => {
          authService.setUser(user); // refresh cache
          setIsAuthenticated(true);
          if (user.role === 'platform_admin') {
            setLoginType('admin');
            setHotelRole('manager');
            setHotelPlan('enterprise');
          } else {
            setLoginType('hotel');
            setHotelRole(getUIRole(user));
            setHotelPlan(user.hotel?.plan || 'enterprise');
            setCurrentHotel(user.hotel);
          }
          if (!authReady) setAuthReady(true);
        })
        .catch(() => {
          authService.logout();
          setIsAuthenticated(false);
          setLoginType(null);
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
    setLoginType('hotel');
    setHotelPlan(plan || 'enterprise');
    setHotelRole(role || 'manager');
    setCurrentHotel(hotelDetails || null);
    setIsAuthenticated(true);
    navigate('/hotel/dashboard');
  };

  const handleLogout = () => {
    authService.logout().catch(() => { });
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
      <Route path="/login/admin" element={<Login type="admin" onSuccess={() => { setLoginType('admin'); setIsAuthenticated(true); navigate('/admin/dashboard'); }} onBack={() => navigate('/')} />} />
      <Route path="/login/hotel" element={<Login type="hotel" onSuccess={handleHotelSuccess} onBack={() => navigate('/')} />} />
      <Route path="/admin/*" element={
        <ProtectedRoute isAuthenticated={isAuthenticated} authReady={authReady}>
          {loginType === 'admin' ? <AdminApp onLogout={handleLogout} theme={theme} setTheme={setTheme} /> : <Navigate to="/hotel/dashboard" replace />}
        </ProtectedRoute>
      } />
      <Route path="/hotel/*" element={
        <ProtectedRoute isAuthenticated={isAuthenticated} authReady={authReady}>
          {(loginType === 'hotel' || loginType === 'admin') ? <HotelApp onLogout={handleLogout} initialPlan={hotelPlan} role={hotelRole} hotelDetails={currentHotel} theme={theme} setTheme={setTheme} /> : <Navigate to="/admin/dashboard" replace />}
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
