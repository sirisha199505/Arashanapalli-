import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { ACTIONS, quoteReducer } from './quoteReducer';
import { groupQuotesByBrand } from '../utils/quote';

const STORAGE_KEY = 'at-quote-items';
const QuoteContext = createContext(null);

const loadItems = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
};

export function QuoteProvider({ children }) {
  const [items, dispatch] = useReducer(quoteReducer, [], loadItems);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable — state still works in memory */
    }
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      quotes: groupQuotesByBrand(items),
      itemCount: items.length,
      addItem: (productId, brandId, quantity) => dispatch({ type: ACTIONS.ADD, payload: { productId, brandId, quantity } }),
      setQuantity: (key, quantity) => dispatch({ type: ACTIONS.SET_QTY, payload: { key, quantity } }),
      removeItem: (key) => dispatch({ type: ACTIONS.REMOVE, payload: { key } }),
      clearBrand: (brandId) => dispatch({ type: ACTIONS.CLEAR_BRAND, payload: { brandId } }),
    }),
    [items],
  );

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

export const useQuote = () => {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error('useQuote must be used inside <QuoteProvider>');
  return ctx;
};
