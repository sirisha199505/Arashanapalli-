import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { QuoteProvider } from './context/QuoteContext';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QuoteProvider>
      <App />
    </QuoteProvider>
  </StrictMode>,
);
