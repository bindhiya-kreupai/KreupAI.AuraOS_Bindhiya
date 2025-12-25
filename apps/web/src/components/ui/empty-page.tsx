/**
 * @module EmptyPage
 * @description Generic empty/placeholder page component for AURA HCM
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 * @reference docs/aura-uiux-design.md
 */

'use client';

import React from 'react';
import Link from 'next/link';
import {
  Construction,
  ArrowLeft,
  Sparkles,
  Clock,
  FileQuestion,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type EmptyPageVariant = 'coming-soon' | 'under-construction' | 'not-found' | 'no-access' | 'empty';

import { getMenuIcon } from '@aura/ui/components/menu';
import type { MenuIconName } from '@aura/types';

interface EmptyPageProps {
  variant?: EmptyPageVariant;
  title?: string;
  description?: string;
  icon?: React.ReactNode | string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  backHref?: string;
  backLabel?: string;
  children?: React.ReactNode;
  className?: string;
  // Legacy/Scaffold props
  module?: string;
  features?: string[];
}

const variantConfig: Record<EmptyPageVariant, { icon: React.ReactNode; title: string; description: string }> = {
  'coming-soon': {
    icon: <Sparkles className="w-16 h-16" />,
    title: 'Coming Soon',
    description: 'This feature is currently under development and will be available soon.',
  },
  'under-construction': {
    icon: <Construction className="w-16 h-16" />,
    title: 'Under Construction',
    description: 'We\'re building something amazing here. Check back later!',
  },
  'not-found': {
    icon: <FileQuestion className="w-16 h-16" />,
    title: 'Page Not Found',
    description: 'The page you\'re looking for doesn\'t exist or has been moved.',
  },
  'no-access': {
    icon: <Clock className="w-16 h-16" />,
    title: 'Access Restricted',
    description: 'You don\'t have permission to access this page. Contact your administrator.',
  },
  empty: {
    icon: <Sparkles className="w-16 h-16" />,
    title: 'Nothing Here Yet',
    description: 'This section is empty. Start by adding some content.',
  },
};

export const EmptyPage: React.FC<EmptyPageProps> = ({
  variant = 'coming-soon',
  title,
  description,
  icon,
  showBackButton = true,
  showHomeButton = true,
  backHref,
  backLabel = 'Go Back',
  children,
  className,
  module,
  features,
}) => {
  const config = variantConfig[variant];

  // Handle string icon
  let DisplayIcon = config.icon;
  if (typeof icon === 'string') {
    const IconComponent = getMenuIcon(icon as MenuIconName);
    if (IconComponent) {
      DisplayIcon = <IconComponent className="w-16 h-16" />;
    }
  } else if (icon) {
    DisplayIcon = icon as React.ReactNode;
  }

  // Handle module prop
  const displayTitle = title || (module ? `${module} Coming Soon` : config.title);
  const displayDescription = description || (module ? `The ${module} module is currently under development.` : config.description);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-[60vh] px-4 py-12',
        className
      )}
    >
      {/* Animated Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-celestial-indigo/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-quantum-rose/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        {/* Icon */}
        <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-celestial-indigo/10 to-quantum-rose/10 text-celestial-indigo dark:text-quantum-rose">
          {DisplayIcon}
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-display font-bold text-ink-black dark:text-pearl mb-3">
          {displayTitle}
        </h1>

        {/* Description */}
        <p className="text-twilight dark:text-silver-mist mb-8 leading-relaxed">
          {displayDescription}
        </p>

        {/* Features List (Scaffold support) */}
        {features && features.length > 0 && (
          <div className="mb-8 w-full text-left bg-white dark:bg-stellar-blue/50 p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
            <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-2">Planned Features:</h3>
            <ul className="grid grid-cols-1 gap-2">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-twilight dark:text-silver-mist">
                  <div className="w-1.5 h-1.5 rounded-full bg-neural-mint" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Custom Content */}
        {children && <div className="mb-8 w-full">{children}</div>}

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {showBackButton && (
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-twilight dark:text-silver-mist bg-pearl dark:bg-stellar-blue hover:bg-cloud dark:hover:bg-nebula-purple transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {backLabel}
            </button>
          )}

          {showHomeButton && (
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-celestial-indigo to-quantum-rose hover:opacity-90 transition-opacity"
            >
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Link>
          )}
        </div>

        {/* Module Info Badge */}
        <div className="mt-8 px-4 py-2 rounded-full bg-pearl dark:bg-stellar-blue text-xs text-silver-mist">
          AURA HCM Platform • 394 Features
        </div>
      </div>
    </div>
  );
};

export default EmptyPage;
