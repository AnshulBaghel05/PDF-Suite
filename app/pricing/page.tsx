'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import AuthNav from '@/components/layout/AuthNav';
import Footer from '@/components/layout/Footer';
import { PLANS } from '@/lib/utils/constants';
import { Check, Zap } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PricingPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuthContext();

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const loadRazorpayScript = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const handleSelectPlan = async (planKey: string) => {
    // Check if user is logged in
    if (!isAuthenticated) {
      // Redirect to login with return URL
      router.push(`/login?redirect=/pricing&plan=${planKey}`);
      return;
    }

    // If user is logged in and selecting free plan, redirect to dashboard
    if (planKey === 'free') {
      router.push('/dashboard');
      return;
    }

    // For paid plans, open Razorpay payment
    openRazorpayPayment(planKey);
  };

  const openRazorpayPayment = (planKey: string) => {
    const plan = PLANS[planKey as keyof typeof PLANS];

    if (!plan) return;

    const userEmail = user?.email || '';
    const userName = user?.user_metadata?.full_name || '';

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_your_key_id',
      amount: plan.price * 100,
      currency: 'GBP',
      name: 'PDFSuit',
      description: `${plan.name} Plan - Monthly Subscription`,
      image: '/logo.png',
      handler: async function (response: any) {
        console.log('Payment successful:', response);

        try {
          router.push('/dashboard?message=payment-success');
        } catch (error) {
          console.error('Error updating subscription:', error);
          router.push('/dashboard?message=payment-failed');
        }
      },
      prefill: {
        name: userName,
        email: userEmail,
      },
      theme: {
        color: '#EF4444',
      },
      modal: {
        ondismiss: function() {
          console.log('Payment cancelled by user');
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  return (
    <>
      {isAuthenticated ? <AuthNav /> : <Header />}
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
                className={`card space-y-6 flex flex-col ${
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

                <button
                  onClick={() => handleSelectPlan(key)}
                  className={`w-full ${
                    key === 'pro' ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  Get Started
                </button>
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
              <span>✓ 26 PDF tools</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
