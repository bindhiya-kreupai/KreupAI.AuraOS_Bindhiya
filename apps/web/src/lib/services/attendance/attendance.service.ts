/**
 * Attendance Processing Service
 * Phase 2: Core Enhancement - Attendance Enhancement
 *
 * Handles attendance processing, overtime calculation, GPS validation
 */

import type {
  AttendanceRecord,
  AttendancePunch,
  AttendanceStatus,
  PunchType,
  PunchSource,
  ShiftType,
  WorkLocation,
  OvertimeRecord,
  OvertimeType,
  GPSPunchRequest,
  GPSValidationResult,
  RegularizationRequest,
  AttendanceProcessingInput,
  AttendanceProcessingResult,
  AttendanceProcessingError,
  MonthlyAttendanceSummary,
  AttendanceCalendarEntry} from './types';
import {
  OvertimePolicy
} from './types';
import type { SupportedCountryCode } from '../compliance/types';
import { LabourLawService } from '../compliance/labour-law.service';

// ============================================================================
// ATTENDANCE SERVICE
// ============================================================================

export class AttendanceService {
  /**
   * Process daily attendance for all employees
   */
  static async processDailyAttendance(
    input: AttendanceProcessingInput
  ): Promise<AttendanceProcessingResult> {
    const { tenantId, date, employeeIds, reprocess } = input;

    const employees = await this.getActiveEmployees(tenantId, employeeIds);
    const holidays = await this.getHolidays(tenantId, date);
    const leaves = await this.getApprovedLeaves(tenantId, date);

    const errors: AttendanceProcessingError[] = [];
    let processed = 0;
    let present = 0;
    let absent = 0;
    let onLeave = 0;
    let holiday = 0;
    let late = 0;
    let earlyOut = 0;
    let overtime = 0;

    for (const employee of employees) {
      try {
        // Check if holiday
        if (this.isHoliday(holidays, date, employee.locationId)) {
          await this.createHolidayRecord(tenantId, employee.id, date, holidays);
          holiday++;
          processed++;
          continue;
        }

        // Check if weekend
        if (this.isWeekend(date, employee.countryCode)) {
          await this.createWeekendRecord(tenantId, employee.id, date);
          processed++;
          continue;
        }

        // Check if on approved leave
        const employeeLeave = leaves.find(l => l.employeeId === employee.id);
        if (employeeLeave) {
          await this.createLeaveRecord(tenantId, employee.id, date, employeeLeave);
          onLeave++;
          processed++;
          continue;
        }

        // Get shift for employee
        const shift = await this.getEmployeeShift(employee.id, date, employee.countryCode);
        if (!shift) {
          errors.push({
            employeeId: employee.id,
            employeeName: employee.name,
            errorCode: 'NO_SHIFT',
            message: 'No shift assigned',
          });
          continue;
        }

        // Get raw punches
        const punches = await this.getRawPunches(employee.id, date);

        // Calculate attendance
        const record = this.calculateAttendance(employee, shift, punches, date);

        // Save record
        await this.saveAttendanceRecord(record);

        // Update counters
        processed++;
        if (record.status === 'PRESENT' || record.status === 'HALF_DAY') {
          present++;
          if (record.isLate) late++;
          if (record.isEarlyOut) earlyOut++;
          if (record.overtimeMinutes > 0) overtime++;
        } else if (record.status === 'ABSENT') {
          absent++;
        }
      } catch {
        errors.push({
          employeeId: employee.id,
          employeeName: employee.name,
          errorCode: 'PROCESSING_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      date,
      totalEmployees: employees.length,
      processed,
      present,
      absent,
      onLeave,
      holiday,
      late,
      earlyOut,
      overtime,
      errors,
    };
  }

  /**
   * Calculate attendance from punches
   */
  static calculateAttendance(
    employee: EmployeeData,
    shift: ShiftType,
    punches: AttendancePunch[],
    date: string
  ): AttendanceRecord {
    // Sort punches by time
    const sortedPunches = [...punches].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Find first check-in and last check-out
    const checkIns = sortedPunches.filter(p => p.type === 'CHECK_IN');
    const checkOuts = sortedPunches.filter(p => p.type === 'CHECK_OUT');
    const breaks = sortedPunches.filter(
      p => p.type === 'BREAK_START' || p.type === 'BREAK_END'
    );

    const firstCheckIn = checkIns[0];
    const lastCheckOut = checkOuts[checkOuts.length - 1];

    // Determine status
    let status: AttendanceStatus = 'ABSENT';
    let totalWorkedMinutes = 0;
    let totalBreakMinutes = 0;
    let lateMinutes = 0;
    let earlyOutMinutes = 0;
    let overtimeMinutes = 0;
    let isLate = false;
    let isEarlyOut = false;

    if (firstCheckIn && lastCheckOut) {
      // Calculate worked time
      const checkInTime = this.timeToMinutes(firstCheckIn.time);
      const checkOutTime = this.timeToMinutes(lastCheckOut.time);
      totalWorkedMinutes = checkOutTime - checkInTime;

      // Calculate break time
      totalBreakMinutes = this.calculateBreakMinutes(breaks);
      const effectiveWorkedMinutes = totalWorkedMinutes - totalBreakMinutes;

      // Check late arrival
      const scheduledIn = this.timeToMinutes(shift.startTime);
      if (checkInTime > scheduledIn + shift.graceMinutesIn) {
        isLate = true;
        lateMinutes = checkInTime - scheduledIn;
      }

      // Check early departure
      const scheduledOut = this.timeToMinutes(shift.endTime);
      if (checkOutTime < scheduledOut - shift.graceMinutesOut) {
        isEarlyOut = true;
        earlyOutMinutes = scheduledOut - checkOutTime;
      }

      // Determine status
      if (effectiveWorkedMinutes >= shift.minHoursForFullDay * 60) {
        status = 'PRESENT';
      } else if (effectiveWorkedMinutes >= shift.minHoursForHalfDay * 60) {
        status = 'HALF_DAY';
      } else {
        status = 'ABSENT';
      }

      // Calculate overtime
      if (effectiveWorkedMinutes > shift.workingHours * 60 + shift.overtimeAfterMinutes) {
        overtimeMinutes = effectiveWorkedMinutes - shift.workingHours * 60;
        if (overtimeMinutes < shift.minOvertimeMinutes) {
          overtimeMinutes = 0;
        }
      }
    } else if (firstCheckIn && !lastCheckOut) {
      // Only check-in, no check-out
      status = 'HALF_DAY';
      const scheduledIn = this.timeToMinutes(shift.startTime);
      const checkInTime = this.timeToMinutes(firstCheckIn.time);
      if (checkInTime > scheduledIn + shift.graceMinutesIn) {
        isLate = true;
        lateMinutes = checkInTime - scheduledIn;
      }
    }

    return {
      id: this.generateId(),
      tenantId: employee.tenantId,
      employeeId: employee.id,
      employeeName: employee.name,
      employeeCode: employee.code,
      department: employee.department,
      date,
      shiftId: shift.id,
      shiftName: shift.name,
      scheduledIn: shift.startTime,
      scheduledOut: shift.endTime,
      punches: sortedPunches,
      firstCheckIn: firstCheckIn?.time,
      lastCheckOut: lastCheckOut?.time,
      totalWorkedMinutes,
      totalBreakMinutes,
      effectiveWorkedMinutes: totalWorkedMinutes - totalBreakMinutes,
      overtimeMinutes,
      status,
      isLate,
      isEarlyOut,
      lateMinutes,
      earlyOutMinutes,
      isRemote: sortedPunches.some(p => !p.isWithinGeofence),
      isRegularized: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Calculate overtime with country-specific rates
   */
  static calculateOvertime(
    record: AttendanceRecord,
    countryCode: SupportedCountryCode,
    hourlyRate: number
  ): OvertimeRecord | null {
    if (record.overtimeMinutes <= 0) return null;

    const labourLaw = LabourLawService.getConfig(countryCode);
    const { overtimeRates } = labourLaw;

    // Determine overtime type
    let overtimeType: OvertimeType = 'NORMAL';
    let rateMultiplier = overtimeRates.normal;

    // Check if weekend
    if (this.isWeekend(record.date, countryCode)) {
      overtimeType = 'WEEKEND';
      rateMultiplier = overtimeRates.friday || overtimeRates.holiday;
    }
    // Check if night hours
    else if (this.isNightOvertime(record.lastCheckOut || '', labourLaw.overtimeRates)) {
      overtimeType = 'NIGHT';
      rateMultiplier = overtimeRates.night;
    }

    const calculatedAmount = (record.overtimeMinutes / 60) * hourlyRate * rateMultiplier;

    return {
      id: this.generateId(),
      tenantId: record.tenantId,
      attendanceRecordId: record.id,
      employeeId: record.employeeId,
      date: record.date,
      overtimeMinutes: record.overtimeMinutes,
      overtimeType,
      rateMultiplier,
      hourlyRate,
      calculatedAmount: Math.round(calculatedAmount * 100) / 100,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Validate GPS punch
   */
  static async validateGPSPunch(request: GPSPunchRequest): Promise<GPSValidationResult> {
    const { latitude, longitude, accuracy } = request;

    // Get employee's assigned locations
    const locations = await this.getEmployeeLocations(request.employeeId);

    if (locations.length === 0) {
      return {
        isValid: true,
        distanceMeters: 0,
        isWithinGeofence: true,
        message: 'No location restriction configured',
        messageAr: 'لا يوجد تقييد للموقع',
      };
    }

    // Find nearest location
    let nearestLocation: WorkLocation | undefined;
    let minDistance = Infinity;

    for (const location of locations) {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        location.latitude,
        location.longitude
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestLocation = location;
      }
    }

    if (!nearestLocation) {
      return {
        isValid: false,
        distanceMeters: minDistance,
        isWithinGeofence: false,
        message: 'No valid work location found',
        messageAr: 'لم يتم العثور على موقع عمل صالح',
      };
    }

    const isWithinGeofence = minDistance <= nearestLocation.radiusMeters;

    // Check if remote punch is allowed
    if (!isWithinGeofence && !nearestLocation.allowRemotePunch) {
      return {
        isValid: false,
        nearestLocation,
        distanceMeters: Math.round(minDistance),
        isWithinGeofence: false,
        message: `You are ${Math.round(minDistance)}m away from ${nearestLocation.name}. Remote punch not allowed.`,
        messageAr: `أنت على بعد ${Math.round(minDistance)} متر من ${nearestLocation.nameAr}. لا يُسمح بالحضور عن بُعد.`,
      };
    }

    // Check GPS accuracy
    if (accuracy > 100) {
      return {
        isValid: false,
        nearestLocation,
        distanceMeters: Math.round(minDistance),
        isWithinGeofence,
        message: 'GPS accuracy is too low. Please try again in an open area.',
        messageAr: 'دقة GPS منخفضة جداً. يرجى المحاولة في منطقة مفتوحة.',
      };
    }

    return {
      isValid: true,
      nearestLocation,
      distanceMeters: Math.round(minDistance),
      isWithinGeofence,
      message: isWithinGeofence
        ? `Punch recorded at ${nearestLocation.name}`
        : `Remote punch recorded (${Math.round(minDistance)}m from ${nearestLocation.name})`,
      messageAr: isWithinGeofence
        ? `تم تسجيل الحضور في ${nearestLocation.nameAr}`
        : `تم تسجيل الحضور عن بُعد (${Math.round(minDistance)} متر من ${nearestLocation.nameAr})`,
    };
  }

  /**
   * Record a punch
   */
  static async recordPunch(
    employeeId: string,
    punchType: PunchType,
    source: PunchSource,
    location?: { latitude: number; longitude: number },
    deviceId?: string,
    photoUrl?: string
  ): Promise<AttendancePunch> {
    const now = new Date();
    const time = now.toTimeString().substring(0, 8);

    // Validate GPS if location provided
    let isWithinGeofence = true;
    let locationName: string | undefined;

    if (location) {
      const validation = await this.validateGPSPunch({
        employeeId,
        punchType,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: 10,
        timestamp: now,
        deviceId,
      });

      isWithinGeofence = validation.isWithinGeofence;
      locationName = validation.nearestLocation?.name;

      if (!validation.isValid) {
        throw new Error(validation.message);
      }
    }

    const punch: AttendancePunch = {
      id: this.generateId(),
      type: punchType,
      time,
      timestamp: now,
      source,
      latitude: location?.latitude,
      longitude: location?.longitude,
      locationName,
      isWithinGeofence,
      deviceId,
      photoUrl,
      isValid: true,
    };

    // Save punch to database
    await this.savePunch(employeeId, punch);

    return punch;
  }

  /**
   * Get monthly attendance summary for an employee
   */
  static async getMonthlyAttendance(
    employeeId: string,
    month: string
  ): Promise<MonthlyAttendanceSummary> {
    const [year, monthNum] = month.split('-').map(Number);
    const daysInMonth = new Date(year, monthNum, 0).getDate();

    const records = await this.getAttendanceRecords(employeeId, month);
    const employee = await this.getEmployee(employeeId);

    const calendar: AttendanceCalendarEntry[] = [];
    let presentDays = 0;
    let absentDays = 0;
    let leaveDays = 0;
    let holidayDays = 0;
    let weekendDays = 0;
    let wfhDays = 0;
    let lateDays = 0;
    let earlyOutDays = 0;
    let totalWorkedHours = 0;
    let totalOvertimeHours = 0;
    let lossOfPayDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${month}-${String(day).padStart(2, '0')}`;
      const dayDate = new Date(year, monthNum - 1, day);
      const dayOfWeek = dayDate.toLocaleDateString('en-US', { weekday: 'long' });

      const record = records.find(r => r.date === date);

      let entry: AttendanceCalendarEntry;

      if (record) {
        entry = {
          date,
          dayOfWeek,
          status: record.status,
          checkIn: record.firstCheckIn,
          checkOut: record.lastCheckOut,
          workedHours: record.effectiveWorkedMinutes / 60,
          isLate: record.isLate,
          isHoliday: record.status === 'HOLIDAY',
          holidayName: record.status === 'HOLIDAY' ? record.remarks : undefined,
          leaveType: record.leaveType,
          remarks: record.remarks,
        };

        // Update counters
        switch (record.status) {
          case 'PRESENT':
            presentDays++;
            totalWorkedHours += record.effectiveWorkedMinutes / 60;
            totalOvertimeHours += record.overtimeMinutes / 60;
            if (record.isLate) lateDays++;
            if (record.isEarlyOut) earlyOutDays++;
            break;
          case 'HALF_DAY':
            presentDays += 0.5;
            lossOfPayDays += 0.5;
            totalWorkedHours += record.effectiveWorkedMinutes / 60;
            break;
          case 'ABSENT':
            absentDays++;
            lossOfPayDays++;
            break;
          case 'ON_LEAVE':
            leaveDays++;
            break;
          case 'HOLIDAY':
            holidayDays++;
            break;
          case 'WEEKEND':
            weekendDays++;
            break;
          case 'WFH':
            wfhDays++;
            presentDays++;
            totalWorkedHours += record.effectiveWorkedMinutes / 60;
            break;
        }
      } else {
        // No record - check if weekend
        const isWeekend = this.isWeekend(date, employee?.countryCode || 'AE');
        entry = {
          date,
          dayOfWeek,
          status: isWeekend ? 'WEEKEND' : 'ABSENT',
          workedHours: 0,
          isLate: false,
          isHoliday: false,
        };

        if (isWeekend) {
          weekendDays++;
        } else {
          absentDays++;
          lossOfPayDays++;
        }
      }

      calendar.push(entry);
    }

    const workingDays = daysInMonth - weekendDays - holidayDays;

    return {
      employeeId,
      month,
      totalDays: daysInMonth,
      workingDays,
      presentDays,
      absentDays,
      leaveDays,
      holidayDays,
      weekendDays,
      wfhDays,
      lateDays,
      earlyOutDays,
      totalWorkedHours: Math.round(totalWorkedHours * 100) / 100,
      totalOvertimeHours: Math.round(totalOvertimeHours * 100) / 100,
      lossOfPayDays,
      calendar,
    };
  }

  /**
   * Submit regularization request
   */
  static async submitRegularization(
    request: Omit<RegularizationRequest, 'id' | 'status' | 'approvers' | 'currentApproverLevel' | 'createdAt' | 'updatedAt'>
  ): Promise<RegularizationRequest> {
    // Get approval workflow
    const approvers = await this.getRegularizationApprovers(request.employeeId);

    const regularization: RegularizationRequest = {
      ...request,
      id: this.generateId(),
      status: 'PENDING',
      approvers: approvers.map((a, index) => ({
        level: index + 1,
        approverId: a.id,
        approverName: a.name,
      })),
      currentApproverLevel: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.saveRegularization(regularization);

    return regularization;
  }

  /**
   * Approve/Reject regularization
   */
  static async processRegularization(
    regularizationId: string,
    approverId: string,
    action: 'APPROVED' | 'REJECTED',
    comments?: string
  ): Promise<RegularizationRequest> {
    const regularization = await this.getRegularization(regularizationId);
    if (!regularization) throw new Error('Regularization not found');

    const currentApprover = regularization.approvers.find(
      a => a.level === regularization.currentApproverLevel && a.approverId === approverId
    );

    if (!currentApprover) throw new Error('Not authorized to approve');

    currentApprover.action = action;
    currentApprover.comments = comments;
    currentApprover.actionAt = new Date();

    if (action === 'REJECTED') {
      regularization.status = 'REJECTED';
    } else if (regularization.currentApproverLevel >= regularization.approvers.length) {
      regularization.status = 'APPROVED';
      // Apply regularization to attendance record
      await this.applyRegularization(regularization);
    } else {
      regularization.currentApproverLevel++;
    }

    regularization.updatedAt = new Date();
    await this.saveRegularization(regularization);

    return regularization;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private static calculateBreakMinutes(breaks: AttendancePunch[]): number {
    let totalBreak = 0;
    let breakStart: AttendancePunch | null = null;

    for (const punch of breaks) {
      if (punch.type === 'BREAK_START') {
        breakStart = punch;
      } else if (punch.type === 'BREAK_END' && breakStart) {
        const startMinutes = this.timeToMinutes(breakStart.time);
        const endMinutes = this.timeToMinutes(punch.time);
        totalBreak += endMinutes - startMinutes;
        breakStart = null;
      }
    }

    return totalBreak;
  }

  private static isWeekend(date: string, countryCode: SupportedCountryCode): boolean {
    const labourLaw = LabourLawService.getConfig(countryCode);
    const dayDate = new Date(date);
    const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'long' });
    return labourLaw.weekendDays.includes(dayName);
  }

  private static isNightOvertime(
    checkOutTime: string,
    rates: { nightShiftStart?: string; nightShiftEnd?: string }
  ): boolean {
    if (!rates.nightShiftStart || !checkOutTime) return false;

    const checkOut = this.timeToMinutes(checkOutTime);
    const nightStart = this.timeToMinutes(rates.nightShiftStart);
    const nightEnd = rates.nightShiftEnd
      ? this.timeToMinutes(rates.nightShiftEnd)
      : this.timeToMinutes('06:00');

    if (nightStart > nightEnd) {
      // Night shift crosses midnight
      return checkOut >= nightStart || checkOut <= nightEnd;
    }
    return checkOut >= nightStart && checkOut <= nightEnd;
  }

  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private static generateId(): string {
    return `att_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private static isHoliday(
    holidays: Holiday[],
    date: string,
    locationId?: string
  ): boolean {
    return holidays.some(
      h =>
        h.date === date &&
        (!h.locationIds || h.locationIds.length === 0 || (locationId && h.locationIds.includes(locationId)))
    );
  }

  // ============================================================================
  // DATABASE OPERATIONS (Stubs)
  // ============================================================================

  private static async getActiveEmployees(
    tenantId: string,
    employeeIds?: string[]
  ): Promise<EmployeeData[]> {
    return [];
  }

  private static async getHolidays(tenantId: string, date: string): Promise<Holiday[]> {
    return [];
  }

  private static async getApprovedLeaves(
    tenantId: string,
    date: string
  ): Promise<LeaveRecord[]> {
    return [];
  }

  private static async getEmployeeShift(
    employeeId: string,
    date: string,
    countryCode: SupportedCountryCode
  ): Promise<ShiftType | null> {
    return null;
  }

  private static async getRawPunches(
    employeeId: string,
    date: string
  ): Promise<AttendancePunch[]> {
    return [];
  }

  private static async saveAttendanceRecord(record: AttendanceRecord): Promise<void> {}

  private static async savePunch(employeeId: string, punch: AttendancePunch): Promise<void> {}

  private static async getEmployeeLocations(employeeId: string): Promise<WorkLocation[]> {
    return [];
  }

  private static async createHolidayRecord(
    tenantId: string,
    employeeId: string,
    date: string,
    holidays: Holiday[]
  ): Promise<void> {}

  private static async createWeekendRecord(
    tenantId: string,
    employeeId: string,
    date: string
  ): Promise<void> {}

  private static async createLeaveRecord(
    tenantId: string,
    employeeId: string,
    date: string,
    leave: LeaveRecord
  ): Promise<void> {}

  private static async getAttendanceRecords(
    employeeId: string,
    month: string
  ): Promise<AttendanceRecord[]> {
    return [];
  }

  private static async getEmployee(employeeId: string): Promise<EmployeeData | null> {
    return null;
  }

  private static async getRegularizationApprovers(
    employeeId: string
  ): Promise<{ id: string; name: string }[]> {
    return [];
  }

  private static async saveRegularization(request: RegularizationRequest): Promise<void> {}

  private static async getRegularization(id: string): Promise<RegularizationRequest | null> {
    return null;
  }

  private static async applyRegularization(request: RegularizationRequest): Promise<void> {}
}

// ============================================================================
// HELPER TYPES
// ============================================================================

interface EmployeeData {
  id: string;
  name: string;
  code: string;
  department: string;
  tenantId: string;
  countryCode: SupportedCountryCode;
  locationId?: string;
}

interface Holiday {
  date: string;
  name: string;
  locationIds?: string[];
}

interface LeaveRecord {
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
}

export default AttendanceService;
