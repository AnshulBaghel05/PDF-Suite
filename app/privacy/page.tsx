import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Shield, Lock, Eye, Database } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy - PDFSuit',
  description: 'Learn how PDFSuit protects your privacy and handles your data.',
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-12">
        <div className="section-container max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center space-y-4 mb-12">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <Shield className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient">
              Privacy Policy
            </h1>
            <p className="text-gray-400">
              Last updated: November 5, 2025
            </p>
          </div>

          {/* Privacy Highlights */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="card text-center">
              <Lock className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Client-Side Processing</h3>
              <p className="text-gray-400 text-sm">Your files never leave your device</p>
            </div>
            <div className="card text-center">
              <Eye className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">No File Storage</h3>
              <p className="text-gray-400 text-sm">We don't store any of your documents</p>
            </div>
            <div className="card text-center">
              <Database className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Minimal Data</h3>
              <p className="text-gray-400 text-sm">We collect only what's necessary</p>
            </div>
          </div>

          {/* Content */}
          <div className="card prose prose-invert max-w-none">
            <div className="space-y-8 text-gray-300">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                <p>
                  Welcome to PDFSuit. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we handle your information when you use our service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
                <h3 className="text-xl font-semibold text-white mb-3">2.1 Account Information</h3>
                <p>When you create an account, we collect:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name and email address</li>
                  <li>Password (encrypted)</li>
                  <li>Profile preferences</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-3 mt-4">2.2 Usage Information</h3>
                <p>We collect information about how you use our service:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Tools used and frequency</li>
                  <li>File sizes (not file contents)</li>
                  <li>Credits consumed</li>
                  <li>Login times and session data</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-3 mt-4">2.3 Payment Information</h3>
                <p>
                  Payment processing is handled by Razorpay. We do not store your credit card information. We only receive transaction IDs and payment status.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. Your PDF Files</h2>
                <p className="font-semibold text-primary">
                  Important: Your PDF files are NEVER uploaded to our servers.
                </p>
                <p>
                  All PDF processing happens entirely in your web browser using JavaScript. Your files remain on your device throughout the entire process. We have no access to the content of your documents.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. How We Use Your Information</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To provide and maintain our service</li>
                  <li>To manage your account and subscriptions</li>
                  <li>To track usage for billing purposes</li>
                  <li>To send important service updates</li>
                  <li>To improve our tools and user experience</li>
                  <li>To prevent fraud and abuse</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. Data Sharing</h2>
                <p>We do not sell your personal information. We may share data with:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Supabase:</strong> For authentication and database services</li>
                  <li><strong>Razorpay:</strong> For payment processing</li>
                  <li><strong>Vercel:</strong> For hosting infrastructure</li>
                </ul>
                <p>These services are bound by their own privacy policies and security measures.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">6. Data Security</h2>
                <p>We implement industry-standard security measures:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>HTTPS encryption for all data transmission</li>
                  <li>Secure password hashing</li>
                  <li>Row-level security in our database</li>
                  <li>Regular security audits</li>
                  <li>Limited access to user data</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">7. Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Delete your account and data</li>
                  <li>Export your data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Withdraw consent at any time</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">8. Cookies</h2>
                <p>
                  We use essential cookies for authentication and session management. We do not use tracking cookies or third-party advertising cookies. See our{' '}
                  <a href="/cookies" className="text-primary hover:underline">Cookie Policy</a> for details.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">9. Data Retention</h2>
                <p>
                  We retain your account information for as long as your account is active. If you delete your account, we remove all personal data within 30 days, except where required by law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">10. Children's Privacy</h2>
                <p>
                  Our service is not intended for users under 13 years of age. We do not knowingly collect information from children.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">11. Changes to This Policy</h2>
                <p>
                  We may update this privacy policy from time to time. We will notify you of significant changes via email or through our service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">12. Contact Us</h2>
                <p>
                  If you have questions about this privacy policy, please contact us at:
                </p>
                <ul className="list-none pl-0 space-y-2">
                  <li>Email: darshitp091@gmail.com</li>
                  <li>Contact Page: <a href="/contact" className="text-primary hover:underline">www.pdfsuit.com/contact</a></li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
