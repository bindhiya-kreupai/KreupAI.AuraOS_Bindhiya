/**
 * EPIC-04 — Recruitment Compliance
 *
 * Adds the compliance gates that were missing from the audit's 🔴 RED
 * EPIC-04 finding on top of the basic Candidate / Application / Job
 * Offer flow:
 *   - S01 stage-gate FSM (RecruitmentCaseService)
 *   - S06 bias-aware screening (ScreeningCriteriaService, CandidateScreeningService)
 *   - S10 BGV consent + per-check gating (BgvCaseService, BgvCheckService)
 *   - S11 immigration eligibility (ImmigrationEligibilityService)
 *   - S14 candidate consent (CandidateConsentService)
 *   - S16 audit checklist + risk register (AuditChecklistService, RiskRegisterService)
 *
 * Stage-gate FSM (S01):
 *   APPLIED → SCREENED → INTERVIEWED → OFFERED → HIRED
 *   Any state can transition to REJECTED or WITHDRAWN (terminal).
 *
 * Forward transitions are guarded — SCREENED requires a passing
 * CandidateScreening row; OFFERED requires PASSED BgvCase and ELIGIBLE
 * immigration check.
 */

import { prisma } from '@aura/database';

export interface AuthContext {
  tenantId: string;
  userId: string;
}

export type Stage =
  | 'APPLIED'
  | 'SCREENED'
  | 'INTERVIEWED'
  | 'OFFERED'
  | 'HIRED'
  | 'REJECTED'
  | 'WITHDRAWN';

const FORWARD_FLOW: Record<Stage, Stage[]> = {
  APPLIED: ['SCREENED', 'REJECTED', 'WITHDRAWN'],
  SCREENED: ['INTERVIEWED', 'REJECTED', 'WITHDRAWN'],
  INTERVIEWED: ['OFFERED', 'REJECTED', 'WITHDRAWN'],
  OFFERED: ['HIRED', 'REJECTED', 'WITHDRAWN'],
  HIRED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

// ============================================================================
// S01 — Recruitment case + stage-gate FSM
// ============================================================================

export class RecruitmentCaseService {
  /** Open a new case for a vacancy×candidate. Idempotent on the unique key. */
  async open(
    input: { vacancyId: string; candidateId: string; ownerId: string; slaDays?: number },
    auth: AuthContext
  ) {
    const existing = await prisma.recruitmentCase.findFirst({
      where: {
        tenantId: auth.tenantId,
        vacancyId: input.vacancyId,
        candidateId: input.candidateId,
      },
    });
    if (existing) return existing;
    return prisma.recruitmentCase.create({
      data: {
        tenantId: auth.tenantId,
        vacancyId: input.vacancyId,
        candidateId: input.candidateId,
        ownerId: input.ownerId,
        slaDays: input.slaDays ?? 30,
      },
    });
  }

  /**
   * Transition to a new stage. Validates the FSM and enforces gates:
   *   - APPLIED → SCREENED requires a PASS CandidateScreening
   *   - INTERVIEWED → OFFERED requires PASSED BgvCase AND ELIGIBLE ImmigrationEligibility
   * Throws on invalid transition or unmet gate.
   */
  async transition(caseId: string, nextStage: Stage, auth: AuthContext) {
    const c = await this.requireCase(caseId, auth);
    const allowed = FORWARD_FLOW[c.currentStage as Stage] ?? [];
    if (!allowed.includes(nextStage)) {
      throw new Error(`Invalid transition ${c.currentStage} → ${nextStage}`);
    }

    if (nextStage === 'SCREENED') {
      const screening = await prisma.recruitmentCandidateScreening.findUnique({
        where: {
          aura_recruitment_candidate_screening_unique: { tenantId: auth.tenantId, caseId },
        } as any,
      });
      if (!screening || screening.outcome !== 'PASS') {
        throw new Error('SCREENED gate requires a PASS CandidateScreening row');
      }
    }

    if (nextStage === 'OFFERED') {
      const bgv = await prisma.recruitmentBgvCase.findUnique({
        where: { aura_recruitment_bgv_case_unique: { tenantId: auth.tenantId, caseId } } as any,
      });
      if (!bgv || bgv.status !== 'PASSED') {
        throw new Error('OFFERED gate requires a PASSED BgvCase');
      }
      const imm = await prisma.recruitmentImmigrationEligibility.findUnique({
        where: { aura_recruitment_imm_elig_unique: { tenantId: auth.tenantId, caseId } } as any,
      });
      if (!imm || (imm.eligibility !== 'ELIGIBLE' && imm.eligibility !== 'CONDITIONAL')) {
        throw new Error(
          'OFFERED gate requires an ELIGIBLE (or CONDITIONAL) ImmigrationEligibility row'
        );
      }
    }

    const isTerminal =
      nextStage === 'HIRED' || nextStage === 'REJECTED' || nextStage === 'WITHDRAWN';
    return prisma.recruitmentCase.update({
      where: { id: caseId },
      data: {
        currentStage: nextStage,
        status: isTerminal ? 'CLOSED' : 'OPEN',
        closedAt: isTerminal ? new Date() : null,
        closedReason: nextStage === 'HIRED' ? 'HIRED' : nextStage,
      },
    });
  }

  async list(filter: { tenantId: string; status?: string; currentStage?: string }) {
    return prisma.recruitmentCase.findMany({
      where: {
        tenantId: filter.tenantId,
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.currentStage ? { currentStage: filter.currentStage } : {}),
      },
      orderBy: { openedAt: 'desc' },
      take: 500,
    });
  }

  private async requireCase(id: string, auth: AuthContext) {
    const c = await prisma.recruitmentCase.findFirst({ where: { id, tenantId: auth.tenantId } });
    if (!c) throw new Error(`Recruitment case ${id} not found`);
    return c;
  }
}

export const recruitmentCaseService = new RecruitmentCaseService();

// ============================================================================
// S06 — Screening criteria + bias-aware candidate scoring
// ============================================================================

export class ScreeningCriteriaService {
  async upsert(
    input: {
      vacancyId: string;
      criterionCode: string;
      description: string;
      weight?: number;
      isMandatory?: boolean;
    },
    auth: AuthContext
  ) {
    return prisma.recruitmentScreeningCriteria.upsert({
      where: {
        aura_recruitment_screening_criteria_unique: {
          tenantId: auth.tenantId,
          vacancyId: input.vacancyId,
          criterionCode: input.criterionCode,
        },
      } as any,
      update: {
        description: input.description,
        weight: input.weight ?? 1,
        isMandatory: input.isMandatory ?? false,
      },
      create: {
        tenantId: auth.tenantId,
        vacancyId: input.vacancyId,
        criterionCode: input.criterionCode,
        description: input.description,
        weight: input.weight ?? 1,
        isMandatory: input.isMandatory ?? false,
      },
    });
  }

  async listForVacancy(tenantId: string, vacancyId: string) {
    return prisma.recruitmentScreeningCriteria.findMany({
      where: { tenantId, vacancyId },
      orderBy: { criterionCode: 'asc' },
    });
  }
}

export const screeningCriteriaService = new ScreeningCriteriaService();

export class CandidateScreeningService {
  /**
   * Persist a per-candidate screening result. If `protectedFactors` is
   * non-empty the row is flagged for human review (knockoutReason is
   * NOT auto-set) and the outcome remains overrideable.
   */
  async record(
    input: {
      caseId: string;
      candidateId: string;
      score: number;
      outcome: 'PASS' | 'FAIL' | 'KNOCKOUT';
      rejectionReason?: string;
      knockoutReason?: string;
      protectedFactors?: string[];
      detail?: Record<string, unknown>;
      decidedById?: string;
    },
    auth: AuthContext
  ) {
    if (input.outcome === 'KNOCKOUT' && !input.knockoutReason) {
      throw new Error('KNOCKOUT outcome requires knockoutReason');
    }
    return prisma.recruitmentCandidateScreening.upsert({
      where: {
        aura_recruitment_candidate_screening_unique: {
          tenantId: auth.tenantId,
          caseId: input.caseId,
        },
      } as any,
      update: {
        score: input.score,
        outcome: input.outcome,
        rejectionReason: input.rejectionReason,
        knockoutReason: input.knockoutReason,
        protectedFactors: input.protectedFactors ?? [],
        detailJson: (input.detail ?? {}) as any,
        decidedById: input.decidedById,
        decidedAt: new Date(),
      },
      create: {
        tenantId: auth.tenantId,
        caseId: input.caseId,
        candidateId: input.candidateId,
        score: input.score,
        outcome: input.outcome,
        rejectionReason: input.rejectionReason,
        knockoutReason: input.knockoutReason,
        protectedFactors: input.protectedFactors ?? [],
        detailJson: (input.detail ?? {}) as any,
        decidedById: input.decidedById,
      },
    });
  }

  async listBiasFlagged(tenantId: string) {
    const rows = await prisma.recruitmentCandidateScreening.findMany({
      where: { tenantId },
      orderBy: { decidedAt: 'desc' },
      take: 500,
    });
    return rows.filter((r) => (r.protectedFactors ?? []).length > 0);
  }
}

export const candidateScreeningService = new CandidateScreeningService();

// ============================================================================
// S10 — BGV case + per-check
// ============================================================================

export class BgvCaseService {
  async open(
    input: { caseId: string; candidateId: string; vendorName?: string },
    auth: AuthContext
  ) {
    return prisma.recruitmentBgvCase.upsert({
      where: {
        aura_recruitment_bgv_case_unique: { tenantId: auth.tenantId, caseId: input.caseId },
      } as any,
      update: { vendorName: input.vendorName },
      create: {
        tenantId: auth.tenantId,
        caseId: input.caseId,
        candidateId: input.candidateId,
        vendorName: input.vendorName,
      },
    });
  }

  async captureConsent(bgvCaseId: string, consentRef: string, auth: AuthContext) {
    return prisma.recruitmentBgvCase.update({
      where: { id: bgvCaseId },
      data: {
        consentCaptured: true,
        consentAt: new Date(),
        consentRef,
        status: 'IN_PROGRESS',
      },
    });
  }

  /**
   * Recompute the case status from its checks. PASSED requires all
   * checks to be PASS or WAIVED. Any FAIL → FAILED. Otherwise IN_PROGRESS.
   */
  async refreshStatus(bgvCaseId: string, auth: AuthContext) {
    const checks = await prisma.recruitmentBgvCheck.findMany({
      where: { tenantId: auth.tenantId, bgvCaseId },
    });
    if (checks.length === 0)
      return prisma.recruitmentBgvCase.findUnique({ where: { id: bgvCaseId } });

    const anyFail = checks.some((c) => c.result === 'FAIL');
    const allPassed = checks.every((c) => c.result === 'PASS' || c.result === 'WAIVED');
    const nextStatus = anyFail ? 'FAILED' : allPassed ? 'PASSED' : 'IN_PROGRESS';

    return prisma.recruitmentBgvCase.update({
      where: { id: bgvCaseId },
      data: { status: nextStatus, blockedReason: anyFail ? 'failed background check' : null },
    });
  }
}

export const bgvCaseService = new BgvCaseService();

export class BgvCheckService {
  async addOrUpdate(
    input: {
      bgvCaseId: string;
      checkType: string;
      result?: 'PENDING' | 'PASS' | 'FAIL' | 'DISCREPANCY' | 'WAIVED';
      discrepancyAction?: 'ESCALATE' | 'ACCEPT' | 'REJECT';
      vendorRef?: string;
      evidenceUrl?: string;
      notes?: string;
    },
    auth: AuthContext
  ) {
    const row = await prisma.recruitmentBgvCheck.upsert({
      where: {
        aura_recruitment_bgv_check_unique: {
          tenantId: auth.tenantId,
          bgvCaseId: input.bgvCaseId,
          checkType: input.checkType,
        },
      } as any,
      update: {
        result: input.result ?? 'PENDING',
        discrepancyAction: input.discrepancyAction,
        vendorRef: input.vendorRef,
        evidenceUrl: input.evidenceUrl,
        notes: input.notes,
        completedAt:
          input.result === 'PASS' || input.result === 'FAIL' || input.result === 'WAIVED'
            ? new Date()
            : null,
      },
      create: {
        tenantId: auth.tenantId,
        bgvCaseId: input.bgvCaseId,
        checkType: input.checkType,
        result: input.result ?? 'PENDING',
        discrepancyAction: input.discrepancyAction,
        vendorRef: input.vendorRef,
        evidenceUrl: input.evidenceUrl,
        notes: input.notes,
      },
    });

    // Auto-refresh the parent case status whenever a check changes.
    await bgvCaseService.refreshStatus(input.bgvCaseId, auth);
    return row;
  }
}

export const bgvCheckService = new BgvCheckService();

// ============================================================================
// S11 — Immigration eligibility
// ============================================================================

export class ImmigrationEligibilityService {
  async checkAndRecord(
    input: {
      caseId: string;
      candidateId: string;
      countryCode: string;
      nationality: string;
      profession?: string;
      banStatus?: 'CLEAR' | 'BANNED' | 'UNKNOWN';
      nocRequired?: boolean;
      nocReceived?: boolean;
      checkedById?: string;
    },
    auth: AuthContext
  ) {
    const banStatus = input.banStatus ?? 'UNKNOWN';
    const nocRequired = input.nocRequired ?? false;
    const nocReceived = input.nocReceived ?? false;

    let eligibility: 'PENDING' | 'ELIGIBLE' | 'INELIGIBLE' | 'CONDITIONAL';
    if (banStatus === 'BANNED') eligibility = 'INELIGIBLE';
    else if (banStatus === 'UNKNOWN') eligibility = 'PENDING';
    else if (nocRequired && !nocReceived) eligibility = 'CONDITIONAL';
    else eligibility = 'ELIGIBLE';

    return prisma.recruitmentImmigrationEligibility.upsert({
      where: {
        aura_recruitment_imm_elig_unique: {
          tenantId: auth.tenantId,
          caseId: input.caseId,
        },
      } as any,
      update: {
        countryCode: input.countryCode,
        nationality: input.nationality,
        profession: input.profession,
        banStatus,
        nocRequired,
        nocReceived,
        eligibility,
        checkedById: input.checkedById,
        checkedAt: new Date(),
      },
      create: {
        tenantId: auth.tenantId,
        caseId: input.caseId,
        candidateId: input.candidateId,
        countryCode: input.countryCode,
        nationality: input.nationality,
        profession: input.profession,
        banStatus,
        nocRequired,
        nocReceived,
        eligibility,
        checkedById: input.checkedById,
        checkedAt: new Date(),
      },
    });
  }
}

export const immigrationEligibilityService = new ImmigrationEligibilityService();

// ============================================================================
// S14 — Candidate data-privacy consent
// ============================================================================

export class CandidateConsentService {
  async record(
    input: {
      candidateId: string;
      lawfulBasis: 'CONSENT' | 'CONTRACT' | 'LEGAL_OBLIGATION' | 'LEGITIMATE_INTEREST';
      purpose: string;
      retentionDays?: number;
      evidenceRef?: string;
      metadata?: Record<string, unknown>;
    },
    auth: AuthContext
  ) {
    return prisma.recruitmentCandidateConsent.create({
      data: {
        tenantId: auth.tenantId,
        candidateId: input.candidateId,
        lawfulBasis: input.lawfulBasis,
        purpose: input.purpose,
        retentionDays: input.retentionDays ?? 365,
        evidenceRef: input.evidenceRef,
        metadata: (input.metadata ?? null) as any,
      },
    });
  }

  async withdraw(consentId: string, auth: AuthContext) {
    return prisma.recruitmentCandidateConsent.update({
      where: { id: consentId },
      data: { withdrawnAt: new Date() },
    });
  }

  /** Candidates whose consent is past retention and not withdrawn. */
  async dueForDisposal(tenantId: string, asOf: Date = new Date()) {
    const rows = await prisma.recruitmentCandidateConsent.findMany({
      where: { tenantId, withdrawnAt: null },
    });
    return rows.filter((r) => {
      const exp = new Date(r.consentedAt);
      exp.setDate(exp.getDate() + r.retentionDays);
      return exp.getTime() <= asOf.getTime();
    });
  }
}

export const candidateConsentService = new CandidateConsentService();

// ============================================================================
// S16 — Audit checklist + risk register
// ============================================================================

export class AuditChecklistService {
  async upsertItem(
    input: {
      period: string;
      itemCode: string;
      description: string;
      status?: 'PENDING' | 'PASS' | 'FAIL' | 'NA';
      evidenceRef?: string;
      notes?: string;
      reviewedById?: string;
    },
    auth: AuthContext
  ) {
    return prisma.recruitmentAuditChecklist.upsert({
      where: {
        aura_recruitment_audit_checklist_unique: {
          tenantId: auth.tenantId,
          period: input.period,
          itemCode: input.itemCode,
        },
      } as any,
      update: {
        description: input.description,
        status: input.status ?? 'PENDING',
        evidenceRef: input.evidenceRef,
        notes: input.notes,
        reviewedById: input.reviewedById,
        reviewedAt: input.reviewedById ? new Date() : null,
      },
      create: {
        tenantId: auth.tenantId,
        period: input.period,
        itemCode: input.itemCode,
        description: input.description,
        status: input.status ?? 'PENDING',
        evidenceRef: input.evidenceRef,
        notes: input.notes,
        reviewedById: input.reviewedById,
        reviewedAt: input.reviewedById ? new Date() : null,
      },
    });
  }

  async list(tenantId: string, period: string) {
    return prisma.recruitmentAuditChecklist.findMany({
      where: { tenantId, period },
      orderBy: { itemCode: 'asc' },
    });
  }
}

export const auditChecklistService = new AuditChecklistService();

export class RiskRegisterService {
  /** Derive risk band from likelihood × impact. */
  static deriveBand(likelihood: number, impact: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const score = likelihood * impact;
    if (score < 4) return 'LOW';
    if (score < 9) return 'MEDIUM';
    if (score < 16) return 'HIGH';
    return 'CRITICAL';
  }

  async raise(
    input: {
      code: string;
      description: string;
      likelihood: number;
      impact: number;
      mitigationPlan?: string;
      ownerId?: string;
    },
    auth: AuthContext
  ) {
    if (input.likelihood < 1 || input.likelihood > 5 || input.impact < 1 || input.impact > 5) {
      throw new Error('likelihood and impact must be in 1..5');
    }
    const band = RiskRegisterService.deriveBand(input.likelihood, input.impact);
    return prisma.recruitmentRisk.upsert({
      where: { aura_recruitment_risk_unique: { tenantId: auth.tenantId, code: input.code } } as any,
      update: {
        description: input.description,
        likelihood: input.likelihood,
        impact: input.impact,
        band,
        mitigationPlan: input.mitigationPlan,
        ownerId: input.ownerId,
      },
      create: {
        tenantId: auth.tenantId,
        code: input.code,
        description: input.description,
        likelihood: input.likelihood,
        impact: input.impact,
        band,
        mitigationPlan: input.mitigationPlan,
        ownerId: input.ownerId,
      },
    });
  }

  async mitigate(riskId: string) {
    return prisma.recruitmentRisk.update({
      where: { id: riskId },
      data: { status: 'MITIGATED', mitigatedAt: new Date() },
    });
  }

  async list(tenantId: string) {
    return prisma.recruitmentRisk.findMany({
      where: { tenantId },
      orderBy: [{ band: 'desc' }, { raisedAt: 'desc' }],
    });
  }
}

export const riskRegisterService = new RiskRegisterService();
