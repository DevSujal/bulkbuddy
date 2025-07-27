
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "bulkbuddy-l9vnc",
  "appId": "1:388486740606:web:697b509f416fccea28b62f",
  "storageBucket": "bulkbuddy-l9vnc.firebasestorage.app",
  "apiKey": "AIzaSyAkm3metOeJbX08cWm3_92wC4Lp9L7Pf9Y",
  "authDomain": "bulkbuddy-l9vnc.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "388486740606"
};

// Initialize Firebase for SSR
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
