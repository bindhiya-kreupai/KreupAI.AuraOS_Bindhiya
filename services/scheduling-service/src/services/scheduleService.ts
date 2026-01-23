export interface Schedule {
  id: string;
  name: string;
  organizationId: string;
  departmentId?: string;
  startDate: string;
  endDate: string;
  timezone: string;
  status: 'draft' | 'published' | 'archived';
  shifts: ScheduleShift[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleShift {
  id: string;
  scheduleId: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  role?: string;
  notes?: string;
}

export interface CreateScheduleParams {
  name: string;
  organizationId: string;
  departmentId?: string;
  startDate: string;
  endDate: string;
  timezone: string;
  createdBy: string;
}

export interface ScheduleConflict {
  type: 'overlap' | 'overtime' | 'rest_violation' | 'unavailable' | 'double_booking';
  severity: 'warning' | 'error';
  employeeId: string;
  employeeName?: string;
  shifts: string[];
  message: string;
}

export interface ConflictCheckParams {
  scheduleId: string;
  maxDailyHours?: number;
  minRestHours?: number;
  checkUnavailability?: boolean;
}

export class ScheduleService {
  private schedules: Map<string, Schedule> = new Map();

  /**
   * Create a new schedule
   */
  async createSchedule(params: CreateScheduleParams): Promise<Schedule> {
    const schedule: Schedule = {
      id: 'sch_' + Date.now().toString(),
      name: params.name,
      organizationId: params.organizationId,
      departmentId: params.departmentId,
      startDate: params.startDate,
      endDate: params.endDate,
      timezone: params.timezone,
      status: 'draft',
      shifts: [],
      createdBy: params.createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.schedules.set(schedule.id, schedule);
    return schedule;
  }

  /**
   * Get a schedule by ID
   */
  async getSchedule(scheduleId: string): Promise<Schedule | null> {
    return this.schedules.get(scheduleId) || null;
  }

  /**
   * List schedules with optional filters
   */
  async listSchedules(organizationId: string, departmentId?: string): Promise<Schedule[]> {
    const result: Schedule[] = [];
    for (const schedule of this.schedules.values()) {
      if (schedule.organizationId === organizationId) {
        if (!departmentId || schedule.departmentId === departmentId) {
          result.push(schedule);
        }
      }
    }
    return result;
  }

  /**
   * Publish a draft schedule
   */
  async publishSchedule(scheduleId: string): Promise<Schedule> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error('Schedule not found: ' + scheduleId);
    }
    if (schedule.status !== 'draft') {
      throw new Error('Only draft schedules can be published');
    }

    schedule.status = 'published';
    schedule.updatedAt = new Date().toISOString();

    // TODO: Send notifications to affected employees
    return schedule;
  }

  /**
   * Check for scheduling conflicts
   */
  async checkConflicts(params: ConflictCheckParams): Promise<ScheduleConflict[]> {
    const schedule = this.schedules.get(params.scheduleId);
    if (!schedule) {
      throw new Error('Schedule not found: ' + params.scheduleId);
    }

    const conflicts: ScheduleConflict[] = [];
    const maxDailyHours = params.maxDailyHours || 12;
    const minRestHours = params.minRestHours || 8;

    // Group shifts by employee
    const shiftsByEmployee = new Map<string, ScheduleShift[]>();
    for (const shift of schedule.shifts) {
      const existing = shiftsByEmployee.get(shift.employeeId) || [];
      existing.push(shift);
      shiftsByEmployee.set(shift.employeeId, existing);
    }

    // Check each employee's shifts
    for (const [employeeId, shifts] of shiftsByEmployee) {
      // Sort shifts by date and start time
      const sorted = shifts.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        return dateCompare !== 0 ? dateCompare : a.startTime.localeCompare(b.startTime);
      });

      for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i];
        const next = sorted[i + 1];

        // Check for overlapping shifts on the same day
        if (current.date === next.date && current.endTime > next.startTime) {
          conflicts.push({
            type: 'overlap',
            severity: 'error',
            employeeId,
            shifts: [current.id, next.id],
            message: 'Overlapping shifts on ' + current.date,
          });
        }

        // Check for minimum rest between shifts
        // TODO: Implement proper time difference calculation
      }

      // Check daily hours
      const hoursByDate = new Map<string, number>();
      for (const shift of sorted) {
        // TODO: Calculate actual hours from start/end time
        const hours = hoursByDate.get(shift.date) || 0;
        hoursByDate.set(shift.date, hours + 8); // Placeholder
      }

      for (const [date, hours] of hoursByDate) {
        if (hours > maxDailyHours) {
          conflicts.push({
            type: 'overtime',
            severity: 'warning',
            employeeId,
            shifts: sorted.filter((s) => s.date === date).map((s) => s.id),
            message: 'Exceeds ' + maxDailyHours + ' hours on ' + date,
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Archive a schedule
   */
  async archiveSchedule(scheduleId: string): Promise<boolean> {
    const schedule = this.schedules.get(scheduleId);
    if (schedule) {
      schedule.status = 'archived';
      schedule.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }
}

export default new ScheduleService();
