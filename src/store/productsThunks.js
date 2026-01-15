import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { setProducts, setLoading, setError } from "./productsSlice";

export const fetchProducts = () => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));

      const snapshot = await getDocs(collection(db, "productos"));

      const products = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      dispatch(setProducts(products));
    } catch (error) {
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};
