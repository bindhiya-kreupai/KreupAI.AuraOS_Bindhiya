import axios from 'axios';

const BASE_PATH = '/api/v1/attendance/projects';

// Types
export interface TimeEntry {
  id: string;
  projectId: string;
  projectName: string;
  taskId?: string;
  taskName?: string;
  date: string;
  hours: number;
  description: string;
  status: 'draft' | 'submitted' | 'approved';
}

export interface TimeEntryCreate {
  projectId: string;
  taskId?: string;
  date: string;
  hours: number;
  description: string;
}

export interface TimesheetData {
  weekStart: string;
  weekEnd: string;
  entries: TimeEntry[];
  totalHours: number;
  projectBreakdown: {
    projectId: string;
    projectName: string;
    hours: number;
  }[];
}

export interface Project {
  id: string;
  name: string;
  code: string;
  client?: string;
  status: 'active' | 'completed' | 'on_hold';
  budget?: number;
}

export interface ActiveTimer {
  id: string;
  projectId: string;
  projectName: string;
  taskId?: string;
  startedAt: string;
  elapsed: number;
}

// Service functions
export async function logTimeEntry(
  data: TimeEntryCreate
): Promise<TimeEntry> {
  const response = await axios.post<TimeEntry>(
    `${BASE_PATH}/time-entries`,
    data
  );
  return response.data;
}

export async function getTimesheet(
  params?: { weekStart?: string; projectId?: string }
): Promise<TimesheetData> {
  const response = await axios.get<TimesheetData>(
    `${BASE_PATH}/timesheet`,
    { params }
  );
  return response.data;
}

export async function getProjects(): Promise<Project[]> {
  const response = await axios.get<Project[]>(BASE_PATH);
  return response.data;
}

export async function updateTimeEntry(
  id: string,
  data: Partial<TimeEntryCreate>
): Promise<TimeEntry> {
  const response = await axios.patch<TimeEntry>(
    `${BASE_PATH}/time-entries/${id}`,
    data
  );
  return response.data;
}

export async function deleteTimeEntry(id: string): Promise<void> {
  await axios.delete(`${BASE_PATH}/time-entries/${id}`);
}

export async function startTimer(
  projectId: string,
  taskId?: string
): Promise<ActiveTimer> {
  const response = await axios.post<ActiveTimer>(
    `${BASE_PATH}/timer/start`,
    { projectId, taskId }
  );
  return response.data;
}

export async function stopTimer(timerId: string): Promise<TimeEntry> {
  const response = await axios.post<TimeEntry>(
    `${BASE_PATH}/timer/${timerId}/stop`
  );
  return response.data;
}

export async function getActiveTimer(): Promise<ActiveTimer | null> {
  const response = await axios.get<ActiveTimer | null>(
    `${BASE_PATH}/timer/active`
  );
  return response.data;
}
