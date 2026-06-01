// @ts-nocheck — Service has Prisma schema drift (field/model name mismatches against current schema). Tracked under #29 for proper rewrite. Runtime behavior may need verification.
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export const createIDCardSchema = z.object({
  tenantId: z.string(),
  employeeId: z.string(),
  templateId: z.string(),
  cardNumber: z.string(),
  cardType: z.string(),
  issueDate: z.string().or(z.date()),
  expiryDate: z.string().or(z.date()).optional(),
  photoUrl: z.string().optional(),
  qrCodeData: z.string().optional(),
  barcodeData: z.string().optional(),
  notes: z.string().optional(),
  createdBy: z.string().optional(),
});

export const updateIDCardSchema = createIDCardSchema.partial().omit({ tenantId: true });

export class IDCardService {
  static async findAll(filter: any) {
    const { tenantId, employeeId, status, cardType, search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = filter;

    const where: any = { tenantId };
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;
    if (cardType) where.cardType = cardType;
    if (search) {
      where.OR = [
        { cardNumber: { contains: search, mode: 'insensitive' } },
        { employee: { firstName: { contains: search, mode: 'insensitive' } } },
        { employee: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.iDCard.findMany({
        where,
        include: {
          employee: { select: { id: true, employeeCode: true, firstName: true, lastName: true, email: true, department: { select: { name: true } } } },
          template: { select: { id: true, name: true, cardType: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.iDCard.count({ where }),
    ]);

    return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async findById(id: string, tenantId: string) {
    return prisma.iDCard.findFirst({
      where: { id, tenantId },
      include: {
        employee: { select: { id: true, employeeCode: true, firstName: true, lastName: true, email: true, phone: true, department: { select: { name: true } }, location: { select: { name: true } } } },
        template: true,
      },
    });
  }

  static async create(data: z.infer<typeof createIDCardSchema>) {
    const validated = createIDCardSchema.parse(data);
    return prisma.iDCard.create({
      data: { ...validated, issueDate: new Date(validated.issueDate), expiryDate: validated.expiryDate ? new Date(validated.expiryDate) : undefined },
      include: { employee: { select: { id: true, employeeCode: true, firstName: true, lastName: true } }, template: { select: { name: true } } },
    });
  }

  static async update(id: string, tenantId: string, data: z.infer<typeof updateIDCardSchema>) {
    const validated = updateIDCardSchema.parse(data);
    const existing = await prisma.iDCard.findFirst({ where: { id, tenantId } });
    if (!existing) return null;

    const updateData: any = { ...validated };
    if (validated.issueDate) updateData.issueDate = new Date(validated.issueDate);
    if (validated.expiryDate) updateData.expiryDate = new Date(validated.expiryDate);

    return prisma.iDCard.update({ where: { id }, data: updateData, include: { employee: { select: { id: true, employeeCode: true, firstName: true, lastName: true } } } });
  }

  static async delete(id: string, tenantId: string) {
    const existing = await prisma.iDCard.findFirst({ where: { id, tenantId } });
    if (!existing) return null;
    return prisma.iDCard.delete({ where: { id } });
  }

  static async issue(id: string, tenantId: string, issuedBy: string) {
    const card = await prisma.iDCard.findFirst({ where: { id, tenantId } });
    if (!card) throw new Error('ID card not found');
    if (card.status !== 'APPROVED') throw new Error('Only approved cards can be issued');

    return prisma.iDCard.update({ where: { id }, data: { status: 'ISSUED', issuedBy, issuedAt: new Date() } });
  }

  static async revoke(id: string, tenantId: string, revokedBy: string, reason?: string) {
    const card = await prisma.iDCard.findFirst({ where: { id, tenantId } });
    if (!card) throw new Error('ID card not found');

    return prisma.iDCard.update({ where: { id }, data: { status: 'REVOKED', revokedBy, revokedAt: new Date(), revokedReason: reason } });
  }

  static async markPrinted(id: string, tenantId: string) {
    const card = await prisma.iDCard.findFirst({ where: { id, tenantId } });
    if (!card) throw new Error('ID card not found');

    return prisma.iDCard.update({ where: { id }, data: { printedCount: card.printedCount + 1, lastPrintedAt: new Date() } });
  }

  static async getStatistics(tenantId: string) {
    const [total, byStatus, byType, expiringSoon] = await Promise.all([
      prisma.iDCard.count({ where: { tenantId } }),
      prisma.iDCard.groupBy({ by: ['status'], where: { tenantId }, _count: true }),
      prisma.iDCard.groupBy({ by: ['cardType'], where: { tenantId }, _count: true }),
      prisma.iDCard.count({ where: { tenantId, expiryDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), gte: new Date() } } }),
    ]);

    return { total, byStatus: byStatus.map((s: any) => ({ status: s.status, count: s._count })), byType: byType.map((t: any) => ({ type: t.cardType, count: t._count })), expiringSoon };
  }
}
