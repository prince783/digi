import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/*
 * IMPORTANT — EMAIL DELIVERY REQUIREMENT:
 *
 * "onboarding@resend.dev" is a Resend sandbox address.
 * It can ONLY deliver to the Resend account owner's verified email.
 * Emails to ANY other address (your customers) will be silently
 * blocked/dropped by Resend.
 *
 * To deliver to real customers you MUST:
 *   1. Add and verify your sending domain in Resend dashboard.
 *   2. Set EMAIL_FROM=noreply@yourdomain.com in .env.local
 *
 * Until EMAIL_FROM is set to a verified domain address,
 * customer emails will NOT be delivered.
 */
const EMAIL_FROM =
  process.env.EMAIL_FROM ||
  "DigiProfilo <onboarding@resend.dev>";

if (!process.env.EMAIL_FROM) {
  console.warn(
    "[Email] WARNING: EMAIL_FROM env var is not set. " +
    "Falling back to onboarding@resend.dev which can ONLY deliver " +
    "to the Resend account owner. Customer emails will NOT be delivered. " +
    "Set EMAIL_FROM to a verified domain address in .env.local."
  );
}

export async function sendInvoiceEmail(options: {
  to: string;
  customerName: string;
  productName: string;
  invoiceNumber: string;
  pdfBuffer: Buffer;
  /**
   * Public URL of the product (catalog, digital card, or resume).
   * Also accepted as the legacy `catalogUrl` alias.
   */
  productUrl?: string;
  /** @deprecated Use productUrl instead */
  catalogUrl?: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.error("[Email] RESEND_API_KEY is missing, skipping invoice email.");
    return;
  }

  // Support both productUrl (new) and catalogUrl (legacy)
  const liveUrl = options.productUrl || options.catalogUrl || "";

  const productLinkHtml = liveUrl
    ? `
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 20px 0;">
        <tr>
          <td align="center">
            <a href="${liveUrl}" target="_blank" style="display: inline-block; padding: 12px 28px; background: #1E3A5F; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 700; box-shadow: 0 2px 8px rgba(30,58,95,0.25);">
              View Your ${options.productName} &rarr;
            </a>
          </td>
        </tr>
      </table>
    `
    : "";

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: options.to,
    subject: `Your DigiProfilo Invoice - ${options.invoiceNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 24px 12px; background-color: #F4F6F8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #E5E7EB;">
          
          <!-- Header with Brand Accent -->
          <tr>
            <td style="background: linear-gradient(135deg, #1E3A5F 0%, #152A47 100%); padding: 28px 32px; text-align: left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">DigiProfilo</h1>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #94A3B8; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Payment Receipt &amp; Invoice</p>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 6px 14px; background: rgba(16,185,129,0.2); border: 1px solid rgba(16,185,129,0.4); border-radius: 20px; color: #34D399; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">PAID</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; color: #1E293B;">
              <p style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #0F172A;">
                Hi ${options.customerName || "there"},
              </p>
              
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                Thank you for your payment. Your <strong>${options.productName}</strong> is now <span style="color: #059669; font-weight: 700;">active</span>.
              </p>

              <!-- Invoice Details Snapshot Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin: 20px 0; padding: 16px;">
                <tr>
                  <td style="padding: 8px 12px;">
                    <span style="font-size: 11px; color: #64748B; text-transform: uppercase; font-weight: 600; display: block;">Invoice Number</span>
                    <span style="font-size: 14px; color: #0F172A; font-weight: 700; font-family: monospace;">${options.invoiceNumber}</span>
                  </td>
                  <td style="padding: 8px 12px;">
                    <span style="font-size: 11px; color: #64748B; text-transform: uppercase; font-weight: 600; display: block;">Subscription Status</span>
                    <span style="font-size: 13px; color: #059669; font-weight: 700;">&#9679; Active (1 Year)</span>
                  </td>
                </tr>
              </table>

              ${productLinkHtml}

              <!-- Attachment Notice Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px; margin: 20px 0 24px 0; padding: 14px 16px;">
                <tr>
                  <td width="28" valign="middle" style="font-size: 18px;">📎</td>
                  <td style="padding-left: 10px; font-size: 13px; color: #166534; line-height: 1.5;">
                    <strong>Invoice Attached:</strong> Your official invoice receipt is attached as a PDF (<strong>${options.invoiceNumber}.pdf</strong>) below for your records.
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; font-size: 14px; color: #475569; line-height: 1.5;">
                If you have any questions or need support, feel free to reply to this email.
              </p>

              <p style="margin: 20px 0 0 0; font-size: 14px; font-weight: 600; color: #1E3A5F;">
                — DigiProfilo Team
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94A3B8;">
                &copy; ${new Date().getFullYear()} DigiProfilo. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </body>
      </html>
    `,
    attachments: [
      {
        filename: `${options.invoiceNumber}.pdf`,
        content: options.pdfBuffer,
      },
    ],
  });

  if (error) {
    console.error("[Email] Failed to send invoice email:", error);
    throw new Error(`Email delivery failed: ${JSON.stringify(error)}`);
  }
}

