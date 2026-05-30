const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

/**
 * Helper to perform API requests with JWT token from localStorage.
 * @param {string} endpoint - API endpoint (e.g., '/hotels')
 * @param {object} options - fetch options (method, body, headers, etc.)
 * @returns {Promise<any>} Parsed JSON response or throws error.
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('stayos_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  const data = await response.json();
  if (!response.ok) {
    const err = new Error(data.message || 'API Error');
    err.status = response.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const get = (endpoint) => apiRequest(endpoint, { method: 'GET' });
export const post = (endpoint, body) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(body) });
export const put = (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(body) });
export const del = (endpoint) => apiRequest(endpoint, { method: 'DELETE' });
