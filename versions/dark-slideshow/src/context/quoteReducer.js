// Pure reducer: the only place quote state changes.
import { itemKey } from '../utils/quote';

export const ACTIONS = {
  ADD: 'ADD',
  SET_QTY: 'SET_QTY',
  REMOVE: 'REMOVE',
  CLEAR_BRAND: 'CLEAR_BRAND',
};

const keyOf = (item) => itemKey(item.productId, item.brandId);

export const quoteReducer = (items, action) => {
  switch (action.type) {
    case ACTIONS.ADD: {
      const { productId, brandId, quantity } = action.payload;
      const key = itemKey(productId, brandId);
      const exists = items.some((i) => keyOf(i) === key);
      return exists
        ? items.map((i) => (keyOf(i) === key ? { ...i, quantity: i.quantity + quantity } : i))
        : [...items, { productId, brandId, quantity }];
    }
    case ACTIONS.SET_QTY: {
      const { key, quantity } = action.payload;
      return quantity < 1
        ? items.filter((i) => keyOf(i) !== key)
        : items.map((i) => (keyOf(i) === key ? { ...i, quantity } : i));
    }
    case ACTIONS.REMOVE:
      return items.filter((i) => keyOf(i) !== action.payload.key);
    case ACTIONS.CLEAR_BRAND:
      return items.filter((i) => i.brandId !== action.payload.brandId);
    default:
      return items;
  }
};
