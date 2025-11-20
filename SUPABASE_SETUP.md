# Supabase Setup and Configuration Guide

This comprehensive guide covers setting up Supabase as your backend database, authentication system, and configuring all necessary tables, policies, and integrations.

---

## Table of Contents

1. [What is Supabase?](#what-is-supabase)
2. [Creating Supabase Project](#creating-supabase-project)
3. [Database Schema Setup](#database-schema-setup)
4. [Row Level Security (RLS) Configuration](#row-level-security-rls-configuration)
5. [Authentication Configuration](#authentication-configuration)
6. [Storage Bucket Setup (Optional)](#storage-bucket-setup-optional)
7. [Environment Integration](#environment-integration)
8. [Testing Database Connection](#testing-database-connection)
9. [Database Migrations](#database-migrations)
10. [Troubleshooting](#troubleshooting)

---

## What is Supabase?

Supabase is an open-source Firebase alternative that provides:
- **PostgreSQL Database:** Powerful relational database
- **Authentication:** Email, OAuth, magic links
- **Real-time subscriptions:** Live data updates
- **Storage:** File storage with CDN
- **Auto-generated APIs:** RESTful and GraphQL APIs

Your PDFSuit application uses Supabase for:
- User authentication (login, signup, password reset)
- User profiles and subscription plans
- Credits management
- Payment history tracking
- Tool usage analytics

---

## Creating Supabase Project

### Step 1: Sign Up for Supabase

1. Visit [https://supabase.com](https://supabase.com)
2. Click **Start your project**
3. Sign up with:
   - GitHub (recommended)
   - Or email/password
4. Verify your email if using email signup

### Step 2: Create Organization

1. After login, you'll see the dashboard
2. Click **New organization**
3. Enter organization name (e.g., "PDFSuit" or "My Company")
4. Select plan:
   - **Free:** $0/month (Good for development/testing)
   - **Pro:** $25/month (Production with more resources)
   - **Team:** $599/month (For teams)
5. Click **Create organization**

### Step 3: Create New Project

1. Click **New project** button
2. Fill in project details:
   - **Name:** `pdfsuit-production` (or any name)
   - **Database Password:** Generate strong password
     - Click 🔄 to generate random password
     - **⚠️ SAVE THIS PASSWORD SECURELY!**
     - You'll need it for direct database access
   - **Region:** Select closest to your target users
     - North America: `us-east-1` or `us-west-1`
     - Europe: `eu-west-1` or `eu-central-1`
     - Asia Pacific: `ap-southeast-1` or `ap-northeast-1`
   - **Pricing Plan:** Free (for now)
3. Click **Create new project**
4. Wait 2-3 minutes while Supabase provisions your database

### Step 4: Get Project Credentials

Once project is created:

1. Go to **Settings** (⚙️ icon in sidebar)
2. Click **API** in the Settings menu
3. Copy the following values:

   **Project URL:**
   ```
   https://xxxxxxxxxxxxxx.supabase.co
   ```

   **Anon (public) key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
   ```

   **Service Role (secret) key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
   ```

4. Save these in a secure location (you'll add them to `.env.local` later)

---

## Database Schema Setup

Your PDFSuit application requires two main tables: `profiles` and `payment_history`.

### Step 1: Access SQL Editor

1. In Supabase Dashboard, click **SQL Editor** in the sidebar
2. Click **+ New query**

### Step 2: Create Profiles Table

Copy and paste this SQL query:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'premium', 'pro')),
  credits INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_plan_idx ON public.profiles(plan);

-- Add comment for documentation
COMMENT ON TABLE public.profiles IS 'User profiles with subscription plans and credits';
COMMENT ON COLUMN public.profiles.credits IS 'Number of available credits for PDF processing';
COMMENT ON COLUMN public.profiles.plan IS 'Subscription plan: free, basic, premium, or pro';
```

Click **Run** or press `Ctrl+Enter` to execute.

**Expected Result:** "Success. No rows returned"

### Step 3: Create Payment History Table

Create a new query and paste:

```sql
-- Create payment_history table
CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR' NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT DEFAULT 'razorpay',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_signature TEXT,
  plan TEXT NOT NULL CHECK (plan IN ('basic', 'premium', 'pro')),
  credits_added INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS payment_history_user_id_idx ON public.payment_history(user_id);
CREATE INDEX IF NOT EXISTS payment_history_status_idx ON public.payment_history(status);
CREATE INDEX IF NOT EXISTS payment_history_razorpay_payment_id_idx ON public.payment_history(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS payment_history_created_at_idx ON public.payment_history(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE public.payment_history IS 'Payment transaction history for all users';
COMMENT ON COLUMN public.payment_history.amount IS 'Payment amount in smallest currency unit (paise for INR)';
COMMENT ON COLUMN public.payment_history.status IS 'Payment status: pending, completed, failed, or refunded';
```

Click **Run** to execute.

### Step 4: Create Tool Usage Analytics Table (Optional)

For tracking which tools users use:

```sql
-- Create tool_usage table (optional but recommended)
CREATE TABLE IF NOT EXISTS public.tool_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  tool_name TEXT NOT NULL,
  file_size INTEGER,
  processing_time INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS tool_usage_user_id_idx ON public.tool_usage(user_id);
CREATE INDEX IF NOT EXISTS tool_usage_tool_name_idx ON public.tool_usage(tool_name);
CREATE INDEX IF NOT EXISTS tool_usage_created_at_idx ON public.tool_usage(created_at DESC);

COMMENT ON TABLE public.tool_usage IS 'Analytics for tool usage across the platform';
```

Click **Run** to execute.

### Step 5: Create Database Functions

Create helper functions for common operations:

```sql
-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, plan, credits)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'free',
    50
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_payment_history_updated_at ON public.payment_history;
CREATE TRIGGER handle_payment_history_updated_at
  BEFORE UPDATE ON public.payment_history
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON FUNCTION public.handle_new_user IS 'Automatically creates profile when user signs up';
COMMENT ON FUNCTION public.handle_updated_at IS 'Updates the updated_at timestamp on row modifications';
```

Click **Run** to execute.

---

## Row Level Security (RLS) Configuration

Row Level Security ensures users can only access their own data.

### Step 1: Enable RLS on Tables

```sql
-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_usage ENABLE ROW LEVEL SECURITY;
```

### Step 2: Create RLS Policies for Profiles Table

```sql
-- Profiles: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Profiles: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Profiles: Users can insert their own profile (handled by trigger usually)
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Profiles: Service role has full access (for server-side operations)
CREATE POLICY "Service role has full access to profiles"
  ON public.profiles
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
```

### Step 3: Create RLS Policies for Payment History Table

```sql
-- Payment History: Users can read their own payment history
CREATE POLICY "Users can view own payment history"
  ON public.payment_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Payment History: Service role can insert/update payments
CREATE POLICY "Service role can manage payment history"
  ON public.payment_history
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Payment History: Users cannot modify payment history
-- (Only SELECT policy for users, no INSERT/UPDATE/DELETE)
```

### Step 4: Create RLS Policies for Tool Usage Table

```sql
-- Tool Usage: Users can view their own usage
CREATE POLICY "Users can view own tool usage"
  ON public.tool_usage
  FOR SELECT
  USING (auth.uid() = user_id);

-- Tool Usage: Authenticated users can insert their own usage
CREATE POLICY "Users can insert own tool usage"
  ON public.tool_usage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Tool Usage: Service role has full access
CREATE POLICY "Service role has full access to tool usage"
  ON public.tool_usage
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
```

Click **Run** after each policy block.

### Step 5: Verify RLS Policies

Check if policies are created:

```sql
-- List all policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

You should see policies for `profiles`, `payment_history`, and `tool_usage` tables.

---

## Authentication Configuration

### Step 1: Configure Email Authentication

1. Go to **Authentication** → **Providers** in Supabase Dashboard
2. **Email provider** should be enabled by default
3. Configure settings:
   - **Enable email confirmations:** ON (users verify email)
   - **Enable email change confirmations:** ON
   - **Secure email change:** ON

### Step 2: Configure Email Templates (Optional)

Customize emails sent to users:

1. Go to **Authentication** → **Email Templates**
2. Customize templates for:
   - **Confirm signup:** Email verification
   - **Invite user:** User invitations
   - **Magic link:** Passwordless login
   - **Change email address:** Email change confirmation
   - **Reset password:** Password reset

**Example Confirm Signup Template:**

Subject: `Confirm Your PDFSuit Account`

Body:
```html
<h2>Welcome to PDFSuit!</h2>
<p>Thanks for signing up. Please confirm your email address by clicking the link below:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email Address</a></p>
<p>If you didn't create an account, you can safely ignore this email.</p>
```

### Step 3: Configure URL Configuration

1. Go to **Authentication** → **URL Configuration**
2. Set the following URLs:

   **Site URL:**
   ```
   http://localhost:3000
   ```
   *(Change to production URL when deploying)*

   **Redirect URLs:** (Add both)
   ```
   http://localhost:3000/**
   http://localhost:3000/auth/callback
   ```
   *(Add production URLs when deploying)*

### Step 4: Configure Auth Settings

1. Go to **Authentication** → **Settings**
2. Configure:
   - **JWT expiry:** 3600 (1 hour)
   - **Refresh token rotation:** Enabled
   - **Reuse interval:** 10 seconds
   - **Auto confirm new users:** OFF (require email verification)
   - **Minimum password length:** 8 characters

### Step 5: Configure OAuth Providers (Optional)

If you want social login (Google, GitHub, etc.):

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project and enable Google+ API
3. Create OAuth credentials
4. Add to Supabase: **Authentication** → **Providers** → **Google**
5. Enter Client ID and Client Secret
6. Add callback URL: `https://[your-project-ref].supabase.co/auth/v1/callback`

---

## Storage Bucket Setup (Optional)

If you want to store user-uploaded PDFs or processed files:

### Step 1: Create Storage Bucket

1. Go to **Storage** in Supabase Dashboard
2. Click **Create a new bucket**
3. Enter bucket name: `pdf-files`
4. Make it **Private** (not public)
5. Click **Create bucket**

### Step 2: Configure Storage Policies

1. Click on the `pdf-files` bucket
2. Go to **Policies** tab
3. Add policies:

```sql
-- Users can upload their own files
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pdf-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can read their own files
CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'pdf-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'pdf-files' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Step 3: Set File Size Limits

1. Go to **Storage Settings**
2. Set **Max file size:** 50 MB (adjust as needed)
3. **Allowed MIME types:** `application/pdf`

---

## Environment Integration

### Step 1: Add Credentials to .env.local

Open your `.env.local` file and update:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace with your actual values from **Settings** → **API**.

### Step 2: Verify Supabase Client Configuration

Check that `lib/supabase/client.ts` is properly configured:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Step 3: Verify Supabase Admin Configuration

Check that `lib/supabase/admin.ts` is properly configured:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
```

### Step 4: Restart Development Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## Testing Database Connection

### Test 1: Database Connection

Create test file: `app/api/test-db/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) throw error;

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
```

Visit: `http://localhost:3000/api/test-db`

Expected: `{"status":"success","message":"Database connection successful"}`

**Delete this test file after verification!**

### Test 2: User Registration

1. Start dev server: `npm run dev`
2. Go to `http://localhost:3000/register`
3. Fill registration form:
   - Full Name: Test User
   - Email: test@example.com
   - Password: TestPass123!
4. Click **Sign Up**
5. Check Supabase Dashboard:
   - Go to **Authentication** → **Users**
   - Verify user appears in list
   - Go to **Table Editor** → **profiles**
   - Verify profile created with 50 credits

### Test 3: User Login

1. Go to `http://localhost:3000/login`
2. Login with test credentials
3. Verify redirected to dashboard
4. Check browser console (F12) for errors
5. Verify authentication state in **Application** tab → **Local Storage**

### Test 4: Credits Management

1. Login to your app
2. Open browser console and run:
   ```javascript
   // Check current credits
   fetch('/api/credits/check')
     .then(r => r.json())
     .then(console.log);
   ```
3. Expected response:
   ```json
   {"credits": 50, "plan": "free"}
   ```

---

## Database Migrations

For future schema changes, use migrations:

### Step 1: Enable Database Migrations

Supabase CLI allows version-controlled migrations.

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Initialize Supabase in Project:**
   ```bash
   supabase init
   ```

4. **Link to Your Project:**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   (Find project ref in Supabase Dashboard URL)

### Step 2: Create Migration

```bash
supabase migration new add_new_column
```

This creates: `supabase/migrations/TIMESTAMP_add_new_column.sql`

Edit the file:
```sql
-- Add new column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

### Step 3: Apply Migration

**To local database:**
```bash
supabase db reset
```

**To production:**
```bash
supabase db push
```

### Step 4: Generate TypeScript Types

```bash
supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
```

This creates TypeScript types for all your database tables.

---

## Troubleshooting

### Issue: "relation 'public.profiles' does not exist"

**Solution:**
1. Go to Supabase Dashboard → **SQL Editor**
2. Re-run the CREATE TABLE queries from [Database Schema Setup](#database-schema-setup)
3. Verify tables exist in **Table Editor**

### Issue: "permission denied for table profiles"

**Solution:**
1. Check RLS policies are created
2. Verify user is authenticated
3. Check policies with:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

### Issue: "JWT expired" or "Invalid token"

**Solution:**
1. Clear browser local storage
2. Logout and login again
3. Check JWT expiry settings in **Authentication** → **Settings**

### Issue: New user not appearing in profiles table

**Solution:**
1. Check trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
2. Re-create trigger from [Database Functions](#step-5-create-database-functions)
3. Check function logs in Supabase Dashboard

### Issue: Cannot connect to Supabase

**Solution:**
1. Verify environment variables in `.env.local`
2. Check Supabase project is active (not paused)
3. Verify network connection
4. Check Supabase status: [status.supabase.com](https://status.supabase.com)

### Issue: Email verification not working

**Solution:**
1. Check email provider settings in **Authentication** → **Providers**
2. Verify SMTP settings if using custom SMTP
3. Check spam folder
4. For testing, disable email confirmation temporarily

---

## Production Checklist

Before going live:

- [ ] All tables created with proper structure
- [ ] RLS policies enabled and tested
- [ ] Database indexes created for performance
- [ ] Triggers and functions working correctly
- [ ] Authentication providers configured
- [ ] Email templates customized
- [ ] URL configurations updated with production URLs
- [ ] Environment variables added to hosting platform
- [ ] Database backup enabled (automatic on Supabase)
- [ ] Test user registration and login flow
- [ ] Test payment processing and credit updates
- [ ] Monitor database usage in Supabase Dashboard

---

## Database Maintenance

### Regular Tasks

**Daily:**
- Monitor database usage in Supabase Dashboard
- Check for failed payments in `payment_history`

**Weekly:**
- Review user signups and activity
- Check for errors in tool usage analytics
- Monitor database performance

**Monthly:**
- Backup database (automatic on Supabase, but verify)
- Review and optimize slow queries
- Clean up old test data

### Optimize Queries

Find slow queries:
```sql
-- Find slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Vacuum Database (Maintenance)

```sql
-- Vacuum all tables to reclaim space
VACUUM ANALYZE public.profiles;
VACUUM ANALYZE public.payment_history;
VACUUM ANALYZE public.tool_usage;
```

---

## Security Best Practices

1. **Never expose Service Role Key**
   - Only use on server-side
   - Never commit to Git
   - Rotate if exposed

2. **Always use RLS**
   - Enable on all tables
   - Test policies thoroughly
   - Use service role for admin operations

3. **Validate input**
   - Use database constraints
   - Validate in application code
   - Sanitize user input

4. **Monitor access logs**
   - Check **Logs** in Supabase Dashboard
   - Set up alerts for suspicious activity
   - Review failed authentication attempts

5. **Regular backups**
   - Automatic on Supabase
   - Test restore process
   - Keep local backups for critical data

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Database Design Best Practices](https://supabase.com/docs/guides/database/design)

---

## Schema Diagram

```
┌─────────────────────────────────────────────────┐
│                   auth.users                    │
│  (Built-in Supabase authentication table)       │
│  - id (UUID, PK)                                │
│  - email                                        │
│  - encrypted_password                           │
│  - email_confirmed_at                           │
└─────────────────────────────────────────────────┘
                       │
                       │ (ON DELETE CASCADE)
                       ▼
┌─────────────────────────────────────────────────┐
│               public.profiles                   │
│  - id (UUID, PK, FK to auth.users)              │
│  - email (TEXT, UNIQUE, NOT NULL)               │
│  - full_name (TEXT)                             │
│  - plan (TEXT: free/basic/premium/pro)          │
│  - credits (INTEGER, DEFAULT 50)                │
│  - created_at (TIMESTAMPTZ)                     │
│  - updated_at (TIMESTAMPTZ)                     │
└─────────────────────────────────────────────────┘
                       │
                       │ (ON DELETE CASCADE)
                       ▼
┌─────────────────────────────────────────────────┐
│           public.payment_history                │
│  - id (UUID, PK)                                │
│  - user_id (UUID, FK to profiles)               │
│  - amount (INTEGER, NOT NULL)                   │
│  - currency (TEXT, DEFAULT 'INR')               │
│  - status (TEXT: pending/completed/failed)      │
│  - payment_method (TEXT, DEFAULT 'razorpay')    │
│  - razorpay_order_id (TEXT)                     │
│  - razorpay_payment_id (TEXT, UNIQUE)           │
│  - razorpay_signature (TEXT)                    │
│  - plan (TEXT: basic/premium/pro)               │
│  - credits_added (INTEGER, DEFAULT 0)           │
│  - created_at (TIMESTAMPTZ)                     │
│  - updated_at (TIMESTAMPTZ)                     │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│             public.tool_usage                   │
│  - id (UUID, PK)                                │
│  - user_id (UUID, FK to profiles)               │
│  - tool_name (TEXT, NOT NULL)                   │
│  - file_size (INTEGER)                          │
│  - processing_time (INTEGER)                    │
│  - success (BOOLEAN, DEFAULT true)              │
│  - error_message (TEXT)                         │
│  - created_at (TIMESTAMPTZ)                     │
└─────────────────────────────────────────────────┘
```

---

**Congratulations!** Your Supabase database is now fully configured and ready to power your PDFSuit application! 🎉
