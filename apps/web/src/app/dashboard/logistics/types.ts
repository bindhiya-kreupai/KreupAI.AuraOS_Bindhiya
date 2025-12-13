export type DriverStatus = 'active' | 'inactive' | 'suspended' | 'terminated';
export type LicenseClass = 'A' | 'B' | 'C';
export type EndorsementType = 'H' | 'N' | 'P' | 'S' | 'T' | 'X';
export type IncidentSeverity = 'minor' | 'moderate' | 'serious' | 'critical';
export type InspectionStatus = 'passed' | 'conditional' | 'failed';
export type ShiftType = 'day' | 'night' | 'swing' | 'weekend';

export interface Driver {
  driverId: string;
  employeeId: string;
  employeeName: string;
  email: string;
  phone: string;
  address: DriverAddress;
  license: DriverLicense;
  endorsements: Endorsement[];
  certifications: Certification[];
  medicalCertificate: MedicalCertificate;
  hoursOfService: HoursOfService;
  drivingRecord: DrivingRecord;
  assignedVehicle?: string;
  homeTerminal: string;
  status: DriverStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface DriverAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface DriverLicense {
  licenseNumber: string;
  licenseClass: LicenseClass;
  issueDate: string;
  expiryDate: string;
  issuingState: string;
  restrictions: string[];
  verified: boolean;
  verificationDate?: string;
}

export interface Endorsement {
  endorsementId: string;
  endorsementType: EndorsementType;
  endorsementName: string;
  issueDate: string;
  expiryDate?: string;
  verified: boolean;
}

export interface Certification {
  certificationId: string;
  certificationType: string;
  certificationName: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  certificationNumber?: string;
  verified: boolean;
}

export interface MedicalCertificate {
  certificateId: string;
  examDate: string;
  expiryDate: string;
  examiner: string;
  examinerNumber: string;
  certificateType: 'dot_long_form' | 'dot_short_form';
  restrictions: string[];
  status: 'valid' | 'expired' | 'revoked';
}

export interface HoursOfService {
  currentDutyStatus: 'off_duty' | 'sleeper_berth' | 'driving' | 'on_duty_not_driving';
  hoursAvailable: {
    drive: number;
    shift: number;
    cycle: number;
    break: number;
  };
  violations: HOSViolation[];
  eldDeviceId?: string;
  lastStatusChange: string;
  dailyLogs: DutyStatusLog[];
}

export interface HOSViolation {
  violationId: string;
  violationType: 'drive_time' | 'shift_time' | 'cycle_time' | 'break_time';
  violationDate: string;
  description: string;
  severity: 'warning' | 'minor' | 'major';
  resolved: boolean;
  resolution?: string;
}

export interface DutyStatusLog {
  logId: string;
  date: string;
  entries: DutyStatusEntry[];
  totalDriveTime: number;
  totalOnDutyTime: number;
  totalOffDutyTime: number;
  violations: string[];
  certified: boolean;
  certifiedAt?: string;
}

export interface DutyStatusEntry {
  entryId: string;
  startTime: string;
  endTime: string;
  status: 'off_duty' | 'sleeper_berth' | 'driving' | 'on_duty_not_driving';
  location: string;
  odometer: number;
  notes?: string;
}

export interface DrivingRecord {
  recordId: string;
  totalMiles: number;
  totalHours: number;
  safetyScore: number;
  accidents: Accident[];
  violations: TrafficViolation[];
  inspections: number;
  cleanInspections: number;
  lastUpdated: string;
}

export interface Accident {
  accidentId: string;
  accidentDate: string;
  location: string;
  description: string;
  severity: IncidentSeverity;
  injuries: boolean;
  fatalities: boolean;
  vehicleId: string;
  atFault: boolean;
  dotReportable: boolean;
  insuranceClaim?: string;
}

export interface TrafficViolation {
  violationId: string;
  violationDate: string;
  location: string;
  violationType: string;
  description: string;
  severity: 'warning' | 'minor' | 'major';
  fineAmount?: number;
  pointsAssessed?: number;
  courtDate?: string;
  resolved: boolean;
}

export interface FleetVehicle {
  vehicleId: string;
  vehicleNumber: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  vehicleType: 'tractor' | 'straight_truck' | 'van' | 'trailer';
  licensePlate: string;
  registrationState: string;
  registrationExpiry: string;
  insurancePolicy: InsurancePolicy;
  maintenance: MaintenanceRecord;
  inspections: VehicleInspection[];
  currentDriver?: string;
  homeTerminal: string;
  odometer: number;
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_service';
  createdAt: string;
  updatedAt?: string;
}

export interface InsurancePolicy {
  policyNumber: string;
  provider: string;
  coverageType: string[];
  effectiveDate: string;
  expiryDate: string;
  premium: number;
  deductible: number;
  liabilityLimit: number;
}

export interface MaintenanceRecord {
  lastServiceDate: string;
  nextServiceDue: string;
  serviceInterval: number;
  maintenanceHistory: MaintenanceEvent[];
  openWorkOrders: string[];
}

export interface MaintenanceEvent {
  eventId: string;
  eventDate: string;
  eventType: 'preventive' | 'repair' | 'inspection';
  description: string;
  cost: number;
  vendor: string;
  partsReplaced: string[];
  odometer: number;
}

export interface VehicleInspection {
  inspectionId: string;
  inspectionType: 'pre_trip' | 'post_trip' | 'annual' | 'dot';
  inspectionDate: string;
  inspector: string;
  vehicleId: string;
  odometer: number;
  status: InspectionStatus;
  checklist: InspectionItem[];
  defectsFound: Defect[];
  nextInspectionDue?: string;
  certificationNumber?: string;
}

export interface InspectionItem {
  itemId: string;
  category: string;
  item: string;
  result: 'pass' | 'fail' | 'na';
  notes?: string;
}

export interface Defect {
  defectId: string;
  severity: 'minor' | 'major' | 'critical';
  category: string;
  description: string;
  requiresRepair: boolean;
  repairedDate?: string;
  repairedBy?: string;
  cost?: number;
}

export interface SafetyIncident {
  incidentId: string;
  incidentNumber: string;
  incidentType: 'accident' | 'near_miss' | 'injury' | 'property_damage' | 'hazmat';
  incidentDate: string;
  incidentTime: string;
  location: IncidentLocation;
  involvedPersonnel: InvolvedPerson[];
  involvedVehicles: InvolvedVehicle[];
  description: string;
  severity: IncidentSeverity;
  injuries: InjuryReport[];
  propertyDamage: PropertyDamage[];
  investigation: IncidentInvestigation;
  correctiveActions: CorrectiveAction[];
  dotReportable: boolean;
  oshaRecordable: boolean;
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  reportedBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IncidentLocation {
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  weatherConditions?: string;
  roadConditions?: string;
}

export interface InvolvedPerson {
  personId: string;
  role: 'driver' | 'passenger' | 'pedestrian' | 'other_driver' | 'witness';
  name: string;
  employeeId?: string;
  contactInfo?: string;
  injured: boolean;
  statement?: string;
}

export interface InvolvedVehicle {
  vehicleId: string;
  vehicleType: string;
  licensePlate: string;
  damage: string;
  driverId?: string;
  insuranceInfo?: string;
}

export interface InjuryReport {
  injuryId: string;
  personId: string;
  injuryType: string;
  bodyPart: string;
  severity: 'minor' | 'moderate' | 'serious' | 'critical';
  treatment: string;
  hospitalName?: string;
  daysAway?: number;
  restrictedDuty?: number;
}

export interface PropertyDamage {
  damageId: string;
  itemDamaged: string;
  estimatedCost: number;
  owner: string;
  description: string;
}

export interface IncidentInvestigation {
  investigatorId: string;
  investigatorName: string;
  startDate: string;
  completedDate?: string;
  findings: string;
  rootCause?: string;
  contributingFactors: string[];
  evidenceCollected: Evidence[];
  recommendations: string[];
}

export interface Evidence {
  evidenceId: string;
  evidenceType: 'photo' | 'video' | 'document' | 'witness_statement';
  description: string;
  collectedBy: string;
  collectedDate: string;
  url?: string;
}

export interface CorrectiveAction {
  actionId: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedDate?: string;
}

export interface WarehouseWorker {
  workerId: string;
  employeeId: string;
  employeeName: string;
  email: string;
  phone: string;
  position: WarehousePosition;
  certifications: WorkerCertification[];
  shift: ShiftAssignment;
  performance: WorkerPerformance;
  attendance: AttendanceRecord;
  safetyRecord: SafetyRecord;
  status: 'active' | 'on_leave' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

export interface WarehousePosition {
  positionId: string;
  positionTitle: string;
  department: 'receiving' | 'shipping' | 'picking' | 'packing' | 'quality_control' | 'general';
  payGrade: string;
  hourlyRate: number;
  startDate: string;
}

export interface WorkerCertification {
  certificationId: string;
  certificationType: 'forklift' | 'reach_truck' | 'pallet_jack' | 'hazmat' | 'first_aid' | 'other';
  certificationName: string;
  issueDate: string;
  expiryDate: string;
  certifyingOrganization: string;
  certificationNumber: string;
  status: 'valid' | 'expired' | 'suspended';
}

export interface ShiftAssignment {
  assignmentId: string;
  shiftType: ShiftType;
  schedule: ShiftSchedule;
  overtime: OvertimeRecord;
  coverage: CoverageInfo;
}

export interface ShiftSchedule {
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  breakTimes: BreakPeriod[];
}

export interface BreakPeriod {
  breakType: 'meal' | 'rest';
  startTime: string;
  duration: number;
}

export interface OvertimeRecord {
  weeklyHours: number;
  overtimeHours: number;
  yearToDateOT: number;
  approved: boolean;
  approvedBy?: string;
}

export interface CoverageInfo {
  requiredStaff: number;
  actualStaff: number;
  coveragePercentage: number;
  shortages: string[];
}

export interface WorkerPerformance {
  performanceId: string;
  period: {
    startDate: string;
    endDate: string;
  };
  productivity: ProductivityMetrics;
  quality: QualityMetrics;
  safety: SafetyMetrics;
  overallRating: number;
  lastReviewDate: string;
}

export interface ProductivityMetrics {
  unitsProcessed: number;
  unitsPerHour: number;
  targetRate: number;
  efficiencyRate: number;
}

export interface QualityMetrics {
  accuracy: number;
  errorRate: number;
  reworkRequired: number;
  customerComplaints: number;
}

export interface SafetyMetrics {
  incidentsReported: number;
  nearMisses: number;
  safetyViolations: number;
  daysWithoutIncident: number;
}

export interface AttendanceRecord {
  totalDaysScheduled: number;
  daysPresent: number;
  daysAbsent: number;
  tardyOccurrences: number;
  attendanceRate: number;
  occurrences: AttendanceOccurrence[];
}

export interface AttendanceOccurrence {
  occurrenceId: string;
  date: string;
  type: 'absent' | 'tardy' | 'early_departure';
  reason?: string;
  approved: boolean;
  points?: number;
}

export interface SafetyRecord {
  totalIncidents: number;
  recordableIncidents: number;
  lostTimeIncidents: number;
  restrictedDutyIncidents: number;
  safetyCertifications: string[];
  lastSafetyTraining: string;
  nextSafetyTrainingDue: string;
}

export interface LogisticsSettings {
  settingsId: string;
  organizationId: string;
  driverSettings: {
    hosComplianceRequired: boolean;
    eldMandatory: boolean;
    medicalCertificateRenewalDays: number;
    licenseExpiryWarningDays: number;
  };
  fleetSettings: {
    inspectionFrequency: number;
    maintenanceIntervalMiles: number;
    insuranceRenewalWarningDays: number;
    safetyScoreThreshold: number;
  };
  warehouseSettings: {
    certificationRenewalDays: number;
    maxOvertimeHoursWeekly: number;
    minimumStaffingLevel: number;
    attendanceOccurrenceLimit: number;
  };
  notifications: {
    licenseExpiring: boolean;
    medicalExpiring: boolean;
    hosViolation: boolean;
    safetyIncident: boolean;
    certificationExpiring: boolean;
  };
  updatedAt: string;
}

export interface LogisticsAlert {
  alertId: string;
  alertType: 'driver' | 'fleet' | 'safety' | 'warehouse';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  relatedEntity: {
    entityType: 'driver' | 'vehicle' | 'incident' | 'worker';
    entityId: string;
    entityName: string;
  };
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}
