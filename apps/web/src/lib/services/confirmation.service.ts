import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export const createConfirmationSchema = z.object({
  tenantId: z.string(),
  employeeId: z.string(),
  eligibleDate: z.string().or(z.date()),
  requestedDate: z.string().or(z.date()),
  newSalary: z.number().optional(),
});

export const updateConfirmationSchema = createConfirmationSchema.partial().omit({ tenantId: true });

export class ConfirmationService {
  static async findAll(filter: any) {
    const { tenantId, status, search, page = 1, limit = 20, sortBy = 'eligibleDate', sortOrder = 'asc' } = filter;

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
      prisma.confirmationRequest.findMany({
        where,
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
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.confirmationRequest.count({ where }),
    ]);

    return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async findById(id: string, tenantId: string) {
    return prisma.confirmationRequest.findFirst({
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
            joiningDate: true,
            department: { select: { name: true } },
            location: { select: { name: true } },
            jobProfile: { select: { title: true } },
          },
        },
      },
    });
  }

  static async create(data: z.infer<typeof createConfirmationSchema>) {
    const validated = createConfirmationSchema.parse(data);
    return prisma.confirmationRequest.create({
      data: {
        ...validated,
        eligibleDate: new Date(validated.eligibleDate),
        requestedDate: new Date(validated.requestedDate),
      },
      include: {
        employee: { select: { id: true, employeeCode: true, firstName: true, lastName: true } },
      },
    });
  }

  static async update(id: string, tenantId: string, data: z.infer<typeof updateConfirmationSchema>) {
    const validated = updateConfirmationSchema.parse(data);
    const existing = await prisma.confirmationRequest.findFirst({ where: { id, tenantId } });
    if (!existing) return null;

    const updateData: any = { ...validated };
    if (validated.eligibleDate) updateData.eligibleDate = new Date(validated.eligibleDate);
    if (validated.requestedDate) updateData.requestedDate = new Date(validated.requestedDate);

    return prisma.confirmationRequest.update({ where: { id }, data: updateData });
  }

  static async delete(id: string, tenantId: string) {
    const existing = await prisma.confirmationRequest.findFirst({ where: { id, tenantId } });
    if (!existing) return null;
    return prisma.confirmationRequest.delete({ where: { id } });
  }

  static async managerApprove(id: string, tenantId: string) {
    const confirmation = await prisma.confirmationRequest.findFirst({ where: { id, tenantId } });
    if (!confirmation) throw new Error('Confirmation request not found');
    if (confirmation.status !== 'PENDING') throw new Error('Only pending requests can be approved');

    return prisma.confirmationRequest.update({
      where: { id },
      data: { managerApproval: 'APPROVED' },
    });
  }

  static async hrApprove(id: string, tenantId: string) {
    const confirmation = await prisma.confirmationRequest.findFirst({ where: { id, tenantId } });
    if (!confirmation) throw new Error('Confirmation request not found');
    if (confirmation.managerApproval !== 'APPROVED') throw new Error('Manager approval required first');

    return prisma.confirmationRequest.update({
      where: { id },
      data: {
        hrApproval: 'APPROVED',
        status: 'APPROVED',
      },
    });
  }

  static async confirm(id: string, tenantId: string, letterUrl?: string) {
    const confirmation = await prisma.confirmationRequest.findFirst({ where: { id, tenantId } });
    if (!confirmation) throw new Error('Confirmation request not found');
    if (confirmation.status !== 'APPROVED') throw new Error('Request must be approved first');

    return prisma.confirmationRequest.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        confirmationDate: new Date(),
        confirmationLetterUrl: letterUrl,
      },
    });
  }

  static async reject(id: string, tenantId: string, rejectedBy: 'MANAGER' | 'HR') {
    const confirmation = await prisma.confirmationRequest.findFirst({ where: { id, tenantId } });
    if (!confirmation) throw new Error('Confirmation request not found');

    const updateData: any = { status: 'REJECTED' };
    if (rejectedBy === 'MANAGER') {
      updateData.managerApproval = 'REJECTED';
    } else {
      updateData.hrApproval = 'REJECTED';
    }

    return prisma.confirmationRequest.update({ where: { id }, data: updateData });
  }

  static async getStatistics(tenantId: string) {
    const [total, pending, approved, confirmed, byStatus] = await Promise.all([
      prisma.confirmationRequest.count({ where: { tenantId } }),
      prisma.confirmationRequest.count({ where: { tenantId, status: 'PENDING' } }),
      prisma.confirmationRequest.count({ where: { tenantId, status: 'APPROVED' } }),
      prisma.confirmationRequest.count({ where: { tenantId, status: 'CONFIRMED' } }),
      prisma.confirmationRequest.groupBy({ by: ['status'], where: { tenantId }, _count: true }),
    ]);

    return {
      total,
      pending,
      approved,
      confirmed,
      byStatus: byStatus.map(s => ({ status: s.status, count: s._count })),
    };
  }
}
