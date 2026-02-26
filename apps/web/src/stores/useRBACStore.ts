/**
 * @module useRBACStore
 * @description Zustand store for Role-Based Access Control (RBAC).
 *              Manages permissions, roles, and feature flags for the current session.
 *              Persisted to localStorage so permissions survive page refreshes.
 * @project AURA HCM Platform
 *
 * @example
 * const { hasPermission, currentRole } = useRBACStore();
 *
 * // Check a single permission
 * if (hasPermission('payroll', 'export')) { ... }
 *
 * // Check multiple permissions (OR)
 * if (hasAnyPermission([['leaves', 'approve'], ['leaves', 'admin']])) { ... }
 *
 * // Check multiple permissions (AND)
 * if (hasAllPermissions([['employees', 'view'], ['employees', 'edit']])) { ... }
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Resources & Actions ───────────────────────────────────────────────────────

export type Resource =
  | 'employees'
  | 'leaves'
  | 'payroll'
  | 'expenses'
  | 'attendance'
  | 'compliance'
  | 'recruitment'
  | 'training'
  | 'settings'
  | 'reports'
  | 'notifications'
  | 'security'
  | 'governance'
  | 'analytics'
  | 'integrations';

export type Action = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export' | 'admin';

export interface Permission {
  resource: Resource;
  action: Action;
}

// ── Roles ─────────────────────────────────────────────────────────────────────

export type SystemRole =
  | 'super_admin'
  | 'hr_admin'
  | 'hr_manager'
  | 'payroll_admin'
  | 'recruiter'
  | 'manager'
  | 'employee'
  | 'read_only';

// ── Feature Flags ─────────────────────────────────────────────────────────────

export interface FeatureFlags {
  aiInsights: boolean;
  advancedAnalytics: boolean;
  mobileApp: boolean;
  bulkImport: boolean;
  apiAccess: boolean;
  customReports: boolean;
  multiCurrency: boolean;
  biometricAttendance: boolean;
  openBanking: boolean;
  eSignature: boolean;
  gdprCompliance: boolean;
  multiTenancy: boolean;
}

// ── Role Definitions ──────────────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<SystemRole, Permission[]> = {
  super_admin: [
    // All resources, all actions
    ...(
      [
        'employees',
        'leaves',
        'payroll',
        'expenses',
        'attendance',
        'compliance',
        'recruitment',
        'training',
        'settings',
        'reports',
        'notifications',
        'security',
        'governance',
        'analytics',
        'integrations',
      ] as Resource[]
    ).flatMap((resource) =>
      (['view', 'create', 'edit', 'delete', 'approve', 'export', 'admin'] as Action[]).map(
        (action) => ({ resource, action })
      )
    ),
  ],

  hr_admin: [
    ...(
      [
        'employees',
        'leaves',
        'attendance',
        'compliance',
        'recruitment',
        'training',
        'reports',
        'notifications',
        'governance',
        'analytics',
      ] as Resource[]
    ).flatMap((r) =>
      (['view', 'create', 'edit', 'delete', 'approve', 'export'] as Action[]).map((a) => ({
        resource: r,
        action: a,
      }))
    ),
    { resource: 'payroll', action: 'view' },
    { resource: 'payroll', action: 'export' },
    { resource: 'expenses', action: 'view' },
    { resource: 'expenses', action: 'approve' },
    { resource: 'settings', action: 'view' },
    { resource: 'settings', action: 'edit' },
    { resource: 'security', action: 'view' },
  ],

  hr_manager: [
    ...(['employees', 'leaves', 'attendance', 'training'] as Resource[]).flatMap((r) =>
      (['view', 'create', 'edit', 'approve', 'export'] as Action[]).map((a) => ({
        resource: r,
        action: a,
      }))
    ),
    { resource: 'recruitment', action: 'view' },
    { resource: 'recruitment', action: 'create' },
    { resource: 'recruitment', action: 'edit' },
    { resource: 'compliance', action: 'view' },
    { resource: 'reports', action: 'view' },
    { resource: 'reports', action: 'export' },
    { resource: 'analytics', action: 'view' },
    { resource: 'notifications', action: 'view' },
  ],

  payroll_admin: [
    ...(['payroll', 'expenses'] as Resource[]).flatMap((r) =>
      (['view', 'create', 'edit', 'delete', 'approve', 'export', 'admin'] as Action[]).map((a) => ({
        resource: r,
        action: a,
      }))
    ),
    { resource: 'employees', action: 'view' },
    { resource: 'attendance', action: 'view' },
    { resource: 'reports', action: 'view' },
    { resource: 'reports', action: 'export' },
    { resource: 'notifications', action: 'view' },
  ],

  recruiter: [
    ...(['recruitment'] as Resource[]).flatMap((r) =>
      (['view', 'create', 'edit', 'delete', 'export'] as Action[]).map((a) => ({
        resource: r,
        action: a,
      }))
    ),
    { resource: 'employees', action: 'view' },
    { resource: 'training', action: 'view' },
    { resource: 'reports', action: 'view' },
    { resource: 'notifications', action: 'view' },
  ],

  manager: [
    { resource: 'employees', action: 'view' },
    { resource: 'employees', action: 'edit' },
    { resource: 'leaves', action: 'view' },
    { resource: 'leaves', action: 'approve' },
    { resource: 'attendance', action: 'view' },
    { resource: 'attendance', action: 'edit' },
    { resource: 'expenses', action: 'view' },
    { resource: 'expenses', action: 'approve' },
    { resource: 'training', action: 'view' },
    { resource: 'training', action: 'approve' },
    { resource: 'recruitment', action: 'view' },
    { resource: 'reports', action: 'view' },
    { resource: 'notifications', action: 'view' },
    { resource: 'analytics', action: 'view' },
  ],

  employee: [
    { resource: 'employees', action: 'view' },
    { resource: 'leaves', action: 'view' },
    { resource: 'leaves', action: 'create' },
    { resource: 'attendance', action: 'view' },
    { resource: 'attendance', action: 'create' },
    { resource: 'payroll', action: 'view' },
    { resource: 'expenses', action: 'view' },
    { resource: 'expenses', action: 'create' },
    { resource: 'training', action: 'view' },
    { resource: 'training', action: 'create' },
    { resource: 'notifications', action: 'view' },
    { resource: 'security', action: 'view' },
    { resource: 'security', action: 'edit' },
  ],

  read_only: [
    { resource: 'employees', action: 'view' },
    { resource: 'leaves', action: 'view' },
    { resource: 'attendance', action: 'view' },
    { resource: 'payroll', action: 'view' },
    { resource: 'expenses', action: 'view' },
    { resource: 'compliance', action: 'view' },
    { resource: 'recruitment', action: 'view' },
    { resource: 'training', action: 'view' },
    { resource: 'reports', action: 'view' },
    { resource: 'notifications', action: 'view' },
  ],
};

const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  aiInsights: true,
  advancedAnalytics: true,
  mobileApp: true,
  bulkImport: true,
  apiAccess: false,
  customReports: true,
  multiCurrency: true,
  biometricAttendance: false,
  openBanking: false,
  eSignature: false,
  gdprCompliance: true,
  multiTenancy: false,
};

// ── Store Types ───────────────────────────────────────────────────────────────

interface RBACState {
  // State
  permissions: Permission[];
  roles: SystemRole[];
  currentRole: SystemRole;
  featureFlags: FeatureFlags;
  userId: string | null;
  tenantId: string | null;

  // Permission checks
  hasPermission: (resource: Resource, action: Action) => boolean;
  hasAnyPermission: (checks: [Resource, Action][]) => boolean;
  hasAllPermissions: (checks: [Resource, Action][]) => boolean;
  hasFeature: (flag: keyof FeatureFlags) => boolean;

  // Actions
  setRole: (role: SystemRole) => void;
  setAdditionalPermissions: (permissions: Permission[]) => void;
  revokePermission: (resource: Resource, action: Action) => void;
  setFeatureFlags: (flags: Partial<FeatureFlags>) => void;
  setUser: (userId: string, tenantId: string) => void;
  reset: () => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────

const DEFAULT_ROLE: SystemRole = 'employee';

export const useRBACStore = create<RBACState>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────────────────
      permissions: ROLE_PERMISSIONS[DEFAULT_ROLE],
      roles: [DEFAULT_ROLE],
      currentRole: DEFAULT_ROLE,
      featureFlags: DEFAULT_FEATURE_FLAGS,
      userId: null,
      tenantId: null,

      // ── Permission Checks ──────────────────────────────────────────────────

      hasPermission: (resource: Resource, action: Action): boolean => {
        const { permissions } = get();
        return permissions.some((p) => p.resource === resource && p.action === action);
      },

      hasAnyPermission: (checks: [Resource, Action][]): boolean => {
        const { permissions } = get();
        return checks.some(([resource, action]) =>
          permissions.some((p) => p.resource === resource && p.action === action)
        );
      },

      hasAllPermissions: (checks: [Resource, Action][]): boolean => {
        const { permissions } = get();
        return checks.every(([resource, action]) =>
          permissions.some((p) => p.resource === resource && p.action === action)
        );
      },

      hasFeature: (flag: keyof FeatureFlags): boolean => {
        return get().featureFlags[flag];
      },

      // ── Actions ───────────────────────────────────────────────────────────

      setRole: (role: SystemRole) => {
        const rolePermissions = ROLE_PERMISSIONS[role] ?? [];
        set({
          currentRole: role,
          roles: [role],
          permissions: rolePermissions,
        });
      },

      setAdditionalPermissions: (additional: Permission[]) => {
        set((state) => {
          const existing = state.permissions;
          // Merge without duplicates
          const merged = [...existing];
          for (const perm of additional) {
            const exists = merged.some(
              (p) => p.resource === perm.resource && p.action === perm.action
            );
            if (!exists) merged.push(perm);
          }
          return { permissions: merged };
        });
      },

      revokePermission: (resource: Resource, action: Action) => {
        set((state) => ({
          permissions: state.permissions.filter(
            (p) => !(p.resource === resource && p.action === action)
          ),
        }));
      },

      setFeatureFlags: (flags: Partial<FeatureFlags>) => {
        set((state) => ({ featureFlags: { ...state.featureFlags, ...flags } }));
      },

      setUser: (userId: string, tenantId: string) => {
        set({ userId, tenantId });
      },

      reset: () => {
        set({
          permissions: ROLE_PERMISSIONS[DEFAULT_ROLE],
          roles: [DEFAULT_ROLE],
          currentRole: DEFAULT_ROLE,
          featureFlags: DEFAULT_FEATURE_FLAGS,
          userId: null,
          tenantId: null,
        });
      },
    }),
    {
      name: 'aura-rbac',
      version: 1,
      // Only persist non-sensitive state
      partialize: (state) => ({
        currentRole: state.currentRole,
        roles: state.roles,
        featureFlags: state.featureFlags,
        userId: state.userId,
        tenantId: state.tenantId,
        // Permissions are derived from role; re-hydrate on store init
        permissions: state.permissions,
      }),
    }
  )
);

// ── Convenience selectors ─────────────────────────────────────────────────────

export const selectHasPermission = (resource: Resource, action: Action) => (state: RBACState) =>
  state.hasPermission(resource, action);

export const selectCurrentRole = (state: RBACState) => state.currentRole;
export const selectFeatureFlags = (state: RBACState) => state.featureFlags;

// ── Role meta (for UI display) ────────────────────────────────────────────────

export const ROLE_META: Record<SystemRole, { label: string; color: string; description: string }> =
  {
    super_admin: {
      label: 'Super Admin',
      color: 'text-red-600',
      description: 'Full system access including tenant management',
    },
    hr_admin: {
      label: 'HR Admin',
      color: 'text-purple-600',
      description: 'Full HR module access with settings management',
    },
    hr_manager: {
      label: 'HR Manager',
      color: 'text-blue-600',
      description: 'HR operations management without system settings',
    },
    payroll_admin: {
      label: 'Payroll Admin',
      color: 'text-emerald-600',
      description: 'Full payroll and expense management access',
    },
    recruiter: {
      label: 'Recruiter',
      color: 'text-amber-600',
      description: 'Full recruitment module access',
    },
    manager: {
      label: 'Manager',
      color: 'text-cyan-600',
      description: 'Team management and approval workflows',
    },
    employee: {
      label: 'Employee',
      color: 'text-slate-600',
      description: 'Standard employee self-service access',
    },
    read_only: {
      label: 'Read Only',
      color: 'text-gray-500',
      description: 'View-only access across all modules',
    },
  };

export { ROLE_PERMISSIONS };
export default useRBACStore;
