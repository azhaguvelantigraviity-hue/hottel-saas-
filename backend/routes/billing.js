const router = require('express').Router();
const {
  getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice,
  generateFromBooking, recordPayment, processRefund,
  getRevenueDashboard, getRevenueReport,
} = require('../controllers/billingController');
const { protect, scopeToHotel, authorize } = require('../middleware/auth');

router.use(protect, scopeToHotel);

// Revenue & Reports (no plan gate — available to all)
router.get('/revenue/dashboard', getRevenueDashboard);
router.get('/revenue/report',    getRevenueReport);

// Invoice read access (all hotel roles)
router.get   ('/invoices',                getInvoices);
router.get   ('/invoices/:id',            getInvoice);

// Invoice write operations
router.use(authorize('hotel_admin', 'platform_admin', 'manager', 'hotel_staff', 'receptionist', 'housekeeping'));
router.post  ('/invoices',                createInvoice);
router.put   ('/invoices/:id',            updateInvoice);
router.delete('/invoices/:id',            deleteInvoice);
router.post  ('/invoices/from-booking/:bookingId', generateFromBooking);
router.post  ('/invoices/:id/payment',    recordPayment);
router.post  ('/invoices/:id/refund',     processRefund);

module.exports = router;
