import AsyncStorage from "@react-native-async-storage/async-storage";
import { setCart } from "./cartSlice";

const CART_KEY = "@cart";

export const saveCart = (cartItems) => {
  return async () => {
    try {
      await AsyncStorage.setItem(
        CART_KEY,
        JSON.stringify(cartItems)
      );
    } catch (error) {
      console.log("Error guardando carrito", error);
    }
  };
};

export const loadCart = () => {
  return async (dispatch) => {
    try {
      const storedCart = await AsyncStorage.getItem(CART_KEY);

      if (storedCart) {
        dispatch(setCart(JSON.parse(storedCart)));
      }
    } catch (error) {
      console.log("Error cargando carrito", error);
    }
  };
};
