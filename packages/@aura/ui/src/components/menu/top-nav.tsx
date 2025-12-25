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
import { cn } from '@/lib/utils';

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
        'sticky top-0 z-40 flex items-center justify-between h-16 px-4 bg-white/80 dark:bg-deep-cosmos/80 backdrop-blur-xl border-b border-cloud dark:border-nebula-purple',
        className
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-pearl dark:hover:bg-stellar-blue transition-colors"
        >
          <Menu className="w-6 h-6 text-twilight dark:text-silver-mist" />
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="hidden sm:block font-display font-semibold text-ink-black dark:text-pearl">
            AuraOS
          </span>
        </Link>

        {/* Search */}
        <div className="hidden md:flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
            <input
              type="text"
              placeholder="Search..."
              className="w-64 lg:w-80 pl-10 pr-4 py-2 bg-pearl dark:bg-stellar-blue rounded-xl text-sm text-ink-black dark:text-pearl placeholder:text-silver-mist border-2 border-transparent focus:border-celestial-indigo focus:outline-none transition-colors"
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
        <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-celestial-indigo to-quantum-rose text-white text-sm font-medium hover:opacity-90 transition-opacity">
          <MessageSquare className="w-4 h-4" />
          <span>AI</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-lg hover:bg-pearl dark:hover:bg-stellar-blue transition-colors"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-sunset-amber" />
          ) : (
            <Moon className="w-5 h-5 text-twilight dark:text-silver-mist" />
          )}
        </button>

        {/* Help */}
        <button className="hidden sm:block p-2 rounded-lg hover:bg-pearl dark:hover:bg-stellar-blue transition-colors">
          <HelpCircle className="w-5 h-5 text-twilight dark:text-silver-mist" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 rounded-lg hover:bg-pearl dark:hover:bg-stellar-blue transition-colors relative"
          >
            <Bell className="w-5 h-5 text-twilight dark:text-silver-mist" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-quantum-rose rounded-full" />
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
          className="hidden sm:block p-2 rounded-lg hover:bg-pearl dark:hover:bg-stellar-blue transition-colors"
        >
          <Settings className="w-5 h-5 text-twilight dark:text-silver-mist" />
        </Link>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-pearl dark:hover:bg-stellar-blue transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neural-mint to-celestial-indigo flex items-center justify-center">
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
