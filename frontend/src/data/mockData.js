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
export const MENU_ITEMS = [
  // ── Breakfast ────────────────────────
  { id: 'M01', name: 'Idli (2 pcs)',          price: 60,  category: 'Breakfast',  available: true },
  { id: 'M02', name: 'Masala Dosa',           price: 110, category: 'Breakfast',  available: true },
  { id: 'M03', name: 'Vada (2 pcs)',          price: 50,  category: 'Breakfast',  available: true },
  { id: 'M04', name: 'Poha',                  price: 45,  category: 'Breakfast',  available: true },
  { id: 'M05', name: 'Upma',                  price: 40,  category: 'Breakfast',  available: true },
  { id: 'M06', name: 'Poori Bhaji',           price: 80,  category: 'Breakfast',  available: true },
  // ── Starters ──────────────────────────
  { id: 'M07', name: 'Spring Rolls (6 pcs)',  price: 180, category: 'Starters',   available: true },
  { id: 'M08', name: 'Chicken Lollipop (6)',  price: 250, category: 'Starters',   available: true },
  { id: 'M09', name: 'Gobi Manchurian',       price: 160, category: 'Starters',   available: true },
  { id: 'M10', name: 'Potato Wedges',         price: 130, category: 'Starters',   available: true },
  { id: 'M11', name: 'Chilli Paneer',         price: 200, category: 'Starters',   available: true },
  // ── Main Course ───────────────────────
  { id: 'M12', name: 'Butter Chicken',        price: 350, category: 'Main Course', available: true },
  { id: 'M13', name: 'Dal Makhani',           price: 220, category: 'Main Course', available: true },
  { id: 'M14', name: 'Rogan Josh',            price: 380, category: 'Main Course', available: true },
  { id: 'M15', name: 'Hyderabadi Biryani',    price: 320, category: 'Main Course', available: true },
  { id: 'M16', name: 'Paneer Butter Masala',  price: 280, category: 'Main Course', available: true },
  { id: 'M17', name: 'Chicken Curry',         price: 300, category: 'Main Course', available: true },
  // ── Breads ────────────────────────────
  { id: 'M18', name: 'Tandoori Roti',         price: 30,  category: 'Breads',     available: true },
  { id: 'M19', name: 'Butter Naan',           price: 40,  category: 'Breads',     available: true },
  { id: 'M20', name: 'Laccha Paratha',        price: 45,  category: 'Breads',     available: true },
  { id: 'M21', name: 'Garlic Naan',           price: 50,  category: 'Breads',     available: true },
  // ── Desserts ──────────────────────────
  { id: 'M22', name: 'Gulab Jamun (3 pcs)',   price: 80,  category: 'Desserts',   available: true },
  { id: 'M23', name: 'Rasmalai (2 pcs)',      price: 100, category: 'Desserts',   available: true },
  { id: 'M24', name: 'Ice Cream (1 scoop)',   price: 60,  category: 'Desserts',   available: true },
  { id: 'M25', name: 'Chocolate Brownie',     price: 120, category: 'Desserts',   available: true },
  // ── Beverages ─────────────────────────
  { id: 'M26', name: 'Masala Chai',           price: 25,  category: 'Beverages',  available: true },
  { id: 'M27', name: 'Filter Coffee',         price: 30,  category: 'Beverages',  available: true },
  { id: 'M28', name: 'Fresh Lime Water',      price: 40,  category: 'Beverages',  available: true },
  { id: 'M29', name: 'Cold Drink',            price: 50,  category: 'Beverages',  available: true },
  { id: 'M30', name: 'Buttermilk',            price: 30,  category: 'Beverages',  available: true },
  // ── Snacks ────────────────────────────
  { id: 'M31', name: 'French Fries',          price: 90,  category: 'Snacks',     available: true },
  { id: 'M32', name: 'Veg Sandwich',          price: 100, category: 'Snacks',     available: true },
  { id: 'M33', name: 'Onion Pakora',          price: 70,  category: 'Snacks',     available: true },
  { id: 'M34', name: 'Samosa (2 pcs)',        price: 40,  category: 'Snacks',     available: true },
];
// ── Event Halls ─────────────────────────
export const HALLS = [
  { id: 'H01', name: 'Grand Ballroom', capacity: 500, rate: 85000, description: 'Our premium indoor hall with stage, sound system, and elegant decor perfect for weddings and galas.', amenities: ['Stage','Sound System','AC','Projector','Dance Floor','Backstage','Dining Area'], available: [true,true,true,true,true,false,false] },
  { id: 'H02', name: 'Crystal Hall', capacity: 250, rate: 45000, description: 'A modern mid-sized hall with crystal chandeliers and premium audio-visual equipment.', amenities: ['Stage','Sound System','AC','Projector','Dance Floor','Dining Area'], available: [true,true,false,true,true,true,false] },
  { id: 'H03', name: 'Garden Lawn', capacity: 300, rate: 55000, description: 'Beautiful open-air garden venue surrounded by lush greenery, ideal for outdoor events and receptions.', amenities: ['Open Air','Stage','Sound System','Catering Setup','Lighting','Parking'], available: [true,false,true,true,false,true,true] },
  { id: 'H04', name: 'Conference Room', capacity: 60, rate: 15000, description: 'Fully equipped boardroom with video conferencing facilities for corporate events and meetings.', amenities: ['AC','Projector','Video Conferencing','Whiteboard','WiFi','Coffee Station'], available: [true,true,true,true,true,true,false] },
  { id: 'H05', name: 'Poolside Deck', capacity: 150, rate: 35000, description: 'Scenic poolside venue with a relaxed ambiance for cocktail parties and social gatherings.', amenities: ['Pool View','Sound System','Bar Setup','Lighting','Dining Area'], available: [true,true,true,false,true,true,true] },
  { id: 'H06', name: 'Banquet Hall', capacity: 350, rate: 65000, description: 'Spacious indoor banquet hall with traditional decor, ideal for large family celebrations.', amenities: ['Stage','Sound System','AC','Projector','Dance Floor','Dining Area','Backstage'], available: [true,true,true,true,false,false,true] },
];

// ── Event Bookings ──────────────────────
export const EVENT_BOOKINGS = [
  { id: 'EVT-001', event: 'Sharma Wedding Reception',  hall: 'Grand Ballroom', date: '2026-06-15', client: 'Ravi Sharma',   phone: '9876543210', email: 'ravi@email.com', guests: 350, catering: 'Gold',   amount: 415000, status: 'confirmed', deposit: 100000, paymentMethod: 'transfer', paymentStatus: 'partial', dueDate: '2026-06-01', paymentDate: '2026-05-20', refundAmount: 0, notes: 'Need vegetarian options for 100 guests' },
  { id: 'EVT-002', event: 'TechCorp Annual Meet',      hall: 'Crystal Hall',   date: '2026-06-20', client: 'Priya Mehta',   phone: '9876543211', email: 'priya@techcorp.com', guests: 200, catering: 'Silver', amount: 175000, status: 'confirmed', deposit: 175000, paymentMethod: 'card', paymentStatus: 'paid', dueDate: '2026-06-10', paymentDate: '2026-05-25', refundAmount: 0, notes: 'Stage required for presentations' },
  { id: 'EVT-003', event: 'Kapoor Birthday Party',     hall: 'Garden Lawn',    date: '2026-06-10', client: 'Amit Kapoor',   phone: '9876543212', email: 'amit@email.com', guests: 150, catering: 'Gold',   amount: 207500, status: 'pending', deposit: 0, paymentMethod: '', paymentStatus: 'unpaid', dueDate: '2026-06-05', paymentDate: '', refundAmount: 0, notes: 'DJ and dance floor setup required' },
  { id: 'EVT-004', event: 'Q2 Board Meeting',          hall: 'Conference Room',date: '2026-05-28', client: 'Sneha Gupta',   phone: '9876543213', email: 'sneha@corp.com', guests: 45, catering: 'Silver', amount: 44250, status: 'completed', deposit: 44250, paymentMethod: 'cash', paymentStatus: 'paid', dueDate: '2026-05-25', paymentDate: '2026-05-20', refundAmount: 0, notes: 'Video conferencing with remote members' },
  { id: 'EVT-005', event: 'Patel Engagement Ceremony', hall: 'Banquet Hall',   date: '2026-07-02', client: 'Neha Patel',    phone: '9876543214', email: 'neha@email.com', guests: 280, catering: 'Platinum', amount: 457000, status: 'pending', deposit: 50000, paymentMethod: 'upi', paymentStatus: 'partial', dueDate: '2026-06-25', paymentDate: '2026-05-28', refundAmount: 0, notes: 'Traditional engagement ceremony - mandap required' },
  { id: 'EVT-006', event: 'Sunset Cocktail Party',     hall: 'Poolside Deck',  date: '2026-05-25', client: 'Vikram Singh',  phone: '9876543215', email: 'vikram@email.com', guests: 120, catering: 'Gold',   amount: 163000, status: 'cancelled', deposit: 50000, paymentMethod: 'card', paymentStatus: 'refunded', dueDate: '2026-05-20', paymentDate: '2026-05-10', refundAmount: 50000, notes: 'Cancelled due to date conflict. Refund processed.' },
];

// ── Catering Packages ───────────────────
export const CATERING_PACKAGES = [
  { name: 'Silver',  price: 650,  items: ['Welcome Drink (1)', 'Starter (1 Veg + 1 Non-Veg)', 'Main Course (2 Veg + 1 Non-Veg)', 'Dessert (1)', 'Beverage (1)', 'Bread & Rice'] },
  { name: 'Gold',    price: 950,  items: ['Welcome Drink (2)', 'Starter (2 Veg + 2 Non-Veg)', 'Main Course (3 Veg + 2 Non-Veg)', 'Dessert (2)', 'Beverage (2)', 'Bread & Rice', 'Salad Counter'] },
  { name: 'Platinum', price: 1400, items: ['Welcome Drink (3)', 'Starter (3 Veg + 3 Non-Veg)', 'Main Course (4 Veg + 3 Non-Veg)', 'Dessert (3)', 'Beverage (3)', 'Bread & Rice', 'Salad Counter', 'Live Pasta Counter', 'Chat Counter'] },
];

// ── Security & Access Control ───────────
export const CAMERAS = [
  { id: 'CAM-01', location: 'Main Entrance', status: 'live', type: 'Dome 4K', lastMotion: '2 min ago', recording: true },
  { id: 'CAM-02', location: 'Lobby', status: 'live', type: 'Bullet 4K', lastMotion: '8 min ago', recording: true },
  { id: 'CAM-03', location: 'Parking Lot', status: 'live', type: 'PTZ 2K', lastMotion: '1 hr ago', recording: true },
  { id: 'CAM-04', location: 'Restaurant', status: 'live', type: 'Dome 2K', lastMotion: '30 sec ago', recording: true },
  { id: 'CAM-05', location: 'Pool Area', status: 'live', type: 'Bullet 4K', lastMotion: '15 min ago', recording: true },
  { id: 'CAM-06', location: 'Back Office', status: 'offline', type: 'Dome 2K', lastMotion: 'N/A', recording: false },
  { id: 'CAM-07', location: 'Corridor – Floor 1', status: 'live', type: 'Bullet 2K', lastMotion: '5 min ago', recording: true },
  { id: 'CAM-08', location: 'Corridor – Floor 2', status: 'live', type: 'Bullet 2K', lastMotion: '12 min ago', recording: true },
];

export const VISITORS = [
  { id: 'VIS-001', name: 'Rajesh Kumar', purpose: 'Vendor Meeting', host: 'Priya Sharma', checkIn: '09:15 AM', checkOut: '10:45 AM', idVerified: true, phone: '9876500001', vehicle: 'MH-01-AB-1234' },
  { id: 'VIS-002', name: 'Sneha Patel', purpose: 'Interview', host: 'Amit Verma', checkIn: '10:30 AM', checkOut: '11:45 AM', idVerified: true, phone: '9876500002', vehicle: '' },
  { id: 'VIS-003', name: 'Vikram Joshi', purpose: 'Guest', host: 'Deepa Nair (Room 203)', checkIn: '12:00 PM', checkOut: '', idVerified: false, phone: '9876500003', vehicle: 'MH-02-CD-5678' },
  { id: 'VIS-004', name: 'Ananya Reddy', purpose: 'Food Delivery', host: 'Kitchen', checkIn: '12:30 PM', checkOut: '12:45 PM', idVerified: false, phone: '9876500004', vehicle: '' },
  { id: 'VIS-005', name: 'Rohit Mehta', purpose: 'Maintenance', host: 'Housekeeping', checkIn: '02:00 PM', checkOut: '04:30 PM', idVerified: true, phone: '9876500005', vehicle: '' },
  { id: 'VIS-006', name: 'Kavita Sharma', purpose: 'Event Planning', host: 'Events Team', checkIn: '03:00 PM', checkOut: '', idVerified: true, phone: '9876500006', vehicle: 'MH-03-EF-9012' },
  { id: 'VIS-007', name: 'Arun Singh', purpose: 'Guest', host: 'Ravi Gupta (Room 102)', checkIn: '05:15 PM', checkOut: '07:30 PM', idVerified: true, phone: '9876500007', vehicle: '' },
  { id: 'VIS-008', name: 'Neha Kapoor', purpose: 'Personal Visit', host: 'Manager Office', checkIn: '06:00 PM', checkOut: '', idVerified: false, phone: '9876500008', vehicle: 'MH-04-GH-3456' },
];

export const ACTIVITY = [
  { id: 'ACT-001', type: 'login', action: 'Staff Login', detail: 'User logged in from Lobby Terminal', user: 'Reception', ip: '192.168.1.42', time: '08:02 AM' },
  { id: 'ACT-002', type: 'system', action: 'Door Access', detail: 'Back Office door unlocked — Keycard #2042', user: 'System', ip: '192.168.1.1', time: '08:15 AM' },
  { id: 'ACT-003', type: 'booking', action: 'New Booking', detail: 'Room 304 booked by walk-in guest', user: 'Priya S.', ip: '192.168.1.42', time: '09:30 AM' },
  { id: 'ACT-004', type: 'housekeeping', action: 'Room Status Change', detail: 'Room 205 marked as Inspected', user: 'Housekeeping', ip: '192.168.1.55', time: '10:00 AM' },
  { id: 'ACT-005', type: 'payment', action: 'Payment Processed', detail: 'Invoice #INV-024 paid – ₹12,500', user: 'Cashier', ip: '192.168.1.60', time: '11:15 AM' },
  { id: 'ACT-006', type: 'login', action: 'Staff Logout', detail: 'User logged out from Lobby Terminal', user: 'Reception', ip: '192.168.1.42', time: '12:00 PM' },
  { id: 'ACT-007', type: 'system', action: 'Motion Alert', detail: 'Motion detected at Parking Lot after hours', user: 'System', ip: '192.168.1.1', time: '01:45 AM' },
  { id: 'ACT-008', type: 'booking', action: 'Booking Cancelled', detail: 'Room 108 cancelled — refund requested', user: 'Amit V.', ip: '192.168.1.42', time: '02:20 PM' },
  { id: 'ACT-009', type: 'housekeeping', action: 'Maintenance Request', detail: 'AC repair requested for Room 402', user: 'Maintenance', ip: '192.168.1.55', time: '03:00 PM' },
  { id: 'ACT-010', type: 'payment', action: 'Refund Issued', detail: 'Refund processed – ₹4,500', user: 'Cashier', ip: '192.168.1.60', time: '04:30 PM' },
  { id: 'ACT-011', type: 'system', action: 'Firmware Update', detail: 'Camera CAM-03 firmware updated to v2.4.1', user: 'System', ip: '192.168.1.1', time: '05:00 PM' },
  { id: 'ACT-012', type: 'login', action: 'Remote Access', detail: 'Admin dashboard accessed from external IP', user: 'Admin', ip: '203.0.113.42', time: '06:45 PM' },
];

export const SESSIONS = [
  { id: 'SES-01', device: 'Chrome – Windows', location: 'Lobby Reception PC', lastActive: 'Just now', current: true, browser: 'Chrome 125', ip: '192.168.1.42' },
  { id: 'SES-02', device: 'Safari – macOS', location: 'Manager Cabin', lastActive: '2 hours ago', current: false, browser: 'Safari 18', ip: '192.168.1.100' },
  { id: 'SES-03', device: 'Chrome – Android', location: 'Remote – Mumbai', lastActive: 'Yesterday at 8:15 PM', current: false, browser: 'Chrome Mobile 124', ip: '203.0.113.50' },
  { id: 'SES-04', device: 'Firefox – Linux', location: 'IT Server Room', lastActive: '3 days ago', current: false, browser: 'Firefox 127', ip: '192.168.1.10' },
  { id: 'SES-05', device: 'Safari – iOS', location: 'Remote – Delhi', lastActive: '5 days ago', current: false, browser: 'Mobile Safari 18', ip: '198.51.100.75' },
];

export const CHANNEL_DATA = [
  { channel: 'Booking.com', color: '#FF5A5F', revenue: 1250000, bookings: 120, commission: 15, pct: 30 },
  { channel: 'Expedia',     color: '#0D6EFD', revenue: 850000,  bookings: 80,  commission: 12, pct: 25 },
  { channel: 'Agoda',       color: '#FF9900', revenue: 400000,  bookings: 45,  commission: 10, pct: 15 },
];
export const REVENUE_DATA         = [];
export const ADMIN_REVENUE        = [];
export const PET_CHARGES = {
  small:  { label: 'Small Pet (Cat, Rabbit)',  perNight: 400  },
  medium: { label: 'Medium Pet (Small Dog)',   perNight: 650  },
  large:  { label: 'Large Pet (Large Dog)',    perNight: 900  },
  deposit: 2000,
};
