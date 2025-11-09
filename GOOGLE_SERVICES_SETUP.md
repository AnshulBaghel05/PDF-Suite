# Google Services Setup Guide

This guide will help you integrate Google Search Console and Google AdSense with your PDFSuit Next.js application.

---

## 🔍 Google Search Console Setup

### Step 1: Create Google Search Console Account

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Sign in with your Google account
3. Click "Add Property"
4. Enter your domain (e.g., `https://your-domain.vercel.app` or `https://pdfsuit.com`)

### Step 2: Verify Ownership

Google will provide several verification methods. We'll use the **HTML tag method**:

1. Select **HTML tag** verification method
2. Google will give you a meta tag like this:
   ```html
   <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE_HERE" />
   ```
3. Copy only the **verification code** (the part after `content="` and before `"`)

### Step 3: Add Verification Code to Next.js

1. Open `app/layout.tsx`
2. Find the `metadata` object
3. Locate this section:
   ```typescript
   verification: {
     google: "ADD_YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE_HERE",
   },
   ```
4. Replace `ADD_YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE_HERE` with your actual code
5. Example:
   ```typescript
   verification: {
     google: "abcdefghijklmnopqrstuvwxyz123456789",
   },
   ```

### Step 4: Deploy and Verify

1. Commit and push your changes to GitHub
2. Wait for Vercel to deploy (automatic)
3. Go back to Google Search Console
4. Click "Verify"
5. ✅ You should see "Ownership verified"

### Step 5: Submit Sitemap

1. In Google Search Console, go to "Sitemaps" in the left menu
2. Add your sitemap URL: `https://your-domain.com/sitemap.xml`
3. Click "Submit"
4. Wait 24-48 hours for Google to crawl your site

---

## 💰 Google AdSense Setup

### Step 1: Create AdSense Account

1. Go to [Google AdSense](https://www.google.com/adsense)
2. Sign up with your Google account
3. Enter your website URL
4. Complete the application process

### Step 2: Wait for Approval

- Google will review your site (typically 1-7 days)
- Ensure you have quality content
- Your site should be live and accessible
- You need sufficient content (our site has 24 tools + documentation, so we're good!)

### Step 3: Get Your AdSense Code

Once approved, Google will provide:

1. **Publisher ID** (looks like: `ca-pub-1234567890123456`)
2. **Ad Unit Codes** for different ad slots

### Step 4: Add AdSense to Your Site

#### Option A: Update the GoogleAdsense Component

1. Open `components/ads/GoogleAdsense.tsx`
2. Find these two lines:
   ```typescript
   data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your AdSense client ID
   ```
   and
   ```typescript
   src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
   ```
3. Replace `ca-pub-XXXXXXXXXXXXXXXX` with your actual Publisher ID

#### Option B: Use Environment Variables (Recommended)

1. Add to your `.env.local`:
   ```env
   NEXT_PUBLIC_GOOGLE_ADSENSE_ID=ca-pub-YOUR-ACTUAL-ID
   ```

2. Update `components/ads/GoogleAdsense.tsx` to use the env variable:
   ```typescript
   data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID}
   ```

### Step 5: Add Ads to Your Pages

#### Where to Place Ads (Best Practices):

1. **Above the Fold** - Top of homepage (high visibility)
2. **Between Content** - After tool descriptions
3. **Sidebar** - Dashboard and tool pages
4. **Footer Area** - Bottom of content

#### Example: Add Ad to Homepage

Edit `app/page.tsx`:

```typescript
import GoogleAdsense from '@/components/ads/GoogleAdsense';

export default function HomePage() {
  return (
    <>
      {/* Your existing content */}

      {/* Ad Unit - Between sections */}
      <div className="section-container my-12">
        <GoogleAdsense
          adSlot="1234567890"  // Replace with your ad slot ID
          adFormat="auto"
          fullWidthResponsive={true}
        />
      </div>

      {/* More content */}
    </>
  );
}
```

#### Strategic Ad Placements for PDFSuit:

**1. Homepage (`app/page.tsx`)**
- After hero section, before tools showcase
- After tools showcase, before footer

**2. Tool Pages (`app/tools/[tool]/page.tsx`)**
- Sidebar ad (300x250 or 300x600)
- Between upload area and processing button
- After result section

**3. Dashboard (`app/dashboard/page.tsx`)**
- Sidebar ad
- Below stats cards

**4. Blog (`app/blog/page.tsx`)**
- Between blog post listings
- Sidebar

---

## 📊 Ad Unit Sizes (Recommended)

| Size | Name | Best For |
|------|------|----------|
| 728x90 | Leaderboard | Top of page |
| 300x250 | Medium Rectangle | Sidebar, in-content |
| 336x280 | Large Rectangle | Sidebar |
| 300x600 | Half Page | Sidebar |
| 320x100 | Large Mobile Banner | Mobile |
| auto | Responsive | All devices |

---

## 🎯 Ad Placement Best Practices

### DO:
✅ Place ads where users naturally pause (after sections)
✅ Use responsive ad units
✅ Match ad colors to your theme
✅ Test different placements
✅ Monitor performance in AdSense dashboard

### DON'T:
❌ Place too many ads (max 3 per page)
❌ Put ads in annoying positions
❌ Click your own ads (against policy!)
❌ Ask users to click ads
❌ Put ads on pages with little content

---

## 🔒 GDPR Compliance

Our cookie consent banner (already implemented!) handles this:

1. Users must consent to personalized ads
2. Non-EU users see ads by default
3. EU users can opt-out
4. Consent is stored in localStorage

The `CookieConsent` component already handles this!

---

## 📈 Monitoring and Optimization

### Google Search Console

Monitor daily:
- Impressions
- Clicks
- Average position
- Coverage issues

### Google AdSense

Track:
- Page RPM (Revenue per 1000 page views)
- Click-through rate (CTR)
- CPC (Cost per click)
- Best performing ad units

---

## 🚀 Quick Start Checklist

### Google Search Console:
- [ ] Create property
- [ ] Get verification code
- [ ] Add to `app/layout.tsx`
- [ ] Deploy to Vercel
- [ ] Verify ownership
- [ ] Submit sitemap

### Google AdSense:
- [ ] Apply for AdSense
- [ ] Wait for approval
- [ ] Get Publisher ID
- [ ] Update `GoogleAdsense.tsx`
- [ ] Add ads to pages
- [ ] Test in production
- [ ] Monitor performance

---

## 💡 Pro Tips

1. **Wait for Traffic**: AdSense works better with more traffic (aim for 1000+ visits/day)
2. **Content Quality**: More content = better ad targeting = higher CPM
3. **Page Speed**: Fast loading pages rank better and earn more
4. **Mobile Optimization**: 60%+ of traffic is mobile
5. **A/B Testing**: Test different ad placements to find what works best

---

## 🆘 Troubleshooting

### Ads Not Showing?

1. **Development Mode**: Ads only show in production
2. **Ad Blocker**: Disable to test
3. **New Account**: Can take 24-48 hours for ads to start showing
4. **Policy Violation**: Check AdSense dashboard for issues

### Search Console Not Verifying?

1. Clear cache and try again
2. Check that verification code is correct
3. Ensure site is deployed and accessible
4. Wait a few minutes and retry

---

## 📞 Support Resources

- **Search Console Help**: https://support.google.com/webmasters
- **AdSense Help**: https://support.google.com/adsense
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Support**: https://vercel.com/support

---

## ✅ Current Status

- ✅ Google Search Console verification code placeholder added
- ✅ AdSense component created and integrated
- ✅ GDPR cookie consent implemented
- ✅ Ad placeholders show in development
- ⏳ Waiting for you to add actual IDs
- ⏳ Waiting for Google approval

**Next Steps**: Get your Google codes and replace the placeholders!
