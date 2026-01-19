// src/store/cartThunks.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setCart, addToCart, removeFromCart, clearCart } from "./cartSlice";

const CART_KEY = (uid) => `@cart:${uid || "guest"}`;

const persist = async (key, items) => {
  await AsyncStorage.setItem(key, JSON.stringify(items));
};

export const loadCart = (uid) => async (dispatch) => {
  try {
    const key = CART_KEY(uid);
    const stored = await AsyncStorage.getItem(key);
    if (stored) dispatch(setCart(JSON.parse(stored)));
    else dispatch(setCart([]));
  } catch (e) {
    console.log("Error cargando carrito", e);
    dispatch(setCart([]));
  }
};

export const addToCartAndPersist = (product) => async (dispatch, getState) => {
  try {
    const uid = getState().auth.user?.uid || null;
    const key = CART_KEY(uid);

    dispatch(addToCart(product));
    const items = getState().cart.items;

    await persist(key, items);
  } catch (e) {
    console.log("Error guardando carrito", e);
  }
};

export const removeFromCartAndPersist = (id) => async (dispatch, getState) => {
  try {
    const uid = getState().auth.user?.uid || null;
    const key = CART_KEY(uid);

    dispatch(removeFromCart(id));
    const items = getState().cart.items;

    await persist(key, items);
  } catch (e) {
    console.log("Error guardando carrito", e);
  }
};

export const clearCartAndPersist = () => async (dispatch, getState) => {
  try {
    const uid = getState().auth.user?.uid || null;
    const key = CART_KEY(uid);

    dispatch(clearCart());
    await persist(key, []);
  } catch (e) {
    console.log("Error guardando carrito", e);
  }
};

// opcional: al desloguear, limpiar carrito en memoria (no borra el storage)
export const clearCartOnly = () => (dispatch) => {
  dispatch(clearCart());
};
