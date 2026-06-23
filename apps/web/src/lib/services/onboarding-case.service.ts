import { prisma } from '@aura/database';
import type { Prisma } from '@prisma/client';

type Stage =
  | 'PRE_JOINING'
  | 'JOINING_DAY'
  | 'MASTER_DATA_ACTIVATION'
  | 'ENROLMENT'
  | 'PROBATION'
  | 'COMPLETED';

interface AuthContext {
  tenantId: string;
  userId: string;
  roles?: string[];
}

interface AcceptedOfferPayload {
  offerId?: string | null;
  candidateName?: string | null;
  candidateEmail?: string | null;
  countryCode: string;
  legalEntityId: string;
  employmentType: string;
  targetJoinDate: Date;
  onboardingInstanceId?: string | null;
  employeeId?: string | null;
}

interface StageConfig {
  ownerRole: string;
  slaHours: number;
  escalationRole: string;
  exitCriteria: string[];
}

const STAGES: Stage[] = [
  'PRE_JOINING',
  'JOINING_DAY',
  'MASTER_DATA_ACTIVATION',
  'ENROLMENT',
  'PROBATION',
  'COMPLETED',
];

const DEFAULT_STAGE_CONFIG: Record<Stage, StageConfig> = {
  PRE_JOINING: {
    ownerRole: 'HR_ADMIN',
    slaHours: 72,
    escalationRole: 'HR_MANAGER',
    exitCriteria: ['pre_joining_signed_off'],
  },
  JOINING_DAY: {
    ownerRole: 'HR_ADMIN',
    slaHours: 24,
    escalationRole: 'HR_MANAGER',
    exitCriteria: ['joining_day_completed'],
  },
  MASTER_DATA_ACTIVATION: {
    ownerRole: 'HR_MANAGER',
    slaHours: 24,
    escalationRole: 'HR_DIRECTOR',
    exitCriteria: ['employee_master_activated'],
  },
  ENROLMENT: {
    ownerRole: 'PAYROLL_OFFICER',
    slaHours: 72,
    escalationRole: 'HR_MANAGER',
    exitCriteria: ['payroll_ready', 'benefits_complete', 'social_insurance_complete'],
  },
  PROBATION: {
    ownerRole: 'LINE_MANAGER',
    slaHours: 2160,
    escalationRole: 'HR_MANAGER',
    exitCriteria: ['probation_plan_created'],
  },
  COMPLETED: {
    ownerRole: 'HR_MANAGER',
    slaHours: 0,
    escalationRole: 'HR_MANAGER',
    exitCriteria: [],
  },
};

function normalizeCountry(countryCode: string) {
  return countryCode.trim().toUpperCase();
}

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function hasOwnerRole(roles: string[] | undefined, ownerRole: string) {
  const normalized = new Set((roles ?? []).map((role) => role.toUpperCase()));
  return normalized.has(ownerRole) || normalized.has('HR_MANAGER');
}

export class OnboardingCaseService {
  async ensureDefaultGovernance(
    auth: AuthContext,
    countryCodes = ['AE', 'SA', 'BH', 'QA', 'OM', 'KW']
  ) {
    const rows = [];
    for (const countryCode of countryCodes) {
      const row = await (prisma as any).onboardingGovernanceTemplate.upsert({
        where: {
          tenantId_countryCode_legalEntityId_employmentType_version: {
            tenantId: auth.tenantId,
            countryCode,
            legalEntityId: 'DEFAULT',
            employmentType: 'DEFAULT',
            version: '2026.1',
          },
        },
        create: {
          tenantId: auth.tenantId,
          countryCode,
          legalEntityId: 'DEFAULT',
          employmentType: 'DEFAULT',
          version: '2026.1',
          status: 'ACTIVE',
          stageConfig: DEFAULT_STAGE_CONFIG as unknown as Prisma.InputJsonValue,
          checklistTemplate: {
            source: 'EPIC-06-S01',
            stages: STAGES,
          },
          createdBy: auth.userId,
          updatedBy: auth.userId,
        },
        update: {
          status: 'ACTIVE',
          stageConfig: DEFAULT_STAGE_CONFIG as unknown as Prisma.InputJsonValue,
          updatedBy: auth.userId,
        },
      });
      rows.push(row);
    }
    await this.audit(auth, 'CREATE', 'onboarding_governance_template', null, rows);
    return rows.map((row) => this.toTemplateDto(row));
  }

  async listCases(tenantId: string, filters: { status?: string; stage?: string }) {
    const rows = await (prisma as any).onboardingCase.findMany({
      where: {
        tenantId,
        isDeleted: false,
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.stage ? { currentStage: filters.stage } : {}),
      },
      orderBy: [{ slaDueAt: 'asc' }, { updatedAt: 'desc' }],
      include: { histories: { orderBy: { createdAt: 'desc' }, take: 5 } },
    });
    return rows.map((row: any) => this.toCaseDto(row));
  }

  async consumeOfferAccepted(input: AcceptedOfferPayload, auth: AuthContext) {
    const countryCode = normalizeCountry(input.countryCode);
    if (input.offerId) {
      const offer = await prisma.jobOffer.findFirst({
        where: { id: input.offerId, status: 'accepted' },
        include: { application: { include: { candidate: true } } },
      });
      if (!offer) {
        throw new Error('Accepted offer not found');
      }
    }

    const template = await this.resolveGovernance(
      auth.tenantId,
      countryCode,
      input.legalEntityId,
      input.employmentType
    );
    const stageConfig = template.stageConfig as Record<Stage, StageConfig>;
    const firstStageConfig = stageConfig.PRE_JOINING ?? DEFAULT_STAGE_CONFIG.PRE_JOINING;
    const slaDueAt = addHours(new Date(), firstStageConfig.slaHours);

    const existing = input.offerId
      ? await (prisma as any).onboardingCase.findUnique({
          where: { tenantId_offerId: { tenantId: auth.tenantId, offerId: input.offerId } },
        })
      : null;
    if (existing) return this.toCaseDto(existing);

    const created = await (prisma as any).onboardingCase.create({
      data: {
        tenantId: auth.tenantId,
        offerId: input.offerId ?? null,
        onboardingInstanceId: input.onboardingInstanceId ?? null,
        employeeId: input.employeeId ?? null,
        candidateName: input.candidateName ?? null,
        candidateEmail: input.candidateEmail ?? null,
        countryCode,
        legalEntityId: input.legalEntityId,
        employmentType: input.employmentType,
        targetJoinDate: input.targetJoinDate,
        currentStage: 'PRE_JOINING',
        status: 'OPEN',
        stageOwnerRole: firstStageConfig.ownerRole,
        escalationRole: firstStageConfig.escalationRole,
        governanceTemplateId: template.id ?? null,
        governanceVersion: template.version,
        governanceSnapshot: toJson(stageConfig),
        checklistSnapshot: toJson(template.checklistTemplate ?? {}),
        blockingItems: [],
        slaDueAt,
        createdBy: auth.userId,
        updatedBy: auth.userId,
      },
    });
    await (prisma as any).onboardingStageHistory.create({
      data: {
        tenantId: auth.tenantId,
        caseId: created.id,
        fromStage: null,
        toStage: 'PRE_JOINING',
        actorId: auth.userId,
        reason: 'Offer accepted',
      },
    });
    await this.audit(auth, 'CREATE', created.id, null, created);
    return this.toCaseDto(created);
  }

  async evaluateStageExit(tenantId: string, caseId: string) {
    const onboardingCase = await this.loadCase(tenantId, caseId);
    const blockers = await this.blockersForStage(onboardingCase);
    return {
      caseId,
      currentStage: onboardingCase.currentStage,
      blocked: blockers.length > 0,
      blockers,
    };
  }

  async advance(caseId: string, targetStage: Stage, reason: string | undefined, auth: AuthContext) {
    const onboardingCase = await this.loadCase(auth.tenantId, caseId);
    if (!hasOwnerRole(auth.roles, onboardingCase.stageOwnerRole)) {
      throw new Error('Only the stage owner role or HR Manager can advance this case');
    }
    const currentIndex = STAGES.indexOf(onboardingCase.currentStage as Stage);
    const targetIndex = STAGES.indexOf(targetStage);
    if (targetIndex < 0 || targetIndex !== currentIndex + 1) {
      throw new Error('Onboarding cases must advance one configured stage at a time');
    }

    const blockers = await this.blockersForStage(onboardingCase);
    if (blockers.length > 0) {
      await (prisma as any).onboardingCase.update({
        where: { id: caseId },
        data: {
          status: 'BLOCKED',
          blockingItems: toJson(blockers),
          updatedBy: auth.userId,
        },
      });
      throw new Error(
        `Stage exit criteria are unmet: ${blockers.map((item) => item.reason).join('; ')}`
      );
    }

    const stageConfig = onboardingCase.governanceSnapshot as Record<Stage, StageConfig>;
    const nextConfig = stageConfig[targetStage] ?? DEFAULT_STAGE_CONFIG[targetStage];
    const status = targetStage === 'COMPLETED' ? 'COMPLETED' : 'OPEN';
    const updated = await (prisma as any).onboardingCase.update({
      where: { id: caseId },
      data: {
        currentStage: targetStage,
        status,
        stageOwnerRole: nextConfig.ownerRole,
        escalationRole: nextConfig.escalationRole,
        slaDueAt: nextConfig.slaHours ? addHours(new Date(), nextConfig.slaHours) : null,
        blockingItems: [],
        updatedBy: auth.userId,
      },
    });
    await (prisma as any).onboardingStageHistory.create({
      data: {
        tenantId: auth.tenantId,
        caseId,
        fromStage: onboardingCase.currentStage,
        toStage: targetStage,
        actorId: auth.userId,
        reason: reason ?? null,
      },
    });
    await this.audit(auth, 'UPDATE', caseId, onboardingCase, updated);
    return this.toCaseDto(updated);
  }

  async reassign(caseId: string, ownerRole: string, reason: string | undefined, auth: AuthContext) {
    const onboardingCase = await this.loadCase(auth.tenantId, caseId);
    if (!hasOwnerRole(auth.roles, onboardingCase.stageOwnerRole)) {
      throw new Error('Only the stage owner role or HR Manager can reassign this case');
    }
    const updated = await (prisma as any).onboardingCase.update({
      where: { id: caseId },
      data: {
        stageOwnerRole: ownerRole.toUpperCase(),
        updatedBy: auth.userId,
      },
    });
    await (prisma as any).onboardingStageHistory.create({
      data: {
        tenantId: auth.tenantId,
        caseId,
        fromStage: onboardingCase.currentStage,
        toStage: onboardingCase.currentStage,
        actorId: auth.userId,
        reason: reason ?? `Reassigned to ${ownerRole}`,
      },
    });
    await this.audit(auth, 'UPDATE', caseId, onboardingCase, updated);
    return this.toCaseDto(updated);
  }

  async escalateBreachedCases(tenantId: string, actorId: string, now = new Date()) {
    const breached = await (prisma as any).onboardingCase.findMany({
      where: {
        tenantId,
        isDeleted: false,
        status: { in: ['OPEN', 'BLOCKED'] },
        slaDueAt: { lt: now },
      },
    });
    const escalated = [];
    for (const item of breached) {
      const updated = await (prisma as any).onboardingCase.update({
        where: { id: item.id },
        data: {
          status: 'ESCALATED',
          escalatedAt: now,
          escalatedToRole: item.escalationRole,
          updatedBy: actorId,
        },
      });
      await (prisma as any).onboardingStageHistory.create({
        data: {
          tenantId,
          caseId: item.id,
          fromStage: item.currentStage,
          toStage: item.currentStage,
          actorId,
          reason: `SLA breached; escalated to ${item.escalationRole}`,
        },
      });
      escalated.push(updated);
    }
    return escalated.map((row) => this.toCaseDto(row));
  }

  private async resolveGovernance(
    tenantId: string,
    countryCode: string,
    legalEntityId: string,
    employmentType: string
  ) {
    const template = await (prisma as any).onboardingGovernanceTemplate.findFirst({
      where: {
        tenantId,
        countryCode,
        status: 'ACTIVE',
        isDeleted: false,
        OR: [
          { legalEntityId, employmentType },
          { legalEntityId, employmentType: 'DEFAULT' },
          { legalEntityId: 'DEFAULT', employmentType },
          { legalEntityId: 'DEFAULT', employmentType: 'DEFAULT' },
          { legalEntityId: null, employmentType: null },
        ],
      },
      orderBy: [{ legalEntityId: 'desc' }, { employmentType: 'desc' }, { version: 'desc' }],
    });
    if (template) return template;
    return {
      id: null,
      countryCode,
      version: '2026.1-fallback',
      stageConfig: DEFAULT_STAGE_CONFIG,
      checklistTemplate: { source: 'fallback', stages: STAGES },
    };
  }

  private async blockersForStage(onboardingCase: any) {
    const stage = onboardingCase.currentStage as Stage;
    const blockers: Array<{ code: string; reason: string }> = [];
    if (stage === 'PRE_JOINING') {
      const hasIncompleteTasks = onboardingCase.onboardingInstanceId
        ? await (prisma as any).onboardingTask.count({
            where: {
              instanceId: onboardingCase.onboardingInstanceId,
              isMandatory: true,
              phase: { in: ['pre_joining', 'pre-joining'] },
              status: { notIn: ['completed', 'approved'] },
            },
          })
        : 0;
      if (hasIncompleteTasks > 0)
        blockers.push({
          code: 'PRE_JOINING_TASKS',
          reason: 'Mandatory pre-joining tasks are incomplete',
        });
    }
    if (stage === 'JOINING_DAY') {
      const record = await (prisma as any).joiningDayRecord?.findFirst?.({
        where: {
          tenantId: onboardingCase.tenantId,
          caseId: onboardingCase.id,
          status: 'COMPLETED',
        },
      });
      if (!record)
        blockers.push({
          code: 'JOINING_DAY_RECORD',
          reason: 'Joining-day formalities are not complete',
        });
    }
    if (stage === 'MASTER_DATA_ACTIVATION') {
      if (!onboardingCase.employeeId) {
        const activatedDraft = await (prisma as any).employeeMasterDataDraft.findFirst({
          where: {
            tenantId: onboardingCase.tenantId,
            onboardingInstanceId: onboardingCase.onboardingInstanceId ?? undefined,
            offerId: onboardingCase.offerId ?? undefined,
            status: 'ACTIVATED',
          },
        });
        if (!activatedDraft)
          blockers.push({
            code: 'EMPLOYEE_MASTER',
            reason: 'Employee master data is not activated',
          });
      }
    }
    if (stage === 'ENROLMENT') {
      if (onboardingCase.employeeId) {
        const [payroll, benefits, social] = await Promise.all([
          (prisma as any).employeePayrollProfile.findUnique?.({
            where: {
              tenantId_employeeId: {
                tenantId: onboardingCase.tenantId,
                employeeId: onboardingCase.employeeId,
              },
            },
          }),
          prisma.benefitEnrollment.findFirst({
            where: {
              tenantId: onboardingCase.tenantId,
              employeeId: onboardingCase.employeeId,
              plan: { category: 'HEALTH_INSURANCE' },
              insuranceCardStatus: 'ISSUED',
            },
          }),
          (prisma as any).socialInsuranceRegistration.findFirst?.({
            where: {
              tenantId: onboardingCase.tenantId,
              employeeId: onboardingCase.employeeId,
              mandatory: true,
              status: 'REGISTERED',
            },
          }),
        ]);
        if (
          !payroll ||
          payroll.readinessStatus !== 'READY' ||
          payroll.approvalStatus !== 'APPROVED'
        ) {
          blockers.push({
            code: 'PAYROLL_READY',
            reason: 'Payroll onboarding is not approved and ready',
          });
        }
        if (!benefits)
          blockers.push({
            code: 'BENEFITS_READY',
            reason: 'Medical benefits enrollment/card issuance is incomplete',
          });
        if (!social)
          blockers.push({
            code: 'SOCIAL_INSURANCE_READY',
            reason: 'Mandatory social insurance registration is incomplete',
          });
      }
    }
    if (stage === 'PROBATION') {
      const tracking = onboardingCase.employeeId
        ? await prisma.probationTracking.findFirst({
            where: {
              employeeId: onboardingCase.employeeId,
              status: { in: ['ACTIVE', 'EXTENDED', 'CONFIRMED'] },
            },
          })
        : null;
      if (!tracking)
        blockers.push({ code: 'PROBATION_PLAN', reason: 'Probation tracking plan is not created' });
    }
    return blockers;
  }

  private async loadCase(tenantId: string, caseId: string) {
    const onboardingCase = await (prisma as any).onboardingCase.findFirst({
      where: { id: caseId, tenantId, isDeleted: false },
    });
    if (!onboardingCase) throw new Error('Onboarding case not found');
    return onboardingCase;
  }

  private async audit(
    auth: AuthContext,
    action: 'CREATE' | 'UPDATE',
    resourceId: string,
    beforeValues: unknown,
    afterValues: unknown
  ) {
    await prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: action as any,
        resourceType: 'onboarding_case',
        resourceId,
        module: 'onboarding',
        beforeValues: beforeValues as Prisma.InputJsonValue,
        afterValues: afterValues as Prisma.InputJsonValue,
        metadata: toJson({ story: 'EPIC-06-S01' }),
      },
    });
  }

  private toTemplateDto(row: any) {
    return {
      id: row.id,
      countryCode: row.countryCode,
      legalEntityId: row.legalEntityId,
      employmentType: row.employmentType,
      version: row.version,
      stageConfig: row.stageConfig,
      checklistTemplate: row.checklistTemplate,
    };
  }

  private toCaseDto(row: any) {
    return {
      ...row,
      histories: row.histories ?? undefined,
    };
  }
}

export const onboardingCaseService = new OnboardingCaseService();
