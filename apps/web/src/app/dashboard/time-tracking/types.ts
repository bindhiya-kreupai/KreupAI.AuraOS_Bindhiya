// Time Tracking Module Types

export type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
export type EntryType = 'regular' | 'overtime' | 'pto' | 'sick' | 'holiday' | 'unpaid';
export type BillingType = 'billable' | 'non_billable' | 'internal';
export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'cancelled';
export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Timesheet {
  id: string;
  timesheetCode: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  departmentId: string;
  departmentName: string;
  weekStartDate: string;
  weekEndDate: string;
  status: TimesheetStatus;
  entries: TimeEntry[];
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  ptoHours: number;
  billableHours: number;
  nonBillableHours: number;
  submittedDate?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedDate?: string;
  rejectedReason?: string;
  notes?: string;
  createdDate: string;
  lastModified: string;
}

export interface TimeEntry {
  id: string;
  timesheetId: string;
  date: string;
  projectId?: string;
  projectName?: string;
  taskId?: string;
  taskName?: string;
  activityId?: string;
  activityName?: string;
  hours: number;
  startTime?: string;
  endTime?: string;
  entryType: EntryType;
  billingType: BillingType;
  description: string;
  isLocked: boolean;
  createdDate: string;
  lastModified: string;
}

export interface Project {
  id: string;
  projectCode: string;
  projectName: string;
  description: string;
  clientId?: string;
  clientName?: string;
  projectManager: string;
  projectManagerName: string;
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  estimatedHours: number;
  actualHours: number;
  remainingHours: number;
  budgetedAmount?: number;
  actualCost?: number;
  billingRate?: number;
  isBillable: boolean;
  teamMembers: ProjectMember[];
  tasks: Task[];
  milestones: Milestone[];
  tags: string[];
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  employeeId: string;
  employeeName: string;
  role: string;
  allocatedHours?: number;
  actualHours: number;
  billingRate?: number;
  joinedDate: string;
  leftDate?: string;
  isActive: boolean;
}

export interface Task {
  id: string;
  taskCode: string;
  projectId: string;
  taskName: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  assignedToName?: string;
  estimatedHours: number;
  actualHours: number;
  remainingHours: number;
  startDate?: string;
  dueDate?: string;
  completedDate?: string;
  parentTaskId?: string;
  dependencies: string[];
  isBillable: boolean;
  tags: string[];
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  milestoneName: string;
  description: string;
  dueDate: string;
  completedDate?: string;
  status: 'pending' | 'completed' | 'delayed';
  deliverables: string[];
  isCompleted: boolean;
}

export interface Activity {
  id: string;
  activityCode: string;
  activityName: string;
  description: string;
  category: string;
  isBillable: boolean;
  defaultBillingRate?: number;
  isActive: boolean;
}

export interface Client {
  id: string;
  clientCode: string;
  clientName: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  billingAddress?: string;
  defaultBillingRate?: number;
  projects: string[];
  isActive: boolean;
  createdDate: string;
}

export interface TimesheetApproval {
  id: string;
  timesheetId: string;
  approverLevel: number;
  approverId: string;
  approverName: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedDate?: string;
  comments?: string;
  rejectionReason?: string;
}

export interface TimeOffRequest {
  id: string;
  requestCode: string;
  employeeId: string;
  employeeName: string;
  timeOffType: EntryType;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalHours: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  createdDate: string;
}

export interface BillingReport {
  id: string;
  reportCode: string;
  reportName: string;
  periodStart: string;
  periodEnd: string;
  clientId?: string;
  projectId?: string;
  billableHours: number;
  billingRate: number;
  totalAmount: number;
  entries: BillingEntry[];
  generatedBy: string;
  generatedDate: string;
  status: 'draft' | 'sent' | 'paid';
  invoiceNumber?: string;
  invoiceDate?: string;
  paidDate?: string;
}

export interface BillingEntry {
  employeeId: string;
  employeeName: string;
  projectId: string;
  projectName: string;
  taskId?: string;
  taskName?: string;
  date: string;
  hours: number;
  billingRate: number;
  amount: number;
  description: string;
}

export interface TimeTrackingPolicy {
  id: string;
  policyName: string;
  description: string;
  isActive: boolean;
  requireTimesheetApproval: boolean;
  approvalLevels: number;
  timesheetFrequency: 'daily' | 'weekly' | 'bi_weekly' | 'monthly';
  submissionDeadline: number;
  allowFutureEntries: boolean;
  maxFutureDays: number;
  allowBackdatedEntries: boolean;
  maxBackdatedDays: number;
  minimumHoursPerEntry: number;
  maximumHoursPerDay: number;
  requireProjectForBillable: boolean;
  requireTaskForBillable: boolean;
  requireDescription: boolean;
  allowOverlappingEntries: boolean;
  roundingIncrement: number;
  overtimeThreshold: number;
  createdBy: string;
  createdDate: string;
}

export interface TimeTrackingMetrics {
  totalHoursThisWeek: number;
  totalHoursThisMonth: number;
  totalHoursThisYear: number;
  billableHoursThisWeek: number;
  billableHoursThisMonth: number;
  billableHoursThisYear: number;
  utilizationRate: number;
  averageHoursPerDay: number;
  overtimeHoursThisMonth: number;
  pendingTimesheets: number;
  rejectedTimesheets: number;
  hoursByProject: { projectId: string; projectName: string; hours: number }[];
  hoursByClient: { clientId: string; clientName: string; hours: number }[];
  hoursByEmployee: { employeeId: string; employeeName: string; hours: number; billableHours: number }[];
  topProjects: { projectId: string; projectName: string; hours: number; revenue: number }[];
  utilizationTrend: { week: string; hours: number; utilizationRate: number }[];
}

export interface TimeTrackingSettings {
  enableTimesheets: boolean;
  timesheetFrequency: 'daily' | 'weekly' | 'bi_weekly' | 'monthly';
  weekStartDay: 'monday' | 'sunday';
  requireApproval: boolean;
  approvalLevels: number;
  enableProjects: boolean;
  enableTasks: boolean;
  enableActivities: boolean;
  enableBilling: boolean;
  defaultBillingRate: number;
  enableTimer: boolean;
  enableMobileApp: boolean;
  enableGeolocation: boolean;
  autoSubmitTimesheets: boolean;
  sendReminderEmails: boolean;
  reminderDaysBefore: number;
  lockPreviousPeriods: boolean;
  lockAfterDays: number;
  notificationEmail: string;
}

export interface TimerSession {
  id: string;
  employeeId: string;
  projectId?: string;
  taskId?: string;
  activityId?: string;
  description: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  isRunning: boolean;
  createdDate: string;
}

export interface TimeReport {
  id: string;
  reportType: 'employee' | 'project' | 'client' | 'department' | 'billing';
  reportName: string;
  periodStart: string;
  periodEnd: string;
  filters: { [key: string]: any };
  data: any[];
  totalHours: number;
  billableHours: number;
  totalRevenue?: number;
  generatedBy: string;
  generatedDate: string;
  fileUrl?: string;
}
