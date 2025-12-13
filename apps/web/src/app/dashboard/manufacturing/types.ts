export type EquipmentStatus = 'operational' | 'maintenance' | 'down' | 'retired';
export type MaintenanceType = 'preventive' | 'corrective' | 'predictive' | 'emergency';
export type WorkOrderStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type ProductionStatus = 'running' | 'idle' | 'down' | 'changeover';
export type IncidentSeverity = 'minor' | 'moderate' | 'serious' | 'critical';
export type IncidentStatus = 'reported' | 'investigating' | 'resolved' | 'closed';

export interface Equipment {
  equipmentId: string;
  equipmentNumber: string;
  equipmentName: string;
  equipmentType: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  location: EquipmentLocation;
  installationDate: string;
  warrantyExpiry?: string;
  status: EquipmentStatus;
  specifications: EquipmentSpecifications;
  maintenanceHistory: MaintenanceRecord[];
  currentCondition: EquipmentCondition;
  criticality: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt?: string;
}

export interface EquipmentLocation {
  plant: string;
  building: string;
  floor: string;
  area: string;
  line?: string;
}

export interface EquipmentSpecifications {
  capacity: number;
  capacityUnit: string;
  powerRequirement: number;
  voltage: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  weight: number;
  weightUnit: string;
}

export interface EquipmentCondition {
  overallHealth: number;
  vibrationLevel: number;
  temperature: number;
  pressure?: number;
  lastInspectionDate: string;
  nextInspectionDate: string;
  notes?: string;
}

export interface MaintenanceRecord {
  recordId: string;
  maintenanceType: MaintenanceType;
  performedDate: string;
  performedBy: string;
  duration: number;
  cost: number;
  partsReplaced: ReplacedPart[];
  findings: string;
  recommendations?: string;
}

export interface ReplacedPart {
  partNumber: string;
  partName: string;
  quantity: number;
  cost: number;
}

export interface MaintenanceSchedule {
  scheduleId: string;
  equipmentId: string;
  equipmentName: string;
  maintenanceType: MaintenanceType;
  frequency: ScheduleFrequency;
  lastPerformed?: string;
  nextDue: string;
  estimatedDuration: number;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  checklist: MaintenanceTask[];
  status: 'active' | 'overdue' | 'suspended';
  createdAt: string;
}

export interface ScheduleFrequency {
  value: number;
  unit: 'hours' | 'days' | 'weeks' | 'months' | 'cycles';
}

export interface MaintenanceTask {
  taskId: string;
  taskDescription: string;
  estimatedTime: number;
  requiredSkills: string[];
  requiredTools: string[];
  safetyPrecautions: string[];
  completed: boolean;
}

export interface WorkOrder {
  workOrderId: string;
  workOrderNumber: string;
  equipmentId: string;
  equipmentName: string;
  maintenanceType: MaintenanceType;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  requestedBy: string;
  requestedDate: string;
  scheduledDate?: string;
  assignedTo?: string;
  assignedTeam?: string;
  status: WorkOrderStatus;
  estimatedCost: number;
  actualCost?: number;
  estimatedHours: number;
  actualHours?: number;
  parts: RequiredPart[];
  completionDetails?: CompletionDetails;
  createdAt: string;
  updatedAt?: string;
}

export interface RequiredPart {
  partNumber: string;
  partName: string;
  quantity: number;
  unitCost: number;
  available: boolean;
  vendor?: string;
}

export interface CompletionDetails {
  completedDate: string;
  completedBy: string;
  workPerformed: string;
  partsUsed: ReplacedPart[];
  testResults: string;
  followUpRequired: boolean;
  followUpNotes?: string;
}

export interface ProductionLine {
  lineId: string;
  lineName: string;
  lineNumber: string;
  plant: string;
  department: string;
  productType: string;
  capacity: ProductionCapacity;
  equipment: string[];
  staffing: LineStaffing;
  status: ProductionStatus;
  currentShift: ShiftInfo;
  performance: LinePerformance;
  createdAt: string;
}

export interface ProductionCapacity {
  ratedCapacity: number;
  capacityUnit: string;
  cycleTime: number;
  shiftsPerDay: number;
  daysPerWeek: number;
}

export interface LineStaffing {
  operators: number;
  technicians: number;
  supervisor: string;
  currentStaffCount: number;
  requiredStaffCount: number;
}

export interface ShiftInfo {
  shiftId: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  supervisor: string;
}

export interface LinePerformance {
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  unitsProduced: number;
  targetUnits: number;
  defectRate: number;
  downtime: number;
  lastUpdated: string;
}

export interface ProductionRun {
  runId: string;
  lineId: string;
  lineName: string;
  productId: string;
  productName: string;
  batchNumber: string;
  startTime: string;
  endTime?: string;
  plannedQuantity: number;
  actualQuantity: number;
  goodUnits: number;
  defectiveUnits: number;
  scrapUnits: number;
  status: 'planned' | 'running' | 'paused' | 'completed' | 'cancelled';
  operators: ProductionOperator[];
  qualityChecks: QualityCheck[];
  downtimeEvents: DowntimeEvent[];
  createdAt: string;
}

export interface ProductionOperator {
  employeeId: string;
  employeeName: string;
  role: string;
  hoursWorked: number;
}

export interface QualityCheck {
  checkId: string;
  checkTime: string;
  inspector: string;
  sampleSize: number;
  passedUnits: number;
  failedUnits: number;
  defectTypes: DefectType[];
  notes?: string;
}

export interface DefectType {
  defectCode: string;
  defectDescription: string;
  count: number;
}

export interface DowntimeEvent {
  eventId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  reason: DowntimeReason;
  category: 'planned' | 'unplanned';
  description: string;
  resolvedBy?: string;
  impact: number;
}

export interface DowntimeReason {
  reasonCode: string;
  reasonDescription: string;
  category: 'equipment' | 'material' | 'personnel' | 'quality' | 'other';
}

export interface OEEMetrics {
  metricId: string;
  lineId: string;
  lineName: string;
  period: MetricPeriod;
  availability: AvailabilityMetrics;
  performanceMetrics: PerformanceMetrics;
  qualityMetrics: QualityMetrics;
  overallOEE: number;
  worldClassOEE: number;
  trend: 'improving' | 'stable' | 'declining';
  createdAt: string;
}

export interface MetricPeriod {
  startDate: string;
  endDate: string;
  periodType: 'shift' | 'day' | 'week' | 'month';
}

export interface AvailabilityMetrics {
  plannedProductionTime: number;
  actualRunTime: number;
  downtime: number;
  availability: number;
  availabilityLoss: number;
}

export interface PerformanceMetrics {
  idealCycleTime: number;
  actualCycleTime: number;
  totalUnitsProduced: number;
  performanceRate: number;
  speedLoss: number;
}

export interface QualityMetrics {
  totalUnitsProduced: number;
  goodUnits: number;
  defectiveUnits: number;
  qualityRate: number;
  qualityLoss: number;
}

export interface SafetyIncident {
  incidentId: string;
  incidentNumber: string;
  incidentType: IncidentType;
  severity: IncidentSeverity;
  reportedDate: string;
  incidentDate: string;
  incidentTime: string;
  location: IncidentLocation;
  affectedPerson: AffectedPerson;
  description: string;
  immediateAction: string;
  witnesses: Witness[];
  investigation: Investigation;
  rootCause?: RootCause;
  correctiveActions: CorrectiveAction[];
  status: IncidentStatus;
  reportedBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IncidentType {
  typeCode: string;
  typeName: string;
  category: 'injury' | 'near_miss' | 'property_damage' | 'environmental' | 'security';
}

export interface IncidentLocation {
  plant: string;
  building: string;
  area: string;
  specificLocation: string;
  equipmentInvolved?: string;
}

export interface AffectedPerson {
  employeeId: string;
  employeeName: string;
  department: string;
  jobTitle: string;
  injuryType?: string;
  injuryDescription?: string;
  medicalTreatment?: string;
  daysAway?: number;
  restrictedDuty?: number;
}

export interface Witness {
  witnessId: string;
  witnessName: string;
  department: string;
  contactInfo: string;
  statement?: string;
}

export interface Investigation {
  investigatorId: string;
  investigatorName: string;
  investigationStartDate: string;
  investigationEndDate?: string;
  findings: string;
  evidenceCollected: Evidence[];
  interviewsConducted: Interview[];
}

export interface Evidence {
  evidenceId: string;
  evidenceType: 'photo' | 'document' | 'physical' | 'video';
  description: string;
  collectedBy: string;
  collectedDate: string;
}

export interface Interview {
  interviewId: string;
  interviewee: string;
  interviewDate: string;
  interviewer: string;
  summary: string;
}

export interface RootCause {
  primaryCause: string;
  contributingFactors: string[];
  analysisMethod: 'five_why' | 'fishbone' | 'fault_tree' | 'other';
  analysisSummary: string;
}

export interface CorrectiveAction {
  actionId: string;
  actionDescription: string;
  assignedTo: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'verified';
  completionDate?: string;
  verifiedBy?: string;
  verificationDate?: string;
}

export interface SafetyInspection {
  inspectionId: string;
  inspectionType: 'routine' | 'special' | 'regulatory' | 'audit';
  scheduledDate: string;
  completedDate?: string;
  inspector: string;
  location: InspectionLocation;
  checklist: SafetyCheckItem[];
  findings: InspectionFinding[];
  overallScore: number;
  status: 'scheduled' | 'in_progress' | 'completed';
  followUpRequired: boolean;
  createdAt: string;
}

export interface InspectionLocation {
  plant: string;
  building: string;
  areas: string[];
}

export interface SafetyCheckItem {
  itemId: string;
  category: string;
  checkDescription: string;
  compliant: boolean;
  severity: 'low' | 'medium' | 'high';
  notes?: string;
  photoRequired: boolean;
}

export interface InspectionFinding {
  findingId: string;
  findingType: 'violation' | 'observation' | 'best_practice';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  recommendedAction: string;
  regulatoryReference?: string;
}

export interface PPEInventory {
  inventoryId: string;
  itemCode: string;
  itemName: string;
  category: PPECategory;
  size?: string;
  certifications: string[];
  supplier: string;
  unitCost: number;
  quantity: PPEQuantity;
  reorderPoint: number;
  location: string;
  expiryDate?: string;
  status: 'active' | 'low_stock' | 'out_of_stock' | 'expired';
  createdAt: string;
}

export interface PPECategory {
  categoryCode: string;
  categoryName: string;
  type: 'head' | 'eye' | 'hearing' | 'respiratory' | 'hand' | 'foot' | 'body' | 'fall_protection';
}

export interface PPEQuantity {
  onHand: number;
  allocated: number;
  available: number;
  onOrder: number;
}

export interface SafetyTraining {
  trainingId: string;
  trainingName: string;
  trainingType: 'orientation' | 'annual' | 'specialized' | 'refresher';
  requiredFor: string[];
  duration: number;
  validityPeriod: number;
  instructor: string;
  scheduledDate: string;
  location: string;
  maxParticipants: number;
  enrolledParticipants: TrainingParticipant[];
  completionCriteria: string[];
  certificationIssued: boolean;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface TrainingParticipant {
  employeeId: string;
  employeeName: string;
  department: string;
  enrollmentDate: string;
  attendanceStatus: 'enrolled' | 'attended' | 'absent' | 'completed';
  testScore?: number;
  certificationDate?: string;
  certificationExpiry?: string;
}

export interface ManufacturingSettings {
  settingsId: string;
  organizationId: string;
  plantSettings: {
    targetOEE: number;
    minimumAvailability: number;
    maximumDowntime: number;
    qualityTarget: number;
  };
  maintenanceSettings: {
    preventiveMaintenanceFrequency: number;
    criticalEquipmentInspectionDays: number;
    workOrderAutoAssignment: boolean;
    maintenanceBudgetLimit: number;
  };
  safetySettings: {
    incidentReportingDeadline: number;
    inspectionFrequency: number;
    mandatoryTrainingRefresh: number;
    ppeReorderThreshold: number;
  };
  notifications: {
    equipmentDown: boolean;
    maintenanceOverdue: boolean;
    safetyIncident: boolean;
    lowOEE: boolean;
  };
  updatedAt: string;
}

export interface ManufacturingAlert {
  alertId: string;
  alertType: 'equipment' | 'production' | 'safety' | 'maintenance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  relatedEntity: {
    entityType: 'equipment' | 'line' | 'incident' | 'work_order';
    entityId: string;
    entityName: string;
  };
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}
