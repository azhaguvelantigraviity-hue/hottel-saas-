// ─────────────────────────────────────────────────────────────
//  Operations Service  –  /api/v1/operations
// ─────────────────────────────────────────────────────────────
import { get, post, put, del } from './api.js';

// ── Housekeeping ──────────────────────────────────────────────
export const getHousekeepingDashboard = ()          => get('/operations/housekeeping/dashboard');
export const getHousekeepingTasks     = ()          => get('/operations/housekeeping');
export const createHousekeepingTask   = (body)      => post('/operations/housekeeping', body);
export const updateHousekeepingTask   = (id, body)  => put(`/operations/housekeeping/${id}`, body);
export const verifyHousekeepingTask   = (id)        => post(`/operations/housekeeping/${id}/verify`, {});

// ── Maintenance ───────────────────────────────────────────────
export const getMaintenanceRequests  = ()          => get('/operations/maintenance');
export const createMaintenanceRequest= (body)      => post('/operations/maintenance', body);
export const updateMaintenanceRequest= (id, body)  => put(`/operations/maintenance/${id}`, body);
export const deleteMaintenanceRequest= (id)        => del(`/operations/maintenance/${id}`);

// ── Restaurant POS ────────────────────────────────────────────
export const getMenuItems      = (params = {}) => get(`/operations/pos/menu?${new URLSearchParams(params)}`);
export const createMenuItem    = (body)         => post('/operations/pos/menu', body);
export const updateMenuItem    = (id, body)     => put(`/operations/pos/menu/${id}`, body);
export const deleteMenuItem    = (id)           => del(`/operations/pos/menu/${id}`);
export const getPOSSummary     = ()             => get('/operations/pos/summary');
export const getPOSOrders      = ()             => get('/operations/pos');
export const createPOSOrder    = (body)         => post('/operations/pos', body);
export const updatePOSOrder    = (id, body)     => put(`/operations/pos/${id}`, body);

// ── Events & Halls ────────────────────────────────────────────
export const getHalls           = (params = {}) => get(`/operations/events/halls?${new URLSearchParams(params)}`);
export const createHall         = (body)         => post('/operations/events/halls', body);
export const updateHall         = (id, body)     => put(`/operations/events/halls/${id}`, body);
export const deleteHall         = (id)           => del(`/operations/events/halls/${id}`);
export const getEventBookings   = (params = {}) => get(`/operations/events/bookings?${new URLSearchParams(params)}`);
export const createEventBooking = (body)         => post('/operations/events/bookings', body);
export const updateEventBooking = (id, body)     => put(`/operations/events/bookings/${id}`, body);
export const deleteEventBooking = (id)           => del(`/operations/events/bookings/${id}`);
export const getCateringPackages = (params = {}) => get(`/operations/events/catering?${new URLSearchParams(params)}`);
export const createCateringPackage = (body)      => post('/operations/events/catering', body);
export const updateCateringPackage = (id, body)  => put(`/operations/events/catering/${id}`, body);
export const deleteCateringPackage = (id)        => del(`/operations/events/catering/${id}`);

// ── Security & Access Control ────────────────────────────────
export const getCameras        = (params = {}) => get(`/operations/security/cameras?${new URLSearchParams(params)}`);
export const createCamera      = (body)         => post('/operations/security/cameras', body);
export const updateCamera      = (id, body)     => put(`/operations/security/cameras/${id}`, body);
export const deleteCamera      = (id)           => del(`/operations/security/cameras/${id}`);
export const getVisitors       = (params = {}) => get(`/operations/security/visitors?${new URLSearchParams(params)}`);
export const createVisitor     = (body)         => post('/operations/security/visitors', body);
export const updateVisitor     = (id, body)     => put(`/operations/security/visitors/${id}`, body);
export const deleteVisitor     = (id)           => del(`/operations/security/visitors/${id}`);
export const getSecurityActivity = (params = {}) => get(`/operations/security/activity?${new URLSearchParams(params)}`);
export const createSecurityActivity = (body)    => post('/operations/security/activity', body);
export const getUserSessions   = ()             => get('/operations/security/sessions');
export const revokeSession     = (id)           => del(`/operations/security/sessions/${id}`);

// ── Reports ───────────────────────────────────────────────────
export const getRevenueReport    = (params = {}) => get(`/operations/reports/revenue?${new URLSearchParams(params)}`);
export const getOccupancyReport  = (params = {}) => get(`/operations/reports/occupancy?${new URLSearchParams(params)}`);
export const getBookingSourceReport = ()         => get('/operations/reports/sources');
export const getRevenueAIInsights   = ()         => get('/operations/reports/ai-insights');

// ── Channel Manager ───────────────────────────────────────────
export const getChannelStatus = () => get('/operations/channels');
export const syncChannels     = () => post('/operations/channels/sync', {});
