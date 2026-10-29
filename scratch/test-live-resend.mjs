import { Resend } from "resend";

if (typeof process.loadEnvFile === "function") {
  try { process.loadEnvFile(".env.local"); } catch {}
}

const key = process.env.RESEND_API_KEY;
console.log("Resend API Key exists:", !!key, "prefix:", key ? key.substring(0, 7) : "none");

const resend = new Resend(key);

async function testResend() {
  console.log("\n--- TEST 1: Sending from onboarding@resend.dev to delivered@resend.dev ---");
  try {
    const res1 = await resend.emails.send({
      from: "The Classic Crush <onboarding@resend.dev>",
      to: ["delivered@resend.dev"],
      subject: "TCC Delivery Test - Sandbox",
      html: "<p>Sandbox delivery test</p>",
    });
    console.log("Result 1:", JSON.stringify(res1, null, 2));
  } catch (err) {
    console.error("Error 1:", err);
  }

  console.log("\n--- TEST 2: Sending from hello@theclassiccrush.com to delivered@resend.dev ---");
  try {
    const res2 = await resend.emails.send({
      from: "The Classic Crush <hello@theclassiccrush.com>",
      to: ["delivered@resend.dev"],
      subject: "TCC Delivery Test - theclassiccrush.com",
      html: "<p>Domain delivery test</p>",
    });
    console.log("Result 2:", JSON.stringify(res2, null, 2));
  } catch (err) {
    console.error("Error 2:", err);
  }

  console.log("\n--- TEST 3: Sending from onboarding@resend.dev to cafe admin email ---");
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "theclassiccrush.cafe@gmail.com";
  try {
    const res3 = await resend.emails.send({
      from: "The Classic Crush <onboarding@resend.dev>",
      to: [adminEmail],
      subject: "TCC Test Admin Notification",
      html: "<p>Admin notification test via onboarding@resend.dev</p>",
    });
    console.log("Result 3:", JSON.stringify(res3, null, 2));
  } catch (err) {
    console.error("Error 3:", err);
  }
}

testResend();
