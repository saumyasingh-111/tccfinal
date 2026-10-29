import { getAdminDb, getAdminAuth } from "./_lib/firebaseAdmin.ts";
import { verifyToken, extractAuthToken } from "./_lib/authHelper.ts";
import {
  buildBrandedVerificationEmail,
  buildBrandedPasswordResetEmail,
  buildAdminNotificationHtml,
  EMAIL_SUBJECTS,
} from "./_lib/emailTemplates.ts";
import { sendTransactionalEmail } from "./_lib/resendClient.ts";

// In-memory rate limiting map for email requests (by email)
const verificationRateLimit = new Map<string, number>();

export default async function handler(req: any, res: any) {
  // CORS & Security headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed. Use POST." });
  }

  const db = getAdminDb();
  const adminAuth = getAdminAuth();
  if (!db) {
    return res.status(500).json({ success: false, error: "Database connection unavailable." });
  }

  try {
    const rawBody = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const action = req.query?.action || rawBody.action || "notify_registration";

    // =========================================================================
    // ACTION 1: Send Premium Branded Customer Verification Email
    // =========================================================================
    if (action === "send_verification") {
      const email = String(rawBody.email || req.query?.email || "").trim().toLowerCase();
      const customerName = String(rawBody.name || req.query?.name || "").trim();

      if (!email) {
        return res.status(400).json({ success: false, error: "Email address is required." });
      }

      // Check Rate Limit (60-second cooldown per recipient email)
      const now = Date.now();
      const lastSent = verificationRateLimit.get(email) || 0;
      if (now - lastSent < 60000) {
        const waitSeconds = Math.ceil((60000 - (now - lastSent)) / 1000);
        return res.status(429).json({
          success: false,
          error: `Please wait ${waitSeconds}s before requesting another verification email.`,
          cooldownRemaining: waitSeconds,
        });
      }

      let verificationLink = "";
      let linkGenError = "";
      let linkGenCode = "";

      if (adminAuth) {
        try {
          // Must use an authorized domain in Firebase Auth Settings.
          // the-classic-crush-6c6f9.firebaseapp.com is authorized by default.
          const continueUrl = "https://the-classic-crush-6c6f9.firebaseapp.com/verify-email";
          verificationLink = await adminAuth.generateEmailVerificationLink(email, {
            url: continueUrl,
            handleCodeInApp: true,
          });
        } catch (linkErr: any) {
          linkGenCode = linkErr?.code || "auth/internal-error";
          let detailedMsg = linkErr?.message || "Failed to generate verification link";
          try {
            if (linkErr?.cause?.response?.text) {
              const parsed = JSON.parse(linkErr.cause.response.text);
              if (parsed?.error?.message) detailedMsg = parsed.error.message;
            }
          } catch {}
          linkGenError = detailedMsg;
          console.error(`[Firebase Link Generation Error] Recipient: ${email} | Code: ${linkGenCode} | Message: ${detailedMsg}`);
        }
      } else {
        linkGenError = "Firebase Admin Auth is not initialized.";
        linkGenCode = "auth/not-initialized";
      }

      // If cryptographic verification link failed to generate, NEVER dispatch an email with a broken link.
      // Instead, signal fallbackRequired so the client SDK can execute native sendEmailVerification.
      if (!verificationLink) {
        return res.status(200).json({
          success: false,
          fallbackRequired: true,
          linkGenerated: false,
          provider: "none",
          error: `Could not generate cryptographic verification link: ${linkGenError}`,
          errorCode: linkGenCode,
        });
      }

      const emailHtml = buildBrandedVerificationEmail({
        customerName: customerName || undefined,
        verificationLink,
      });

      const sendResult = await sendTransactionalEmail({
        to: email,
        subject: EMAIL_SUBJECTS.verification,
        html: emailHtml,
      });

      if (!sendResult.success) {
        return res.status(200).json({
          success: false,
          fallbackRequired: true,
          linkGenerated: true,
          provider: sendResult.provider,
          domainUnverified: sendResult.domainUnverified,
          error: sendResult.error || "Transactional provider not configured.",
          errorCode: sendResult.errorCode,
          verificationLink: process.env.NODE_ENV !== "production" ? verificationLink : undefined,
        });
      }

      verificationRateLimit.set(email, Date.now());

      return res.status(200).json({
        success: true,
        message: "Branded verification email dispatched via Resend.",
        provider: sendResult.provider,
        messageId: sendResult.messageId,
      });
    }

    // =========================================================================
    // ACTION 2: Send Premium Branded Password Reset Email
    // =========================================================================
    if (action === "send_reset") {
      const email = String(rawBody.email || req.query?.email || "").trim().toLowerCase();
      const customerName = String(rawBody.name || req.query?.name || "").trim();

      if (!email) {
        return res.status(400).json({ success: false, error: "Email address is required." });
      }

      let resetLink = "";
      let linkGenError = "";
      let linkGenCode = "";

      if (adminAuth) {
        try {
          resetLink = await adminAuth.generatePasswordResetLink(email);
        } catch (linkErr: any) {
          linkGenCode = linkErr?.code || "auth/internal-error";
          let detailedMsg = linkErr?.message || "Failed to generate password reset link";
          try {
            if (linkErr?.cause?.response?.text) {
              const parsed = JSON.parse(linkErr.cause.response.text);
              if (parsed?.error?.message) detailedMsg = parsed.error.message;
            }
          } catch {}
          linkGenError = detailedMsg;
          console.error(`[Firebase Reset Link Error] Recipient: ${email} | Code: ${linkGenCode} | Message: ${detailedMsg}`);
        }
      } else {
        linkGenError = "Firebase Admin Auth is not initialized.";
        linkGenCode = "auth/not-initialized";
      }

      if (!resetLink) {
        return res.status(200).json({
          success: false,
          fallbackRequired: true,
          linkGenerated: false,
          provider: "none",
          error: `Could not generate cryptographic password reset link: ${linkGenError}`,
          errorCode: linkGenCode,
        });
      }

      const emailHtml = buildBrandedPasswordResetEmail({
        customerName: customerName || undefined,
        resetLink,
      });

      const sendResult = await sendTransactionalEmail({
        to: email,
        subject: EMAIL_SUBJECTS.passwordReset,
        html: emailHtml,
      });

      if (!sendResult.success) {
        return res.status(200).json({
          success: false,
          fallbackRequired: true,
          linkGenerated: true,
          provider: sendResult.provider,
          domainUnverified: sendResult.domainUnverified,
          error: sendResult.error || "Transactional provider not configured.",
          errorCode: sendResult.errorCode,
          resetLink: process.env.NODE_ENV !== "production" ? resetLink : undefined,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Password reset email dispatched via Resend.",
        provider: sendResult.provider,
        messageId: sendResult.messageId,
      });
    }

    // =========================================================================
    // ACTION 3: Test Email Delivery Endpoint
    // =========================================================================
    if (action === "test_delivery") {
      const recipient = String(rawBody.email || req.query?.email || "").trim().toLowerCase();
      if (!recipient) {
        return res.status(400).json({ success: false, error: "Recipient email is required for test delivery." });
      }

      const emailHtml = buildBrandedVerificationEmail({
        customerName: "TCC Test Recipient",
        verificationLink: `${process.env.APP_URL || "https://the-classic-crush-6c6f9.firebaseapp.com"}/verify-email?mode=test`,
      });

      const sendResult = await sendTransactionalEmail({
        to: recipient,
        subject: "[TCC Test] Transactional Delivery Pipeline Verification",
        html: emailHtml,
      });

      return res.status(sendResult.success ? 200 : 502).json({
        ...sendResult,
        recipient,
        timestamp: new Date().toISOString(),
      });
    }

    // =========================================================================
    // ACTION 4: Admin Registration Notification (Default)
    // =========================================================================
    const { uid, name, email, phone } = rawBody;

    if (!uid || !email) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: uid and email are mandatory.",
      });
    }

    // Authenticate caller: Verify Firebase ID Token OR Admin Token
    const rawToken = extractAuthToken(req);
    let verifiedUid = "";

    if (adminAuth && rawToken) {
      try {
        const decodedToken = await adminAuth.verifyIdToken(rawToken);
        verifiedUid = decodedToken.uid;
      } catch {
        const adminSession = verifyToken(rawToken);
        if (adminSession.valid) {
          verifiedUid = uid;
        }
      }
    } else if (rawToken) {
      const adminSession = verifyToken(rawToken);
      if (adminSession.valid) {
        verifiedUid = uid;
      }
    }

    // If verification token was provided and mismatched, reject
    if (verifiedUid && verifiedUid !== uid) {
      return res.status(403).json({
        success: false,
        error: "Forbidden: Token identity does not match customer profile UID.",
      });
    }

    // -------------------------------------------------------------
    // Idempotency Check: Fetch customer record from Firestore
    // -------------------------------------------------------------
    const userDocRef = db.collection("users").doc(uid);
    const userDocSnap = await userDocRef.get();

    if (userDocSnap.exists) {
      const userData = userDocSnap.data();
      if (userData?.adminNotificationSent === true) {
        return res.status(200).json({
          success: true,
          message: "Admin notification was already sent for this account.",
          duplicate: true,
          provider: userData.adminNotificationProvider || "already-sent",
        });
      }
    }

    // Target configuration: Notification email defaults to theclassiccrush.cafe@gmail.com
    const adminEmail =
      process.env.ADMIN_NOTIFICATION_EMAIL ||
      process.env.ADMIN_EMAIL ||
      "theclassiccrush.cafe@gmail.com";
    const emailFrom = process.env.EMAIL_FROM || "The Classic Crush <onboarding@resend.dev>";

    const registeredAt = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });

    const emailHtml = buildAdminNotificationHtml({
      name: String(name || "Customer").trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : undefined,
      registeredAt,
      uid,
    });

    // Send email
    const sendResult = await sendTransactionalEmail({
      to: adminEmail,
      from: emailFrom,
      subject: `[TCC Notification] New Customer Registered: ${name || email}`,
      html: emailHtml,
    });

    // Atomically record in Firestore and persist customer details
    const nowIso = new Date().toISOString();
    if (sendResult.success) {
      await userDocRef.set(
        {
          uid,
          name: String(name || "").trim(),
          email: String(email).trim().toLowerCase(),
          phone: phone ? String(phone).trim() : "",
          role: "customer",
          adminNotificationSent: true,
          adminNotificationSentAt: nowIso,
          adminNotificationProvider: sendResult.provider,
          adminNotificationMessageId: sendResult.messageId || null,
        },
        { merge: true }
      );

      return res.status(200).json({
        success: true,
        message: "Admin notification dispatched successfully.",
        provider: sendResult.provider,
        messageId: sendResult.messageId,
        duplicate: false,
      });
    } else {
      await userDocRef.set(
        {
          uid,
          name: String(name || "").trim(),
          email: String(email).trim().toLowerCase(),
          phone: phone ? String(phone).trim() : "",
          role: "customer",
          adminNotificationSent: false,
          adminNotificationLastError: sendResult.error || "Delivery failed",
          adminNotificationLastAttempt: nowIso,
        },
        { merge: true }
      );

      return res.status(200).json({
        success: false,
        message: "Admin notification email delivery failed.",
        provider: sendResult.provider,
        error: sendResult.error,
        duplicate: false,
      });
    }
  } catch (err: any) {
    console.error("Notification handler error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error: " + (err?.message || "Unknown error"),
    });
  }
}
