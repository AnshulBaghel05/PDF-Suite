# PDFSuit - Complete Implementation Guide

This guide will help you complete the remaining features of PDFSuit and deploy it to production.

## ✅ What's Already Implemented

### Core Infrastructure
- ✅ Next.js 14 project with TypeScript and Tailwind CSS
- ✅ Custom minimalist theme (black/red/white/off-white)
- ✅ Supabase configuration and database schema
- ✅ Authentication pages (Login/Signup with Google OAuth)
- ✅ Landing page with hero section
- ✅ Tools showcase section (all 23 tools listed)
- ✅ Reusable file upload component with drag-drop
- ✅ SEO-optimized layout with metadata

### Working PDF Tools
- ✅ Merge PDF
- ✅ Split PDF
- ✅ Compress PDF
- ✅ Rotate PDF (utility created)

## 🚀 Next Steps - Complete Implementation

### Step 1: Setup Supabase (10 minutes)

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy your project URL and anon key

2. **Run Database Schema**:
   - Open SQL Editor in Supabase dashboard
   - Copy and paste content from `lib/supabase/schema.sql`
   - Run the SQL

3. **Enable Authentication Providers**:
   - Go to Authentication > Providers
   - Enable Email provider
   - Enable Google OAuth:
     - Add Google Client ID and Secret
     - Callback URL: `https://[your-project].supabase.co/auth/v1/callback`

4. **Update .env.local**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### Step 2: Implement Remaining PDF Tools (4-6 hours)

Create tool pages following the pattern from merge/split/compress. Here's a template:

#### Pattern for Each Tool:

```typescript
// app/tools/[tool-name]/page.tsx
'use client';

import { useState } from 'react';
import FileUpload from '@/components/ui/FileUpload';
import { toolFunction } from '@/lib/pdf/[tool-name]';
import { Download, Loader2, CheckCircle } from 'lucide-react';
import { saveAs } from 'file-saver';

export default function ToolPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleProcess = async () => {
    try {
      setProcessing(true);
      const output = await toolFunction(files);
      setResult(output);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="section-container">
      {/* Tool UI */}
    </div>
  );
}
```

#### Priority Tools to Implement Next:

1. **Rotate PDF** (lib/pdf/rotate.ts already exists)
   - Add page selector UI
   - Allow rotation per page or all pages

2. **Delete Pages**
   ```typescript
   // lib/pdf/delete.ts
   import { PDFDocument } from 'pdf-lib';

   export async function deletePages(file: File, pagesToDelete: number[]) {
     const arrayBuffer = await file.arrayBuffer();
     const pdfDoc = await PDFDocument.load(arrayBuffer);

     // Remove pages in reverse order to maintain indices
     pagesToDelete.sort((a, b) => b - a).forEach(pageNum => {
       pdfDoc.removePage(pageNum - 1);
     });

     return await pdfDoc.save();
   }
   ```

3. **Extract Pages**
   ```typescript
   // Similar to split but with custom page selection
   ```

4. **Reorder Pages**
   ```typescript
   // lib/pdf/reorder.ts
   import { PDFDocument } from 'pdf-lib';

   export async function reorderPages(file: File, newOrder: number[]) {
     const arrayBuffer = await file.arrayBuffer();
     const pdfDoc = await PDFDocument.load(arrayBuffer);
     const newPdf = await PDFDocument.create();

     for (const pageNum of newOrder) {
       const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNum - 1]);
       newPdf.addPage(copiedPage);
     }

     return await newPdf.save();
   }
   ```

5. **Image to PDF**
   ```typescript
   // lib/pdf/image-to-pdf.ts
   import { PDFDocument } from 'pdf-lib';

   export async function imagesToPDF(images: File[]) {
     const pdfDoc = await PDFDocument.create();

     for (const image of images) {
       const imageBytes = await image.arrayBuffer();
       const img = await pdfDoc.embedPng(imageBytes); // or embedJpg
       const page = pdfDoc.addPage([img.width, img.height]);
       page.drawImage(img, {
         x: 0,
         y: 0,
         width: img.width,
         height: img.height,
       });
     }

     return await pdfDoc.save();
   }
   ```

6. **PDF to Image**
   ```typescript
   // lib/pdf/pdf-to-image.ts
   import * as pdfjsLib from 'pdfjs-dist';

   export async function pdfToImages(file: File) {
     const arrayBuffer = await file.arrayBuffer();
     const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
     const images: Blob[] = [];

     for (let i = 1; i <= pdf.numPages; i++) {
       const page = await pdf.getPage(i);
       const viewport = page.getViewport({ scale: 2.0 });
       const canvas = document.createElement('canvas');
       const context = canvas.getContext('2d')!;
       canvas.width = viewport.width;
       canvas.height = viewport.height;

       await page.render({ canvasContext: context, viewport }).promise;
       const blob = await new Promise<Blob>((resolve) => {
         canvas.toBlob((b) => resolve(b!), 'image/png');
       });
       images.push(blob);
     }

     return images;
   }
   ```

7. **Add Watermark**
   ```typescript
   // lib/pdf/watermark.ts
   import { PDFDocument, rgb } from 'pdf-lib';

   export async function addWatermark(
     file: File,
     text: string,
     options: { opacity: number; rotation: number }
   ) {
     const arrayBuffer = await file.arrayBuffer();
     const pdfDoc = await PDFDocument.load(arrayBuffer);
     const pages = pdfDoc.getPages();

     pages.forEach(page => {
       const { width, height } = page.getSize();
       page.drawText(text, {
         x: width / 2,
         y: height / 2,
         size: 50,
         opacity: options.opacity,
         rotate: { angle: options.rotation },
         color: rgb(0.5, 0.5, 0.5),
       });
     });

     return await pdfDoc.save();
   }
   ```

8. **Protect PDF**
   ```typescript
   // Note: pdf-lib doesn't support encryption directly
   // Consider using alternative library or server-side processing
   ```

### Step 3: Implement Dashboard (2-3 hours)

Create user dashboard to track usage and manage subscription:

```typescript
// app/(dashboard)/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [usageLogs, setUsageLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profile);

      // Fetch usage logs
      const { data: logs } = await supabase
        .from('usage_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      setUsageLogs(logs || []);
    }
  };

  return (
    <div className="section-container">
      <h1>Dashboard</h1>
      {/* Show user stats, usage, and plan */}
    </div>
  );
}
```

### Step 4: Razorpay Integration (2-3 hours)

1. **Install Razorpay SDK**:
   ```bash
   npm install razorpay
   ```

2. **Create Razorpay checkout API**:
   ```typescript
   // app/api/create-order/route.ts
   import Razorpay from 'razorpay';

   const razorpay = new Razorpay({
     key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
     key_secret: process.env.RAZORPAY_KEY_SECRET!,
   });

   export async function POST(req: Request) {
     const { amount, planType } = await req.json();

     const order = await razorpay.orders.create({
       amount: amount * 100, // Convert to paise
       currency: 'INR',
       receipt: `receipt_${Date.now()}`,
     });

     return Response.json(order);
   }
   ```

3. **Create payment verification API**:
   ```typescript
   // app/api/verify-payment/route.ts
   import crypto from 'crypto';
   import { supabase } from '@/lib/supabase/client';

   export async function POST(req: Request) {
     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

     // Verify signature
     const body = razorpay_order_id + '|' + razorpay_payment_id;
     const expectedSignature = crypto
       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
       .update(body)
       .digest('hex');

     if (expectedSignature === razorpay_signature) {
       // Update user profile with new plan
       // Save payment record
       return Response.json({ success: true });
     }

     return Response.json({ success: false });
   }
   ```

4. **Create pricing page**:
   ```typescript
   // app/pricing/page.tsx
   import { PLANS } from '@/lib/utils/constants';

   export default function PricingPage() {
     return (
       <div className="section-container">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {Object.entries(PLANS).map(([key, plan]) => (
             <div key={key} className="card">
               <h3>{plan.name}</h3>
               <div className="text-4xl font-bold">₹{plan.price}</div>
               <ul>
                 {plan.features.map(feature => (
                   <li key={feature}>{feature}</li>
                 ))}
               </ul>
               <button className="btn-primary">Choose Plan</button>
             </div>
           ))}
         </div>
       </div>
     );
   }
   ```

### Step 5: Usage Tracking & Limits (1-2 hours)

Create a hook to track usage:

```typescript
// hooks/useUsageTracker.ts
import { supabase } from '@/lib/supabase/client';

export function useUsageTracker() {
  const trackUsage = async (toolName: string, fileSize: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check remaining credits
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits_remaining, plan_type')
      .eq('id', user.id)
      .single();

    if (profile.credits_remaining <= 0 && profile.plan_type === 'free') {
      throw new Error('Credits exhausted. Please upgrade.');
    }

    // Log usage
    await supabase.from('usage_logs').insert({
      user_id: user.id,
      tool_name: toolName,
      file_size: fileSize,
      success: true,
    });

    // Decrement credits
    if (profile.plan_type !== 'enterprise') {
      await supabase
        .from('profiles')
        .update({ credits_remaining: profile.credits_remaining - 1 })
        .eq('id', user.id);
    }
  };

  return { trackUsage };
}
```

Use it in tool pages:
```typescript
const { trackUsage } = useUsageTracker();

const handleProcess = async () => {
  try {
    await trackUsage('merge-pdf', files[0].size);
    // Process PDF...
  } catch (err) {
    // Handle error
  }
};
```

### Step 6: SEO Optimization (1 hour)

1. **Create sitemap**:
   ```typescript
   // app/sitemap.ts
   import { TOOLS } from '@/lib/utils/constants';

   export default function sitemap() {
     const tools = TOOLS.map(tool => ({
       url: `https://pdfsuit.com/tools/${tool.id}`,
       lastModified: new Date(),
       changeFrequency: 'weekly',
       priority: 0.8,
     }));

     return [
       {
         url: 'https://pdfsuit.com',
         lastModified: new Date(),
         changeFrequency: 'daily',
         priority: 1,
       },
       ...tools,
     ];
   }
   ```

2. **Add structured data**:
   ```typescript
   // In layout.tsx or page.tsx
   const jsonLd = {
     '@context': 'https://schema.org',
     '@type': 'WebApplication',
     name: 'PDFSuit',
     description: '23+ professional PDF tools online',
     applicationCategory: 'BusinessApplication',
     offers: {
       '@type': 'Offer',
       price: '0',
       priceCurrency: 'INR',
     },
   };

   // Add to head
   <script
     type="application/ld+json"
     dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
   />
   ```

### Step 7: Deploy to Vercel (30 minutes)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin [your-repo-url]
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy!

3. **Update Supabase callback URLs**:
   - Add your Vercel domain to Supabase Auth URLs
   - Format: `https://your-domain.vercel.app/**`

## 📝 Testing Checklist

Before launch, test:

- [ ] All PDF tools work correctly
- [ ] File upload/download works
- [ ] Authentication (email + Google)
- [ ] Payment flow (Razorpay)
- [ ] Usage tracking and credits
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] SEO (meta tags, sitemap)
- [ ] Error handling
- [ ] Loading states
- [ ] Browser compatibility

## 🎯 Launch Checklist

- [ ] Setup custom domain
- [ ] Configure SSL
- [ ] Setup analytics (Google Analytics)
- [ ] Setup error tracking (Sentry)
- [ ] Create social media accounts
- [ ] Prepare marketing materials
- [ ] Write launch blog post
- [ ] Submit to product directories (Product Hunt, etc.)

## 💡 Tips & Best Practices

1. **Performance**:
   - Use Next.js Image component for images
   - Implement lazy loading for tools
   - Add loading skeletons
   - Optimize bundle size

2. **User Experience**:
   - Add progress indicators for long operations
   - Provide clear error messages
   - Add tooltips and help text
   - Implement keyboard shortcuts

3. **Security**:
   - Sanitize user inputs
   - Implement rate limiting
   - Add CSRF protection
   - Regular security audits

4. **Marketing**:
   - Blog about PDF tips & tricks
   - Create video tutorials
   - SEO-optimized content
   - Social media presence

## 🐛 Common Issues & Solutions

### Issue: PDF processing is slow
**Solution**: Use Web Workers for heavy processing

### Issue: Large files cause browser to hang
**Solution**: Implement file size limits and chunked processing

### Issue: Supabase RLS denies access
**Solution**: Check RLS policies and ensure user is authenticated

### Issue: Payment not reflecting
**Solution**: Verify webhook signatures and check payment logs

## 📚 Resources

- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [Supabase Docs](https://supabase.com/docs)
- [Razorpay Docs](https://razorpay.com/docs/)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 🎉 Conclusion

You now have a solid foundation for PDFSuit! The core infrastructure is in place, and you just need to:

1. Complete remaining PDF tool implementations (4-6 hours)
2. Add payment integration (2-3 hours)
3. Implement usage tracking (1-2 hours)
4. Polish and test (2-3 hours)
5. Deploy to production (30 minutes)

**Total estimated time to launch: 10-15 hours**

Good luck with your launch! 🚀
