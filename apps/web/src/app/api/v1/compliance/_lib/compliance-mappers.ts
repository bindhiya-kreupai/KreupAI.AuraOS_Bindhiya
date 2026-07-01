/**
 * Shared mapping + seeding helpers for the /api/v1/compliance/{frameworks,controls,timeline}
 * route family. These map raw Prisma rows to the exact shapes the
 * complianceFrameworkService client expects (no {success,data} wrapper).
 */

const iso = (d: Date | null | undefined): string | undefined =>
  d ? new Date(d).toISOString() : undefined;

const isoOr = (d: Date | null | undefined, fallback: string): string =>
  d ? new Date(d).toISOString() : fallback;

export function mapEvidence(row: any) {
  return {
    id: row.id,
    controlId: row.controlId,
    fileName: row.fileName,
    fileType: row.fileType,
    fileSize: row.fileSize ?? 0,
    description: row.description ?? '',
    uploadedBy: row.uploadedBy ?? '',
    uploadedAt: isoOr(row.createdAt, new Date().toISOString()),
    effectiveDate: iso(row.effectiveDate) ?? '',
    expiresAt: iso(row.expiresAt),
    status: row.status ?? 'pending',
    verifiedBy: row.verifiedBy ?? undefined,
    verifiedAt: iso(row.verifiedAt),
  };
}

export function mapTest(row: any) {
  return {
    id: row.id,
    controlId: row.controlId,
    testName: row.testName,
    result: row.result,
    runAt: isoOr(row.runAt, new Date().toISOString()),
    runBy: row.runBy ?? '',
    duration: row.duration ?? 0,
    details: row.details ?? '',
    remediationRequired: row.remediationRequired ?? undefined,
  };
}

export function mapControl(row: any) {
  return {
    id: row.id,
    frameworkId: row.frameworkId,
    code: row.code,
    name: row.name,
    description: row.description ?? '',
    category: row.category,
    status: row.status,
    ownerId: row.ownerId ?? '',
    ownerName: row.ownerName ?? '',
    lastTested: iso(row.lastTested) ?? '',
    nextTestDue: iso(row.nextTestDue) ?? '',
    evidence: Array.isArray(row.evidence) ? row.evidence.map(mapEvidence) : [],
    testHistory: Array.isArray(row.tests) ? row.tests.map(mapTest) : [],
    remediationPlan: row.remediationPlan ?? undefined,
    relatedControls: Array.isArray(row.relatedControls) ? row.relatedControls : [],
    riskLevel: row.riskLevel ?? 'medium',
  };
}

export function mapFramework(row: any) {
  return {
    id: row.id,
    name: row.name,
    fullName: row.fullName,
    description: row.description ?? '',
    version: row.version ?? '1.0',
    totalControls: Array.isArray(row.controls) ? row.controls.length : 0,
    readinessScore: row.readinessScore ?? 0,
    status: row.status ?? 'in-progress',
    certificationDate: iso(row.certificationDate),
    certificationExpiry: iso(row.certificationExpiry),
    nextAuditDate: iso(row.nextAuditDate) ?? '',
    auditor: row.auditor ?? undefined,
    controls: Array.isArray(row.controls) ? row.controls.map(mapControl) : [],
  };
}

export function mapTimelineEvent(row: any) {
  return {
    id: row.id,
    frameworkId: row.frameworkId ?? '',
    frameworkName: row.frameworkName ?? '',
    type: row.type,
    title: row.title,
    date: iso(row.date) ?? '',
    description: row.description ?? '',
    priority: row.priority ?? 'medium',
    completed: row.completed ?? false,
  };
}

/**
 * Default framework + control seed data used the first time a tenant loads the
 * compliance page. Idempotent: callers only seed when the tenant has zero rows.
 */
export const DEFAULT_FRAMEWORK_SEED = [
  {
    code: 'soc2',
    name: 'SOC 2',
    fullName: 'System and Organization Controls 2',
    description:
      'Trust Services Criteria for security, availability, processing integrity, confidentiality, and privacy.',
    version: 'Type II',
    status: 'in-progress',
    readinessScore: 83,
    certificationDate: new Date('2025-06-15T00:00:00Z'),
    certificationExpiry: new Date('2026-06-15T00:00:00Z'),
    nextAuditDate: new Date('2026-04-01T00:00:00Z'),
    auditor: 'Deloitte & Touche LLP',
    controls: [
      {
        code: 'CC1.1',
        name: 'Control Environment — COSO Principles',
        description: 'The entity demonstrates a commitment to integrity and ethical values.',
        category: 'Control Environment',
        status: 'compliant',
        riskLevel: 'high',
        ownerName: 'Robert Chen (CISO)',
      },
      {
        code: 'CC6.1',
        name: 'Logical Access Security — Access Controls',
        description:
          'The entity implements logical access security software over protected information assets.',
        category: 'Logical & Physical Access Controls',
        status: 'compliant',
        riskLevel: 'critical',
        ownerName: 'Alice Nguyen (IT Security)',
      },
      {
        code: 'CC7.1',
        name: 'System Operations — Detection of Anomalies',
        description:
          'The entity uses detection and monitoring procedures to identify changes to configurations.',
        category: 'System Operations',
        status: 'partial',
        riskLevel: 'high',
        ownerName: 'Dev Kumar (DevSecOps)',
      },
    ],
  },
  {
    code: 'iso27001',
    name: 'ISO 27001',
    fullName: 'ISO/IEC 27001:2022 Information Security',
    description: 'International standard for information security management systems (ISMS).',
    version: '2022',
    status: 'certified',
    readinessScore: 80,
    certificationDate: new Date('2025-03-20T00:00:00Z'),
    certificationExpiry: new Date('2028-03-20T00:00:00Z'),
    nextAuditDate: new Date('2026-09-15T00:00:00Z'),
    auditor: 'BSI Group',
    controls: [
      {
        code: 'A.9.1.1',
        name: 'Access Control Policy',
        description: 'An access control policy shall be established, documented, and reviewed.',
        category: 'A.9 Access Control',
        status: 'compliant',
        riskLevel: 'high',
        ownerName: 'Alice Nguyen (IT Security)',
      },
      {
        code: 'A.10.1.1',
        name: 'Encryption — Policy on the Use of Cryptographic Controls',
        description: 'A policy on the use of cryptographic controls for protection of information.',
        category: 'A.10 Cryptography',
        status: 'compliant',
        riskLevel: 'critical',
        ownerName: 'Dev Kumar (DevSecOps)',
      },
      {
        code: 'A.12.6.1',
        name: 'Management of Technical Vulnerabilities',
        description:
          'Information about technical vulnerabilities shall be obtained in a timely fashion.',
        category: 'A.12 Operations Security',
        status: 'partial',
        riskLevel: 'high',
        ownerName: 'Dev Kumar (DevSecOps)',
      },
    ],
  },
  {
    code: 'gdpr',
    name: 'GDPR',
    fullName: 'General Data Protection Regulation',
    description:
      'EU regulation on data protection and privacy for all individuals within the EU and EEA.',
    version: '2018',
    status: 'certified',
    readinessScore: 91,
    nextAuditDate: new Date('2026-05-25T00:00:00Z'),
    controls: [
      {
        code: 'Art.30',
        name: 'Records of Processing Activities',
        description: 'Maintain a record of processing activities under its responsibility.',
        category: 'Accountability',
        status: 'compliant',
        riskLevel: 'high',
        ownerName: 'James Wilson (Legal)',
      },
      {
        code: 'Art.32',
        name: 'Security of Processing',
        description:
          'Implement appropriate technical and organisational measures to ensure security.',
        category: 'Security',
        status: 'compliant',
        riskLevel: 'critical',
        ownerName: 'Robert Chen (CISO)',
      },
    ],
  },
] as const;

export const DEFAULT_TIMELINE_SEED = [
  {
    frameworkCode: 'soc2',
    frameworkName: 'SOC 2',
    type: 'audit',
    title: 'SOC 2 Type II Audit — Field Work',
    date: new Date('2026-04-01T00:00:00Z'),
    description: 'Evidence review and control testing for SOC 2 Type II certification.',
    priority: 'high',
  },
  {
    frameworkCode: 'gdpr',
    frameworkName: 'GDPR',
    type: 'assessment',
    title: 'Annual GDPR Data Protection Assessment',
    date: new Date('2026-05-25T00:00:00Z'),
    description: 'Annual review of GDPR compliance posture and consent records.',
    priority: 'high',
  },
  {
    frameworkCode: 'soc2',
    frameworkName: 'SOC 2',
    type: 'certification',
    title: 'SOC 2 Certification Renewal',
    date: new Date('2026-06-15T00:00:00Z'),
    description: 'Current SOC 2 certification expires. Complete Type II audit before this date.',
    priority: 'high',
  },
  {
    frameworkCode: 'iso27001',
    frameworkName: 'ISO 27001',
    type: 'audit',
    title: 'ISO 27001 Surveillance Audit',
    date: new Date('2026-09-15T00:00:00Z'),
    description: 'BSI Group annual surveillance audit to maintain ISO 27001:2022 certification.',
    priority: 'medium',
  },
] as const;
