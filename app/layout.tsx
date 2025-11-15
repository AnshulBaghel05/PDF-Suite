import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CookieConsent from "@/components/ui/CookieConsent";
import { GoogleAdsenseScript } from "@/components/ads/GoogleAdsense";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PDFSuit - Powerful PDF Tools Online | Free PDF Editor & Converter",
  description: "Transform your PDFs with 23+ professional tools. Merge, split, compress, convert, edit, and secure PDFs online. Fast, secure, and privacy-focused. No file size limits for pro users.",
  keywords: "PDF tools, PDF editor, PDF converter, merge PDF, split PDF, compress PDF, PDF to Word, Word to PDF, online PDF tools",
  authors: [{ name: "PDFSuit" }],
  creator: "PDFSuit",
  publisher: "PDFSuit",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pdfsuit.com",
    title: "PDFSuit - Professional PDF Tools Online",
    description: "Transform your PDFs with 23+ powerful tools. Fast, secure, and privacy-focused.",
    siteName: "PDFSuit",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDFSuit - Professional PDF Tools Online",
    description: "Transform your PDFs with 23+ powerful tools. Fast, secure, and privacy-focused.",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#DC2626",
  verification: {
    google: "RrCb-PLA6vjZ82f2RxQ3_FFQPdcoujkSkbxIZqYRlFc",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
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
