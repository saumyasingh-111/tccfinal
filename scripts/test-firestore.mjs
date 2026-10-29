
import { loadEnv } from "vite";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const env = loadEnv("development", process.cwd(), "");

const projectId = env.FIREBASE_PROJECT_ID;
const clientEmail = env.FIREBASE_CLIENT_EMAIL;
const privateKey = env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  throw new Error(
    "Firebase credentials are missing from .env.local"
  );
}

const app = initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
  projectId,
});

const db = getFirestore(app);
const testRef = db
  .collection("_connection_tests")
  .doc(`test-${Date.now()}`);

try {
  await testRef.set({
    test: true,
    message: "TCC Firestore connection successful",
    createdAt: new Date().toISOString(),
  });

  const snapshot = await testRef.get();

  if (!snapshot.exists || snapshot.data()?.test !== true) {
    throw new Error("Firestore write/read verification failed");
  }

  console.log("SUCCESS: Firestore connection works!");
  console.log("SUCCESS: Temporary document written and read.");

} catch (error) {
  console.error("Firestore test failed:", error);
  process.exitCode = 1;

} finally {
  try {
    await testRef.delete();
    console.log("Temporary test document cleaned up.");
  } catch {
    console.log(
      "Could not clean up the temporary document. Check Firestore if needed."
    );
  }

  await app.delete();
}
