/**
 * Energy & Utilities Module Type Definitions
 * Covers: Smart Grid, Water Conservation, Renewable Assets, Utility Billing
 */

// ============================================================================
// 1. SMART GRID
// ============================================================================

export interface SmartMeter {
  meterId: string;
  meterNumber: string;
  meterType: 'electric' | 'gas' | 'water';
  location: MeterLocation;
  installationDate: string;
  manufacturer: string;
  model: string;
  firmwareVersion: string;
  communicationProtocol: 'zigbee' | 'lora' | 'cellular' | 'plc';
  readingInterval: number; // in minutes
  lastReading: MeterReading;
  status: 'active' | 'inactive' | 'maintenance' | 'faulty';
  calibrationDate?: string;
  nextCalibrationDate?: string;
  alerts: MeterAlert[];
  createdAt: string;
  updatedAt?: string;
}

export interface MeterLocation {
  facilityId: string;
  facilityName: string;
  building?: string;
  floor?: string;
  room?: string;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };
  address?: string;
}

export interface MeterReading {
  readingId: string;
  timestamp: string;
  value: number;
  unit: 'kwh' | 'kw' | 'cubic_meters' | 'liters' | 'therms';
  voltage?: number;
  current?: number;
  powerFactor?: number;
  frequency?: number;
  temperature?: number;
  pressure?: number;
  quality: 'good' | 'estimated' | 'questionable';
  source: 'automated' | 'manual' | 'estimated';
}

export interface MeterAlert {
  alertId: string;
  alertType: AlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  threshold?: number;
  actualValue?: number;
  resolved: boolean;
  resolvedDate?: string;
  resolvedBy?: string;
  notes?: string;
}

export type AlertType =
  | 'high_consumption'
  | 'low_consumption'
  | 'communication_failure'
  | 'tamper_detected'
  | 'voltage_anomaly'
  | 'power_outage'
  | 'leak_detected'
  | 'calibration_due'
  | 'battery_low';

export interface EnergyConsumption {
  consumptionId: string;
  meterId: string;
  facilityId: string;
  facilityName: string;
  period: ConsumptionPeriod;
  consumption: number;
  unit: 'kwh' | 'cubic_meters' | 'therms';
  cost: number;
  peakDemand?: number;
  peakDemandTime?: string;
  averageDemand?: number;
  loadFactor?: number;
  breakdown: ConsumptionBreakdown;
  comparison: ConsumptionComparison;
  forecast?: number;
}

export interface ConsumptionPeriod {
  startDate: string;
  endDate: string;
  periodType: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface ConsumptionBreakdown {
  onPeak: number;
  offPeak: number;
  midPeak?: number;
  byDepartment?: DepartmentConsumption[];
  byEquipment?: EquipmentConsumption[];
}

export interface DepartmentConsumption {
  department: string;
  consumption: number;
  percentage: number;
  cost: number;
}

export interface EquipmentConsumption {
  equipmentId: string;
  equipmentName: string;
  equipmentType: string;
  consumption: number;
  percentage: number;
  efficiency?: number;
}

export interface ConsumptionComparison {
  previousPeriod: number;
  percentageChange: number;
  sameLastYear: number;
  yearOverYearChange: number;
  industryAverage?: number;
  comparisonToAverage?: number;
}

export interface LoadManagement {
  loadId: string;
  facilityId: string;
  managementType: 'peak_shaving' | 'load_shifting' | 'demand_response' | 'curtailment';
  startTime: string;
  endTime: string;
  targetReduction: number; // in kW
  actualReduction?: number;
  affectedEquipment: string[];
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  costSavings?: number;
  revenue?: number; // from demand response programs
  createdBy: string;
  createdAt: string;
}

export interface GridEvent {
  eventId: string;
  eventType: 'outage' | 'voltage_sag' | 'voltage_swell' | 'frequency_deviation' | 'phase_imbalance';
  startTime: string;
  endTime?: string;
  duration?: number; // in minutes
  affectedMeters: string[];
  affectedFacilities: string[];
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  cause?: string;
  impact: EventImpact;
  resolution?: string;
  status: 'active' | 'resolved';
}

export interface EventImpact {
  facilitiesAffected: number;
  employeesImpacted: number;
  estimatedCost: number;
  productionLoss?: number;
  customerComplaints?: number;
}

// ============================================================================
// 2. WATER CONSERVATION
// ============================================================================

export interface WaterMeter {
  meterId: string;
  meterNumber: string;
  meterType: 'potable' | 'irrigation' | 'reclaimed' | 'industrial';
  location: MeterLocation;
  flowRate: number; // liters per minute
  totalVolume: number; // cubic meters
  pressure: number; // psi
  leakDetection: boolean;
  lastReading: MeterReading;
  status: 'active' | 'inactive' | 'maintenance';
  installationDate: string;
  createdAt: string;
  updatedAt?: string;
}

export interface WaterUsage {
  usageId: string;
  meterId: string;
  facilityId: string;
  period: ConsumptionPeriod;
  volume: number; // cubic meters
  cost: number;
  breakdown: WaterBreakdown;
  comparison: UsageComparison;
  efficiency: WaterEfficiency;
  alerts: WaterAlert[];
}

export interface WaterBreakdown {
  domestic: number;
  irrigation: number;
  industrial: number;
  cooling: number;
  other: number;
  byDepartment?: DepartmentUsage[];
  byFixture?: FixtureUsage[];
}

export interface DepartmentUsage {
  department: string;
  volume: number;
  percentage: number;
  cost: number;
}

export interface FixtureUsage {
  fixtureType: 'toilet' | 'faucet' | 'shower' | 'dishwasher' | 'washing_machine' | 'irrigation' | 'cooling_tower';
  count: number;
  totalVolume: number;
  averagePerFixture: number;
  efficiency: number; // liters per use or cycle
}

export interface UsageComparison {
  previousMonth: number;
  percentageChange: number;
  yearToDate: number;
  budget: number;
  varianceFromBudget: number;
}

export interface WaterEfficiency {
  waterIntensity: number; // liters per employee or per sq ft
  recyclingRate: number; // percentage
  reusedWater: number; // cubic meters
  rainwaterHarvested: number; // cubic meters
  wasteWater: number; // cubic meters
  efficiency: number; // percentage
}

export interface WaterAlert {
  alertId: string;
  alertType: 'leak' | 'high_usage' | 'pressure_drop' | 'quality_issue' | 'meter_failure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  timestamp: string;
  value?: number;
  threshold?: number;
  estimatedLoss?: number; // liters per day
  status: 'open' | 'investigating' | 'resolved';
  assignedTo?: string;
  resolvedDate?: string;
  resolutionNotes?: string;
}

export interface LeakDetection {
  leakId: string;
  detectionMethod: 'acoustic' | 'pressure_monitoring' | 'flow_analysis' | 'visual';
  location: string;
  detectedDate: string;
  severity: 'minor' | 'moderate' | 'major' | 'severe';
  estimatedFlowRate: number; // liters per hour
  estimatedDailyLoss: number; // liters
  estimatedCost: number; // per day
  repairStatus: 'pending' | 'scheduled' | 'in_progress' | 'completed';
  repairDate?: string;
  actualLoss?: number;
  repairCost?: number;
  savings?: number;
}

export interface ConservationInitiative {
  initiativeId: string;
  initiativeName: string;
  type: 'fixture_upgrade' | 'behavior_change' | 'leak_repair' | 'rainwater_harvesting' | 'greywater_reuse' | 'irrigation_optimization';
  description: string;
  startDate: string;
  endDate?: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  targetReduction: number; // percentage or volume
  actualReduction?: number;
  investment: number;
  savings: number; // annual
  paybackPeriod?: number; // months
  metrics: InitiativeMetrics;
}

export interface InitiativeMetrics {
  baselineUsage: number;
  currentUsage: number;
  reductionAchieved: number;
  percentageReduction: number;
  costSavings: number;
  co2Reduction?: number; // kg
  participants?: number;
}

// ============================================================================
// 3. RENEWABLE ASSETS
// ============================================================================

export interface RenewableAsset {
  assetId: string;
  assetName: string;
  assetType: RenewableAssetType;
  location: AssetLocation;
  capacity: AssetCapacity;
  installation: InstallationDetails;
  performance: AssetPerformance;
  maintenance: MaintenanceSchedule;
  financials: AssetFinancials;
  status: 'operational' | 'maintenance' | 'offline' | 'decommissioned';
  certifications: Certification[];
  createdAt: string;
  updatedAt?: string;
}

export type RenewableAssetType =
  | 'solar_pv'
  | 'solar_thermal'
  | 'wind_turbine'
  | 'geothermal'
  | 'biomass'
  | 'hydroelectric'
  | 'battery_storage';

export interface AssetLocation {
  facilityId: string;
  facilityName: string;
  site: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  orientation?: string; // for solar
  tilt?: number; // degrees, for solar
  elevation?: number; // meters
}

export interface AssetCapacity {
  ratedCapacity: number; // kW or kWh for storage
  unit: 'kw' | 'kwh' | 'mw';
  numberOfUnits?: number;
  capacityPerUnit?: number;
  dcRating?: number; // for solar
  acRating?: number;
  storageCapacity?: number; // kWh for batteries
}

export interface InstallationDetails {
  installationDate: string;
  installer: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  warrantyExpiry: string;
  expectedLifespan: number; // years
  inverterType?: string;
  panelType?: string; // for solar
  turbineType?: string; // for wind
}

export interface AssetPerformance {
  currentOutput: number; // kW
  dailyProduction: number; // kWh
  monthlyProduction: number;
  yearlyProduction: number;
  lifetimeProduction: number;
  capacity: number; // percentage
  efficiency: number; // percentage
  availability: number; // percentage
  performanceRatio: number;
  specificYield?: number; // kWh/kWp for solar
  co2Avoided: number; // kg
  lastUpdated: string;
}

export interface MaintenanceSchedule {
  lastMaintenance?: string;
  nextMaintenance: string;
  maintenanceInterval: number; // days
  maintenanceType: 'preventive' | 'predictive' | 'corrective';
  maintenanceHistory: MaintenanceRecord[];
  warrantyStatus: 'active' | 'expired';
}

export interface MaintenanceRecord {
  recordId: string;
  maintenanceDate: string;
  maintenanceType: 'inspection' | 'cleaning' | 'repair' | 'replacement' | 'upgrade';
  technician: string;
  findings: string[];
  workPerformed: string[];
  partsReplaced?: PartReplacement[];
  cost: number;
  downtime: number; // hours
  nextRecommendedMaintenance?: string;
}

export interface PartReplacement {
  partName: string;
  partNumber: string;
  quantity: number;
  cost: number;
  warrantyPeriod?: number; // months
}

export interface AssetFinancials {
  capitalCost: number;
  installationCost: number;
  totalInvestment: number;
  incentivesReceived: IncentiveReceived[];
  totalIncentives: number;
  operatingCosts: OperatingCosts;
  revenue: AssetRevenue;
  roi: FinancialMetrics;
}

export interface IncentiveReceived {
  incentiveType: 'tax_credit' | 'rebate' | 'grant' | 'srec' | 'feed_in_tariff';
  provider: string;
  amount: number;
  receivedDate: string;
  description: string;
}

export interface OperatingCosts {
  annual: number;
  maintenance: number;
  insurance: number;
  monitoring: number;
  other: number;
}

export interface AssetRevenue {
  energySavings: number; // annual
  energySold: number; // kWh
  revenueFromSales: number;
  incentivePayments: number;
  totalAnnualRevenue: number;
}

export interface FinancialMetrics {
  paybackPeriod: number; // years
  npv: number; // net present value
  irr: number; // internal rate of return, percentage
  lcoe: number; // levelized cost of energy, $/kWh
  savingsToDate: number;
}

export interface Certification {
  certificationType: 'rec' | 'srec' | 'carbon_credit' | 'leed' | 'energy_star';
  certificateNumber: string;
  issueDate: string;
  expiryDate?: string;
  issuer: string;
  value?: number;
  status: 'active' | 'expired' | 'traded';
}

export interface EnergyProduction {
  productionId: string;
  assetId: string;
  timestamp: string;
  period: 'hourly' | 'daily' | 'monthly';
  output: number; // kWh
  peakOutput: number; // kW
  averageOutput: number;
  capacity: number; // percentage
  efficiency: number;
  weather?: WeatherConditions;
  gridExport?: number; // kWh sent to grid
  selfConsumption?: number; // kWh consumed on-site
}

export interface WeatherConditions {
  temperature: number; // celsius
  irradiance?: number; // W/m² for solar
  windSpeed?: number; // m/s for wind
  humidity?: number; // percentage
  cloudCover?: number; // percentage
}

// ============================================================================
// 4. UTILITY BILLING
// ============================================================================

export interface UtilityAccount {
  accountId: string;
  accountNumber: string;
  accountName: string;
  utilityProvider: UtilityProvider;
  utilityType: 'electric' | 'gas' | 'water' | 'sewer' | 'waste';
  facilityId: string;
  facilityName: string;
  serviceAddress: string;
  meterNumbers: string[];
  rateSchedule: RateSchedule;
  billingCycle: BillingCycle;
  paymentMethod: PaymentMethod;
  status: 'active' | 'inactive' | 'suspended';
  balance: number;
  createdAt: string;
  updatedAt?: string;
}

export interface UtilityProvider {
  providerId: string;
  providerName: string;
  utilityType: string;
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
    customerService: string;
  };
  serviceArea: string[];
}

export interface RateSchedule {
  scheduleId: string;
  scheduleName: string;
  effectiveDate: string;
  rateType: 'flat' | 'tiered' | 'time_of_use' | 'demand' | 'seasonal';
  rates: Rate[];
  demandCharge?: number; // $/kW
  minimumCharge?: number;
  customerCharge?: number; // monthly
  taxes: Tax[];
  surcharges: Surcharge[];
}

export interface Rate {
  tier?: number;
  timeOfUse?: 'on_peak' | 'off_peak' | 'mid_peak';
  season?: 'summer' | 'winter';
  lowerLimit?: number;
  upperLimit?: number;
  rate: number; // per unit
  unit: string;
}

export interface Tax {
  taxName: string;
  taxType: 'percentage' | 'fixed';
  value: number;
  applicableOn: 'consumption' | 'total' | 'base';
}

export interface Surcharge {
  surchargeName: string;
  surchargeType: 'fuel_adjustment' | 'regulatory' | 'environmental' | 'infrastructure';
  amount: number;
  isPercentage: boolean;
}

export interface BillingCycle {
  cycleName: string;
  billingFrequency: 'monthly' | 'bi_monthly' | 'quarterly';
  billingDay: number; // day of month
  dueDate: number; // days after billing
  lateFeePercentage: number;
  lateFeeGracePeriod: number; // days
}

export interface PaymentMethod {
  methodType: 'auto_pay' | 'manual' | 'check' | 'wire_transfer';
  bankAccount?: {
    accountNumber: string;
    routingNumber: string;
    accountType: 'checking' | 'savings';
  };
  creditCard?: {
    lastFourDigits: string;
    expiryDate: string;
    cardType: string;
  };
  autoPayEnabled: boolean;
  autoPayDate?: number;
}

export interface UtilityBill {
  billId: string;
  billNumber: string;
  accountId: string;
  accountNumber: string;
  billingPeriod: {
    startDate: string;
    endDate: string;
    days: number;
  };
  issueDate: string;
  dueDate: string;
  utilityType: string;
  consumption: BillConsumption;
  charges: BillCharges;
  total: BillTotal;
  payment: PaymentInfo;
  status: BillStatus;
  documents: BillDocument[];
  alerts: BillAlert[];
  createdAt: string;
}

export interface BillConsumption {
  currentReading: number;
  previousReading: number;
  consumption: number;
  unit: string;
  peakDemand?: number;
  demandUnit?: string;
  breakdown?: ConsumptionBreakdown;
}

export interface BillCharges {
  energyCharges: number;
  demandCharges?: number;
  customerCharge: number;
  taxes: TaxCharge[];
  surcharges: SurchargeCharge[];
  adjustments: Adjustment[];
  lateFees?: number;
  otherCharges?: OtherCharge[];
}

export interface TaxCharge {
  taxName: string;
  taxAmount: number;
  taxRate?: number;
}

export interface SurchargeCharge {
  surchargeName: string;
  amount: number;
}

export interface Adjustment {
  adjustmentType: 'credit' | 'debit';
  description: string;
  amount: number;
  reason: string;
}

export interface OtherCharge {
  chargeName: string;
  amount: number;
  description?: string;
}

export interface BillTotal {
  subtotal: number;
  totalTaxes: number;
  totalSurcharges: number;
  totalAdjustments: number;
  previousBalance: number;
  paymentsReceived: number;
  currentCharges: number;
  totalDue: number;
}

export interface PaymentInfo {
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  paymentMethod?: string;
  confirmationNumber?: string;
}

export type BillStatus =
  | 'pending'
  | 'issued'
  | 'partial_paid'
  | 'paid'
  | 'overdue'
  | 'disputed'
  | 'cancelled';

export interface BillDocument {
  documentId: string;
  documentType: 'invoice' | 'statement' | 'receipt' | 'adjustment_notice';
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadDate: string;
}

export interface BillAlert {
  alertType: 'high_bill' | 'unusual_consumption' | 'payment_due' | 'late_payment' | 'rate_change';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
}

export interface Payment {
  paymentId: string;
  billId: string;
  accountId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: 'auto_pay' | 'online' | 'check' | 'cash' | 'wire_transfer';
  confirmationNumber: string;
  status: 'pending' | 'processed' | 'failed' | 'refunded';
  processedDate?: string;
  notes?: string;
}

export interface BillComparison {
  comparisonId: string;
  accountId: string;
  currentBill: UtilityBill;
  previousBill: UtilityBill;
  yearAgoBill?: UtilityBill;
  analysis: ComparisonAnalysis;
}

export interface ComparisonAnalysis {
  consumptionChange: number; // percentage
  costChange: number; // percentage
  averageDailyCost: number;
  previousAverageDailyCost: number;
  factors: string[]; // reasons for change
  recommendations: string[];
}

export interface BudgetAlert {
  alertId: string;
  accountId: string;
  budgetPeriod: 'monthly' | 'quarterly' | 'annual';
  budgetAmount: number;
  actualSpending: number;
  variance: number;
  percentageOfBudget: number;
  status: 'under_budget' | 'on_track' | 'over_budget';
  timestamp: string;
}

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface EnergySettings {
  smartGridSettings: {
    readingInterval: number; // minutes
    alertThresholds: {
      highConsumption: number; // percentage above average
      communicationTimeout: number; // minutes
      voltageVariance: number; // percentage
    };
    demandResponseEnabled: boolean;
    peakShavingEnabled: boolean;
  };
  waterSettings: {
    leakDetectionSensitivity: 'low' | 'medium' | 'high';
    alertThreshold: number; // liters per hour
    conservationGoal: number; // percentage reduction
    recyclingTarget: number; // percentage
  };
  renewableSettings: {
    targetCapacity: number; // kW
    targetProduction: number; // kWh per year
    maintenanceInterval: number; // days
    performanceAlertThreshold: number; // percentage below expected
  };
  billingSettings: {
    autoPayEnabled: boolean;
    paymentReminderDays: number[];
    budgetAlertEnabled: boolean;
    billComparisonEnabled: boolean;
    paperlessBilling: boolean;
  };
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
