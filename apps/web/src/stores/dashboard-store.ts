"use client";

import { useState, useEffect, useCallback } from 'react';

export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  visible: boolean;
  position: { x: number; y: number; w: number; h: number };
}

const STORAGE_KEY = 'aura_dashboard_layout';

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'attendance', type: 'attendance', title: 'Attendance', visible: true, position: { x: 0, y: 0, w: 1, h: 1 } },
  { id: 'leave-balance', type: 'leave-balance', title: 'Leave Balance', visible: true, position: { x: 1, y: 0, w: 1, h: 1 } },
  { id: 'team', type: 'team', title: 'Team', visible: true, position: { x: 2, y: 0, w: 1, h: 1 } },
  { id: 'approvals', type: 'approvals', title: 'Pending Approvals', visible: true, position: { x: 3, y: 0, w: 1, h: 1 } },
  { id: 'tasks', type: 'tasks', title: 'Tasks & Reminders', visible: true, position: { x: 0, y: 1, w: 1, h: 1 } },
  { id: 'calendar', type: 'calendar', title: 'Calendar', visible: true, position: { x: 1, y: 1, w: 1, h: 1 } },
  { id: 'announcements', type: 'announcements', title: 'Announcements', visible: true, position: { x: 2, y: 1, w: 2, h: 1 } },
  { id: 'metrics', type: 'metrics', title: 'Key Metrics', visible: false, position: { x: 0, y: 2, w: 2, h: 1 } },
  { id: 'birthdays', type: 'birthdays', title: 'Birthdays & Anniversaries', visible: true, position: { x: 0, y: 2, w: 1, h: 1 } },
  { id: 'quick-links', type: 'quick-links', title: 'Quick Links', visible: true, position: { x: 1, y: 2, w: 1, h: 1 } },
];

export function useDashboardStore() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const [configPanelOpen, setConfigPanelOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setWidgets(JSON.parse(stored));
      }
    } catch {
      // Use defaults if parsing fails
    }
  }, []);

  const persistWidgets = useCallback((updated: WidgetConfig[]) => {
    setWidgets(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Silently fail on storage errors
    }
  }, []);

  const addWidget = useCallback((widget: WidgetConfig) => {
    persistWidgets([...widgets, widget]);
  }, [widgets, persistWidgets]);

  const removeWidget = useCallback((id: string) => {
    persistWidgets(widgets.filter((w) => w.id !== id));
  }, [widgets, persistWidgets]);

  const toggleWidgetVisibility = useCallback((id: string) => {
    persistWidgets(widgets.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w)));
  }, [widgets, persistWidgets]);

  const updateWidgetPosition = useCallback((id: string, position: { x: number; y: number; w: number; h: number }) => {
    persistWidgets(widgets.map((w) => (w.id === id ? { ...w, position } : w)));
  }, [widgets, persistWidgets]);

  const resetLayout = useCallback(() => {
    persistWidgets(DEFAULT_WIDGETS);
  }, [persistWidgets]);

  return {
    widgets,
    configPanelOpen,
    setConfigPanelOpen,
    setWidgets: persistWidgets,
    addWidget,
    removeWidget,
    toggleWidgetVisibility,
    updateWidgetPosition,
    resetLayout,
  };
}
