import nodemailer from 'nodemailer';
import { CustomerOrder } from './types';

// Create Nodemailer Transporter
export function getEmailTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER || process.env.ADMIN_EMAIL || 'fz.concern@gmail.com';
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS || '';

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: pass
      ? {
          user,
          pass,
        }
      : undefined,
  });
}

/**
 * Strips out bot internal price, balance, and payment metadata lines from item strings.
 * Extracts clean activation URLs (e.g., https://one.google.com/activate-plan/...)
 */
export function extractCleanLinksOrText(rawItems: string[]): string[] {
  const cleaned: string[] = [];

  rawItems.forEach((item) => {
    if (!item) return;

    // Search for URL inside item text
    const urlMatches = item.match(/https?:\/\/[^\s\n<"']+/gi);
    if (urlMatches && urlMatches.length > 0) {
      urlMatches.forEach((url) => {
        // Clean trailing punctuation or parentheses
        const cleanUrl = url.replace(/[).,]+$/, '').trim();
        if (cleanUrl && !cleaned.includes(cleanUrl)) {
          cleaned.push(cleanUrl);
        }
      });
    } else {
      // Filter out internal bot lines (Price, Total, Balance left, PAYMENT DETAIL, etc.)
      const sanitizedLines = item
        .split('\n')
        .map((l) => l.trim())
        .filter((line) => {
          if (!line) return false;
          if (/PURCHASE SUCCESSFUL/i.test(line)) return false;
          if (/PAYMENT DETAIL/i.test(line)) return false;
          if (/Price:/i.test(line)) return false;
          if (/Total:/i.test(line)) return false;
          if (/Balance left:/i.test(line)) return false;
          if (/BUY:/i.test(line)) return false;
          if (/Order:\s*ORD/i.test(line)) return false;
          if (/Thank you for your purchase/i.test(line)) return false;
          if (/ITEMS/i.test(line)) return false;
          return true;
        });

      const cleanedText = sanitizedLines.join('\n').trim();
      if (cleanedText && !cleaned.includes(cleanedText)) {
        cleaned.push(cleanedText);
      }
    }
  });

  return cleaned.length > 0 ? cleaned : rawItems;
}

/**
 * Generates HTML email content for order activation
 * Strictly excludes any price / total amount information
 */
export function buildActivationEmailHtml(order: CustomerOrder): string {
  const senderEmail = process.env.ADMIN_EMAIL || 'fz.concern@gmail.com';
  const rawItems = order.items && order.items.length > 0 ? order.items : ['Contact support for activation link'];
  const items = extractCleanLinksOrText(rawItems);

  const itemsHtml = items
    .map((item, idx) => {
      const isUrl = item.startsWith('http://') || item.startsWith('https://');
      if (isUrl) {
        return `
          <div style="background-color: #1c1612; border: 1px solid #d4af37; border-radius: 12px; padding: 20px; margin-bottom: 16px; text-align: center;">
            <p style="color: #eadfcf; font-size: 14px; margin-top: 0; margin-bottom: 10px; font-weight: 600;">
              Activation Link ${items.length > 1 ? `#${idx + 1}` : ''}
            </p>
            <a href="${item}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b28e28 100%); color: #1c1612; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 16px; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);">
              🚀 Click Here to Redeem & Activate
            </a>
            <div style="margin-top: 14px; word-break: break-all; font-family: monospace; font-size: 12px; color: #b89874; background: #120e0b; padding: 10px; border-radius: 6px;">
              ${item}
            </div>
          </div>
        `;
      } else {
        return `
          <div style="background-color: #1c1612; border: 1px solid #3d3129; border-radius: 10px; padding: 16px; margin-bottom: 14px;">
            <p style="color: #d4af37; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; font-weight: bold;">
              Activation Detail ${items.length > 1 ? `#${idx + 1}` : ''}
            </p>
            <div style="font-family: monospace; font-size: 15px; color: #FAF8F5; background: #120e0b; padding: 12px; border-radius: 6px; border: 1px dashed #5c4a3e; word-break: break-all; white-space: pre-wrap;">
              ${item}
            </div>
          </div>
        `;
      }
    })
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Order Activation - TeleShop Premium</title>
</head>
<body style="margin: 0; padding: 0; background-color: #120e0b; font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FAF8F5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #120e0b; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #1c1612; border: 1px solid #3d3129; border-radius: 16px; overflow: hidden; box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2a211b 0%, #1c1612 100%); padding: 32px 30px; text-align: center; border-bottom: 2px solid #d4af37;">
              <h1 style="margin: 0; color: #d4af37; font-size: 26px; font-weight: 800; letter-spacing: 0.5px;">
                ✨ TeleShop Premium
              </h1>
              <p style="margin: 6px 0 0 0; color: #decdb8; font-size: 14px;">
                Digital Services & Subscription Hub
              </p>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 32px 30px;">
              <div style="background: rgba(212, 175, 55, 0.1); border-left: 4px solid #d4af37; border-radius: 4px; padding: 16px; margin-bottom: 24px;">
                <h2 style="margin: 0 0 6px 0; color: #d4af37; font-size: 18px;">
                  🎉 Order Approved & Activated!
                </h2>
                <p style="margin: 0; color: #eadfcf; font-size: 14px; line-height: 1.5;">
                  Your subscription order has been approved. Your access details and activation links are ready below.
                </p>
              </div>

              <!-- Order Summary Box (NO PRICES SHOWN) -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #2a211b; border: 1px solid #3d3129; border-radius: 10px; padding: 18px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px 0; color: #b89874; font-size: 12px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">
                      Order Summary
                    </p>
                    <table width="100%" style="font-size: 14px; color: #FAF8F5; line-height: 1.6;">
                      <tr>
                        <td style="color: #b89874;">Order ID:</td>
                        <td align="right" style="font-weight: 600; font-family: monospace;">#${order.orderCode}</td>
                      </tr>
                      <tr>
                        <td style="color: #b89874;">Product:</td>
                        <td align="right" style="font-weight: 600; color: #d4af37;">${order.productName}</td>
                      </tr>
                      <tr>
                        <td style="color: #b89874;">Quantity:</td>
                        <td align="right" style="font-weight: 600;">${order.quantity}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Activation Items -->
              <h3 style="color: #FAF8F5; font-size: 16px; margin: 0 0 14px 0;">
                🔑 Your Activation Details:
              </h3>
              ${itemsHtml}

              <!-- Activation Steps -->
              <div style="background-color: #2a211b; border-radius: 10px; padding: 20px; margin-top: 24px;">
                <h4 style="margin: 0 0 12px 0; color: #d4af37; font-size: 14px; font-weight: 700;">
                  📌 How to Redeem:
                </h4>
                <ol style="margin: 0; padding-left: 20px; color: #eadfcf; font-size: 13px; line-height: 1.7;">
                  <li>Click the activation link provided above.</li>
                  <li>Sign in with your target Google / Email account.</li>
                  <li>Follow the on-screen prompts to confirm and activate your plan.</li>
                  <li>Enjoy your premium subscription instantly!</li>
                </ol>
              </div>

              <!-- Support Note -->
              <p style="margin-top: 28px; margin-bottom: 0; font-size: 13px; color: #b89874; text-align: center; line-height: 1.5;">
                If you face any issues or need help, contact us directly at <a href="mailto:${senderEmail}" style="color: #d4af37; text-decoration: underline;">${senderEmail}</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #120e0b; padding: 20px; text-align: center; border-top: 1px solid #2a211b;">
              <p style="margin: 0; color: #5c4a3e; font-size: 12px;">
                &copy; ${new Date().getFullYear()} TeleShop Premium. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Sends activation email to customer
 */
export async function sendActivationEmail(order: CustomerOrder): Promise<{ success: boolean; error?: string }> {
  try {
    const recipient = order.emailAddress || (order.contactMethod === 'email' ? order.contactValue : undefined);

    if (!recipient || !recipient.includes('@')) {
      console.warn(`[Email] Skipping email for order #${order.orderCode}: No valid email address provided.`);
      return { success: false, error: 'Customer did not provide a valid email address.' };
    }

    const senderEmail = process.env.ADMIN_EMAIL || 'fz.concern@gmail.com';
    const transporter = getEmailTransporter();

    const mailOptions = {
      from: `"TeleShop Premium" <${senderEmail}>`,
      to: recipient,
      subject: `🎉 Your Activation Link for Order #${order.orderCode} - ${order.productName}`,
      html: buildActivationEmailHtml(order),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Activation email successfully sent to ${recipient} for order #${order.orderCode}. Message ID: ${info.messageId}`);
    return { success: true };
  } catch (error: any) {
    console.error(`[Email] Failed to send activation email for order #${order.orderCode}:`, error?.message || error);
    return { success: false, error: error?.message || 'SMTP Email sending failed' };
  }
}
