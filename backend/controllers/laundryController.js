const LaundryOrder = require('../models/LaundryOrder');
const { asyncHandler, sendSuccess } = require('../utils/helpers');

exports.getOrders = asyncHandler(async (req, res) => {
  const filter = { hotel: req.hotelId };
  if (req.query.status) filter.status = req.query.status;
  const orders = await LaundryOrder.find(filter).sort({ createdAt: -1 });
  sendSuccess(res, orders);
});

exports.createOrder = asyncHandler(async (req, res) => {
  const count = await LaundryOrder.countDocuments({ hotel: req.hotelId });
  const orderId = `LN-${String(count + 1).padStart(3, '0')}`;
  const now = new Date();
  const pickup = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });

  const order = await LaundryOrder.create({
    ...req.body,
    hotel: req.hotelId,
    orderId,
    pickup,
  });

  const io = req.app.get('io');
  if (io) {
    io.to(req.hotelId.toString()).emit('laundryOrderChanged', { action: 'create', order });
  }

  sendSuccess(res, order, 201);
});

exports.updateOrder = asyncHandler(async (req, res) => {
  const order = await LaundryOrder.findOneAndUpdate(
    { _id: req.params.id, hotel: req.hotelId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const io = req.app.get('io');
  if (io) {
    io.to(req.hotelId.toString()).emit('laundryOrderChanged', { action: 'update', order });
  }

  sendSuccess(res, order);
});

exports.advanceOrder = asyncHandler(async (req, res) => {
  const order = await LaundryOrder.findOne({ _id: req.params.id, hotel: req.hotelId });
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const STATUS_FLOW = ['picked', 'washing', 'drying', 'ready', 'delivered'];
  const idx = STATUS_FLOW.indexOf(order.status);
  order.status = STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)];
  await order.save();

  const io = req.app.get('io');
  if (io) {
    io.to(req.hotelId.toString()).emit('laundryOrderChanged', { action: 'update', order });
  }

  sendSuccess(res, order);
});

exports.deleteOrder = asyncHandler(async (req, res) => {
  const order = await LaundryOrder.findOneAndDelete({ _id: req.params.id, hotel: req.hotelId });
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const io = req.app.get('io');
  if (io) {
    io.to(req.hotelId.toString()).emit('laundryOrderChanged', { action: 'delete', id: req.params.id });
  }

  sendSuccess(res, null, 204);
});
