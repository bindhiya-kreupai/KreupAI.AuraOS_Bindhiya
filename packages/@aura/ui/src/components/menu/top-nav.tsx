/**
 * @module TopNav
 * @description Top navigation bar for AURA HCM
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 * @reference docs/aura-uiux-design.md
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Menu,
  Search,
  Bell,
  Settings,
  HelpCircle,
  User,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  MessageSquare,
} from 'lucide-react';
import { cn } from '../../utils';

interface TopNavProps {
  onMenuClick?: () => void;
  className?: string;
}

export const TopNav: React.FC<TopNavProps> = ({ onMenuClick, className }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex items-center justify-between h-16 px-4 bg-white/90 dark:bg-deep-cosmos/90 backdrop-blur-xl border-b border-cloud dark:border-nebula-purple border-t-4 border-t-brand-blue shadow-sm',
        className
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-brand-blue/10 text-brand-blue transition-colors group"
        >
          <Menu className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-1 rounded-lg bg-aurora-gradient shadow-sm group-hover:scale-105 transition-transform">
            <Image
              src="/images/auraos-logo.png"
              alt="AuraOS"
              width={32}
              height={32}
              className="w-8 h-8 object-contain mix-blend-screen"
            />
          </div>
          <span className="hidden sm:block font-display font-bold text-ink-black dark:text-pearl text-lg tracking-tight">
            AuraOS
          </span>
        </Link>

        {/* Search */}
        <div className="hidden md:flex items-center">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-blue transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              className="w-64 lg:w-80 pl-10 pr-4 py-2 bg-brand-blue/5 dark:bg-stellar-blue rounded-xl text-sm text-ink-black dark:text-pearl placeholder:text-silver-mist border-2 border-brand-blue/10 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 focus:outline-none transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-silver-mist bg-cloud dark:bg-nebula-purple rounded">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* AI Assistant */}
        <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-aurora-gradient text-white text-sm font-medium hover:opacity-90 transition-all shadow-glow-indigo active:scale-95">
          <MessageSquare className="w-4 h-4" />
          <span>AI</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-lg hover:bg-brand-blue/10 text-brand-blue transition-colors"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-sunset-amber" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {/* Help */}
        <button className="hidden sm:block p-2 rounded-lg hover:bg-brand-blue/10 text-brand-blue transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 rounded-lg hover:bg-brand-blue/10 text-brand-blue transition-colors relative group"
          >
            <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-red rounded-full ring-2 ring-white dark:ring-deep-cosmos animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-stellar-blue rounded-xl shadow-lg border border-cloud dark:border-nebula-purple overflow-hidden">
              <div className="p-4 border-b border-cloud dark:border-nebula-purple">
                <h3 className="font-semibold text-ink-black dark:text-pearl">
                  Notifications
                </h3>
              </div>
              <div className="p-4 text-sm text-silver-mist text-center">
                No new notifications
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <Link
          href="/settings"
          className="hidden sm:block p-2 rounded-lg hover:bg-brand-blue/10 text-brand-blue transition-colors"
        >
          <Settings className="w-5 h-5" />
        </Link>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-pearl dark:hover:bg-stellar-blue transition-colors border border-transparent hover:border-cloud dark:hover:border-nebula-purple"
          >
            <div className="w-8 h-8 rounded-full bg-aurora-gradient flex items-center justify-center ring-2 ring-white dark:ring-deep-cosmos shadow-sm">
              <User className="w-4 h-4 text-white" />
            </div>
            <ChevronDown className="hidden sm:block w-4 h-4 text-twilight dark:text-silver-mist" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-stellar-blue rounded-xl shadow-lg border border-cloud dark:border-nebula-purple overflow-hidden">
              <div className="p-4 border-b border-cloud dark:border-nebula-purple">
                <p className="font-semibold text-ink-black dark:text-pearl">
                  John Doe
                </p>
                <p className="text-sm text-silver-mist">Super Admin</p>
              </div>
              <div className="p-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-twilight dark:text-silver-mist hover:bg-pearl dark:hover:bg-nebula-purple transition-colors"
                >
                  <User className="w-4 h-4" />
                  My Profile
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-twilight dark:text-silver-mist hover:bg-pearl dark:hover:bg-nebula-purple transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-coral-alert hover:bg-coral-alert/10 transition-colors">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;
