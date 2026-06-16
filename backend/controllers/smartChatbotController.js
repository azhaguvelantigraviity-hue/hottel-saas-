const { GoogleGenerativeAI } = require('@google/generative-ai');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Guest = require('../models/Guest');
const User = require('../models/User');
const { Employee, Maintenance, Housekeeping } = require('../models/Operations');
const { AppError } = require('../utils/helpers');

let genAI;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

const checkRole = (userRole, requiredRoles) => {
  if (['platform_admin', 'admin', 'hotel_admin', 'manager'].includes(userRole)) return true;
  return requiredRoles.includes(userRole);
};

const generateAssistantSummary = async (contextData, userQuery, moduleName) => {
  if (!genAI) return "AI services are not configured. Please set GEMINI_API_KEY.";
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `You are StayOS, a highly professional and analytical Hotel Operations Assistant. 
The user asked: "${userQuery}". You are answering for the module: ${moduleName}.
Here is the JSON data from the database: ${JSON.stringify(contextData)}

Write a professional, concise summary of this data in exactly one paragraph. Do not use markdown. If there is no data, say exactly "There are no records available for this module at this time."`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini error:', error);
    return `Data retrieved successfully.`;
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
exports.getMaintenanceData = async (req, res, next) => {
  try {
    if (!checkRole(req.user.role, ['housekeeping', 'hotel_staff'])) {
      return res.status(403).json({ success: false, text: 'Access denied. Administrator or maintenance staff permissions required.' });
    }

    const hotelId = req.hotelId || req.user.hotel;
    const tickets = await Maintenance.find({ hotel: hotelId });
    
    const stats = {
      "Pending": tickets.filter(t => t.status === 'open').length,
      "In Progress": tickets.filter(t => t.status === 'in-progress' || t.status === 'assigned').length,
      "Completed": tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length
    };

    const query = req.query.q || 'What is the maintenance status?';
    const textResponse = await generateAssistantSummary(stats, query, 'Maintenance');

    const tableData = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').slice(0, 5).map(t => ({
      "Room": t.room,
      "Issue": t.issue,
      "Assigned To": t.assignedTo || 'Unassigned',
      "Status": t.status.toUpperCase()
    }));

    res.json({
      success: true,
      text: textResponse,
      stats,
      buttons: [
        { label: "View Details", url: "/hotel/operations?tab=maintenance" },
        { label: "Assign Staff", url: "/hotel/operations?tab=staff" }
      ],
      suggestedActions: ["Show unassigned tickets", "Show completed tickets today"],
      tableData
    });
  } catch (err) { next(err); }
};

exports.getRoomsData = async (req, res, next) => {
  try {
    if (!checkRole(req.user.role, ['receptionist', 'housekeeping', 'hotel_staff'])) {
      return res.status(403).json({ success: false, text: 'Access denied.' });
    }

    const hotelId = req.hotelId || req.user.hotel;
    const rooms = await Room.find({ hotel: hotelId });
    
    const stats = {
      "Available": rooms.filter(r => r.status === 'available').length,
      "Occupied": rooms.filter(r => r.status === 'occupied').length,
      "Under Maintenance": rooms.filter(r => r.status === 'maintenance').length
    };

    const textResponse = await generateAssistantSummary(stats, req.query.q || 'Show rooms status', 'Rooms');

    const tableData = rooms.filter(r => r.status === 'available').slice(0, 5).map(r => ({
      "Room No": r.roomNumber,
      "Type": r.type,
      "Status": r.status.toUpperCase(),
      "Price": `₹${r.price}`
    }));

    res.json({
      success: true,
      text: textResponse,
      stats,
      buttons: [
        { label: "Book Room", url: "/hotel/bookings" },
        { label: "Manage Inventory", url: "/hotel/inventory" }
      ],
      suggestedActions: ["Find cheapest available room", "Show maintenance rooms"],
      tableData
    });
  } catch (err) { next(err); }
};

exports.getBookingsData = async (req, res, next) => {
  try {
    if (!checkRole(req.user.role, ['receptionist'])) return res.status(403).json({ success: false, text: 'Access denied.' });

    const hotelId = req.hotelId || req.user.hotel;
    const bookings = await Booking.find({ hotel: hotelId }).populate('guest');
    
    const today = new Date().toISOString().split('T')[0];
    const stats = {
      "Active Stays": bookings.filter(b => b.status === 'checked_in').length,
      "Upcoming": bookings.filter(b => b.status === 'confirmed').length,
      "Today's Checkouts": bookings.filter(b => b.checkOut && new Date(b.checkOut).toISOString().split('T')[0] === today).length
    };

    const textResponse = await generateAssistantSummary(stats, req.query.q || 'Show active bookings', 'Bookings');

    const tableData = bookings.filter(b => b.status === 'checked_in').slice(0, 5).map(b => ({
      "Guest": b.guest ? b.guest.firstName : 'Walk-in',
      "Room": b.room || 'Pending',
      "Checkout": new Date(b.checkOut).toLocaleDateString()
    }));

    res.json({
      success: true,
      text: textResponse,
      stats,
      buttons: [
        { label: "View All Bookings", url: "/hotel/bookings" },
        { label: "New Booking", url: "/hotel/bookings" }
      ],
      suggestedActions: ["Show today's arrivals", "Show pending payments"],
      tableData
    });
  } catch (err) { next(err); }
};

exports.getPaymentsData = async (req, res, next) => {
  try {
    if (!checkRole(req.user.role, ['receptionist'])) return res.status(403).json({ success: false, text: 'Access denied.' });

    const hotelId = req.hotelId || req.user.hotel;
    const bookings = await Booking.find({ hotel: hotelId, status: { $in: ['confirmed', 'checked_in', 'checked_out'] } });
    
    let collected = 0;
    let pending = 0;
    bookings.forEach(b => {
      collected += (b.paidAmount || 0);
      pending += ((b.totalAmount || 0) - (b.paidAmount || 0));
    });

    const stats = {
      "Total Collected": `₹${collected}`,
      "Total Pending": `₹${pending}`
    };

    const textResponse = await generateAssistantSummary(stats, req.query.q || 'Show payments', 'Payments');

    res.json({
      success: true,
      text: textResponse,
      stats,
      buttons: [
        { label: "Open Billing", url: "/hotel/billing" }
      ],
      suggestedActions: ["Generate revenue report", "Show highest outstanding bill"],
      tableData: []
    });
  } catch (err) { next(err); }
};

// Re-using old route name "food-orders" but mapping to housekeeping if requested, or keep separate
exports.getHousekeepingData = async (req, res, next) => {
  try {
    if (!checkRole(req.user.role, ['housekeeping'])) return res.status(403).json({ success: false, text: 'Access denied.' });

    const hotelId = req.hotelId || req.user.hotel;
    const tasks = await Housekeeping.find({ hotel: hotelId });
    
    const stats = {
      "Pending": tasks.filter(t => t.status === 'pending').length,
      "In Progress": tasks.filter(t => t.status === 'in-progress').length,
      "Completed": tasks.filter(t => t.status === 'completed' || t.status === 'verified').length
    };

    const textResponse = await generateAssistantSummary(stats, req.query.q || 'Show housekeeping', 'Housekeeping');

    res.json({
      success: true,
      text: textResponse,
      stats,
      buttons: [{ label: "Housekeeping Dashboard", url: "/hotel/operations?tab=housekeeping" }],
      suggestedActions: ["Assign available maids", "Show VIP room cleaning status"],
      tableData: []
    });
  } catch (err) { next(err); }
};

exports.getFoodOrdersData = async (req, res, next) => {
  res.json({
    success: true,
    text: "Food Orders module is currently offline. Please use the POS dashboard.",
    stats: { "Pending Orders": 0 },
    buttons: [{ label: "Open POS", url: "/hotel/pos" }],
    suggestedActions: [],
    tableData: []
  });
};

exports.getAttendanceData = async (req, res, next) => {
  try {
    if (!checkRole(req.user.role, [])) return res.status(403).json({ success: false, text: 'Access denied. Managers only.' });

    const hotelId = req.hotelId || req.user.hotel;
    const employees = await Employee.find({ hotel: hotelId });
    
    const stats = {
      "Total Staff": employees.length,
      "On Duty": employees.filter(e => e.status === 'active').length,
      "On Leave": employees.filter(e => e.status === 'on_leave').length
    };

    const textResponse = await generateAssistantSummary(stats, req.query.q || 'Show employees', 'Employees');

    res.json({
      success: true,
      text: textResponse,
      stats,
      buttons: [{ label: "Manage Staff", url: "/hotel/operations?tab=staff" }],
      suggestedActions: ["Show staff arriving next shift"],
      tableData: employees.slice(0, 5).map(e => ({
        "Name": e.name,
        "Department": e.department,
        "Status": e.status === 'active' ? 'On Duty' : 'Off Duty'
      }))
    });
  } catch (err) { next(err); }
};

exports.getReportsData = async (req, res, next) => {
  res.json({
    success: true,
    text: "Your hotel analytics and revenue reports are ready to be viewed. Please open the Reports module.",
    stats: { "Reports Ready": 3 },
    buttons: [{ label: "View Reports", url: "/hotel/revenue" }],
    suggestedActions: ["Generate daily summary", "Export monthly P&L"],
    tableData: []
  });
};

exports.getNotificationsData = async (req, res, next) => {
  res.json({
    success: true,
    text: "You have new unread notifications regarding recent bookings and system alerts.",
    stats: { "Unread": 5, "Total": 12 },
    buttons: [{ label: "View Alerts", url: "/hotel/dashboard" }],
    suggestedActions: ["Mark all as read"],
    tableData: []
  });
};

exports.getTravelDeskData = async (req, res, next) => {
  res.json({
    success: true,
    text: "Travel Desk module. Manage guest transportation and tours.",
    stats: { "Pending Requests": 2, "Active Trips": 1 },
    buttons: [{ label: "Open Travel Desk", url: "/hotel/travel" }],
    suggestedActions: ["Book airport transfer"],
    tableData: []
  });
};

exports.getBranchesData = async (req, res, next) => {
  res.json({
    success: true,
    text: "Multi-branch management is only available for Enterprise plans.",
    stats: { "Active Branches": 1 },
    buttons: [{ label: "View Settings", url: "/hotel/settings" }],
    suggestedActions: [],
    tableData: []
  });
};

exports.getAnalyticsData = async (req, res, next) => {
  res.json({
    success: true,
    text: "Advanced analytics and revenue forecasting tools are available in your dashboard.",
    stats: { "Occupancy Rate": "78%", "RevPAR": "₹2,400" },
    buttons: [{ label: "View Analytics", url: "/hotel/revenue" }],
    suggestedActions: ["Show RevPAR history"],
    tableData: []
  });
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
