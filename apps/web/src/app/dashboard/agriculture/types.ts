// Agriculture Module - Comprehensive Type Definitions

// ============================================================================
// COMMON TYPES
// ============================================================================

export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled';

// ============================================================================
// SEASONAL LABOR TYPES
// ============================================================================

export interface SeasonalWorker {
  workerId: string;
  employeeId?: string;
  fullName: string;
  dateOfBirth: Date;
  nationality: string;

  // Contact
  phone: string;
  email?: string;
  emergencyContact: EmergencyContact;

  // Work Authorization
  visaType?: string;
  visaNumber?: string;
  visaExpiryDate?: Date;
  workPermitNumber?: string;
  workPermitExpiry?: Date;
  h2aStatus?: 'pending' | 'approved' | 'expired' | 'denied';

  // Employment
  employmentType: 'seasonal' | 'temporary' | 'contract' | 'h2a';
  seasonType: string; // e.g., "Spring Planting", "Summer Harvest", "Fall Harvest"
  startDate: Date;
  endDate: Date;
  contractedHours: number;
  hourlyRate: number;

  // Skills & Certifications
  skills: string[];
  certifications: WorkerCertification[];
  languages: string[];
  previousSeasons: number;

  // Assignment
  currentAssignment?: LaborAssignment;
  assignmentHistory: LaborAssignment[];

  // Housing
  housingRequired: boolean;
  housingAssignment?: HousingAssignment;

  // Performance
  performanceRating?: number;
  attendanceRate: number;
  productivityScore?: number;
  rehireEligible: boolean;

  // Status
  status: 'recruited' | 'onboarding' | 'active' | 'on_leave' | 'completed' | 'terminated';
  terminationReason?: string;

  // Documents
  documents: WorkerDocument[];

  // Metadata
  createdDate: Date;
  lastUpdatedDate: Date;
  notes?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
}

export interface WorkerCertification {
  certificationId: string;
  certificationType: string;
  certificationName: string;
  issuedDate: Date;
  expiryDate?: Date;
  issuingAuthority: string;
  certificationNumber: string;
  status: 'active' | 'expired' | 'pending_renewal';
}

export interface LaborAssignment {
  assignmentId: string;
  workerId: string;
  workerName: string;

  // Location
  farm: string;
  farmId: string;
  field: string;
  fieldId: string;
  crop: string;

  // Assignment Details
  assignmentType:
    'planting' | 'cultivation' | 'harvesting' | 'sorting' | 'packing' | 'maintenance' | 'other';
  startDate: Date;
  endDate?: Date;
  estimatedHours: number;
  actualHours: number;

  // Supervision
  supervisor: string;
  supervisorId: string;
  crewLead?: string;
  teamSize: number;

  // Production
  targetQuantity?: number;
  actualQuantity?: number;
  unitOfMeasure?: string;
  qualityScore?: number;

  // Status
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  completionPercentage: number;

  notes?: string;
}

export interface WorkerDocument {
  documentId: string;
  documentType: string;
  documentName: string;
  uploadedDate: Date;
  expiryDate?: Date;
  fileUrl: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedDate?: Date;
}

export interface SeasonalLaborPool {
  poolId: string;
  seasonName: string;
  seasonType: string;

  // Timeline
  seasonStartDate: Date;
  seasonEndDate: Date;
  recruitmentStartDate: Date;
  recruitmentEndDate: Date;

  // Workforce Planning
  targetWorkers: number;
  currentWorkers: number;
  activeWorkers: number;
  onLeaveWorkers: number;

  // Workers
  workers: string[]; // Worker IDs

  // Recruitment
  recruitmentSources: RecruitmentSource[];
  recruitmentCost: number;

  // Performance
  averageAttendance: number;
  averageProductivity: number;
  turnoverRate: number;

  status: Status;
  createdDate: Date;
}

export interface RecruitmentSource {
  sourceName: string;
  workersRecruited: number;
  cost: number;
  averageQuality: number;
}

// ============================================================================
// HOUSING MANAGEMENT TYPES
// ============================================================================

export interface HousingFacility {
  facilityId: string;
  facilityName: string;
  facilityType: 'dormitory' | 'apartment' | 'house' | 'trailer' | 'barracks';

  // Location
  address: string;
  farm: string;
  farmId: string;
  gpsCoordinates?: { latitude: number; longitude: number };

  // Capacity
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  totalRooms: number;
  bedsPerRoom: number;
  // Amenities
  amenities: string[];
  hasKitchen: boolean;
  hasBathroom: boolean;
  hasLaundry: boolean;
  hasCommonArea: boolean;
  hasCooling: boolean;
  hasHeating: boolean;
  hasWifi: boolean;

  // Utilities
  waterSupply: 'municipal' | 'well' | 'other';
  powerSupply: 'grid' | 'generator' | 'solar' | 'hybrid';
  sewerSystem: 'municipal' | 'septic' | 'other';

  // Compliance
  occupancyPermitNumber?: string;
  occupancyPermitExpiry?: Date;
  lastInspectionDate?: Date;
  nextInspectionDate?: Date;
  inspectionScore?: number;
  complianceStatus: 'compliant' | 'needs_attention' | 'non_compliant';
  violations: ComplianceViolation[];

  // Maintenance
  maintenanceSchedule: MaintenanceSchedule[];
  openWorkOrders: number;
  lastMaintenanceDate?: Date;

  // Cost
  monthlyCost: number;
  costPerBed: number;

  // Occupants
  currentOccupants: HousingAssignment[];

  // Status
  status: 'active' | 'inactive' | 'under_maintenance' | 'condemned';

  // Photos & Documents
  photos: string[];
  documents: FacilityDocument[];

  // Metadata
  createdDate: Date;
  lastUpdatedDate: Date;
  notes?: string;
}

export interface HousingAssignment {
  assignmentId: string;
  facilityId: string;
  facilityName: string;

  // Occupant
  workerId: string;
  workerName: string;
  employeeId?: string;

  // Room Assignment
  roomNumber: string;
  bedNumber: string;

  // Dates
  checkInDate: Date;
  plannedCheckOutDate: Date;
  actualCheckOutDate?: Date;

  // Roommates
  roommates: string[]; // Worker IDs

  // Charges
  weeklyRate: number;
  totalCharged: number;
  totalPaid: number;
  balance: number;

  // Condition
  checkInCondition: RoomCondition;
  checkOutCondition?: RoomCondition;
  damages?: DamageReport[];

  // Status
  status: 'active' | 'checked_out' | 'abandoned';

  notes?: string;
}

export interface RoomCondition {
  inspectionDate: Date;
  inspector: string;
  overallCondition: 'excellent' | 'good' | 'fair' | 'poor';
  cleanliness: number; // 1-5
  damages: string[];
  photos: string[];
  notes?: string;
}

export interface DamageReport {
  damageId: string;
  reportedDate: Date;
  damageType: string;
  damageDescription: string;
  estimatedCost: number;
  responsible: 'occupant' | 'wear_and_tear' | 'vandalism' | 'weather';
  chargedToOccupant: boolean;
  repaired: boolean;
  repairDate?: Date;
  photos: string[];
}

export interface ComplianceViolation {
  violationId: string;
  violationDate: Date;
  violationType: string;
  violationDescription: string;
  severity: 'minor' | 'major' | 'critical';
  correctionRequired: string;
  correctiveActionTaken?: string;
  correctionDate?: Date;
  status: 'open' | 'in_progress' | 'corrected' | 'waived';
}

export interface MaintenanceSchedule {
  scheduleId: string;
  maintenanceType: 'routine' | 'preventive' | 'repair' | 'emergency';
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'as_needed';
  lastCompleted?: Date;
  nextDue: Date;
  assignedTo?: string;
  status: 'scheduled' | 'overdue' | 'completed' | 'cancelled';
}

export interface FacilityDocument {
  documentId: string;
  documentType: string;
  documentName: string;
  uploadedDate: Date;
  expiryDate?: Date;
  fileUrl: string;
}

export interface HousingInspection {
  inspectionId: string;
  facilityId: string;
  facilityName: string;
  inspectionDate: Date;
  inspectionType: 'routine' | 'annual' | 'complaint' | 'follow_up';
  status?: string;

  // Inspector
  inspector: string;
  inspectorName?: string;
  inspectorCredentials?: string;

  // Inspection Results
  overallScore: number;
  passed: boolean;

  // Checklist
  structuralIntegrity: InspectionItem;
  electrical: InspectionItem;
  plumbing: InspectionItem;
  heating: InspectionItem;
  cooling: InspectionItem;
  firesafety: InspectionItem;
  sanitation: InspectionItem;
  ventilation: InspectionItem;
  emergencyExits: InspectionItem;

  // Issues & Violations
  violations: ComplianceViolation[];
  recommendations: string[];

  // Follow-up
  reinspectionRequired: boolean;
  reinspectionDate?: Date;

  // Documents
  reportUrl?: string;
  photos: string[];

  notes?: string;
}

export interface InspectionItem {
  status: 'pass' | 'fail' | 'needs_attention';
  score: number;
  notes?: string;
}

// ============================================================================
// CROP CYCLES TYPES
// ============================================================================

export interface CropCycle {
  cycleId: string;
  cropName: string;
  cropType: string;
  variety?: string;

  // Location
  farm: string;
  farmId: string;
  fields: FieldAssignment[];
  totalAcreage: number;

  // Timeline
  plantingDate: Date;
  expectedHarvestDate: Date;
  actualHarvestDate?: Date;
  cycleDuration: number; // days
  growingSeason: string; // e.g., "Spring 2024"

  // Stages
  currentStage: CropStage;
  stages: CropStageHistory[];

  // Workforce Planning
  laborRequirements: LaborRequirement[];
  peakLaborNeed: number;
  currentLaborAssigned: number;

  // Production
  expectedYield: number;
  actualYield?: number;
  yieldUnit: string;
  yieldPerAcre?: number;
  qualityGrade?: string;

  // Weather & Conditions
  weatherImpact: WeatherImpact[];
  irrigationRequired: boolean;
  irrigationSchedule?: IrrigationSchedule[];

  // Costs
  seedCost: number;
  laborCost: number;
  irrigationCost: number;
  fertilizerCost: number;
  pesticideCost: number;
  equipmentCost: number;
  totalCost: number;

  // Revenue
  expectedRevenue: number;
  actualRevenue?: number;
  profitMargin?: number;

  // Status & Health
  status: 'planning' | 'planting' | 'growing' | 'harvesting' | 'completed' | 'abandoned';
  cropHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  diseasePresent: boolean;
  pestPresent: boolean;

  // Issues & Risks
  issues: CropIssue[];
  risks: CropRisk[];

  // Metadata
  createdDate: Date;
  lastUpdatedDate: Date;
  notes?: string;
}

export interface FieldAssignment {
  fieldId: string;
  fieldName: string;
  acreage: number;
  soilType: string;
  irrigationAvailable: boolean;
}

export type CropStage =
  | 'land_preparation'
  | 'planting'
  | 'germination'
  | 'vegetative_growth'
  | 'flowering'
  | 'fruit_development'
  | 'maturation'
  | 'harvesting'
  | 'post_harvest';

export interface CropStageHistory {
  stage: CropStage;
  startDate: Date;
  endDate?: Date;
  duration?: number; // days
  completed: boolean;
  notes?: string;
}

export interface LaborRequirement {
  requirementId: string;
  stage: CropStage;
  activity: string;

  // Workforce Need
  startDate: Date;
  endDate: Date;
  workersNeeded: number;
  skillsRequired: string[];

  // Hours
  estimatedHours: number;
  actualHours?: number;

  // Progress
  workersAssigned: number;
  completionPercentage: number;
  status: 'planned' | 'in_progress' | 'completed';
}

export interface WeatherImpact {
  date: Date;
  weatherEvent: string;
  severity: 'minor' | 'moderate' | 'severe';
  impactDescription: string;
  yieldImpact?: number; // percentage
  actionTaken?: string;
}

export interface IrrigationSchedule {
  scheduleId: string;
  fieldId: string;
  startDate: Date;
  endDate: Date;
  frequency: string;
  duration: number; // minutes
  waterVolume: number; // gallons
  status: 'scheduled' | 'completed' | 'skipped';
}

export interface CropIssue {
  issueId: string;
  issueType: 'disease' | 'pest' | 'weather' | 'irrigation' | 'soil' | 'other';
  issueDescription: string;
  severity: Priority;
  discoveredDate: Date;
  affectedArea: number; // acres
  actionTaken?: string;
  resolved: boolean;
  resolutionDate?: Date;
}

export interface CropRisk {
  riskId: string;
  riskType: string;
  riskDescription: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigationPlan?: string;
  status: 'open' | 'monitoring' | 'mitigated';
}

export interface HarvestSchedule {
  scheduleId: string;
  cycleId: string;
  cropName: string;

  // Timing
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;

  // Location
  farm: string;
  fields: string[];
  totalAcreage: number;

  // Workforce
  workersRequired: number;
  workersScheduled: number;
  shifts: HarvestShift[];

  // Equipment
  equipmentNeeded: string[];
  equipmentScheduled: string[];

  // Progress
  acresHarvested: number;
  percentageComplete: number;

  // Production
  targetYield: number;
  currentYield: number;

  // Status
  status: 'planned' | 'in_progress' | 'completed' | 'delayed';
  delayReason?: string;

  notes?: string;
}

export interface HarvestShift {
  shiftId: string;
  shiftDate: Date;
  startTime: string;
  endTime: string;
  workersAssigned: string[];
  supervisor: string;
  targetAcres: number;
  actualAcres?: number;
  yieldCollected?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

// ============================================================================
// ANALYTICS & REPORTING TYPES
// ============================================================================

export interface AgricultureAnalytics {
  // Seasonal Labor
  seasonalLaborMetrics: {
    totalWorkers: number;
    activeWorkers: number;
    averageSeasonLength: number;
    averageHourlyRate: number;
    totalLaborCost: number;
    averageAttendance: number;
    averageProductivity: number;
    turnoverRate: number;
    rehireRate: number;
    workersByType: { type: string; count: number }[];
    workersBySkill: { skill: string; count: number }[];
    certificationExpiringSoon: number;
    visaExpiringSoon: number;
  };

  // Housing
  housingMetrics: {
    totalFacilities: number;
    totalBeds: number;
    occupiedBeds: number;
    occupancyRate: number;
    averageOccupancyRate: number;
    totalHousingCost: number;
    costPerOccupant: number;
    complianceRate: number;
    openViolations: number;
    pendingInspections: number;
    maintenanceBacklog: number;
    facilitiesByType: { type: string; count: number }[];
    facilitiesByStatus: { status: string; count: number }[];
  };

  // Crop Cycles
  cropCycleMetrics: {
    activeCycles: number;
    completedCycles: number;
    totalAcreage: number;
    averageYieldPerAcre: number;
    totalProduction: number;
    totalRevenue: number;
    totalCost: number;
    profitMargin: number;
    cyclesByStage: { stage: string; count: number }[];
    cyclesByCrop: { crop: string; count: number; acreage: number }[];
    cropHealthDistribution: { health: string; count: number }[];
    laborUtilization: number;
    openIssues: number;
    highRisks: number;
  };

  // Trends
  laborTrend: { month: string; workers: number; cost: number }[];
  occupancyTrend: { month: string; occupancyRate: number }[];
  productionTrend: { month: string; yield: number; revenue: number }[];
}

// ============================================================================
// SETTINGS TYPES
// ============================================================================

export interface AgricultureSettings {
  settingsId: string;

  // Seasonal Labor Settings
  laborSettings: {
    defaultHourlyRate: number;
    overtimeMultiplier: number;
    requiredCertifications: string[];
    backgroundCheckRequired: boolean;
    drugTestRequired: boolean;
    minWorkAge: number;
    maxSeasonLength: number; // days
  };

  // Housing Settings
  housingSettings: {
    maxOccupancyPerRoom: number;
    weeklyRatePerBed: number;
    damageDepositAmount: number;
    inspectionFrequency: 'monthly' | 'quarterly' | 'semi_annually' | 'annually';
    requireOccupancyPermit: boolean;
    complianceStandards: string[];
  };

  // Crop Cycle Settings
  cropSettings: {
    defaultIrrigationSchedule: string;
    weatherMonitoringEnabled: boolean;
    soilTestingFrequency: number; // days
    enableYieldForecasting: boolean;
    enableRiskAssessment: boolean;
  };

  lastUpdatedDate: Date;
  lastUpdatedBy: string;
  lastUpdatedByName: string;
}

// ============================================================================
// TOAST NOTIFICATION TYPE
// ============================================================================

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
