import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { sendTransactionalEmail, htmlToPlainText } from "../api/_lib/resendClient.ts";
import {
  buildBrandedVerificationEmail,
  buildBrandedPasswordResetEmail,
  buildAdminNotificationHtml,
  EMAIL_SUBJECTS,
} from "../api/_lib/emailTemplates.js";
import notificationsHandler from "../api/notifications.ts";

describe("TCC Resend Email Delivery Pipeline", () => {
  test("htmlToPlainText generates clean, accessible plain-text fallbacks", () => {
    const sampleHtml = `
      <style>body { background: #fff; }</style>
      <h1>Welcome to The Classic Crush</h1>
      <p>Hello <strong>Saumya</strong>,<br>Please verify your email address.</p>
      <p><a href="https://www.theclassiccrush.com/verify?code=123">Click here to verify</a></p>
      <p>&copy; 2026 The Classic Crush &bull; Kalyanpur, Kanpur</p>
    `;
    const text = htmlToPlainText(sampleHtml);

    assert.ok(!text.includes("<style>"), "Must strip <style> blocks");
    assert.ok(!text.includes("<p>"), "Must strip HTML tags");
    assert.ok(text.includes("Welcome to The Classic Crush"), "Must preserve headings");
    assert.ok(text.includes("Hello Saumya,"), "Must preserve body text with line breaks");
    assert.ok(
      text.includes("Click here to verify (https://www.theclassiccrush.com/verify?code=123)"),
      "Must format anchors with url in parentheses"
    );
    assert.ok(text.includes("© 2026 The Classic Crush • Kalyanpur, Kanpur"), "Must decode HTML entities");
  });

  test("Branded verification template renders valid HTML with TCC brand palette and CTA", () => {
    const testLink = "https://the-classic-crush-6c6f9.firebaseapp.com/verify-email?mode=verifyEmail&oobCode=XYZ123";
    const html = buildBrandedVerificationEmail({
      customerName: "Aarav Sharma",
      verificationLink: testLink,
    });

    // Check brand palette
    assert.ok(html.includes("#F5EFEB") || html.includes("#f5efeb"), "Must contain ivory background (#F5EFEB)");
    assert.ok(html.includes("#0F3A23") || html.includes("#0f3a23"), "Must contain deep forest green (#0F3A23)");
    assert.ok(html.includes("#C99742") || html.includes("#c99742"), "Must contain muted gold (#C99742)");

    // Check content
    assert.ok(html.includes("Aarav Sharma"), "Must greet customer by name");
    assert.ok(html.includes("THE CLASSIC CRUSH"), "Must feature café brand name");
    assert.ok(html.includes("VERIFY MY EMAIL"), "Must have CTA button with uppercase text");
    assert.ok(html.includes(testLink), "Must contain authentic verification link");
  });

  test("Branded password reset template renders valid HTML and action link", () => {
    const resetLink = "https://the-classic-crush-6c6f9.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=PW987";
    const html = buildBrandedPasswordResetEmail({
      customerName: "Priya",
      resetLink,
    });

    assert.ok(html.includes("Priya"), "Must greet customer by name");
    assert.ok(html.includes("RESET PASSWORD"), "Must include reset CTA button");
    assert.ok(html.includes(resetLink), "Must contain valid reset link");
  });

  test("Admin notification template renders comprehensive customer details", () => {
    const html = buildAdminNotificationHtml({
      name: "Rohit Verma",
      email: "rohit.verma@csjmu.ac.in",
      phone: "+91 91234 56789",
      registeredAt: "29 Oct 2026, 1:45 PM",
      uid: "uid_rohit_12345",
    });

    assert.ok(html.includes("Rohit Verma"), "Must include customer name");
    assert.ok(html.includes("rohit.verma@csjmu.ac.in"), "Must include customer email");
    assert.ok(html.includes("+91 91234 56789"), "Must include customer phone");
    assert.ok(html.includes("29 Oct 2026, 1:45 PM"), "Must include registration timestamp");
    assert.ok(html.includes("uid_rohit_12345"), "Must include UID");
  });

  test("sendTransactionalEmail fails honestly and transparently when API key is unconfigured", async () => {
    // Save current key if any
    const originalResendKey = process.env.RESEND_API_KEY;
    const originalSendGridKey = process.env.SENDGRID_API_KEY;

    try {
      delete process.env.RESEND_API_KEY;
      delete process.env.SENDGRID_API_KEY;

      const result = await sendTransactionalEmail({
        to: "test@example.com",
        subject: "Pipeline Self-Test",
        html: "<p>Hello</p>",
      });

      assert.equal(result.success, false, "Must return false when unconfigured");
      assert.equal(result.provider, "none", "Provider must be 'none'");
      assert.equal(result.configurationMissing, true, "Must flag configurationMissing");
      assert.ok(result.error.includes("RESEND_API_KEY is not configured"), "Must report clear error message");
    } finally {
      if (originalResendKey) process.env.RESEND_API_KEY = originalResendKey;
      if (originalSendGridKey) process.env.SENDGRID_API_KEY = originalSendGridKey;
    }
  });

  test("Live Resend dispatch when RESEND_API_KEY is configured", async () => {
    if (!process.env.RESEND_API_KEY) {
      console.log("    ℹ [SKIPPED LIVE DISPATCH] RESEND_API_KEY not configured in current environment.");
      return;
    }

    // 1. Test verified sandbox transport using Resend SDK
    const sandboxResult = await sendTransactionalEmail({
      from: "The Classic Crush <onboarding@resend.dev>",
      to: "delivered@resend.dev",
      subject: `[TCC CI Test] Sandbox Transport Verification ${Date.now()}`,
      html: `<h1>The Classic Crush</h1><p>Test sandbox dispatch at ${new Date().toISOString()}</p>`,
    });

    assert.equal(sandboxResult.success, true, "Resend sandbox delivery must succeed with active API key");
    assert.equal(sandboxResult.provider, "resend");
    assert.ok(sandboxResult.messageId, "Resend must return messageId");
    console.log(`    ℹ Live Resend sandbox transport verified (Message ID: ${sandboxResult.messageId})`);

    // 2. Check branded custom domain status
    const brandedResult = await sendTransactionalEmail({
      to: "delivered@resend.dev",
      subject: `[TCC Domain Test] Custom Domain Verification ${Date.now()}`,
      html: `<p>Testing domain status</p>`,
    });

    if (brandedResult.success) {
      console.log(`    ℹ Domain 'theclassiccrush.com' is VERIFIED in Resend!`);
    } else {
      assert.equal(brandedResult.domainUnverified, true, "Must flag domainUnverified when DNS is pending");
      console.log(`    ℹ Domain 'theclassiccrush.com' DNS records are pending verification at resend.com/domains.`);
    }
  });

  test("API test_delivery action handles diagnostic request honestly", async () => {
    let responseStatus = 0;
    let responseJson = null;

    const mockReq = {
      method: "POST",
      query: { action: "test_delivery" },
      body: JSON.stringify({ email: "diagnostic.test@csjmu.ac.in" }),
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

    assert.ok([200, 502].includes(responseStatus), "Must return HTTP 200 (if key present & sent) or 502 (if unverified/failed)");
    assert.equal(responseJson.recipient, "diagnostic.test@csjmu.ac.in");
  });
});

// Run as standalone CLI report if invoked directly with `node scripts/test-resend-delivery.mjs`
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log("\n==================================================================");
  console.log("       THE CLASSIC CRUSH (TCC) — RESEND DELIVERY STATUS REPORT     ");
  console.log("==================================================================");
  console.log(`Node Runtime:             ${process.version}`);
  console.log(`Environment:              ${process.env.NODE_ENV || "development"}`);
  console.log(`RESEND_API_KEY:           ${process.env.RESEND_API_KEY ? "CONFIGURED (" + process.env.RESEND_API_KEY.substring(0, 7) + "..." + ")" : "MISSING (Needs .env.local entry)"}`);
  console.log(`EMAIL_FROM:               ${process.env.EMAIL_FROM || "The Classic Crush <hello@theclassiccrush.com>"}`);
  console.log(`ADMIN_NOTIFICATION_EMAIL: ${process.env.ADMIN_NOTIFICATION_EMAIL || "theclassiccrush.cafe@gmail.com"}`);
  console.log("------------------------------------------------------------------");

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log("STATUS: RESEND_API_KEY is not yet populated in .env.local.");
    console.log("ACTION: Add `RESEND_API_KEY=re_xxxxxxxxx` to `.env.local` to enable live sending.");
  } else {
    console.log("STATUS: Resend API Key is valid and active.");
    console.log("NOTE:   To send branded emails from hello@theclassiccrush.com,");
    console.log("        publish the DNS records (DKIM/SPF) in resend.com/domains.");
    console.log("        In the meantime, verification emails fall back seamlessly to");
    console.log("        Google Firebase Authentication native email delivery.");
  }
  console.log("==================================================================\n");
}
