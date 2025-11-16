'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AuthNav from '@/components/layout/AuthNav';
import Footer from '@/components/layout/Footer';
import { PLANS } from '@/lib/utils/constants';
import { Check, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planKey = searchParams.get('plan') || 'pro';
  const { user, profile, loading } = useAuth(true); // Require authentication

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingRazorpay, setLoadingRazorpay] = useState(true);

  const selectedPlan = PLANS[planKey as keyof typeof PLANS];

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setLoadingRazorpay(false);
    script.onerror = () => {
      setError('Failed to load payment gateway. Please try again later.');
      setLoadingRazorpay(false);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Redirect if user already has this plan or higher
  useEffect(() => {
    if (profile && !loading) {
      if (profile.plan_type === planKey) {
        router.push('/dashboard?message=already-subscribed');
      } else if (profile.plan_type === 'enterprise' && planKey !== 'enterprise') {
        router.push('/dashboard?message=already-subscribed');
      } else if (profile.plan_type === 'pro' && planKey === 'free') {
        router.push('/dashboard?message=downgrade-not-supported');
      }
    }
  }, [profile, planKey, loading, router]);

  const handlePayment = async () => {
    if (!user || !profile || !selectedPlan) return;

    // Free plan - just update directly
    if (planKey === 'free') {
      try {
        setProcessing(true);
        const { error } = await supabase
          .from('profiles')
          .update({
            plan_type: 'free',
            credits_remaining: PLANS.free.credits,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) throw error;

        router.push('/dashboard?message=plan-updated');
      } catch (err: any) {
        setError(err.message || 'Failed to update plan');
      } finally {
        setProcessing(false);
      }
      return;
    }

    // Paid plans - use Razorpay
    try {
      setProcessing(true);
      setError(null);

      // Create order
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: planKey,
          amount: selectedPlan.price,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'GBP',
        name: 'PDFSuit',
        description: `${selectedPlan.name} Plan Subscription`,
        order_id: order.id,
        prefill: {
          email: user.email,
          name: profile.full_name || user.email?.split('@')[0],
        },
        theme: {
          color: '#FF0000',
        },
        handler: async function (response: any) {
          // Verify payment
          try {
            const verifyResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user.id,
                planType: planKey,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            // Update user plan in Supabase
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                plan_type: planKey,
                credits_remaining: selectedPlan.credits === -1 ? 999999 : selectedPlan.credits,
                subscription_id: response.razorpay_payment_id,
                updated_at: new Date().toISOString(),
              })
              .eq('id', user.id);

            if (updateError) throw updateError;

            // Redirect to dashboard with success message
            router.push('/dashboard?message=payment-success');
          } catch (err: any) {
            setError(err.message || 'Payment verification failed');
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      setError(err.message || 'Failed to process payment');
      setProcessing(false);
    }
  };

  if (loading || !selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <AuthNav />
      <main className="min-h-screen pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gradient mb-4">Complete Your Upgrade</h1>
            <p className="text-gray-400">
              You're upgrading to the <span className="text-primary font-semibold">{selectedPlan.name}</span> plan
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Plan Details */}
            <div className="card space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{selectedPlan.name} Plan</h2>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-bold text-gradient-red">
                    £{selectedPlan.price}
                  </span>
                  {selectedPlan.price > 0 && <span className="text-gray-400">/month</span>}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">What's included:</h3>
                <ul className="space-y-3">
                  {selectedPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Payment Section */}
            <div className="card space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Payment Details</h2>
                <p className="text-gray-400 text-sm">
                  Secure payment powered by Razorpay
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-red-400 font-semibold mb-1">Payment Error</h3>
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-800 space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Current Plan:</span>
                  <span className="font-semibold capitalize">{profile?.plan_type || 'Free'}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>New Plan:</span>
                  <span className="font-semibold text-primary capitalize">{planKey}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-white pt-3 border-t border-gray-800">
                  <span>Total:</span>
                  <span className="text-primary">£{selectedPlan.price}/month</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={processing || loadingRazorpay}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : loadingRazorpay ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading Payment Gateway...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>
                      {selectedPlan.price === 0 ? 'Confirm Downgrade' : 'Proceed to Payment'}
                    </span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                By proceeding, you agree to our Terms of Service and Privacy Policy.
                {selectedPlan.price > 0 && ' Your subscription will renew monthly.'}
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/pricing')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Pricing
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
