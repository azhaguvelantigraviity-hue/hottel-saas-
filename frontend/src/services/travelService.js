import { get, post, put, del } from './api';

// Agencies
export const getAgencies = () => get('/travels/agencies');
export const createAgency = (data) => post('/travels/agencies', data);
export const updateAgency = (id, data) => put(`/travels/agencies/${id}`, data);
export const deleteAgency = (id) => del(`/travels/agencies/${id}`);

// Vehicles
export const addVehicle = (agencyId, data) => post(`/travels/agencies/${agencyId}/vehicles`, data);
export const updateVehicle = (agencyId, vehicleId, data) => put(`/travels/agencies/${agencyId}/vehicles/${vehicleId}`, data);
export const deleteVehicle = (agencyId, vehicleId) => del(`/travels/agencies/${agencyId}/vehicles/${vehicleId}`);

// Drivers
export const addDriver = (agencyId, data) => post(`/travels/agencies/${agencyId}/drivers`, data);
export const updateDriver = (agencyId, driverId, data) => put(`/travels/agencies/${agencyId}/drivers/${driverId}`, data);
export const deleteDriver = (agencyId, driverId) => del(`/travels/agencies/${agencyId}/drivers/${driverId}`);

// Bookings
export const getBookings = () => get('/travels/bookings');
export const createBooking = (data) => post('/travels/bookings', data);
export const updateBookingStatus = (id, status) => put(`/travels/bookings/${id}/status`, { status });
export const updateBookingPayment = (id, paymentStatus) => put(`/travels/bookings/${id}/payment`, { paymentStatus });
