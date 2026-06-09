const TravelAgency = require('../models/TravelAgency');
const CabBooking = require('../models/CabBooking');
const { AppError, asyncHandler, sendSuccess } = require('../utils/helpers');

// Middleware to enforce enterprise plan
exports.requireEnterprise = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'platform_admin') return next();
  
  const Hotel = require('../models/Hotel');
  const hotel = await Hotel.findById(req.hotelId);
  if (!hotel) return next(new AppError('Hotel not found', 404));
  
  if (hotel.plan !== 'enterprise') {
    return next(new AppError('Travels Management is available only in Enterprise Plan', 403));
  }
  next();
});

// --- AGENCIES ---
exports.getAgencies = asyncHandler(async (req, res) => {
  const agencies = await TravelAgency.find({ hotel: req.hotelId, isActive: true });
  sendSuccess(res, agencies);
});

exports.createAgency = asyncHandler(async (req, res) => {
  req.body.hotel = req.hotelId;
  const agency = await TravelAgency.create(req.body);
  sendSuccess(res, agency, 201);
});

exports.updateAgency = asyncHandler(async (req, res, next) => {
  const agency = await TravelAgency.findOneAndUpdate(
    { _id: req.params.id, hotel: req.hotelId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!agency) return next(new AppError('Agency not found', 404));
  sendSuccess(res, agency);
});

exports.deleteAgency = asyncHandler(async (req, res, next) => {
  const agency = await TravelAgency.findOneAndUpdate(
    { _id: req.params.id, hotel: req.hotelId },
    { isActive: false },
    { new: true }
  );
  if (!agency) return next(new AppError('Agency not found', 404));
  sendSuccess(res, {}, 200);
});

// --- VEHICLES ---
exports.addVehicle = asyncHandler(async (req, res, next) => {
  const agency = await TravelAgency.findOne({ _id: req.params.id, hotel: req.hotelId });
  if (!agency) return next(new AppError('Agency not found', 404));
  
  agency.vehicles.push(req.body);
  await agency.save();
  sendSuccess(res, agency, 201);
});

exports.updateVehicle = asyncHandler(async (req, res, next) => {
  const agency = await TravelAgency.findOne({ _id: req.params.agencyId, hotel: req.hotelId });
  if (!agency) return next(new AppError('Agency not found', 404));
  
  const vehicle = agency.vehicles.id(req.params.vehicleId);
  if (!vehicle) return next(new AppError('Vehicle not found', 404));
  
  Object.assign(vehicle, req.body);
  await agency.save();
  sendSuccess(res, agency);
});

exports.deleteVehicle = asyncHandler(async (req, res, next) => {
  const agency = await TravelAgency.findOne({ _id: req.params.agencyId, hotel: req.hotelId });
  if (!agency) return next(new AppError('Agency not found', 404));
  
  agency.vehicles.pull(req.params.vehicleId);
  await agency.save();
  sendSuccess(res, agency);
});

// --- DRIVERS ---
exports.addDriver = asyncHandler(async (req, res, next) => {
  const agency = await TravelAgency.findOne({ _id: req.params.id, hotel: req.hotelId });
  if (!agency) return next(new AppError('Agency not found', 404));
  
  agency.drivers.push(req.body);
  await agency.save();
  sendSuccess(res, agency, 201);
});

exports.updateDriver = asyncHandler(async (req, res, next) => {
  const agency = await TravelAgency.findOne({ _id: req.params.agencyId, hotel: req.hotelId });
  if (!agency) return next(new AppError('Agency not found', 404));
  
  const driver = agency.drivers.id(req.params.driverId);
  if (!driver) return next(new AppError('Driver not found', 404));
  
  Object.assign(driver, req.body);
  await agency.save();
  sendSuccess(res, agency);
});

exports.deleteDriver = asyncHandler(async (req, res, next) => {
  const agency = await TravelAgency.findOne({ _id: req.params.agencyId, hotel: req.hotelId });
  if (!agency) return next(new AppError('Agency not found', 404));
  
  agency.drivers.pull(req.params.driverId);
  await agency.save();
  sendSuccess(res, agency);
});

// --- BOOKINGS ---
exports.getBookings = asyncHandler(async (req, res) => {
  // Return all cab bookings for the hotel that are not simple airport/packages (or return all)
  const bookings = await CabBooking.find({ hotel: req.hotelId }).populate('agency', 'agencyName');
  sendSuccess(res, bookings);
});

exports.createBooking = asyncHandler(async (req, res) => {
  req.body.hotel = req.hotelId;
  const booking = await CabBooking.create(req.body);
  sendSuccess(res, booking, 201);
});

exports.updateBookingStatus = asyncHandler(async (req, res, next) => {
  const booking = await CabBooking.findOneAndUpdate(
    { _id: req.params.id, hotel: req.hotelId },
    { status: req.body.status },
    { new: true }
  ).populate('agency', 'agencyName');
  if (!booking) return next(new AppError('Booking not found', 404));
  sendSuccess(res, booking);
});

exports.updateBookingPayment = asyncHandler(async (req, res, next) => {
  const booking = await CabBooking.findOneAndUpdate(
    { _id: req.params.id, hotel: req.hotelId },
    { paymentStatus: req.body.paymentStatus },
    { new: true }
  ).populate('agency', 'agencyName');
  if (!booking) return next(new AppError('Booking not found', 404));
  sendSuccess(res, booking);
});
