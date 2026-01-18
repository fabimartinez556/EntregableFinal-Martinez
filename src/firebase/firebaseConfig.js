import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDGdeZyGyRnYE_mYRMcrJcypGJBOo5Ooyg",
  authDomain: "react-app-8a129.firebaseapp.com",
  projectId: "react-app-8a129",
  storageBucket: "react-app-8a129.appspot.com",
  messagingSenderId: "943216671512",
  appId: "1:943216671512:web:bc4a33e0dfa0bb175e3c6d",
};

const app = initializeApp(firebaseConfig);

// 🔐 Auth (compatible con Expo)
export const auth = getAuth(app);

// 🔥 Firestore
export const db = getFirestore(app);

// 🔁 Realtime Database
export const realtimeDb = getDatabase(app);
