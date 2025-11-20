# Environment Setup and API Integration Guide

This guide explains how to set up environment variables and integrate external APIs with your PDFSuit application.

---

## Table of Contents

1. [Understanding Environment Variables](#understanding-environment-variables)
2. [Initial Setup](#initial-setup)
3. [Supabase Configuration](#supabase-configuration)
4. [Razorpay Payment Gateway Configuration](#razorpay-payment-gateway-configuration)
5. [Google AdSense Configuration](#google-adsense-configuration)
6. [Email Service Configuration (Optional)](#email-service-configuration-optional)
7. [App URL Configuration](#app-url-configuration)
8. [Code Integration Points](#code-integration-points)
9. [Verification and Testing](#verification-and-testing)
10. [Security Best Practices](#security-best-practices)

---

## Understanding Environment Variables

Environment variables are configuration values that change between environments (development, staging, production) without modifying code.

### Types of Environment Variables:

1. **Public Variables** (`NEXT_PUBLIC_*`)
   - Accessible in browser JavaScript
   - Embedded in client-side code during build
   - Use for: API URLs, public keys
   - Example: `NEXT_PUBLIC_SUPABASE_URL`

2. **Private Variables** (No prefix)
   - Only accessible on server-side
   - Never exposed to browser
   - Use for: API secrets, private keys
   - Example: `SUPABASE_SERVICE_ROLE_KEY`

---

## Initial Setup

### Step 1: Create Environment File

1. Navigate to your project root directory:
   ```bash
   cd c:\Users\manoj\PDF-Suite
   ```

2. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

   **Windows Command Prompt:**
   ```cmd
   copy .env.local.example .env.local
   ```

3. Open `.env.local` in your code editor

### Step 2: Environment File Structure

Your `.env.local` file should look like this:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Email Service (SendGrid/Resend)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_TO_EMAIL=support@yourdomain.com

# Optional: Google AdSense
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-9444956979294597
```

---

## Supabase Configuration

Supabase provides authentication, database, and storage services.

### Step 1: Get Supabase Credentials

1. **Go to Supabase Dashboard:**
   - Visit: [https://app.supabase.com](https://app.supabase.com)
   - Log in or create account

2. **Select or Create Project:**
   - Click **New Project**
   - Choose organization
   - Enter project name (e.g., `pdfsuit`)
   - Set database password (save this securely!)
   - Select region (closest to your users)
   - Click **Create new project**
   - Wait 2-3 minutes for provisioning

3. **Get Project URL:**
   - Go to **Settings** → **API**
   - Copy **Project URL**
   - Example: `https://abcdefghijklmnop.supabase.co`

4. **Get Anon Key:**
   - Same page (**Settings** → **API**)
   - Copy **anon public** key under "Project API keys"
   - This is safe to expose in client-side code

5. **Get Service Role Key:**
   - Same page
   - Copy **service_role** key
   - ⚠️ **IMPORTANT:** Keep this secret! Never expose in client code

### Step 2: Add to Environment File

Update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Code Integration Points

**Supabase Client (Browser-side):**
- File: `lib/supabase/client.ts`
- Uses: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Already configured, no changes needed

**Supabase Admin (Server-side):**
- File: `lib/supabase/admin.ts`
- Uses: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- Already configured, no changes needed

**Authentication Context:**
- File: `contexts/AuthContext.tsx`
- Uses client from `lib/supabase/client.ts`
- Automatically picks up environment variables

**Where Supabase is Used:**
- Authentication (login, signup, password reset)
- User profiles storage
- Payment history
- Credits management
- Tool usage tracking

### Step 4: Verify Supabase Connection

```bash
npm run dev
```

Visit `http://localhost:3000/login` and try to register. Check terminal for any Supabase connection errors.

---

## Razorpay Payment Gateway Configuration

Razorpay handles payment processing for premium subscriptions.

### Step 1: Get Razorpay Credentials

1. **Create Razorpay Account:**
   - Visit: [https://razorpay.com](https://razorpay.com)
   - Click **Sign Up**
   - Complete business verification

2. **Get API Keys:**
   - Log in to Razorpay Dashboard
   - Go to **Settings** → **API Keys**
   - Click **Generate Test Keys** (for development)
   - Or **Generate Live Keys** (for production)

3. **Copy Credentials:**
   - **Key ID:** `rzp_test_xxxxxxxxxxxxx` (test) or `rzp_live_xxxxxxxxxxxxx` (live)
   - **Key Secret:** `xxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Add to Environment File

Update `.env.local`:

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

**Important:**
- For development/testing: Use **test** keys
- For production: Use **live** keys
- Test mode uses test cards, no real money charged
- Live mode processes real payments

### Step 3: Code Integration Points

**Razorpay Script Loading:**
- File: `app/layout.tsx` (line 96)
- Loads Razorpay checkout script:
  ```tsx
  <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
  ```
- Already configured, no changes needed

**Payment Hook:**
- File: `hooks/usePayment.ts`
- Uses: `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- Handles payment popup and verification

**Pricing Page:**
- File: `app/pricing/page.tsx`
- Uses `usePayment` hook
- Displays pricing plans and handles checkout

**Payment Verification API:**
- File: `app/api/payment/verify/route.ts`
- Uses: `RAZORPAY_KEY_SECRET` (server-side)
- Verifies payment signatures
- Updates user credits in Supabase

**Where Razorpay is Used:**
- Pricing page payment buttons
- Subscription plan selection
- Payment verification
- Credits allocation after payment

### Step 4: Configure Razorpay Webhook (Production Only)

For production, set up webhooks to handle payment events:

1. Go to Razorpay Dashboard → **Settings** → **Webhooks**
2. Click **Create Webhook**
3. Enter URL: `https://yourdomain.com/api/payment/webhook`
4. Select events:
   - `payment.captured`
   - `payment.failed`
   - `subscription.charged`
5. Copy webhook secret
6. Add to `.env.local`:
   ```env
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   ```

### Step 5: Test Razorpay Integration

**Test Mode:**
1. Use test API keys
2. Use test card: `4111 1111 1111 1111`
3. Any future expiry date
4. Any CVV (e.g., 123)
5. Any name

**Testing Steps:**
```bash
npm run dev
```

1. Visit `http://localhost:3000/pricing`
2. Click **Choose Plan** on any plan
3. Login if not already
4. Payment popup should appear
5. Use test card details
6. Complete payment
7. Verify credits updated in dashboard

---

## Google AdSense Configuration

Google AdSense displays ads to generate revenue.

### Step 1: Get AdSense Account

1. **Apply for AdSense:**
   - Visit: [https://www.google.com/adsense](https://www.google.com/adsense)
   - Sign in with Google account
   - Submit application with your website URL
   - Wait for approval (can take days to weeks)

2. **Get Publisher ID:**
   - After approval, log in to AdSense
   - Go to **Account** → **Settings** → **Account information**
   - Copy your Publisher ID (format: `ca-pub-XXXXXXXXXXXXXXXX`)

### Step 2: Add to Environment File

Update `.env.local`:

```env
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
```

### Step 3: Code Integration Points

**AdSense Script:**
- File: `components/ads/GoogleAdsense.tsx`
- Loads AdSense script
- Uses: `NEXT_PUBLIC_ADSENSE_CLIENT_ID`

**Layout Integration:**
- File: `app/layout.tsx` (line 103)
- Includes `<GoogleAdsenseScript />` component
- Already configured

**Metadata Verification:**
- File: `app/layout.tsx` (line 50)
- Contains verification meta tag:
  ```tsx
  'google-adsense-account': 'ca-pub-9444956979294597'
  ```
- Update this with your AdSense ID

### Step 4: Update Metadata

In `app/layout.tsx`, find line 50 and update:

```tsx
verification: {
  google: "RrCb-PLA6vjZ82f2RxQ3_FFQPdcoujkSkbxIZqYRlFc",
  other: {
    'google-adsense-account': 'ca-pub-XXXXXXXXXXXXXXXX', // Your AdSense ID
  },
},
```

### Step 5: Place Ad Units (Optional)

To add ads to specific pages:

1. **Create Ad Units in AdSense:**
   - Go to **Ads** → **By site**
   - Click **New ad unit**
   - Choose ad type (Display, In-feed, etc.)
   - Copy ad unit code

2. **Add to Your Pages:**
   Create `components/ads/AdUnit.tsx`:
   ```tsx
   'use client';

   import { useEffect } from 'react';

   export function AdUnit({ slot }: { slot: string }) {
     useEffect(() => {
       try {
         (window as any).adsbygoogle = (window as any).adsbygoogle || [];
         (window as any).adsbygoogle.push({});
       } catch (err) {
         console.error('AdSense error:', err);
       }
     }, []);

     return (
       <ins
         className="adsbygoogle"
         style={{ display: 'block' }}
         data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
         data-ad-slot={slot}
         data-ad-format="auto"
         data-full-width-responsive="true"
       />
     );
   }
   ```

3. **Use in Pages:**
   ```tsx
   import { AdUnit } from '@/components/ads/AdUnit';

   export default function Page() {
     return (
       <div>
         <h1>Content</h1>
         <AdUnit slot="1234567890" />
       </div>
     );
   }
   ```

---

## Email Service Configuration (Optional)

For contact form and transactional emails.

### Option 1: SendGrid

1. **Get API Key:**
   - Visit: [https://sendgrid.com](https://sendgrid.com)
   - Sign up (free tier: 100 emails/day)
   - Go to **Settings** → **API Keys**
   - Create API key with **Full Access**
   - Copy key

2. **Add to Environment:**
   ```env
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   SENDGRID_TO_EMAIL=support@yourdomain.com
   ```

3. **Install Package:**
   ```bash
   npm install @sendgrid/mail
   ```

4. **Integration:**
   - See `CONTACT_PAGE_CONFIGURATION.md` for implementation details

### Option 2: Resend

1. **Get API Key:**
   - Visit: [https://resend.com](https://resend.com)
   - Sign up
   - Create API key

2. **Add to Environment:**
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
   RESEND_FROM_EMAIL=onboarding@resend.dev
   RESEND_TO_EMAIL=support@yourdomain.com
   ```

3. **Install Package:**
   ```bash
   npm install resend
   ```

---

## App URL Configuration

The app URL is used for redirects, OAuth callbacks, and absolute URLs.

### Development:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production:
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Code Integration Points

**Where APP_URL is Used:**
- OAuth callback URLs
- Email links (password reset, verification)
- Open Graph URLs for social sharing
- Canonical URLs for SEO

**Files Using APP_URL:**
- `hooks/useAuth.ts` - OAuth redirects
- `lib/utils/urls.ts` - URL generation
- Email templates
- Sitemap generation

---

## Code Integration Points

### Summary of All Integration Files

| File | Environment Variables Used | Purpose |
|------|---------------------------|---------|
| `lib/supabase/client.ts` | `NEXT_PUBLIC_SUPABASE_URL`<br/>`NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-side Supabase client |
| `lib/supabase/admin.ts` | `NEXT_PUBLIC_SUPABASE_URL`<br/>`SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase admin |
| `contexts/AuthContext.tsx` | Via `lib/supabase/client.ts` | Authentication state management |
| `hooks/usePayment.ts` | `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Payment processing |
| `app/api/payment/verify/route.ts` | `RAZORPAY_KEY_SECRET` | Payment verification |
| `components/ads/GoogleAdsense.tsx` | `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | AdSense integration |
| `app/layout.tsx` | Various | Root layout with scripts |
| `app/api/contact/route.ts` | `SENDGRID_API_KEY` or `RESEND_API_KEY` | Contact form emails |

### No Code Changes Required

All integration code is already implemented. You only need to:
1. Add correct environment variables to `.env.local`
2. Restart development server
3. Test functionality

---

## Verification and Testing

### Step 1: Verify Environment Variables Loaded

Create a test file: `app/api/test-env/route.ts`

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    supabase: {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    razorpay: {
      keyId: !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      secret: !!process.env.RAZORPAY_KEY_SECRET,
    },
    adsense: !!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  });
}
```

Visit: `http://localhost:3000/api/test-env`

Expected result: All values should be `true`, not `false`

**Delete this file after testing!**

### Step 2: Test Each Integration

**Supabase (Authentication):**
```bash
npm run dev
```
1. Visit `http://localhost:3000/register`
2. Create account
3. Check if user created in Supabase dashboard
4. Try login at `http://localhost:3000/login`

**Razorpay (Payments):**
1. Visit `http://localhost:3000/pricing`
2. Select a plan
3. Use test card: `4111 1111 1111 1111`
4. Verify credits updated

**AdSense (Ads):**
1. Visit any page
2. Open browser DevTools → Network tab
3. Check for `adsbygoogle` requests
4. Ads may not show in development (normal)

**Email (Contact Form):**
1. Visit `http://localhost:3000/contact`
2. Fill and submit form
3. Check your email inbox

### Step 3: Check Console for Errors

Open browser DevTools (F12) → Console tab

Look for:
- ❌ "Supabase URL not defined"
- ❌ "Razorpay key not found"
- ❌ "Environment variable undefined"

All should be ✅ green, no red errors.

---

## Security Best Practices

### 1. Never Commit `.env.local`

**Check `.gitignore`:**
```bash
cat .gitignore | grep env
```

Should contain:
```
.env
.env*.local
.env.local
```

### 2. Use Different Keys for Environments

| Environment | Keys |
|-------------|------|
| **Development** | Test keys (Razorpay test, Supabase dev project) |
| **Production** | Live keys (Razorpay live, Supabase production) |

### 3. Rotate Keys Regularly

- Change keys every 90 days
- Immediately rotate if exposed
- Use Supabase/Razorpay dashboard to regenerate

### 4. Validate Environment Variables

Add to `lib/utils/env.ts`:

```typescript
export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'NEXT_PUBLIC_APP_URL',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}
```

Call in `app/layout.tsx`:
```typescript
import { validateEnv } from '@/lib/utils/env';

validateEnv();
```

### 5. Use Environment-Specific Values

**Development (`.env.local`):**
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

**Production (Vercel/Netlify):**
```env
NEXT_PUBLIC_APP_URL=https://pdfsuit.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
```

---

## Troubleshooting

### Issue: Environment Variables Not Loading

**Solution:**
```bash
# Stop development server (Ctrl+C)
# Restart server
npm run dev
```

### Issue: "Supabase URL is undefined"

**Solution:**
1. Check `.env.local` exists in project root
2. Verify variable name is exact: `NEXT_PUBLIC_SUPABASE_URL`
3. No spaces around `=` sign
4. Restart server

### Issue: Razorpay Not Loading

**Solution:**
1. Check browser console for errors
2. Verify Razorpay script in `app/layout.tsx`
3. Clear browser cache
4. Check ad blockers aren't blocking Razorpay

### Issue: Payment Verification Failing

**Solution:**
1. Verify `RAZORPAY_KEY_SECRET` is correct
2. Check using same environment (test with test keys, live with live keys)
3. Verify webhook signature if using webhooks

### Issue: AdSense Not Showing

**Solution:**
1. AdSense often doesn't show in development
2. Verify account approved
3. Wait 24-48 hours after approval
4. Test on production domain
5. Check AdSense dashboard for issues

---

## Quick Reference

### Restart Development Server

After changing `.env.local`:
```bash
# Stop server: Ctrl+C
npm run dev
```

### View Current Environment (Debug)

Add to any page:
```tsx
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('App URL:', process.env.NEXT_PUBLIC_APP_URL);
```

### Check Environment in Production

On Vercel:
1. Go to **Settings** → **Environment Variables**
2. Verify all variables present

On Netlify:
1. Go to **Site settings** → **Environment variables**
2. Verify all variables present

---

## Deployment Environment Variables

When deploying to Vercel/Netlify, add these environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxxxx
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_TO_EMAIL=support@yourdomain.com
```

**Important:**
- Use **live** keys for production
- Update `NEXT_PUBLIC_APP_URL` to your production domain
- See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions

---

## Summary Checklist

Before starting development:

- [ ] `.env.local` file created
- [ ] Supabase project created
- [ ] Supabase URL and keys added
- [ ] Razorpay account created (test mode)
- [ ] Razorpay keys added
- [ ] App URL configured
- [ ] All environment variables tested
- [ ] Development server restarted
- [ ] Authentication tested
- [ ] Payment flow tested

Before deployment:

- [ ] All environment variables added to hosting platform
- [ ] Changed to live Razorpay keys
- [ ] Updated APP_URL to production domain
- [ ] Supabase redirect URLs updated
- [ ] Email service configured
- [ ] AdSense account approved and configured

---

## Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase Documentation](https://supabase.com/docs)
- [Razorpay Documentation](https://razorpay.com/docs/)
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Google AdSense Help](https://support.google.com/adsense)

---

**Need Help?** Check error messages in:
1. Browser console (F12)
2. Terminal where `npm run dev` is running
3. Supabase dashboard logs
4. Razorpay dashboard logs
