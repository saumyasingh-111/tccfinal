import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Public Firebase Web App Configuration for The Classic Crush (TCC)
 * Project: the-classic-crush-6c6f9
 *
 * NOTE: Private service-account credentials and private keys are strictly kept
 * on the server (api/_lib/firebaseAdmin.ts) and NEVER imported or exposed here.
 */
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyBhjww1HwaUTqKhWpIET1xMZ3SXFTY-n50",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "the-classic-crush-6c6f9.firebaseapp.com",
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID ||
    "the-classic-crush-6c6f9",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "the-classic-crush-6c6f9.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    "479678818120",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:479678818120:web:92c11e772650caa1b2b57d",
};

// Initialize Firebase once
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Export authenticated client services
export const auth = getAuth(app);
export const db = getFirestore(app);
