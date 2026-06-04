// ─────────────────────────────────────────────────────────────
//  Hotel Service  –  /api/v1/hotel
// ─────────────────────────────────────────────────────────────
import { get, post, put, patch, del } from './api.js';

// ── Rooms ─────────────────────────────────────────────────────
export const getRooms            = ()           => get('/hotel/rooms');
export const getRoom             = (id)         => get(`/hotel/rooms/${id}`);
export const createRoom          = (body)       => post('/hotel/rooms', body);
export const updateRoom          = (id, body)   => put(`/hotel/rooms/${id}`, body);
export const deleteRoom          = (id)         => del(`/hotel/rooms/${id}`);
export const updateHousekeeping  = (id, status) => patch(`/hotel/rooms/${id}/housekeeping`, { housekeepingStatus: status });
export const checkAvailability   = (params)     => get(`/hotel/rooms/availability?${new URLSearchParams(params)}`);

// ── Bookings ──────────────────────────────────────────────────
export const getBookings   = (params = {}) => get(`/hotel/bookings?${new URLSearchParams(params)}`);
export const getBooking    = (id)          => get(`/hotel/bookings/${id}`);
export const createBooking = (body)        => post('/hotel/bookings', body);
export const updateBooking = (id, body)    => put(`/hotel/bookings/${id}`, body);
export const checkIn       = (id)          => post(`/hotel/bookings/${id}/checkin`, {});
export const checkOut      = (id)          => post(`/hotel/bookings/${id}/checkout`, {});
export const cancelBooking = (id, reason)  => post(`/hotel/bookings/${id}/cancel`, { reason });
export const deleteBooking = (id)          => del('/hotel/bookings/' + id);

// ── Guests / CRM ──────────────────────────────────────────────
export const getGuests   = (params = {}) => get(`/hotel/guests?${new URLSearchParams(params)}`);
export const getGuest    = (id)          => get(`/hotel/guests/${id}`);
export const createGuest = (body)        => post('/hotel/guests', body);
export const updateGuest = (id, body)    => put(`/hotel/guests/${id}`, body);
export const deleteGuest = (id)          => del(`/hotel/guests/${id}`);

// ── Employees ─────────────────────────────────────────────────
export const getEmployees    = ()          => get('/hotel/employees');
export const getAttendance   = ()          => get('/hotel/attendance');
export const getEmployee     = (id)        => get(`/hotel/employees/${id}`);
export const createEmployee  = (body)      => post('/hotel/employees', body);
export const updateEmployee  = (id, body)  => put(`/hotel/employees/${id}`, body);
export const deleteEmployee  = (id)        => del(`/hotel/employees/${id}`);
export const markAttendance  = (id, body)  => post(`/hotel/employees/${id}/attendance`, body);
export const applyLeave      = (id, body)  => post(`/hotel/employees/${id}/leave`, body);

// ── Smart Check-In Process ──────────────────────────────────
export const getCheckInProcess   = (id)         => get(`/hotel/bookings/${id}/checkin-process`);
export const generateQRCode      = (id)         => post(`/hotel/bookings/${id}/qr-code`, {});
export const updateGuestDetails  = (id, body)   => put(`/hotel/bookings/${id}/guest-details`, body);
export const uploadIdScan        = (id, body)   => post(`/hotel/bookings/${id}/id-scan`, body);
export const submitFaceVerification = (id, body) => post(`/hotel/bookings/${id}/face-verification`, body);
export const saveSignature       = (id, body)   => post(`/hotel/bookings/${id}/signature`, body);

// ── Cab Bookings / Travel Desk ──────────────────────────────────
export const getCabBookings   = (params = {}) => get(`/hotel/cab-bookings?${new URLSearchParams(params)}`);
export const getCabBooking    = (id)          => get(`/hotel/cab-bookings/${id}`);
export const createCabBooking = (body)        => post('/hotel/cab-bookings', body);
export const updateCabBooking = (id, body)    => put(`/hotel/cab-bookings/${id}`, body);
export const deleteCabBooking = (id)          => del(`/hotel/cab-bookings/${id}`);
export const getTravelPackages= (params = {}) => get(`/hotel/travel-packages?${new URLSearchParams(params)}`);

// ── Billing & Invoices ──────────────────────────────────────────
export const getInvoices            = (params = {}) => get(`/billing/invoices?${new URLSearchParams(params)}`);
export const getInvoice             = (id)          => get(`/billing/invoices/${id}`);
export const createInvoice          = (body)        => post('/billing/invoices', body);
export const updateInvoice          = (id, body)    => put(`/billing/invoices/${id}`, body);
export const deleteInvoice          = (id)          => del(`/billing/invoices/${id}`);
export const generateInvoiceFromBooking = (bookingId) => post(`/billing/invoices/from-booking/${bookingId}`, {});
export const recordPayment          = (id, body)    => post(`/billing/invoices/${id}/payment`, body);
export const processRefund          = (id, body)    => post(`/billing/invoices/${id}/refund`, body);
export const getRevenueDashboard    = ()            => get('/billing/revenue/dashboard');
export const getRevenueReport       = (params = {}) => get(`/billing/revenue/report?${new URLSearchParams(params)}`);

// ── Dashboard Features ──────────────────────────────────────────
export const getTodayCheckins      = ()         => get('/hotel/bookings/today/checkins');
export const getTodayCheckouts     = ()         => get('/hotel/bookings/today/checkouts');
export const getPendingPayments    = ()         => get('/hotel/payments/pending');
export const getMaintenanceRooms   = ()         => get('/hotel/rooms/maintenance');
export const updateRoomMaintenance = (id, body) => patch(`/hotel/rooms/${id}/maintenance`, body);
