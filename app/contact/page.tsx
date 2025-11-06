'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Mail, MessageSquare, Send, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 3000);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-12">
        <div className="section-container">
          {/* Hero Section */}
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gradient">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Contact Info Cards */}
            <div className="space-y-6">
              <div className="card">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Email Us</h3>
                    <p className="text-gray-400 text-sm">support@pdfsuit.com</p>
                    <p className="text-gray-400 text-sm">hello@pdfsuit.com</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Live Chat</h3>
                    <p className="text-gray-400 text-sm">Available Mon-Fri</p>
                    <p className="text-gray-400 text-sm">9 AM - 6 PM IST</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Call Us</h3>
                    <p className="text-gray-400 text-sm">+91 (555) 123-4567</p>
                    <p className="text-gray-400 text-sm">Mon-Fri, 9 AM - 6 PM</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Office</h3>
                    <p className="text-gray-400 text-sm">Mumbai, Maharashtra</p>
                    <p className="text-gray-400 text-sm">India</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="card">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="input-field w-full"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="input-field w-full"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="input-field w-full"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="input-field w-full resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  {status === 'success' && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg">
                      Thank you! Your message has been sent successfully. We'll get back to you soon.
                    </div>
                  )}

                  {status === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
                      Oops! Something went wrong. Please try again later.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    {status === 'sending' ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 text-center">
            <p className="text-gray-400 mb-4">
              Looking for quick answers? Check out our{' '}
              <a href="/faq" className="text-primary hover:underline">
                FAQ page
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
