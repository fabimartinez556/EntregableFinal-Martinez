import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setOrdersLoading(state) {
      state.loading = true;
      state.error = null;
    },
    setOrders(state, action) {
      state.items = Array.isArray(action.payload) ? action.payload : [];
      state.loading = false;
      state.error = null;
    },
    setOrdersError(state, action) {
      state.error = action.payload || "Error desconocido";
      state.loading = false;
    },
    setOrdersFinished(state) {
      state.loading = false;
    },
  },
});

export const {
  setOrders,
  setOrdersLoading,
  setOrdersError,
  setOrdersFinished,
} = ordersSlice.actions;

export default ordersSlice.reducer;
