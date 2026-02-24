/**
 * @module DashboardStore
 * @description Store for managing dashboard widget layout, preferences, and visibility
 * @project AURA HCM Platform
 */

'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  visible: boolean;
  position: WidgetPosition;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface DashboardLayout {
  widgets: WidgetConfig[];
  columns: number;
}

export interface DashboardPreferences {
  layout: DashboardLayout;
  theme: 'light' | 'dark' | 'system';
  refreshInterval: number; // minutes
  editMode: boolean;
}

interface DashboardContextType {
  preferences: DashboardPreferences;
  editMode: boolean;
  configPanelOpen: boolean;
  setEditMode: (mode: boolean) => void;
  setConfigPanelOpen: (open: boolean) => void;
  updateWidgetPosition: (widgetId: string, position: WidgetPosition) => void;
  toggleWidgetVisibility: (widgetId: string) => void;
  setWidgetVisible: (widgetId: string, visible: boolean) => void;
  reorderWidgets: (activeId: string, overId: string) => void;
  resetLayout: () => void;
  savePreferences: () => Promise<void>;
  loadPreferences: () => Promise<void>;
  isSaving: boolean;
  isLoading: boolean;
}

// ── Default Layout ─────────────────────────────────────────────────────────────

export const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: 'attendance',
    type: 'attendance',
    title: 'Attendance',
    visible: true,
    position: { x: 0, y: 0, w: 3, h: 2 },
    minW: 2,
    minH: 2,
  },
  {
    id: 'leave-balance',
    type: 'leave-balance',
    title: 'Leave Balance',
    visible: true,
    position: { x: 3, y: 0, w: 3, h: 2 },
    minW: 2,
    minH: 2,
  },
  {
    id: 'team',
    type: 'team',
    title: 'Team',
    visible: true,
    position: { x: 6, y: 0, w: 3, h: 2 },
    minW: 2,
    minH: 2,
  },
  {
    id: 'approvals',
    type: 'approvals',
    title: 'Approvals',
    visible: true,
    position: { x: 9, y: 0, w: 3, h: 2 },
    minW: 2,
    minH: 2,
  },
  {
    id: 'tasks',
    type: 'tasks',
    title: 'Tasks',
    visible: true,
    position: { x: 0, y: 2, w: 4, h: 3 },
    minW: 3,
    minH: 2,
  },
  {
    id: 'calendar',
    type: 'calendar',
    title: 'Calendar',
    visible: true,
    position: { x: 4, y: 2, w: 4, h: 3 },
    minW: 3,
    minH: 3,
  },
  {
    id: 'announcements',
    type: 'announcements',
    title: 'Announcements',
    visible: true,
    position: { x: 8, y: 2, w: 4, h: 3 },
    minW: 3,
    minH: 2,
  },
  {
    id: 'metrics',
    type: 'metrics',
    title: 'HR Metrics',
    visible: true,
    position: { x: 0, y: 5, w: 6, h: 2 },
    minW: 4,
    minH: 2,
  },
  {
    id: 'birthdays',
    type: 'birthdays',
    title: 'Birthdays',
    visible: true,
    position: { x: 6, y: 5, w: 3, h: 2 },
    minW: 2,
    minH: 2,
  },
  {
    id: 'quick-links',
    type: 'quick-links',
    title: 'Quick Links',
    visible: true,
    position: { x: 9, y: 5, w: 3, h: 2 },
    minW: 2,
    minH: 2,
  },
];

const DEFAULT_PREFERENCES: DashboardPreferences = {
  layout: {
    widgets: DEFAULT_WIDGETS,
    columns: 12,
  },
  theme: 'system',
  refreshInterval: 5,
  editMode: false,
};

const STORAGE_KEY = 'aura_dashboard_preferences';

// ── Context ────────────────────────────────────────────────────────────────────

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<DashboardPreferences>(DEFAULT_PREFERENCES);
  const [editMode, setEditMode] = useState(false);
  const [configPanelOpen, setConfigPanelOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as DashboardPreferences;
        // Merge with defaults to handle new widgets added after user saved
        const mergedWidgets = DEFAULT_WIDGETS.map((defaultWidget) => {
          const saved = parsed.layout.widgets.find((w) => w.id === defaultWidget.id);
          return saved ? { ...defaultWidget, ...saved } : defaultWidget;
        });
        setPreferences({
          ...DEFAULT_PREFERENCES,
          ...parsed,
          layout: { ...parsed.layout, widgets: mergedWidgets },
        });
      }
    } catch {
      /* Failed to load dashboard preferences */
    }
    setIsHydrated(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      } catch {
        /* Failed to save dashboard preferences */
      }
    }
  }, [preferences, isHydrated]);

  const updateWidgetPosition = useCallback((widgetId: string, position: WidgetPosition) => {
    setPreferences((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        widgets: prev.layout.widgets.map((w) => (w.id === widgetId ? { ...w, position } : w)),
      },
    }));
  }, []);

  const toggleWidgetVisibility = useCallback((widgetId: string) => {
    setPreferences((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        widgets: prev.layout.widgets.map((w) =>
          w.id === widgetId ? { ...w, visible: !w.visible } : w
        ),
      },
    }));
  }, []);

  const setWidgetVisible = useCallback((widgetId: string, visible: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        widgets: prev.layout.widgets.map((w) => (w.id === widgetId ? { ...w, visible } : w)),
      },
    }));
  }, []);

  const reorderWidgets = useCallback((activeId: string, overId: string) => {
    setPreferences((prev) => {
      const widgets = [...prev.layout.widgets];
      const activeIndex = widgets.findIndex((w) => w.id === activeId);
      const overIndex = widgets.findIndex((w) => w.id === overId);
      if (activeIndex === -1 || overIndex === -1) return prev;

      const [moved] = widgets.splice(activeIndex, 1);
      widgets.splice(overIndex, 0, moved);

      return {
        ...prev,
        layout: { ...prev.layout, widgets },
      };
    });
  }, []);

  const resetLayout = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  const savePreferences = useCallback(async () => {
    setIsSaving(true);
    try {
      await fetch('/api/v1/user/dashboard-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences }),
      });
    } catch {
      /* Failed to save preferences to server */
    } finally {
      setIsSaving(false);
    }
  }, [preferences]);

  const loadPreferences = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/user/dashboard-preferences');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.preferences) {
          setPreferences(data.data.preferences);
        }
      }
    } catch {
      /* Failed to load preferences from server */
    } finally {
      setIsLoading(false);
    }
  }, []);

  return React.createElement(
    DashboardContext.Provider,
    {
      value: {
        preferences,
        editMode,
        configPanelOpen,
        setEditMode,
        setConfigPanelOpen,
        updateWidgetPosition,
        toggleWidgetVisibility,
        setWidgetVisible,
        reorderWidgets,
        resetLayout,
        savePreferences,
        loadPreferences,
        isSaving,
        isLoading,
      },
    },
    children
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export default DashboardProvider;
