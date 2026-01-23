import axios from 'axios';

const BASE_PATH = '/api/v1/attendance/schedules';

// Types
export interface Schedule {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  shiftStart: string;
  shiftEnd: string;
  breakDuration: number;
  status: 'scheduled' | 'confirmed' | 'completed';
  notes?: string;
}

export interface ScheduleCreate {
  employeeId: string;
  date: string;
  shiftStart: string;
  shiftEnd: string;
  breakDuration?: number;
  notes?: string;
}

export interface ShiftTemplate {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  color: string;
}

// Service functions
export async function getSchedules(
  params?: { departmentId?: string; weekStart?: string }
): Promise<Schedule[]> {
  const response = await axios.get<Schedule[]>(BASE_PATH, { params });
  return response.data;
}

export async function createSchedule(
  data: ScheduleCreate
): Promise<Schedule> {
  const response = await axios.post<Schedule>(BASE_PATH, data);
  return response.data;
}

export async function updateSchedule(
  id: string,
  data: Partial<ScheduleCreate>
): Promise<Schedule> {
  const response = await axios.patch<Schedule>(
    `${BASE_PATH}/${id}`,
    data
  );
  return response.data;
}

export async function deleteSchedule(id: string): Promise<void> {
  await axios.delete(`${BASE_PATH}/${id}`);
}

export async function copySchedule(
  sourceWeek: string,
  targetWeek: string
): Promise<void> {
  await axios.post(`${BASE_PATH}/copy`, { sourceWeek, targetWeek });
}

export async function getShiftTemplates(): Promise<ShiftTemplate[]> {
  const response = await axios.get<ShiftTemplate[]>(
    `${BASE_PATH}/templates`
  );
  return response.data;
}
