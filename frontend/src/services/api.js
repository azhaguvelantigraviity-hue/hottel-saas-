// ─────────────────────────────────────────────────────────────
//  StayOS – Centralized API Service Layer
//  Base URL: http://localhost:5000/api/v1
// ─────────────────────────────────────────────────────────────

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && (
    window.location.hostname.includes('vercel.app') || 
    window.location.hostname.includes('onrender.com') ||
    window.location.protocol === 'https:'
  )) {
    return 'https://hottel-saas.onrender.com/api/v1';
  }
  return 'http://localhost:5000/api/v1';
};

const BASE_URL = getApiUrl();

const safeGetStorage = (key, fallback = null) => {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};

const safeSetStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage write failures (private mode / disabled storage).
  }
};

const safeRemoveStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage write failures.
  }
};

// ── Token helpers ─────────────────────────────────────────────
export const getToken = () => safeGetStorage('stayos_token', null);
export const setToken = (t) => safeSetStorage('stayos_token', t);
export const removeToken = () => safeRemoveStorage('stayos_token');

export const getUser = () => {
  try { return JSON.parse(safeGetStorage('stayos_user', 'null')); }
  catch { return null; }
};
export const setUser = (u) => safeSetStorage('stayos_user', JSON.stringify(u));
export const removeUser = () => safeRemoveStorage('stayos_user');

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
