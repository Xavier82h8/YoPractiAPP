// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration - DO NOT EDIT
const firebaseConfig = {
  "apiKey": "AIzaSyAGPUVrINy_j1g-_Um1xZ21GODtfe9NtkY",
  "authDomain": "yopracticando-36seb.firebaseapp.com",
  "projectId": "yopracticando-36seb",
  "storageBucket": "yopracticando-36seb.appspot.com",
  "messagingSenderId": "634933837473",
  "appId": "1:634933837473:web:0b76c4502219798642bae0"
};

// Initialize Firebase for SSR safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
