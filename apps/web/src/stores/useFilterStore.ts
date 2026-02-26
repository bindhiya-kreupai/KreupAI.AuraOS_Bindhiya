/**
 * @module useFilterStore
 * @description Zustand store for cross-module global filters with URL sync and preset bookmarks.
 *              Supports dateRange, department, location, and status filters that persist
 *              across module navigation and sync with URL query params.
 * @project AURA HCM Platform
 *
 * @example
 * const { filters, setDateRange, setDepartment, savePreset, applyPreset } = useFilterStore();
 *
 * // Read current filters
 * const { dateRange, department } = filters;
 *
 * // Update a filter
 * setDateRange({ start: '2026-01-01', end: '2026-01-31' });
 *
 * // Save a named preset
 * savePreset('Q1 Engineering', { department: 'eng-001', dateRange: { start: '2026-01-01', end: '2026-03-31' } });
 *
 * // Apply a saved preset
 * applyPreset('Q1 Engineering');
 *
 * // Sync to URL (call on mount)
 * syncFromURL(new URLSearchParams(window.location.search));
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface DateRange {
  start: string; // ISO date string e.g. '2026-01-01'
  end: string; // ISO date string e.g. '2026-01-31'
}

export type FilterStatus =
  | 'all'
  | 'active'
  | 'inactive'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'draft'
  | 'submitted'
  | 'completed';

export interface GlobalFilters {
  dateRange: DateRange | null;
  departmentId: string | null;
  locationId: string | null;
  status: FilterStatus;
  search: string;
  employeeId: string | null;
  managerId: string | null;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: Partial<GlobalFilters>;
  createdAt: string;
  isPinned: boolean;
}

// ── Default filters ───────────────────────────────────────────────────────────

export const DEFAULT_FILTERS: GlobalFilters = {
  dateRange: null,
  departmentId: null,
  locationId: null,
  status: 'all',
  search: '',
  employeeId: null,
  managerId: null,
};

// ── Store Types ───────────────────────────────────────────────────────────────

interface FilterState {
  // Current filters
  filters: GlobalFilters;

  // Saved presets
  presets: FilterPreset[];

  // Active preset name (if any is applied)
  activePresetId: string | null;

  // Whether filters are "dirty" (changed from a preset or defaults)
  isDirty: boolean;

  // ── Filter setters ─────────────────────────────────────────────────────────
  setFilters: (updates: Partial<GlobalFilters>) => void;
  setDateRange: (range: DateRange | null) => void;
  setDepartment: (departmentId: string | null) => void;
  setLocation: (locationId: string | null) => void;
  setStatus: (status: FilterStatus) => void;
  setSearch: (search: string) => void;
  setEmployee: (employeeId: string | null) => void;
  setManager: (managerId: string | null) => void;
  resetFilters: () => void;

  // ── Preset management ──────────────────────────────────────────────────────
  savePreset: (name: string, filters?: Partial<GlobalFilters>) => FilterPreset;
  applyPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;
  pinPreset: (presetId: string, pinned: boolean) => void;
  renamePreset: (presetId: string, name: string) => void;

  // ── URL sync ───────────────────────────────────────────────────────────────
  syncFromURL: (params: URLSearchParams) => void;
  toURLParams: () => URLSearchParams;
}

// ── URL Serialization ─────────────────────────────────────────────────────────

function filtersToURLParams(filters: GlobalFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.dateRange) {
    params.set('from', filters.dateRange.start);
    params.set('to', filters.dateRange.end);
  }
  if (filters.departmentId) params.set('dept', filters.departmentId);
  if (filters.locationId) params.set('loc', filters.locationId);
  if (filters.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters.search) params.set('q', filters.search);
  if (filters.employeeId) params.set('emp', filters.employeeId);
  if (filters.managerId) params.set('mgr', filters.managerId);

  return params;
}

function urlParamsToFilters(params: URLSearchParams): Partial<GlobalFilters> {
  const updates: Partial<GlobalFilters> = {};

  const from = params.get('from');
  const to = params.get('to');
  if (from && to) updates.dateRange = { start: from, end: to };

  const dept = params.get('dept');
  if (dept) updates.departmentId = dept;

  const loc = params.get('loc');
  if (loc) updates.locationId = loc;

  const status = params.get('status') as FilterStatus | null;
  if (status) updates.status = status;

  const q = params.get('q');
  if (q) updates.search = q;

  const emp = params.get('emp');
  if (emp) updates.employeeId = emp;

  const mgr = params.get('mgr');
  if (mgr) updates.managerId = mgr;

  return updates;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      filters: { ...DEFAULT_FILTERS },
      presets: [],
      activePresetId: null,
      isDirty: false,

      // ── Filter setters ─────────────────────────────────────────────────────
      setFilters: (updates) =>
        set((state) => ({
          filters: { ...state.filters, ...updates },
          isDirty: true,
          activePresetId: null,
        })),

      setDateRange: (range) =>
        set((state) => ({
          filters: { ...state.filters, dateRange: range },
          isDirty: true,
          activePresetId: null,
        })),

      setDepartment: (departmentId) =>
        set((state) => ({
          filters: { ...state.filters, departmentId },
          isDirty: true,
          activePresetId: null,
        })),

      setLocation: (locationId) =>
        set((state) => ({
          filters: { ...state.filters, locationId },
          isDirty: true,
          activePresetId: null,
        })),

      setStatus: (status) =>
        set((state) => ({
          filters: { ...state.filters, status },
          isDirty: true,
          activePresetId: null,
        })),

      setSearch: (search) =>
        set((state) => ({
          filters: { ...state.filters, search },
          isDirty: true,
          activePresetId: null,
        })),

      setEmployee: (employeeId) =>
        set((state) => ({
          filters: { ...state.filters, employeeId },
          isDirty: true,
          activePresetId: null,
        })),

      setManager: (managerId) =>
        set((state) => ({
          filters: { ...state.filters, managerId },
          isDirty: true,
          activePresetId: null,
        })),

      resetFilters: () =>
        set({
          filters: { ...DEFAULT_FILTERS },
          isDirty: false,
          activePresetId: null,
        }),

      // ── Preset management ──────────────────────────────────────────────────
      savePreset: (name, customFilters) => {
        const { filters } = get();
        const preset: FilterPreset = {
          id: `preset-${Date.now()}`,
          name,
          filters: customFilters ?? { ...filters },
          createdAt: new Date().toISOString(),
          isPinned: false,
        };
        set((state) => ({
          presets: [...state.presets, preset],
          activePresetId: preset.id,
          isDirty: false,
        }));
        return preset;
      },

      applyPreset: (presetId) => {
        const { presets } = get();
        const preset = presets.find((p) => p.id === presetId);
        if (!preset) return;
        set({
          filters: { ...DEFAULT_FILTERS, ...preset.filters },
          activePresetId: presetId,
          isDirty: false,
        });
      },

      deletePreset: (presetId) =>
        set((state) => ({
          presets: state.presets.filter((p) => p.id !== presetId),
          activePresetId: state.activePresetId === presetId ? null : state.activePresetId,
        })),

      pinPreset: (presetId, pinned) =>
        set((state) => ({
          presets: state.presets.map((p) => (p.id === presetId ? { ...p, isPinned: pinned } : p)),
        })),

      renamePreset: (presetId, name) =>
        set((state) => ({
          presets: state.presets.map((p) => (p.id === presetId ? { ...p, name } : p)),
        })),

      // ── URL sync ───────────────────────────────────────────────────────────
      syncFromURL: (params) => {
        const updates = urlParamsToFilters(params);
        if (Object.keys(updates).length === 0) return;
        set((state) => ({
          filters: { ...state.filters, ...updates },
          isDirty: true,
        }));
      },

      toURLParams: () => filtersToURLParams(get().filters),
    }),
    {
      name: 'aura-filters',
      version: 1,
      // Only persist presets; runtime filters come from URL / user interaction
      partialize: (state) => ({
        presets: state.presets,
        // Optionally persist last-used filters:
        filters: state.filters,
        activePresetId: state.activePresetId,
      }),
    }
  )
);

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectFilters = (s: FilterState) => s.filters;
export const selectPresets = (s: FilterState) => s.presets;
export const selectPinnedPresets = (s: FilterState) => s.presets.filter((p) => p.isPinned);
export const selectHasActiveFilters = (s: FilterState) => {
  const f = s.filters;
  return (
    f.dateRange !== null ||
    f.departmentId !== null ||
    f.locationId !== null ||
    f.status !== 'all' ||
    f.search !== '' ||
    f.employeeId !== null ||
    f.managerId !== null
  );
};

export default useFilterStore;
