// src/store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null, 
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = !!action.payload;
    },
    setError(state, action) {
      state.error = action.payload || null;
    },
    setUser(state, action) {
      const u = action.payload;

        const uid = u?.uid || null;
      const email = u?.email || null;

      state.user = uid ? { uid, email } : null;
      state.error = null;
      state.loading = false;
    },
    logout(state) {
      state.user = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const { setLoading, setError, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
