// ─────────────────────────────────────────────────────────────
//  StayOS – Centralized API Service Layer
//  Base URL: http://localhost:5000/api/v1
// ─────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// ── Token helpers ─────────────────────────────────────────────
export const getToken = () => localStorage.getItem('stayos_token');
export const setToken = (t) => localStorage.setItem('stayos_token', t);
export const removeToken = () => localStorage.removeItem('stayos_token');

export const getUser = () => {
  try { return JSON.parse(localStorage.getItem('stayos_user') || 'null'); }
  catch { return null; }
};
export const setUser = (u) => localStorage.setItem('stayos_user', JSON.stringify(u));
export const removeUser = () => localStorage.removeItem('stayos_user');

// ── Core fetch wrapper ────────────────────────────────────────
async function request(method, path, body = null, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = {
    method,
    headers,
    ...options,
  };
  if (body) config.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, config);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const get    = (path, opts)       => request('GET',    path, null, opts);
export const post   = (path, body, opts) => request('POST',   path, body, opts);
export const put    = (path, body, opts) => request('PUT',    path, body, opts);
export const patch  = (path, body, opts) => request('PATCH',  path, body, opts);
export const del    = (path, opts)       => request('DELETE', path, null, opts);
