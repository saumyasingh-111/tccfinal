import { getAdminAuth } from "../api/_lib/firebaseAdmin.ts";

const auth = getAdminAuth();

async function run() {
  console.log("Testing generateEmailVerificationLink for saumyasingh3234@gmail.com...");

  // Test 1: With the url in actionCodeSettings
  try {
    const url1 = "https://the-classic-crush-6c6f9.firebaseapp.com/verify-email";
    console.log("\nAttempt 1: url =", url1, ", handleCodeInApp: true");
    const link1 = await auth.generateEmailVerificationLink("saumyasingh3234@gmail.com", {
      url: url1,
      handleCodeInApp: true,
    });
    console.log("SUCCESS 1! Link:", link1.substring(0, 80) + "...");
  } catch (err) {
    console.error("FAIL 1:", err);
    if (err.errorInfo) console.error("errorInfo:", err.errorInfo);
  }

  // Test 2: Without actionCodeSettings
  try {
    console.log("\nAttempt 2: No actionCodeSettings (or url only without handleCodeInApp)");
    const link2 = await auth.generateEmailVerificationLink("saumyasingh3234@gmail.com", {
      url: "https://the-classic-crush-6c6f9.firebaseapp.com",
    });
    console.log("SUCCESS 2! Link:", link2.substring(0, 80) + "...");
  } catch (err) {
    console.error("FAIL 2:", err);
    if (err.errorInfo) console.error("errorInfo:", err.errorInfo);
  }

  // Test 3: With www.theclassiccrush.com
  try {
    const url3 = "https://www.theclassiccrush.com/verify-email";
    console.log("\nAttempt 3: url =", url3);
    const link3 = await auth.generateEmailVerificationLink("saumyasingh3234@gmail.com", {
      url: url3,
      handleCodeInApp: true,
    });
    console.log("SUCCESS 3! Link:", link3.substring(0, 80) + "...");
  } catch (err) {
    console.error("FAIL 3:", err);
    if (err.errorInfo) console.error("errorInfo:", err.errorInfo);
  }
}

run();
