import { Resend } from "resend";

// Ensure .env.local is loaded in Node.js standalone environments
if (!process.env.RESEND_API_KEY && !process.env.SENDGRID_API_KEY) {
  try {
    if (typeof (process as any).loadEnvFile === "function") {
      (process as any).loadEnvFile(".env.local");
    }
  } catch {}
}

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface EmailResult {
  success: boolean;
  provider: "resend" | "sendgrid" | "none";
  messageId?: string;
  error?: string;
  errorCode?: string;
  statusCode?: number;
  configurationMissing?: boolean;
  domainUnverified?: boolean;
}

/**
 * Generate a clean, readable plain-text fallback from HTML
 */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "$2 ($1)")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&bull;/g, "•")
    .replace(/&copy;/g, "©")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Dispatch transactional email via Resend SDK (primary) or SendGrid (secondary).
 * Fails honestly with clear error diagnostics when keys are unconfigured or rejected.
 */
export async function sendTransactionalEmail(params: EmailParams): Promise<EmailResult> {
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const sendgridApiKey = process.env.SENDGRID_API_KEY?.trim();
  const fromAddress =
    params.from ||
    process.env.EMAIL_FROM ||
    "The Classic Crush <hello@theclassiccrush.com>";

  const textContent = params.text || htmlToPlainText(params.html);

  // 1. Primary: Resend SDK
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        text: textContent,
      });

      if (error) {
        const isDomainUnverified =
          error.message?.toLowerCase().includes("not verified") ||
          error.message?.toLowerCase().includes("verify a domain") ||
          error.message?.toLowerCase().includes("verify your domain");

        if (isDomainUnverified) {
          console.error(
            `[Resend Domain Verification Required] Sender domain is not verified in Resend. Please add and verify 'theclassiccrush.com' at https://resend.com/domains by publishing the DNS records (DKIM/SPF). Error: ${error.message}`
          );
        } else {
          console.error(
            `[Resend Delivery Error] Recipient: ${params.to} | Subject: "${params.subject}" | Error: ${error.name} - ${error.message}`
          );
        }

        return {
          success: false,
          provider: "resend",
          error: isDomainUnverified
            ? `Resend domain unverified: ${error.message}. Please verify 'theclassiccrush.com' at https://resend.com/domains`
            : `${error.name}: ${error.message}`,
          errorCode: error.name,
          domainUnverified: isDomainUnverified,
        };
      }

      if (data?.id) {
        console.log(
          `[Resend Delivery Accepted] Message ID: ${data.id} | Recipient: ${params.to} | Subject: "${params.subject}"`
        );
        return {
          success: true,
          provider: "resend",
          messageId: data.id,
        };
      }

      return {
        success: false,
        provider: "resend",
        error: "Resend API returned no message ID.",
      };
    } catch (err: any) {
      console.error(
        `[Resend Network Exception] Recipient: ${params.to} | Error: ${err?.message || "Unknown error"}`
      );
      return {
        success: false,
        provider: "resend",
        error: err?.message || "Network exception during Resend email dispatch.",
      };
    }
  }

  // 2. Secondary fallback: SendGrid if configured
  if (sendgridApiKey) {
    try {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sendgridApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: params.to }] }],
          from: {
            email: fromAddress.includes("<")
              ? fromAddress.replace(/.*<([^>]+)>.*/, "$1")
              : fromAddress,
          },
          subject: params.subject,
          content: [
            { type: "text/plain", value: textContent },
            { type: "text/html", value: params.html },
          ],
        }),
      });

      if (response.ok || response.status === 202) {
        const messageId = response.headers.get("x-message-id") || undefined;
        console.log(
          `[SendGrid Delivery Accepted] Message ID: ${messageId || "unknown"} | Recipient: ${params.to}`
        );
        return {
          success: true,
          provider: "sendgrid",
          messageId,
        };
      }

      const errText = await response.text();
      console.error(`[SendGrid Delivery Error] Status: ${response.status} | Error: ${errText}`);
      return {
        success: false,
        provider: "sendgrid",
        error: `SendGrid error (${response.status}): ${errText}`,
        statusCode: response.status,
      };
    } catch (err: any) {
      console.error(`[SendGrid Network Exception] ${err?.message}`);
      return {
        success: false,
        provider: "sendgrid",
        error: err?.message || "SendGrid dispatch exception",
      };
    }
  }

  // 3. Clear Configuration Error (Never log misleading fake dispatch notices)
  console.error(
    `[Email Configuration Error] Cannot send "${params.subject}" to ${params.to}. RESEND_API_KEY is missing from environment. Configure RESEND_API_KEY in .env.local to enable email delivery.`
  );

  return {
    success: false,
    provider: "none",
    error:
      "RESEND_API_KEY is not configured in .env.local. Please obtain an API key from https://resend.com and add it to your .env.local file.",
    configurationMissing: true,
  };
}
