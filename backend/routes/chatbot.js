const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Groq = require('groq-sdk');
const { protect } = require('../middleware/auth');
const { AppError } = require('../utils/helpers');

const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Guest = require('../models/Guest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { Employee, Maintenance } = require('../models/Operations');

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Set up multer to store files temporarily in uploads/
const upload = multer({ dest: 'uploads/' });

router.post('/', protect, upload.single('audio'), async (req, res, next) => {
  try {
    let userText = '';

    if (req.file) {
      const filePath = req.file.path;

      // 1. Transcribe audio using Whisper
      const transcription = await groq.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: 'whisper-large-v3',
        temperature: 0,
        response_format: 'verbose_json',
      });

      userText = transcription.text;

      // Clean up temporary audio file
      fs.unlink(filePath, (err) => {
        if (err) console.error('Failed to delete temp audio file:', err);
      });
    } else if (req.body.text) {
      // 1.b Use provided text directly
      userText = req.body.text;
    } else {
      return next(new AppError('No audio file or text provided', 400));
    }

    // 2. Build live hotel context from MongoDB
    const hotelId = req.hotelId || req.user.hotel;
    const role = req.user.role;

    const [rooms, activeBookings, allBookings, guestsCount, employees] = await Promise.all([
      Room.find({ hotel: hotelId }),
      Booking.find({ hotel: hotelId, status: { $in: ['confirmed', 'checked_in'] } }).populate('guest room'),
      Booking.find({ hotel: hotelId }),
      Guest.countDocuments({ hotel: hotelId }),
      Employee.find({ hotel: hotelId })
    ]);

    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysCheckins = activeBookings.filter(b => b.checkIn && new Date(b.checkIn) >= today && new Date(b.checkIn) < tomorrow);
    const todaysCheckouts = activeBookings.filter(b => b.checkOut && new Date(b.checkOut) >= today && new Date(b.checkOut) < tomorrow);
    
    const availableRooms = rooms.filter(r => r.status === 'available');
    const maintenanceRooms = rooms.filter(r => r.status === 'maintenance');
    const cleaningRooms = rooms.filter(r => r.housekeepingStatus !== 'clean');

    let revenue = 0;
    let paidAmount = 0;
    if (role === 'admin' || role === 'manager') {
      allBookings.forEach(b => {
        revenue += (b.totalAmount || 0);
        paidAmount += (b.paidAmount || 0);
      });
    }

    const context = {
      hotelId,
      timestamp: new Date().toISOString(),
      metrics: {
        totalRooms: rooms.length,
        availableRooms: availableRooms.length,
        maintenanceRooms: maintenanceRooms.length,
        cleaningRooms: cleaningRooms.length,
        activeBookings: activeBookings.length,
        todaysCheckins: todaysCheckins.length,
        todaysCheckouts: todaysCheckouts.length,
        totalCustomers: guestsCount,
      },
      lists: {
        availableRoomNumbers: availableRooms.map(r => r.roomNumber),
        maintenanceRoomNumbers: maintenanceRooms.map(r => r.roomNumber),
        todaysCheckinNames: todaysCheckins.map(b => b.guest?.firstName ? `${b.guest.firstName} ${b.guest.lastName||''}`.trim() : 'Unknown'),
        todaysCheckoutNames: todaysCheckouts.map(b => b.guest?.firstName ? `${b.guest.firstName} ${b.guest.lastName||''}`.trim() : 'Unknown')
      }
    };

    const allowedRoles = ['platform_admin', 'hotel_admin', 'manager', 'receptionist', 'hotel_staff'];
    if (allowedRoles.includes(role)) {
      context.metrics.totalRevenue = revenue;
      context.metrics.totalPaymentsReceived = paidAmount;
      context.metrics.totalEmployees = employees.length;
      context.lists.employees = employees.map(e => `${e.name} - ${e.department} - ${e.shift} Shift - ${e.status === 'active' ? 'On Duty' : 'Off Duty'} - ₹${(e.salary || 0).toLocaleString('en-IN')}`);
    } else {
      context.accessNote = "Revenue and employee data is restricted for this role.";
    }

    // 3. Generate a response using an LLM
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are StayOS, the AI assistant for this hotel. You are connected directly to the live MongoDB database.
Use ONLY the provided LIVE JSON DATA to answer the user's question. 
CRITICAL RULES:
1. NEVER say "As an AI", "knowledge cutoff", or "Data may have changed". You have real-time data.
2. If the user asks for data that is zero, empty, or not present in the JSON, answer EXACTLY with: "No records found." Do not add extra text.
3. Keep answers extremely concise and direct.
4. If the user asks for restricted data, inform them it's restricted.
5. If the user reports a room maintenance issue (e.g., AC broken, TV not working), reply normally but APPEND this EXACT text block at the end of your response: <CREATE_TICKET:RoomNumber:Issue:Category:Priority> 
(Category must be one of: HVAC, Plumbing, Electronics, Elevator, Furniture, Electrical, Other. Priority must be: high, medium, or low).

LIVE JSON DATA:
${JSON.stringify(context, null, 2)}`
        },
        {
          role: 'user',
          content: userText,
        },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
      max_tokens: 150,
    });

    let botResponse = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";

    // Intercept Auto-Repair triggers
    const ticketMatch = botResponse.match(/<CREATE_TICKET:([^:]+):([^:]+):([^:]+):([^>]+)>/);
    if (ticketMatch) {
      const [_, roomNum, issue, category, priority] = ticketMatch;
      botResponse = botResponse.replace(ticketMatch[0], '').trim();

      const maintenanceStaff = await Employee.findOne({ hotel: hotelId, status: 'active', department: 'Maintenance' }) 
         || await Employee.findOne({ hotel: hotelId, status: 'active', role: 'housekeeping' });
      
      const reqCount = await Maintenance.countDocuments({ hotel: hotelId });
      const ticketId = `MNT-${String(reqCount + 1001).padStart(4, '0')}`;
      
      await Maintenance.create({
        hotel: hotelId,
        ticketId,
        room: roomNum.trim(),
        issue: issue.trim(),
        category: category.trim(),
        priority: priority.trim().toLowerCase(),
        status: 'open',
        assignedTo: maintenanceStaff ? maintenanceStaff.name : null,
        reportedBy: 'StayOS Assistant'
      });

      if (priority.trim().toLowerCase() === 'high') {
        await Room.findOneAndUpdate({ hotel: hotelId, roomNumber: roomNum.trim() }, { status: 'maintenance' });
      }

      const io = req.app.get('io');
      const notif = await Notification.create({
        hotel: hotelId,
        title: 'New AI Maintenance Ticket',
        desc: `Room ${roomNum.trim()}: ${issue.trim()} (Assigned to ${maintenanceStaff ? maintenanceStaff.name : 'Unassigned'})`,
        type: 'maintenance',
        icon: 'tool',
        color: 'var(--rose)',
        targetRoles: ['platform_admin', 'hotel_admin', 'manager', 'receptionist', 'housekeeping', 'hotel_staff'],
        relatedRoom: roomNum.trim()
      });

      if (io) {
        notif.targetRoles.forEach(r => {
           io.to(`hotel_${hotelId}_${r}`).emit('newNotification', notif);
        });
      }
    }

    res.json({
      success: true,
      transcription: userText,
      response: botResponse,
    });
  } catch (err) {
    // Attempt to clean up file if error occurs
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }
    console.error('Groq API Error:', err);
    next(new AppError('Failed to process voice request', 500));
  }
});

module.exports = router;
