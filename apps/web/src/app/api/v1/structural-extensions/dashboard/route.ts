import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import {
  UNIFIED_WAGE_FILE_SCOPE,
  GRIEVANCE_MEDIATION_STATES,
  EXECUTIVE_DASHBOARD_SCOPES,
  OT_FRAUD_SIGNALS,
} from '@/lib/services/structural-extensions';
import { forbidden, hasAny, ok, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (_req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  return ok({
    unifiedWageFileScope: UNIFIED_WAGE_FILE_SCOPE,
    grievanceMediationStates: GRIEVANCE_MEDIATION_STATES,
    executiveDashboardScopes: EXECUTIVE_DASHBOARD_SCOPES,
    otFraudSignals: OT_FRAUD_SIGNALS,
    workspaces: [
      {
        story: 'EPIC-09-S06',
        label: 'Job Architecture (Family / Profile / Function / Grade)',
        route: '/api/v1/structural-extensions/job-architecture',
      },
      {
        story: 'EPIC-09-S07',
        label: 'Salary Grade Bands',
        route: '/api/v1/structural-extensions/salary-bands',
      },
      {
        story: 'EPIC-09-S10',
        label: 'Delegation of Authority (DoA) Matrix',
        route: '/api/v1/structural-extensions/doa',
      },
      {
        story: 'EPIC-10-S04',
        label: 'Payroll Calendar / Cut-off Control',
        route: '/api/v1/structural-extensions/payroll-calendar',
      },
      {
        story: 'EPIC-10-S13',
        label: 'Payroll Variance / Reconciliation Register',
        route: '/api/v1/structural-extensions/payroll-variance',
      },
      {
        story: 'EPIC-12-S12',
        label: 'Fatigue / Rest-Hours Rules',
        route: '/api/v1/structural-extensions/fatigue-rules',
      },
      {
        story: 'EPIC-12-S13',
        label: 'Overtime Fraud / Abuse Detection',
        route: '/api/v1/structural-extensions/ot-fraud',
      },
      {
        story: 'EPIC-15-S09',
        label: 'Expat EOS ↔ SIO Funding Link',
        route: '/api/v1/structural-extensions/eos-sio-funding',
      },
      {
        story: 'EPIC-20-S16',
        label: 'Return-to-Work Plans (long-leave / sick-leave)',
        route: '/api/v1/structural-extensions/return-to-work',
      },
      {
        story: 'EPIC-21-S12',
        label: 'Holiday Calendar Change-Management (maker-checker)',
        route: '/api/v1/structural-extensions/holiday-changes',
      },
      {
        story: 'EPIC-27-S05',
        label: 'Redundancy / Restructuring Batches',
        route: '/api/v1/structural-extensions/redundancy',
      },
      {
        story: 'EPIC-27-S16',
        label: 'Separation Data-Retention Policy',
        route: '/api/v1/structural-extensions/separation-retention',
      },
      {
        story: 'EPIC-30-S06',
        label: 'Physical File Location Register (warehouse/box/shelf)',
        route: '/api/v1/structural-extensions/physical-locations',
      },
      {
        story: 'EPIC-30-S13',
        label: 'Audit Finding ↔ Risk Link',
        route: '/api/v1/structural-extensions/finding-risk-links',
      },
      {
        story: 'EPIC-11-S05',
        label: 'Unified BH/OM/KW Wage-File Generator',
        route: 'service-only — see UnifiedWageFileGeneratorService',
      },
      {
        story: 'EPIC-25-S04',
        label: 'Grievance Informal Mediation States',
        route: 'service-only — see GRIEVANCE_MEDIATION_STATES',
      },
      {
        story: 'EPIC-30-S07',
        label: 'Classification-based Record RBAC',
        route: 'service-only — see canReadRecord',
      },
      {
        story: 'EPIC-31-S04',
        label: 'Executive Country-wise Rollup',
        route: 'service-only — see rollupByCountry',
      },
      {
        story: 'EPIC-31-S14',
        label: 'Executive Dashboard RBAC per Role',
        route: 'service-only — see canViewExecutiveDomain',
      },
    ],
  });
});
