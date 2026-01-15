import { configureStore } from "@reduxjs/toolkit";

import cartReducer from "./cartSlice";
import authReducer from "./authSlice";
import ordersReducer from "./ordersSlice";
import productsReducer from "./productsSlice"; // si lo usás

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    orders: ordersReducer,
    products: productsReducer, 
  },
});
