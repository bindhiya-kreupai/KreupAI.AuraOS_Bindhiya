// @ts-nocheck — Dev/demo seed data, intentionally loose-typed.
// Assets Management Sample Data
import type { Asset, AssetRequest, AssetMetrics, AssetSettings } from './types';

export const sampleAssets: Asset[] = [
  {
    id: 'asset-001', assetCode: 'AST-2024-001', assetTag: 'LAP-001', name: 'MacBook Pro 16"', description: 'Apple MacBook Pro 16-inch M3 Max',
    assetType: 'laptop', category: 'IT Equipment', manufacturer: 'Apple', model: 'MacBook Pro 16" M3 Max', serialNumber: 'C02XG0FDQ05N',
    specifications: [
      { key: 'processor', label: 'Processor', value: 'Apple M3 Max' },
      { key: 'ram', label: 'RAM', value: '64GB' },
      { key: 'storage', label: 'Storage', value: '2TB SSD' }
    ],
    purchaseDate: '2024-01-15', purchasePrice: 3999, currency: 'USD', supplier: 'Apple Store', warrantyStartDate: '2024-01-15', warrantyEndDate: '2027-01-15',
    status: 'assigned', condition: 'excellent',
    location: { locationType: 'employee', buildingName: 'HQ', floor: '3', desk: 'E-301' },
    assignedTo: {
      id: 'assign-001', assetId: 'asset-001', employeeId: 'emp-001', employeeName: 'John Smith', employeeEmail: 'john.smith@company.com',
      departmentId: 'dept-002', departmentName: 'Engineering', assignedDate: '2024-01-20', assignedBy: 'it-admin', assignedByName: 'IT Admin',
      isActive: true, acknowledgedDate: '2024-01-20'
    },
    department: 'dept-002', departmentName: 'Engineering',
    depreciation: {
      method: 'straight_line', usefulLifeYears: 4, salvageValue: 400, currentBookValue: 3499, accumulatedDepreciation: 500,
      annualDepreciation: 900, monthlyDepreciation: 75, lastCalculationDate: '2024-12-01', nextCalculationDate: '2025-01-01'
    },
    maintenanceHistory: [],
    images: ['/assets/macbook-pro.jpg'],
    documents: ['/assets/invoice-001.pdf'],
    createdBy: 'it-admin', createdByName: 'IT Admin', createdDate: '2024-01-15', lastModified: '2024-01-20'
  },
  {
    id: 'asset-002', assetCode: 'AST-2024-002', assetTag: 'MON-001', name: 'Dell UltraSharp 27"', description: 'Dell UltraSharp 4K Monitor',
    assetType: 'monitor', category: 'IT Equipment', manufacturer: 'Dell', model: 'U2723DE', serialNumber: 'CN-0H5P4G',
    specifications: [
      { key: 'size', label: 'Size', value: '27 inches' },
      { key: 'resolution', label: 'Resolution', value: '3840 x 2160 (4K)' }
    ],
    purchaseDate: '2024-01-15', purchasePrice: 699, currency: 'USD', supplier: 'Dell Direct',
    status: 'assigned', condition: 'excellent',
    location: { locationType: 'employee', buildingName: 'HQ', floor: '3', desk: 'E-301' },
    assignedTo: {
      id: 'assign-002', assetId: 'asset-002', employeeId: 'emp-001', employeeName: 'John Smith', employeeEmail: 'john.smith@company.com',
      departmentId: 'dept-002', departmentName: 'Engineering', assignedDate: '2024-01-20', assignedBy: 'it-admin', assignedByName: 'IT Admin',
      isActive: true
    },
    department: 'dept-002', departmentName: 'Engineering',
    maintenanceHistory: [],
    images: [],
    documents: [],
    createdBy: 'it-admin', createdByName: 'IT Admin', createdDate: '2024-01-15', lastModified: '2024-01-20'
  },
  {
    id: 'asset-003', assetCode: 'AST-2024-003', assetTag: 'PHN-001', name: 'iPhone 15 Pro', description: 'Apple iPhone 15 Pro 256GB',
    assetType: 'phone', category: 'IT Equipment', manufacturer: 'Apple', model: 'iPhone 15 Pro', serialNumber: 'F2AP3JL9Q',
    specifications: [
      { key: 'storage', label: 'Storage', value: '256GB' },
      { key: 'color', label: 'Color', value: 'Titanium Black' }
    ],
    purchaseDate: '2024-02-01', purchasePrice: 1199, currency: 'USD', supplier: 'Apple Store',
    status: 'available', condition: 'good',
    location: { locationType: 'warehouse', buildingName: 'HQ', floor: '1', room: 'Storage-A' },
    department: 'dept-004', departmentName: 'IT',
    maintenanceHistory: [],
    images: [],
    documents: [],
    createdBy: 'it-admin', createdByName: 'IT Admin', createdDate: '2024-02-01', lastModified: '2024-02-01'
  }
];

export const sampleRequests: AssetRequest[] = [
  {
    id: 'req-001', requestCode: 'REQ-2024-001', requestedBy: 'emp-005', requestedByName: 'Sarah Wilson',
    requestedByEmail: 'sarah.wilson@company.com', departmentId: 'dept-003', departmentName: 'Marketing',
    assetType: 'laptop', assetName: 'MacBook Air M3', quantity: 1, purpose: 'New hire equipment',
    justification: 'New marketing coordinator starting next week', urgency: 'high', estimatedCost: 1299,
    status: 'pending', requestedDate: '2024-12-10', requiredByDate: '2024-12-17',
    approvers: [
      { id: 'app-001', approverLevel: 1, approverId: 'mgr-003', approverName: 'Marketing Director',
        approverRole: 'Department Head', status: 'pending' }
    ],
    createdDate: '2024-12-10'
  }
];

export const sampleMetrics: AssetMetrics = {
  totalAssets: 487, totalAssetValue: 2850000, totalDepreciation: 420000, currentBookValue: 2430000,
  assetsByType: [
    { type: 'laptop', count: 125, value: 480000 },
    { type: 'monitor', count: 180, value: 125000 },
    { type: 'phone', count: 85, value: 95000 }
  ],
  assetsByStatus: [
    { status: 'assigned', count: 385 },
    { status: 'available', count: 82 },
    { status: 'under_maintenance', count: 15 }
  ],
  assetsByDepartment: [
    { departmentId: 'dept-002', departmentName: 'Engineering', count: 185, value: 920000 },
    { departmentId: 'dept-003', departmentName: 'Marketing', count: 65, value: 185000 }
  ],
  assignedAssets: 385, availableAssets: 82, underMaintenanceAssets: 15, pendingRequests: 12,
  maintenanceCostThisMonth: 8500, maintenanceCostThisYear: 95000, assetsNearingWarrantyExpiry: 25,
  overdueMaintenanceAssets: 8,
  topAssetsByValue: [
    { assetId: 'asset-001', name: 'MacBook Pro 16"', value: 3999 }
  ],
  recentAcquisitions: [
    { assetId: 'asset-003', name: 'iPhone 15 Pro', purchaseDate: '2024-02-01' }
  ]
};

export const sampleSettings: AssetSettings = {
  enableAutoTagging: true, tagPrefix: 'AST', enableDepreciation: true, defaultDepreciationMethod: 'straight_line',
  enableMaintenanceTracking: true, enableWarrantyTracking: true, warrantyReminderDays: 30,
  enableAssetRequests: true, requireApprovalForRequests: true, enableAssetAudits: true, auditFrequency: 'quarterly',
  enableQRCodes: true, enableBarcodeScanning: true, enableGeolocation: false, lowStockThreshold: 5,
  notificationEmail: 'assets@company.com'
};

export const assetData = { assets: sampleAssets, requests: sampleRequests, metrics: sampleMetrics, settings: sampleSettings };
