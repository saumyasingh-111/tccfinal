import { initializeApp } from "firebase/app";
import { getAuth as getClientAuth, createUserWithEmailAndPassword, sendEmailVerification, deleteUser } from "firebase/auth";
import { getAdminAuth } from "../api/_lib/firebaseAdmin.ts";

if (typeof process.loadEnvFile === "function") {
  try { process.loadEnvFile(".env.local"); } catch {}
}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const clientApp = initializeApp(firebaseConfig);
const clientAuth = getClientAuth(clientApp);
const adminAuth = getAdminAuth();

async function testSequence() {
  const testEmail = `test.seq.${Date.now()}@gmail.com`;
  console.log("Creating user:", testEmail);
  const cred = await createUserWithEmailAndPassword(clientAuth, testEmail, "Password123!");

  try {
    console.log("1. Generating link via Admin SDK...");
    const link = await adminAuth.generateEmailVerificationLink(testEmail, {
      url: "https://the-classic-crush-6c6f9.firebaseapp.com/verify-email",
      handleCodeInApp: true,
    });
    console.log("   Admin link generated successfully!");

    console.log("2. Calling sendEmailVerification via Client SDK immediately...");
    await sendEmailVerification(cred.user);
    console.log("   ✓ Client sendEmailVerification succeeded!");
  } catch (err) {
    console.error("   ✗ FAILED in sequence:", err.code, err.message);
  } finally {
    await deleteUser(cred.user);
    console.log("Cleaned up user.");
  }
}

testSequence();
