import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { ACTIONS, INITIAL_QUOTE, quoteReducer } from './quoteReducer';
import { getProduct } from '../utils/catalog';
import { buildQuote } from '../utils/quote';

const STORAGE_KEY = 'at-quote';
const SAVED_KEY = 'at-saved-quotes'; // quotations kept to compare: [{ id, name, savedAt, brandId, items }]
const OLD_STORAGE_KEY = 'at-quote-items'; // earlier format: [{ productId, brandId, quantity }] with a brand per line
const QuoteContext = createContext(null);

/** Old saved quotes had a brand per line — keep the quantities (summed per product) and the first brand. */
const migrate = (oldItems) => {
  const qty = {};
  oldItems.forEach((i) => (qty[i.productId] = (qty[i.productId] ?? 0) + i.quantity));
  return {
    brandId: oldItems.find((i) => i.brandId)?.brandId ?? null,
    items: Object.entries(qty).map(([productId, quantity]) => ({ productId, quantity })),
  };
};

// the catalog comes from the backend, so a saved product may since have been removed
const dropUnknown = (quote) => ({ ...quote, items: quote.items.filter((i) => getProduct(i.productId)) });

const loadQuote = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.items) return dropUnknown(saved);
    const old = JSON.parse(localStorage.getItem(OLD_STORAGE_KEY));
    return Array.isArray(old) ? dropUnknown(migrate(old)) : INITIAL_QUOTE;
  } catch {
    return INITIAL_QUOTE;
  }
};

const loadSaved = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVED_KEY));
    return Array.isArray(saved) ? saved.map(dropUnknown).filter((q) => q.items.length) : [];
  } catch {
    return [];
  }
};

export function QuoteProvider({ children }) {
  const [state, dispatch] = useReducer(quoteReducer, undefined, loadQuote);
  const [saved, setSaved] = useState(loadSaved);

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
    } catch {
      /* storage unavailable — saved quotations last until the page is closed */
    }
  }, [saved]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      localStorage.removeItem(OLD_STORAGE_KEY);
    } catch {
      /* storage unavailable — state still works in memory */
    }
  }, [state]);

  // dispatch is stable, so these never change — safe to pass to memoised rows
  const actions = useMemo(
    () => ({
      addItem: (productId, quantity = 1) => dispatch({ type: ACTIONS.ADD, payload: { productId, quantity } }),
      setQuantity: (productId, quantity) => dispatch({ type: ACTIONS.SET_QTY, payload: { productId, quantity } }),
      setBrand: (brandId) => dispatch({ type: ACTIONS.SET_BRAND, payload: { brandId } }),
      setItemBrand: (productId, brandId) => dispatch({ type: ACTIONS.SET_ITEM_BRAND, payload: { productId, brandId } }),
      removeItem: (productId) => dispatch({ type: ACTIONS.REMOVE, payload: { productId } }),
      clearAll: () => dispatch({ type: ACTIONS.CLEAR }),
      loadQuotation: (quotation) => dispatch({ type: ACTIONS.LOAD, payload: quotation }),
      removeSaved: (id) => setSaved((list) => list.filter((q) => q.id !== id)),
    }),
    [],
  );

  // keep the current quote as a named quotation to compare later (its brand choices and quantities)
  const saveQuotation = useCallback(
    (name) => {
      const quotation = { id: `q${Date.now()}`, name: name.trim() || `Option ${saved.length + 1}`, savedAt: new Date().toISOString(), ...state };
      setSaved((list) => [...list, quotation]);
      return quotation;
    },
    [saved.length, state],
  );

  const value = useMemo(
    () => ({ ...actions, saveQuotation, savedQuotations: saved, state, quote: buildQuote(state), itemCount: state.items.length }),
    [actions, saveQuotation, saved, state],
  );

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

export const useQuote = () => {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error('useQuote must be used inside <QuoteProvider>');
  return ctx;
};
