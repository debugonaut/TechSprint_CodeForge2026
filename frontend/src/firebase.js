import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration provided by user
const firebaseConfig = {
  apiKey: "AIzaSyBjE5EuM2jwxap9IuLwMCvX75UYrKAqQrY",
  authDomain: "recallr-18fca.firebaseapp.com",
  projectId: "recallr-18fca",
  storageBucket: "recallr-18fca.firebasestorage.app",
  messagingSenderId: "901012726985",
  appId: "1:901012726985:web:b7e1635f4d2288f70b5918"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
