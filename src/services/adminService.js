// ─────────────────────────────────────────────────────────────
//  Admin Service  –  /api/v1/admin
// ─────────────────────────────────────────────────────────────
import { get, post, put, del } from './api.js';

export const getDashboard      = ()          => get('/admin/dashboard');
export const getPlatformStats  = ()          => get('/admin/stats/overview');
export const getPlatformRevenue= ()          => get('/admin/revenue');
export const getAuditLogs      = ()          => get('/admin/audit-logs');
export const getAllUsers        = ()          => get('/admin/users');

export const getAllHotels       = ()          => get('/admin/hotels');
export const getHotel          = (id)        => get(`/admin/hotels/${id}`);
export const createHotel       = (body)      => post('/admin/hotels', body);
export const updateHotel       = (id, body)  => put(`/admin/hotels/${id}`, body);
export const deleteHotel       = (id)        => del(`/admin/hotels/${id}`);
export const updateSubscription= (id, body)  => put(`/admin/hotels/${id}/subscription`, body);
