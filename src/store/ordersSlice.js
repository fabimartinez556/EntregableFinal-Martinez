import { createSlice } from "@reduxjs/toolkit";

const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    setOrdersLoading(state) {
      state.loading = true;
      state.error = null;
    },
    setOrders(state, action) {
      state.items = action.payload;
      state.loading = false;
    },
    setOrdersError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setOrders, setOrdersLoading, setOrdersError } =
  ordersSlice.actions;
export default ordersSlice.reducer;
