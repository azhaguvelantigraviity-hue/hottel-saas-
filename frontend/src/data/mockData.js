export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 4999,
    accent: '#6B7280',
    features: [
      'Dashboard',
      'Room Management',
      'Bookings',
      'Billing',
      'Notifications',
      'Reports',
      'Settings',
    ],
    missing: [
      'Guest CRM',
      'Loyalty Program',
      'Restaurant POS',
      'Revenue AI',
      'Smart Check-In',
      'IoT & Door Locks',
    ],
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 12999,
    accent: '#14B8A6',
    features: [
      'Everything in Starter',
      'Guest CRM',
      'Loyalty Program',
      'Restaurant POS',
      'Housekeeping',
      'Employee Management',
      'Channel Manager',
      'Analytics Dashboard',
    ],
    missing: [
      'Revenue AI',
      'Smart Check-In',
      'Events & Halls',
      'IoT & Door Locks',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 24999,
    accent: '#D97706',
    features: [
      'Everything in Professional',
      'Revenue AI',
      'Smart Check-In',
      'Travel Desk',
      'Events & Halls',
      'IoT & Door Locks',
      'Security & CCTV',
      'AI Chatbot',
    ],
    missing: [],
  },
};

export const HOTELS = [];

export const ROOMS = [];

export const EMPLOYEES = [];

export const ATTENDANCE = [];

export const BOOKINGS = [];

export const GUESTS = [];

export const HOUSEKEEPING_TASKS = [];

export const MAINTENANCE_TICKETS = [];

export const RESTAURANT_ORDERS = [];

export const MENU_ITEMS = [];

export const CHANNEL_DATA = [];

export const REVENUE_DATA = [];

export const ADMIN_REVENUE = [];

export const PET_CHARGES = {};
