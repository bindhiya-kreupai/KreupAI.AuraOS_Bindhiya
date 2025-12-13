// Automotive Module - Type Definitions

export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled';
export type ShiftType = 'morning' | 'afternoon' | 'evening' | 'night' | 'split';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type CommissionType = 'percentage' | 'flat' | 'tiered' | 'bonus';
export type PartStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_order' | 'discontinued';
export type InventoryMovementType = 'receipt' | 'sale' | 'return' | 'transfer' | 'adjustment' | 'damage';

// ============================================================================
// TECHNICIAN ROSTERING
// ============================================================================

export interface Technician {
  technicianId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  certifications: Certification[];
  specializations: string[];
  skillLevel: 'apprentice' | 'journeyman' | 'master' | 'expert';
  hourlyRate: number;
  employmentType: 'full_time' | 'part_time' | 'contractor';
  availability: Availability[];
  performanceMetrics: TechnicianPerformance;
  status: Status;
  hireDate: Date;
  department: string;
}

export interface Certification {
  certificationId: string;
  certificationName: string;
  issuingOrganization: string;
  certificationNumber: string;
  issueDate: Date;
  expiryDate: Date;
  isActive: boolean;
  attachmentUrl?: string;
}

export interface Availability {
  availabilityId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  preferredShift?: ShiftType;
}

export interface TechnicianPerformance {
  averageJobTime: number; // minutes
  jobsCompleted: number;
  customerSatisfactionScore: number; // 0-100
  qualityScore: number; // 0-100
  efficiency: number; // 0-100
  comebackRate: number; // percentage
  lastReviewDate: Date;
}

export interface TechnicianShift {
  shiftId: string;
  technicianId: string;
  technicianName: string;
  date: Date;
  shiftType: ShiftType;
  startTime: string;
  endTime: string;
  breakDuration: number; // minutes
  location: string;
  serviceAdvisor?: string;
  assignedJobs: string[];
  actualStartTime?: string;
  actualEndTime?: string;
  notes?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  overtimeHours?: number;
}

export interface RosterTemplate {
  templateId: string;
  templateName: string;
  description: string;
  weekPattern: WeekPattern[];
  effectiveFrom: Date;
  effectiveTo?: Date;
  isActive: boolean;
  createdBy: string;
  createdDate: Date;
}

export interface WeekPattern {
  weekNumber: number;
  shifts: TemplateShift[];
}

export interface TemplateShift {
  dayOfWeek: DayOfWeek;
  shiftType: ShiftType;
  startTime: string;
  endTime: string;
  requiredTechnicians: number;
  requiredSkillLevel?: string;
  requiredCertifications?: string[];
}

export interface ShiftSwapRequest {
  requestId: string;
  requestingTechnicianId: string;
  requestingTechnicianName: string;
  originalShiftId: string;
  targetTechnicianId?: string;
  targetTechnicianName?: string;
  proposedShiftId?: string;
  reason: string;
  requestDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reviewedBy?: string;
  reviewDate?: Date;
  reviewNotes?: string;
}

export interface TimeOffRequest {
  requestId: string;
  technicianId: string;
  technicianName: string;
  startDate: Date;
  endDate: Date;
  requestType: 'vacation' | 'sick' | 'personal' | 'emergency' | 'training';
  reason?: string;
  affectedShifts: string[];
  coverageArranged: boolean;
  coverageTechnicianId?: string;
  requestDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvalDate?: Date;
}

export interface WorkloadAnalysis {
  analysisId: string;
  period: { start: Date; end: Date };
  totalJobs: number;
  totalHours: number;
  averageJobsPerTechnician: number;
  averageHoursPerTechnician: number;
  utilizationRate: number; // percentage
  overtimeHours: number;
  technicianWorkload: TechnicianWorkload[];
  recommendations: string[];
  generatedDate: Date;
}

export interface TechnicianWorkload {
  technicianId: string;
  technicianName: string;
  scheduledHours: number;
  actualHours: number;
  jobsCompleted: number;
  utilizationRate: number;
  overtimeHours: number;
  efficiency: number;
}

// ============================================================================
// SALES COMMISSIONS
// ============================================================================

export interface SalesCommission {
  commissionId: string;
  salesPersonId: string;
  salesPersonName: string;
  period: { start: Date; end: Date };
  vehicleSales: VehicleSale[];
  serviceSales: ServiceSale[];
  totalVehicleSales: number;
  totalServiceSales: number;
  totalSalesAmount: number;
  baseCommission: number;
  bonuses: CommissionBonus[];
  totalBonuses: number;
  deductions: CommissionDeduction[];
  totalDeductions: number;
  netCommission: number;
  commissionRate: number;
  status: 'pending' | 'calculated' | 'approved' | 'paid' | 'disputed';
  calculatedDate: Date;
  approvedBy?: string;
  approvalDate?: Date;
  paymentDate?: Date;
  paymentMethod?: string;
}

export interface VehicleSale {
  saleId: string;
  vehicleId: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vin: string;
  saleType: 'new' | 'used' | 'certified_pre_owned';
  salePrice: number;
  cost: number;
  grossProfit: number;
  customerId: string;
  customerName: string;
  saleDate: Date;
  deliveryDate?: Date;
  financingType?: 'cash' | 'finance' | 'lease';
  financeCommission?: number;
  addOnsCommission?: number;
  totalCommission: number;
  commissionRate: number;
  invoiceNumber: string;
  status: 'pending' | 'delivered' | 'cancelled';
}

export interface ServiceSale {
  serviceId: string;
  customerId: string;
  customerName: string;
  vehicleId: string;
  serviceType: 'maintenance' | 'repair' | 'warranty' | 'recall' | 'inspection';
  serviceDescription: string;
  serviceDate: Date;
  laborAmount: number;
  partsAmount: number;
  totalAmount: number;
  commissionableAmount: number;
  commissionRate: number;
  commissionAmount: number;
  serviceAdvisorId: string;
  invoiceNumber: string;
  isPaid: boolean;
}

export interface CommissionStructure {
  structureId: string;
  structureName: string;
  description: string;
  applicableTo: 'all' | 'vehicles' | 'service' | 'finance' | 'parts';
  commissionType: CommissionType;
  tiers?: CommissionTier[];
  baseRate?: number;
  flatAmount?: number;
  bonusRules?: BonusRule[];
  effectiveFrom: Date;
  effectiveTo?: Date;
  isActive: boolean;
  createdBy: string;
  createdDate: Date;
}

export interface CommissionTier {
  tierId: string;
  tierName: string;
  minAmount: number;
  maxAmount?: number;
  commissionRate: number;
  flatBonus?: number;
}

export interface BonusRule {
  ruleId: string;
  ruleName: string;
  ruleType: 'target' | 'milestone' | 'volume' | 'satisfaction' | 'certification';
  criteria: any;
  bonusAmount?: number;
  bonusPercentage?: number;
  maxBonus?: number;
  isActive: boolean;
}

export interface CommissionBonus {
  bonusId: string;
  bonusType: string;
  bonusDescription: string;
  bonusAmount: number;
  eligibilityCriteria: string;
  achievedDate: Date;
}

export interface CommissionDeduction {
  deductionId: string;
  deductionType: 'chargeback' | 'adjustment' | 'advance' | 'penalty';
  deductionDescription: string;
  deductionAmount: number;
  reason: string;
  appliedDate: Date;
  referenceNumber?: string;
}

export interface CommissionReport {
  reportId: string;
  reportType: 'individual' | 'team' | 'department' | 'summary';
  period: { start: Date; end: Date };
  salesPersonId?: string;
  salesPersonName?: string;
  totalSales: number;
  totalCommissions: number;
  averageCommissionRate: number;
  topPerformers: TopPerformer[];
  trends: CommissionTrend[];
  generatedDate: Date;
  generatedBy: string;
}

export interface TopPerformer {
  rank: number;
  salesPersonId: string;
  salesPersonName: string;
  totalSales: number;
  totalCommissions: number;
  unitsold: number;
  averageDealSize: number;
}

export interface CommissionTrend {
  period: string;
  totalSales: number;
  totalCommissions: number;
  averageCommissionRate: number;
  unitsold: number;
}

export interface SalesPerson {
  salesPersonId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: 'new_vehicles' | 'used_vehicles' | 'service' | 'parts' | 'finance';
  hireDate: Date;
  commissionStructureId: string;
  performanceMetrics: SalesPerformance;
  status: Status;
  yearlySalesTarget?: number;
  monthlySalesTarget?: number;
}

export interface SalesPerformance {
  ytdSales: number;
  ytdCommissions: number;
  ytdUnits: number;
  mtdSales: number;
  mtdCommissions: number;
  mtdUnits: number;
  averageDealSize: number;
  closingRate: number; // percentage
  customerSatisfactionScore: number; // 0-100
  lastReviewDate: Date;
}

// ============================================================================
// PARTS INVENTORY
// ============================================================================

export interface Part {
  partId: string;
  partNumber: string;
  partName: string;
  description: string;
  category: string;
  subCategory?: string;
  manufacturer: string;
  manufacturerPartNumber?: string;
  applicableVehicles: ApplicableVehicle[];
  unitOfMeasure: string;
  cost: number;
  retailPrice: number;
  wholesalePrice?: number;
  markup: number; // percentage
  quantityOnHand: number;
  quantityOnOrder: number;
  quantityReserved: number;
  quantityAvailable: number;
  reorderPoint: number;
  reorderQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  leadTimeDays: number;
  binLocation: string;
  shelf?: string;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  isSerialized: boolean;
  isCore: boolean;
  coreCharge?: number;
  warrantyDays?: number;
  supplier: PartSupplier;
  alternativeParts?: string[];
  status: PartStatus;
  lastOrderDate?: Date;
  lastSaleDate?: Date;
  createdDate: Date;
  updatedDate: Date;
}

export interface ApplicableVehicle {
  make: string;
  model: string;
  yearStart: number;
  yearEnd: number;
  engine?: string;
  notes?: string;
}

export interface PartSupplier {
  supplierId: string;
  supplierName: string;
  supplierPartNumber?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  leadTimeDays: number;
  minOrderQuantity?: number;
  lastOrderDate?: Date;
  preferredSupplier: boolean;
}

export interface InventoryMovement {
  movementId: string;
  partId: string;
  partNumber: string;
  partName: string;
  movementType: InventoryMovementType;
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  referenceNumber?: string;
  referenceType?: 'purchase_order' | 'sales_order' | 'work_order' | 'transfer' | 'adjustment';
  fromLocation?: string;
  toLocation?: string;
  reason?: string;
  performedBy: string;
  movementDate: Date;
  notes?: string;
}

export interface PurchaseOrder {
  purchaseOrderId: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: Date;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'draft' | 'submitted' | 'confirmed' | 'partially_received' | 'received' | 'cancelled';
  createdBy: string;
  approvedBy?: string;
  approvalDate?: Date;
  receivedBy?: string;
  notes?: string;
}

export interface PurchaseOrderItem {
  itemId: string;
  partId: string;
  partNumber: string;
  partName: string;
  quantityOrdered: number;
  quantityReceived: number;
  quantityBackordered: number;
  unitCost: number;
  totalCost: number;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  status: 'pending' | 'received' | 'backordered' | 'cancelled';
}

export interface StockAdjustment {
  adjustmentId: string;
  adjustmentDate: Date;
  adjustmentType: 'physical_count' | 'damage' | 'obsolete' | 'theft' | 'return' | 'correction';
  items: StockAdjustmentItem[];
  reason: string;
  totalValue: number;
  performedBy: string;
  approvedBy?: string;
  approvalDate?: Date;
  notes?: string;
  status: 'draft' | 'submitted' | 'approved' | 'posted';
}

export interface StockAdjustmentItem {
  itemId: string;
  partId: string;
  partNumber: string;
  partName: string;
  systemQuantity: number;
  physicalQuantity: number;
  adjustmentQuantity: number;
  unitCost: number;
  adjustmentValue: number;
  binLocation: string;
  reason?: string;
}

export interface InventoryAnalysis {
  analysisId: string;
  period: { start: Date; end: Date };
  totalParts: number;
  totalValue: number;
  turnoverRate: number;
  slowMovingParts: SlowMovingPart[];
  fastMovingParts: FastMovingPart[];
  stockoutParts: string[];
  overstockedParts: string[];
  deadStock: string[];
  reorderRecommendations: ReorderRecommendation[];
  generatedDate: Date;
}

export interface SlowMovingPart {
  partId: string;
  partNumber: string;
  partName: string;
  quantityOnHand: number;
  value: number;
  daysSinceLastSale: number;
  turnoverRate: number;
  recommendation: string;
}

export interface FastMovingPart {
  partId: string;
  partNumber: string;
  partName: string;
  quantityOnHand: number;
  quantitySold: number;
  turnoverRate: number;
  daysOfSupply: number;
  recommendation: string;
}

export interface ReorderRecommendation {
  partId: string;
  partNumber: string;
  partName: string;
  currentStock: number;
  reorderPoint: number;
  recommendedOrderQuantity: number;
  estimatedCost: number;
  priority: Priority;
  supplier: string;
  leadTimeDays: number;
}

export interface InventoryLocation {
  locationId: string;
  locationName: string;
  locationType: 'warehouse' | 'service_center' | 'retail' | 'satellite';
  address: string;
  phone: string;
  manager: string;
  isActive: boolean;
}

export interface PartCatalog {
  catalogId: string;
  catalogName: string;
  manufacturer: string;
  modelYear?: number;
  version: string;
  releaseDate: Date;
  isActive: boolean;
  partsCount: number;
}

// ============================================================================
// SHARED / COMMON TYPES
// ============================================================================

export interface AutomotiveSettings {
  settingsId: string;
  defaultRosterTemplate?: string;
  defaultShiftDuration: number; // hours
  overtimeThreshold: number; // hours per week
  commissionPaymentSchedule: 'weekly' | 'bi_weekly' | 'monthly';
  inventoryValuationMethod: 'FIFO' | 'LIFO' | 'Average';
  autoReorderEnabled: boolean;
  lowStockAlertThreshold: number; // percentage
  defaultMarkupPercentage: number;
  enableShiftSwaps: boolean;
  maxShiftSwapsPerMonth: number;
  requireManagerApproval: boolean;
  lastUpdatedDate: Date;
  lastUpdatedBy: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
