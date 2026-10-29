import { getAdminAuth } from "../api/_lib/firebaseAdmin.ts";

const auth = getAdminAuth();

async function testContinuationUrls() {
  const testEmail = `test.domain.${Date.now()}@example.com`;
  console.log("Creating test user:", testEmail);
  const user = await auth.createUser({
    email: testEmail,
    password: "TestPassword123!",
  });

  try {
    // Test A: Firebase default domain
    try {
      const linkA = await auth.generateEmailVerificationLink(testEmail, {
        url: "https://the-classic-crush-6c6f9.firebaseapp.com/verify-email",
        handleCodeInApp: true,
      });
      console.log("✓ Success with the-classic-crush-6c6f9.firebaseapp.com/verify-email");
      console.log("  Link preview:", linkA.substring(0, 90) + "...");
    } catch (e) {
      console.error("✗ Failed with firebaseapp.com:", e.message, e.code);
    }

    // Test B: Custom domain https://www.theclassiccrush.com/verify-email
    try {
      const linkB = await auth.generateEmailVerificationLink(testEmail, {
        url: "https://www.theclassiccrush.com/verify-email",
        handleCodeInApp: true,
      });
      console.log("✓ Success with www.theclassiccrush.com/verify-email");
      console.log("  Link preview:", linkB.substring(0, 90) + "...");
    } catch (e) {
      console.error("✗ Failed with www.theclassiccrush.com:", e.message, e.code, e?.cause?.response?.text);
    }

    // Test C: Custom domain root https://www.theclassiccrush.com
    try {
      const linkC = await auth.generateEmailVerificationLink(testEmail, {
        url: "https://www.theclassiccrush.com",
        handleCodeInApp: true,
      });
      console.log("✓ Success with https://www.theclassiccrush.com");
    } catch (e) {
      console.error("✗ Failed with root domain:", e.message, e.code, e?.cause?.response?.text);
    }
  } finally {
    console.log("Deleting test user...");
    await auth.deleteUser(user.uid);
  }
}

testContinuationUrls();
