// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Home, Clock, User, MoreHorizontal } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface BottomNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  href?: string;
  onClick?: () => void;
}

export interface BottomNavigationProps {
  items?: BottomNavItem[];
  activeId?: string;
  onItemClick?: (itemId: string) => void;
  className?: string;
}

// ── Default items ──────────────────────────────────────────────────────────────

const DEFAULT_ITEMS: BottomNavItem[] = [
  { id: 'home', label: 'Home', icon: Home, href: '/dashboard' },
  { id: 'approvals', label: 'Approvals', icon: Clock },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    href: '/dashboard/my-services/personal-info-update',
  },
  { id: 'more', label: 'More', icon: MoreHorizontal },
];

// ── Component ──────────────────────────────────────────────────────────────────

export function BottomNavigation({
  items = DEFAULT_ITEMS,
  activeId,
  onItemClick,
  className = '',
}: BottomNavigationProps) {
  const router = useRouter();

  const handleClick = (item: BottomNavItem) => {
    if (item.href) {
      router.push(item.href);
    }
    item.onClick?.();
    onItemClick?.(item.id);
  };

  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-50
        bg-white dark:bg-slate-900
        border-t border-slate-200 dark:border-slate-800
        safe-area-bottom
        sm:hidden
        ${className}
      `}
      aria-label="Bottom navigation"
    >
      <div className="flex items-stretch h-16">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className="flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors"
            >
              {/* Active indicator */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-600 rounded-full" />
              )}

              {/* Icon + badge */}
              <div className="relative">
                <item.icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold leading-none">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-medium leading-none transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
