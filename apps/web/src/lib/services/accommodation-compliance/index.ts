/**
 * EPIC-23: Accommodation & Labour Camp Compliance.
 *
 * Site master tracks accommodation facilities (DORMITORY / HOTEL /
 * APARTMENT / LABOUR_CAMP / VILLA) with capacity, occupancy, manager,
 * contractor, female-only / family-allowed flags, and inspection
 * scheduling. Assignment register tracks per-employee check-in/out with
 * room/bed and monthly allowance. Inspection register holds scheduled
 * audits across categories (HYGIENE / FIRE_SAFETY / ELECTRICAL /
 * KITCHEN / MEDICAL / WELFARE / SECURITY) with severity-banded
 * findings. Complaint register manages site issues with SLA. Monthly
 * certificate refuses to sign while sites are over capacity, critical
 * findings remain open, complaints breach SLA, or inspections are
 * overdue.
 */

import { prisma } from '@aura/database';
import {
  normalisePaging,
  prismaPageArgs,
  prismaOrderBy,
  buildPaginatedResult,
  type PaginationInput,
  type PaginatedResult,
} from '@/lib/services/pagination';
import { isComplaintSlaBreached } from './utils';

export interface AuthContext {
  tenantId: string;
  userId: string;
}

export type SiteType =
  'DORMITORY' | 'HOTEL' | 'APARTMENT' | 'LABOUR_CAMP' | 'VILLA' | 'STAFF_HOUSING';

export type InspectionCategory =
  | 'HYGIENE'
  | 'FIRE_SAFETY'
  | 'ELECTRICAL'
  | 'KITCHEN'
  | 'MEDICAL'
  | 'WELFARE'
  | 'SECURITY'
  | 'GENERAL';

export type ComplaintCategory =
  | 'HYGIENE'
  | 'MAINTENANCE'
  | 'OVERCROWDING'
  | 'KITCHEN'
  | 'TRANSPORT'
  | 'SECURITY'
  | 'NOISE'
  | 'BEHAVIOUR'
  | 'OTHER';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SiteFilter {
  country?: string;
  siteType?: string;
  status?: string;
  search?: string;
  isDeleted?: boolean;
}

export interface AssignmentFilter {
  siteId?: string;
  employeeId?: string;
  status?: string;
  search?: string;
  checkInStart?: string;
  checkInEnd?: string;
  checkOutStart?: string;
  checkOutEnd?: string;
  isDeleted?: boolean;
}

export interface InspectionFilter {
  siteId?: string;
  status?: string;
  category?: string;
  search?: string;
  inspectionDateStart?: string;
  inspectionDateEnd?: string;
  isDeleted?: boolean;
}

export interface ComplaintFilter {
  siteId?: string;
  status?: string;
  severity?: string;
  category?: string;
  assigneeId?: string;
  employeeId?: string;
  search?: string;
  raisedAtStart?: string;
  raisedAtEnd?: string;
  isDeleted?: boolean;
}

export interface CertificateFilter {
  status?: string;
  period?: string;
  isDeleted?: boolean;
}

// Helpers for safe Prisma queries
const db = prisma as any;

export class AccommodationSiteService {
  async get(id: string, auth: AuthContext) {
    const site = await db.accommodationSite.findUnique({ where: { id } });
    if (!site || site.tenantId !== auth.tenantId) throw new Error('Site not found');
    return site;
  }

  async upsert(
    input: {
      id?: string;
      name: string;
      siteType: SiteType;
      country: string;
      address?: string;
      totalCapacity: number;
      managerId?: string;
      contractorId?: string;
      femaleOnly?: boolean;
      familyAllowed?: boolean;
      nextInspectionAt?: Date;
      status?: string;
    },
    auth: AuthContext
  ) {
    const { id, action, tenantId, ...rest } = input as any;
    const baseData = {
      tenantId: auth.tenantId,
      ...rest,
      status: input.status ?? 'ACTIVE',
      updatedBy: auth.userId,
    };

    if (id) {
      const existing = await this.get(id, auth);
      return db.accommodationSite.update({
        where: { id },
        data: baseData,
      });
    }

    return db.accommodationSite.create({
      data: {
        ...baseData,
        createdBy: auth.userId,
      },
    });
  }

  async archive(id: string, auth: AuthContext) {
    await this.get(id, auth);
    return db.accommodationSite.update({
      where: { id },
      data: { status: 'ARCHIVED', updatedBy: auth.userId },
    });
  }

  async restore(id: string, auth: AuthContext) {
    await this.get(id, auth);
    return db.accommodationSite.update({
      where: { id },
      data: { status: 'ACTIVE', isDeleted: false, deletedAt: null, updatedBy: auth.userId },
    });
  }

  async softDelete(id: string, auth: AuthContext) {
    await this.get(id, auth);
    return db.accommodationSite.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: auth.userId },
    });
  }

  async hardDelete(id: string, auth: AuthContext) {
    await this.get(id, auth);
    return db.accommodationSite.delete({ where: { id } });
  }

  async bulkArchive(ids: string[], auth: AuthContext) {
    return db.accommodationSite.updateMany({
      where: { id: { in: ids }, tenantId: auth.tenantId },
      data: { status: 'ARCHIVED', updatedBy: auth.userId },
    });
  }

  async bulkRestore(ids: string[], auth: AuthContext) {
    return db.accommodationSite.updateMany({
      where: { id: { in: ids }, tenantId: auth.tenantId },
      data: { status: 'ACTIVE', isDeleted: false, deletedAt: null, updatedBy: auth.userId },
    });
  }

  async bulkDelete(ids: string[], auth: AuthContext) {
    return db.accommodationSite.updateMany({
      where: { id: { in: ids }, tenantId: auth.tenantId },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: auth.userId },
    });
  }

  async list(
    tenantId: string,
    filter: SiteFilter = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where: any = {
      tenantId,
      ...(filter.country ? { country: filter.country } : {}),
      ...(filter.siteType ? { siteType: filter.siteType } : {}),
    };

    const conditions: any[] = [];

    if (filter.isDeleted) {
      conditions.push({
        OR: [{ isDeleted: true }, { status: 'ARCHIVED' }],
      });
    } else {
      conditions.push({ isDeleted: false });
      if (filter.status) {
        conditions.push({ status: filter.status });
      }
    }

    if (filter.search) {
      conditions.push({
        OR: [
          { name: { contains: filter.search, mode: 'insensitive' } },
          { country: { contains: filter.search, mode: 'insensitive' } },
          { address: { contains: filter.search, mode: 'insensitive' } },
          { managerId: { contains: filter.search, mode: 'insensitive' } },
          { contractorId: { contains: filter.search, mode: 'insensitive' } },
        ],
      });
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      db.accommodationSite.findMany({
        where,
        orderBy: prismaOrderBy(page) ?? { name: 'asc' },
        ...prismaPageArgs(page),
      }),
      db.accommodationSite.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
}

export const accommodationSiteService = new AccommodationSiteService();

export class AccommodationAssignmentService {
  async get(id: string, auth: AuthContext) {
    const assignment = await db.accommodationAssignment.findUnique({ where: { id } });
    if (!assignment || assignment.tenantId !== auth.tenantId)
      throw new Error('Assignment not found');
    return assignment;
  }

  async assign(
    input: {
      siteId: string;
      employeeId: string;
      roomNumber?: string;
      bedNumber?: string;
      checkInAt: Date;
      monthlyAllowance?: number;
      currency?: string;
      status?: string;
    },
    auth: AuthContext
  ) {
    const site = await db.accommodationSite.findUnique({
      where: { id: input.siteId },
    });
    if (!site || site.tenantId !== auth.tenantId) throw new Error('Site not found');
    if (site.currentOccupancy >= site.totalCapacity) throw new Error('Site is at capacity');

    return prisma.$transaction(async (tx: any) => {
      const { action, tenantId, ...rest } = input as any;
      const assignment = await tx.accommodationAssignment.create({
        data: {
          tenantId: auth.tenantId,
          ...rest,
          currency: input.currency ?? 'AED',
          status: input.status ?? 'ACTIVE',
          createdBy: auth.userId,
          updatedBy: auth.userId,
        },
      });

      await tx.accommodationSite.update({
        where: { id: input.siteId },
        data: { currentOccupancy: { increment: 1 } },
      });

      return assignment;
    });
  }

  async update(
    id: string,
    input: {
      roomNumber?: string;
      bedNumber?: string;
      monthlyAllowance?: number;
      currency?: string;
      checkInAt?: Date;
      status?: string;
    },
    auth: AuthContext
  ) {
    await this.get(id, auth);
    const { id: inputId, action, tenantId, ...rest } = input as any;
    return db.accommodationAssignment.update({
      where: { id },
      data: {
        ...rest,
        updatedBy: auth.userId,
      },
    });
  }

  async checkOut(id: string, checkOutAt: Date, auth: AuthContext) {
    const a = await this.get(id, auth);
    if (a.status !== 'ACTIVE') throw new Error('Assignment not active');

    return prisma.$transaction(async (tx: any) => {
      const updated = await tx.accommodationAssignment.update({
        where: { id },
        data: { status: 'CHECKED_OUT', checkOutAt, updatedBy: auth.userId },
      });

      await tx.accommodationSite.update({
        where: { id: a.siteId },
        data: { currentOccupancy: { decrement: 1 } },
      });

      return updated;
    });
  }

  async archive(id: string, auth: AuthContext) {
    await this.get(id, auth);
    return db.accommodationAssignment.update({
      where: { id },
      data: { status: 'ARCHIVED', updatedBy: auth.userId },
    });
  }

  async restore(id: string, auth: AuthContext) {
    await this.get(id, auth);
    return db.accommodationAssignment.update({
      where: { id },
      data: { status: 'ACTIVE', isDeleted: false, deletedAt: null, updatedBy: auth.userId },
    });
  }

  async softDelete(id: string, auth: AuthContext) {
    const a = await this.get(id, auth);
    return prisma.$transaction(async (tx: any) => {
      const updated = await tx.accommodationAssignment.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date(), updatedBy: auth.userId },
      });

      if (a.status === 'ACTIVE') {
        await tx.accommodationSite.update({
          where: { id: a.siteId },
          data: { currentOccupancy: { decrement: 1 } },
        });
      }

      return updated;
    });
  }

  async hardDelete(id: string, auth: AuthContext) {
    const a = await this.get(id, auth);
    return prisma.$transaction(async (tx: any) => {
      if (a.status === 'ACTIVE') {
        await tx.accommodationSite.update({
          where: { id: a.siteId },
          data: { currentOccupancy: { decrement: 1 } },
        });
      }
      return tx.accommodationAssignment.delete({ where: { id } });
    });
  }

  async bulkArchive(ids: string[], auth: AuthContext) {
    return db.accommodationAssignment.updateMany({
      where: { id: { in: ids }, tenantId: auth.tenantId },
      data: { status: 'ARCHIVED', updatedBy: auth.userId },
    });
  }

  async bulkRestore(ids: string[], auth: AuthContext) {
    return db.accommodationAssignment.updateMany({
      where: { id: { in: ids }, tenantId: auth.tenantId },
      data: { status: 'ACTIVE', isDeleted: false, deletedAt: null, updatedBy: auth.userId },
    });
  }

  async bulkDelete(ids: string[], auth: AuthContext) {
    const assignments = await db.accommodationAssignment.findMany({
      where: { id: { in: ids }, tenantId: auth.tenantId, isDeleted: false },
    });

    return prisma.$transaction(async (tx: any) => {
      for (const a of assignments) {
        if (a.status === 'ACTIVE') {
          await tx.accommodationSite.update({
            where: { id: a.siteId },
            data: { currentOccupancy: { decrement: 1 } },
          });
        }
      }
      return tx.accommodationAssignment.updateMany({
        where: { id: { in: ids }, tenantId: auth.tenantId },
        data: { isDeleted: true, deletedAt: new Date(), updatedBy: auth.userId },
      });
    });
  }

  async list(
    tenantId: string,
    filter: AssignmentFilter = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where: any = {
      tenantId,
      ...(filter.siteId ? { siteId: filter.siteId } : {}),
      ...(filter.employeeId ? { employeeId: filter.employeeId } : {}),
    };

    const dateFilters: any = {};
    if (filter.checkInStart) dateFilters.gte = new Date(filter.checkInStart);
    if (filter.checkInEnd) dateFilters.lte = new Date(filter.checkInEnd);
    if (Object.keys(dateFilters).length) where.checkInAt = dateFilters;

    const outFilters: any = {};
    if (filter.checkOutStart) outFilters.gte = new Date(filter.checkOutStart);
    if (filter.checkOutEnd) outFilters.lte = new Date(filter.checkOutEnd);
    if (Object.keys(outFilters).length) where.checkOutAt = outFilters;

    const conditions: any[] = [];

    if (filter.isDeleted) {
      conditions.push({
        OR: [{ isDeleted: true }, { status: 'ARCHIVED' }],
      });
    } else {
      conditions.push({ isDeleted: false });
      if (filter.status) {
        conditions.push({ status: filter.status });
      }
    }

    if (filter.search) {
      conditions.push({
        OR: [
          { employeeId: { contains: filter.search, mode: 'insensitive' } },
          { roomNumber: { contains: filter.search, mode: 'insensitive' } },
          { bedNumber: { contains: filter.search, mode: 'insensitive' } },
        ],
      });
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      db.accommodationAssignment.findMany({
        where,
        orderBy: prismaOrderBy(page) ?? { checkInAt: 'desc' },
        ...prismaPageArgs(page),
      }),
      db.accommodationAssignment.count({ where }),
    ]);

    const siteIds = Array.from(new Set(items.map((i: any) => i.siteId)));
    const employeeIds = Array.from(new Set(items.map((i: any) => i.employeeId)));

    const [sites, employees] = await Promise.all([
      db.accommodationSite.findMany({
        where: { id: { in: siteIds } },
        select: { id: true, name: true },
      }),
      db.employee.findMany({
        where: { id: { in: employeeIds } },
        select: { id: true, firstName: true, lastName: true },
      }),
    ]);

    const siteMap = new Map(sites.map((s: any) => [s.id, s.name]));
    const employeeMap = new Map(employees.map((e: any) => [e.id, `${e.firstName} ${e.lastName}`]));

    const mappedItems = items.map((item: any) => ({
      ...item,
      siteName: siteMap.get(item.siteId) ?? 'Unknown Site',
      employeeName: employeeMap.get(item.employeeId) ?? item.employeeId,
    }));

    return buildPaginatedResult(mappedItems, total, page);
  }
}

export const accommodationAssignmentService = new AccommodationAssignmentService();

export class AccommodationInspectionService {
  async get(id: string, auth: AuthContext) {
    const inspection = await db.accommodationInspection.findUnique({ where: { id } });
    if (!inspection || inspection.tenantId !== auth.tenantId)
      throw new Error('Inspection not found');
    return inspection;
  }

  async record(
    input: {
      siteId: string;
      inspectionDate: Date;
      inspectorId?: string;
      category: InspectionCategory;
      score: number;
      criticalFindings?: number;
      majorFindings?: number;
      minorFindings?: number;
      findings?: Array<Record<string, unknown>>;
      status?: string;
    },
    auth: AuthContext
  ) {
    const baseData = {
      tenantId: auth.tenantId,
      siteId: input.siteId,
      inspectionDate: input.inspectionDate,
      inspectorId: input.inspectorId,
      category: input.category,
      score: input.score,
      criticalFindings: input.criticalFindings ?? 0,
      majorFindings: input.majorFindings ?? 0,
      minorFindings: input.minorFindings ?? 0,
      findingsJson: input.findings ?? [],
      status: input.status ?? ((input.criticalFindings ?? 0) === 0 ? 'CLOSED' : 'OPEN'),
      closedAt: (input.criticalFindings ?? 0) === 0 ? new Date() : null,
      createdBy: auth.userId,
      updatedBy: auth.userId,
    };

    const nextInspection = new Date(input.inspectionDate);
    nextInspection.setMonth(nextInspection.getMonth() + 3);

    return prisma.$transaction(async (tx: any) => {
      const inspection = await tx.accommodationInspection.create({
        data: baseData,
      });

      await tx.accommodationSite.update({
        where: { id: input.siteId },
        data: {
          lastInspectionAt: input.inspectionDate,
          nextInspectionAt: nextInspection,
          updatedBy: auth.userId,
        },
      });

      return inspection;
    });
  }

  async update(
    id: string,
    input: {
      inspectionDate?: Date;
      inspectorId?: string;
      category?: InspectionCategory;
      score?: number;
      criticalFindings?: number;
      majorFindings?: number;
      minorFindings?: number;
      findings?: Array<Record<string, unknown>>;
      status?: string;
    },
    auth: AuthContext
  ) {
    await this.get(id, auth);
    const { id: inputId, action, tenantId, findings, ...rest } = input as any;
    const data: any = {
      ...rest,
      findingsJson: findings,
      updatedBy: auth.userId,
    };
    if (input.status === 'CLOSED') {
      data.closedAt = new Date();
    } else if (input.status === 'OPEN') {
      data.closedAt = null;
    }
    return db.accommodationInspection.update({
      where: { id },
      data,
    });
  }

  async close(id: string, auth: AuthContext) {
    await this.get(id, auth);
    return db.accommodationInspection.update({
      where: { id },
      data: { status: 'CLOSED', closedAt: new Date(), updatedBy: auth.userId },
    });
  }

  async archive(id: string, auth: AuthContext) {
    await this.get(id, auth);
    return db.accommodationInspection.update({
      where: { id },
      data: { status: 'ARCHIVED', updatedBy: auth.userId },
    });
  }

  async restore(id: string, auth: AuthContext) {
    await this.get(id, auth);
    return db.accommodationInspection.update({
      where: { id },
      data: { status: 'OPEN', isDeleted: false, deletedAt: null, updatedBy: auth.userId },
    });
  }

  async softDelete(id: string, auth: AuthContext) {
    await this.get(id, auth);
    return db.accommodationInspection.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: auth.userId },
    });
  }

  async hardDelete(id: string, auth: AuthContext) {
    await this.get(id, auth);
    return db.accommodationInspection.delete({ where: { id } });
  }

  async bulkArchive(ids: string[], auth: AuthContext) {
    return db.accommodationInspection.updateMany({
      where: { id: { in: ids }, tenantId: auth.tenantId },
      data: { status: 'ARCHIVED', updatedBy: auth.userId },
    });
  }

  async bulkRestore(ids: string[], auth: AuthContext) {
    return db.accommodationInspection.updateMany({
      where: { id: { in: ids }, tenantId: auth.tenantId },
      data: { status: 'OPEN', isDeleted: false, deletedAt: null, updatedBy: auth.userId },
    });
  }

  async bulkDelete(ids: string[], auth: AuthContext) {
    return db.accommodationInspection.updateMany({
      where: { id: { in: ids }, tenantId: auth.tenantId },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: auth.userId },
    });
  }

  async list(
    tenantId: string,
    filter: InspectionFilter = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where: any = {
      tenantId,
      ...(filter.siteId ? { siteId: filter.siteId } : {}),
      ...(filter.category ? { category: filter.category } : {}),
    };

    const dateFilters: any = {};
    if (filter.inspectionDateStart) dateFilters.gte = new Date(filter.inspectionDateStart);
    if (filter.inspectionDateEnd) dateFilters.lte = new Date(filter.inspectionDateEnd);
    if (Object.keys(dateFilters).length) where.inspectionDate = dateFilters;

    const conditions: any[] = [];

    if (filter.isDeleted) {
      conditions.push({
        OR: [{ isDeleted: true }, { status: 'ARCHIVED' }],
      });
    } else {
      conditions.push({ isDeleted: false });
      if (filter.status) {
        conditions.push({ status: filter.status });
      }
    }

    if (filter.search) {
      conditions.push({
        OR: [
          { category: { contains: filter.search, mode: 'insensitive' } },
          { inspectorId: { contains: filter.search, mode: 'insensitive' } },
        ],
      });
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      db.accommodationInspection.findMany({
        where,
        orderBy: prismaOrderBy(page) ?? { inspectionDate: 'desc' },
        ...prismaPageArgs(page),
      }),
      db.accommodationInspection.count({ where }),
    ]);

    const siteIds = Array.from(new Set(items.map((i: any) => i.siteId)));
    const sites = await db.accommodationSite.findMany({
      where: { id: { in: siteIds } },
      select: { id: true, name: true },
    });

    const siteMap = new Map(sites.map((s: any) => [s.id, s.name]));

    const mappedItems = items.map((item: any) => ({
      ...item,
      siteName: siteMap.get(item.siteId) ?? 'Unknown Site',
    }));

    return buildPaginatedResult(mappedItems, total, page);
  }
}

export const accommodationInspectionService = new AccommodationInspectionService();

export class AccommodationComplaintService {
  async get(id: string, auth: AuthContext) {
    const complaint = await db.accommodationComplaint.findUnique({ where: { id } });
    if (!complaint || complaint.tenantId !== auth.tenantId) throw new Error('Complaint not found');
    return complaint;
  }

  async raise(
    input: {
      siteId: string;
      employeeId?: string;
      category: ComplaintCategory;
      severity?: Severity;
      subject: string;
      description?: string;
      slaHours?: number;
    },
    auth: AuthContext
  ) {
    const { action, tenantId, ...rest } = input as any;
    return db.accommodationComplaint.create({
      data: {
        tenantId: auth.tenantId,
        ...rest,
        severity: input.severity ?? 'MEDIUM',
        slaHours: input.slaHours ?? 48,
        raisedBy: auth.userId,
        status: 'OPEN',
        createdBy: auth.userId,
        updatedBy: auth.userId,
      },
    });
  }

  async update(
    id: string,
    input: {
      category?: ComplaintCategory;
      severity?: Severity;
      subject?: string;
      description?: string;
      slaHours?: number;
      status?: string;
      assigneeId?: string;
      resolutionNotes?: string;
    },
    auth: AuthContext
  ) {
    await this.get(id, auth);
    const { id: inputId, action, tenantId, ...rest } = input as any;
    const data: any = {
      ...rest,
      updatedBy: auth.userId,
    };
    if (input.status === 'RESOLVED') {
      data.resolvedAt = new Date();
      data.resolvedBy = auth.userId;
    }
    return db.accommodationComplaint.update({
      where: { id },
      data,
    });
  }

  async assign(id: string, assigneeId: string, auth: AuthContext) {
    await this.get(id, auth);
    return db.accommodationComplaint.update({
      where: { id },
      data: { assigneeId, status: 'IN_PROGRESS', updatedBy: auth.userId },
    });
  }

  async resolve(id: string, notes: string | undefined, auth: AuthContext) {
    await this.get(id, auth);
    return db.accommodationComplaint.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolvedBy: auth.userId,
        resolutionNotes: notes,
        updatedBy: auth.userId,
      },
    });
  }

  async archive(id: string, auth: AuthContext) {
    await this.get(id, auth);
    return db.accommodationComplaint.update({
      where: { id },
      data: { status: 'ARCHIVED', updatedBy: auth.userId },
    });
  }

  async restore(id: string, auth: AuthContext) {
    await this.get(id, auth);
    return db.accommodationComplaint.update({
      where: { id },
      data: { status: 'OPEN', isDeleted: false, deletedAt: null, updatedBy: auth.userId },
    });
  }

  async softDelete(id: string, auth: AuthContext) {
    await this.get(id, auth);
    return db.accommodationComplaint.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: auth.userId },
    });
  }

  async hardDelete(id: string, auth: AuthContext) {
    await this.get(id, auth);
    return db.accommodationComplaint.delete({ where: { id } });
  }

  async bulkArchive(ids: string[], auth: AuthContext) {
    return db.accommodationComplaint.updateMany({
      where: { id: { in: ids }, tenantId: auth.tenantId },
      data: { status: 'ARCHIVED', updatedBy: auth.userId },
    });
  }

  async bulkRestore(ids: string[], auth: AuthContext) {
    return db.accommodationComplaint.updateMany({
      where: { id: { in: ids }, tenantId: auth.tenantId },
      data: { status: 'OPEN', isDeleted: false, deletedAt: null, updatedBy: auth.userId },
    });
  }

  async bulkDelete(ids: string[], auth: AuthContext) {
    return db.accommodationComplaint.updateMany({
      where: { id: { in: ids }, tenantId: auth.tenantId },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: auth.userId },
    });
  }

  async list(
    tenantId: string,
    filter: ComplaintFilter = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where: any = {
      tenantId,
      ...(filter.siteId ? { siteId: filter.siteId } : {}),
      ...(filter.severity ? { severity: filter.severity } : {}),
      ...(filter.category ? { category: filter.category } : {}),
      ...(filter.assigneeId ? { assigneeId: filter.assigneeId } : {}),
      ...(filter.employeeId ? { employeeId: filter.employeeId } : {}),
    };

    const dateFilters: any = {};
    if (filter.raisedAtStart) dateFilters.gte = new Date(filter.raisedAtStart);
    if (filter.raisedAtEnd) dateFilters.lte = new Date(filter.raisedAtEnd);
    if (Object.keys(dateFilters).length) where.raisedAt = dateFilters;

    const conditions: any[] = [];

    if (filter.isDeleted) {
      conditions.push({
        OR: [{ isDeleted: true }, { status: 'ARCHIVED' }],
      });
    } else {
      conditions.push({ isDeleted: false });
      if (filter.status) {
        conditions.push({ status: filter.status });
      }
    }

    if (filter.search) {
      conditions.push({
        OR: [
          { subject: { contains: filter.search, mode: 'insensitive' } },
          { description: { contains: filter.search, mode: 'insensitive' } },
          { employeeId: { contains: filter.search, mode: 'insensitive' } },
        ],
      });
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      db.accommodationComplaint.findMany({
        where,
        orderBy: prismaOrderBy(page) ?? { raisedAt: 'desc' },
        ...prismaPageArgs(page),
      }),
      db.accommodationComplaint.count({ where }),
    ]);

    const siteIds = Array.from(new Set(items.map((i: any) => i.siteId)));
    const employeeIds = Array.from(
      new Set(items.filter((i: any) => i.employeeId).map((i: any) => i.employeeId as string))
    );

    const [sites, employees] = await Promise.all([
      db.accommodationSite.findMany({
        where: { id: { in: siteIds } },
        select: { id: true, name: true },
      }),
      db.employee.findMany({
        where: { id: { in: employeeIds } },
        select: { id: true, firstName: true, lastName: true },
      }),
    ]);

    const siteMap = new Map(sites.map((s: any) => [s.id, s.name]));
    const employeeMap = new Map(employees.map((e: any) => [e.id, `${e.firstName} ${e.lastName}`]));

    const mappedItems = items.map((item: any) => ({
      ...item,
      siteName: siteMap.get(item.siteId) ?? 'Unknown Site',
      employeeName: item.employeeId ? (employeeMap.get(item.employeeId) ?? item.employeeId) : null,
    }));

    return buildPaginatedResult(mappedItems, total, page);
  }
}

export const accommodationComplaintService = new AccommodationComplaintService();

export class AccommodationCertificateService {
  async get(id: string, auth: AuthContext) {
    const cert = await db.accommodationCertificate.findUnique({ where: { id } });
    if (!cert || cert.tenantId !== auth.tenantId) throw new Error('Certificate not found');
    return cert;
  }

  async dashboard(tenantId: string, period: string) {
    const sites = await db.accommodationSite.findMany({
      where: { tenantId, status: 'ACTIVE', isDeleted: false },
    });
    let sitesOvercapacity = 0;
    let inspectionsDue = 0;
    const now = new Date();
    for (const s of sites as Array<Record<string, unknown>>) {
      if (Number(s.currentOccupancy) > Number(s.totalCapacity)) sitesOvercapacity += 1;
      if (s.nextInspectionAt && new Date(s.nextInspectionAt as string) < now) inspectionsDue += 1;
    }
    const openCriticalFindings = await db.accommodationInspection.count({
      where: { tenantId, status: 'OPEN', isDeleted: false, criticalFindings: { gt: 0 } },
    });
    const openComplaints = await db.accommodationComplaint.count({
      where: { tenantId, status: { in: ['OPEN', 'IN_PROGRESS'] }, isDeleted: false },
    });
    const openComplaintsList = await db.accommodationComplaint.findMany({
      where: { tenantId, status: { in: ['OPEN', 'IN_PROGRESS'] }, isDeleted: false },
      select: { raisedAt: true, slaHours: true, status: true },
      take: 500,
    });
    let complaintsSlaBreached = 0;
    for (const c of openComplaintsList as Array<Record<string, unknown>>) {
      if (
        isComplaintSlaBreached({
          raisedAt: new Date(c.raisedAt as string),
          slaHours: Number(c.slaHours),
          status: String(c.status),
        })
      )
        complaintsSlaBreached += 1;
    }
    const scoreAgg = await db.accommodationInspection.aggregate({
      _avg: { score: true },
      where: { tenantId, isDeleted: false },
    });
    const averageInspectionScore = Number(scoreAgg?._avg?.score ?? 0);

    // Dynamic charts data calculations
    const complaintsGroup = await db.accommodationComplaint.groupBy({
      by: ['category'],
      where: { tenantId, isDeleted: false },
      _count: { id: true },
    });
    const complaintsByCategory = complaintsGroup.map((g: any) => ({
      category: g.category,
      count: g._count.id,
    }));

    const inspectionsGroup = await db.accommodationInspection.groupBy({
      by: ['category'],
      where: { tenantId, isDeleted: false },
      _count: { id: true },
    });
    const inspectionsByCategory = inspectionsGroup.map((g: any) => ({
      category: g.category,
      count: g._count.id,
    }));

    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const yyyymm = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      last6Months.push(yyyymm);
    }

    const complaintsTrend = [];
    const inspectionsTrend = [];

    for (const m of last6Months) {
      const [year, monthStr] = m.split('-');
      const start = new Date(Number(year), Number(monthStr) - 1, 1);
      const end = new Date(Number(year), Number(monthStr), 0, 23, 59, 59, 999);

      const complaintsCount = await db.accommodationComplaint.count({
        where: {
          tenantId,
          isDeleted: false,
          raisedAt: { gte: start, lte: end },
        },
      });
      complaintsTrend.push({ period: m, count: complaintsCount });

      const avgScore = await db.accommodationInspection.aggregate({
        _avg: { score: true },
        where: {
          tenantId,
          isDeleted: false,
          inspectionDate: { gte: start, lte: end },
        },
      });
      inspectionsTrend.push({ period: m, score: avgScore._avg.score ?? 0 });
    }

    return {
      period,
      sitesTotal: sites.length,
      sitesOvercapacity,
      inspectionsDue,
      openCriticalFindings,
      openComplaints,
      complaintsSlaBreached,
      averageInspectionScore,
      complaintsByCategory,
      inspectionsByCategory,
      complaintsTrend,
      inspectionsTrend,
      sitesOccupancy: sites.map((s: any) => ({
        name: s.name,
        capacity: s.totalCapacity,
        occupancy: s.currentOccupancy,
      })),
    };
  }

  async generate(period: string, auth: AuthContext) {
    const stats = await this.dashboard(auth.tenantId, period);
    const reasons: string[] = [];
    if (stats.sitesOvercapacity > 0)
      reasons.push(`${stats.sitesOvercapacity} site(s) over capacity`);
    if (stats.openCriticalFindings > 0)
      reasons.push(`${stats.openCriticalFindings} open CRITICAL finding(s)`);
    if (stats.complaintsSlaBreached > 0)
      reasons.push(`${stats.complaintsSlaBreached} SLA-breached complaint(s)`);
    if (stats.inspectionsDue > 0) reasons.push(`${stats.inspectionsDue} overdue inspection(s)`);
    const gatingReason = reasons.length ? `Blocked: ${reasons.join('; ')}` : null;

    const dbStats = {
      sitesTotal: stats.sitesTotal,
      sitesOvercapacity: stats.sitesOvercapacity,
      inspectionsDue: stats.inspectionsDue,
      openCriticalFindings: stats.openCriticalFindings,
      openComplaints: stats.openComplaints,
      complaintsSlaBreached: stats.complaintsSlaBreached,
      averageInspectionScore: stats.averageInspectionScore,
    };

    return db.accommodationCertificate.upsert({
      where: {
        tenantId_period: { tenantId: auth.tenantId, period },
      },
      update: {
        ...dbStats,
        gatingReason,
        generatedAt: new Date(),
        status: 'DRAFT',
        updatedBy: auth.userId,
      },
      create: {
        tenantId: auth.tenantId,
        period,
        ...dbStats,
        gatingReason,
        generatedAt: new Date(),
        status: 'DRAFT',
        createdBy: auth.userId,
        updatedBy: auth.userId,
      },
    });
  }

  async sign(
    period: string,
    attestations: Array<{ field: string; value: string }>,
    auth: AuthContext
  ) {
    const cert = await db.accommodationCertificate.findUnique({
      where: { tenantId_period: { tenantId: auth.tenantId, period } },
    });
    if (!cert) throw new Error('Certificate not generated');
    if (cert.gatingReason) throw new Error(`Cannot sign while gated: ${cert.gatingReason}`);

    return db.accommodationCertificate.update({
      where: { id: cert.id },
      data: {
        status: 'SIGNED',
        signedAt: new Date(),
        signedBy: auth.userId,
        attestationsJson: attestations,
        updatedBy: auth.userId,
      },
    });
  }

  async softDelete(id: string, auth: AuthContext) {
    await this.get(id, auth);
    return db.accommodationCertificate.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: auth.userId },
    });
  }

  async hardDelete(id: string, auth: AuthContext) {
    await this.get(id, auth);
    return db.accommodationCertificate.delete({ where: { id } });
  }

  async list(tenantId: string) {
    return db.accommodationCertificate.findMany({
      where: { tenantId, isDeleted: false },
      orderBy: { period: 'desc' },
      take: 24,
    });
  }
}

export const accommodationCertificateService = new AccommodationCertificateService();
