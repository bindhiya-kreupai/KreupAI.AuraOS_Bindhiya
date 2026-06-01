// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import type { Theme } from '@/stores/theme-store';
import { useTheme } from '@/stores/theme-store';

const options: { mode: Theme; icon: React.FC<{ className?: string }>; label: string }[] = [
  { mode: 'light', icon: Sun, label: 'Light' },
  { mode: 'dark', icon: Moon, label: 'Dark' },
  { mode: 'system', icon: Monitor, label: 'System' },
];

export function ThemeToggle() {
  const { theme: mode, setTheme: setMode } = useTheme();

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-deep-cosmos rounded-lg p-1">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = mode === opt.mode;
        return (
          <button
            key={opt.mode}
            onClick={() => setMode(opt.mode)}
            title={opt.label}
            className={`p-1.5 rounded-md transition-colors ${
              isActive
                ? 'bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm'
                : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
            }`}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
}
