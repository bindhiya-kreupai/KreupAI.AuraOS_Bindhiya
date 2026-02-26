/**
 * @module tenantService
 * @description Multi-Tenancy Service — tenant CRUD, provisioning, suspension,
 *              usage metrics, and per-tenant configuration management.
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

// ============================================================================
// TYPES
// ============================================================================

export type TenantPlan = 'starter' | 'professional' | 'enterprise';
export type TenantStatus = 'active' | 'suspended' | 'trial' | 'cancelled' | 'provisioning';

export interface TenantPlanConfig {
  plan: TenantPlan;
  label: string;
  maxUsers: number | null;
  storageLimitGB: number | null;
  apiRateLimit: number; // requests/minute
  modules: string[];
  price: number; // per user/month
}

export interface TenantBranding {
  logoUrl?: string;
  primaryColor: string;
  accentColor: string;
  companyName: string;
  favicon?: string;
}

export interface TenantModuleConfig {
  key: string;
  label: string;
  enabled: boolean;
  category: string;
}

export interface TenantConfig {
  tenantId: string;
  generalSettings: {
    name: string;
    domain: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    language: string;
  };
  branding: TenantBranding;
  modules: TenantModuleConfig[];
  limits: {
    maxUsers: number | null;
    storageLimitGB: number | null;
    apiRateLimit: number;
    sessionTimeoutMinutes: number;
    maxFileUploadMB: number;
  };
  sso: {
    enabled: boolean;
    provider: 'saml' | 'oidc' | 'none';
    metadataUrl?: string;
    entityId?: string;
    acsUrl?: string;
  };
  dataRetention: {
    employeeDataYears: number;
    auditLogsYears: number;
    documentRetentionYears: number;
    autoDeleteEnabled: boolean;
  };
}

export interface TenantUsage {
  tenantId: string;
  activeUsers: number;
  totalUsers: number;
  storageUsedGB: number;
  storageLimitGB: number | null;
  apiCallsToday: number;
  apiCallsMonth: number;
  apiRateLimit: number;
  activeSessions: number;
  lastActivityAt: string;
  moduleUsage: {
    module: string;
    activeUsers: number;
    actionsToday: number;
  }[];
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string;
  plan: TenantPlan;
  status: TenantStatus;
  adminEmail: string;
  adminName: string;
  totalUsers: number;
  activeUsers: number;
  storageUsedGB: number;
  createdAt: string;
  trialEndsAt?: string;
  suspendedAt?: string;
  suspendedReason?: string;
  lastActivityAt: string;
  config?: TenantConfig;
}

export interface CreateTenantInput {
  name: string;
  domain: string;
  adminEmail: string;
  adminName: string;
  plan: TenantPlan;
  timezone?: string;
}

export interface UpdateTenantInput {
  name?: string;
  domain?: string;
  plan?: TenantPlan;
  adminEmail?: string;
}

// ============================================================================
// PLAN CONFIGURATIONS
// ============================================================================

export const PLAN_CONFIGS: Record<TenantPlan, TenantPlanConfig> = {
  starter: {
    plan: 'starter',
    label: 'Starter',
    maxUsers: 50,
    storageLimitGB: 5,
    apiRateLimit: 100,
    price: 8,
    modules: ['core-hr', 'leave', 'attendance', 'payroll', 'documents'],
  },
  professional: {
    plan: 'professional',
    label: 'Professional',
    maxUsers: 500,
    storageLimitGB: 50,
    apiRateLimit: 500,
    price: 15,
    modules: [
      'core-hr',
      'leave',
      'attendance',
      'payroll',
      'documents',
      'performance',
      'recruitment',
      'expenses',
      'learning',
      'reports',
      'analytics',
      'compliance-training',
      'benefits',
    ],
  },
  enterprise: {
    plan: 'enterprise',
    label: 'Enterprise',
    maxUsers: null, // unlimited
    storageLimitGB: null, // unlimited
    apiRateLimit: 2000,
    price: 25,
    modules: [
      'core-hr',
      'leave',
      'attendance',
      'payroll',
      'documents',
      'performance',
      'recruitment',
      'expenses',
      'learning',
      'reports',
      'analytics',
      'compliance-training',
      'benefits',
      'succession',
      'compensation',
      'helpdesk',
      'mentorship',
      'recognition',
      'workflow-automation',
      'custom-fields',
      'api-access',
    ],
  },
};

// ============================================================================
// MOCK DATA
// ============================================================================

const ALL_MODULES: TenantModuleConfig[] = [
  { key: 'core-hr', label: 'Core HR', enabled: true, category: 'HR' },
  { key: 'leave', label: 'Leave Management', enabled: true, category: 'HR' },
  { key: 'attendance', label: 'Attendance & Time', enabled: true, category: 'HR' },
  { key: 'payroll', label: 'Payroll', enabled: true, category: 'Finance' },
  { key: 'expenses', label: 'Expense Management', enabled: true, category: 'Finance' },
  { key: 'recruitment', label: 'Recruitment', enabled: true, category: 'Talent' },
  { key: 'performance', label: 'Performance Management', enabled: true, category: 'Talent' },
  { key: 'learning', label: 'Learning & Development', enabled: true, category: 'Talent' },
  { key: 'succession', label: 'Succession Planning', enabled: false, category: 'Talent' },
  { key: 'compensation', label: 'Compensation Management', enabled: false, category: 'Finance' },
  { key: 'benefits', label: 'Benefits Administration', enabled: true, category: 'HR' },
  { key: 'documents', label: 'Documents & Policies', enabled: true, category: 'Administration' },
  { key: 'reports', label: 'Reports & Exports', enabled: true, category: 'Analytics' },
  { key: 'analytics', label: 'People Analytics', enabled: true, category: 'Analytics' },
  {
    key: 'compliance-training',
    label: 'Compliance Training',
    enabled: true,
    category: 'Compliance',
  },
  { key: 'helpdesk', label: 'HR Helpdesk', enabled: false, category: 'Administration' },
  { key: 'mentorship', label: 'Mentorship Programs', enabled: false, category: 'Talent' },
  { key: 'recognition', label: 'Recognition & Rewards', enabled: true, category: 'Engagement' },
  {
    key: 'workflow-automation',
    label: 'Workflow Automation',
    enabled: false,
    category: 'Administration',
  },
  { key: 'custom-fields', label: 'Custom Fields', enabled: false, category: 'Administration' },
  { key: 'api-access', label: 'API Access', enabled: false, category: 'Integration' },
  { key: 'mobile-app', label: 'Mobile App', enabled: true, category: 'Access' },
];

const MOCK_TENANTS: Tenant[] = [
  {
    id: 'tenant-001',
    name: 'Acme Corporation',
    slug: 'acme-corp',
    domain: 'acme.auraos.app',
    plan: 'enterprise',
    status: 'active',
    adminEmail: 'admin@acme.com',
    adminName: 'John Mitchell',
    totalUsers: 342,
    activeUsers: 310,
    storageUsedGB: 18.4,
    createdAt: '2024-03-15T00:00:00Z',
    lastActivityAt: '2026-02-25T08:45:00Z',
  },
  {
    id: 'tenant-002',
    name: 'TechStart Inc.',
    slug: 'techstart',
    domain: 'techstart.auraos.app',
    plan: 'professional',
    status: 'active',
    adminEmail: 'hr@techstart.io',
    adminName: 'Sarah Kim',
    totalUsers: 89,
    activeUsers: 82,
    storageUsedGB: 7.2,
    createdAt: '2024-08-20T00:00:00Z',
    lastActivityAt: '2026-02-25T07:30:00Z',
  },
  {
    id: 'tenant-003',
    name: 'GlobalLogix',
    slug: 'globallogix',
    domain: 'globallogix.auraos.app',
    plan: 'enterprise',
    status: 'active',
    adminEmail: 'it@globallogix.com',
    adminName: 'David Park',
    totalUsers: 1250,
    activeUsers: 1180,
    storageUsedGB: 67.8,
    createdAt: '2023-11-01T00:00:00Z',
    lastActivityAt: '2026-02-25T09:00:00Z',
  },
  {
    id: 'tenant-004',
    name: 'Sunrise Retail Co.',
    slug: 'sunrise-retail',
    domain: 'sunrise.auraos.app',
    plan: 'starter',
    status: 'trial',
    adminEmail: 'admin@sunriseretail.com',
    adminName: 'Lisa Chen',
    totalUsers: 12,
    activeUsers: 10,
    storageUsedGB: 0.4,
    createdAt: '2026-02-01T00:00:00Z',
    trialEndsAt: '2026-03-03T00:00:00Z',
    lastActivityAt: '2026-02-24T16:20:00Z',
  },
  {
    id: 'tenant-005',
    name: 'BuildCo Solutions',
    slug: 'buildco',
    domain: 'buildco.auraos.app',
    plan: 'professional',
    status: 'suspended',
    adminEmail: 'accounts@buildco.net',
    adminName: 'Mike Adams',
    totalUsers: 145,
    activeUsers: 0,
    storageUsedGB: 12.1,
    createdAt: '2024-01-10T00:00:00Z',
    suspendedAt: '2026-01-15T00:00:00Z',
    suspendedReason: 'Payment overdue — 45 days',
    lastActivityAt: '2026-01-15T10:00:00Z',
  },
];

const MOCK_USAGE: Record<string, TenantUsage> = {
  'tenant-001': {
    tenantId: 'tenant-001',
    activeUsers: 310,
    totalUsers: 342,
    storageUsedGB: 18.4,
    storageLimitGB: null,
    apiCallsToday: 14520,
    apiCallsMonth: 342800,
    apiRateLimit: 2000,
    activeSessions: 145,
    lastActivityAt: '2026-02-25T08:45:00Z',
    moduleUsage: [
      { module: 'core-hr', activeUsers: 310, actionsToday: 520 },
      { module: 'payroll', activeUsers: 12, actionsToday: 85 },
      { module: 'leave', activeUsers: 45, actionsToday: 120 },
    ],
  },
  'tenant-002': {
    tenantId: 'tenant-002',
    activeUsers: 82,
    totalUsers: 89,
    storageUsedGB: 7.2,
    storageLimitGB: 50,
    apiCallsToday: 2450,
    apiCallsMonth: 58000,
    apiRateLimit: 500,
    activeSessions: 38,
    lastActivityAt: '2026-02-25T07:30:00Z',
    moduleUsage: [
      { module: 'core-hr', activeUsers: 82, actionsToday: 200 },
      { module: 'recruitment', activeUsers: 5, actionsToday: 40 },
    ],
  },
};

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class TenantService {
  /**
   * Get all tenants
   */
  static async getTenants(): Promise<Tenant[]> {
    try {
      return await APIClient.get<Tenant[]>('/v1/admin/tenants');
    } catch {
      return MOCK_TENANTS;
    }
  }

  /**
   * Get a single tenant with full details
   */
  static async getTenant(id: string): Promise<Tenant | null> {
    try {
      return await APIClient.get<Tenant>(`/v1/admin/tenants/${id}`);
    } catch {
      return MOCK_TENANTS.find((t) => t.id === id) ?? null;
    }
  }

  /**
   * Create (provision) a new tenant
   */
  static async createTenant(data: CreateTenantInput): Promise<Tenant> {
    try {
      return await APIClient.post<Tenant>('/v1/admin/tenants', data);
    } catch {
      const _planConfig = PLAN_CONFIGS[data.plan];
      const newTenant: Tenant = {
        id: `tenant-${Date.now()}`,
        name: data.name,
        slug: data.name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, ''),
        domain: data.domain,
        plan: data.plan,
        status: 'provisioning',
        adminEmail: data.adminEmail,
        adminName: data.adminName,
        totalUsers: 1,
        activeUsers: 0,
        storageUsedGB: 0,
        createdAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      MOCK_TENANTS.unshift(newTenant);

      // Simulate provisioning completion
      setTimeout(() => {
        const idx = MOCK_TENANTS.findIndex((t) => t.id === newTenant.id);
        if (idx >= 0) MOCK_TENANTS[idx].status = 'trial';
      }, 3000);

      return newTenant;
    }
  }

  /**
   * Update tenant settings
   */
  static async updateTenant(id: string, data: UpdateTenantInput): Promise<Tenant> {
    try {
      return await APIClient.patch<Tenant>(`/v1/admin/tenants/${id}`, data);
    } catch {
      const idx = MOCK_TENANTS.findIndex((t) => t.id === id);
      if (idx < 0) throw new Error('Tenant not found');
      MOCK_TENANTS[idx] = { ...MOCK_TENANTS[idx], ...data };
      return MOCK_TENANTS[idx];
    }
  }

  /**
   * Suspend a tenant (data preserved)
   */
  static async suspendTenant(id: string, reason: string): Promise<Tenant> {
    try {
      return await APIClient.post<Tenant>(`/v1/admin/tenants/${id}/suspend`, { reason });
    } catch {
      const idx = MOCK_TENANTS.findIndex((t) => t.id === id);
      if (idx < 0) throw new Error('Tenant not found');
      MOCK_TENANTS[idx] = {
        ...MOCK_TENANTS[idx],
        status: 'suspended',
        suspendedAt: new Date().toISOString(),
        suspendedReason: reason,
        activeUsers: 0,
      };
      return MOCK_TENANTS[idx];
    }
  }

  /**
   * Reactivate a suspended tenant
   */
  static async reactivateTenant(id: string): Promise<Tenant> {
    try {
      return await APIClient.post<Tenant>(`/v1/admin/tenants/${id}/reactivate`, {});
    } catch {
      const idx = MOCK_TENANTS.findIndex((t) => t.id === id);
      if (idx < 0) throw new Error('Tenant not found');
      MOCK_TENANTS[idx] = {
        ...MOCK_TENANTS[idx],
        status: 'active',
        suspendedAt: undefined,
        suspendedReason: undefined,
        activeUsers: MOCK_TENANTS[idx].totalUsers,
      };
      return MOCK_TENANTS[idx];
    }
  }

  /**
   * Get tenant usage metrics
   */
  static async getTenantUsage(id: string): Promise<TenantUsage> {
    try {
      return await APIClient.get<TenantUsage>(`/v1/admin/tenants/${id}/usage`);
    } catch {
      const tenant = MOCK_TENANTS.find((t) => t.id === id);
      return (
        MOCK_USAGE[id] ?? {
          tenantId: id,
          activeUsers: tenant?.activeUsers ?? 0,
          totalUsers: tenant?.totalUsers ?? 0,
          storageUsedGB: tenant?.storageUsedGB ?? 0,
          storageLimitGB: PLAN_CONFIGS[tenant?.plan ?? 'starter'].storageLimitGB,
          apiCallsToday: Math.floor(Math.random() * 5000),
          apiCallsMonth: Math.floor(Math.random() * 100000),
          apiRateLimit: PLAN_CONFIGS[tenant?.plan ?? 'starter'].apiRateLimit,
          activeSessions: Math.floor(Math.random() * 50),
          lastActivityAt: tenant?.lastActivityAt ?? new Date().toISOString(),
          moduleUsage: [],
        }
      );
    }
  }

  /**
   * Get tenant-specific configuration
   */
  static async getTenantConfig(id: string): Promise<TenantConfig> {
    try {
      return await APIClient.get<TenantConfig>(`/v1/admin/tenants/${id}/config`);
    } catch {
      const tenant = MOCK_TENANTS.find((t) => t.id === id);
      const plan = tenant?.plan ?? 'starter';
      const enabledModules = PLAN_CONFIGS[plan].modules;

      return {
        tenantId: id,
        generalSettings: {
          name: tenant?.name ?? '',
          domain: tenant?.domain ?? '',
          timezone: 'America/New_York',
          dateFormat: 'MM/DD/YYYY',
          currency: 'USD',
          language: 'en-US',
        },
        branding: {
          primaryColor: '#2563EB',
          accentColor: '#7C3AED',
          companyName: tenant?.name ?? '',
        },
        modules: ALL_MODULES.map((m) => ({
          ...m,
          enabled: enabledModules.includes(m.key),
        })),
        limits: {
          maxUsers: PLAN_CONFIGS[plan].maxUsers,
          storageLimitGB: PLAN_CONFIGS[plan].storageLimitGB,
          apiRateLimit: PLAN_CONFIGS[plan].apiRateLimit,
          sessionTimeoutMinutes: 480,
          maxFileUploadMB: 50,
        },
        sso: {
          enabled: false,
          provider: 'none',
        },
        dataRetention: {
          employeeDataYears: 7,
          auditLogsYears: 3,
          documentRetentionYears: 10,
          autoDeleteEnabled: false,
        },
      };
    }
  }

  /**
   * Update tenant configuration
   */
  static async updateTenantConfig(
    id: string,
    config: Partial<TenantConfig>
  ): Promise<TenantConfig> {
    try {
      return await APIClient.patch<TenantConfig>(`/v1/admin/tenants/${id}/config`, config);
    } catch {
      // Return merged mock config
      const existing = await TenantService.getTenantConfig(id);
      return { ...existing, ...config };
    }
  }
}

export default TenantService;
