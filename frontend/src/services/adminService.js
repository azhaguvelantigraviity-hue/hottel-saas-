// ─────────────────────────────────────────────────────────────
//  Admin Service  –  /api/v1/admin
// ─────────────────────────────────────────────────────────────
import { get, post, put, del } from './api.js';

export const getDashboard      = ()          => get('/admin/dashboard');
export const getPlatformStats  = ()          => get('/admin/stats/overview');
export const getPlatformRevenue= ()          => get('/admin/revenue');
export const getRenewalAlerts  = ()          => get('/admin/alerts/renewals');
export const getAuditLogs      = ()          => get('/admin/audit-logs');
export const getAllUsers       = ()          => get('/admin/users');
export const createUser        = (data)      => post('/admin/users', data);
export const updateUser        = (id, data)  => put(`/admin/users/${id}`, data);
export const deleteUser        = (id)        => del(`/admin/users/${id}`);

export const getRoles          = ()          => get('/admin/roles');
export const createRole        = (data)      => post('/admin/roles', data);
export const updateRole        = (id, data)  => put(`/admin/roles/${id}`, data);
export const deleteRole        = (id)        => del(`/admin/roles/${id}`);

export const getAllHotels       = ()          => get('/admin/hotels');
export const getHotel          = (id)        => get(`/admin/hotels/${id}`);
export const createHotel       = (body)      => post('/admin/hotels', body);
export const updateHotel       = (id, body)  => put(`/admin/hotels/${id}`, body);
export const deleteHotel       = (id)        => del(`/admin/hotels/${id}`);
export const updateSubscription= (id, body)  => put(`/admin/hotels/${id}/subscription`, body);

export const getPlans          = ()          => get('/admin/plans');
export const updatePlan        = (id, data)  => put(`/admin/plans/${id}`, data);

export const getAllBranches    = ()          => get('/admin/branches');
export const createBranch      = (body)      => post('/admin/branches', body);
export const updateBranch      = (id, body)  => put(`/admin/branches/${id}`, body);
export const deleteBranch      = (id)        => del(`/admin/branches/${id}`);
export const getAdminNotifications   = (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  return get(`/admin/notifications${query ? '?' + query : ''}`);
};
export const markAdminNotificationRead = (id)      => put(`/admin/notifications/${id}/read`);
export const resolveAdminNotification  = (id)      => put(`/admin/notifications/${id}/resolve`);
export const deleteAdminNotification   = (id)      => del(`/admin/notifications/${id}`);

export const getRegistrations     = ()       => get('/admin/registrations');
export const approveRegistration  = (id, body) => put(`/admin/registrations/${id}/approve`, body);
export const rejectRegistration   = (id)     => put(`/admin/registrations/${id}/reject`);
