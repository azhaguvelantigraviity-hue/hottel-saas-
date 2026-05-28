export const PLANS = {
  starter: {
    id: 'starter', name: 'Starter', price: 49, color: '#6E6A62', accent: '#B8B4AA',
    features: ['Up to 30 Rooms','Basic Room Booking','Guest Check-in/out','Simple Reports','Email Support','1 Staff Account','Basic Invoicing'],
    missing: ['Employee Management','Housekeeping Module','POS Restaurant','CRM & Loyalty','Advanced Analytics','Multi-Property','API Access','Custom Branding']
  },
  professional: {
    id: 'professional', name: 'Professional', price: 149, color: '#2DD4BF', accent: '#2DD4BF',
    features: ['Up to 150 Rooms','Full Room Booking & Calendar','Guest Management & CRM','Employee Management','Housekeeping Module','POS – Restaurant & Bar','Advanced Reports & Analytics','5 Staff Accounts','Priority Support','Custom Invoicing','Maintenance Tracking','Channel Manager (OTA Sync)'],
    missing: ['Multi-Property','White-label Branding','API Access','Revenue Management AI','Dedicated Account Manager']
  },
  enterprise: {
    id: 'enterprise', name: 'Enterprise', price: 399, color: '#C9A84C', accent: '#C9A84C',
    features: ['Unlimited Rooms','Unlimited Staff Accounts','All Professional Features','Multi-Property Dashboard','White-label & Custom Branding','Full API Access','Revenue Management AI','Dedicated Account Manager','SLA 99.9% Uptime','Advanced Security & Audit Logs','Custom Integrations','24/7 Phone Support','Onboarding & Training'],
    missing: []
  }
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

export const PET_CHARGES = {
  small: { label: 'Small (Cat, Rabbit, etc.)', perNight: 500 },
  medium: { label: 'Medium (Small Dog)', perNight: 750 },
  large: { label: 'Large (Large Dog)', perNight: 1000 },
  deposit: 2000,
};
