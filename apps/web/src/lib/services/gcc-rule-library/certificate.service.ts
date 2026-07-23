import { prisma } from '@aura/database';
import type { AuthContext } from './types';

export type DomainStatus = 'PASS' | 'WARN' | 'FAIL' | 'NOT_APPLICABLE';

export interface DomainStatusInput {
  domain: string;
  status: DomainStatus;
  note?: string;
}

export interface AttestationInput {
  field: string;
  value: string;
  attestedBy?: string;
}

const DEFAULT_DOMAINS = [
  'PAYROLL',
  'WPS',
  'SOCIAL_INSURANCE',
  'NATIONALIZATION',
  'IMMIGRATION',
  'RECORDS',
];

/**
 * EPIC-36-S07: Monthly country compliance certificate.
 *
 * - Generate gathers per-domain status + critical-risk count. Cannot sign if
 *   any critical risk is still open.
 * - Signing flips status to SIGNED with timestamp + signer.
 */
export class CountryComplianceCertificateService {
  async list(tenantId: string, filter: { period?: string; countryCode?: string } = {}) {
    return (prisma as any).countryComplianceCertificate.findMany({
      where: {
        tenantId,
        ...(filter.period ? { period: filter.period } : {}),
        ...(filter.countryCode ? { countryCode: filter.countryCode.toUpperCase() } : {}),
      },
      orderBy: [{ countryCode: 'asc' }, { period: 'desc' }],
    });
  }

  async generate(
    countryCode: string,
    period: string,
    domainStatus: DomainStatusInput[] | undefined,
    auth: AuthContext
  ) {
    const cc = countryCode.toUpperCase();
    const statuses =
      domainStatus ??
      DEFAULT_DOMAINS.map((d) => ({ domain: d, status: 'NOT_APPLICABLE' as DomainStatus }));
    const criticalOpen = await (prisma as any).countryRiskMatrix.count({
      where: {
        tenantId: auth.tenantId,
        countryCode: cc,
        rating: 'CRITICAL',
        status: { in: ['OPEN', 'MITIGATING'] },
      },
    });
    const failing = statuses.filter((s) => s.status === 'FAIL').length;
    const gatingReason =
      criticalOpen > 0
        ? `Blocked: ${criticalOpen} critical risk(s) open`
        : failing > 0
          ? `${failing} domain(s) FAIL`
          : undefined;

    return (prisma as any).countryComplianceCertificate.upsert({
      where: {
        tenantId_countryCode_period: {
          tenantId: auth.tenantId,
          countryCode: cc,
          period,
        },
      },
      update: {
        domainStatus: statuses,
        criticalOpenRisks: criticalOpen,
        gatingReason,
        generatedAt: new Date(),
        status: 'DRAFT',
        updatedBy: auth.userId,
      },
      create: {
        tenantId: auth.tenantId,
        countryCode: cc,
        period,
        domainStatus: statuses,
        criticalOpenRisks: criticalOpen,
        gatingReason,
        generatedAt: new Date(),
        status: 'DRAFT',
        createdBy: auth.userId,
        updatedBy: auth.userId,
      },
    });
  }

  async sign(
    countryCode: string,
    period: string,
    attestations: AttestationInput[],
    auth: AuthContext
  ) {
    const cc = countryCode.toUpperCase();
    const cert = await (prisma as any).countryComplianceCertificate.findUnique({
      where: {
        tenantId_countryCode_period: {
          tenantId: auth.tenantId,
          countryCode: cc,
          period,
        },
      },
    });
    if (!cert) throw new Error('certificate not generated yet');
    if (cert.gatingReason) {
      throw new Error(`cannot sign while gated: ${cert.gatingReason}`);
    }
    return (prisma as any).countryComplianceCertificate.update({
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
}

export const countryComplianceCertificateService = new CountryComplianceCertificateService();
