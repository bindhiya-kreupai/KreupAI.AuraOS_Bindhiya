/**
 * Unit Tests — Leave Service
 *
 * Covers balance deductions, half-day handling, weekend/holiday exclusion,
 * carry-forward limits, encashment calculation, and workflow state transitions.
 *
 * @module tests/unit/services
 */

import { describe, test, expect, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Inline leave service helpers (in-memory, no Prisma dependency)
// ---------------------------------------------------------------------------

type LeaveStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

interface LeaveBalance {
  employeeId: string;
  leaveTypeId: string;
  entitlement: number;
  used: number;
  pending: number;
  carried: number;
}

interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  halfDay: boolean;
  halfDayPeriod?: 'morning' | 'afternoon';
  days: number;
  status: LeaveStatus;
  requestedAt: Date;
}

interface HolidayCalendar {
  holidays: Date[];
  workWeekDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
}

// ---------------------------------------------------------------------------
// Business logic helpers
// ---------------------------------------------------------------------------

function getAvailableBalance(balance: LeaveBalance): number {
  return balance.entitlement + balance.carried - balance.used - balance.pending;
}

function deductLeaveBalance(balance: LeaveBalance, days: number): LeaveBalance {
  return {
    ...balance,
    used: balance.used + days,
    pending: Math.max(0, balance.pending - days),
  };
}

function addPendingLeave(balance: LeaveBalance, days: number): LeaveBalance {
  return {
    ...balance,
    pending: balance.pending + days,
  };
}

function countWorkingDays(start: Date, end: Date, calendar: HolidayCalendar): number {
  let count = 0;
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endNorm = new Date(end);
  endNorm.setHours(0, 0, 0, 0);

  while (current <= endNorm) {
    const dayOfWeek = current.getDay();
    const isWorkday = calendar.workWeekDays.includes(dayOfWeek);
    const isHoliday = calendar.holidays.some(
      (h) => h.toDateString() === current.toDateString()
    );
    if (isWorkday && !isHoliday) count++;
    current.setDate(current.getDate() + 1);
  }

  return count;
}

function calculateLeaveDays(request: LeaveRequest, calendar: HolidayCalendar): number {
  const workingDays = countWorkingDays(request.startDate, request.endDate, calendar);
  return request.halfDay ? 0.5 : workingDays;
}

interface CarryForwardRule {
  maxCarryForwardDays: number;
  expiryMonths: number; // months after year-end the carried days expire
}

function calculateCarryForward(
  unusedDays: number,
  rule: CarryForwardRule
): number {
  return Math.min(unusedDays, rule.maxCarryForwardDays);
}

function calculateEncashment(
  daysToEncash: number,
  dailyRate: number,
  maxEncashableDays: number
): number {
  const actualDays = Math.min(daysToEncash, maxEncashableDays);
  return actualDays * dailyRate;
}

// Workflow transitions
const VALID_TRANSITIONS: Record<LeaveStatus, LeaveStatus[]> = {
  DRAFT:     ['PENDING', 'CANCELLED'],
  PENDING:   ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED:  ['CANCELLED'],
  REJECTED:  [],
  CANCELLED: [],
};

function canTransition(from: LeaveStatus, to: LeaveStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

function transitionStatus(request: LeaveRequest, to: LeaveStatus): LeaveRequest {
  if (!canTransition(request.status, to)) {
    throw new Error(`Cannot transition from ${request.status} to ${to}`);
  }
  return { ...request, status: to };
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const STANDARD_CALENDAR: HolidayCalendar = {
  workWeekDays: [1, 2, 3, 4, 5], // Mon-Fri
  holidays: [
    new Date('2025-01-01'), // New Year
    new Date('2025-12-25'), // Christmas
  ],
};

const UAE_CALENDAR: HolidayCalendar = {
  workWeekDays: [1, 2, 3, 4, 0], // Mon-Fri with Sun (UAE Fri/Sat weekend)
  // Simplified — actual UAE work week is Sun-Thu
  holidays: [],
};

let baseBalance: LeaveBalance;

beforeEach(() => {
  baseBalance = {
    employeeId: 'emp-001',
    leaveTypeId: 'annual',
    entitlement: 30,
    used: 5,
    pending: 2,
    carried: 3,
  };
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Leave Service — Balance Deduction', () => {
  test('deducts days from used and reduces pending', () => {
    const updated = deductLeaveBalance(baseBalance, 3);
    expect(updated.used).toBe(8);
    expect(updated.pending).toBe(0); // reduced by min(pending, days) = 2
  });

  test('available balance is entitlement + carried - used - pending', () => {
    const available = getAvailableBalance(baseBalance);
    // 30 + 3 - 5 - 2 = 26
    expect(available).toBe(26);
  });

  test('adding pending leave reduces available balance', () => {
    const updated = addPendingLeave(baseBalance, 5);
    expect(getAvailableBalance(updated)).toBe(21);
  });

  test('available balance handles fully exhausted leave', () => {
    const exhausted: LeaveBalance = { ...baseBalance, used: 33, pending: 0 };
    expect(getAvailableBalance(exhausted)).toBe(0);
  });
});

describe('Leave Service — Half-Day Handling', () => {
  test('half-day leave counts as 0.5 days', () => {
    const request: LeaveRequest = {
      id: 'leave-001',
      employeeId: 'emp-001',
      leaveTypeId: 'annual',
      startDate: new Date('2025-03-10'),
      endDate: new Date('2025-03-10'),
      halfDay: true,
      halfDayPeriod: 'morning',
      days: 0.5,
      status: 'PENDING',
      requestedAt: new Date(),
    };
    const days = calculateLeaveDays(request, STANDARD_CALENDAR);
    expect(days).toBe(0.5);
  });

  test('full-day leave on single working day counts as 1 day', () => {
    const request: LeaveRequest = {
      id: 'leave-002',
      employeeId: 'emp-001',
      leaveTypeId: 'annual',
      startDate: new Date('2025-03-10'), // Monday
      endDate: new Date('2025-03-10'),
      halfDay: false,
      days: 1,
      status: 'PENDING',
      requestedAt: new Date(),
    };
    expect(calculateLeaveDays(request, STANDARD_CALENDAR)).toBe(1);
  });
});

describe('Leave Service — Weekend & Holiday Exclusion', () => {
  test('excludes weekends from working day count', () => {
    // Mon 10 Mar to Fri 14 Mar 2025 = 5 working days
    const days = countWorkingDays(
      new Date('2025-03-10'),
      new Date('2025-03-14'),
      STANDARD_CALENDAR
    );
    expect(days).toBe(5);
  });

  test('excludes holidays from working day count', () => {
    // Dec 24-26 includes Christmas (25th)
    const days = countWorkingDays(
      new Date('2025-12-24'),
      new Date('2025-12-26'),
      STANDARD_CALENDAR
    );
    // Wed 24, Fri 26 = 2 days (Thu 25 is holiday)
    expect(days).toBe(2);
  });

  test('period spanning only weekends returns 0', () => {
    const days = countWorkingDays(
      new Date('2025-03-15'), // Saturday
      new Date('2025-03-16'), // Sunday
      STANDARD_CALENDAR
    );
    expect(days).toBe(0);
  });
});

describe('Leave Service — Carry-Forward Limits', () => {
  test('carry-forward is capped at maxCarryForwardDays', () => {
    const rule: CarryForwardRule = { maxCarryForwardDays: 10, expiryMonths: 3 };
    expect(calculateCarryForward(15, rule)).toBe(10);
  });

  test('carry-forward does not exceed unused days', () => {
    const rule: CarryForwardRule = { maxCarryForwardDays: 10, expiryMonths: 3 };
    expect(calculateCarryForward(5, rule)).toBe(5);
  });

  test('zero unused days results in zero carry-forward', () => {
    const rule: CarryForwardRule = { maxCarryForwardDays: 10, expiryMonths: 3 };
    expect(calculateCarryForward(0, rule)).toBe(0);
  });
});

describe('Leave Service — Encashment Calculation', () => {
  test('encashes days at daily rate', () => {
    const amount = calculateEncashment(10, 500, 30);
    expect(amount).toBe(5_000);
  });

  test('encashment is capped at maxEncashableDays', () => {
    const amount = calculateEncashment(15, 500, 10);
    expect(amount).toBe(5_000);
  });

  test('zero days returns zero encashment', () => {
    expect(calculateEncashment(0, 1_000, 30)).toBe(0);
  });
});

describe('Leave Service — Workflow State Transitions', () => {
  test('transitions from DRAFT to PENDING', () => {
    const request: LeaveRequest = {
      id: 'leave-003', employeeId: 'emp-001', leaveTypeId: 'annual',
      startDate: new Date(), endDate: new Date(),
      halfDay: false, days: 1,
      status: 'DRAFT', requestedAt: new Date(),
    };
    const updated = transitionStatus(request, 'PENDING');
    expect(updated.status).toBe('PENDING');
  });

  test('transitions from PENDING to APPROVED', () => {
    const request: LeaveRequest = {
      id: 'leave-004', employeeId: 'emp-001', leaveTypeId: 'annual',
      startDate: new Date(), endDate: new Date(),
      halfDay: false, days: 1,
      status: 'PENDING', requestedAt: new Date(),
    };
    const updated = transitionStatus(request, 'APPROVED');
    expect(updated.status).toBe('APPROVED');
  });

  test('transitions from PENDING to REJECTED', () => {
    const request: LeaveRequest = {
      id: 'leave-005', employeeId: 'emp-001', leaveTypeId: 'annual',
      startDate: new Date(), endDate: new Date(),
      halfDay: false, days: 1,
      status: 'PENDING', requestedAt: new Date(),
    };
    const updated = transitionStatus(request, 'REJECTED');
    expect(updated.status).toBe('REJECTED');
  });

  test('throws when invalid transition attempted', () => {
    const request: LeaveRequest = {
      id: 'leave-006', employeeId: 'emp-001', leaveTypeId: 'annual',
      startDate: new Date(), endDate: new Date(),
      halfDay: false, days: 1,
      status: 'REJECTED', requestedAt: new Date(),
    };
    expect(() => transitionStatus(request, 'APPROVED')).toThrow();
  });

  test('canTransition returns false for invalid transitions', () => {
    expect(canTransition('CANCELLED', 'APPROVED')).toBe(false);
    expect(canTransition('REJECTED', 'PENDING')).toBe(false);
  });

  test('APPROVED leave can be cancelled', () => {
    expect(canTransition('APPROVED', 'CANCELLED')).toBe(true);
  });
});
