/**
 * @module MobileMenu
 * @description Mobile navigation drawer for AURA HCM
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 * @reference docs/aura-uiux-design.md
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  X,
  Search,
  ChevronRight,
  Home,
  Bell,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '../../utils';
import { getMenuIcon } from './menu-icons';
import { superAdminMenu } from '@aura/config';
import type { MenuIconName } from '@aura/types';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  // Close menu on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Convert code to path
  const getModulePath = (code: string) => {
    const matched = superAdminMenu.items.find(m => m.code === code);
    if (matched && matched.path) return matched.path;
    for (const parent of superAdminMenu.items) {
      if (parent.items) {
        const sub = parent.items.find(s => s.code === code);
        if (sub && sub.path) return sub.path;
      }
    }
    return `/${code.toLowerCase().replace(/_/g, '-')}`;
  };

  const getFeaturePath = (moduleCode: string, featureName: string) => {
    const modulePath = getModulePath(moduleCode);
    const featureSlug = featureName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const lastSegment = modulePath.split('/').pop();
    if (featureSlug === lastSegment) {
      return modulePath;
    }
    return `${modulePath}/${featureSlug}`;
  };

  // Helper to recursively check if a module matches the search query
  const matchModule = (module: typeof superAdminMenu.items[0], query: string): boolean => {
    if (module.label.toLowerCase().includes(query)) return true;
    if (module.code.toLowerCase().replace(/_/g, ' ').includes(query)) return true;
    if (module.path?.toLowerCase().replace(/[-/]/g, ' ').includes(query)) return true;
    if (module.features?.some(feature => feature.toLowerCase().includes(query))) return true;
    if (module.items?.some(subModule => matchModule(subModule, query))) return true;
    return false;
  };

  // Filter modules
  const filteredModules = searchQuery
    ? superAdminMenu.items.filter((m) => matchModule(m, searchQuery.toLowerCase()))
    : superAdminMenu.items;

  // Get selected module data
  const selectedModuleData = selectedModule
    ? superAdminMenu.items.find((m) => m.code === selectedModule)
    : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-gradient-to-b from-[#001529] via-[#001529] to-white/20 shadow-xl flex flex-col animate-slide-in-left">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md shadow-inner border border-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-white tracking-tight">
                AURA
              </h1>
              <p className="text-xs text-white/70">HCM Platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-all text-white hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 p-4 border-b border-white/10">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm font-medium">Home</span>
          </Link>
          <Link
            href="/notifications"
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="text-sm">Alerts</span>
          </Link>
          <Link
            href="/dashboard/my-services/personal-info-update"
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <User className="w-4 h-4" />
            <span className="text-sm">Profile</span>
          </Link>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70 group-focus-within:text-white transition-colors" />
            <input
              type="text"
              placeholder="Search modules & features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 rounded-xl text-sm text-white placeholder:text-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          {selectedModule && selectedModuleData ? (
            // Feature List View
            <div className="p-2">
              <button
                onClick={() => setSelectedModule(null)}
                className="flex items-center gap-2 px-4 py-2 mb-2 text-sm text-brand-blue dark:text-brand-light-blue"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Back to Modules
              </button>

              <div className="px-4 py-2 mb-2">
                <h3 className="font-semibold text-ink-black dark:text-pearl">
                  {selectedModuleData.label}
                </h3>
                <p className="text-xs text-silver-mist">
                  {selectedModuleData.features.length} features
                </p>
              </div>

              <div className="space-y-1">
                {selectedModuleData.features.map((feature) => {
                  const featurePath = getFeaturePath(
                    selectedModuleData.code,
                    feature
                  );
                  const isActive = pathname === featurePath;

                  return (
                    <Link
                      key={feature}
                      href={featurePath}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative overflow-hidden',
                        isActive
                          ? 'bg-brand-red text-white shadow-lg font-bold'
                          : 'text-white hover:bg-white/10'
                      )}
                    >
                      <ChevronRight className="w-4 h-4" />
                      <span className="text-sm">{feature}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            // Module List View
            <div className="p-2 space-y-1">
              {filteredModules.map((module) => {
                const Icon = getMenuIcon(module.icon as MenuIconName);
                const modulePath = getModulePath(module.code);
                const isActive = pathname.startsWith(modulePath);

                return (
                  <button
                    key={`${module.code}-${module.path || getModulePath(module.code)}`}
                    onClick={() => setSelectedModule(module.code)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left relative overflow-hidden',
                      isActive
                        ? 'bg-brand-red text-white shadow-lg font-bold'
                        : 'text-white hover:bg-white/10'
                    )}
                  >
                    <div
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        isActive
                          ? 'bg-white/20'
                          : 'bg-white/10 text-white group-hover:bg-white/20'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium block truncate">
                        {module.label}
                      </span>
                      <span className="text-xs text-white">
                        {module.features.length} features
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm">Settings</span>
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-brand-red brightness-150 hover:bg-brand-red/10 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
