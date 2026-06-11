export const featureData = [
  { 
    id: 'room-management',
    icon: 'bed',         
    label: 'Room Management',     
    color: '#2DD4BF', 
    shortDesc: 'Live room status & floor map',
    description: 'Transform your front desk operations with our interactive, real-time visual dashboard. Monitor room occupancy, cleaning statuses, and maintenance blocks seamlessly on a unified floor plan interface.',
    benefits: ['Real-time status synchronization across all devices', 'Drag-and-drop room allocation and swift check-ins', 'Comprehensive visual mapping of your entire property'],
    workflow: [
      { step: 'Guest Check-in', detail: 'Reception selects an available room from the visual map.' },
      { step: 'Status Update', detail: 'Room status instantly switches to "Occupied" system-wide.' },
      { step: 'Check-out', detail: 'Upon check-out, status flips to "Dirty" alerting Housekeeping.' }
    ],
    plans: ['starter', 'professional', 'enterprise'],
    faqs: [
      { q: 'Can I add custom room types?', a: 'Yes, you can configure unlimited room types, categories, and amenities.' },
      { q: 'Is the floor plan customizable?', a: 'Absolutely, you can map out blocks, floors, and buildings to match your physical property.' }
    ],
    placeholderText: 'Interactive Floor Map View'
  },
  { 
    id: 'smart-bookings',
    icon: 'calendar',    
    label: 'Smart Bookings',       
    color: '#A78BFA', 
    shortDesc: 'Reservations with pet charges',
    description: 'A powerful reservation engine designed to handle complex booking scenarios with ease. Manage walk-ins, online reservations, group bookings, and special add-ons like pet fees or late checkout charges automatically.',
    benefits: ['Automated confirmation emails and SMS', 'Conflict-free availability calendar', 'One-click group reservation handling'],
    workflow: [
      { step: 'Reservation Entry', detail: 'Enter guest details and dates, the system automatically checks availability.' },
      { step: 'Add-ons', detail: 'Select any extras like breakfast packages or pet fees.' },
      { step: 'Confirmation', detail: 'System generates an itinerary and emails the guest automatically.' }
    ],
    plans: ['starter', 'professional', 'enterprise'],
    faqs: [
      { q: 'Can it handle group bookings?', a: 'Yes, our bulk reservation tool allows you to book multiple rooms under one master folio.' }
    ],
    placeholderText: 'Dynamic Reservation Calendar'
  },
  { 
    id: 'restaurant-pos',
    icon: 'food',        
    label: 'Restaurant POS',       
    color: '#FB7185', 
    shortDesc: 'Orders, kitchen & billing',
    description: 'A dedicated Point-of-Sale system built right into your hotel software. Seamlessly post restaurant or bar bills directly to the guest\'s room folio, or manage walk-in diners with a dedicated kitchen ticketing system.',
    benefits: ['Post charges directly to room folios', 'Digital Kitchen Order Tickets (KOT) routing', 'Inventory and recipe management'],
    workflow: [
      { step: 'Order Placement', detail: 'Waiter takes order on a tablet; KOT is sent to the kitchen.' },
      { step: 'Fulfillment', detail: 'Kitchen prepares and marks the order as ready.' },
      { step: 'Billing', detail: 'Charge is settled via cash/card or routed to the guest’s room folio.' }
    ],
    plans: ['professional', 'enterprise'],
    faqs: [
      { q: 'Can I manage multiple outlets?', a: 'Yes, you can create separate menus and billing streams for your bar, restaurant, and cafe.' }
    ],
    placeholderText: 'Restaurant POS Interface'
  },
  { 
    id: 'maintenance',
    icon: 'maintenance', 
    label: 'Maintenance',          
    color: '#FCD34D', 
    shortDesc: 'Tickets & repair tracking',
    description: 'Keep your property in pristine condition. Log maintenance issues, assign them to technicians, track repair times, and automatically block rooms from being booked until repairs are complete.',
    benefits: ['Automated room blocking for major repairs', 'Ticket assignment and priority tracking', 'Preventative maintenance scheduling'],
    workflow: [
      { step: 'Issue Reported', detail: 'Housekeeping flags a broken AC; a ticket is generated.' },
      { step: 'Room Blocked', detail: 'System temporarily removes the room from available inventory.' },
      { step: 'Resolution', detail: 'Technician fixes it, closes ticket, and room is available again.' }
    ],
    plans: ['starter', 'professional', 'enterprise'],
    faqs: [
      { q: 'Who can raise a ticket?', a: 'Any staff member with an account can raise tickets, but only admins/managers can close them.' }
    ],
    placeholderText: 'Maintenance Ticket Dashboard'
  },
  { 
    id: 'ota-channel-sync',
    icon: 'channel',     
    label: 'OTA Channel Sync',     
    color: '#60A5FA', 
    shortDesc: 'Booking.com, Expedia & more',
    description: 'Maximize your online presence without the risk of overbooking. StayOS offers a native, lightning-fast 2-way Channel Manager that syncs your inventory across 50+ OTAs instantly.',
    benefits: ['Zero overbookings with instant 2-way sync', 'Manage rates across all platforms from one screen', 'Direct integrations with Agoda, Booking.com, MakeMyTrip, etc.'],
    workflow: [
      { step: 'Availability Change', detail: 'A walk-in books your last Deluxe room.' },
      { step: 'Instant Sync', detail: 'StayOS immediately tells all OTAs to show zero availability.' },
      { step: 'OTA Booking', detail: 'An online booking automatically populates into your StayOS calendar.' }
    ],
    plans: ['professional', 'enterprise'],
    faqs: [
      { q: 'Is there an extra commission for channel sync?', a: 'No, channel management is fully included in the Professional and Enterprise plans.' }
    ],
    placeholderText: 'OTA Sync Hub'
  },
  { 
    id: 'revenue-analytics',
    icon: 'revenue',     
    label: 'Revenue Analytics',    
    color: '#C9A84C', 
    shortDesc: 'AI pricing & forecasting',
    description: 'Unlock the power of your data. Our advanced analytics suite provides deep insights into your RevPAR, ADR, and occupancy trends, helping you make data-driven pricing decisions.',
    benefits: ['Detailed financial reporting and export', 'AI-driven pricing recommendations based on demand', 'Customizable dashboard widgets'],
    workflow: [
      { step: 'Data Collection', detail: 'System silently tracks all financial and booking metrics.' },
      { step: 'Processing', detail: 'Analytics engine generates real-time graphs and KPIs.' },
      { step: 'Insight Generation', detail: 'Receive alerts to raise prices during high-demand forecasted periods.' }
    ],
    plans: ['enterprise'],
    faqs: [
      { q: 'Can I export reports for my accountant?', a: 'Yes, all reports can be exported to Excel, CSV, or PDF with one click.' }
    ],
    placeholderText: 'Revenue Graphs & Insights'
  },
  { 
    id: 'employee-management',
    icon: 'users',       
    label: 'Employee Management',  
    color: '#34D399', 
    shortDesc: 'Attendance & payroll',
    description: 'A complete HR solution for hospitality. Track staff shifts, manage leaves, log attendance via biometric integration or mobile app, and automate monthly payroll calculations.',
    benefits: ['Shift scheduling and swapping', 'Automated salary calculation including overtime', 'Digital leave approval workflows'],
    workflow: [
      { step: 'Clock-in', detail: 'Employee logs in via the app or biometric scanner.' },
      { step: 'Shift Tracking', detail: 'System records active hours and breaks.' },
      { step: 'Payroll', detail: 'At month-end, system auto-generates payslips based on attendance data.' }
    ],
    plans: ['professional', 'enterprise'],
    faqs: [
      { q: 'Does it support multiple shifts?', a: 'Yes, you can create day, night, and rotating shifts for different departments.' }
    ],
    placeholderText: 'Staff Roster & Payroll'
  },
  { 
    id: 'housekeeping',
    icon: 'key',         
    label: 'Housekeeping',         
    color: '#F97316', 
    shortDesc: 'Tasks, timers & room status',
    description: 'Empower your cleaning staff with a mobile-friendly housekeeping interface. Assign daily tasks, track room cleaning times, and ensure rooms are turned over quickly and efficiently.',
    benefits: ['Mobile-optimized view for maids', 'Automated task generation upon check-out', 'Cleaning time tracking for performance reviews'],
    workflow: [
      { step: 'Task Assignment', detail: 'Manager assigns 10 dirty rooms to a housekeeper.' },
      { step: 'Cleaning Phase', detail: 'Housekeeper starts timer on mobile, cleans, and marks as "Inspect".' },
      { step: 'Approval', detail: 'Supervisor inspects and marks room "Clean" - instantly bookable at reception.' }
    ],
    plans: ['professional', 'enterprise'],
    faqs: [
      { q: 'Do housekeepers need a separate app?', a: 'No, they can access a simplified, mobile-web view of StayOS on any smartphone.' }
    ],
    placeholderText: 'Housekeeping Task List'
  },
  { 
    id: 'guest-crm',
    icon: 'crm',         
    label: 'Guest CRM & Loyalty',  
    color: '#EC4899', 
    shortDesc: 'Points, tiers & referrals',
    description: 'Turn one-time visitors into lifelong guests. Track guest preferences, manage loyalty points, and send automated personalized marketing campaigns for birthdays and anniversaries.',
    benefits: ['Comprehensive guest history profiles', 'Custom loyalty point accumulation rules', 'Automated email/SMS marketing campaigns'],
    workflow: [
      { step: 'Data Capture', detail: 'Guest details and preferences are saved during their first stay.' },
      { step: 'Engagement', detail: 'System sends a personalized email with a discount code on their birthday.' },
      { step: 'Return Visit', detail: 'Guest books directly using the code, saving you OTA commissions.' }
    ],
    plans: ['professional', 'enterprise'],
    faqs: [
      { q: 'Can I see a guest\'s past stays?', a: 'Yes, the CRM shows total spend, past stays, and any negative/positive feedback.' }
    ],
    placeholderText: 'Guest Profile & CRM'
  },
  { 
    id: 'security-cctv',
    icon: 'shield',      
    label: 'Security & CCTV',      
    color: '#8B5CF6', 
    shortDesc: 'Visitor logs & 2FA',
    description: 'Enterprise-grade security for both your physical premises and your data. Keep digital visitor logs, manage keycard integrations, and secure your StayOS account with role-based access and 2FA.',
    benefits: ['Digital visitor management system', 'Role-based access control (RBAC)', 'Two-Factor Authentication for staff logins'],
    workflow: [
      { step: 'Access Attempt', detail: 'Staff member attempts to login.' },
      { step: 'Verification', detail: 'System requires an OTP from their registered mobile.' },
      { step: 'Audit Logging', detail: 'Every action taken in the system is logged with timestamp and IP address.' }
    ],
    plans: ['starter', 'professional', 'enterprise'],
    faqs: [
      { q: 'Can I restrict receptionists from seeing financial reports?', a: 'Yes, strict role-based permissions ensure staff only see what they need.' }
    ],
    placeholderText: 'Security & Access Logs'
  },
  { 
    id: 'advanced-billing',
    icon: 'invoice',     
    label: 'Advanced Billing',     
    color: '#06B6D4', 
    shortDesc: 'Split pay, GST & PDF invoices',
    description: 'A highly flexible billing engine designed for complex scenarios. Handle split payments, multi-currency, corporate routing, and automatic tax calculations seamlessly.',
    benefits: ['Split folios (e.g., room to company, food to guest)', 'Automated tax (GST/VAT) compliance', 'Beautiful, customizable PDF invoices'],
    workflow: [
      { step: 'Folio Setup', detail: 'Guest requests room charges be billed to their company, and extras paid personally.' },
      { step: 'Routing', detail: 'System splits the folio into Folio A (Company) and Folio B (Personal).' },
      { step: 'Settlement', detail: 'Generate two separate invoices with distinct tax calculations instantly.' }
    ],
    plans: ['starter', 'professional', 'enterprise'],
    faqs: [
      { q: 'Does it support my country\'s tax system?', a: 'Yes, you can define custom tax slabs and inclusive/exclusive rules for any region.' }
    ],
    placeholderText: 'Dynamic Folio & Invoice'
  },
  { 
    id: 'multi-branch',
    icon: 'hotel',       
    label: 'Multi-Branch',         
    color: '#EF4444', 
    shortDesc: 'Centralized control',
    description: 'Manage a chain of properties from a single login. Share guest databases across properties, compare branch performance, and enforce standardized settings from a central corporate dashboard.',
    benefits: ['Single Sign-On (SSO) for corporate managers', 'Consolidated chain-wide financial reporting', 'Global guest blacklist and loyalty sharing'],
    workflow: [
      { step: 'Corporate Login', detail: 'Chain manager logs into the global dashboard.' },
      { step: 'Macro View', detail: 'Views live occupancy across 5 different properties simultaneously.' },
      { step: 'Drill Down', detail: 'Clicks into a specific branch to adjust its individual pricing.' }
    ],
    plans: ['enterprise'],
    faqs: [
      { q: 'Can branch managers see other branches?', a: 'No, branch managers are restricted to their property; only corporate admins see all.' }
    ],
    placeholderText: 'Corporate Chain Dashboard'
  }
];
