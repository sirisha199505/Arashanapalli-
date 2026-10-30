// Public API calls only — no tokens, secrets or auth live in the frontend.
// The backend validates everything and prices quotes itself; nothing sent from here is trusted.
// In dev, Vite proxies /api to the backend. Set VITE_API_URL for production builds.
const BASE_URL = import.meta.env.VITE_API_URL ?? '';

export async function api(path, { method = 'GET', data, timeout = 8000 } = {}) {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: data ? JSON.stringify({ data }) : undefined,
    signal: AbortSignal.timeout(timeout),
    keepalive: method !== 'GET', // lets a quote save finish even if the page navigates to mailto:
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.status === 'error') throw new Error(`Request failed (${res.status})`);
  return json.data;
}

export const fetchCatalog = () => api('/catalog');

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
