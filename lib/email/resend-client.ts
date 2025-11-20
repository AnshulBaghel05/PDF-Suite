/**
 * Resend Email Client (Singleton Pattern)
 *
 * Manages email sending functionality using Resend API
 * Singleton pattern ensures single instance across the application
 */

import { Resend } from 'resend';
import { getContactFormEmailHTML, getContactFormEmailText, ContactFormData } from './templates/contact-form';

// Singleton instance
let resendInstance: Resend | null = null;

/**
 * Get Resend client instance (singleton)
 */
export function getResendClient(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error(
        'RESEND_API_KEY environment variable is not set. Please add it to your .env.local file.'
      );
    }

    resendInstance = new Resend(apiKey);
  }

  return resendInstance;
}

/**
 * Get contact email recipients from environment variable
 * Supports multiple email addresses separated by commas
 */
export function getContactEmailRecipients(): string[] {
  const emailsEnv = process.env.CONTACT_EMAIL_TO;

  if (!emailsEnv) {
    throw new Error(
      'CONTACT_EMAIL_TO environment variable is not set. Please add it to your .env.local file.'
    );
  }

  // Split by comma and trim whitespace
  const emails = emailsEnv.split(',').map(email => email.trim()).filter(email => email.length > 0);

  if (emails.length === 0) {
    throw new Error(
      'CONTACT_EMAIL_TO environment variable is empty. Please add at least one email address.'
    );
  }

  return emails;
}

/**
 * Send contact form email
 *
 * @param data Contact form data (name, email, subject, message)
 * @returns Promise that resolves when email is sent
 */
export async function sendContactFormEmail(data: ContactFormData) {
  const resend = getResendClient();
  const recipients = getContactEmailRecipients();

  const htmlContent = getContactFormEmailHTML(data);
  const textContent = getContactFormEmailText(data);

  // Get sender email (use custom domain if verified, otherwise use default)
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  try {
    const result = await resend.emails.send({
      from: `PDFSuit Contact Form <${fromEmail}>`,
      to: recipients,
      replyTo: data.email, // User can reply directly to the sender
      subject: `📬 New Contact: ${data.subject}`,
      html: htmlContent,
      text: textContent,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error('Failed to send contact form email:', error);

    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}
