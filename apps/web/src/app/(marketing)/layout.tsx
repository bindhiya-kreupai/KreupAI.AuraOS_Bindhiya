import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@aura/ui/components/ui/button';

// Temporary inline components until moved to @aura/ui
const MarketingNavbar = () => (
  <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-deep-cosmos/80 backdrop-blur-md border-b border-cloud dark:border-nebula-purple">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center gap-3">
          <Image
            src="/images/auraos-logo.png"
            alt="AuraOS"
            width={60}
            height={60}
            className="w-[60px] h-[60px] object-contain"
            priority
          />
          <span className="font-display font-bold text-xl text-ink-black dark:text-pearl">
            AuraOS
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center space-x-8">
          <Link
            href="/solutions"
            className="text-sm font-medium text-twilight dark:text-silver-mist hover:text-celestial-indigo dark:hover:text-quantum-rose transition-colors"
          >
            Solutions
          </Link>
          <Link
            href="/platform"
            className="text-sm font-medium text-twilight dark:text-silver-mist hover:text-celestial-indigo dark:hover:text-quantum-rose transition-colors"
          >
            Platform
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-twilight dark:text-silver-mist hover:text-celestial-indigo dark:hover:text-quantum-rose transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-twilight dark:text-silver-mist hover:text-celestial-indigo dark:hover:text-quantum-rose transition-colors"
          >
            About
          </Link>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-twilight dark:text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors"
          >
            Login
          </Link>
          <Link href="/auth/register">
            <Button className="bg-celestial-indigo hover:bg-celestial-indigo/90 text-white rounded-full px-6">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </nav>
);

const MarketingFooter = () => (
  <footer className="bg-white dark:bg-deep-cosmos border-t border-cloud dark:border-nebula-purple pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <div>
          <h3 className="font-semibold text-ink-black dark:text-pearl mb-4">Product</h3>
          <ul className="space-y-2 text-sm text-twilight dark:text-silver-mist">
            <li>
              <Link href="/solutions">Solutions</Link>
            </li>
            <li>
              <Link href="/platform">Platform</Link>
            </li>
            <li>
              <Link href="/pricing">Pricing</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-ink-black dark:text-pearl mb-4">Company</h3>
          <ul className="space-y-2 text-sm text-twilight dark:text-silver-mist">
            <li>
              <Link href="/about">About Us</Link>
            </li>
            <li>
              <Link href="/careers">Careers</Link>
            </li>
            <li>
              <Link href="/blog">Blog</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-ink-black dark:text-pearl mb-4">Resources</h3>
          <ul className="space-y-2 text-sm text-twilight dark:text-silver-mist">
            <li>
              <Link href="/docs">Documentation</Link>
            </li>
            <li>
              <Link href="/support">Support</Link>
            </li>
            <li>
              <Link href="/community">Community</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-ink-black dark:text-pearl mb-4">Legal</h3>
          <ul className="space-y-2 text-sm text-twilight dark:text-silver-mist">
            <li>
              <Link href="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms">Terms of Service</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cloud dark:border-nebula-purple pt-8 text-center text-sm text-silver-mist">
        © {new Date().getFullYear()} KreupAI Technologies. All rights reserved.
      </div>
    </div>
  </footer>
);

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-pearl dark:bg-deep-cosmos flex flex-col font-sans">
      <MarketingNavbar />
      <main className="flex-grow pt-16">{children}</main>
      <MarketingFooter />
    </div>
  );
}
