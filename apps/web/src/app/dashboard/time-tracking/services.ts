// Time Tracking Services
import type { Timesheet, TimeEntry, Project, Task, Client, TimeTrackingMetrics, TimeTrackingSettings, TimerSession } from './types';

const STORAGE_KEYS = {
  TIMESHEETS: 'timesheets',
  PROJECTS: 'time_projects',
  TASKS: 'time_tasks',
  CLIENTS: 'time_clients',
  TIMERS: 'time_timers',
  METRICS: 'time_metrics',
  SETTINGS: 'time_settings',
};

export class TimesheetService {
  static async getTimesheets(filters?: { employeeId?: string; status?: string; weekStart?: string }): Promise<Timesheet[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.TIMESHEETS);
    let timesheets: Timesheet[] = data ? JSON.parse(data) : [];
    if (filters) {
      if (filters.employeeId) timesheets = timesheets.filter(t => t.employeeId === filters.employeeId);
      if (filters.status) timesheets = timesheets.filter(t => t.status === filters.status);
      if (filters.weekStart) timesheets = timesheets.filter(t => t.weekStartDate === filters.weekStart);
    }
    return timesheets;
  }

  static async getTimesheetById(id: string): Promise<Timesheet | null> {
    const timesheets = await this.getTimesheets();
    return timesheets.find(t => t.id === id) || null;
  }

  static async createTimesheet(timesheet: Timesheet): Promise<Timesheet> {
    // TODO: Replace with actual API call
    const timesheets = await this.getTimesheets();
    timesheets.push(timesheet);
    localStorage.setItem(STORAGE_KEYS.TIMESHEETS, JSON.stringify(timesheets));
    return timesheet;
  }

  static async updateTimesheet(id: string, updates: Partial<Timesheet>): Promise<Timesheet> {
    // TODO: Replace with actual API call
    const timesheets = await this.getTimesheets();
    const index = timesheets.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Timesheet not found');
    timesheets[index] = { ...timesheets[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.TIMESHEETS, JSON.stringify(timesheets));
    return timesheets[index];
  }

  static async submitTimesheet(id: string): Promise<Timesheet> {
    return this.updateTimesheet(id, { status: 'submitted', submittedDate: new Date().toISOString() });
  }

  static async approveTimesheet(id: string, approverId: string, approverName: string): Promise<Timesheet> {
    return this.updateTimesheet(id, {
      status: 'approved',
      approvedBy: approverId,
      approvedByName: approverName,
      approvedDate: new Date().toISOString()
    });
  }

  static async rejectTimesheet(id: string, approverId: string, reason: string): Promise<Timesheet> {
    return this.updateTimesheet(id, { status: 'rejected', approvedBy: approverId, rejectedReason: reason });
  }

  static async addEntry(timesheetId: string, entry: TimeEntry): Promise<Timesheet> {
    const timesheet = await this.getTimesheetById(timesheetId);
    if (!timesheet) throw new Error('Timesheet not found');
    timesheet.entries.push(entry);
    this.recalculateTotals(timesheet);
    return this.updateTimesheet(timesheetId, timesheet);
  }

  static async updateEntry(timesheetId: string, entryId: string, updates: Partial<TimeEntry>): Promise<Timesheet> {
    const timesheet = await this.getTimesheetById(timesheetId);
    if (!timesheet) throw new Error('Timesheet not found');
    const entryIndex = timesheet.entries.findIndex(e => e.id === entryId);
    if (entryIndex === -1) throw new Error('Entry not found');
    timesheet.entries[entryIndex] = { ...timesheet.entries[entryIndex], ...updates, lastModified: new Date().toISOString() };
    this.recalculateTotals(timesheet);
    return this.updateTimesheet(timesheetId, timesheet);
  }

  static async deleteEntry(timesheetId: string, entryId: string): Promise<Timesheet> {
    const timesheet = await this.getTimesheetById(timesheetId);
    if (!timesheet) throw new Error('Timesheet not found');
    timesheet.entries = timesheet.entries.filter(e => e.id !== entryId);
    this.recalculateTotals(timesheet);
    return this.updateTimesheet(timesheetId, timesheet);
  }

  private static recalculateTotals(timesheet: Timesheet): void {
    timesheet.totalHours = timesheet.entries.reduce((sum, e) => sum + e.hours, 0);
    timesheet.regularHours = timesheet.entries.filter(e => e.entryType === 'regular').reduce((sum, e) => sum + e.hours, 0);
    timesheet.overtimeHours = timesheet.entries.filter(e => e.entryType === 'overtime').reduce((sum, e) => sum + e.hours, 0);
    timesheet.ptoHours = timesheet.entries.filter(e => e.entryType === 'pto').reduce((sum, e) => sum + e.hours, 0);
    timesheet.billableHours = timesheet.entries.filter(e => e.billingType === 'billable').reduce((sum, e) => sum + e.hours, 0);
    timesheet.nonBillableHours = timesheet.entries.filter(e => e.billingType === 'non_billable').reduce((sum, e) => sum + e.hours, 0);
  }
}

export class ProjectService {
  static async getProjects(filters?: { status?: string; clientId?: string }): Promise<Project[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    let projects: Project[] = data ? JSON.parse(data) : [];
    if (filters) {
      if (filters.status) projects = projects.filter(p => p.status === filters.status);
      if (filters.clientId) projects = projects.filter(p => p.clientId === filters.clientId);
    }
    return projects;
  }

  static async createProject(project: Project): Promise<Project> {
    // TODO: Replace with actual API call
    const projects = await this.getProjects();
    projects.push(project);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    return project;
  }

  static async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    // TODO: Replace with actual API call
    const projects = await this.getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Project not found');
    projects[index] = { ...projects[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    return projects[index];
  }

  static async deleteProject(id: string): Promise<void> {
    // TODO: Replace with actual API call
    const projects = await this.getProjects();
    const filtered = projects.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
  }
}

export class TaskService {
  static async getTasks(projectId?: string): Promise<Task[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    let tasks: Task[] = data ? JSON.parse(data) : [];
    if (projectId) tasks = tasks.filter(t => t.projectId === projectId);
    return tasks;
  }

  static async createTask(task: Task): Promise<Task> {
    // TODO: Replace with actual API call
    const tasks = await this.getTasks();
    tasks.push(task);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    return task;
  }

  static async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    // TODO: Replace with actual API call
    const tasks = await this.getTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Task not found');
    tasks[index] = { ...tasks[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    return tasks[index];
  }

  static async deleteTask(id: string): Promise<void> {
    // TODO: Replace with actual API call
    const tasks = await this.getTasks();
    const filtered = tasks.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(filtered));
  }
}

export class ClientService {
  static async getClients(): Promise<Client[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return data ? JSON.parse(data) : [];
  }

  static async createClient(client: Client): Promise<Client> {
    // TODO: Replace with actual API call
    const clients = await this.getClients();
    clients.push(client);
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    return client;
  }

  static async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    // TODO: Replace with actual API call
    const clients = await this.getClients();
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Client not found');
    clients[index] = { ...clients[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    return clients[index];
  }
}

export class TimerService {
  static async getTimers(employeeId?: string): Promise<TimerSession[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.TIMERS);
    let timers: TimerSession[] = data ? JSON.parse(data) : [];
    if (employeeId) timers = timers.filter(t => t.employeeId === employeeId);
    return timers;
  }

  static async startTimer(timer: TimerSession): Promise<TimerSession> {
    // TODO: Replace with actual API call
    const timers = await this.getTimers();
    timers.push(timer);
    localStorage.setItem(STORAGE_KEYS.TIMERS, JSON.stringify(timers));
    return timer;
  }

  static async stopTimer(id: string): Promise<TimerSession> {
    // TODO: Replace with actual API call
    const timers = await this.getTimers();
    const index = timers.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Timer not found');
    const endTime = new Date().toISOString();
    const startTime = new Date(timers[index].startTime);
    const duration = (new Date(endTime).getTime() - startTime.getTime()) / 1000 / 60 / 60;
    timers[index] = { ...timers[index], endTime, duration, isRunning: false };
    localStorage.setItem(STORAGE_KEYS.TIMERS, JSON.stringify(timers));
    return timers[index];
  }
}

export class TimeTrackingAnalyticsService {
  static async getMetrics(): Promise<TimeTrackingMetrics> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.METRICS);
    return data ? JSON.parse(data) : {
      totalHoursThisWeek: 0,
      totalHoursThisMonth: 0,
      totalHoursThisYear: 0,
      billableHoursThisWeek: 0,
      billableHoursThisMonth: 0,
      billableHoursThisYear: 0,
      utilizationRate: 0,
      averageHoursPerDay: 0,
      overtimeHoursThisMonth: 0,
      pendingTimesheets: 0,
      rejectedTimesheets: 0,
      hoursByProject: [],
      hoursByClient: [],
      hoursByEmployee: [],
      topProjects: [],
      utilizationTrend: []
    };
  }
}

export class TimeTrackingSettingsService {
  static async getSettings(): Promise<TimeTrackingSettings> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      enableTimesheets: true,
      timesheetFrequency: 'weekly',
      weekStartDay: 'monday',
      requireApproval: true,
      approvalLevels: 1,
      enableProjects: true,
      enableTasks: true,
      enableActivities: true,
      enableBilling: true,
      defaultBillingRate: 100,
      enableTimer: true,
      enableMobileApp: true,
      enableGeolocation: false,
      autoSubmitTimesheets: false,
      sendReminderEmails: true,
      reminderDaysBefore: 2,
      lockPreviousPeriods: true,
      lockAfterDays: 7,
      notificationEmail: 'timetracking@company.com'
    };
  }

  static async updateSettings(updates: Partial<TimeTrackingSettings>): Promise<TimeTrackingSettings> {
    // TODO: Replace with actual API call
    const settings = await this.getSettings();
    const updated = { ...settings, ...updates };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }
}
