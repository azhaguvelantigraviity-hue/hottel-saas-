import { get, post, put, del } from './api';

export const getComplaints = (params = {}) => get(`/complaints?${new URLSearchParams(params)}`);
export const getComplaint = (id) => get(`/complaints/${id}`);
export const createComplaint = (body) => post('/complaints', body);
export const updateComplaint = (id, body) => put(`/complaints/${id}`, body);
export const deleteComplaint = (id) => del(`/complaints/${id}`);
