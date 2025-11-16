import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CookieConsent from "@/components/ui/CookieConsent";
import { GoogleAdsenseScript } from "@/components/ads/GoogleAdsense";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://pdfsuit.com'),
  title: "PDFSuit - Powerful PDF Tools Online | Free PDF Editor & Converter",
  description: "Transform PDFs with 27 powerful tools. Merge, split, compress, convert, edit & secure PDFs online. Fast, secure & privacy-focused. Free PDF editor for all.",
  keywords: "PDF tools, PDF editor, PDF converter, merge PDF, split PDF, compress PDF, PDF to Word, Word to PDF, online PDF tools, PDF to Excel, OCR PDF, PDF signature, PDF bookmarks",
  authors: [{ name: "PDFSuit" }],
  creator: "PDFSuit",
  publisher: "PDFSuit",
  robots: "index, follow",
  alternates: {
    canonical: "https://pdfsuit.com",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pdfsuit.com",
    title: "PDFSuit - Professional PDF Tools Online",
    description: "Transform PDFs with 27 professional tools. Fast, secure, and privacy-focused PDF editor & converter.",
    siteName: "PDFSuit",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PDFSuit - Professional PDF Tools Online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDFSuit - Professional PDF Tools Online",
    description: "Transform PDFs with 27 professional tools. Fast, secure, and privacy-focused.",
    images: ["/og-image.png"],
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#DC2626",
  verification: {
    google: "RrCb-PLA6vjZ82f2RxQ3_FFQPdcoujkSkbxIZqYRlFc",
    other: {
      'google-adsense-account': 'ca-pub-9444956979294597',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "PDFSuit",
    "description": "Professional online PDF tools for editing, converting, and managing PDF documents",
    "url": "https://pdfsuit.com",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "GBP"
    },
    "featureList": [
      "Merge PDF",
      "Split PDF",
      "Compress PDF",
      "PDF to Word",
      "Word to PDF",
      "PDF to Excel",
      "OCR PDF",
      "Add Signature",
      "PDF Bookmarks",
      "Edit PDF",
      "Protect PDF"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250"
    }
  };

  return (
    <html lang="en">
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} gradient-bg`}>
        <GoogleAdsenseScript />
        {children}
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
