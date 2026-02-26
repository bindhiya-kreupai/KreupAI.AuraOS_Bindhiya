'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Menu, ChevronLeft, MoreVertical } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface MobileHeaderAction {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  badge?: number;
}

export interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  onMenuOpen?: () => void;
  actions?: MobileHeaderAction[];
  sticky?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function MobileHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  onMenuOpen,
  actions = [],
  sticky = true,
  className = '',
  children,
}: MobileHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [_showSearch, _setShowSearch] = useState(false);
  const [showOverflow, setShowOverflow] = useState(false);
  const overflowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sticky) return;
    const onScroll = () => setIsScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [sticky]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setShowOverflow(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const visibleActions = actions.slice(0, 2);
  const overflowActions = actions.slice(2);

  return (
    <header
      className={`
        flex flex-col w-full bg-white dark:bg-slate-900 z-40
        ${sticky ? 'sticky top-0' : ''}
        ${isScrolled ? 'border-b border-slate-200 dark:border-slate-800 shadow-sm' : ''}
        ${className}
      `}
    >
      {/* Main header row */}
      <div className="flex items-center h-14 px-4 gap-3">
        {/* Left: menu or back */}
        {showBack ? (
          <button
            onClick={onBack}
            aria-label="Go back"
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors -ml-1"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={onMenuOpen}
            aria-label="Open menu"
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors -ml-1"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate leading-tight">
            {title}
          </h1>
          {subtitle && <p className="text-xs text-slate-400 truncate leading-tight">{subtitle}</p>}
        </div>

        {/* Right: visible actions */}
        <div className="flex items-center gap-1">
          {visibleActions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              aria-label={action.label}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <action.icon className="w-4 h-4" />
              {action.badge !== undefined && action.badge > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                  {action.badge > 9 ? '9+' : action.badge}
                </span>
              )}
            </button>
          ))}

          {/* Overflow menu */}
          {overflowActions.length > 0 && (
            <div ref={overflowRef} className="relative">
              <button
                onClick={() => setShowOverflow((s) => !s)}
                aria-label="More options"
                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showOverflow && (
                <div className="absolute right-0 top-10 w-48 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden">
                  {overflowActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => {
                        action.onClick();
                        setShowOverflow(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <action.icon className="w-4 h-4 text-slate-400" />
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Optional slot below title (e.g. tabs, search bar) */}
      {children && <div className="px-4 pb-3">{children}</div>}
    </header>
  );
}
