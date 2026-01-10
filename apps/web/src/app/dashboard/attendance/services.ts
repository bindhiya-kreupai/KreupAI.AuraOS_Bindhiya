// Attendance Module Services - API Integrated
import { APIClient } from '@/lib/api-client';
import type {
  Shift, ShiftAssignment, AttendanceRecord, AttendanceCheck, AttendanceRegularization,
  OvertimeRequest, BiometricDevice, AttendancePolicy, WorkLocation, WFHRequest,
  AttendanceMetrics, AttendanceSettings, MonthlyAttendanceReport
} from './types';

// ============================================================================
// SHIFT SERVICE
// ============================================================================

export class ShiftService {
  private static endpoint = '/attendance/shifts';

  static async getShifts(): Promise<Shift[]> {
    try {
      const response = await APIClient.get<{ shifts?: Shift[] }>(this.endpoint);
      return response.shifts || [];
    } catch (error) {
            return [];
    }
  }

  static async getShiftById(id: string): Promise<Shift | null> {
    try {
      const response = await APIClient.get<{ shift?: Shift }>(`${this.endpoint}/${id}`);
      return response.shift || null;
    } catch (error) {
            return null;
    }
  }

  static async createShift(shift: Partial<Shift>): Promise<Shift> {
    const response = await APIClient.post<{ shift: Shift }>(this.endpoint, shift);
    return response.shift;
  }

  static async updateShift(id: string, updates: Partial<Shift>): Promise<Shift> {
    const response = await APIClient.put<{ shift: Shift }>(`${this.endpoint}/${id}`, updates);
    return response.shift;
  }

  static async deleteShift(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
  }
}

// ============================================================================
// ATTENDANCE RECORD SERVICE
// ============================================================================

export class AttendanceRecordService {
  private static endpoint = '/attendance';

  static async getRecords(filters?: {
    employeeId?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    month?: string;
    type?: 'records' | 'summary' | 'calendar';
  }): Promise<AttendanceRecord[]> {
    try {
      const response = await APIClient.get<{ records?: AttendanceRecord[]; attendance?: AttendanceRecord[] }>(
        this.endpoint,
        filters
      );
      return response.records || response.attendance || [];
    } catch (error) {
            return [];
    }
  }

  static async getRecordById(id: string): Promise<AttendanceRecord | null> {
    try {
      const response = await APIClient.get<{ record?: AttendanceRecord }>(`${this.endpoint}/${id}`);
      return response.record || null;
    } catch (error) {
            return null;
    }
  }

  static async createRecord(record: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const response = await APIClient.post<{ record: AttendanceRecord }>(this.endpoint, record);
    return response.record;
  }

  static async updateRecord(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const response = await APIClient.put<{ record: AttendanceRecord }>(`${this.endpoint}/${id}`, updates);
    return response.record;
  }

  static async deleteRecord(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
  }

  static async getMonthlyReport(employeeId: string, month: string): Promise<MonthlyAttendanceReport | null> {
    try {
      const response = await APIClient.get<{ report?: MonthlyAttendanceReport }>(
        this.endpoint,
        { employeeId, month, type: 'summary' }
      );
      return response.report || null;
    } catch (error) {
            return null;
    }
  }
}

// ============================================================================
// CHECK-IN/OUT SERVICE (GPS PUNCH)
// ============================================================================

export class AttendanceCheckService {
  private static endpoint = '/attendance/punch';
  private static timeCaptureEndpoint = '/attendance/time-capture';

  static async recordCheck(check: Partial<AttendanceCheck>): Promise<AttendanceCheck> {
    const response = await APIClient.post<{ check: AttendanceCheck; punch?: AttendanceCheck }>(
      this.endpoint,
      check
    );
    return response.check || response.punch!;
  }

  static async getChecks(filters?: { employeeId?: string; date?: string }): Promise<AttendanceCheck[]> {
    try {
      const response = await APIClient.get<{ checks?: AttendanceCheck[]; punches?: AttendanceCheck[] }>(
        this.timeCaptureEndpoint,
        filters
      );
      return response.checks || response.punches || [];
    } catch (error) {
            return [];
    }
  }

  static async getTodayCheck(employeeId: string): Promise<AttendanceCheck | null> {
    const today = new Date().toISOString().split('T')[0];
    const checks = await this.getChecks({ employeeId, date: today });
    return checks.length > 0 ? checks[0] : null;
  }
}

// ============================================================================
// REGULARIZATION SERVICE
// ============================================================================

export class RegularizationService {
  private static endpoint = '/attendance/regularization';
  private static requestEndpoint = '/attendance/regularization-request';

  static async getRegularizations(filters?: {
    employeeId?: string;
    status?: string;
    pending?: boolean;
  }): Promise<AttendanceRegularization[]> {
    try {
      const response = await APIClient.get<{ regularizations?: AttendanceRegularization[] }>(
        this.endpoint,
        filters
      );
      return response.regularizations || [];
    } catch (error) {
            return [];
    }
  }

  static async submitRegularization(
    regularization: Partial<AttendanceRegularization>
  ): Promise<AttendanceRegularization> {
    const response = await APIClient.post<{ regularization: AttendanceRegularization }>(
      this.endpoint,
      regularization
    );
    return response.regularization;
  }

  static async approveRegularization(
    id: string,
    reviewedBy: string,
    comments?: string
  ): Promise<AttendanceRegularization> {
    const response = await APIClient.post<{ regularization: AttendanceRegularization }>(
      `${this.endpoint}/${id}/approve`,
      { reviewedBy, comments }
    );
    return response.regularization;
  }

  static async rejectRegularization(
    id: string,
    reviewedBy: string,
    reason: string
  ): Promise<AttendanceRegularization> {
    const response = await APIClient.post<{ regularization: AttendanceRegularization }>(
      `${this.endpoint}/${id}/reject`,
      { reviewedBy, reason }
    );
    return response.regularization;
  }

  static async getPendingRequests(filters?: {
    status?: string;
    department?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AttendanceRegularization[]> {
    try {
      const response = await APIClient.get<{ requests?: AttendanceRegularization[] }>(
        this.requestEndpoint,
        filters
      );
      return response.requests || [];
    } catch (error) {
            return [];
    }
  }
}

// ============================================================================
// OVERTIME SERVICE
// ============================================================================

export class OvertimeService {
  private static endpoint = '/attendance/overtime';
  private static managementEndpoint = '/attendance/overtime-management';

  static async getOvertimeRequests(filters?: {
    employeeId?: string;
    month?: string;
    status?: string;
  }): Promise<OvertimeRequest[]> {
    try {
      const response = await APIClient.get<{ requests?: OvertimeRequest[]; overtime?: OvertimeRequest[] }>(
        this.endpoint,
        filters
      );
      return response.requests || response.overtime || [];
    } catch (error) {
            return [];
    }
  }

  static async submitOvertimeRequest(request: Partial<OvertimeRequest>): Promise<OvertimeRequest> {
    const response = await APIClient.post<{ request: OvertimeRequest; overtime?: OvertimeRequest }>(
      this.endpoint,
      request
    );
    return response.request || response.overtime!;
  }

  static async approveOvertime(
    id: string,
    approvedBy: string,
    approvedHours?: number
  ): Promise<OvertimeRequest> {
    const response = await APIClient.post<{ request: OvertimeRequest }>(
      `${this.endpoint}/${id}/approve`,
      { approvedBy, approvedHours }
    );
    return response.request;
  }

  static async rejectOvertime(id: string, rejectedBy: string, reason: string): Promise<OvertimeRequest> {
    const response = await APIClient.post<{ request: OvertimeRequest }>(
      `${this.endpoint}/${id}/reject`,
      { rejectedBy, reason }
    );
    return response.request;
  }

  static async getOvertimeManagement(filters?: {
    department?: string;
    status?: string;
    month?: string;
  }): Promise<any[]> {
    try {
      const response = await APIClient.get<{ data?: any[] }>(this.managementEndpoint, filters);
      return response.data || [];
    } catch (error) {
            return [];
    }
  }
}

// ============================================================================
// ANALYTICS & METRICS SERVICE
// ============================================================================

export class AttendanceAnalyticsService {
  private static endpoint = '/attendance';

  static async getMetrics(): Promise<AttendanceMetrics> {
    try {
      const response = await APIClient.get<{ metrics?: AttendanceMetrics }>(this.endpoint, {
        type: 'summary',
      });
      return (
        response.metrics || {
          totalEmployees: 0,
          presentToday: 0,
          absentToday: 0,
          onLeaveToday: 0,
          lateToday: 0,
          averageAttendanceRate: 0,
          averagePunctualityRate: 0,
          totalOvertimeHours: 0,
          pendingRegularizations: 0,
          pendingOvertimeRequests: 0,
          departmentAttendance: [],
          attendanceTrend: [],
          topAbsentees: [],
          topLatecomers: [],
          overtimeByDepartment: [],
        }
      );
    } catch (error) {
            return {
        totalEmployees: 0,
        presentToday: 0,
        absentToday: 0,
        onLeaveToday: 0,
        lateToday: 0,
        averageAttendanceRate: 0,
        averagePunctualityRate: 0,
        totalOvertimeHours: 0,
        pendingRegularizations: 0,
        pendingOvertimeRequests: 0,
        departmentAttendance: [],
        attendanceTrend: [],
        topAbsentees: [],
        topLatecomers: [],
        overtimeByDepartment: [],
      };
    }
  }

  static async getExceptions(filters?: { date?: string; type?: string; status?: string }): Promise<any[]> {
    try {
      const response = await APIClient.get<{ exceptions?: any[] }>('/attendance/exceptions', filters);
      return response.exceptions || [];
    } catch (error) {
            return [];
    }
  }
}

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

export class AttendanceSettingsService {
  private static endpoint = '/attendance/settings';

  static async getSettings(): Promise<AttendanceSettings> {
    try {
      const response = await APIClient.get<{ settings?: AttendanceSettings }>(this.endpoint);
      return (
        response.settings || {
          workingDaysPerWeek: 5,
          weekendDays: [0, 6],
          standardWorkingHours: 8,
          enableBiometric: true,
          enableGeofencing: false,
          enableMobileCheckIn: true,
          requirePhotoOnCheckIn: false,
          autoMarkAbsent: true,
          autoMarkAbsentAfterHours: 4,
          enableOvertimeTracking: true,
          overtimeAutoApproval: false,
          maxOvertimeHoursPerDay: 4,
          maxOvertimeHoursPerMonth: 40,
          enableShiftRotation: false,
          enableAttendanceRegularization: true,
          regularizationRequiresApproval: true,
          regularizationDeadlineDays: 7,
          enableWFH: true,
          wfhRequiresApproval: true,
          maxWFHDaysPerMonth: 10,
          notificationEmail: 'hr@company.com',
          hrNotificationEmail: 'hr@company.com',
          managerNotificationEmail: '',
          sendDailySummary: true,
          sendWeeklySummary: true,
          sendMonthlySummary: true,
        }
      );
    } catch (error) {
            return {
        workingDaysPerWeek: 5,
        weekendDays: [0, 6],
        standardWorkingHours: 8,
        enableBiometric: true,
        enableGeofencing: false,
        enableMobileCheckIn: true,
        requirePhotoOnCheckIn: false,
        autoMarkAbsent: true,
        autoMarkAbsentAfterHours: 4,
        enableOvertimeTracking: true,
        overtimeAutoApproval: false,
        maxOvertimeHoursPerDay: 4,
        maxOvertimeHoursPerMonth: 40,
        enableShiftRotation: false,
        enableAttendanceRegularization: true,
        regularizationRequiresApproval: true,
        regularizationDeadlineDays: 7,
        enableWFH: true,
        wfhRequiresApproval: true,
        maxWFHDaysPerMonth: 10,
        notificationEmail: 'hr@company.com',
        hrNotificationEmail: 'hr@company.com',
        managerNotificationEmail: '',
        sendDailySummary: true,
        sendWeeklySummary: true,
        sendMonthlySummary: true,
      };
    }
  }

  static async updateSettings(updates: Partial<AttendanceSettings>): Promise<AttendanceSettings> {
    const response = await APIClient.put<{ settings: AttendanceSettings }>(this.endpoint, updates);
    return response.settings;
  }
}

// ============================================================================
// COMP-OFF SERVICE
// ============================================================================

export class CompOffService {
  private static endpoint = '/attendance/comp-off';

  static async getCompOffs(filters?: {
    employeeId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any[]> {
    try {
      const response = await APIClient.get<{ compOffs?: any[] }>(this.endpoint, filters);
      return response.compOffs || [];
    } catch (error) {
            return [];
    }
  }

  static async submitCompOff(compOff: {
    employeeId: string;
    date: string;
    hours: number;
    reason: string;
  }): Promise<any> {
    const response = await APIClient.post<{ compOff: any }>(this.endpoint, compOff);
    return response.compOff;
  }

  static async getCompOffSummary(employeeId: string): Promise<any> {
    try {
      const response = await APIClient.get<{ summary?: any }>(`${this.endpoint}/summary`, { employeeId });
      return response.summary || { totalEarned: 0, totalUsed: 0, balance: 0 };
    } catch (error) {
            return { totalEarned: 0, totalUsed: 0, balance: 0 };
    }
  }
}

// ============================================================================
// WORK FROM HOME SERVICE
// ============================================================================

export class WFHService {
  private static endpoint = '/attendance/wfh';

  static async getWFHRequests(filters?: {
    employeeId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<WFHRequest[]> {
    try {
      const response = await APIClient.get<{ requests?: WFHRequest[]; wfhRequests?: WFHRequest[] }>(
        this.endpoint,
        filters
      );
      return response.requests || response.wfhRequests || [];
    } catch (error) {
            return [];
    }
  }

  static async submitWFHRequest(request: Partial<WFHRequest>): Promise<WFHRequest> {
    const response = await APIClient.post<{ request: WFHRequest }>(this.endpoint, request);
    return response.request;
  }

  static async approveWFHRequest(id: string, approverId: string, comments?: string): Promise<WFHRequest> {
    const response = await APIClient.post<{ request: WFHRequest }>(
      `${this.endpoint}/${id}/approve`,
      { approverId, comments }
    );
    return response.request;
  }

  static async rejectWFHRequest(id: string, approverId: string, reason: string): Promise<WFHRequest> {
    const response = await APIClient.post<{ request: WFHRequest }>(
      `${this.endpoint}/${id}/reject`,
      { approverId, reason }
    );
    return response.request;
  }

  static async getWFHSummary(employeeId: string, month: string): Promise<any> {
    try {
      const response = await APIClient.get<{ summary?: any }>(`${this.endpoint}/summary`, {
        employeeId,
        month,
      });
      return response.summary || { totalDays: 0, usedDays: 0, remainingDays: 0 };
    } catch (error) {
            return { totalDays: 0, usedDays: 0, remainingDays: 0 };
    }
  }
}

// ============================================================================
// SHIFT SWAP SERVICE
// ============================================================================

export class ShiftSwapService {
  private static endpoint = '/attendance/shift-swap';

  static async getMyShifts(employeeId: string, startDate?: string, endDate?: string): Promise<ShiftAssignment[]> {
    try {
      const response = await APIClient.get<{ shifts?: ShiftAssignment[] }>(`${this.endpoint}/my-shifts`, {
        employeeId,
        startDate,
        endDate,
      });
      return response.shifts || [];
    } catch (error) {
            return [];
    }
  }

  static async getMarketplace(filters?: {
    date?: string;
    shiftId?: string;
    department?: string;
  }): Promise<any[]> {
    try {
      const response = await APIClient.get<{ swaps?: any[] }>(`${this.endpoint}/marketplace`, filters);
      return response.swaps || [];
    } catch (error) {
            return [];
    }
  }

  static async requestSwap(swap: {
    fromEmployeeId: string;
    toEmployeeId?: string;
    shiftId: string;
    date: string;
    reason: string;
  }): Promise<any> {
    const response = await APIClient.post<{ swap: any }>(this.endpoint, swap);
    return response.swap;
  }

  static async acceptSwap(swapId: string, employeeId: string): Promise<any> {
    const response = await APIClient.post<{ swap: any }>(`${this.endpoint}/${swapId}/accept`, { employeeId });
    return response.swap;
  }

  static async rejectSwap(swapId: string, reason: string): Promise<any> {
    const response = await APIClient.post<{ swap: any }>(`${this.endpoint}/${swapId}/reject`, { reason });
    return response.swap;
  }
}

// ============================================================================
// ROSTER SERVICE
// ============================================================================

export class RosterService {
  private static endpoint = '/attendance/roster';

  static async getRosters(filters?: {
    department?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any[]> {
    try {
      const response = await APIClient.get<{ rosters?: any[] }>(this.endpoint, filters);
      return response.rosters || [];
    } catch (error) {
            return [];
    }
  }

  static async assignShiftToEmployee(assignment: {
    employeeId: string;
    shiftId: string;
    date: string;
    workLocationId?: string;
  }): Promise<ShiftAssignment> {
    const response = await APIClient.post<{ assignment: ShiftAssignment }>(
      `${this.endpoint}/assign`,
      assignment
    );
    return response.assignment;
  }

  static async bulkAssignShifts(assignments: {
    employeeIds: string[];
    shiftId: string;
    startDate: string;
    endDate: string;
    workLocationId?: string;
  }): Promise<ShiftAssignment[]> {
    const response = await APIClient.post<{ assignments: ShiftAssignment[] }>(
      `${this.endpoint}/bulk-assign`,
      assignments
    );
    return response.assignments;
  }

  static async deleteAssignment(assignmentId: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/assign/${assignmentId}`);
  }
}

// ============================================================================
// GEO-FENCING SERVICE
// ============================================================================

export class GeoFencingService {
  private static endpoint = '/attendance/geo-fencing';

  static async getGeoFences(): Promise<WorkLocation[]> {
    try {
      const response = await APIClient.get<{ locations?: WorkLocation[]; geoFences?: WorkLocation[] }>(
        this.endpoint
      );
      return response.locations || response.geoFences || [];
    } catch (error) {
            return [];
    }
  }

  static async createGeoFence(geoFence: Partial<WorkLocation>): Promise<WorkLocation> {
    const response = await APIClient.post<{ location: WorkLocation }>(this.endpoint, geoFence);
    return response.location;
  }

  static async updateGeoFence(id: string, updates: Partial<WorkLocation>): Promise<WorkLocation> {
    const response = await APIClient.put<{ location: WorkLocation }>(`${this.endpoint}/${id}`, updates);
    return response.location;
  }

  static async deleteGeoFence(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
  }

  static async validateLocation(latitude: number, longitude: number): Promise<{
    isValid: boolean;
    location?: WorkLocation;
  }> {
    try {
      const response = await APIClient.post<{ isValid: boolean; location?: WorkLocation }>(
        `${this.endpoint}/validate`,
        { latitude, longitude }
      );
      return response;
    } catch (error) {
            return { isValid: false };
    }
  }
}

// ============================================================================
// IP RESTRICTION SERVICE
// ============================================================================

export class IPRestrictionService {
  private static endpoint = '/attendance/ip-restriction';

  static async getIPRules(): Promise<any[]> {
    try {
      const response = await APIClient.get<{ rules?: any[] }>(this.endpoint);
      return response.rules || [];
    } catch (error) {
            return [];
    }
  }

  static async addIPWhitelist(rule: {
    ipAddress: string;
    description?: string;
    departmentId?: string;
  }): Promise<any> {
    const response = await APIClient.post<{ rule: any }>(this.endpoint, rule);
    return response.rule;
  }

  static async removeIPWhitelist(ruleId: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${ruleId}`);
  }

  static async getBlockedAttempts(filters?: {
    startDate?: string;
    endDate?: string;
    ipAddress?: string;
  }): Promise<any[]> {
    try {
      const response = await APIClient.get<{ attempts?: any[] }>(`${this.endpoint}/blocked`, filters);
      return response.attempts || [];
    } catch (error) {
            return [];
    }
  }

  static async validateIP(ipAddress: string): Promise<{ isValid: boolean }> {
    try {
      const response = await APIClient.post<{ isValid: boolean }>(`${this.endpoint}/validate`, { ipAddress });
      return response;
    } catch (error) {
            return { isValid: false };
    }
  }
}

// ============================================================================
// PUNCH RULES SERVICE
// ============================================================================

export class PunchRulesService {
  private static endpoint = '/attendance/punch-rules';

  static async getPunchRules(): Promise<any> {
    try {
      const response = await APIClient.get<{ rules?: any }>(this.endpoint);
      return (
        response.rules || {
          allowEarlyCheckIn: true,
          earlyCheckInMinutes: 30,
          allowLateCheckOut: true,
          lateCheckOutMinutes: 60,
          requirePhoto: false,
          requireGPS: false,
          requireBiometric: false,
          allowMultiplePunches: false,
          autoCheckOutAfterHours: 12,
          gracePeriodMinutes: 15,
        }
      );
    } catch (error) {
            return {
        allowEarlyCheckIn: true,
        earlyCheckInMinutes: 30,
        allowLateCheckOut: true,
        lateCheckOutMinutes: 60,
        requirePhoto: false,
        requireGPS: false,
        requireBiometric: false,
        allowMultiplePunches: false,
        autoCheckOutAfterHours: 12,
        gracePeriodMinutes: 15,
      };
    }
  }

  static async updatePunchRules(rules: any): Promise<any> {
    const response = await APIClient.put<{ rules: any }>(this.endpoint, rules);
    return response.rules;
  }
}

// ============================================================================
// TIME ROUNDING SERVICE
// ============================================================================

export class TimeRoundingService {
  private static endpoint = '/attendance/time-rounding';

  static async getRoundingRules(): Promise<any> {
    try {
      const response = await APIClient.get<{ rules?: any }>(this.endpoint);
      return (
        response.rules || {
          enabled: false,
          checkInRounding: 'none',
          checkOutRounding: 'none',
          roundingInterval: 15,
          roundingType: 'nearest',
        }
      );
    } catch (error) {
            return {
        enabled: false,
        checkInRounding: 'none',
        checkOutRounding: 'none',
        roundingInterval: 15,
        roundingType: 'nearest',
      };
    }
  }

  static async updateRoundingRules(rules: any): Promise<any> {
    const response = await APIClient.put<{ rules: any }>(this.endpoint, rules);
    return response.rules;
  }
}

// ============================================================================
// APPROVAL WORKFLOW SERVICE
// ============================================================================

export class ApprovalWorkflowService {
  private static endpoint = '/attendance/approval-workflow';

  static async getWorkflows(): Promise<any[]> {
    try {
      const response = await APIClient.get<{ workflows?: any[] }>(this.endpoint);
      return response.workflows || [];
    } catch (error) {
            return [];
    }
  }

  static async createWorkflow(workflow: {
    name: string;
    type: string;
    levels: any[];
    conditions?: any;
  }): Promise<any> {
    const response = await APIClient.post<{ workflow: any }>(this.endpoint, workflow);
    return response.workflow;
  }

  static async updateWorkflow(id: string, updates: any): Promise<any> {
    const response = await APIClient.put<{ workflow: any }>(`${this.endpoint}/${id}`, updates);
    return response.workflow;
  }

  static async deleteWorkflow(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
  }
}

// ============================================================================
// FIELD FORCE SERVICE
// ============================================================================

export class FieldForceService {
  private static endpoint = '/attendance/field-force';

  static async getFieldAgents(filters?: { department?: string; status?: string }): Promise<any[]> {
    try {
      const response = await APIClient.get<{ agents?: any[] }>(this.endpoint, filters);
      return response.agents || [];
    } catch (error) {
            return [];
    }
  }

  static async getVisitLogs(filters?: {
    employeeId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any[]> {
    try {
      const response = await APIClient.get<{ visits?: any[] }>(`${this.endpoint}/visits`, filters);
      return response.visits || [];
    } catch (error) {
            return [];
    }
  }

  static async trackAgent(employeeId: string): Promise<any> {
    try {
      const response = await APIClient.get<{ tracking?: any }>(`${this.endpoint}/track/${employeeId}`);
      return response.tracking || null;
    } catch (error) {
            return null;
    }
  }

  static async logVisit(visit: {
    employeeId: string;
    clientName: string;
    location: { latitude: number; longitude: number };
    checkInTime: string;
    checkOutTime?: string;
    notes?: string;
  }): Promise<any> {
    const response = await APIClient.post<{ visit: any }>(`${this.endpoint}/visits`, visit);
    return response.visit;
  }
}

// ============================================================================
// COMP-OFF MANAGEMENT SERVICE
// ============================================================================

export class CompOffManagementService {
  private static endpoint = '/attendance/comp-off-management';

  static async getCompOffData(filters?: {
    department?: string;
    status?: string;
    month?: string;
  }): Promise<any[]> {
    try {
      const response = await APIClient.get<{ data?: any[] }>(this.endpoint, filters);
      return response.data || [];
    } catch (error) {
            return [];
    }
  }

  static async requestCompOffCredit(request: {
    employeeId: string;
    date: string;
    hours: number;
    reason: string;
  }): Promise<any> {
    const response = await APIClient.post<{ request: any }>(this.endpoint, request);
    return response.request;
  }

  static async approveCompOff(id: string, approverId: string, comments?: string): Promise<any> {
    const response = await APIClient.post<{ compOff: any }>(`${this.endpoint}/${id}/approve`, {
      approverId,
      comments,
    });
    return response.compOff;
  }

  static async rejectCompOff(id: string, approverId: string, reason: string): Promise<any> {
    const response = await APIClient.post<{ compOff: any }>(`${this.endpoint}/${id}/reject`, {
      approverId,
      reason,
    });
    return response.compOff;
  }
}
