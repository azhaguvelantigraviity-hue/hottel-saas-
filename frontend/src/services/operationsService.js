// ─────────────────────────────────────────────────────────────
//  Operations Service  –  /api/v1/operations
// ─────────────────────────────────────────────────────────────
import { get, post, put } from './api.js';

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

// ── Restaurant POS ────────────────────────────────────────────
export const getPOSSummary  = ()          => get('/operations/pos/summary');
export const getPOSOrders   = ()          => get('/operations/pos');
export const createPOSOrder = (body)      => post('/operations/pos', body);
export const updatePOSOrder = (id, body)  => put(`/operations/pos/${id}`, body);

// ── Reports ───────────────────────────────────────────────────
export const getRevenueReport    = (params = {}) => get(`/operations/reports/revenue?${new URLSearchParams(params)}`);
export const getOccupancyReport  = (params = {}) => get(`/operations/reports/occupancy?${new URLSearchParams(params)}`);
export const getBookingSourceReport = ()         => get('/operations/reports/sources');
export const getRevenueAIInsights   = ()         => get('/operations/reports/ai-insights');

// ── Channel Manager ───────────────────────────────────────────
export const getChannelStatus = () => get('/operations/channels');
export const syncChannels     = () => post('/operations/channels/sync', {});
