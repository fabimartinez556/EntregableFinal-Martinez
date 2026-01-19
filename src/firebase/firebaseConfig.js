// src/firebase/firebaseConfig.js
import { Platform } from "react-native";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDGdeZyGyRnYE_mYRMcrJcypGJBOo5Ooyg",
  authDomain: "react-app-8a129.firebaseapp.com",
  projectId: "react-app-8a129",
  storageBucket: "react-app-8a129.appspot.com",
  messagingSenderId: "943216671512",
  appId: "1:943216671512:web:bc4a33e0dfa0bb175e3c6d",
  databaseURL: "https://react-app-8a129-default-rtdb.firebaseio.com",
};

// evita duplicate-app en HMR
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Auth: web normal, native con persistencia real
export const auth =
  Platform.OS === "web"
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage),
      });

export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);