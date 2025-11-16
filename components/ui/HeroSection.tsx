'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Zap, Lock } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="section-container pt-32 pb-20">
      <div className="text-center space-y-8 animate-fade-in">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm text-gray-300">100% Privacy Protected</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold text-gradient leading-tight">
          Transform Your PDFs
          <br />
          <span className="text-gradient-red">In Seconds</span>
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
          27 powerful tools to merge, split, compress, convert, and edit PDFs.
          <br />
          Fast, secure, and completely private.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/#tools" className="btn-primary flex items-center space-x-2">
            <span>Explore Tools</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/pricing" className="btn-secondary">
            View Pricing
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-4xl mx-auto">
          <div className="glass rounded-xl p-6 text-center space-y-3">
            <div className="inline-flex p-3 bg-primary/10 rounded-lg">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-white">Lightning Fast</h3>
            <p className="text-sm text-gray-400">
              Client-side processing for instant results
            </p>
          </div>

          <div className="glass rounded-xl p-6 text-center space-y-3">
            <div className="inline-flex p-3 bg-primary/10 rounded-lg">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-white">100% Secure</h3>
            <p className="text-sm text-gray-400">
              Files never leave your browser
            </p>
          </div>

          <div className="glass rounded-xl p-6 text-center space-y-3">
            <div className="inline-flex p-3 bg-primary/10 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-white">Privacy First</h3>
            <p className="text-sm text-gray-400">
              No data collection or storage
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
