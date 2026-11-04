// Admin API client. The admin's session token comes from logging in; the backend checks it on every request.
// Nothing here is a secret: without a valid admin session the backend refuses every admin call.
import { api } from '../utils/api';
import { forgetSavedCatalog } from '../data/loadCatalog';

const SESSION_KEY = 'at-admin-session';

// localStorage: the sign-in lasts across tabs and browser restarts until "Log out" (or the server ends it, after
// 180 hours or a password reset). sessionStorage signed staff out whenever a tab closed or a phone discarded it.
export const loadSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
};

export const saveSession = (session) => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* storage unavailable — the session still works until the page is reloaded */
  }
};

export const clearSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
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

/**
 * CRUD calls for each admin resource. `onUnauthorized` runs when the session is no longer accepted (401).
 * A 403 only means this account may not do that one thing: it shows as an error, it doesn't sign anyone out.
 */
export function createAdminApi(token, onUnauthorized) {
  const call = (path, options = {}) =>
    api(path, { ...options, token, timeout: options.timeout ?? 20000 }).then(
      (res) => {
        // a change here may add, edit or hide products: the website in this browser then loads the new catalog
        // instead of opening with its saved copy
        if (options.method && options.method !== 'GET') forgetSavedCatalog();
        return res;
      },
      (err) => {
        if (err.status === 401) onUnauthorized();
        throw err;
      },
    );

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
      // the client's product Excel ({ file: base64, hide_missing }): check what would change, then import it
      checkImport: (data) => call('/products/import/check', { method: 'POST', data, timeout: 180000 }).then((res) => res.data),
      runImport: (data) => call('/products/import', { method: 'POST', data, timeout: 300000 }).then((res) => res.data),
    },
    brands: resource('brands'),
    categories: resource('categories'),
    series: resource('series'),
  };
}
