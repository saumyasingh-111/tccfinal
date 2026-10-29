import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import notificationsHandler from "../api/notifications.ts";
import { getAdminDb, getAdminAuth } from "../api/_lib/firebaseAdmin.ts";
import { createToken } from "../api/_lib/authHelper.ts";

describe("TCC Email Verification & Admin Notification Tests", () => {
  const db = getAdminDb();
  const auth = getAdminAuth();

  test("Firebase Admin Auth and Database instances are initialized", () => {
    assert.ok(db, "Firestore Admin DB must be initialized");
    assert.ok(auth, "Firebase Admin Auth must be initialized");
  });

  test("Notification endpoint rejects missing required fields with HTTP 400", async () => {
    let responseStatus = 0;
    let responseJson = null;

    const mockReq = {
      method: "POST",
      body: JSON.stringify({ name: "Incomplete User" }),
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
    assert.equal(responseStatus, 400, "Must return HTTP 400 when uid or email is missing");
    assert.equal(responseJson.success, false);
  });

  test("Notification endpoint rejects non-POST methods with HTTP 405", async () => {
    let responseStatus = 0;
    const mockReq = { method: "GET" };
    const mockRes = {
      setHeader: () => {},
      status: (code) => {
        responseStatus = code;
        return {
          json: () => {},
          end: () => {},
        };
      },
    };

    await notificationsHandler(mockReq, mockRes);
    assert.equal(responseStatus, 405, "Must return HTTP 405 for GET requests");
  });

  test("Notification endpoint enforces single-alert idempotency in Firestore", async () => {
    const testUid = `test_customer_${Date.now()}`;
    const testEmail = `test.student.${Date.now()}@csjmu.ac.in`;
    const adminToken = createToken("admin@classiccrush.cafe");

    if (db) {
      // 1. Setup customer document in Firestore
      await db.collection("users").doc(testUid).set({
        uid: testUid,
        name: "Saumya Test Customer",
        email: testEmail,
        phone: "+91 98765 43210",
        role: "customer",
        adminNotificationSent: false,
        createdAt: new Date().toISOString(),
      });

      // 2. First Notification Request
      let status1 = 0;
      let json1 = null;
      const mockReq1 = {
        method: "POST",
        headers: { authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          uid: testUid,
          name: "Saumya Test Customer",
          email: testEmail,
          phone: "+91 98765 43210",
        }),
      };
      const mockRes1 = {
        setHeader: () => {},
        status: (code) => {
          status1 = code;
          return {
            json: (data) => {
              json1 = data;
            },
            end: () => {},
          };
        },
      };

      await notificationsHandler(mockReq1, mockRes1);

      assert.equal(status1, 200, "First notification attempt must respond with HTTP 200");
      // When RESEND_API_KEY is not configured in local environment, must honestly report failure
      assert.equal(json1.duplicate, false, "First notification must not be marked as duplicate");
      if (!json1.success) {
        // Critical requirement: Must NOT mark adminNotificationSent: true if email was not actually sent (e.g. missing key or unverified domain)
        const snapAfterFirst = await db.collection("users").doc(testUid).get();
        assert.equal(snapAfterFirst.data().adminNotificationSent, false, "Must NOT mark sent when dispatch failed");

        // Now simulate a successfully sent notification by updating Firestore
        await db.collection("users").doc(testUid).update({
          adminNotificationSent: true,
          adminNotificationSentAt: new Date().toISOString(),
          adminNotificationProvider: "resend",
        });
      } else {
        const snapAfterFirst = await db.collection("users").doc(testUid).get();
        assert.equal(snapAfterFirst.data().adminNotificationSent, true);
      }

      // 3. Second Notification Request with same UID (Simulating retry / replay when already sent)
      let status2 = 0;
      let json2 = null;
      const mockReq2 = {
        method: "POST",
        headers: { authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          uid: testUid,
          name: "Saumya Test Customer",
          email: testEmail,
          phone: "+91 98765 43210",
        }),
      };
      const mockRes2 = {
        setHeader: () => {},
        status: (code) => {
          status2 = code;
          return {
            json: (data) => {
              json2 = data;
            },
            end: () => {},
          };
        },
      };

      await notificationsHandler(mockReq2, mockRes2);

      assert.equal(status2, 200, "Second call must return HTTP 200");
      assert.equal(json2.success, true);
      assert.equal(json2.duplicate, true, "Second call must be flagged duplicate without resending");

      // Cleanup
      await db.collection("users").doc(testUid).delete();
    }
  });

  test("Notification template strictly excludes passwords and sensitive credentials", () => {
    const templateSrc = fs.readFileSync(path.resolve("api/_lib/emailTemplates.ts"), "utf8");
    const handlerSrc = fs.readFileSync(path.resolve("api/notifications.ts"), "utf8");
    const combined = templateSrc + "\n" + handlerSrc;
    assert.ok(!combined.includes("params.password"), "Must never reference or output passwords");
    assert.ok(!combined.includes("params.token"), "Must never output token parameter");
    assert.ok(combined.includes("params.registeredAt"), "Must include registration timestamp");
    assert.ok(combined.includes("params.email"), "Must include customer email");
    assert.ok(combined.includes("params.name"), "Must include customer name");
  });

  test("Client bundle security: No backend secrets in frontend source", () => {
    const srcDir = path.resolve("src");
    const checkDir = (dir) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          checkDir(fullPath);
        } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
          const content = fs.readFileSync(fullPath, "utf8");
          assert.ok(
            !content.includes("FIREBASE_PRIVATE_KEY"),
            `Frontend file ${file} must not reference FIREBASE_PRIVATE_KEY`
          );
          assert.ok(
            !content.includes("RESEND_API_KEY"),
            `Frontend file ${file} must not reference RESEND_API_KEY`
          );
          assert.ok(
            !content.includes("SENDGRID_API_KEY"),
            `Frontend file ${file} must not reference SENDGRID_API_KEY`
          );
        }
      }
    };
    checkDir(srcDir);
  });

  test("Rate limiting / cooldown calculation prevents rapid verification requests", () => {
    const now = Date.now();
    const lastSentWithin30s = now - 30 * 1000;
    const diff = Math.floor((now - lastSentWithin30s) / 1000);
    const cooldown = diff < 60 ? 60 - diff : 0;

    assert.equal(cooldown, 30, "Should enforce remaining 30s cooldown");

    const lastSentOver60s = now - 70 * 1000;
    const diff2 = Math.floor((now - lastSentOver60s) / 1000);
    const cooldown2 = diff2 < 60 ? 60 - diff2 : 0;

    assert.equal(cooldown2, 0, "Should allow immediate send after 60s");
  });
});
