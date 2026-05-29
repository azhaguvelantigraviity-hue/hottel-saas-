// ── Plan definitions — admin can edit prices via AdminSubscriptions ──────────
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

// Safe helper — always returns a valid plan object even if key is missing
export const getPlan = (planKey) =>
  PLANS[planKey] || { id: planKey, name: planKey, price: 0, accent: '#6B7280', features: [], missing: [] };

export const HOTELS = [];
export const ROOMS = [
  { id: '101', type: 'Deluxe King',   floor: 1, status: 'available',   housekeeping: 'clean',   rate: 4500, guest: '' },
  { id: '102', type: 'Deluxe Twin',   floor: 1, status: 'occupied',    housekeeping: 'clean',   rate: 4700, guest: 'Aarav Shah' },
  { id: '103', type: 'Suite',         floor: 1, status: 'reserved',    housekeeping: 'inspect', rate: 7800, guest: 'Neha Kapoor' },
  { id: '201', type: 'Executive',     floor: 2, status: 'available',   housekeeping: 'clean',   rate: 5600, guest: '' },
  { id: '202', type: 'Premium Suite', floor: 2, status: 'maintenance', housekeeping: 'dirty',   rate: 9200, guest: '' },
  { id: '203', type: 'Deluxe King',   floor: 2, status: 'available',   housekeeping: 'clean',   rate: 4900, guest: '' },
];
export const EMPLOYEES        = [];
export const ATTENDANCE       = [];
export const BOOKINGS         = [];
export const GUESTS           = [];
export const HOUSEKEEPING_TASKS   = [];
export const MAINTENANCE_TICKETS  = [];
export const RESTAURANT_ORDERS    = [];
export const MENU_ITEMS           = [];
export const CHANNEL_DATA         = [];
export const REVENUE_DATA         = [];
export const ADMIN_REVENUE        = [];
export const PET_CHARGES = {
  small:  { label: 'Small Pet (Cat, Rabbit)',  perNight: 400  },
  medium: { label: 'Medium Pet (Small Dog)',   perNight: 650  },
  large:  { label: 'Large Pet (Large Dog)',    perNight: 900  },
  deposit: 2000,
};
