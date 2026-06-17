const { GoogleGenerativeAI } = require('@google/generative-ai');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Guest = require('../models/Guest');
const User = require('../models/User');
const { Employee, Attendance, Maintenance, Housekeeping } = require('../models/Operations');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');
const CabBooking = require('../models/CabBooking');
const TravelAgency = require('../models/TravelAgency');
const Branch = require('../models/Branch');
const ManualItem = require('../models/ManualItem');
const { AppError } = require('../utils/helpers');

let genAI;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

const checkRole = (userRole, requiredRoles) => {
  if (['platform_admin', 'admin', 'hotel_admin', 'manager'].includes(userRole)) return true;
  return requiredRoles.includes(userRole);
};

const generateSmartAssistantResponse = async (contextData, userQuery, moduleName) => {
  if (!genAI) return { text: "AI services are not configured. Please set GEMINI_API_KEY.", stats: {}, tableData: [], error: true };
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest", generationConfig: { responseMimeType: "application/json" } });
    
    const prompt = `You are StayOS, a highly professional Hotel Operations Assistant.
The user's query: "${userQuery}"
Module context: ${moduleName}
Raw Database Data: ${JSON.stringify(contextData).substring(0, 15000)}

Analyze the user's query against the raw data.
Return a valid JSON object matching this exact structure:
{
  "text": "Your direct, specific answer to the user's question. Translate to Tamil if requested.",
  "stats": { "Stat Name": "Value" }, 
  "tableData": [ { "Col1": "Val1", "Col2": "Val2" } ]
}
Rules for JSON fields:
- "text": Should be conversational and directly answer the question based ONLY on the data. Max 2 paragraphs.
- "stats": Provide max 4 relevant key-value metrics derived from the data. E.g., {"Pending": 5}. Empty object if none.
- "tableData": Provide an array of filtered, relevant rows as objects with nice keys. Max 5 items. Empty array if none.
If no relevant data exists, state it in the "text" field and return empty stats/tableData.`;

    const result = await model.generateContent(prompt);
    let jsonStr = result.response.text().trim();
    // Strip markdown code blocks if AI wrapped the response
    jsonStr = jsonStr.replace(/^```(json)?/i, '').replace(/```$/i, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Gemini error:', error);
    return { text: "Data retrieved successfully, but AI analysis failed.", stats: {}, tableData: [], error: true };
  }
};

exports.detectIntent = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) return next(new AppError('Query is required', 400));
    
    if (!genAI) return res.json({ success: true, intent: 'summary' });

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `Classify the user's intent into exactly ONE of these categories:
- maintenance
- rooms
- bookings
- payments
- housekeeping
- employees
- reports
- notifications
- food-orders
- travel-desk
- branches
- analytics
- summary (if general or unknown)

User query: "${query}"
Return ONLY the exact category name. Nothing else.`;

    const result = await model.generateContent(prompt);
    const intent = result.response.text().trim().toLowerCase();
    
    const validIntents = ['maintenance', 'rooms', 'bookings', 'payments', 'housekeeping', 'employees', 'reports', 'notifications', 'food-orders', 'travel-desk', 'branches', 'analytics', 'summary'];
    const finalIntent = validIntents.includes(intent) ? intent : 'summary';

    res.json({ success: true, intent: finalIntent });
  } catch (err) { next(err); }
};

exports.getMaintenanceData = async (req, res, next) => {
  try {
    if (!checkRole(req.user.role, ['housekeeping', 'hotel_staff', 'manager', 'admin', 'hotel_admin', 'platform_admin'])) {
      return res.status(403).json({ success: false, text: 'Access denied. Administrator or maintenance staff permissions required.' });
    }

    const hotelId = req.hotelId || req.user.hotel;
    // Limit to recent tickets to avoid overflowing context
    const tickets = await Maintenance.find({ hotel: hotelId }).sort('-createdAt').limit(100).lean();
    
    const query = req.query.q || 'What is the maintenance status?';
    const aiResponse = await generateSmartAssistantResponse(tickets, query, 'Maintenance');

    if (aiResponse.error) {
      const open = tickets.filter(t => t.status === 'open').length;
      const inProgress = tickets.filter(t => t.status === 'in-progress').length;
      const resolved = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
      aiResponse.text = "Here is the maintenance summary.";
      aiResponse.stats = { "Total": tickets.length, "Open": open, "In Progress": inProgress, "Resolved": resolved };
      aiResponse.tableData = tickets.slice(0, 5).map(t => ({ Ticket: t.ticketId || t._id, Issue: t.issue, Status: t.status }));
      delete aiResponse.error;
    }

    res.json({
      success: true,
      text: aiResponse.text,
      stats: aiResponse.stats,
      buttons: [
        { label: "View Details", url: "/hotel/maintenance" },
        { label: "Assign Staff", url: "/hotel/employees" }
      ],
      suggestedActions: ["Show unassigned tickets", "Show completed tickets today"],
      tableData: aiResponse.tableData
    });
  } catch (err) { next(err); }
};

exports.getRoomsData = async (req, res, next) => {
  try {
    if (!checkRole(req.user.role, ['receptionist', 'housekeeping', 'hotel_staff', 'manager', 'admin', 'hotel_admin', 'platform_admin'])) {
      return res.status(403).json({ success: false, text: 'Access denied.' });
    }

    const hotelId = req.hotelId || req.user.hotel;
    const rooms = await Room.find({ hotel: hotelId }).lean();
    
    const query = req.query.q || 'Show rooms status';
    const aiResponse = await generateSmartAssistantResponse(rooms, query, 'Rooms');

    if (aiResponse.error) {
      const available = rooms.filter(r => r.status === 'available').length;
      const occupied = rooms.filter(r => r.status === 'occupied').length;
      const maintenance = rooms.filter(r => r.status === 'maintenance').length;
      aiResponse.text = "Here is the room availability summary.";
      aiResponse.stats = { "Total Rooms": rooms.length, "Available": available, "Occupied": occupied, "Maintenance": maintenance };
      aiResponse.tableData = rooms.slice(0, 5).map(r => ({ Room: r.roomNumber, Type: r.type, Status: r.status }));
      delete aiResponse.error;
    }

    res.json({
      success: true,
      text: aiResponse.text,
      stats: aiResponse.stats,
      buttons: [
        { label: "Book Room", url: "/hotel/bookings" },
        { label: "Manage Inventory", url: "/hotel/inventory" }
      ],
      suggestedActions: ["Find cheapest available room", "Show maintenance rooms"],
      tableData: aiResponse.tableData
    });
  } catch (err) { next(err); }
};

exports.getBookingsData = async (req, res, next) => {
  try {
    if (!checkRole(req.user.role, ['receptionist', 'manager', 'admin', 'hotel_admin', 'platform_admin'])) return res.status(403).json({ success: false, text: 'Access denied.' });

    const hotelId = req.hotelId || req.user.hotel;
    const bookings = await Booking.find({ hotel: hotelId }).sort('-createdAt').limit(100).populate('guest', 'firstName lastName email phone').lean();
    
    const query = req.query.q || 'Show active bookings';
    const aiResponse = await generateSmartAssistantResponse(bookings, query, 'Bookings');

    if (aiResponse.error) {
      const active = bookings.filter(b => ['confirmed', 'checked_in'].includes(b.status)).length;
      const cancelled = bookings.filter(b => b.status === 'cancelled').length;
      aiResponse.text = "Here is the summary of recent bookings.";
      aiResponse.stats = { "Recent Bookings": bookings.length, "Active": active, "Cancelled": cancelled };
      aiResponse.tableData = bookings.slice(0, 5).map(b => ({ Guest: b.guest ? b.guest.firstName : 'Unknown', Status: b.status, Amount: b.totalAmount }));
      delete aiResponse.error;
    }

    res.json({
      success: true,
      text: aiResponse.text,
      stats: aiResponse.stats,
      buttons: [
        { label: "View All Bookings", url: "/hotel/bookings" },
        { label: "New Booking", url: "/hotel/bookings" }
      ],
      suggestedActions: ["Show today's arrivals", "Show pending payments"],
      tableData: aiResponse.tableData
    });
  } catch (err) { next(err); }
};

exports.getPaymentsData = async (req, res, next) => {
  try {
    if (!checkRole(req.user.role, ['receptionist', 'manager', 'admin', 'hotel_admin', 'platform_admin'])) return res.status(403).json({ success: false, text: 'Access denied.' });

    const hotelId = req.hotelId || req.user.hotel;
    const invoices = await Invoice.find({ hotel: hotelId }).sort('-createdAt').limit(200).lean();
    
    const query = req.query.q || 'Show payments';
    const aiResponse = await generateSmartAssistantResponse(invoices, query, 'Payments & Revenue');

    if (aiResponse.error) {
      let totalRevenue = 0;
      let pendingAmount = 0;
      invoices.forEach(i => {
        totalRevenue += i.paidAmount || 0;
        pendingAmount += i.dueAmount || 0;
      });
      aiResponse.text = "Here is the summary of recent payments and invoices.";
      aiResponse.stats = { "Total Invoices": invoices.length, "Collected": `₹${totalRevenue}`, "Pending": `₹${pendingAmount}` };
      aiResponse.tableData = invoices.slice(0, 5).map(i => ({ Invoice: i.invoiceNo, Amount: i.totalAmount, Status: i.paymentStatus }));
      delete aiResponse.error;
    }

    res.json({
      success: true,
      text: aiResponse.text,
      stats: aiResponse.stats,
      buttons: [
        { label: "Open Billing", url: "/hotel/billing" }
      ],
      suggestedActions: ["Generate revenue report", "Show highest outstanding bill"],
      tableData: aiResponse.tableData
    });
  } catch (err) { next(err); }
};

// Re-using old route name "food-orders" but mapping to housekeeping if requested, or keep separate
exports.getHousekeepingData = async (req, res, next) => {
  try {
    if (!checkRole(req.user.role, ['housekeeping', 'manager', 'admin', 'hotel_admin', 'platform_admin'])) return res.status(403).json({ success: false, text: 'Access denied.' });

    const hotelId = req.hotelId || req.user.hotel;
    const tasks = await Housekeeping.find({ hotel: hotelId }).sort('-createdAt').limit(100).lean();
    
    const query = req.query.q || 'Show housekeeping';
    const aiResponse = await generateSmartAssistantResponse(tasks, query, 'Housekeeping');

    if (aiResponse.error) {
      const pending = tasks.filter(t => t.status === 'pending').length;
      const completed = tasks.filter(t => t.status === 'completed' || t.status === 'verified').length;
      aiResponse.text = "Here is the summary of housekeeping tasks.";
      aiResponse.stats = { "Total Tasks": tasks.length, "Pending": pending, "Completed": completed };
      aiResponse.tableData = tasks.slice(0, 5).map(t => ({ Room: t.roomNumber, Type: t.type, Status: t.status }));
      delete aiResponse.error;
    }

    res.json({
      success: true,
      text: aiResponse.text,
      stats: aiResponse.stats,
      buttons: [{ label: "Housekeeping Dashboard", url: "/hotel/housekeeping" }],
      suggestedActions: ["Assign available maids", "Show VIP room cleaning status"],
      tableData: aiResponse.tableData
    });
  } catch (err) { next(err); }
};

exports.getFoodOrdersData = async (req, res, next) => {
  try {
    if (!checkRole(req.user.role, ['receptionist', 'hotel_admin', 'manager', 'platform_admin', 'restaurant_staff'])) {
      return res.status(403).json({ success: false, text: 'Access denied.' });
    }

    const hotelId = req.hotelId || req.user.hotel;
    const menuItems = await ManualItem.find({ hotel: hotelId }).lean();
    const recentInvoices = await Invoice.find({ hotel: hotelId }).sort('-createdAt').limit(50).select('posCharges invoiceNo status').lean();
    
    const query = req.query.q || 'Show food orders';
    const aiResponse = await generateSmartAssistantResponse({ menuItems, recentInvoices }, query, 'Food Orders & POS');

    if (aiResponse.error) {
      const activeMenu = menuItems.filter(m => m.stockStatus !== 'out-of-stock').length;
      aiResponse.text = "Here is the summary of your menu and recent POS orders.";
      aiResponse.stats = { "Menu Items": menuItems.length, "Available": activeMenu, "Recent POS Orders": recentInvoices.length };
      aiResponse.tableData = menuItems.slice(0, 5).map(m => ({ Item: m.name, Price: m.price, Stock: m.stockStatus || 'Available' }));
      delete aiResponse.error;
    }

    res.json({
      success: true,
      text: aiResponse.text,
      stats: aiResponse.stats,
      buttons: [{ label: "Open POS", url: "/hotel/restaurant" }, { label: "Manage Menu", url: "/hotel/inventory" }],
      suggestedActions: ["Show out of stock items", "Show recent POS revenue"],
      tableData: aiResponse.tableData
    });
  } catch (err) { next(err); }
};

exports.getAttendanceData = async (req, res, next) => {
  try {
    if (!checkRole(req.user.role, ['manager', 'admin', 'hotel_admin', 'platform_admin'])) {
      return res.status(403).json({ success: false, text: 'Access denied. Managers only.' });
    }

    const hotelId = req.hotelId || req.user.hotel;
    const employees = await Employee.find({ hotel: hotelId }).sort('-createdAt').limit(100).lean();
    
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const attendance = await Attendance.find({ 
       hotel: hotelId, 
       date: { $gte: startOfDay } 
    }).lean();
    
    const query = req.query.q || 'Show employees';
    const aiResponse = await generateSmartAssistantResponse({ employees, attendance }, query, 'Employees & Attendance');

    if (aiResponse.error) {
      const total = employees.length;
      const active = employees.filter(e => e.status === 'active').length;
      const inactive = total - active;
      
      const roleCounts = {};
      employees.forEach(e => {
        roleCounts[e.role] = (roleCounts[e.role] || 0) + 1;
      });

      const presentToday = attendance.filter(a => a.status === 'present').length;
      const nextShiftCount = employees.filter(e => e.shift === 'Evening' || e.shift === 'Night').length;

      aiResponse.text = "Here is the summary of your staff roster and attendance today.";
      aiResponse.stats = {
        "Total Staff": total,
        "Active": active,
        "Present Today": presentToday,
        "Arriving Next Shift": nextShiftCount
      };
      aiResponse.tableData = Object.entries(roleCounts).map(([role, count]) => ({ Role: role, Count: count })).slice(0, 5);
      delete aiResponse.error;
    }

    res.json({
      success: true,
      text: aiResponse.text,
      stats: aiResponse.stats,
      buttons: [{ label: "Manage Staff", url: "/hotel/employees" }],
      suggestedActions: ["Show staff arriving next shift", "Who is absent today?"],
      tableData: aiResponse.tableData
    });
  } catch (err) { next(err); }
};

exports.getReportsData = async (req, res, next) => {
  try {
    if (!checkRole(req.user.role, ['manager', 'admin', 'hotel_admin', 'platform_admin'])) {
      return res.status(403).json({ success: false, text: 'Access denied. Management only.' });
    }

    const hotelId = req.hotelId || req.user.hotel;
    const invoices = await Invoice.find({ hotel: hotelId }).sort('-createdAt').limit(200).select('totalAmount status type createdAt').lean();
    const bookings = await Booking.find({ hotel: hotelId }).sort('-createdAt').limit(200).select('status totalAmount checkIn checkOut').lean();
    
    const query = req.query.q || 'Show reports and analytics';
    const aiResponse = await generateSmartAssistantResponse({ invoices, bookings }, query, 'Reports & Analytics');

    if (aiResponse.error) {
      aiResponse.text = "Here is the summary of recent reports.";
      aiResponse.stats = { "Invoices Processed": invoices.length, "Bookings Logged": bookings.length };
      aiResponse.tableData = invoices.slice(0, 5).map(i => ({ Date: new Date(i.createdAt).toLocaleDateString(), Type: i.type, Amount: i.totalAmount, Status: i.status }));
      delete aiResponse.error;
    }

    res.json({
      success: true,
      text: aiResponse.text,
      stats: aiResponse.stats,
      buttons: [{ label: "View Detailed Reports", url: "/hotel/revenue" }],
      suggestedActions: ["Generate daily summary", "Show highest revenue source"],
      tableData: aiResponse.tableData
    });
  } catch (err) { next(err); }
};

exports.getNotificationsData = async (req, res, next) => {
  try {
    const hotelId = req.hotelId || req.user.hotel;
    const role = req.user.role === 'platform_admin' ? 'admin' : req.user.role;
    
    let filter = {};
    if (role !== 'admin') {
      filter = {
        $or: [
          { hotel: hotelId, targetRoles: { $in: [role] } },
          { hotel: hotelId, targetRoles: { $size: 0 } },
          { isGlobal: true, targetRoles: { $in: [role] } },
          { isGlobal: true, targetRoles: { $size: 0 } }
        ]
      };
    } else {
      filter = { hotel: hotelId };
    }

    const notifications = await Notification.find(filter).sort('-createdAt').limit(50).lean();
    
    const query = req.query.q || 'Show notifications';
    const aiResponse = await generateSmartAssistantResponse(notifications, query, 'Notifications');

    if (aiResponse.error) {
      const unread = notifications.filter(n => !n.readBy?.includes(req.user.id)).length;
      aiResponse.text = "Here is the summary of your notifications.";
      aiResponse.stats = { "Total Alerts": notifications.length, "Unread": unread };
      aiResponse.tableData = notifications.slice(0, 5).map(n => ({ Title: n.title, Type: n.type, Date: new Date(n.createdAt).toLocaleDateString() }));
      delete aiResponse.error;
    }

    res.json({
      success: true,
      text: aiResponse.text,
      stats: aiResponse.stats,
      buttons: [{ label: "View Alerts", url: "/hotel/notifications" }],
      suggestedActions: ["Show unread notifications"],
      tableData: aiResponse.tableData
    });
  } catch (err) { next(err); }
};

exports.getTravelDeskData = async (req, res, next) => {
  try {
    if (!checkRole(req.user.role, ['receptionist', 'manager', 'hotel_admin', 'platform_admin'])) {
      return res.status(403).json({ success: false, text: 'Access denied.' });
    }

    const hotelId = req.hotelId || req.user.hotel;
    const cabs = await CabBooking.find({ hotel: hotelId }).sort('-createdAt').limit(50).populate('guest', 'firstName lastName').lean();
    const agencies = await TravelAgency.find({ hotel: hotelId }).lean();
    
    const query = req.query.q || 'Show travel desk';
    const aiResponse = await generateSmartAssistantResponse({ cabs, agencies }, query, 'Travel Desk');

    if (aiResponse.error) {
      const pendingCabs = cabs.filter(c => c.status === 'pending').length;
      aiResponse.text = "Here is the summary of travel desk requests.";
      aiResponse.stats = { "Total Cab Bookings": cabs.length, "Pending Requests": pendingCabs, "Partner Agencies": agencies.length };
      aiResponse.tableData = cabs.slice(0, 5).map(c => ({ Guest: c.guest ? c.guest.firstName : 'Unknown', Destination: c.dropoff, Status: c.status }));
      delete aiResponse.error;
    }

    res.json({
      success: true,
      text: aiResponse.text,
      stats: aiResponse.stats,
      buttons: [{ label: "Open Travel Desk", url: "/hotel/travel" }],
      suggestedActions: ["Show pending cab bookings"],
      tableData: aiResponse.tableData
    });
  } catch (err) { next(err); }
};

exports.getBranchesData = async (req, res, next) => {
  try {
    if (!checkRole(req.user.role, ['manager', 'admin', 'hotel_admin', 'platform_admin'])) {
      return res.status(403).json({ success: false, text: 'Access denied.' });
    }

    const hotelId = req.hotelId || req.user.hotel;
    const branches = await Branch.find({ hotel: hotelId }).lean();
    
    const query = req.query.q || 'Show branches';
    const aiResponse = await generateSmartAssistantResponse(branches, query, 'Branches');

    if (aiResponse.error) {
      aiResponse.text = "Here is the summary of your hotel branches.";
      aiResponse.stats = { "Total Branches": branches.length };
      aiResponse.tableData = branches.slice(0, 5).map(b => ({ Name: b.name, Location: b.location, Status: b.status || 'Active' }));
      delete aiResponse.error;
    }

    res.json({
      success: true,
      text: aiResponse.text,
      stats: aiResponse.stats,
      buttons: [{ label: "View Branches", url: "/hotel/settings" }],
      suggestedActions: ["Show all active branches"],
      tableData: aiResponse.tableData
    });
  } catch (err) { next(err); }
};

exports.getAnalyticsData = async (req, res, next) => {
  try {
    if (!checkRole(req.user.role, ['manager', 'admin', 'hotel_admin', 'platform_admin'])) {
      return res.status(403).json({ success: false, text: 'Access denied.' });
    }

    const hotelId = req.hotelId || req.user.hotel;
    const invoices = await Invoice.find({ hotel: hotelId }).sort('-createdAt').limit(200).select('totalAmount status type createdAt').lean();
    const rooms = await Room.find({ hotel: hotelId }).select('status').lean();
    
    const query = req.query.q || 'Show analytics';
    const aiResponse = await generateSmartAssistantResponse({ invoices, rooms }, query, 'Analytics');

    if (aiResponse.error) {
      const occupied = rooms.filter(r => r.status === 'occupied').length;
      const occRate = rooms.length ? Math.round((occupied / rooms.length) * 100) : 0;
      let rev = 0;
      invoices.forEach(i => rev += i.totalAmount || 0);

      aiResponse.text = "Here is the quick analytics summary.";
      aiResponse.stats = { "Occupancy Rate": `${occRate}%`, "Recent Revenue": `₹${rev}` };
      aiResponse.tableData = [];
      delete aiResponse.error;
    }

    res.json({
      success: true,
      text: aiResponse.text,
      stats: aiResponse.stats,
      buttons: [{ label: "View Analytics", url: "/hotel/revenue" }],
      suggestedActions: ["What is the current occupancy rate?", "Show total revenue"],
      tableData: aiResponse.tableData
    });
  } catch (err) { next(err); }
};

exports.getSummaryData = async (req, res, next) => {
  res.json({
    success: true,
    text: "How can I assist you with operations today? Select a module to begin or ask a question directly.",
    stats: {},
    buttons: [],
    suggestedActions: ["Show today's active bookings", "What is pending for maintenance?"],
    tableData: []
  });
};
