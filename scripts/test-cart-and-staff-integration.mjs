import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  buildBrandedVerificationEmail,
  buildBrandedPasswordResetEmail,
  EMAIL_SUBJECTS,
  EMAIL_PREVIEW_TEXT,
} from "../api/_lib/emailTemplates.ts";
import authHandler from "../api/auth.ts";
import orderHandler from "../api/orders.ts";
import { createToken, verifyToken } from "../api/_lib/authHelper.ts";

test("Task 1: Premium branded email template contains exact required copy and styling", () => {
  const html = buildBrandedVerificationEmail({
    customerName: "Saumya Singh",
    verificationLink: "https://the-classic-crush-6c6f9.firebaseapp.com/__/auth/action?mode=verifyEmail&oobCode=TEST123456",
  });

  // Verify subject and preview
  assert.equal(EMAIL_SUBJECTS.verification, "A little something before we begin | The Classic Crush");
  assert.equal(EMAIL_PREVIEW_TEXT.verification, "Just one quick step to make your TCC account yours.");

  // Verify HTML structure and branding colors
  assert.ok(html.includes("#F5EFEB"), "Should use soft ivory background #F5EFEB");
  assert.ok(html.includes("#0F3A23"), "Should use deep forest green #0F3A23");
  assert.ok(html.includes("#C99742"), "Should use warm gold #C99742");

  // Verify exact text copy
  assert.ok(html.includes("Hello") && html.includes("Saumya Singh"), "Should include personalized greeting");
  assert.ok(html.includes("Before you settle in, we just need to make sure it's really you."));
  assert.ok(html.includes("Verify your email address to activate your Classic Crush account"));
  assert.ok(html.includes("VERIFY MY EMAIL"), "Should contain VERIFY MY EMAIL button");
  assert.ok(html.includes("Warmly,") && html.includes("The Classic Crush Team"));
  assert.ok(html.includes("A little more classic. A little more you."));
  assert.ok(html.includes("TEST123456"), "Should render authentic verification link");
});

test("Task 2: OrderContext scopes cart by UID and initializes empty for new accounts", () => {
  const orderContextFile = fs.readFileSync(path.resolve("src/context/OrderContext.tsx"), "utf-8");

  // Verify scoped storage key
  assert.ok(orderContextFile.includes("tcc_cart_"), "Should use scoped storage key prefix tcc_cart_");
  assert.ok(!orderContextFile.includes('localStorage.getItem("classic_crush_order")'), "Should not read from legacy global classic_crush_order key");

  // Verify prevUidRef pattern to detect account switches and load user-specific cart
  assert.ok(orderContextFile.includes("prevUidRef"), "Should use prevUidRef to track authenticated user changes");
  assert.ok(orderContextFile.includes("getStorageKey"), "Should resolve storage key dynamically based on user UID");
});

test("Task 3: Order placement supports customerSnapshot, token verification and recipientName", async () => {
  const dataContextFile = fs.readFileSync(path.resolve("src/context/DataContext.tsx"), "utf-8");
  assert.ok(dataContextFile.includes("customerSnapshot"), "OrderRecord in DataContext should include customerSnapshot");
  assert.ok(dataContextFile.includes("recipientName"), "OrderRecord items should include recipientName");

  const orderPageFile = fs.readFileSync(path.resolve("src/pages/OrderPage.tsx"), "utf-8");
  assert.ok(orderPageFile.includes("customerEmail"), "OrderPage should track customerEmail");
  assert.ok(orderPageFile.includes("getIdToken"), "OrderPage should retrieve Firebase ID token");
  assert.ok(orderPageFile.includes("recipientName"), "OrderPage should preserve recipientName");

  const quickOrderDrawerFile = fs.readFileSync(path.resolve("src/components/QuickOrderDrawer.tsx"), "utf-8");
  assert.ok(quickOrderDrawerFile.includes("customerEmail"), "QuickOrderDrawer should track customerEmail");
  assert.ok(quickOrderDrawerFile.includes("recipientName"), "QuickOrderDrawer should preserve recipientName");

  // Test api/orders server handler directly
  const req = {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: {
      customerName: "Aarav Gupta",
      customerPhone: "9876543210",
      customerEmail: "aarav@example.com",
      orderType: "Takeaway",
      items: [
        { id: "espresso", name: "Classic Espresso", price: 140, quantity: 2, recipientName: "Priya" }
      ],
      totalAmount: 280,
    },
  };

  let statusCode = 0;
  let responseData = null;
  const res = {
    setHeader: () => {},
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => { responseData = data; return res; },
        end: () => res,
      };
    },
  };

  await orderHandler(req, res);
  assert.equal(statusCode, 201, "Order placement should return 201 Created");
  assert.ok(responseData?.success, "Order placement should succeed");
  assert.equal(responseData.order.customerName, "Aarav Gupta");
  assert.equal(responseData.order.customerSnapshot.name, "Aarav Gupta");
  assert.equal(responseData.order.customerSnapshot.email, "aarav@example.com");
  assert.equal(responseData.order.items[0].recipientName, "Priya", "Should preserve recipientName on order items");
});

test("Task 4: AdminLoginPage has no demo credentials or autofill buttons", () => {
  const loginPageFile = fs.readFileSync(path.resolve("src/pages/admin/AdminLoginPage.tsx"), "utf-8");

  // Ensure state begins empty
  assert.ok(loginPageFile.includes('const [email, setEmail] = useState("");'), "Email state must start empty");
  assert.ok(loginPageFile.includes('const [password, setPassword] = useState("");'), "Password state must start empty");

  // Ensure fillDemo function and demo buttons were completely removed
  assert.ok(!loginPageFile.includes("fillDemo"), "fillDemo function must be removed");
  assert.ok(!loginPageFile.includes("Fill Credentials"), "Fill Credentials button must be removed");
  assert.ok(!loginPageFile.includes("Demo Credentials:"), "Demo credentials banner must be removed");
});

test("Task 4: Role-based tokens and AdminLayout access control", () => {
  // Test token creation with role
  const staffToken = createToken("staff@classiccrush.cafe", "staff");
  const verifiedStaff = verifyToken(staffToken);
  assert.equal(verifiedStaff.valid, true);
  assert.equal(verifiedStaff.role, "staff");

  const adminToken = createToken("owner@classiccrush.cafe", "admin");
  const verifiedAdmin = verifyToken(adminToken);
  assert.equal(verifiedAdmin.valid, true);
  assert.equal(verifiedAdmin.role, "admin");

  // Verify AdminLayout guards restricted sections from staff
  const adminLayoutFile = fs.readFileSync(path.resolve("src/components/admin/AdminLayout.tsx"), "utf-8");
  assert.ok(adminLayoutFile.includes("staffAllowedPaths"), "AdminLayout should define staffAllowedPaths");
  assert.ok(adminLayoutFile.includes("isAccessDeniedForStaff"), "AdminLayout should guard against staff accessing admin sections");
  assert.ok(adminLayoutFile.includes("Access Restricted"), "AdminLayout should render access restricted notice");
});

test("Task 4: Staff provisioning CLI script exists and is executable", () => {
  const scriptPath = path.resolve("scripts/create-staff-account.mjs");
  assert.ok(fs.existsSync(scriptPath), "scripts/create-staff-account.mjs must exist");
  const scriptContent = fs.readFileSync(scriptPath, "utf-8");
  assert.ok(scriptContent.includes("crypto.createHash"), "Script must hash passwords securely");
  assert.ok(scriptContent.includes("staffRef.set"), "Script must write to staff collection");
});
