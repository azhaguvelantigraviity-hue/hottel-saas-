const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const { POSOrder } = require('../models/Operations');
const { asyncHandler, sendSuccess } = require('../utils/helpers');

// ── List Invoices ────────────────────────────────────────────
const getInvoices = asyncHandler(async (req, res) => {
  const filter = { hotel: req.hotelId };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.guestName) filter.guestName = { $regex: req.query.guestName, $options: 'i' };
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
    if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
  }
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;
  const [invoices, total] = await Promise.all([
    Invoice.find(filter).sort('-createdAt').skip(skip).limit(limit),
    Invoice.countDocuments(filter),
  ]);
  sendSuccess(res, { invoices, total, page, limit });
});

// ── Get Single Invoice ───────────────────────────────────────
const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, hotel: req.hotelId });
  if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
  sendSuccess(res, invoice);
});

// ── Create Invoice ───────────────────────────────────────────
const createInvoice = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (body.invoiceType) {
    const typeMap = { booking: 'room', restaurant: 'pos', events: 'event' };
    body.type = typeMap[body.invoiceType] || 'other';
  }
  body.subtotal = (body.roomCharges || 0) + (body.foodCharges || 0) + (body.laundryCharges || 0) + (body.spaCharges || 0) + (body.otherCharges || 0) + (body.posCharges || 0);
  body.discountAmount = body.discountType === 'percentage' ? Math.round(body.subtotal * (body.discountValue || 0) / 100) : body.discountType === 'fixed' ? (body.discountValue || 0) : 0;
  const taxable = body.subtotal - body.discountAmount;
  body.taxAmount = Math.round(taxable * (body.taxRate || 18) / 100);
  body.totalAmount = taxable + body.taxAmount;
  body.dueAmount = body.totalAmount - (body.paidAmount || 0);
  if (body.paidAmount >= body.totalAmount) body.paymentStatus = 'paid';
  else if (body.paidAmount > 0) body.paymentStatus = 'partial';
  if (body.status !== 'draft') body.status = 'issued';
  const invoice = await Invoice.create({ ...body, hotel: req.hotelId, createdBy: req.user._id });
  sendSuccess(res, invoice, 201);
});

// ── Update Invoice ───────────────────────────────────────────
const updateInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, hotel: req.hotelId });
  if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
  if (invoice.paymentStatus === 'paid' && req.body.status !== 'cancelled') {
    return res.status(400).json({ success: false, message: 'Cannot modify a paid invoice' });
  }
  Object.assign(invoice, req.body);
  invoice.subtotal = (invoice.roomCharges || 0) + (invoice.foodCharges || 0) + (invoice.laundryCharges || 0) + (invoice.spaCharges || 0) + (invoice.otherCharges || 0) + (invoice.posCharges || 0);
  invoice.discountAmount = invoice.discountType === 'percentage' ? Math.round(invoice.subtotal * (invoice.discountValue || 0) / 100) : invoice.discountType === 'fixed' ? (invoice.discountValue || 0) : 0;
  const taxable = invoice.subtotal - invoice.discountAmount;
  invoice.taxAmount = Math.round(taxable * (invoice.taxRate || 18) / 100);
  invoice.totalAmount = taxable + invoice.taxAmount;
  invoice.dueAmount = invoice.totalAmount - (invoice.paidAmount || 0);
  if (invoice.paidAmount >= invoice.totalAmount) invoice.paymentStatus = 'paid';
  else if (invoice.paidAmount > 0) invoice.paymentStatus = 'partial';
  else invoice.paymentStatus = 'pending';
  await invoice.save();
  sendSuccess(res, invoice);
});

// ── Delete/Cancel Invoice ────────────────────────────────────
const deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, hotel: req.hotelId });
  if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
  invoice.status = 'cancelled';
  invoice.paymentStatus = 'cancelled';
  await invoice.save();
  sendSuccess(res, invoice);
});

// ── Generate Invoice from Booking ────────────────────────────
const generateFromBooking = asyncHandler(async (req, res) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.bookingId);
  const filter = { hotel: req.hotelId };
  if (isObjectId) {
    filter.$or = [{ _id: req.params.bookingId }, { bookingId: req.params.bookingId }];
  } else {
    filter.bookingId = req.params.bookingId;
  }
  const booking = await Booking.findOne(filter).populate('guest').populate('room');
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  const posOrders = await POSOrder.find({ booking: booking._id, addedToRoom: true });
  const posCharges = posOrders.reduce((s, o) => s + o.total, 0);

  const roomCharges = booking.roomRate * booking.nights;
  const foodCharges = (booking.foodCharges || 0) + posCharges;
  const subtotal = roomCharges + foodCharges + (booking.laundryCharges || 0) + (booking.otherCharges || 0);
  const taxAmount = Math.round(subtotal * (booking.taxRate || 18) / 100);
  const totalAmount = subtotal + taxAmount;
  const paidAmount = booking.paidAmount || 0;

  const invoice = await Invoice.create({
    hotel: req.hotelId,
    type: 'room',
    guest: booking.guest?._id,
    guestName: booking.guest ? `${booking.guest.firstName} ${booking.guest.lastName}` : 'Guest',
    guestEmail: booking.guest?.email,
    guestPhone: booking.guest?.phone,
    booking: booking._id,
    roomNumber: booking.room?.roomNumber,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    nights: booking.nights,
    roomCharges,
    foodCharges,
    laundryCharges: booking.laundryCharges || 0,
    otherCharges: booking.otherCharges || 0,
    posCharges,
    posOrders: posOrders.map(o => o._id),
    subtotal,
    taxRate: booking.taxRate || 18,
    taxAmount,
    totalAmount,
    paidAmount,
    dueAmount: totalAmount - paidAmount,
    paymentStatus: paidAmount >= totalAmount ? 'paid' : paidAmount > 0 ? 'partial' : 'pending',
    status: 'issued',
    createdBy: req.user._id,
  });
  sendSuccess(res, invoice, 201);
});

// ── Record Payment ───────────────────────────────────────────
const recordPayment = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, hotel: req.hotelId });
  if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
  const { amount, method, date, splitPayments } = req.body;
  const newPaid = (invoice.paidAmount || 0) + (amount || 0);
  invoice.paidAmount = newPaid;
  invoice.dueAmount = invoice.totalAmount - newPaid;
  invoice.paymentMethod = method || invoice.paymentMethod;
  if (date) invoice.paymentDate = new Date(date);
  if (splitPayments) invoice.splitPayments = splitPayments;
  if (newPaid >= invoice.totalAmount) {
    invoice.paymentStatus = 'paid';
    invoice.status = 'paid';
  } else if (newPaid > 0) {
    invoice.paymentStatus = 'partial';
  }
  await invoice.save();
  sendSuccess(res, invoice);
});

// ── Process Refund ───────────────────────────────────────────
const processRefund = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, hotel: req.hotelId });
  if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
  const { amount, reason } = req.body;
  invoice.refundAmount = (invoice.refundAmount || 0) + (amount || 0);
  invoice.refundReason = reason || invoice.refundReason;
  invoice.refundDate = new Date();
  invoice.paymentStatus = 'refunded';
  invoice.status = 'refunded';
  invoice.paidAmount = Math.max(0, (invoice.paidAmount || 0) - (amount || 0));
  invoice.dueAmount = invoice.totalAmount - invoice.paidAmount;
  await invoice.save();
  sendSuccess(res, invoice);
});

// ── Revenue Dashboard ────────────────────────────────────────
const getRevenueDashboard = asyncHandler(async (req, res) => {
  const hotelId = req.hotelId;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const yearStart = new Date(today.getFullYear(), 0, 1);

  const [todayInvoices, monthInvoices, yearInvoices, allInvoices, statusCounts] = await Promise.all([
    Invoice.find({ hotel: hotelId, createdAt: { $gte: today }, status: { $in: ['issued','paid'] } }),
    Invoice.find({ hotel: hotelId, createdAt: { $gte: monthStart }, status: { $in: ['issued','paid'] } }),
    Invoice.find({ hotel: hotelId, createdAt: { $gte: yearStart }, status: { $in: ['issued','paid'] } }),
    Invoice.find({ hotel: hotelId, status: { $in: ['issued','paid'] } }),
    Invoice.aggregate([
      { $match: { hotel: hotelId } },
      { $group: { _id: '$paymentStatus', count: { $sum: 1 } } },
    ]),
  ]);

  const sum = (arr) => arr.reduce((s, i) => s + i.totalAmount, 0);
  const totalPaid = (arr) => arr.reduce((s, i) => s + (i.paidAmount || 0), 0);
  const totalDue = (arr) => arr.reduce((s, i) => s + (i.dueAmount || 0), 0);

  const statusMap = { pending: 0, partial: 0, paid: 0, refunded: 0, cancelled: 0 };
  statusCounts.forEach(s => { statusMap[s._id] = s.count; });

  sendSuccess(res, {
    today:  { count: todayInvoices.length, revenue: sum(todayInvoices), collected: totalPaid(todayInvoices), due: totalDue(todayInvoices) },
    month:  { count: monthInvoices.length, revenue: sum(monthInvoices), collected: totalPaid(monthInvoices), due: totalDue(monthInvoices) },
    year:   { count: yearInvoices.length, revenue: sum(yearInvoices), collected: totalPaid(yearInvoices), due: totalDue(yearInvoices) },
    total:  { count: allInvoices.length, revenue: sum(allInvoices), collected: totalPaid(allInvoices), due: totalDue(allInvoices) },
    counts: statusMap,
  });
});

// ── Revenue Report ───────────────────────────────────────────
const getRevenueReport = asyncHandler(async (req, res) => {
  const hotelId = req.hotelId;
  const { startDate, endDate, groupBy } = req.query;
  const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
  const end = endDate ? new Date(endDate) : new Date();

  const match = { hotel: hotelId, createdAt: { $gte: start, $lte: end }, status: { $in: ['issued','paid'] } };

  let groupId;
  if (groupBy === 'month') {
    groupId = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
  } else if (groupBy === 'type') {
    groupId = '$type';
  } else {
    groupId = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
  }

  const [report, methodBreakdown, typeBreakdown] = await Promise.all([
    Invoice.aggregate([
      { $match: match },
      { $group: { _id: groupId, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' }, collected: { $sum: '$paidAmount' }, due: { $sum: '$dueAmount' }, tax: { $sum: '$taxAmount' }, discount: { $sum: '$discountAmount' } } },
      { $sort: { _id: 1 } },
    ]),
    Invoice.aggregate([
      { $match: match },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } },
    ]),
    Invoice.aggregate([
      { $match: match },
      { $group: { _id: '$type', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } },
    ]),
  ]);

  sendSuccess(res, { report, methodBreakdown, typeBreakdown });
});

module.exports = {
  getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice,
  generateFromBooking, recordPayment, processRefund,
  getRevenueDashboard, getRevenueReport,
};
