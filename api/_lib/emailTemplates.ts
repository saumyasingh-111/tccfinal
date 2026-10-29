/**
 * The Classic Crush (TCC) — Transactional Email Templates
 * Premium, warm, minimal café aesthetic with editorial typography.
 */

export const EMAIL_SUBJECTS = {
  verification: "A little something before we begin | The Classic Crush",
  passwordReset: "Reset your password | The Classic Crush",
  adminNewCustomer: "[TCC Notification] New Customer Registered",
};

export const EMAIL_PREVIEW_TEXT = {
  verification: "Just one quick step to make your TCC account yours.",
  passwordReset: "Instructions to securely reset your Classic Crush password.",
};

/**
 * Premium, Fully-Branded Customer Verification Email
 */
export function buildBrandedVerificationEmail(params: {
  customerName?: string;
  verificationLink: string;
}) {
  const name = params.customerName ? params.customerName.trim() : "there";
  const previewText = EMAIL_PREVIEW_TEXT.verification;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A little something before we begin | The Classic Crush</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #F5EFEB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .card-padding { padding: 32px 20px !important; }
      .btn-padding { padding: 14px 28px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F5EFEB; color: #162820;">

  <!-- Hidden Preview Text -->
  <div style="display: none; font-size: 1px; color: #F5EFEB; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${previewText}
    &#847; &zwnj; &nbsp; &#8199; &shy; &#847; &zwnj; &nbsp; &#8199; &shy; &#847; &zwnj; &nbsp; &#8199; &shy;
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F5EFEB; padding: 40px 12px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="560" class="email-container" style="max-width: 560px; width: 100%; background-color: #FFFFFF; border: 1px solid #E2D9CC; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(15, 58, 35, 0.04);">
          
          <!-- Editorial Header -->
          <tr>
            <td align="center" style="padding: 40px 32px 24px 32px; background-color: #FAF6F0; border-bottom: 1px solid #E2D9CC;">
              <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 600; letter-spacing: 0.28em; text-transform: uppercase; color: #0F3A23;">
                THE CLASSIC CRUSH
              </p>
              <p style="margin: 0; font-family: Georgia, 'Playfair Display', serif; font-style: italic; font-size: 16px; color: #C99742;">
                A little welcome, just for you.
              </p>
            </td>
          </tr>

          <!-- Editorial Body -->
          <tr>
            <td class="card-padding" style="padding: 40px 36px 36px 36px;">
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #162820;">
                Hello <strong>${name}</strong>,
              </p>

              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.65; color: #2F3E37;">
                We're so glad you're here.
              </p>

              <p style="margin: 0 0 32px 0; font-size: 14px; line-height: 1.65; color: #2F3E37;">
                Before you settle in, we just need to make sure it's really you. Verify your email address to activate your Classic Crush account and enjoy a smoother ordering experience with us.
              </p>

              <!-- Call To Action Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${params.verificationLink}" target="_blank" class="btn-padding" style="display: inline-block; background-color: #0F3A23; color: #FAF6F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; text-decoration: none; padding: 15px 36px; border-radius: 9999px; box-shadow: 0 2px 8px rgba(15, 58, 35, 0.15);">
                      VERIFY MY EMAIL
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 32px 0 16px 0; font-size: 14px; line-height: 1.65; color: #2F3E37;">
                Once you're verified, you're all set to explore the menu, place your favourites, and keep track of your orders.
              </p>

              <p style="margin: 0 0 28px 0; font-size: 14px; line-height: 1.65; color: #2F3E37;">
                We're happy to have you here.
              </p>

              <!-- Warmly Sign-off -->
              <div style="border-top: 1px solid #FAF6F0; padding-top: 24px; margin-top: 24px;">
                <p style="margin: 0; font-size: 14px; color: #6E776F;">
                  Warmly,
                </p>
                <p style="margin: 4px 0 0 0; font-size: 15px; font-weight: 700; color: #0F3A23;">
                  The Classic Crush Team
                </p>
                <p style="margin: 4px 0 0 0; font-family: Georgia, 'Playfair Display', serif; font-style: italic; font-size: 13px; color: #C99742;">
                  A little more classic. A little more you.
                </p>
              </div>

              <!-- Fallback Direct Link -->
              <div style="margin-top: 36px; padding: 16px; background-color: #FAF6F0; border-radius: 12px; border: 1px solid #E2D9CC;">
                <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 600; color: #6E776F; text-transform: uppercase; letter-spacing: 0.05em;">
                  Button not opening?
                </p>
                <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #0F3A23; word-break: break-all;">
                  <a href="${params.verificationLink}" target="_blank" style="color: #0F3A23; text-decoration: underline;">
                    ${params.verificationLink}
                  </a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 24px 32px; background-color: #FAF6F0; border-top: 1px solid #E2D9CC; font-size: 11px; line-height: 1.5; color: #8A928B;">
              <p style="margin: 0 0 8px 0;">
                This email was sent because an account was created using this email address. If you didn't create this account, you can safely ignore this message.
              </p>
              <p style="margin: 0; font-weight: 500; color: #6E776F;">
                &copy; ${new Date().getFullYear()} The Classic Crush
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

/**
 * Premium, Fully-Branded Password Reset Email
 */
export function buildBrandedPasswordResetEmail(params: {
  customerName?: string;
  resetLink: string;
}) {
  const name = params.customerName ? params.customerName.trim() : "there";
  const previewText = EMAIL_PREVIEW_TEXT.passwordReset;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password | The Classic Crush</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F5EFEB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F5EFEB; color: #162820;">
  <div style="display: none; font-size: 1px; color: #F5EFEB; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${previewText}
  </div>
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F5EFEB; padding: 40px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="560" style="max-width: 560px; width: 100%; background-color: #FFFFFF; border: 1px solid #E2D9CC; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(15, 58, 35, 0.04);">
          <tr>
            <td align="center" style="padding: 40px 32px 24px 32px; background-color: #FAF6F0; border-bottom: 1px solid #E2D9CC;">
              <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 600; letter-spacing: 0.28em; text-transform: uppercase; color: #0F3A23;">
                THE CLASSIC CRUSH
              </p>
              <p style="margin: 0; font-family: Georgia, 'Playfair Display', serif; font-style: italic; font-size: 16px; color: #C99742;">
                Account Recovery
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 36px 36px 36px;">
              <p style="margin: 0 0 20px 0; font-size: 15px; color: #162820;">Hello <strong>${name}</strong>,</p>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.65; color: #2F3E37;">
                We received a request to reset the password for your Classic Crush account. Click below to choose a new password:
              </p>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${params.resetLink}" target="_blank" style="display: inline-block; background-color: #0F3A23; color: #FAF6F0; font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; text-decoration: none; padding: 15px 36px; border-radius: 9999px;">
                      RESET PASSWORD
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0 0; font-size: 13px; line-height: 1.6; color: #6E776F;">
                If you didn't request a password reset, you can safely disregard this email. Your password will remain unchanged.
              </p>
              <div style="border-top: 1px solid #FAF6F0; padding-top: 24px; margin-top: 24px;">
                <p style="margin: 0; font-size: 14px; color: #6E776F;">Warmly,</p>
                <p style="margin: 4px 0 0 0; font-size: 15px; font-weight: 700; color: #0F3A23;">The Classic Crush Team</p>
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 20px 32px; background-color: #FAF6F0; border-top: 1px solid #E2D9CC; font-size: 11px; color: #8A928B;">
              &copy; ${new Date().getFullYear()} The Classic Crush
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Clean HTML Template for Admin Registration Notification
 */
export function buildAdminNotificationHtml(params: {
  name: string;
  email: string;
  phone?: string;
  registeredAt: string;
  uid: string;
}) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F5EFEB; padding: 32px 16px;">
      <div style="max-width: 560px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E2D9CC; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 58, 35, 0.05);">
        <!-- Header -->
        <div style="background-color: #0F3A23; padding: 24px; text-align: center; color: #FAF7F2;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">The Classic Crush</h1>
          <p style="margin: 6px 0 0; font-size: 13px; color: #C99742; font-weight: 500;">Admin Alert: New Customer Registration</p>
        </div>

        <!-- Body -->
        <div style="padding: 28px 24px; color: #162820; font-size: 14px; line-height: 1.6;">
          <p style="margin-top: 0;">Hello Administrator,</p>
          <p>A new customer has successfully registered an account on <strong>The Classic Crush (TCC)</strong>:</p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #FAF6F0; border-radius: 8px; overflow: hidden;">
            <tbody>
              <tr>
                <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #6E776F; width: 35%; border-bottom: 1px solid #E2D9CC;">Customer Name:</td>
                <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #0F3A23; border-bottom: 1px solid #E2D9CC;">${params.name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #6E776F; border-bottom: 1px solid #E2D9CC;">Email Address:</td>
                <td style="padding: 10px 14px; font-size: 13px; color: #162820; border-bottom: 1px solid #E2D9CC;">${params.email}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #6E776F; border-bottom: 1px solid #E2D9CC;">Phone Number:</td>
                <td style="padding: 10px 14px; font-size: 13px; color: #162820; border-bottom: 1px solid #E2D9CC;">${params.phone || "Not provided"}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #6E776F; border-bottom: 1px solid #E2D9CC;">Registered At:</td>
                <td style="padding: 10px 14px; font-size: 13px; color: #162820; border-bottom: 1px solid #E2D9CC;">${params.registeredAt}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #6E776F;">User ID:</td>
                <td style="padding: 10px 14px; font-size: 12px; font-family: monospace; color: #6E776F;">${params.uid}</td>
              </tr>
            </tbody>
          </table>

          <div style="background-color: #E6F0EB; border-left: 4px solid #0F3A23; padding: 12px; border-radius: 4px; font-size: 12px; color: #0F3A23; margin: 20px 0;">
            <strong>Security Notice:</strong> No passwords, session secrets, or private tokens are ever included in notification emails.
          </div>

          <p style="margin-bottom: 0; font-size: 13px; color: #6E776F;">
            You can view and manage this customer anytime from the <a href="${process.env.APP_URL || "https://the-classic-crush-6c6f9.firebaseapp.com"}/admin" style="color: #0F3A23; font-weight: 600; text-decoration: underline;">TCC Admin Portal</a>.
          </p>
        </div>

        <!-- Footer -->
        <div style="padding: 16px 24px; background-color: #FAF6F0; border-top: 1px solid #E2D9CC; font-size: 11px; color: #8A928B; text-align: center;">
          &copy; ${new Date().getFullYear()} The Classic Crush &bull; Automated System Notification
        </div>
      </div>
    </div>
  `;
}

