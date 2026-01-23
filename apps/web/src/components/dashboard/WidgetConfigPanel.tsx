"use client";

import React from 'react';
import { X, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { useDashboardStore } from '@/stores/dashboard-store';

export function WidgetConfigPanel() {
  const { widgets, configPanelOpen, setConfigPanelOpen, toggleWidgetVisibility, resetLayout } = useDashboardStore();

  if (!configPanelOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setConfigPanelOpen(false)} />
      <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-stellar-blue border-l border-cloud dark:border-nebula-purple/50 z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-cloud dark:border-nebula-purple/50">
          <h3 className="font-bold text-ink-black dark:text-pearl">Customize Dashboard</h3>
          <button
            onClick={() => setConfigPanelOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-silver-mist"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="text-xs text-silver-mist mb-3">Toggle widgets to show or hide them on your dashboard.</p>
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className="flex items-center justify-between p-3 rounded-lg border border-cloud dark:border-nebula-purple/50 hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors"
            >
              <span className="text-sm font-medium text-ink-black dark:text-pearl">{widget.title}</span>
              <button
                onClick={() => toggleWidgetVisibility(widget.id)}
                className={`p-1.5 rounded-lg transition-colors ${
                  widget.visible
                    ? 'text-celestial-indigo bg-celestial-indigo/10'
                    : 'text-silver-mist bg-slate-100 dark:bg-slate-800'
                }`}
              >
                {widget.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-cloud dark:border-nebula-purple/50">
          <button
            onClick={resetLayout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-silver-mist hover:text-coral-alert bg-slate-50 dark:bg-deep-cosmos hover:bg-coral-alert/5 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Default
          </button>
        </div>
      </div>
    </>
  );
}
