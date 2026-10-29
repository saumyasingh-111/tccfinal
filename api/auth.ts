import crypto from "node:crypto";
import { getAdminCredentials, createToken, verifyToken, extractAuthToken } from "./_lib/authHelper.ts";
import { getAdminDb } from "./_lib/firebaseAdmin.ts";

export default async function handler(req: any, res: any) {
  // CORS & Security headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET: Verify existing session token
  if (req.method === "GET") {
    const token = extractAuthToken(req);
    const verification = verifyToken(token);

    if (verification.valid) {
      return res.status(200).json({
        authenticated: true,
        email: verification.email,
        role: verification.role || "admin",
        message: "Session is valid",
      });
    }

    return res.status(401).json({
      authenticated: false,
      error: "Unauthorized: Invalid or expired session token",
    });
  }

  // POST: Login endpoint
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const { email, password, action } = body;

      // Handle token verification via POST
      if (action === "verify") {
        const token = body.token || extractAuthToken(req);
        const verification = verifyToken(token);
        if (verification.valid) {
          return res.status(200).json({
            authenticated: true,
            email: verification.email,
            role: verification.role || "admin",
          });
        }
        return res.status(401).json({ authenticated: false, error: "Invalid token" });
      }

      // Handle Login
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Email and password are required.",
        });
      }

      const inputEmail = String(email).trim().toLowerCase();
      const inputPass = String(password);

      // 1. Authoritative root admin credentials check
      const { email: adminEmail, password: adminPassword } = getAdminCredentials();
      if (inputEmail === adminEmail && inputPass === adminPassword) {
        const token = createToken(inputEmail, "admin");
        return res.status(200).json({
          success: true,
          token,
          user: {
            email: inputEmail,
            role: "admin",
          },
          expiresIn: 7 * 24 * 3600,
        });
      }

      // 2. Query Firestore staff & user collections
      const db = getAdminDb();
      if (db) {
        // Hash password for secure comparison
        const hashedPass = crypto.createHash("sha256").update(inputPass).digest("hex");

        // A. Check dedicated staff collection
        try {
          const staffSnap = await db.collection("staff").where("email", "==", inputEmail).get();
          if (!staffSnap.empty) {
            const staffDoc = staffSnap.docs[0];
            const staffData = staffDoc.data();

            if (staffData.isActive === false) {
              return res.status(403).json({
                success: false,
                error: "This staff account has been deactivated. Please contact management.",
              });
            }

            const isMatch =
              staffData.passwordHash === hashedPass ||
              staffData.password === inputPass;

            if (isMatch) {
              const role: "admin" | "staff" = staffData.role === "staff" ? "staff" : "admin";
              const token = createToken(inputEmail, role);
              return res.status(200).json({
                success: true,
                token,
                user: {
                  email: inputEmail,
                  name: staffData.name || "Staff Member",
                  role,
                },
                expiresIn: 7 * 24 * 3600,
              });
            }
          }
        } catch (staffErr) {
          console.warn("Could not query staff collection:", staffErr);
        }

        // B. Check users collection
        try {
          const userSnap = await db.collection("users").where("email", "==", inputEmail).get();
          if (!userSnap.empty) {
            const userData = userSnap.docs[0].data();

            // Strict role guard: Normal customer accounts are rejected from staff portal
            if (userData.role === "customer" || !userData.role) {
              return res.status(403).json({
                success: false,
                error: "Access denied. This portal is strictly for authorized staff and management.",
              });
            }

            if (userData.role === "staff" || userData.role === "admin") {
              const isMatch =
                userData.passwordHash === hashedPass ||
                userData.password === inputPass;

              if (isMatch) {
                const role: "admin" | "staff" = userData.role === "staff" ? "staff" : "admin";
                const token = createToken(inputEmail, role);
                return res.status(200).json({
                  success: true,
                  token,
                  user: {
                    email: inputEmail,
                    name: userData.name || "Staff Member",
                    role,
                  },
                  expiresIn: 7 * 24 * 3600,
                });
              }
            }
          }
        } catch (userErr) {
          console.warn("Could not query users collection:", userErr);
        }
      }

      // Invalid credentials
      return res.status(401).json({
        success: false,
        error: "Invalid email or password. Please verify your credentials.",
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: "Internal server error during authentication: " + (err?.message || "Unknown error"),
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
