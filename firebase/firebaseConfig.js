import { getApp, getApps, initializeApp } from 'firebase/app';

// Your Firebase project configuration.
// Set these in your .env file (prefixed with EXPO_PUBLIC_ to be exposed to the client).
const firebaseConfig = {
    apiKey: "AIzaSyAcEtxoVEURXdR6FpAc4ec8-tpuVr3qFVo",
    authDomain: "reserva-d6416.firebaseapp.com",
    projectId: "reserva-d6416",
    storageBucket: "reserva-d6416.firebasestorage.app",
    messagingSenderId: "1046245640040",
    appId: "1:1046245640040:web:afcc9473da677c5b0978dd",
    measurementId: "G-M8S9D8183C"
};

// Prevent re-initializing the app on hot reloads (important for Expo).
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export default app;