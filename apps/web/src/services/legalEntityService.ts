// @ts-nocheck — Has TS errors against current Prisma/schema shapes or service contracts. Tracked under #29 for proper fix.
/**
 * @module legalEntityService
 * @description Legal Entity Management — multi-entity configuration, inter-company transfers,
 *   consolidated metrics, currency, fiscal year, and regulatory settings.
 * @project AURA HCM Platform
 * @section 10.6 — Legal Entity & Multi-Entity Management
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type EntityType =
  | 'Holding Company'
  | 'Subsidiary'
  | 'Branch'
  | 'Joint Venture'
  | 'Representative Office';
export type EntityStatus = 'Active' | 'Inactive' | 'In Formation' | 'Dissolved';
export type TransferType = 'Permanent' | 'Secondment' | 'Project Assignment';
export type TransferStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Approved'
  | 'In Progress'
  | 'Completed'
  | 'Rejected';

export interface EntityFilters {
  status?: EntityStatus;
  type?: EntityType;
  country?: string;
  search?: string;
}

export interface LegalEntity {
  id: string;
  code: string;
  name: string;
  legalName: string;
  type: EntityType;
  status: EntityStatus;
  country: string;
  city: string;
  currency: string;
  timezone: string;
  fiscalYearStart: string; // MM-DD
  registrationNumber: string;
  taxId: string;
  headcount: number;
  parentEntityId: string | null;
  parentEntityName: string | null;
  annualRevenue: number | null;
  totalCostUSD: number;
  establishedDate: string;
  createdAt: string;
}

export interface EntityDetail extends LegalEntity {
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  contacts: Array<{ role: string; name: string; email: string; phone: string }>;
  subsidiaries: Array<{ id: string; name: string; country: string; headcount: number }>;
  modules: string[];
  payrollConfig: {
    provider: string;
    payFrequency: string;
    salaryScale: string;
    gratuityApplicable: boolean;
  };
  complianceFlags: string[];
}

export interface InterCompanyTransfer {
  id: string;
  transferNumber: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  fromEntityId: string;
  fromEntityName: string;
  toEntityId: string;
  toEntityName: string;
  transferType: TransferType;
  status: TransferStatus;
  effectiveDate: string;
  endDate: string | null;
  costAllocationPercent: number;
  initiatedBy: string;
  approvedBy: string | null;
  createdAt: string;
}

export interface ConsolidatedMetrics {
  totalEntities: number;
  activeEntities: number;
  totalHeadcount: number;
  headcountByCountry: Array<{ country: string; count: number; percent: number }>;
  headcountByEntity: Array<{
    entityId: string;
    entityName: string;
    country: string;
    count: number;
  }>;
  totalPayrollCostUSD: number;
  costByEntity: Array<{ entityId: string; entityName: string; costUSD: number; percent: number }>;
  activeTransfers: number;
  pendingTransfers: number;
  crossEntityHires: number;
}

export interface CreateEntityData {
  name: string;
  legalName: string;
  type: EntityType;
  country: string;
  city: string;
  currency: string;
  timezone: string;
  fiscalYearStart: string;
  registrationNumber: string;
  taxId: string;
  parentEntityId?: string;
}

export interface InitiateTransferData {
  employeeId: string;
  fromEntityId: string;
  toEntityId: string;
  transferType: TransferType;
  effectiveDate: string;
  endDate?: string;
  costAllocationPercent: number;
  reason: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_ENTITIES: LegalEntity[] = [
  {
    id: 'ENT-001',
    code: 'KAI-HLD',
    name: 'KreupAI Technologies',
    legalName: 'KreupAI Technologies Holding LLC',
    type: 'Holding Company',
    status: 'Active',
    country: 'UAE',
    city: 'Dubai',
    currency: 'AED',
    timezone: 'Asia/Dubai',
    fiscalYearStart: '01-01',
    registrationNumber: 'CN-1234567',
    taxId: 'TRN-1234567890',
    headcount: 150,
    parentEntityId: null,
    parentEntityName: null,
    annualRevenue: 85000000,
    totalCostUSD: 12000000,
    establishedDate: '2015-06-01',
    createdAt: '2015-06-01T00:00:00Z',
  },
  {
    id: 'ENT-002',
    code: 'KAI-KSA',
    name: 'KreupAI KSA',
    legalName: 'KreupAI Technologies Arabia Co. Ltd',
    type: 'Subsidiary',
    status: 'Active',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    currency: 'SAR',
    timezone: 'Asia/Riyadh',
    fiscalYearStart: '01-01',
    registrationNumber: 'CR-1032456789',
    taxId: 'VAT-311234567800003',
    headcount: 85,
    parentEntityId: 'ENT-001',
    parentEntityName: 'KreupAI Technologies',
    annualRevenue: 42000000,
    totalCostUSD: 6500000,
    establishedDate: '2018-03-15',
    createdAt: '2018-03-15T00:00:00Z',
  },
  {
    id: 'ENT-003',
    code: 'KAI-IND',
    name: 'KreupAI India',
    legalName: 'KreupAI Technologies India Pvt Ltd',
    type: 'Subsidiary',
    status: 'Active',
    country: 'India',
    city: 'Bangalore',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    fiscalYearStart: '04-01',
    registrationNumber: 'U72900KA2019PTC123456',
    taxId: 'GSTIN-29AABCK1234R1Z5',
    headcount: 220,
    parentEntityId: 'ENT-001',
    parentEntityName: 'KreupAI Technologies',
    annualRevenue: 28000000,
    totalCostUSD: 4200000,
    establishedDate: '2019-07-01',
    createdAt: '2019-07-01T00:00:00Z',
  },
  {
    id: 'ENT-004',
    code: 'KAI-US',
    name: 'KreupAI Americas',
    legalName: 'KreupAI Technologies Inc.',
    type: 'Subsidiary',
    status: 'Active',
    country: 'USA',
    city: 'New York',
    currency: 'USD',
    timezone: 'America/New_York',
    fiscalYearStart: '01-01',
    registrationNumber: 'DE-7891234',
    taxId: 'EIN-47-1234567',
    headcount: 40,
    parentEntityId: 'ENT-001',
    parentEntityName: 'KreupAI Technologies',
    annualRevenue: 15000000,
    totalCostUSD: 5800000,
    establishedDate: '2021-01-15',
    createdAt: '2021-01-15T00:00:00Z',
  },
];

const MOCK_TRANSFERS: InterCompanyTransfer[] = [
  {
    id: 'TRF-001',
    transferNumber: 'ICT-2026-0001',
    employeeId: 'EMP-301',
    employeeCode: 'EMP301',
    employeeName: 'Sanjay Kumar',
    fromEntityId: 'ENT-003',
    fromEntityName: 'KreupAI India',
    toEntityId: 'ENT-001',
    toEntityName: 'KreupAI Technologies',
    transferType: 'Secondment',
    status: 'Approved',
    effectiveDate: '2026-03-01',
    endDate: '2026-08-31',
    costAllocationPercent: 100,
    initiatedBy: 'Fatima Al-Zahra',
    approvedBy: 'Ahmad Al-Rashidi',
    createdAt: '2026-02-10T09:00:00Z',
  },
  {
    id: 'TRF-002',
    transferNumber: 'ICT-2026-0002',
    employeeId: 'EMP-412',
    employeeCode: 'EMP412',
    employeeName: 'Layla Mahmoud',
    fromEntityId: 'ENT-001',
    fromEntityName: 'KreupAI Technologies',
    toEntityId: 'ENT-002',
    toEntityName: 'KreupAI KSA',
    transferType: 'Permanent',
    status: 'Pending Approval',
    effectiveDate: '2026-04-01',
    endDate: null,
    costAllocationPercent: 100,
    initiatedBy: 'Fatima Al-Zahra',
    approvedBy: null,
    createdAt: '2026-02-15T11:00:00Z',
  },
];

// ── Service Functions ─────────────────────────────────────────────────────────

export async function getEntities(filters: EntityFilters = {}): Promise<LegalEntity[]> {
  await new Promise((r) => setTimeout(r, 300));
  let results = [...MOCK_ENTITIES];
  if (filters.status) results = results.filter((e) => e.status === filters.status);
  if (filters.type) results = results.filter((e) => e.type === filters.type);
  if (filters.country) results = results.filter((e) => e.country === filters.country);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (e) => e.name.toLowerCase().includes(q) || e.code.toLowerCase().includes(q)
    );
  }
  return results;
}

export async function getEntity(id: string): Promise<EntityDetail> {
  await new Promise((r) => setTimeout(r, 200));
  const base = MOCK_ENTITIES.find((e) => e.id === id) ?? MOCK_ENTITIES[0];
  return {
    ...base,
    address: {
      line1: 'Level 14, Boulevard Plaza Tower 1',
      line2: 'Downtown Dubai',
      city: base.city,
      state: '',
      country: base.country,
      postalCode: '00000',
    },
    contacts: [
      {
        role: 'HR Manager',
        name: 'Fatima Al-Zahra',
        email: 'fatima@kreupai.com',
        phone: '+971501234567',
      },
      {
        role: 'Finance Director',
        name: 'Khalid Ibrahim',
        email: 'khalid@kreupai.com',
        phone: '+971502345678',
      },
    ],
    subsidiaries:
      id === 'ENT-001'
        ? [
            { id: 'ENT-002', name: 'KreupAI KSA', country: 'Saudi Arabia', headcount: 85 },
            { id: 'ENT-003', name: 'KreupAI India', country: 'India', headcount: 220 },
            { id: 'ENT-004', name: 'KreupAI Americas', country: 'USA', headcount: 40 },
          ]
        : [],
    modules: ['Core HR', 'Payroll', 'Recruitment', 'Time & Attendance', 'Learning'],
    payrollConfig: {
      provider: 'Internal',
      payFrequency: 'Monthly',
      salaryScale: 'Grade-Based',
      gratuityApplicable: true,
    },
    complianceFlags: ['GDPR', 'UAE Labour Law', 'VAT Registered'],
  };
}

export async function createEntity(data: CreateEntityData): Promise<LegalEntity> {
  await new Promise((r) => setTimeout(r, 500));
  return {
    id: `ENT-${Date.now()}`,
    code: `KAI-${data.country.slice(0, 3).toUpperCase()}`,
    ...data,
    status: 'In Formation',
    headcount: 0,
    annualRevenue: null,
    totalCostUSD: 0,
    parentEntityName: data.parentEntityId ? 'Parent Entity' : null,
    establishedDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  };
}

export async function updateEntity(
  id: string,
  data: Partial<CreateEntityData>
): Promise<LegalEntity> {
  await new Promise((r) => setTimeout(r, 300));
  const base = MOCK_ENTITIES.find((e) => e.id === id) ?? MOCK_ENTITIES[0];
  return { ...base, ...data };
}

export async function getInterCompanyTransfers(
  filters: { status?: TransferStatus; fromEntityId?: string; toEntityId?: string } = {}
): Promise<InterCompanyTransfer[]> {
  await new Promise((r) => setTimeout(r, 250));
  let results = [...MOCK_TRANSFERS];
  if (filters.status) results = results.filter((t) => t.status === filters.status);
  if (filters.fromEntityId)
    results = results.filter((t) => t.fromEntityId === filters.fromEntityId);
  if (filters.toEntityId) results = results.filter((t) => t.toEntityId === filters.toEntityId);
  return results;
}

export async function initiateTransfer(data: InitiateTransferData): Promise<InterCompanyTransfer> {
  await new Promise((r) => setTimeout(r, 400));
  const year = new Date().getFullYear();
  return {
    id: `TRF-${Date.now()}`,
    transferNumber: `ICT-${year}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    employeeId: data.employeeId,
    employeeCode: 'EMP999',
    employeeName: 'Transfer Employee',
    fromEntityId: data.fromEntityId,
    fromEntityName: 'Source Entity',
    toEntityId: data.toEntityId,
    toEntityName: 'Destination Entity',
    transferType: data.transferType,
    status: 'Pending Approval',
    effectiveDate: data.effectiveDate,
    endDate: data.endDate ?? null,
    costAllocationPercent: data.costAllocationPercent,
    initiatedBy: 'Current User',
    approvedBy: null,
    createdAt: new Date().toISOString(),
  };
}

export async function getConsolidatedMetrics(): Promise<ConsolidatedMetrics> {
  await new Promise((r) => setTimeout(r, 350));
  return {
    totalEntities: 4,
    activeEntities: 4,
    totalHeadcount: 495,
    headcountByCountry: [
      { country: 'India', count: 220, percent: 44.4 },
      { country: 'UAE', count: 150, percent: 30.3 },
      { country: 'Saudi Arabia', count: 85, percent: 17.2 },
      { country: 'USA', count: 40, percent: 8.1 },
    ],
    headcountByEntity: MOCK_ENTITIES.map((e) => ({
      entityId: e.id,
      entityName: e.name,
      country: e.country,
      count: e.headcount,
    })),
    totalPayrollCostUSD: 28500000,
    costByEntity: [
      { entityId: 'ENT-001', entityName: 'KreupAI Technologies', costUSD: 12000000, percent: 42.1 },
      { entityId: 'ENT-003', entityName: 'KreupAI India', costUSD: 4200000, percent: 14.7 },
      { entityId: 'ENT-004', entityName: 'KreupAI Americas', costUSD: 5800000, percent: 20.4 },
      { entityId: 'ENT-002', entityName: 'KreupAI KSA', costUSD: 6500000, percent: 22.8 },
    ],
    activeTransfers: 1,
    pendingTransfers: 1,
    crossEntityHires: 12,
  };
}
