// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "yopracticando-36seb",
  "appId": "1:634933837473:web:0b76c4502219798642bae0",
  "storageBucket": "yopracticando-36seb.firebasestorage.app",
  "apiKey": "AIzaSyAGPUVrINy_j1g-_Um1xZ21GODtfe9NtkY",
  "authDomain": "yopracticando-36seb.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "634933837473"
};

// Initialize Firebase for SSR
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
