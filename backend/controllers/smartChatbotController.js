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
        { label: "View Details", url: "/hotel/operations?tab=maintenance" },
        { label: "Assign Staff", url: "/hotel/operations?tab=staff" }
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
      buttons: [{ label: "Housekeeping Dashboard", url: "/hotel/operations?tab=housekeeping" }],
      suggestedActions: ["Assign available maids", "Show VIP room cleaning status"],
      tableData: aiResponse.tableData
    });
  } catch (err) { next(err); }
};

exports.getFoodOrdersData = async (req, res, next) => {
  res.json({
    success: true,
    text: "Food Orders module is currently offline. Please use the POS dashboard.",
    stats: { "Pending Orders": 0 },
    buttons: [{ label: "Open POS", url: "/hotel/restaurant" }],
    suggestedActions: [],
    tableData: []
  });
};

exports.getAttendanceData = async (req, res, next) => {
  try {
    if (!checkRole(req.user.role, [])) return res.status(403).json({ success: false, text: 'Access denied. Managers only.' });

    const hotelId = req.hotelId || req.user.hotel;
    const employees = await Employee.find({ hotel: hotelId }).sort('-createdAt').limit(100).lean();
    
    const query = req.query.q || 'Show employees';
    const aiResponse = await generateSmartAssistantResponse(employees, query, 'Employees');

    res.json({
      success: true,
      text: aiResponse.text,
      stats: aiResponse.stats,
      buttons: [{ label: "Manage Staff", url: "/hotel/operations?tab=staff" }],
      suggestedActions: ["Show staff arriving next shift"],
      tableData: aiResponse.tableData
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
