# Contact Form Email Setup with Resend

This guide will help you set up the contact form email functionality for your PDFSuit application. When users fill out the contact form, emails will be sent to your specified email addresses.

---

## ⚠️ IMPORTANT: Update Email Addresses First!

**Before setting up Resend, you MUST update the email addresses that will receive contact form submissions.**

### Step 1: Change Email Addresses in Contact Page

**File:** `app/contact/page.tsx`
**Lines:** 77-78

Find these lines:
```typescript
<p className="text-gray-400 text-sm">darshitp091@gmail.com</p>
<p className="text-gray-400 text-sm">darshitp0562@gmail.com</p>
```

**Change to YOUR email addresses:**
```typescript
<p className="text-gray-400 text-sm">your-email@yourdomain.com</p>
<p className="text-gray-400 text-sm">another-email@yourdomain.com</p>
```

> 💡 **Tip:** These are the email addresses that will be displayed on your contact page AND will receive the contact form emails.

---

## 📧 Setting Up Resend Email Service

Resend is a modern email API service that makes it easy to send transactional emails.

### What is Resend?

- Modern email API for developers
- **Free Tier:** 100 emails/day, 3,000 emails/month
- No credit card required for free tier
- Simple setup and integration
- Excellent deliverability

---

## 🚀 Setup Instructions

### Step 2: Create Resend Account

1. **Go to Resend Website:**
   - Visit: [https://resend.com](https://resend.com)

2. **Sign Up for Free Account:**
   - Click "Get Started" or "Sign Up"
   - Enter your email address
   - Verify your email address

3. **Complete Registration:**
   - Set your name and company details
   - No credit card required for free tier

---

### Step 3: Get API Key

1. **Log in to Resend Dashboard:**
   - Go to: [https://resend.com/api-keys](https://resend.com/api-keys)

2. **Create New API Key:**
   - Click "Create API Key" button
   - Name it: `PDFSuit Contact Form` (or any name you prefer)
   - Select permission: **Full Access** (for sending emails)
   - Click "Add"

3. **Copy the API Key:**
   - ⚠️ **IMPORTANT:** The API key will be shown **only once**
   - Copy it immediately and store it safely
   - Format: `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

> 🔒 **Security Note:** Never share your API key publicly or commit it to GitHub. Keep it secure!

---

### Step 4: Configure Environment Variables

1. **Open `.env.local` file** in your project root directory

2. **Find the Resend section** (around line 10-15)

3. **Replace the placeholder API key:**

**BEFORE:**
```bash
RESEND_API_KEY=re_placeholder_get_from_resend_dashboard
CONTACT_EMAIL_TO=darshitp091@gmail.com,darshitp0562@gmail.com
```

**AFTER (with your actual values):**
```bash
RESEND_API_KEY=re_your_actual_api_key_here
CONTACT_EMAIL_TO=your-email@yourdomain.com,another-email@yourdomain.com
```

4. **Save the `.env.local` file**

---

### Environment Variables Explanation

| Variable | Description | Example |
|----------|-------------|---------|
| `RESEND_API_KEY` | Your Resend API key from dashboard | `re_abc123...` |
| `CONTACT_EMAIL_TO` | Email addresses to receive contact form submissions (comma-separated) | `hello@company.com,support@company.com` |
| `RESEND_FROM_EMAIL` | (Optional) Custom sender email - requires domain verification | `noreply@yourdomain.com` |

---

## 🧪 Testing on Localhost

### Step 5: Test the Contact Form

1. **Restart Your Development Server:**
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

2. **Open Your Browser:**
   - Go to: `http://localhost:3000/contact`

3. **Fill Out the Contact Form:**
   - **Name:** Test User
   - **Email:** test@example.com
   - **Subject:** Test Message
   - **Message:** This is a test message from the contact form.

4. **Click "Send Message"**

5. **Check Your Email Inbox:**
   - Check **both** email addresses you configured
   - Look for an email with subject: "📬 New Contact: Test Message"
   - Email should arrive within 10-30 seconds

6. **Verify Email Content:**
   - Email should show user's name, email, subject, and message
   - Should have a professional HTML layout with PDFSuit branding
   - Reply button should work (opens email client)

---

## ✅ What You Should See

### Successful Submission:
- Form shows green success message
- Form fields clear automatically
- Email arrives in your inbox
- Professional HTML email template with PDFSuit branding

### If Emails Don't Arrive:

**Check These Common Issues:**

1. **Verify API Key is Correct:**
   - Re-check your `.env.local` file
   - Make sure you copied the full API key
   - No extra spaces or quotes

2. **Check Spam/Junk Folder:**
   - Resend emails sometimes go to spam initially
   - Mark as "Not Spam" to improve future deliverability

3. **Verify Email Addresses:**
   - Check `CONTACT_EMAIL_TO` in `.env.local`
   - Make sure email addresses are correct
   - No typos or extra spaces

4. **Check Resend Dashboard:**
   - Go to: [https://resend.com/emails](https://resend.com/emails)
   - See if email was sent successfully
   - Check for any error messages

5. **Check Browser Console:**
   - Open browser DevTools (F12)
   - Look for errors in Console tab
   - Check Network tab for failed requests

---

## 🌐 Deploying to Production (Vercel)

### Step 6: Add Environment Variables to Vercel

1. **Go to Vercel Dashboard:**
   - Visit: [https://vercel.com](https://vercel.com)
   - Select your project

2. **Navigate to Settings:**
   - Click "Settings" tab
   - Click "Environment Variables"

3. **Add Environment Variables:**

   **Add `RESEND_API_KEY`:**
   - Name: `RESEND_API_KEY`
   - Value: `re_your_actual_api_key_here`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

   **Add `CONTACT_EMAIL_TO`:**
   - Name: `CONTACT_EMAIL_TO`
   - Value: `your-email@yourdomain.com,another-email@yourdomain.com`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

4. **Redeploy Your Application:**
   - Go to "Deployments" tab
   - Click "..." menu on latest deployment
   - Click "Redeploy"
   - OR push a new commit to trigger auto-deployment

5. **Test on Production:**
   - Visit your live website
   - Go to /contact page
   - Submit a test message
   - Verify email arrives

---

## 🔒 Optional: Domain Verification (Advanced)

**Why verify your domain?**
- Use custom "from" email address (e.g., `noreply@yourdomain.com`)
- Better email deliverability
- Professional appearance
- Avoid "via resend.dev" in email headers

### How to Verify Your Domain:

1. **Go to Resend Dashboard:**
   - Visit: [https://resend.com/domains](https://resend.com/domains)

2. **Click "Add Domain"**

3. **Enter Your Domain:**
   - Example: `yourdomain.com`
   - Click "Add"

4. **Add DNS Records:**
   - Resend will provide DNS records (SPF, DKIM, DMARC)
   - Add these records to your domain DNS settings
   - Typically done in your domain registrar (GoDaddy, Namecheap, etc.)

5. **Verify Domain:**
   - Click "Verify" button in Resend dashboard
   - Verification can take 5-60 minutes

6. **Update Environment Variable:**
   - Add to `.env.local`:
     ```bash
     RESEND_FROM_EMAIL=noreply@yourdomain.com
     ```
   - Restart development server

> 📝 **Note:** Domain verification is optional. Without it, emails will be sent from `onboarding@resend.dev` which works perfectly fine for contact forms.

---

## 📊 Monitoring Email Deliverability

### Resend Dashboard Features:

1. **Email Logs:**
   - View all sent emails
   - Check delivery status
   - See bounce/complaint rates

2. **Analytics:**
   - Track email opens (if enabled)
   - Monitor delivery rates
   - See sending patterns

3. **Rate Limits:**
   - Free tier: 100 emails/day, 3,000/month
   - Track your usage in dashboard
   - Upgrade if needed

**Access Dashboard:** [https://resend.com/emails](https://resend.com/emails)

---

## ⚠️ Troubleshooting

### Problem: "Configuration error: RESEND_API_KEY not set"

**Solution:**
1. Check `.env.local` file exists
2. Verify `RESEND_API_KEY=re_...` is present
3. Restart development server
4. No quotes around the API key

---

### Problem: "Configuration error: Email recipients not configured"

**Solution:**
1. Check `.env.local` has `CONTACT_EMAIL_TO=...`
2. Make sure email addresses are comma-separated (no spaces)
3. Format: `email1@example.com,email2@example.com`
4. Restart development server

---

### Problem: Form submits but no email arrives

**Solutions:**

1. **Check Resend Dashboard:**
   - Go to [https://resend.com/emails](https://resend.com/emails)
   - Look for the email in logs
   - Check status (delivered, bounced, etc.)

2. **Check Spam Folder:**
   - Look in spam/junk folders
   - Mark as "Not Spam"

3. **Verify Email Addresses:**
   - Check spelling in `CONTACT_EMAIL_TO`
   - Test with different email addresses

4. **Check API Key:**
   - Verify it's the correct key
   - Try creating a new API key

5. **Check Rate Limits:**
   - Free tier: 100 emails/day
   - Check if you've exceeded limits

---

### Problem: "Rate limit exceeded" error

**Solution:**
- Users can only send 5 messages per hour per IP address
- This is intentional to prevent spam
- Either wait 1 hour or use different network/IP
- For testing, you can temporarily increase limit in `app/api/contact/route.ts`

---

### Problem: Emails go to spam

**Solutions:**

1. **Verify Domain** (see Optional section above)
2. **Warm Up Your Sending:**
   - Start with small volumes
   - Gradually increase over time

3. **Good Email Content:**
   - Avoid spam trigger words
   - Use proper HTML formatting
   - Include unsubscribe option (for marketing emails)

4. **Ask Recipients to Whitelist:**
   - Add sending email to contacts
   - Mark as "Not Spam"

---

## 🔄 Alternative Email Services

If Resend doesn't work for you, here are alternatives:

### SendGrid
- **Free Tier:** 100 emails/day
- **Setup:** Similar to Resend
- **Guide:** [https://docs.sendgrid.com/for-developers/sending-email/api-getting-started](https://docs.sendgrid.com/for-developers/sending-email/api-getting-started)

### Nodemailer with Gmail
- **Free:** Yes (with Gmail account)
- **Setup:** More complex (App Passwords required)
- **Limit:** 500 emails/day per Gmail account
- **Guide:** [https://nodemailer.com/usage/using-gmail/](https://nodemailer.com/usage/using-gmail/)

### Mailgun
- **Free Tier:** 1,000 emails/month (verification required)
- **Setup:** Similar to Resend
- **Guide:** [https://documentation.mailgun.com/en/latest/quickstart-sending.html](https://documentation.mailgun.com/en/latest/quickstart-sending.html)

---

## 📞 Support

### Resend Support:
- **Documentation:** [https://resend.com/docs](https://resend.com/docs)
- **Support:** [https://resend.com/support](https://resend.com/support)
- **Status Page:** [https://status.resend.com](https://status.resend.com)

### Common Questions:

**Q: Do I need a credit card?**
A: No! The free tier (100 emails/day) doesn't require a credit card.

**Q: Can I send to multiple email addresses?**
A: Yes! Separate them with commas in `CONTACT_EMAIL_TO`.

**Q: Will it work on localhost?**
A: Yes! Just make sure `.env.local` is configured correctly.

**Q: What happens when I exceed 100 emails/day?**
A: You'll get an error. Either wait until next day or upgrade to a paid plan.

**Q: Can users reply to the email?**
A: Yes! The reply-to address is set to the user's email automatically.

**Q: Is my API key safe?**
A: Yes, as long as you:
  - Never commit `.env.local` to Git
  - Keep it in environment variables only
  - Don't share it publicly

---

## ✨ Summary Checklist

Before going live, verify:

- [ ] Email addresses updated in `app/contact/page.tsx` (lines 77-78)
- [ ] Resend account created
- [ ] API key obtained from Resend
- [ ] `.env.local` configured with `RESEND_API_KEY`
- [ ] `.env.local` configured with `CONTACT_EMAIL_TO`
- [ ] Tested contact form on localhost
- [ ] Email received in inbox (check spam folder too)
- [ ] Environment variables added to Vercel
- [ ] Tested on production website
- [ ] Domain verified (optional but recommended)

---

## 🎉 You're All Set!

Your contact form is now configured to send professional emails. Users can now reach you directly through your website!

**Need Help?** Review the troubleshooting section above or check the Resend documentation.

---

*Last Updated: November 21, 2025*
*PDFSuit Contact Form Email Setup Guide*
