/**
 * @module complianceFrameworkService
 * @description Compliance Framework Service — SOC 2, ISO 27001, GDPR, HIPAA, SOX controls,
 *              evidence management, control testing, and audit readiness scoring.
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

// ============================================================================
// TYPES
// ============================================================================

export type ControlStatus = 'compliant' | 'partial' | 'non-compliant' | 'not-applicable';
export type EvidenceStatus = 'verified' | 'pending' | 'expired' | 'rejected';
export type FrameworkId = 'soc2' | 'iso27001' | 'gdpr' | 'hipaa' | 'sox';

export interface ComplianceEvidence {
  id: string;
  controlId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  description: string;
  uploadedBy: string;
  uploadedAt: string;
  effectiveDate: string;
  expiresAt?: string;
  status: EvidenceStatus;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface ControlTest {
  id: string;
  controlId: string;
  testName: string;
  result: 'pass' | 'fail' | 'partial' | 'skipped';
  runAt: string;
  runBy: string;
  duration: number; // seconds
  details: string;
  remediationRequired?: string;
}

export interface ComplianceControl {
  id: string;
  frameworkId: FrameworkId;
  code: string; // e.g., "CC6.1" for SOC 2 or "A.9.1.1" for ISO 27001
  name: string;
  description: string;
  category: string;
  status: ControlStatus;
  ownerId: string;
  ownerName: string;
  lastTested: string;
  nextTestDue: string;
  evidence: ComplianceEvidence[];
  testHistory: ControlTest[];
  remediationPlan?: string;
  relatedControls: string[];
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
}

export interface FrameworkReadiness {
  frameworkId: FrameworkId;
  overallScore: number; // 0-100
  compliantCount: number;
  partialCount: number;
  nonCompliantCount: number;
  notApplicableCount: number;
  totalControls: number;
  categoryBreakdown: {
    category: string;
    score: number;
    compliant: number;
    total: number;
  }[];
  criticalGaps: string[];
  lastAssessedAt: string;
  nextAuditDate: string;
  certificationExpiry?: string;
}

export interface ComplianceFramework {
  id: FrameworkId;
  name: string;
  fullName: string;
  description: string;
  version: string;
  totalControls: number;
  readinessScore: number;
  status: 'certified' | 'in-progress' | 'not-started' | 'expired';
  certificationDate?: string;
  certificationExpiry?: string;
  nextAuditDate: string;
  auditor?: string;
  controls: ComplianceControl[];
}

export interface ComplianceTimeline {
  id: string;
  frameworkId: FrameworkId;
  frameworkName: string;
  type: 'audit' | 'certification' | 'renewal' | 'assessment' | 'deadline';
  title: string;
  date: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

export interface SubmitEvidenceInput {
  controlId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  description: string;
  effectiveDate: string;
  expiresAt?: string;
}

export interface ControlTestResult {
  testId: string;
  controlId: string;
  result: 'pass' | 'fail' | 'partial';
  details: string;
  remediationRequired?: string;
  completedAt: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_SOC2_CONTROLS: ComplianceControl[] = [
  {
    id: 'ctrl-soc2-001',
    frameworkId: 'soc2',
    code: 'CC1.1',
    name: 'Control Environment — COSO Principles',
    description: 'The entity demonstrates a commitment to integrity and ethical values.',
    category: 'Control Environment',
    status: 'compliant',
    ownerId: 'emp-010',
    ownerName: 'Robert Chen (CISO)',
    lastTested: '2026-01-15T10:00:00Z',
    nextTestDue: '2026-04-15T10:00:00Z',
    riskLevel: 'high',
    relatedControls: ['ctrl-soc2-002', 'ctrl-soc2-003'],
    evidence: [
      {
        id: 'ev-001',
        controlId: 'ctrl-soc2-001',
        fileName: 'Code_of_Conduct_2026.pdf',
        fileType: 'application/pdf',
        fileSize: 512000,
        description: 'Updated Code of Conduct signed by all employees',
        uploadedBy: 'hr-admin',
        uploadedAt: '2026-01-10T09:00:00Z',
        effectiveDate: '2026-01-01',
        status: 'verified',
        verifiedBy: 'auditor@company.com',
        verifiedAt: '2026-01-12T11:00:00Z',
      },
    ],
    testHistory: [
      {
        id: 'test-001',
        controlId: 'ctrl-soc2-001',
        testName: 'Code of Conduct Acknowledgment Check',
        result: 'pass',
        runAt: '2026-01-15T10:00:00Z',
        runBy: 'audit-bot',
        duration: 12,
        details:
          '100% of employees have acknowledged the Code of Conduct within the last 12 months.',
      },
    ],
  },
  {
    id: 'ctrl-soc2-002',
    frameworkId: 'soc2',
    code: 'CC6.1',
    name: 'Logical Access Security — Access Controls',
    description:
      'The entity implements logical access security software, infrastructure, and architectures over protected information assets.',
    category: 'Logical & Physical Access Controls',
    status: 'compliant',
    ownerId: 'emp-011',
    ownerName: 'Alice Nguyen (IT Security)',
    lastTested: '2026-02-01T09:00:00Z',
    nextTestDue: '2026-05-01T09:00:00Z',
    riskLevel: 'critical',
    relatedControls: ['ctrl-soc2-003'],
    evidence: [
      {
        id: 'ev-002',
        controlId: 'ctrl-soc2-002',
        fileName: 'Access_Review_Q4_2025.xlsx',
        fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        fileSize: 128000,
        description: 'Quarterly access review report for all systems',
        uploadedBy: 'it-security',
        uploadedAt: '2026-01-20T14:00:00Z',
        effectiveDate: '2025-12-31',
        status: 'verified',
        verifiedBy: 'compliance@company.com',
        verifiedAt: '2026-01-22T10:00:00Z',
      },
    ],
    testHistory: [
      {
        id: 'test-002',
        controlId: 'ctrl-soc2-002',
        testName: 'Privileged Access Review Automation',
        result: 'pass',
        runAt: '2026-02-01T09:00:00Z',
        runBy: 'audit-bot',
        duration: 45,
        details:
          'All privileged accounts have valid business justification. No orphaned accounts found.',
      },
    ],
  },
  {
    id: 'ctrl-soc2-003',
    frameworkId: 'soc2',
    code: 'CC6.6',
    name: 'Logical Access — External Threats',
    description:
      'The entity implements controls to prevent or detect and act upon the introduction of unauthorized or malicious software.',
    category: 'Logical & Physical Access Controls',
    status: 'partial',
    ownerId: 'emp-011',
    ownerName: 'Alice Nguyen (IT Security)',
    lastTested: '2026-01-20T11:00:00Z',
    nextTestDue: '2026-04-20T11:00:00Z',
    riskLevel: 'high',
    relatedControls: ['ctrl-soc2-002'],
    evidence: [],
    testHistory: [
      {
        id: 'test-003',
        controlId: 'ctrl-soc2-003',
        testName: 'Endpoint Protection Coverage Check',
        result: 'partial',
        runAt: '2026-01-20T11:00:00Z',
        runBy: 'audit-bot',
        duration: 30,
        details: 'EDR coverage is at 94% — 12 endpoints missing agent installation.',
        remediationRequired: 'Deploy EDR agent to remaining 12 endpoints within 30 days.',
      },
    ],
    remediationPlan:
      'Deploy endpoint detection and response (EDR) agents to remaining 12 endpoints. ETA: March 1, 2026.',
  },
  {
    id: 'ctrl-soc2-004',
    frameworkId: 'soc2',
    code: 'CC7.1',
    name: 'System Operations — Detection of Anomalies',
    description:
      'The entity uses detection and monitoring procedures to identify changes to configurations that could result in the introduction of vulnerabilities.',
    category: 'System Operations',
    status: 'compliant',
    ownerId: 'emp-012',
    ownerName: 'Dev Kumar (DevSecOps)',
    lastTested: '2026-02-10T08:00:00Z',
    nextTestDue: '2026-05-10T08:00:00Z',
    riskLevel: 'high',
    relatedControls: [],
    evidence: [],
    testHistory: [
      {
        id: 'test-004',
        controlId: 'ctrl-soc2-004',
        testName: 'SIEM Alert Review',
        result: 'pass',
        runAt: '2026-02-10T08:00:00Z',
        runBy: 'audit-bot',
        duration: 60,
        details: 'SIEM rules are current and alerting correctly. No unreviewed critical alerts.',
      },
    ],
  },
  {
    id: 'ctrl-soc2-005',
    frameworkId: 'soc2',
    code: 'CC8.1',
    name: 'Change Management Process',
    description:
      'The entity authorizes, designs, develops or acquires, configures, documents, tests, approves, and implements changes.',
    category: 'Change Management',
    status: 'compliant',
    ownerId: 'emp-013',
    ownerName: 'Maria Garcia (Engineering)',
    lastTested: '2026-01-25T13:00:00Z',
    nextTestDue: '2026-04-25T13:00:00Z',
    riskLevel: 'medium',
    relatedControls: [],
    evidence: [],
    testHistory: [
      {
        id: 'test-005',
        controlId: 'ctrl-soc2-005',
        testName: 'Change Approval Workflow Audit',
        result: 'pass',
        runAt: '2026-01-25T13:00:00Z',
        runBy: 'compliance-team',
        duration: 120,
        details:
          'All sampled production changes had proper approvals, tickets, and rollback plans.',
      },
    ],
  },
  {
    id: 'ctrl-soc2-006',
    frameworkId: 'soc2',
    code: 'CC9.1',
    name: 'Risk Management — Identification and Mitigation',
    description:
      'The entity identifies, selects, and develops risk mitigation activities for risks arising from potential business disruptions.',
    category: 'Risk Management',
    status: 'partial',
    ownerId: 'emp-010',
    ownerName: 'Robert Chen (CISO)',
    lastTested: '2026-01-05T10:00:00Z',
    nextTestDue: '2026-04-05T10:00:00Z',
    riskLevel: 'high',
    relatedControls: [],
    evidence: [],
    testHistory: [
      {
        id: 'test-006',
        controlId: 'ctrl-soc2-006',
        testName: 'Risk Register Review',
        result: 'partial',
        runAt: '2026-01-05T10:00:00Z',
        runBy: 'compliance-team',
        duration: 90,
        details:
          'Risk register exists but has not been reviewed in 6 months. 3 risks lack mitigation owners.',
        remediationRequired: 'Update risk register and assign owners to all open risks.',
      },
    ],
    remediationPlan:
      'Schedule quarterly risk register review. Assign owners to 3 unmitigated risks by Feb 28, 2026.',
  },
  {
    id: 'ctrl-soc2-007',
    frameworkId: 'soc2',
    code: 'A1.1',
    name: 'Availability — Performance Monitoring',
    description:
      'The entity maintains, monitors, and evaluates current processing capacity to manage demand for the system.',
    category: 'Availability',
    status: 'compliant',
    ownerId: 'emp-012',
    ownerName: 'Dev Kumar (DevSecOps)',
    lastTested: '2026-02-15T07:00:00Z',
    nextTestDue: '2026-05-15T07:00:00Z',
    riskLevel: 'medium',
    relatedControls: [],
    evidence: [],
    testHistory: [
      {
        id: 'test-007',
        controlId: 'ctrl-soc2-007',
        testName: 'Uptime SLA Verification',
        result: 'pass',
        runAt: '2026-02-15T07:00:00Z',
        runBy: 'audit-bot',
        duration: 15,
        details: '99.97% uptime achieved in the last 90 days. SLA threshold is 99.9%.',
      },
    ],
  },
  {
    id: 'ctrl-soc2-008',
    frameworkId: 'soc2',
    code: 'PI1.1',
    name: 'Processing Integrity — Completeness',
    description:
      'The entity obtains or generates, uses, and communicates relevant, quality information to support the functioning of internal control.',
    category: 'Processing Integrity',
    status: 'non-compliant',
    ownerId: 'emp-014',
    ownerName: 'Susan Park (Data)',
    lastTested: '2026-01-10T14:00:00Z',
    nextTestDue: '2026-04-10T14:00:00Z',
    riskLevel: 'critical',
    relatedControls: [],
    evidence: [],
    testHistory: [
      {
        id: 'test-008',
        controlId: 'ctrl-soc2-008',
        testName: 'Data Completeness Check',
        result: 'fail',
        runAt: '2026-01-10T14:00:00Z',
        runBy: 'audit-bot',
        duration: 30,
        details:
          'Data reconciliation reports are missing for 3 of the last 12 months. Data integrity controls not fully implemented.',
        remediationRequired:
          'Implement automated data reconciliation and generate missing reports.',
      },
    ],
    remediationPlan:
      'Implement automated daily data reconciliation pipeline. Generate historical reports for missing months. Target: March 31, 2026.',
  },
  {
    id: 'ctrl-soc2-009',
    frameworkId: 'soc2',
    code: 'C1.1',
    name: 'Confidentiality — Classification',
    description:
      "The entity identifies and maintains confidential information to meet the entity's objectives related to confidentiality.",
    category: 'Confidentiality',
    status: 'compliant',
    ownerId: 'emp-014',
    ownerName: 'Susan Park (Data)',
    lastTested: '2026-02-05T10:00:00Z',
    nextTestDue: '2026-05-05T10:00:00Z',
    riskLevel: 'high',
    relatedControls: [],
    evidence: [],
    testHistory: [
      {
        id: 'test-009',
        controlId: 'ctrl-soc2-009',
        testName: 'Data Classification Audit',
        result: 'pass',
        runAt: '2026-02-05T10:00:00Z',
        runBy: 'compliance-team',
        duration: 60,
        details: 'Data classification scheme is documented and implemented across all data stores.',
      },
    ],
  },
  {
    id: 'ctrl-soc2-010',
    frameworkId: 'soc2',
    code: 'P1.1',
    name: 'Privacy — Notice and Communication',
    description:
      "The entity provides notice to data subjects about its privacy practices to meet the entity's objectives related to privacy.",
    category: 'Privacy',
    status: 'compliant',
    ownerId: 'emp-015',
    ownerName: 'James Wilson (Legal)',
    lastTested: '2026-01-28T11:00:00Z',
    nextTestDue: '2026-04-28T11:00:00Z',
    riskLevel: 'medium',
    relatedControls: [],
    evidence: [],
    testHistory: [
      {
        id: 'test-010',
        controlId: 'ctrl-soc2-010',
        testName: 'Privacy Notice Currency Check',
        result: 'pass',
        runAt: '2026-01-28T11:00:00Z',
        runBy: 'legal-team',
        duration: 30,
        details: 'Privacy notices are current, accessible, and cover all required disclosures.',
      },
    ],
  },
  {
    id: 'ctrl-soc2-011',
    frameworkId: 'soc2',
    code: 'CC5.3',
    name: 'Control Activities — Segregation of Duties',
    description:
      'The entity deploys control activities through policies that establish what is expected and procedures that put policies into action.',
    category: 'Control Activities',
    status: 'compliant',
    ownerId: 'emp-016',
    ownerName: 'Tom Bradley (Finance)',
    lastTested: '2026-02-20T09:00:00Z',
    nextTestDue: '2026-05-20T09:00:00Z',
    riskLevel: 'high',
    relatedControls: [],
    evidence: [],
    testHistory: [
      {
        id: 'test-011',
        controlId: 'ctrl-soc2-011',
        testName: 'SoD Conflict Check',
        result: 'pass',
        runAt: '2026-02-20T09:00:00Z',
        runBy: 'audit-bot',
        duration: 25,
        details: 'No Segregation of Duties conflicts detected across all financial roles.',
      },
    ],
  },
  {
    id: 'ctrl-soc2-012',
    frameworkId: 'soc2',
    code: 'CC4.1',
    name: 'Monitoring — Ongoing and Separate Evaluations',
    description:
      'The entity uses a variety of ongoing and separate evaluations, including periodic internal audits and management reviews.',
    category: 'Monitoring Activities',
    status: 'compliant',
    ownerId: 'emp-010',
    ownerName: 'Robert Chen (CISO)',
    lastTested: '2026-02-22T10:00:00Z',
    nextTestDue: '2026-05-22T10:00:00Z',
    riskLevel: 'medium',
    relatedControls: [],
    evidence: [],
    testHistory: [
      {
        id: 'test-012',
        controlId: 'ctrl-soc2-012',
        testName: 'Internal Audit Schedule Verification',
        result: 'pass',
        runAt: '2026-02-22T10:00:00Z',
        runBy: 'compliance-team',
        duration: 20,
        details: 'Internal audit schedule is current and on track. Q1 2026 audit completed.',
      },
    ],
  },
];

const MOCK_ISO27001_CONTROLS: ComplianceControl[] = [
  {
    id: 'ctrl-iso-001',
    frameworkId: 'iso27001',
    code: 'A.9.1.1',
    name: 'Access Control Policy',
    description:
      'An access control policy shall be established, documented, and reviewed based on business and information security requirements.',
    category: 'A.9 Access Control',
    status: 'compliant',
    ownerId: 'emp-011',
    ownerName: 'Alice Nguyen (IT Security)',
    lastTested: '2026-01-20T10:00:00Z',
    nextTestDue: '2026-07-20T10:00:00Z',
    riskLevel: 'high',
    relatedControls: ['ctrl-iso-002'],
    evidence: [],
    testHistory: [
      {
        id: 'test-iso-001',
        controlId: 'ctrl-iso-001',
        testName: 'Access Control Policy Review',
        result: 'pass',
        runAt: '2026-01-20T10:00:00Z',
        runBy: 'iso-auditor',
        duration: 45,
        details: 'Access control policy is current (revised Jan 2026) and approved by CISO.',
      },
    ],
  },
  {
    id: 'ctrl-iso-002',
    frameworkId: 'iso27001',
    code: 'A.10.1.1',
    name: 'Encryption — Policy on the Use of Cryptographic Controls',
    description:
      'A policy on the use of cryptographic controls for protection of information shall be developed and implemented.',
    category: 'A.10 Cryptography',
    status: 'compliant',
    ownerId: 'emp-012',
    ownerName: 'Dev Kumar (DevSecOps)',
    lastTested: '2026-02-01T11:00:00Z',
    nextTestDue: '2026-08-01T11:00:00Z',
    riskLevel: 'critical',
    relatedControls: [],
    evidence: [],
    testHistory: [
      {
        id: 'test-iso-002',
        controlId: 'ctrl-iso-002',
        testName: 'Encryption Standards Audit',
        result: 'pass',
        runAt: '2026-02-01T11:00:00Z',
        runBy: 'iso-auditor',
        duration: 60,
        details: 'All data at rest encrypted with AES-256. All data in transit uses TLS 1.3.',
      },
    ],
  },
  {
    id: 'ctrl-iso-003',
    frameworkId: 'iso27001',
    code: 'A.12.6.1',
    name: 'Management of Technical Vulnerabilities',
    description:
      'Information about technical vulnerabilities of information systems in use shall be obtained in a timely fashion.',
    category: 'A.12 Operations Security',
    status: 'partial',
    ownerId: 'emp-012',
    ownerName: 'Dev Kumar (DevSecOps)',
    lastTested: '2026-01-15T09:00:00Z',
    nextTestDue: '2026-04-15T09:00:00Z',
    riskLevel: 'high',
    relatedControls: [],
    evidence: [],
    testHistory: [
      {
        id: 'test-iso-003',
        controlId: 'ctrl-iso-003',
        testName: 'Vulnerability Scan Coverage',
        result: 'partial',
        runAt: '2026-01-15T09:00:00Z',
        runBy: 'security-team',
        duration: 180,
        details:
          'Vulnerability scanning covers 87% of assets. 3 legacy systems lack scanner agents.',
        remediationRequired: 'Extend vulnerability scanning to all legacy systems.',
      },
    ],
    remediationPlan:
      'Install vulnerability scanning agents on 3 legacy systems. Complete by March 15, 2026.',
  },
  {
    id: 'ctrl-iso-004',
    frameworkId: 'iso27001',
    code: 'A.16.1.1',
    name: 'Incident Management — Responsibilities and Procedures',
    description:
      'Management responsibilities and procedures shall be established to ensure a quick, effective, and orderly response to information security incidents.',
    category: 'A.16 Information Security Incident Management',
    status: 'compliant',
    ownerId: 'emp-010',
    ownerName: 'Robert Chen (CISO)',
    lastTested: '2026-02-10T10:00:00Z',
    nextTestDue: '2026-08-10T10:00:00Z',
    riskLevel: 'critical',
    relatedControls: [],
    evidence: [],
    testHistory: [
      {
        id: 'test-iso-004',
        controlId: 'ctrl-iso-004',
        testName: 'Incident Response Plan Test',
        result: 'pass',
        runAt: '2026-02-10T10:00:00Z',
        runBy: 'security-team',
        duration: 240,
        details:
          'Tabletop exercise completed. All response procedures validated. Mean time to respond: 45 minutes.',
      },
    ],
  },
  {
    id: 'ctrl-iso-005',
    frameworkId: 'iso27001',
    code: 'A.17.1.1',
    name: 'Business Continuity Management',
    description:
      'The organization shall determine its requirements for information security and the continuity of information security management in adverse situations.',
    category: 'A.17 Business Continuity',
    status: 'compliant',
    ownerId: 'emp-017',
    ownerName: 'Lisa Thompson (Operations)',
    lastTested: '2026-01-30T09:00:00Z',
    nextTestDue: '2026-07-30T09:00:00Z',
    riskLevel: 'high',
    relatedControls: [],
    evidence: [],
    testHistory: [
      {
        id: 'test-iso-005',
        controlId: 'ctrl-iso-005',
        testName: 'DR Failover Test',
        result: 'pass',
        runAt: '2026-01-30T09:00:00Z',
        runBy: 'devops-team',
        duration: 300,
        details:
          'Full disaster recovery test completed. RTO achieved: 3.5 hours (target: 4 hours). RPO: 15 minutes (target: 1 hour).',
      },
    ],
  },
  {
    id: 'ctrl-iso-006',
    frameworkId: 'iso27001',
    code: 'A.7.2.2',
    name: 'Information Security Awareness and Training',
    description:
      'All employees of the organization and, where relevant, contractors shall receive appropriate awareness education and training.',
    category: 'A.7 Human Resource Security',
    status: 'compliant',
    ownerId: 'emp-003',
    ownerName: 'Sarah Lee (HR Manager)',
    lastTested: '2026-02-01T10:00:00Z',
    nextTestDue: '2026-08-01T10:00:00Z',
    riskLevel: 'medium',
    relatedControls: [],
    evidence: [],
    testHistory: [
      {
        id: 'test-iso-006',
        controlId: 'ctrl-iso-006',
        testName: 'Security Training Completion Rate',
        result: 'pass',
        runAt: '2026-02-01T10:00:00Z',
        runBy: 'hr-team',
        duration: 20,
        details: '96% completion rate for mandatory security awareness training.',
      },
    ],
  },
  {
    id: 'ctrl-iso-007',
    frameworkId: 'iso27001',
    code: 'A.11.1.1',
    name: 'Physical Security Perimeter',
    description:
      'Security perimeters shall be defined and used to protect areas that contain either sensitive or critical information and information processing facilities.',
    category: 'A.11 Physical Security',
    status: 'compliant',
    ownerId: 'emp-018',
    ownerName: 'Mark Johnson (Facilities)',
    lastTested: '2026-01-25T11:00:00Z',
    nextTestDue: '2026-07-25T11:00:00Z',
    riskLevel: 'high',
    relatedControls: [],
    evidence: [],
    testHistory: [
      {
        id: 'test-iso-007',
        controlId: 'ctrl-iso-007',
        testName: 'Physical Access Audit',
        result: 'pass',
        runAt: '2026-01-25T11:00:00Z',
        runBy: 'facilities-team',
        duration: 60,
        details:
          'All server rooms and data centers have appropriate physical access controls. Badge logs reviewed.',
      },
    ],
  },
  {
    id: 'ctrl-iso-008',
    frameworkId: 'iso27001',
    code: 'A.13.1.1',
    name: 'Network Security Management',
    description:
      'Networks shall be managed and controlled to protect information in systems and applications.',
    category: 'A.13 Communications Security',
    status: 'non-compliant',
    ownerId: 'emp-012',
    ownerName: 'Dev Kumar (DevSecOps)',
    lastTested: '2026-01-12T10:00:00Z',
    nextTestDue: '2026-04-12T10:00:00Z',
    riskLevel: 'critical',
    relatedControls: [],
    evidence: [],
    testHistory: [
      {
        id: 'test-iso-008',
        controlId: 'ctrl-iso-008',
        testName: 'Network Segmentation Audit',
        result: 'fail',
        runAt: '2026-01-12T10:00:00Z',
        runBy: 'security-team',
        duration: 120,
        details:
          'Development and production networks are not properly segmented. Lateral movement is possible.',
        remediationRequired:
          'Implement proper network segmentation between dev and prod environments immediately.',
      },
    ],
    remediationPlan:
      'Implement firewall rules and VLANs to isolate development from production. Estimated completion: March 15, 2026. Priority: Critical.',
  },
  {
    id: 'ctrl-iso-009',
    frameworkId: 'iso27001',
    code: 'A.15.1.1',
    name: 'Supplier Relationships — Information Security Policy',
    description:
      "Information security requirements for mitigating the risks associated with supplier's access to the organization's assets shall be agreed with the supplier.",
    category: 'A.15 Supplier Relationships',
    status: 'partial',
    ownerId: 'emp-015',
    ownerName: 'James Wilson (Legal)',
    lastTested: '2026-01-18T14:00:00Z',
    nextTestDue: '2026-07-18T14:00:00Z',
    riskLevel: 'high',
    relatedControls: [],
    evidence: [],
    testHistory: [
      {
        id: 'test-iso-009',
        controlId: 'ctrl-iso-009',
        testName: 'Vendor Security Assessment Review',
        result: 'partial',
        runAt: '2026-01-18T14:00:00Z',
        runBy: 'legal-team',
        duration: 90,
        details:
          '15 of 23 critical vendors have completed security questionnaires. 8 vendors are overdue.',
        remediationRequired: 'Complete security assessments for remaining 8 critical vendors.',
      },
    ],
    remediationPlan:
      'Send assessment reminders to 8 overdue vendors. Escalate to legal/procurement for non-responsive vendors. Target: March 31, 2026.',
  },
  {
    id: 'ctrl-iso-010',
    frameworkId: 'iso27001',
    code: 'A.18.1.1',
    name: 'Compliance — Legal Requirements',
    description:
      "All relevant legislative statutory, regulatory, contractual requirements and the organization's approach to meet these requirements shall be explicitly identified.",
    category: 'A.18 Compliance',
    status: 'compliant',
    ownerId: 'emp-015',
    ownerName: 'James Wilson (Legal)',
    lastTested: '2026-02-15T11:00:00Z',
    nextTestDue: '2026-08-15T11:00:00Z',
    riskLevel: 'medium',
    relatedControls: [],
    evidence: [],
    testHistory: [
      {
        id: 'test-iso-010',
        controlId: 'ctrl-iso-010',
        testName: 'Legal Obligations Register Review',
        result: 'pass',
        runAt: '2026-02-15T11:00:00Z',
        runBy: 'legal-team',
        duration: 45,
        details:
          'Legal obligations register is current. All applicable regulations mapped and owners assigned.',
      },
    ],
  },
];

const MOCK_FRAMEWORKS: ComplianceFramework[] = [
  {
    id: 'soc2',
    name: 'SOC 2',
    fullName: 'System and Organization Controls 2',
    description:
      'Trust Services Criteria for security, availability, processing integrity, confidentiality, and privacy.',
    version: 'Type II',
    totalControls: 12,
    readinessScore: 83,
    status: 'in-progress',
    certificationDate: '2025-06-15',
    certificationExpiry: '2026-06-15',
    nextAuditDate: '2026-04-01',
    auditor: 'Deloitte & Touche LLP',
    controls: MOCK_SOC2_CONTROLS,
  },
  {
    id: 'iso27001',
    name: 'ISO 27001',
    fullName: 'ISO/IEC 27001:2022 Information Security',
    description: 'International standard for information security management systems (ISMS).',
    version: '2022',
    totalControls: 10,
    readinessScore: 80,
    status: 'certified',
    certificationDate: '2025-03-20',
    certificationExpiry: '2028-03-20',
    nextAuditDate: '2026-09-15',
    auditor: 'BSI Group',
    controls: MOCK_ISO27001_CONTROLS,
  },
  {
    id: 'gdpr',
    name: 'GDPR',
    fullName: 'General Data Protection Regulation',
    description:
      'EU regulation on data protection and privacy for all individuals within the EU and EEA.',
    version: '2018',
    totalControls: 28,
    readinessScore: 91,
    status: 'certified',
    nextAuditDate: '2026-05-25',
    controls: [],
  },
  {
    id: 'hipaa',
    name: 'HIPAA',
    fullName: 'Health Insurance Portability and Accountability Act',
    description:
      'US legislation for data privacy and security provisions for safeguarding medical information.',
    version: '2013',
    totalControls: 45,
    readinessScore: 76,
    status: 'in-progress',
    nextAuditDate: '2026-07-01',
    controls: [],
  },
  {
    id: 'sox',
    name: 'SOX',
    fullName: 'Sarbanes-Oxley Act',
    description:
      'US federal law mandating practices in financial record keeping and reporting for corporations.',
    version: '2002',
    totalControls: 20,
    readinessScore: 88,
    status: 'certified',
    certificationDate: '2025-12-31',
    certificationExpiry: '2026-12-31',
    nextAuditDate: '2026-11-01',
    auditor: 'PricewaterhouseCoopers',
    controls: [],
  },
];

const MOCK_TIMELINE: ComplianceTimeline[] = [
  {
    id: 'tl-001',
    frameworkId: 'soc2',
    frameworkName: 'SOC 2',
    type: 'audit',
    title: 'SOC 2 Type II Audit — Field Work',
    date: '2026-04-01',
    description:
      'Deloitte & Touche to conduct evidence review and control testing for SOC 2 Type II certification.',
    priority: 'high',
    completed: false,
  },
  {
    id: 'tl-002',
    frameworkId: 'gdpr',
    frameworkName: 'GDPR',
    type: 'assessment',
    title: 'Annual GDPR Data Protection Assessment',
    date: '2026-05-25',
    description:
      'Annual review of GDPR compliance posture, Data Protection Impact Assessments, and consent records.',
    priority: 'high',
    completed: false,
  },
  {
    id: 'tl-003',
    frameworkId: 'soc2',
    frameworkName: 'SOC 2',
    type: 'certification',
    title: 'SOC 2 Certification Renewal',
    date: '2026-06-15',
    description:
      'Current SOC 2 certification expires. Must complete Type II audit before this date.',
    priority: 'high',
    completed: false,
  },
  {
    id: 'tl-004',
    frameworkId: 'hipaa',
    frameworkName: 'HIPAA',
    type: 'assessment',
    title: 'HIPAA Risk Assessment',
    date: '2026-07-01',
    description: 'Annual HIPAA security risk assessment as required by the Security Rule.',
    priority: 'medium',
    completed: false,
  },
  {
    id: 'tl-005',
    frameworkId: 'iso27001',
    frameworkName: 'ISO 27001',
    type: 'audit',
    title: 'ISO 27001 Surveillance Audit',
    date: '2026-09-15',
    description: 'BSI Group annual surveillance audit to maintain ISO 27001:2022 certification.',
    priority: 'medium',
    completed: false,
  },
  {
    id: 'tl-006',
    frameworkId: 'sox',
    frameworkName: 'SOX',
    type: 'audit',
    title: 'SOX Section 404 Audit',
    date: '2026-11-01',
    description: 'Annual SOX compliance audit for financial reporting internal controls (ICFR).',
    priority: 'high',
    completed: false,
  },
  {
    id: 'tl-007',
    frameworkId: 'soc2',
    frameworkName: 'SOC 2',
    type: 'deadline',
    title: 'Remediate Network Segmentation (ISO A.13.1.1)',
    date: '2026-03-15',
    description:
      'Critical remediation required: implement network segmentation between dev and production.',
    priority: 'high',
    completed: false,
  },
];

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class ComplianceFrameworkService {
  /**
   * Get all compliance frameworks with readiness scores
   */
  static async getComplianceFrameworks(): Promise<ComplianceFramework[]> {
    try {
      return await APIClient.get<ComplianceFramework[]>('/v1/compliance/frameworks');
    } catch {
      return MOCK_FRAMEWORKS.map((f) => ({ ...f, controls: [] }));
    }
  }

  /**
   * Get a framework with controls, evidence, and gaps
   */
  static async getFrameworkStatus(frameworkId: FrameworkId): Promise<ComplianceFramework | null> {
    try {
      return await APIClient.get<ComplianceFramework>(`/v1/compliance/frameworks/${frameworkId}`);
    } catch {
      return MOCK_FRAMEWORKS.find((f) => f.id === frameworkId) ?? null;
    }
  }

  /**
   * Get individual control details with evidence and tests
   */
  static async getControlDetails(controlId: string): Promise<ComplianceControl | null> {
    try {
      return await APIClient.get<ComplianceControl>(`/v1/compliance/controls/${controlId}`);
    } catch {
      const allControls = [...MOCK_SOC2_CONTROLS, ...MOCK_ISO27001_CONTROLS];
      return allControls.find((c) => c.id === controlId) ?? null;
    }
  }

  /**
   * Submit evidence for a control
   */
  static async submitEvidence(
    controlId: string,
    evidence: SubmitEvidenceInput
  ): Promise<ComplianceEvidence> {
    try {
      return await APIClient.post<ComplianceEvidence>(
        `/v1/compliance/controls/${controlId}/evidence`,
        evidence
      );
    } catch {
      const newEvidence: ComplianceEvidence = {
        id: `ev-${Date.now()}`,
        ...evidence,
        uploadedBy: 'current-user',
        uploadedAt: new Date().toISOString(),
        status: 'pending',
      };
      // Add to mock data
      const ctrl = [...MOCK_SOC2_CONTROLS, ...MOCK_ISO27001_CONTROLS].find(
        (c) => c.id === controlId
      );
      if (ctrl) ctrl.evidence.unshift(newEvidence);
      return newEvidence;
    }
  }

  /**
   * Execute automated control test
   */
  static async runControlTest(controlId: string): Promise<ControlTestResult> {
    try {
      return await APIClient.post<ControlTestResult>(
        `/v1/compliance/controls/${controlId}/test`,
        {}
      );
    } catch {
      // Simulate a test run
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const result: ControlTestResult = {
        testId: `test-${Date.now()}`,
        controlId,
        result: Math.random() > 0.3 ? 'pass' : 'partial',
        details: 'Automated control test completed successfully.',
        completedAt: new Date().toISOString(),
      };
      return result;
    }
  }

  /**
   * Get overall audit readiness score for a framework
   */
  static async getAuditReadiness(frameworkId: FrameworkId): Promise<FrameworkReadiness> {
    try {
      return await APIClient.get<FrameworkReadiness>(
        `/v1/compliance/frameworks/${frameworkId}/readiness`
      );
    } catch {
      const framework = MOCK_FRAMEWORKS.find((f) => f.id === frameworkId);
      const controls =
        frameworkId === 'soc2'
          ? MOCK_SOC2_CONTROLS
          : frameworkId === 'iso27001'
            ? MOCK_ISO27001_CONTROLS
            : [];

      const compliant = controls.filter((c) => c.status === 'compliant').length;
      const partial = controls.filter((c) => c.status === 'partial').length;
      const nonCompliant = controls.filter((c) => c.status === 'non-compliant').length;
      const notApplicable = controls.filter((c) => c.status === 'not-applicable').length;
      const total = controls.length || framework?.totalControls || 0;

      // Group by category
      const categoryMap = new Map<string, { compliant: number; total: number }>();
      controls.forEach((c) => {
        const existing = categoryMap.get(c.category) ?? { compliant: 0, total: 0 };
        existing.total++;
        if (c.status === 'compliant') existing.compliant++;
        categoryMap.set(c.category, existing);
      });

      const criticalGaps = controls
        .filter((c) => c.status === 'non-compliant' && c.riskLevel === 'critical')
        .map((c) => `${c.code}: ${c.name}`);

      return {
        frameworkId,
        overallScore: framework?.readinessScore ?? 0,
        compliantCount: compliant,
        partialCount: partial,
        nonCompliantCount: nonCompliant,
        notApplicableCount: notApplicable,
        totalControls: total,
        categoryBreakdown: [...categoryMap.entries()].map(([category, data]) => ({
          category,
          score: data.total > 0 ? Math.round((data.compliant / data.total) * 100) : 0,
          compliant: data.compliant,
          total: data.total,
        })),
        criticalGaps,
        lastAssessedAt: '2026-02-20T00:00:00Z',
        nextAuditDate: framework?.nextAuditDate ?? '2026-06-01',
        certificationExpiry: framework?.certificationExpiry,
      };
    }
  }

  /**
   * Get compliance timeline — audits, certifications, and deadlines
   */
  static async getComplianceTimeline(): Promise<ComplianceTimeline[]> {
    try {
      return await APIClient.get<ComplianceTimeline[]>('/v1/compliance/timeline');
    } catch {
      return MOCK_TIMELINE.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
  }
}

export default ComplianceFrameworkService;
