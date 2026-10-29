import { getAdminAuth } from "../api/_lib/firebaseAdmin.ts";

async function diagnose() {
  const adminAuth = getAdminAuth();
  const apiKey = "AIzaSyBhjww1HwaUTqKhWpIET1xMZ3SXFTY-n50";

  console.log("=== FIREBASE AUTH DIAGNOSIS ===");

  // 1. Check user daringsaumya@gmail.com
  const user = await adminAuth.getUserByEmail("daringsaumya@gmail.com");
  console.log("User record found in Firebase Auth:");
  console.log({
    uid: user.uid,
    email: user.email,
    emailVerified: user.emailVerified,
    disabled: user.disabled,
    tokensValidAfterTime: user.tokensValidAfterTime,
    providerData: user.providerData.map(p => ({ providerId: p.providerId, email: p.email })),
  });

  // 2. Generate custom token
  const customToken = await adminAuth.createCustomToken(user.uid);
  console.log("\n1. Created custom token for user:", user.uid);

  // 3. Exchange custom token for ID token via REST
  const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`;
  const resAuth = await fetch(authUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: customToken, returnSecureToken: true }),
  });
  const dataAuth = await resAuth.json();
  if (!resAuth.ok) {
    console.error("Failed to exchange custom token:", dataAuth);
    return;
  }
  console.log("2. Successfully obtained ID Token for user.");

  // 4. Call sendOobCode (VERIFY_EMAIL) exactly as Firebase JS SDK sendEmailVerification() does
  console.log("\n3. Calling accounts:sendOobCode (sendEmailVerification)...");
  const oobUrl = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`;
  const resOob = await fetch(oobUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requestType: "VERIFY_EMAIL",
      idToken: dataAuth.idToken,
    }),
  });

  const dataOob = await resOob.json();
  console.log("HTTP Status:", resOob.status);
  console.log("Response body:", JSON.stringify(dataOob, null, 2));

  // 5. Test Admin SDK link generation
  console.log("\n4. Testing Admin SDK generateEmailVerificationLink...");
  try {
    const link = await adminAuth.generateEmailVerificationLink(user.email, {
      url: "https://the-classic-crush-6c6f9.firebaseapp.com/verify-email",
      handleCodeInApp: true,
    });
    console.log("Generated Link:", link);
  } catch (err) {
    console.error("Admin link generation failed:", err.message);
  }
}

diagnose().catch(console.error);
