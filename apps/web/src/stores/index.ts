/**
 * @module Stores
 * @description Barrel export for all stores in AuraOS web.
 * @project AURA HCM Platform
 *
 * Context-based stores (React.createContext / Provider pattern):
 *   - ActivityStore   → ActivityProvider, useActivity
 *   - ThemeStore      → ThemeProvider, useTheme
 *   - DashboardStore  → DashboardProvider, useDashboard
 *   - SearchStore     → SearchProvider, useSearch
 *
 * Zustand stores (hook pattern, no Provider needed):
 *   - ApprovalStore         → useApprovalStore
 *   - NotificationStore     → useNotificationStore
 *   - OfflineStore          → useOfflineStore
 *   - UserPreferencesStore  → useUserPreferencesStore
 */

// ── Activity ────────────────────────────────────────────────────────────────
export { ActivityProvider, useActivity } from './activity-store';
export type { ActivityItem, FavoriteItem } from './activity-store';

// ── Theme ───────────────────────────────────────────────────────────────────
export { ThemeProvider, useTheme } from './theme-store';
export type { Theme, ResolvedTheme } from './theme-store';

// ── Dashboard ───────────────────────────────────────────────────────────────
export { DashboardProvider, useDashboard, DEFAULT_WIDGETS } from './dashboard-store';
export type {
  WidgetPosition,
  WidgetConfig,
  DashboardLayout,
  DashboardPreferences,
} from './dashboard-store';

// ── Search ──────────────────────────────────────────────────────────────────
export { SearchProvider, useSearch } from './search-store';
export type { SearchCategory, RecentSearch, SearchFilter } from './search-store';

// ── Approvals (Zustand) ─────────────────────────────────────────────────────
export { useApprovalStore } from './approval-store';
export type { ApprovalType, PendingApproval } from './approval-store';

// ── Notifications (Zustand) ─────────────────────────────────────────────────
export { useNotificationStore } from './notification-store';
export type { NotificationType, Notification } from './notification-store';

// ── Offline (Zustand + persist) ─────────────────────────────────────────────
export { useOfflineStore } from './offline-store';
export type { PendingAction } from './offline-store';

// ── User Preferences (Zustand + persist) ────────────────────────────────────
export { useUserPreferencesStore } from './user-preferences-store';
export type { Language, DateFormat, TimeFormat } from './user-preferences-store';
