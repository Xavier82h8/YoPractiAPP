'use client';
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

// Your web app's Firebase configuration - DO NOT EDIT
const firebaseConfig = {
  "projectId": "yopracticando-36seb",
  "appId": "1:634933837473:web:0b76c4502219798642bae0",
  "storageBucket": "yopracticando-36seb.firebasestorage.app",
  "apiKey": "AIzaSyAGPUVrINy_j1g-_Um1xZ21GODtfe9NtkY",
  "authDomain": "yopracticando-36seb.firebaseapp.com",
  "messagingSenderId": "634933837473"
};

// Initialize Firebase for SSR safely
let app: FirebaseApp;
let auth: Auth;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}
auth = getAuth(app);

export { app, auth };
