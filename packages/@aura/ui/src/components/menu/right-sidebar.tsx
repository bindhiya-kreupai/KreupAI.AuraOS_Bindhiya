/**
 * @module RightSidebar
 * @description Right sidebar with Recent Activity and Favorites
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 * @reference docs/aura-uiux-design.md
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  Star,
  ChevronRight,
  X,
  Trash2,
  PanelRightClose,
  PanelRight,
  History,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItem {
  path: string;
  title: string;
  module: string;
  timestamp: number;
  icon?: string;
}

interface FavoriteItem {
  path: string;
  title: string;
  module: string;
  icon?: string;
  addedAt: number;
}

interface RightSidebarProps {
  recentActivity: ActivityItem[];
  favorites: FavoriteItem[];
  onClearActivity?: () => void;
  onRemoveFavorite?: (path: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

type TabType = 'recent' | 'favorites';

export const RightSidebar: React.FC<RightSidebarProps> = ({
  recentActivity,
  favorites,
  onClearActivity,
  onRemoveFavorite,
  collapsed = false,
  onToggleCollapse,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('recent');

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (collapsed) {
    return (
      <aside
        className={cn(
          'w-12 h-full bg-white dark:bg-deep-cosmos border-l border-cloud dark:border-nebula-purple transition-all duration-300 flex flex-col items-center py-4 gap-2',
          className
        )}
      >
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-pearl dark:hover:bg-stellar-blue transition-colors"
          aria-label="Expand sidebar"
        >
          <PanelRight className="w-5 h-5 text-twilight dark:text-silver-mist" />
        </button>
        <div className="w-8 h-px bg-cloud dark:bg-nebula-purple" />
        <button
          onClick={() => {
            setActiveTab('recent');
            onToggleCollapse?.();
          }}
          className={cn(
            'p-2 rounded-lg transition-colors relative',
            activeTab === 'recent'
              ? 'bg-celestial-indigo/10 text-celestial-indigo'
              : 'hover:bg-pearl dark:hover:bg-stellar-blue text-twilight dark:text-silver-mist'
          )}
          title="Recent Activity"
        >
          <History className="w-5 h-5" />
          {recentActivity.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 text-xs bg-celestial-indigo text-white rounded-full flex items-center justify-center">
              {recentActivity.length > 9 ? '9+' : recentActivity.length}
            </span>
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab('favorites');
            onToggleCollapse?.();
          }}
          className={cn(
            'p-2 rounded-lg transition-colors relative',
            activeTab === 'favorites'
              ? 'bg-sunset-amber/10 text-sunset-amber'
              : 'hover:bg-pearl dark:hover:bg-stellar-blue text-twilight dark:text-silver-mist'
          )}
          title="Favorites"
        >
          <Star className="w-5 h-5" />
          {favorites.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 text-xs bg-sunset-amber text-white rounded-full flex items-center justify-center">
              {favorites.length > 9 ? '9+' : favorites.length}
            </span>
          )}
        </button>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        'w-72 h-full bg-white dark:bg-deep-cosmos border-l border-cloud dark:border-nebula-purple transition-all duration-300 flex flex-col',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cloud dark:border-nebula-purple">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-pearl dark:hover:bg-stellar-blue transition-colors"
            aria-label="Collapse sidebar"
          >
            <PanelRightClose className="w-5 h-5 text-twilight dark:text-silver-mist" />
          </button>
          <span className="font-display font-semibold text-ink-black dark:text-pearl">
            Quick Access
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cloud dark:border-nebula-purple">
        <button
          onClick={() => setActiveTab('recent')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors relative',
            activeTab === 'recent'
              ? 'text-celestial-indigo dark:text-quantum-rose'
              : 'text-silver-mist hover:text-twilight dark:hover:text-pearl'
          )}
        >
          <Clock className="w-4 h-4" />
          <span>Recent</span>
          {recentActivity.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-celestial-indigo/10 text-celestial-indigo dark:bg-quantum-rose/10 dark:text-quantum-rose rounded-full">
              {recentActivity.length}
            </span>
          )}
          {activeTab === 'recent' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-celestial-indigo to-quantum-rose" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors relative',
            activeTab === 'favorites'
              ? 'text-sunset-amber'
              : 'text-silver-mist hover:text-twilight dark:hover:text-pearl'
          )}
        >
          <Star className="w-4 h-4" />
          <span>Favorites</span>
          {favorites.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-sunset-amber/10 text-sunset-amber rounded-full">
              {favorites.length}
            </span>
          )}
          {activeTab === 'favorites' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sunset-amber" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'recent' && (
          <div className="p-2">
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-pearl dark:bg-stellar-blue flex items-center justify-center mb-3">
                  <History className="w-6 h-6 text-silver-mist" />
                </div>
                <p className="text-sm text-silver-mist">No recent activity</p>
                <p className="text-xs text-silver-mist/70 mt-1">
                  Pages you visit will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentActivity.map((item) => (
                  <Link
                    key={`${item.path}-${item.timestamp}`}
                    href={item.path}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-pearl dark:hover:bg-stellar-blue transition-colors group"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-celestial-indigo/10 to-quantum-rose/10 flex items-center justify-center">
                      <ChevronRight className="w-4 h-4 text-celestial-indigo dark:text-quantum-rose" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-black dark:text-pearl truncate">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-silver-mist truncate">
                          {item.module}
                        </span>
                        <span className="text-xs text-silver-mist">•</span>
                        <span className="text-xs text-silver-mist">
                          {formatTimestamp(item.timestamp)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="p-2">
            {favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-pearl dark:bg-stellar-blue flex items-center justify-center mb-3">
                  <Star className="w-6 h-6 text-silver-mist" />
                </div>
                <p className="text-sm text-silver-mist">No favorites yet</p>
                <p className="text-xs text-silver-mist/70 mt-1">
                  Click the star icon on menu items to add favorites
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {favorites.map((item) => (
                  <div
                    key={item.path}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-pearl dark:hover:bg-stellar-blue transition-colors group"
                  >
                    <Link
                      href={item.path}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-sunset-amber/10 flex items-center justify-center">
                        <Star className="w-4 h-4 text-sunset-amber fill-sunset-amber" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink-black dark:text-pearl truncate">
                          {item.title}
                        </p>
                        <span className="text-xs text-silver-mist truncate">
                          {item.module}
                        </span>
                      </div>
                    </Link>
                    {onRemoveFavorite && (
                      <button
                        onClick={() => onRemoveFavorite(item.path)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-coral-alert/10 text-silver-mist hover:text-coral-alert transition-all"
                        title="Remove from favorites"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {activeTab === 'recent' && recentActivity.length > 0 && onClearActivity && (
        <div className="p-3 border-t border-cloud dark:border-nebula-purple">
          <button
            onClick={onClearActivity}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-silver-mist hover:text-coral-alert hover:bg-coral-alert/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Recent Activity</span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default RightSidebar;
