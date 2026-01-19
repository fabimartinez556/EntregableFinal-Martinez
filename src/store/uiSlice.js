// src/store/uiSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  toast: {
    visible: false,
    message: "",
    type: "success", // "success" | "error" | "info"
  },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    showToast(state, action) {
      const payload = action.payload || {};
      state.toast = {
        visible: true,
        message: String(payload.message || ""),
        type: payload.type || "success",
      };
    },
    hideToast(state) {
      state.toast = { ...state.toast, visible: false };
    },
    resetToast(state) {
      state.toast = { ...initialState.toast };
    },
  },
});

export const { showToast, hideToast, resetToast } = uiSlice.actions;
export default uiSlice.reducer;
