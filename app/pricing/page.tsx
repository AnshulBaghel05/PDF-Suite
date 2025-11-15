'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { PLANS } from '@/lib/utils/constants';
import { Check, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleSelectPlan = (planKey: string) => {
    // Check if user is logged in
    if (!user) {
      // Redirect to login with return URL
      router.push(`/login?redirect=/pricing&plan=${planKey}`);
      return;
    }

    // If user is logged in, redirect to dashboard where they can upgrade
    router.push('/dashboard?upgrade=' + planKey);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-12">
        <div className="section-container">
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gradient">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Choose the plan that fits your needs. Upgrade or downgrade anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {Object.entries(PLANS).map(([key, plan]) => (
              <div
                key={key}
                className={`card flex flex-col space-y-6 ${
                  key === 'pro' ? 'border-2 border-primary relative' : ''
                }`}
              >
                {key === 'pro' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                      <Zap className="w-4 h-4" />
                      <span>Popular</span>
                    </span>
                  </div>
                )}

                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-bold text-gradient-red">
                      £{plan.price}
                    </span>
                    {plan.price > 0 && <span className="text-gray-400">/month</span>}
                  </div>
                </div>

                <ul className="space-y-3 flex-grow">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2">
                  <button
                    onClick={() => handleSelectPlan(key)}
                    className={`w-full ${
                      key === 'pro' ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-400 mb-4">All plans include:</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-300">
              <span>✓ Client-side processing</span>
              <span>✓ No file storage</span>
              <span>✓ Complete privacy</span>
              <span>✓ Instant results</span>
              <span>✓ 26+ PDF tools</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
