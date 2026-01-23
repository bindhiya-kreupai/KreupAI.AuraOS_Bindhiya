"use client";

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore, ThemeMode } from '@/stores/theme-store';

const options: { mode: ThemeMode; icon: React.FC<{ className?: string }>; label: string }[] = [
  { mode: 'light', icon: Sun, label: 'Light' },
  { mode: 'dark', icon: Moon, label: 'Dark' },
  { mode: 'system', icon: Monitor, label: 'System' },
];

export function ThemeToggle() {
  const { mode, setMode } = useThemeStore();

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
