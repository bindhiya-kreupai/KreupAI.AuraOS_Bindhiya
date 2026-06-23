/**
 * EPIC-23 Accommodation / Welfare — residual closures.
 *
 * Three pure evaluators plus one persistence class:
 *
 *   1. WelfareGrievanceMakerCheckerService — maker-checker workflow
 *      for camp / accommodation welfare grievances. Submit → review →
 *      approve / reject. Same shape as the workforce-planning
 *      requisition workflow but scoped to camp welfare grievances.
 *
 *   2. evaluateWaterQualityCadence — water-quality test cadence per
 *      site. Each parameter (microbiological, TDS, residual chlorine,
 *      pH) has a target frequency. Returns overdue tests with bilingual
 *      reason text.
 *
 *   3. evaluateContractorAccommodationParity — checks that contractor
 *      / labour-supply company workers live in accommodations of
 *      comparable quality (size per person, hygiene score, fire score)
 *      vs. the principal employer's own workers. Surfaces parity gaps
 *      that auditors challenge under MoHRE / GLA labour-supply rules.
 *
 * No new Prisma models — maker-checker persists via AuditLog. Each
 * verdict carries `en` and `ar` reason text.
 */

import { auditService, AuditAction, AuditSeverity } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';

export interface AuthContext {
  tenantId: string;
  userId: string;
  userEmail?: string;
}

// ============================================================================
// 1. Welfare grievance maker-checker
// ============================================================================

export type WelfareGrievanceStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface WelfareGrievanceState {
  grievanceId: string;
  status: WelfareGrievanceStatus;
  submittedBy?: string;
  submittedAt?: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  details?: string;
  category?: string;
}

const RESOURCE_GRIEVANCE = 'welfare_grievance_workflow';

/** Pure reducer — newest-first audit trail to current state. */
export function reduceWelfareGrievanceTrail(
  rows: Array<{ timestamp: Date; metadata: Record<string, unknown> | null }>
): WelfareGrievanceState | null {
  if (rows.length === 0) return null;
  const head = rows[0];
  const tail = rows[rows.length - 1].metadata as Record<string, unknown> | null;
  if (!tail) return null;
  const headMeta = (head.metadata as Record<string, unknown>) ?? {};
  const out: WelfareGrievanceState = {
    grievanceId: String(tail.grievanceId ?? ''),
    status: (headMeta.status as WelfareGrievanceStatus) ?? 'DRAFT',
    submittedBy: String(tail.submittedBy ?? ''),
    submittedAt: new Date(String(tail.submittedAt ?? rows[rows.length - 1].timestamp)),
    details: typeof tail.details === 'string' ? (tail.details as string) : undefined,
    category: typeof tail.category === 'string' ? (tail.category as string) : undefined,
  };
  if (out.status === 'APPROVED' || out.status === 'REJECTED') {
    out.reviewedBy = String(headMeta.reviewedBy ?? '');
    out.reviewedAt = new Date(String(headMeta.reviewedAt ?? head.timestamp));
    if (out.status === 'REJECTED') {
      out.rejectionReason =
        typeof headMeta.reason === 'string' ? (headMeta.reason as string) : undefined;
    }
  }
  return out;
}

export class WelfareGrievanceMakerCheckerService {
  async submit(
    input: { grievanceId: string; details: string; category: string },
    auth: AuthContext
  ): Promise<WelfareGrievanceState> {
    if (!input.details || input.details.trim().length < 10) {
      throw new Error('details required (min 10 chars)');
    }
    if (!input.category) throw new Error('category required');
    const submittedAt = new Date();
    await auditService.log({
      action: AuditAction.SETTINGS_UPDATED,
      severity: AuditSeverity.MEDIUM,
      userId: auth.userId,
      userEmail: auth.userEmail,
      tenantId: auth.tenantId,
      resourceType: RESOURCE_GRIEVANCE,
      resourceId: input.grievanceId,
      success: true,
      metadata: {
        grievanceId: input.grievanceId,
        status: 'SUBMITTED' as const,
        submittedBy: auth.userId,
        submittedAt: submittedAt.toISOString(),
        details: input.details,
        category: input.category,
      },
    });
    return {
      grievanceId: input.grievanceId,
      status: 'SUBMITTED',
      submittedBy: auth.userId,
      submittedAt,
      details: input.details,
      category: input.category,
    };
  }

  async approve(grievanceId: string, auth: AuthContext): Promise<WelfareGrievanceState> {
    const state = await this.findOne(grievanceId, auth.tenantId);
    if (!state) throw new Error('grievance workflow not found');
    if (state.status !== 'SUBMITTED') throw new Error(`cannot approve a ${state.status} grievance`);
    if (state.submittedBy === auth.userId) {
      throw new Error('maker-checker violation: submitter cannot self-approve');
    }
    const reviewedAt = new Date();
    await auditService.log({
      action: AuditAction.SETTINGS_UPDATED,
      severity: AuditSeverity.HIGH,
      userId: auth.userId,
      userEmail: auth.userEmail,
      tenantId: auth.tenantId,
      resourceType: RESOURCE_GRIEVANCE,
      resourceId: grievanceId,
      success: true,
      metadata: {
        grievanceId,
        status: 'APPROVED' as const,
        reviewedBy: auth.userId,
        reviewedAt: reviewedAt.toISOString(),
      },
    });
    return { ...state, status: 'APPROVED', reviewedBy: auth.userId, reviewedAt };
  }

  async reject(
    grievanceId: string,
    reason: string,
    auth: AuthContext
  ): Promise<WelfareGrievanceState> {
    const state = await this.findOne(grievanceId, auth.tenantId);
    if (!state) throw new Error('grievance workflow not found');
    if (state.status !== 'SUBMITTED') throw new Error(`cannot reject a ${state.status} grievance`);
    if (state.submittedBy === auth.userId) {
      throw new Error('maker-checker violation: submitter cannot self-reject');
    }
    if (!reason || reason.trim().length < 5) throw new Error('rejection reason required');
    const reviewedAt = new Date();
    await auditService.log({
      action: AuditAction.SETTINGS_UPDATED,
      severity: AuditSeverity.MEDIUM,
      userId: auth.userId,
      userEmail: auth.userEmail,
      tenantId: auth.tenantId,
      resourceType: RESOURCE_GRIEVANCE,
      resourceId: grievanceId,
      success: true,
      metadata: {
        grievanceId,
        status: 'REJECTED' as const,
        reviewedBy: auth.userId,
        reviewedAt: reviewedAt.toISOString(),
        reason,
      },
    });
    return {
      ...state,
      status: 'REJECTED',
      reviewedBy: auth.userId,
      reviewedAt,
      rejectionReason: reason,
    };
  }

  async findOne(grievanceId: string, tenantId: string): Promise<WelfareGrievanceState | null> {
    const rows = await (prisma as any).auditLog.findMany({
      where: { tenantId, resourceType: RESOURCE_GRIEVANCE, resourceId: grievanceId },
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true, metadata: true },
    });
    return reduceWelfareGrievanceTrail(rows);
  }
}

export const welfareGrievanceMakerCheckerService = new WelfareGrievanceMakerCheckerService();

// ============================================================================
// 2. Water-quality test cadence
// ============================================================================

export type WaterQualityParameter =
  | 'MICROBIOLOGICAL'
  | 'TDS'
  | 'RESIDUAL_CHLORINE'
  | 'PH'
  | 'HEAVY_METALS';

export interface WaterQualityTest {
  parameter: WaterQualityParameter;
  testedAt: Date;
  /** Test value (used by score, not by cadence). */
  value?: number;
  /** Whether the test was certified by an external lab. */
  certifiedLab: boolean;
  passed: boolean;
}

export interface WaterQualityCadenceInput {
  /** Tests on file for the site. */
  tests: WaterQualityTest[];
  /** Required cadence in days per parameter; missing entries fall back to defaults. */
  cadence?: Partial<Record<WaterQualityParameter, number>>;
  /** Whether external-lab certification is required for the parameter. */
  requireCertifiedLab?: Partial<Record<WaterQualityParameter, boolean>>;
  asOf: Date;
}

export interface WaterQualityFailure {
  parameter: WaterQualityParameter;
  code: 'NEVER_TESTED' | 'OVERDUE' | 'NOT_CERTIFIED' | 'LAST_TEST_FAILED';
  daysSinceLastTest: number;
  description: string;
  descriptionAr: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface WaterQualityCadenceReport {
  totals: {
    parametersInScope: number;
    overdue: number;
    failed: number;
    coveragePct: number;
  };
  failures: WaterQualityFailure[];
}

/** MoHRE / labour-camp standard cadence per parameter, in days. */
export const DEFAULT_WATER_QUALITY_CADENCE: Record<WaterQualityParameter, number> = {
  MICROBIOLOGICAL: 30,
  TDS: 90,
  RESIDUAL_CHLORINE: 7,
  PH: 30,
  HEAVY_METALS: 180,
};

const DEFAULT_REQUIRE_LAB: Record<WaterQualityParameter, boolean> = {
  MICROBIOLOGICAL: true,
  TDS: false,
  RESIDUAL_CHLORINE: false,
  PH: false,
  HEAVY_METALS: true,
};

export function evaluateWaterQualityCadence(
  input: WaterQualityCadenceInput
): WaterQualityCadenceReport {
  const cadence = { ...DEFAULT_WATER_QUALITY_CADENCE, ...(input.cadence ?? {}) };
  const requireLab = { ...DEFAULT_REQUIRE_LAB, ...(input.requireCertifiedLab ?? {}) };
  const parameters: WaterQualityParameter[] = [
    'MICROBIOLOGICAL',
    'TDS',
    'RESIDUAL_CHLORINE',
    'PH',
    'HEAVY_METALS',
  ];
  const lastByParam = new Map<WaterQualityParameter, WaterQualityTest>();
  for (const t of input.tests) {
    const prev = lastByParam.get(t.parameter);
    if (!prev || t.testedAt.getTime() > prev.testedAt.getTime()) {
      lastByParam.set(t.parameter, t);
    }
  }
  const failures: WaterQualityFailure[] = [];
  let failed = 0;
  for (const p of parameters) {
    const last = lastByParam.get(p);
    if (!last) {
      failures.push({
        parameter: p,
        code: 'NEVER_TESTED',
        daysSinceLastTest: -1,
        description: `Water-quality parameter ${p} never tested`,
        descriptionAr: `لم يتم اختبار جودة المياه (${p})`,
        severity: 'CRITICAL',
      });
      continue;
    }
    const days = Math.floor((input.asOf.getTime() - last.testedAt.getTime()) / (24 * 3600 * 1000));
    if (days > cadence[p]) {
      failures.push({
        parameter: p,
        code: 'OVERDUE',
        daysSinceLastTest: days,
        description: `${p} overdue (${days}d ago, cadence ${cadence[p]}d)`,
        descriptionAr: `${p} متأخر (قبل ${days} يوم، الدورة ${cadence[p]} يوم)`,
        severity: 'HIGH',
      });
      continue;
    }
    if (requireLab[p] && !last.certifiedLab) {
      failures.push({
        parameter: p,
        code: 'NOT_CERTIFIED',
        daysSinceLastTest: days,
        description: `${p} not certified by accredited lab`,
        descriptionAr: `${p} غير معتمد من مختبر معتمد`,
        severity: 'HIGH',
      });
      continue;
    }
    if (!last.passed) {
      failed += 1;
      failures.push({
        parameter: p,
        code: 'LAST_TEST_FAILED',
        daysSinceLastTest: days,
        description: `${p} last test failed`,
        descriptionAr: `فشل آخر اختبار لـ ${p}`,
        severity: 'CRITICAL',
      });
    }
  }
  const overdue = failures.filter((f) => f.code === 'OVERDUE' || f.code === 'NEVER_TESTED').length;
  const coveragePct = Math.round(((parameters.length - failures.length) / parameters.length) * 100);
  return {
    totals: {
      parametersInScope: parameters.length,
      overdue,
      failed,
      coveragePct,
    },
    failures,
  };
}

// ============================================================================
// 3. Contractor accommodation parity check
// ============================================================================

export interface AccommodationProfile {
  /** Logical label — e.g. 'PRINCIPAL', 'CONTRACTOR_ABC'. */
  label: string;
  /** Total occupants in the accommodation. */
  occupants: number;
  /** Total covered floor area in m². */
  floorAreaM2: number;
  /** Hygiene score (0..100) — same scale as evaluateHygiene. */
  hygieneScore: number;
  /** Fire-safety score (0..100). */
  fireScore: number;
  /** Whether AC / cooling is provided. */
  acProvided: boolean;
  /** Whether mess / canteen is provided. */
  messProvided: boolean;
}

export interface ContractorParityInput {
  principal: AccommodationProfile;
  contractors: AccommodationProfile[];
  /** Allowed downward deviation as a fraction (default 0.1 = 10%). */
  toleranceFraction?: number;
}

export interface ContractorParityGap {
  contractorLabel: string;
  code: 'SPACE_PER_PERSON' | 'HYGIENE_GAP' | 'FIRE_GAP' | 'NO_AC' | 'NO_MESS';
  principalValue: number | boolean;
  contractorValue: number | boolean;
  description: string;
  descriptionAr: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ContractorParityReport {
  totals: {
    contractorsChecked: number;
    contractorsWithGaps: number;
    gaps: number;
    parityPct: number;
  };
  gaps: ContractorParityGap[];
}

export function evaluateContractorAccommodationParity(
  input: ContractorParityInput
): ContractorParityReport {
  const tol = input.toleranceFraction ?? 0.1;
  const principalSpace = input.principal.floorAreaM2 / Math.max(input.principal.occupants, 1);
  const gaps: ContractorParityGap[] = [];
  const labelsWithGaps = new Set<string>();
  for (const c of input.contractors) {
    const cSpace = c.floorAreaM2 / Math.max(c.occupants, 1);
    if (cSpace < principalSpace * (1 - tol)) {
      gaps.push({
        contractorLabel: c.label,
        code: 'SPACE_PER_PERSON',
        principalValue: Math.round(principalSpace * 10) / 10,
        contractorValue: Math.round(cSpace * 10) / 10,
        description: `Contractor space ${cSpace.toFixed(1)}m²/person below principal ${principalSpace.toFixed(1)}m²/person`,
        descriptionAr: `مساحة المقاول ${cSpace.toFixed(1)}م²/شخص أقل من ${principalSpace.toFixed(1)}م²/شخص`,
        severity: 'HIGH',
      });
      labelsWithGaps.add(c.label);
    }
    if (c.hygieneScore < input.principal.hygieneScore * (1 - tol)) {
      gaps.push({
        contractorLabel: c.label,
        code: 'HYGIENE_GAP',
        principalValue: input.principal.hygieneScore,
        contractorValue: c.hygieneScore,
        description: `Contractor hygiene ${c.hygieneScore} below principal ${input.principal.hygieneScore}`,
        descriptionAr: `نظافة المقاول ${c.hygieneScore} أقل من ${input.principal.hygieneScore}`,
        severity: 'HIGH',
      });
      labelsWithGaps.add(c.label);
    }
    if (c.fireScore < input.principal.fireScore * (1 - tol)) {
      gaps.push({
        contractorLabel: c.label,
        code: 'FIRE_GAP',
        principalValue: input.principal.fireScore,
        contractorValue: c.fireScore,
        description: `Contractor fire-safety ${c.fireScore} below principal ${input.principal.fireScore}`,
        descriptionAr: `سلامة الحريق ${c.fireScore} أقل من ${input.principal.fireScore}`,
        severity: 'CRITICAL',
      });
      labelsWithGaps.add(c.label);
    }
    if (input.principal.acProvided && !c.acProvided) {
      gaps.push({
        contractorLabel: c.label,
        code: 'NO_AC',
        principalValue: true,
        contractorValue: false,
        description: 'Contractor accommodation has no AC while principal does',
        descriptionAr: 'سكن المقاول بدون تكييف بينما يوفره صاحب العمل الأصلي',
        severity: 'HIGH',
      });
      labelsWithGaps.add(c.label);
    }
    if (input.principal.messProvided && !c.messProvided) {
      gaps.push({
        contractorLabel: c.label,
        code: 'NO_MESS',
        principalValue: true,
        contractorValue: false,
        description: 'Contractor accommodation has no mess / canteen',
        descriptionAr: 'سكن المقاول بدون مطعم / كافتيريا',
        severity: 'MEDIUM',
      });
      labelsWithGaps.add(c.label);
    }
  }
  const checked = input.contractors.length;
  const withGaps = labelsWithGaps.size;
  const parityPct = checked === 0 ? 100 : Math.round(((checked - withGaps) / checked) * 100);
  return {
    totals: {
      contractorsChecked: checked,
      contractorsWithGaps: withGaps,
      gaps: gaps.length,
      parityPct,
    },
    gaps,
  };
}
