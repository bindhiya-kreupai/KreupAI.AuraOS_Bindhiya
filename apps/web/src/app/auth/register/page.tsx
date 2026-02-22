'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@aura/ui/components/ui/button';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate register delay
    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-deep-cosmos">
      {/* Left Panel - Branding (Matching Login Page) */}
      <div className="hidden lg:flex lg:w-1/2 bg-celestial-indigo relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-celestial-indigo to-quantum-rose opacity-90" />

        <div className="relative z-10 text-white max-w-lg">
          <div className="mb-8 flex items-center gap-3">
            <Image
              src="/images/auraos-logo.png"
              alt="AuraOS"
              width={60}
              height={60}
              className="w-[60px] h-[60px] object-contain rounded-xl bg-white/10 p-1 mix-blend-screen"
            />
            <span className="font-display font-bold text-3xl">AuraOS</span>
          </div>

          <h2 className="text-4xl font-display font-bold mb-6">Join the workforce revolution.</h2>
          <ul className="space-y-6 text-lg text-white/80 leading-relaxed">
            <li className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <span className="text-white text-sm">✓</span>
              </div>
              <span>Free 14-day trial of Enterprise plan</span>
            </li>
            <li className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <span className="text-white text-sm">✓</span>
              </div>
              <span>No credit card required</span>
            </li>
            <li className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <span className="text-white text-sm">✓</span>
              </div>
              <span>Full access to AI & Automation agents</span>
            </li>
          </ul>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-24 relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold text-ink-black dark:text-pearl">
              Create your account
            </h1>
            <p className="mt-2 text-twilight dark:text-silver-mist">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-celestial-indigo hover:text-celestial-indigo/80"
              >
                Sign in
              </Link>
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleRegister}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-ink-black dark:text-pearl">
                  First name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-cloud dark:border-nebula-purple bg-transparent focus:ring-2 focus:ring-celestial-indigo outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-ink-black dark:text-pearl">
                  Last name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-cloud dark:border-nebula-purple bg-transparent focus:ring-2 focus:ring-celestial-indigo outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-black dark:text-pearl">
                Work email
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-cloud dark:border-nebula-purple bg-transparent focus:ring-2 focus:ring-celestial-indigo outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-black dark:text-pearl">
                Company name
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-lg border border-cloud dark:border-nebula-purple bg-transparent focus:ring-2 focus:ring-celestial-indigo outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-black dark:text-pearl">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-lg border border-cloud dark:border-nebula-purple bg-transparent focus:ring-2 focus:ring-celestial-indigo outline-none"
              />
              <p className="text-xs text-twilight">Must be at least 8 characters</p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-celestial-indigo hover:bg-celestial-indigo/90 text-white rounded-lg font-medium text-base shadow-lg shadow-celestial-indigo/20 mt-4"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Get Started'}
            </Button>
          </form>

          <p className="text-center text-xs text-twilight dark:text-silver-mist">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-ink-black">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline hover:text-ink-black">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
