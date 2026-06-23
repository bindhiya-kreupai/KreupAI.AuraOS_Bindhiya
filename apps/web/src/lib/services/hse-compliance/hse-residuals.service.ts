/**
 * EPIC-24 HSE — residual closures.
 *
 * Closes the 8 audit residuals beyond PPE / toolbox / drill:
 *
 *   1. HSE governance matrix (cadence-driven control evidencing)
 *   2. Org / role HSE accountability (HSE officer ratio, mandate gaps)
 *   3. First-aid kit cadence (per-zone replenishment & inspection)
 *   4. Contractor HSE compliance check (PPE, training, incident parity)
 *   5. Welfare-facility cadence (toilets, drinking water, rest area)
 *   6. Surveillance / CCTV cadence (functional checks, retention days)
 *   7. HR-integration check (incident → leave / pay sync correctness)
 *   8. HSE audit checklist (multi-item rubric with pass/fail bands)
 *
 * Every evaluator returns a typed verdict with bilingual reason text.
 * No new Prisma models needed.
 */

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface ReasonText {
  description: string;
  descriptionAr: string;
}

// ============================================================================
// 1. HSE governance matrix
// ============================================================================

export interface HseControl {
  code: string;
  label: string;
  labelAr?: string;
  /** e.g. 'GOVERNANCE' | 'OPERATIONS' | 'PERMIT' | 'INCIDENT' */
  domain: string;
  /** Cadence in days. */
  cadenceDays: number;
  /** What evidence the auditor needs. */
  evidenceType: string;
  /** Which roles are accountable. */
  requiredRoles: string[];
}

export interface HseEvidence {
  controlCode: string;
  evidencedAt: Date;
  evidencedBy: string;
  evidenceRef?: string;
}

export interface HseGovernanceStatus {
  control: HseControl;
  lastEvidencedAt?: Date;
  daysSinceLastEvidence?: number;
  overdue: boolean;
}

export interface HseGovernanceReport {
  statuses: HseGovernanceStatus[];
  totals: { controls: number; overdue: number; coveragePct: number };
}

export function evaluateHseGovernanceMatrix(
  controls: HseControl[],
  evidences: HseEvidence[],
  asOf: Date = new Date()
): HseGovernanceReport {
  const byControl = new Map<string, HseEvidence[]>();
  for (const e of evidences) {
    if (!byControl.has(e.controlCode)) byControl.set(e.controlCode, []);
    byControl.get(e.controlCode)!.push(e);
  }
  const statuses: HseGovernanceStatus[] = controls.map((control) => {
    const list = byControl.get(control.code) ?? [];
    if (list.length === 0) return { control, overdue: true };
    const last = list.reduce(
      (acc, e) => (e.evidencedAt.getTime() > acc.getTime() ? e.evidencedAt : acc),
      list[0].evidencedAt
    );
    const days = Math.floor((asOf.getTime() - last.getTime()) / (24 * 3600 * 1000));
    return {
      control,
      lastEvidencedAt: last,
      daysSinceLastEvidence: days,
      overdue: days > control.cadenceDays,
    };
  });
  const overdue = statuses.filter((s) => s.overdue).length;
  const coveragePct =
    controls.length === 0 ? 100 : Math.round(((controls.length - overdue) / controls.length) * 100);
  return { statuses, totals: { controls: controls.length, overdue, coveragePct } };
}

// ============================================================================
// 2. Org / role HSE accountability
// ============================================================================

export interface HseRoleAssignment {
  /** e.g. 'HSE_OFFICER' | 'SAFETY_REP' | 'FIRST_AIDER'. */
  role: string;
  employeeId: string;
  /** Whether the employee holds a valid certification. */
  certified: boolean;
  /** Whether a written mandate exists. */
  mandated: boolean;
}

export interface HseAccountabilityInput {
  totalWorkers: number;
  /** Required ratio of role per N workers. e.g. { HSE_OFFICER: 50 } means 1 per 50 workers. */
  requiredRatios: Record<string, number>;
  assignments: HseRoleAssignment[];
}

export type HseAccountabilityCode = 'INSUFFICIENT_HEADCOUNT' | 'UNCERTIFIED' | 'NO_MANDATE';

export interface HseAccountabilityGap extends ReasonText {
  role: string;
  code: HseAccountabilityCode;
  required: number;
  actual: number;
  severity: Severity;
}

export interface HseAccountabilityReport {
  totals: {
    rolesChecked: number;
    rolesWithGaps: number;
    gaps: number;
    coveragePct: number;
  };
  gaps: HseAccountabilityGap[];
}

export function evaluateHseAccountability(input: HseAccountabilityInput): HseAccountabilityReport {
  const gaps: HseAccountabilityGap[] = [];
  const rolesWithGaps = new Set<string>();
  const roles = Object.keys(input.requiredRatios);
  for (const role of roles) {
    const ratio = input.requiredRatios[role];
    const required = Math.max(1, Math.ceil(input.totalWorkers / ratio));
    const inRole = input.assignments.filter((a) => a.role === role);
    if (inRole.length < required) {
      gaps.push({
        role,
        code: 'INSUFFICIENT_HEADCOUNT',
        required,
        actual: inRole.length,
        severity: 'HIGH',
        description: `Need ${required} ${role}(s) for ${input.totalWorkers} workers, have ${inRole.length}`,
        descriptionAr: `يلزم ${required} من ${role} لـ ${input.totalWorkers} عامل، يوجد ${inRole.length}`,
      });
      rolesWithGaps.add(role);
    }
    const uncertified = inRole.filter((a) => !a.certified);
    if (uncertified.length > 0) {
      gaps.push({
        role,
        code: 'UNCERTIFIED',
        required: inRole.length,
        actual: inRole.length - uncertified.length,
        severity: 'CRITICAL',
        description: `${uncertified.length} ${role}(s) without valid certification`,
        descriptionAr: `${uncertified.length} من ${role} بدون شهادة سارية`,
      });
      rolesWithGaps.add(role);
    }
    const unmandated = inRole.filter((a) => !a.mandated);
    if (unmandated.length > 0) {
      gaps.push({
        role,
        code: 'NO_MANDATE',
        required: inRole.length,
        actual: inRole.length - unmandated.length,
        severity: 'MEDIUM',
        description: `${unmandated.length} ${role}(s) without written mandate`,
        descriptionAr: `${unmandated.length} من ${role} بدون تفويض مكتوب`,
      });
      rolesWithGaps.add(role);
    }
  }
  const coveragePct =
    roles.length === 0
      ? 100
      : Math.round(((roles.length - rolesWithGaps.size) / roles.length) * 100);
  return {
    totals: {
      rolesChecked: roles.length,
      rolesWithGaps: rolesWithGaps.size,
      gaps: gaps.length,
      coveragePct,
    },
    gaps,
  };
}

// ============================================================================
// 3. First-aid kit cadence
// ============================================================================

export interface FirstAidKitInspection {
  zone: string;
  inspectedAt: Date;
  /** Whether all consumables were within expiry. */
  consumablesValid: boolean;
  /** Whether the kit was sealed (tamper-proof) at inspection. */
  sealed: boolean;
}

export interface FirstAidCadenceInput {
  /** Each zone (e.g. production line, warehouse) is checked. */
  zones: string[];
  inspections: FirstAidKitInspection[];
  /** Required cadence in days (default 30). */
  cadenceDays?: number;
  asOf: Date;
}

export type FirstAidFailureCode =
  | 'NEVER_INSPECTED'
  | 'OVERDUE'
  | 'CONSUMABLES_EXPIRED'
  | 'NOT_SEALED';

export interface FirstAidFailure extends ReasonText {
  zone: string;
  code: FirstAidFailureCode;
  severity: Severity;
}

export interface FirstAidCadenceReport {
  totals: { zonesInScope: number; overdue: number; coveragePct: number };
  failures: FirstAidFailure[];
}

export function evaluateFirstAidCadence(input: FirstAidCadenceInput): FirstAidCadenceReport {
  const cadence = input.cadenceDays ?? 30;
  const lastByZone = new Map<string, FirstAidKitInspection>();
  for (const i of input.inspections) {
    const prev = lastByZone.get(i.zone);
    if (!prev || i.inspectedAt.getTime() > prev.inspectedAt.getTime()) {
      lastByZone.set(i.zone, i);
    }
  }
  const failures: FirstAidFailure[] = [];
  for (const z of input.zones) {
    const last = lastByZone.get(z);
    if (!last) {
      failures.push({
        zone: z,
        code: 'NEVER_INSPECTED',
        severity: 'HIGH',
        description: `First-aid kit in zone ${z} never inspected`,
        descriptionAr: `لم يتم فحص حقيبة الإسعافات في المنطقة ${z}`,
      });
      continue;
    }
    const days = Math.floor(
      (input.asOf.getTime() - last.inspectedAt.getTime()) / (24 * 3600 * 1000)
    );
    if (days > cadence) {
      failures.push({
        zone: z,
        code: 'OVERDUE',
        severity: 'MEDIUM',
        description: `First-aid kit overdue in zone ${z} (${days}d, cadence ${cadence}d)`,
        descriptionAr: `حقيبة الإسعافات متأخرة في المنطقة ${z} (${days} يوم، الدورة ${cadence})`,
      });
      continue;
    }
    if (!last.consumablesValid) {
      failures.push({
        zone: z,
        code: 'CONSUMABLES_EXPIRED',
        severity: 'HIGH',
        description: `First-aid consumables expired in zone ${z}`,
        descriptionAr: `مواد الإسعاف منتهية في المنطقة ${z}`,
      });
    }
    if (!last.sealed) {
      failures.push({
        zone: z,
        code: 'NOT_SEALED',
        severity: 'MEDIUM',
        description: `First-aid kit in zone ${z} not sealed (tamper risk)`,
        descriptionAr: `حقيبة الإسعافات في ${z} غير مختومة (خطر العبث)`,
      });
    }
  }
  const overdue = failures.filter(
    (f) => f.code === 'NEVER_INSPECTED' || f.code === 'OVERDUE'
  ).length;
  const coveragePct =
    input.zones.length === 0
      ? 100
      : Math.round(((input.zones.length - overdue) / input.zones.length) * 100);
  return { totals: { zonesInScope: input.zones.length, overdue, coveragePct }, failures };
}

// ============================================================================
// 4. Contractor HSE compliance
// ============================================================================

export interface ContractorHseProfile {
  contractorId: string;
  workers: number;
  ppeIssuancePct: number; // 0..100
  trainingCoveragePct: number; // 0..100
  incidentRatePer100k: number; // recordable incidents per 100k hours
}

export interface ContractorHseInput {
  contractors: ContractorHseProfile[];
  /** Principal baseline to compare to. */
  baseline: {
    minPpeIssuancePct: number;
    minTrainingCoveragePct: number;
    /** Max acceptable incident rate per 100k hours. */
    maxIncidentRatePer100k: number;
  };
}

export type ContractorHseCode =
  | 'PPE_BELOW_BASELINE'
  | 'TRAINING_BELOW_BASELINE'
  | 'INCIDENT_RATE_HIGH';

export interface ContractorHseFinding extends ReasonText {
  contractorId: string;
  code: ContractorHseCode;
  actual: number;
  threshold: number;
  severity: Severity;
}

export interface ContractorHseReport {
  totals: {
    contractorsChecked: number;
    contractorsWithFindings: number;
    findings: number;
    compliancePct: number;
  };
  findings: ContractorHseFinding[];
}

export function evaluateContractorHse(input: ContractorHseInput): ContractorHseReport {
  const findings: ContractorHseFinding[] = [];
  const withFindings = new Set<string>();
  for (const c of input.contractors) {
    if (c.ppeIssuancePct < input.baseline.minPpeIssuancePct) {
      findings.push({
        contractorId: c.contractorId,
        code: 'PPE_BELOW_BASELINE',
        actual: c.ppeIssuancePct,
        threshold: input.baseline.minPpeIssuancePct,
        severity: 'HIGH',
        description: `PPE issuance ${c.ppeIssuancePct}% below baseline ${input.baseline.minPpeIssuancePct}%`,
        descriptionAr: `معدل صرف المعدات ${c.ppeIssuancePct}% أقل من الحد ${input.baseline.minPpeIssuancePct}%`,
      });
      withFindings.add(c.contractorId);
    }
    if (c.trainingCoveragePct < input.baseline.minTrainingCoveragePct) {
      findings.push({
        contractorId: c.contractorId,
        code: 'TRAINING_BELOW_BASELINE',
        actual: c.trainingCoveragePct,
        threshold: input.baseline.minTrainingCoveragePct,
        severity: 'MEDIUM',
        description: `Training coverage ${c.trainingCoveragePct}% below baseline ${input.baseline.minTrainingCoveragePct}%`,
        descriptionAr: `تغطية التدريب ${c.trainingCoveragePct}% أقل من الحد ${input.baseline.minTrainingCoveragePct}%`,
      });
      withFindings.add(c.contractorId);
    }
    if (c.incidentRatePer100k > input.baseline.maxIncidentRatePer100k) {
      findings.push({
        contractorId: c.contractorId,
        code: 'INCIDENT_RATE_HIGH',
        actual: c.incidentRatePer100k,
        threshold: input.baseline.maxIncidentRatePer100k,
        severity: 'CRITICAL',
        description: `Incident rate ${c.incidentRatePer100k}/100k exceeds ${input.baseline.maxIncidentRatePer100k}`,
        descriptionAr: `معدل الحوادث ${c.incidentRatePer100k}/100k يتجاوز ${input.baseline.maxIncidentRatePer100k}`,
      });
      withFindings.add(c.contractorId);
    }
  }
  const checked = input.contractors.length;
  const compliancePct =
    checked === 0 ? 100 : Math.round(((checked - withFindings.size) / checked) * 100);
  return {
    totals: {
      contractorsChecked: checked,
      contractorsWithFindings: withFindings.size,
      findings: findings.length,
      compliancePct,
    },
    findings,
  };
}

// ============================================================================
// 5. Welfare-facility cadence (toilets / drinking water / rest area)
// ============================================================================

export type WelfareFacility = 'TOILETS' | 'DRINKING_WATER' | 'REST_AREA' | 'CHANGING_ROOM';

export interface WelfareFacilityCheck {
  facility: WelfareFacility;
  zone: string;
  checkedAt: Date;
  /** Whether the facility was found in working order. */
  functional: boolean;
}

export interface WelfareFacilityInput {
  zones: string[];
  facilities: WelfareFacility[];
  checks: WelfareFacilityCheck[];
  /** Default 7 days (weekly). */
  cadenceDays?: number;
  asOf: Date;
}

export interface WelfareFacilityFailure extends ReasonText {
  zone: string;
  facility: WelfareFacility;
  code: 'NEVER_CHECKED' | 'OVERDUE' | 'NOT_FUNCTIONAL';
  severity: Severity;
}

export interface WelfareFacilityReport {
  totals: {
    cellsInScope: number;
    overdue: number;
    notFunctional: number;
    coveragePct: number;
  };
  failures: WelfareFacilityFailure[];
}

export function evaluateWelfareFacilityCadence(input: WelfareFacilityInput): WelfareFacilityReport {
  const cadence = input.cadenceDays ?? 7;
  const key = (z: string, f: WelfareFacility) => `${z}::${f}`;
  const lastByCell = new Map<string, WelfareFacilityCheck>();
  for (const c of input.checks) {
    const k = key(c.zone, c.facility);
    const prev = lastByCell.get(k);
    if (!prev || c.checkedAt.getTime() > prev.checkedAt.getTime()) lastByCell.set(k, c);
  }
  const failures: WelfareFacilityFailure[] = [];
  let totalCells = 0;
  for (const z of input.zones) {
    for (const f of input.facilities) {
      totalCells += 1;
      const last = lastByCell.get(key(z, f));
      if (!last) {
        failures.push({
          zone: z,
          facility: f,
          code: 'NEVER_CHECKED',
          severity: 'HIGH',
          description: `${f} in zone ${z} never checked`,
          descriptionAr: `${f} في المنطقة ${z} لم يُفحص`,
        });
        continue;
      }
      const days = Math.floor(
        (input.asOf.getTime() - last.checkedAt.getTime()) / (24 * 3600 * 1000)
      );
      if (days > cadence) {
        failures.push({
          zone: z,
          facility: f,
          code: 'OVERDUE',
          severity: 'MEDIUM',
          description: `${f} in zone ${z} overdue (${days}d, cadence ${cadence}d)`,
          descriptionAr: `${f} في ${z} متأخر (${days} يوم، الدورة ${cadence})`,
        });
        continue;
      }
      if (!last.functional) {
        failures.push({
          zone: z,
          facility: f,
          code: 'NOT_FUNCTIONAL',
          severity: 'CRITICAL',
          description: `${f} in zone ${z} not functional`,
          descriptionAr: `${f} في ${z} لا يعمل`,
        });
      }
    }
  }
  const overdue = failures.filter((f) => f.code === 'OVERDUE' || f.code === 'NEVER_CHECKED').length;
  const notFunctional = failures.filter((f) => f.code === 'NOT_FUNCTIONAL').length;
  const coveragePct =
    totalCells === 0 ? 100 : Math.round(((totalCells - failures.length) / totalCells) * 100);
  return {
    totals: { cellsInScope: totalCells, overdue, notFunctional, coveragePct },
    failures,
  };
}

// ============================================================================
// 6. Surveillance / CCTV cadence
// ============================================================================

export interface CctvCheck {
  cameraId: string;
  checkedAt: Date;
  functional: boolean;
  /** Retention days observed in the DVR. */
  retentionDays: number;
}

export interface CctvCadenceInput {
  cameras: string[];
  checks: CctvCheck[];
  /** Functional-check cadence (default 30 days). */
  cadenceDays?: number;
  /** Required retention in days (default 90). */
  requiredRetentionDays?: number;
  asOf: Date;
}

export interface CctvFailure extends ReasonText {
  cameraId: string;
  code: 'NEVER_CHECKED' | 'OVERDUE' | 'NOT_FUNCTIONAL' | 'RETENTION_TOO_SHORT';
  severity: Severity;
}

export interface CctvCadenceReport {
  totals: {
    camerasInScope: number;
    overdue: number;
    notFunctional: number;
    coveragePct: number;
  };
  failures: CctvFailure[];
}

export function evaluateCctvCadence(input: CctvCadenceInput): CctvCadenceReport {
  const cadence = input.cadenceDays ?? 30;
  const minRetention = input.requiredRetentionDays ?? 90;
  const lastByCamera = new Map<string, CctvCheck>();
  for (const c of input.checks) {
    const prev = lastByCamera.get(c.cameraId);
    if (!prev || c.checkedAt.getTime() > prev.checkedAt.getTime()) lastByCamera.set(c.cameraId, c);
  }
  const failures: CctvFailure[] = [];
  for (const cam of input.cameras) {
    const last = lastByCamera.get(cam);
    if (!last) {
      failures.push({
        cameraId: cam,
        code: 'NEVER_CHECKED',
        severity: 'HIGH',
        description: `Camera ${cam} never checked`,
        descriptionAr: `الكاميرا ${cam} لم تُفحص`,
      });
      continue;
    }
    const days = Math.floor((input.asOf.getTime() - last.checkedAt.getTime()) / (24 * 3600 * 1000));
    if (days > cadence) {
      failures.push({
        cameraId: cam,
        code: 'OVERDUE',
        severity: 'MEDIUM',
        description: `Camera ${cam} overdue (${days}d, cadence ${cadence}d)`,
        descriptionAr: `الكاميرا ${cam} متأخرة (${days} يوم)`,
      });
      continue;
    }
    if (!last.functional) {
      failures.push({
        cameraId: cam,
        code: 'NOT_FUNCTIONAL',
        severity: 'CRITICAL',
        description: `Camera ${cam} not functional`,
        descriptionAr: `الكاميرا ${cam} لا تعمل`,
      });
    }
    if (last.retentionDays < minRetention) {
      failures.push({
        cameraId: cam,
        code: 'RETENTION_TOO_SHORT',
        severity: 'HIGH',
        description: `Camera ${cam} retention ${last.retentionDays}d below ${minRetention}d`,
        descriptionAr: `احتفاظ الكاميرا ${cam} ${last.retentionDays} يوم أقل من ${minRetention}`,
      });
    }
  }
  const overdue = failures.filter((f) => f.code === 'NEVER_CHECKED' || f.code === 'OVERDUE').length;
  const notFunctional = failures.filter((f) => f.code === 'NOT_FUNCTIONAL').length;
  const coveragePct =
    input.cameras.length === 0
      ? 100
      : Math.round(((input.cameras.length - overdue - notFunctional) / input.cameras.length) * 100);
  return {
    totals: { camerasInScope: input.cameras.length, overdue, notFunctional, coveragePct },
    failures,
  };
}

// ============================================================================
// 7. HR-integration check (incident → leave / pay)
// ============================================================================

export interface IncidentHrLink {
  incidentId: string;
  employeeId: string;
  incidentAt: Date;
  daysLostExpected: number;
  /** Whether a leave record was created. */
  leaveCreated: boolean;
  /** Whether the leave covers the expected days (full or partial). */
  leaveDaysCovered: number;
  /** Whether payroll was adjusted (suspension of allowances, etc.). */
  payAdjusted: boolean;
  /** Whether a workman-comp claim was filed. */
  workmanCompFiled: boolean;
}

export type HrIntegrationCode =
  | 'NO_LEAVE'
  | 'LEAVE_UNDER_COVERED'
  | 'NO_PAY_ADJUSTMENT'
  | 'NO_WORKMAN_COMP';

export interface HrIntegrationFailure extends ReasonText {
  incidentId: string;
  employeeId: string;
  code: HrIntegrationCode;
  severity: Severity;
}

export interface HrIntegrationReport {
  totals: {
    incidentsChecked: number;
    incidentsWithFailures: number;
    failures: number;
    integrationPct: number;
  };
  failures: HrIntegrationFailure[];
}

export function evaluateHrIntegration(links: IncidentHrLink[]): HrIntegrationReport {
  const failures: HrIntegrationFailure[] = [];
  const withFail = new Set<string>();
  for (const l of links) {
    if (l.daysLostExpected > 0 && !l.leaveCreated) {
      failures.push({
        incidentId: l.incidentId,
        employeeId: l.employeeId,
        code: 'NO_LEAVE',
        severity: 'CRITICAL',
        description: `Incident ${l.incidentId} lost ${l.daysLostExpected}d but no leave created`,
        descriptionAr: `الحادث ${l.incidentId} ${l.daysLostExpected} يوم بدون إجازة`,
      });
      withFail.add(l.incidentId);
    } else if (l.leaveCreated && l.leaveDaysCovered < l.daysLostExpected) {
      failures.push({
        incidentId: l.incidentId,
        employeeId: l.employeeId,
        code: 'LEAVE_UNDER_COVERED',
        severity: 'HIGH',
        description: `Leave covers ${l.leaveDaysCovered}d but ${l.daysLostExpected}d expected`,
        descriptionAr: `الإجازة تغطي ${l.leaveDaysCovered} يوم بدلاً من ${l.daysLostExpected}`,
      });
      withFail.add(l.incidentId);
    }
    if (l.daysLostExpected > 0 && !l.payAdjusted) {
      failures.push({
        incidentId: l.incidentId,
        employeeId: l.employeeId,
        code: 'NO_PAY_ADJUSTMENT',
        severity: 'MEDIUM',
        description: `No payroll adjustment for incident ${l.incidentId}`,
        descriptionAr: `لم يتم تعديل الرواتب للحادث ${l.incidentId}`,
      });
      withFail.add(l.incidentId);
    }
    if (l.daysLostExpected >= 3 && !l.workmanCompFiled) {
      failures.push({
        incidentId: l.incidentId,
        employeeId: l.employeeId,
        code: 'NO_WORKMAN_COMP',
        severity: 'HIGH',
        description: `Incident ${l.incidentId} ≥3 days lost but no workman-comp claim`,
        descriptionAr: `الحادث ${l.incidentId} 3 أيام أو أكثر بدون مطالبة تعويض`,
      });
      withFail.add(l.incidentId);
    }
  }
  const checked = links.length;
  const integrationPct =
    checked === 0 ? 100 : Math.round(((checked - withFail.size) / checked) * 100);
  return {
    totals: {
      incidentsChecked: checked,
      incidentsWithFailures: withFail.size,
      failures: failures.length,
      integrationPct,
    },
    failures,
  };
}

// ============================================================================
// 8. HSE audit checklist
// ============================================================================

export interface HseChecklistItem {
  code: string;
  question: string;
  questionAr: string;
  weight: number; // 1..10
  critical: boolean;
}

export interface HseChecklistResponse {
  code: string;
  pass: boolean;
  noted?: string;
}

export interface HseChecklistInput {
  items: HseChecklistItem[];
  responses: HseChecklistResponse[];
}

export interface HseChecklistReport {
  scorePct: number;
  band: 'CRITICAL' | 'POOR' | 'ACCEPTABLE' | 'GOOD' | 'EXCELLENT';
  /** True only when no CRITICAL item failed. */
  pass: boolean;
  failedItems: Array<HseChecklistItem & { responseNoted?: string }>;
  totals: { itemCount: number; answered: number; failed: number };
}

function bandFor(pct: number): HseChecklistReport['band'] {
  if (pct < 30) return 'CRITICAL';
  if (pct < 50) return 'POOR';
  if (pct < 70) return 'ACCEPTABLE';
  if (pct < 90) return 'GOOD';
  return 'EXCELLENT';
}

export function evaluateHseChecklist(input: HseChecklistInput): HseChecklistReport {
  const byCode = new Map<string, HseChecklistResponse>();
  for (const r of input.responses) byCode.set(r.code, r);
  let totalWeight = 0;
  let earned = 0;
  let answered = 0;
  let anyCriticalFail = false;
  const failed: Array<HseChecklistItem & { responseNoted?: string }> = [];
  for (const item of input.items) {
    totalWeight += item.weight;
    const resp = byCode.get(item.code);
    if (!resp) continue;
    answered += 1;
    if (resp.pass) {
      earned += item.weight;
    } else {
      failed.push({ ...item, responseNoted: resp.noted });
      if (item.critical) anyCriticalFail = true;
    }
  }
  const scorePct = totalWeight === 0 ? 100 : Math.round((earned / totalWeight) * 100);
  return {
    scorePct,
    band: bandFor(scorePct),
    pass: !anyCriticalFail && scorePct >= 70,
    failedItems: failed,
    totals: { itemCount: input.items.length, answered, failed: failed.length },
  };
}
