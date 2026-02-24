/**
 * @module WidgetConfigPanel
 * @description Sidebar panel for adding/removing dashboard widgets
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import { useDashboard } from '@/stores/dashboard-store';
import type { LucideIcon } from 'lucide-react';
import {
  Clock,
  CalendarDays,
  Users,
  CheckSquare,
  ListTodo,
  Calendar,
  Megaphone,
  BarChart3,
  Cake,
  Link2,
  X,
} from 'lucide-react';

const WIDGET_META: Record<string, { icon: LucideIcon; description: string; color: string }> = {
  attendance: {
    icon: Clock,
    description: 'Clock status, hours today',
    color: 'text-celestial-indigo',
  },
  'leave-balance': {
    icon: CalendarDays,
    description: 'Leave balance breakdown',
    color: 'text-neural-mint',
  },
  team: { icon: Users, description: "Direct reports, who's out", color: 'text-quantum-rose' },
  approvals: {
    icon: CheckSquare,
    description: 'Pending approval count',
    color: 'text-sunset-amber',
  },
  tasks: {
    icon: ListTodo,
    description: 'Pending tasks and reminders',
    color: 'text-celestial-indigo',
  },
  calendar: {
    icon: Calendar,
    description: 'Upcoming events mini-calendar',
    color: 'text-neural-mint',
  },
  announcements: {
    icon: Megaphone,
    description: 'Company announcements',
    color: 'text-quantum-rose',
  },
  metrics: { icon: BarChart3, description: 'Key HR metrics summary', color: 'text-sunset-amber' },
  birthdays: {
    icon: Cake,
    description: 'Birthdays & anniversaries',
    color: 'text-celestial-indigo',
  },
  'quick-links': { icon: Link2, description: 'Personalized shortcuts', color: 'text-neural-mint' },
};

export const WidgetConfigPanel: React.FC = () => {
  const { preferences, setWidgetVisible, setConfigPanelOpen } = useDashboard();
  const { widgets } = preferences.layout;

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-ink-black dark:text-pearl">Configure Widgets</h3>
        <button
          onClick={() => setConfigPanelOpen(false)}
          className="p-1 rounded-lg hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
        >
          <X className="w-4 h-4 text-silver-mist" />
        </button>
      </div>
      <p className="text-xs text-silver-mist mb-4">
        Toggle widgets on or off to customize your dashboard.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
        {widgets.map((widget) => {
          const meta = WIDGET_META[widget.type];
          if (!meta) return null;
          const Icon = meta.icon;

          return (
            <button
              key={widget.id}
              onClick={() => setWidgetVisible(widget.id, !widget.visible)}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                widget.visible
                  ? 'border-celestial-indigo/30 bg-celestial-indigo/5 dark:bg-celestial-indigo/10'
                  : 'border-cloud dark:border-nebula-purple/30 bg-pearl/30 dark:bg-deep-cosmos/30 opacity-60'
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  widget.visible
                    ? `bg-white dark:bg-stellar-blue ${meta.color}`
                    : 'bg-pearl dark:bg-deep-cosmos text-silver-mist'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-ink-black dark:text-pearl truncate">
                  {widget.title}
                </p>
                <p className="text-[10px] text-silver-mist truncate">{meta.description}</p>
              </div>
              <div
                className={`w-8 h-4 rounded-full relative transition-colors ${
                  widget.visible ? 'bg-celestial-indigo' : 'bg-silver-mist/30'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${
                    widget.visible ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WidgetConfigPanel;
