import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../firebase/firebaseConfig";
import { setOrders, setOrdersLoading, setOrdersError } from "./ordersSlice";
import { clearCart } from "./cartSlice";

/* =======================
   FETCH ORDERS
======================= */
export const fetchOrders = (userId) => {
  return async (dispatch) => {
    try {
      dispatch(setOrdersLoading());

      const q = query(
        collection(db, "orders"),
        where("userId", "==", userId),

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
      const order = {
        userId: user.uid,
        email: user.email,
        items,
        total,
        date: serverTimestamp(),
      };

      await addDoc(collection(db, "orders"), order);

      for (const item of items) {
        const productRef = doc(db, "productos", item.id);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const currentStock = productSnap.data().stock;

          await updateDoc(productRef, {
            stock: currentStock - item.quantity,
          });
        }
      }

      dispatch(clearCart());
      await AsyncStorage.removeItem("@cart");

      if (onComplete) onComplete();
    } catch (error) {
      console.error("Error creando la orden", error);
    }
  };
};
