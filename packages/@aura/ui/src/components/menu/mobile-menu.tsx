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
import { cn } from '@/lib/utils';
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
    return `/${code.toLowerCase().replace(/_/g, '-')}`;
  };

  const getFeaturePath = (moduleCode: string, featureName: string) => {
    const modulePath = getModulePath(moduleCode);
    const featureSlug = featureName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return `${modulePath}/${featureSlug}`;
  };

  // Filter modules
  const filteredModules = searchQuery
    ? superAdminMenu.items.filter(
        (m) =>
          m.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.features.some((f) =>
            f.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
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
      <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-white dark:bg-deep-cosmos shadow-xl flex flex-col animate-slide-in-left">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cloud dark:border-nebula-purple">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-celestial-indigo to-quantum-rose flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-ink-black dark:text-pearl">
                AURA
              </h1>
              <p className="text-xs text-silver-mist">HCM Platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-pearl dark:hover:bg-stellar-blue transition-colors"
          >
            <X className="w-6 h-6 text-twilight dark:text-silver-mist" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 p-4 border-b border-cloud dark:border-nebula-purple">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-pearl dark:bg-stellar-blue text-twilight dark:text-silver-mist hover:text-celestial-indigo transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm">Home</span>
          </Link>
          <Link
            href="/notifications"
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-pearl dark:bg-stellar-blue text-twilight dark:text-silver-mist hover:text-celestial-indigo transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="text-sm">Alerts</span>
          </Link>
          <Link
            href="/profile"
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-pearl dark:bg-stellar-blue text-twilight dark:text-silver-mist hover:text-celestial-indigo transition-colors"
          >
            <User className="w-4 h-4" />
            <span className="text-sm">Profile</span>
          </Link>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
            <input
              type="text"
              placeholder="Search modules & features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-pearl dark:bg-stellar-blue rounded-xl text-sm text-ink-black dark:text-pearl placeholder:text-silver-mist border-2 border-transparent focus:border-celestial-indigo focus:outline-none transition-colors"
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
                className="flex items-center gap-2 px-4 py-2 mb-2 text-sm text-celestial-indigo dark:text-quantum-rose"
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
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                        isActive
                          ? 'bg-gradient-to-r from-celestial-indigo/10 to-quantum-rose/10 text-celestial-indigo dark:text-quantum-rose'
                          : 'text-twilight dark:text-silver-mist hover:bg-pearl dark:hover:bg-stellar-blue'
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
                    key={module.code}
                    onClick={() => setSelectedModule(module.code)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left',
                      isActive
                        ? 'bg-gradient-to-r from-celestial-indigo/10 to-quantum-rose/10 text-celestial-indigo dark:text-quantum-rose'
                        : 'text-twilight dark:text-silver-mist hover:bg-pearl dark:hover:bg-stellar-blue'
                    )}
                  >
                    <div
                      className={cn(
                        'p-2 rounded-lg',
                        isActive
                          ? 'bg-celestial-indigo/10 dark:bg-quantum-rose/10'
                          : 'bg-pearl dark:bg-stellar-blue'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium block truncate">
                        {module.label}
                      </span>
                      <span className="text-xs text-silver-mist">
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
        <div className="p-4 border-t border-cloud dark:border-nebula-purple space-y-2">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-twilight dark:text-silver-mist hover:bg-pearl dark:hover:bg-stellar-blue transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm">Settings</span>
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-coral-alert hover:bg-coral-alert/10 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
