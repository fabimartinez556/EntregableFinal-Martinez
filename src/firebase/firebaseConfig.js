import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDGdeZyGyRnYE_mYRMcrJcypGJBOo5Ooyg",
  authDomain: "react-app-8a129.firebaseapp.com",
  projectId: "react-app-8a129",
  storageBucket: "react-app-8a129.firebasestorage.app",
  messagingSenderId: "943216671512",
  appId: "1:943216671512:web:bc4a33e0dfa0bb175e3c6d",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
