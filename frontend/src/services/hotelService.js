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

// ── Guests / CRM ──────────────────────────────────────────────
export const getGuests   = (params = {}) => get(`/hotel/guests?${new URLSearchParams(params)}`);
export const getGuest    = (id)          => get(`/hotel/guests/${id}`);
export const createGuest = (body)        => post('/hotel/guests', body);
export const updateGuest = (id, body)    => put(`/hotel/guests/${id}`, body);

// ── Employees ─────────────────────────────────────────────────
export const getEmployees    = ()          => get('/hotel/employees');
export const getEmployee     = (id)        => get(`/hotel/employees/${id}`);
export const createEmployee  = (body)      => post('/hotel/employees', body);
export const updateEmployee  = (id, body)  => put(`/hotel/employees/${id}`, body);
export const markAttendance  = (id, body)  => post(`/hotel/employees/${id}/attendance`, body);
export const applyLeave      = (id, body)  => post(`/hotel/employees/${id}/leave`, body);

// ── Smart Check-In Process ──────────────────────────────────
export const getCheckInProcess   = (id)         => get(`/hotel/bookings/${id}/checkin-process`);
export const generateQRCode      = (id)         => post(`/hotel/bookings/${id}/qr-code`, {});
export const updateGuestDetails  = (id, body)   => put(`/hotel/bookings/${id}/guest-details`, body);
export const uploadIdScan        = (id, body)   => post(`/hotel/bookings/${id}/id-scan`, body);
export const submitFaceVerification = (id, body) => post(`/hotel/bookings/${id}/face-verification`, body);
export const saveSignature       = (id, body)   => post(`/hotel/bookings/${id}/signature`, body);
