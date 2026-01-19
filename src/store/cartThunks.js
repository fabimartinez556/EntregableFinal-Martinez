// src/store/cartThunks.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setCart, addToCart, removeFromCart, clearCart } from "./cartSlice";

const CART_KEY = "@cart";

const persist = async (items) => {
  await AsyncStorage.setItem(CART_KEY, JSON.stringify(items));
};

export const loadCart = () => async (dispatch) => {
  try {
    const stored = await AsyncStorage.getItem(CART_KEY);
    dispatch(setCart(stored ? JSON.parse(stored) : []));
  } catch (e) {
    console.log("Error cargando carrito", e);
  }
};

export const addToCartAndPersist = (product) => async (dispatch, getState) => {
  try {
     dispatch(addToCart({ ...product, id: product?.id != null ? String(product.id) : product?.id }));
    const items = getState().cart.items;
    await persist(items);
  } catch (e) {
    console.log("Error guardando carrito", e);
  }
};

export const removeFromCartAndPersist = (id) => async (dispatch, getState) => {
  try {
    dispatch(removeFromCart(id));
    const items = getState().cart.items;
    await persist(items);
  } catch (e) {
    console.log("Error guardando carrito", e);
  }
};

export const clearCartAndPersist = () => async (dispatch) => {
  try {
    dispatch(clearCart());
    await persist([]);
  } catch (e) {
    console.log("Error guardando carrito", e);
  }
};
