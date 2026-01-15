import {
  collection,
  query,
  where,
  getDocs,
  doc,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../firebase/firebaseConfig";
import {
  setOrders,
  setOrdersLoading,
  setOrdersError,
  setOrdersFinished,
} from "./ordersSlice";
import { clearCart } from "./cartSlice";
import { fetchProducts } from "./productsThunks";
import { showToast } from "./uiSlice";

/* =======================
   FETCH ORDERS
======================= */
export const fetchOrders = (userId) => {
  return async (dispatch) => {
    try {
      dispatch(setOrdersLoading());

      const q = query(
        collection(db, "orders"),
        where("userId", "==", userId)
      );

      const snapshot = await getDocs(q);

      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
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
export const createOrder = (items, total, user, onComplete) => {
  return async (dispatch) => {
    try {
      dispatch(setOrdersLoading());

      await runTransaction(db, async (transaction) => {
        // 🔒 Validar y descontar stock
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

          transaction.update(productRef, {
            stock: currentStock - item.quantity,
          });
        }

        // 🧾 Crear orden
        const orderRef = doc(collection(db, "orders"));
        transaction.set(orderRef, {
          userId: user.uid,
          email: user.email,
          items,
          total,
          createdAt: serverTimestamp(),
        });
      });

      // 🧼 Vaciar carrito inmediato
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
