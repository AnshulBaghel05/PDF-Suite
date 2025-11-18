# Changelog

All notable changes to PDFSuit will be documented in this file.

---

## [1.1.0] - 2025-11-05

### 🎉 Major Updates

#### Free Tier Improvements
- **Increased credits**: 10 → 15 conversions per month
- **Unlocked all tools**: Free users now get access to all 24 tools (previously only 3 tools)
- **Removed premium restrictions**: No more tool-based paywalls, only credit limits apply
- This makes PDFSuit one of the most generous free PDF tool platforms!

#### Credit System Fix (Critical)
- **Fixed credit deduction bug**: Credits now properly decrease after tool usage
- Added automatic profile refresh after credit deduction
- Users can now see real-time credit updates in the UI
- Properly implements SaaS usage tracking model

#### GDPR Compliance
- Added comprehensive cookie consent banner
- Implemented customizable cookie preferences
- Users can accept all, necessary only, or customize settings
- Cookie consent stored in localStorage
- Full GDPR compliance for EU users
- Links to Privacy Policy, Cookie Policy, and Terms directly in consent banner

#### Google Services Integration
- **Google Search Console**: Added verification meta tag support
- **Google AdSense**: Integrated ad platform for revenue generation
  - Created reusable GoogleAdsense component
  - Ads only show in production (development shows placeholders)
  - Strategic ad placement guidelines documented
  - GDPR-compliant ad serving
- Comprehensive setup guide added (`GOOGLE_SERVICES_SETUP.md`)

#### New Pages
- **About Us** (`/about`): Company mission, vision, values, and story
- **Blog** (`/blog`): Blog listing with sample posts and categories
- **Contact** (`/contact`): Contact form with multiple contact methods
- **Privacy Policy** (`/privacy`): Comprehensive GDPR-compliant privacy policy
- **Terms of Service** (`/terms`): Complete terms with subscription details
- **Cookie Policy** (`/cookies`): Detailed cookie usage and management
- **Security** (`/security`): Security measures and compliance information

### 🔧 Technical Improvements

#### Database
- Updated default credits from 10 to 15 in schema
- Credit deduction now triggers profile refresh
- Improved usage tracking reliability

#### Components
- New `CookieConsent` component with modal settings
- New `GoogleAdsense` component with environment-based rendering
- New `GoogleAdsenseScript` for script injection

#### Documentation
- Added `GOOGLE_SERVICES_SETUP.md` - Complete guide for Google integration
- Added `FOOTER_PAGES_SUMMARY.md` - Documentation of all footer pages
- Updated `README.md` with new pricing and features
- Updated all documentation to reflect 15 free credits

### 📝 Files Modified

#### Core Files
- `lib/utils/constants.ts` - Updated free tier credits and features
- `lib/supabase/schema.sql` - Updated default credits to 15
- `hooks/useToolAccess.ts` - Fixed credit deduction with profile refresh, removed tool restrictions
- `app/layout.tsx` - Added cookie consent, AdSense script, and Search Console verification

#### New Files
- `components/ui/CookieConsent.tsx`
- `components/ads/GoogleAdsense.tsx`
- `app/about/page.tsx`
- `app/blog/page.tsx`
- `app/contact/page.tsx`
- `app/privacy/page.tsx`
- `app/terms/page.tsx`
- `app/cookies/page.tsx`
- `app/security/page.tsx`
- `GOOGLE_SERVICES_SETUP.md`
- `FOOTER_PAGES_SUMMARY.md`
- `CHANGELOG.md` (this file)

### 🎯 User Impact

**For Free Users:**
- ✅ 50% more credits (10 → 15)
- ✅ Access to all 24 tools (no restrictions!)
- ✅ Better value proposition
- ✅ Can try all features before upgrading

**For All Users:**
- ✅ Credits now update in real-time
- ✅ Clear privacy controls with GDPR compliance
- ✅ Better SEO (Google Search Console)
- ✅ Professional legal pages
- ✅ Contact form for support

**For Business:**
- ✅ Revenue potential through Google AdSense
- ✅ Better search rankings
- ✅ Legal compliance (GDPR)
- ✅ Professional brand image

---

## [1.0.0] - 2025-11-02

### Initial Release

- All 24 PDF tools implemented
- Supabase authentication
- Razorpay payment integration
- Three-tier pricing (Free, Pro, Enterprise)
- Dashboard with usage tracking
- Performance optimizations
- SEO optimization

---

## Upcoming Features

### Planned for v1.2.0
- Email notifications for credit exhaustion
- Monthly credit reset automation
- Usage analytics dashboard
- Custom branding for Enterprise
- API access for Enterprise users
- Bulk upload for batch processing
- PDF templates library

### Under Consideration
- Team accounts / multi-user plans
- White-label solution
- Mobile app (React Native)
- Desktop app (Electron)
- Browser extension
- WordPress plugin

---

## Breaking Changes

### v1.1.0
- **Database Schema**: Existing users' profiles need to be updated to reflect new credit limit (10 → 15)
  - **Migration**: Run this SQL in Supabase:
    ```sql
    UPDATE profiles
    SET credits_remaining = 15
    WHERE plan_type = 'free' AND credits_remaining = 10;
    ```

---

## Migration Guide

### Upgrading from v1.0.0 to v1.1.0

1. **Update Database Schema**:
   ```sql
   -- Update default credits for new users
   ALTER TABLE profiles ALTER COLUMN credits_remaining SET DEFAULT 15;

   -- Update existing free tier users
   UPDATE profiles
   SET credits_remaining = 15
   WHERE plan_type = 'free' AND credits_remaining < 15;
   ```

2. **Deploy Code Changes**:
   ```bash
   git pull origin main
   npm install
   npm run build
   ```

3. **Configure Google Services** (Optional):
   - Get Google Search Console verification code
   - Update `app/layout.tsx` with verification code
   - Get Google AdSense Publisher ID
   - Update `components/ads/GoogleAdsense.tsx`
   - See `GOOGLE_SERVICES_SETUP.md` for detailed instructions

4. **Test**:
   - Create new account → should get 15 credits
   - Use a tool → credits should decrease to 14
   - Check cookie consent banner appears
   - Verify all footer pages load correctly

---

## Support

For issues or questions about this update:
- GitHub Issues: https://github.com/AnshulBaghel05/PDF-Suite/issues
- Email: darshitp091@gmail.com
- Contact Form: https://pdfsuit.com/contact

---

**Note**: This changelog follows [Keep a Changelog](https://keepachangelog.com/) principles.
