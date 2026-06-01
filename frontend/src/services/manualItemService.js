import { get, post, put, del } from './api';

export const getManualItems = (category = '') => {
  const query = category && category !== 'All' ? `?category=${category}` : '';
  return get(`/manual-items${query}`);
};

export const createManualItem = (data) => post('/manual-items', data);

export const updateManualItem = (id, data) => put(`/manual-items/${id}`, data);

export const deleteManualItem = (id) => del(`/manual-items/${id}`);
