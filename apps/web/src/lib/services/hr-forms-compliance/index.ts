/**
 * EPIC-33: HR Forms & Templates Compliance.
 *
 * Template catalogue groups forms into the lifecycle bands (RECRUITMENT,
 * EMPLOYMENT, PAYROLL, LEAVE_ATTENDANCE, BENEFITS, EMPLOYEE_RELATIONS,
 * SEPARATION, COMPLIANCE). Each template is versioned (DRAFT → PUBLISHED
 * → SUPERSEDED) and carries a JSON schema for the form builder and an
 * optional writeback target. Routing config defines an ordered stage
 * list with approver role / id and SLA hours. Submission state tracks
 * the workflow (DRAFT → SUBMITTED → IN_REVIEW → APPROVED / REJECTED)
 * plus writeback status (PENDING → SUCCESS / FAILED). Each stage
 * transition records an e-signature (action APPROVE / REJECT / SIGN /
 * SUBMIT) with hash and IP audit. Monthly certificate aggregates
 * templates published, submission counts, writeback failures, SLA
 * breaches — refusing to sign while writeback failures or SLA breaches
 * remain.
 */

import { prisma } from '@aura/database';
import { signWithHmac } from '../signing/hmac-signature.service';

export interface AuthContext {
  tenantId: string;
  userId: string;
}

export type FormGroup =
  | 'RECRUITMENT'
  | 'EMPLOYMENT'
  | 'PAYROLL'
  | 'LEAVE_ATTENDANCE'
  | 'BENEFITS'
  | 'EMPLOYEE_RELATIONS'
  | 'SEPARATION'
  | 'COMPLIANCE';

export const DEFAULT_TEMPLATES: Array<{
  templateCode: string;
  formGroup: FormGroup;
  label: string;
  writebackTarget?: string;
  isMandatory: boolean;
}> = [
  {
    templateCode: 'MANPOWER_REQUISITION',
    formGroup: 'RECRUITMENT',
    label: 'Manpower Requisition',
    writebackTarget: 'recruitment.requisition',
    isMandatory: true,
  },
  {
    templateCode: 'INTERVIEW_EVALUATION',
    formGroup: 'RECRUITMENT',
    label: 'Interview Evaluation',
    writebackTarget: 'recruitment.interview',
    isMandatory: true,
  },
  {
    templateCode: 'OFFER_APPROVAL',
    formGroup: 'RECRUITMENT',
    label: 'Selection & Offer Approval',
    writebackTarget: 'recruitment.offer',
    isMandatory: true,
  },
  {
    templateCode: 'EMPLOYEE_JOINING',
    formGroup: 'EMPLOYMENT',
    label: 'Employee Joining Form',
    writebackTarget: 'hr.employee',
    isMandatory: true,
  },
  {
    templateCode: 'SALARY_ADVANCE',
    formGroup: 'PAYROLL',
    label: 'Salary Advance Request',
    writebackTarget: 'payroll.advance',
    isMandatory: false,
  },
  {
    templateCode: 'EMPLOYEE_LOAN',
    formGroup: 'PAYROLL',
    label: 'Employee Loan Request',
    writebackTarget: 'payroll.loan',
    isMandatory: false,
  },
  {
    templateCode: 'LEAVE_REQUEST',
    formGroup: 'LEAVE_ATTENDANCE',
    label: 'Leave Request',
    writebackTarget: 'leave.request',
    isMandatory: true,
  },
  {
    templateCode: 'ATTENDANCE_REGULARIZATION',
    formGroup: 'LEAVE_ATTENDANCE',
    label: 'Attendance Regularization',
    writebackTarget: 'attendance.regularization',
    isMandatory: false,
  },
  {
    templateCode: 'MEDICAL_INSURANCE_ENROLLMENT',
    formGroup: 'BENEFITS',
    label: 'Medical Insurance Enrollment',
    writebackTarget: 'benefits.coverage',
    isMandatory: true,
  },
  {
    templateCode: 'GRIEVANCE',
    formGroup: 'EMPLOYEE_RELATIONS',
    label: 'Grievance Submission',
    isMandatory: false,
  },
  {
    templateCode: 'DISCIPLINARY_HEARING',
    formGroup: 'EMPLOYEE_RELATIONS',
    label: 'Disciplinary Hearing Record',
    writebackTarget: 'er.case',
    isMandatory: false,
  },
  {
    templateCode: 'RESIGNATION',
    formGroup: 'SEPARATION',
    label: 'Resignation Letter',
    writebackTarget: 'separation.case',
    isMandatory: true,
  },
  {
    templateCode: 'EXIT_CLEARANCE',
    formGroup: 'SEPARATION',
    label: 'Exit Clearance Checklist',
    writebackTarget: 'separation.clearance',
    isMandatory: true,
  },
  {
    templateCode: 'EXIT_INTERVIEW',
    formGroup: 'SEPARATION',
    label: 'Exit Interview',
    isMandatory: false,
  },
  {
    templateCode: 'POLICY_ACKNOWLEDGEMENT',
    formGroup: 'COMPLIANCE',
    label: 'Policy Acknowledgement',
    writebackTarget: 'policy.acknowledgement',
    isMandatory: true,
  },
  // Theme D — sample/template forms missing per audit 2026-06-17.
  {
    templateCode: 'MISCONDUCT_REPORT',
    formGroup: 'EMPLOYEE_RELATIONS',
    label: 'Misconduct Report (EPIC-26-S14)',
    writebackTarget: 'er.disciplinary',
    isMandatory: false,
  },
  {
    templateCode: 'EOSB_CALC_SHEET',
    formGroup: 'SEPARATION',
    label: 'EOSB Calculation Sheet (EPIC-28-S18)',
    writebackTarget: 'eosb.calculation',
    isMandatory: true,
  },
  {
    templateCode: 'VISA_EXIT_CHECKLIST',
    formGroup: 'SEPARATION',
    label: 'Visa-Exit Checklist (EPIC-29-S19)',
    writebackTarget: 'visa-exit.case',
    isMandatory: true,
  },
  {
    templateCode: 'EMPLOYEE_FILE_AUDIT_SHEET',
    formGroup: 'COMPLIANCE',
    label: 'Employee File Audit Sheet (EPIC-30-S17)',
    writebackTarget: 'records.audit',
    isMandatory: true,
  },
];

export class HrFormTemplateService {
  async seedDefaults(auth: AuthContext) {
    const created: string[] = [];
    for (const t of DEFAULT_TEMPLATES) {
      try {
        await (prisma as any).hrFormTemplate.create({
          data: {
            tenantId: auth.tenantId,
            ...t,
            status: 'DRAFT',
            createdBy: auth.userId,
          },
        });
        created.push(t.templateCode);
      } catch (err) {
        if (!String(err).includes('Unique')) throw err;
      }
    }
    return { created };
  }

  async publish(id: string, _auth: AuthContext) {
    return (prisma as any).hrFormTemplate.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    });
  }

  async supersede(id: string, supersededById: string, _auth: AuthContext) {
    return (prisma as any).hrFormTemplate.update({
      where: { id },
      data: { status: 'SUPERSEDED', supersededById },
    });
  }

  async list(tenantId: string, filter: { formGroup?: string; status?: string } = {}) {
    return (prisma as any).hrFormTemplate.findMany({
      where: {
        tenantId,
        ...(filter.formGroup ? { formGroup: filter.formGroup } : {}),
        ...(filter.status ? { status: filter.status } : {}),
      },
      orderBy: [{ formGroup: 'asc' }, { templateCode: 'asc' }],
      take: 500,
    });
  }
}

export const hrFormTemplateService = new HrFormTemplateService();

export class HrFormRoutingService {
  async upsertStage(
    input: {
      templateId: string;
      stageOrder: number;
      stageLabel: string;
      approverRole?: string;
      approverId?: string;
      slaHours?: number;
      isParallel?: boolean;
    },
    auth: AuthContext
  ) {
    return (prisma as any).hrFormRouting.upsert({
      where: {
        aura_hr_form_routing_unique: {
          tenantId: auth.tenantId,
          templateId: input.templateId,
          stageOrder: input.stageOrder,
        },
      },
      update: input,
      create: { tenantId: auth.tenantId, ...input, slaHours: input.slaHours ?? 48 },
    });
  }

  async list(tenantId: string, templateId?: string) {
    return (prisma as any).hrFormRouting.findMany({
      where: { tenantId, ...(templateId ? { templateId } : {}) },
      orderBy: { stageOrder: 'asc' },
    });
  }
}

export const hrFormRoutingService = new HrFormRoutingService();

export class HrFormSubmissionService {
  async start(
    input: {
      templateId: string;
      submissionRef: string;
      employeeId: string;
      payload: Record<string, unknown>;
    },
    auth: AuthContext
  ) {
    const tpl = await (prisma as any).hrFormTemplate.findUnique({
      where: { id: input.templateId },
    });
    if (!tpl || tpl.tenantId !== auth.tenantId) throw new Error('template not found');
    if (tpl.status !== 'PUBLISHED') throw new Error('template not PUBLISHED');
    const stages = await (prisma as any).hrFormRouting.count({
      where: { tenantId: auth.tenantId, templateId: input.templateId },
    });
    return (prisma as any).hrFormSubmissionState.upsert({
      where: {
        aura_hr_form_submission_state_unique: {
          tenantId: auth.tenantId,
          submissionRef: input.submissionRef,
        },
      },
      update: {
        payloadJson: input.payload,
        totalStages: stages,
        status: 'DRAFT',
      },
      create: {
        tenantId: auth.tenantId,
        templateId: input.templateId,
        submissionRef: input.submissionRef,
        employeeId: input.employeeId,
        payloadJson: input.payload,
        totalStages: stages,
        currentStage: 0,
        status: 'DRAFT',
      },
    });
  }

  async submit(id: string, auth: AuthContext) {
    const state = await (prisma as any).hrFormSubmissionState.findUnique({ where: { id } });
    if (!state) throw new Error('submission not found');
    if (state.tenantId !== auth.tenantId) throw new Error('tenant mismatch');
    await (prisma as any).hrFormSignature.create({
      data: {
        tenantId: auth.tenantId,
        submissionStateId: id,
        stageOrder: 0,
        signerId: auth.userId,
        action: 'SUBMIT',
      },
    });
    return (prisma as any).hrFormSubmissionState.update({
      where: { id },
      data: {
        status: state.totalStages > 0 ? 'IN_REVIEW' : 'APPROVED',
        submittedAt: new Date(),
        currentStage: state.totalStages > 0 ? 1 : 0,
      },
    });
  }

  async approveStage(
    input: { id: string; comments?: string; ipAddress?: string; userAgent?: string },
    auth: AuthContext
  ) {
    const state = await (prisma as any).hrFormSubmissionState.findUnique({
      where: { id: input.id },
    });
    if (!state) throw new Error('submission not found');
    if (state.tenantId !== auth.tenantId) throw new Error('tenant mismatch');
    await (prisma as any).hrFormSignature.create({
      data: {
        tenantId: auth.tenantId,
        submissionStateId: input.id,
        stageOrder: state.currentStage,
        signerId: auth.userId,
        action: 'APPROVE',
        comments: input.comments,
        // Cryptographic HMAC-SHA256 signature (audit Pattern 7) — replaces
        // the predictable `hash:userId:timestamp` shape so signatures are
        // tamper-evident and verifiable. See lib/services/signing/.
        signatureHash: signWithHmac({
          domain: 'hr-forms:approve',
          resourceId: input.id,
          actorId: auth.userId,
          ipAddress: input.ipAddress,
          extra: { stage: state.currentStage },
        }),
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
    const nextStage = state.currentStage + 1;
    if (nextStage > state.totalStages) {
      return (prisma as any).hrFormSubmissionState.update({
        where: { id: input.id },
        data: { status: 'APPROVED', approvedAt: new Date(), currentStage: state.totalStages },
      });
    }
    return (prisma as any).hrFormSubmissionState.update({
      where: { id: input.id },
      data: { currentStage: nextStage },
    });
  }

  async reject(input: { id: string; reason: string }, auth: AuthContext) {
    const state = await (prisma as any).hrFormSubmissionState.findUnique({
      where: { id: input.id },
    });
    if (!state) throw new Error('submission not found');
    await (prisma as any).hrFormSignature.create({
      data: {
        tenantId: auth.tenantId,
        submissionStateId: input.id,
        stageOrder: state.currentStage,
        signerId: auth.userId,
        action: 'REJECT',
        comments: input.reason,
      },
    });
    return (prisma as any).hrFormSubmissionState.update({
      where: { id: input.id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectionReason: input.reason,
      },
    });
  }

  async markWriteback(
    input: { id: string; status: 'SUCCESS' | 'FAILED'; writebackRef?: string },
    _auth: AuthContext
  ) {
    return (prisma as any).hrFormSubmissionState.update({
      where: { id: input.id },
      data: {
        writebackStatus: input.status,
        writebackRef: input.writebackRef,
        writebackAt: new Date(),
      },
    });
  }

  async list(tenantId: string, filter: { status?: string; templateId?: string } = {}) {
    return (prisma as any).hrFormSubmissionState.findMany({
      where: {
        tenantId,
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.templateId ? { templateId: filter.templateId } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      take: 500,
    });
  }

  async listSignatures(tenantId: string, submissionStateId: string) {
    return (prisma as any).hrFormSignature.findMany({
      where: { tenantId, submissionStateId },
      orderBy: { signedAt: 'asc' },
    });
  }
}

export const hrFormSubmissionService = new HrFormSubmissionService();

/** EPIC-33-S03 / S13: pure SLA-breach detection on a submission given its
 * routing list. */
export function detectSlaBreach(
  state: { status: string; submittedAt: Date | null; currentStage: number; updatedAt: Date },
  routing: Array<{ stageOrder: number; slaHours: number }>
): boolean {
  if (state.status === 'APPROVED' || state.status === 'REJECTED' || !state.submittedAt)
    return false;
  const stage = routing.find((r) => r.stageOrder === state.currentStage);
  if (!stage) return false;
  const ageHours = (Date.now() - new Date(state.updatedAt).getTime()) / (3600 * 1000);
  return ageHours > stage.slaHours;
}

export class HrFormCertificateService {
  async dashboard(tenantId: string, period: string) {
    const [y, m] = period.split('-').map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);
    const templatesPublished = await (prisma as any).hrFormTemplate.count({
      where: { tenantId, status: 'PUBLISHED' },
    });
    const submissionsTotal = await (prisma as any).hrFormSubmissionState.count({
      where: { tenantId, createdAt: { gte: start, lte: end } },
    });
    const submissionsApproved = await (prisma as any).hrFormSubmissionState.count({
      where: { tenantId, status: 'APPROVED', approvedAt: { gte: start, lte: end } },
    });
    const submissionsRejected = await (prisma as any).hrFormSubmissionState.count({
      where: { tenantId, status: 'REJECTED', rejectedAt: { gte: start, lte: end } },
    });
    const submissionsPending = await (prisma as any).hrFormSubmissionState.count({
      where: { tenantId, status: { in: ['DRAFT', 'IN_REVIEW'] } },
    });
    const writebackFailures = await (prisma as any).hrFormSubmissionState.count({
      where: { tenantId, writebackStatus: 'FAILED' },
    });
    // SLA breach detection — sample pending submissions
    const pending = await (prisma as any).hrFormSubmissionState.findMany({
      where: { tenantId, status: { in: ['DRAFT', 'IN_REVIEW'] } },
      take: 500,
    });
    let slaBreachCount = 0;
    for (const s of pending as Array<Record<string, unknown>>) {
      const routing = await (prisma as any).hrFormRouting.findMany({
        where: { tenantId, templateId: s.templateId as string },
      });
      if (
        detectSlaBreach(
          {
            status: s.status as string,
            submittedAt: s.submittedAt ? new Date(s.submittedAt as string) : null,
            currentStage: s.currentStage as number,
            updatedAt: new Date(s.updatedAt as string),
          },
          routing
        )
      )
        slaBreachCount += 1;
    }
    return {
      period,
      templatesPublished,
      submissionsTotal,
      submissionsApproved,
      submissionsRejected,
      submissionsPending,
      writebackFailures,
      slaBreachCount,
    };
  }

  async generate(period: string, auth: AuthContext) {
    const stats = await this.dashboard(auth.tenantId, period);
    const reasons: string[] = [];
    if (stats.writebackFailures > 0)
      reasons.push(`${stats.writebackFailures} writeback failure(s)`);
    if (stats.slaBreachCount > 0) reasons.push(`${stats.slaBreachCount} SLA breach(es)`);
    const gatingReason = reasons.length ? `Blocked: ${reasons.join('; ')}` : null;
    return (prisma as any).hrFormCertificate.upsert({
      where: { aura_hr_form_certificate_unique: { tenantId: auth.tenantId, period } },
      update: { ...stats, gatingReason, generatedAt: new Date(), status: 'DRAFT' },
      create: {
        tenantId: auth.tenantId,
        ...stats,
        gatingReason,
        generatedAt: new Date(),
        status: 'DRAFT',
      },
    });
  }

  async sign(
    period: string,
    attestations: Array<{ field: string; value: string }>,
    auth: AuthContext
  ) {
    const cert = await (prisma as any).hrFormCertificate.findUnique({
      where: { aura_hr_form_certificate_unique: { tenantId: auth.tenantId, period } },
    });
    if (!cert) throw new Error('certificate not generated');
    if (cert.gatingReason) throw new Error(`cannot sign while gated: ${cert.gatingReason}`);
    return (prisma as any).hrFormCertificate.update({
      where: { id: cert.id },
      data: {
        status: 'SIGNED',
        signedAt: new Date(),
        signedBy: auth.userId,
        attestationsJson: attestations,
      },
    });
  }

  async list(tenantId: string) {
    return (prisma as any).hrFormCertificate.findMany({
      where: { tenantId },
      orderBy: { period: 'desc' },
      take: 24,
    });
  }
}

export const hrFormCertificateService = new HrFormCertificateService();

export const HR_FORMS_CONSTANTS = { DEFAULT_TEMPLATES };
