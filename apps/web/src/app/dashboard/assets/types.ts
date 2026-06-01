// Assets Management Module Types

export type AssetType = 'laptop' | 'desktop' | 'monitor' | 'keyboard' | 'mouse' | 'phone' | 'tablet' | 'printer' | 'scanner' | 'projector' | 'camera' | 'headset' | 'dock' | 'furniture' | 'vehicle' | 'software' | 'license' | 'other';
export type AssetStatus = 'available' | 'assigned' | 'in_use' | 'under_maintenance' | 'damaged' | 'lost' | 'stolen' | 'retired' | 'disposed';
export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
export type MaintenanceType = 'preventive' | 'corrective' | 'upgrade' | 'inspection';
export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'fulfilled' | 'cancelled';
export type AuditStatus = 'planned' | 'in_progress' | 'completed';
export type DepreciationMethod = 'straight_line' | 'declining_balance' | 'double_declining' | 'sum_of_years';
export type DisposalMethod = 'sold' | 'donated' | 'recycled' | 'destroyed' | 'returned_to_vendor';

export interface Asset {
  id: string;
  assetCode: string;
  assetTag: string;
  name: string;
  description: string;
  assetType: AssetType;
  category: string;
  subcategory?: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  specifications: AssetSpecification[];
  purchaseDate: string;
  purchasePrice: number;
  currency: string;
  supplier: string;
  invoiceNumber?: string;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  warrantyProvider?: string;
  status: AssetStatus;
  condition: AssetCondition;
  location: AssetLocation;
  assignedTo?: AssetAssignment;
  department?: string;
  departmentName?: string;
  costCenter?: string;
  depreciation?: DepreciationInfo;
  maintenanceSchedule?: MaintenanceSchedule;
  maintenanceHistory: MaintenanceRecord[];
  images: string[];
  documents: string[];
  notes?: string;
  createdBy: string;
  createdByName: string;
  createdDate: string;
  lastModified: string;
  lastAuditDate?: string;
  nextAuditDate?: string;
}

export interface AssetSpecification {
  key: string;
  label: string;
  value: string;
}

export interface AssetLocation {
  locationType: 'office' | 'warehouse' | 'employee' | 'remote' | 'vendor' | 'other';
  buildingName?: string;
  floor?: string;
  room?: string;
  desk?: string;
  fullAddress?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface AssetAssignment {
  id: string;
  assetId: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  departmentId: string;
  departmentName: string;
  assignedDate: string;
  assignedBy: string;
  assignedByName: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  returnCondition?: AssetCondition;
  returnNotes?: string;
  isActive: boolean;
  acknowledgedBy?: string;
  acknowledgedDate?: string;
  digitalSignature?: string;
}

export interface DepreciationInfo {
  method: DepreciationMethod;
  usefulLifeYears: number;
  salvageValue: number;
  currentBookValue: number;
  accumulatedDepreciation: number;
  annualDepreciation: number;
  monthlyDepreciation: number;
  lastCalculationDate: string;
  nextCalculationDate: string;
}

export interface MaintenanceSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  nextMaintenanceDate: string;
  lastMaintenanceDate?: string;
  maintenanceProvider?: string;
  estimatedCost?: number;
  isActive: boolean;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  maintenanceType: MaintenanceType;
  status: MaintenanceStatus;
  scheduledDate: string;
  completedDate?: string;
  description: string;
  performedBy: string;
  performedByName: string;
  vendor?: string;
  cost: number;
  partsReplaced?: string[];
  notes?: string;
  beforeCondition?: AssetCondition;
  afterCondition?: AssetCondition;
  nextMaintenanceDate?: string;
  attachments?: string[];
  createdDate: string;
}

export interface AssetRequest {
  id: string;
  requestCode: string;
  requestedBy: string;
  requestedByName: string;
  requestedByEmail: string;
  departmentId: string;
  departmentName: string;
  assetType: AssetType;
  assetName: string;
  quantity: number;
  purpose: string;
  justification: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  estimatedCost?: number;
  preferredBrand?: string;
  specifications?: { [key: string]: string };
  status: RequestStatus;
  requestedDate: string;
  requiredByDate?: string;
  approvers: RequestApprover[];
  approvedDate?: string;
  rejectedDate?: string;
  rejectionReason?: string;
  fulfilledDate?: string;
  fulfilledBy?: string;
  assignedAssets?: string[];
  notes?: string;
  createdDate: string;
}

export interface RequestApprover {
  id: string;
  approverLevel: number;
  approverId: string;
  approverName: string;
  approverRole: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedDate?: string;
  comments?: string;
  rejectionReason?: string;
}

export interface AssetTransfer {
  id: string;
  transferCode: string;
  assetId: string;
  assetName: string;
  fromEmployeeId?: string;
  fromEmployeeName?: string;
  toEmployeeId: string;
  toEmployeeName: string;
  fromLocation: AssetLocation;
  toLocation: AssetLocation;
  transferDate: string;
  transferReason: string;
  transferredBy: string;
  transferredByName: string;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  condition: AssetCondition;
  notes?: string;
  acknowledgedBy?: string;
  acknowledgedDate?: string;
  createdDate: string;
}

export interface AssetAudit {
  id: string;
  auditCode: string;
  auditName: string;
  auditType: 'physical' | 'reconciliation' | 'compliance' | 'spot_check';
  status: AuditStatus;
  plannedDate: string;
  startDate?: string;
  completedDate?: string;
  auditedBy: string;
  auditedByName: string;
  scope: AuditScope;
  assetsAudited: AssetAuditItem[];
  findings: AuditFinding[];
  summary: string;
  recommendations: string[];
  reportUrl?: string;
  createdDate: string;
}

export interface AuditScope {
  scopeType: 'all' | 'department' | 'location' | 'asset_type' | 'specific_assets';
  departmentIds?: string[];
  locationIds?: string[];
  assetTypes?: AssetType[];
  assetIds?: string[];
}

export interface AssetAuditItem {
  assetId: string;
  assetCode: string;
  assetName: string;
  expectedLocation: AssetLocation;
  actualLocation?: AssetLocation;
  expectedCondition: AssetCondition;
  actualCondition?: AssetCondition;
  expectedAssignee?: string;
  actualAssignee?: string;
  isFound: boolean;
  isMismatch: boolean;
  mismatchDetails?: string;
  notes?: string;
  auditedDate: string;
}

export interface AuditFinding {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'missing' | 'damaged' | 'unauthorized' | 'mismatch' | 'compliance' | 'other';
  description: string;
  affectedAssets: string[];
  recommendation: string;
  assignedTo?: string;
  dueDate?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  resolutionDate?: string;
  resolutionNotes?: string;
}

export interface AssetDisposal {
  id: string;
  disposalCode: string;
  assetId: string;
  assetName: string;
  assetValue: number;
  disposalMethod: DisposalMethod;
  disposalDate: string;
  disposalReason: string;
  approvedBy: string;
  approvedByName: string;
  approvedDate: string;
  disposedBy: string;
  disposedByName: string;
  vendor?: string;
  salePrice?: number;
  certificate?: string;
  environmentalCompliance: boolean;
  dataWiped: boolean;
  dataWipeMethod?: string;
  dataWipeCertificate?: string;
  notes?: string;
  createdDate: string;
}

export interface AssetCategory {
  id: string;
  name: string;
  description?: string;
  parentCategoryId?: string;
  depreciationMethod: DepreciationMethod;
  defaultUsefulLife: number;
  requiresCalibration: boolean;
  calibrationFrequency?: 'monthly' | 'quarterly' | 'annually';
  requiresInsurance: boolean;
  isActive: boolean;
}

export interface AssetPolicy {
  id: string;
  policyName: string;
  description: string;
  isActive: boolean;
  assetTypes: AssetType[];
  assignmentRules: AssignmentRule[];
  maintenanceRules: MaintenanceRule[];
  depreciationRules: DepreciationRule[];
  disposalRules: DisposalRule[];
  auditFrequency: 'monthly' | 'quarterly' | 'semi_annually' | 'annually';
  requireApprovalForRequests: boolean;
  approvalLevels: number;
  maxValueWithoutApproval: number;
  createdBy: string;
  createdDate: string;
}

export interface AssignmentRule {
  assetType: AssetType;
  maxAssignmentPeriod?: number;
  requireAcknowledgment: boolean;
  requireReturnInspection: boolean;
  allowedRoles: string[];
  allowedDepartments: string[];
}

export interface MaintenanceRule {
  assetType: AssetType;
  maintenanceFrequency: 'monthly' | 'quarterly' | 'semi_annually' | 'annually';
  requirePreventiveMaintenance: boolean;
  maintenanceBudget?: number;
}

export interface DepreciationRule {
  assetType: AssetType;
  method: DepreciationMethod;
  usefulLifeYears: number;
  salvageValuePercentage: number;
}

export interface DisposalRule {
  assetType: AssetType;
  minUsefulLife: number;
  requireDataWipe: boolean;
  requireCertificate: boolean;
  approvalRequired: boolean;
  environmentalComplianceRequired: boolean;
}

export interface AssetMetrics {
  totalAssets: number;
  totalAssetValue: number;
  totalDepreciation: number;
  currentBookValue: number;
  assetsByType: { type: AssetType; count: number; value: number }[];
  assetsByStatus: { status: AssetStatus; count: number }[];
  assetsByDepartment: { departmentId: string; departmentName: string; count: number; value: number }[];
  assignedAssets: number;
  availableAssets: number;
  underMaintenanceAssets: number;
  pendingRequests: number;
  maintenanceCostThisMonth: number;
  maintenanceCostThisYear: number;
  assetsNearingWarrantyExpiry: number;
  overdueMaintenanceAssets: number;
  topAssetsByValue: { assetId: string; name: string; value: number }[];
  recentAcquisitions: { assetId: string; name: string; purchaseDate: string }[];
}

export interface AssetSettings {
  enableAutoTagging: boolean;
  tagPrefix: string;
  enableDepreciation: boolean;
  defaultDepreciationMethod: DepreciationMethod;
  enableMaintenanceTracking: boolean;
  enableWarrantyTracking: boolean;
  warrantyReminderDays: number;
  enableAssetRequests: boolean;
  requireApprovalForRequests: boolean;
  enableAssetAudits: boolean;
  auditFrequency: 'monthly' | 'quarterly' | 'semi_annually' | 'annually';
  enableQRCodes: boolean;
  enableBarcodeScanning: boolean;
  enableGeolocation: boolean;
  lowStockThreshold: number;
  notificationEmail: string;
}

export interface AssetReport {
  id: string;
  reportType: 'inventory' | 'depreciation' | 'maintenance' | 'assignment' | 'audit' | 'disposal';
  reportName: string;
  generatedBy: string;
  generatedByName: string;
  generatedDate: string;
  filters: { [key: string]: any };
  data: any[];
  fileUrl?: string;
}
/**
 * Toast notification shape — used by the dashboard's Toast/useToast
 * components. Kept consistent across dashboards: id, type, message,
 * optional duration in ms.
 */
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
