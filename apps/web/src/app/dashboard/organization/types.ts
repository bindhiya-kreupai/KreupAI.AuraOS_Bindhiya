// Organization Chart Module Types

export type DepartmentType = 'corporate' | 'division' | 'department' | 'team' | 'unit' | 'section';
export type PositionType = 'executive' | 'management' | 'professional' | 'technical' | 'support' | 'entry_level';
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'temporary' | 'intern';
export type PositionStatus = 'active' | 'vacant' | 'pending_approval' | 'frozen' | 'eliminated';
export type RelationshipType = 'direct' | 'dotted_line' | 'functional' | 'matrix';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface OrganizationNode {
  id: string;
  nodeType: 'department' | 'position' | 'employee';
  parentId?: string;
  departmentId?: string;
  positionId?: string;
  employeeId?: string;
  name: string;
  title?: string;
  level: number;
  order: number;
  children: OrganizationNode[];
  isExpanded: boolean;
  metadata?: {
    [key: string]: any;
  };
}

export interface Department {
  id: string;
  departmentCode: string;
  departmentName: string;
  departmentType: DepartmentType;
  description: string;
  parentDepartmentId?: string;
  parentDepartmentName?: string;
  managerId: string;
  managerName: string;
  costCenter: string;
  location: string;
  level: number;
  headcount: DepartmentHeadcount;
  budget?: DepartmentBudget;
  positions: Position[];
  subDepartments: string[];
  isActive: boolean;
  establishedDate: string;
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface DepartmentHeadcount {
  total: number;
  fullTime: number;
  partTime: number;
  contractors: number;
  interns: number;
  approved: number;
  vacant: number;
  target: number;
}

export interface DepartmentBudget {
  fiscalYear: string;
  budgetedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  salaryBudget: number;
  operatingBudget: number;
  lastUpdated: string;
}

export interface Position {
  id: string;
  positionCode: string;
  jobTitle: string;
  positionType: PositionType;
  departmentId: string;
  departmentName: string;
  reportsToPositionId?: string;
  reportsToPositionTitle?: string;
  level: number;
  grade?: string;
  employmentType: EmploymentType;
  status: PositionStatus;
  fte: number;
  location: string;
  costCenter: string;
  salaryRange: SalaryRange;
  currentEmployee?: PositionAssignment;
  responsibilities: string[];
  requirements: PositionRequirements;
  competencies: string[];
  approvalRequired: boolean;
  approvedBy?: string;
  approvedDate?: string;
  effectiveDate: string;
  endDate?: string;
  isRemote: boolean;
  isCritical: boolean;
  succession?: SuccessionInfo;
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface SalaryRange {
  currency: string;
  minSalary: number;
  midSalary: number;
  maxSalary: number;
  targetSalary?: number;
}

export interface PositionRequirements {
  education: string[];
  experience: string;
  skills: string[];
  certifications: string[];
  languages: string[];
}

export interface PositionAssignment {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  startDate: string;
  endDate?: string;
  isPrimary: boolean;
  allocationPercentage: number;
}

export interface SuccessionInfo {
  successors: Successor[];
  readinessLevel: 'ready_now' | 'ready_1_year' | 'ready_2_years' | 'not_ready';
  lastReviewed: string;
}

export interface Successor {
  employeeId: string;
  employeeName: string;
  readiness: 'ready_now' | 'ready_1_year' | 'ready_2_years';
  developmentNeeds: string[];
}

export interface ReportingRelationship {
  id: string;
  relationshipType: RelationshipType;
  subordinateId: string;
  subordinateName: string;
  subordinateTitle: string;
  managerId: string;
  managerName: string;
  managerTitle: string;
  departmentId: string;
  effectiveDate: string;
  endDate?: string;
  isPrimary: boolean;
  notes?: string;
  createdDate: string;
}

export interface OrganizationLevel {
  id: string;
  levelNumber: number;
  levelName: string;
  description: string;
  parentLevelId?: string;
  approvalAuthority?: ApprovalAuthority;
  privileges: string[];
  isActive: boolean;
}

export interface ApprovalAuthority {
  expenseLimit: number;
  hireApproval: boolean;
  budgetApproval: boolean;
  policyApproval: boolean;
}

export interface PositionRequest {
  id: string;
  requestCode: string;
  requestType: 'new_position' | 'position_change' | 'position_elimination';
  departmentId: string;
  departmentName: string;
  positionId?: string;
  requestedPosition: Partial<Position>;
  justification: string;
  businessCase: string;
  estimatedCost: number;
  effectiveDate: string;
  requestedBy: string;
  requestedByName: string;
  status: ApprovalStatus;
  approvalChain: PositionApproval[];
  createdDate: string;
  lastModified: string;
}

export interface PositionApproval {
  approverId: string;
  approverName: string;
  approverTitle: string;
  level: number;
  status: ApprovalStatus;
  approvedDate?: string;
  comments?: string;
}

export interface OrganizationChange {
  id: string;
  changeCode: string;
  changeType: 'restructure' | 'merger' | 'split' | 'relocation' | 'other';
  title: string;
  description: string;
  impactedDepartments: string[];
  impactedPositions: string[];
  impactedEmployees: number;
  effectiveDate: string;
  completionDate?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  changeManager: string;
  changeManagerName: string;
  communicationPlan?: string;
  milestones: ChangeMilestone[];
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface ChangeMilestone {
  id: string;
  milestoneName: string;
  dueDate: string;
  completedDate?: string;
  status: 'pending' | 'completed' | 'delayed';
  assignedTo: string;
}

export interface DepartmentTransfer {
  id: string;
  transferCode: string;
  employeeId: string;
  employeeName: string;
  currentDepartmentId: string;
  currentDepartmentName: string;
  newDepartmentId: string;
  newDepartmentName: string;
  currentPositionId: string;
  newPositionId?: string;
  transferType: 'permanent' | 'temporary' | 'project';
  effectiveDate: string;
  endDate?: string;
  reason: string;
  approvedBy: string;
  approvedByName: string;
  status: ApprovalStatus;
  createdDate: string;
}

export interface OrganizationMetrics {
  totalDepartments: number;
  totalPositions: number;
  filledPositions: number;
  vacantPositions: number;
  totalHeadcount: number;
  fullTimeEmployees: number;
  partTimeEmployees: number;
  contractors: number;
  averageSpanOfControl: number;
  organizationLevels: number;
  departmentsByType: { type: DepartmentType; count: number }[];
  positionsByType: { type: PositionType; count: number }[];
  headcountByDepartment: { departmentId: string; departmentName: string; headcount: number }[];
  headcountByLocation: { location: string; headcount: number }[];
  vacancyRate: number;
  turnoverImpact: number;
  topLevelManagers: number;
  managerToEmployeeRatio: number;
  costCenterDistribution: { costCenter: string; headcount: number; budget: number }[];
  growthTrend: { period: string; headcount: number; positions: number }[];
}

export interface OrganizationSettings {
  enableDepartmentHierarchy: boolean;
  maxOrganizationLevels: number;
  requirePositionApproval: boolean;
  approvalLevels: number;
  allowMatrixReporting: boolean;
  maxReportingRelationships: number;
  enableCostCenters: boolean;
  enableBudgetTracking: boolean;
  enableSuccessionPlanning: boolean;
  autoUpdateOrgChart: boolean;
  showVacantPositions: boolean;
  showContractors: boolean;
  enablePositionVersioning: boolean;
  positionCodeFormat: string;
  departmentCodeFormat: string;
  fiscalYearStart: string;
  defaultCurrency: string;
}

export interface OrgChartView {
  id: string;
  viewName: string;
  viewType: 'hierarchy' | 'department' | 'position' | 'location' | 'custom';
  filters: OrgChartFilter;
  layout: 'vertical' | 'horizontal' | 'compact';
  showPhotos: boolean;
  showVacant: boolean;
  expandLevel: number;
  createdBy: string;
  isDefault: boolean;
}

export interface OrgChartFilter {
  departmentIds?: string[];
  locations?: string[];
  levels?: number[];
  positionTypes?: PositionType[];
  includeContractors?: boolean;
}

export interface PositionHistory {
  id: string;
  positionId: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate?: string;
  departmentId: string;
  departmentName: string;
  title: string;
  level: number;
  salary?: number;
  reasonForChange?: string;
  changedBy: string;
  changedDate: string;
}

export interface SpanOfControl {
  managerId: string;
  managerName: string;
  managerTitle: string;
  directReports: number;
  totalReports: number;
  levels: number;
  departments: number;
  locations: string[];
  isOptimal: boolean;
  recommendation?: string;
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
