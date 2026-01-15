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
      state.items = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { setProducts, setLoading, setError } =
  productsSlice.actions;

export default productsSlice.reducer;
