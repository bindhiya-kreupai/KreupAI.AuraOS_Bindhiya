/**
 * EPIC-34-S28 (KPI compute) + S29 (go-live + monthly certificate).
 *
 * Aggregates HrmsConfigObject counts, implementation checklist openness,
 * connector health, and migration state into a monthly or GO_LIVE
 * certificate. Signing is gated by:
 *   - pendingApprovalCount > 0           → MAKER_CHECKER_PENDING
 *   - openImplementationItems > 0        → IMPLEMENTATION_OPEN  (GO_LIVE only)
 *   - failingConnectors > 0              → CONNECTOR_HEALTH
 *   - failingMigrations > 0              → MIGRATION_FAILED
 */

import { prisma } from '@aura/database';
import type { AuthContext } from './types';
import { hrmsImplementationService } from './implementation.service';
import { hrmsConnectorService } from './connector.service';
import { hrmsMigrationService } from './migration.service';

export type CertificateType = 'MONTHLY' | 'GO_LIVE';
export type CertificateStatus = 'DRAFT' | 'READY_TO_SIGN' | 'SIGNED' | 'GATED';

export interface DashboardSummary {
  totalConfigObjects: number;
  activeConfigObjects: number;
  pendingApprovalCount: number;
  openImplementationItems: number;
  failingConnectors: number;
  failingMigrations: number;
  domainsCovered: string[];
  certificateGated: boolean;
  gatingReason: string | null;
}

export class HrmsConfigCertificateService {
  /**
   * Snapshot the current config-workspace state. Used both by the
   * dashboard and by certificate generation.
   */
  async dashboard(tenantId: string): Promise<DashboardSummary> {
    const totalConfigObjects = await (prisma as any).hrmsConfigObject.count({
      where: { tenantId },
    });
    const activeConfigObjects = await (prisma as any).hrmsConfigObject.count({
      where: { tenantId, status: 'ACTIVE' },
    });
    const pendingApprovalCount = await (prisma as any).hrmsConfigObject.count({
      where: { tenantId, status: 'PENDING_APPROVAL' },
    });
    const openImplementationItems = await hrmsImplementationService.openMandatoryCount(tenantId);
    const failingConnectors = await hrmsConnectorService.failingCount(tenantId);
    const failingMigrations = await hrmsMigrationService.failingCount(tenantId);

    const distinct: Array<{ domainCode: string }> = await (prisma as any).hrmsConfigObject.findMany(
      {
        where: { tenantId, status: 'ACTIVE' },
        distinct: ['domainCode'],
        select: { domainCode: true },
      }
    );
    const domainsCovered = (distinct ?? []).map((r) => r.domainCode);

    const reasons: string[] = [];
    if (pendingApprovalCount > 0) reasons.push(`MAKER_CHECKER_PENDING(${pendingApprovalCount})`);
    if (failingConnectors > 0) reasons.push(`CONNECTOR_HEALTH(${failingConnectors})`);
    if (failingMigrations > 0) reasons.push(`MIGRATION_FAILED(${failingMigrations})`);
    const gatingReason = reasons.length ? reasons.join(' | ') : null;

    return {
      totalConfigObjects,
      activeConfigObjects,
      pendingApprovalCount,
      openImplementationItems,
      failingConnectors,
      failingMigrations,
      domainsCovered,
      certificateGated: gatingReason !== null,
      gatingReason,
    };
  }

  /** Compute the gating reason for a given certificate type. */
  private gatingFor(summary: DashboardSummary, certificateType: CertificateType): string | null {
    const reasons: string[] = [];
    if (summary.pendingApprovalCount > 0)
      reasons.push(`MAKER_CHECKER_PENDING(${summary.pendingApprovalCount})`);
    if (summary.failingConnectors > 0)
      reasons.push(`CONNECTOR_HEALTH(${summary.failingConnectors})`);
    if (summary.failingMigrations > 0)
      reasons.push(`MIGRATION_FAILED(${summary.failingMigrations})`);
    if (certificateType === 'GO_LIVE' && summary.openImplementationItems > 0) {
      reasons.push(`IMPLEMENTATION_OPEN(${summary.openImplementationItems})`);
    }
    return reasons.length ? reasons.join(' | ') : null;
  }

  async generate(input: { period: string; certificateType: CertificateType }, auth: AuthContext) {
    const summary = await this.dashboard(auth.tenantId);
    const gating = this.gatingFor(summary, input.certificateType);
    return (prisma as any).hrmsConfigCertificate.upsert({
      where: {
        aura_hrms_config_certificate_unique: {
          tenantId: auth.tenantId,
          period: input.period,
          certificateType: input.certificateType,
        },
      },
      update: {
        status: (gating ? 'GATED' : 'READY_TO_SIGN') as CertificateStatus,
        domainsCovered: summary.domainsCovered,
        totalConfigObjects: summary.totalConfigObjects,
        activeConfigObjects: summary.activeConfigObjects,
        pendingApprovalCount: summary.pendingApprovalCount,
        openImplementationItems: summary.openImplementationItems,
        failingConnectors: summary.failingConnectors,
        failingMigrations: summary.failingMigrations,
        gatingReason: gating,
      },
      create: {
        tenantId: auth.tenantId,
        period: input.period,
        certificateType: input.certificateType,
        status: (gating ? 'GATED' : 'READY_TO_SIGN') as CertificateStatus,
        domainsCovered: summary.domainsCovered,
        totalConfigObjects: summary.totalConfigObjects,
        activeConfigObjects: summary.activeConfigObjects,
        pendingApprovalCount: summary.pendingApprovalCount,
        openImplementationItems: summary.openImplementationItems,
        failingConnectors: summary.failingConnectors,
        failingMigrations: summary.failingMigrations,
        gatingReason: gating,
      },
    });
  }

  async sign(
    input: {
      period: string;
      certificateType: CertificateType;
      attestations?: Record<string, unknown>;
    },
    auth: AuthContext
  ) {
    const cert = await (prisma as any).hrmsConfigCertificate.findUnique({
      where: {
        aura_hrms_config_certificate_unique: {
          tenantId: auth.tenantId,
          period: input.period,
          certificateType: input.certificateType,
        },
      },
    });
    if (!cert) throw new Error('certificate not generated yet');
    if (cert.gatingReason) {
      throw new Error(`certificate is gated: ${cert.gatingReason}`);
    }
    return (prisma as any).hrmsConfigCertificate.update({
      where: { id: cert.id },
      data: {
        status: 'SIGNED' as CertificateStatus,
        signedBy: auth.userId,
        signedAt: new Date(),
        attestationsJson: (input.attestations ?? null) as any,
      },
    });
  }

  async list(
    tenantId: string,
    filter: { certificateType?: CertificateType; status?: CertificateStatus } = {}
  ) {
    return (prisma as any).hrmsConfigCertificate.findMany({
      where: {
        tenantId,
        ...(filter.certificateType ? { certificateType: filter.certificateType } : {}),
        ...(filter.status ? { status: filter.status } : {}),
      },
      orderBy: [{ certificateType: 'asc' }, { period: 'desc' }],
      take: 200,
    });
  }
}

export const hrmsConfigCertificateService = new HrmsConfigCertificateService();
