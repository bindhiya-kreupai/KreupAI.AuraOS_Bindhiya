import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export const createExitSchema = z.object({
  tenantId: z.string(),
  employeeId: z.string(),
  exitType: z.string(),
  resignationDate: z.string().or(z.date()),
  lastWorkingDate: z.string().or(z.date()),
  noticePeriodDays: z.number(),
  reason: z.string().optional(),
});

export const updateExitSchema = createExitSchema.partial().omit({ tenantId: true });

export class ExitService {
  static async findAll(filter: any) {
    const { tenantId, status, exitType, search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = filter;

    const where: any = { tenantId };
    if (status) where.status = status;
    if (exitType) where.exitType = exitType;
    if (search) {
      where.OR = [
        { employee: { firstName: { contains: search, mode: 'insensitive' } } },
        { employee: { lastName: { contains: search, mode: 'insensitive' } } },
        { employee: { employeeCode: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.exitRequest.findMany({
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
          clearances: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.exitRequest.count({ where }),
    ]);

    return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async findById(id: string, tenantId: string) {
    return prisma.exitRequest.findFirst({
      where: { id, tenantId },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            department: { select: { name: true } },
            location: { select: { name: true } },
          },
        },
        clearances: true,
      },
    });
  }

  static async create(data: z.infer<typeof createExitSchema>) {
    const validated = createExitSchema.parse(data);
    return prisma.exitRequest.create({
      data: {
        ...validated,
        resignationDate: new Date(validated.resignationDate),
        lastWorkingDate: new Date(validated.lastWorkingDate),
      },
      include: {
        employee: { select: { id: true, employeeCode: true, firstName: true, lastName: true } },
      },
    });
  }

  static async update(id: string, tenantId: string, data: z.infer<typeof updateExitSchema>) {
    const validated = updateExitSchema.parse(data);
    const existing = await prisma.exitRequest.findFirst({ where: { id, tenantId } });
    if (!existing) return null;

    const updateData: any = { ...validated };
    if (validated.resignationDate) updateData.resignationDate = new Date(validated.resignationDate);
    if (validated.lastWorkingDate) updateData.lastWorkingDate = new Date(validated.lastWorkingDate);

    return prisma.exitRequest.update({ where: { id }, data: updateData });
  }

  static async delete(id: string, tenantId: string) {
    const existing = await prisma.exitRequest.findFirst({ where: { id, tenantId } });
    if (!existing) return null;
    return prisma.exitRequest.delete({ where: { id } });
  }

  static async approve(id: string, tenantId: string) {
    const exit = await prisma.exitRequest.findFirst({ where: { id, tenantId } });
    if (!exit) throw new Error('Exit request not found');
    if (exit.status !== 'PENDING') throw new Error('Only pending exits can be approved');

    return prisma.exitRequest.update({
      where: { id },
      data: { status: 'APPROVED' },
    });
  }

  static async complete(id: string, tenantId: string) {
    const exit = await prisma.exitRequest.findFirst({ where: { id, tenantId } });
    if (!exit) throw new Error('Exit request not found');
    if (exit.clearanceStatus !== 'COMPLETED') throw new Error('All clearances must be completed first');

    return prisma.exitRequest.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });
  }

  static async addClearance(exitRequestId: string, data: any) {
    return prisma.exitClearance.create({
      data: {
        exitRequestId,
        ...data,
      },
    });
  }

  static async completeClearance(clearanceId: string, clearedBy: string) {
    return prisma.exitClearance.update({
      where: { id: clearanceId },
      data: {
        status: 'APPROVED',
        clearedBy,
        clearedAt: new Date(),
      },
    });
  }

  static async getStatistics(tenantId: string) {
    const [total, byType, byStatus, pending, thisMonth] = await Promise.all([
      prisma.exitRequest.count({ where: { tenantId } }),
      prisma.exitRequest.groupBy({ by: ['exitType'], where: { tenantId }, _count: true }),
      prisma.exitRequest.groupBy({ by: ['status'], where: { tenantId }, _count: true }),
      prisma.exitRequest.count({ where: { tenantId, status: 'PENDING' } }),
      prisma.exitRequest.count({
        where: {
          tenantId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    return {
      total,
      byType: byType.map((t: any) => ({ type: t.exitType, count: t._count })),
      byStatus: byStatus.map((s: any) => ({ status: s.status, count: s._count })),
      pending,
      thisMonth,
    };
  }
}
