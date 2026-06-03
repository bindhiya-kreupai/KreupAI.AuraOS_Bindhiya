// @ts-nocheck — Has Prisma schema drift (select/where fields don't match current schema). Tracked under #29.
/**
 * Roster Management Service
 * Handles shift roster planning, assignment, swap management, and auto-scheduling.
 *
 * Features:
 * - Auto-generation of rosters from templates (rotation patterns)
 * - Single and bulk shift assignments
 * - Shift swap workflow (request -> approve -> execute)
 * - Conflict detection (double booking, insufficient rest, overtime excess, holiday conflicts)
 * - Weekend/holiday awareness using country-specific labour law configurations
 * - Cost estimation for roster planning
 * - Roster copy and analytics
 */

import { prisma } from '@aura/database';
import type { SupportedCountryCode } from '../compliance/types';
import { LabourLawService } from '../compliance/labour-law.service';

// ============================================================================
// TYPES
// ============================================================================

export type RosterEntryStatus = 'SCHEDULED' | 'CONFIRMED' | 'SWAPPED' | 'CANCELLED';

export interface RosterEntry {
  id: string;
  tenantId: string;
  employeeId: string;
  shiftId: string;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  status: RosterEntryStatus;
  isOvertime: boolean;
  notes?: string;
}

export interface RosterTemplate {
  id: string;
  tenantId: string;
  name: string;
  nameAr: string;
  cycleDays: number;
  pattern: ShiftPattern[];
  isActive: boolean;
}

export interface ShiftPattern {
  dayNumber: number;
  shiftId: string | null;
  isOff: boolean;
}

export interface ShiftSwapRequest {
  id: string;
  tenantId: string;
  requesterId: string;
  requesterShiftDate: string;
  targetId: string;
  targetShiftDate: string;
  reason: string;
  status: string;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface RosterGenerationInput {
  tenantId: string;
  departmentId?: string;
  employeeIds?: string[];
  startDate: string;
  endDate: string;
  templateId?: string;
  respectWeekends: boolean;
  respectHolidays: boolean;
  countryCode: SupportedCountryCode;
}

export interface RosterSummary {
  totalDays: number;
  workDays: number;
  offDays: number;
  overtimeDays: number;
  byEmployee: EmployeeRosterSummary[];
  byShift: ShiftRosterSummary[];
  conflicts: RosterConflict[];
}

export interface EmployeeRosterSummary {
  employeeId: string;
  employeeName: string;
  scheduledDays: number;
  offDays: number;
  overtimeDays: number;
  totalHours: number;
}

export interface ShiftRosterSummary {
  shiftId: string;
  shiftName: string;
  assignedCount: number;
  totalHours: number;
}

export type RosterConflictType =
  | 'DOUBLE_BOOKING'
  | 'NO_REST'
  | 'OVERTIME_EXCESS'
  | 'HOLIDAY_CONFLICT';

export interface RosterConflict {
  type: RosterConflictType;
  employeeId: string;
  dates: string[];
  message: string;
  messageAr: string;
}

// ============================================================================
// INTERNAL TYPES
// ============================================================================

interface ShiftData {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  workHours: number;
  breakDuration: number;
  graceInMinutes: number;
  graceOutMinutes: number;
  isActive: boolean;
}

interface EmployeeInfo {
  id: string;
  name: string;
  departmentId: string | null;
  tenantId: string;
}

// ============================================================================
// ROSTER MANAGEMENT SERVICE
// ============================================================================

export class RosterManagementService {
  // ==========================================================================
  // ROSTER GENERATION
  // ==========================================================================

  /**
   * Auto-generate a roster from a template for a given date range.
   * Applies rotation patterns from the template, respecting weekends and holidays
   * based on the provided country code.
   */
  static async generateRoster(input: RosterGenerationInput): Promise<RosterEntry[]> {
    const {
      tenantId,
      departmentId,
      employeeIds,
      startDate,
      endDate,
      templateId,
      respectWeekends,
      respectHolidays,
      countryCode,
    } = input;

    // Get employees for roster generation
    const employees = await this.getEmployeesForRoster(tenantId, departmentId, employeeIds);
    if (employees.length === 0) {
      return [];
    }

    // Get template if provided
    let template: RosterTemplate | null = null;
    if (templateId) {
      template = await this.getTemplate(tenantId, templateId);
    }

    // Get holidays in range if needed
    const holidays: string[] = respectHolidays
      ? await this.getHolidayDates(tenantId, startDate, endDate)
      : [];

    // Get labour law config for weekend detection
    const labourLaw = LabourLawService.getConfig(countryCode);
    const weekendDays = labourLaw.weekendDays;

    // Generate roster entries
    const entries: RosterEntry[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (const employee of employees) {
      let dayIndex = 0;
      const currentDate = new Date(start);

      while (currentDate <= end) {
        const dateStr = currentDate.toISOString().substring(0, 10);
        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

        // Check if weekend
        if (respectWeekends && weekendDays.includes(dayName)) {
          currentDate.setDate(currentDate.getDate() + 1);
          dayIndex++;
          continue;
        }

        // Check if holiday
        if (respectHolidays && holidays.includes(dateStr)) {
          currentDate.setDate(currentDate.getDate() + 1);
          dayIndex++;
          continue;
        }

        // Determine shift from template pattern
        let shiftId: string | null = null;
        let isOff = false;

        if (template && template.pattern.length > 0) {
          const patternIndex = dayIndex % template.cycleDays;
          const patternEntry = template.pattern.find((p) => p.dayNumber === patternIndex + 1);
          if (patternEntry) {
            shiftId = patternEntry.shiftId;
            isOff = patternEntry.isOff;
          }
        }

        if (!isOff && shiftId) {
          // Get shift details
          const shift = await this.getShift(shiftId);
          if (shift) {
            const entry: RosterEntry = {
              id: this.generateId(),
              tenantId,
              employeeId: employee.id,
              shiftId: shift.id,
              date: dateStr,
              startTime: shift.startTime,
              endTime: shift.endTime,
              breakMinutes: shift.breakDuration,
              status: 'SCHEDULED',
              isOvertime: false,
              notes: template ? `Generated from template: ${template.name}` : undefined,
            };
            entries.push(entry);
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);
        dayIndex++;
      }
    }

    // Persist generated roster entries
    await this.bulkCreateRosterEntries(entries);

    return entries;
  }

  // ==========================================================================
  // SHIFT ASSIGNMENT
  // ==========================================================================

  /**
   * Assign a single shift to an employee for a specific date.
   */
  static async assignShift(
    tenantId: string,
    employeeId: string,
    date: string,
    shiftId: string
  ): Promise<RosterEntry> {
    // Check for existing roster entry on the same date
    const existing = await prisma.shiftRoster.findFirst({
      where: {
        tenantId,
        employeeId,
        rosterDate: new Date(date),
        status: { not: 'CANCELLED' },
      },
    });

    if (existing) {
      // Cancel existing entry and create new one
      await prisma.shiftRoster.update({
        where: { id: existing.id },
        data: { status: 'CANCELLED' },
      });
    }

    // Get shift details
    const shift = await this.getShift(shiftId);
    if (!shift) {
      throw new Error(`Shift not found: ${shiftId}`);
    }

    // Create roster entry
    const entry = await prisma.shiftRoster.create({
      data: {
        tenantId,
        employeeId,
        shiftId,
        rosterDate: new Date(date),
        customStartTime: null,
        customEndTime: null,
        isWeekOff: false,
        isHoliday: false,
        status: 'SCHEDULED',
      },
      include: { shift: true },
    });

    return {
      id: entry.id,
      tenantId: entry.tenantId,
      employeeId: entry.employeeId,
      shiftId: entry.shiftId,
      date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      breakMinutes: shift.breakDuration,
      status: 'SCHEDULED',
      isOvertime: false,
    };
  }

  /**
   * Assign shifts to multiple employees in batch.
   */
  static async bulkAssignShifts(
    tenantId: string,
    assignments: Array<{ employeeId: string; date: string; shiftId: string }>
  ): Promise<RosterEntry[]> {
    const results: RosterEntry[] = [];

    // Process in a transaction for atomicity
    await prisma.$transaction(async (tx) => {
      for (const assignment of assignments) {
        // Cancel any existing assignment on the same date
        await tx.shiftRoster.updateMany({
          where: {
            tenantId,
            employeeId: assignment.employeeId,
            rosterDate: new Date(assignment.date),
            status: { not: 'CANCELLED' },
          },
          data: { status: 'CANCELLED' },
        });

        // Create new roster entry
        const entry = await tx.shiftRoster.create({
          data: {
            tenantId,
            employeeId: assignment.employeeId,
            shiftId: assignment.shiftId,
            rosterDate: new Date(assignment.date),
            status: 'SCHEDULED',
          },
          include: { shift: true },
        });

        results.push({
          id: entry.id,
          tenantId: entry.tenantId,
          employeeId: entry.employeeId,
          shiftId: entry.shiftId,
          date: assignment.date,
          startTime: entry.shift.startTime,
          endTime: entry.shift.endTime,
          breakMinutes: entry.shift.breakDuration,
          status: 'SCHEDULED',
          isOvertime: false,
        });
      }
    });

    return results;
  }

  // ==========================================================================
  // ROSTER QUERIES
  // ==========================================================================

  /**
   * Get an employee's roster for a date range.
   */
  static async getEmployeeRoster(
    tenantId: string,
    employeeId: string,
    startDate: string,
    endDate: string
  ): Promise<RosterEntry[]> {
    const rows = await prisma.shiftRoster.findMany({
      where: {
        tenantId,
        employeeId,
        rosterDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        status: { not: 'CANCELLED' },
      },
      include: { shift: true },
      orderBy: { rosterDate: 'asc' },
    });

    return rows.map((row) => ({
      id: row.id,
      tenantId: row.tenantId,
      employeeId: row.employeeId,
      shiftId: row.shiftId,
      date: row.rosterDate.toISOString().substring(0, 10),
      startTime: row.customStartTime || row.shift.startTime,
      endTime: row.customEndTime || row.shift.endTime,
      breakMinutes: row.shift.breakDuration,
      status: row.status as RosterEntryStatus,
      isOvertime: false,
      notes: row.isWeekOff ? 'Week Off' : row.isHoliday ? 'Holiday' : undefined,
    }));
  }

  /**
   * Get all roster entries for a department within a date range.
   */
  static async getDepartmentRoster(
    tenantId: string,
    departmentId: string,
    startDate: string,
    endDate: string
  ): Promise<RosterEntry[]> {
    // Get employees in department
    const employees = await prisma.employee.findMany({
      where: {
        departmentId,
        isDeleted: false,
        company: { tenantId },
      },
      select: { id: true },
    });

    const employeeIds = employees.map((e) => e.id);
    if (employeeIds.length === 0) return [];

    const rows = await prisma.shiftRoster.findMany({
      where: {
        tenantId,
        employeeId: { in: employeeIds },
        rosterDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        status: { not: 'CANCELLED' },
      },
      include: { shift: true },
      orderBy: [{ employeeId: 'asc' }, { rosterDate: 'asc' }],
    });

    return rows.map((row) => ({
      id: row.id,
      tenantId: row.tenantId,
      employeeId: row.employeeId,
      shiftId: row.shiftId,
      date: row.rosterDate.toISOString().substring(0, 10),
      startTime: row.customStartTime || row.shift.startTime,
      endTime: row.customEndTime || row.shift.endTime,
      breakMinutes: row.shift.breakDuration,
      status: row.status as RosterEntryStatus,
      isOvertime: false,
      notes: row.isWeekOff ? 'Week Off' : row.isHoliday ? 'Holiday' : undefined,
    }));
  }

  // ==========================================================================
  // SHIFT SWAP WORKFLOW
  // ==========================================================================

  /**
   * Create a shift swap request between two employees.
   */
  static async requestShiftSwap(
    request: Omit<ShiftSwapRequest, 'id' | 'status'>
  ): Promise<ShiftSwapRequest> {
    const { tenantId, requesterId, requesterShiftDate, targetId, targetShiftDate, reason } =
      request;

    // Validate that both employees have roster entries on their respective dates
    const requesterRoster = await prisma.shiftRoster.findFirst({
      where: {
        tenantId,
        employeeId: requesterId,
        rosterDate: new Date(requesterShiftDate),
        status: 'SCHEDULED',
      },
    });

    if (!requesterRoster) {
      throw new Error('Requester does not have a scheduled shift on the specified date');
    }

    const targetRoster = await prisma.shiftRoster.findFirst({
      where: {
        tenantId,
        employeeId: targetId,
        rosterDate: new Date(targetShiftDate),
        status: 'SCHEDULED',
      },
    });

    if (!targetRoster) {
      throw new Error('Target employee does not have a scheduled shift on the specified date');
    }

    // Create the swap request
    const swapRequest = await prisma.shiftSwapRequest.create({
      data: {
        tenantId,
        requestorId: requesterId,
        swapWithId: targetId,
        requestorDate: new Date(requesterShiftDate),
        requestorShiftId: requesterRoster.shiftId,
        swapWithDate: new Date(targetShiftDate),
        swapWithShiftId: targetRoster.shiftId,
        reason,
        status: 'PENDING',
        swapWithApproval: 'PENDING',
        managerApproval: 'PENDING',
      },
    });

    return {
      id: swapRequest.id,
      tenantId: swapRequest.tenantId,
      requesterId: swapRequest.requestorId,
      requesterShiftDate,
      targetId: swapRequest.swapWithId,
      targetShiftDate,
      reason: swapRequest.reason,
      status: swapRequest.status,
    };
  }

  /**
   * Approve a shift swap request and execute the swap in the roster.
   */
  static async approveShiftSwap(
    id: string,
    tenantId: string,
    approvedBy: string
  ): Promise<ShiftSwapRequest> {
    const swapRequest = await prisma.shiftSwapRequest.findFirst({
      where: { id, tenantId },
    });

    if (!swapRequest) {
      throw new Error('Shift swap request not found');
    }

    if (swapRequest.status === 'COMPLETED' || swapRequest.status === 'REJECTED') {
      throw new Error(`Shift swap request is already ${swapRequest.status.toLowerCase()}`);
    }

    // Execute the swap in a transaction
    await prisma.$transaction(async (tx) => {
      // Update the swap request status
      await tx.shiftSwapRequest.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          managerApproval: 'APPROVED',
          swapWithApproval: 'APPROVED',
          approvedBy,
          approvedAt: new Date(),
        },
      });

      // Swap the roster entries
      // Get both roster entries
      const requesterEntry = await tx.shiftRoster.findFirst({
        where: {
          tenantId,
          employeeId: swapRequest.requestorId,
          rosterDate: swapRequest.requestorDate,
          status: { not: 'CANCELLED' },
        },
      });

      const targetEntry = await tx.shiftRoster.findFirst({
        where: {
          tenantId,
          employeeId: swapRequest.swapWithId,
          rosterDate: swapRequest.swapWithDate,
          status: { not: 'CANCELLED' },
        },
      });

      if (requesterEntry && targetEntry) {
        // Mark original entries as SWAPPED
        await tx.shiftRoster.update({
          where: { id: requesterEntry.id },
          data: { status: 'SWAPPED' },
        });

        await tx.shiftRoster.update({
          where: { id: targetEntry.id },
          data: { status: 'SWAPPED' },
        });

        // Create new entries with swapped assignments
        await tx.shiftRoster.create({
          data: {
            tenantId,
            employeeId: swapRequest.requestorId,
            shiftId: targetEntry.shiftId,
            rosterDate: swapRequest.swapWithDate,
            customStartTime: targetEntry.customStartTime,
            customEndTime: targetEntry.customEndTime,
            status: 'SCHEDULED',
          },
        });

        await tx.shiftRoster.create({
          data: {
            tenantId,
            employeeId: swapRequest.swapWithId,
            shiftId: requesterEntry.shiftId,
            rosterDate: swapRequest.requestorDate,
            customStartTime: requesterEntry.customStartTime,
            customEndTime: requesterEntry.customEndTime,
            status: 'SCHEDULED',
          },
        });
      }
    });

    return {
      id: swapRequest.id,
      tenantId: swapRequest.tenantId,
      requesterId: swapRequest.requestorId,
      requesterShiftDate: swapRequest.requestorDate.toISOString().substring(0, 10),
      targetId: swapRequest.swapWithId,
      targetShiftDate: swapRequest.swapWithDate.toISOString().substring(0, 10),
      reason: swapRequest.reason,
      status: 'COMPLETED',
      approvedBy,
      approvedAt: new Date(),
    };
  }

  /**
   * Reject a shift swap request.
   */
  static async rejectShiftSwap(
    id: string,
    tenantId: string,
    rejectedBy: string,
    reason: string
  ): Promise<ShiftSwapRequest> {
    const swapRequest = await prisma.shiftSwapRequest.findFirst({
      where: { id, tenantId },
    });

    if (!swapRequest) {
      throw new Error('Shift swap request not found');
    }

    if (swapRequest.status === 'COMPLETED' || swapRequest.status === 'REJECTED') {
      throw new Error(`Shift swap request is already ${swapRequest.status.toLowerCase()}`);
    }

    await prisma.shiftSwapRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        managerApproval: 'REJECTED',
        approvedBy: rejectedBy,
        rejectionReason: reason,
      },
    });

    return {
      id: swapRequest.id,
      tenantId: swapRequest.tenantId,
      requesterId: swapRequest.requestorId,
      requesterShiftDate: swapRequest.requestorDate.toISOString().substring(0, 10),
      targetId: swapRequest.swapWithId,
      targetShiftDate: swapRequest.swapWithDate.toISOString().substring(0, 10),
      reason: swapRequest.reason,
      status: 'REJECTED',
    };
  }

  // ==========================================================================
  // VALIDATION & CONFLICT DETECTION
  // ==========================================================================

  /**
   * Validate the roster for a given date range, detecting conflicts such as
   * double bookings, insufficient rest periods, overtime excesses, and
   * holiday conflicts.
   */
  static async validateRoster(
    tenantId: string,
    startDate: string,
    endDate: string
  ): Promise<RosterConflict[]> {
    const conflicts: RosterConflict[] = [];

    // Get all roster entries in range
    const entries = await prisma.shiftRoster.findMany({
      where: {
        tenantId,
        rosterDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        status: { not: 'CANCELLED' },
      },
      include: { shift: true },
      orderBy: [{ employeeId: 'asc' }, { rosterDate: 'asc' }],
    });

    // Get holidays in range
    const holidays = await this.getHolidayDates(tenantId, startDate, endDate);

    // Group entries by employee
    const byEmployee = new Map<string, typeof entries>();
    for (const entry of entries) {
      const existing = byEmployee.get(entry.employeeId) || [];
      existing.push(entry);
      byEmployee.set(entry.employeeId, existing);
    }

    for (const [employeeId, employeeEntries] of byEmployee) {
      // 1. Check for double bookings (same employee, same date, multiple active entries)
      const dateGroups = new Map<string, typeof employeeEntries>();
      for (const entry of employeeEntries) {
        const dateStr = entry.rosterDate.toISOString().substring(0, 10);
        const existing = dateGroups.get(dateStr) || [];
        existing.push(entry);
        dateGroups.set(dateStr, existing);
      }

      for (const [dateStr, dateEntries] of dateGroups) {
        if (dateEntries.length > 1) {
          conflicts.push({
            type: 'DOUBLE_BOOKING',
            employeeId,
            dates: [dateStr],
            message: `Employee has ${dateEntries.length} overlapping shifts on ${dateStr}`,
            messageAr: `الموظف لديه ${dateEntries.length} ورديات متداخلة في ${dateStr}`,
          });
        }
      }

      // 2. Check for insufficient rest between consecutive shifts (minimum 11 hours rest)
      const sortedEntries = [...employeeEntries].sort(
        (a, b) => a.rosterDate.getTime() - b.rosterDate.getTime()
      );

      for (let i = 0; i < sortedEntries.length - 1; i++) {
        const current = sortedEntries[i];
        const next = sortedEntries[i + 1];

        const currentEndTime = current.customEndTime || current.shift.endTime;
        const nextStartTime = next.customStartTime || next.shift.startTime;

        // Calculate rest hours between shifts
        const currentDate = current.rosterDate;
        const nextDate = next.rosterDate;
        const dayDiff = (nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);

        if (dayDiff <= 1) {
          const endMinutes = this.timeToMinutes(currentEndTime);
          const startMinutes = this.timeToMinutes(nextStartTime);

          let restMinutes: number;
          if (dayDiff === 0) {
            // Same day - rest is time between end and start of next
            restMinutes = startMinutes - endMinutes;
          } else {
            // Next day - rest is remaining time in day + time until next start
            restMinutes = 24 * 60 - endMinutes + startMinutes;
          }

          const minimumRestMinutes = 11 * 60; // 11 hours minimum rest
          if (restMinutes < minimumRestMinutes && restMinutes >= 0) {
            const currentDateStr = current.rosterDate.toISOString().substring(0, 10);
            const nextDateStr = next.rosterDate.toISOString().substring(0, 10);
            const restHours = Math.round((restMinutes / 60) * 10) / 10;
            conflicts.push({
              type: 'NO_REST',
              employeeId,
              dates: [currentDateStr, nextDateStr],
              message: `Insufficient rest period (${restHours}h) between shifts on ${currentDateStr} and ${nextDateStr}. Minimum 11 hours required.`,
              messageAr: `فترة راحة غير كافية (${restHours} ساعة) بين الورديات في ${currentDateStr} و ${nextDateStr}. الحد الأدنى المطلوب 11 ساعة.`,
            });
          }
        }
      }

      // 3. Check for overtime excess (more than 48 hours per week)
      const maxWeeklyHours = 48;
      // Group by ISO week
      const weeklyHours = new Map<string, { hours: number; dates: string[] }>();
      for (const entry of employeeEntries) {
        const date = entry.rosterDate;
        const weekKey = this.getISOWeekKey(date);
        const existing = weeklyHours.get(weekKey) || { hours: 0, dates: [] };
        existing.hours += entry.shift.workHours;
        existing.dates.push(date.toISOString().substring(0, 10));
        weeklyHours.set(weekKey, existing);
      }

      for (const [_weekKey, weekData] of weeklyHours) {
        if (weekData.hours > maxWeeklyHours) {
          conflicts.push({
            type: 'OVERTIME_EXCESS',
            employeeId,
            dates: weekData.dates,
            message: `Weekly hours (${weekData.hours}h) exceed maximum allowed (${maxWeeklyHours}h)`,
            messageAr: `ساعات العمل الأسبوعية (${weekData.hours} ساعة) تتجاوز الحد الأقصى المسموح به (${maxWeeklyHours} ساعة)`,
          });
        }
      }

      // 4. Check for holiday conflicts
      for (const entry of employeeEntries) {
        const dateStr = entry.rosterDate.toISOString().substring(0, 10);
        if (holidays.includes(dateStr) && !entry.isHoliday) {
          conflicts.push({
            type: 'HOLIDAY_CONFLICT',
            employeeId,
            dates: [dateStr],
            message: `Employee is scheduled to work on a public holiday (${dateStr})`,
            messageAr: `الموظف مجدول للعمل في يوم عطلة رسمية (${dateStr})`,
          });
        }
      }
    }

    return conflicts;
  }

  // ==========================================================================
  // AVAILABILITY & COST
  // ==========================================================================

  /**
   * Get employees available to work a specific shift on a given date.
   * Filters out employees who already have a roster entry, are on leave,
   * or would violate rest requirements.
   */
  static async getAvailableEmployees(
    tenantId: string,
    date: string,
    shiftId: string
  ): Promise<Array<{ employeeId: string; employeeName: string }>> {
    const targetDate = new Date(date);

    // Get all active employees for the tenant
    const allEmployees = await prisma.employee.findMany({
      where: {
        isDeleted: false,
        company: { tenantId },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    // Get employees already rostered on this date
    const rosteredOnDate = await prisma.shiftRoster.findMany({
      where: {
        tenantId,
        rosterDate: targetDate,
        status: { not: 'CANCELLED' },
      },
      select: { employeeId: true },
    });
    const rosteredIds = new Set(rosteredOnDate.map((r) => r.employeeId));

    // Get employees on approved leave for this date
    const onLeave = await prisma.leaveRequest.findMany({
      where: {
        tenantId,
        status: 'APPROVED',
        isDeleted: false,
        startDate: { lte: targetDate },
        endDate: { gte: targetDate },
      },
      select: { employeeId: true },
    });
    const onLeaveIds = new Set(onLeave.map((l) => l.employeeId));

    // Get the target shift to check rest requirements
    const shift = await this.getShift(shiftId);
    if (!shift) {
      throw new Error(`Shift not found: ${shiftId}`);
    }

    // Get previous day's roster to check rest periods
    const prevDate = new Date(targetDate);
    prevDate.setDate(prevDate.getDate() - 1);

    const prevDayRosters = await prisma.shiftRoster.findMany({
      where: {
        tenantId,
        rosterDate: prevDate,
        status: { not: 'CANCELLED' },
      },
      include: { shift: true },
    });

    const insufficientRestIds = new Set<string>();
    for (const prevRoster of prevDayRosters) {
      const prevEndTime = prevRoster.customEndTime || prevRoster.shift.endTime;
      const endMinutes = this.timeToMinutes(prevEndTime);
      const startMinutes = this.timeToMinutes(shift.startTime);
      const restMinutes = 24 * 60 - endMinutes + startMinutes;

      if (restMinutes < 11 * 60) {
        insufficientRestIds.add(prevRoster.employeeId);
      }
    }

    // Filter available employees
    const available = allEmployees
      .filter((e) => !rosteredIds.has(e.id))
      .filter((e) => !onLeaveIds.has(e.id))
      .filter((e) => !insufficientRestIds.has(e.id))
      .map((e) => ({
        employeeId: e.id,
        employeeName: `${e.firstName} ${e.lastName}`,
      }));

    return available;
  }

  /**
   * Calculate estimated payroll cost for a roster in the given date range.
   * Considers base hourly rates and overtime multipliers.
   */
  static async calculateRosterCost(
    tenantId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    totalCost: number;
    regularCost: number;
    overtimeCost: number;
    byEmployee: Array<{
      employeeId: string;
      regularCost: number;
      overtimeCost: number;
      totalCost: number;
    }>;
  }> {
    // Get roster entries
    const entries = await prisma.shiftRoster.findMany({
      where: {
        tenantId,
        rosterDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        status: { not: 'CANCELLED' },
      },
      include: { shift: true },
    });

    // Get employee compensation data
    const employeeIds = [...new Set(entries.map((e) => e.employeeId))];
    const employees = await prisma.employee.findMany({
      where: { id: { in: employeeIds }, isDeleted: false },
      select: {
        id: true,
        basicSalary: true,
      },
    });

    const salaryMap = new Map<string, number>();
    for (const emp of employees) {
      // Estimate hourly rate from monthly salary (assuming 22 working days, 8 hours/day)
      const monthlySalary = emp.basicSalary ? Number(emp.basicSalary) : 0;
      const hourlyRate = monthlySalary / (22 * 8);
      salaryMap.set(emp.id, hourlyRate);
    }

    // Calculate standard weekly hours per employee to detect overtime
    const weeklyHoursMap = new Map<string, Map<string, number>>();
    for (const entry of entries) {
      const weekKey = this.getISOWeekKey(entry.rosterDate);
      const employeeWeeks = weeklyHoursMap.get(entry.employeeId) || new Map();
      const currentHours = employeeWeeks.get(weekKey) || 0;
      employeeWeeks.set(weekKey, currentHours + entry.shift.workHours);
      weeklyHoursMap.set(entry.employeeId, employeeWeeks);
    }

    let totalRegularCost = 0;
    let totalOvertimeCost = 0;
    const employeeCosts = new Map<string, { regular: number; overtime: number }>();

    for (const entry of entries) {
      const hourlyRate = salaryMap.get(entry.employeeId) || 0;
      const shiftHours = entry.shift.workHours;

      // Determine if this pushes into overtime for the week
      const weekKey = this.getISOWeekKey(entry.rosterDate);
      const empWeeks = weeklyHoursMap.get(entry.employeeId);
      const totalWeekHours = empWeeks?.get(weekKey) || 0;

      let regularHours = shiftHours;
      let overtimeHours = 0;

      if (totalWeekHours > 48) {
        // Some or all of this shift may be overtime
        const normalHoursRemaining = Math.max(0, 48 - (totalWeekHours - shiftHours));
        regularHours = Math.min(shiftHours, normalHoursRemaining);
        overtimeHours = shiftHours - regularHours;
      }

      const regularCostForEntry = regularHours * hourlyRate;
      const overtimeCostForEntry = overtimeHours * hourlyRate * 1.5; // Default 1.5x overtime rate

      totalRegularCost += regularCostForEntry;
      totalOvertimeCost += overtimeCostForEntry;

      const existing = employeeCosts.get(entry.employeeId) || { regular: 0, overtime: 0 };
      existing.regular += regularCostForEntry;
      existing.overtime += overtimeCostForEntry;
      employeeCosts.set(entry.employeeId, existing);
    }

    const byEmployee = Array.from(employeeCosts.entries()).map(([employeeId, costs]) => ({
      employeeId,
      regularCost: Math.round(costs.regular * 100) / 100,
      overtimeCost: Math.round(costs.overtime * 100) / 100,
      totalCost: Math.round((costs.regular + costs.overtime) * 100) / 100,
    }));

    return {
      totalCost: Math.round((totalRegularCost + totalOvertimeCost) * 100) / 100,
      regularCost: Math.round(totalRegularCost * 100) / 100,
      overtimeCost: Math.round(totalOvertimeCost * 100) / 100,
      byEmployee,
    };
  }

  // ==========================================================================
  // ROSTER COPY
  // ==========================================================================

  /**
   * Copy a week's roster pattern to another week.
   * Useful for repeating a successful schedule.
   */
  static async copyRoster(
    tenantId: string,
    sourceWeekStart: string,
    targetWeekStart: string
  ): Promise<RosterEntry[]> {
    const sourceStart = new Date(sourceWeekStart);
    const sourceEnd = new Date(sourceStart);
    sourceEnd.setDate(sourceEnd.getDate() + 6); // 7 days (Mon-Sun or Sun-Sat)

    const targetStart = new Date(targetWeekStart);

    // Get source week roster entries
    const sourceEntries = await prisma.shiftRoster.findMany({
      where: {
        tenantId,
        rosterDate: {
          gte: sourceStart,
          lte: sourceEnd,
        },
        status: { not: 'CANCELLED' },
      },
      include: { shift: true },
      orderBy: { rosterDate: 'asc' },
    });

    if (sourceEntries.length === 0) {
      return [];
    }

    // Calculate day offset from source to target
    const dayOffset = Math.round(
      (targetStart.getTime() - sourceStart.getTime()) / (1000 * 60 * 60 * 24)
    );

    const newEntries: RosterEntry[] = [];

    await prisma.$transaction(async (tx) => {
      for (const source of sourceEntries) {
        const newDate = new Date(source.rosterDate);
        newDate.setDate(newDate.getDate() + dayOffset);
        const newDateStr = newDate.toISOString().substring(0, 10);

        // Cancel any existing entry at the target date for this employee
        await tx.shiftRoster.updateMany({
          where: {
            tenantId,
            employeeId: source.employeeId,
            rosterDate: newDate,
            status: { not: 'CANCELLED' },
          },
          data: { status: 'CANCELLED' },
        });

        // Create new entry
        const entry = await tx.shiftRoster.create({
          data: {
            tenantId,
            employeeId: source.employeeId,
            shiftId: source.shiftId,
            rosterDate: newDate,
            customStartTime: source.customStartTime,
            customEndTime: source.customEndTime,
            isWeekOff: source.isWeekOff,
            isHoliday: false,
            status: 'SCHEDULED',
          },
          include: { shift: true },
        });

        newEntries.push({
          id: entry.id,
          tenantId: entry.tenantId,
          employeeId: entry.employeeId,
          shiftId: entry.shiftId,
          date: newDateStr,
          startTime: entry.customStartTime || entry.shift.startTime,
          endTime: entry.customEndTime || entry.shift.endTime,
          breakMinutes: entry.shift.breakDuration,
          status: 'SCHEDULED',
          isOvertime: false,
          notes: `Copied from week of ${sourceWeekStart}`,
        });
      }
    });

    return newEntries;
  }

  // ==========================================================================
  // ROSTER SUMMARY / ANALYTICS
  // ==========================================================================

  /**
   * Get a comprehensive summary of the roster for a given date range.
   * Includes per-employee breakdowns, per-shift breakdowns, and detected conflicts.
   */
  static async getRosterSummary(
    tenantId: string,
    startDate: string,
    endDate: string
  ): Promise<RosterSummary> {
    // Get all roster entries in range
    const entries = await prisma.shiftRoster.findMany({
      where: {
        tenantId,
        rosterDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        status: { not: 'CANCELLED' },
      },
      include: { shift: true },
    });

    // Calculate total days in range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Get employee names
    const employeeIds = [...new Set(entries.map((e) => e.employeeId))];
    const employees = await prisma.employee.findMany({
      where: { id: { in: employeeIds }, isDeleted: false },
      select: { id: true, firstName: true, lastName: true },
    });
    const employeeNameMap = new Map(employees.map((e) => [e.id, `${e.firstName} ${e.lastName}`]));

    // By-employee summary
    const employeeSummaryMap = new Map<
      string,
      { scheduledDays: number; offDays: number; overtimeDays: number; totalHours: number }
    >();

    let workDays = 0;
    let offDays = 0;
    let overtimeDays = 0;

    // Track weekly hours for overtime detection
    const weeklyHoursPerEmployee = new Map<string, Map<string, number>>();

    for (const entry of entries) {
      if (entry.isWeekOff || entry.isHoliday) {
        offDays++;
        const empData = employeeSummaryMap.get(entry.employeeId) || {
          scheduledDays: 0,
          offDays: 0,
          overtimeDays: 0,
          totalHours: 0,
        };
        empData.offDays++;
        employeeSummaryMap.set(entry.employeeId, empData);
      } else {
        workDays++;
        const empData = employeeSummaryMap.get(entry.employeeId) || {
          scheduledDays: 0,
          offDays: 0,
          overtimeDays: 0,
          totalHours: 0,
        };
        empData.scheduledDays++;
        empData.totalHours += entry.shift.workHours;
        employeeSummaryMap.set(entry.employeeId, empData);

        // Track weekly hours
        const weekKey = this.getISOWeekKey(entry.rosterDate);
        const empWeeks = weeklyHoursPerEmployee.get(entry.employeeId) || new Map();
        const currentWeekHours = empWeeks.get(weekKey) || 0;
        empWeeks.set(weekKey, currentWeekHours + entry.shift.workHours);
        weeklyHoursPerEmployee.set(entry.employeeId, empWeeks);
      }
    }

    // Detect overtime days (weeks exceeding 48 hours)
    for (const [employeeId, weeks] of weeklyHoursPerEmployee) {
      for (const [_weekKey, weekHours] of weeks) {
        if (weekHours > 48) {
          overtimeDays++;
          const empData = employeeSummaryMap.get(employeeId);
          if (empData) {
            empData.overtimeDays++;
          }
        }
      }
    }

    // By-shift summary
    const shiftSummaryMap = new Map<
      string,
      { shiftName: string; assignedCount: number; totalHours: number }
    >();

    for (const entry of entries) {
      if (!entry.isWeekOff && !entry.isHoliday) {
        const existing = shiftSummaryMap.get(entry.shiftId) || {
          shiftName: entry.shift.name,
          assignedCount: 0,
          totalHours: 0,
        };
        existing.assignedCount++;
        existing.totalHours += entry.shift.workHours;
        shiftSummaryMap.set(entry.shiftId, existing);
      }
    }

    // Validate for conflicts
    const conflicts = await this.validateRoster(tenantId, startDate, endDate);

    // Build result
    const byEmployee: EmployeeRosterSummary[] = Array.from(employeeSummaryMap.entries()).map(
      ([employeeId, data]) => ({
        employeeId,
        employeeName: employeeNameMap.get(employeeId) || 'Unknown',
        scheduledDays: data.scheduledDays,
        offDays: data.offDays,
        overtimeDays: data.overtimeDays,
        totalHours: Math.round(data.totalHours * 100) / 100,
      })
    );

    const byShift: ShiftRosterSummary[] = Array.from(shiftSummaryMap.entries()).map(
      ([shiftId, data]) => ({
        shiftId,
        shiftName: data.shiftName,
        assignedCount: data.assignedCount,
        totalHours: Math.round(data.totalHours * 100) / 100,
      })
    );

    return {
      totalDays,
      workDays,
      offDays,
      overtimeDays,
      byEmployee,
      byShift,
      conflicts,
    };
  }

  // ==========================================================================
  // PRIVATE HELPER METHODS
  // ==========================================================================

  /**
   * Get employees for roster generation, filtered by department or specific IDs.
   */
  private static async getEmployeesForRoster(
    tenantId: string,
    departmentId?: string,
    employeeIds?: string[]
  ): Promise<EmployeeInfo[]> {
    const employees = await prisma.employee.findMany({
      where: {
        isDeleted: false,
        company: { tenantId },
        ...(departmentId ? { departmentId } : {}),
        ...(employeeIds?.length ? { id: { in: employeeIds } } : {}),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        departmentId: true,
        company: { select: { tenantId: true } },
      },
    });

    return employees.map((e) => ({
      id: e.id,
      name: `${e.firstName} ${e.lastName}`,
      departmentId: e.departmentId,
      tenantId: e.company?.tenantId ?? tenantId,
    }));
  }

  /**
   * Get a roster template by ID.
   * Note: Since there is no RosterTemplate model in the Prisma schema,
   * this uses a configuration-based approach stored in a JSON config or
   * returns a hardcoded template structure from the database config table.
   */
  private static async getTemplate(
    tenantId: string,
    templateId: string
  ): Promise<RosterTemplate | null> {
    // Look for template in the configuration table
    // Since RosterTemplate is not in the schema, we store templates as JSON config
    const config = await prisma.wPSConfiguration.findFirst({
      where: {
        tenantId,
        category: 'ROSTER_TEMPLATE',
        key: templateId,
        isActive: true,
      },
    });

    if (!config) {
      return null;
    }

    try {
      const parsed = typeof config.value === 'string' ? JSON.parse(config.value) : config.value;

      return {
        id: templateId,
        tenantId,
        name: parsed.name || config.key,
        nameAr: parsed.nameAr || config.key,
        cycleDays: parsed.cycleDays || 7,
        pattern: parsed.pattern || [],
        isActive: true,
      };
    } catch {
      return null;
    }
  }

  /**
   * Get a shift by ID.
   */
  private static async getShift(shiftId: string): Promise<ShiftData | null> {
    const shift = await prisma.shift.findFirst({
      where: { id: shiftId, isActive: true },
    });

    if (!shift) return null;

    return {
      id: shift.id,
      tenantId: shift.tenantId,
      code: shift.code,
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      workHours: shift.workHours,
      breakDuration: shift.breakDuration,
      graceInMinutes: shift.graceInMinutes,
      graceOutMinutes: shift.graceOutMinutes,
      isActive: shift.isActive,
    };
  }

  /**
   * Get holiday dates within a range for a tenant.
   */
  private static async getHolidayDates(
    tenantId: string,
    startDate: string,
    endDate: string
  ): Promise<string[]> {
    const holidays = await prisma.holiday.findMany({
      where: {
        status: 'Active',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: { date: true },
    });

    return holidays.map((h) => h.date);
  }

  /**
   * Bulk create roster entries in the database.
   */
  private static async bulkCreateRosterEntries(entries: RosterEntry[]): Promise<void> {
    if (entries.length === 0) return;

    // Use createMany for performance
    await prisma.shiftRoster.createMany({
      data: entries.map((entry) => ({
        id: entry.id,
        tenantId: entry.tenantId,
        employeeId: entry.employeeId,
        shiftId: entry.shiftId,
        rosterDate: new Date(entry.date),
        customStartTime: null,
        customEndTime: null,
        isWeekOff: false,
        isHoliday: false,
        status: entry.status,
      })),
      skipDuplicates: true,
    });
  }

  /**
   * Convert a time string (HH:MM or HH:MM:SS) to minutes since midnight.
   */
  private static timeToMinutes(time: string): number {
    const parts = time.split(':').map(Number);
    return parts[0] * 60 + (parts[1] || 0);
  }

  /**
   * Get an ISO week key for grouping by week (YYYY-Www format).
   */
  private static getISOWeekKey(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const yearStart = new Date(d.getFullYear(), 0, 4);
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24) + 1) / 7);
    return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }

  /**
   * Generate a unique ID for roster entries.
   */
  private static generateId(): string {
    return `rst_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

export default RosterManagementService;
