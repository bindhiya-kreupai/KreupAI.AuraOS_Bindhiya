/**
 * @module AppLayout
 * @description Main application layout with sidebar navigation
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 * @reference docs/aura-uiux-design.md
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarMenu, MobileMenu, TopNav, RightSidebar } from '@aura/ui/components/menu';
import { cn } from '@/lib/utils';
import { ActivityProvider, useActivity } from '@/stores/activity-store';
import { SearchProvider, useSearch } from '@/stores/search-store';
import { ThemeProvider, useTheme } from '@/stores/theme-store';
import { GlobalSearchCommand } from '@/components/search/GlobalSearchCommand';
import HRChatbot from '@/components/ai/HRChatbot';
import { useCurrentUser } from '@/lib/auth/AuthProvider';

interface AppLayoutProps {
  children: React.ReactNode;
}

// Inner component that uses the activity context
const AppLayoutInner: React.FC<AppLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { recentActivity, favorites, addActivity, clearActivity, toggleFavorite, removeFavorite } =
    useActivity();
  const { setIsOpen: setSearchOpen } = useSearch();
  const { isDark, toggleTheme } = useTheme();
  const { user: currentUser } = useCurrentUser();

  const handleSignOut = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Continue with client-side cleanup even if API call fails
    }
    // Clear client-side auth state
    document.cookie.split(';').forEach((c) => {
      const name = c.trim().split('=')[0];
      if (name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    });
    localStorage.removeItem('aura_token');
    localStorage.removeItem('aura_session');
    router.push('/auth/login');
  }, [router]);

  const handleAIAssistantClick = useCallback(() => {
    window.dispatchEvent(new CustomEvent('aura:toggle-chatbot'));
  }, []);

  const handleHelpClick = useCallback(() => {
    router.push('/dashboard/hr-helpdesk');
  }, [router]);

  // Track page visits for recent activity
  useEffect(() => {
    if (pathname && pathname !== '/') {
      // Extract page title from pathname
      const pathParts = pathname.split('/').filter(Boolean);
      const pageName = pathParts[pathParts.length - 1] || 'Dashboard';
      const title = pageName
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Extract module name (2nd or 3rd level from path)
      const moduleName =
        pathParts.length > 2
          ? pathParts
              .slice(1, 3)
              .map((p) =>
                p
                  .split('-')
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' ')
              )
              .join(' > ')
          : pathParts.length > 1
            ? pathParts[1]
                .split('-')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ')
            : 'Home';

      addActivity({
        path: pathname,
        title,
        module: moduleName,
      });
    }
  }, [pathname, addActivity]);

  const handleNavigate = (item: { path: string; title: string; module: string }) => {
    addActivity(item);
  };

  const handleToggleFavorite = (item: { path: string; title: string; module: string }) => {
    toggleFavorite(item);
  };

  return (
    <div className="min-h-screen bg-white-glow dark:bg-deep-cosmos">
      {/* Global Search Command Palette */}
      <GlobalSearchCommand />

      {/* Top Navigation */}
      <TopNav
        onMenuClick={() => setMobileMenuOpen(true)}
        onSearchClick={() => setSearchOpen(true)}
        onAIAssistantClick={handleAIAssistantClick}
        onHelpClick={handleHelpClick}
        onSignOut={handleSignOut}
        isDark={isDark}
        onThemeToggle={toggleTheme}
        user={currentUser}
      />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <SidebarMenu
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onNavigate={handleNavigate}
          />
        </div>

        {/* Mobile Menu */}
        <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

        {/* Main Content */}
        <main
          className={cn(
            'flex-1 overflow-y-auto p-6 transition-all duration-300',
            sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-0'
          )}
        >
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>

        {/* Right Sidebar - Recent Activity & Favorites */}
        <div className="hidden lg:block">
          <RightSidebar
            recentActivity={recentActivity}
            favorites={favorites}
            onClearActivity={clearActivity}
            onRemoveFavorite={removeFavorite}
            collapsed={rightSidebarCollapsed}
            onToggleCollapse={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
          />
        </div>
      </div>

      {/* Floating HR AI Chatbot — available on all pages */}
      <HRChatbot />
    </div>
  );
};

// Main component that wraps with provider
export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <ActivityProvider>
        <SearchProvider>
          <AppLayoutInner>{children}</AppLayoutInner>
        </SearchProvider>
      </ActivityProvider>
    </ThemeProvider>
  );
};

export default AppLayout;
