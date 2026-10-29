#!/usr/bin/env node
import crypto from "node:crypto";
import { getAdminDb, getAdminAuth } from "../api/_lib/firebaseAdmin.ts";

/**
 * CLI Tool: Provision Staff or Admin Account for The Classic Crush (TCC)
 *
 * Usage:
 *   node scripts/create-staff-account.mjs <email> <password> [name] [role]
 *
 * Example:
 *   node scripts/create-staff-account.mjs kitchen@classiccrush.cafe SecurePass123! "Head Chef" staff
 *   node scripts/create-staff-account.mjs manager@classiccrush.cafe AdminPass456! "Shift Manager" admin
 */

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
=============================================================
  The Classic Crush — Staff Account Provisioning Tool
=============================================================
Usage:
  node scripts/create-staff-account.mjs <email> <password> [name] [role]

Arguments:
  email     The staff member's email address (required)
  password  The account password (min 6 characters, required)
  name      Full display name (optional, default: "Staff Member")
  role      Access level: "staff" or "admin" (optional, default: "staff")

Examples:
  node scripts/create-staff-account.mjs barista@classiccrush.cafe Coffee123 "Lead Barista" staff
  node scripts/create-staff-account.mjs supervisor@classiccrush.cafe Super987 "Floor Manager" admin
=============================================================
`);
    process.exit(1);
  }

  const rawEmail = args[0]?.trim().toLowerCase();
  const rawPassword = args[1];
  const name = args[2]?.trim() || "Staff Member";
  const rawRole = (args[3]?.trim().toLowerCase()) || "staff";

  // Validations
  if (!rawEmail || !rawEmail.includes("@")) {
    console.error("Error: Please provide a valid email address.");
    process.exit(1);
  }

  if (!rawPassword || rawPassword.length < 6) {
    console.error("Error: Password must be at least 6 characters long.");
    process.exit(1);
  }

  if (rawRole !== "staff" && rawRole !== "admin") {
    console.error("Error: Role must be either 'staff' or 'admin'.");
    process.exit(1);
  }

  const role = rawRole;
  const passwordHash = crypto.createHash("sha256").update(rawPassword).digest("hex");

  console.log(`\nProvisioning account for: ${rawEmail}`);
  console.log(`Role: ${role.toUpperCase()}`);
  console.log(`Name: ${name}`);

  // 1. Firebase Auth Provisioning
  const adminAuth = getAdminAuth();
  let authUid = null;
  if (adminAuth) {
    try {
      const existingUser = await adminAuth.getUserByEmail(rawEmail).catch(() => null);
      if (existingUser) {
        console.log(`- Updating existing Firebase Auth user (${existingUser.uid})...`);
        await adminAuth.updateUser(existingUser.uid, {
          password: rawPassword,
          displayName: name,
        });
        await adminAuth.setCustomUserClaims(existingUser.uid, { role });
        authUid = existingUser.uid;
      } else {
        console.log("- Creating new Firebase Auth user...");
        const createdUser = await adminAuth.createUser({
          email: rawEmail,
          password: rawPassword,
          displayName: name,
          emailVerified: true,
        });
        await adminAuth.setCustomUserClaims(createdUser.uid, { role });
        authUid = createdUser.uid;
      }
      console.log("✓ Firebase Auth credentials saved.");
    } catch (authErr) {
      console.warn("! Notice: Firebase Auth creation skipped or failed:", authErr.message);
    }
  } else {
    console.log("- Firebase Admin Auth not initialized; continuing to database write.");
  }

  // 2. Firestore Staff Collection Provisioning
  const db = getAdminDb();
  if (db) {
    try {
      const docId = rawEmail.replace(/[^a-zA-Z0-9_-]/g, "_");
      const staffRef = db.collection("staff").doc(docId);

      const staffData = {
        email: rawEmail,
        name,
        role,
        passwordHash,
        isActive: true,
        authUid: authUid || undefined,
        updatedAt: Date.now(),
      };

      const existingDoc = await staffRef.get();
      if (!existingDoc.exists) {
        staffData.createdAt = Date.now();
      }

      // Remove undefined keys
      const cleanData = Object.fromEntries(
        Object.entries(staffData).filter(([_, v]) => v !== undefined)
      );

      await staffRef.set(cleanData, { merge: true });
      console.log(`✓ Firestore staff record saved to /staff/${docId}`);
    } catch (dbErr) {
      console.error("! Error saving to Firestore staff collection:", dbErr.message);
    }
  } else {
    console.log("- Firestore not initialized; record could not be written to database.");
  }

  console.log("\n=============================================================");
  console.log(`✓ Provisioning complete for ${rawEmail} (${role})`);
  console.log("  The account can now sign in at /admin/login");
  console.log("=============================================================\n");
}

main().catch((err) => {
  console.error("Fatal provisioning error:", err);
  process.exit(1);
});
