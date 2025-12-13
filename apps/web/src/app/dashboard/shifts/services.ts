// Shift Management Services
import type {
  Shift,
  ShiftAssignment,
  ShiftPattern,
  ShiftTemplate,
  ShiftSwapRequest,
  ShiftCoverageRequest,
  ShiftPreference,
  ShiftSchedule,
  ShiftBid,
  OvertimeRecord,
  ShiftConflict,
  ShiftMetrics,
  ShiftSettings,
  ShiftRule,
  StaffingRequirement,
  CoverageAnalysis,
  DailyCoverage
} from './types';

const STORAGE_KEYS = {
  SHIFTS: 'shifts',
  ASSIGNMENTS: 'shift_assignments',
  PATTERNS: 'shift_patterns',
  TEMPLATES: 'shift_templates',
  SWAP_REQUESTS: 'shift_swaps',
  COVERAGE_REQUESTS: 'shift_coverage',
  PREFERENCES: 'shift_preferences',
  SCHEDULES: 'shift_schedules',
  BIDS: 'shift_bids',
  OVERTIME: 'shift_overtime',
  CONFLICTS: 'shift_conflicts',
  RULES: 'shift_rules',
  STAFFING_REQUIREMENTS: 'staffing_requirements',
  METRICS: 'shift_metrics',
  SETTINGS: 'shift_settings',
};

export class ShiftService {
  static async getShifts(filters?: { departmentId?: string; locationId?: string; date?: string; status?: string }): Promise<Shift[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.SHIFTS);
    let shifts: Shift[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.departmentId) shifts = shifts.filter(s => s.departmentId === filters.departmentId);
      if (filters.locationId) shifts = shifts.filter(s => s.locationId === filters.locationId);
      if (filters.date) shifts = shifts.filter(s => s.date === filters.date);
      if (filters.status) shifts = shifts.filter(s => s.status === filters.status);
    }

    return shifts;
  }

  static async getShiftById(id: string): Promise<Shift | null> {
    const shifts = await this.getShifts();
    return shifts.find(s => s.id === id) || null;
  }

  static async createShift(shift: Shift): Promise<Shift> {
    // TODO: Replace with actual API call
    const shifts = await this.getShifts();
    shifts.push(shift);
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
    return shift;
  }

  static async updateShift(id: string, updates: Partial<Shift>): Promise<Shift> {
    // TODO: Replace with actual API call
    const shifts = await this.getShifts();
    const index = shifts.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Shift not found');

    shifts[index] = { ...shifts[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
    return shifts[index];
  }

  static async deleteShift(id: string): Promise<void> {
    // TODO: Replace with actual API call
    const shift = await this.getShiftById(id);
    if (!shift) throw new Error('Shift not found');

    if (shift.assignments.length > 0) {
      throw new Error('Cannot delete shift with existing assignments');
    }

    const shifts = await this.getShifts();
    const filtered = shifts.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(filtered));
  }

  static async cancelShift(id: string, reason: string): Promise<Shift> {
    const shift = await this.getShiftById(id);
    if (!shift) throw new Error('Shift not found');

    // Notify all assigned employees
    for (const assignment of shift.assignments) {
      // TODO: Send cancellation notification
    }

    return this.updateShift(id, { status: 'cancelled', notes: reason });
  }

  static async duplicateShift(id: string, newDate: string): Promise<Shift> {
    const shift = await this.getShiftById(id);
    if (!shift) throw new Error('Shift not found');

    const duplicate: Shift = {
      ...shift,
      id: `shift-${Date.now()}`,
      shiftCode: `SHIFT-${Date.now()}`,
      date: newDate,
      assignments: [],
      currentStaffing: 0,
      status: 'scheduled',
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    return this.createShift(duplicate);
  }
}

export class ShiftAssignmentService {
  static async getAssignments(filters?: { shiftId?: string; employeeId?: string }): Promise<ShiftAssignment[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    let assignments: ShiftAssignment[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.shiftId) assignments = assignments.filter(a => a.shiftId === filters.shiftId);
      if (filters.employeeId) assignments = assignments.filter(a => a.employeeId === filters.employeeId);
    }

    return assignments;
  }

  static async assignEmployee(shiftId: string, employeeId: string, employeeName: string, employeeEmail: string, assignedBy: string): Promise<ShiftAssignment> {
    // TODO: Replace with actual API call
    const shift = await ShiftService.getShiftById(shiftId);
    if (!shift) throw new Error('Shift not found');

    if (shift.currentStaffing >= shift.maxStaffing) {
      throw new Error('Shift is fully staffed');
    }

    // Check for conflicts
    const conflicts = await this.checkAssignmentConflicts(employeeId, shift);
    if (conflicts.length > 0) {
      throw new Error(`Assignment conflicts detected: ${conflicts.map(c => c.description).join(', ')}`);
    }

    const assignment: ShiftAssignment = {
      id: `assign-${Date.now()}`,
      shiftId,
      employeeId,
      employeeName,
      employeeEmail,
      assignmentType: 'regular',
      status: 'scheduled',
      breaks: [],
      assignedBy,
      assignedDate: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    const assignments = await this.getAssignments();
    assignments.push(assignment);
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));

    // Update shift staffing
    shift.assignments.push(assignment);
    shift.currentStaffing += 1;
    await ShiftService.updateShift(shiftId, { assignments: shift.assignments, currentStaffing: shift.currentStaffing });

    return assignment;
  }

  static async unassignEmployee(shiftId: string, employeeId: string): Promise<void> {
    // TODO: Replace with actual API call
    const shift = await ShiftService.getShiftById(shiftId);
    if (!shift) throw new Error('Shift not found');

    const assignments = await this.getAssignments();
    const filtered = assignments.filter(a => !(a.shiftId === shiftId && a.employeeId === employeeId));
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(filtered));

    // Update shift staffing
    shift.assignments = shift.assignments.filter(a => a.employeeId !== employeeId);
    shift.currentStaffing = shift.assignments.length;
    await ShiftService.updateShift(shiftId, { assignments: shift.assignments, currentStaffing: shift.currentStaffing });
  }

  static async checkIn(assignmentId: string, checkInTime: string): Promise<ShiftAssignment> {
    // TODO: Replace with actual API call
    const assignments = await this.getAssignments();
    const index = assignments.findIndex(a => a.id === assignmentId);
    if (index === -1) throw new Error('Assignment not found');

    assignments[index].checkInTime = checkInTime;
    assignments[index].status = 'in_progress';

    // Calculate if late
    const shift = await ShiftService.getShiftById(assignments[index].shiftId);
    if (shift) {
      const scheduledStart = new Date(`${shift.date}T${shift.startTime}`);
      const actualStart = new Date(checkInTime);
      const diffMinutes = (actualStart.getTime() - scheduledStart.getTime()) / 60000;

      if (diffMinutes > 5) {
        assignments[index].lateMinutes = Math.round(diffMinutes);
        assignments[index].status = 'late';
      }
    }

    assignments[index].lastModified = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    return assignments[index];
  }

  static async checkOut(assignmentId: string, checkOutTime: string): Promise<ShiftAssignment> {
    // TODO: Replace with actual API call
    const assignments = await this.getAssignments();
    const index = assignments.findIndex(a => a.id === assignmentId);
    if (index === -1) throw new Error('Assignment not found');

    if (!assignments[index].checkInTime) {
      throw new Error('Cannot check out without checking in first');
    }

    assignments[index].checkOutTime = checkOutTime;
    assignments[index].status = 'completed';

    // Calculate actual duration
    const checkIn = new Date(assignments[index].checkInTime!);
    const checkOut = new Date(checkOutTime);
    const durationHours = (checkOut.getTime() - checkIn.getTime()) / 3600000;
    assignments[index].actualDuration = durationHours;

    // Calculate overtime if applicable
    const shift = await ShiftService.getShiftById(assignments[index].shiftId);
    if (shift && shift.overtimeEligible) {
      const overtimeHours = Math.max(0, durationHours - shift.duration);
      if (overtimeHours > 0) {
        assignments[index].overtimeMinutes = Math.round(overtimeHours * 60);
      }
    }

    assignments[index].lastModified = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    return assignments[index];
  }

  private static async checkAssignmentConflicts(employeeId: string, shift: Shift): Promise<ShiftConflict[]> {
    // TODO: Implement actual conflict checking
    const conflicts: ShiftConflict[] = [];

    // Check for overlapping shifts
    const employeeAssignments = await this.getAssignments({ employeeId });
    for (const assignment of employeeAssignments) {
      const existingShift = await ShiftService.getShiftById(assignment.shiftId);
      if (existingShift && existingShift.date === shift.date) {
        const existingStart = new Date(`${existingShift.date}T${existingShift.startTime}`);
        const existingEnd = new Date(`${existingShift.date}T${existingShift.endTime}`);
        const newStart = new Date(`${shift.date}T${shift.startTime}`);
        const newEnd = new Date(`${shift.date}T${shift.endTime}`);

        if (newStart < existingEnd && newEnd > existingStart) {
          conflicts.push({
            id: `conflict-${Date.now()}`,
            conflictType: 'overlap',
            severity: 'high',
            employeeId,
            employeeName: assignment.employeeName,
            shift1Id: existingShift.id,
            shift1: {
              shiftId: existingShift.id,
              shiftName: existingShift.shiftName,
              date: existingShift.date,
              startTime: existingShift.startTime,
              endTime: existingShift.endTime,
              departmentName: existingShift.departmentName,
              locationName: existingShift.locationName
            },
            shift2Id: shift.id,
            shift2: {
              shiftId: shift.id,
              shiftName: shift.shiftName,
              date: shift.date,
              startTime: shift.startTime,
              endTime: shift.endTime,
              departmentName: shift.departmentName,
              locationName: shift.locationName
            },
            description: 'Overlapping shift times',
            isResolved: false,
            createdDate: new Date().toISOString()
          });
        }
      }
    }

    return conflicts;
  }
}

export class ShiftPatternService {
  static async getPatterns(filters?: { departmentId?: string; isActive?: boolean }): Promise<ShiftPattern[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.PATTERNS);
    let patterns: ShiftPattern[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.departmentId) patterns = patterns.filter(p => p.departmentId === filters.departmentId);
      if (filters.isActive !== undefined) patterns = patterns.filter(p => p.isActive === filters.isActive);
    }

    return patterns;
  }

  static async createPattern(pattern: ShiftPattern): Promise<ShiftPattern> {
    // TODO: Replace with actual API call
    const patterns = await this.getPatterns();
    patterns.push(pattern);
    localStorage.setItem(STORAGE_KEYS.PATTERNS, JSON.stringify(patterns));
    return pattern;
  }

  static async updatePattern(id: string, updates: Partial<ShiftPattern>): Promise<ShiftPattern> {
    // TODO: Replace with actual API call
    const patterns = await this.getPatterns();
    const index = patterns.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Pattern not found');

    patterns[index] = { ...patterns[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.PATTERNS, JSON.stringify(patterns));
    return patterns[index];
  }

  static async deletePattern(id: string): Promise<void> {
    // TODO: Replace with actual API call
    const patterns = await this.getPatterns();
    const filtered = patterns.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PATTERNS, JSON.stringify(filtered));
  }

  static async generateShiftsFromPattern(patternId: string, startDate: string, endDate: string): Promise<Shift[]> {
    const pattern = (await this.getPatterns()).find(p => p.id === patternId);
    if (!pattern) throw new Error('Pattern not found');

    const shifts: Shift[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    let currentDate = new Date(start);
    let dayNumber = 0;

    while (currentDate <= end) {
      const cycleDay = pattern.cycle.shifts[dayNumber % pattern.cycle.shifts.length];

      if (cycleDay.isWorkDay) {
        const template = (await ShiftTemplateService.getTemplates()).find(t => t.id === cycleDay.shiftTemplateId);
        if (template) {
          const shift: Shift = {
            id: `shift-${Date.now()}-${dayNumber}`,
            shiftCode: `SHIFT-${currentDate.toISOString().split('T')[0]}-${dayNumber}`,
            shiftName: template.templateName,
            shiftType: template.shiftType,
            date: currentDate.toISOString().split('T')[0],
            startTime: template.startTime,
            endTime: template.endTime,
            duration: template.duration,
            departmentId: pattern.departmentId,
            departmentName: pattern.departmentName,
            locationId: 'loc-001',
            locationName: 'Main Office',
            requiredSkills: template.requiredSkills,
            minStaffing: 1,
            maxStaffing: 5,
            currentStaffing: 0,
            assignments: [],
            breakSchedule: template.breakSchedule,
            overtimeEligible: template.overtimeEligible,
            premiumRate: template.premiumRate,
            status: 'scheduled',
            isRecurring: true,
            recurringPatternId: patternId,
            createdBy: 'system',
            createdDate: new Date().toISOString(),
            lastModified: new Date().toISOString()
          };

          shifts.push(shift);
          await ShiftService.createShift(shift);
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
      dayNumber++;
    }

    return shifts;
  }
}

export class ShiftTemplateService {
  static async getTemplates(filters?: { departmentId?: string; isActive?: boolean }): Promise<ShiftTemplate[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    let templates: ShiftTemplate[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.departmentId) templates = templates.filter(t => t.departmentId === filters.departmentId);
      if (filters.isActive !== undefined) templates = templates.filter(t => t.isActive === filters.isActive);
    }

    return templates;
  }

  static async createTemplate(template: ShiftTemplate): Promise<ShiftTemplate> {
    // TODO: Replace with actual API call
    const templates = await this.getTemplates();
    templates.push(template);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
    return template;
  }

  static async updateTemplate(id: string, updates: Partial<ShiftTemplate>): Promise<ShiftTemplate> {
    // TODO: Replace with actual API call
    const templates = await this.getTemplates();
    const index = templates.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Template not found');

    templates[index] = { ...templates[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
    return templates[index];
  }

  static async deleteTemplate(id: string): Promise<void> {
    // TODO: Replace with actual API call
    const templates = await this.getTemplates();
    const filtered = templates.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(filtered));
  }
}

export class ShiftSwapService {
  static async getSwapRequests(filters?: { requestorId?: string; requesteeId?: string; status?: string }): Promise<ShiftSwapRequest[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.SWAP_REQUESTS);
    let swaps: ShiftSwapRequest[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.requestorId) swaps = swaps.filter(s => s.requestorId === filters.requestorId);
      if (filters.requesteeId) swaps = swaps.filter(s => s.requesteeId === filters.requesteeId);
      if (filters.status) swaps = swaps.filter(s => s.status === filters.status);
    }

    return swaps;
  }

  static async createSwapRequest(swap: ShiftSwapRequest): Promise<ShiftSwapRequest> {
    // TODO: Replace with actual API call
    const swaps = await this.getSwapRequests();
    swaps.push(swap);
    localStorage.setItem(STORAGE_KEYS.SWAP_REQUESTS, JSON.stringify(swaps));
    return swap;
  }

  static async approveSwap(id: string, approverId: string, approverName: string): Promise<ShiftSwapRequest> {
    // TODO: Replace with actual API call
    const swaps = await this.getSwapRequests();
    const index = swaps.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Swap request not found');

    swaps[index].status = 'approved';
    swaps[index].approvedBy = approverId;
    swaps[index].approvedByName = approverName;
    swaps[index].approvedDate = new Date().toISOString();

    // Perform the swap
    await ShiftAssignmentService.unassignEmployee(swaps[index].requestorShiftId, swaps[index].requestorId);
    await ShiftAssignmentService.unassignEmployee(swaps[index].requesteeShiftId, swaps[index].requesteeId);

    await ShiftAssignmentService.assignEmployee(
      swaps[index].requestorShiftId,
      swaps[index].requesteeId,
      swaps[index].requesteeName,
      '',
      approverId
    );

    await ShiftAssignmentService.assignEmployee(
      swaps[index].requesteeShiftId,
      swaps[index].requestorId,
      swaps[index].requestorName,
      '',
      approverId
    );

    swaps[index].lastModified = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.SWAP_REQUESTS, JSON.stringify(swaps));
    return swaps[index];
  }

  static async rejectSwap(id: string, reason: string): Promise<ShiftSwapRequest> {
    // TODO: Replace with actual API call
    const swaps = await this.getSwapRequests();
    const index = swaps.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Swap request not found');

    swaps[index].status = 'rejected';
    swaps[index].rejectedReason = reason;
    swaps[index].lastModified = new Date().toISOString();

    localStorage.setItem(STORAGE_KEYS.SWAP_REQUESTS, JSON.stringify(swaps));
    return swaps[index];
  }
}

export class ShiftScheduleService {
  static async getSchedules(filters?: { departmentId?: string; status?: string }): Promise<ShiftSchedule[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
    let schedules: ShiftSchedule[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.departmentId) schedules = schedules.filter(s => s.departmentId === filters.departmentId);
      if (filters.status) schedules = schedules.filter(s => s.status === filters.status);
    }

    return schedules;
  }

  static async createSchedule(schedule: ShiftSchedule): Promise<ShiftSchedule> {
    // TODO: Replace with actual API call
    const schedules = await this.getSchedules();
    schedules.push(schedule);
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
    return schedule;
  }

  static async publishSchedule(id: string, publishedBy: string): Promise<ShiftSchedule> {
    const schedules = await this.getSchedules();
    const index = schedules.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Schedule not found');

    schedules[index].status = 'published';
    schedules[index].publishedBy = publishedBy;
    schedules[index].publishedDate = new Date().toISOString();

    // Notify all assigned employees
    // TODO: Send notifications

    schedules[index].lastModified = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
    return schedules[index];
  }

  static async analyzeCoverage(scheduleId: string): Promise<CoverageAnalysis> {
    const schedule = (await this.getSchedules()).find(s => s.id === scheduleId);
    if (!schedule) throw new Error('Schedule not found');

    const totalRequiredStaff = schedule.shifts.reduce((sum, shift) => sum + shift.minStaffing, 0);
    const totalAssignedStaff = schedule.shifts.reduce((sum, shift) => sum + shift.currentStaffing, 0);
    const coveragePercentage = totalRequiredStaff > 0 ? (totalAssignedStaff / totalRequiredStaff) * 100 : 0;

    const uncoveredShifts = schedule.shifts.filter(s => s.currentStaffing < s.minStaffing).length;
    const overstaffedShifts = schedule.shifts.filter(s => s.currentStaffing > s.maxStaffing).length;

    const dailyCoverage: DailyCoverage[] = [];
    // TODO: Calculate daily coverage

    return {
      totalRequiredStaff,
      totalAssignedStaff,
      coveragePercentage,
      coverageStatus: coveragePercentage >= 100 ? 'fully_covered' : coveragePercentage >= 80 ? 'partially_covered' : 'uncovered',
      uncoveredShifts,
      overstaffedShifts,
      dailyCoverage,
      skillGaps: []
    };
  }
}

export class ShiftAnalyticsService {
  static async getMetrics(): Promise<ShiftMetrics> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.METRICS);
    return data ? JSON.parse(data) : {
      totalShifts: 0,
      totalAssignments: 0,
      averageCoverage: 0,
      uncoveredShifts: 0,
      totalOvertimeHours: 0,
      totalOvertimeCost: 0,
      swapRequests: 0,
      approvedSwaps: 0,
      rejectedSwaps: 0,
      averageSwapApprovalTime: 0,
      lateCheckIns: 0,
      noShows: 0,
      earlyDepartures: 0,
      onTimePercentage: 0,
      utilizationRate: 0,
      laborCost: 0,
      costPerHour: 0,
      shiftsByType: [],
      shiftsByDepartment: [],
      coverageByDay: [],
      topPerformers: [],
      overtimeByEmployee: [],
      conflictsByType: []
    };
  }
}

export class ShiftSettingsService {
  static async getSettings(): Promise<ShiftSettings> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      enableShiftManagement: true,
      enableShiftSwaps: true,
      enableShiftBidding: false,
      enableOvertimeTracking: true,
      requireSwapApproval: true,
      swapApprovalLevels: 1,
      autoPublishSchedule: false,
      schedulePublishDays: 14,
      allowSelfAssignment: false,
      minRestHoursBetweenShifts: 8,
      maxConsecutiveShifts: 6,
      maxHoursPerWeek: 40,
      maxHoursPerDay: 12,
      overtimeThresholdDaily: 8,
      overtimeThresholdWeekly: 40,
      overtimeRateMultiplier: 1.5,
      nightShiftPremium: 0.15,
      weekendPremium: 0.10,
      holidayPremium: 0.20,
      enableBreakTracking: true,
      mandatoryBreakDuration: 30,
      breakPaidThreshold: 6,
      enableGPSCheckIn: false,
      gpsRadiusMeters: 100,
      enableNotifications: true,
      notifyShiftChanges: true,
      notifySwapRequests: true,
      reminderHoursBefore: 24,
      fiscalWeekStart: 'monday',
      defaultCurrency: 'USD'
    };
  }

  static async updateSettings(updates: Partial<ShiftSettings>): Promise<ShiftSettings> {
    // TODO: Replace with actual API call
    const settings = await this.getSettings();
    const updated = { ...settings, ...updates };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }
}
