/**
 * @module SidebarMenu
 * @description Main sidebar navigation component for AURA HCM
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 * @reference docs/aura-uiux-design.md
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { ChevronDown, ChevronRight, Search, X, PanelLeftClose, PanelLeft, Star } from 'lucide-react';
import { cn } from '../../utils';
import { getMenuIcon } from './menu-icons';
import { superAdminMenu } from '@aura/config';
import type { MenuIconName } from '@aura/types';

interface FavoriteItem {
  path: string;
  title: string;
  module: string;
  icon?: string;
}

interface SidebarMenuProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
  favorites?: FavoriteItem[];
  onToggleFavorite?: (item: FavoriteItem) => void;
  onNavigate?: (item: { path: string; title: string; module: string }) => void;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({
  collapsed = false,
  onToggleCollapse,
  className,
  favorites = [],
  onToggleFavorite,
  onNavigate,
}) => {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [expandedSubModule, setExpandedSubModule] = useState<string | null>(null);

  // Check if a path is favorited
  const isFavorite = useCallback(
    (path: string) => favorites.some((f) => f.path === path),
    [favorites]
  );

  // Convert menu data to path format
  const getModulePath = (module: typeof superAdminMenu.items[0]) => {
    if (module.path) return module.path;
    return `/${module.code.toLowerCase().replace(/_/g, '-')}`;
  };

  // Filter modules based on search
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) {
      return superAdminMenu.items;
    }

    const query = searchQuery.toLowerCase();
    return superAdminMenu.items.filter(
      (module) =>
        module.label.toLowerCase().includes(query) ||
        module.features.some((feature) => feature.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  // Toggle parent module expansion (accordion - only one open at a time)
  const toggleModule = useCallback((code: string) => {
    console.log('toggleModule called with:', code, 'current expanded:', expandedModule);
    if (expandedModule === code) {
      setExpandedModule(null);
      setExpandedSubModule(null); // Also close sub-modules
    } else {
      setExpandedModule(code);
      setExpandedSubModule(null); // Reset sub-module when switching parent
    }
  }, [expandedModule]);

  // Toggle sub-module expansion (accordion - only one open at a time)
  const toggleSubModule = useCallback((code: string) => {
    console.log('toggleSubModule called with:', code, 'current expanded:', expandedSubModule);
    setExpandedSubModule(prev => prev === code ? null : code);
  }, [expandedSubModule]);



  // Check if feature is active
  const getFeaturePath = (module: typeof superAdminMenu.items[0], featureName: string) => {
    const modulePath = getModulePath(module);
    const featureSlug = featureName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return `${modulePath}/${featureSlug}`;
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-gradient-to-b from-[#0a1e3d] via-[#0f2a52] to-[#132f5e] border-r border-white/10 transition-all duration-300 shadow-xl',
        collapsed ? 'w-16' : 'w-72',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 shadow-md">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-xl bg-white/10 backdrop-blur-md shadow-inner border border-white/20">
              <Image
                src="/images/auraos-logo.png"
                alt="AuraOS"
                width={40}
                height={40}
                className="w-10 h-10 object-contain mix-blend-screen"
              />
            </div>
            <span className="font-display font-bold text-white tracking-tight text-lg drop-shadow-md">
              AuraOS
            </span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-white/10 transition-all text-white hover:text-white"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeft className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center">
        {!collapsed ? (
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70 group-focus-within:text-white transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search modules..."
              className={cn(
                "w-full pl-10 py-2 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all",
                searchQuery ? 'pr-8' : 'pr-4'
              )}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5 text-white/70" />
              </button>
            )}
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <button className="p-2 rounded-xl bg-white/10 text-white/70 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {filteredModules.map((module) => {
          const Icon = getMenuIcon(module.icon as MenuIconName);
          const hasSubModules = module.items && module.items.length > 0;

          // Check if module or any of its sub-modules is active
          const isModuleActive = (mod: typeof superAdminMenu.items[0]): boolean => {
            const modPath = getModulePath(mod);
            if (pathname.startsWith(modPath)) return true;
            if (mod.items) {
              return mod.items.some(sub => isModuleActive(sub));
            }
            return false;
          };

          const isActive = isModuleActive(module);
          const isExpanded = expandedModule === module.code;

          return (
            <div key={module.code}>
              {/* Module Item */}
              <div
                className={cn(
                  'group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all duration-200 relative overflow-hidden',
                  isActive
                    ? 'bg-brand-red text-white shadow-lg font-bold scale-[1.02] z-10'
                    : 'text-white hover:bg-white/10'
                )}
                onClick={() => !collapsed && toggleModule(module.code)}
              >
                <div
                  className={cn(
                    'flex-shrink-0 p-1.5 rounded-lg transition-colors',
                    isActive
                      ? 'bg-white/20'
                      : 'text-white group-hover:bg-white/5'
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {!collapsed && (
                  <>
                    <span className="flex-1 text-sm font-medium truncate">
                      {module.label}
                    </span>
                    {/* Show item count or chevron */}
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 transition-transform duration-200 text-silver-mist',
                        isExpanded ? 'rotate-180' : ''
                      )}
                    />
                  </>
                )}
              </div>

              {/* Sub-Items (Features or Sub-Modules) */}
              {!collapsed && isExpanded && (
                <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-cloud dark:border-nebula-purple pl-4">

                  {/* Scenario A: Module has sub-modules (e.g. Vertical Solutions) */}
                  {hasSubModules ? (
                    module.items?.map((subModule) => {
                      const SubIcon = getMenuIcon(subModule.icon as MenuIconName);
                      const isSubActive = isModuleActive(subModule);
                      const isSubExpanded = expandedSubModule === subModule.code;

                      return (
                        <div key={subModule.code} className="mb-2">
                          <div
                            className={cn(
                              "flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors text-sm",
                              isSubActive
                                ? "bg-brand-red text-white font-bold shadow-md"
                                : "text-white hover:bg-white/10"
                            )}
                            onClick={() => toggleSubModule(subModule.code)}
                          >
                            <SubIcon className="w-4 h-4 opacity-70" />
                            <span className="flex-1 truncate">{subModule.label}</span>
                            <ChevronDown className={cn("w-3 h-3 transition-transform", isSubExpanded ? "rotate-180" : "")} />
                          </div>

                          {/* Sub-Module Features */}
                          {isSubExpanded && (
                            <div className="ml-3 mt-0.5 space-y-0.5 border-l border-slate-200 dark:border-slate-700 pl-3">
                              {subModule.features.map(feature => {
                                const featurePath = getFeaturePath(subModule, feature);
                                const isFeatureActive = pathname === featurePath;
                                const featureIsFavorite = isFavorite(featurePath);
                                return (
                                  <div
                                    key={feature}
                                    className={cn(
                                      'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all group relative',
                                      isFeatureActive
                                        ? 'bg-brand-red text-white font-bold shadow-md'
                                        : 'text-white hover:bg-white/10'
                                    )}
                                  >
                                    <Link
                                      href={featurePath}
                                      onClick={() => onNavigate?.({ path: featurePath, title: feature, module: subModule.label })}
                                      className="flex items-center gap-2 flex-1 min-w-0"
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
                                      <span className="truncate">{feature}</span>
                                    </Link>
                                    {onToggleFavorite && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onToggleFavorite({ path: featurePath, title: feature, module: subModule.label });
                                        }}
                                        className={cn(
                                          'p-0.5 rounded transition-all',
                                          featureIsFavorite
                                            ? 'text-brand-red opacity-100 scale-110'
                                            : 'opacity-0 group-hover:opacity-100 text-silver-mist hover:text-brand-red hover:scale-110'
                                        )}
                                        title={featureIsFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                      >
                                        <Star className={cn('w-3 h-3', featureIsFavorite && 'fill-current')} />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    /* Scenario B: Standard Module with just features */
                    module.features.map((feature) => {
                      const featurePath = getFeaturePath(module, feature);
                      const isFeatureActive = pathname === featurePath;
                      const featureIsFavorite = isFavorite(featurePath);

                      return (
                        <div
                          key={feature}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all group relative',
                            isFeatureActive
                              ? 'bg-brand-red text-white font-bold shadow-md'
                              : 'text-white hover:bg-white/10'
                          )}
                        >
                          <Link
                            href={featurePath}
                            onClick={() => onNavigate?.({ path: featurePath, title: feature, module: module.label })}
                            className="flex items-center gap-2 flex-1 min-w-0"
                          >
                            <ChevronRight className="w-3 h-3" />
                            <span className="truncate">{feature}</span>
                          </Link>
                          {onToggleFavorite && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite({ path: featurePath, title: feature, module: module.label });
                              }}
                              className={cn(
                                'p-0.5 rounded transition-all',
                                featureIsFavorite
                                  ? 'text-brand-red opacity-100 scale-110'
                                  : 'opacity-0 group-hover:opacity-100 text-silver-mist hover:text-brand-red hover:scale-110'
                              )}
                              title={featureIsFavorite ? 'Remove from favorites' : 'Add to favorites'}
                            >
                              <Star className={cn('w-3.5 h-3.5', featureIsFavorite && 'fill-current')} />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-cloud dark:border-nebula-purple">
          <div className="text-xs text-silver-mist text-center">
            <span className="font-medium">{superAdminMenu.items.length}</span> Modules •{' '}
            <span className="font-medium">{superAdminMenu.items.reduce((sum, m) => sum + m.features.length, 0)}</span> Features
          </div>
        </div>
      )}
    </aside>
  );
};

export default SidebarMenu;
