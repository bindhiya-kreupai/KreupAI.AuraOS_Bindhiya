// Time Tracking Services
import { APIClient } from '@/lib/api-client';
import type { Timesheet, TimeEntry, Project, Task, Client, TimeTrackingMetrics, TimeTrackingSettings, TimerSession } from './types';

export class TimesheetService {
  static async getTimesheets(filters?: { employeeId?: string; status?: string; weekStart?: string }): Promise<Timesheet[]> {
    return APIClient.get<Timesheet[]>('/time-tracking/timesheets', filters);
  }

  static async getTimesheetById(id: string): Promise<Timesheet | null> {
    return APIClient.get<Timesheet | null>(`/time-tracking/timesheets/${id}`);
  }

  static async createTimesheet(timesheet: Timesheet): Promise<Timesheet> {
    return APIClient.post<Timesheet>('/time-tracking/timesheets', timesheet);
  }

  static async updateTimesheet(id: string, updates: Partial<Timesheet>): Promise<Timesheet> {
    return APIClient.put<Timesheet>(`/time-tracking/timesheets/${id}`, updates);
  }

  static async submitTimesheet(id: string): Promise<Timesheet> {
    return APIClient.post<Timesheet>(`/time-tracking/timesheets/${id}/submit`, {});
  }

  static async approveTimesheet(id: string, approverId: string, approverName: string): Promise<Timesheet> {
    return APIClient.post<Timesheet>(`/time-tracking/timesheets/${id}/approve`, { approverId, approverName });
  }

  static async rejectTimesheet(id: string, approverId: string, reason: string): Promise<Timesheet> {
    return APIClient.post<Timesheet>(`/time-tracking/timesheets/${id}/reject`, { approverId, reason });
  }

  static async addEntry(timesheetId: string, entry: TimeEntry): Promise<Timesheet> {
    return APIClient.post<Timesheet>(`/time-tracking/timesheets/${timesheetId}/entries`, entry);
  }

  static async updateEntry(timesheetId: string, entryId: string, updates: Partial<TimeEntry>): Promise<Timesheet> {
    return APIClient.put<Timesheet>(`/time-tracking/timesheets/${timesheetId}/entries/${entryId}`, updates);
  }

  static async deleteEntry(timesheetId: string, entryId: string): Promise<Timesheet> {
    return APIClient.delete<Timesheet>(`/time-tracking/timesheets/${timesheetId}/entries/${entryId}`);
  }
}

export class ProjectService {
  static async getProjects(filters?: { status?: string; clientId?: string }): Promise<Project[]> {
    return APIClient.get<Project[]>('/time-tracking/projects', filters);
  }

  static async createProject(project: Project): Promise<Project> {
    return APIClient.post<Project>('/time-tracking/projects', project);
  }

  static async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    return APIClient.put<Project>(`/time-tracking/projects/${id}`, updates);
  }

  static async deleteProject(id: string): Promise<void> {
    return APIClient.delete<void>(`/time-tracking/projects/${id}`);
  }
}

export class TaskService {
  static async getTasks(projectId?: string): Promise<Task[]> {
    return APIClient.get<Task[]>('/time-tracking/tasks', projectId ? { projectId } : undefined);
  }

  static async createTask(task: Task): Promise<Task> {
    return APIClient.post<Task>('/time-tracking/tasks', task);
  }

  static async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    return APIClient.put<Task>(`/time-tracking/tasks/${id}`, updates);
  }

  static async deleteTask(id: string): Promise<void> {
    return APIClient.delete<void>(`/time-tracking/tasks/${id}`);
  }
}

export class ClientService {
  static async getClients(): Promise<Client[]> {
    return APIClient.get<Client[]>('/time-tracking/clients');
  }

  static async createClient(client: Client): Promise<Client> {
    return APIClient.post<Client>('/time-tracking/clients', client);
  }

  static async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    return APIClient.put<Client>(`/time-tracking/clients/${id}`, updates);
  }
}

export class TimerService {
  static async getTimers(employeeId?: string): Promise<TimerSession[]> {
    return APIClient.get<TimerSession[]>('/time-tracking/timers', employeeId ? { employeeId } : undefined);
  }

  static async startTimer(timer: TimerSession): Promise<TimerSession> {
    return APIClient.post<TimerSession>('/time-tracking/timers', timer);
  }

  static async stopTimer(id: string): Promise<TimerSession> {
    return APIClient.post<TimerSession>(`/time-tracking/timers/${id}/stop`, {});
  }
}

export class TimeTrackingAnalyticsService {
  static async getMetrics(): Promise<TimeTrackingMetrics> {
    return APIClient.get<TimeTrackingMetrics>('/time-tracking/analytics/metrics');
  }
}

export class TimeTrackingSettingsService {
  static async getSettings(): Promise<TimeTrackingSettings> {
    return APIClient.get<TimeTrackingSettings>('/time-tracking/settings');
  }

  static async updateSettings(updates: Partial<TimeTrackingSettings>): Promise<TimeTrackingSettings> {
    return APIClient.put<TimeTrackingSettings>('/time-tracking/settings', updates);
  }
}
