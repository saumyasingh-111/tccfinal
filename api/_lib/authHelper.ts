import crypto from "node:crypto";

const DEFAULT_SECRET = "tcc_classic_crush_production_secret_key_2026";

export function getAdminCredentials() {
  const email = (process.env.ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL || "admin@theclassiccrush.com").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || "admin123";
  const secret = process.env.ADMIN_SESSION_SECRET || DEFAULT_SECRET;
  return { email, password, secret };
}

export function createToken(email: string, role: "admin" | "staff" = "admin"): string {
  const { secret } = getAdminCredentials();
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      email,
      role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600, // 7 days expiration
    })
  ).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest("base64url");
  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token: string | undefined | null): { valid: boolean; email?: string; role?: "admin" | "staff" } {
  if (!token) return { valid: false };
  try {
    const cleanToken = token.startsWith("Bearer ") ? token.slice(7).trim() : token.trim();
    const parts = cleanToken.split(".");
    if (parts.length !== 3) return { valid: false };
    const [header, payload, signature] = parts;
    const { secret } = getAdminCredentials();
    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${header}.${payload}`)
      .digest("base64url");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return { valid: false };
    }

    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false };
    }

    return { valid: true, email: data.email, role: data.role || "admin" };
  } catch {
    return { valid: false };
  }
}

export function extractAuthToken(req: any): string | null {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  if (req.query?.token && typeof req.query.token === "string") {
    return req.query.token.trim();
  }
  return null;
}
