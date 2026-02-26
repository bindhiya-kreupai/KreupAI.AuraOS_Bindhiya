/**
 * @module tenantProvisioningService
 * @description Tenant Provisioning Service — automated tenant setup, usage tracking,
 *   billing management, plan upgrades, GDPR export, and tenant lifecycle control.
 * @project AURA HCM Platform
 * @section 24.1 — Multi-Tenant Management
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type TenantPlan = 'starter' | 'professional' | 'enterprise' | 'custom';
export type TenantStatus =
  | 'provisioning'
  | 'active'
  | 'trial'
  | 'suspended'
  | 'cancelled'
  | 'deactivated';
export type DataExportFormat = 'json' | 'csv' | 'xlsx';

export interface ProvisionTenantData {
  companyName: string;
  legalName: string;
  domain: string;
  country: string;
  industry: string;
  timezone: string;
  currency: string;
  plan: TenantPlan;
  adminUser: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  features: string[];
  employeeCount: number;
  billingEmail: string;
}

export interface ProvisionedTenant {
  tenantId: string;
  schemaName: string;
  companyName: string;
  domain: string;
  status: TenantStatus;
  plan: TenantPlan;
  adminUserId: string;
  adminEmail: string;
  provisionedAt: string;
  trialEndsAt: string | null;
  subscriptionStartsAt: string | null;
}

export interface TenantUsage {
  tenantId: string;
  companyName: string;
  period: string;
  users: { active: number; total: number; limit: number | null; utilization: number };
  storage: { usedGB: number; limitGB: number | null; utilization: number };
  apiCalls: { count: number; limit: number; utilization: number };
  features: { enabled: string[]; total: number; limit: number | null };
  workflows: { activeInstances: number; completedThisMonth: number };
  reports: { generatedThisMonth: number };
  dataRetentionDays: number;
}

export interface Invoice {
  id: string;
  period: string;
  amount: number;
  currency: string;
  status: 'paid' | 'unpaid' | 'overdue';
  dueDate: string;
  paidAt: string | null;
  pdfUrl: string;
}

export interface TenantBilling {
  tenantId: string;
  plan: TenantPlan;
  planLabel: string;
  pricePerUserMonth: number;
  activeUsers: number;
  currentMonthAmount: number;
  currency: string;
  billingCycle: 'monthly' | 'annual';
  nextBillingDate: string;
  paymentMethod: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string | null;
  invoices: Invoice[];
}

export interface UpgradePlanResult {
  tenantId: string;
  previousPlan: TenantPlan;
  newPlan: TenantPlan;
  effectiveDate: string;
  proratedAmount: number;
  currency: string;
  newFeatures: string[];
  newLimits: {
    users: number | null;
    storageGB: number | null;
    apiRateLimit: number;
  };
}

export interface ExportJob {
  jobId: string;
  tenantId: string;
  format: DataExportFormat;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  downloadUrl: string | null;
  expiresAt: string | null;
  requestedAt: string;
  completedAt: string | null;
  dataSets: string[];
  fileSizeMB: number | null;
}

export interface DeactivationResult {
  tenantId: string;
  status: TenantStatus;
  deactivatedAt: string;
  dataRetentionEndsAt: string;
  message: string;
}

// ── Plan Configurations ───────────────────────────────────────────────────────

const PLAN_CONFIGS: Record<
  TenantPlan,
  {
    label: string;
    pricePerUser: number;
    maxUsers: number | null;
    storageGB: number | null;
    apiRateLimit: number;
    features: string[];
  }
> = {
  starter: {
    label: 'Starter',
    pricePerUser: 5,
    maxUsers: 50,
    storageGB: 10,
    apiRateLimit: 1000,
    features: ['Core HR', 'Leave Management', 'Basic Reports', 'Employee Self Service'],
  },
  professional: {
    label: 'Professional',
    pricePerUser: 12,
    maxUsers: 500,
    storageGB: 100,
    apiRateLimit: 10000,
    features: [
      'Core HR',
      'Leave Management',
      'Payroll',
      'Recruitment',
      'Performance',
      'Advanced Reports',
      'Workflow Automation',
      'ESS/MSS',
      'API Access',
    ],
  },
  enterprise: {
    label: 'Enterprise',
    pricePerUser: 20,
    maxUsers: null,
    storageGB: null,
    apiRateLimit: 100000,
    features: [
      'All Professional Features',
      'Multi-Entity',
      'AI Analytics',
      'Custom Workflows',
      'SLA Management',
      'White Labeling',
      'Dedicated Support',
      'GDPR Tools',
      'SSO',
    ],
  },
  custom: {
    label: 'Custom',
    pricePerUser: 0,
    maxUsers: null,
    storageGB: null,
    apiRateLimit: 0,
    features: ['Negotiated Features'],
  },
};

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_USAGE: TenantUsage = {
  tenantId: 'TENANT-KAI-001',
  companyName: 'KreupAI Technologies',
  period: '2026-02',
  users: { active: 487, total: 495, limit: null, utilization: 100 },
  storage: { usedGB: 45.2, limitGB: null, utilization: 0 },
  apiCalls: { count: 1240500, limit: 100000, utilization: 124 },
  features: {
    enabled: PLAN_CONFIGS.enterprise.features,
    total: PLAN_CONFIGS.enterprise.features.length,
    limit: null,
  },
  workflows: { activeInstances: 42, completedThisMonth: 580 },
  reports: { generatedThisMonth: 234 },
  dataRetentionDays: 2555,
};

// ── Service Functions ─────────────────────────────────────────────────────────

export async function provisionTenant(data: ProvisionTenantData): Promise<ProvisionedTenant> {
  await new Promise((r) => setTimeout(r, 1500));
  const tenantId = `TENANT-${data.domain.split('.')[0].toUpperCase()}-${Date.now().toString().slice(-4)}`;
  const schemaName = `tenant_${data.domain.replace(/\./g, '_').replace(/-/g, '_')}`;
  const trialEnd = new Date(Date.now() + 14 * 24 * 3600000).toISOString();
  return {
    tenantId,
    schemaName,
    companyName: data.companyName,
    domain: data.domain,
    status: 'trial',
    plan: data.plan,
    adminUserId: `USR-${Date.now()}`,
    adminEmail: data.adminUser.email,
    provisionedAt: new Date().toISOString(),
    trialEndsAt: trialEnd,
    subscriptionStartsAt: null,
  };
}

export async function getTenantUsage(tenantId: string): Promise<TenantUsage> {
  await new Promise((r) => setTimeout(r, 300));
  return { ...MOCK_USAGE, tenantId };
}

export async function getTenantBilling(tenantId: string): Promise<TenantBilling> {
  await new Promise((r) => setTimeout(r, 300));
  const plan: TenantPlan = 'enterprise';
  const config = PLAN_CONFIGS[plan];
  return {
    tenantId,
    plan,
    planLabel: config.label,
    pricePerUserMonth: config.pricePerUser,
    activeUsers: 487,
    currentMonthAmount: 487 * config.pricePerUser,
    currency: 'USD',
    billingCycle: 'monthly',
    nextBillingDate: '2026-03-01',
    paymentMethod: 'Visa **** 4242',
    subscriptionStartDate: '2022-06-01',
    subscriptionEndDate: null,
    invoices: [
      {
        id: 'INV-2026-02',
        period: 'February 2026',
        amount: 487 * 20,
        currency: 'USD',
        status: 'paid',
        dueDate: '2026-02-05',
        paidAt: '2026-02-03T10:00:00Z',
        pdfUrl: '/invoices/INV-2026-02.pdf',
      },
      {
        id: 'INV-2026-01',
        period: 'January 2026',
        amount: 480 * 20,
        currency: 'USD',
        status: 'paid',
        dueDate: '2026-01-05',
        paidAt: '2026-01-04T09:30:00Z',
        pdfUrl: '/invoices/INV-2026-01.pdf',
      },
      {
        id: 'INV-2025-12',
        period: 'December 2025',
        amount: 475 * 20,
        currency: 'USD',
        status: 'paid',
        dueDate: '2025-12-05',
        paidAt: '2025-12-04T11:00:00Z',
        pdfUrl: '/invoices/INV-2025-12.pdf',
      },
    ],
  };
}

export async function upgradePlan(
  tenantId: string,
  newPlan: TenantPlan
): Promise<UpgradePlanResult> {
  await new Promise((r) => setTimeout(r, 600));
  const currentPlan: TenantPlan = 'professional';
  const currentConfig = PLAN_CONFIGS[currentPlan];
  const newConfig = PLAN_CONFIGS[newPlan];
  const daysRemaining = 15;
  const proratedAmount =
    (newConfig.pricePerUser - currentConfig.pricePerUser) * 487 * (daysRemaining / 30);
  const newFeatures = newConfig.features.filter((f) => !currentConfig.features.includes(f));
  return {
    tenantId,
    previousPlan: currentPlan,
    newPlan,
    effectiveDate: new Date().toISOString(),
    proratedAmount: Math.round(proratedAmount * 100) / 100,
    currency: 'USD',
    newFeatures,
    newLimits: {
      users: newConfig.maxUsers,
      storageGB: newConfig.storageGB,
      apiRateLimit: newConfig.apiRateLimit,
    },
  };
}

export async function exportTenantData(
  tenantId: string,
  format: DataExportFormat = 'json'
): Promise<ExportJob> {
  await new Promise((r) => setTimeout(r, 500));
  const jobId = `EXPORT-${tenantId}-${Date.now()}`;
  return {
    jobId,
    tenantId,
    format,
    status: 'queued',
    progress: 0,
    downloadUrl: null,
    expiresAt: null,
    requestedAt: new Date().toISOString(),
    completedAt: null,
    dataSets: [
      'employees',
      'payroll',
      'leave',
      'attendance',
      'performance',
      'documents',
      'audit_logs',
    ],
    fileSizeMB: null,
  };
}

export async function getExportJobStatus(jobId: string): Promise<ExportJob> {
  await new Promise((r) => setTimeout(r, 200));
  return {
    jobId,
    tenantId: 'TENANT-KAI-001',
    format: 'json',
    status: 'completed',
    progress: 100,
    downloadUrl: `/exports/${jobId}/data_export.zip`,
    expiresAt: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
    requestedAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: new Date().toISOString(),
    dataSets: [
      'employees',
      'payroll',
      'leave',
      'attendance',
      'performance',
      'documents',
      'audit_logs',
    ],
    fileSizeMB: 124.7,
  };
}

export async function deactivateTenant(
  tenantId: string,
  _reason: string
): Promise<DeactivationResult> {
  await new Promise((r) => setTimeout(r, 700));
  const retentionEnd = new Date(Date.now() + 90 * 24 * 3600000).toISOString();
  return {
    tenantId,
    status: 'deactivated',
    deactivatedAt: new Date().toISOString(),
    dataRetentionEndsAt: retentionEnd,
    message:
      'Tenant has been deactivated. Data will be retained for 90 days as per data retention policy before permanent deletion.',
  };
}

export function getPlanConfigs() {
  return PLAN_CONFIGS;
}
