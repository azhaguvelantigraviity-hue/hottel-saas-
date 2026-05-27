import React, { useState } from 'react';
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
import SmartCheckInPage from './pages/SmartCheckInPage';
import InventoryPage from './pages/InventoryPage';
import LoyaltyPage from './pages/LoyaltyPage';
import EventsPage from './pages/EventsPage';
import LaundryPage from './pages/LaundryPage';
import TravelDeskPage from './pages/TravelDeskPage';
import BillingPage from './pages/BillingPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import ChatbotPage from './pages/ChatbotPage';
import SecurityPage from './pages/SecurityPage';
import IoTPage from './pages/IoTPage';
import WhatsAppPage from './pages/WhatsAppPage';
import NotificationsPage from './pages/NotificationsPage';
import MarketingPage from './pages/MarketingPage';
import MultiBranchPage from './pages/MultiBranchPage';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

// ── ADMIN APP ─────────────────────────────────────────────────────────────────
const AdminApp = ({ onLogout }) => {
  const [page, setPage] = useState('dashboard');

  const pages = {
    dashboard: <AdminDashboard onNav={setPage} />,
    hotels: <AdminHotels />,
    subscriptions: <AdminSubscriptions />,
    revenue: <ComingSoon title="Revenue Management" icon="dollar" color="var(--teal)" />,
    analytics: <AnalyticsDashboard />,
    multibranch: <MultiBranchPage />,
    audit: <ComingSoon title="Audit Logs" icon="shield" color="var(--rose)" />,
    settings: <SettingsPage role="admin" />,
  };

  const titles = {
    dashboard: 'Platform Overview', hotels: 'Managed Hotels', subscriptions: 'Subscriptions',
    revenue: 'Revenue', analytics: 'Analytics', multibranch: 'Multi-Branch Management',
    audit: 'Audit Logs', settings: 'Settings',
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--obsidian)' }}>
      <Sidebar role="admin" active={page} onNav={setPage} onLogout={onLogout} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar title={titles[page] || 'Admin'} subtitle="StayOS Platform Administration" role="admin" />
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {pages[page] || pages.dashboard}
        </div>
      </div>
    </div>
  );
};

// ── HOTEL APP ─────────────────────────────────────────────────────────────────
const HotelApp = ({ onLogout, initialPlan = 'enterprise' }) => {
  const [page, setPage] = useState('dashboard');
  const plan = initialPlan;

  const planFeatures = {
    starter: ['dashboard','rooms','bookings','billing','notifications','reports','settings'],
    professional: ['dashboard','rooms','bookings','billing','notifications','guests','loyalty','employees','housekeeping','restaurant','laundry','maintenance','channel','analytics','marketing','whatsapp','inventory','reports','settings'],
    enterprise: ['dashboard','rooms','bookings','billing','notifications','checkin','guests','loyalty','restaurant','laundry','travel','events','employees','housekeeping','maintenance','channel','revenue','analytics','marketing','whatsapp','inventory','iot','security','chatbot','reports','settings'],
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
    security: 'Security & CCTV', chatbot: 'AI Chatbot',
    notifications: 'Notifications', reports: 'Reports & Analytics', settings: 'Settings',
  };

  const reqPlans = {
    checkin: 'enterprise', travel: 'enterprise', events: 'enterprise',
    iot: 'enterprise', security: 'enterprise', chatbot: 'enterprise',
    guests: 'professional', loyalty: 'professional', employees: 'professional',
    housekeeping: 'professional', restaurant: 'professional', laundry: 'professional',
    maintenance: 'professional', channel: 'professional', analytics: 'professional',
    marketing: 'professional', whatsapp: 'professional', inventory: 'professional',
    revenue: 'enterprise',
  };

  const subtitles = {
    starter: 'Hilltop Heritage Inn — Starter Plan',
    professional: 'Azure Boutique Hotel — Professional Plan',
    enterprise: 'The Grand Meridian — Enterprise Plan',
  };

  const getPage = () => {
    if (!allowed.includes(page)) {
      return <LockedPage feature={titles[page]} requiredPlan={reqPlans[page] || 'professional'} onNav={setPage} />;
    }
    switch (page) {
      case 'dashboard': return <HotelDashboard plan={plan} onNav={setPage} />;
      case 'rooms': return <RoomsPage onNav={setPage} />;
      case 'bookings': return <BookingsPage />;
      case 'checkin': return <SmartCheckInPage />;
      case 'billing': return <BillingPage />;
      case 'guests': return <GuestCRMPage />;
      case 'loyalty': return <LoyaltyPage />;
      case 'restaurant': return <RestaurantPOS />;
      case 'laundry': return <LaundryPage />;
      case 'travel': return <TravelDeskPage />;
      case 'events': return <EventsPage />;
      case 'employees': return <EmployeesPage />;
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
      case 'chatbot': return <ChatbotPage />;
      case 'notifications': return <NotificationsPage />;
      case 'reports': return <ReportsPage />;
      case 'settings': return <SettingsPage role="hotel" plan={plan} onNav={setPage} />;
      default: return <ComingSoon title={titles[page] || page} icon="hotel" color="var(--gold)" />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--obsidian)' }}>
      <Sidebar role="hotel" active={page} onNav={setPage} onLogout={onLogout} plan={plan} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar title={titles[page] || 'Hotel'} subtitle={subtitles[plan]} role="hotel" />
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {getPage()}
        </div>
      </div>
    </div>
  );
};

// ── ROOT ──────────────────────────────────────────────────────────────────────
const App = () => {
  const [screen, setScreen] = useState('landing');
  const [loginType, setLoginType] = useState(null);
  const [hotelPlan, setHotelPlan] = useState('enterprise');

  const handleLogin = (type) => {
    setLoginType(type);
    setScreen(`login-${type}`);
  };

  const handleHotelSuccess = (plan) => {
    setHotelPlan(plan || 'enterprise');
    setScreen('hotel');
  };

  return (
    <>
      {screen === 'landing' && <Landing onLogin={handleLogin} />}
      {screen === 'login-admin' && <Login type="admin" onSuccess={() => setScreen('admin')} onBack={() => setScreen('landing')} />}
      {screen === 'login-hotel' && <Login type="hotel" onSuccess={handleHotelSuccess} onBack={() => setScreen('landing')} />}
      {screen === 'admin' && <AdminApp onLogout={() => setScreen('landing')} />}
      {screen === 'hotel' && <HotelApp onLogout={() => setScreen('landing')} initialPlan={hotelPlan} />}
    </>
  );
};

export default App;
