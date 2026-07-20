/**
 * EPIC-05 — Offer Management & Pre-Employment Compliance
 *
 * Closes the audit's 🔴 RED finding: basic JobOffer existed but the
 * approval matrix (maker-checker), conditional offers, pre-employment
 * doc gating, medical fitness, contract preparation, and acceptance
 * portal were all missing. This module provides the compliance gates
 * sitting on top of `JobOffer`:
 *
 *   - S02 OfferApprovalService — multi-step approval per grade × CTC,
 *     enforces approver ≠ initiator (maker-checker).
 *   - S04 OfferTemplateService — versioned offer-letter templates with
 *     clause-code references (en / ar).
 *   - S05 OfferConditionService — conditional offers (BGV pass, medical
 *     fit, visa obtained, …); ALL conditions must be MET / WAIVED
 *     before acceptance.
 *   - S09 PreEmploymentDocumentService — per-doc tracking + status.
 *   - S11 MedicalFitnessService — pre-employment medical with FIT /
 *     UNFIT / EXCEPTION outcomes.
 *   - S12 EmploymentContractService — draft → sent → signed lifecycle
 *     with HMAC signature references.
 *   - S13 OfferAcceptanceService — candidate portal acceptance with
 *     validity-window, IP + template-version capture for audit.
 */

import { prisma } from '@aura/database';

// The offer-compliance models (offerApprovalRule, offerApproval, offerTemplate,
// offerCondition, preEmploymentDocument, medicalFitness, employmentContract,
// offerAcceptance) exist in the deployed db-push database but are not in
// schema.prisma, so they are absent from the generated PrismaClient types.
const db = prisma as any;

export interface AuthContext {
  tenantId: string;
  userId: string;
}

// ============================================================================
// S02 — approval matrix + maker-checker
// ============================================================================

export class OfferApprovalService {
  async upsertRule(
    input: {
      legalEntityId?: string;
      grade: string;
      ctcThreshold: number;
      approverRoles: string[];
      effectiveFrom?: Date;
    },
    auth: AuthContext
  ) {
    if (input.approverRoles.length === 0) throw new Error('approverRoles must be non-empty');
    return db.offerApprovalRule.create({
      data: {
        tenantId: auth.tenantId,
        legalEntityId: input.legalEntityId,
        grade: input.grade,
        ctcThreshold: input.ctcThreshold,
        approverRoles: input.approverRoles,
        effectiveFrom: input.effectiveFrom ?? new Date(),
      },
    });
  }

  /**
   * Resolve the applicable rule for (grade, ctc). Picks the rule with
   * the highest `ctcThreshold` that is ≤ ctc.
   */
  async resolveRule(tenantId: string, grade: string, ctc: number) {
    const rules = await db.offerApprovalRule.findMany({
      where: { tenantId, grade, ctcThreshold: { lte: ctc } },
      orderBy: { ctcThreshold: 'desc' },
      take: 1,
    });
    return rules[0] ?? null;
  }

  /**
   * Initiate the multi-step approval chain for an offer. Creates one
   * OfferApproval row per role in the resolved rule. The initiator
   * (auth.userId) is recorded; downstream `decide()` enforces that
   * the approver ≠ initiator.
   */
  async initiate(input: { offerId: string; grade: string; ctc: number }, auth: AuthContext) {
    const rule = await this.resolveRule(auth.tenantId, input.grade, input.ctc);
    if (!rule) throw new Error(`no OfferApprovalRule for grade=${input.grade}, ctc=${input.ctc}`);
    const created = [];
    for (const [i, role] of rule.approverRoles.entries()) {
      const row = await db.offerApproval.create({
        data: {
          tenantId: auth.tenantId,
          offerId: input.offerId,
          initiatorId: auth.userId,
          approverRole: role,
          stepOrder: i + 1,
        },
      });
      created.push(row);
    }
    return created;
  }

  /** Approve / reject a step. Enforces maker-checker. */
  async decide(
    input: { approvalId: string; decision: 'APPROVED' | 'REJECTED'; comments?: string },
    auth: AuthContext
  ) {
    const row = await db.offerApproval.findFirst({
      where: { id: input.approvalId, tenantId: auth.tenantId },
    });
    if (!row) throw new Error('offer approval row not found');
    if (row.initiatorId === auth.userId) {
      throw new Error('initiator cannot approve own offer (maker-checker)');
    }
    return db.offerApproval.update({
      where: { id: input.approvalId },
      data: {
        approverId: auth.userId,
        status: input.decision,
        comments: input.comments,
        decidedAt: new Date(),
      },
    });
  }

  async statusFor(tenantId: string, offerId: string) {
    const rows = await db.offerApproval.findMany({
      where: { tenantId, offerId },
      orderBy: { stepOrder: 'asc' },
    });
    const anyRejected = rows.some((r: any) => r.status === 'REJECTED');
    const allApproved = rows.length > 0 && rows.every((r: any) => r.status === 'APPROVED');
    const overall = anyRejected ? 'REJECTED' : allApproved ? 'APPROVED' : 'PENDING';
    return { rows, overall };
  }
}

export const offerApprovalService = new OfferApprovalService();

// ============================================================================
// S04 — template library
// ============================================================================

export class OfferTemplateService {
  async upsert(
    input: {
      templateCode: string;
      countryCode?: string;
      language?: 'en' | 'ar';
      bodyMarkdown: string;
      clauseCodes?: string[];
      version?: number;
      isActive?: boolean;
    },
    auth: AuthContext
  ) {
    return db.offerTemplate.create({
      data: {
        tenantId: auth.tenantId,
        templateCode: input.templateCode,
        countryCode: input.countryCode,
        language: input.language ?? 'en',
        bodyMarkdown: input.bodyMarkdown,
        clauseCodes: input.clauseCodes ?? [],
        version: input.version ?? 1,
        isActive: input.isActive ?? true,
      },
    });
  }

  async listActive(tenantId: string, countryCode?: string) {
    return db.offerTemplate.findMany({
      where: { tenantId, isActive: true, ...(countryCode ? { countryCode } : {}) },
      orderBy: [{ templateCode: 'asc' }, { version: 'desc' }],
    });
  }
}

export const offerTemplateService = new OfferTemplateService();

// ============================================================================
// S05 — conditional offers
// ============================================================================

export class OfferConditionService {
  async add(
    input: { offerId: string; conditionCode: string; description: string; dueAt?: Date },
    auth: AuthContext
  ) {
    return db.offerCondition.upsert({
      where: {
        aura_offer_condition_unique: {
          tenantId: auth.tenantId,
          offerId: input.offerId,
          conditionCode: input.conditionCode,
        },
      } as any,
      update: { description: input.description, dueAt: input.dueAt },
      create: {
        tenantId: auth.tenantId,
        offerId: input.offerId,
        conditionCode: input.conditionCode,
        description: input.description,
        dueAt: input.dueAt,
      },
    });
  }

  async setStatus(
    input: {
      conditionId: string;
      status: 'PENDING' | 'MET' | 'WAIVED' | 'UNMET';
      evidenceRef?: string;
    },
    auth: AuthContext
  ) {
    const row = await db.offerCondition.findFirst({
      where: { id: input.conditionId, tenantId: auth.tenantId },
    });
    if (!row) throw new Error('offer condition not found');
    return db.offerCondition.update({
      where: { id: input.conditionId },
      data: {
        status: input.status,
        evidenceRef: input.evidenceRef,
        metAt: input.status === 'MET' || input.status === 'WAIVED' ? new Date() : null,
      },
    });
  }

  /** True iff EVERY condition for the offer is MET or WAIVED. */
  async allMet(tenantId: string, offerId: string) {
    const rows = await db.offerCondition.findMany({ where: { tenantId, offerId } });
    if (rows.length === 0) return true; // no conditions = trivially met
    return rows.every((r: any) => r.status === 'MET' || r.status === 'WAIVED');
  }
}

export const offerConditionService = new OfferConditionService();

// ============================================================================
// S09 — pre-employment documents
// ============================================================================

export class PreEmploymentDocumentService {
  async upsert(
    input: {
      candidateId: string;
      offerId?: string;
      docType: string;
      isMandatory?: boolean;
      fileUrl?: string;
    },
    auth: AuthContext
  ) {
    return db.preEmploymentDocument.upsert({
      where: {
        aura_pre_employment_document_unique: {
          tenantId: auth.tenantId,
          candidateId: input.candidateId,
          docType: input.docType,
        },
      } as any,
      update: {
        offerId: input.offerId,
        isMandatory: input.isMandatory ?? true,
        fileUrl: input.fileUrl,
        status: input.fileUrl ? 'RECEIVED' : 'PENDING',
      },
      create: {
        tenantId: auth.tenantId,
        candidateId: input.candidateId,
        offerId: input.offerId,
        docType: input.docType,
        isMandatory: input.isMandatory ?? true,
        fileUrl: input.fileUrl,
        status: input.fileUrl ? 'RECEIVED' : 'PENDING',
      },
    });
  }

  async verify(
    input: { documentId: string; decision: 'VERIFIED' | 'REJECTED'; rejectionReason?: string },
    auth: AuthContext
  ) {
    if (input.decision === 'REJECTED' && !input.rejectionReason) {
      throw new Error('rejectionReason required when decision = REJECTED');
    }
    return db.preEmploymentDocument.update({
      where: { id: input.documentId },
      data: {
        status: input.decision,
        verifiedById: auth.userId,
        verifiedAt: new Date(),
        rejectionReason: input.rejectionReason,
      },
    });
  }

  /** True iff every MANDATORY doc for the offer is VERIFIED. */
  async allMandatoryVerified(tenantId: string, offerId: string) {
    const rows = await db.preEmploymentDocument.findMany({
      where: { tenantId, offerId, isMandatory: true },
    });
    if (rows.length === 0) return true;
    return rows.every((r: any) => r.status === 'VERIFIED');
  }
}

export const preEmploymentDocumentService = new PreEmploymentDocumentService();

// ============================================================================
// S11 — medical fitness
// ============================================================================

export class MedicalFitnessService {
  async record(
    input: {
      candidateId: string;
      offerId?: string;
      countryCode: string;
      status: 'PENDING' | 'FIT' | 'UNFIT' | 'EXCEPTION';
      examDate?: Date;
      vendorName?: string;
      certificateRef?: string;
      notes?: string;
    },
    auth: AuthContext
  ) {
    return db.medicalFitness.upsert({
      where: {
        aura_medical_fitness_unique: {
          tenantId: auth.tenantId,
          candidateId: input.candidateId,
          countryCode: input.countryCode,
        },
      } as any,
      update: {
        offerId: input.offerId,
        status: input.status,
        examDate: input.examDate,
        vendorName: input.vendorName,
        certificateRef: input.certificateRef,
        notes: input.notes,
      },
      create: {
        tenantId: auth.tenantId,
        candidateId: input.candidateId,
        offerId: input.offerId,
        countryCode: input.countryCode,
        status: input.status,
        examDate: input.examDate,
        vendorName: input.vendorName,
        certificateRef: input.certificateRef,
        notes: input.notes,
      },
    });
  }
}

export const medicalFitnessService = new MedicalFitnessService();

// ============================================================================
// S12 — employment contract
// ============================================================================

export class EmploymentContractService {
  async draft(
    input: {
      offerId: string;
      candidateId: string;
      templateId?: string;
      countryCode: string;
      contractType: 'PERMANENT' | 'FIXED_TERM' | 'PART_TIME' | 'CONTRACTOR';
      effectiveFrom?: Date;
      effectiveTo?: Date;
      documentUrl?: string;
    },
    auth: AuthContext
  ) {
    return db.employmentContract.upsert({
      where: {
        aura_employment_contract_unique: { tenantId: auth.tenantId, offerId: input.offerId },
      } as any,
      update: {
        templateId: input.templateId,
        countryCode: input.countryCode,
        contractType: input.contractType,
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo,
        documentUrl: input.documentUrl,
      },
      create: {
        tenantId: auth.tenantId,
        offerId: input.offerId,
        candidateId: input.candidateId,
        templateId: input.templateId,
        countryCode: input.countryCode,
        contractType: input.contractType,
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo,
        documentUrl: input.documentUrl,
      },
    });
  }

  async send(contractId: string) {
    return db.employmentContract.update({
      where: { id: contractId },
      data: { status: 'SENT' },
    });
  }

  async sign(contractId: string, signatureRef: string) {
    return db.employmentContract.update({
      where: { id: contractId },
      data: { status: 'SIGNED', signedAt: new Date(), signatureRef },
    });
  }
}

export const employmentContractService = new EmploymentContractService();

// ============================================================================
// S13 — candidate acceptance portal
// ============================================================================

export class OfferAcceptanceService {
  async issue(
    input: { offerId: string; candidateId: string; validUntil: Date; templateVersion?: number },
    auth: AuthContext
  ) {
    return db.offerAcceptance.upsert({
      where: {
        aura_offer_acceptance_unique: { tenantId: auth.tenantId, offerId: input.offerId },
      } as any,
      update: {
        validUntil: input.validUntil,
        templateVersion: input.templateVersion,
        status: 'PENDING',
      },
      create: {
        tenantId: auth.tenantId,
        offerId: input.offerId,
        candidateId: input.candidateId,
        validUntil: input.validUntil,
        templateVersion: input.templateVersion,
      },
    });
  }

  /**
   * Candidate-side action — accept or decline. Validates that ALL
   * OfferConditions are MET / WAIVED and ALL mandatory pre-employment
   * documents are VERIFIED before allowing ACCEPTED. Captures IP +
   * signature reference for audit.
   */
  async respond(
    input: {
      acceptanceId: string;
      decision: 'ACCEPTED' | 'DECLINED';
      declinedReason?: string;
      ipAddress?: string;
      signatureRef?: string;
    },
    auth: AuthContext
  ) {
    const row = await db.offerAcceptance.findFirst({
      where: { id: input.acceptanceId, tenantId: auth.tenantId },
    });
    if (!row) throw new Error('offer acceptance not found');
    if (row.status === 'ACCEPTED' || row.status === 'DECLINED') {
      throw new Error(`offer already ${row.status.toLowerCase()}`);
    }
    if (row.validUntil.getTime() < Date.now()) {
      // Auto-expire if past validity window
      await db.offerAcceptance.update({
        where: { id: input.acceptanceId },
        data: { status: 'EXPIRED' },
      });
      throw new Error('offer validity window has expired');
    }

    if (input.decision === 'ACCEPTED') {
      const conditionsMet = await offerConditionService.allMet(auth.tenantId, row.offerId);
      if (!conditionsMet) throw new Error('cannot accept: some offer conditions not MET');
      const docsVerified = await preEmploymentDocumentService.allMandatoryVerified(
        auth.tenantId,
        row.offerId
      );
      if (!docsVerified) throw new Error('cannot accept: mandatory documents not VERIFIED');
    }

    return db.offerAcceptance.update({
      where: { id: input.acceptanceId },
      data: {
        status: input.decision,
        acceptedAt: input.decision === 'ACCEPTED' ? new Date() : null,
        declinedAt: input.decision === 'DECLINED' ? new Date() : null,
        declinedReason: input.declinedReason,
        ipAddress: input.ipAddress,
        signatureRef: input.signatureRef,
      },
    });
  }

  async expireOverdue(tenantId: string) {
    const overdue = await db.offerAcceptance.findMany({
      where: { tenantId, status: 'PENDING', validUntil: { lt: new Date() } },
    });
    await db.offerAcceptance.updateMany({
      where: { id: { in: overdue.map((o: any) => o.id) } },
      data: { status: 'EXPIRED' },
    });
    return overdue.length;
  }
}

export const offerAcceptanceService = new OfferAcceptanceService();
