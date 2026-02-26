/**
 * @module useUIPreferencesStore
 * @description Zustand store for UI preferences: sidebar, table density, page sizes,
 *              dashboard widget order/visibility. Persisted to localStorage with version migration.
 * @project AURA HCM Platform
 *
 * @example
 * const { sidebarCollapsed, tableDensity, setTableDensity } = useUIPreferencesStore();
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ── Types ──────────────────────────────────────────────────────────────────────

export type TableDensity = 'compact' | 'normal' | 'comfortable';

export type SidebarMode = 'expanded' | 'collapsed' | 'mini';

export interface DashboardWidget {
  id: string;
  visible: boolean;
  order: number;
}

export interface ColumnConfig {
  /** Column field identifier */
  field: string;
  visible: boolean;
  width?: number;
  order: number;
}

// Per-table column visibility configs keyed by table ID
export type TableColumnConfigs = Record<string, ColumnConfig[]>;

export interface UIPreferencesState {
  // ── Sidebar ──────────────────────────────────────────────────────────────────
  sidebarCollapsed: boolean;
  sidebarMode: SidebarMode;

  // ── Table ────────────────────────────────────────────────────────────────────
  tableDensity: TableDensity;
  defaultPageSizes: Record<string, number>; // keyed by module name
  tableColumnConfigs: TableColumnConfigs;

  // ── Dashboard Widgets ─────────────────────────────────────────────────────────
  dashboardWidgets: DashboardWidget[];

  // ── General UI ────────────────────────────────────────────────────────────────
  showWelcomeBanner: boolean;
  showKeyboardShortcutsHint: boolean;
  defaultCalendarView: 'month' | 'week' | 'day' | 'list';

  // ── Actions ───────────────────────────────────────────────────────────────────
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarMode: (mode: SidebarMode) => void;
  toggleSidebar: () => void;

  setTableDensity: (density: TableDensity) => void;
  setDefaultPageSize: (module: string, size: number) => void;
  getDefaultPageSize: (module: string) => number;

  setTableColumnConfig: (tableId: string, columns: ColumnConfig[]) => void;
  toggleColumnVisibility: (tableId: string, field: string) => void;

  setWidgetOrder: (widgetId: string, order: number) => void;
  setWidgetVisible: (widgetId: string, visible: boolean) => void;
  reorderWidgets: (activeId: string, overId: string) => void;
  resetDashboardWidgets: () => void;

  dismissWelcomeBanner: () => void;
  dismissKeyboardShortcutsHint: () => void;
  setCalendarView: (view: 'month' | 'week' | 'day' | 'list') => void;

  resetAll: () => void;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_PAGE_SIZE = 25;

const DEFAULT_DASHBOARD_WIDGETS: DashboardWidget[] = [
  { id: 'attendance', visible: true, order: 0 },
  { id: 'leave-balance', visible: true, order: 1 },
  { id: 'team', visible: true, order: 2 },
  { id: 'approvals', visible: true, order: 3 },
  { id: 'tasks', visible: true, order: 4 },
  { id: 'calendar', visible: true, order: 5 },
  { id: 'announcements', visible: true, order: 6 },
  { id: 'metrics', visible: true, order: 7 },
  { id: 'birthdays', visible: true, order: 8 },
  { id: 'quick-links', visible: true, order: 9 },
];

const DEFAULT_STATE = {
  sidebarCollapsed: false,
  sidebarMode: 'expanded' as SidebarMode,
  tableDensity: 'normal' as TableDensity,
  defaultPageSizes: {} as Record<string, number>,
  tableColumnConfigs: {} as TableColumnConfigs,
  dashboardWidgets: DEFAULT_DASHBOARD_WIDGETS,
  showWelcomeBanner: true,
  showKeyboardShortcutsHint: true,
  defaultCalendarView: 'month' as const,
};

// ── Version migration ─────────────────────────────────────────────────────────

// If you add new state fields in a future version, migrate here:
function migrate(persisted: unknown, version: number): unknown {
  const state = persisted as Record<string, unknown>;

  if (version < 1) {
    // v0 → v1: add defaultCalendarView
    return { ...state, defaultCalendarView: 'month' };
  }
  if (version < 2) {
    // v1 → v2: add tableColumnConfigs
    return { ...state, tableColumnConfigs: {} };
  }
  return persisted;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useUIPreferencesStore = create<UIPreferencesState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      // ── Sidebar ────────────────────────────────────────────────────────────
      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed, sidebarMode: collapsed ? 'collapsed' : 'expanded' }),

      setSidebarMode: (mode) => set({ sidebarMode: mode, sidebarCollapsed: mode !== 'expanded' }),

      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
          sidebarMode: state.sidebarCollapsed ? 'expanded' : 'collapsed',
        })),

      // ── Table ──────────────────────────────────────────────────────────────
      setTableDensity: (density) => set({ tableDensity: density }),

      setDefaultPageSize: (module, size) =>
        set((state) => ({
          defaultPageSizes: { ...state.defaultPageSizes, [module]: size },
        })),

      getDefaultPageSize: (module) => {
        const sizes = get().defaultPageSizes;
        return sizes[module] ?? DEFAULT_PAGE_SIZE;
      },

      setTableColumnConfig: (tableId, columns) =>
        set((state) => ({
          tableColumnConfigs: { ...state.tableColumnConfigs, [tableId]: columns },
        })),

      toggleColumnVisibility: (tableId, field) =>
        set((state) => {
          const columns = state.tableColumnConfigs[tableId];
          if (!columns) return state;
          return {
            tableColumnConfigs: {
              ...state.tableColumnConfigs,
              [tableId]: columns.map((col) =>
                col.field === field ? { ...col, visible: !col.visible } : col
              ),
            },
          };
        }),

      // ── Dashboard Widgets ──────────────────────────────────────────────────
      setWidgetOrder: (widgetId, order) =>
        set((state) => ({
          dashboardWidgets: state.dashboardWidgets.map((w) =>
            w.id === widgetId ? { ...w, order } : w
          ),
        })),

      setWidgetVisible: (widgetId, visible) =>
        set((state) => ({
          dashboardWidgets: state.dashboardWidgets.map((w) =>
            w.id === widgetId ? { ...w, visible } : w
          ),
        })),

      reorderWidgets: (activeId, overId) =>
        set((state) => {
          const widgets = [...state.dashboardWidgets].sort((a, b) => a.order - b.order);
          const activeIdx = widgets.findIndex((w) => w.id === activeId);
          const overIdx = widgets.findIndex((w) => w.id === overId);
          if (activeIdx === -1 || overIdx === -1) return state;
          const [moved] = widgets.splice(activeIdx, 1);
          widgets.splice(overIdx, 0, moved);
          return {
            dashboardWidgets: widgets.map((w, i) => ({ ...w, order: i })),
          };
        }),

      resetDashboardWidgets: () => set({ dashboardWidgets: DEFAULT_DASHBOARD_WIDGETS }),

      // ── General ───────────────────────────────────────────────────────────
      dismissWelcomeBanner: () => set({ showWelcomeBanner: false }),
      dismissKeyboardShortcutsHint: () => set({ showKeyboardShortcutsHint: false }),
      setCalendarView: (view) => set({ defaultCalendarView: view }),

      resetAll: () => set(DEFAULT_STATE),
    }),
    {
      name: 'aura-ui-preferences',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate,
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        sidebarMode: state.sidebarMode,
        tableDensity: state.tableDensity,
        defaultPageSizes: state.defaultPageSizes,
        tableColumnConfigs: state.tableColumnConfigs,
        dashboardWidgets: state.dashboardWidgets,
        showWelcomeBanner: state.showWelcomeBanner,
        showKeyboardShortcutsHint: state.showKeyboardShortcutsHint,
        defaultCalendarView: state.defaultCalendarView,
      }),
    }
  )
);

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectSidebarCollapsed = (s: UIPreferencesState) => s.sidebarCollapsed;
export const selectTableDensity = (s: UIPreferencesState) => s.tableDensity;
export const selectDashboardWidgets = (s: UIPreferencesState) =>
  [...s.dashboardWidgets].sort((a, b) => a.order - b.order);
export const selectVisibleWidgets = (s: UIPreferencesState) =>
  [...s.dashboardWidgets].filter((w) => w.visible).sort((a, b) => a.order - b.order);

// ── Table density helpers ─────────────────────────────────────────────────────

export const TABLE_DENSITY_META: Record<
  TableDensity,
  { label: string; rowHeight: string; padding: string }
> = {
  compact: { label: 'Compact', rowHeight: 'h-8', padding: 'py-1 px-2' },
  normal: { label: 'Normal', rowHeight: 'h-11', padding: 'py-2.5 px-4' },
  comfortable: { label: 'Comfortable', rowHeight: 'h-14', padding: 'py-4 px-4' },
};

export default useUIPreferencesStore;
