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

export interface AuthContext {
  tenantId: string;
  userId: string;
}

export type SiteType =
  | 'DORMITORY'
  | 'HOTEL'
  | 'APARTMENT'
  | 'LABOUR_CAMP'
  | 'VILLA'
  | 'STAFF_HOUSING';

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

export class AccommodationSiteService {
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
    },
    auth: AuthContext
  ) {
    const data = { tenantId: auth.tenantId, ...input, status: 'ACTIVE' };
    if (input.id) {
      return (prisma as any).accommodationSite.update({ where: { id: input.id }, data });
    }
    return (prisma as any).accommodationSite.create({ data });
  }

  async list(tenantId: string, filter: { country?: string } = {}) {
    return (prisma as any).accommodationSite.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        ...(filter.country ? { country: filter.country } : {}),
      },
      orderBy: { name: 'asc' },
      take: 500,
    });
  }
}

export const accommodationSiteService = new AccommodationSiteService();

export class AccommodationAssignmentService {
  async assign(
    input: {
      siteId: string;
      employeeId: string;
      roomNumber?: string;
      bedNumber?: string;
      checkInAt: Date;
      monthlyAllowance?: number;
      currency?: string;
    },
    auth: AuthContext
  ) {
    const site = await (prisma as any).accommodationSite.findUnique({
      where: { id: input.siteId },
    });
    if (!site || site.tenantId !== auth.tenantId) throw new Error('site not found');
    if (site.currentOccupancy >= site.totalCapacity) throw new Error('site at capacity');
    const assignment = await (prisma as any).accommodationAssignment.create({
      data: {
        tenantId: auth.tenantId,
        ...input,
        currency: input.currency ?? 'AED',
        status: 'ACTIVE',
      },
    });
    await (prisma as any).accommodationSite.update({
      where: { id: input.siteId },
      data: { currentOccupancy: { increment: 1 } },
    });
    return assignment;
  }

  async checkOut(id: string, checkOutAt: Date, _auth: AuthContext) {
    const a = await (prisma as any).accommodationAssignment.findUnique({ where: { id } });
    if (!a) throw new Error('assignment not found');
    if (a.status !== 'ACTIVE') throw new Error('assignment not active');
    const updated = await (prisma as any).accommodationAssignment.update({
      where: { id },
      data: { status: 'CHECKED_OUT', checkOutAt },
    });
    await (prisma as any).accommodationSite.update({
      where: { id: a.siteId },
      data: { currentOccupancy: { decrement: 1 } },
    });
    return updated;
  }

  async list(
    tenantId: string,
    filter: { siteId?: string; employeeId?: string; status?: string } = {}
  ) {
    return (prisma as any).accommodationAssignment.findMany({
      where: {
        tenantId,
        ...(filter.siteId ? { siteId: filter.siteId } : {}),
        ...(filter.employeeId ? { employeeId: filter.employeeId } : {}),
        ...(filter.status ? { status: filter.status } : {}),
      },
      orderBy: { checkInAt: 'desc' },
      take: 500,
    });
  }
}

export const accommodationAssignmentService = new AccommodationAssignmentService();

export class AccommodationInspectionService {
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
    },
    auth: AuthContext
  ) {
    const inspection = await (prisma as any).accommodationInspection.create({
      data: {
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
        status: (input.criticalFindings ?? 0) === 0 ? 'CLOSED' : 'OPEN',
        closedAt: (input.criticalFindings ?? 0) === 0 ? new Date() : null,
      },
    });
    const nextInspection = new Date(input.inspectionDate);
    nextInspection.setMonth(nextInspection.getMonth() + 3);
    await (prisma as any).accommodationSite.update({
      where: { id: input.siteId },
      data: {
        lastInspectionAt: input.inspectionDate,
        nextInspectionAt: nextInspection,
      },
    });
    return inspection;
  }

  async close(id: string, _auth: AuthContext) {
    return (prisma as any).accommodationInspection.update({
      where: { id },
      data: { status: 'CLOSED', closedAt: new Date() },
    });
  }

  async list(tenantId: string, filter: { siteId?: string; status?: string } = {}) {
    return (prisma as any).accommodationInspection.findMany({
      where: {
        tenantId,
        ...(filter.siteId ? { siteId: filter.siteId } : {}),
        ...(filter.status ? { status: filter.status } : {}),
      },
      orderBy: { inspectionDate: 'desc' },
      take: 500,
    });
  }
}

export const accommodationInspectionService = new AccommodationInspectionService();

export class AccommodationComplaintService {
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
    return (prisma as any).accommodationComplaint.create({
      data: {
        tenantId: auth.tenantId,
        ...input,
        severity: input.severity ?? 'MEDIUM',
        slaHours: input.slaHours ?? 48,
        raisedBy: auth.userId,
        status: 'OPEN',
      },
    });
  }

  async assign(id: string, assigneeId: string, _auth: AuthContext) {
    return (prisma as any).accommodationComplaint.update({
      where: { id },
      data: { assigneeId, status: 'IN_PROGRESS' },
    });
  }

  async resolve(id: string, notes: string | undefined, auth: AuthContext) {
    return (prisma as any).accommodationComplaint.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolvedBy: auth.userId,
        resolutionNotes: notes,
      },
    });
  }

  async list(
    tenantId: string,
    filter: { siteId?: string; status?: string; severity?: string } = {}
  ) {
    return (prisma as any).accommodationComplaint.findMany({
      where: {
        tenantId,
        ...(filter.siteId ? { siteId: filter.siteId } : {}),
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.severity ? { severity: filter.severity } : {}),
      },
      orderBy: { raisedAt: 'desc' },
      take: 500,
    });
  }
}

export const accommodationComplaintService = new AccommodationComplaintService();

/** EPIC-23-S15 / S16: pure SLA-breach detection. */
export function isComplaintSlaBreached(complaint: {
  raisedAt: Date;
  slaHours: number;
  status: string;
}): boolean {
  if (complaint.status === 'RESOLVED' || complaint.status === 'CLOSED') return false;
  const ageHours = (Date.now() - new Date(complaint.raisedAt).getTime()) / (3600 * 1000);
  return ageHours > complaint.slaHours;
}

export class AccommodationCertificateService {
  async dashboard(tenantId: string, period: string) {
    const sites = await (prisma as any).accommodationSite.findMany({
      where: { tenantId, status: 'ACTIVE' },
    });
    let sitesOvercapacity = 0;
    let inspectionsDue = 0;
    const now = new Date();
    for (const s of sites as Array<Record<string, unknown>>) {
      if (Number(s.currentOccupancy) > Number(s.totalCapacity)) sitesOvercapacity += 1;
      if (s.nextInspectionAt && new Date(s.nextInspectionAt as string) < now) inspectionsDue += 1;
    }
    const openCriticalFindings = await (prisma as any).accommodationInspection.count({
      where: { tenantId, status: 'OPEN', criticalFindings: { gt: 0 } },
    });
    const openComplaints = await (prisma as any).accommodationComplaint.count({
      where: { tenantId, status: { in: ['OPEN', 'IN_PROGRESS'] } },
    });
    const openComplaintsList = await (prisma as any).accommodationComplaint.findMany({
      where: { tenantId, status: { in: ['OPEN', 'IN_PROGRESS'] } },
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
    const scoreAgg = await (prisma as any).accommodationInspection.aggregate({
      _avg: { score: true },
      where: { tenantId },
    });
    const averageInspectionScore = Number(scoreAgg?._avg?.score ?? 0);
    return {
      period,
      sitesTotal: sites.length,
      sitesOvercapacity,
      inspectionsDue,
      openCriticalFindings,
      openComplaints,
      complaintsSlaBreached,
      averageInspectionScore,
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
    return (prisma as any).accommodationCertificate.upsert({
      where: {
        aura_accommodation_certificate_unique: { tenantId: auth.tenantId, period },
      },
      update: { ...stats, gatingReason, generatedAt: new Date(), status: 'DRAFT' },
      create: {
        tenantId: auth.tenantId,
        ...stats,
        gatingReason,
        generatedAt: new Date(),
        status: 'DRAFT',
      },
    });
  }

  async sign(
    period: string,
    attestations: Array<{ field: string; value: string }>,
    auth: AuthContext
  ) {
    const cert = await (prisma as any).accommodationCertificate.findUnique({
      where: { aura_accommodation_certificate_unique: { tenantId: auth.tenantId, period } },
    });
    if (!cert) throw new Error('certificate not generated');
    if (cert.gatingReason) throw new Error(`cannot sign while gated: ${cert.gatingReason}`);
    return (prisma as any).accommodationCertificate.update({
      where: { id: cert.id },
      data: {
        status: 'SIGNED',
        signedAt: new Date(),
        signedBy: auth.userId,
        attestationsJson: attestations,
      },
    });
  }

  async list(tenantId: string) {
    return (prisma as any).accommodationCertificate.findMany({
      where: { tenantId },
      orderBy: { period: 'desc' },
      take: 24,
    });
  }
}

export const accommodationCertificateService = new AccommodationCertificateService();
