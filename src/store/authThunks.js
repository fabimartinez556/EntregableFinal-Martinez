import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth } from "../firebase/firebaseConfig";
import { setLoading, setError } from "./authSlice";

export const login = ({ email, password }) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const register = ({ email, password }) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const logoutUser = () => {
  return async () => {
    await signOut(auth);
  };
};
