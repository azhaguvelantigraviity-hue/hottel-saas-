const { GoogleGenerativeAI } = require('@google/generative-ai');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Guest = require('../models/Guest');
const User = require('../models/User');
const { Employee, Maintenance } = require('../models/Operations');
const Order = require('../models/Order'); // Food Orders (Assuming it exists, need to verify model name)
const { AppError } = require('../utils/helpers');

// Initialize Gemini
let genAI;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Ensure the user has the correct role
const checkRole = (userRole, requiredRoles) => {
  if (userRole === 'platform_admin' || userRole === 'admin' || userRole === 'hotel_admin' || userRole === 'manager') return true;
  return requiredRoles.includes(userRole);
};

// Helper to generate translation via Gemini
const generateTranslation = async (contextData, userQuery, moduleName) => {
  if (!genAI) return "AI services are not configured. Please set GEMINI_API_KEY.";
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `You are a smart hotel assistant. The user asked: "${userQuery}".
You are answering for the module: ${moduleName}.
Here is the JSON data from the database: ${JSON.stringify(contextData)}

Write a very brief and concise response. First paragraph in English. Second paragraph in Tamil.
If the data is empty or zero, reply exactly with "No data available." in English and its equivalent in Tamil.
Do not use markdown formatting like ** or *.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini error:', error);
    return `Data retrieved. Failed to translate.\n\nதரவு பெறப்பட்டது. மொழிபெயர்க்க முடியவில்லை.`;
  }
};

exports.detectIntent = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) return next(new AppError('Query is required', 400));
    
    if (!genAI) {
      return res.json({ success: true, intent: 'summary' }); // Fallback
    }

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `Classify the user's intent into exactly ONE of these categories:
- maintenance
- rooms
- bookings
- payments
- food-orders
- attendance
- reports
- summary (if general or unknown)

User query: "${query}"
Return ONLY the exact category name. Nothing else.`;

    const result = await model.generateContent(prompt);
    const intent = result.response.text().trim().toLowerCase();
    
    // Validate intent string
    const validIntents = ['maintenance', 'rooms', 'bookings', 'payments', 'food-orders', 'attendance', 'reports', 'summary'];
    const finalIntent = validIntents.includes(intent) ? intent : 'summary';

    res.json({ success: true, intent: finalIntent });
  } catch (err) {
    next(err);
  }
};

exports.getMaintenanceData = async (req, res, next) => {
  try {
    const role = req.user.role;
    if (!checkRole(role, ['housekeeping', 'hotel_staff'])) {
      return res.status(403).json({ success: false, text: 'Access denied. You do not have permission to view maintenance data.\n\nஉங்களுக்கு அனுமதி இல்லை.' });
    }

    const hotelId = req.hotelId || req.user.hotel;
    const maintenanceTickets = await Maintenance.find({ hotel: hotelId, status: { $ne: 'resolved' } });
    
    if (maintenanceTickets.length === 0) {
      return res.json({ success: true, text: 'No data available.\n\nதரவு எதுவும் கிடைக்கவில்லை.', count: 0 });
    }

    const query = req.query.q || 'What is the maintenance status?';
    const textResponse = await generateTranslation(maintenanceTickets, query, 'Maintenance');

    const tableData = maintenanceTickets.map(t => ({
      "Room No": t.room,
      "Issue": t.issue,
      "Assigned Staff": t.assignedTo || 'Unassigned',
      "Status": t.status,
      "Date": t.createdAt.toLocaleDateString()
    }));

    res.json({
      success: true,
      text: textResponse,
      countTitle: "Pending Maintenance",
      count: maintenanceTickets.length,
      buttonLabel: "View Details",
      redirectUrl: "/hotel/operations?tab=maintenance",
      tableData
    });
  } catch (err) { next(err); }
};

exports.getRoomsData = async (req, res, next) => {
  try {
    const role = req.user.role;
    if (!checkRole(role, ['receptionist', 'housekeeping', 'hotel_staff'])) {
      return res.status(403).json({ success: false, text: 'Access denied.' });
    }

    const hotelId = req.hotelId || req.user.hotel;
    const rooms = await Room.find({ hotel: hotelId });
    
    if (rooms.length === 0) {
      return res.json({ success: true, text: 'No data available.', count: 0 });
    }

    const available = rooms.filter(r => r.status === 'available');
    
    const query = req.query.q || 'What is the room status?';
    const textResponse = await generateTranslation({ total: rooms.length, available: available.length }, query, 'Rooms');

    const tableData = available.slice(0, 5).map(r => ({
      "Room No": r.roomNumber,
      "Type": r.type,
      "Status": r.status,
      "Price": r.price
    }));

    res.json({
      success: true,
      text: textResponse,
      countTitle: "Available Rooms",
      count: available.length,
      buttonLabel: "View All Rooms",
      redirectUrl: "/hotel/bookings",
      tableData
    });
  } catch (err) { next(err); }
};

exports.getBookingsData = async (req, res, next) => {
  try {
    const role = req.user.role;
    if (!checkRole(role, ['receptionist'])) return res.status(403).json({ success: false, text: 'Access denied.' });

    const hotelId = req.hotelId || req.user.hotel;
    const bookings = await Booking.find({ hotel: hotelId, status: { $in: ['confirmed', 'checked_in'] } }).populate('room guest');
    
    if (bookings.length === 0) return res.json({ success: true, text: 'No data available.', count: 0 });

    const query = req.query.q || 'Show active bookings';
    const textResponse = await generateTranslation({ activeBookings: bookings.length }, query, 'Bookings');

    const tableData = bookings.slice(0, 5).map(b => ({
      "Guest": b.guest ? b.guest.firstName : 'Unknown',
      "Room": b.room ? b.room.roomNumber : 'Unknown',
      "Status": b.status,
      "Check-In": b.checkIn ? new Date(b.checkIn).toLocaleDateString() : '-'
    }));

    res.json({
      success: true,
      text: textResponse,
      countTitle: "Active Bookings",
      count: bookings.length,
      buttonLabel: "Manage Bookings",
      redirectUrl: "/hotel/bookings",
      tableData
    });
  } catch (err) { next(err); }
};

exports.getPaymentsData = async (req, res, next) => {
  try {
    const role = req.user.role;
    if (!checkRole(role, ['receptionist'])) return res.status(403).json({ success: false, text: 'Access denied.' });

    const hotelId = req.hotelId || req.user.hotel;
    const bookings = await Booking.find({ hotel: hotelId });
    
    if (bookings.length === 0) return res.json({ success: true, text: 'No data available.', count: 0 });

    let totalRevenue = 0;
    bookings.forEach(b => totalRevenue += (b.paidAmount || 0));

    const query = req.query.q || 'Show payments';
    const textResponse = await generateTranslation({ totalRevenue }, query, 'Payments');

    res.json({
      success: true,
      text: textResponse,
      countTitle: "Total Revenue (₹)",
      count: totalRevenue,
      buttonLabel: "View Billing",
      redirectUrl: "/hotel/billing",
      tableData: []
    });
  } catch (err) { next(err); }
};

exports.getFoodOrdersData = async (req, res, next) => {
  try {
    const role = req.user.role;
    if (!checkRole(role, ['receptionist', 'hotel_staff'])) return res.status(403).json({ success: false, text: 'Access denied.' });

    res.json({
      success: true,
      text: "No data available.\n\nதரவு எதுவும் கிடைக்கவில்லை.",
      countTitle: "Pending Food Orders",
      count: 0,
      buttonLabel: "Go to POS",
      redirectUrl: "/hotel/pos",
      tableData: []
    });
  } catch (err) { next(err); }
};

exports.getAttendanceData = async (req, res, next) => {
  try {
    const role = req.user.role;
    if (!checkRole(role, [])) return res.status(403).json({ success: false, text: 'Access denied. Managers only.' }); // Admin/Manager allowed via checkRole logic

    const hotelId = req.hotelId || req.user.hotel;
    const employees = await Employee.find({ hotel: hotelId });
    
    if (employees.length === 0) return res.json({ success: true, text: 'No data available.', count: 0 });

    const onDuty = employees.filter(e => e.status === 'active');
    const query = req.query.q || 'Show attendance';
    const textResponse = await generateTranslation({ totalStaff: employees.length, onDuty: onDuty.length }, query, 'Attendance');

    const tableData = employees.map(e => ({
      "Name": e.name,
      "Department": e.department,
      "Status": e.status === 'active' ? 'On Duty' : 'Off Duty'
    }));

    res.json({
      success: true,
      text: textResponse,
      countTitle: "Staff On Duty",
      count: onDuty.length,
      buttonLabel: "View Staff",
      redirectUrl: "/hotel/operations?tab=staff",
      tableData
    });
  } catch (err) { next(err); }
};

exports.getReportsData = async (req, res, next) => {
  res.json({ success: true, text: "Reports module is active. Please navigate to reports.\n\nஅறிக்கைகள் தொகுதி செயலில் உள்ளது.", countTitle: "Reports", count: 1, buttonLabel: "View Reports", redirectUrl: "/hotel/revenue", tableData: [] });
};

exports.getSummaryData = async (req, res, next) => {
  res.json({ success: true, text: "Here is your hotel summary. I can help with rooms, bookings, maintenance, and staff.\n\nஉங்கள் ஹோட்டல் சுருக்கம் இங்கே.", countTitle: "Hotel Active", count: 1, buttonLabel: "Dashboard", redirectUrl: "/hotel/dashboard", tableData: [] });
};
