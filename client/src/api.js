const BASE_URL = import.meta.env.VITE_API_URL || '/api';

let authToken = null;
let onUnauthorized = null;

export function setAuthToken(token) {
  authToken = token;
}

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (response.status === 401 && authToken) {
    onUnauthorized?.();
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body?.error) {
        message = body.error;
      } else if (body?.errors) {
        message = Object.values(body.errors).flat().join(' ');
      } else if (body?.title) {
        message = body.title;
      }
    } catch {
      // ignore non-JSON error bodies
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  auth: {
    login: (username, password) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  },
  owners: {
    list: () => request('/owners'),
    create: (data) => request('/owners', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/owners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => request(`/owners/${id}`, { method: 'DELETE' }),
  },
  dogs: {
    list: () => request('/dogs'),
    create: (data) => request('/dogs', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/dogs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => request(`/dogs/${id}`, { method: 'DELETE' }),
  },
  appointments: {
    list: () => request('/appointments'),
    create: (data) => request('/appointments', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) =>
      request(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => request(`/appointments/${id}`, { method: 'DELETE' }),
  },
};
