import { prisma } from '@aura/database';
import { BaseService } from './base.service';

export type CobraEnrollmentStatus =
  | 'PENDING_ELECTION'
  | 'ELECTED'
  | 'ACTIVE'
  | 'TERMINATED_NONPAYMENT'
  | 'EXPIRED'
  | 'DECLINED'
  | 'CANCELED';

export type QualifyingEventType =
  | 'TERMINATION'
  | 'REDUCED_HOURS'
  | 'DIVORCE'
  | 'DEPENDENT_LOSS'
  | 'DEATH'
  | 'MEDICARE_ELIGIBILITY';

const ENROLLMENT_TRANSITIONS: Record<CobraEnrollmentStatus, CobraEnrollmentStatus[]> = {
  PENDING_ELECTION: ['ELECTED', 'DECLINED', 'EXPIRED', 'CANCELED'],
  ELECTED: ['ACTIVE', 'CANCELED'],
  ACTIVE: ['TERMINATED_NONPAYMENT', 'EXPIRED', 'CANCELED'],
  TERMINATED_NONPAYMENT: [],
  EXPIRED: [],
  DECLINED: [],
  CANCELED: [],
};

export class InvalidCobraTransitionError extends Error {
  constructor(from: CobraEnrollmentStatus, to: CobraEnrollmentStatus) {
    super(`Invalid COBRA enrollment transition: ${from} → ${to}`);
    this.name = 'InvalidCobraTransitionError';
  }
}

export class ElectionWindowExpiredError extends Error {
  constructor(deadline: Date) {
    super(`Election deadline expired on ${deadline.toISOString().split('T')[0]}`);
    this.name = 'ElectionWindowExpiredError';
  }
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const ELECTION_WINDOW_DAYS = 60;
// Federal default: 18 months. Secondary qualifying events that follow a
// termination get 36 months total — handled per-event.
const COVERAGE_MONTHS_BY_EVENT: Record<QualifyingEventType, number> = {
  TERMINATION: 18,
  REDUCED_HOURS: 18,
  DIVORCE: 36,
  DEPENDENT_LOSS: 36,
  DEATH: 36,
  MEDICARE_ELIGIBILITY: 36,
};

export class CobraService extends BaseService {
  constructor() {
    super('CobraService');
  }

  canTransition(from: CobraEnrollmentStatus, to: CobraEnrollmentStatus): boolean {
    return (ENROLLMENT_TRANSITIONS[from] ?? []).includes(to);
  }

  assertTransition(from: CobraEnrollmentStatus, to: CobraEnrollmentStatus): void {
    if (!this.canTransition(from, to)) throw new InvalidCobraTransitionError(from, to);
  }

  /**
   * Compute the deadlines and coverage cap for a qualifying event. Pure.
   */
  computeDeadlines(eventType: QualifyingEventType, qualifyingDate: Date) {
    const electionDeadline = new Date(qualifyingDate.getTime() + ELECTION_WINDOW_DAYS * MS_PER_DAY);
    const months = COVERAGE_MONTHS_BY_EVENT[eventType];
    const maxCoverageEndDate = new Date(qualifyingDate.getTime() + months * 30 * MS_PER_DAY);
    return { electionDeadline, maxCoverageEndDate, coverageMonths: months };
  }

  /**
   * COBRA premium = full plan premium (employee + employer) + 2% admin fee.
   */
  computeCobraPremium(employeePremium: number, employerPremium: number): number {
    return Math.round((employeePremium + employerPremium) * 1.02 * 100) / 100;
  }

  async createQualifyingEvent(input: {
    tenantId: string;
    employeeId: string;
    eventType: QualifyingEventType;
    qualifyingDate: Date;
    exitRequestId?: string;
    notes?: string;
    actorId: string;
  }) {
    const { electionDeadline, maxCoverageEndDate } = this.computeDeadlines(
      input.eventType,
      input.qualifyingDate
    );
    return prisma.cobraQualifyingEvent.create({
      data: {
        tenantId: input.tenantId,
        employeeId: input.employeeId,
        exitRequestId: input.exitRequestId ?? null,
        eventType: input.eventType,
        qualifyingDate: input.qualifyingDate,
        electionDeadline,
        maxCoverageEndDate,
        notes: input.notes ?? null,
        createdBy: input.actorId,
      },
    });
  }

  async recordNoticeIssued(
    eventId: string,
    tenantId: string,
    actorId: string,
    noticeReference: string
  ) {
    if (!noticeReference || noticeReference.trim().length < 3) {
      throw new Error('A real notice reference is required (no placeholders).');
    }
    const event = await prisma.cobraQualifyingEvent.findFirst({
      where: { id: eventId, tenantId, isDeleted: false },
    });
    if (!event) return null;
    return prisma.cobraQualifyingEvent.update({
      where: { id: eventId },
      data: { noticeIssuedAt: new Date(), noticeReference, updatedBy: actorId },
    });
  }

  /**
   * Open a PENDING_ELECTION enrollment row for a qualifying event + plan pair.
   * Premium auto-computed with the 2% admin uplift.
   */
  async openEnrollment(input: {
    tenantId: string;
    qualifyingEventId: string;
    benefitPlanId: string;
    actorId: string;
  }) {
    const event = await prisma.cobraQualifyingEvent.findFirst({
      where: { id: input.qualifyingEventId, tenantId: input.tenantId, isDeleted: false },
    });
    if (!event) return null;
    const plan = await prisma.benefitPlan.findFirst({
      where: { id: input.benefitPlanId, tenantId: input.tenantId, isDeleted: false },
    });
    if (!plan) return null;
    const premium = this.computeCobraPremium(plan.employeePremium, plan.employerPremium);
    return prisma.cobraEnrollment.create({
      data: {
        tenantId: input.tenantId,
        qualifyingEventId: input.qualifyingEventId,
        employeeId: event.employeeId,
        benefitPlanId: input.benefitPlanId,
        monthlyPremium: premium,
        status: 'PENDING_ELECTION',
        createdBy: input.actorId,
      },
    });
  }

  async elect(enrollmentId: string, tenantId: string, actorId: string, coverageStart: Date) {
    const enrollment = await prisma.cobraEnrollment.findFirst({
      where: { id: enrollmentId, tenantId },
      include: { qualifyingEvent: true },
    });
    if (!enrollment) return null;
    this.assertTransition(enrollment.status as CobraEnrollmentStatus, 'ELECTED');
    if (new Date() > enrollment.qualifyingEvent.electionDeadline) {
      throw new ElectionWindowExpiredError(enrollment.qualifyingEvent.electionDeadline);
    }
    return prisma.cobraEnrollment.update({
      where: { id: enrollmentId },
      data: {
        status: 'ELECTED',
        electedAt: new Date(),
        coverageStart,
        coverageEnd: enrollment.qualifyingEvent.maxCoverageEndDate,
        updatedBy: actorId,
      },
    });
  }

  async decline(enrollmentId: string, tenantId: string, actorId: string, reason?: string) {
    const enrollment = await prisma.cobraEnrollment.findFirst({
      where: { id: enrollmentId, tenantId },
    });
    if (!enrollment) return null;
    this.assertTransition(enrollment.status as CobraEnrollmentStatus, 'DECLINED');
    return prisma.cobraEnrollment.update({
      where: { id: enrollmentId },
      data: { status: 'DECLINED', declineReason: reason ?? null, updatedBy: actorId },
    });
  }

  async activate(enrollmentId: string, tenantId: string, actorId: string) {
    const enrollment = await prisma.cobraEnrollment.findFirst({
      where: { id: enrollmentId, tenantId },
    });
    if (!enrollment) return null;
    this.assertTransition(enrollment.status as CobraEnrollmentStatus, 'ACTIVE');
    return prisma.cobraEnrollment.update({
      where: { id: enrollmentId },
      data: { status: 'ACTIVE', updatedBy: actorId },
    });
  }

  /**
   * Record a monthly premium payment. Extends premiumsPaidThrough by 1 month.
   * Does not change status (status updates happen via activate / terminate flows).
   */
  async recordPremiumPayment(
    enrollmentId: string,
    tenantId: string,
    actorId: string,
    amount: number,
    paidThrough: Date
  ) {
    const enrollment = await prisma.cobraEnrollment.findFirst({
      where: { id: enrollmentId, tenantId },
    });
    if (!enrollment) return null;
    if (!['ELECTED', 'ACTIVE'].includes(enrollment.status)) {
      throw new InvalidCobraTransitionError(
        enrollment.status as CobraEnrollmentStatus,
        enrollment.status as CobraEnrollmentStatus
      );
    }
    return prisma.cobraEnrollment.update({
      where: { id: enrollmentId },
      data: {
        totalPremiumsPaid: { increment: amount },
        premiumsPaidThrough: paidThrough,
        // If we were ELECTED, first payment activates coverage.
        status: enrollment.status === 'ELECTED' ? 'ACTIVE' : enrollment.status,
        updatedBy: actorId,
      },
    });
  }

  async terminateNonpayment(enrollmentId: string, tenantId: string, actorId: string) {
    const enrollment = await prisma.cobraEnrollment.findFirst({
      where: { id: enrollmentId, tenantId },
    });
    if (!enrollment) return null;
    this.assertTransition(enrollment.status as CobraEnrollmentStatus, 'TERMINATED_NONPAYMENT');
    return prisma.cobraEnrollment.update({
      where: { id: enrollmentId },
      data: {
        status: 'TERMINATED_NONPAYMENT',
        coverageEnd: new Date(),
        terminationReason: 'Non-payment of premium past grace period',
        updatedBy: actorId,
      },
    });
  }

  /**
   * Job helper: mark enrollments EXPIRED when coverageEnd has passed.
   */
  async expireLapsed(tenantId: string) {
    const now = new Date();
    const lapsed = await prisma.cobraEnrollment.findMany({
      where: {
        tenantId,
        status: { in: ['ELECTED', 'ACTIVE'] },
        coverageEnd: { lte: now },
      },
      select: { id: true },
    });
    if (lapsed.length === 0) return { expired: 0 };
    const result = await prisma.cobraEnrollment.updateMany({
      where: { id: { in: lapsed.map((x) => x.id) } },
      data: { status: 'EXPIRED' },
    });
    return { expired: result.count };
  }
}

export const cobraService = new CobraService();
