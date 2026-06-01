// @ts-nocheck — Stub service with schema drift; not wired to any API route. Tracked under #29 for rewrite.
/**
 * Life Event Service
 * Manages employee life event reporting and processing
 *
 * Features:
 * - Life event reporting (marriage, birth, death, etc.)
 * - Impact assessment (payroll, benefits, tax, emergency contacts)
 * - Verification workflow
 * - Event history tracking
 */

import { BaseService } from './base.service';

// ============================================================================
// TYPES
// ============================================================================

export interface LifeEvent {
  id: string;
  tenantId: string;
  employeeId: string;
  eventType: LifeEventType;
  eventDate: Date;
  title: string;
  description?: string;
  relatedPersonName?: string;
  relatedPersonRelation?: string;
  documentUrl?: string;
  documentType?: string;
  status: LifeEventStatus;
  impactsPayroll: boolean;
  impactsBenefits: boolean;
  impactsTax: boolean;
  impactsEmergencyContact: boolean;
  notifyHR: boolean;
  notifyManager: boolean;
  notes?: string;
  attachments: string[];
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  processedBy?: string;
  processedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type LifeEventType =
  | 'MARRIAGE'
  | 'DIVORCE'
  | 'BIRTH'
  | 'ADOPTION'
  | 'DEATH_OF_DEPENDENT'
  | 'RELOCATION'
  | 'NAME_CHANGE'
  | 'DISABILITY'
  | 'RETIREMENT'
  | 'MILITARY_SERVICE'
  | 'LEGAL_GUARDIANSHIP'
  | 'OTHER';

export type LifeEventStatus = 'PENDING' | 'VERIFIED' | 'PROCESSED' | 'REJECTED';

export interface LifeEventFilter {
  tenantId: string;
  employeeId?: string;
  eventType?: LifeEventType;
  status?: LifeEventStatus;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// LIFE EVENT SERVICE
// ============================================================================

export class LifeEventService extends BaseService {
  constructor() {
    super('LifeEventService');
  }

  /**
   * List life events with filtering and pagination
   */
  async listEvents(filter: LifeEventFilter): Promise<{
    data: LifeEvent[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
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
      ];
    }

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      this.prisma.employeeLifeEvent.findMany({
        where,
        include: {
          employee: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.employeeLifeEvent.count({ where }),
    ]);

    return {
      data: events as unknown as LifeEvent[],
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get life event by ID
   */
  async getEventById(id: string, tenantId: string): Promise<LifeEvent | null> {
    const event = await this.prisma.employeeLifeEvent.findFirst({
      where: { id, tenantId },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
      },
    });
    return event as unknown as LifeEvent | null;
  }

  /**
   * Report a new life event
   */
  async reportEvent(data: {
    tenantId: string;
    employeeId: string;
    eventType: LifeEventType;
    eventDate: Date;
    title: string;
    description?: string;
    relatedPersonName?: string;
    relatedPersonRelation?: string;
    documentUrl?: string;
    documentType?: string;
    impactsPayroll?: boolean;
    impactsBenefits?: boolean;
    impactsTax?: boolean;
    impactsEmergencyContact?: boolean;
    notifyHR?: boolean;
    notifyManager?: boolean;
    notes?: string;
    attachments?: string[];
    createdBy: string;
  }): Promise<LifeEvent> {
    const event = await this.prisma.employeeLifeEvent.create({
      data: {
        tenantId: data.tenantId,
        employeeId: data.employeeId,
        eventType: data.eventType,
        eventDate: data.eventDate,
        title: data.title,
        description: data.description || null,
        relatedPersonName: data.relatedPersonName || null,
        relatedPersonRelation: data.relatedPersonRelation || null,
        documentUrl: data.documentUrl || null,
        documentType: data.documentType || null,
        status: 'PENDING',
        impactsPayroll: data.impactsPayroll ?? false,
        impactsBenefits: data.impactsBenefits ?? false,
        impactsTax: data.impactsTax ?? false,
        impactsEmergencyContact: data.impactsEmergencyContact ?? false,
        notifyHR: data.notifyHR ?? true,
        notifyManager: data.notifyManager ?? false,
        notes: data.notes || null,
        attachments: data.attachments || [],
        verified: false,
        createdBy: data.createdBy,
      },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    await this.createAuditLog({
      userId: data.createdBy,
      action: 'CREATE',
      module: 'LifeEvents',
      details: `Reported life event: ${data.title} (${data.eventType})`,
    });

    this.logger.info('Life event reported', {
      eventId: event.id,
      employeeId: data.employeeId,
      eventType: data.eventType,
    });

    return event as unknown as LifeEvent;
  }

  /**
   * Verify a life event
   */
  async verifyEvent(id: string, tenantId: string, verifiedBy: string): Promise<LifeEvent> {
    const event = await this.prisma.employeeLifeEvent.findFirst({
      where: { id, tenantId },
    });

    if (!event) throw new Error('Life event not found');
    if (event.status !== 'PENDING') throw new Error('Only pending events can be verified');

    const updated = await this.prisma.employeeLifeEvent.update({
      where: { id },
      data: {
        status: 'VERIFIED',
        verified: true,
        verifiedBy,
        verifiedAt: new Date(),
      },
    });

    await this.createAuditLog({
      userId: verifiedBy,
      action: 'UPDATE',
      module: 'LifeEvents',
      details: `Verified life event: ${event.title}`,
    });

    return updated as unknown as LifeEvent;
  }

  /**
   * Process a verified life event
   */
  async processEvent(id: string, tenantId: string, processedBy: string): Promise<LifeEvent> {
    const event = await this.prisma.employeeLifeEvent.findFirst({
      where: { id, tenantId },
    });

    if (!event) throw new Error('Life event not found');
    if (event.status !== 'VERIFIED') throw new Error('Only verified events can be processed');

    const updated = await this.prisma.employeeLifeEvent.update({
      where: { id },
      data: {
        status: 'PROCESSED',
        processedBy,
        processedAt: new Date(),
      },
    });

    await this.createAuditLog({
      userId: processedBy,
      action: 'UPDATE',
      module: 'LifeEvents',
      details: `Processed life event: ${event.title}`,
    });

    return updated as unknown as LifeEvent;
  }

  /**
   * Reject a life event
   */
  async rejectEvent(id: string, tenantId: string, rejectedBy: string, reason?: string): Promise<LifeEvent> {
    const event = await this.prisma.employeeLifeEvent.findFirst({
      where: { id, tenantId },
    });

    if (!event) throw new Error('Life event not found');

    const updated = await this.prisma.employeeLifeEvent.update({
      where: { id },
      data: {
        status: 'REJECTED',
        processedBy: rejectedBy,
        processedAt: new Date(),
        notes: reason ? `${event.notes || ''}\nRejection reason: ${reason}`.trim() : event.notes,
      },
    });

    await this.createAuditLog({
      userId: rejectedBy,
      action: 'UPDATE',
      module: 'LifeEvents',
      details: `Rejected life event: ${event.title}${reason ? ` (${reason})` : ''}`,
    });

    return updated as unknown as LifeEvent;
  }

  /**
   * Get life event statistics
   */
  async getStatistics(tenantId: string, startDate?: Date, endDate?: Date): Promise<{
    total: number;
    pending: number;
    verified: number;
    processed: number;
    rejected: number;
    byType: Array<{ eventType: string; count: number }>;
  }> {
    const where: any = { tenantId };
    if (startDate || endDate) {
      where.eventDate = {};
      if (startDate) where.eventDate.gte = startDate;
      if (endDate) where.eventDate.lte = endDate;
    }

    const [total, pending, verified, processed, rejected, byType] = await Promise.all([
      this.prisma.employeeLifeEvent.count({ where }),
      this.prisma.employeeLifeEvent.count({ where: { ...where, status: 'PENDING' } }),
      this.prisma.employeeLifeEvent.count({ where: { ...where, status: 'VERIFIED' } }),
      this.prisma.employeeLifeEvent.count({ where: { ...where, status: 'PROCESSED' } }),
      this.prisma.employeeLifeEvent.count({ where: { ...where, status: 'REJECTED' } }),
      this.prisma.employeeLifeEvent.groupBy({
        by: ['eventType'],
        where,
        _count: true,
      }),
    ]);

    return {
      total,
      pending,
      verified,
      processed,
      rejected,
      byType: byType.map((item: any) => ({ eventType: item.eventType, count: item._count })),
    };
  }
}

export const lifeEventService = new LifeEventService();
