// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// IMPORTANT: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAOxkz5sexhZ6HTjTvuCRx77OEW1GnviBo",
  authDomain: "yopracticando-ddd79.firebaseapp.com",
  projectId: "yopracticando-ddd79",
  storageBucket: "yopracticando-ddd79.appspot.com",
  messagingSenderId: "934993781324",
  appId: "1:934993781324:web:e8c3b7b3e2b1f0a552cae9"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
