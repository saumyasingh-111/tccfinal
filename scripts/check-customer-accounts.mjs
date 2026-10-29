import { getAdminDb, getAdminAuth } from "../api/_lib/firebaseAdmin.ts";

async function main() {
  const auth = getAdminAuth();
  const db = getAdminDb();

  if (!auth || !db) {
    console.error("Firebase Admin credentials not initialized.");
    process.exit(1);
  }

  console.log("Checking customer accounts across Firebase Auth & Firestore...\n");
  const list = await auth.listUsers(100);
  console.log(`Found ${list.users.length} user(s) in Firebase Authentication:`);

  for (const user of list.users) {
    const docSnap = await db.collection("users").doc(user.uid).get();
    const docData = docSnap.exists ? docSnap.data() : null;

    console.log({
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      displayName: user.displayName,
      createdAt: user.metadata.creationTime,
      firestoreProfileExists: docSnap.exists,
      firestoreRole: docData?.role,
      firestoreName: docData?.name,
      adminNotificationSent: docData?.adminNotificationSent,
    });
  }
}

main().catch(console.error);
