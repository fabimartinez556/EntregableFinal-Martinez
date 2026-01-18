import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth } from "../firebase/firebaseConfig";
import { setLoading, setError, setUser, logout } from "./authSlice";

/* =======================
   LOGIN
======================= */
export const login = ({ email, password }) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      // ✅ GUARDAR USUARIO EN REDUX
      dispatch(setUser(userCredential.user));
    } catch (error) {
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

/* =======================
   REGISTER
======================= */
export const register = ({ email, password }) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      // ✅ GUARDAR USUARIO EN REDUX
      dispatch(setUser(userCredential.user));
    } catch (error) {
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

/* =======================
   LOGOUT
======================= */
export const logoutUser = () => {
  return async (dispatch) => {
    await signOut(auth);
    dispatch(logout());
  };
};
