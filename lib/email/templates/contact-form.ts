/**
 * Contact Form Email Template
 *
 * Professional HTML email template for contact form submissions
 * Includes user information, message, and PDFSuit branding
 */

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function getContactFormEmailHTML(data: ContactFormData): string {
  const { name, email, subject, message } = data;
  const timestamp = new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Form Submission - PDFSuit</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">

          <!-- Header with PDFSuit Branding -->
          <tr>
            <td style="background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                📄 PDFSuit
              </h1>
              <p style="margin: 8px 0 0 0; color: #fee2e2; font-size: 14px;">
                New Contact Form Submission
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">

              <!-- Alert Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
                <tr>
                  <td>
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                      <strong>⚠️ Action Required:</strong> A new contact form submission requires your attention.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- User Information -->
              <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                Contact Information
              </h2>

              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 120px; vertical-align: top;">
                    <strong>Name:</strong>
                  </td>
                  <td style="padding: 8px 0; color: #111827; font-size: 14px;">
                    ${name}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 120px; vertical-align: top;">
                    <strong>Email:</strong>
                  </td>
                  <td style="padding: 8px 0; color: #111827; font-size: 14px;">
                    <a href="mailto:${email}" style="color: #DC2626; text-decoration: none;">${email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 120px; vertical-align: top;">
                    <strong>Subject:</strong>
                  </td>
                  <td style="padding: 8px 0; color: #111827; font-size: 14px;">
                    ${subject}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 120px; vertical-align: top;">
                    <strong>Submitted:</strong>
                  </td>
                  <td style="padding: 8px 0; color: #111827; font-size: 14px;">
                    ${timestamp}
                  </td>
                </tr>
              </table>

              <!-- Message Content -->
              <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                Message
              </h2>

              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word;">
${message}
                </p>
              </div>

              <!-- Reply Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 30px;">
                <tr>
                  <td align="center">
                    <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}"
                       style="display: inline-block; background-color: #DC2626; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-size: 14px; font-weight: 600; box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);">
                      ✉️ Reply to ${name}
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
                This email was sent from the contact form on <strong>PDFSuit</strong><br>
                <a href="https://pdfsuit.com" style="color: #DC2626; text-decoration: none;">pdfsuit.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Plain text version for email clients that don't support HTML
export function getContactFormEmailText(data: ContactFormData): string {
  const { name, email, subject, message } = data;
  const timestamp = new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return `
PDFSuit - New Contact Form Submission

⚠️ ACTION REQUIRED: A new contact form submission requires your attention.

CONTACT INFORMATION:
-------------------
Name:      ${name}
Email:     ${email}
Subject:   ${subject}
Submitted: ${timestamp}

MESSAGE:
--------
${message}

---
Reply to this email to respond to ${name} at ${email}

This email was sent from the contact form on PDFSuit (https://pdfsuit.com)
  `.trim();
}
