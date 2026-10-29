import { getAdminAuth } from "../api/_lib/firebaseAdmin.ts";

const auth = getAdminAuth();

async function testFallback() {
  const testEmail = `test.fb.${Date.now()}@example.com`;
  console.log("Creating user:", testEmail);
  const user = await auth.createUser({ email: testEmail, password: "TestPassword123!" });

  let link = "";
  try {
    // Attempt with custom domain
    try {
      console.log("Trying custom domain: https://www.theclassiccrush.com/verify-email");
      link = await auth.generateEmailVerificationLink(testEmail, {
        url: "https://www.theclassiccrush.com/verify-email",
        handleCodeInApp: true,
      });
      console.log("Custom domain worked!");
    } catch (domainErr) {
      console.log("Custom domain rejected:", domainErr.code, domainErr.message);
      console.log("Retrying with authorized firebaseapp.com domain...");
      link = await auth.generateEmailVerificationLink(testEmail, {
        url: "https://the-classic-crush-6c6f9.firebaseapp.com/verify-email",
        handleCodeInApp: true,
      });
      console.log("✓ Fallback to firebaseapp.com succeeded!");
    }
    console.log("Generated Link:", link.substring(0, 80) + "...");
  } catch (err) {
    console.error("All attempts failed:", err);
  } finally {
    await auth.deleteUser(user.uid);
  }
}

testFallback();
