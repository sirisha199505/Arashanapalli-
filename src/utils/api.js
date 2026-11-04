// API calls. No secrets live in the frontend: the backend validates everything and prices quotes itself.
// The admin pages pass the signed-in admin's session `token`; the backend decides what it may do.
// In dev, Vite proxies /api to the backend. Set VITE_API_URL for production builds.
const BASE_URL = import.meta.env.VITE_API_URL ?? '';

// The backend sends errors as a string or as { field: message | [messages] }
const errorMessage = (data) =>
  typeof data === 'string' ? data : data && typeof data === 'object' ? Object.entries(data).map(([k, v]) => `${k.replaceAll('_', ' ')}: ${[v].flat().join(', ')}`).join('; ') : '';

export async function api(path, { method = 'GET', data, token, timeout = 8000 } = {}) {
  const body = data ? JSON.stringify({ data }) : undefined;
  const res = await fetch(`${BASE_URL}/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body,
    signal: AbortSignal.timeout(timeout),
    // lets a quote save finish even if the page navigates to mailto: (browsers refuse keepalive bodies over 64 KB, e.g. uploads)
    keepalive: method !== 'GET' && (body?.length ?? 0) < 60000,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.status === 'error') {
    const error = new Error(errorMessage(json.data) || `Request failed (${res.status})`);
    error.status = res.status;
    error.data = json.data; // e.g. a bulk save's errors for each product
    throw error;
  }
  return json;
}

export const fetchCatalog = () => api('/catalog').then((res) => res.data);

/** Branded PDF of a quotation, and of a comparison of 2–3 of them (same customer, same products). */
export const quotationPdfUrl = (id) => `${BASE_URL || window.location.origin}/api/quotes/pdf/${encodeURIComponent(id)}`;
/** "Scan to pay" UPI QR code (SVG) for a quotation's exact total. */
export const upiQrUrl = (id) => `${BASE_URL || window.location.origin}/api/quotes/upi-qr/${encodeURIComponent(id)}`;
export const comparisonPdfUrl = (ids) => `${BASE_URL || window.location.origin}/api/quotes/compare.pdf?numbers=${ids.map(encodeURIComponent).join(',')}`;
/** Pros / cons of 2–3 quotations, worked out by the server from the prices actually quoted. */
export const fetchQuotationComparison = (ids) => api(`/quotes/compare?numbers=${ids.map(encodeURIComponent).join(',')}`, { timeout: 20000 }).then((res) => res.data);

// Customer sign-in for "My quotations": a 6-digit code emailed to them, then a customer session token
const CUSTOMER_KEY = 'at-customer';
export const loadCustomer = () => {
  try {
    return JSON.parse(localStorage.getItem(CUSTOMER_KEY));
  } catch {
    return null;
  }
};
export const saveCustomer = (customer) => {
  try {
    if (customer) localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
    else localStorage.removeItem(CUSTOMER_KEY);
  } catch {
    /* storage unavailable — signed in until the page is closed */
  }
};
export const requestSignInCode = (email) => api('/customer/code', { method: 'POST', data: { email } }).then((res) => res.data);
export const verifySignInCode = (email, code) => api('/customer/verify', { method: 'POST', data: { email, code } }).then((res) => res.data);
export const fetchMyQuotations = (token) => api('/customer/quotes', { token }).then((res) => res.data);

/** A quotation by its ID — what the customer sees (no phone search here; that's staff-only). */
export const trackQuotation = (id) => api(`/quotes/track/${encodeURIComponent(id.trim())}`).then((res) => res.data);

/** Sends only what the customer chose — the server looks up prices and totals. */
export const submitQuote = ({ lines }, customer, sentVia) =>
  api('/quotes', {
    method: 'POST',
    data: {
      customer_name: customer.name.trim(),
      customer_phone: customer.phone.trim(),
      customer_city: customer.city.trim(),
      customer_email: customer.email?.trim() || undefined,
      company_name: customer.company?.trim() || undefined,
      gstin: customer.gstin?.trim().toUpperCase() || undefined,
      sent_via: sentVia,
      items: lines.map((l) => ({ product_id: l.product.id, brand_id: l.brand?.id, quantity: l.quantity })),
    },
  });
