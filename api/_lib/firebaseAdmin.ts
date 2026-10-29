
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// Attempt to load .env.local natively in local Node.js environments
if (!process.env.FIREBASE_PROJECT_ID) {
  try {
    if (typeof (process as any).loadEnvFile === "function") {
      (process as any).loadEnvFile(".env.local");
    }
  } catch {}
}

function createFirebaseApp() {
  const existingApp = getApps().find((app) => app.name === "[DEFAULT]");
  if (existingApp) {
    return existingApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.warn("Firebase Admin credentials not fully configured in environment.");
    return null;
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

function initFirestore(app: any) {
  if (!app) return null;
  const firestore = getFirestore(app);
  try {
    firestore.settings({ ignoreUndefinedProperties: true });
  } catch {}
  return firestore;
}

const adminApp = getApps().length ? getApp() : createFirebaseApp();

export const db: any = adminApp ? initFirestore(adminApp) : null;
export const getAdminDb = () => db;

export const authAdmin: any = adminApp ? getAuth(adminApp) : null;
export const getAdminAuth = () => authAdmin;

