// ─────────────────────────────────────────────────────────────
//  Auth Service  –  /api/v1/auth
// ─────────────────────────────────────────────────────────────
import { post, get, put, setToken, removeToken, setUser, removeUser } from './api.js';

/**
 * Login – returns { token, user }
 * role: 'platform_admin' | 'hotel_admin' | 'hotel_staff'
 */
export async function login(email, password) {
  const data = await post('/auth/login', { email, password });
  if (data.token) {
    setToken(data.token);
    setUser(data.user || data.data);
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
