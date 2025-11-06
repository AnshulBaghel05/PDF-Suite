import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Shield, Lock, Eye, Server, Check } from 'lucide-react';

export const metadata = {
  title: 'Security - PDFSuit',
  description: 'Learn about PDFSuit security measures and how we protect your data.',
};

export default function SecurityPage() {
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
              Security at PDFSuit
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Your privacy and security are our top priorities. Learn how we protect your data and documents.
            </p>
          </div>

          {/* Security Highlights */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="card text-center">
              <Eye className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="text-white font-bold mb-2">Zero Access</h3>
              <p className="text-gray-400 text-sm">
                Your files never reach our servers. All processing happens in your browser.
              </p>
            </div>
            <div className="card text-center">
              <Lock className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="text-white font-bold mb-2">Encrypted</h3>
              <p className="text-gray-400 text-sm">
                All data transmission is encrypted with industry-standard HTTPS/TLS.
              </p>
            </div>
            <div className="card text-center">
              <Server className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="text-white font-bold mb-2">Secure Infrastructure</h3>
              <p className="text-gray-400 text-sm">
                Hosted on enterprise-grade infrastructure with 99.9% uptime.
              </p>
            </div>
          </div>

          {/* Detailed Security Info */}
          <div className="space-y-8">
            <div className="card">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                <Shield className="w-7 h-7 text-primary" />
                <span>Client-Side Processing</span>
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  <strong className="text-white">The most important security feature:</strong> Your PDF files are processed entirely in your web browser using JavaScript. This means:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Files never leave your device</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>No upload to our servers</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>No storage on our infrastructure</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Instant processing with no waiting</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Complete privacy for sensitive documents</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="card">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                <Lock className="w-7 h-7 text-primary" />
                <span>Data Encryption</span>
              </h2>
              <div className="space-y-4 text-gray-300">
                <h3 className="text-lg font-semibold text-white">In Transit</h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>All connections use HTTPS with TLS 1.3 encryption</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Perfect Forward Secrecy (PFS) enabled</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>A+ rating on SSL Labs</span>
                  </li>
                </ul>

                <h3 className="text-lg font-semibold text-white mt-6">At Rest</h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Passwords hashed with bcrypt</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Database encryption at rest (AES-256)</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Row-level security in database</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="card">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                <Server className="w-7 h-7 text-primary" />
                <span>Infrastructure Security</span>
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>Our infrastructure is built on enterprise-grade platforms:</p>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Vercel:</strong> Global CDN with DDoS protection</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Supabase:</strong> PostgreSQL with automatic backups</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Razorpay:</strong> PCI DSS compliant payment processing</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>99.9% uptime SLA</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Distributed denial-of-service (DDoS) protection</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Regular security updates and patches</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="card">
              <h2 className="text-2xl font-bold text-white mb-6">Application Security</h2>
              <div className="space-y-4 text-gray-300">
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Authentication:</strong> Secure session-based auth with Supabase</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Authorization:</strong> Role-based access control (RBAC)</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Input Validation:</strong> All inputs sanitized and validated</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">XSS Protection:</strong> Content Security Policy (CSP) headers</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">CSRF Protection:</strong> Token-based protection on all forms</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Rate Limiting:</strong> Protection against brute force attacks</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="card">
              <h2 className="text-2xl font-bold text-white mb-6">Compliance & Standards</h2>
              <div className="space-y-4 text-gray-300">
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">GDPR:</strong> Full compliance with EU data protection regulations</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">SOC 2:</strong> Infrastructure partners are SOC 2 certified</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">PCI DSS:</strong> Payment processing meets all requirements</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">ISO 27001:</strong> Security management best practices</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="card">
              <h2 className="text-2xl font-bold text-white mb-6">Ongoing Security Practices</h2>
              <div className="space-y-4 text-gray-300">
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Regular security audits and penetration testing</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Automated vulnerability scanning</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Dependency updates and security patches</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>24/7 monitoring and alerting</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Incident response plan and procedures</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Security training for team members</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="card bg-primary/5 border-primary/20">
              <h2 className="text-2xl font-bold text-white mb-4">Responsible Disclosure</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  If you discover a security vulnerability, please report it to us responsibly:
                </p>
                <ul className="space-y-2">
                  <li>Email: security@pdfsuit.com</li>
                  <li>Include detailed steps to reproduce the issue</li>
                  <li>Give us reasonable time to address the issue before public disclosure</li>
                </ul>
                <p className="text-sm text-gray-400 mt-4">
                  We appreciate responsible disclosure and will acknowledge your contribution.
                </p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-400 mb-4">
                Questions about our security practices?
              </p>
              <a href="/contact" className="btn-primary inline-block">
                Contact Security Team
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
