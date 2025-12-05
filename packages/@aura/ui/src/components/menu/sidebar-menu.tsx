/**
 * @module SidebarMenu
 * @description Main sidebar navigation component for AURA HCM
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 * @reference docs/aura-uiux-design.md
 */

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, Search, X, PanelLeftClose, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMenuIcon } from './menu-icons';
import { superAdminMenu } from '@aura/config';
import type { MenuIconName } from '@aura/types';

interface SidebarMenuProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({
  collapsed = false,
  onToggleCollapse,
  className,
}) => {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

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

  // Toggle module expansion
  const toggleModule = (code: string) => {
    setExpandedModules((prev) =>
      prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code]
    );
  };

  // Check if module is active
  const isModuleActive = (module: typeof superAdminMenu.items[0]) => {
    const modulePath = getModulePath(module);
    return pathname.startsWith(modulePath);
  };

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
        'flex flex-col h-full bg-white dark:bg-deep-cosmos border-r border-cloud dark:border-nebula-purple transition-all duration-300',
        collapsed ? 'w-16' : 'w-72',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cloud dark:border-nebula-purple">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-celestial-indigo to-quantum-rose flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-display font-semibold text-ink-black dark:text-pearl">
              AURA
            </span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-pearl dark:hover:bg-stellar-blue transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeft className="w-5 h-5 text-twilight dark:text-silver-mist" />
          ) : (
            <PanelLeftClose className="w-5 h-5 text-twilight dark:text-silver-mist" />
          )}
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
            <input
              type="text"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-pearl dark:bg-stellar-blue rounded-xl text-sm text-ink-black dark:text-pearl placeholder:text-silver-mist border-2 border-transparent focus:border-celestial-indigo focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-silver-mist hover:text-twilight" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {filteredModules.map((module) => {
          const Icon = getMenuIcon(module.icon as MenuIconName);
          const isActive = isModuleActive(module);
          const isExpanded = expandedModules.includes(module.code);
          const modulePath = getModulePath(module);

          return (
            <div key={module.code}>
              {/* Module Item */}
              <div
                className={cn(
                  'group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-celestial-indigo/10 to-quantum-rose/10 text-celestial-indigo dark:text-quantum-rose'
                    : 'text-twilight dark:text-silver-mist hover:bg-pearl dark:hover:bg-stellar-blue'
                )}
                onClick={() => !collapsed && toggleModule(module.code)}
              >
                <div
                  className={cn(
                    'flex-shrink-0 p-1.5 rounded-lg transition-colors',
                    isActive
                      ? 'bg-celestial-indigo/10 dark:bg-quantum-rose/10'
                      : 'group-hover:bg-celestial-indigo/5'
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {!collapsed && (
                  <>
                    <span className="flex-1 text-sm font-medium truncate">
                      {module.label}
                    </span>
                    <span className="text-xs text-silver-mist">
                      {module.features.length}
                    </span>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 transition-transform duration-200',
                        isExpanded ? 'rotate-180' : ''
                      )}
                    />
                  </>
                )}
              </div>

              {/* Features Submenu */}
              {!collapsed && isExpanded && (
                <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-cloud dark:border-nebula-purple pl-4">
                  {module.features.map((feature) => {
                    const featurePath = getFeaturePath(module, feature);
                    const isFeatureActive = pathname === featurePath;

                    return (
                      <Link
                        key={feature}
                        href={featurePath}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                          isFeatureActive
                            ? 'bg-celestial-indigo/10 text-celestial-indigo dark:text-quantum-rose font-medium'
                            : 'text-twilight dark:text-silver-mist hover:bg-pearl dark:hover:bg-stellar-blue hover:text-ink-black dark:hover:text-pearl'
                        )}
                      >
                        <ChevronRight className="w-3 h-3" />
                        <span className="truncate">{feature}</span>
                      </Link>
                    );
                  })}
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
            <span className="font-medium">43</span> Modules •{' '}
            <span className="font-medium">394</span> Features
          </div>
        </div>
      )}
    </aside>
  );
};

export default SidebarMenu;
