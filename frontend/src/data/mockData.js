// ── Plan definitions — admin can edit prices via AdminSubscriptions ──────────
export const PLANS = {};

// Safe helper — always returns a valid plan object even if key is missing
export const getPlan = (planKey) =>
  PLANS[planKey] || { id: planKey, name: planKey, price: 0, accent: '#6B7280', features: [], missing: [] };

export const HOTELS = [];
export const ROOMS = [];
export const EMPLOYEES        = [];
export const ATTENDANCE       = [];
export const BOOKINGS         = [];
export const GUESTS           = [];
export const HOUSEKEEPING_TASKS   = [];
export const MAINTENANCE_TICKETS  = [];
export const RESTAURANT_ORDERS    = [];
export const MENU_ITEMS = [];
export const HALLS = [];
export const EVENT_BOOKINGS = [];
export const CATERING_PACKAGES = [];
export const CAMERAS = [];
export const VISITORS = [];
export const ACTIVITY = [];
export const SESSIONS = [];
export const CHANNEL_DATA = [];
export const REVENUE_DATA         = [];
export const ADMIN_REVENUE        = [];
export const PET_CHARGES = {
  deposit: 2000,
  small: { label: 'Small (under 10kg)', perNight: 500 },
  medium: { label: 'Medium (10-25kg)', perNight: 800 },
  large: { label: 'Large (over 25kg)', perNight: 1200 },
};
