# PDFSuit - Complete Setup & Deployment Guide

## 🎯 Quick Start (You Are Here!)

Your Supabase and Razorpay credentials are already configured in `.env.local`. Now you need to set up the database.

## 📋 Step-by-Step Setup

### Step 1: Setup Supabase Database ⏳

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `orlbnvrbsjzcmvoutbbo`

2. **Run Database Schema**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"
   - Copy the entire contents of `lib/supabase/schema.sql`
   - Paste into the SQL editor
   - Click "Run" to execute

3. **Verify Tables Created**
   - Click "Table Editor" in the left sidebar
   - You should see 3 tables:
     - `profiles` - User profiles and credits
     - `usage_logs` - Tool usage tracking
     - `payments` - Payment records

4. **Enable Email Authentication**
   - Click "Authentication" → "Providers"
   - Ensure "Email" is enabled
   - Enable "Confirm email" if you want email verification

5. **Optional: Setup Google OAuth**
   - In "Authentication" → "Providers"
   - Enable "Google"
   - Add your Google Client ID and Secret
   - Update redirect URL: `http://localhost:3001/auth/callback`

### Step 2: Verify Environment Variables ✅

Your `.env.local` file is already configured:

```env
✅ NEXT_PUBLIC_SUPABASE_URL=https://orlbnvrbsjzcmvoutbbo.supabase.co
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi... (configured)
✅ SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... (configured)
✅ NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_Rc8hl7eyeA63pm
✅ RAZORPAY_KEY_SECRET=TxdCCtAxyDEsBnLyMciJme9T
✅ NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### Step 3: Test the Application

1. **Start Development Server** (if not already running)
   ```bash
   npm run dev
   ```

2. **Open in Browser**
   - Visit: http://localhost:3001
   - You should see the homepage

3. **Test Authentication**
   - Click "Get Started" or "Login"
   - Try signing up with an email
   - Check if you can login successfully

4. **Test a Tool**
   - After logging in, go to any tool (e.g., `/tools/merge-pdf`)
   - You should see:
     - Credits remaining at the top
     - File upload interface
     - No authentication errors

5. **Check Dashboard**
   - Visit: http://localhost:3001/dashboard
   - Should show:
     - Your plan (Free)
     - Credits remaining (10)
     - Credits used (0)

### Step 4: Test Payment Flow (Optional)

1. **Go to Pricing Page**
   - Visit: http://localhost:3001/pricing

2. **Try "Buy Now" on Pro Plan**
   - Click "Buy Now" on Pro plan (₹99)
   - Razorpay modal should appear
   - Use Razorpay test card:
     - Card: 4111 1111 1111 1111
     - CVV: Any 3 digits
     - Expiry: Any future date

3. **Verify Payment**
   - After successful payment
   - Check dashboard - plan should update to "Pro"
   - Credits should increase to 100

## 🗄️ Database Schema Summary

### Tables Created:

#### 1. `profiles` - User Profiles
- `id` - User ID (UUID, references auth.users)
- `email` - User email (unique)
- `full_name` - User's full name
- `plan_type` - 'free', 'pro', or 'enterprise'
- `credits_remaining` - Available credits (default: 10)
- `credits_used` - Total credits used (default: 0)
- `subscription_id` - Razorpay subscription ID
- `created_at` - Account creation date

#### 2. `usage_logs` - Tool Usage Tracking
- `id` - Log ID (UUID)
- `user_id` - References profiles(id)
- `tool_name` - Name of tool used
- `file_size` - Size of processed file
- `processing_time` - Time taken (milliseconds)
- `success` - Whether processing succeeded
- `created_at` - Timestamp

#### 3. `payments` - Payment Records
- `id` - Payment ID (UUID)
- `user_id` - References profiles(id)
- `razorpay_order_id` - Razorpay order ID
- `razorpay_payment_id` - Razorpay payment ID
- `amount` - Payment amount (in paise)
- `status` - 'created', 'authorized', 'captured', 'failed'
- `plan_type` - Plan purchased
- `credits_purchased` - Number of credits added

### Automatic Triggers:

1. **Profile Creation**
   - When user signs up → Profile automatically created
   - Default plan: 'free'
   - Default credits: 10

2. **Timestamp Updates**
   - `updated_at` automatically updated on changes

### Security (RLS):

- ✅ Row Level Security enabled on all tables
- ✅ Users can only view/update their own data
- ✅ Service role can access all data

## 🧪 Testing Checklist

### Authentication Tests:
- [ ] Sign up with new email
- [ ] Verify email (if enabled)
- [ ] Login with email
- [ ] Logout
- [ ] Login with Google (if configured)

### Tool Access Tests:
- [ ] Visit tool while logged out → Redirected to login
- [ ] Login → Return to tool page
- [ ] See credits displayed at top
- [ ] Upload file within size limit → Success
- [ ] Upload file exceeding limit → Error shown
- [ ] Process file → Credit deducted

### Dashboard Tests:
- [ ] View current plan
- [ ] View credits remaining
- [ ] View credits used
- [ ] Quick actions work
- [ ] Sign out button works

### Payment Tests (Test Mode):
- [ ] Click "Buy Now" on pricing page
- [ ] Razorpay modal opens
- [ ] Complete payment with test card
- [ ] Redirected to dashboard
- [ ] Plan updated to Pro
- [ ] Credits increased to 100

## 🚀 Deployment to Vercel

### Step 1: Prepare for Production

1. **Update Environment Variables for Production**
   - In Vercel dashboard, add the same env vars
   - Change `NEXT_PUBLIC_APP_URL` to your domain
   - Keep Razorpay test keys for now, or use live keys

2. **Build Locally (Optional)**
   ```bash
   npm run build
   ```

### Step 2: Deploy to Vercel

1. **Install Vercel CLI** (if not installed)
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow prompts
   - Link to existing project or create new
   - Deploy!

4. **Add Environment Variables in Vercel**
   - Go to Vercel Dashboard
   - Select your project
   - Settings → Environment Variables
   - Add all variables from `.env.local`
   - Redeploy

### Step 3: Update Supabase URLs

1. **Update Redirect URLs**
   - In Supabase Dashboard
   - Authentication → URL Configuration
   - Add your Vercel domain to allowed URLs
   - Example: `https://your-app.vercel.app/auth/callback`

2. **Update Site URL**
   - Set site URL to your Vercel domain
   - Example: `https://your-app.vercel.app`

## 🔧 Troubleshooting

### Issue: "supabaseUrl is required" Error
**Solution**:
- Check `.env.local` file exists
- Verify all environment variables are set
- Restart dev server: Stop and run `npm run dev` again

### Issue: Login/Signup Not Working
**Solution**:
- Check Supabase database schema is created
- Verify email provider is enabled in Supabase
- Check browser console for errors
- Verify Supabase URL and keys are correct

### Issue: Tools Show "No Profile" Error
**Solution**:
- Ensure you're logged in
- Check if profile was created in database
- Run this SQL in Supabase to manually create profile:
  ```sql
  SELECT * FROM auth.users; -- Get your user ID
  INSERT INTO profiles (id, email) VALUES ('your-user-id', 'your-email');
  ```

### Issue: Credits Not Deducting
**Solution**:
- Check `usage_logs` table permissions
- Verify service role key is set
- Check browser console for errors

### Issue: Payment Not Working
**Solution**:
- Verify Razorpay keys are correct
- Test with Razorpay test card: 4111 1111 1111 1111
- Check Razorpay dashboard for payment status
- Verify webhook URL (if using webhooks)

## 📊 Monitoring & Analytics

### Check Usage in Supabase:

1. **View All Users**
   ```sql
   SELECT * FROM profiles ORDER BY created_at DESC;
   ```

2. **View Usage Logs**
   ```sql
   SELECT * FROM usage_logs ORDER BY created_at DESC LIMIT 50;
   ```

3. **View Payments**
   ```sql
   SELECT * FROM payments ORDER BY created_at DESC;
   ```

4. **User Stats**
   ```sql
   SELECT
     plan_type,
     COUNT(*) as users,
     SUM(credits_used) as total_credits_used
   FROM profiles
   GROUP BY plan_type;
   ```

## 🎯 Next Steps

### Immediate (Required):
1. ✅ Environment variables configured
2. ⏳ **Run database schema in Supabase** (NEXT STEP!)
3. ⏳ Test authentication flow
4. ⏳ Test one tool end-to-end

### Soon (Recommended):
5. Setup custom domain
6. Switch Razorpay to live mode
7. Add email templates in Supabase
8. Setup error tracking (Sentry)
9. Add analytics (Google Analytics/Plausible)

### Later (Optional):
10. Add more payment gateways
11. Implement API access
12. Add team accounts
13. Create mobile app

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Razorpay Docs**: https://razorpay.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs

## ✅ Current Status

- ✅ All 24 tools implemented (including PDF Bruteforce with legal warnings)
- ✅ Authentication system complete with session handling
- ✅ Dashboard integrated with usage tracking
- ✅ Protected routes with authentication middleware
- ✅ Performance optimizations (webpack code splitting)
- ✅ Environment variables configured
- ⏳ Database schema needs to be run
- ⏳ Ready for testing
- ⏳ Ready for deployment

**NEXT ACTION**: Run the database schema in Supabase SQL Editor!

## 🆕 Recent Updates

### Performance Improvements
- ✅ Webpack code splitting for PDF libraries
- ✅ Lazy loading with optimized chunks
- ✅ PageLoader component for instant feedback
- ✅ Homepage loads instantly, tools load in <1s

### Authentication Fixes
- ✅ Fixed login redirect loop
- ✅ Dashboard properly integrated at /dashboard
- ✅ Session-based authentication with debug info
- ✅ Auto-redirect after signup/login

### New Features
- ✅ PDF Bruteforce tool with legal warning modal
- ✅ Usage tracking with automatic credit deduction
- ✅ Plan-based file size limits (10MB/50MB/200MB)
- ✅ Recent activity shown in dashboard

---

**Need Help?** Check the troubleshooting section above or review the error messages in the browser console.
