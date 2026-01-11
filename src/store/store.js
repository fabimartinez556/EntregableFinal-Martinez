import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import { tasksApi } from "./tasksApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [tasksApi.reducerPath]: tasksApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(tasksApi.middleware),
});
