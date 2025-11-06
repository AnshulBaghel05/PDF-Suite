import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Cookie } from 'lucide-react';

export const metadata = {
  title: 'Cookie Policy - PDFSuit',
  description: 'Learn about how PDFSuit uses cookies and similar technologies.',
};

export default function CookiesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-12">
        <div className="section-container max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center space-y-4 mb-12">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <Cookie className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient">
              Cookie Policy
            </h1>
            <p className="text-gray-400">
              Last updated: November 5, 2025
            </p>
          </div>

          {/* Content */}
          <div className="card prose prose-invert max-w-none">
            <div className="space-y-8 text-gray-300">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">1. What Are Cookies?</h2>
                <p>
                  Cookies are small text files stored on your device when you visit websites. They help websites remember your preferences and improve your browsing experience.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Cookies</h2>
                <p>
                  PDFSuit uses minimal, essential cookies to provide our service. We believe in privacy-first design and do not use tracking or advertising cookies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. Types of Cookies We Use</h2>

                <h3 className="text-xl font-semibold text-white mb-3">3.1 Essential Cookies (Required)</h3>
                <p>These cookies are necessary for the service to function:</p>
                <div className="overflow-x-auto">
                  <table className="w-full border border-white/10 mt-4">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="border border-white/10 px-4 py-2 text-left">Cookie Name</th>
                        <th className="border border-white/10 px-4 py-2 text-left">Purpose</th>
                        <th className="border border-white/10 px-4 py-2 text-left">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-white/10 px-4 py-2">supabase-auth-token</td>
                        <td className="border border-white/10 px-4 py-2">Authentication session</td>
                        <td className="border border-white/10 px-4 py-2">1 week</td>
                      </tr>
                      <tr>
                        <td className="border border-white/10 px-4 py-2">user-preferences</td>
                        <td className="border border-white/10 px-4 py-2">Store UI preferences</td>
                        <td className="border border-white/10 px-4 py-2">1 year</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-xl font-semibold text-white mb-3 mt-6">3.2 Functional Cookies (Optional)</h3>
                <p>These cookies enhance your experience:</p>
                <div className="overflow-x-auto">
                  <table className="w-full border border-white/10 mt-4">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="border border-white/10 px-4 py-2 text-left">Cookie Name</th>
                        <th className="border border-white/10 px-4 py-2 text-left">Purpose</th>
                        <th className="border border-white/10 px-4 py-2 text-left">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-white/10 px-4 py-2">theme-preference</td>
                        <td className="border border-white/10 px-4 py-2">Remember theme choice</td>
                        <td className="border border-white/10 px-4 py-2">1 year</td>
                      </tr>
                      <tr>
                        <td className="border border-white/10 px-4 py-2">last-tool-used</td>
                        <td className="border border-white/10 px-4 py-2">Quick access to tools</td>
                        <td className="border border-white/10 px-4 py-2">30 days</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-xl font-semibold text-white mb-3 mt-6">3.3 What We DON'T Use</h3>
                <p className="font-semibold text-primary">We do NOT use:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Third-party advertising cookies</li>
                  <li>Cross-site tracking cookies</li>
                  <li>Social media tracking pixels</li>
                  <li>Analytics cookies (we use privacy-focused alternatives)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. Local Storage</h2>
                <p>
                  In addition to cookies, we use browser Local Storage to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Temporarily cache processed PDFs (cleared on page refresh)</li>
                  <li>Store user settings and preferences</li>
                  <li>Maintain tool configuration between sessions</li>
                </ul>
                <p className="mt-4">
                  Local Storage data never leaves your device and is not transmitted to our servers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. Third-Party Cookies</h2>
                <p>
                  Our service integrates with the following third-party services that may set their own cookies:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Supabase:</strong> For authentication (essential)
                  </li>
                  <li>
                    <strong>Razorpay:</strong> For payment processing (only on payment pages)
                  </li>
                </ul>
                <p className="mt-4">
                  These services have their own privacy policies governing cookie use.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">6. Managing Cookies</h2>
                <h3 className="text-xl font-semibold text-white mb-3">6.1 Browser Settings</h3>
                <p>
                  You can control cookies through your browser settings:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies</li>
                  <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
                  <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                  <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-3 mt-4">6.2 Clearing Cookies</h3>
                <p>
                  You can delete cookies at any time through your browser. Note that deleting essential cookies will log you out and may affect service functionality.
                </p>

                <h3 className="text-xl font-semibold text-white mb-3 mt-4">6.3 Do Not Track</h3>
                <p>
                  We respect Do Not Track (DNT) browser signals. When DNT is enabled, we disable optional functional cookies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">7. Cookie Consent</h2>
                <p>
                  By using PDFSuit, you consent to our use of essential cookies required for the service to function. You can opt out of optional functional cookies in your account settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">8. Updates to This Policy</h2>
                <p>
                  We may update this cookie policy to reflect changes in technology or regulations. We will notify users of significant changes via email or service notification.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">9. Contact Us</h2>
                <p>
                  If you have questions about our cookie policy:
                </p>
                <ul className="list-none pl-0 space-y-2">
                  <li>Email: privacy@pdfsuit.com</li>
                  <li>Contact Page: <a href="/contact" className="text-primary hover:underline">www.pdfsuit.com/contact</a></li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">10. Related Policies</h2>
                <p>
                  For more information about how we handle your data:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
                  </li>
                  <li>
                    <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
                  </li>
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
