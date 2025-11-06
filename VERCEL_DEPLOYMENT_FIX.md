# Vercel Deployment Fix - Environment Variables

## Issue

The build is failing on Vercel with:
```
Error: Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.
```

This happens because the environment variables from `.env.local` are not available in the Vercel build environment.

## Solution: Add Environment Variables to Vercel

### Step 1: Go to Vercel Project Settings

1. Open your Vercel dashboard: https://vercel.com/dashboard
2. Click on your project (PDF-Suite or pdfsuit)
3. Click on "Settings" tab
4. Click on "Environment Variables" in the left sidebar

### Step 2: Add All Environment Variables

Add the following environment variables **exactly as they appear in your `.env.local` file**:

#### 1. NEXT_PUBLIC_SUPABASE_URL
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://orlbnvrbsjzcmvoutbbo.supabase.co`
- **Environment**: Production, Preview, Development (check all three)

#### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: Copy the full key from your `.env.local` file (starts with `eyJhbGci...`)
- **Environment**: Production, Preview, Development (check all three)

#### 3. SUPABASE_SERVICE_ROLE_KEY
- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: Copy the full key from your `.env.local` file (starts with `eyJhbGci...`)
- **Environment**: Production, Preview, Development (check all three)

#### 4. NEXT_PUBLIC_RAZORPAY_KEY_ID
- **Key**: `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- **Value**: `rzp_test_Rc8hl7eyeA63pm`
- **Environment**: Production, Preview, Development (check all three)

#### 5. RAZORPAY_KEY_SECRET
- **Key**: `RAZORPAY_KEY_SECRET`
- **Value**: Copy the secret from your `.env.local` file
- **Environment**: Production, Preview, Development (check all three)

#### 6. NEXT_PUBLIC_APP_URL
- **Key**: `NEXT_PUBLIC_APP_URL`
- **Value**: `https://YOUR-PROJECT-NAME.vercel.app` (use your actual Vercel URL)
- **Environment**: Production, Preview, Development (check all three)

### Step 3: Redeploy

After adding all environment variables:

1. Go to the "Deployments" tab
2. Click on the latest deployment (the failed one)
3. Click the three dots menu (⋮) in the top right
4. Click "Redeploy"
5. Confirm the redeployment

OR simply push a new commit to GitHub:
```bash
git add .
git commit -m "Fix: Add TypeScript fixes for production build"
git push
```

Vercel will automatically redeploy with the new environment variables.

## Expected Result

After redeployment with environment variables:
- ✅ Build should complete successfully
- ✅ All pages should render without errors
- ✅ Authentication should work
- ✅ Database connection should work
- ✅ All 24 tools should be accessible

## Troubleshooting

### If Build Still Fails

1. **Double-check environment variable names** - They must match exactly (case-sensitive)
2. **Verify values are complete** - No extra spaces or missing characters
3. **Make sure all three environments are checked** - Production, Preview, Development
4. **Check deployment logs** - Look for specific error messages

### If Authentication Doesn't Work After Deployment

1. **Update Supabase Redirect URLs**:
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your Vercel URL: `https://YOUR-PROJECT-NAME.vercel.app/auth/callback`
   - Add site URL: `https://YOUR-PROJECT-NAME.vercel.app`

2. **Update NEXT_PUBLIC_APP_URL**:
   - Make sure it matches your actual Vercel deployment URL
   - Update in Vercel environment variables
   - Redeploy

## Quick Reference: Your Environment Variables

Copy these values from your local `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://orlbnvrbsjzcmvoutbbo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[get from .env.local]
SUPABASE_SERVICE_ROLE_KEY=[get from .env.local]
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_Rc8hl7eyeA63pm
RAZORPAY_KEY_SECRET=[get from .env.local]
NEXT_PUBLIC_APP_URL=https://YOUR-PROJECT-NAME.vercel.app
```

## Alternative: Deploy Using Vercel CLI

If you prefer to deploy from command line:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste value when prompted, select all environments

# Repeat for all other variables

# Deploy
vercel --prod
```

---

**Note**: The TypeScript errors have been fixed:
- ✅ Added `created_at` to UserProfile interface
- ✅ Added null check for PDF bruteforce file
- ✅ Added `downlevelIteration` to tsconfig.json
- ✅ Added explicit type for passwordArray

The build will succeed once environment variables are configured in Vercel.
