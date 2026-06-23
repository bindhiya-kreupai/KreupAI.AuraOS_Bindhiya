import { prisma } from '@aura/database';
import type { AuthContext } from './types';
import { complianceExceptionService } from './exception.service';

/**
 * EPIC-37-S10..S12: certificate generation across scopes (HR_MASTER,
 * PAYROLL, IMMIGRATION, AUDIT_MASTER). Gates on critical open exceptions
 * or any CRITICAL red flag still OPEN.
 */
export class ChecklistCertificateService {
  async list(tenantId: string, filter: { scope?: string; period?: string } = {}) {
    return (prisma as any).checklistCertificate.findMany({
      where: { tenantId, ...filter },
      orderBy: [{ scope: 'asc' }, { period: 'desc' }],
    });
  }

  async generate(scope: string, period: string, auth: AuthContext) {
    const runsExecuted = await (prisma as any).checklistRun.count({
      where: { tenantId: auth.tenantId, period },
    });
    const criticalRedFlags = await (prisma as any).redFlagInstance.count({
      where: { tenantId: auth.tenantId, severity: 'CRITICAL', status: 'OPEN' },
    });
    const openCriticalExceptions = await complianceExceptionService.countOpenCritical(
      auth.tenantId
    );
    const reasons: string[] = [];
    if (criticalRedFlags > 0) reasons.push(`${criticalRedFlags} critical red flag(s) open`);
    if (openCriticalExceptions > 0)
      reasons.push(`${openCriticalExceptions} critical exception(s) open`);
    const gatingReason = reasons.length ? `Blocked: ${reasons.join('; ')}` : null;
    return (prisma as any).checklistCertificate.upsert({
      where: {
        aura_checklist_certificate_unique: { tenantId: auth.tenantId, scope, period },
      },
      update: {
        runsExecuted,
        criticalRedFlags,
        openCriticalExceptions,
        gatingReason,
        generatedAt: new Date(),
        status: 'DRAFT',
      },
      create: {
        tenantId: auth.tenantId,
        scope,
        period,
        runsExecuted,
        criticalRedFlags,
        openCriticalExceptions,
        gatingReason,
        generatedAt: new Date(),
        status: 'DRAFT',
      },
    });
  }

  async sign(
    scope: string,
    period: string,
    attestations: Array<{ field: string; value: string }>,
    auth: AuthContext
  ) {
    const cert = await (prisma as any).checklistCertificate.findUnique({
      where: { aura_checklist_certificate_unique: { tenantId: auth.tenantId, scope, period } },
    });
    if (!cert) throw new Error('certificate not generated');
    if (cert.gatingReason) throw new Error(`cannot sign while gated: ${cert.gatingReason}`);
    return (prisma as any).checklistCertificate.update({
      where: { id: cert.id },
      data: {
        status: 'SIGNED',
        signedAt: new Date(),
        signedBy: auth.userId,
        attestationsJson: attestations,
      },
    });
  }
}

export const checklistCertificateService = new ChecklistCertificateService();
