import { prisma } from '@aura/database';
import type { AuthContext } from './types';

/**
 * EPIC-13-S18 / S19 / S20: GOSI dashboard, monthly compliance pack +
 * monthly compliance certificate.
 */
export class GosiCertificateService {
  async dashboard(tenantId: string, period: string) {
    const submissions = await (prisma as any).gosiPeriodSubmission.findMany({
      where: { tenantId, period },
    });
    const subCount = submissions.length;
    const submitted = submissions.filter((s: { status: string }) =>
      ['SUBMITTED', 'ACKNOWLEDGED'].includes(s.status)
    ).length;
    const lateCount = submissions.filter(
      (s: { submittedAt: Date | null; dueDate: Date | null }) =>
        s.submittedAt &&
        s.dueDate &&
        new Date(s.submittedAt).getTime() > new Date(s.dueDate).getTime()
    ).length;
    const openVariances = await (prisma as any).gosiVariance.count({
      where: { tenantId, period, status: 'OPEN' },
    });
    const criticalVariances = await (prisma as any).gosiVariance.count({
      where: { tenantId, period, status: 'OPEN', severity: 'CRITICAL' },
    });

    // ----------------- Restructured GOSI Registration Dashboard Stats -----------------
    const allRegs = await (prisma as any).gosiEmployeeRegistration.findMany({
      where: { tenantId },
    });

    const activeRegList = allRegs.filter((r: any) => r.status === 'ACTIVE');
    const deregisteredList = allRegs.filter((r: any) => r.status === 'DEREGISTERED');
    const pendingList = allRegs.filter((r: any) => r.status === 'PENDING');
    const expiredList = allRegs.filter((r: any) => r.status === 'EXPIRED');

    const activeEmpIds = activeRegList.map((r: any) => r.employeeId);
    const activeEmployees = await prisma.employee.findMany({
      where: { id: { in: activeEmpIds }, isDeleted: false },
      include: { company: true, department: true },
    });

    // Nationality breakdown for active registrations
    const saudiCount = activeRegList.filter((r: any) => r.nationalityClass === 'SAUDI').length;
    const gccCount = activeRegList.filter((r: any) => r.nationalityClass === 'GCC_NATIONAL_OTHER').length;
    const expatCount = activeRegList.filter((r: any) => r.nationalityClass === 'EXPAT').length;

    // Breakdowns by hierarchy
    const byCompany: Record<string, number> = {};
    const byDepartment: Record<string, number> = {};
    const byEstablishment: Record<string, number> = {};

    // Get Saudi Legal Entities to map establishmentId
    const legalEntities = await (prisma as any).gccLegalEntity.findMany({
      where: { tenantId, countryCode: 'SA' },
    });

    activeEmployees.forEach((emp) => {
      const cName = emp.company?.name || 'Unknown';
      byCompany[cName] = (byCompany[cName] || 0) + 1;

      const dName = emp.department?.name || 'Unknown';
      byDepartment[dName] = (byDepartment[dName] || 0) + 1;
    });

    activeRegList.forEach((r: any) => {
      const le = legalEntities.find((l: any) => l.id === r.establishmentId);
      const estName = le ? `${le.legalName} (${le.registrationRef})` : r.establishmentId || 'Unknown';
      byEstablishment[estName] = (byEstablishment[estName] || 0) + 1;
    });

    // Monthly trends (last 6 months)
    const registrationTrend: Record<string, number> = {};
    const deregistrationTrend: Record<string, number> = {};

    allRegs.forEach((r: any) => {
      if (r.registrationDate) {
        const m = new Date(r.registrationDate).toISOString().slice(0, 7);
        registrationTrend[m] = (registrationTrend[m] || 0) + 1;
      }
      if (r.deregistrationDate) {
        const m = new Date(r.deregistrationDate).toISOString().slice(0, 7);
        deregistrationTrend[m] = (deregistrationTrend[m] || 0) + 1;
      }
    });

    return {
      period,
      submissions: subCount,
      submitted,
      late: lateCount,
      openVariances,
      criticalVariances,
      registrationStats: {
        totalRegistered: allRegs.length,
        activeRegistrations: activeRegList.length,
        pendingRegistrations: pendingList.length,
        expiredRegistrations: expiredList.length,
        deregistered: deregisteredList.length,
        saudiNationals: saudiCount,
        gccNationals: gccCount,
        expat: expatCount,
        byCompany,
        byDepartment,
        byEstablishment,
        registrationTrend,
        deregistrationTrend,
      },
    };
  }

  async generate(period: string, auth: AuthContext) {
    const stats = await this.dashboard(auth.tenantId, period);
    const reasons: string[] = [];
    if (stats.criticalVariances > 0)
      reasons.push(`${stats.criticalVariances} critical variance(s) open`);
    if (stats.late > 0) reasons.push(`${stats.late} late submission(s)`);
    const gatingReason = reasons.length ? `Blocked: ${reasons.join('; ')}` : null;
    return (prisma as any).gosiCertificate.upsert({
      where: { tenantId_period: { tenantId: auth.tenantId, period } },
      update: {
        submissionsCount: stats.submissions,
        openVariancesCount: stats.openVariances,
        criticalVariancesCount: stats.criticalVariances,
        lateSubmissionsCount: stats.late,
        gatingReason,
        generatedAt: new Date(),
        status: 'DRAFT',
      },
      create: {
        tenantId: auth.tenantId,
        period,
        submissionsCount: stats.submissions,
        openVariancesCount: stats.openVariances,
        criticalVariancesCount: stats.criticalVariances,
        lateSubmissionsCount: stats.late,
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
    const cert = await (prisma as any).gosiCertificate.findUnique({
      where: { tenantId_period: { tenantId: auth.tenantId, period } },
    });
    if (!cert) throw new Error('certificate not generated');
    if (cert.gatingReason) throw new Error(`cannot sign while gated: ${cert.gatingReason}`);
    return (prisma as any).gosiCertificate.update({
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
    return (prisma as any).gosiCertificate.findMany({
      where: { tenantId },
      orderBy: { period: 'desc' },
      take: 24,
    });
  }
}

export const gosiCertificateService = new GosiCertificateService();
