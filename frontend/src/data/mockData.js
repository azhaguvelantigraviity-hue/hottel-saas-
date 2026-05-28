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

export const HOTELS = [
  { id: 1, name: 'The Grand Meridian', city: 'Mumbai', plan: 'enterprise', rooms: 240, occupancy: 87, revenue: 284000, staff: 42, status: 'active', joined: '2024-01-15', contact: 'admin@grandmeridian.com', avatar: 'GM' },
  { id: 2, name: 'Azure Boutique Hotel', city: 'Goa', plan: 'professional', rooms: 68, occupancy: 72, revenue: 52000, staff: 14, status: 'active', joined: '2024-03-02', contact: 'ops@azuregoa.com', avatar: 'AB' },
  { id: 3, name: 'Hilltop Heritage Inn', city: 'Shimla', plan: 'starter', rooms: 22, occupancy: 61, revenue: 8400, staff: 6, status: 'active', joined: '2024-05-10', contact: 'info@hilltopinn.com', avatar: 'HH' },
  { id: 4, name: 'Coastal Pearl Resort', city: 'Kochi', plan: 'enterprise', rooms: 185, occupancy: 91, revenue: 198000, staff: 38, status: 'active', joined: '2023-11-20', contact: 'gm@coastalpearl.com', avatar: 'CP' },
  { id: 5, name: 'Metro Stay', city: 'Bangalore', plan: 'professional', rooms: 95, occupancy: 65, revenue: 41000, staff: 18, status: 'trial', joined: '2024-07-01', contact: 'stay@metrobng.com', avatar: 'MS' },
  { id: 6, name: 'Desert Bloom Hotel', city: 'Jaipur', plan: 'starter', rooms: 18, occupancy: 45, revenue: 4200, staff: 4, status: 'suspended', joined: '2024-02-28', contact: 'desert@bloomjaipur.com', avatar: 'DB' },
  { id: 7, name: 'Skyline Suites', city: 'Delhi', plan: 'enterprise', rooms: 310, occupancy: 78, revenue: 312000, staff: 55, status: 'active', joined: '2023-08-10', contact: 'ceo@skylinesuitesdel.com', avatar: 'SS' }
];

export const ROOMS = [
  { id: 101, type: 'Deluxe King', floor: 1, status: 'occupied', guest: 'Arjun Mehta', checkIn: '2025-07-10', checkOut: '2025-07-14', rate: 4200, housekeeping: 'clean' },
  { id: 102, type: 'Standard Twin', floor: 1, status: 'available', guest: null, checkIn: null, checkOut: null, rate: 2800, housekeeping: 'clean' },
  { id: 103, type: 'Suite', floor: 1, status: 'occupied', guest: 'Priya Sharma', checkIn: '2025-07-09', checkOut: '2025-07-15', rate: 8500, housekeeping: 'dirty' },
  { id: 104, type: 'Deluxe King', floor: 1, status: 'maintenance', guest: null, checkIn: null, checkOut: null, rate: 4200, housekeeping: 'clean' },
  { id: 201, type: 'Premium Suite', floor: 2, status: 'occupied', guest: 'Rohit Verma', checkIn: '2025-07-11', checkOut: '2025-07-13', rate: 12000, housekeeping: 'clean' },
  { id: 202, type: 'Standard Twin', floor: 2, status: 'available', guest: null, checkIn: null, checkOut: null, rate: 2800, housekeeping: 'inspect' },
  { id: 203, type: 'Deluxe Queen', floor: 2, status: 'reserved', guest: 'Kavya Nair', checkIn: '2025-07-12', checkOut: '2025-07-16', rate: 3600, housekeeping: 'clean' },
  { id: 204, type: 'Standard Twin', floor: 2, status: 'available', guest: null, checkIn: null, checkOut: null, rate: 2800, housekeeping: 'clean' },
  { id: 301, type: 'Presidential Suite', floor: 3, status: 'occupied', guest: 'Aditya Kumar', checkIn: '2025-07-08', checkOut: '2025-07-18', rate: 28000, housekeeping: 'clean' },
  { id: 302, type: 'Deluxe King', floor: 3, status: 'available', guest: null, checkIn: null, checkOut: null, rate: 4200, housekeeping: 'dirty' },
  { id: 303, type: 'Deluxe Queen', floor: 3, status: 'reserved', guest: 'Sneha Iyer', checkIn: '2025-07-13', checkOut: '2025-07-15', rate: 3600, housekeeping: 'clean' },
  { id: 304, type: 'Suite', floor: 3, status: 'available', guest: null, checkIn: null, checkOut: null, rate: 8500, housekeeping: 'clean' }
];

export const EMPLOYEES = [
  { id: 1, name: 'Rajesh Kumar', role: 'Front Desk Manager', dept: 'Front Office', shift: 'Morning', status: 'on-duty', salary: 45000, joined: '2022-03-15', avatar: 'RK', phone: '9876543210', email: 'rajesh@grandmeridian.com' },
  { id: 2, name: 'Anita Patel', role: 'Housekeeping Supervisor', dept: 'Housekeeping', shift: 'Morning', status: 'on-duty', salary: 38000, joined: '2021-07-20', avatar: 'AP', phone: '9876543211', email: 'anita@grandmeridian.com' },
  { id: 3, name: 'Suresh Nair', role: 'Chef', dept: 'F&B', shift: 'Evening', status: 'off-duty', salary: 52000, joined: '2020-11-05', avatar: 'SN', phone: '9876543212', email: 'suresh@grandmeridian.com' },
  { id: 4, name: 'Meena Joshi', role: 'Receptionist', dept: 'Front Office', shift: 'Night', status: 'on-duty', salary: 28000, joined: '2023-01-10', avatar: 'MJ', phone: '9876543213', email: 'meena@grandmeridian.com' },
  { id: 5, name: 'Vikram Singh', role: 'Security Guard', dept: 'Security', shift: 'Night', status: 'on-duty', salary: 22000, joined: '2022-09-01', avatar: 'VS', phone: '9876543214', email: 'vikram@grandmeridian.com' },
  { id: 6, name: 'Pooja Rao', role: 'Spa Therapist', dept: 'Wellness', shift: 'Morning', status: 'leave', salary: 35000, joined: '2023-05-22', avatar: 'PR', phone: '9876543215', email: 'pooja@grandmeridian.com' },
  { id: 7, name: 'Amit Sharma', role: 'Bartender', dept: 'F&B', shift: 'Evening', status: 'on-duty', salary: 26000, joined: '2023-08-14', avatar: 'AS', phone: '9876543216', email: 'amit@grandmeridian.com' },
  { id: 8, name: 'Deepa Menon', role: 'Concierge', dept: 'Front Office', shift: 'Morning', status: 'on-duty', salary: 30000, joined: '2022-12-01', avatar: 'DM', phone: '9876543217', email: 'deepa@grandmeridian.com' }
];

export const ATTENDANCE = [
  { id: 1, employeeId: 1, name: 'Rajesh Kumar', date: '2025-07-14', checkIn: '08:02', checkOut: '16:15', status: 'present', hours: 8.2, overtime: 0 },
  { id: 2, employeeId: 2, name: 'Anita Patel', date: '2025-07-14', checkIn: '07:55', checkOut: '16:05', status: 'present', hours: 8.2, overtime: 0 },
  { id: 3, employeeId: 3, name: 'Suresh Nair', date: '2025-07-14', checkIn: '14:00', checkOut: '22:30', status: 'present', hours: 8.5, overtime: 0.5 },
  { id: 4, employeeId: 4, name: 'Meena Joshi', date: '2025-07-14', checkIn: '22:05', checkOut: null, status: 'present', hours: null, overtime: 0 },
  { id: 5, employeeId: 5, name: 'Vikram Singh', date: '2025-07-14', checkIn: '22:00', checkOut: null, status: 'present', hours: null, overtime: 0 },
  { id: 6, employeeId: 6, name: 'Pooja Rao', date: '2025-07-14', checkIn: null, checkOut: null, status: 'leave', hours: 0, overtime: 0 },
  { id: 7, employeeId: 7, name: 'Amit Sharma', date: '2025-07-14', checkIn: '14:10', checkOut: '22:45', status: 'present', hours: 8.6, overtime: 0.6 },
  { id: 8, employeeId: 8, name: 'Deepa Menon', date: '2025-07-14', checkIn: '08:00', checkOut: '16:00', status: 'present', hours: 8.0, overtime: 0 },
  { id: 9, employeeId: 1, name: 'Rajesh Kumar', date: '2025-07-13', checkIn: '08:05', checkOut: '16:20', status: 'present', hours: 8.3, overtime: 0 },
  { id: 10, employeeId: 2, name: 'Anita Patel', date: '2025-07-13', checkIn: null, checkOut: null, status: 'absent', hours: 0, overtime: 0 },
  { id: 11, employeeId: 3, name: 'Suresh Nair', date: '2025-07-13', checkIn: '14:00', checkOut: '23:00', status: 'present', hours: 9.0, overtime: 1.0 },
  { id: 12, employeeId: 4, name: 'Meena Joshi', date: '2025-07-13', checkIn: '22:00', checkOut: '06:10', status: 'present', hours: 8.2, overtime: 0.2 },
];

export const BOOKINGS = [
  { id: 'BK-1001', guest: 'Arjun Mehta', room: '101 – Deluxe King', roomId: 101, checkIn: '2025-07-10', checkOut: '2025-07-14', nights: 4, amount: 16800, status: 'checked-in', source: 'direct', phone: '9876500001', email: 'arjun@email.com', adults: 2, children: 0, hasPet: false, petCharge: 0, petType: '', specialRequests: 'High floor preferred' },
  { id: 'BK-1002', guest: 'Priya Sharma', room: '103 – Suite', roomId: 103, checkIn: '2025-07-09', checkOut: '2025-07-15', nights: 6, amount: 51000, status: 'checked-in', source: 'booking.com', phone: '9876500002', email: 'priya@email.com', adults: 2, children: 1, hasPet: true, petCharge: 1500, petType: 'Dog', specialRequests: 'Pet-friendly room, extra towels' },
  { id: 'BK-1003', guest: 'Kavya Nair', room: '203 – Deluxe Queen', roomId: 203, checkIn: '2025-07-12', checkOut: '2025-07-16', nights: 4, amount: 14400, status: 'confirmed', source: 'direct', phone: '9876500003', email: 'kavya@email.com', adults: 1, children: 0, hasPet: false, petCharge: 0, petType: '', specialRequests: '' },
  { id: 'BK-1004', guest: 'Rohit Verma', room: '201 – Premium Suite', roomId: 201, checkIn: '2025-07-11', checkOut: '2025-07-13', nights: 2, amount: 24000, status: 'checked-in', source: 'expedia', phone: '9876500004', email: 'rohit@email.com', adults: 2, children: 2, hasPet: false, petCharge: 0, petType: '', specialRequests: 'Baby cot needed' },
  { id: 'BK-1005', guest: 'Sneha Iyer', room: '303 – Deluxe Queen', roomId: 303, checkIn: '2025-07-13', checkOut: '2025-07-15', nights: 2, amount: 7200, status: 'confirmed', source: 'direct', phone: '9876500005', email: 'sneha@email.com', adults: 2, children: 0, hasPet: true, petCharge: 750, petType: 'Cat', specialRequests: 'Quiet room' },
  { id: 'BK-1006', guest: 'Aditya Kumar', room: '301 – Presidential', roomId: 301, checkIn: '2025-07-08', checkOut: '2025-07-18', nights: 10, amount: 280000, status: 'checked-in', source: 'direct', phone: '9876500006', email: 'aditya@email.com', adults: 2, children: 0, hasPet: false, petCharge: 0, petType: '', specialRequests: 'Airport pickup, champagne on arrival' },
  { id: 'BK-1007', guest: 'Riya Desai', room: '102 – Standard Twin', roomId: 102, checkIn: '2025-07-15', checkOut: '2025-07-17', nights: 2, amount: 5600, status: 'confirmed', source: 'agoda', phone: '9876500007', email: 'riya@email.com', adults: 2, children: 0, hasPet: false, petCharge: 0, petType: '', specialRequests: '' },
  { id: 'BK-1008', guest: 'Karan Malhotra', room: '304 – Suite', roomId: 304, checkIn: '2025-07-16', checkOut: '2025-07-20', nights: 4, amount: 34000, status: 'pending', source: 'direct', phone: '9876500008', email: 'karan@email.com', adults: 2, children: 1, hasPet: true, petCharge: 2000, petType: 'Dog', specialRequests: 'Ground floor preferred for pet' }
];

export const GUESTS = [
  { id: 1, name: 'Arjun Mehta', email: 'arjun@email.com', phone: '9876500001', city: 'Mumbai', visits: 5, totalSpent: 84000, lastVisit: '2025-07-10', status: 'vip', notes: 'Prefers high floor, no smoking', loyalty: 'Gold' },
  { id: 2, name: 'Priya Sharma', email: 'priya@email.com', phone: '9876500002', city: 'Delhi', visits: 3, totalSpent: 153000, lastVisit: '2025-07-09', status: 'regular', notes: 'Travels with pet dog', loyalty: 'Silver' },
  { id: 3, name: 'Kavya Nair', email: 'kavya@email.com', phone: '9876500003', city: 'Kochi', visits: 1, totalSpent: 14400, lastVisit: '2025-07-12', status: 'new', notes: '', loyalty: 'Bronze' },
  { id: 4, name: 'Rohit Verma', email: 'rohit@email.com', phone: '9876500004', city: 'Bangalore', visits: 8, totalSpent: 192000, lastVisit: '2025-07-11', status: 'vip', notes: 'Corporate client, needs invoice', loyalty: 'Platinum' },
  { id: 5, name: 'Sneha Iyer', email: 'sneha@email.com', phone: '9876500005', city: 'Chennai', visits: 2, totalSpent: 21600, lastVisit: '2025-07-13', status: 'regular', notes: 'Quiet room preference, has cat', loyalty: 'Bronze' },
  { id: 6, name: 'Aditya Kumar', email: 'aditya@email.com', phone: '9876500006', city: 'Hyderabad', visits: 12, totalSpent: 840000, lastVisit: '2025-07-08', status: 'vip', notes: 'CEO, requires full privacy, airport pickup', loyalty: 'Platinum' },
];

export const HOUSEKEEPING_TASKS = [
  { id: 1, room: '103', type: 'Full Clean', assignedTo: 'Anita Patel', priority: 'high', status: 'in-progress', notes: 'Guest checked out, deep clean required', time: '09:00' },
  { id: 2, room: '302', type: 'Turndown', assignedTo: 'Anita Patel', priority: 'medium', status: 'pending', notes: '', time: '18:00' },
  { id: 3, room: '202', type: 'Inspection', assignedTo: 'Deepa Menon', priority: 'low', status: 'pending', notes: 'Pre-arrival inspection', time: '14:00' },
  { id: 4, room: '101', type: 'Linen Change', assignedTo: 'Anita Patel', priority: 'medium', status: 'completed', notes: '', time: '10:30' },
  { id: 5, room: '201', type: 'Minibar Restock', assignedTo: 'Amit Sharma', priority: 'low', status: 'completed', notes: '', time: '11:00' },
  { id: 6, room: '301', type: 'Full Clean', assignedTo: 'Anita Patel', priority: 'high', status: 'pending', notes: 'VIP guest, use premium amenities', time: '08:00' },
];

export const MAINTENANCE_TICKETS = [
  { id: 'MT-001', room: '104', issue: 'AC not cooling', category: 'HVAC', priority: 'high', status: 'in-progress', assignedTo: 'Vikram Singh', reported: '2025-07-13', notes: 'Compressor issue suspected' },
  { id: 'MT-002', room: '202', issue: 'Leaking faucet in bathroom', category: 'Plumbing', priority: 'medium', status: 'open', assignedTo: null, reported: '2025-07-14', notes: '' },
  { id: 'MT-003', room: '301', issue: 'TV remote not working', category: 'Electronics', priority: 'low', status: 'resolved', assignedTo: 'Rajesh Kumar', reported: '2025-07-12', notes: 'Battery replaced' },
  { id: 'MT-004', room: 'Lobby', issue: 'Elevator door sensor malfunction', category: 'Elevator', priority: 'high', status: 'open', assignedTo: null, reported: '2025-07-14', notes: 'Vendor called' },
  { id: 'MT-005', room: '103', issue: 'Broken wardrobe door hinge', category: 'Furniture', priority: 'low', status: 'open', assignedTo: null, reported: '2025-07-11', notes: '' },
];

export const RESTAURANT_ORDERS = [
  { id: 'ORD-001', table: 'Room 101', items: [{ name: 'Club Sandwich', qty: 2, price: 450 }, { name: 'Fresh Lime Soda', qty: 2, price: 120 }], total: 1140, status: 'delivered', time: '12:30', type: 'room-service' },
  { id: 'ORD-002', table: 'Table 4', items: [{ name: 'Butter Chicken', qty: 1, price: 680 }, { name: 'Naan', qty: 3, price: 60 }, { name: 'Lassi', qty: 2, price: 150 }], total: 1010, status: 'preparing', time: '13:15', type: 'dine-in' },
  { id: 'ORD-003', table: 'Room 301', items: [{ name: 'Continental Breakfast', qty: 2, price: 850 }, { name: 'Orange Juice', qty: 2, price: 200 }], total: 2100, status: 'pending', time: '07:45', type: 'room-service' },
  { id: 'ORD-004', table: 'Table 2', items: [{ name: 'Grilled Fish', qty: 2, price: 780 }, { name: 'Caesar Salad', qty: 1, price: 380 }], total: 1940, status: 'delivered', time: '19:20', type: 'dine-in' },
];

export const MENU_ITEMS = [
  { id: 1, name: 'Club Sandwich', category: 'Snacks', price: 450, available: true },
  { id: 2, name: 'Butter Chicken', category: 'Main Course', price: 680, available: true },
  { id: 3, name: 'Continental Breakfast', category: 'Breakfast', price: 850, available: true },
  { id: 4, name: 'Grilled Fish', category: 'Main Course', price: 780, available: true },
  { id: 5, name: 'Caesar Salad', category: 'Starters', price: 380, available: true },
  { id: 6, name: 'Naan', category: 'Breads', price: 60, available: true },
  { id: 7, name: 'Fresh Lime Soda', category: 'Beverages', price: 120, available: true },
  { id: 8, name: 'Lassi', category: 'Beverages', price: 150, available: true },
  { id: 9, name: 'Orange Juice', category: 'Beverages', price: 200, available: true },
  { id: 10, name: 'Masala Dosa', category: 'Breakfast', price: 280, available: true },
  { id: 11, name: 'Paneer Tikka', category: 'Starters', price: 420, available: false },
  { id: 12, name: 'Chocolate Lava Cake', category: 'Desserts', price: 320, available: true },
];

export const CHANNEL_DATA = [
  { channel: 'Direct', bookings: 38, revenue: 312000, commission: 0, pct: 45, color: 'var(--gold)' },
  { channel: 'Booking.com', bookings: 22, revenue: 181500, commission: 15, pct: 26, color: 'var(--teal)' },
  { channel: 'Expedia', bookings: 14, revenue: 115500, commission: 18, pct: 17, color: 'var(--violet)' },
  { channel: 'Agoda', bookings: 10, revenue: 82500, commission: 12, pct: 12, color: 'var(--rose)' },
];

export const REVENUE_DATA = [
  { month: 'Jan', revenue: 68000, expenses: 42000, bookings: 124 },
  { month: 'Feb', revenue: 72000, expenses: 44000, bookings: 138 },
  { month: 'Mar', revenue: 89000, expenses: 48000, bookings: 162 },
  { month: 'Apr', revenue: 95000, expenses: 52000, bookings: 171 },
  { month: 'May', revenue: 78000, expenses: 46000, bookings: 143 },
  { month: 'Jun', revenue: 112000, expenses: 58000, bookings: 198 },
  { month: 'Jul', revenue: 124000, expenses: 62000, bookings: 214 }
];

export const ADMIN_REVENUE = [
  { month: 'Jan', mrr: 18400, hotels: 31 },
  { month: 'Feb', mrr: 21200, hotels: 34 },
  { month: 'Mar', mrr: 26800, hotels: 39 },
  { month: 'Apr', mrr: 31500, hotels: 43 },
  { month: 'May', mrr: 35200, hotels: 46 },
  { month: 'Jun', mrr: 39800, hotels: 51 },
  { month: 'Jul', mrr: 44600, hotels: 56 }
];

export const PET_CHARGES = {
  small: { label: 'Small (Cat, Rabbit, etc.)', perNight: 500 },
  medium: { label: 'Medium (Small Dog)', perNight: 750 },
  large: { label: 'Large (Large Dog)', perNight: 1000 },
  deposit: 2000,
};
