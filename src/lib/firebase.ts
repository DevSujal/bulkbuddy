
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": process.env.NEXT_PUBLIC_PROJECTID,
  "appId": process.env.NEXT_PUBLIC_APPID,
  "storageBucket": process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  "apiKey": process.env.NEXT_PUBLIC_APIKEY,
  "authDomain": process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  "measurementId": process.env.NEXT_PUBLIC_MEASUREMENTID,
  "messagingSenderId": process.env.NEXT_PUBLIC_MESSAGING_SENDERID
};

// Initialize Firebase for SSR
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
