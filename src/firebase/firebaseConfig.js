
// src/firebase/firebaseConfig.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDGdeZyGyRnYE_mYRMcrJcypGJBOo5Ooyg",
  authDomain: "react-app-8a129.firebaseapp.com",
  projectId: "react-app-8a129",
  storageBucket: "react-app-8a129.appspot.com",
  messagingSenderId: "943216671512",
  appId: "1:943216671512:web:bc4a33e0dfa0bb175e3c6d",
  databaseURL: "https://react-app-8a129-default-rtdb.firebaseio.com",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);
