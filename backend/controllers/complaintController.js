const Complaint = require('../models/Complaint');
const { asyncHandler, sendSuccess } = require('../utils/helpers');

// Get all complaints for a hotel
const getComplaints = asyncHandler(async (req, res) => {
  const hotelId = req.hotelId;
  const { status, priority, category } = req.query;

  const filter = { hotel: hotelId };
  if (status && status !== 'all') filter.status = status;
  if (priority && priority !== 'all') filter.priority = priority;
  if (category && category !== 'all') filter.category = category;

  if (req.user.role === 'hotel_staff' && req.user.department && req.user.department !== 'None') {
    filter.assignedDepartment = req.user.department;
  }

  const complaints = await Complaint.find(filter)
    .populate('createdBy', 'name')
    .populate('assignedTo', 'name')
    .sort('-createdAt');

  sendSuccess(res, complaints);
});

// Get single complaint
const getComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findOne({ _id: req.params.id, hotel: req.hotelId })
    .populate('createdBy', 'name')
    .populate('assignedTo', 'name');

  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
  sendSuccess(res, complaint);
});

// Create new complaint
const createComplaint = asyncHandler(async (req, res) => {
  const body = { ...req.body, hotel: req.hotelId, createdBy: req.user._id };
  const complaint = await Complaint.create(body);
  const populated = await Complaint.findById(complaint._id)
    .populate('createdBy', 'name')
    .populate('assignedTo', 'name');

  const io = req.app.get('io');
  if (io && populated.assignedDepartment && populated.assignedDepartment !== 'Unassigned') {
    io.to(req.hotelId.toString()).emit('newComplaint', populated);
  }

  sendSuccess(res, populated, 201);
});

// Update complaint
const updateComplaint = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (body.status === 'Resolved' && !body.resolvedAt) {
    body.resolvedAt = new Date();
  }

  const complaint = await Complaint.findOneAndUpdate(
    { _id: req.params.id, hotel: req.hotelId },
    body,
    { new: true, runValidators: true }
  )
    .populate('createdBy', 'name')
    .populate('assignedTo', 'name');

  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
  sendSuccess(res, complaint);
});

// Delete complaint
const deleteComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findOneAndDelete({ _id: req.params.id, hotel: req.hotelId });
  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
  sendSuccess(res, complaint);
});

module.exports = {
  getComplaints,
  getComplaint,
  createComplaint,
  updateComplaint,
  deleteComplaint
};
