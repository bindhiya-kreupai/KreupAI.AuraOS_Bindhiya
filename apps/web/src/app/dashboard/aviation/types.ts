/**
 * Aviation Module - Type Definitions
 * Comprehensive types for Cabin Crew, Pilot Training, and Ground Operations
 */

// ==================== Cabin Crew Types ====================

export type CrewMemberType =
  | 'flight_attendant'
  | 'senior_flight_attendant'
  | 'purser'
  | 'cabin_director';
export type CrewStatus = 'active' | 'on_leave' | 'medical_hold' | 'training' | 'inactive';
export type DutyStatus = 'available' | 'on_duty' | 'in_flight' | 'rest' | 'standby' | 'off_duty';
export type MedicalClass = 'class_1' | 'class_2' | 'class_3';
export type FlightPosition = 'forward' | 'mid' | 'aft' | 'galley' | 'door_operator';

export interface CrewMemberProfile {
  crewId: string;
  employeeId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    passportNumber: string;
    passportExpiry: string;
    homeBase: string;
    email: string;
    phone: string;
    emergencyContact: EmergencyContact;
  };
  crewType: CrewMemberType;
  seniority: {
    hireDate: string;
    seniorityNumber: number;
    yearsOfService: number;
  };
  qualifications: CrewQualification[];
  languages: Language[];
  certifications: CrewCertification[];
  medicalStatus: MedicalStatus;
  dutyStatus: DutyStatus;
  currentAssignment?: FlightAssignment;
  preferences: CrewPreferences;
  performanceRating?: PerformanceRating;
  status: CrewStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface CrewQualification {
  qualificationId: string;
  qualificationType: 'aircraft_type' | 'service_type' | 'safety' | 'special';
  name: string;
  aircraftType?: string;
  issueDate: string;
  expiryDate: string;
  certifyingAuthority: string;
  status: 'valid' | 'expiring_soon' | 'expired' | 'suspended';
  documents: QualificationDocument[];
}

export interface QualificationDocument {
  documentId: string;
  documentType: string;
  documentNumber: string;
  issuedBy: string;
  issueDate: string;
  expiryDate?: string;
  fileUrl?: string;
}

export interface Language {
  languageCode: string;
  languageName: string;
  proficiencyLevel: 'basic' | 'intermediate' | 'advanced' | 'native';
  certified: boolean;
  certificationDate?: string;
  certificationExpiry?: string;
}

export interface CrewCertification {
  certificationId: string;
  certificationType: 'safety' | 'security' | 'medical' | 'service' | 'regulatory';
  certificationName: string;
  certificationBody: string;
  certificationNumber: string;
  issueDate: string;
  expiryDate: string;
  renewalRequired: boolean;
  nextRenewalDate?: string;
  status: 'valid' | 'expiring_soon' | 'expired';
  documents: string[];
}

export interface MedicalStatus {
  medicalId: string;
  medicalClass: MedicalClass;
  examDate: string;
  expiryDate: string;
  examiner: string;
  examinerLicense: string;
  restrictions?: string[];
  fitnessStatus: 'fit' | 'fit_with_restrictions' | 'unfit' | 'pending_review';
  nextExamDate: string;
  vaccinationStatus: VaccinationStatus;
}

export interface VaccinationStatus {
  yellowFever?: { date: string; expiryDate: string };
  covid19?: { doses: number; lastDoseDate: string; boosterDate?: string };
  hepatitisB?: { date: string; status: string };
  other?: { name: string; date: string; status: string }[];
}

export interface FlightAssignment {
  assignmentId: string;
  flightNumber: string;
  flightDate: string;
  departure: AirportInfo;
  arrival: AirportInfo;
  aircraftType: string;
  aircraftRegistration: string;
  position: FlightPosition;
  scheduledDutyStart: string;
  scheduledDutyEnd: string;
  actualDutyStart?: string;
  actualDutyEnd?: string;
  status: 'scheduled' | 'checked_in' | 'boarding' | 'in_flight' | 'completed' | 'cancelled';
  crewComplement: CrewComplement;
  briefingTime: string;
  briefingLocation: string;
}

export interface AirportInfo {
  airportCode: string;
  airportName: string;
  city: string;
  country: string;
  scheduledTime: string;
  actualTime?: string;
  gate?: string;
  terminal?: string;
}

export interface CrewComplement {
  cabinDirector: string;
  pursers: string[];
  flightAttendants: string[];
  totalCrew: number;
}

export interface CrewPreferences {
  preferredBases: string[];
  preferredAircraftTypes: string[];
  maxFlightsPerMonth?: number;
  daysOffPreferred?: number[];
  bidPreferences: BidPreference[];
}

export interface BidPreference {
  preferenceType: 'route' | 'layover' | 'aircraft' | 'position' | 'time_of_day';
  value: string;
  priority: number;
}

export interface PerformanceRating {
  ratingId: string;
  reviewPeriod: { startDate: string; endDate: string };
  overallRating: number; // 1-5
  competencies: CompetencyRating[];
  strengths: string[];
  areasForImprovement: string[];
  commendations: number;
  incidents: number;
  customerFeedbackScore?: number;
  reviewedBy: string;
  reviewDate: string;
  comments?: string;
}

export interface CompetencyRating {
  competencyName: string;
  rating: number; // 1-5
  comments?: string;
}

export interface DutyTime {
  dutyTimeId: string;
  crewId: string;
  flightNumber: string;
  dutyDate: string;
  dutyPeriod: {
    reportTime: string;
    releaseTime: string;
    totalDutyHours: number;
  };
  flightTime: {
    blockOff: string;
    blockOn: string;
    totalFlightHours: number;
  };
  sectors: number;
  regulations: {
    maxDutyHours: number;
    maxFlightHours: number;
    minRestHours: number;
    regulatoryBody: string; // e.g., FAA, EASA, ICAO
  };
  compliance: {
    withinLimits: boolean;
    violations?: string[];
    warnings?: string[];
  };
  fatigueSelfAssessment?: FatigueAssessment;
  createdAt: string;
}

export interface FatigueAssessment {
  assessmentId: string;
  assessmentTime: string;
  fatigueLevel: 1 | 2 | 3 | 4 | 5; // 1 = alert, 5 = extremely fatigued
  sleepHoursLast24: number;
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';
  concerns?: string;
  reportedBy: string;
}

export interface RestPeriod {
  restPeriodId: string;
  crewId: string;
  restType: 'minimum_rest' | 'layover' | 'scheduled_days_off' | 'extended_rest';
  startTime: string;
  endTime: string;
  durationHours: number;
  location: {
    airportCode: string;
    city: string;
    country: string;
    accommodation?: AccommodationInfo;
  };
  requiredHours: number;
  actualHours: number;
  compliant: boolean;
  nextDutyTime?: string;
  createdAt: string;
}

export interface AccommodationInfo {
  hotelName: string;
  hotelAddress: string;
  confirmationNumber: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  transportProvided: boolean;
}

// ==================== Pilot Training Types ====================

export type TrainingType = 'initial' | 'recurrent' | 'upgrade' | 'transition' | 'proficiency_check';
export type TrainingStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'deferred'
  | 'cancelled';
export type SimulatorLevel = 'level_a' | 'level_b' | 'level_c' | 'level_d' | 'ftd';
export type PilotRank =
  | 'student_pilot'
  | 'first_officer'
  | 'senior_first_officer'
  | 'captain'
  | 'training_captain'
  | 'check_airman';

export interface PilotProfile {
  pilotId: string;
  employeeId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    email: string;
    phone: string;
  };
  rank: PilotRank;
  license: PilotLicense;
  typeRatings: TypeRating[];
  medicalCertificate: PilotMedical;
  flightHours: FlightHours;
  trainingRecords: TrainingRecord[];
  checkResults: ProficiencyCheck[];
  currentQualifications: Qualification[];
  restrictions?: string[];
  status: 'active' | 'training' | 'medical_hold' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

export interface PilotLicense {
  licenseNumber: string;
  licenseType: 'PPL' | 'CPL' | 'ATPL' | 'MPL';
  issuingAuthority: string;
  issueDate: string;
  expiryDate?: string;
  ratings: string[];
  endorsements: string[];
}

export interface TypeRating {
  ratingId: string;
  aircraftType: string;
  aircraftCategory: 'single_engine' | 'multi_engine' | 'jet' | 'turboprop';
  issueDate: string;
  expiryDate?: string;
  restrictions?: string[];
  status: 'valid' | 'expired' | 'suspended';
  seats: 'left_seat' | 'right_seat' | 'both';
}

export interface PilotMedical {
  medicalId: string;
  medicalClass: MedicalClass;
  examDate: string;
  expiryDate: string;
  examiner: string;
  restrictions?: string[];
  fitnessStatus: 'fit' | 'fit_with_restrictions' | 'unfit';
  nextExamDate: string;
}

export interface FlightHours {
  totalHours: number;
  pic: number; // Pilot in Command
  sic: number; // Second in Command
  multiEngine: number;
  night: number;
  instrument: number;
  simulator: number;
  last30Days: number;
  last90Days: number;
  last12Months: number;
  byAircraftType: { [aircraftType: string]: number };
  lastUpdated: string;
}

export interface TrainingRecord {
  recordId: string;
  trainingType: TrainingType;
  trainingName: string;
  aircraftType: string;
  trainingProvider: string;
  scheduledDate: string;
  completionDate?: string;
  duration: {
    groundSchoolHours: number;
    simulatorHours: number;
    flightHours: number;
  };
  syllabus: TrainingSyllabus;
  progress: TrainingProgress;
  assessments: TrainingAssessment[];
  instructor: InstructorInfo;
  status: TrainingStatus;
  result?: 'pass' | 'fail' | 'incomplete';
  certification?: CertificationInfo;
  comments?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TrainingSyllabus {
  syllabusId: string;
  syllabusName: string;
  modules: TrainingModule[];
  totalHours: number;
  requiredPassScore: number;
}

export interface TrainingModule {
  moduleId: string;
  moduleName: string;
  moduleType: 'ground_school' | 'simulator' | 'flight' | 'e_learning';
  topics: string[];
  duration: number;
  objectives: string[];
  requiredScore?: number;
  completed: boolean;
  score?: number;
  completionDate?: string;
}

export interface TrainingProgress {
  overallCompletion: number; // percentage
  modulesCompleted: number;
  modulesTotal: number;
  hoursCompleted: {
    groundSchool: number;
    simulator: number;
    flight: number;
  };
  currentModule?: string;
  nextScheduledSession?: string;
}

export interface TrainingAssessment {
  assessmentId: string;
  assessmentType: 'written' | 'oral' | 'practical' | 'simulator';
  assessmentName: string;
  assessmentDate: string;
  score: number;
  passingScore: number;
  result: 'pass' | 'fail';
  assessor: string;
  topics: string[];
  strengths?: string[];
  weaknesses?: string[];
  comments?: string;
}

export interface InstructorInfo {
  instructorId: string;
  name: string;
  qualifications: string[];
  rating: number;
}

export interface CertificationInfo {
  certificateNumber: string;
  issueDate: string;
  expiryDate?: string;
  issuingAuthority: string;
  certificateUrl?: string;
}

export interface SimulatorSession {
  sessionId: string;
  pilotId: string;
  aircraftType: string;
  simulatorType: SimulatorLevel;
  simulatorLocation: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number; // in hours
  sessionType: 'training' | 'check' | 'practice' | 'recurrent';
  scenarios: SimulatorScenario[];
  instructor?: string;
  performance: SessionPerformance;
  debriefing?: Debriefing;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface SimulatorScenario {
  scenarioId: string;
  scenarioName: string;
  scenarioType: 'normal' | 'abnormal' | 'emergency';
  description: string;
  objectives: string[];
  conditions: {
    weather?: string;
    time?: string;
    location?: string;
    systemFailures?: string[];
  };
  completed: boolean;
  performance?: ScenarioPerformance;
}

export interface ScenarioPerformance {
  rating: number; // 1-5
  criteriaEvaluated: CriteriaEvaluation[];
  errorsCommitted: string[];
  decisionsCorrect: boolean;
  proceduresFollowed: boolean;
  communicationEffective: boolean;
}

export interface CriteriaEvaluation {
  criterion: string;
  rating: number; // 1-5
  notes?: string;
}

export interface SessionPerformance {
  overallRating: number; // 1-5
  technicalSkills: number; // 1-5
  decisionMaking: number; // 1-5
  situationalAwareness: number; // 1-5
  communication: number; // 1-5
  crm: number; // Crew Resource Management 1-5
  maneuvers: ManeuverEvaluation[];
  systemsKnowledge: number; // 1-5
  emergencyResponse: number; // 1-5
}

export interface ManeuverEvaluation {
  maneuver: string;
  rating: number; // 1-5
  withinLimits: boolean;
  deviations?: string[];
  comments?: string;
}

export interface Debriefing {
  debriefingId: string;
  debriefingDate: string;
  instructor: string;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  nextSessionFocus?: string[];
  instructorComments: string;
  pilotComments?: string;
}

export interface ProficiencyCheck {
  checkId: string;
  pilotId: string;
  checkType: 'line_check' | 'recurrent' | 'upgrade' | 'annual';
  aircraftType: string;
  checkDate: string;
  examiner: ExaminerInfo;
  checklist: ChecklistItem[];
  maneuvers: ManeuverCheck[];
  overallResult: 'satisfactory' | 'unsatisfactory';
  recommendations?: string[];
  nextCheckDue: string;
  certificationIssued?: CertificationInfo;
  createdAt: string;
}

export interface ExaminerInfo {
  examinerId: string;
  name: string;
  designation: string;
  licenseNumber: string;
  qualifications: string[];
}

export interface ChecklistItem {
  itemId: string;
  category: string;
  item: string;
  required: boolean;
  completed: boolean;
  result?: 'satisfactory' | 'unsatisfactory';
  comments?: string;
}

export interface ManeuverCheck {
  maneuver: string;
  category: 'normal' | 'abnormal' | 'emergency';
  performed: boolean;
  result: 'satisfactory' | 'unsatisfactory';
  deviations?: string[];
  comments?: string;
}

export interface Qualification {
  qualificationId: string;
  qualificationType: string;
  description: string;
  issueDate: string;
  expiryDate?: string;
  renewalDate?: string;
  status: 'valid' | 'expiring_soon' | 'expired';
}

// ==================== Ground Operations Types ====================

export type GroundStaffRole =
  | 'ramp_agent'
  | 'baggage_handler'
  | 'pushback_driver'
  | 'refueler'
  | 'aircraft_cleaner'
  | 'cargo_loader'
  | 'supervisor';
export type EquipmentType =
  | 'gpu'
  | 'tug'
  | 'belt_loader'
  | 'fuel_truck'
  | 'catering_truck'
  | 'stairs'
  | 'lavatory_service'
  | 'water_service';
export type OperationStatus = 'scheduled' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';

export interface GroundStaffMember {
  staffId: string;
  employeeId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
  };
  role: GroundStaffRole;
  station: string; // airport code
  shift: ShiftInfo;
  certifications: GroundCertification[];
  equipmentQualifications: EquipmentQualification[];
  safetyRecords: SafetyRecord[];
  performanceMetrics: GroundPerformanceMetrics;
  status: 'active' | 'on_break' | 'off_duty' | 'training' | 'inactive';
  currentAssignment?: TurnaroundAssignment;
  createdAt: string;
  updatedAt?: string;
}

export interface ShiftInfo {
  shiftId: string;
  shiftType: 'morning' | 'afternoon' | 'night' | 'rotating';
  startTime: string;
  endTime: string;
  breakSchedule: BreakPeriod[];
}

export interface BreakPeriod {
  breakType: 'meal' | 'rest';
  startTime: string;
  duration: number; // in minutes
}

export interface GroundCertification {
  certificationId: string;
  certificationType: 'safety' | 'security' | 'dangerous_goods' | 'equipment_operation';
  certificationName: string;
  issueDate: string;
  expiryDate: string;
  certifyingBody: string;
  status: 'valid' | 'expiring_soon' | 'expired';
  renewalRequired: boolean;
}

export interface EquipmentQualification {
  qualificationId: string;
  equipmentType: EquipmentType;
  qualificationDate: string;
  expiryDate?: string;
  qualified: boolean;
  trainingHours: number;
}

export interface SafetyRecord {
  recordId: string;
  recordType: 'incident' | 'accident' | 'near_miss' | 'safety_observation';
  date: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  involvedParties: string[];
  rootCause?: string;
  correctiveActions?: string[];
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  reportedBy: string;
  reportedDate: string;
}

export interface GroundPerformanceMetrics {
  turnaroundsCompleted: number;
  averageTurnaroundTime: number; // in minutes
  onTimePerformance: number; // percentage
  safetyScore: number; // 1-100
  qualityScore: number; // 1-100
  equipmentDamageIncidents: number;
  commendations: number;
  monthlyMetrics: MonthlyMetrics[];
}

export interface MonthlyMetrics {
  month: string;
  year: number;
  turnarounds: number;
  avgTime: number;
  onTimePercent: number;
  incidents: number;
}

export interface TurnaroundAssignment {
  assignmentId: string;
  flightNumber: string;
  aircraftRegistration: string;
  aircraftType: string;
  gate: string;
  scheduledArrival: string;
  scheduledDeparture: string;
  actualArrival?: string;
  actualDeparture?: string;
  turnaroundTime: number; // in minutes
  role: GroundStaffRole;
  tasks: TurnaroundTask[];
  status: OperationStatus;
}

export interface TurnaroundTask {
  taskId: string;
  taskName: string;
  taskCategory: 'safety' | 'servicing' | 'cleaning' | 'loading' | 'inspection';
  priority: 'critical' | 'high' | 'medium' | 'low';
  assignedTo?: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  duration?: number; // in minutes
  status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'skipped';
  checklistItems?: ChecklistItem[];
  notes?: string;
}

export interface GroundEquipment {
  equipmentId: string;
  equipmentType: EquipmentType;
  equipmentName: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  registrationNumber: string;
  station: string; // airport code
  operationalStatus: 'operational' | 'maintenance' | 'out_of_service' | 'retired';
  specifications: EquipmentSpecifications;
  maintenanceSchedule: EquipmentMaintenance;
  usageLog: UsageLogEntry[];
  currentAssignment?: string; // flight number or location
  location: EquipmentLocation;
  inspections: EquipmentInspection[];
  createdAt: string;
  updatedAt?: string;
}

export interface EquipmentSpecifications {
  capacity?: string;
  powerOutput?: string;
  dimensions?: { length: number; width: number; height: number };
  weight?: number;
  fuelType?: string;
  maxSpeed?: number;
  features?: string[];
}

export interface EquipmentMaintenance {
  lastMaintenance: string;
  nextMaintenanceDue: string;
  maintenanceInterval: number; // in hours or days
  maintenanceType: 'hours_based' | 'calendar_based';
  maintenanceProvider: string;
  maintenanceHistory: MaintenanceRecord[];
}

export interface MaintenanceRecord {
  recordId: string;
  maintenanceDate: string;
  maintenanceType: 'routine' | 'corrective' | 'preventive' | 'overhaul';
  workPerformed: string;
  partsReplaced?: PartReplaced[];
  technicianId: string;
  technicianName: string;
  cost: number;
  nextServiceDue?: string;
  notes?: string;
}

export interface PartReplaced {
  partNumber: string;
  partName: string;
  quantity: number;
  serialNumber?: string;
}

export interface UsageLogEntry {
  logId: string;
  operatorId: string;
  operatorName: string;
  flightNumber?: string;
  startTime: string;
  endTime: string;
  duration: number; // in hours
  hoursLogged: number;
  location: string;
  fuelUsed?: number;
  issues?: string[];
  notes?: string;
}

export interface EquipmentLocation {
  zone: string;
  gate?: string;
  parking?: string;
  coordinates?: { latitude: number; longitude: number };
  lastUpdated: string;
}

export interface EquipmentInspection {
  inspectionId: string;
  inspectionDate: string;
  inspectorId: string;
  inspectorName: string;
  inspectionType: 'daily' | 'weekly' | 'monthly' | 'annual' | 'pre_use';
  checklistItems: InspectionChecklistItem[];
  overallCondition: 'excellent' | 'good' | 'fair' | 'poor';
  issuesFound: InspectionIssue[];
  result: 'pass' | 'pass_with_notes' | 'fail';
  nextInspectionDue: string;
  notes?: string;
}

export interface InspectionChecklistItem {
  itemId: string;
  item: string;
  category: string;
  status: 'pass' | 'fail' | 'na';
  notes?: string;
}

export interface InspectionIssue {
  issueId: string;
  severity: 'minor' | 'major' | 'critical';
  description: string;
  action: 'monitor' | 'repair' | 'replace' | 'ground_equipment';
  actionTaken?: string;
  resolvedDate?: string;
}

export interface RampHandlingProcedure {
  procedureId: string;
  procedureName: string;
  aircraftType: string;
  procedureType: 'arrival' | 'departure' | 'transit';
  steps: ProcedureStep[];
  safetyPrecautions: string[];
  requiredEquipment: string[];
  estimatedDuration: number; // in minutes
  certificationRequired?: string[];
  regulatoryReferences?: string[];
  lastUpdated: string;
}

export interface ProcedureStep {
  stepNumber: number;
  stepDescription: string;
  responsibleRole: GroundStaffRole;
  timing: string; // e.g., "Immediately upon arrival", "After chocks in place"
  criticalStep: boolean;
  verificationRequired: boolean;
  dependencies?: number[]; // step numbers that must be completed first
}

export interface SafetyCompliance {
  complianceId: string;
  station: string;
  auditDate: string;
  auditType: 'internal' | 'regulatory' | 'third_party';
  auditor: AuditorInfo;
  areas: ComplianceArea[];
  findings: AuditFinding[];
  overallScore: number; // percentage
  status: 'compliant' | 'minor_issues' | 'major_issues' | 'non_compliant';
  correctiveActions: CorrectiveAction[];
  nextAuditDue: string;
  createdAt: string;
}

export interface AuditorInfo {
  auditorId: string;
  name: string;
  organization: string;
  certification: string;
}

export interface ComplianceArea {
  areaName: string;
  standards: string[];
  score: number; // percentage
  status: 'compliant' | 'non_compliant';
}

export interface AuditFinding {
  findingId: string;
  category: string;
  severity: 'observation' | 'minor' | 'major' | 'critical';
  description: string;
  regulation: string;
  evidence?: string[];
  recommendedAction: string;
  dueDate: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
}

export interface CorrectiveAction {
  actionId: string;
  findingId: string;
  actionDescription: string;
  responsiblePerson: string;
  targetDate: string;
  completionDate?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'verified';
  verification?: VerificationInfo;
}

export interface VerificationInfo {
  verifiedBy: string;
  verificationDate: string;
  effective: boolean;
  notes?: string;
}

// ==================== Common/Shared Types ====================

export interface AviationSettings {
  settingsId: string;
  organizationId: string;
  cabinCrewSettings: {
    maxDutyHours: number;
    minRestHours: number;
    maxFlightDutyPeriod: number;
    maxConsecutiveDutyDays: number;
    fatigueReportingEnabled: boolean;
  };
  pilotTrainingSettings: {
    recurrentTrainingInterval: number; // in months
    simulatorSessionsPerYear: number;
    proficiencyCheckInterval: number; // in months
    minimumFlightHoursPerYear: number;
    trainingRecordRetention: number; // in years
  };
  groundOperationsSettings: {
    turnaroundTargets: { [aircraftType: string]: number }; // in minutes
    safetyAuditFrequency: number; // in months
    equipmentInspectionFrequency: number; // in days
    shiftDuration: number; // in hours
  };
  regulatoryBody: string; // FAA, EASA, ICAO, etc.
  notifications: NotificationSettings;
  updatedAt: string;
}

export interface NotificationSettings {
  certificationExpiry: boolean;
  medicalExpiry: boolean;
  trainingDue: boolean;
  equipmentMaintenance: boolean;
  safetyIncidents: boolean;
  complianceIssues: boolean;
  advanceNoticeDays: number;
}

export interface AuditLog {
  logId: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  module: 'cabin_crew' | 'pilot_training' | 'ground_operations';
  entityType: string;
  entityId: string;
  changes?: { field: string; oldValue: any; newValue: any }[];
  ipAddress?: string;
}

export interface Report {
  reportId: string;
  reportType: string;
  reportName: string;
  generatedBy: string;
  generatedDate: string;
  reportPeriod: { startDate: string; endDate: string };
  filters?: { [key: string]: any };
  data: any;
  format: 'pdf' | 'excel' | 'csv';
  fileUrl?: string;
}

export interface Alert {
  alertId: string;
  alertType:
    | 'certification_expiring'
    | 'medical_expiring'
    | 'training_overdue'
    | 'compliance_issue'
    | 'safety_incident'
    | 'equipment_maintenance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  affectedEntity: {
    entityType: string;
    entityId: string;
    entityName: string;
  };
  actionRequired?: string;
  dueDate?: string;
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
