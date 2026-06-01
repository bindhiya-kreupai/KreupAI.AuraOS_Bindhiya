// @ts-nocheck — Dev/demo seed data, intentionally loose-typed.
// Time Tracking Sample Data
import type { Timesheet, Project, Task, Client, TimeTrackingMetrics, TimeTrackingSettings, TimeEntry } from './types';

export const sampleClients: Client[] = [
  { id: 'client-001', clientCode: 'CLI-001', clientName: 'TechCorp Inc', contactPerson: 'Jane Doe', contactEmail: 'jane@techcorp.com',
    contactPhone: '+1-555-0100', defaultBillingRate: 150, projects: ['proj-001'], isActive: true, createdDate: '2024-01-01' },
  { id: 'client-002', clientCode: 'CLI-002', clientName: 'Innovate Solutions', contactPerson: 'Bob Smith', contactEmail: 'bob@innovate.com',
    defaultBillingRate: 125, projects: ['proj-002'], isActive: true, createdDate: '2024-02-01' }
];

export const sampleProjects: Project[] = [
  {
    id: 'proj-001', projectCode: 'PROJ-001', projectName: 'E-commerce Platform', description: 'Build new e-commerce platform',
    clientId: 'client-001', clientName: 'TechCorp Inc', projectManager: 'pm-001', projectManagerName: 'Alice Johnson',
    status: 'active', startDate: '2024-01-15', estimatedHours: 500, actualHours: 245, remainingHours: 255,
    budgetedAmount: 75000, actualCost: 36750, billingRate: 150, isBillable: true,
    teamMembers: [
      { id: 'tm-001', projectId: 'proj-001', employeeId: 'emp-001', employeeName: 'John Smith', role: 'Developer',
        allocatedHours: 200, actualHours: 120, billingRate: 150, joinedDate: '2024-01-15', isActive: true }
    ],
    tasks: [], milestones: [], tags: ['web', 'ecommerce'], createdBy: 'pm-001', createdDate: '2024-01-15', lastModified: '2024-12-10'
  },
  {
    id: 'proj-002', projectCode: 'PROJ-002', projectName: 'Mobile App Development', description: 'iOS and Android mobile app',
    clientId: 'client-002', clientName: 'Innovate Solutions', projectManager: 'pm-001', projectManagerName: 'Alice Johnson',
    status: 'active', startDate: '2024-02-01', estimatedHours: 400, actualHours: 180, remainingHours: 220,
    budgetedAmount: 50000, actualCost: 22500, billingRate: 125, isBillable: true,
    teamMembers: [], tasks: [], milestones: [], tags: ['mobile', 'ios', 'android'], createdBy: 'pm-001', createdDate: '2024-02-01', lastModified: '2024-12-10'
  }
];

export const sampleTasks: Task[] = [
  {
    id: 'task-001', taskCode: 'TASK-001', projectId: 'proj-001', taskName: 'Setup Authentication', description: 'Implement user authentication system',
    status: 'completed', priority: 'high', assignedTo: 'emp-001', assignedToName: 'John Smith',
    estimatedHours: 40, actualHours: 35, remainingHours: 0, startDate: '2024-01-15', dueDate: '2024-01-25', completedDate: '2024-01-24',
    dependencies: [], isBillable: true, tags: ['authentication', 'security'], createdBy: 'pm-001', createdDate: '2024-01-15', lastModified: '2024-01-24'
  },
  {
    id: 'task-002', taskCode: 'TASK-002', projectId: 'proj-001', taskName: 'Product Catalog', description: 'Build product catalog module',
    status: 'in_progress', priority: 'high', assignedTo: 'emp-001', assignedToName: 'John Smith',
    estimatedHours: 60, actualHours: 32, remainingHours: 28, startDate: '2024-01-26', dueDate: '2024-02-10',
    dependencies: ['task-001'], isBillable: true, tags: ['catalog', 'products'], createdBy: 'pm-001', createdDate: '2024-01-26', lastModified: '2024-12-10'
  }
];

const sampleEntries: TimeEntry[] = [
  { id: 'entry-001', timesheetId: 'ts-001', date: '2024-12-09', projectId: 'proj-001', projectName: 'E-commerce Platform',
    taskId: 'task-002', taskName: 'Product Catalog', hours: 8, startTime: '09:00', endTime: '17:00',
    entryType: 'regular', billingType: 'billable', description: 'Working on product catalog API', isLocked: false,
    createdDate: '2024-12-09', lastModified: '2024-12-09' },
  { id: 'entry-002', timesheetId: 'ts-001', date: '2024-12-10', projectId: 'proj-001', projectName: 'E-commerce Platform',
    taskId: 'task-002', taskName: 'Product Catalog', hours: 7, startTime: '09:00', endTime: '16:00',
    entryType: 'regular', billingType: 'billable', description: 'Product catalog UI components', isLocked: false,
    createdDate: '2024-12-10', lastModified: '2024-12-10' }
];

export const sampleTimesheets: Timesheet[] = [
  {
    id: 'ts-001', timesheetCode: 'TS-2024-W50-001', employeeId: 'emp-001', employeeName: 'John Smith', employeeEmail: 'john.smith@company.com',
    departmentId: 'dept-002', departmentName: 'Engineering', weekStartDate: '2024-12-09', weekEndDate: '2024-12-15',
    status: 'draft', entries: sampleEntries, totalHours: 15, regularHours: 15, overtimeHours: 0, ptoHours: 0,
    billableHours: 15, nonBillableHours: 0, createdDate: '2024-12-09', lastModified: '2024-12-10'
  }
];

export const sampleMetrics: TimeTrackingMetrics = {
  totalHoursThisWeek: 38, totalHoursThisMonth: 152, totalHoursThisYear: 1850,
  billableHoursThisWeek: 32, billableHoursThisMonth: 128, billableHoursThisYear: 1520,
  utilizationRate: 82.5, averageHoursPerDay: 7.6, overtimeHoursThisMonth: 8,
  pendingTimesheets: 5, rejectedTimesheets: 2,
  hoursByProject: [
    { projectId: 'proj-001', projectName: 'E-commerce Platform', hours: 245 },
    { projectId: 'proj-002', projectName: 'Mobile App Development', hours: 180 }
  ],
  hoursByClient: [
    { clientId: 'client-001', clientName: 'TechCorp Inc', hours: 245 },
    { clientId: 'client-002', clientName: 'Innovate Solutions', hours: 180 }
  ],
  hoursByEmployee: [
    { employeeId: 'emp-001', employeeName: 'John Smith', hours: 152, billableHours: 128 }
  ],
  topProjects: [
    { projectId: 'proj-001', projectName: 'E-commerce Platform', hours: 245, revenue: 36750 }
  ],
  utilizationTrend: [
    { week: '2024-W48', hours: 40, utilizationRate: 100 },
    { week: '2024-W49', hours: 38, utilizationRate: 95 }
  ]
};

export const sampleSettings: TimeTrackingSettings = {
  enableTimesheets: true, timesheetFrequency: 'weekly', weekStartDay: 'monday', requireApproval: true, approvalLevels: 1,
  enableProjects: true, enableTasks: true, enableActivities: true, enableBilling: true, defaultBillingRate: 100,
  enableTimer: true, enableMobileApp: true, enableGeolocation: false, autoSubmitTimesheets: false,
  sendReminderEmails: true, reminderDaysBefore: 2, lockPreviousPeriods: true, lockAfterDays: 7,
  notificationEmail: 'timetracking@company.com'
};

export const timeTrackingData = {
  timesheets: sampleTimesheets, projects: sampleProjects, tasks: sampleTasks, clients: sampleClients,
  metrics: sampleMetrics, settings: sampleSettings
};
