import { getAdminAuth } from "../api/_lib/firebaseAdmin.ts";

const auth = getAdminAuth();

async function testSingleDomain() {
  const testEmail = `test.domain2.${Date.now()}@example.com`;
  console.log("Waiting 15 seconds to clear Google rate limit window...");
  await new Promise(r => setTimeout(r, 15000));

  console.log("Creating test user:", testEmail);
  const user = await auth.createUser({
    email: testEmail,
    password: "TestPassword123!",
  });

  try {
    const link = await auth.generateEmailVerificationLink(testEmail, {
      url: "https://www.theclassiccrush.com/verify-email",
      handleCodeInApp: true,
    });
    console.log("✓ SUCCESS with https://www.theclassiccrush.com/verify-email!");
    console.log("Generated Link:", link);
  } catch (err) {
    console.error("✗ Failed:", err.message);
    if (err?.cause?.response?.text) {
      console.error("Cause text:", err.cause.response.text);
    }
  } finally {
    await auth.deleteUser(user.uid);
  }
}

testSingleDomain();
