/**
 * @module unionService
 * @description Union and collective bargaining management — unions, CBA agreements,
 *   grievance tracking, dues collection, membership status, negotiation history.
 * @project AURA HCM Platform
 * @section 22.6 — Union & Collective Bargaining
 *
 * Legal References:
 *  US: National Labor Relations Act (NLRA), 29 U.S.C. § 151 et seq.
 *  US: Labor Management Relations Act (LMRA/Taft-Hartley), 29 U.S.C. § 141 et seq.
 *  UK: Trade Union and Labour Relations (Consolidation) Act 1992
 *  India: Industrial Disputes Act 1947 (IDA), Trade Unions Act 1926
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type UnionStatus = 'active' | 'inactive' | 'decertified';
export type CBAStatus = 'active' | 'expired' | 'in_negotiation' | 'ratified' | 'terminated';
export type GrievanceStatus =
  | 'filed'
  | 'under_review'
  | 'hearing'
  | 'arbitration'
  | 'resolved'
  | 'withdrawn';
export type GrievanceStage = 'step_1' | 'step_2' | 'step_3_arbitration';
export type NegotiationStatus =
  | 'preparation'
  | 'table_bargaining'
  | 'impasse'
  | 'mediation'
  | 'ratification'
  | 'completed';

export interface Union {
  id: string;
  name: string;
  abbreviation: string;
  affiliation: string;
  status: UnionStatus;
  country: string;
  foundedYear: number;
  totalMembers: number;
  representedDepartments: string[];
  localChapter: string;
  president: string;
  contactEmail: string;
  recognitionDate: string;
  certificationBody: string;
}

export interface CollectiveBargainingAgreement {
  id: string;
  unionId: string;
  unionName: string;
  title: string;
  status: CBAStatus;
  effectiveDate: string;
  expiryDate: string;
  signedDate?: string;
  coverageCount: number;
  keyTerms: CBAKeyTerms;
  documents: Array<{ name: string; url: string }>;
  ratificationDate?: string;
  renewalStartDate?: string;
}

export interface CBAKeyTerms {
  wageIncrease: string; // e.g. "3% in Year 1, 3.5% in Year 2"
  workweekHours: number;
  overtimeThreshold: number;
  overtimePremium: string;
  vacationDays: string; // e.g. "15 days first 5 years, 20 days 5+ years"
  sickDays: number;
  healthInsurance: string;
  pensionContribution: string;
  grievanceProcedure: string;
  noStrikeClause: boolean;
  seniorityClauses: string[];
  disciplinaryProcedure: string;
}

export interface Grievance {
  id: string;
  unionId: string;
  unionName: string;
  employeeId: string;
  employeeName: string;
  department: string;
  cbaId: string;
  status: GrievanceStatus;
  stage: GrievanceStage;
  filedDate: string;
  description: string;
  violatedArticle: string;
  remedySought: string;
  assignedSteward: string;
  assignedHRRep: string;
  hearingDate?: string;
  arbitrationDate?: string;
  resolution?: string;
  resolvedDate?: string;
  daysOpen: number;
}

export interface DuesCollection {
  period: string;
  unionId: string;
  unionName: string;
  totalMembers: number;
  membersDuesCollected: number;
  totalAmount: number;
  currency: string;
  avgDuesPerMember: number;
  deductionDate: string;
  remittanceDate?: string;
  status: 'collected' | 'remitted' | 'pending';
}

export interface UnionMembership {
  employeeId: string;
  unionId: string;
  unionName: string;
  memberSince: string;
  membershipStatus: 'active' | 'inactive' | 'fee_only' | 'excluded';
  monthlyDues: number;
  currency: string;
  steward: boolean;
  stewardRole?: string;
}

export interface NegotiationHistory {
  id: string;
  unionId: string;
  round: number;
  status: NegotiationStatus;
  startDate: string;
  endDate?: string;
  companyLead: string;
  unionLead: string;
  sessions: number;
  keyIssues: string[];
  outcome?: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_UNIONS: Union[] = [
  {
    id: 'union-001',
    name: 'Communications Workers of America',
    abbreviation: 'CWA',
    affiliation: 'AFL-CIO',
    status: 'active',
    country: 'United States',
    foundedYear: 1938,
    totalMembers: 64,
    representedDepartments: ['Technology', 'Engineering', 'Product'],
    localChapter: 'CWA Local 9000',
    president: 'Angela Torres',
    contactEmail: 'local9000@cwa.org',
    recognitionDate: '2022-08-15',
    certificationBody: 'National Labor Relations Board (NLRB)',
  },
  {
    id: 'union-002',
    name: 'Unite the Union',
    abbreviation: 'UNITE',
    affiliation: 'TUC',
    status: 'active',
    country: 'United Kingdom',
    foundedYear: 2007,
    totalMembers: 38,
    representedDepartments: ['Operations', 'Customer Support', 'Facilities'],
    localChapter: 'Unite Branch 9832',
    president: 'William Davies',
    contactEmail: 'branch9832@unitetheunion.org',
    recognitionDate: '2023-02-01',
    certificationBody: 'Central Arbitration Committee (CAC)',
  },
];

const MOCK_CBAS: CollectiveBargainingAgreement[] = [
  {
    id: 'cba-001',
    unionId: 'union-001',
    unionName: 'CWA Local 9000',
    title: 'KreupAI US–CWA Technology Workers Agreement 2024–2027',
    status: 'active',
    effectiveDate: '2024-01-01',
    expiryDate: '2027-12-31',
    signedDate: '2023-11-15',
    coverageCount: 64,
    ratificationDate: '2023-11-15',
    renewalStartDate: '2027-07-01',
    keyTerms: {
      wageIncrease: '3.5% Year 1, 3.5% Year 2, 4.0% Year 3',
      workweekHours: 40,
      overtimeThreshold: 40,
      overtimePremium: '1.5x for hours 40-50, 2.0x above 50',
      vacationDays: '15 days years 1-4, 20 days years 5-9, 25 days 10+ years',
      sickDays: 12,
      healthInsurance: 'Employer pays 85% of premium; family coverage available',
      pensionContribution: '100% match on employee contributions up to 6%',
      grievanceProcedure: 'Informal → Step 1 (7 days) → Step 2 HR (14 days) → Step 3 Arbitration',
      noStrikeClause: true,
      seniorityClauses: [
        'Layoff by inverse seniority',
        'Shift preference by seniority',
        'Promotion — seniority among equal qualifications',
      ],
      disciplinaryProcedure: 'Progressive discipline: verbal → written → suspension → termination',
    },
    documents: [
      { name: 'Master Agreement 2024–2027', url: '/documents/cba-001-master.pdf' },
      { name: 'Side Letter — Remote Work', url: '/documents/cba-001-remote.pdf' },
    ],
  },
  {
    id: 'cba-002',
    unionId: 'union-002',
    unionName: 'Unite Branch 9832',
    title: 'KreupAI UK–Unite Operations Agreement 2025–2026',
    status: 'active',
    effectiveDate: '2025-01-01',
    expiryDate: '2026-12-31',
    signedDate: '2024-12-15',
    coverageCount: 38,
    ratificationDate: '2024-12-15',
    renewalStartDate: '2026-07-01',
    keyTerms: {
      wageIncrease: '5% Year 1, 4% Year 2',
      workweekHours: 37.5,
      overtimeThreshold: 37.5,
      overtimePremium: '1.5x weekdays; 2.0x weekends',
      vacationDays: '28 days (statutory minimum)',
      sickDays: 15,
      healthInsurance: 'BUPA private healthcare — employee and family',
      pensionContribution: 'Employer: 5%, Employee: 5% (mandatory auto-enrolment)',
      grievanceProcedure: 'Informal → Formal Step 1 → Appeal to Senior Manager → ACAS',
      noStrikeClause: false,
      seniorityClauses: ['LIFO in redundancy selection subject to objective criteria'],
      disciplinaryProcedure: 'First written → Final written → Dismissal (ACAS Code of Practice)',
    },
    documents: [{ name: 'UK Operations CBA 2025–2026', url: '/documents/cba-002-master.pdf' }],
  },
  {
    id: 'cba-003',
    unionId: 'union-001',
    unionName: 'CWA Local 9000',
    title: 'KreupAI US–CWA Technology Workers Agreement 2021–2023 (Expired)',
    status: 'expired',
    effectiveDate: '2021-01-01',
    expiryDate: '2023-12-31',
    signedDate: '2020-11-10',
    coverageCount: 52,
    keyTerms: {
      wageIncrease: '3% all years',
      workweekHours: 40,
      overtimeThreshold: 40,
      overtimePremium: '1.5x',
      vacationDays: '15 days years 1-4, 20 days 5+ years',
      sickDays: 10,
      healthInsurance: 'Employer pays 80%',
      pensionContribution: '50% match up to 4%',
      grievanceProcedure: 'Standard 3-step',
      noStrikeClause: true,
      seniorityClauses: [],
      disciplinaryProcedure: 'Progressive discipline',
    },
    documents: [],
  },
];

const MOCK_GRIEVANCES: Grievance[] = [
  {
    id: 'grv-001',
    unionId: 'union-001',
    unionName: 'CWA Local 9000',
    employeeId: 'emp-0501',
    employeeName: 'Robert Simmons',
    department: 'Technology',
    cbaId: 'cba-001',
    status: 'under_review',
    stage: 'step_1',
    filedDate: '2026-02-10',
    description: 'Employee was denied overtime opportunity contrary to CBA seniority provisions.',
    violatedArticle: 'Article 12 — Overtime Distribution',
    remedySought: 'Payment of overtime hours denied plus 1.5x premium',
    assignedSteward: 'Angela Torres (CWA)',
    assignedHRRep: 'Sarah Johnson',
    daysOpen: 15,
  },
  {
    id: 'grv-002',
    unionId: 'union-001',
    unionName: 'CWA Local 9000',
    employeeId: 'emp-0620',
    employeeName: 'Patricia Evans',
    department: 'Engineering',
    cbaId: 'cba-001',
    status: 'hearing',
    stage: 'step_2',
    filedDate: '2026-01-20',
    description:
      'Disciplinary suspension issued without following progressive discipline procedure per CBA.',
    violatedArticle: 'Article 18 — Disciplinary Procedure',
    remedySought: 'Removal of suspension from record, back pay for suspended days',
    assignedSteward: 'Angela Torres (CWA)',
    assignedHRRep: 'Sarah Johnson',
    hearingDate: '2026-03-05',
    daysOpen: 36,
  },
  {
    id: 'grv-003',
    unionId: 'union-002',
    unionName: 'Unite Branch 9832',
    employeeId: 'emp-0712',
    employeeName: 'Alan Hughes',
    department: 'Operations',
    cbaId: 'cba-002',
    status: 'resolved',
    stage: 'step_1',
    filedDate: '2026-01-05',
    description: 'Holiday entitlement calculation error — employee underpaid holiday pay.',
    violatedArticle: 'Article 8 — Annual Leave',
    remedySought: 'Correction and back payment of underpaid holiday pay',
    assignedSteward: 'William Davies (Unite)',
    assignedHRRep: 'James Whitmore',
    resolution: 'HR confirmed calculation error. Employee paid £420 back pay on 2026-02-05.',
    resolvedDate: '2026-02-05',
    daysOpen: 31,
  },
  {
    id: 'grv-004',
    unionId: 'union-001',
    unionName: 'CWA Local 9000',
    employeeId: 'emp-0838',
    employeeName: 'Donna Fields',
    department: 'Product',
    cbaId: 'cba-001',
    status: 'arbitration',
    stage: 'step_3_arbitration',
    filedDate: '2025-10-01',
    description: 'Management changed work schedules without 30-day notice as required by CBA.',
    violatedArticle: 'Article 7 — Work Schedules',
    remedySought: 'Return to original schedules; CBA compliance training for management',
    assignedSteward: 'Angela Torres (CWA)',
    assignedHRRep: 'Sarah Johnson',
    arbitrationDate: '2026-03-20',
    daysOpen: 147,
  },
  {
    id: 'grv-005',
    unionId: 'union-002',
    unionName: 'Unite Branch 9832',
    employeeId: 'emp-0945',
    employeeName: 'Kevin Morris',
    department: 'Operations',
    cbaId: 'cba-002',
    status: 'filed',
    stage: 'step_1',
    filedDate: '2026-02-20',
    description: 'Employee denied right to union representation during disciplinary meeting.',
    violatedArticle: 'Article 18 — Weingarten Rights',
    remedySought: 'Disciplinary action voided; union representation guaranteed',
    assignedSteward: 'William Davies (Unite)',
    assignedHRRep: 'James Whitmore',
    daysOpen: 5,
  },
];

const MOCK_DUES: DuesCollection[] = [
  {
    period: '2026-02',
    unionId: 'union-001',
    unionName: 'CWA Local 9000',
    totalMembers: 64,
    membersDuesCollected: 62,
    totalAmount: 4960,
    currency: 'USD',
    avgDuesPerMember: 80,
    deductionDate: '2026-02-28',
    status: 'pending',
  },
  {
    period: '2026-01',
    unionId: 'union-001',
    unionName: 'CWA Local 9000',
    totalMembers: 64,
    membersDuesCollected: 63,
    totalAmount: 5040,
    currency: 'USD',
    avgDuesPerMember: 80,
    deductionDate: '2026-01-31',
    remittanceDate: '2026-02-05',
    status: 'remitted',
  },
  {
    period: '2026-02',
    unionId: 'union-002',
    unionName: 'Unite Branch 9832',
    totalMembers: 38,
    membersDuesCollected: 38,
    totalAmount: 2280,
    currency: 'GBP',
    avgDuesPerMember: 60,
    deductionDate: '2026-02-28',
    status: 'pending',
  },
  {
    period: '2026-01',
    unionId: 'union-002',
    unionName: 'Unite Branch 9832',
    totalMembers: 38,
    membersDuesCollected: 37,
    totalAmount: 2220,
    currency: 'GBP',
    avgDuesPerMember: 60,
    deductionDate: '2026-01-31',
    remittanceDate: '2026-02-04',
    status: 'remitted',
  },
];

const MOCK_NEGOTIATIONS: NegotiationHistory[] = [
  {
    id: 'neg-001',
    unionId: 'union-001',
    round: 3,
    status: 'completed',
    startDate: '2023-07-01',
    endDate: '2023-11-15',
    companyLead: 'Sarah Johnson + Legal Team',
    unionLead: 'Angela Torres + CWA International Rep',
    sessions: 14,
    keyIssues: [
      'Wage increase (3.5% vs 5%)',
      'Remote work policy',
      'Healthcare premium split',
      'Overtime distribution seniority',
    ],
    outcome:
      'Ratified November 2023. 3.5% Y1, 3.5% Y2, 4.0% Y3. Remote work 3 days/week. Employer maintains 85% premium.',
  },
  {
    id: 'neg-002',
    unionId: 'union-001',
    round: 4,
    status: 'preparation',
    startDate: '2027-07-01',
    companyLead: 'TBD',
    unionLead: 'TBD',
    sessions: 0,
    keyIssues: [
      'Anticipated wage demands (5%+)',
      'AI/automation job security clause',
      'Enhanced parental leave',
    ],
  },
  {
    id: 'neg-003',
    unionId: 'union-002',
    round: 1,
    status: 'completed',
    startDate: '2024-08-01',
    endDate: '2024-12-15',
    companyLead: 'James Whitmore',
    unionLead: 'William Davies',
    sessions: 8,
    keyIssues: ['Wage increase', 'Flexible working', 'Mental health provision'],
    outcome:
      'Ratified December 2024. 5% Y1, 4% Y2. 2 mental health days added. Flexible Fridays agreed.',
  },
];

// ── Service Class ──────────────────────────────────────────────────────────────

export class UnionService {
  private static delay(ms = 400): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  static async getUnions(): Promise<Union[]> {
    await this.delay();
    return [...MOCK_UNIONS];
  }

  static async getUnionAgreements(unionId: string): Promise<CollectiveBargainingAgreement[]> {
    await this.delay(300);
    return MOCK_CBAS.filter((c) => c.unionId === unionId);
  }

  static async getAllAgreements(): Promise<CollectiveBargainingAgreement[]> {
    await this.delay(300);
    return [...MOCK_CBAS];
  }

  static async getAgreementDetails(
    agreementId: string
  ): Promise<CollectiveBargainingAgreement | null> {
    await this.delay(200);
    return MOCK_CBAS.find((c) => c.id === agreementId) ?? null;
  }

  static async trackGrievance(data: Partial<Grievance>): Promise<Grievance> {
    await this.delay(600);
    const grievance: Grievance = {
      id: `grv-${Date.now()}`,
      unionId: data.unionId ?? '',
      unionName: data.unionName ?? '',
      employeeId: data.employeeId ?? '',
      employeeName: data.employeeName ?? '',
      department: data.department ?? '',
      cbaId: data.cbaId ?? '',
      status: 'filed',
      stage: 'step_1',
      filedDate: new Date().toISOString().split('T')[0],
      description: data.description ?? '',
      violatedArticle: data.violatedArticle ?? '',
      remedySought: data.remedySought ?? '',
      assignedSteward: data.assignedSteward ?? '',
      assignedHRRep: data.assignedHRRep ?? '',
      daysOpen: 0,
    };
    MOCK_GRIEVANCES.push(grievance);
    return grievance;
  }

  static async getGrievances(filters?: {
    status?: GrievanceStatus;
    unionId?: string;
  }): Promise<Grievance[]> {
    await this.delay(300);
    let grievances = [...MOCK_GRIEVANCES];
    if (filters?.status) grievances = grievances.filter((g) => g.status === filters.status);
    if (filters?.unionId) grievances = grievances.filter((g) => g.unionId === filters.unionId);
    return grievances;
  }

  static async getDuesCollection(period?: string): Promise<DuesCollection[]> {
    await this.delay(300);
    if (period) return MOCK_DUES.filter((d) => d.period === period);
    return [...MOCK_DUES];
  }

  static async getUnionMembership(_employeeId: string): Promise<UnionMembership | null> {
    await this.delay(200);
    return null; // Not in union by default for mock
  }

  static async getNegotiationHistory(unionId: string): Promise<NegotiationHistory[]> {
    await this.delay(300);
    return MOCK_NEGOTIATIONS.filter((n) => n.unionId === unionId);
  }
}
