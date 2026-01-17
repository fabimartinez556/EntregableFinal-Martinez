import {
  doc,
  runTransaction,
} from "firebase/firestore";
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

      // 🔒 TRANSACTION: validar y descontar stock
      await runTransaction(db, async (transaction) => {
        const productsData = [];

        // 1️⃣ TODAS LAS LECTURAS
        for (const item of items) {
          const productRef = doc(db, "productos", item.id);
          const productSnap = await transaction.get(productRef);

          if (!productSnap.exists()) {
            throw new Error("Producto inexistente");
          }

          const currentStock = productSnap.data().stock;

          if (currentStock < item.quantity) {
            throw new Error(`Stock insuficiente de ${item.title}`);
          }

          productsData.push({
            ref: productRef,
            newStock: currentStock - item.quantity,
          });
        }

        // 2️⃣ TODAS LAS ESCRITURAS
        for (const product of productsData) {
          transaction.update(product.ref, {
            stock: product.newStock,
          });
        }
      });

      // 🧾 CREAR ORDEN EN REALTIME DATABASE
      const orderRef = push(ref(realtimeDb, `orders/${user.uid}`));

      await set(orderRef, {
        items,
        total,
        email: user.email,
        location,
        status: "pendiente",
        createdAt: Date.now(),
      });

      // 🧼 Vaciar carrito
      dispatch(clearCart());
      await AsyncStorage.removeItem("@cart");

      // 🔄 Refrescar datos
      dispatch(fetchProducts());
      dispatch(fetchOrders(user.uid));

      dispatch(
        showToast({
          message: "Compra realizada con éxito 🎉",
          type: "success",
        })
      );

      dispatch(setOrdersFinished());

      if (onComplete) onComplete();
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
