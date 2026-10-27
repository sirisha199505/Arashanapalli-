// Pure reducer: the only place quote state changes.
// State: { brandId, items: [{ productId, quantity, brandId? }] }.
// The top-level brandId applies to every item; an item's own brandId overrides it (different brands per product).

export const ACTIONS = {
  ADD: 'ADD',
  SET_QTY: 'SET_QTY',
  SET_BRAND: 'SET_BRAND',
  SET_ITEM_BRAND: 'SET_ITEM_BRAND',
  REMOVE: 'REMOVE',
  CLEAR: 'CLEAR',
};

export const INITIAL_QUOTE = { brandId: null, items: [] };

const setItems = (state, items) => ({ ...state, items });

export const quoteReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.ADD: {
      const { productId, quantity } = action.payload;
      const exists = state.items.some((i) => i.productId === productId);
      return setItems(
        state,
        exists
          ? state.items.map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i))
          : [...state.items, { productId, quantity }],
      );
    }
    case ACTIONS.SET_QTY: {
      const { productId, quantity } = action.payload;
      if (quantity < 1) return setItems(state, state.items.filter((i) => i.productId !== productId));
      const exists = state.items.some((i) => i.productId === productId);
      return setItems(
        state,
        exists ? state.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)) : [...state.items, { productId, quantity }],
      );
    }
    // choosing a brand for the whole quote applies it to every item (clears per-item choices)
    case ACTIONS.SET_BRAND:
      return { brandId: action.payload.brandId, items: state.items.map(({ productId, quantity }) => ({ productId, quantity })) };
    case ACTIONS.SET_ITEM_BRAND: {
      const { productId, brandId } = action.payload;
      // same as the quote brand → no override needed
      const own = brandId === state.brandId ? undefined : brandId;
      return setItems(
        state,
        state.items.map((i) => (i.productId === productId ? { productId: i.productId, quantity: i.quantity, ...(own && { brandId: own }) } : i)),
      );
    }
    case ACTIONS.REMOVE:
      return setItems(state, state.items.filter((i) => i.productId !== action.payload.productId));
    case ACTIONS.CLEAR:
      return INITIAL_QUOTE;
    default:
      return state;
  }
};
