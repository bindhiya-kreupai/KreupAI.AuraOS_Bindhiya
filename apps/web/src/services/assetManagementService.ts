/**
 * @module assetManagementService
 * @description Asset Management — company asset lifecycle: procurement, assignment,
 *   tracking, return, condition management, and employee asset accountability.
 * @project AURA HCM Platform
 * @section 10.9 — Asset Management
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type AssetCategory =
  | 'Laptop'
  | 'Mobile Phone'
  | 'Access Badge'
  | 'Parking Permit'
  | 'Locker'
  | 'Vehicle'
  | 'Tablet'
  | 'Headset'
  | 'Monitor'
  | 'Other';
export type AssetStatus = 'Available' | 'Assigned' | 'Under Repair' | 'Disposed' | 'Lost/Stolen';
export type AssetCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Damaged';

export interface AssetFilters {
  category?: AssetCategory;
  status?: AssetStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface AssetAssignment {
  assignmentId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  assignedAt: string;
  returnedAt: string | null;
  conditionOnAssignment: AssetCondition;
  conditionOnReturn: AssetCondition | null;
  returnNotes: string | null;
}

export interface Asset {
  id: string;
  assetCode: string;
  name: string;
  category: AssetCategory;
  brand: string;
  model: string;
  serialNumber: string;
  status: AssetStatus;
  condition: AssetCondition;
  purchaseDate: string;
  purchaseCost: number;
  currentValue: number;
  warrantyExpiry: string | null;
  location: string;
  assignedTo: {
    employeeId: string;
    employeeCode: string;
    employeeName: string;
    department: string;
    assignedAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssetDetail extends Asset {
  description: string;
  assignmentHistory: AssetAssignment[];
  maintenanceLogs: Array<{
    date: string;
    type: string;
    description: string;
    cost: number;
    performedBy: string;
  }>;
}

export interface AssetCategoryInfo {
  category: AssetCategory;
  total: number;
  assigned: number;
  available: number;
  underRepair: number;
  disposed: number;
  totalValue: number;
  icon: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_ASSETS: Asset[] = [
  {
    id: 'AST-001',
    assetCode: 'LPT-0001',
    name: 'MacBook Pro 14"',
    category: 'Laptop',
    brand: 'Apple',
    model: 'MacBook Pro M3',
    serialNumber: 'C02X1234ABCD',
    status: 'Assigned',
    condition: 'Excellent',
    purchaseDate: '2024-03-15',
    purchaseCost: 2499,
    currentValue: 2100,
    warrantyExpiry: '2027-03-15',
    location: 'Dubai HQ',
    assignedTo: {
      employeeId: 'EMP-001',
      employeeCode: 'EMP001',
      employeeName: 'Ahmad Al-Rashidi',
      department: 'Executive',
      assignedAt: '2024-03-20',
    },
    createdAt: '2024-03-15T00:00:00Z',
    updatedAt: '2024-03-20T09:00:00Z',
  },
  {
    id: 'AST-002',
    assetCode: 'LPT-0002',
    name: 'Dell XPS 15',
    category: 'Laptop',
    brand: 'Dell',
    model: 'XPS 15 9520',
    serialNumber: 'DELL-5678-WXYZ',
    status: 'Assigned',
    condition: 'Good',
    purchaseDate: '2023-11-01',
    purchaseCost: 1899,
    currentValue: 1400,
    warrantyExpiry: '2026-11-01',
    location: 'Dubai HQ',
    assignedTo: {
      employeeId: 'EMP-002',
      employeeCode: 'EMP002',
      employeeName: 'Fatima Al-Zahra',
      department: 'Human Resources',
      assignedAt: '2023-11-05',
    },
    createdAt: '2023-11-01T00:00:00Z',
    updatedAt: '2023-11-05T10:00:00Z',
  },
  {
    id: 'AST-003',
    assetCode: 'LPT-0003',
    name: 'Lenovo ThinkPad X1',
    category: 'Laptop',
    brand: 'Lenovo',
    model: 'ThinkPad X1 Carbon Gen 11',
    serialNumber: 'LNV-9012-ABEF',
    status: 'Available',
    condition: 'Excellent',
    purchaseDate: '2024-06-01',
    purchaseCost: 1650,
    currentValue: 1500,
    warrantyExpiry: '2027-06-01',
    location: 'Asset Store - Dubai HQ',
    assignedTo: null,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-08-01T09:00:00Z',
  },
  {
    id: 'AST-004',
    assetCode: 'MOB-0001',
    name: 'iPhone 15 Pro',
    category: 'Mobile Phone',
    brand: 'Apple',
    model: 'iPhone 15 Pro 256GB',
    serialNumber: 'IPHN-3456-GHIJ',
    status: 'Assigned',
    condition: 'Excellent',
    purchaseDate: '2024-01-10',
    purchaseCost: 1199,
    currentValue: 950,
    warrantyExpiry: '2026-01-10',
    location: 'Dubai HQ',
    assignedTo: {
      employeeId: 'EMP-001',
      employeeCode: 'EMP001',
      employeeName: 'Ahmad Al-Rashidi',
      department: 'Executive',
      assignedAt: '2024-01-15',
    },
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
  },
  {
    id: 'AST-005',
    assetCode: 'LPT-0004',
    name: 'HP EliteBook 840',
    category: 'Laptop',
    brand: 'HP',
    model: 'EliteBook 840 G10',
    serialNumber: 'HP-7890-KLMN',
    status: 'Under Repair',
    condition: 'Fair',
    purchaseDate: '2022-08-01',
    purchaseCost: 1399,
    currentValue: 600,
    warrantyExpiry: '2025-08-01',
    location: 'IT Repair Center',
    assignedTo: null,
    createdAt: '2022-08-01T00:00:00Z',
    updatedAt: '2026-01-20T14:00:00Z',
  },
  {
    id: 'AST-006',
    assetCode: 'PKG-0001',
    name: 'Parking Permit - Slot B12',
    category: 'Parking Permit',
    brand: 'Corporate',
    model: 'Annual Permit',
    serialNumber: 'PKG-B12-2026',
    status: 'Assigned',
    condition: 'Good',
    purchaseDate: '2026-01-01',
    purchaseCost: 3600,
    currentValue: 3300,
    warrantyExpiry: '2026-12-31',
    location: 'Dubai HQ - Basement B',
    assignedTo: {
      employeeId: 'EMP-010',
      employeeCode: 'EMP010',
      employeeName: 'Khalid Ibrahim',
      department: 'Finance',
      assignedAt: '2026-01-01',
    },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T08:00:00Z',
  },
];

// ── Service Functions ─────────────────────────────────────────────────────────

export async function getAssets(
  filters: AssetFilters = {}
): Promise<{ assets: Asset[]; total: number }> {
  await new Promise((r) => setTimeout(r, 300));
  let results = [...MOCK_ASSETS];
  if (filters.category) results = results.filter((a) => a.category === filters.category);
  if (filters.status) results = results.filter((a) => a.status === filters.status);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.assetCode.toLowerCase().includes(q) ||
        a.serialNumber.toLowerCase().includes(q)
    );
  }
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const total = results.length;
  const paginated = results.slice((page - 1) * pageSize, page * pageSize);
  return { assets: paginated, total };
}

export async function getAsset(id: string): Promise<AssetDetail> {
  await new Promise((r) => setTimeout(r, 200));
  const base = MOCK_ASSETS.find((a) => a.id === id) ?? MOCK_ASSETS[0];
  return {
    ...base,
    description: `${base.brand} ${base.model} — standard corporate issue for ${base.category} category.`,
    assignmentHistory: base.assignedTo
      ? [
          {
            assignmentId: `ASGN-${base.id}-001`,
            employeeId: base.assignedTo.employeeId,
            employeeCode: base.assignedTo.employeeCode,
            employeeName: base.assignedTo.employeeName,
            department: base.assignedTo.department,
            assignedAt: base.assignedTo.assignedAt,
            returnedAt: null,
            conditionOnAssignment: 'Excellent',
            conditionOnReturn: null,
            returnNotes: null,
          },
        ]
      : [],
    maintenanceLogs: [
      {
        date: '2025-06-15',
        type: 'Preventive Maintenance',
        description: 'Battery health check and OS update',
        cost: 0,
        performedBy: 'IT Team',
      },
    ],
  };
}

export async function assignAsset(
  assetId: string,
  employeeId: string,
  employeeName: string,
  department: string
): Promise<Asset> {
  await new Promise((r) => setTimeout(r, 350));
  const base = MOCK_ASSETS.find((a) => a.id === assetId) ?? MOCK_ASSETS[2];
  if (base.status !== 'Available') throw new Error('Asset is not available for assignment');
  return {
    ...base,
    status: 'Assigned',
    assignedTo: {
      employeeId,
      employeeCode: `EMP${employeeId.slice(-3)}`,
      employeeName,
      department,
      assignedAt: new Date().toISOString().split('T')[0],
    },
    updatedAt: new Date().toISOString(),
  };
}

export async function returnAsset(
  assetId: string,
  condition: AssetCondition,
  _notes?: string
): Promise<Asset> {
  await new Promise((r) => setTimeout(r, 300));
  const base = MOCK_ASSETS.find((a) => a.id === assetId) ?? MOCK_ASSETS[0];
  return {
    ...base,
    status: condition === 'Damaged' || condition === 'Poor' ? 'Under Repair' : 'Available',
    condition,
    assignedTo: null,
    updatedAt: new Date().toISOString(),
  };
}

export async function getEmployeeAssets(employeeId: string): Promise<Asset[]> {
  await new Promise((r) => setTimeout(r, 200));
  return MOCK_ASSETS.filter((a) => a.assignedTo?.employeeId === employeeId);
}

export async function getAssetCategories(): Promise<AssetCategoryInfo[]> {
  await new Promise((r) => setTimeout(r, 250));
  const categories: AssetCategory[] = [
    'Laptop',
    'Mobile Phone',
    'Access Badge',
    'Parking Permit',
    'Locker',
    'Vehicle',
    'Tablet',
    'Headset',
    'Monitor',
    'Other',
  ];
  const icons: Record<AssetCategory, string> = {
    Laptop: 'laptop',
    'Mobile Phone': 'smartphone',
    'Access Badge': 'id-card',
    'Parking Permit': 'car',
    Locker: 'lock',
    Vehicle: 'truck',
    Tablet: 'tablet',
    Headset: 'headphones',
    Monitor: 'monitor',
    Other: 'box',
  };
  return categories
    .map((cat) => {
      const catAssets = MOCK_ASSETS.filter((a) => a.category === cat);
      return {
        category: cat,
        total: catAssets.length,
        assigned: catAssets.filter((a) => a.status === 'Assigned').length,
        available: catAssets.filter((a) => a.status === 'Available').length,
        underRepair: catAssets.filter((a) => a.status === 'Under Repair').length,
        disposed: catAssets.filter((a) => a.status === 'Disposed').length,
        totalValue: catAssets.reduce((sum, a) => sum + a.currentValue, 0),
        icon: icons[cat],
      };
    })
    .filter((c) => c.total > 0);
}
