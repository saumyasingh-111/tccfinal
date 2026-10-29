import { Resend } from "resend";

if (typeof process.loadEnvFile === "function") {
  try { process.loadEnvFile(".env.local"); } catch {}
}

const key = process.env.RESEND_API_KEY;
const resend = new Resend(key);

async function testOwnerDelivery() {
  console.log("Testing delivery from onboarding@resend.dev to account owner saumyasingh3234@gmail.com...");
  try {
    const res = await resend.emails.send({
      from: "The Classic Crush <onboarding@resend.dev>",
      to: ["saumyasingh3234@gmail.com"],
      subject: "The Classic Crush — Account Verification Pipeline Live Test",
      html: "<h1>The Classic Crush</h1><p>This is a live test verifying that Resend API is active and delivers to the account owner.</p>",
    });
    console.log("Result:", JSON.stringify(res, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

testOwnerDelivery();
