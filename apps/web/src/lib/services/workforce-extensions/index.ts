/**
 * Themes E + F + I — Workforce extensions.
 *
 * E (contractor flow tagging) — closes EPIC-19-S15, EPIC-21-S11,
 *   EPIC-23-S13, EPIC-24-S13. Generic ContractorAssignment that
 *   attendance / holidays / accommodation / HSE filter by.
 *
 * F (benefits sub-categories) — closes EPIC-22-S08, EPIC-22-S09,
 *   EPIC-22-S10, EPIC-22-S11, EPIC-22-S12. Two register tables
 *   (EmployeeLoanSchedule, UniformPpeIssuance) plus extra entries
 *   on the existing BenefitCatalogue default-seed list.
 *
 * I (accommodation ops) — closes EPIC-23-S08, EPIC-23-S09, EPIC-23-S11.
 *   Three register tables (TransportRoute, Clinic, MaintenanceTicket).
 */

import { prisma } from '@aura/database';

export interface AuthContext {
  tenantId: string;
  userId: string;
}

export type ContractorDomain = 'ATTENDANCE' | 'HOLIDAYS' | 'ACCOMMODATION' | 'HSE';
export type ContractorStatus = 'ACTIVE' | 'EXPIRED' | 'TERMINATED';

export class ContractorAssignmentService {
  async list(
    tenantId: string,
    filter: { domain?: ContractorDomain; status?: ContractorStatus; siteId?: string } = {}
  ) {
    return (prisma as any).contractorAssignment.findMany({
      where: {
        tenantId,
        ...(filter.domain ? { domain: filter.domain } : {}),
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.siteId ? { siteId: filter.siteId } : {}),
      },
      orderBy: [{ domain: 'asc' }, { startDate: 'desc' }],
      take: 500,
    });
  }

  async upsert(
    input: {
      subjectId: string;
      subjectName: string;
      domain: ContractorDomain;
      startDate: Date;
      endDate?: Date;
      vendorId?: string;
      vendorName?: string;
      contractRef?: string;
      siteId?: string;
      notes?: string;
    },
    auth: AuthContext
  ) {
    if (input.endDate && input.endDate < input.startDate) {
      throw new Error('endDate cannot precede startDate');
    }
    return (prisma as any).contractorAssignment.upsert({
      where: {
        aura_contractor_assignment_unique: {
          tenantId: auth.tenantId,
          subjectId: input.subjectId,
          domain: input.domain,
          startDate: input.startDate,
        },
      },
      update: {
        subjectName: input.subjectName,
        vendorId: input.vendorId ?? null,
        vendorName: input.vendorName ?? null,
        contractRef: input.contractRef ?? null,
        siteId: input.siteId ?? null,
        endDate: input.endDate ?? null,
        notes: input.notes ?? null,
      },
      create: {
        tenantId: auth.tenantId,
        subjectId: input.subjectId,
        subjectName: input.subjectName,
        vendorId: input.vendorId ?? null,
        vendorName: input.vendorName ?? null,
        contractRef: input.contractRef ?? null,
        siteId: input.siteId ?? null,
        domain: input.domain,
        startDate: input.startDate,
        endDate: input.endDate ?? null,
        status: 'ACTIVE' as ContractorStatus,
        notes: input.notes ?? null,
      },
    });
  }

  async terminate(id: string, auth: AuthContext) {
    return (prisma as any).contractorAssignment.update({
      where: { id },
      data: { status: 'TERMINATED' as ContractorStatus, endDate: new Date() },
    });
  }
}

export const contractorAssignmentService = new ContractorAssignmentService();

// ---------------------------------------------------------------------------
// Theme F – Employee loan amortization (S22-S09)
// ---------------------------------------------------------------------------

export type LoanStatus = 'ACTIVE' | 'PAID_OFF' | 'DEFAULTED' | 'WAIVED';

/** Pure helper: equal-installment amount given principal, rate, term. */
export function equalInstallment(principal: number, annualRatePct: number, months: number): number {
  if (months <= 0) throw new Error('installments must be > 0');
  const rate = annualRatePct / 100 / 12;
  if (rate === 0) return principal / months;
  const factor = Math.pow(1 + rate, months);
  return (principal * rate * factor) / (factor - 1);
}

export class EmployeeLoanService {
  async list(tenantId: string, filter: { status?: LoanStatus; employeeId?: string } = {}) {
    return (prisma as any).employeeLoanSchedule.findMany({
      where: {
        tenantId,
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.employeeId ? { employeeId: filter.employeeId } : {}),
      },
      orderBy: [{ employeeId: 'asc' }, { startDate: 'desc' }],
      take: 500,
    });
  }

  async create(
    input: {
      employeeId: string;
      loanCode: string;
      loanType?: string;
      currency?: string;
      principal: number;
      interestRatePct?: number;
      installments: number;
      startDate: Date;
      notes?: string;
    },
    auth: AuthContext
  ) {
    if (input.principal <= 0) throw new Error('principal must be > 0');
    if (input.installments <= 0) throw new Error('installments must be > 0');
    const installmentAmount = Number(
      equalInstallment(input.principal, input.interestRatePct ?? 0, input.installments).toFixed(2)
    );
    return (prisma as any).employeeLoanSchedule.create({
      data: {
        tenantId: auth.tenantId,
        employeeId: input.employeeId,
        loanCode: input.loanCode,
        loanType: input.loanType ?? 'GENERAL',
        currency: input.currency ?? 'AED',
        principal: input.principal,
        interestRatePct: input.interestRatePct ?? 0,
        installments: input.installments,
        installmentAmount,
        balance: input.principal,
        startDate: input.startDate,
        notes: input.notes ?? null,
      },
    });
  }

  async recordPayment(id: string, amount: number, auth: AuthContext) {
    if (amount <= 0) throw new Error('payment amount must be > 0');
    const row = await (prisma as any).employeeLoanSchedule.findUnique({ where: { id } });
    if (!row || row.tenantId !== auth.tenantId) throw new Error('loan not found');
    const balanceNum = Number(row.balance);
    const newBalance = Math.max(0, balanceNum - amount);
    const status = newBalance === 0 ? 'PAID_OFF' : row.status;
    return (prisma as any).employeeLoanSchedule.update({
      where: { id },
      data: {
        balance: newBalance,
        ...(status === 'PAID_OFF' ? { status, endDate: new Date() } : {}),
      },
    });
  }
}

export const employeeLoanService = new EmployeeLoanService();

// ---------------------------------------------------------------------------
// Theme F – Uniform / PPE / tools issuance (S22-S11)
// ---------------------------------------------------------------------------

export type IssuanceCategory = 'UNIFORM' | 'PPE' | 'TOOLS';

export class UniformPpeIssuanceService {
  async list(tenantId: string, filter: { employeeId?: string; category?: IssuanceCategory } = {}) {
    return (prisma as any).uniformPpeIssuance.findMany({
      where: {
        tenantId,
        ...(filter.employeeId ? { employeeId: filter.employeeId } : {}),
        ...(filter.category ? { category: filter.category } : {}),
      },
      orderBy: { issuedAt: 'desc' },
      take: 500,
    });
  }

  async issue(
    input: {
      employeeId: string;
      itemCode: string;
      itemLabel: string;
      category?: IssuanceCategory;
      quantity?: number;
      notes?: string;
    },
    auth: AuthContext
  ) {
    if (input.quantity !== undefined && input.quantity <= 0) {
      throw new Error('quantity must be > 0');
    }
    return (prisma as any).uniformPpeIssuance.create({
      data: {
        tenantId: auth.tenantId,
        employeeId: input.employeeId,
        itemCode: input.itemCode,
        itemLabel: input.itemLabel,
        category: input.category ?? 'UNIFORM',
        quantity: input.quantity ?? 1,
        issuedBy: auth.userId,
        notes: input.notes ?? null,
      },
    });
  }

  async markReturned(id: string, condition: string | undefined, auth: AuthContext) {
    return (prisma as any).uniformPpeIssuance.update({
      where: { id },
      data: {
        returnedAt: new Date(),
        returnedBy: auth.userId,
        condition: condition ?? null,
      },
    });
  }
}

export const uniformPpeIssuanceService = new UniformPpeIssuanceService();

// ---------------------------------------------------------------------------
// Theme I — Accommodation ops
// ---------------------------------------------------------------------------

export class AccommodationTransportRouteService {
  async list(tenantId: string, siteId?: string) {
    return (prisma as any).accommodationTransportRoute.findMany({
      where: { tenantId, ...(siteId ? { siteId } : {}) },
      orderBy: [{ siteId: 'asc' }, { routeCode: 'asc' }],
      take: 500,
    });
  }
  async upsert(
    input: {
      siteId: string;
      routeCode: string;
      label: string;
      vehicleType?: string;
      capacity?: number;
      departureFromSite?: string;
      arrivalAtSite?: string;
      worksiteAddress?: string;
      distanceKm?: number;
      isActive?: boolean;
      notes?: string;
    },
    auth: AuthContext
  ) {
    return (prisma as any).accommodationTransportRoute.upsert({
      where: {
        aura_accommodation_transport_route_unique: {
          tenantId: auth.tenantId,
          siteId: input.siteId,
          routeCode: input.routeCode,
        },
      },
      update: {
        label: input.label,
        vehicleType: input.vehicleType ?? 'BUS',
        capacity: input.capacity ?? 0,
        departureFromSite: input.departureFromSite ?? null,
        arrivalAtSite: input.arrivalAtSite ?? null,
        worksiteAddress: input.worksiteAddress ?? null,
        distanceKm: input.distanceKm ?? null,
        isActive: input.isActive ?? true,
        notes: input.notes ?? null,
      },
      create: {
        tenantId: auth.tenantId,
        siteId: input.siteId,
        routeCode: input.routeCode,
        label: input.label,
        vehicleType: input.vehicleType ?? 'BUS',
        capacity: input.capacity ?? 0,
        departureFromSite: input.departureFromSite ?? null,
        arrivalAtSite: input.arrivalAtSite ?? null,
        worksiteAddress: input.worksiteAddress ?? null,
        distanceKm: input.distanceKm ?? null,
        isActive: input.isActive ?? true,
        notes: input.notes ?? null,
      },
    });
  }
}
export const accommodationTransportRouteService = new AccommodationTransportRouteService();

export class AccommodationClinicService {
  async list(tenantId: string, siteId?: string) {
    return (prisma as any).accommodationClinic.findMany({
      where: { tenantId, ...(siteId ? { siteId } : {}) },
      orderBy: [{ siteId: 'asc' }, { clinicCode: 'asc' }],
      take: 500,
    });
  }
  async upsert(
    input: {
      siteId: string;
      clinicCode: string;
      label: string;
      isOnSite?: boolean;
      nearestHospital?: string;
      nearestHospitalDistanceKm?: number;
      operatingHours?: string;
      doctorOnCall?: boolean;
      isActive?: boolean;
      notes?: string;
    },
    auth: AuthContext
  ) {
    return (prisma as any).accommodationClinic.upsert({
      where: {
        aura_accommodation_clinic_unique: {
          tenantId: auth.tenantId,
          siteId: input.siteId,
          clinicCode: input.clinicCode,
        },
      },
      update: {
        label: input.label,
        isOnSite: input.isOnSite ?? true,
        nearestHospital: input.nearestHospital ?? null,
        nearestHospitalDistanceKm: input.nearestHospitalDistanceKm ?? null,
        operatingHours: input.operatingHours ?? null,
        doctorOnCall: input.doctorOnCall ?? false,
        isActive: input.isActive ?? true,
        notes: input.notes ?? null,
      },
      create: {
        tenantId: auth.tenantId,
        siteId: input.siteId,
        clinicCode: input.clinicCode,
        label: input.label,
        isOnSite: input.isOnSite ?? true,
        nearestHospital: input.nearestHospital ?? null,
        nearestHospitalDistanceKm: input.nearestHospitalDistanceKm ?? null,
        operatingHours: input.operatingHours ?? null,
        doctorOnCall: input.doctorOnCall ?? false,
        isActive: input.isActive ?? true,
        notes: input.notes ?? null,
      },
    });
  }
  async recordInspection(id: string, result: string, auth: AuthContext) {
    return (prisma as any).accommodationClinic.update({
      where: { id },
      data: { lastInspectionAt: new Date(), lastInspectionResult: result },
    });
  }
}
export const accommodationClinicService = new AccommodationClinicService();

export type MaintenanceStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type MaintenanceSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

const DEFAULT_SLA_HOURS: Record<MaintenanceSeverity, number> = {
  CRITICAL: 4,
  HIGH: 24,
  MEDIUM: 72,
  LOW: 168,
};

export class AccommodationMaintenanceService {
  async list(
    tenantId: string,
    filter: { status?: MaintenanceStatus; severity?: MaintenanceSeverity; siteId?: string } = {}
  ) {
    return (prisma as any).accommodationMaintenanceTicket.findMany({
      where: {
        tenantId,
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.severity ? { severity: filter.severity } : {}),
        ...(filter.siteId ? { siteId: filter.siteId } : {}),
      },
      orderBy: [{ severity: 'desc' }, { reportedAt: 'desc' }],
      take: 500,
    });
  }

  async open(
    input: {
      siteId: string;
      ticketCode: string;
      category: string;
      severity?: MaintenanceSeverity;
      description: string;
    },
    auth: AuthContext
  ) {
    const severity = input.severity ?? 'MEDIUM';
    const slaHours = DEFAULT_SLA_HOURS[severity];
    const slaDueAt = new Date(Date.now() + slaHours * 60 * 60 * 1000);
    return (prisma as any).accommodationMaintenanceTicket.create({
      data: {
        tenantId: auth.tenantId,
        siteId: input.siteId,
        ticketCode: input.ticketCode,
        category: input.category,
        severity,
        description: input.description,
        reportedBy: auth.userId,
        slaDueAt,
      },
    });
  }

  async resolve(id: string, notes: string, auth: AuthContext) {
    return (prisma as any).accommodationMaintenanceTicket.update({
      where: { id },
      data: {
        status: 'RESOLVED' as MaintenanceStatus,
        resolvedAt: new Date(),
        resolutionNotes: notes,
        assignedTo: auth.userId,
      },
    });
  }

  async openCriticalCount(tenantId: string): Promise<number> {
    return (prisma as any).accommodationMaintenanceTicket.count({
      where: {
        tenantId,
        status: { in: ['OPEN', 'IN_PROGRESS'] },
        severity: { in: ['HIGH', 'CRITICAL'] },
      },
    });
  }
}
export const accommodationMaintenanceService = new AccommodationMaintenanceService();
