const { GoogleGenerativeAI } = require('@google/generative-ai');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Guest = require('../models/Guest');
const User = require('../models/User');
const { Employee, Maintenance, Housekeeping } = require('../models/Operations');
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
  if (!genAI) return { text: "AI services are not configured. Please set GEMINI_API_KEY.", stats: {}, tableData: [] };
  
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
    const jsonStr = result.response.text();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Gemini error:', error);
    return { text: "Data retrieved successfully, but AI analysis failed.", stats: {}, tableData: [] };
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
    if (!checkRole(req.user.role, ['housekeeping', 'hotel_staff'])) {
      return res.status(403).json({ success: false, text: 'Access denied. Administrator or maintenance staff permissions required.' });
    }

    const hotelId = req.hotelId || req.user.hotel;
    // Limit to recent tickets to avoid overflowing context
    const tickets = await Maintenance.find({ hotel: hotelId }).sort('-createdAt').limit(100).lean();
    
    const query = req.query.q || 'What is the maintenance status?';
    const aiResponse = await generateSmartAssistantResponse(tickets, query, 'Maintenance');

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
    if (!checkRole(req.user.role, ['receptionist', 'housekeeping', 'hotel_staff'])) {
      return res.status(403).json({ success: false, text: 'Access denied.' });
    }

    const hotelId = req.hotelId || req.user.hotel;
    const rooms = await Room.find({ hotel: hotelId }).lean();
    
    const query = req.query.q || 'Show rooms status';
    const aiResponse = await generateSmartAssistantResponse(rooms, query, 'Rooms');

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
    if (!checkRole(req.user.role, ['receptionist'])) return res.status(403).json({ success: false, text: 'Access denied.' });

    const hotelId = req.hotelId || req.user.hotel;
    const bookings = await Booking.find({ hotel: hotelId }).sort('-createdAt').limit(100).populate('guest', 'firstName lastName email phone').lean();
    
    const query = req.query.q || 'Show active bookings';
    const aiResponse = await generateSmartAssistantResponse(bookings, query, 'Bookings');

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
    if (!checkRole(req.user.role, ['receptionist'])) return res.status(403).json({ success: false, text: 'Access denied.' });

    const hotelId = req.hotelId || req.user.hotel;
    const bookings = await Booking.find({ hotel: hotelId, status: { $in: ['confirmed', 'checked_in', 'checked_out'] } }).sort('-createdAt').limit(200).lean();
    
    const query = req.query.q || 'Show payments';
    const aiResponse = await generateSmartAssistantResponse(bookings, query, 'Payments & Revenue');

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
    if (!checkRole(req.user.role, ['housekeeping'])) return res.status(403).json({ success: false, text: 'Access denied.' });

    const hotelId = req.hotelId || req.user.hotel;
    const tasks = await Housekeeping.find({ hotel: hotelId }).sort('-createdAt').limit(100).lean();
    
    const query = req.query.q || 'Show housekeeping';
    const aiResponse = await generateSmartAssistantResponse(tasks, query, 'Housekeeping');

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
    
    const query = req.query.q || 'Show employees';
    const aiResponse = await generateSmartAssistantResponse(employees, query, 'Employees');

    res.json({
      success: true,
      text: aiResponse.text,
      stats: aiResponse.stats,
      buttons: [{ label: "Manage Staff", url: "/hotel/employees" }],
      suggestedActions: ["Show staff arriving next shift"],
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
    // Basic aggregation or recent fetches
    const invoices = await Invoice.find({ hotel: hotelId }).sort('-createdAt').limit(200).select('totalAmount status type createdAt').lean();
    const bookings = await Booking.find({ hotel: hotelId }).sort('-createdAt').limit(200).select('status totalAmount checkIn checkOut').lean();
    
    const query = req.query.q || 'Show reports and analytics';
    const aiResponse = await generateSmartAssistantResponse({ invoices, bookings }, query, 'Reports & Analytics');

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
    // We reuse reports data for simplicity, Gemini will handle the formatting differently
    const invoices = await Invoice.find({ hotel: hotelId }).sort('-createdAt').limit(200).select('totalAmount status type createdAt').lean();
    const rooms = await Room.find({ hotel: hotelId }).select('status').lean();
    
    const query = req.query.q || 'Show analytics';
    const aiResponse = await generateSmartAssistantResponse({ invoices, rooms }, query, 'Analytics');

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
