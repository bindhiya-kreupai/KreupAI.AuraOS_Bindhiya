// @ts-nocheck-removed 2026-06-17: validated against ProbationTracking model in schema. Original tracker #29.
import { prisma } from '@aura/database';
import { z } from 'zod';

export const createProbationSchema = z.object({
  tenantId: z.string(),
  employeeId: z.string(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  performanceRating: z.string().optional(),
  managerRecommendation: z.string().optional(),
});

export const updateProbationSchema = createProbationSchema.partial().omit({ tenantId: true });

export class ProbationService {
  static async findAll(filter: any) {
    const {
      tenantId,
      status,
      search,
      page = 1,
      limit = 20,
      sortBy = 'endDate',
      sortOrder = 'asc',
    } = filter;

    const where: any = { tenantId };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { employee: { firstName: { contains: search, mode: 'insensitive' } } },
        { employee: { lastName: { contains: search, mode: 'insensitive' } } },
        { employee: { employeeCode: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.probationTracking.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              employeeCode: true,
              firstName: true,
              lastName: true,
              email: true,
              department: { select: { name: true } },
            },
          },
          reviews: {
            orderBy: { reviewDate: 'desc' },
            take: 1,
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.probationTracking.count({ where }),
    ]);

    return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async findById(id: string, tenantId: string) {
    return prisma.probationTracking.findFirst({
      where: { id, tenantId },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            joiningDate: true,
            department: { select: { name: true } },
            location: { select: { name: true } },
          },
        },
        reviews: {
          orderBy: { reviewDate: 'desc' },
        },
      },
    });
  }

  static async create(data: z.infer<typeof createProbationSchema>) {
    const validated = createProbationSchema.parse(data);
    return prisma.probationTracking.create({
      data: {
        ...validated,
        startDate: new Date(validated.startDate),
        endDate: new Date(validated.endDate),
      },
      include: {
        employee: { select: { id: true, employeeCode: true, firstName: true, lastName: true } },
      },
    });
  }

  static async update(id: string, tenantId: string, data: z.infer<typeof updateProbationSchema>) {
    const validated = updateProbationSchema.parse(data);
    const existing = await prisma.probationTracking.findFirst({ where: { id, tenantId } });
    if (!existing) return null;

    const updateData: any = { ...validated };
    if (validated.startDate) updateData.startDate = new Date(validated.startDate);
    if (validated.endDate) updateData.endDate = new Date(validated.endDate);

    return prisma.probationTracking.update({ where: { id }, data: updateData });
  }

  static async delete(id: string, tenantId: string) {
    const existing = await prisma.probationTracking.findFirst({ where: { id, tenantId } });
    if (!existing) return null;
    return prisma.probationTracking.delete({ where: { id } });
  }

  static async extend(id: string, tenantId: string, newEndDate: Date, reason?: string) {
    const probation = await prisma.probationTracking.findFirst({ where: { id, tenantId } });
    if (!probation) throw new Error('Probation not found');
    if (probation.status !== 'ACTIVE') throw new Error('Only active probations can be extended');

    return prisma.probationTracking.update({
      where: { id },
      data: {
        status: 'EXTENDED',
        extendedEndDate: newEndDate,
      },
    });
  }

  static async confirm(id: string, tenantId: string, hrRecommendation?: string) {
    const probation = await prisma.probationTracking.findFirst({ where: { id, tenantId } });
    if (!probation) throw new Error('Probation not found');
    if (probation.status === 'CONFIRMED') throw new Error('Already confirmed');

    return prisma.probationTracking.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        finalDecision: 'CONFIRM',
        hrRecommendation,
      },
    });
  }

  static async terminate(id: string, tenantId: string, reason: string) {
    const probation = await prisma.probationTracking.findFirst({ where: { id, tenantId } });
    if (!probation) throw new Error('Probation not found');

    return prisma.probationTracking.update({
      where: { id },
      data: {
        status: 'TERMINATED',
        finalDecision: 'TERMINATE',
        hrRecommendation: reason,
      },
    });
  }

  static async addReview(probationId: string, data: any) {
    return prisma.probationReview.create({
      data: {
        probationId,
        ...data,
        reviewDate: data.reviewDate ? new Date(data.reviewDate) : new Date(),
      },
    });
  }

  static async getStatistics(tenantId: string) {
    const today = new Date();
    const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [total, active, ending, byStatus] = await Promise.all([
      prisma.probationTracking.count({ where: { tenantId } }),
      prisma.probationTracking.count({ where: { tenantId, status: 'ACTIVE' } }),
      prisma.probationTracking.count({
        where: {
          tenantId,
          status: 'ACTIVE',
          endDate: {
            gte: today,
            lte: next30Days,
          },
        },
      }),
      prisma.probationTracking.groupBy({ by: ['status'], where: { tenantId }, _count: true }),
    ]);

    return {
      total,
      active,
      ending,
      byStatus: byStatus.map((s: any) => ({ status: s.status, count: s._count })),
    };
  }
}
