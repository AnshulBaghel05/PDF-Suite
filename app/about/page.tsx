import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Users, Target, Shield, Zap } from 'lucide-react';

export const metadata = {
  title: 'About Us - PDFSuit',
  description: 'Learn about PDFSuit - Professional PDF tools for everyone. Fast, secure, and privacy-focused.',
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-12">
        <div className="section-container">
          {/* Hero Section */}
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gradient">
              About PDFSuit
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Professional PDF tools designed for everyone. We believe in making document management simple, fast, and secure.
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="card">
              <div className="flex items-center space-x-3 mb-4">
                <Target className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-bold text-white">Our Mission</h2>
              </div>
              <p className="text-gray-300 leading-relaxed">
                To provide powerful, easy-to-use PDF tools that respect your privacy and help you work more efficiently. We're committed to making professional-grade document management accessible to everyone.
              </p>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-bold text-white">Our Vision</h2>
              </div>
              <p className="text-gray-300 leading-relaxed">
                To become the most trusted and user-friendly PDF toolkit platform, where privacy, speed, and simplicity come together to deliver the best document management experience.
              </p>
            </div>
          </div>

          {/* Core Values */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Our Core Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Privacy First</h3>
                <p className="text-gray-400">
                  All processing happens in your browser. Your files never leave your device, ensuring complete privacy and security.
                </p>
              </div>

              <div className="card text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Lightning Fast</h3>
                <p className="text-gray-400">
                  Client-side processing means instant results with no upload or download wait times. Work at the speed of thought.
                </p>
              </div>

              <div className="card text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">User-Centric</h3>
                <p className="text-gray-400">
                  Simple, intuitive interfaces designed for everyone. No learning curve, no complicated menus—just tools that work.
                </p>
              </div>
            </div>
          </div>

          {/* Story Section */}
          <div className="card max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                PDFSuit was born from a simple frustration: why should managing PDFs be complicated? Why should you have to upload your sensitive documents to unknown servers? Why should you wait for processing when your computer is perfectly capable?
              </p>
              <p>
                We set out to build a different kind of PDF toolkit—one that respects your privacy, works instantly, and provides all the tools you need without the bloat. Using modern web technologies, we created a platform where everything happens right in your browser.
              </p>
              <p>
                Today, PDFSuit offers 26 professional PDF tools, all working seamlessly to help you merge, split, compress, convert, and manage your documents. And we're just getting started.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-gradient-red mb-2">24+</div>
              <div className="text-gray-400">PDF Tools</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gradient-red mb-2">100%</div>
              <div className="text-gray-400">Privacy Protected</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gradient-red mb-2">0s</div>
              <div className="text-gray-400">Upload Time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gradient-red mb-2">∞</div>
              <div className="text-gray-400">File Security</div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
