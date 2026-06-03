import { prisma } from '@aura/database';
import { BaseService } from './base.service';

export type ClaimStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'PARTIALLY_APPROVED'
  | 'REJECTED'
  | 'PAID'
  | 'PENDING_INFO';

export type BenefitCategory =
  | 'MEDICAL'
  | 'DENTAL'
  | 'VISION'
  | 'LIFE'
  | 'DISABILITY'
  | 'RETIREMENT'
  | 'WELLNESS'
  | 'OTHER';

const STATUS_TRANSITIONS: Record<ClaimStatus, ClaimStatus[]> = {
  SUBMITTED: ['UNDER_REVIEW', 'PENDING_INFO', 'REJECTED'],
  UNDER_REVIEW: ['APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'PENDING_INFO'],
  PENDING_INFO: ['UNDER_REVIEW', 'REJECTED'],
  APPROVED: ['PAID', 'REJECTED'],
  PARTIALLY_APPROVED: ['PAID', 'REJECTED'],
  PAID: [],
  REJECTED: [],
};

export class InvalidClaimTransitionError extends Error {
  constructor(from: ClaimStatus, to: ClaimStatus) {
    super(`Invalid benefit claim transition: ${from} → ${to}`);
    this.name = 'InvalidClaimTransitionError';
  }
}

export class ApprovedExceedsClaimError extends Error {
  constructor(approved: number, claim: number) {
    super(`Approved amount ${approved} cannot exceed claim amount ${claim}.`);
    this.name = 'ApprovedExceedsClaimError';
  }
}

export class BenefitsClaimService extends BaseService {
  constructor() {
    super('BenefitsClaimService');
  }

  canTransition(from: ClaimStatus, to: ClaimStatus): boolean {
    return (STATUS_TRANSITIONS[from] ?? []).includes(to);
  }

  assertTransition(from: ClaimStatus, to: ClaimStatus): void {
    if (!this.canTransition(from, to)) throw new InvalidClaimTransitionError(from, to);
  }

  /**
   * Pure: employee responsibility = deductible + coinsurance + copay.
   * Used by the EOB ("explanation of benefits") summary line.
   */
  computeEmployeeResponsibility(deductible: number, coinsurance: number, copay: number): number {
    return Math.round((deductible + coinsurance + copay) * 100) / 100;
  }

  /**
   * Pure: net payable = approvedAmount − employeeResponsibility, clamped ≥ 0.
   */
  computeNetPayable(approvedAmount: number, employeeResponsibility: number): number {
    return Math.max(0, Math.round((approvedAmount - employeeResponsibility) * 100) / 100);
  }

  async submit(input: {
    tenantId: string;
    claimNumber: string;
    enrollmentId: string;
    employeeId: string;
    employeeName: string;
    planId?: string;
    planName?: string;
    claimType: BenefitCategory;
    claimDate: Date;
    serviceDate: Date;
    providerId?: string;
    providerName?: string;
    claimAmount: number;
    documents?: Record<string, unknown>;
    diagnosisCodes?: string[];
    procedureCodes?: string[];
    notes?: string;
  }) {
    return prisma.benefitClaim.create({
      data: {
        tenantId: input.tenantId,
        claimNumber: input.claimNumber,
        enrollmentId: input.enrollmentId,
        employeeId: input.employeeId,
        employeeName: input.employeeName,
        planId: input.planId ?? null,
        planName: input.planName ?? null,
        claimType: input.claimType as never,
        claimDate: input.claimDate,
        serviceDate: input.serviceDate,
        providerId: input.providerId ?? null,
        providerName: input.providerName ?? null,
        claimAmount: input.claimAmount,
        status: 'SUBMITTED',
        submittedDate: new Date(),
        documents: (input.documents ?? null) as never,
        diagnosisCodes: (input.diagnosisCodes ?? null) as never,
        procedureCodes: (input.procedureCodes ?? null) as never,
        notes: input.notes ?? null,
      },
    });
  }

  async startReview(id: string, tenantId: string, reviewerId: string) {
    const existing = await this.assertExists(id, tenantId);
    if (!existing) return null;
    this.assertTransition(existing.status as ClaimStatus, 'UNDER_REVIEW');
    return prisma.benefitClaim.update({
      where: { id },
      data: { status: 'UNDER_REVIEW', reviewedBy: reviewerId, reviewedDate: new Date() },
    });
  }

  async requestInfo(id: string, tenantId: string, reviewerId: string, note: string) {
    if (!note || note.trim().length < 5) {
      throw new Error('Info-request note ≥ 5 chars required.');
    }
    const existing = await this.assertExists(id, tenantId);
    if (!existing) return null;
    this.assertTransition(existing.status as ClaimStatus, 'PENDING_INFO');
    return prisma.benefitClaim.update({
      where: { id },
      data: {
        status: 'PENDING_INFO',
        reviewedBy: reviewerId,
        notes: `${existing.notes ?? ''}\nInfo requested: ${note}`.trim(),
      },
    });
  }

  async approve(
    id: string,
    tenantId: string,
    approverId: string,
    input: {
      approvedAmount: number;
      deductibleApplied?: number;
      coinsuranceApplied?: number;
      copayApplied?: number;
    }
  ) {
    const existing = await this.assertExists(id, tenantId);
    if (!existing) return null;
    if (input.approvedAmount > Number(existing.claimAmount)) {
      throw new ApprovedExceedsClaimError(input.approvedAmount, Number(existing.claimAmount));
    }
    const partial = input.approvedAmount < Number(existing.claimAmount);
    const target: ClaimStatus = partial ? 'PARTIALLY_APPROVED' : 'APPROVED';
    this.assertTransition(existing.status as ClaimStatus, target);
    const employeeResponsibility = this.computeEmployeeResponsibility(
      input.deductibleApplied ?? 0,
      input.coinsuranceApplied ?? 0,
      input.copayApplied ?? 0
    );
    return prisma.benefitClaim.update({
      where: { id },
      data: {
        status: target,
        approvedAmount: input.approvedAmount,
        approvedBy: approverId,
        approvedDate: new Date(),
        deductibleApplied: input.deductibleApplied ?? null,
        coinsuranceApplied: input.coinsuranceApplied ?? null,
        copayApplied: input.copayApplied ?? null,
        employeeResponsibility,
      },
    });
  }

  async markPaid(
    id: string,
    tenantId: string,
    actorId: string,
    input: { paymentMethod: string; checkNumber?: string }
  ) {
    const existing = await this.assertExists(id, tenantId);
    if (!existing) return null;
    this.assertTransition(existing.status as ClaimStatus, 'PAID');
    const paidAmount = this.computeNetPayable(
      Number(existing.approvedAmount ?? 0),
      Number(existing.employeeResponsibility ?? 0)
    );
    return prisma.benefitClaim.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAmount,
        paidDate: new Date(),
        paymentMethod: input.paymentMethod,
        checkNumber: input.checkNumber ?? null,
        notes: `${existing.notes ?? ''}\nPaid by ${actorId}`.trim(),
      },
    });
  }

  async reject(id: string, tenantId: string, reviewerId: string, reason: string) {
    if (!reason || reason.trim().length < 5) {
      throw new Error('Rejection reason ≥ 5 chars required.');
    }
    const existing = await this.assertExists(id, tenantId);
    if (!existing) return null;
    this.assertTransition(existing.status as ClaimStatus, 'REJECTED');
    return prisma.benefitClaim.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        reviewedBy: reviewerId,
      },
    });
  }

  async list(params: {
    tenantId: string;
    employeeId?: string;
    status?: ClaimStatus;
    claimType?: BenefitCategory;
    fromDate?: Date;
    toDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 50, 200);
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { tenantId: params.tenantId };
    if (params.employeeId) where.employeeId = params.employeeId;
    if (params.status) where.status = params.status;
    if (params.claimType) where.claimType = params.claimType;
    if (params.fromDate || params.toDate) {
      const claimDate: Record<string, Date> = {};
      if (params.fromDate) claimDate.gte = params.fromDate;
      if (params.toDate) claimDate.lte = params.toDate;
      where.claimDate = claimDate;
    }
    const [items, total] = await Promise.all([
      prisma.benefitClaim.findMany({
        where,
        orderBy: { claimDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.benefitClaim.count({ where }),
    ]);
    return { items, total, page, pageSize: limit, hasNextPage: skip + items.length < total };
  }

  private async assertExists(id: string, tenantId: string) {
    return prisma.benefitClaim.findFirst({ where: { id, tenantId } });
  }
}

export const benefitsClaimService = new BenefitsClaimService();
