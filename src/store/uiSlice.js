import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    toast: {
      visible: false,
      message: "",
      type: "success", // success | error | info
    },
  },
  reducers: {
    showToast(state, action) {
      state.toast = {
        visible: true,
        message: action.payload.message,
        type: action.payload.type || "success",
      };
    },
    hideToast(state) {
      state.toast.visible = false;
    },
  },
});

export const { showToast, hideToast } = uiSlice.actions;
export default uiSlice.reducer;
