// API calls. No secrets live in the frontend: the backend validates everything and prices quotes itself.
// The admin pages pass the signed-in admin's session `token`; the backend decides what it may do.
// In dev, Vite proxies /api to the backend. Set VITE_API_URL for production builds.
const BASE_URL = import.meta.env.VITE_API_URL ?? '';

// The backend sends errors as a string or as { field: message | [messages] }
const errorMessage = (data) =>
  typeof data === 'string' ? data : data && typeof data === 'object' ? Object.entries(data).map(([k, v]) => `${k.replaceAll('_', ' ')}: ${[v].flat().join(', ')}`).join('; ') : '';

export async function api(path, { method = 'GET', data, token, timeout = 8000 } = {}) {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: data ? JSON.stringify({ data }) : undefined,
    signal: AbortSignal.timeout(timeout),
    keepalive: method !== 'GET', // lets a quote save finish even if the page navigates to mailto:
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.status === 'error') {
    const error = new Error(errorMessage(json.data) || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }
  return json;
}

export const fetchCatalog = () => api('/catalog').then((res) => res.data);

/** Sends only what the customer chose — the server looks up prices and totals. */
export const submitQuote = ({ lines }, customer, sentVia) =>
  api('/quotes', {
    method: 'POST',
    data: {
      customer_name: customer.name.trim(),
      customer_phone: customer.phone.trim(),
      customer_city: customer.city.trim(),
      sent_via: sentVia,
      items: lines.map((l) => ({ product_id: l.product.id, brand_id: l.brand?.id, quantity: l.quantity })),
    },
  });
