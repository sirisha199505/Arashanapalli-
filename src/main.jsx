import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { loadCatalog } from './data/loadCatalog';
import './index.css';

const root = createRoot(document.getElementById('root'));
const render = (element) => root.render(<StrictMode>{element}</StrictMode>);

if (window.location.pathname.startsWith('/admin')) {
  // the admin area is a separate bundle, loaded only here, and kept out of search engines
  document.title = 'Admin · Arashanapalli Traders';
  document.head.insertAdjacentHTML('beforeend', '<meta name="robots" content="noindex, nofollow">');
  const { default: AdminApp } = await import('./admin/AdminApp');
  render(<AdminApp />);
} else {
  // The catalog must be loaded before anything derives lookups from it, so the app is imported afterwards.
  await loadCatalog();
  const [{ default: App }, { QuoteProvider }] = await Promise.all([import('./App'), import('./context/QuoteContext')]);
  render(
    <QuoteProvider>
      <App />
    </QuoteProvider>,
  );
}
