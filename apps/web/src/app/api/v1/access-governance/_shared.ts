/**
 * @module access-governance/_shared
 * @description Shared mapping + seeding helpers for the Access Governance API.
 *              DB rows (SodRule / SodViolation / AccessReviewCampaign / AccessReviewItem)
 *              are mapped to the client service's TS interfaces (accessGovernanceService.ts).
 */
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';

// ── DB row shapes (loose — client is queried via `(prisma as any)`) ────────────

export interface SodRuleRow {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  riskLevel: string;
  conflictingRoles: any;
  isActive: boolean;
  createdAt: Date | string;
  createdBy?: string | null;
  violations?: { id: string }[];
}

export interface SodViolationRow {
  id: string;
  ruleId: string;
  userId: string;
  userName?: string | null;
  conflictA: string;
  conflictB: string;
  riskLevel: string;
  status: string;
  detectedAt: Date | string;
  resolution?: string | null;
  rule?: { name?: string | null } | null;
}

export interface CampaignRow {
  id: string;
  name: string;
  description?: string | null;
  scope: string;
  status: string;
  dueDate?: Date | string | null;
  totalItems: number;
  reviewedItems: number;
  reviewerName?: string | null;
  reviewerId?: string | null;
  startedAt?: Date | string | null;
  completedAt?: Date | string | null;
  createdAt: Date | string;
  items?: ReviewItemRow[];
}

export interface ReviewItemRow {
  id: string;
  campaignId: string;
  userId: string;
  userName?: string | null;
  roleName: string;
  resource?: string | null;
  decision: string;
  comment?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: Date | string | null;
  createdAt: Date | string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const iso = (d: Date | string | null | undefined): string =>
  d ? new Date(d).toISOString() : new Date(0).toISOString();

type Severity = 'critical' | 'high' | 'medium' | 'low';

const asSeverity = (v: string): Severity =>
  (['critical', 'high', 'medium', 'low'].includes(v) ? v : 'medium') as Severity;

/** conflictingRoles Json holds { entityA, entityB, rationale, exceptionProcess }. */
function unpackConflict(cr: any): {
  entityA: string;
  entityB: string;
  rationale: string;
  exceptionProcess?: string;
} {
  if (cr && typeof cr === 'object' && !Array.isArray(cr)) {
    return {
      entityA: cr.entityA ?? '',
      entityB: cr.entityB ?? '',
      rationale: cr.rationale ?? '',
      exceptionProcess: cr.exceptionProcess ?? undefined,
    };
  }
  // Fallback: array of two role names
  if (Array.isArray(cr)) {
    return { entityA: cr[0] ?? '', entityB: cr[1] ?? '', rationale: '' };
  }
  return { entityA: '', entityB: '', rationale: '' };
}

export function mapRuleToApi(row: SodRuleRow) {
  const c = unpackConflict(row.conflictingRoles);
  const conflictType = ['role-role', 'permission-permission', 'role-permission'].includes(
    row.category
  )
    ? row.category
    : 'role-role';
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    conflictType,
    severity: asSeverity(row.riskLevel),
    entityA: c.entityA,
    entityB: c.entityB,
    rationale: c.rationale,
    exceptionProcess: c.exceptionProcess,
    activeViolations: row.violations?.length ?? 0,
    isActive: row.isActive,
    createdAt: iso(row.createdAt),
    createdBy: row.createdBy ?? 'system',
  };
}

export function mapViolationToApi(row: SodViolationRow) {
  return {
    userId: row.userId,
    userName: row.userName ?? row.userId,
    userEmail: '',
    ruleId: row.ruleId,
    ruleName: row.rule?.name ?? '',
    severity: asSeverity(row.riskLevel),
    conflictingRoles: [row.conflictA, row.conflictB].filter(Boolean),
    detectedAt: iso(row.detectedAt),
    hasException: row.status === 'excepted' || row.status === 'accepted',
    exceptionReason: row.resolution ?? undefined,
  };
}

function mapCampaignStatus(s: string): 'active' | 'completed' | 'draft' | 'cancelled' {
  if (s === 'active' || s === 'in_progress') return 'active';
  if (s === 'completed') return 'completed';
  if (s === 'cancelled') return 'cancelled';
  return 'draft';
}

const REVIEW_TYPES = [
  'role-certification',
  'access-rights',
  'privileged-access',
  'separation-of-duties',
];

export function mapCampaignToApi(row: CampaignRow) {
  const items = row.items ?? [];
  const approvedItems = items.filter((i) => i.decision === 'approved').length;
  const revokedItems = items.filter((i) => i.decision === 'revoked').length;
  const completedItems = row.reviewedItems || approvedItems + revokedItems;
  const total = row.totalItems || items.length;
  const reviewType = REVIEW_TYPES.includes(row.scope) ? row.scope : 'role-certification';
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    status: mapCampaignStatus(row.status),
    reviewType,
    totalItems: total,
    completedItems,
    approvedItems,
    revokedItems,
    pendingItems: Math.max(0, total - completedItems),
    dueDate: iso(row.dueDate),
    startDate: iso(row.startedAt ?? row.createdAt),
    completedAt: row.completedAt ? iso(row.completedAt) : undefined,
    owners: row.reviewerName ? [row.reviewerName] : row.reviewerId ? [row.reviewerId] : [],
    targetScope: REVIEW_TYPES.includes(row.scope) ? '' : row.scope,
  };
}

function mapReviewStatus(d: string): 'pending' | 'approved' | 'revoked' | 'escalated' {
  if (d === 'approved') return 'approved';
  if (d === 'revoked') return 'revoked';
  if (d === 'escalated') return 'escalated';
  return 'pending';
}

export function mapReviewItemToApi(row: ReviewItemRow) {
  return {
    id: row.id,
    reviewId: row.campaignId,
    userId: row.userId,
    userName: row.userName ?? row.userId,
    userEmail: '',
    department: '',
    role: row.roleName,
    permission: row.resource ?? undefined,
    grantedAt: iso(row.createdAt),
    lastUsed: undefined,
    status: mapReviewStatus(row.decision),
    reviewedBy: row.reviewedBy ?? undefined,
    reviewedAt: row.reviewedAt ? iso(row.reviewedAt) : undefined,
    reviewComment: row.comment ?? undefined,
    riskScore: 0,
    isOverdue: false,
  };
}

/** 403 body with bilingual error, matching repo conventions. */
export function forbiddenResponse(permission: string) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'E4030',
        message: `Forbidden: missing ${permission} permission`,
        messageAr: 'ممنوع',
      },
    },
    { status: 403 }
  );
}

/** Seed two sensible default SoD rules for a tenant (idempotent caller checks count). */
export async function seedDefaultRules(tenantId: string, userId: string): Promise<void> {
  const defaults = [
    {
      name: 'Payroll Create & Payroll Approve',
      description: 'The same user cannot create payroll AND approve it — prevents financial fraud.',
      category: 'permission-permission',
      riskLevel: 'critical',
      conflictingRoles: {
        entityA: 'payroll.create',
        entityB: 'payroll.approve',
        rationale:
          'SOX control: Separation between payroll creation and approval prevents unauthorized payments.',
        exceptionProcess: 'CFO approval required. Document compensating control. Review quarterly.',
      },
    },
    {
      name: 'Super Admin & Auditor Role',
      description:
        'Super Admin and Auditor roles are incompatible — auditors cannot audit their own privileged actions.',
      category: 'role-role',
      riskLevel: 'critical',
      conflictingRoles: {
        entityA: 'Super Admin',
        entityB: 'Auditor',
        rationale:
          'Independence principle: An auditor must not have admin access to systems they audit.',
        exceptionProcess:
          'CISO approval required. Temporary access only with time-limited exception.',
      },
    },
  ];

  await Promise.all(
    defaults.map((d) =>
      (prisma as any).sodRule.create({
        data: {
          tenantId,
          isActive: true,
          createdBy: userId,
          updatedBy: userId,
          ...d,
        },
      })
    )
  );
}
