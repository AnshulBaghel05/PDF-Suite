'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Cookie, Shield } from 'lucide-react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, cannot be disabled
    functional: false,
    analytics: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(consent);
        setPreferences(saved);
      } catch (e) {
        // Invalid JSON, show banner
        setShowBanner(true);
      }
    }
  }, []);

  const savePreferences = (prefs: typeof preferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
    };
    setPreferences(allAccepted);
    savePreferences(allAccepted);
  };

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      functional: false,
      analytics: false,
    };
    setPreferences(necessaryOnly);
    savePreferences(necessaryOnly);
  };

  const saveCustom = () => {
    savePreferences(preferences);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom">
        <div className="max-w-6xl mx-auto">
          <div className="glass border border-white/20 rounded-lg p-6 md:p-8 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                  <Cookie className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    🍪 We Value Your Privacy
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    We use cookies to enhance your experience, analyze site traffic, and provide personalized content.
                    Your privacy matters to us - all PDF processing happens in your browser, and we never access your files.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={acceptAll}
                      className="btn-primary px-6 py-2 text-sm"
                    >
                      Accept All
                    </button>
                    <button
                      onClick={acceptNecessary}
                      className="btn-secondary px-6 py-2 text-sm"
                    >
                      Necessary Only
                    </button>
                    <button
                      onClick={() => setShowSettings(true)}
                      className="text-primary hover:text-primary/80 transition-colors text-sm font-medium"
                    >
                      Customize Settings
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-400">
                    <Link href="/privacy" className="hover:text-white transition-colors">
                      Privacy Policy
                    </Link>
                    <Link href="/cookies" className="hover:text-white transition-colors">
                      Cookie Policy
                    </Link>
                    <Link href="/terms" className="hover:text-white transition-colors">
                      Terms of Service
                    </Link>
                  </div>
                </div>
              </div>
              <button
                onClick={acceptNecessary}
                className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass border border-white/20 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Shield className="w-8 h-8 text-primary" />
                  <h2 className="text-2xl font-bold text-white">Cookie Preferences</h2>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-gray-300 text-sm mb-6">
                Customize your cookie preferences below. Essential cookies cannot be disabled as they are required for the website to function.
              </p>

              <div className="space-y-6">
                {/* Necessary Cookies */}
                <div className="border border-white/10 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">
                      Essential Cookies
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">Always Active</span>
                      <div className="w-12 h-6 bg-primary rounded-full relative">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">
                    These cookies are necessary for the website to function and cannot be disabled. They include authentication, security, and basic functionality.
                  </p>
                </div>

                {/* Functional Cookies */}
                <div className="border border-white/10 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">
                      Functional Cookies
                    </h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.functional}
                        onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-gray-700 peer-checked:bg-primary rounded-full peer transition-colors">
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${preferences.functional ? 'translate-x-6' : ''}`}></div>
                      </div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-400">
                    These cookies enable enhanced functionality like remembering your theme preference and last used tools.
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="border border-white/10 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">
                      Analytics Cookies
                    </h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-gray-700 peer-checked:bg-primary rounded-full peer transition-colors">
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${preferences.analytics ? 'translate-x-6' : ''}`}></div>
                      </div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-400">
                    These cookies help us understand how you use our website so we can improve your experience. All data is anonymous.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={saveCustom}
                  className="btn-primary flex-1"
                >
                  Save Preferences
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                You can change your preferences at any time in your account settings or by visiting our{' '}
                <Link href="/cookies" className="text-primary hover:underline">Cookie Policy</Link>.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
