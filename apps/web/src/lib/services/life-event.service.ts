import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation Schemas
export const createLifeEventSchema = z.object({
  tenantId: z.string(),
  employeeId: z.string(),
  eventType: z.string(),
  eventDate: z.string().or(z.date()),
  title: z.string().min(1),
  description: z.string().optional(),
  relatedPersonName: z.string().optional(),
  relatedPersonRelation: z.string().optional(),
  documentUrl: z.string().optional(),
  documentType: z.string().optional(),
  impactsPayroll: z.boolean().optional(),
  impactsBenefits: z.boolean().optional(),
  impactsTax: z.boolean().optional(),
  impactsEmergencyContact: z.boolean().optional(),
  notifyHR: z.boolean().optional(),
  notifyManager: z.boolean().optional(),
  notes: z.string().optional(),
  attachments: z.any().optional(),
  createdBy: z.string().optional(),
});

export const updateLifeEventSchema = createLifeEventSchema.partial().omit({ tenantId: true });

export interface LifeEventFilter {
  tenantId: string;
  employeeId?: string;
  eventType?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class LifeEventService {
  static async findAll(filter: LifeEventFilter) {
    const {
      tenantId,
      employeeId,
      eventType,
      status,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20,
      sortBy = 'eventDate',
      sortOrder = 'desc',
    } = filter;

    const where: any = { tenantId };

    if (employeeId) where.employeeId = employeeId;
    if (eventType) where.eventType = eventType;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.eventDate = {};
      if (startDate) where.eventDate.gte = startDate;
      if (endDate) where.eventDate.lte = endDate;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { relatedPersonName: { contains: search, mode: 'insensitive' } },
        { employee: { firstName: { contains: search, mode: 'insensitive' } } },
        { employee: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.employeeLifeEvent.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              employeeCode: true,
              firstName: true,
              lastName: true,
              email: true,
              department: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.employeeLifeEvent.count({ where }),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async findById(id: string, tenantId: string) {
    return prisma.employeeLifeEvent.findFirst({
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
            department: { select: { id: true, name: true } },
            location: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  static async getEmployeeEvents(employeeId: string, tenantId: string) {
    return prisma.employeeLifeEvent.findMany({
      where: { employeeId, tenantId },
      orderBy: { eventDate: 'desc' },
    });
  }

  static async create(data: z.infer<typeof createLifeEventSchema>) {
    const validated = createLifeEventSchema.parse(data);

    return prisma.employeeLifeEvent.create({
      data: {
        ...validated,
        eventDate: new Date(validated.eventDate),
        attachments: validated.attachments || [],
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  static async update(id: string, tenantId: string, data: z.infer<typeof updateLifeEventSchema>) {
    const validated = updateLifeEventSchema.parse(data);

    const existingEvent = await prisma.employeeLifeEvent.findFirst({
      where: { id, tenantId },
    });

    if (!existingEvent) {
      return null;
    }

    const updateData: any = { ...validated };
    if (validated.eventDate) {
      updateData.eventDate = new Date(validated.eventDate);
    }

    return prisma.employeeLifeEvent.update({
      where: { id },
      data: updateData,
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  static async delete(id: string, tenantId: string) {
    const existingEvent = await prisma.employeeLifeEvent.findFirst({
      where: { id, tenantId },
    });

    if (!existingEvent) {
      return null;
    }

    return prisma.employeeLifeEvent.delete({
      where: { id },
    });
  }

  static async verify(id: string, tenantId: string, verifiedBy: string) {
    const existingEvent = await prisma.employeeLifeEvent.findFirst({
      where: { id, tenantId },
    });

    if (!existingEvent) {
      throw new Error('Life event not found');
    }

    if (existingEvent.status !== 'PENDING') {
      throw new Error('Only pending events can be verified');
    }

    return prisma.employeeLifeEvent.update({
      where: { id },
      data: {
        verified: true,
        verifiedBy,
        verifiedAt: new Date(),
        status: 'VERIFIED',
      },
    });
  }

  static async process(id: string, tenantId: string, processedBy: string) {
    const existingEvent = await prisma.employeeLifeEvent.findFirst({
      where: { id, tenantId },
    });

    if (!existingEvent) {
      throw new Error('Life event not found');
    }

    if (existingEvent.status !== 'VERIFIED') {
      throw new Error('Only verified events can be processed');
    }

    return prisma.employeeLifeEvent.update({
      where: { id },
      data: {
        status: 'PROCESSED',
        processedBy,
        processedAt: new Date(),
      },
    });
  }

  static async reject(id: string, tenantId: string, rejectedBy: string, reason?: string) {
    const existingEvent = await prisma.employeeLifeEvent.findFirst({
      where: { id, tenantId },
    });

    if (!existingEvent) {
      throw new Error('Life event not found');
    }

    return prisma.employeeLifeEvent.update({
      where: { id },
      data: {
        status: 'REJECTED',
        processedBy: rejectedBy,
        processedAt: new Date(),
        notes: reason ? `${existingEvent.notes || ''}\nRejected: ${reason}` : existingEvent.notes,
      },
    });
  }

  static async getStatistics(tenantId: string, startDate?: Date, endDate?: Date) {
    const where: any = { tenantId };
    if (startDate || endDate) {
      where.eventDate = {};
      if (startDate) where.eventDate.gte = startDate;
      if (endDate) where.eventDate.lte = endDate;
    }

    const [total, byType, byStatus, pending, verified, processed] = await Promise.all([
      prisma.employeeLifeEvent.count({ where }),
      prisma.employeeLifeEvent.groupBy({
        by: ['eventType'],
        where,
        _count: true,
      }),
      prisma.employeeLifeEvent.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      prisma.employeeLifeEvent.count({ where: { ...where, status: 'PENDING' } }),
      prisma.employeeLifeEvent.count({ where: { ...where, status: 'VERIFIED' } }),
      prisma.employeeLifeEvent.count({ where: { ...where, status: 'PROCESSED' } }),
    ]);

    return {
      total,
      byType: byType.map((item) => ({ eventType: item.eventType, count: item._count })),
      byStatus: byStatus.map((item) => ({ status: item.status, count: item._count })),
      pending,
      verified,
      processed,
    };
  }

  static async getUpcomingEvents(tenantId: string, days: number = 30) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return prisma.employeeLifeEvent.findMany({
      where: {
        tenantId,
        eventDate: {
          gte: today,
          lte: futureDate,
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { eventDate: 'asc' },
    });
  }
}
