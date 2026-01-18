import { doc, runTransaction } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db, realtimeDb } from "../firebase/firebaseConfig";
import {
  setOrders,
  setOrdersLoading,
  setOrdersError,
  setOrdersFinished,
} from "./ordersSlice";
import { clearCart } from "./cartSlice";
import { fetchProducts } from "./productsThunks";
import { showToast } from "./uiSlice";
import { ref, push, set, get } from "firebase/database";
import { GOOGLE_MAPS_API_KEY } from "../config/googleMaps";

/* =======================
   FETCH ORDERS (REALTIME DB)
======================= */
export const fetchOrders = (userId) => {
  return async (dispatch) => {
    try {
      dispatch(setOrdersLoading());

      const snapshot = await get(ref(realtimeDb, `orders/${userId}`));

      if (!snapshot.exists()) {
        dispatch(setOrders([]));
        return;
      }

      const data = snapshot.val();

      const orders = Object.entries(data).map(([id, order]) => ({
        id,
        ...order,
      }));

      dispatch(setOrders(orders));
    } catch (error) {
      dispatch(setOrdersError(error.message));
    }
  };
};

/* =======================
   CREATE ORDER
======================= */
export const createOrder = (items, total, user, location, onComplete) => {
  return async (dispatch) => {
    try {
      dispatch(setOrdersLoading());

      /* 🔒 VALIDAR Y DESCONTAR STOCK */
      await runTransaction(db, async (transaction) => {
        for (const item of items) {
          const productRef = doc(db, "productos", item.id);
          const snap = await transaction.get(productRef);

          if (!snap.exists()) {
            throw new Error("Producto inexistente");
          }

          const stock = snap.data().stock;
          if (stock < item.quantity) {
            throw new Error(`Stock insuficiente de ${item.title}`);
          }

          transaction.update(productRef, {
            stock: stock - item.quantity,
          });
        }
      });

      /* 🗺️ MAPA ESTÁTICO GOOGLE */
      const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${location.latitude},${location.longitude}&zoom=15&size=600x300&markers=color:red%7C${location.latitude},${location.longitude}&key=${GOOGLE_MAPS_API_KEY}`;

      /* 🧾 CREAR ORDEN */
      const orderRef = push(ref(realtimeDb, `orders/${user.uid}`));

      await set(orderRef, {
        items,
        total,
        email: user.email,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          mapUrl,
        },
        status: "pendiente",
        createdAt: Date.now(),
      });

      /* 🧼 LIMPIEZA */
      dispatch(clearCart());
      await AsyncStorage.removeItem("@cart");

      /* 🔄 REFRESH */
      dispatch(fetchProducts());
      dispatch(fetchOrders(user.uid));

      dispatch(
        showToast({
          message: "Compra realizada con éxito 🎉",
          type: "success",
        })
      );

      dispatch(setOrdersFinished());
      onComplete?.();
    } catch (error) {
      dispatch(setOrdersError(error.message));
      dispatch(
        showToast({
          message: error.message || "Error al confirmar compra",
          type: "error",
        })
      );
    }
  };
};
