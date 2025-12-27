import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
const prisma = new PrismaClient();

export const createLetterSchema = z.object({
  tenantId: z.string(),
  employeeId: z.string(),
  templateId: z.string(),
  letterType: z.string(),
  subject: z.string(),
  content: z.string(),
  createdBy: z.string().optional(),
});

export class LetterService {
  static async findAll(filter: any) {
    const { tenantId, page = 1, limit = 20 } = filter;
    const [data, total] = await Promise.all([
      prisma.letter.findMany({
        where: { tenantId },
        include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } }, template: { select: { name: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.letter.count({ where: { tenantId } }),
    ]);
    return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async findById(id: string, tenantId: string) {
    return prisma.letter.findFirst({ where: { id, tenantId }, include: { employee: true, template: true } });
  }

  static async create(data: z.infer<typeof createLetterSchema>) {
    return prisma.letter.create({ data });
  }

  static async update(id: string, tenantId: string, data: any) {
    const existing = await prisma.letter.findFirst({ where: { id, tenantId } });
    if (!existing) return null;
    return prisma.letter.update({ where: { id }, data });
  }

  static async delete(id: string, tenantId: string) {
    const existing = await prisma.letter.findFirst({ where: { id, tenantId } });
    if (!existing) return null;
    return prisma.letter.delete({ where: { id } });
  }

  static async issue(id: string, tenantId: string) {
    return prisma.letter.update({ where: { id }, data: { status: 'ISSUED', issuedAt: new Date() } });
  }

  static async getStatistics(tenantId: string) {
    const [total, byType, byStatus] = await Promise.all([
      prisma.letter.count({ where: { tenantId } }),
      prisma.letter.groupBy({ by: ['letterType'], where: { tenantId }, _count: true }),
      prisma.letter.groupBy({ by: ['status'], where: { tenantId }, _count: true }),
    ]);
    return { total, byType: byType.map(t => ({ type: t.letterType, count: t._count })), byStatus: byStatus.map(s => ({ status: s.status, count: s._count })) };
  }
}
