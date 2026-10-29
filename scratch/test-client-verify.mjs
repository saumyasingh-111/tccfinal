import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, sendEmailVerification, createUserWithEmailAndPassword, deleteUser } from "firebase/auth";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function testClientVerification() {
  const testEmail = `tcc.verification.test.${Date.now()}@gmail.com`;
  console.log("Testing client-side sendEmailVerification with:", testEmail);
  try {
    const cred = await createUserWithEmailAndPassword(auth, testEmail, "Password123!");
    console.log("User created:", cred.user.uid);

    console.log("Calling sendEmailVerification(cred.user)...");
    await sendEmailVerification(cred.user);
    console.log("✓ SUCCESS: Firebase native sendEmailVerification dispatched without error!");

    await deleteUser(cred.user);
    console.log("Test user cleaned up.");
  } catch (err) {
    console.error("✗ FAILED sendEmailVerification:", err.code, err.message);
  }
}

testClientVerification();
