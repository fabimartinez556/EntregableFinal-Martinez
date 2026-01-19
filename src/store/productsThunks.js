// src/store/productsThunks.js
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { setProducts, setLoading, setError } from "./productsSlice";
import {
  readProductsCache,
  saveProductsCache,
} from "../data/database";

export const fetchProducts = () => {
  return async (dispatch) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      // 1) Cache local (rápido)
      try {
        const cached = await readProductsCache(200);
        if (Array.isArray(cached) && cached.length > 0) {
          dispatch(setProducts(cached));
        }
      } catch (e) {
        console.log("SQLite cache products error:", e);
      }

      // 2) Remoto (Firestore)
      const snapshot = await getDocs(collection(db, "productos"));
      const products = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      dispatch(setProducts(products));

      // 3) Guardar cache
      try {
        await saveProductsCache(products);
      } catch (e) {
        console.log("SQLite save products error:", e);
      }
    } catch (error) {
      dispatch(setError(error?.message || "Error al cargar productos"));
    } finally {
      dispatch(setLoading(false));
    }
  };
};
