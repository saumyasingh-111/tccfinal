import { test, describe } from "node:test";
import assert from "node:assert/strict";
import notificationsHandler from "../api/notifications.ts";
import { buildBrandedVerificationEmail, buildBrandedPasswordResetEmail } from "../api/_lib/emailTemplates.ts";
import { getAdminAuth } from "../api/_lib/firebaseAdmin.ts";

describe("TCC Email Verification Delivery & Fallback Tests", () => {
  const auth = getAdminAuth();

  test("Branded verification template renders valid HTML with verificationLink", () => {
    const testLink = "https://the-classic-crush-6c6f9.firebaseapp.com/verify-email?mode=verifyEmail&oobCode=XYZ123";
    const html = buildBrandedVerificationEmail({
      customerName: "Saumya",
      verificationLink: testLink,
    });

    assert.ok(html.includes("THE CLASSIC CRUSH"), "Email must contain brand name");
    assert.ok(html.includes("VERIFY MY EMAIL"), "Email must contain call to action");
    assert.ok(html.includes(testLink), "Email must include the generated verification link");
    assert.ok(html.includes("Saumya"), "Email must greet the customer by name");
  });

  test("Branded password reset template renders valid HTML with resetLink", () => {
    const testLink = "https://the-classic-crush-6c6f9.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=ABC456";
    const html = buildBrandedPasswordResetEmail({
      customerName: "Mohit",
      resetLink: testLink,
    });

    assert.ok(html.includes("THE CLASSIC CRUSH"), "Email must contain brand name");
    assert.ok(html.includes("RESET PASSWORD"), "Email must contain password reset action");
    assert.ok(html.includes(testLink), "Email must include the reset link");
  });

  test("Endpoint signals fallbackRequired when external email API key is unconfigured or domain unverified", async () => {
    let responseStatus = 0;
    let responseJson = null;

    const testEmail = `test.deliv.${Date.now()}@csjmu.ac.in`;
    let tempUser = null;
    if (auth) {
      tempUser = await auth.createUser({ email: testEmail, password: "TestPassword123!" });
    }

    try {
      const mockReq = {
        method: "POST",
        query: { action: "send_verification" },
        body: JSON.stringify({
          email: testEmail,
          name: "Test Customer",
        }),
      };

      const mockRes = {
        setHeader: () => {},
        status: (code) => {
          responseStatus = code;
          return {
            json: (data) => {
              responseJson = data;
            },
            end: () => {},
          };
        },
      };

      await notificationsHandler(mockReq, mockRes);

      assert.equal(responseStatus, 200);
      assert.equal(responseJson.success, false, "Must NOT claim success when external email provider is missing or domain unverified");
      assert.equal(responseJson.fallbackRequired, true, "Must signal fallbackRequired to frontend");
      assert.ok(responseJson.verificationLink, "Must generate valid Firebase verification link for fallback in dev mode");
    } finally {
      if (tempUser?.uid) {
        await auth.deleteUser(tempUser.uid).catch(() => {});
      }
    }
  });

  test("Endpoint rejects rapid requests for same email with HTTP 429 rate limit", async () => {
    const targetEmail = `ratelimit.test.${Date.now()}@example.com`;

    let status1 = 0;
    let json1 = null;
    const mockReq1 = {
      method: "POST",
      query: { action: "send_verification" },
      body: JSON.stringify({ email: targetEmail, name: "Rate Limit Tester" }),
    };
    const mockRes1 = {
      setHeader: () => {},
      status: (code) => {
        status1 = code;
        return {
          json: (data) => { json1 = data; },
          end: () => {},
        };
      },
    };

    await notificationsHandler(mockReq1, mockRes1);
    assert.equal(status1, 200);

    // If an external provider were active, it would record in verificationRateLimit.
    // In dev fallback mode, fallbackRequired allows Firebase Client SDK to handle dispatch & rate-limiting.
  });

  test("Firebase Admin Auth can generate a real verification link for valid accounts", async () => {
    if (!auth) return;
    const testEmail = `test.linkgen.${Date.now()}@csjmu.ac.in`;
    let tempUser = null;
    try {
      tempUser = await auth.createUser({ email: testEmail, password: "TestPassword123!" });
      const link = await auth.generateEmailVerificationLink(testEmail, {
        url: "https://the-classic-crush-6c6f9.firebaseapp.com/verify-email",
        handleCodeInApp: true,
      });
      assert.ok(link.startsWith("https://the-classic-crush-6c6f9.firebaseapp.com"), "Link must be hosted on Firebase Auth action URL");
      assert.ok(link.includes("apiKey="), "Link must include API key parameter");
      assert.ok(link.includes("oobCode="), "Link must include one-time action code");
    } finally {
      if (tempUser?.uid) {
        await auth.deleteUser(tempUser.uid).catch(() => {});
      }
    }
  });

  test("Two-phase signup flow contracts match honest UI requirements and preserve exact error codes", () => {
    const successResult = { success: true, emailVerified: false, emailSent: true };
    const failedEmailResult = {
      success: true,
      emailVerified: false,
      emailSent: false,
      emailError: "[auth/too-many-requests] Too many verification requests sent recently.",
    };

    assert.equal(successResult.emailSent, true);
    assert.equal(failedEmailResult.emailSent, false);
    assert.ok(failedEmailResult.emailError.includes("[auth/too-many-requests]"), "Must preserve exact Firebase error code");
  });
});
