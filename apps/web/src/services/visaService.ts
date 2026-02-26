/**
 * @module visaService
 * @description Visa & Immigration service for AuraOS HR.
 *              Manages visa records, work permits, medical fitness, Emirates ID
 *              for GCC, India, UK, US employees.
 *              Mock data: 20 records across visa types and statuses.
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type VisaType =
  | 'EMPLOYMENT'
  | 'VISIT'
  | 'TRANSIT'
  | 'INVESTOR'
  | 'GOLDEN' // UAE Golden Visa
  | 'IQAMA' // KSA Residence Permit
  | 'WORK_PERMIT' // India / UK / US Work Permit
  | 'BLUE_CARD' // EU Blue Card
  | 'STUDENT';

export type VisaStatus =
  | 'ACTIVE'
  | 'EXPIRED'
  | 'PENDING_RENEWAL'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'STAMPED'
  | 'REJECTED'
  | 'CANCELLED';

export type MedicalFitnessStatus = 'FIT' | 'UNFIT' | 'PENDING' | 'EXPIRED' | 'NOT_REQUIRED';
export type EmiratesIdStatus = 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'NOT_APPLICABLE';

export interface VisaRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  type: VisaType;
  status: VisaStatus;
  visaNumber: string;
  issueDate: string; // ISO date
  expiryDate: string; // ISO date
  country: string;
  sponsorEntity: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  entryType: 'SINGLE' | 'MULTIPLE';
  renewalDueDate?: string;
  renewalStatus?: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED';
  cost: number;
  currency: string;
  processingAgent?: string;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MedicalFitnessRecord {
  employeeId: string;
  status: MedicalFitnessStatus;
  certificateNo: string;
  issuedDate: string;
  expiryDate: string;
  clinic: string;
  country: string;
}

export interface EmiratesIdRecord {
  employeeId: string;
  status: EmiratesIdStatus;
  eidNumber: string;
  issuedDate: string;
  expiryDate: string;
  category: string;
}

export interface VisaFilters {
  employeeId?: string;
  type?: VisaType;
  status?: VisaStatus;
  country?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface VisaRenewalData {
  newExpiryDate: string;
  cost: number;
  processingNote?: string;
}

export interface PaginatedVisaResponse {
  data: VisaRecord[];
  total: number;
  page: number;
  limit: number;
}

// ── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_VISA_RECORDS: VisaRecord[] = [
  {
    id: 'visa_001',
    employeeId: 'emp_001',
    employeeName: 'Ahmed Al Mansouri',
    type: 'EMPLOYMENT',
    status: 'ACTIVE',
    visaNumber: 'UAE-EMP-2023-001',
    issueDate: '2023-01-15',
    expiryDate: '2025-01-14',
    country: 'UAE',
    sponsorEntity: 'Kreup Technologies LLC',
    nationality: 'Indian',
    passportNumber: 'N1234567',
    passportExpiry: '2028-06-30',
    entryType: 'MULTIPLE',
    cost: 3500,
    currency: 'AED',
    createdAt: '2023-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'visa_002',
    employeeId: 'emp_002',
    employeeName: 'Priya Sharma',
    type: 'EMPLOYMENT',
    status: 'PENDING_RENEWAL',
    visaNumber: 'UAE-EMP-2022-087',
    issueDate: '2022-03-20',
    expiryDate: '2025-03-19',
    country: 'UAE',
    sponsorEntity: 'Kreup Technologies LLC',
    nationality: 'Indian',
    passportNumber: 'P8876543',
    passportExpiry: '2027-11-30',
    entryType: 'MULTIPLE',
    renewalDueDate: '2025-02-19',
    renewalStatus: 'IN_PROGRESS',
    cost: 3200,
    currency: 'AED',
    createdAt: '2022-03-15',
    updatedAt: '2025-01-20',
  },
  {
    id: 'visa_003',
    employeeId: 'emp_003',
    employeeName: 'James Wilson',
    type: 'GOLDEN',
    status: 'ACTIVE',
    visaNumber: 'UAE-GOLDEN-2024-0012',
    issueDate: '2024-05-10',
    expiryDate: '2034-05-09',
    country: 'UAE',
    sponsorEntity: 'UAE ICA',
    nationality: 'British',
    passportNumber: 'BRT567890',
    passportExpiry: '2030-04-15',
    entryType: 'MULTIPLE',
    cost: 8500,
    currency: 'AED',
    createdAt: '2024-05-01',
    updatedAt: '2024-05-10',
  },
  {
    id: 'visa_004',
    employeeId: 'emp_004',
    employeeName: 'Fatima Al Hashmi',
    type: 'EMPLOYMENT',
    status: 'EXPIRED',
    visaNumber: 'UAE-EMP-2021-234',
    issueDate: '2021-08-01',
    expiryDate: '2024-07-31',
    country: 'UAE',
    sponsorEntity: 'Kreup Technologies LLC',
    nationality: 'Jordanian',
    passportNumber: 'JOR123456',
    passportExpiry: '2026-09-20',
    entryType: 'MULTIPLE',
    cost: 3000,
    currency: 'AED',
    createdAt: '2021-07-25',
    updatedAt: '2024-08-01',
  },
  {
    id: 'visa_005',
    employeeId: 'emp_005',
    employeeName: 'Rajesh Kumar',
    type: 'IQAMA',
    status: 'ACTIVE',
    visaNumber: 'KSA-IQAMA-2024-5501',
    issueDate: '2024-02-15',
    expiryDate: '2026-02-14',
    country: 'KSA',
    sponsorEntity: 'Kreup Arabia Co.',
    nationality: 'Indian',
    passportNumber: 'G5544332',
    passportExpiry: '2029-03-10',
    entryType: 'MULTIPLE',
    cost: 4200,
    currency: 'SAR',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-15',
  },
  {
    id: 'visa_006',
    employeeId: 'emp_006',
    employeeName: 'Sarah Johnson',
    type: 'WORK_PERMIT',
    status: 'ACTIVE',
    visaNumber: 'UK-WP-2023-88721',
    issueDate: '2023-09-01',
    expiryDate: '2026-08-31',
    country: 'UK',
    sponsorEntity: 'Kreup UK Ltd.',
    nationality: 'American',
    passportNumber: 'US-P7654321',
    passportExpiry: '2031-12-01',
    entryType: 'MULTIPLE',
    cost: 1285,
    currency: 'GBP',
    createdAt: '2023-08-15',
    updatedAt: '2023-09-01',
  },
  {
    id: 'visa_007',
    employeeId: 'emp_007',
    employeeName: 'Mohammed Al Qassimi',
    type: 'EMPLOYMENT',
    status: 'SUBMITTED',
    visaNumber: 'Pending',
    issueDate: '2025-01-20',
    expiryDate: '2027-01-19',
    country: 'UAE',
    sponsorEntity: 'Kreup Technologies LLC',
    nationality: 'Pakistani',
    passportNumber: 'PK9988776',
    passportExpiry: '2028-07-15',
    entryType: 'MULTIPLE',
    cost: 3500,
    currency: 'AED',
    createdAt: '2025-01-15',
    updatedAt: '2025-01-20',
  },
  {
    id: 'visa_008',
    employeeId: 'emp_008',
    employeeName: 'Ananya Krishnamurthy',
    type: 'EMPLOYMENT',
    status: 'APPROVED',
    visaNumber: 'UAE-EMP-2025-0078',
    issueDate: '2025-02-01',
    expiryDate: '2027-01-31',
    country: 'UAE',
    sponsorEntity: 'Kreup Technologies LLC',
    nationality: 'Indian',
    passportNumber: 'K1122334',
    passportExpiry: '2030-11-20',
    entryType: 'MULTIPLE',
    cost: 3500,
    currency: 'AED',
    createdAt: '2025-01-28',
    updatedAt: '2025-02-01',
  },
  {
    id: 'visa_009',
    employeeId: 'emp_009',
    employeeName: 'Tom Bradley',
    type: 'WORK_PERMIT',
    status: 'ACTIVE',
    visaNumber: 'US-H1B-2023-99001',
    issueDate: '2023-10-15',
    expiryDate: '2026-10-14',
    country: 'USA',
    sponsorEntity: 'Kreup Inc.',
    nationality: 'British',
    passportNumber: 'UK-B4433221',
    passportExpiry: '2032-05-10',
    entryType: 'MULTIPLE',
    cost: 4500,
    currency: 'USD',
    createdAt: '2023-10-01',
    updatedAt: '2023-10-15',
  },
  {
    id: 'visa_010',
    employeeId: 'emp_010',
    employeeName: 'Lina Hassan',
    type: 'INVESTOR',
    status: 'ACTIVE',
    visaNumber: 'UAE-INV-2024-0033',
    issueDate: '2024-06-01',
    expiryDate: '2026-05-31',
    country: 'UAE',
    sponsorEntity: 'UAE Free Zone Authority',
    nationality: 'Lebanese',
    passportNumber: 'LB-3344556',
    passportExpiry: '2028-08-15',
    entryType: 'MULTIPLE',
    cost: 5000,
    currency: 'AED',
    createdAt: '2024-05-25',
    updatedAt: '2024-06-01',
  },
  {
    id: 'visa_011',
    employeeId: 'emp_011',
    employeeName: 'Sanjay Mehta',
    type: 'EMPLOYMENT',
    status: 'PENDING_RENEWAL',
    visaNumber: 'UAE-EMP-2022-156',
    issueDate: '2022-09-10',
    expiryDate: '2025-03-09',
    country: 'UAE',
    sponsorEntity: 'Kreup Technologies LLC',
    nationality: 'Indian',
    passportNumber: 'M6677889',
    passportExpiry: '2027-01-20',
    entryType: 'MULTIPLE',
    renewalDueDate: '2025-02-09',
    renewalStatus: 'NOT_STARTED',
    cost: 3200,
    currency: 'AED',
    createdAt: '2022-09-05',
    updatedAt: '2025-01-15',
  },
  {
    id: 'visa_012',
    employeeId: 'emp_012',
    employeeName: 'Chen Wei',
    type: 'EMPLOYMENT',
    status: 'ACTIVE',
    visaNumber: 'UAE-EMP-2024-0221',
    issueDate: '2024-01-20',
    expiryDate: '2026-01-19',
    country: 'UAE',
    sponsorEntity: 'Kreup Technologies LLC',
    nationality: 'Chinese',
    passportNumber: 'CK-8899001',
    passportExpiry: '2029-06-01',
    entryType: 'MULTIPLE',
    cost: 3500,
    currency: 'AED',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
  },
  {
    id: 'visa_013',
    employeeId: 'emp_013',
    employeeName: 'Aisha Bint Khalid',
    type: 'IQAMA',
    status: 'PENDING_RENEWAL',
    visaNumber: 'KSA-IQAMA-2022-9988',
    issueDate: '2022-11-01',
    expiryDate: '2025-02-28',
    country: 'KSA',
    sponsorEntity: 'Kreup Arabia Co.',
    nationality: 'Egyptian',
    passportNumber: 'EG-7788990',
    passportExpiry: '2026-12-15',
    entryType: 'MULTIPLE',
    renewalDueDate: '2025-01-31',
    renewalStatus: 'SUBMITTED',
    cost: 4000,
    currency: 'SAR',
    createdAt: '2022-10-25',
    updatedAt: '2025-01-10',
  },
  {
    id: 'visa_014',
    employeeId: 'emp_014',
    employeeName: 'Emma Thompson',
    type: 'WORK_PERMIT',
    status: 'ACTIVE',
    visaNumber: 'IN-EP-2024-77665',
    issueDate: '2024-03-01',
    expiryDate: '2025-02-28',
    country: 'India',
    sponsorEntity: 'Kreup India Pvt. Ltd.',
    nationality: 'British',
    passportNumber: 'UK-PP-112233',
    passportExpiry: '2033-07-20',
    entryType: 'SINGLE',
    renewalDueDate: '2025-01-31',
    cost: 25000,
    currency: 'INR',
    createdAt: '2024-02-20',
    updatedAt: '2024-03-01',
  },
  {
    id: 'visa_015',
    employeeId: 'emp_015',
    employeeName: 'Ali Abdulla',
    type: 'EMPLOYMENT',
    status: 'REJECTED',
    visaNumber: 'N/A',
    issueDate: '2025-01-05',
    expiryDate: 'N/A',
    country: 'UAE',
    sponsorEntity: 'Kreup Technologies LLC',
    nationality: 'Syrian',
    passportNumber: 'SY-4455667',
    passportExpiry: '2027-04-10',
    entryType: 'MULTIPLE',
    cost: 0,
    currency: 'AED',
    notes: 'Rejected — additional documentation required',
    createdAt: '2025-01-02',
    updatedAt: '2025-01-18',
  },
  {
    id: 'visa_016',
    employeeId: 'emp_016',
    employeeName: 'Nguyen Van An',
    type: 'EMPLOYMENT',
    status: 'STAMPED',
    visaNumber: 'UAE-EMP-2025-0099',
    issueDate: '2025-02-10',
    expiryDate: '2027-02-09',
    country: 'UAE',
    sponsorEntity: 'Kreup Technologies LLC',
    nationality: 'Vietnamese',
    passportNumber: 'VN-B3344567',
    passportExpiry: '2030-09-15',
    entryType: 'MULTIPLE',
    cost: 3500,
    currency: 'AED',
    createdAt: '2025-02-01',
    updatedAt: '2025-02-15',
  },
  {
    id: 'visa_017',
    employeeId: 'emp_017',
    employeeName: 'Maryam Al Suwaidi',
    type: 'GOLDEN',
    status: 'ACTIVE',
    visaNumber: 'UAE-GOLDEN-2023-0055',
    issueDate: '2023-07-01',
    expiryDate: '2033-06-30',
    country: 'UAE',
    sponsorEntity: 'UAE ICA',
    nationality: 'Emirati',
    passportNumber: 'ARE-P-990012',
    passportExpiry: '2032-01-10',
    entryType: 'MULTIPLE',
    cost: 0,
    currency: 'AED',
    createdAt: '2023-06-25',
    updatedAt: '2023-07-01',
  },
  {
    id: 'visa_018',
    employeeId: 'emp_018',
    employeeName: 'David Kim',
    type: 'WORK_PERMIT',
    status: 'ACTIVE',
    visaNumber: 'US-L1B-2024-55441',
    issueDate: '2024-07-01',
    expiryDate: '2027-06-30',
    country: 'USA',
    sponsorEntity: 'Kreup Inc.',
    nationality: 'Korean',
    passportNumber: 'KR-M7788990',
    passportExpiry: '2031-03-20',
    entryType: 'MULTIPLE',
    cost: 5000,
    currency: 'USD',
    createdAt: '2024-06-20',
    updatedAt: '2024-07-01',
  },
  {
    id: 'visa_019',
    employeeId: 'emp_019',
    employeeName: 'Rania El-Sayed',
    type: 'EMPLOYMENT',
    status: 'ACTIVE',
    visaNumber: 'UAE-EMP-2023-388',
    issueDate: '2023-04-20',
    expiryDate: '2025-04-19',
    country: 'UAE',
    sponsorEntity: 'Kreup Technologies LLC',
    nationality: 'Egyptian',
    passportNumber: 'EGY-5566778',
    passportExpiry: '2028-10-05',
    entryType: 'MULTIPLE',
    cost: 3200,
    currency: 'AED',
    createdAt: '2023-04-15',
    updatedAt: '2023-04-20',
  },
  {
    id: 'visa_020',
    employeeId: 'emp_020',
    employeeName: 'Carlos Rodriguez',
    type: 'EMPLOYMENT',
    status: 'PENDING_RENEWAL',
    visaNumber: 'UAE-EMP-2022-509',
    issueDate: '2022-12-01',
    expiryDate: '2025-03-15',
    country: 'UAE',
    sponsorEntity: 'Kreup Technologies LLC',
    nationality: 'Spanish',
    passportNumber: 'ES-P-889900',
    passportExpiry: '2029-02-14',
    entryType: 'MULTIPLE',
    renewalDueDate: '2025-02-15',
    renewalStatus: 'IN_PROGRESS',
    cost: 3500,
    currency: 'AED',
    createdAt: '2022-11-25',
    updatedAt: '2025-01-25',
  },
];

// ── Service Functions ──────────────────────────────────────────────────────

/**
 * List visa records with optional filters and pagination.
 */
export async function getVisaRecords(filters: VisaFilters = {}): Promise<PaginatedVisaResponse> {
  await _delay();

  let data = [...MOCK_VISA_RECORDS];

  if (filters.employeeId) {
    data = data.filter((v) => v.employeeId === filters.employeeId);
  }
  if (filters.type) {
    data = data.filter((v) => v.type === filters.type);
  }
  if (filters.status) {
    data = data.filter((v) => v.status === filters.status);
  }
  if (filters.country) {
    data = data.filter((v) => v.country.toLowerCase() === filters.country!.toLowerCase());
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    data = data.filter(
      (v) =>
        v.employeeName.toLowerCase().includes(q) ||
        v.visaNumber.toLowerCase().includes(q) ||
        v.nationality.toLowerCase().includes(q)
    );
  }

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const start = (page - 1) * limit;

  return {
    data: data.slice(start, start + limit),
    total: data.length,
    page,
    limit,
  };
}

/**
 * Get a single visa record by ID.
 */
export async function getVisaRecord(id: string): Promise<VisaRecord | null> {
  await _delay();
  return MOCK_VISA_RECORDS.find((v) => v.id === id) ?? null;
}

/**
 * Create a new visa record.
 */
export async function createVisaRecord(
  data: Omit<VisaRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<VisaRecord> {
  await _delay();
  const record: VisaRecord = {
    ...data,
    id: `visa_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  MOCK_VISA_RECORDS.push(record);
  return record;
}

/**
 * Update visa status.
 */
export async function updateVisaStatus(id: string, status: VisaStatus): Promise<VisaRecord | null> {
  await _delay();
  const idx = MOCK_VISA_RECORDS.findIndex((v) => v.id === id);
  if (idx === -1) return null;

  MOCK_VISA_RECORDS[idx] = {
    ...MOCK_VISA_RECORDS[idx],
    status,
    updatedAt: new Date().toISOString(),
  };
  return MOCK_VISA_RECORDS[idx];
}

/**
 * Get visas expiring within N days.
 */
export async function getExpiringVisas(daysAhead: number = 60): Promise<VisaRecord[]> {
  await _delay();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + daysAhead);
  const today = new Date();

  return MOCK_VISA_RECORDS.filter((v) => {
    if (v.expiryDate === 'N/A') return false;
    const expiry = new Date(v.expiryDate);
    return expiry >= today && expiry <= cutoff && v.status !== 'CANCELLED';
  }).sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
}

/**
 * Initiate a visa renewal.
 */
export async function renewVisa(id: string, data: VisaRenewalData): Promise<VisaRecord | null> {
  await _delay();
  const idx = MOCK_VISA_RECORDS.findIndex((v) => v.id === id);
  if (idx === -1) return null;

  MOCK_VISA_RECORDS[idx] = {
    ...MOCK_VISA_RECORDS[idx],
    status: 'SUBMITTED',
    renewalStatus: 'SUBMITTED',
    renewalDueDate: data.newExpiryDate,
    cost: data.cost,
    notes: data.processingNote,
    updatedAt: new Date().toISOString(),
  };
  return MOCK_VISA_RECORDS[idx];
}

/**
 * Get medical fitness status for GCC-based employees.
 */
export async function getMedicalFitnessStatus(
  employeeId: string
): Promise<MedicalFitnessRecord | null> {
  await _delay();
  // Mock: return a record for known employees
  const mockRecords: Record<string, MedicalFitnessRecord> = {
    emp_001: {
      employeeId: 'emp_001',
      status: 'FIT',
      certificateNo: 'DHA-2024-001',
      issuedDate: '2024-06-15',
      expiryDate: '2025-06-14',
      clinic: 'Medeor Hospital',
      country: 'UAE',
    },
    emp_005: {
      employeeId: 'emp_005',
      status: 'PENDING',
      certificateNo: 'MOH-KSA-PENDING',
      issuedDate: '',
      expiryDate: '',
      clinic: 'Al-Hammadi Hospital',
      country: 'KSA',
    },
  };
  return mockRecords[employeeId] ?? null;
}

/**
 * Get Emirates ID status for UAE-based employees.
 */
export async function getEmiratesIdStatus(employeeId: string): Promise<EmiratesIdRecord | null> {
  await _delay();
  const mockRecords: Record<string, EmiratesIdRecord> = {
    emp_001: {
      employeeId: 'emp_001',
      status: 'ACTIVE',
      eidNumber: '784-1985-1234567-1',
      issuedDate: '2023-01-15',
      expiryDate: '2025-01-14',
      category: 'Resident',
    },
    emp_004: {
      employeeId: 'emp_004',
      status: 'EXPIRED',
      eidNumber: '784-1990-9876543-2',
      issuedDate: '2021-08-01',
      expiryDate: '2024-07-31',
      category: 'Resident',
    },
  };
  return mockRecords[employeeId] ?? null;
}

// ── Analytics helpers ──────────────────────────────────────────────────────

export function getVisaStatusDistribution(): Record<VisaStatus, number> {
  const dist = {} as Record<VisaStatus, number>;
  for (const visa of MOCK_VISA_RECORDS) {
    dist[visa.status] = (dist[visa.status] ?? 0) + 1;
  }
  return dist;
}

export function getVisaTypeDistribution(): Record<VisaType, number> {
  const dist = {} as Record<VisaType, number>;
  for (const visa of MOCK_VISA_RECORDS) {
    dist[visa.type] = (dist[visa.type] ?? 0) + 1;
  }
  return dist;
}

// ── Private helpers ────────────────────────────────────────────────────────

function _delay(ms = 150): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
