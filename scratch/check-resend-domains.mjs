import { Resend } from "resend";

if (typeof process.loadEnvFile === "function") {
  try { process.loadEnvFile(".env.local"); } catch {}
}

const key = process.env.RESEND_API_KEY;
const resend = new Resend(key);

async function checkDomains() {
  try {
    const list = await resend.domains.list();
    console.log("Resend domains list:", JSON.stringify(list, null, 2));
  } catch (err) {
    console.error("Domains list error:", err);
  }
}

checkDomains();
