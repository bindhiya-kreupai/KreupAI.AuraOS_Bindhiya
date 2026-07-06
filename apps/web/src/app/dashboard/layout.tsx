'use client';

import React, { useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarMenu, TopNav } from '@aura/ui/components/menu';
import { RightPanel } from '@aura/ui/components/layout';
import { Info } from 'lucide-react';
import { SearchProvider, useSearch } from '@/stores/search-store';
import { ThemeProvider, useTheme } from '@/stores/theme-store';

// Modules that currently render demo UI only — their pages don't fetch from
// any /api/ endpoint. Listed here so users see a clear "preview" banner
// instead of wondering why nothing happens when they click.
const PREVIEW_MODULES = new Set<string>([
  'agriculture',
  'ai',
  'ai-automation',
  'automotive',
  'aviation',
  'career',
  'collaboration',
  'community',
  'construction',
  'education',
  'energy',
  'esg',
  'expenses',
  'facilities',
  'financial-services',
  'government',
  'healthcare',
  'hospitality',
  'hr-helpdesk',
  'industry',
  'industry-solutions',
  'integration-hub',
  'legal',
  'localization',
  'logistics',
  'manufacturing',
  'maritime',
  'media',
  'mining',
  'mobility',
  'nonprofit',
  'org-design',
  'overview',
  'position-budgeting',
  'projects',
  'remote-work',
  'retail',
  'reveal',
]);

interface FavoriteItem {
  path: string;
  title: string;
  module: string;
  icon?: string;
}

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const pathname = usePathname() || '';
  const moduleSegment = pathname.split('/').filter(Boolean)[1];
  const isPreviewModule = !!moduleSegment && PREVIEW_MODULES.has(moduleSegment);

  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const { setIsOpen: setSearchOpen } = useSearch();

  const handleSignOut = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Continue client-side cleanup
    }
    // Clear client-side cookies
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

  const handleToggleFavorite = useCallback((item: FavoriteItem) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.path === item.path);
      if (exists) {
        return prev.filter((f) => f.path !== item.path);
      }
      return [...prev, item];
    });
  }, []);

  const handleNavigate = useCallback((item: { path: string; title: string; module: string }) => {
    // Track navigation for recent activity
    console.log('Navigated to:', item);
  }, []);

  return (
    <div className="flex h-screen bg-pearl dark:bg-deep-cosmos overflow-hidden">
      {/* Sidebar */}
      <SidebarMenu
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        onNavigate={handleNavigate}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation */}
        <TopNav
          onSearchClick={() => setSearchOpen(true)}
          onAIAssistantClick={handleAIAssistantClick}
          onHelpClick={handleHelpClick}
          onSignOut={handleSignOut}
          isDark={isDark}
          onThemeToggle={toggleTheme}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-2 scroll-smooth pr-16">
          <div className="max-w-full mx-auto w-full h-full">
            {isPreviewModule && (
              <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 px-4 py-2.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Preview module.</strong> This area shows the planned UI. Backend APIs for{' '}
                  <code className="px-1 mx-1 bg-amber-100 dark:bg-amber-900/40 rounded font-mono">
                    {moduleSegment}
                  </code>
                  are still being scaffolded, so data may be illustrative only.
                </p>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>

      {/* Right Panel (Action Hub) */}
      <RightPanel />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SearchProvider>
        <DashboardLayoutInner>{children}</DashboardLayoutInner>
      </SearchProvider>
    </ThemeProvider>
  );
}
