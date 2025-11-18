import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { FileText } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service - PDFSuit',
  description: 'Read our terms of service and understand your rights and responsibilities when using PDFSuit.',
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-12">
        <div className="section-container max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center space-y-4 mb-12">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <FileText className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient">
              Terms of Service
            </h1>
            <p className="text-gray-400">
              Last updated: November 5, 2025
            </p>
          </div>

          {/* Content */}
          <div className="card prose prose-invert max-w-none">
            <div className="space-y-8 text-gray-300">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using PDFSuit ("the Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
                <p>
                  PDFSuit provides online PDF manipulation tools including but not limited to merging, splitting, compressing, converting, and editing PDF documents. All processing is performed client-side in your web browser.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. Account Registration</h2>
                <h3 className="text-xl font-semibold text-white mb-3">3.1 Account Creation</h3>
                <p>To access certain features, you must create an account. You agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate and complete information</li>
                  <li>Keep your password secure and confidential</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Be responsible for all activities under your account</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-3 mt-4">3.2 Account Termination</h3>
                <p>
                  We reserve the right to suspend or terminate accounts that violate these terms or engage in abusive behavior.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. Subscription Plans</h2>
                <h3 className="text-xl font-semibold text-white mb-3">4.1 Plans Available</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Free Plan:</strong> 10 credits per month, 10MB file limit</li>
                  <li><strong>Pro Plan:</strong> ₹99/month, 100 credits per month, 50MB file limit</li>
                  <li><strong>Enterprise Plan:</strong> ₹199/month, unlimited credits, 200MB file limit</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-3 mt-4">4.2 Billing</h3>
                <p>
                  Paid subscriptions are billed monthly in advance. All payments are processed through Razorpay. Prices are subject to change with 30 days notice.
                </p>

                <h3 className="text-xl font-semibold text-white mb-3 mt-4">4.3 Refunds</h3>
                <p>
                  We offer a 7-day money-back guarantee for first-time subscribers. Refunds after this period are at our discretion. Credits do not roll over to the next billing cycle.
                </p>

                <h3 className="text-xl font-semibold text-white mb-3 mt-4">4.4 Cancellation</h3>
                <p>
                  You may cancel your subscription at any time. Your plan will remain active until the end of the current billing period.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. Acceptable Use</h2>
                <p>You agree NOT to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use the service for any illegal purpose</li>
                  <li>Process documents containing illegal content</li>
                  <li>Attempt to bypass usage limits or restrictions</li>
                  <li>Reverse engineer or copy our technology</li>
                  <li>Use automated tools to abuse the service</li>
                  <li>Share your account credentials with others</li>
                  <li>Resell or redistribute our service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">6. Intellectual Property</h2>
                <p>
                  All content, features, and functionality of PDFSuit are owned by us and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or reverse engineer any part of our service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">7. Your Content</h2>
                <p>
                  You retain all rights to the PDF files you process. Since all processing happens in your browser, we never access, store, or have any rights to your documents. You are solely responsible for ensuring you have the right to process any documents you upload.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">8. Service Availability</h2>
                <p>
                  While we strive for 99.9% uptime, we cannot guarantee uninterrupted service. We reserve the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Modify or discontinue features</li>
                  <li>Perform maintenance with notice when possible</li>
                  <li>Limit usage during peak times</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">9. Disclaimer of Warranties</h2>
                <p>
                  THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We do not guarantee:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Error-free operation</li>
                  <li>Specific results from PDF processing</li>
                  <li>Compatibility with all file types</li>
                  <li>Data accuracy or completeness</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">10. Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by law, PDFSuit shall not be liable for:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Indirect, incidental, or consequential damages</li>
                  <li>Loss of profits, data, or business opportunities</li>
                  <li>Damages exceeding the amount paid in the last 12 months</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">11. Indemnification</h2>
                <p>
                  You agree to indemnify and hold PDFSuit harmless from any claims, damages, or expenses arising from your use of the service or violation of these terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">12. Privacy</h2>
                <p>
                  Your use of the service is also governed by our{' '}
                  <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
                  Please review it to understand our data practices.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">13. Changes to Terms</h2>
                <p>
                  We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms. Material changes will be communicated via email or service notification.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">14. Governing Law</h2>
                <p>
                  These terms are governed by the laws of India. Any disputes shall be resolved in the courts of Mumbai, Maharashtra.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">15. Contact Information</h2>
                <p>
                  For questions about these terms, contact us at:
                </p>
                <ul className="list-none pl-0 space-y-2">
                  <li>Email: darshitp091@gmail.com</li>
                  <li>Contact Page: <a href="/contact" className="text-primary hover:underline">www.pdfsuit.com/contact</a></li>
                </ul>
              </section>

              <section className="border-t border-white/10 pt-8">
                <p className="text-sm text-gray-500">
                  By using PDFSuit, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
