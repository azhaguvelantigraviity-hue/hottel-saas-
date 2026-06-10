// ─────────────────────────────────────────────────────────────
//  Auth Service  –  /api/v1/auth
// ─────────────────────────────────────────────────────────────
import { post, get, put } from './api.js';

export function getToken() { return localStorage.getItem('stayos_token'); }
export function setToken(token) { localStorage.setItem('stayos_token', token); }
export function removeToken() { localStorage.removeItem('stayos_token'); }

export function getUser() { 
  try { return JSON.parse(localStorage.getItem('stayos_user')); } 
  catch { return null; }
}
export function setUser(user) { localStorage.setItem('stayos_user', JSON.stringify(user)); }
export function removeUser() { localStorage.removeItem('stayos_user'); }

/**
 * Login – returns { token, user }
 * role: 'platform_admin' | 'hotel_admin' | 'hotel_staff'
 */
export async function login(email, password) {
  const res = await post('/auth/login', { email, password });
  const data = res.data || res;
  if (data && data.token) {
    setToken(data.token);
    setUser(data.user);
  }
  return data;
}

/** Logout – clears local storage */
export async function logout() {
  try { await post('/auth/logout', {}); } catch (_) { /* ignore */ }
  removeToken();
  removeUser();
}

/** Get current authenticated user */
export async function getMe() {
  const data = await get('/auth/me');
  return data.data || data.user;
}

/** Update password */
export async function updatePassword(currentPassword, newPassword) {
  return put('/auth/updatepassword', { currentPassword, newPassword });
}

/** Forgot password */
export async function forgotPassword(email) {
  return post('/auth/forgotpassword', { email });
}

/** Register a new hotel */
export async function registerHotel(data) {
  return post('/auth/register-hotel', data);
}
