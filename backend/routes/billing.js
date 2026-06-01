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

// Invoice CRUD (Admin/Manager only)
router.use(authorize('hotel_admin', 'platform_admin'));
router.get   ('/invoices',                getInvoices);
router.post  ('/invoices',                createInvoice);
router.get   ('/invoices/:id',            getInvoice);
router.put   ('/invoices/:id',            updateInvoice);
router.delete('/invoices/:id',            deleteInvoice);
router.post  ('/invoices/from-booking/:bookingId', generateFromBooking);
router.post  ('/invoices/:id/payment',    recordPayment);
router.post  ('/invoices/:id/refund',     processRefund);

module.exports = router;
