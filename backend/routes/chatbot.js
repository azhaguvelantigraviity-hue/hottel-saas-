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

    const [rooms, activeBookings, allBookings, guestsCount, users] = await Promise.all([
      Room.find({ hotel: hotelId }),
      Booking.find({ hotel: hotelId, status: { $in: ['confirmed', 'checked_in'] } }).populate('guest room'),
      Booking.find({ hotel: hotelId }),
      Guest.countDocuments({ hotel: hotelId }),
      User.find({ hotel: hotelId }).select('-password')
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

    if (role === 'admin' || role === 'manager') {
      context.metrics.totalRevenue = revenue;
      context.metrics.totalPaymentsReceived = paidAmount;
      context.metrics.totalEmployees = users.length;
      context.lists.employees = users.map(u => ({ name: u.name, role: u.role }));
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

    const botResponse = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";

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
