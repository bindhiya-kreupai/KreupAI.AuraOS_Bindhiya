// Shift Management Services - API Integrated
import { APIClient } from '@/lib/api-client';
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

export class ShiftService {
  private static endpoint = '/shifts';

  static async getShifts(filters?: { departmentId?: string; locationId?: string; date?: string; status?: string }): Promise<Shift[]> {
    try {
      const response = await APIClient.get<{ shifts?: Shift[] }>(this.endpoint, filters);
      return response.shifts || [];
    } catch (error: any) {
            return [];
    }
  }

  static async getShiftById(id: string): Promise<Shift | null> {
    try {
      const response = await APIClient.get<{ shift?: Shift }>(`${this.endpoint}/${id}`);
      return response.shift || null;
    } catch (error: any) {
            return null;
    }
  }

  static async createShift(shift: Shift): Promise<Shift> {
    try {
      const response = await APIClient.post<{ shift: Shift }>(this.endpoint, shift);
      return response.shift;
    } catch (error: any) {
            throw error;
    }
  }

  static async updateShift(id: string, updates: Partial<Shift>): Promise<Shift> {
    try {
      const response = await APIClient.put<{ shift: Shift }>(`${this.endpoint}/${id}`, updates);
      return response.shift;
    } catch (error: any) {
            throw error;
    }
  }

  static async deleteShift(id: string): Promise<void> {
    try {
      await APIClient.delete(`${this.endpoint}/${id}`);
    } catch (error: any) {
            throw error;
    }
  }

  static async cancelShift(id: string, reason: string): Promise<Shift> {
    try {
      const response = await APIClient.post<{ shift: Shift }>(`${this.endpoint}/${id}/cancel`, { reason });
      return response.shift;
    } catch (error: any) {
            throw error;
    }
  }

  static async duplicateShift(id: string, newDate: string): Promise<Shift> {
    try {
      const response = await APIClient.post<{ shift: Shift }>(`${this.endpoint}/${id}/duplicate`, { newDate });
      return response.shift;
    } catch (error: any) {
            throw error;
    }
  }
}

export class ShiftAssignmentService {
  private static endpoint = '/shifts/assignments';

  static async getAssignments(filters?: { shiftId?: string; employeeId?: string }): Promise<ShiftAssignment[]> {
    try {
      const response = await APIClient.get<{ assignments?: ShiftAssignment[] }>(this.endpoint, filters);
      return response.assignments || [];
    } catch (error: any) {
            return [];
    }
  }

  static async assignEmployee(shiftId: string, employeeId: string, employeeName: string, employeeEmail: string, assignedBy: string): Promise<ShiftAssignment> {
    try {
      const response = await APIClient.post<{ assignment: ShiftAssignment }>(this.endpoint, {
        shiftId,
        employeeId,
        employeeName,
        employeeEmail,
        assignedBy
      });
      return response.assignment;
    } catch (error: any) {
            throw error;
    }
  }

  static async unassignEmployee(shiftId: string, employeeId: string): Promise<void> {
    try {
      await APIClient.delete(`${this.endpoint}/${shiftId}/${employeeId}`);
    } catch (error: any) {
            throw error;
    }
  }

  static async checkIn(assignmentId: string, checkInTime: string): Promise<ShiftAssignment> {
    try {
      const response = await APIClient.post<{ assignment: ShiftAssignment }>(`${this.endpoint}/${assignmentId}/check-in`, { checkInTime });
      return response.assignment;
    } catch (error: any) {
            throw error;
    }
  }

  static async checkOut(assignmentId: string, checkOutTime: string): Promise<ShiftAssignment> {
    try {
      const response = await APIClient.post<{ assignment: ShiftAssignment }>(`${this.endpoint}/${assignmentId}/check-out`, { checkOutTime });
      return response.assignment;
    } catch (error: any) {
            throw error;
    }
  }

  private static async checkAssignmentConflicts(employeeId: string, shift: Shift): Promise<ShiftConflict[]> {
    try {
      const response = await APIClient.get<{ conflicts?: ShiftConflict[] }>(`${this.endpoint}/check-conflicts`, {
        employeeId,
        shiftId: shift.id
      });
      return response.conflicts || [];
    } catch (error: any) {
            return [];
    }
  }
}

export class ShiftPatternService {
  private static endpoint = '/shifts/patterns';

  static async getPatterns(filters?: { departmentId?: string; isActive?: boolean }): Promise<ShiftPattern[]> {
    try {
      const response = await APIClient.get<{ patterns?: ShiftPattern[] }>(this.endpoint, filters);
      return response.patterns || [];
    } catch (error: any) {
            return [];
    }
  }

  static async createPattern(pattern: ShiftPattern): Promise<ShiftPattern> {
    try {
      const response = await APIClient.post<{ pattern: ShiftPattern }>(this.endpoint, pattern);
      return response.pattern;
    } catch (error: any) {
            throw error;
    }
  }

  static async updatePattern(id: string, updates: Partial<ShiftPattern>): Promise<ShiftPattern> {
    try {
      const response = await APIClient.put<{ pattern: ShiftPattern }>(`${this.endpoint}/${id}`, updates);
      return response.pattern;
    } catch (error: any) {
            throw error;
    }
  }

  static async deletePattern(id: string): Promise<void> {
    try {
      await APIClient.delete(`${this.endpoint}/${id}`);
    } catch (error: any) {
            throw error;
    }
  }

  static async generateShiftsFromPattern(patternId: string, startDate: string, endDate: string): Promise<Shift[]> {
    const pattern = (await this.getPatterns()).find(p => p.id === patternId);
    if (!pattern) throw new Error('Pattern not found');

    const shifts: Shift[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const currentDate = new Date(start);
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
  private static endpoint = '/shifts/templates';

  static async getTemplates(filters?: { departmentId?: string; isActive?: boolean }): Promise<ShiftTemplate[]> {
    try {
      const response = await APIClient.get<{ templates?: ShiftTemplate[] }>(this.endpoint, filters);
      return response.templates || [];
    } catch (error: any) {
            return [];
    }
  }

  static async createTemplate(template: ShiftTemplate): Promise<ShiftTemplate> {
    try {
      const response = await APIClient.post<{ template: ShiftTemplate }>(this.endpoint, template);
      return response.template;
    } catch (error: any) {
            throw error;
    }
  }

  static async updateTemplate(id: string, updates: Partial<ShiftTemplate>): Promise<ShiftTemplate> {
    try {
      const response = await APIClient.put<{ template: ShiftTemplate }>(`${this.endpoint}/${id}`, updates);
      return response.template;
    } catch (error: any) {
            throw error;
    }
  }

  static async deleteTemplate(id: string): Promise<void> {
    try {
      await APIClient.delete(`${this.endpoint}/${id}`);
    } catch (error: any) {
            throw error;
    }
  }
}

export class ShiftSwapService {
  private static endpoint = '/shifts/swap-requests';

  static async getSwapRequests(filters?: { requestorId?: string; requesteeId?: string; status?: string }): Promise<ShiftSwapRequest[]> {
    try {
      const response = await APIClient.get<{ swapRequests?: ShiftSwapRequest[] }>(this.endpoint, filters);
      return response.swapRequests || [];
    } catch (error: any) {
            return [];
    }
  }

  static async createSwapRequest(swap: ShiftSwapRequest): Promise<ShiftSwapRequest> {
    try {
      const response = await APIClient.post<{ swapRequest: ShiftSwapRequest }>(this.endpoint, swap);
      return response.swapRequest;
    } catch (error: any) {
            throw error;
    }
  }

  static async approveSwap(id: string, approverId: string, approverName: string): Promise<ShiftSwapRequest> {
    try {
      const response = await APIClient.post<{ swapRequest: ShiftSwapRequest }>(`${this.endpoint}/${id}/approve`, {
        approverId,
        approverName
      });
      return response.swapRequest;
    } catch (error: any) {
            throw error;
    }
  }

  static async rejectSwap(id: string, reason: string): Promise<ShiftSwapRequest> {
    try {
      const response = await APIClient.post<{ swapRequest: ShiftSwapRequest }>(`${this.endpoint}/${id}/reject`, { reason });
      return response.swapRequest;
    } catch (error: any) {
            throw error;
    }
  }
}

export class ShiftScheduleService {
  private static endpoint = '/shifts/schedules';

  static async getSchedules(filters?: { departmentId?: string; status?: string }): Promise<ShiftSchedule[]> {
    try {
      const response = await APIClient.get<{ schedules?: ShiftSchedule[] }>(this.endpoint, filters);
      return response.schedules || [];
    } catch (error: any) {
            return [];
    }
  }

  static async createSchedule(schedule: ShiftSchedule): Promise<ShiftSchedule> {
    try {
      const response = await APIClient.post<{ schedule: ShiftSchedule }>(this.endpoint, schedule);
      return response.schedule;
    } catch (error: any) {
            throw error;
    }
  }

  static async publishSchedule(id: string, publishedBy: string): Promise<ShiftSchedule> {
    try {
      const response = await APIClient.post<{ schedule: ShiftSchedule }>(`${this.endpoint}/${id}/publish`, { publishedBy });
      return response.schedule;
    } catch (error: any) {
            throw error;
    }
  }

  static async analyzeCoverage(scheduleId: string): Promise<CoverageAnalysis> {
    try {
      const response = await APIClient.get<CoverageAnalysis>(`${this.endpoint}/${scheduleId}/coverage`);
      return response;
    } catch (error: any) {
            throw error;
    }
  }
}

export class ShiftAnalyticsService {
  private static endpoint = '/shifts/analytics';

  static async getMetrics(): Promise<ShiftMetrics> {
    try {
      const response = await APIClient.get<ShiftMetrics>(`${this.endpoint}/metrics`);
      return response;
    } catch (error: any) {
            throw error;
    }
  }
}

export class ShiftSettingsService {
  private static endpoint = '/shifts/settings';

  static async getSettings(): Promise<ShiftSettings> {
    try {
      const response = await APIClient.get<ShiftSettings>(this.endpoint);
      return response;
    } catch (error: any) {
            throw error;
    }
  }

  static async updateSettings(updates: Partial<ShiftSettings>): Promise<ShiftSettings> {
    try {
      const response = await APIClient.put<ShiftSettings>(this.endpoint, updates);
      return response;
    } catch (error: any) {
            throw error;
    }
  }
}
