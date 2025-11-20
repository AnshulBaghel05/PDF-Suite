# Contact Page Configuration Guide

This guide explains how to configure the contact page with your business details and set up the contact form functionality.

---

## Table of Contents

1. [Update Contact Information](#update-contact-information)
2. [Configure Contact Form](#configure-contact-form)
3. [Verify Changes](#verify-changes)

---

## Update Contact Information

The contact page displays your business contact details including email, phone, office location, and availability hours.

### Step 1: Locate the Contact Page File

Navigate to the following file:
```
app/contact/page.tsx
```

### Step 2: Update Email Addresses

Find lines **61-62** in the file:

**Current Code:**
```tsx
<p className="text-gray-400 text-sm">darshitp091@gmail.com</p>
<p className="text-gray-400 text-sm">darshitp0562@gmail.com</p>
```

**Replace with your email addresses:**
```tsx
<p className="text-gray-400 text-sm">support@yourdomain.com</p>
<p className="text-gray-400 text-sm">help@yourdomain.com</p>
```

### Step 3: Update Phone Number

Find line **87** in the file:

**Current Code:**
```tsx
<p className="text-gray-400 text-sm">+91 9256451591</p>
```

**Replace with your phone number:**
```tsx
<p className="text-gray-400 text-sm">+1 (555) 123-4567</p>
```

### Step 4: Update Business Hours

Find lines **75** and **88** to update availability hours:

**Current Code:**
```tsx
<p className="text-gray-400 text-sm">9 AM - 6 PM IST</p>
```

**Replace with your hours:**
```tsx
<p className="text-gray-400 text-sm">9 AM - 5 PM EST</p>
```

### Step 5: Update Office Location

Find lines **100-101** in the file:

**Current Code:**
```tsx
<p className="text-gray-400 text-sm">Mumbai, Maharashtra</p>
<p className="text-gray-400 text-sm">India</p>
```

**Replace with your address:**
```tsx
<p className="text-gray-400 text-sm">123 Business Street</p>
<p className="text-gray-400 text-sm">New York, NY 10001, USA</p>
```

---

## Configure Contact Form

The contact form currently uses a simulated submission (lines 17-27). You need to configure it to send emails to your inbox.

### Option 1: Using Email Service (Recommended)

#### Using SendGrid API

1. **Sign up for SendGrid:**
   - Go to [https://sendgrid.com](https://sendgrid.com)
   - Create a free account (100 emails/day free)
   - Generate an API key from Settings > API Keys

2. **Add SendGrid API Key to Environment:**

   Open `.env.local` file and add:
   ```env
   SENDGRID_API_KEY=your_sendgrid_api_key_here
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   SENDGRID_TO_EMAIL=support@yourdomain.com
   ```

3. **Install SendGrid Package:**
   ```bash
   npm install @sendgrid/mail
   ```

4. **Create API Route:**

   Create a new file: `app/api/contact/route.ts`

   ```typescript
   import { NextRequest, NextResponse } from 'next/server';
   import sgMail from '@sendgrid/mail';

   sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

   export async function POST(request: NextRequest) {
     try {
       const body = await request.json();
       const { name, email, subject, message } = body;

       // Validate required fields
       if (!name || !email || !subject || !message) {
         return NextResponse.json(
           { error: 'All fields are required' },
           { status: 400 }
         );
       }

       // Send email
       const msg = {
         to: process.env.SENDGRID_TO_EMAIL!,
         from: process.env.SENDGRID_FROM_EMAIL!,
         replyTo: email,
         subject: `Contact Form: ${subject}`,
         text: `
           Name: ${name}
           Email: ${email}
           Subject: ${subject}

           Message:
           ${message}
         `,
         html: `
           <h2>New Contact Form Submission</h2>
           <p><strong>Name:</strong> ${name}</p>
           <p><strong>Email:</strong> ${email}</p>
           <p><strong>Subject:</strong> ${subject}</p>
           <h3>Message:</h3>
           <p>${message.replace(/\n/g, '<br>')}</p>
         `,
       };

       await sgMail.send(msg);

       return NextResponse.json(
         { message: 'Email sent successfully' },
         { status: 200 }
       );
     } catch (error) {
       console.error('Error sending email:', error);
       return NextResponse.json(
         { error: 'Failed to send email' },
         { status: 500 }
       );
     }
   }
   ```

5. **Update Contact Form Handler:**

   In `app/contact/page.tsx`, replace the `handleSubmit` function (lines 17-27) with:

   ```typescript
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setStatus('sending');

     try {
       const response = await fetch('/api/contact', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify(formData),
       });

       if (response.ok) {
         setStatus('success');
         setFormData({ name: '', email: '', subject: '', message: '' });
         setTimeout(() => setStatus('idle'), 5000);
       } else {
         setStatus('error');
         setTimeout(() => setStatus('idle'), 5000);
       }
     } catch (error) {
       console.error('Error submitting form:', error);
       setStatus('error');
       setTimeout(() => setStatus('idle'), 5000);
     }
   };
   ```

#### Using Resend (Alternative)

If you prefer Resend over SendGrid:

1. **Sign up for Resend:**
   - Go to [https://resend.com](https://resend.com)
   - Create account and get API key

2. **Add to `.env.local`:**
   ```env
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL=onboarding@resend.dev
   RESEND_TO_EMAIL=support@yourdomain.com
   ```

3. **Install Resend:**
   ```bash
   npm install resend
   ```

4. **Create API Route:** `app/api/contact/route.ts`
   ```typescript
   import { NextRequest, NextResponse } from 'next/server';
   import { Resend } from 'resend';

   const resend = new Resend(process.env.RESEND_API_KEY);

   export async function POST(request: NextRequest) {
     try {
       const body = await request.json();
       const { name, email, subject, message } = body;

       if (!name || !email || !subject || !message) {
         return NextResponse.json(
           { error: 'All fields are required' },
           { status: 400 }
         );
       }

       await resend.emails.send({
         from: process.env.RESEND_FROM_EMAIL!,
         to: process.env.RESEND_TO_EMAIL!,
         replyTo: email,
         subject: `Contact Form: ${subject}`,
         html: `
           <h2>New Contact Form Submission</h2>
           <p><strong>Name:</strong> ${name}</p>
           <p><strong>Email:</strong> ${email}</p>
           <p><strong>Subject:</strong> ${subject}</p>
           <h3>Message:</h3>
           <p>${message.replace(/\n/g, '<br>')}</p>
         `,
       });

       return NextResponse.json(
         { message: 'Email sent successfully' },
         { status: 200 }
       );
     } catch (error) {
       console.error('Error sending email:', error);
       return NextResponse.json(
         { error: 'Failed to send email' },
         { status: 500 }
       );
     }
   }
   ```

5. Follow step 5 from SendGrid section to update the form handler.

### Option 2: Using Formspree (No Code Solution)

1. **Sign up for Formspree:**
   - Go to [https://formspree.io](https://formspree.io)
   - Create a free account (50 submissions/month)
   - Create a new form and get your form endpoint

2. **Update Form Handler:**

   In `app/contact/page.tsx`, replace `handleSubmit` (lines 17-27):

   ```typescript
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setStatus('sending');

     try {
       const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify(formData),
       });

       if (response.ok) {
         setStatus('success');
         setFormData({ name: '', email: '', subject: '', message: '' });
         setTimeout(() => setStatus('idle'), 5000);
       } else {
         setStatus('error');
         setTimeout(() => setStatus('idle'), 5000);
       }
     } catch (error) {
       setStatus('error');
       setTimeout(() => setStatus('idle'), 5000);
     }
   };
   ```

   Replace `YOUR_FORM_ID` with your actual Formspree form ID.

---

## Verify Changes

### 1. Test Contact Information Display

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/contact`

3. Verify all information displays correctly:
   - ✓ Email addresses
   - ✓ Phone number
   - ✓ Business hours
   - ✓ Office location

### 2. Test Contact Form

1. Fill out the contact form with test data
2. Submit the form
3. Check your email inbox for the message
4. Verify the "reply-to" address is set to the submitter's email

### 3. Test Error Handling

1. Try submitting form with missing fields
2. Verify validation errors appear
3. Test with invalid email format

---

## Troubleshooting

### Emails Not Sending

1. **Check API Keys:**
   - Verify `.env.local` has correct API keys
   - Restart development server after changing `.env.local`

2. **Check Spam Folder:**
   - Test emails might go to spam
   - Add sender to contacts

3. **Check API Logs:**
   - Look at browser console for errors
   - Check SendGrid/Resend dashboard for delivery status

### Form Not Submitting

1. **Check Console:**
   - Open browser developer tools (F12)
   - Look for error messages in Console tab

2. **Verify API Route:**
   - Ensure `app/api/contact/route.ts` exists
   - Check file has no syntax errors

3. **Test API Directly:**
   ```bash
   curl -X POST http://localhost:3000/api/contact \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@test.com","subject":"Test","message":"Test"}'
   ```

---

## Summary Checklist

Before going live, ensure:

- [ ] Email addresses updated in contact page
- [ ] Phone number updated
- [ ] Business hours updated
- [ ] Office address updated
- [ ] Contact form API route created
- [ ] Environment variables configured
- [ ] Email service tested and working
- [ ] Error handling tested
- [ ] Spam folder checked
- [ ] Reply-to functionality tested

---

## Additional Resources

- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Resend Documentation](https://resend.com/docs)
- [Formspree Documentation](https://help.formspree.io/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**Need Help?** If you encounter issues, check the error messages in:
1. Browser console (F12)
2. Terminal where `npm run dev` is running
3. Email service provider dashboard
