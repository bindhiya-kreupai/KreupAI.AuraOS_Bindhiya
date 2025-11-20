/**
 * @module ModulePage
 * @description Generic module page wrapper for AURA HCM
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 * @reference docs/aura-uiux-design.md
 */

'use client';

import React from 'react';
import { EmptyPage } from './empty-page';
import { getMenuIcon } from '@aura/ui/components/menu';
import type { MenuIconName } from '@aura/types';
import { cn } from '@/lib/utils';

interface ModulePageProps {
  moduleCode: string;
  moduleName: string;
  moduleIcon?: MenuIconName;
  featureName?: string;
  featureCount?: number;
  isImplemented?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const ModulePage: React.FC<ModulePageProps> = ({
  moduleCode,
  moduleName,
  moduleIcon,
  featureName,
  featureCount,
  isImplemented = false,
  children,
  className,
}) => {
  const Icon = moduleIcon ? getMenuIcon(moduleIcon) : null;

  if (!isImplemented) {
    return (
      <div className={cn('relative', className)}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            {Icon && (
              <div className="p-2 rounded-lg bg-gradient-to-br from-celestial-indigo/10 to-quantum-rose/10">
                <Icon className="w-6 h-6 text-celestial-indigo dark:text-quantum-rose" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-display font-bold text-ink-black dark:text-pearl">
                {featureName || moduleName}
              </h1>
              {featureName && (
                <p className="text-sm text-silver-mist">{moduleName}</p>
              )}
            </div>
          </div>
          {featureCount && (
            <p className="text-sm text-silver-mist">
              {featureCount} features in this module
            </p>
          )}
        </div>

        {/* Empty State */}
        <EmptyPage
          variant="coming-soon"
          title={`${featureName || moduleName} Coming Soon`}
          description={`The ${featureName || moduleName} feature is currently under development. Our team is working hard to bring you this functionality.`}
          showBackButton={true}
          showHomeButton={true}
        >
          {/* Progress Indicator */}
          <div className="w-full max-w-xs mx-auto">
            <div className="flex items-center justify-between text-xs text-silver-mist mb-2">
              <span>Development Progress</span>
              <span>0%</span>
            </div>
            <div className="h-2 bg-pearl dark:bg-stellar-blue rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-celestial-indigo to-quantum-rose rounded-full transition-all duration-500"
                style={{ width: '0%' }}
              />
            </div>
          </div>
        </EmptyPage>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          {Icon && (
            <div className="p-2 rounded-lg bg-gradient-to-br from-celestial-indigo/10 to-quantum-rose/10">
              <Icon className="w-6 h-6 text-celestial-indigo dark:text-quantum-rose" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-display font-bold text-ink-black dark:text-pearl">
              {featureName || moduleName}
            </h1>
            {featureName && (
              <p className="text-sm text-silver-mist">{moduleName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
};

export default ModulePage;
