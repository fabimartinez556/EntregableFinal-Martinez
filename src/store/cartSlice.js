import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart(state, action) {
      state.items = action.payload;
    },
    addToCart(state, action) {
      const item = action.payload;
      const existing = state.items.find(p => p.id === item.id);

      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push(item);
      }
    },
    removeFromCart(state, action) {
      state.items = state.items.filter(
        item => item.id !== action.payload
      );
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const {
  setCart,
  addToCart,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
