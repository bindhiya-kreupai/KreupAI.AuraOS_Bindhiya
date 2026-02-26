/**
 * @module complianceAuditAnalyticsService
 * @description Compliance & Audit Analytics Service — compliance scorecards, audit findings,
 *              audit trail, regulatory risk mapping, control effectiveness, remediation
 *              tracking, and compliance report generation (Sec 23.6)
 * @project AURA HCM Platform
 */

// ============================================================================
// TYPES
// ============================================================================

export type RegulationType =
  | 'GDPR'
  | 'SOX'
  | 'ACA'
  | 'FMLA'
  | 'WPS'
  | 'GOSI'
  | 'PDPA'
  | 'ISO_27001'
  | 'EOBI'
  | 'DIFC_ER';

export type ComplianceDomain =
  | 'data_privacy'
  | 'financial_reporting'
  | 'hr_regulatory'
  | 'payroll_compliance'
  | 'labor_law'
  | 'health_safety'
  | 'information_security';

export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low' | 'informational';
export type FindingStatus = 'open' | 'in_progress' | 'resolved' | 'risk_accepted';
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export interface ComplianceScore {
  regulationId: RegulationType;
  regulationLabel: string;
  domain: ComplianceDomain;
  score: number; // 0-100
  previousScore: number;
  trend: number; // vs last quarter
  status: 'compliant' | 'partial' | 'non_compliant';
  lastAuditDate: string;
  nextAuditDate: string;
  jurisdiction: string;
  criticalOpenItems: number;
}

export interface ComplianceScorecard {
  overallScore: number;
  previousOverallScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  scores: ComplianceScore[];
  lastUpdated: string;
  totalFindings: number;
  openCriticalFindings: number;
  resolvedThisQuarter: number;
}

export interface AuditFinding {
  id: string;
  title: string;
  description: string;
  regulation: RegulationType;
  domain: ComplianceDomain;
  severity: FindingSeverity;
  status: FindingStatus;
  dateIdentified: string;
  dueDate: string;
  owner: string;
  ownerDepartment: string;
  affectedEmployees: number;
  potentialFinePenalty?: number;
  controlId: string;
  remediationSteps: string[];
  progressPct: number;
  auditCycle: string;
}

export interface AuditTrailEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userDepartment: string;
  action: string;
  resource: string;
  resourceId: string;
  outcome: 'success' | 'failure' | 'warning';
  ipAddress: string;
  details?: string;
  regulationRelevance?: RegulationType[];
}

export interface RegulatoryRisk {
  regulationId: RegulationType;
  regulationLabel: string;
  jurisdiction: string;
  riskLevel: RiskLevel;
  likelihood: number; // 1-5
  impact: number; // 1-5
  riskScore: number; // likelihood * impact
  lastAssessmentDate: string;
  daysToDeadline?: number;
  category: string;
  description: string;
  mitigationStatus: 'mitigated' | 'partial' | 'unmitigated';
}

export interface ControlEffectiveness {
  controlId: string;
  controlName: string;
  domain: ComplianceDomain;
  relatedRegulations: RegulationType[];
  effectivenessScore: number; // 0-100
  testFrequency: 'monthly' | 'quarterly' | 'annually';
  lastTestedDate: string;
  testResult: 'pass' | 'partial_pass' | 'fail' | 'not_tested';
  owner: string;
  automated: boolean;
  openExceptions: number;
}

export interface RemediationItem {
  findingId: string;
  title: string;
  regulation: RegulationType;
  severity: FindingSeverity;
  owner: string;
  ownerDepartment: string;
  dueDate: string;
  status: FindingStatus;
  progressPct: number;
  daysOverdue?: number;
  slaBreachRisk: boolean;
  latestUpdate: string;
}

export interface ComplianceTrend {
  period: string;
  overallScore: number;
  gdprScore: number;
  wpsScore: number;
  gosiScore: number;
  openFindings: number;
  resolvedFindings: number;
}

export interface RegulatoryCalendarEvent {
  id: string;
  title: string;
  regulation: RegulationType;
  dueDate: string;
  type: 'filing' | 'audit' | 'report' | 'renewal' | 'training';
  status: 'upcoming' | 'overdue' | 'completed';
  responsible: string;
  description: string;
}

export interface ComplianceReport {
  id: string;
  title: string;
  generatedAt: string;
  period: string;
  overallScore: number;
  sections: Array<{ title: string; content: string }>;
  findings: number;
  resolvedItems: number;
  openRisks: number;
  exportFormats: string[];
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_COMPLIANCE_SCORES: ComplianceScore[] = [
  {
    regulationId: 'GDPR',
    regulationLabel: 'GDPR (EU Data Privacy)',
    domain: 'data_privacy',
    score: 88,
    previousScore: 82,
    trend: 6,
    status: 'compliant',
    lastAuditDate: '2026-01-15',
    nextAuditDate: '2026-07-15',
    jurisdiction: 'European Union',
    criticalOpenItems: 0,
  },
  {
    regulationId: 'SOX',
    regulationLabel: 'SOX (Financial Reporting)',
    domain: 'financial_reporting',
    score: 92,
    previousScore: 89,
    trend: 3,
    status: 'compliant',
    lastAuditDate: '2025-12-01',
    nextAuditDate: '2026-06-01',
    jurisdiction: 'United States',
    criticalOpenItems: 0,
  },
  {
    regulationId: 'WPS',
    regulationLabel: 'WPS (UAE Wage Protection)',
    domain: 'payroll_compliance',
    score: 96,
    previousScore: 94,
    trend: 2,
    status: 'compliant',
    lastAuditDate: '2026-01-31',
    nextAuditDate: '2026-04-30',
    jurisdiction: 'UAE',
    criticalOpenItems: 0,
  },
  {
    regulationId: 'GOSI',
    regulationLabel: 'GOSI (KSA Social Insurance)',
    domain: 'hr_regulatory',
    score: 91,
    previousScore: 88,
    trend: 3,
    status: 'compliant',
    lastAuditDate: '2026-01-20',
    nextAuditDate: '2026-04-20',
    jurisdiction: 'Saudi Arabia',
    criticalOpenItems: 0,
  },
  {
    regulationId: 'FMLA',
    regulationLabel: 'FMLA (Family & Medical Leave)',
    domain: 'labor_law',
    score: 74,
    previousScore: 78,
    trend: -4,
    status: 'partial',
    lastAuditDate: '2025-11-01',
    nextAuditDate: '2026-05-01',
    jurisdiction: 'United States',
    criticalOpenItems: 1,
  },
  {
    regulationId: 'ACA',
    regulationLabel: 'ACA (Affordable Care Act)',
    domain: 'health_safety',
    score: 85,
    previousScore: 83,
    trend: 2,
    status: 'compliant',
    lastAuditDate: '2026-01-10',
    nextAuditDate: '2026-07-10',
    jurisdiction: 'United States',
    criticalOpenItems: 0,
  },
  {
    regulationId: 'PDPA',
    regulationLabel: 'PDPA (Thailand Data Protection)',
    domain: 'data_privacy',
    score: 68,
    previousScore: 62,
    trend: 6,
    status: 'partial',
    lastAuditDate: '2025-10-15',
    nextAuditDate: '2026-04-15',
    jurisdiction: 'Thailand',
    criticalOpenItems: 2,
  },
  {
    regulationId: 'ISO_27001',
    regulationLabel: 'ISO 27001 (Information Security)',
    domain: 'information_security',
    score: 81,
    previousScore: 77,
    trend: 4,
    status: 'compliant',
    lastAuditDate: '2026-02-01',
    nextAuditDate: '2027-02-01',
    jurisdiction: 'Global',
    criticalOpenItems: 0,
  },
  {
    regulationId: 'DIFC_ER',
    regulationLabel: 'DIFC Employment Regulations',
    domain: 'labor_law',
    score: 93,
    previousScore: 90,
    trend: 3,
    status: 'compliant',
    lastAuditDate: '2026-01-25',
    nextAuditDate: '2026-07-25',
    jurisdiction: 'DIFC, UAE',
    criticalOpenItems: 0,
  },
  {
    regulationId: 'EOBI',
    regulationLabel: 'EOBI (Pakistan Employees OBI)',
    domain: 'hr_regulatory',
    score: 52,
    previousScore: 48,
    trend: 4,
    status: 'non_compliant',
    lastAuditDate: '2025-09-01',
    nextAuditDate: '2026-03-01',
    jurisdiction: 'Pakistan',
    criticalOpenItems: 3,
  },
];

const MOCK_AUDIT_FINDINGS: AuditFinding[] = [
  {
    id: 'finding-001',
    title: 'GDPR Data Retention Policy Not Fully Enforced',
    description:
      'Certain legacy HR systems retain personal data beyond the defined retention period of 7 years, violating GDPR Article 5(1)(e).',
    regulation: 'GDPR',
    domain: 'data_privacy',
    severity: 'high',
    status: 'in_progress',
    dateIdentified: '2026-01-15',
    dueDate: '2026-03-31',
    owner: 'Emily Park',
    ownerDepartment: 'HR',
    affectedEmployees: 287,
    potentialFinePenalty: 50000,
    controlId: 'CTRL-DP-003',
    remediationSteps: [
      'Audit all legacy HR systems for data retention compliance',
      'Implement automated data purge workflows',
      'Update GDPR Data Register with corrected retention schedules',
      'Validate purge with DPO sign-off',
    ],
    progressPct: 60,
    auditCycle: 'Q1 2026',
  },
  {
    id: 'finding-002',
    title: 'WPS Salary Transfer Delay — 3 Employees',
    description:
      'Three employee salary payments were processed 2 days after the WPS deadline in January 2026 due to a banking API outage.',
    regulation: 'WPS',
    domain: 'payroll_compliance',
    severity: 'medium',
    status: 'resolved',
    dateIdentified: '2026-01-31',
    dueDate: '2026-02-15',
    owner: 'Payroll Team',
    ownerDepartment: 'Finance',
    affectedEmployees: 3,
    potentialFinePenalty: 5000,
    controlId: 'CTRL-PAY-007',
    remediationSteps: [
      'Document root cause (API outage)',
      'Implement fallback payment channel',
      'MOHRE notification submitted',
    ],
    progressPct: 100,
    auditCycle: 'Q1 2026',
  },
  {
    id: 'finding-003',
    title: 'FMLA Notification Obligation Not Met for 2 Cases',
    description:
      'HR failed to provide required FMLA designation notice within 5 business days for 2 employee leave requests in Q4 2025.',
    regulation: 'FMLA',
    domain: 'labor_law',
    severity: 'high',
    status: 'in_progress',
    dateIdentified: '2025-11-20',
    dueDate: '2026-03-01',
    owner: 'Robert Brown',
    ownerDepartment: 'HR',
    affectedEmployees: 2,
    potentialFinePenalty: 15000,
    controlId: 'CTRL-LL-002',
    remediationSteps: [
      'Issue retroactive FMLA designation notices',
      'Retrain HR team on FMLA notification timelines',
      'Implement automated FMLA notification triggers in HRIS',
    ],
    progressPct: 45,
    auditCycle: 'Q4 2025',
  },
  {
    id: 'finding-004',
    title: 'PDPA Consent Records Incomplete',
    description:
      'Employee consent records for cross-border data transfer to EU-based payroll processor are not maintained per PDPA requirements.',
    regulation: 'PDPA',
    domain: 'data_privacy',
    severity: 'critical',
    status: 'open',
    dateIdentified: '2025-10-15',
    dueDate: '2026-02-28',
    owner: 'Data Team',
    ownerDepartment: 'Data',
    affectedEmployees: 45,
    potentialFinePenalty: 250000,
    controlId: 'CTRL-DP-008',
    remediationSteps: [
      'Collect retroactive consent from affected employees',
      'Update data processing agreements with payroll vendor',
      'Implement consent management module in HR portal',
      'PDPA DPO review and sign-off',
    ],
    progressPct: 20,
    auditCycle: 'Q4 2025',
  },
  {
    id: 'finding-005',
    title: 'EOBI Registration Missing for 12 Pakistan Employees',
    description:
      'Twelve employees in the Karachi office have not been registered with EOBI as required by Pakistani labor law.',
    regulation: 'EOBI',
    domain: 'hr_regulatory',
    severity: 'critical',
    status: 'open',
    dateIdentified: '2025-09-01',
    dueDate: '2026-03-15',
    owner: 'Pakistan HR',
    ownerDepartment: 'HR',
    affectedEmployees: 12,
    potentialFinePenalty: 30000,
    controlId: 'CTRL-HR-011',
    remediationSteps: [
      'Register 12 employees with EOBI portal',
      'Calculate and remit outstanding contributions',
      'Implement EOBI check in new-hire onboarding workflow',
    ],
    progressPct: 10,
    auditCycle: 'Q3 2025',
  },
  {
    id: 'finding-006',
    title: 'ISO 27001 Access Review Overdue',
    description:
      'Quarterly access review for privileged HRIS accounts was not completed within the required timeline — 45-day overdue.',
    regulation: 'ISO_27001',
    domain: 'information_security',
    severity: 'medium',
    status: 'in_progress',
    dateIdentified: '2026-02-01',
    dueDate: '2026-02-28',
    owner: 'IT Security',
    ownerDepartment: 'Engineering',
    affectedEmployees: 18,
    controlId: 'CTRL-IS-015',
    remediationSteps: [
      'Complete privileged access review',
      'Revoke unused accounts',
      'Document access certification',
    ],
    progressPct: 70,
    auditCycle: 'Q1 2026',
  },
  {
    id: 'finding-007',
    title: 'GOSI Contribution Variance — Engineering Dept',
    description:
      'GOSI contributions for 4 Saudi national employees in Engineering were under-reported by 1.2% due to a bonus classification error.',
    regulation: 'GOSI',
    domain: 'hr_regulatory',
    severity: 'medium',
    status: 'resolved',
    dateIdentified: '2026-01-20',
    dueDate: '2026-02-20',
    owner: 'Payroll Team',
    ownerDepartment: 'Finance',
    affectedEmployees: 4,
    potentialFinePenalty: 8000,
    controlId: 'CTRL-PAY-012',
    remediationSteps: [
      'Recalculate GOSI contributions with bonus included',
      'Submit variance payment to GOSI portal',
      'Update payroll classification rules',
    ],
    progressPct: 100,
    auditCycle: 'Q1 2026',
  },
];

const MOCK_AUDIT_TRAIL: AuditTrailEntry[] = [
  {
    id: 'trail-001',
    timestamp: '2026-02-25T09:14:22Z',
    userId: 'emp-004',
    userName: 'Emily Park',
    userDepartment: 'HR',
    action: 'EXPORT_EMPLOYEE_DATA',
    resource: 'Employee Records',
    resourceId: 'bulk-export-287',
    outcome: 'success',
    ipAddress: '10.0.1.42',
    details: 'Bulk export of 287 employee records for payroll audit',
    regulationRelevance: ['GDPR', 'SOX'],
  },
  {
    id: 'trail-002',
    timestamp: '2026-02-25T08:52:11Z',
    userId: 'emp-012',
    userName: 'Robert Brown',
    userDepartment: 'HR',
    action: 'UPDATE_LEAVE_RECORD',
    resource: 'Leave Management',
    resourceId: 'leave-3842',
    outcome: 'success',
    ipAddress: '10.0.1.55',
    details: 'FMLA leave designation updated',
    regulationRelevance: ['FMLA'],
  },
  {
    id: 'trail-003',
    timestamp: '2026-02-25T08:30:05Z',
    userId: 'sys-payroll',
    userName: 'Payroll Engine',
    userDepartment: 'System',
    action: 'WPS_TRANSFER_SUBMIT',
    resource: 'WPS Module',
    resourceId: 'wps-batch-0225',
    outcome: 'success',
    ipAddress: '10.0.0.5',
    details: 'Monthly WPS salary transfer batch submitted — 287 employees',
    regulationRelevance: ['WPS'],
  },
  {
    id: 'trail-004',
    timestamp: '2026-02-24T17:44:33Z',
    userId: 'emp-008',
    userName: 'Jake Wilson',
    userDepartment: 'Finance',
    action: 'VIEW_COMPENSATION_REPORT',
    resource: 'Compensation Module',
    resourceId: 'comp-report-q4-2025',
    outcome: 'success',
    ipAddress: '10.0.1.88',
    regulationRelevance: ['SOX'],
  },
  {
    id: 'trail-005',
    timestamp: '2026-02-24T15:20:18Z',
    userId: 'emp-001',
    userName: 'Sarah Chen',
    userDepartment: 'Engineering',
    action: 'FAILED_LOGIN_ATTEMPT',
    resource: 'HRIS Portal',
    resourceId: 'auth',
    outcome: 'failure',
    ipAddress: '185.14.22.100',
    details: 'Failed login from unusual IP address — flagged for security review',
    regulationRelevance: ['ISO_27001'],
  },
  {
    id: 'trail-006',
    timestamp: '2026-02-24T14:02:44Z',
    userId: 'emp-003',
    userName: 'Carlos Mendez',
    userDepartment: 'Data',
    action: 'ACCESS_PERSONAL_DATA',
    resource: 'Data Analytics',
    resourceId: 'dataset-hr-pii-001',
    outcome: 'warning',
    ipAddress: '10.0.1.22',
    details: 'PII dataset accessed without standard anonymization flag',
    regulationRelevance: ['GDPR', 'PDPA'],
  },
  {
    id: 'trail-007',
    timestamp: '2026-02-24T11:30:00Z',
    userId: 'sys-gosi',
    userName: 'GOSI Integration',
    userDepartment: 'System',
    action: 'GOSI_MONTHLY_SUBMISSION',
    resource: 'GOSI Module',
    resourceId: 'gosi-feb-2026',
    outcome: 'success',
    ipAddress: '10.0.0.6',
    details: 'GOSI monthly contribution report submitted',
    regulationRelevance: ['GOSI'],
  },
  {
    id: 'trail-008',
    timestamp: '2026-02-23T16:45:12Z',
    userId: 'emp-019',
    userName: 'Fatima Al-Hassan',
    userDepartment: 'HR',
    action: 'DELETE_EMPLOYEE_RECORD',
    resource: 'Employee Records',
    resourceId: 'emp-ex-2019-044',
    outcome: 'success',
    ipAddress: '10.0.1.61',
    details: 'Employee record purged per GDPR 7-year retention policy',
    regulationRelevance: ['GDPR'],
  },
];

const MOCK_REGULATORY_RISKS: RegulatoryRisk[] = [
  {
    regulationId: 'PDPA',
    regulationLabel: 'PDPA Consent Management',
    jurisdiction: 'Thailand',
    riskLevel: 'critical',
    likelihood: 4,
    impact: 5,
    riskScore: 20,
    lastAssessmentDate: '2026-01-15',
    daysToDeadline: 3,
    category: 'Data Privacy',
    description:
      'Cross-border data transfer consent records incomplete — PDPA enforcement actions possible',
    mitigationStatus: 'partial',
  },
  {
    regulationId: 'EOBI',
    regulationLabel: 'EOBI Non-Registration',
    jurisdiction: 'Pakistan',
    riskLevel: 'high',
    likelihood: 4,
    impact: 4,
    riskScore: 16,
    lastAssessmentDate: '2026-01-20',
    daysToDeadline: 18,
    category: 'HR Regulatory',
    description: '12 employees unregistered — Pakistan Labor Department inspection risk',
    mitigationStatus: 'unmitigated',
  },
  {
    regulationId: 'FMLA',
    regulationLabel: 'FMLA Designation Notices',
    jurisdiction: 'United States',
    riskLevel: 'high',
    likelihood: 3,
    impact: 4,
    riskScore: 12,
    lastAssessmentDate: '2026-01-10',
    daysToDeadline: 4,
    category: 'Labor Law',
    description: 'Outstanding FMLA notice obligations — potential DOL audit exposure',
    mitigationStatus: 'partial',
  },
  {
    regulationId: 'GDPR',
    regulationLabel: 'GDPR Data Retention',
    jurisdiction: 'European Union',
    riskLevel: 'medium',
    likelihood: 2,
    impact: 4,
    riskScore: 8,
    lastAssessmentDate: '2026-01-15',
    daysToDeadline: 34,
    category: 'Data Privacy',
    description: 'Legacy system data purge behind schedule — moderate GDPR violation risk',
    mitigationStatus: 'partial',
  },
  {
    regulationId: 'ISO_27001',
    regulationLabel: 'ISO 27001 Access Review',
    jurisdiction: 'Global',
    riskLevel: 'medium',
    likelihood: 3,
    impact: 3,
    riskScore: 9,
    lastAssessmentDate: '2026-02-01',
    daysToDeadline: 3,
    category: 'Information Security',
    description: 'Privileged access review overdue — audit finding expected',
    mitigationStatus: 'partial',
  },
  {
    regulationId: 'WPS',
    regulationLabel: 'WPS Compliance',
    jurisdiction: 'UAE',
    riskLevel: 'low',
    likelihood: 1,
    impact: 3,
    riskScore: 3,
    lastAssessmentDate: '2026-02-01',
    daysToDeadline: 65,
    category: 'Payroll',
    description: 'Minor historical delay resolved — low ongoing risk',
    mitigationStatus: 'mitigated',
  },
];

const MOCK_CONTROLS: ControlEffectiveness[] = [
  {
    controlId: 'CTRL-DP-003',
    controlName: 'GDPR Data Retention Enforcement',
    domain: 'data_privacy',
    relatedRegulations: ['GDPR'],
    effectivenessScore: 62,
    testFrequency: 'quarterly',
    lastTestedDate: '2026-01-15',
    testResult: 'partial_pass',
    owner: 'Data Team',
    automated: false,
    openExceptions: 1,
  },
  {
    controlId: 'CTRL-PAY-007',
    controlName: 'WPS Salary Transfer Monitoring',
    domain: 'payroll_compliance',
    relatedRegulations: ['WPS'],
    effectivenessScore: 95,
    testFrequency: 'monthly',
    lastTestedDate: '2026-02-28',
    testResult: 'pass',
    owner: 'Payroll Team',
    automated: true,
    openExceptions: 0,
  },
  {
    controlId: 'CTRL-PAY-012',
    controlName: 'GOSI Contribution Validation',
    domain: 'payroll_compliance',
    relatedRegulations: ['GOSI'],
    effectivenessScore: 88,
    testFrequency: 'monthly',
    lastTestedDate: '2026-02-20',
    testResult: 'pass',
    owner: 'Payroll Team',
    automated: true,
    openExceptions: 0,
  },
  {
    controlId: 'CTRL-LL-002',
    controlName: 'FMLA Notification Workflow',
    domain: 'labor_law',
    relatedRegulations: ['FMLA'],
    effectivenessScore: 55,
    testFrequency: 'quarterly',
    lastTestedDate: '2025-11-01',
    testResult: 'partial_pass',
    owner: 'HR',
    automated: false,
    openExceptions: 2,
  },
  {
    controlId: 'CTRL-IS-015',
    controlName: 'Privileged Access Review',
    domain: 'information_security',
    relatedRegulations: ['ISO_27001'],
    effectivenessScore: 70,
    testFrequency: 'quarterly',
    lastTestedDate: '2026-02-01',
    testResult: 'partial_pass',
    owner: 'IT Security',
    automated: false,
    openExceptions: 1,
  },
  {
    controlId: 'CTRL-DP-008',
    controlName: 'Cross-Border Data Transfer Consent',
    domain: 'data_privacy',
    relatedRegulations: ['PDPA', 'GDPR'],
    effectivenessScore: 30,
    testFrequency: 'quarterly',
    lastTestedDate: '2025-10-15',
    testResult: 'fail',
    owner: 'Data Team',
    automated: false,
    openExceptions: 3,
  },
  {
    controlId: 'CTRL-HR-011',
    controlName: 'New Hire Regulatory Registration',
    domain: 'hr_regulatory',
    relatedRegulations: ['EOBI', 'GOSI'],
    effectivenessScore: 42,
    testFrequency: 'quarterly',
    lastTestedDate: '2025-09-01',
    testResult: 'fail',
    owner: 'HR',
    automated: false,
    openExceptions: 4,
  },
  {
    controlId: 'CTRL-FIN-001',
    controlName: 'SOX Financial Controls Attestation',
    domain: 'financial_reporting',
    relatedRegulations: ['SOX'],
    effectivenessScore: 94,
    testFrequency: 'quarterly',
    lastTestedDate: '2025-12-01',
    testResult: 'pass',
    owner: 'Finance',
    automated: true,
    openExceptions: 0,
  },
];

const MOCK_REMEDIATION: RemediationItem[] = [
  {
    findingId: 'finding-004',
    title: 'PDPA Consent Records Incomplete',
    regulation: 'PDPA',
    severity: 'critical',
    owner: 'Data Team',
    ownerDepartment: 'Data',
    dueDate: '2026-02-28',
    status: 'open',
    progressPct: 20,
    daysOverdue: 0,
    slaBreachRisk: true,
    latestUpdate: 'Consent forms prepared; employee communication pending',
  },
  {
    findingId: 'finding-005',
    title: 'EOBI Registration Missing — 12 Employees',
    regulation: 'EOBI',
    severity: 'critical',
    owner: 'Pakistan HR',
    ownerDepartment: 'HR',
    dueDate: '2026-03-15',
    status: 'open',
    progressPct: 10,
    slaBreachRisk: true,
    latestUpdate: 'EOBI portal access obtained; registration in progress',
  },
  {
    findingId: 'finding-003',
    title: 'FMLA Notification Obligation Not Met',
    regulation: 'FMLA',
    severity: 'high',
    owner: 'Robert Brown',
    ownerDepartment: 'HR',
    dueDate: '2026-03-01',
    status: 'in_progress',
    progressPct: 45,
    slaBreachRisk: false,
    latestUpdate: 'HR retraining completed; HRIS automation in UAT',
  },
  {
    findingId: 'finding-001',
    title: 'GDPR Data Retention Policy Not Enforced',
    regulation: 'GDPR',
    severity: 'high',
    owner: 'Emily Park',
    ownerDepartment: 'HR',
    dueDate: '2026-03-31',
    status: 'in_progress',
    progressPct: 60,
    slaBreachRisk: false,
    latestUpdate: 'Legacy system audit 60% complete; purge scripts ready',
  },
  {
    findingId: 'finding-006',
    title: 'ISO 27001 Access Review Overdue',
    regulation: 'ISO_27001',
    severity: 'medium',
    owner: 'IT Security',
    ownerDepartment: 'Engineering',
    dueDate: '2026-02-28',
    status: 'in_progress',
    progressPct: 70,
    daysOverdue: 0,
    slaBreachRisk: true,
    latestUpdate: 'Review 70% complete; final sign-off pending',
  },
];

const MOCK_TRENDS: ComplianceTrend[] = [
  {
    period: 'Q2 2025',
    overallScore: 74,
    gdprScore: 76,
    wpsScore: 91,
    gosiScore: 85,
    openFindings: 18,
    resolvedFindings: 6,
  },
  {
    period: 'Q3 2025',
    overallScore: 77,
    gdprScore: 79,
    wpsScore: 93,
    gosiScore: 87,
    openFindings: 15,
    resolvedFindings: 9,
  },
  {
    period: 'Q4 2025',
    overallScore: 80,
    gdprScore: 82,
    wpsScore: 94,
    gosiScore: 88,
    openFindings: 12,
    resolvedFindings: 11,
  },
  {
    period: 'Q1 2026',
    overallScore: 83,
    gdprScore: 88,
    wpsScore: 96,
    gosiScore: 91,
    openFindings: 7,
    resolvedFindings: 14,
  },
];

const MOCK_CALENDAR: RegulatoryCalendarEvent[] = [
  {
    id: 'cal-001',
    title: 'PDPA Consent Remediation Deadline',
    regulation: 'PDPA',
    dueDate: '2026-02-28',
    type: 'filing',
    status: 'upcoming',
    responsible: 'Data Team',
    description: 'Submit PDPA consent collection completion evidence to PDPC Thailand',
  },
  {
    id: 'cal-002',
    title: 'EOBI Employee Registration Deadline',
    regulation: 'EOBI',
    dueDate: '2026-03-15',
    type: 'filing',
    status: 'upcoming',
    responsible: 'Pakistan HR',
    description: 'Register all Pakistan employees and remit outstanding contributions',
  },
  {
    id: 'cal-003',
    title: 'FMLA Remediation Completion',
    regulation: 'FMLA',
    dueDate: '2026-03-01',
    type: 'audit',
    status: 'upcoming',
    responsible: 'HR',
    description: 'Demonstrate FMLA notification workflow improvements to legal counsel',
  },
  {
    id: 'cal-004',
    title: 'WPS April Payroll Transfer',
    regulation: 'WPS',
    dueDate: '2026-04-01',
    type: 'filing',
    status: 'upcoming',
    responsible: 'Payroll Team',
    description: 'Monthly WPS payroll file submission via UAECB portal',
  },
  {
    id: 'cal-005',
    title: 'GDPR Data Retention Audit',
    regulation: 'GDPR',
    dueDate: '2026-03-31',
    type: 'audit',
    status: 'upcoming',
    responsible: 'Emily Park',
    description: 'Internal GDPR data retention audit completion and DPO review',
  },
  {
    id: 'cal-006',
    title: 'ISO 27001 Certification Renewal',
    regulation: 'ISO_27001',
    dueDate: '2027-02-01',
    type: 'renewal',
    status: 'upcoming',
    responsible: 'IT Security',
    description: 'Annual ISO 27001 certification renewal audit',
  },
  {
    id: 'cal-007',
    title: 'SOX Q1 Controls Attestation',
    regulation: 'SOX',
    dueDate: '2026-04-15',
    type: 'report',
    status: 'upcoming',
    responsible: 'Finance',
    description: 'Q1 2026 SOX controls testing and management attestation',
  },
  {
    id: 'cal-008',
    title: 'GOSI Q1 Contribution Report',
    regulation: 'GOSI',
    dueDate: '2026-04-20',
    type: 'report',
    status: 'upcoming',
    responsible: 'Payroll Team',
    description: 'Q1 2026 GOSI quarterly contribution summary submission',
  },
];

const MOCK_SCORECARD: ComplianceScorecard = {
  overallScore: 83,
  previousOverallScore: 80,
  grade: 'B',
  scores: MOCK_COMPLIANCE_SCORES,
  lastUpdated: '2026-02-25',
  totalFindings: MOCK_AUDIT_FINDINGS.length,
  openCriticalFindings: MOCK_AUDIT_FINDINGS.filter(
    (f) => f.severity === 'critical' && f.status !== 'resolved'
  ).length,
  resolvedThisQuarter: MOCK_AUDIT_FINDINGS.filter((f) => f.status === 'resolved').length,
};

// ============================================================================
// SERVICE
// ============================================================================

export class ComplianceAuditAnalyticsService {
  /** Get overall compliance scorecard */
  static async getComplianceScorecard(): Promise<ComplianceScorecard> {
    await new Promise((r) => setTimeout(r, 400));
    return { ...MOCK_SCORECARD };
  }

  /** Get compliance score for a specific regulation */
  static async getComplianceScore(
    regulation: RegulationType
  ): Promise<ComplianceScore | undefined> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_COMPLIANCE_SCORES.find((s) => s.regulationId === regulation);
  }

  /** Get audit findings with optional filters */
  static async getAuditFindings(filters?: {
    severity?: FindingSeverity;
    status?: FindingStatus;
    regulation?: RegulationType;
  }): Promise<AuditFinding[]> {
    await new Promise((r) => setTimeout(r, 350));
    let results = [...MOCK_AUDIT_FINDINGS];
    if (filters?.severity) results = results.filter((f) => f.severity === filters.severity);
    if (filters?.status) results = results.filter((f) => f.status === filters.status);
    if (filters?.regulation) results = results.filter((f) => f.regulation === filters.regulation);
    return results;
  }

  /** Get audit trail entries with optional date range */
  static async getAuditTrail(
    limit = 50,
    outcome?: 'success' | 'failure' | 'warning'
  ): Promise<AuditTrailEntry[]> {
    await new Promise((r) => setTimeout(r, 300));
    let results = [...MOCK_AUDIT_TRAIL];
    if (outcome) results = results.filter((t) => t.outcome === outcome);
    return results.slice(0, limit);
  }

  /** Get regulatory risk map */
  static async getRegulatoryRiskMap(): Promise<RegulatoryRisk[]> {
    await new Promise((r) => setTimeout(r, 350));
    return MOCK_REGULATORY_RISKS.sort((a, b) => b.riskScore - a.riskScore);
  }

  /** Get control effectiveness assessments */
  static async getControlEffectiveness(domain?: ComplianceDomain): Promise<ControlEffectiveness[]> {
    await new Promise((r) => setTimeout(r, 300));
    if (domain) return MOCK_CONTROLS.filter((c) => c.domain === domain);
    return [...MOCK_CONTROLS];
  }

  /** Get remediation tracker */
  static async getRemediationStatus(severity?: FindingSeverity): Promise<RemediationItem[]> {
    await new Promise((r) => setTimeout(r, 250));
    if (severity) return MOCK_REMEDIATION.filter((r) => r.severity === severity);
    return [...MOCK_REMEDIATION];
  }

  /** Get compliance trends over time */
  static async getComplianceTrends(): Promise<ComplianceTrend[]> {
    await new Promise((r) => setTimeout(r, 300));
    return [...MOCK_TRENDS];
  }

  /** Get regulatory calendar events */
  static async getRegulatoryCalendar(daysAhead = 90): Promise<RegulatoryCalendarEvent[]> {
    await new Promise((r) => setTimeout(r, 250));
    return MOCK_CALENDAR.filter((e) => {
      const due = new Date(e.dueDate);
      const today = new Date('2026-02-25');
      const diff = (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= daysAhead;
    });
  }

  /** Generate a compliance report */
  static async generateComplianceReport(
    period: string,
    regulations?: RegulationType[]
  ): Promise<ComplianceReport> {
    await new Promise((r) => setTimeout(r, 600));
    const scores = regulations
      ? MOCK_COMPLIANCE_SCORES.filter((s) => regulations.includes(s.regulationId))
      : MOCK_COMPLIANCE_SCORES;
    const avgScore = Math.round(scores.reduce((s, c) => s + c.score, 0) / scores.length);
    return {
      id: `report-${Date.now()}`,
      title: `Compliance Report — ${period}`,
      generatedAt: new Date().toISOString(),
      period,
      overallScore: avgScore,
      sections: [
        {
          title: 'Executive Summary',
          content: `Overall compliance score: ${avgScore}/100 across ${scores.length} regulatory frameworks. ${MOCK_SCORECARD.openCriticalFindings} critical findings open.`,
        },
        {
          title: 'Key Findings',
          content: `${MOCK_AUDIT_FINDINGS.filter((f) => f.status !== 'resolved').length} open findings including ${MOCK_AUDIT_FINDINGS.filter((f) => f.severity === 'critical' && f.status !== 'resolved').length} critical items requiring immediate attention.`,
        },
        {
          title: 'Remediation Status',
          content: `${MOCK_REMEDIATION.filter((r) => r.slaBreachRisk).length} items at SLA breach risk. Priority: PDPA consent (due Feb 28) and EOBI registration (due Mar 15).`,
        },
        {
          title: 'Trend Analysis',
          content: `Overall compliance improved +3 points QoQ. GDPR +6, WPS +2, GOSI +3. FMLA declined -4 due to 2 notification lapses.`,
        },
      ],
      findings: MOCK_AUDIT_FINDINGS.length,
      resolvedItems: MOCK_AUDIT_FINDINGS.filter((f) => f.status === 'resolved').length,
      openRisks: MOCK_REGULATORY_RISKS.filter(
        (r) => r.riskLevel === 'high' || r.riskLevel === 'critical'
      ).length,
      exportFormats: ['PDF', 'Excel', 'CSV'],
    };
  }

  /** Get summary statistics */
  static async getSummaryStats(): Promise<{
    overallScore: number;
    compliantCount: number;
    partialCount: number;
    nonCompliantCount: number;
    openFindings: number;
    criticalFindings: number;
    slaAtRisk: number;
    upcomingDeadlines: number;
  }> {
    await new Promise((r) => setTimeout(r, 200));
    return {
      overallScore: MOCK_SCORECARD.overallScore,
      compliantCount: MOCK_COMPLIANCE_SCORES.filter((s) => s.status === 'compliant').length,
      partialCount: MOCK_COMPLIANCE_SCORES.filter((s) => s.status === 'partial').length,
      nonCompliantCount: MOCK_COMPLIANCE_SCORES.filter((s) => s.status === 'non_compliant').length,
      openFindings: MOCK_AUDIT_FINDINGS.filter((f) => f.status !== 'resolved').length,
      criticalFindings: MOCK_AUDIT_FINDINGS.filter(
        (f) => f.severity === 'critical' && f.status !== 'resolved'
      ).length,
      slaAtRisk: MOCK_REMEDIATION.filter((r) => r.slaBreachRisk).length,
      upcomingDeadlines: MOCK_CALENDAR.filter((e) => {
        const due = new Date(e.dueDate);
        const today = new Date('2026-02-25');
        return (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) <= 30;
      }).length,
    };
  }
}
