// src/store/productsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProducts(state, action) {
      state.items = Array.isArray(action.payload) ? action.payload : [];
      state.error = null;
    },
    setLoading(state, action) {
      state.loading = !!action.payload;
    },
    setError(state, action) {
      state.error = action.payload || null;
    },
    clearProductsState(state) {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setProducts, setLoading, setError, clearProductsState } = productsSlice.actions;
export default productsSlice.reducer;
