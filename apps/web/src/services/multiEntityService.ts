/**
 * @module multiEntityService
 * @description Multi-entity legal entity management — subsidiaries, branches, divisions,
 *   inter-entity transfers, consolidated reporting, entity comparison.
 * @project AURA HCM Platform
 * @section 10.6 — Multi-Entity Management
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type EntityType = 'headquarters' | 'subsidiary' | 'branch' | 'division' | 'joint_venture';
export type EntityStatus = 'active' | 'inactive' | 'dormant' | 'in_liquidation';
export type TransferType = 'permanent' | 'secondment' | 'project_based';
export type TransferStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';

export interface LegalEntity {
  id: string;
  name: string;
  shortName: string;
  type: EntityType;
  status: EntityStatus;
  parentEntityId: string | null;
  country: string;
  countryCode: string;
  countryFlag: string;
  registrationNumber: string;
  taxId: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  currency: string;
  currencyCode: string;
  employeeCount: number;
  establishedDate: string;
  hrHeadId: string;
  hrHeadName: string;
  metrics: {
    avgSalary: number;
    turnoverRate: number;
    headcountBudget: number;
    laborCostMonthly: number;
  };
}

export interface EntityHierarchyNode extends LegalEntity {
  children: EntityHierarchyNode[];
  level: number;
}

export interface InterEntityTransfer {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeTitle: string;
  fromEntityId: string;
  fromEntityName: string;
  toEntityId: string;
  toEntityName: string;
  transferType: TransferType;
  status: TransferStatus;
  effectiveDate: string;
  returnDate?: string;
  projectName?: string;
  salaryAdjustment: number;
  salaryAdjustmentType: 'increase' | 'decrease' | 'none';
  complianceChecklist: ComplianceItem[];
  approvals: TransferApproval[];
  reason: string;
  initiatedBy: string;
  initiatedAt: string;
  notes?: string;
}

export interface ComplianceItem {
  id: string;
  label: string;
  required: boolean;
  completed: boolean;
  dueDate?: string;
  notes?: string;
}

export interface TransferApproval {
  role: string;
  approverName: string;
  entityId: string;
  entityName: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  comments?: string;
}

export interface ConsolidatedReport {
  reportType: string;
  period: string;
  generatedAt: string;
  entities: string[];
  data: Record<string, unknown>;
  summary: {
    totalHeadcount: number;
    totalLaborCost: number;
    avgTurnoverRate: number;
    totalPayroll: number;
  };
}

export interface EntityComparison {
  entityIds: string[];
  metrics: string[];
  period: string;
  data: EntityMetricRow[];
}

export interface EntityMetricRow {
  entityId: string;
  entityName: string;
  countryFlag: string;
  headcount: number;
  avgSalary: number;
  turnoverRate: number;
  laborCostMonthly: number;
  revenuePerEmployee?: number;
  openPositions: number;
  trainingHoursAvg: number;
}

export interface CreateEntityData {
  name: string;
  shortName: string;
  type: EntityType;
  parentEntityId?: string;
  country: string;
  countryCode: string;
  registrationNumber: string;
  taxId: string;
  address: LegalEntity['address'];
  currency: string;
  currencyCode: string;
  hrHeadId: string;
  establishedDate: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_ENTITIES: LegalEntity[] = [
  {
    id: 'ent-001',
    name: 'KreupAI Technologies LLC',
    shortName: 'KreupAI HQ',
    type: 'headquarters',
    status: 'active',
    parentEntityId: null,
    country: 'United Arab Emirates',
    countryCode: 'AE',
    countryFlag: '🇦🇪',
    registrationNumber: 'UAE-LLC-2018-04512',
    taxId: 'TRN-100234567-00001',
    address: {
      street: 'Dubai Internet City, Building 17',
      city: 'Dubai',
      state: 'Dubai',
      postalCode: '500001',
      country: 'UAE',
    },
    currency: 'UAE Dirham',
    currencyCode: 'AED',
    employeeCount: 320,
    establishedDate: '2018-03-15',
    hrHeadId: 'emp-0010',
    hrHeadName: 'Fatima Al-Rashidi',
    metrics: {
      avgSalary: 22000,
      turnoverRate: 8.4,
      headcountBudget: 350,
      laborCostMonthly: 7040000,
    },
  },
  {
    id: 'ent-002',
    name: 'KreupAI Technologies Arabia Co.',
    shortName: 'KreupAI KSA',
    type: 'subsidiary',
    status: 'active',
    parentEntityId: 'ent-001',
    country: 'Saudi Arabia',
    countryCode: 'SA',
    countryFlag: '🇸🇦',
    registrationNumber: 'CR-1010512345',
    taxId: 'TIN-310045678901234',
    address: {
      street: 'King Abdullah Financial District, Tower A',
      city: 'Riyadh',
      state: 'Riyadh',
      postalCode: '12211',
      country: 'KSA',
    },
    currency: 'Saudi Riyal',
    currencyCode: 'SAR',
    employeeCount: 145,
    establishedDate: '2020-01-10',
    hrHeadId: 'emp-0045',
    hrHeadName: 'Mohammed Al-Ghamdi',
    metrics: {
      avgSalary: 18500,
      turnoverRate: 10.2,
      headcountBudget: 160,
      laborCostMonthly: 2682500,
    },
  },
  {
    id: 'ent-003',
    name: 'KreupAI India Pvt. Ltd.',
    shortName: 'KreupAI India',
    type: 'subsidiary',
    status: 'active',
    parentEntityId: 'ent-001',
    country: 'India',
    countryCode: 'IN',
    countryFlag: '🇮🇳',
    registrationNumber: 'CIN-U72900KA2019PTC102345',
    taxId: 'GSTIN-29AABCK1234A1ZX',
    address: {
      street: '100 Feet Road, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'India',
    },
    currency: 'Indian Rupee',
    currencyCode: 'INR',
    employeeCount: 210,
    establishedDate: '2019-06-01',
    hrHeadId: 'emp-0078',
    hrHeadName: 'Priya Krishnamurthy',
    metrics: {
      avgSalary: 1850000,
      turnoverRate: 14.5,
      headcountBudget: 250,
      laborCostMonthly: 38850000,
    },
  },
  {
    id: 'ent-004',
    name: 'KreupAI UK Limited',
    shortName: 'KreupAI UK',
    type: 'branch',
    status: 'active',
    parentEntityId: 'ent-001',
    country: 'United Kingdom',
    countryCode: 'GB',
    countryFlag: '🇬🇧',
    registrationNumber: 'UK-Companies-12345678',
    taxId: 'UTR-1234567890',
    address: {
      street: '1 Canada Square, Canary Wharf',
      city: 'London',
      state: 'England',
      postalCode: 'E14 5AB',
      country: 'UK',
    },
    currency: 'British Pound',
    currencyCode: 'GBP',
    employeeCount: 65,
    establishedDate: '2021-04-01',
    hrHeadId: 'emp-0112',
    hrHeadName: 'James Whitmore',
    metrics: {
      avgSalary: 72000,
      turnoverRate: 7.8,
      headcountBudget: 80,
      laborCostMonthly: 4680000,
    },
  },
  {
    id: 'ent-005',
    name: 'KreupAI Inc.',
    shortName: 'KreupAI US',
    type: 'subsidiary',
    status: 'active',
    parentEntityId: 'ent-001',
    country: 'United States',
    countryCode: 'US',
    countryFlag: '🇺🇸',
    registrationNumber: 'DE-Corp-7654321',
    taxId: 'EIN-82-1234567',
    address: {
      street: '101 California Street, Suite 2710',
      city: 'San Francisco',
      state: 'California',
      postalCode: '94111',
      country: 'USA',
    },
    currency: 'US Dollar',
    currencyCode: 'USD',
    employeeCount: 88,
    establishedDate: '2021-09-15',
    hrHeadId: 'emp-0134',
    hrHeadName: 'Sarah Johnson',
    metrics: {
      avgSalary: 145000,
      turnoverRate: 12.1,
      headcountBudget: 100,
      laborCostMonthly: 12760000,
    },
  },
];

const MOCK_TRANSFERS: InterEntityTransfer[] = [
  {
    id: 'trn-001',
    employeeId: 'emp-0201',
    employeeName: 'Ahmed Al-Mansouri',
    employeeTitle: 'Senior Software Engineer',
    fromEntityId: 'ent-001',
    fromEntityName: 'KreupAI HQ',
    toEntityId: 'ent-002',
    toEntityName: 'KreupAI KSA',
    transferType: 'secondment',
    status: 'approved',
    effectiveDate: '2026-03-01',
    returnDate: '2027-02-28',
    salaryAdjustment: 15,
    salaryAdjustmentType: 'increase',
    complianceChecklist: [
      { id: 'cc-1', label: 'Iqama / Residency Transfer', required: true, completed: true },
      { id: 'cc-2', label: 'Work Permit Application', required: true, completed: true },
      {
        id: 'cc-3',
        label: 'Tax Registration (KSA ZATCA)',
        required: true,
        completed: false,
        dueDate: '2026-02-20',
      },
      {
        id: 'cc-4',
        label: 'Social Insurance Transfer (GOSI)',
        required: true,
        completed: false,
        dueDate: '2026-02-25',
      },
      {
        id: 'cc-5',
        label: 'End of Service Calculation Snapshot',
        required: false,
        completed: true,
      },
    ],
    approvals: [
      {
        role: 'Source HR Head',
        approverName: 'Fatima Al-Rashidi',
        entityId: 'ent-001',
        entityName: 'KreupAI HQ',
        status: 'approved',
        approvedAt: '2026-01-20T10:30:00Z',
      },
      {
        role: 'Destination HR Head',
        approverName: 'Mohammed Al-Ghamdi',
        entityId: 'ent-002',
        entityName: 'KreupAI KSA',
        status: 'approved',
        approvedAt: '2026-01-22T14:15:00Z',
      },
    ],
    reason: 'Project lead for KSA digital transformation initiative',
    initiatedBy: 'Fatima Al-Rashidi',
    initiatedAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 'trn-002',
    employeeId: 'emp-0312',
    employeeName: 'Rajesh Nair',
    employeeTitle: 'Data Scientist',
    fromEntityId: 'ent-003',
    fromEntityName: 'KreupAI India',
    toEntityId: 'ent-001',
    toEntityName: 'KreupAI HQ',
    transferType: 'permanent',
    status: 'pending',
    effectiveDate: '2026-04-01',
    salaryAdjustment: 40,
    salaryAdjustmentType: 'increase',
    complianceChecklist: [
      {
        id: 'cc-1',
        label: 'UAE Work Permit / Employment Visa',
        required: true,
        completed: false,
        dueDate: '2026-03-15',
      },
      { id: 'cc-2', label: 'Indian PF Final Settlement', required: true, completed: false },
      { id: 'cc-3', label: 'Gratuity Calculation (India)', required: true, completed: false },
      { id: 'cc-4', label: 'Tax Clearance Certificate (India)', required: false, completed: false },
    ],
    approvals: [
      {
        role: 'Source HR Head',
        approverName: 'Priya Krishnamurthy',
        entityId: 'ent-003',
        entityName: 'KreupAI India',
        status: 'approved',
        approvedAt: '2026-02-10T11:00:00Z',
      },
      {
        role: 'Destination HR Head',
        approverName: 'Fatima Al-Rashidi',
        entityId: 'ent-001',
        entityName: 'KreupAI HQ',
        status: 'pending',
      },
    ],
    reason: 'Permanent relocation to Group HQ AI Centre of Excellence',
    initiatedBy: 'Priya Krishnamurthy',
    initiatedAt: '2026-02-08T08:00:00Z',
  },
  {
    id: 'trn-003',
    employeeId: 'emp-0089',
    employeeName: "Liam O'Brien",
    employeeTitle: 'Product Manager',
    fromEntityId: 'ent-004',
    fromEntityName: 'KreupAI UK',
    toEntityId: 'ent-005',
    toEntityName: 'KreupAI US',
    transferType: 'project_based',
    status: 'completed',
    effectiveDate: '2025-10-01',
    returnDate: '2026-01-31',
    projectName: 'US Market Launch Q4 2025',
    salaryAdjustment: 0,
    salaryAdjustmentType: 'none',
    complianceChecklist: [
      { id: 'cc-1', label: 'L1 Intracompany Transfer Visa', required: true, completed: true },
      {
        id: 'cc-2',
        label: 'US Social Security Opt-out (Totalization Agreement)',
        required: false,
        completed: true,
      },
      {
        id: 'cc-3',
        label: 'UK National Insurance Continuation Certificate A1',
        required: true,
        completed: true,
      },
    ],
    approvals: [
      {
        role: 'Source HR Head',
        approverName: 'James Whitmore',
        entityId: 'ent-004',
        entityName: 'KreupAI UK',
        status: 'approved',
        approvedAt: '2025-09-15T09:00:00Z',
      },
      {
        role: 'Destination HR Head',
        approverName: 'Sarah Johnson',
        entityId: 'ent-005',
        entityName: 'KreupAI US',
        status: 'approved',
        approvedAt: '2025-09-16T14:00:00Z',
      },
    ],
    reason: 'Leading US product launch and market development',
    initiatedBy: 'James Whitmore',
    initiatedAt: '2025-09-10T10:00:00Z',
  },
];

// ── Service Class ──────────────────────────────────────────────────────────────

export class MultiEntityService {
  private static delay(ms = 400): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  /** List all legal entities */
  static async getEntities(): Promise<LegalEntity[]> {
    await this.delay();
    return [...MOCK_ENTITIES];
  }

  /** Get a single entity by ID */
  static async getEntity(id: string): Promise<LegalEntity | null> {
    await this.delay(200);
    return MOCK_ENTITIES.find((e) => e.id === id) ?? null;
  }

  /** Create a new legal entity */
  static async createEntity(data: CreateEntityData): Promise<LegalEntity> {
    await this.delay(600);
    const newEntity: LegalEntity = {
      id: `ent-${Date.now()}`,
      ...data,
      countryFlag: '🏳',
      status: 'active',
      employeeCount: 0,
      hrHeadName: 'TBD',
      metrics: { avgSalary: 0, turnoverRate: 0, headcountBudget: 0, laborCostMonthly: 0 },
    };
    MOCK_ENTITIES.push(newEntity);
    return newEntity;
  }

  /** Update entity details */
  static async updateEntity(id: string, data: Partial<LegalEntity>): Promise<LegalEntity> {
    await this.delay(500);
    const idx = MOCK_ENTITIES.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error(`Entity ${id} not found`);
    MOCK_ENTITIES[idx] = { ...MOCK_ENTITIES[idx], ...data };
    return MOCK_ENTITIES[idx];
  }

  /** Build entity hierarchy tree */
  static async getEntityHierarchy(): Promise<EntityHierarchyNode[]> {
    await this.delay(300);
    const entities = [...MOCK_ENTITIES];

    function buildTree(parentId: string | null, level: number): EntityHierarchyNode[] {
      return entities
        .filter((e) => e.parentEntityId === parentId)
        .map((e) => ({ ...e, children: buildTree(e.id, level + 1), level }));
    }

    return buildTree(null, 0);
  }

  /** Initiate inter-entity employee transfer */
  static async transferEmployee(
    employeeId: string,
    fromEntityId: string,
    toEntityId: string,
    effectiveDate: string,
    options?: {
      transferType?: TransferType;
      returnDate?: string;
      projectName?: string;
      reason?: string;
    }
  ): Promise<InterEntityTransfer> {
    await this.delay(700);
    const fromEntity = MOCK_ENTITIES.find((e) => e.id === fromEntityId);
    const toEntity = MOCK_ENTITIES.find((e) => e.id === toEntityId);
    if (!fromEntity || !toEntity) throw new Error('Entity not found');

    const transfer: InterEntityTransfer = {
      id: `trn-${Date.now()}`,
      employeeId,
      employeeName: 'Employee Name',
      employeeTitle: 'Position Title',
      fromEntityId,
      fromEntityName: fromEntity.shortName,
      toEntityId,
      toEntityName: toEntity.shortName,
      transferType: options?.transferType ?? 'permanent',
      status: 'pending',
      effectiveDate,
      returnDate: options?.returnDate,
      projectName: options?.projectName,
      salaryAdjustment: 0,
      salaryAdjustmentType: 'none',
      complianceChecklist: [
        { id: 'cc-1', label: 'Work Authorization', required: true, completed: false },
        { id: 'cc-2', label: 'Tax Registration', required: true, completed: false },
        { id: 'cc-3', label: 'Social Insurance Transfer', required: true, completed: false },
      ],
      approvals: [
        {
          role: 'Source HR Head',
          approverName: fromEntity.hrHeadName,
          entityId: fromEntityId,
          entityName: fromEntity.shortName,
          status: 'pending',
        },
        {
          role: 'Destination HR Head',
          approverName: toEntity.hrHeadName,
          entityId: toEntityId,
          entityName: toEntity.shortName,
          status: 'pending',
        },
      ],
      reason: options?.reason ?? '',
      initiatedBy: 'Current User',
      initiatedAt: new Date().toISOString(),
    };

    MOCK_TRANSFERS.push(transfer);
    return transfer;
  }

  /** Get inter-entity transfer history */
  static async getInterEntityTransfers(filters?: {
    status?: TransferStatus;
    entityId?: string;
    employeeId?: string;
  }): Promise<InterEntityTransfer[]> {
    await this.delay(400);
    let transfers = [...MOCK_TRANSFERS];

    if (filters?.status) {
      transfers = transfers.filter((t) => t.status === filters.status);
    }
    if (filters?.entityId) {
      transfers = transfers.filter(
        (t) => t.fromEntityId === filters.entityId || t.toEntityId === filters.entityId
      );
    }
    if (filters?.employeeId) {
      transfers = transfers.filter((t) => t.employeeId === filters.employeeId);
    }

    return transfers;
  }

  /** Get consolidated report across entities */
  static async getConsolidatedReport(
    reportType: string,
    period: string
  ): Promise<ConsolidatedReport> {
    await this.delay(800);
    const totalHeadcount = MOCK_ENTITIES.reduce((sum, e) => sum + e.employeeCount, 0);
    const totalLaborCost = MOCK_ENTITIES.reduce((sum, e) => sum + e.metrics.laborCostMonthly, 0);
    const avgTurnover =
      MOCK_ENTITIES.reduce((sum, e) => sum + e.metrics.turnoverRate, 0) / MOCK_ENTITIES.length;

    return {
      reportType,
      period,
      generatedAt: new Date().toISOString(),
      entities: MOCK_ENTITIES.map((e) => e.id),
      data: {
        entityBreakdown: MOCK_ENTITIES.map((e) => ({
          entity: e.shortName,
          headcount: e.employeeCount,
          laborCost: e.metrics.laborCostMonthly,
          turnoverRate: e.metrics.turnoverRate,
        })),
      },
      summary: {
        totalHeadcount,
        totalLaborCost,
        avgTurnoverRate: parseFloat(avgTurnover.toFixed(2)),
        totalPayroll: totalLaborCost * 0.6,
      },
    };
  }

  /** Compare entities by metrics */
  static async getEntityComparison(
    entityIds: string[],
    metrics: string[]
  ): Promise<EntityComparison> {
    await this.delay(500);
    const entities = MOCK_ENTITIES.filter((e) => entityIds.includes(e.id));

    const data: EntityMetricRow[] = entities.map((e) => ({
      entityId: e.id,
      entityName: e.shortName,
      countryFlag: e.countryFlag,
      headcount: e.employeeCount,
      avgSalary: e.metrics.avgSalary,
      turnoverRate: e.metrics.turnoverRate,
      laborCostMonthly: e.metrics.laborCostMonthly,
      revenuePerEmployee: e.metrics.avgSalary * 3.5,
      openPositions: Math.round(e.metrics.headcountBudget - e.employeeCount),
      trainingHoursAvg: Math.round(20 + Math.random() * 30),
    }));

    return { entityIds, metrics, period: 'current', data };
  }
}
