/**
 * Contact Form API Route
 *
 * Handles contact form submissions and sends emails via Resend
 * Includes rate limiting and validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendContactFormEmail } from '@/lib/email/resend-client';

// Simple in-memory rate limiting
// For production with multiple servers, use Redis or Upstash
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limit: 5 requests per hour per IP
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Check if IP has exceeded rate limit
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // No record or window expired - create new record
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  // Check if limit exceeded
  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  // Increment count
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count };
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize input (basic XSS prevention)
 */
function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
}

/**
 * POST /api/contact
 * Send contact form email
 */
export async function POST(request: NextRequest) {
  try {
    // Get IP address for rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Check rate limit
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
          message: 'You have sent too many messages. Please wait an hour before sending another message.',
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Please fill in all required fields (name, email, subject, message).',
        },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email address',
          message: 'Please provide a valid email address.',
        },
        { status: 400 }
      );
    }

    // Validate field lengths
    if (name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name too long',
          message: 'Name must be less than 100 characters.',
        },
        { status: 400 }
      );
    }

    if (subject.length > 200) {
      return NextResponse.json(
        {
          success: false,
          error: 'Subject too long',
          message: 'Subject must be less than 200 characters.',
        },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Message too long',
          message: 'Message must be less than 5000 characters.',
        },
        { status: 400 }
      );
    }

    // Sanitize inputs (basic XSS prevention)
    const sanitizedData = {
      name: sanitizeInput(name),
      email: sanitizeInput(email),
      subject: sanitizeInput(subject),
      message: sanitizeInput(message),
    };

    // Send email
    const result = await sendContactFormEmail(sanitizedData);

    if (!result.success) {
      console.error('Failed to send contact email:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send email',
          message: 'We could not send your message at this time. Please try again later or contact us directly.',
        },
        { status: 500 }
      );
    }

    // Success response
    return NextResponse.json(
      {
        success: true,
        message: 'Your message has been sent successfully! We will get back to you soon.',
        remaining: rateLimit.remaining,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Contact form error:', error);

    // Check for specific Resend API errors
    if (error.message?.includes('RESEND_API_KEY')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Configuration error',
          message: 'Email service is not configured. Please contact the administrator.',
        },
        { status: 500 }
      );
    }

    if (error.message?.includes('CONTACT_EMAIL_TO')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Configuration error',
          message: 'Email recipients are not configured. Please contact the administrator.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests.',
    },
    { status: 405 }
  );
}
