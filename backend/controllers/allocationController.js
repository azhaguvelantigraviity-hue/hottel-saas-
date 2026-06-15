const Room = require('../models/Room');
const Booking = require('../models/Booking');
const { asyncHandler, sendSuccess, AppError } = require('../utils/helpers');
const catchAsync = asyncHandler;

exports.getRecommendations = catchAsync(async (req, res) => {
  const { hotelId } = req;
  const { 
    checkIn, checkOut, guestCount, 
    roomType, budgetMin, budgetMax, 
    ac, smoking, nearLift, view, floor, customerType 
  } = req.body;

  if (!checkIn || !checkOut || !guestCount) {
    throw new AppError('CheckIn, CheckOut, and Guest Count are required', 400);
  }

  // 1. Fetch all active rooms for the hotel
  const rooms = await Room.find({ hotel: hotelId, isActive: true, status: { $ne: 'maintenance' } });

  // 2. Find overlapping bookings for the given dates
  const overlappingBookings = await Booking.find({
    hotel: hotelId,
    status: { $in: ['confirmed', 'checked_in'] },
    $or: [
      { checkIn:  { $lt: new Date(checkOut), $gte: new Date(checkIn) } },
      { checkOut: { $gt: new Date(checkIn),  $lte: new Date(checkOut) } },
      { checkIn:  { $lte: new Date(checkIn) }, checkOut: { $gte: new Date(checkOut) } },
    ]
  }).distinct('room');

  const occupiedRoomIds = overlappingBookings.map(id => id.toString());

  // 3. Filter available rooms and by capacity
  let availableRooms = rooms.filter(room => {
    if (occupiedRoomIds.includes(room._id.toString())) return false;
    // Exclude rooms currently in cleaning if we check in today, though this might be strict.
    if (room.status === 'cleaning' && new Date(checkIn).toDateString() === new Date().toDateString()) return false;
    if (room.maxGuests < guestCount) return false;
    return true;
  });

  if (availableRooms.length === 0) {
    return sendSuccess(res, []);
  }

  // 4. Calculate AI Score
  const scoredRooms = availableRooms.map(room => {
    let score = 100;
    const reasons = ['Capacity matched'];

    // Room Type Match
    if (roomType && room.type === roomType) {
      score += 20;
      reasons.push('Exact room type match');
    } else if (roomType) {
      if (customerType === 'VIP') {
        // Upgrade suggestion
        score += 5;
        reasons.push('Suggested upgrade for VIP');
      } else {
        score -= 10;
      }
    }

    // Budget Match
    if (budgetMin !== undefined && budgetMax !== undefined) {
      if (room.baseRate >= budgetMin && room.baseRate <= budgetMax) {
        score += 15;
        reasons.push('Matches budget perfectly');
      } else if (room.baseRate < budgetMin) {
        score += 5;
        reasons.push('Under budget');
      } else {
        score -= 15;
      }
    }

    // AC Preference
    if (ac !== undefined) {
      if (room.ac === ac) {
        score += 10;
        reasons.push(ac ? 'AC room available' : 'Non-AC room available');
      } else {
        score -= 20;
      }
    }

    // Smoking Preference
    if (smoking !== undefined) {
      if (room.smoking === smoking) {
        score += 10;
        reasons.push(smoking ? 'Smoking allowed' : 'Non-Smoking room');
      } else {
        score -= 20;
      }
    }

    // View Preference
    if (view && view !== 'None') {
      if (room.view === view) {
        score += 10;
        reasons.push(`Matches ${view} view preference`);
      }
    }

    // Near Lift
    if (nearLift !== undefined) {
      if (room.nearLift === nearLift) {
        score += 10;
        reasons.push(nearLift ? 'Near lift' : 'Away from lift');
      }
    }

    // Floor
    if (floor !== undefined) {
      if (room.floor === Number(floor)) {
        score += 10;
        reasons.push(`Previously preferred floor (${floor}) matched`);
      }
    }

    // Ensure score is bounded 0-100 for percentage display
    // Scale slightly down to leave room for max score
    let finalScore = Math.min(100, Math.max(0, Math.round((score / 170) * 100))); 
    // Wait, if base score is 100, and we add 20+15+10+10+10+10+10 = 85. Max is 185. 
    // Instead of scaling, let's just make it a percentage of max possible score.
    // Let's do: base score 50. Add up to 50 based on preferences.
    let baseScore = 60;
    let added = 0;
    let maxAdded = 0;
    
    if (roomType) maxAdded += 20;
    if (budgetMin !== undefined && budgetMax !== undefined) maxAdded += 15;
    if (ac !== undefined) maxAdded += 10;
    if (smoking !== undefined) maxAdded += 10;
    if (view && view !== 'None') maxAdded += 10;
    if (nearLift !== undefined) maxAdded += 10;
    if (floor !== undefined) maxAdded += 10;

    if (roomType && room.type === roomType) added += 20;
    if (budgetMin !== undefined && budgetMax !== undefined && room.baseRate >= budgetMin && room.baseRate <= budgetMax) added += 15;
    if (ac !== undefined && room.ac === ac) added += 10;
    if (smoking !== undefined && room.smoking === smoking) added += 10;
    if (view && view !== 'None' && room.view === view) added += 10;
    if (nearLift !== undefined && room.nearLift === nearLift) added += 10;
    if (floor !== undefined && room.floor === Number(floor)) added += 10;

    let computedScore = baseScore + (maxAdded > 0 ? (added / maxAdded) * 40 : 40); // Base 60, up to 40 points from prefs.
    
    // Penalties
    if (budgetMin !== undefined && budgetMax !== undefined && room.baseRate > budgetMax) computedScore -= 15;
    if (ac !== undefined && room.ac !== ac) computedScore -= 20;
    if (smoking !== undefined && room.smoking !== smoking) computedScore -= 15;

    finalScore = Math.min(100, Math.max(0, Math.round(computedScore)));

    return {
      room: room,
      score: finalScore,
      reasons: reasons
    };
  });

  // 5. Rank and top 3
  scoredRooms.sort((a, b) => b.score - a.score);
  const topRecommendations = scoredRooms.slice(0, 3);

  sendSuccess(res, topRecommendations);
});

exports.getAllocationAnalytics = catchAsync(async (req, res) => {
  const { hotelId } = req;
  const startOfDay = new Date(new Date().setHours(0,0,0,0));
  const endOfDay = new Date(new Date().setHours(23,59,59,999));

  const todaysBookings = await Booking.find({
    hotel: hotelId,
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });

  let aiCount = 0;
  let manualCount = 0;
  let totalScore = 0;

  todaysBookings.forEach(b => {
    if (b.allocationDetails && b.allocationDetails.assignedBy === 'AI') {
      aiCount++;
      if (b.allocationDetails.score) totalScore += b.allocationDetails.score;
    } else {
      manualCount++;
    }
  });

  const accuracy = aiCount > 0 ? Math.round(totalScore / aiCount) : 0;

  sendSuccess(res, {
    aiAllocationsToday: aiCount,
    manualAllocationsToday: manualCount,
    aiRecommendationAccuracy: accuracy
  });
});
