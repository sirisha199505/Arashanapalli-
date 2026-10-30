import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { loadCatalog } from './data/loadCatalog';
import './index.css';

// The catalog must be loaded before anything derives lookups from it, so the app is imported afterwards.
await loadCatalog();
const [{ default: App }, { QuoteProvider }] = await Promise.all([import('./App'), import('./context/QuoteContext')]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QuoteProvider>
      <App />
    </QuoteProvider>
  </StrictMode>,
);
