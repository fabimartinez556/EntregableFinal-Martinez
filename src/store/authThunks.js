// src/store/authThunks.js
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth } from "../firebase/firebaseConfig";
import { setLoading, setError, setUser, logout } from "./authSlice";

export const login = ({ email, password }) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      dispatch(
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
        })
      );
    } catch (error) {
      dispatch(setError(error?.message || "Error al iniciar sesión"));
      dispatch(setLoading(false));
    }
  };
};

export const register = ({ email, password }) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      dispatch(
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
        })
      );
    } catch (error) {
      dispatch(setError(error?.message || "Error al registrarse"));
      dispatch(setLoading(false));
    }
  };
};

export const logoutUser = () => {
  return async (dispatch) => {
    try {
      await signOut(auth);
    } finally {
      dispatch(logout());
    }
  };
};
