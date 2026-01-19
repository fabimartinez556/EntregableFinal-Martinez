// src/store/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = { items: [] };

const normalizeItem = (it) => {
  const id = it?.id != null ? String(it.id) : null;
  if (!id) return null;

  return {
    ...it,
    id,
    quantity:
      typeof it.quantity === "number" && it.quantity > 0 ? it.quantity : 1,
  };
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart(state, action) {
      const items = Array.isArray(action.payload) ? action.payload : [];
      state.items = items
        .map(normalizeItem)
        .filter(Boolean);
    },
    addToCart(state, action) {
      const item = normalizeItem(action.payload);
      if (!item) return;

      const existing = state.items.find((p) => p.id === item.id);
      if (existing) existing.quantity += 1;
      else state.items.push(item);
    },
    removeFromCart(state, action) {
      const id = action.payload != null ? String(action.payload) : "";
      state.items = state.items.filter((item) => item.id !== id);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { setCart, addToCart, removeFromCart, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
