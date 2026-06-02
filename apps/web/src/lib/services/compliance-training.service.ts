import { prisma } from '@aura/database';
import { BaseService } from './base.service';

export type ComplianceCategory = 'SOX' | 'HIPAA' | 'OSHA' | 'GDPR' | 'PDPL' | 'CODE_OF_CONDUCT';

export type EnrollmentStatus =
  | 'ENROLLED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'DROPPED'
  | 'EXPIRED';

export interface AssignParams {
  tenantId: string;
  courseId: string;
  employeeIds: string[];
  dueDate?: Date;
  assignedBy: string;
}

const STATUS_TRANSITIONS: Record<EnrollmentStatus, EnrollmentStatus[]> = {
  ENROLLED: ['IN_PROGRESS', 'DROPPED', 'OVERDUE'],
  IN_PROGRESS: ['COMPLETED', 'DROPPED', 'OVERDUE'],
  COMPLETED: ['EXPIRED'],
  OVERDUE: ['IN_PROGRESS', 'COMPLETED', 'DROPPED'],
  DROPPED: [],
  EXPIRED: ['ENROLLED'],
};

export class InvalidEnrollmentTransitionError extends Error {
  constructor(from: EnrollmentStatus, to: EnrollmentStatus) {
    super(`Invalid enrollment transition: ${from} → ${to}`);
    this.name = 'InvalidEnrollmentTransitionError';
  }
}

export class ComplianceTrainingService extends BaseService {
  constructor() {
    super('ComplianceTrainingService');
  }

  async listMandatoryCourses(params: {
    tenantId: string;
    complianceCategory?: ComplianceCategory;
  }) {
    return prisma.course.findMany({
      where: {
        tenantId: params.tenantId,
        isMandatory: true,
        complianceCategory: params.complianceCategory ?? undefined,
        status: 'published',
      },
      orderBy: { title: 'asc' },
    });
  }

  /**
   * Bulk-assign a mandatory course to a set of employees. Idempotent — already
   * enrolled employees are skipped via the unique (courseId, employeeId).
   */
  async assignMandatoryCourse(input: AssignParams) {
    const course = await prisma.course.findFirst({
      where: { id: input.courseId, tenantId: input.tenantId },
    });
    if (!course) return { created: 0, skipped: 0, error: 'Course not found' };

    let created = 0;
    let skipped = 0;
    for (const employeeId of input.employeeIds) {
      const existing = await prisma.courseEnrollment.findUnique({
        where: { courseId_employeeId: { courseId: input.courseId, employeeId } },
      });
      if (existing) {
        skipped += 1;
        continue;
      }
      await prisma.courseEnrollment.create({
        data: {
          courseId: input.courseId,
          employeeId,
          tenantId: input.tenantId,
          status: 'ENROLLED',
          isMandatory: true,
          dueDate: input.dueDate ?? null,
          assignedBy: input.assignedBy,
          assignedAt: new Date(),
        },
      });
      created += 1;
    }
    return { created, skipped };
  }

  async listAssignments(params: {
    tenantId: string;
    employeeId?: string;
    status?: EnrollmentStatus | 'PENDING';
    complianceCategory?: ComplianceCategory;
    dueBefore?: Date;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 50, 200);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      tenantId: params.tenantId,
      isMandatory: true,
    };
    if (params.employeeId) where.employeeId = params.employeeId;
    if (params.status === 'PENDING') {
      where.status = { notIn: ['COMPLETED', 'DROPPED', 'EXPIRED'] };
    } else if (params.status) {
      where.status = params.status;
    }
    if (params.dueBefore) where.dueDate = { lte: params.dueBefore };
    if (params.complianceCategory) {
      where.course = { complianceCategory: params.complianceCategory };
    }

    const [items, total] = await Promise.all([
      prisma.courseEnrollment.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ dueDate: 'asc' }, { enrolledAt: 'desc' }],
        include: {
          course: {
            select: {
              id: true,
              title: true,
              category: true,
              level: true,
              durationHours: true,
              description: true,
              thumbnailUrl: true,
              isMandatory: true,
              complianceCategory: true,
              certificationValidMonths: true,
            },
          },
        },
      }),
      prisma.courseEnrollment.count({ where }),
    ]);

    const now = new Date();
    const enriched = items.map((e) => ({
      ...e,
      isOverdue: e.dueDate ? e.dueDate < now && e.status !== 'COMPLETED' : false,
      daysUntilDue: e.dueDate
        ? Math.ceil((e.dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
        : null,
    }));

    return {
      items: enriched,
      total,
      page,
      pageSize: limit,
      hasNextPage: skip + items.length < total,
      summary: {
        total,
        completed: enriched.filter((e) => e.status === 'COMPLETED').length,
        pending: enriched.filter((e) => !['COMPLETED', 'EXPIRED'].includes(e.status)).length,
        overdue: enriched.filter((e) => e.isOverdue).length,
      },
    };
  }

  /**
   * Record completion. Sets completedAt and (when the course has a
   * certification validity window) sets expiresAt so the recurrence job can
   * re-trigger before the certificate lapses.
   */
  async recordCompletion(input: {
    tenantId: string;
    enrollmentId: string;
    actorId: string;
    score?: number;
    certificateId?: string;
  }) {
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: { id: input.enrollmentId, tenantId: input.tenantId },
      include: { course: { select: { certificationValidMonths: true } } },
    });
    if (!enrollment) return null;
    if (!STATUS_TRANSITIONS[enrollment.status as EnrollmentStatus]?.includes('COMPLETED')) {
      throw new InvalidEnrollmentTransitionError(
        enrollment.status as EnrollmentStatus,
        'COMPLETED'
      );
    }
    const completedAt = new Date();
    const validMonths = enrollment.course?.certificationValidMonths ?? null;
    const expiresAt = validMonths
      ? new Date(completedAt.getTime() + validMonths * 30 * 24 * 60 * 60 * 1000)
      : null;
    return prisma.courseEnrollment.update({
      where: { id: input.enrollmentId },
      data: {
        status: 'COMPLETED',
        progress: 100,
        completedAt,
        expiresAt,
        score: input.score ?? undefined,
        certificateId: input.certificateId ?? undefined,
      },
    });
  }

  /**
   * Mark a completed enrollment EXPIRED when its cert validity has lapsed.
   * Intended for the nightly recurrence job.
   */
  async expireLapsedCertifications(tenantId: string) {
    const now = new Date();
    const lapsed = await prisma.courseEnrollment.findMany({
      where: {
        tenantId,
        status: 'COMPLETED',
        expiresAt: { lte: now },
      },
      select: { id: true },
    });
    if (lapsed.length === 0) return { expired: 0 };
    const result = await prisma.courseEnrollment.updateMany({
      where: { id: { in: lapsed.map((x) => x.id) } },
      data: { status: 'EXPIRED' },
    });
    return { expired: result.count };
  }
}

export const complianceTrainingService = new ComplianceTrainingService();
