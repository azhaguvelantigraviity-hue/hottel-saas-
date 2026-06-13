// ─────────────────────────────────────────────────────────────
//  StayOS – Centralized API Service Layer
//  Base URL: http://localhost:5000/api/v1
// ─────────────────────────────────────────────────────────────

export const getApiUrl = () => {
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

export const BASE_URL = getApiUrl();

// ── Upload helper (multipart/form-data) ────────────────────────
export async function uploadFile(path, formData, onProgress) {
  const token = getToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const selectedHotelId = safeGetStorage('selectedHotelId');
  if (selectedHotelId) headers['X-Hotel-Id'] = selectedHotelId;

  const xhr = new XMLHttpRequest();
  return new Promise((resolve, reject) => {
    xhr.upload.addEventListener('progress', (e) => {
      if (onProgress && e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });
    xhr.addEventListener('load', () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          const err = new Error(data.message || `HTTP ${xhr.status}`);
          err.status = xhr.status;
          err.data = data;
          reject(err);
        }
      } catch {
        reject(new Error('Failed to parse response'));
      }
    });
    xhr.addEventListener('error', () => reject(new Error('Network error')));
    xhr.open('POST', `${BASE_URL}${path}`);
    Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    xhr.send(formData);
  });
}

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

// ── Persistent token (restores session on page load) ──
export const getToken = () => safeGetStorage('stayos_token');
export const setToken = (t) => safeSetStorage('stayos_token', t);
export const removeToken = () => safeRemoveStorage('stayos_token');

export const getUser = () => {
  const u = safeGetStorage('stayos_user');
  if (u) {
    try { return JSON.parse(u); } catch { return null; }
  }
  return null;
};
export const setUser = (u) => safeSetStorage('stayos_user', JSON.stringify(u));
export const removeUser = () => safeRemoveStorage('stayos_user');

// ── Core fetch wrapper ────────────────────────────────────────
async function request(method, path, body = null, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const selectedHotelId = safeGetStorage('selectedHotelId');
  if (selectedHotelId) headers['X-Hotel-Id'] = selectedHotelId;

  const config = {
    method,
    headers,
    ...options,
  };
  if (body) config.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, config);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) {
      removeToken();
      removeUser();
      // Let App.jsx handle the redirect via ProtectedRoute
    }
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

export const postForm = async (path, formData) => {
  const token = getToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const selectedHotelId = safeGetStorage('selectedHotelId');
  if (selectedHotelId) headers['X-Hotel-Id'] = selectedHotelId;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    body: formData,
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

export const putForm = async (path, formData) => {
  const token = getToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const selectedHotelId = safeGetStorage('selectedHotelId');
  if (selectedHotelId) headers['X-Hotel-Id'] = selectedHotelId;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    body: formData,
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};
