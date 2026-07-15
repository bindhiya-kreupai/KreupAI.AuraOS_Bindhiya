/**
 * @module featureFlagService
 * @description Feature Flag Service — flag management with targeting rules,
 *              percentage rollout, user/tenant whitelists, and role-based targeting.
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

// ============================================================================
// TYPES
// ============================================================================

export type FlagStatus = 'enabled' | 'disabled' | 'partial';

export interface PercentageRollout {
  enabled: true;
  percentage: number; // 0-100
}

export interface TargetingRules {
  userWhitelist?: string[]; // user IDs always enabled
  tenantWhitelist?: string[]; // tenant IDs always enabled
  roleWhitelist?: string[]; // roles always enabled
  percentageRollout?: PercentageRollout;
  environmentOverrides?: Record<string, boolean>; // e.g., { development: true, production: false }
}

export interface FlagAuditEntry {
  id: string;
  flagKey: string;
  action: 'created' | 'enabled' | 'disabled' | 'targeting_updated' | 'rollout_changed';
  actor: string;
  actorName: string;
  timestamp: string;
  details: string;
  previousValue?: unknown;
  newValue?: unknown;
}

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  module: string;
  isEnabled: boolean;
  targeting: TargetingRules;
  status: FlagStatus;
  isPermanent: boolean; // permanent flags warn before disabling
  isProductionCritical: boolean; // requires confirmation to toggle
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastToggledBy?: string;
  auditLog: FlagAuditEntry[];
}

export interface FlagContext {
  userId?: string;
  tenantId?: string;
  role?: string;
  environment?: string;
}

export interface CreateFlagInput {
  key: string;
  name: string;
  description: string;
  module: string;
  isEnabled: boolean;
  targeting?: TargetingRules;
  isPermanent?: boolean;
  isProductionCritical?: boolean;
  tags?: string[];
}

export interface UpdateFlagInput {
  name?: string;
  description?: string;
  isEnabled?: boolean;
  targeting?: TargetingRules;
  isPermanent?: boolean;
  isProductionCritical?: boolean;
  tags?: string[];
}

// ============================================================================
// MOCK DATA — 12 Feature Flags
// ============================================================================

const MOCK_AUDIT: FlagAuditEntry[] = [
  {
    id: 'audit-001',
    flagKey: 'ai_performance_insights',
    action: 'enabled',
    actor: 'admin-001',
    actorName: 'System Admin',
    timestamp: '2026-02-15T10:00:00Z',
    details: 'Enabled for 20% rollout to test AI performance insights feature.',
    previousValue: false,
    newValue: true,
  },
  {
    id: 'audit-002',
    flagKey: 'workflow_automation_v2',
    action: 'targeting_updated',
    actor: 'admin-001',
    actorName: 'System Admin',
    timestamp: '2026-02-20T14:30:00Z',
    details: 'Added enterprise tenant to whitelist for early access.',
  },
];

const MOCK_FLAGS: FeatureFlag[] = [
  {
    key: 'ai_performance_insights',
    name: 'AI Performance Insights',
    description: 'Enable AI-powered performance review summaries and goal suggestions using LLM.',
    module: 'performance',
    isEnabled: true,
    status: 'partial',
    isPermanent: false,
    isProductionCritical: false,
    tags: ['ai', 'performance', 'beta'],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-02-15T10:00:00Z',
    lastToggledBy: 'System Admin',
    targeting: {
      percentageRollout: { enabled: true, percentage: 20 },
      tenantWhitelist: ['tenant-001'],
    },
    auditLog: MOCK_AUDIT.filter((a) => a.flagKey === 'ai_performance_insights'),
  },
  {
    key: 'workflow_automation_v2',
    name: 'Workflow Automation v2',
    description:
      'New visual workflow designer with advanced branching, parallel steps, and SLA tracking.',
    module: 'workflow',
    isEnabled: true,
    status: 'partial',
    isPermanent: false,
    isProductionCritical: true,
    tags: ['workflow', 'automation', 'beta'],
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2026-02-20T14:30:00Z',
    lastToggledBy: 'System Admin',
    targeting: {
      tenantWhitelist: ['tenant-001', 'tenant-003'],
      roleWhitelist: ['super-admin', 'hr-admin'],
    },
    auditLog: MOCK_AUDIT.filter((a) => a.flagKey === 'workflow_automation_v2'),
  },
  {
    key: 'bulk_employee_import',
    name: 'Bulk Employee Import',
    description:
      'CSV/Excel bulk import for employee records with validation, field mapping, and rollback.',
    module: 'core-hr',
    isEnabled: true,
    status: 'enabled',
    isPermanent: false,
    isProductionCritical: false,
    tags: ['import', 'hr', 'bulk'],
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2025-11-01T00:00:00Z',
    targeting: {},
    auditLog: [],
  },
  {
    key: 'gdpr_self_service',
    name: 'GDPR Self-Service Portal',
    description:
      'Employee self-service portal for data access requests, consent management, and data deletion.',
    module: 'compliance',
    isEnabled: true,
    status: 'enabled',
    isPermanent: true,
    isProductionCritical: true,
    tags: ['gdpr', 'privacy', 'compliance'],
    createdAt: '2025-05-25T00:00:00Z',
    updatedAt: '2025-12-01T00:00:00Z',
    targeting: {},
    auditLog: [],
  },
  {
    key: 'mobile_app_biometrics',
    name: 'Mobile Biometric Authentication',
    description: 'Enable Face ID / fingerprint authentication for the AuraOS mobile app.',
    module: 'mobile',
    isEnabled: false,
    status: 'disabled',
    isPermanent: false,
    isProductionCritical: false,
    tags: ['mobile', 'auth', 'security'],
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
    targeting: {},
    auditLog: [],
  },
  {
    key: 'advanced_analytics_v3',
    name: 'Advanced Analytics Dashboard v3',
    description:
      'Next-gen workforce analytics with predictive attrition, DEI metrics, and custom KPI builder.',
    module: 'analytics',
    isEnabled: true,
    status: 'partial',
    isPermanent: false,
    isProductionCritical: false,
    tags: ['analytics', 'ai', 'beta'],
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-10T00:00:00Z',
    targeting: {
      percentageRollout: { enabled: true, percentage: 50 },
      roleWhitelist: ['analytics-admin', 'hr-director'],
    },
    auditLog: [],
  },
  {
    key: 'payroll_direct_deposit',
    name: 'Payroll Direct Deposit Management',
    description: 'Employee self-service for managing direct deposit bank accounts for payroll.',
    module: 'payroll',
    isEnabled: true,
    status: 'enabled',
    isPermanent: true,
    isProductionCritical: true,
    tags: ['payroll', 'banking', 'ess'],
    createdAt: '2025-03-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
    targeting: {},
    auditLog: [],
  },
  {
    key: 'skills_ai_recommendations',
    name: 'AI Skills Gap Recommendations',
    description:
      'AI-powered learning course recommendations based on skills gaps and career goals.',
    module: 'learning',
    isEnabled: false,
    status: 'disabled',
    isPermanent: false,
    isProductionCritical: false,
    tags: ['ai', 'learning', 'skills'],
    createdAt: '2026-02-20T00:00:00Z',
    updatedAt: '2026-02-20T00:00:00Z',
    targeting: {},
    auditLog: [],
  },
  {
    key: 'multi_currency_payroll',
    name: 'Multi-Currency Payroll',
    description:
      'Process payroll in multiple currencies for international employees with auto FX conversion.',
    module: 'payroll',
    isEnabled: false,
    status: 'disabled',
    isPermanent: false,
    isProductionCritical: false,
    tags: ['payroll', 'international', 'currency'],
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
    targeting: {
      tenantWhitelist: ['tenant-003'],
    },
    auditLog: [],
  },
  {
    key: 'real_time_notifications',
    name: 'Real-Time Push Notifications',
    description:
      'WebSocket-based real-time notifications for approvals, mentions, and deadline reminders.',
    module: 'notifications',
    isEnabled: true,
    status: 'enabled',
    isPermanent: false,
    isProductionCritical: false,
    tags: ['notifications', 'realtime', 'websocket'],
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2025-12-01T00:00:00Z',
    targeting: {},
    auditLog: [],
  },
  {
    key: 'candidate_video_interviews',
    name: 'Video Interview Integration',
    description: 'Integrated video interview scheduling and recording via Zoom/Teams API.',
    module: 'recruitment',
    isEnabled: false,
    status: 'disabled',
    isPermanent: false,
    isProductionCritical: false,
    tags: ['recruitment', 'video', 'integration'],
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
    targeting: {},
    auditLog: [],
  },
  {
    key: 'dark_mode',
    name: 'Dark Mode UI Theme',
    description: 'Toggle dark mode across the AuraOS web application.',
    module: 'ui',
    isEnabled: true,
    status: 'enabled',
    isPermanent: false,
    isProductionCritical: false,
    tags: ['ui', 'theme', 'ux'],
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2025-10-01T00:00:00Z',
    targeting: {},
    auditLog: [],
  },
];

// ============================================================================
// HELPER — compute status
// ============================================================================

function computeStatus(flag: FeatureFlag): FlagStatus {
  if (!flag.isEnabled) return 'disabled';
  const t = flag.targeting;
  const hasPartialTargeting =
    (t.percentageRollout && t.percentageRollout.percentage < 100) ||
    (t.tenantWhitelist && t.tenantWhitelist.length > 0) ||
    (t.userWhitelist && t.userWhitelist.length > 0) ||
    (t.roleWhitelist && t.roleWhitelist.length > 0);
  return hasPartialTargeting ? 'partial' : 'enabled';
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class FeatureFlagService {
  /**
   * Get all feature flags
   */
  static async getFlags(): Promise<FeatureFlag[]> {
    try {
      const response = await APIClient.get<FeatureFlag[]>('/v1/feature-flags');
      return APIClient.unwrapList<FeatureFlag>(response);
    } catch {
      return MOCK_FLAGS.map((f) => ({ ...f, status: computeStatus(f) }));
    }
  }

  /**
   * Get a single flag by key
   */
  static async getFlag(key: string): Promise<FeatureFlag | null> {
    try {
      const response = await APIClient.get<FeatureFlag>(`/v1/feature-flags/${key}`);
      return APIClient.unwrapItem<FeatureFlag>(response);
    } catch {
      const flag = MOCK_FLAGS.find((f) => f.key === key);
      return flag ? { ...flag, status: computeStatus(flag) } : null;
    }
  }

  /**
   * Check if a flag is enabled for a given context
   */
  static async isEnabled(key: string, context?: FlagContext): Promise<boolean> {
    try {
      const response = await APIClient.post<boolean>(`/v1/feature-flags/${key}/evaluate`, {
        context,
      });
      return APIClient.unwrapItem<boolean>(response) ?? false;
    } catch {
      const flag = MOCK_FLAGS.find((f) => f.key === key);
      if (!flag || !flag.isEnabled) return false;

      const t = flag.targeting;

      // User whitelist check
      if (context?.userId && t.userWhitelist?.includes(context.userId)) return true;

      // Tenant whitelist check
      if (context?.tenantId && t.tenantWhitelist?.includes(context.tenantId)) return true;

      // Role whitelist check
      if (context?.role && t.roleWhitelist?.includes(context.role)) return true;

      // Percentage rollout — use hash of userId for deterministic assignment
      if (t.percentageRollout?.enabled) {
        const pct = t.percentageRollout.percentage;
        if (pct >= 100) return true;
        if (pct <= 0) return false;
        // Deterministic: hash userId into 0-99
        const userId = context?.userId ?? 'anonymous';
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
          hash = (hash << 5) - hash + userId.charCodeAt(i);
          hash |= 0;
        }
        return Math.abs(hash) % 100 < pct;
      }

      // No targeting rules — fully enabled
      return true;
    }
  }

  /**
   * Create a new feature flag
   */
  static async createFlag(data: CreateFlagInput): Promise<FeatureFlag> {
    try {
      const response = await APIClient.post<FeatureFlag>('/v1/feature-flags', data);
      return APIClient.unwrapItem<FeatureFlag>(response) ?? ({} as FeatureFlag);
    } catch {
      const newFlag: FeatureFlag = {
        key: data.key,
        name: data.name,
        description: data.description,
        module: data.module,
        isEnabled: data.isEnabled,
        status: 'disabled',
        isPermanent: data.isPermanent ?? false,
        isProductionCritical: data.isProductionCritical ?? false,
        tags: data.tags ?? [],
        targeting: data.targeting ?? {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        auditLog: [],
      };
      newFlag.status = computeStatus(newFlag);
      MOCK_FLAGS.push(newFlag);
      return newFlag;
    }
  }

  /**
   * Update a feature flag
   */
  static async updateFlag(key: string, data: UpdateFlagInput): Promise<FeatureFlag> {
    try {
      const response = await APIClient.patch<FeatureFlag>(`/v1/feature-flags/${key}`, data);
      return APIClient.unwrapItem<FeatureFlag>(response) ?? ({} as FeatureFlag);
    } catch {
      const idx = MOCK_FLAGS.findIndex((f) => f.key === key);
      if (idx < 0) throw new Error('Flag not found');

      const auditEntry: FlagAuditEntry = {
        id: `audit-${Date.now()}`,
        flagKey: key,
        action:
          data.isEnabled !== undefined
            ? data.isEnabled
              ? 'enabled'
              : 'disabled'
            : data.targeting
              ? 'targeting_updated'
              : 'targeting_updated',
        actor: 'current-user',
        actorName: 'Current User',
        timestamp: new Date().toISOString(),
        details: `Flag ${key} updated.`,
        previousValue: MOCK_FLAGS[idx].isEnabled,
        newValue: data.isEnabled,
      };

      MOCK_FLAGS[idx] = {
        ...MOCK_FLAGS[idx],
        ...data,
        updatedAt: new Date().toISOString(),
        lastToggledBy: 'Current User',
        auditLog: [auditEntry, ...MOCK_FLAGS[idx].auditLog],
      };
      MOCK_FLAGS[idx].status = computeStatus(MOCK_FLAGS[idx]);
      return MOCK_FLAGS[idx];
    }
  }

  /**
   * Quick toggle flag on/off
   */
  static async toggleFlag(key: string): Promise<FeatureFlag> {
    const flag = MOCK_FLAGS.find((f) => f.key === key);
    if (!flag) throw new Error('Flag not found');
    return FeatureFlagService.updateFlag(key, { isEnabled: !flag.isEnabled });
  }

  /**
   * Update rollout percentage
   */
  static async setRolloutPercentage(key: string, percentage: number): Promise<FeatureFlag> {
    return FeatureFlagService.updateFlag(key, {
      targeting: {
        ...(MOCK_FLAGS.find((f) => f.key === key)?.targeting ?? {}),
        percentageRollout: percentage < 100 ? { enabled: true, percentage } : undefined,
      },
    });
  }
}

export default FeatureFlagService;
