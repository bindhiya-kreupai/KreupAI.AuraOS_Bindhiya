/**
 * @module benefitsClaimsService
 * @description Benefits Claims Management — insurance claims, COBRA continuation,
 *   plan enrollment, EOB processing, admin approval workflows.
 * @project AURA HCM Platform
 * @section 18.1-18.3 — Benefits & Insurance
 * @legal COBRA compliance per IRS guidelines (60-day election window, 18/36 months coverage);
 *   ERISA Section 606 qualifying event notifications
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type ClaimType =
  | 'Medical'
  | 'Dental'
  | 'Vision'
  | 'Prescription'
  | 'Mental Health'
  | 'Physical Therapy'
  | 'Emergency'
  | 'Preventive';
export type ClaimStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Additional Info Required'
  | 'Approved'
  | 'Denied'
  | 'Paid'
  | 'Appealed';
export type PlanType = 'Medical' | 'Dental' | 'Vision' | 'Life' | 'Disability' | 'FSA' | 'HSA';
export type COBRAQualifyingEvent =
  | 'Termination'
  | 'Reduction in Hours'
  | 'Divorce'
  | 'Medicare Entitlement'
  | 'Dependent Loss of Status'
  | 'Employer Bankruptcy';
export type COBRAStatus =
  | 'Eligible'
  | 'Notice Sent'
  | 'Elected'
  | 'Active'
  | 'Expired'
  | 'Declined';

export interface InsuranceClaim {
  id: string;
  claimNumber: string;
  employeeId: string;
  employeeName: string;
  planId: string;
  planName: string;
  planType: PlanType;
  claimType: ClaimType;
  serviceDate: string;
  providerName: string;
  providerNPI?: string;
  diagnosis: string;
  billedAmount: number;
  allowedAmount: number;
  planPaid: number;
  deductibleApplied: number;
  coinsuranceAmount: number;
  copayAmount: number;
  employeeOwes: number;
  receipts: ClaimReceipt[];
  status: ClaimStatus;
  submittedDate: string;
  processedDate: string | null;
  paidDate: string | null;
  denialReason: string | null;
  eobReference: string | null;
  adminNotes: string;
  isDependent: boolean;
  dependentName: string | null;
  timeline: ClaimTimelineEvent[];
}

export interface ClaimReceipt {
  id: string;
  fileName: string;
  fileType: string;
  sizeKb: number;
  uploadedDate: string;
  url: string;
}

export interface ClaimTimelineEvent {
  timestamp: string;
  event: string;
  performedBy: string;
  notes: string;
}

export interface EnrolledPlan {
  planId: string;
  planType: PlanType;
  planName: string;
  carrier: string;
  coverageLevel: string;
  employeePremium: number;
  employerPremium: number;
  effectiveDate: string;
  renewalDate: string;
  deductibleUsed: number;
  deductibleLimit: number;
  outOfPocketUsed: number;
  outOfPocketMax: number;
  claimsCount: number;
  totalClaimed: number;
  totalPaid: number;
  isActive: boolean;
  groupNumber: string;
  memberId: string;
}

export interface BenefitsSummary {
  employeeId: string;
  totalBenefitsValue: number;
  employerContribution: number;
  employeeContribution: number;
  enrolledPlans: EnrolledPlan[];
  ytdClaimsAmount: number;
  ytdClaimsPaid: number;
  pendingClaims: number;
  dependentsCount: number;
}

export interface COBRARecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  qualifyingEvent: COBRAQualifyingEvent;
  qualifyingEventDate: string;
  electionDeadline: string; // 60 days from qualifying event / notice
  electionDate: string | null;
  status: COBRAStatus;
  coverageStartDate: string | null;
  coverageEndDate: string | null;
  maxDurationMonths: number; // 18 or 36
  availablePlans: COBRAPlan[];
  electedPlans: string[]; // planIds
  totalMonthlyCost: number;
  payments: COBRAPayment[];
  noticeDate: string;
}

export interface COBRAPlan {
  planId: string;
  planName: string;
  planType: PlanType;
  carrier: string;
  originalPremium: number;
  cobraPremium: number; // original + 2% admin fee
  coverageLevel: string;
}

export interface COBRAPayment {
  id: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: 'Pending' | 'Paid' | 'Overdue' | 'Grace Period';
  paymentMethod: string;
}

export interface ClaimFilters {
  employeeId?: string;
  planType?: PlanType[];
  status?: ClaimStatus[];
  startDate?: string;
  endDate?: string;
  claimType?: ClaimType[];
}

export interface SubmitClaimData {
  employeeId: string;
  planId: string;
  claimType: ClaimType;
  serviceDate: string;
  providerName: string;
  diagnosis: string;
  billedAmount: number;
  receipts: Omit<ClaimReceipt, 'id' | 'uploadedDate' | 'url'>[];
  isDependent: boolean;
  dependentName: string | null;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_ENROLLED_PLANS: EnrolledPlan[] = [
  {
    planId: 'h-gold',
    planType: 'Medical',
    planName: 'Balanced Choice (Gold)',
    carrier: 'Blue Cross Blue Shield',
    coverageLevel: 'Family',
    employeePremium: 350,
    employerPremium: 1200,
    effectiveDate: '2026-01-01',
    renewalDate: '2026-12-31',
    deductibleUsed: 450,
    deductibleLimit: 3000,
    outOfPocketUsed: 720,
    outOfPocketMax: 10000,
    claimsCount: 3,
    totalClaimed: 1850,
    totalPaid: 1430,
    isActive: true,
    groupNumber: 'GRP-2026-001',
    memberId: 'MBR-EMP001',
  },
  {
    planId: 'd-gold',
    planType: 'Dental',
    planName: 'Comprehensive Dental',
    carrier: 'Delta Dental',
    coverageLevel: 'Family',
    employeePremium: 75,
    employerPremium: 85,
    effectiveDate: '2026-01-01',
    renewalDate: '2026-12-31',
    deductibleUsed: 25,
    deductibleLimit: 75,
    outOfPocketUsed: 180,
    outOfPocketMax: 2000,
    claimsCount: 1,
    totalClaimed: 380,
    totalPaid: 280,
    isActive: true,
    groupNumber: 'GRP-DENTAL-001',
    memberId: 'MBR-D-EMP001',
  },
  {
    planId: 'v-basic',
    planType: 'Vision',
    planName: 'Standard Vision',
    carrier: 'VSP Vision',
    coverageLevel: 'Family',
    employeePremium: 18,
    employerPremium: 30,
    effectiveDate: '2026-01-01',
    renewalDate: '2026-12-31',
    deductibleUsed: 0,
    deductibleLimit: 0,
    outOfPocketUsed: 45,
    outOfPocketMax: 400,
    claimsCount: 1,
    totalClaimed: 185,
    totalPaid: 140,
    isActive: true,
    groupNumber: 'GRP-VIS-001',
    memberId: 'MBR-V-EMP001',
  },
  {
    planId: 'life-basic',
    planType: 'Life',
    planName: 'Group Term Life (2x Salary)',
    carrier: 'MetLife',
    coverageLevel: 'Employee Only',
    employeePremium: 0,
    employerPremium: 45,
    effectiveDate: '2026-01-01',
    renewalDate: '2026-12-31',
    deductibleUsed: 0,
    deductibleLimit: 0,
    outOfPocketUsed: 0,
    outOfPocketMax: 0,
    claimsCount: 0,
    totalClaimed: 0,
    totalPaid: 0,
    isActive: true,
    groupNumber: 'GRP-LIFE-001',
    memberId: 'MBR-L-EMP001',
  },
  {
    planId: 'disability-std',
    planType: 'Disability',
    planName: 'Short & Long Term Disability',
    carrier: 'Cigna',
    coverageLevel: 'Employee Only',
    employeePremium: 12,
    employerPremium: 28,
    effectiveDate: '2026-01-01',
    renewalDate: '2026-12-31',
    deductibleUsed: 0,
    deductibleLimit: 0,
    outOfPocketUsed: 0,
    outOfPocketMax: 0,
    claimsCount: 0,
    totalClaimed: 0,
    totalPaid: 0,
    isActive: true,
    groupNumber: 'GRP-DIS-001',
    memberId: 'MBR-DIS-EMP001',
  },
];

const MOCK_CLAIMS: InsuranceClaim[] = [
  {
    id: 'clm-001',
    claimNumber: 'CLM-2026-0001',
    employeeId: 'emp-self',
    employeeName: 'Priya Sharma',
    planId: 'h-gold',
    planName: 'Balanced Choice (Gold)',
    planType: 'Medical',
    claimType: 'Medical',
    serviceDate: '2026-01-15',
    providerName: 'Dubai Healthcare City Clinic',
    providerNPI: 'NPI001',
    diagnosis: 'Acute Sinusitis',
    billedAmount: 450,
    allowedAmount: 380,
    planPaid: 304,
    deductibleApplied: 76,
    coinsuranceAmount: 0,
    copayAmount: 30,
    employeeOwes: 106,
    status: 'Paid',
    submittedDate: '2026-01-17',
    processedDate: '2026-01-22',
    paidDate: '2026-01-25',
    denialReason: null,
    eobReference: 'EOB-2026-01-001',
    adminNotes: '',
    isDependent: false,
    dependentName: null,
    receipts: [
      {
        id: 'rcpt-001',
        fileName: 'clinic_receipt_jan15.pdf',
        fileType: 'pdf',
        sizeKb: 180,
        uploadedDate: '2026-01-17',
        url: '/receipts/clm-001/1.pdf',
      },
    ],
    timeline: [
      {
        timestamp: '2026-01-17T10:00:00Z',
        event: 'Claim Submitted',
        performedBy: 'Priya Sharma',
        notes: '',
      },
      {
        timestamp: '2026-01-20T09:00:00Z',
        event: 'Under Review',
        performedBy: 'BCBS System',
        notes: 'Automated adjudication started',
      },
      {
        timestamp: '2026-01-22T11:00:00Z',
        event: 'Approved',
        performedBy: 'BCBS Adjudicator',
        notes: '$304 approved per plan EOB',
      },
      {
        timestamp: '2026-01-25T00:00:00Z',
        event: 'Paid',
        performedBy: 'BCBS Finance',
        notes: 'Payment issued via ACH',
      },
    ],
  },
  {
    id: 'clm-002',
    claimNumber: 'CLM-2026-0002',
    employeeId: 'emp-self',
    employeeName: 'Priya Sharma',
    planId: 'h-gold',
    planName: 'Balanced Choice (Gold)',
    planType: 'Medical',
    claimType: 'Prescription',
    serviceDate: '2026-01-22',
    providerName: 'Aster Pharmacy',
    providerNPI: undefined,
    diagnosis: 'Antibiotics — Amoxicillin',
    billedAmount: 85,
    allowedAmount: 75,
    planPaid: 45,
    deductibleApplied: 0,
    coinsuranceAmount: 30,
    copayAmount: 0,
    employeeOwes: 40,
    status: 'Paid',
    submittedDate: '2026-01-22',
    processedDate: '2026-01-24',
    paidDate: '2026-01-28',
    denialReason: null,
    eobReference: 'EOB-2026-01-002',
    adminNotes: '',
    isDependent: false,
    dependentName: null,
    receipts: [],
    timeline: [
      {
        timestamp: '2026-01-22T12:00:00Z',
        event: 'Claim Submitted',
        performedBy: 'Priya Sharma',
        notes: '',
      },
      {
        timestamp: '2026-01-24T10:00:00Z',
        event: 'Approved',
        performedBy: 'BCBS System',
        notes: '',
      },
      { timestamp: '2026-01-28T00:00:00Z', event: 'Paid', performedBy: 'BCBS Finance', notes: '' },
    ],
  },
  {
    id: 'clm-003',
    claimNumber: 'CLM-2026-0003',
    employeeId: 'emp-self',
    employeeName: 'Priya Sharma',
    planId: 'd-gold',
    planName: 'Comprehensive Dental',
    planType: 'Dental',
    claimType: 'Dental',
    serviceDate: '2026-02-05',
    providerName: 'Smile Dental Clinic',
    providerNPI: undefined,
    diagnosis: 'Cavity Filling — Upper Molar',
    billedAmount: 380,
    allowedAmount: 350,
    planPaid: 280,
    deductibleApplied: 25,
    coinsuranceAmount: 45,
    copayAmount: 0,
    employeeOwes: 100,
    status: 'Approved',
    submittedDate: '2026-02-07',
    processedDate: '2026-02-12',
    paidDate: null,
    denialReason: null,
    eobReference: 'EOB-2026-02-003',
    adminNotes: '',
    isDependent: false,
    dependentName: null,
    receipts: [
      {
        id: 'rcpt-003',
        fileName: 'dental_receipt.pdf',
        fileType: 'pdf',
        sizeKb: 220,
        uploadedDate: '2026-02-07',
        url: '/receipts/clm-003/1.pdf',
      },
    ],
    timeline: [
      {
        timestamp: '2026-02-07T09:00:00Z',
        event: 'Claim Submitted',
        performedBy: 'Priya Sharma',
        notes: '',
      },
      {
        timestamp: '2026-02-12T10:00:00Z',
        event: 'Approved',
        performedBy: 'Delta Dental Adjudicator',
        notes: '',
      },
    ],
  },
  {
    id: 'clm-004',
    claimNumber: 'CLM-2026-0004',
    employeeId: 'emp-self',
    employeeName: 'Priya Sharma',
    planId: 'v-basic',
    planName: 'Standard Vision',
    planType: 'Vision',
    claimType: 'Vision',
    serviceDate: '2026-01-30',
    providerName: 'Vision Express',
    providerNPI: undefined,
    diagnosis: 'Annual Eye Exam + Frames',
    billedAmount: 320,
    allowedAmount: 275,
    planPaid: 140,
    deductibleApplied: 0,
    coinsuranceAmount: 0,
    copayAmount: 10,
    employeeOwes: 145,
    status: 'Paid',
    submittedDate: '2026-01-31',
    processedDate: '2026-02-03',
    paidDate: '2026-02-05',
    denialReason: null,
    eobReference: 'EOB-2026-01-004',
    adminNotes: '',
    isDependent: false,
    dependentName: null,
    receipts: [],
    timeline: [
      {
        timestamp: '2026-01-31T11:00:00Z',
        event: 'Claim Submitted',
        performedBy: 'Priya Sharma',
        notes: '',
      },
      {
        timestamp: '2026-02-03T09:00:00Z',
        event: 'Approved',
        performedBy: 'VSP System',
        notes: '',
      },
      { timestamp: '2026-02-05T00:00:00Z', event: 'Paid', performedBy: 'VSP Finance', notes: '' },
    ],
  },
  {
    id: 'clm-005',
    claimNumber: 'CLM-2026-0005',
    employeeId: 'emp-self',
    employeeName: 'Priya Sharma',
    planId: 'h-gold',
    planName: 'Balanced Choice (Gold)',
    planType: 'Medical',
    claimType: 'Medical',
    serviceDate: '2026-02-18',
    providerName: 'City Hospital Emergency',
    providerNPI: 'NPI005',
    diagnosis: 'Emergency — Appendicitis',
    billedAmount: 12500,
    allowedAmount: 11000,
    planPaid: 9240,
    deductibleApplied: 1760,
    coinsuranceAmount: 0,
    copayAmount: 200,
    employeeOwes: 2760,
    status: 'Under Review',
    submittedDate: '2026-02-20',
    processedDate: null,
    paidDate: null,
    denialReason: null,
    eobReference: null,
    adminNotes: 'Awaiting hospital itemized bill.',
    isDependent: false,
    dependentName: null,
    receipts: [
      {
        id: 'rcpt-005',
        fileName: 'hospital_estimate.pdf',
        fileType: 'pdf',
        sizeKb: 450,
        uploadedDate: '2026-02-20',
        url: '/receipts/clm-005/1.pdf',
      },
    ],
    timeline: [
      {
        timestamp: '2026-02-20T14:00:00Z',
        event: 'Claim Submitted',
        performedBy: 'Priya Sharma',
        notes: 'Emergency hospitalization',
      },
      {
        timestamp: '2026-02-21T09:00:00Z',
        event: 'Under Review',
        performedBy: 'BCBS System',
        notes: 'High-cost claim — manual review required',
      },
    ],
  },
  // Admin view — other employees' pending claims
  {
    id: 'clm-006',
    claimNumber: 'CLM-2026-0006',
    employeeId: 'emp-015',
    employeeName: 'Ravi Shankar',
    planId: 'h-gold',
    planName: 'Balanced Choice (Gold)',
    planType: 'Medical',
    claimType: 'Mental Health',
    serviceDate: '2026-02-10',
    providerName: 'Mind Wellness Center',
    providerNPI: undefined,
    diagnosis: 'Anxiety — Therapy Session',
    billedAmount: 200,
    allowedAmount: 180,
    planPaid: 144,
    deductibleApplied: 0,
    coinsuranceAmount: 36,
    copayAmount: 0,
    employeeOwes: 56,
    status: 'Submitted',
    submittedDate: '2026-02-15',
    processedDate: null,
    paidDate: null,
    denialReason: null,
    eobReference: null,
    adminNotes: '',
    isDependent: false,
    dependentName: null,
    receipts: [],
    timeline: [],
  },
  {
    id: 'clm-007',
    claimNumber: 'CLM-2026-0007',
    employeeId: 'emp-016',
    employeeName: 'Layla Hassan',
    planId: 'h-gold',
    planName: 'Balanced Choice (Gold)',
    planType: 'Medical',
    claimType: 'Physical Therapy',
    serviceDate: '2026-01-28',
    providerName: 'PhysioPlus Clinic',
    providerNPI: undefined,
    diagnosis: 'Lower Back Pain — PT Session 1 of 10',
    billedAmount: 350,
    allowedAmount: 310,
    planPaid: 248,
    deductibleApplied: 62,
    coinsuranceAmount: 0,
    copayAmount: 0,
    employeeOwes: 112,
    status: 'Additional Info Required',
    submittedDate: '2026-02-01',
    processedDate: null,
    paidDate: null,
    denialReason: null,
    eobReference: null,
    adminNotes: 'Referral letter required.',
    isDependent: false,
    dependentName: null,
    receipts: [],
    timeline: [],
  },
  {
    id: 'clm-008',
    claimNumber: 'CLM-2026-0008',
    employeeId: 'emp-017',
    employeeName: 'James Wilson',
    planId: 'd-gold',
    planName: 'Comprehensive Dental',
    planType: 'Dental',
    claimType: 'Dental',
    serviceDate: '2026-02-14',
    providerName: 'Family Dental Care',
    providerNPI: undefined,
    diagnosis: 'Crown — Lower Premolar',
    billedAmount: 1200,
    allowedAmount: 1100,
    planPaid: 550,
    deductibleApplied: 0,
    coinsuranceAmount: 550,
    copayAmount: 0,
    employeeOwes: 650,
    status: 'Submitted',
    submittedDate: '2026-02-15',
    processedDate: null,
    paidDate: null,
    denialReason: null,
    eobReference: null,
    adminNotes: '',
    isDependent: false,
    dependentName: null,
    receipts: [],
    timeline: [],
  },
  {
    id: 'clm-009',
    claimNumber: 'CLM-2026-0009',
    employeeId: 'emp-018',
    employeeName: 'Divya Menon',
    planId: 'h-gold',
    planName: 'Balanced Choice (Gold)',
    planType: 'Medical',
    claimType: 'Preventive',
    serviceDate: '2026-02-01',
    providerName: 'Preventive Health Clinic',
    providerNPI: undefined,
    diagnosis: 'Annual Wellness Check',
    billedAmount: 0,
    allowedAmount: 0,
    planPaid: 0,
    deductibleApplied: 0,
    coinsuranceAmount: 0,
    copayAmount: 0,
    employeeOwes: 0,
    status: 'Approved',
    submittedDate: '2026-02-01',
    processedDate: '2026-02-03',
    paidDate: '2026-02-05',
    denialReason: null,
    eobReference: 'EOB-2026-02-009',
    adminNotes: '100% covered — preventive.',
    isDependent: false,
    dependentName: null,
    receipts: [],
    timeline: [],
  },
  {
    id: 'clm-010',
    claimNumber: 'CLM-2025-0048',
    employeeId: 'emp-019',
    employeeName: 'Thomas Adeyemi',
    planId: 'h-gold',
    planName: 'Balanced Choice (Gold)',
    planType: 'Medical',
    claimType: 'Emergency',
    serviceDate: '2025-12-20',
    providerName: 'Rashid Hospital',
    providerNPI: undefined,
    diagnosis: 'Fractured Wrist — ER Visit',
    billedAmount: 3800,
    allowedAmount: 3500,
    planPaid: 2800,
    deductibleApplied: 500,
    coinsuranceAmount: 200,
    copayAmount: 200,
    employeeOwes: 900,
    status: 'Denied',
    submittedDate: '2025-12-22',
    processedDate: '2026-01-05',
    paidDate: null,
    denialReason:
      'Out-of-network provider — claim exceeds allowed amount for out-of-network services.',
    eobReference: 'EOB-2025-12-048',
    adminNotes: 'Appeal window open until 2026-02-05.',
    isDependent: false,
    dependentName: null,
    receipts: [],
    timeline: [],
  },
  {
    id: 'clm-011',
    claimNumber: 'CLM-2026-0011',
    employeeId: 'emp-020',
    employeeName: 'Maria Gonzalez',
    planId: 'h-gold',
    planName: 'Balanced Choice (Gold)',
    planType: 'Medical',
    claimType: 'Medical',
    serviceDate: '2026-02-16',
    providerName: 'Specalist Clinic',
    providerNPI: undefined,
    diagnosis: 'Migraine — Specialist Consultation',
    billedAmount: 280,
    allowedAmount: 250,
    planPaid: 200,
    deductibleApplied: 0,
    coinsuranceAmount: 50,
    copayAmount: 50,
    employeeOwes: 80,
    status: 'Submitted',
    submittedDate: '2026-02-18',
    processedDate: null,
    paidDate: null,
    denialReason: null,
    eobReference: null,
    adminNotes: '',
    isDependent: false,
    dependentName: null,
    receipts: [],
    timeline: [],
  },
  {
    id: 'clm-012',
    claimNumber: 'CLM-2026-0012',
    employeeId: 'emp-021',
    employeeName: 'Yusuf Ibrahim',
    planId: 'v-basic',
    planName: 'Standard Vision',
    planType: 'Vision',
    claimType: 'Vision',
    serviceDate: '2026-02-12',
    providerName: 'Optical World',
    providerNPI: undefined,
    diagnosis: 'Contact Lens Purchase',
    billedAmount: 155,
    allowedAmount: 130,
    planPaid: 80,
    deductibleApplied: 0,
    coinsuranceAmount: 0,
    copayAmount: 0,
    employeeOwes: 75,
    status: 'Approved',
    submittedDate: '2026-02-13',
    processedDate: '2026-02-15',
    paidDate: null,
    denialReason: null,
    eobReference: 'EOB-2026-02-012',
    adminNotes: '',
    isDependent: false,
    dependentName: null,
    receipts: [],
    timeline: [],
  },
  {
    id: 'clm-013',
    claimNumber: 'CLM-2026-0013',
    employeeId: 'emp-022',
    employeeName: 'Keiko Tanaka',
    planId: 'h-gold',
    planName: 'Balanced Choice (Gold)',
    planType: 'Medical',
    claimType: 'Medical',
    serviceDate: '2026-02-08',
    providerName: 'Dubai Medical Center',
    providerNPI: undefined,
    diagnosis: 'Urinary Tract Infection — GP Visit',
    billedAmount: 180,
    allowedAmount: 160,
    planPaid: 130,
    deductibleApplied: 0,
    coinsuranceAmount: 0,
    copayAmount: 30,
    employeeOwes: 50,
    status: 'Paid',
    submittedDate: '2026-02-10',
    processedDate: '2026-02-13',
    paidDate: '2026-02-16',
    denialReason: null,
    eobReference: 'EOB-2026-02-013',
    adminNotes: '',
    isDependent: false,
    dependentName: null,
    receipts: [],
    timeline: [],
  },
  {
    id: 'clm-014',
    claimNumber: 'CLM-2026-0014',
    employeeId: 'emp-023',
    employeeName: 'Patrick Osei',
    planId: 'd-gold',
    planName: 'Comprehensive Dental',
    planType: 'Dental',
    claimType: 'Dental',
    serviceDate: '2026-02-20',
    providerName: 'Bright Smiles Dental',
    providerNPI: undefined,
    diagnosis: 'Root Canal — Upper Incisor',
    billedAmount: 2200,
    allowedAmount: 2000,
    planPaid: 1200,
    deductibleApplied: 0,
    coinsuranceAmount: 800,
    copayAmount: 0,
    employeeOwes: 1000,
    status: 'Submitted',
    submittedDate: '2026-02-22',
    processedDate: null,
    paidDate: null,
    denialReason: null,
    eobReference: null,
    adminNotes: '',
    isDependent: false,
    dependentName: null,
    receipts: [],
    timeline: [],
  },
  {
    id: 'clm-015',
    claimNumber: 'CLM-2025-0078',
    employeeId: 'emp-024',
    employeeName: 'Elena Petrova',
    planId: 'h-gold',
    planName: 'Balanced Choice (Gold)',
    planType: 'Medical',
    claimType: 'Medical',
    serviceDate: '2025-11-18',
    providerName: 'German Medical Center',
    providerNPI: undefined,
    diagnosis: 'Dermatology Consultation',
    billedAmount: 420,
    allowedAmount: 380,
    planPaid: 304,
    deductibleApplied: 76,
    coinsuranceAmount: 0,
    copayAmount: 30,
    employeeOwes: 116,
    status: 'Paid',
    submittedDate: '2025-11-20',
    processedDate: '2025-11-25',
    paidDate: '2025-11-28',
    denialReason: null,
    eobReference: 'EOB-2025-11-078',
    adminNotes: '',
    isDependent: false,
    dependentName: null,
    receipts: [],
    timeline: [],
  },
];

const MOCK_COBRA_RECORDS: COBRARecord[] = [
  {
    id: 'cobra-001',
    employeeId: 'emp-029',
    employeeName: 'Raj Patel',
    department: 'Operations',
    qualifyingEvent: 'Termination',
    qualifyingEventDate: '2026-02-14',
    electionDeadline: '2026-04-15',
    electionDate: null,
    status: 'Notice Sent',
    coverageStartDate: null,
    coverageEndDate: null,
    maxDurationMonths: 18,
    electedPlans: [],
    totalMonthlyCost: 0,
    noticeDate: '2026-02-15',
    availablePlans: [
      {
        planId: 'h-gold',
        planName: 'Balanced Choice (Gold)',
        planType: 'Medical',
        carrier: 'BCBS',
        originalPremium: 1550,
        cobraPremium: 1581,
        coverageLevel: 'Family',
      },
      {
        planId: 'd-gold',
        planName: 'Comprehensive Dental',
        planType: 'Dental',
        carrier: 'Delta Dental',
        originalPremium: 160,
        cobraPremium: 163.2,
        coverageLevel: 'Family',
      },
      {
        planId: 'v-basic',
        planName: 'Standard Vision',
        planType: 'Vision',
        carrier: 'VSP',
        originalPremium: 48,
        cobraPremium: 48.96,
        coverageLevel: 'Family',
      },
    ],
    payments: [],
  },
  {
    id: 'cobra-002',
    employeeId: 'emp-040',
    employeeName: 'Sarah Kim',
    department: 'Technology',
    qualifyingEvent: 'Termination',
    qualifyingEventDate: '2025-12-15',
    electionDeadline: '2026-02-13',
    electionDate: '2026-01-10',
    status: 'Active',
    coverageStartDate: '2026-01-01',
    coverageEndDate: '2027-07-01',
    maxDurationMonths: 18,
    electedPlans: ['h-gold'],
    totalMonthlyCost: 670,
    noticeDate: '2025-12-16',
    availablePlans: [
      {
        planId: 'h-gold',
        planName: 'Balanced Choice (Gold)',
        planType: 'Medical',
        carrier: 'BCBS',
        originalPremium: 670,
        cobraPremium: 670,
        coverageLevel: 'Employee Only',
      },
      {
        planId: 'd-gold',
        planName: 'Comprehensive Dental',
        planType: 'Dental',
        carrier: 'Delta Dental',
        originalPremium: 75,
        cobraPremium: 76.5,
        coverageLevel: 'Employee Only',
      },
    ],
    payments: [
      {
        id: 'cpay-001',
        amount: 670,
        dueDate: '2026-01-31',
        paidDate: '2026-01-28',
        status: 'Paid',
        paymentMethod: 'Bank Transfer',
      },
      {
        id: 'cpay-002',
        amount: 670,
        dueDate: '2026-02-28',
        paidDate: null,
        status: 'Pending',
        paymentMethod: 'Bank Transfer',
      },
    ],
  },
  {
    id: 'cobra-003',
    employeeId: 'emp-090',
    employeeName: 'Priya Iyer',
    department: 'Product',
    qualifyingEvent: 'Termination',
    qualifyingEventDate: '2026-02-28',
    electionDeadline: '2026-04-29',
    electionDate: null,
    status: 'Eligible',
    coverageStartDate: null,
    coverageEndDate: null,
    maxDurationMonths: 18,
    electedPlans: [],
    totalMonthlyCost: 0,
    noticeDate: '2026-03-01',
    availablePlans: [
      {
        planId: 'h-gold',
        planName: 'Balanced Choice (Gold)',
        planType: 'Medical',
        carrier: 'BCBS',
        originalPremium: 670,
        cobraPremium: 683.4,
        coverageLevel: 'Employee Only',
      },
    ],
    payments: [],
  },
];

// ── Service ────────────────────────────────────────────────────────────────────

export class BenefitsClaimsService {
  /**
   * Get enrolled benefit plans for an employee.
   */
  static async getPlans(_employeeId: string): Promise<EnrolledPlan[]> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_ENROLLED_PLANS.filter((p) => p.isActive);
  }

  /**
   * Submit an insurance claim.
   */
  static async submitClaim(data: SubmitClaimData): Promise<InsuranceClaim> {
    await new Promise((r) => setTimeout(r, 200));
    const plan = MOCK_ENROLLED_PLANS.find((p) => p.planId === data.planId);
    const claim: InsuranceClaim = {
      id: `clm-${Date.now()}`,
      claimNumber: `CLM-${new Date().getFullYear()}-${String(MOCK_CLAIMS.length + 1).padStart(4, '0')}`,
      employeeId: data.employeeId,
      employeeName: 'Current User',
      planId: data.planId,
      planName: plan?.planName ?? 'Unknown Plan',
      planType: plan?.planType ?? 'Medical',
      claimType: data.claimType,
      serviceDate: data.serviceDate,
      providerName: data.providerName,
      diagnosis: data.diagnosis,
      billedAmount: data.billedAmount,
      allowedAmount: 0,
      planPaid: 0,
      deductibleApplied: 0,
      coinsuranceAmount: 0,
      copayAmount: 0,
      employeeOwes: 0,
      receipts: data.receipts.map((r, i) => ({
        ...r,
        id: `rcpt-${Date.now()}-${i}`,
        uploadedDate: new Date().toISOString().slice(0, 10),
        url: `/receipts/new/${i}`,
      })),
      status: 'Submitted',
      submittedDate: new Date().toISOString().slice(0, 10),
      processedDate: null,
      paidDate: null,
      denialReason: null,
      eobReference: null,
      adminNotes: '',
      isDependent: data.isDependent,
      dependentName: data.dependentName,
      timeline: [
        {
          timestamp: new Date().toISOString(),
          event: 'Claim Submitted',
          performedBy: 'Current User',
          notes: '',
        },
      ],
    };
    MOCK_CLAIMS.push(claim);
    return claim;
  }

  /**
   * Get claim history with optional filters.
   */
  static async getClaims(employeeId: string, filters?: ClaimFilters): Promise<InsuranceClaim[]> {
    await new Promise((r) => setTimeout(r, 200));
    let result =
      employeeId === 'admin'
        ? [...MOCK_CLAIMS]
        : MOCK_CLAIMS.filter((c) => c.employeeId === employeeId);

    if (filters?.planType?.length) {
      result = result.filter((c) => filters.planType!.includes(c.planType));
    }
    if (filters?.status?.length) {
      result = result.filter((c) => filters.status!.includes(c.status));
    }
    if (filters?.claimType?.length) {
      result = result.filter((c) => filters.claimType!.includes(c.claimType));
    }
    if (filters?.startDate) {
      result = result.filter((c) => c.serviceDate >= filters.startDate!);
    }
    if (filters?.endDate) {
      result = result.filter((c) => c.serviceDate <= filters.endDate!);
    }

    return result.sort(
      (a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime()
    );
  }

  /**
   * Get full claim detail.
   */
  static async getClaimDetail(claimId: string): Promise<InsuranceClaim | null> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_CLAIMS.find((c) => c.id === claimId) ?? null;
  }

  /**
   * Admin: approve a claim.
   */
  static async approveClaim(claimId: string): Promise<InsuranceClaim> {
    await new Promise((r) => setTimeout(r, 200));
    const claim = MOCK_CLAIMS.find((c) => c.id === claimId);
    if (!claim) throw new Error(`Claim ${claimId} not found`);
    claim.status = 'Approved';
    claim.processedDate = new Date().toISOString().slice(0, 10);
    claim.timeline.push({
      timestamp: new Date().toISOString(),
      event: 'Approved',
      performedBy: 'HR Admin',
      notes: 'Approved manually by HR.',
    });
    return claim;
  }

  /**
   * Admin: reject a claim.
   */
  static async rejectClaim(claimId: string, reason: string): Promise<InsuranceClaim> {
    await new Promise((r) => setTimeout(r, 200));
    const claim = MOCK_CLAIMS.find((c) => c.id === claimId);
    if (!claim) throw new Error(`Claim ${claimId} not found`);
    claim.status = 'Denied';
    claim.denialReason = reason;
    claim.processedDate = new Date().toISOString().slice(0, 10);
    claim.timeline.push({
      timestamp: new Date().toISOString(),
      event: 'Denied',
      performedBy: 'HR Admin',
      notes: reason,
    });
    return claim;
  }

  /**
   * Get open enrollment window status.
   */
  static async getEligibilityWindow(): Promise<{
    isOpen: boolean;
    startDate: string;
    endDate: string;
    effectiveDate: string;
    daysRemaining: number;
    type: 'Annual' | 'Special';
  }> {
    await new Promise((r) => setTimeout(r, 200));
    return {
      isOpen: false,
      startDate: '2026-11-01',
      endDate: '2026-11-30',
      effectiveDate: '2027-01-01',
      daysRemaining: 0,
      type: 'Annual',
    };
  }

  /**
   * Get benefits summary for an employee.
   */
  static async getBenefitsSummary(employeeId: string): Promise<BenefitsSummary> {
    await new Promise((r) => setTimeout(r, 200));
    const plans = MOCK_ENROLLED_PLANS;
    const claims = MOCK_CLAIMS.filter((c) => c.employeeId === employeeId);

    const totalBenefitsValue = plans.reduce(
      (s, p) => s + (p.employeePremium + p.employerPremium) * 12,
      0
    );
    const employerContribution = plans.reduce((s, p) => s + p.employerPremium * 12, 0);
    const employeeContribution = plans.reduce((s, p) => s + p.employeePremium * 12, 0);

    return {
      employeeId,
      totalBenefitsValue,
      employerContribution,
      employeeContribution,
      enrolledPlans: plans,
      ytdClaimsAmount: claims.reduce((s, c) => s + c.billedAmount, 0),
      ytdClaimsPaid: claims.reduce((s, c) => s + c.planPaid, 0),
      pendingClaims: claims.filter((c) =>
        ['Submitted', 'Under Review', 'Additional Info Required'].includes(c.status)
      ).length,
      dependentsCount: 3,
    };
  }

  /**
   * Check COBRA eligibility for an employee.
   */
  static async getCOBRAEligibility(employeeId: string): Promise<COBRARecord | null> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_COBRA_RECORDS.find((r) => r.employeeId === employeeId) ?? null;
  }

  /**
   * Initiate COBRA coverage election.
   */
  static async initiateCOBRA(employeeId: string, planIds: string[]): Promise<COBRARecord> {
    await new Promise((r) => setTimeout(r, 200));
    const record = MOCK_COBRA_RECORDS.find((r) => r.employeeId === employeeId);
    if (!record) throw new Error(`No COBRA eligibility found for employee ${employeeId}`);

    record.status = 'Elected';
    record.electionDate = new Date().toISOString().slice(0, 10);
    record.electedPlans = planIds;
    record.coverageStartDate = record.qualifyingEventDate;
    record.totalMonthlyCost = record.availablePlans
      .filter((p) => planIds.includes(p.planId))
      .reduce((s, p) => s + p.cobraPremium, 0);

    return record;
  }

  /**
   * Get all COBRA-eligible employees (for admin view).
   */
  static async getCOBRARecords(): Promise<COBRARecord[]> {
    await new Promise((r) => setTimeout(r, 200));
    return [...MOCK_COBRA_RECORDS];
  }

  /**
   * Enroll employee in a benefit plan.
   */
  static async enrollInPlan(
    _planId: string,
    _coverage: string,
    _dependentIds: string[]
  ): Promise<{ success: boolean; enrollmentId: string }> {
    await new Promise((r) => setTimeout(r, 200));
    return {
      success: true,
      enrollmentId: `ENR-${Date.now()}`,
    };
  }

  /**
   * Get pending claims queue for admin approval.
   */
  static async getPendingClaimsForAdmin(): Promise<InsuranceClaim[]> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_CLAIMS.filter((c) =>
      ['Submitted', 'Under Review', 'Additional Info Required'].includes(c.status)
    );
  }
}
