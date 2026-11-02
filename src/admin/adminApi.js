// Admin API client. The admin's session token comes from logging in; the backend checks it on every request.
// Nothing here is a secret: without a valid admin session the backend refuses every admin call.
import { api } from '../utils/api';

const SESSION_KEY = 'at-admin-session';

// sessionStorage: the session ends when the browser tab is closed
export const loadSession = () => {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
};

export const saveSession = (session) => {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* storage unavailable — the session still works until the page is reloaded */
  }
};

export const clearSession = () => {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* nothing to clear */
  }
};

/** { token, info } for a valid email + password. */
export const login = (email, password) => api('/login', { method: 'POST', data: { email: email.trim(), password } }).then((res) => res.data);

const query = (params) => {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null));
  return q.size ? `?${q}` : '';
};

/** CRUD calls for each admin resource. `onUnauthorized` runs when the session is no longer accepted. */
export function createAdminApi(token, onUnauthorized) {
  const call = (path, options = {}) =>
    api(path, { ...options, token, timeout: 20000 }).catch((err) => {
      if (err.status === 401 || err.status === 403) onUnauthorized();
      throw err;
    });

  const resource = (name) => ({
    list: (params = {}) => call(`/${name}${query(params)}`),
    create: (data) => call(`/${name}`, { method: 'POST', data }).then((res) => res.data),
    update: (id, data) => call(`/${name}/${encodeURIComponent(id)}`, { method: 'PUT', data }).then((res) => res.data),
    remove: (id) => call(`/${name}/${encodeURIComponent(id)}`, { method: 'DELETE' }).then((res) => res.data),
  });

  return {
    dashboard: (period) => call(`/dashboard${query({ period })}`).then((res) => res.data),
    customers: { list: (params = {}) => call(`/customers${query(params)}`) },
    quotes: {
      ...resource('quotes'),
      get: (id) => call(`/quotes/${id}`).then((res) => res.data),
      // walk-in / phone quotation made by staff
      createStaff: (data) => call('/quotes/staff', { method: 'POST', data }).then((res) => res.data),
      // brand / quantity / price changes → a new version (AT-…-001)
      revise: (id, data) => call(`/quotes/${id}/revise`, { method: 'POST', data }).then((res) => res.data),
      // follow-up actions: call / whatsapp / visit / email / note, with the next follow-up date
      logActivity: (id, data) => call(`/quotes/${id}/activities`, { method: 'POST', data }).then((res) => res.data),
      // the customer accepted: quotation → order
      convert: (id) => call(`/quotes/${id}/order`, { method: 'POST' }).then((res) => res.data),
    },
    staff: () => call('/staff').then((res) => res.data),
    audit: (params = {}) => call(`/audit${query(params)}`),
    users: resource('users'),
    templates: resource('templates'),
    orders: { ...resource('orders'), get: (id) => call(`/orders/${id}`).then((res) => res.data) },
    products: {
      ...resource('products'),
      // bulk updates, a page at a time: brand_id → that brand's price / stock / photo / description
      bulk: (params = {}) => call(`/products/bulk${query(params)}`),
      saveBulk: (data) => call('/products/bulk', { method: 'PUT', data }).then((res) => res.data),
    },
    brands: resource('brands'),
    categories: resource('categories'),
    series: resource('series'),
  };
}
