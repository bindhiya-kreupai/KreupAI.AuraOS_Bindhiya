// Attendance Module Services
import type {
  Shift, ShiftAssignment, AttendanceRecord, AttendanceCheck, AttendanceRegularization,
  OvertimeRequest, BiometricDevice, AttendancePolicy, WorkLocation, WFHRequest,
  AttendanceMetrics, AttendanceSettings, MonthlyAttendanceReport
} from './types';

const STORAGE_KEYS = {
  SHIFTS: 'attendance_shifts',
  SHIFT_ASSIGNMENTS: 'attendance_shift_assignments',
  RECORDS: 'attendance_records',
  CHECKS: 'attendance_checks',
  REGULARIZATIONS: 'attendance_regularizations',
  OVERTIME: 'attendance_overtime',
  DEVICES: 'attendance_devices',
  POLICIES: 'attendance_policies',
  LOCATIONS: 'attendance_locations',
  WFH: 'attendance_wfh',
  METRICS: 'attendance_metrics',
  SETTINGS: 'attendance_settings',
};

export class ShiftService {
  static async getShifts(): Promise<Shift[]> {
    const data = localStorage.getItem(STORAGE_KEYS.SHIFTS);
    return data ? JSON.parse(data) : [];
  }
  static async createShift(shift: Shift): Promise<Shift> {
    const shifts = await this.getShifts();
    shifts.push(shift);
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
    return shift;
  }
  static async updateShift(id: string, updates: Partial<Shift>): Promise<Shift> {
    const shifts = await this.getShifts();
    const index = shifts.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Shift not found');
    shifts[index] = { ...shifts[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
    return shifts[index];
  }
}

export class AttendanceRecordService {
  static async getRecords(filters?: { employeeId?: string; date?: string; startDate?: string; endDate?: string }): Promise<AttendanceRecord[]> {
    const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
    let records: AttendanceRecord[] = data ? JSON.parse(data) : [];
    if (filters) {
      if (filters.employeeId) records = records.filter(r => r.employeeId === filters.employeeId);
      if (filters.date) records = records.filter(r => r.date === filters.date);
      if (filters.startDate && filters.endDate) {
        records = records.filter(r => r.date >= filters.startDate! && r.date <= filters.endDate!);
      }
    }
    return records;
  }
  static async createRecord(record: AttendanceRecord): Promise<AttendanceRecord> {
    const records = await this.getRecords();
    records.push(record);
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    return record;
  }
  static async updateRecord(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const records = await this.getRecords();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Record not found');
    records[index] = { ...records[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    return records[index];
  }
}

export class AttendanceCheckService {
  static async recordCheck(check: AttendanceCheck): Promise<AttendanceCheck> {
    const data = localStorage.getItem(STORAGE_KEYS.CHECKS);
    const checks: AttendanceCheck[] = data ? JSON.parse(data) : [];
    checks.push(check);
    localStorage.setItem(STORAGE_KEYS.CHECKS, JSON.stringify(checks));
    return check;
  }
  static async getChecks(filters?: { employeeId?: string; date?: string }): Promise<AttendanceCheck[]> {
    const data = localStorage.getItem(STORAGE_KEYS.CHECKS);
    let checks: AttendanceCheck[] = data ? JSON.parse(data) : [];
    if (filters) {
      if (filters.employeeId) checks = checks.filter(c => c.employeeId === filters.employeeId);
      if (filters.date) checks = checks.filter(c => c.date === filters.date);
    }
    return checks;
  }
}

export class RegularizationService {
  static async submitRegularization(regularization: AttendanceRegularization): Promise<AttendanceRegularization> {
    const data = localStorage.getItem(STORAGE_KEYS.REGULARIZATIONS);
    const regularizations: AttendanceRegularization[] = data ? JSON.parse(data) : [];
    regularizations.push(regularization);
    localStorage.setItem(STORAGE_KEYS.REGULARIZATIONS, JSON.stringify(regularizations));
    return regularization;
  }
  static async approveRegularization(id: string, reviewedBy: string, comments?: string): Promise<AttendanceRegularization> {
    const data = localStorage.getItem(STORAGE_KEYS.REGULARIZATIONS);
    const regularizations: AttendanceRegularization[] = data ? JSON.parse(data) : [];
    const index = regularizations.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Regularization not found');
    regularizations[index] = { ...regularizations[index], status: 'approved', reviewedBy, reviewedDate: new Date().toISOString(), reviewComments: comments };
    localStorage.setItem(STORAGE_KEYS.REGULARIZATIONS, JSON.stringify(regularizations));
    return regularizations[index];
  }
  static async rejectRegularization(id: string, reviewedBy: string, reason: string): Promise<AttendanceRegularization> {
    const data = localStorage.getItem(STORAGE_KEYS.REGULARIZATIONS);
    const regularizations: AttendanceRegularization[] = data ? JSON.parse(data) : [];
    const index = regularizations.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Regularization not found');
    regularizations[index] = { ...regularizations[index], status: 'rejected', reviewedBy, reviewedDate: new Date().toISOString(), reviewComments: reason };
    localStorage.setItem(STORAGE_KEYS.REGULARIZATIONS, JSON.stringify(regularizations));
    return regularizations[index];
  }
}

export class OvertimeService {
  static async submitOvertimeRequest(request: OvertimeRequest): Promise<OvertimeRequest> {
    const data = localStorage.getItem(STORAGE_KEYS.OVERTIME);
    const requests: OvertimeRequest[] = data ? JSON.parse(data) : [];
    requests.push(request);
    localStorage.setItem(STORAGE_KEYS.OVERTIME, JSON.stringify(requests));
    return request;
  }
  static async approveOvertime(id: string, approvedBy: string, approvedHours?: number): Promise<OvertimeRequest> {
    const data = localStorage.getItem(STORAGE_KEYS.OVERTIME);
    const requests: OvertimeRequest[] = data ? JSON.parse(data) : [];
    const index = requests.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Overtime request not found');
    requests[index] = { ...requests[index], status: 'approved', approvedBy, approvedDate: new Date().toISOString(), approvedHours: approvedHours || requests[index].requestedHours };
    localStorage.setItem(STORAGE_KEYS.OVERTIME, JSON.stringify(requests));
    return requests[index];
  }
}

export class AttendanceAnalyticsService {
  static async getMetrics(): Promise<AttendanceMetrics> {
    const data = localStorage.getItem(STORAGE_KEYS.METRICS);
    return data ? JSON.parse(data) : {
      totalEmployees: 0, presentToday: 0, absentToday: 0, onLeaveToday: 0, lateToday: 0,
      averageAttendanceRate: 0, averagePunctualityRate: 0, totalOvertimeHours: 0,
      pendingRegularizations: 0, pendingOvertimeRequests: 0,
      departmentAttendance: [], attendanceTrend: [], topAbsentees: [], topLatecomers: [], overtimeByDepartment: []
    };
  }
}

export class AttendanceSettingsService {
  static async getSettings(): Promise<AttendanceSettings> {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      workingDaysPerWeek: 5, weekendDays: [0, 6], standardWorkingHours: 8,
      enableBiometric: true, enableGeofencing: false, enableMobileCheckIn: true,
      requirePhotoOnCheckIn: false, autoMarkAbsent: true, autoMarkAbsentAfterHours: 4,
      enableOvertimeTracking: true, overtimeAutoApproval: false,
      maxOvertimeHoursPerDay: 4, maxOvertimeHoursPerMonth: 40,
      enableShiftRotation: false, enableAttendanceRegularization: true,
      regularizationRequiresApproval: true, regularizationDeadlineDays: 7,
      enableWFH: true, wfhRequiresApproval: true, maxWFHDaysPerMonth: 10,
      notificationEmail: 'hr@company.com', hrNotificationEmail: 'hr@company.com',
      managerNotificationEmail: '', sendDailySummary: true, sendWeeklySummary: true, sendMonthlySummary: true
    };
  }
  static async updateSettings(updates: Partial<AttendanceSettings>): Promise<AttendanceSettings> {
    const settings = await this.getSettings();
    const updated = { ...settings, ...updates };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }
}
