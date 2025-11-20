# Deployment Guide

This comprehensive guide covers deploying your PDFSuit application to Vercel or Netlify.

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Deploy to Vercel](#deploy-to-vercel)
3. [Deploy to Netlify](#deploy-to-netlify)
4. [Post-Deployment Configuration](#post-deployment-configuration)
5. [Custom Domain Setup](#custom-domain-setup)
6. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] All environment variables ready (Supabase, Razorpay keys)
- [ ] GitHub repository with latest code pushed
- [ ] Tested application locally (`npm run dev`)
- [ ] Built application successfully (`npm run build`)
- [ ] Contact information updated in contact page
- [ ] Supabase database set up with tables and RLS policies
- [ ] Domain name ready (if using custom domain)

---

## Deploy to Vercel

Vercel is the recommended platform for Next.js applications (created by Next.js team).

### Step 1: Create Vercel Account

1. Go to [https://vercel.com](https://vercel.com)
2. Click **Sign Up**
3. Sign up with GitHub (recommended for easier integration)
4. Authorize Vercel to access your GitHub repositories

### Step 2: Import Your Project

1. From Vercel Dashboard, click **Add New** → **Project**
2. Find your repository in the list
   - If not visible, click **Adjust GitHub App Permissions**
   - Grant access to your repository
3. Click **Import** on your PDF-Suite repository

### Step 3: Configure Project Settings

1. **Project Name:**
   - Enter your project name (e.g., `pdfsuit`)
   - This will be your default URL: `your-project-name.vercel.app`

2. **Framework Preset:**
   - Should auto-detect as **Next.js**
   - If not, select it manually

3. **Root Directory:**
   - Leave as `./` (root)

4. **Build and Output Settings:**
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

### Step 4: Add Environment Variables

Click **Environment Variables** section and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

**Important Notes:**
- Add each variable separately
- Ensure no extra spaces before/after values
- `NEXT_PUBLIC_APP_URL` should be your Vercel URL (you'll update this after deployment)
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Keep `SUPABASE_SERVICE_ROLE_KEY` and `RAZORPAY_KEY_SECRET` secret

### Step 5: Deploy

1. Click **Deploy** button
2. Wait for deployment to complete (usually 2-3 minutes)
3. You'll see a success screen with your live URL

### Step 6: Update Environment Variables

1. After first deployment, note your Vercel URL (e.g., `https://pdfsuit.vercel.app`)
2. Go to **Project Settings** → **Environment Variables**
3. Find `NEXT_PUBLIC_APP_URL` and click **Edit**
4. Update to your actual Vercel URL
5. Click **Save**
6. Redeploy: Go to **Deployments** → Click **...** on latest → **Redeploy**

### Step 7: Configure Vercel Project Settings

1. **Build Settings:**
   - Go to **Settings** → **General**
   - Ensure **Node.js Version** is set to `18.x` or higher

2. **Domain Settings:**
   - Go to **Settings** → **Domains**
   - Your default domain is listed (e.g., `your-project.vercel.app`)
   - Add custom domain if you have one (see [Custom Domain Setup](#custom-domain-setup))

### Step 8: Update Supabase Redirect URLs

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Add your Vercel URL to **Redirect URLs:**
   ```
   https://your-project.vercel.app/auth/callback
   https://your-project.vercel.app/**
   ```
5. Update **Site URL** to: `https://your-project.vercel.app`
6. Click **Save**

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:

- **Production Branch:** Pushes to `main` branch → Production deployment
- **Preview Deployments:** Pushes to other branches → Preview URLs
- **Pull Requests:** Each PR gets a unique preview URL

---

## Deploy to Netlify

Netlify is an alternative platform that also supports Next.js well.

### Step 1: Create Netlify Account

1. Go to [https://www.netlify.com](https://www.netlify.com)
2. Click **Sign Up**
3. Sign up with GitHub (recommended)
4. Authorize Netlify to access your repositories

### Step 2: Create New Site

1. Click **Add new site** → **Import an existing project**
2. Choose **Deploy with GitHub**
3. Authorize Netlify (if not already done)
4. Select your PDF-Suite repository

### Step 3: Configure Build Settings

1. **Branch to deploy:** `main`

2. **Build command:**
   ```bash
   npm run build
   ```

3. **Publish directory:**
   ```
   .next
   ```

4. **Functions directory:** (leave empty)

### Step 4: Add Environment Variables

Click **Show advanced** → **New variable** and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
```

### Step 5: Deploy

1. Click **Deploy site**
2. Wait for deployment (2-5 minutes)
3. Site will be live at: `random-name-123456.netlify.app`

### Step 6: Customize Site Name

1. Go to **Site settings** → **General** → **Site details**
2. Click **Change site name**
3. Enter your preferred name (e.g., `pdfsuit`)
4. Your new URL: `https://pdfsuit.netlify.app`

### Step 7: Update Environment Variables

1. Go to **Site settings** → **Environment variables**
2. Edit `NEXT_PUBLIC_APP_URL` to your actual Netlify URL
3. Click **Save**
4. Trigger redeploy: **Deploys** → **Trigger deploy** → **Deploy site**

### Step 8: Configure Netlify.toml (Optional but Recommended)

Create `netlify.toml` in your project root:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NPM_FLAGS = "--legacy-peer-deps"

[[redirects]]
  from = "/*"
  to = "/404"
  status = 404

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

Commit and push this file to enable automatic Next.js optimization.

### Step 9: Update Supabase Redirect URLs

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Add Netlify URL to **Redirect URLs:**
   ```
   https://your-site.netlify.app/auth/callback
   https://your-site.netlify.app/**
   ```
5. Update **Site URL** to: `https://your-site.netlify.app`
6. Click **Save**

### Automatic Deployments

Netlify automatically deploys:

- **Production:** Pushes to `main` → Production deployment
- **Branch Deploys:** Other branches can be enabled in settings
- **Deploy Previews:** Pull requests get preview URLs

---

## Post-Deployment Configuration

### 1. Test Core Functionality

Visit your deployed site and test:

- [ ] Homepage loads correctly
- [ ] All PDF tools are accessible
- [ ] User registration/login works
- [ ] Payment integration functions
- [ ] File uploads work
- [ ] PDF processing completes successfully
- [ ] Contact form sends emails

### 2. Set Up Error Monitoring

#### Using Vercel (Built-in)

Vercel provides runtime logs:
1. Go to **Deployment** → Select deployment → **Functions** tab
2. View real-time logs and errors

#### Using Sentry (Advanced)

1. Sign up at [https://sentry.io](https://sentry.io)
2. Create a new project for Next.js
3. Install Sentry:
   ```bash
   npm install @sentry/nextjs
   ```
4. Run setup wizard:
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```
5. Add Sentry DSN to environment variables:
   ```env
   NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
   ```
6. Redeploy your application

### 3. Set Up Analytics

Your project already includes Vercel Analytics. To enable:

1. Go to Vercel Dashboard → Your Project
2. Click **Analytics** tab
3. Click **Enable Analytics**
4. Analytics will start tracking automatically

### 4. Configure Custom Error Pages

Your project already has custom error pages:
- `app/not-found.tsx` - 404 errors
- `app/error.tsx` - Runtime errors

Test them by visiting:
- `https://your-domain.com/nonexistent-page` (404)

### 5. Set Up Caching Headers

Already configured in `next.config.js` with:
- Static assets: 1 year cache
- Pages: 1 hour cache with revalidation
- API routes: No cache

### 6. Enable HTTPS (Automatic)

Both Vercel and Netlify automatically provide SSL certificates. Your site will be accessible via HTTPS immediately.

---

## Custom Domain Setup

### Option 1: Vercel Custom Domain

1. **Purchase Domain** (if you don't have one):
   - Recommended: [Namecheap](https://www.namecheap.com), [Google Domains](https://domains.google), [Cloudflare](https://www.cloudflare.com)

2. **Add Domain to Vercel:**
   - Go to **Settings** → **Domains**
   - Click **Add**
   - Enter your domain (e.g., `pdfsuit.com`)
   - Click **Add**

3. **Configure DNS Records:**

   Vercel will show you which DNS records to add. Typically:

   **For Root Domain (pdfsuit.com):**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

   **For WWW Subdomain (www.pdfsuit.com):**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

4. **Add Records at Your Domain Provider:**
   - Log in to your domain registrar (Namecheap, GoDaddy, etc.)
   - Go to DNS Management
   - Add the records provided by Vercel
   - Save changes (propagation takes 24-48 hours, usually faster)

5. **Verify Domain:**
   - Return to Vercel → Domains
   - Wait for verification (green checkmark)
   - SSL certificate is issued automatically

6. **Update Environment Variables:**
   ```env
   NEXT_PUBLIC_APP_URL=https://pdfsuit.com
   ```

7. **Update Supabase:**
   - Add `https://pdfsuit.com/auth/callback` to Redirect URLs
   - Update Site URL to `https://pdfsuit.com`

### Option 2: Netlify Custom Domain

1. **Add Domain:**
   - Go to **Domain settings** → **Custom domains**
   - Click **Add custom domain**
   - Enter your domain (e.g., `pdfsuit.com`)
   - Click **Verify**

2. **Configure DNS:**

   **Option A - Use Netlify DNS (Recommended):**
   - Click **Set up Netlify DNS**
   - Update nameservers at your registrar to:
     ```
     dns1.p03.nsone.net
     dns2.p03.nsone.net
     dns3.p03.nsone.net
     dns4.p03.nsone.net
     ```

   **Option B - Use External DNS:**
   ```
   Type: A
   Name: @
   Value: 75.2.60.5

   Type: CNAME
   Name: www
   Value: your-site.netlify.app
   ```

3. **Enable HTTPS:**
   - Netlify automatically provisions SSL certificate
   - Enable **Force HTTPS** in settings

4. **Update Environment Variables:**
   ```env
   NEXT_PUBLIC_APP_URL=https://pdfsuit.com
   ```

5. **Update Supabase:**
   - Add `https://pdfsuit.com/auth/callback` to Redirect URLs
   - Update Site URL to `https://pdfsuit.com`

---

## Troubleshooting

### Build Failures

**Error: Module not found**
```bash
# Solution: Clear node_modules and reinstall
rm -rf node_modules .next
npm install
npm run build
```

**Error: Environment variables undefined**
- Verify all environment variables are added in deployment platform
- Check for typos in variable names
- Ensure no extra spaces in values
- Redeploy after adding variables

**Error: Memory limit exceeded**
- Vercel: Upgrade to Pro plan for more memory
- Netlify: Adjust build settings or optimize bundle size

### Runtime Errors

**Error: 500 Internal Server Error**
- Check deployment logs in Vercel/Netlify dashboard
- Verify environment variables are correctly set
- Check Supabase connection is working

**Error: PDF tools not working**
- Verify all dependencies installed correctly
- Check browser console for errors
- Test with smaller PDF files first

**Error: Authentication not working**
- Verify Supabase redirect URLs include deployment URL
- Check Supabase Site URL matches deployment URL
- Ensure environment variables are correct

### Performance Issues

**Slow Page Load:**
- Enable ISR (Incremental Static Regeneration) for static pages
- Optimize images using Next.js Image component
- Check bundle size: `npm run build` shows size warnings

**PDF Processing Slow:**
- This is client-side processing, depends on user's device
- Consider upgrading to server-side processing for large files

### Domain Issues

**Domain not resolving:**
- DNS propagation takes up to 48 hours (usually faster)
- Use [DNS Checker](https://dnschecker.org) to verify propagation
- Clear browser cache and try incognito mode

**SSL Certificate not issued:**
- Wait 24 hours for issuance
- Verify DNS records are correct
- Contact platform support if issue persists

---

## Deployment Comparison

| Feature | Vercel | Netlify |
|---------|--------|---------|
| **Next.js Integration** | Excellent (native) | Good |
| **Build Time** | Faster | Slower |
| **Free Tier** | 100GB bandwidth | 100GB bandwidth |
| **Serverless Functions** | Unlimited | 125k requests/month |
| **Analytics** | Built-in (paid) | Integration needed |
| **Build Minutes** | 6,000 min/month | 300 min/month |
| **Team Collaboration** | Free for small teams | Free for small teams |
| **Custom Domains** | Unlimited | Unlimited |
| **SSL** | Automatic | Automatic |
| **Edge Network** | Global | Global |
| **Best For** | Next.js apps | Static sites, various frameworks |

**Recommendation:** Use **Vercel** for this Next.js project as it's built by the Next.js team and offers best integration.

---

## Continuous Deployment Workflow

### Development Workflow

1. **Local Development:**
   ```bash
   git checkout -b feature/new-feature
   # Make changes
   npm run dev  # Test locally
   ```

2. **Commit and Push:**
   ```bash
   git add .
   git commit -m "feat: Add new feature"
   git push origin feature/new-feature
   ```

3. **Create Pull Request:**
   - Go to GitHub
   - Create PR from `feature/new-feature` to `main`
   - Vercel/Netlify creates preview deployment
   - Review preview URL

4. **Merge to Production:**
   - Merge PR to `main` branch
   - Automatic production deployment triggered
   - Monitor deployment logs

### Rollback Strategy

**On Vercel:**
1. Go to **Deployments** tab
2. Find previous working deployment
3. Click **...** → **Promote to Production**

**On Netlify:**
1. Go to **Deploys** tab
2. Find previous working deploy
3. Click **Publish deploy**

---

## Security Checklist

Before going live:

- [ ] All environment variables secured (not in code)
- [ ] Supabase RLS policies enabled
- [ ] API routes protected with authentication
- [ ] CORS configured properly
- [ ] Rate limiting implemented for API routes
- [ ] Input validation on all forms
- [ ] XSS protection enabled
- [ ] SQL injection prevention (using Supabase safely)
- [ ] HTTPS enforced
- [ ] Content Security Policy configured
- [ ] Sensitive data not logged

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/)

---

## Support

**Vercel Support:**
- Documentation: https://vercel.com/docs
- Community: https://github.com/vercel/next.js/discussions
- Support: support@vercel.com

**Netlify Support:**
- Documentation: https://docs.netlify.com
- Community: https://answers.netlify.com
- Support: support@netlify.com

---

**Congratulations!** Your PDFSuit application is now live and accessible to users worldwide! 🎉
