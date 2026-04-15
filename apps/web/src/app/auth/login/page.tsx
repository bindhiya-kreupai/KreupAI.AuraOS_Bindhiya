'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@aura/ui/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate login delay
    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-deep-cosmos">
      {/* Left Panel - Branding */}
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
            <span className="font-display font-bold text-3xl text-white">AuraOS</span>
          </div>
          <h2 className="text-4xl font-display font-bold mb-6">
            Welcome back to the future of work.
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            &quot;AuraOS has completely transformed how we manage our global workforce. It&apos;s
            not just HR software; it&apos;s an intelligence platform.&quot;
          </p>
          <div className="mt-8 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20" />
            <div>
              <div className="font-semibold">Sarah Chen</div>
              <div className="text-sm text-white/60">VP of People, TechFlow</div>
            </div>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-24 relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold text-ink-black dark:text-pearl">
              Sign in to your account
            </h1>
            <p className="mt-2 text-twilight dark:text-silver-mist">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/register"
                className="font-medium text-celestial-indigo hover:text-celestial-indigo/80"
              >
                Get started for free
              </Link>
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-black dark:text-pearl">
                Email address
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-cloud dark:border-nebula-purple bg-transparent focus:ring-2 focus:ring-celestial-indigo focus:border-transparent transition-all outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-ink-black dark:text-pearl">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-celestial-indigo hover:text-celestial-indigo/80"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-cloud dark:border-nebula-purple bg-transparent focus:ring-2 focus:ring-celestial-indigo focus:border-transparent transition-all outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-twilight dark:text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-celestial-indigo hover:bg-celestial-indigo/90 text-white rounded-lg font-medium text-base shadow-lg shadow-celestial-indigo/20"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cloud dark:border-nebula-purple" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-deep-cosmos text-twilight dark:text-silver-mist">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center px-4 py-2 border border-cloud dark:border-nebula-purple rounded-lg hover:bg-cloud/50 dark:hover:bg-stellar-blue/10 transition-colors">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center px-4 py-2 border border-cloud dark:border-nebula-purple rounded-lg hover:bg-cloud/50 dark:hover:bg-stellar-blue/10 transition-colors">
              <svg
                className="w-5 h-5 mr-2 text-ink-black dark:text-pearl"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M13.43 12v3.36C18.46 15.36 22 10.74 22 5.5c0-1.09-.17-2.12-.48-3.1H12v3.91h3.9c-.43 2.16-2.31 3.79-4.55 3.79-2.57 0-4.65-2.08-4.65-4.65S8.82.8 11.39.8c1.13 0 2.17.41 2.97 1.08l2.91-2.91C15.65.91 13.63 0 11.39 0 5.1 0 0 5.1 0 11.39s5.1 11.39 11.39 11.39c6.29 0 11.39-5.1 11.39-11.39H13.43z" />
              </svg>
              SSO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
