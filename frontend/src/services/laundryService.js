import { get, post, put, patch, del } from './api';

export const getLaundryOrders = (status = '') => {
  const query = status ? `?status=${status}` : '';
  return get(`/laundry${query}`);
};

export const createLaundryOrder = (data) => post('/laundry', data);

export const updateLaundryOrder = (id, data) => put(`/laundry/${id}`, data);

export const advanceLaundryOrder = (id) => patch(`/laundry/${id}/advance`);

export const deleteLaundryOrder = (id) => del(`/laundry/${id}`);
