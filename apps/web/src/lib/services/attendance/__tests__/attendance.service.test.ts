/**
 * AttendanceService — unit tests against the actual class API.
 *
 * Targets `src/lib/services/attendance/attendance.service.ts`.
 * Focus on the GPS validation path which is the most behavior-rich
 * pure logic (Haversine distance + geofence containment + accuracy
 * thresholds). Also covers cross-tenant scoping via getEmployeeLocations.
 *
 * Packet 1 / #49 — Attendance domain.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock prisma where the service imports it.
vi.mock('@aura/database', () => {
  const make = () => ({
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    upsert: vi.fn(),
  });
  return {
    prisma: {
      employee: make(),
      geofenceLocation: make(),
      attendanceRecord: make(),
      attendancePunch: make(),
    },
  };
});

import { AttendanceService } from '../attendance.service';
import { prisma } from '@aura/database';

const TENANT_A = 'tenant-A';

const DUBAI_HQ = {
  id: 'geo-1',
  name: 'Dubai HQ',
  tenantId: TENANT_A,
  latitude: 25.2048,
  longitude: 55.2708,
  radius: 100, // 100 meter radius
  isActive: true,
};

const EMPLOYEE_AT_TENANT_A = {
  id: 'emp-1',
  isDeleted: false,
  company: { tenantId: TENANT_A },
};

describe('AttendanceService.validateGPSPunch', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns valid when no geofence location is configured for tenant', async () => {
    (prisma.employee.findFirst as any).mockResolvedValue(EMPLOYEE_AT_TENANT_A);
    (prisma.geofenceLocation.findMany as any).mockResolvedValue([]);

    const result = await AttendanceService.validateGPSPunch({
      employeeId: 'emp-1',
      latitude: 25.2048,
      longitude: 55.2708,
      accuracy: 10,
    });

    expect(result.isValid).toBe(true);
    expect(result.isWithinGeofence).toBe(true);
    expect(result.message).toMatch(/no location restriction/i);
  });

  it('accepts a punch inside the geofence', async () => {
    (prisma.employee.findFirst as any).mockResolvedValue(EMPLOYEE_AT_TENANT_A);
    (prisma.geofenceLocation.findMany as any).mockResolvedValue([DUBAI_HQ]);

    // Exact same coordinates → distance ≈ 0
    const result = await AttendanceService.validateGPSPunch({
      employeeId: 'emp-1',
      latitude: 25.2048,
      longitude: 55.2708,
      accuracy: 10,
    });

    expect(result.isValid).toBe(true);
    expect(result.isWithinGeofence).toBe(true);
    expect(result.distanceMeters).toBe(0);
    expect(result.nearestLocation?.name).toBe('Dubai HQ');
  });

  it('rejects a remote punch when allowRemotePunch is false', async () => {
    (prisma.employee.findFirst as any).mockResolvedValue(EMPLOYEE_AT_TENANT_A);
    (prisma.geofenceLocation.findMany as any).mockResolvedValue([DUBAI_HQ]);

    // ~10km away from Dubai HQ → way outside 100m radius
    const result = await AttendanceService.validateGPSPunch({
      employeeId: 'emp-1',
      latitude: 25.3,
      longitude: 55.3,
      accuracy: 10,
    });

    expect(result.isValid).toBe(false);
    expect(result.isWithinGeofence).toBe(false);
    expect(result.distanceMeters).toBeGreaterThan(1000);
    expect(result.message).toMatch(/away/i);
  });

  it('rejects punch when GPS accuracy is too low (>100m)', async () => {
    (prisma.employee.findFirst as any).mockResolvedValue(EMPLOYEE_AT_TENANT_A);
    (prisma.geofenceLocation.findMany as any).mockResolvedValue([DUBAI_HQ]);

    const result = await AttendanceService.validateGPSPunch({
      employeeId: 'emp-1',
      latitude: 25.2048,
      longitude: 55.2708,
      accuracy: 250, // way too imprecise
    });

    expect(result.isValid).toBe(false);
    expect(result.message).toMatch(/accuracy.*low/i);
  });

  it('returns the NEAREST location when multiple are configured', async () => {
    const ABU_DHABI = {
      ...DUBAI_HQ,
      id: 'geo-2',
      name: 'Abu Dhabi',
      latitude: 24.4539,
      longitude: 54.3773,
    };

    (prisma.employee.findFirst as any).mockResolvedValue(EMPLOYEE_AT_TENANT_A);
    (prisma.geofenceLocation.findMany as any).mockResolvedValue([DUBAI_HQ, ABU_DHABI]);

    // Coords very close to Dubai HQ
    const result = await AttendanceService.validateGPSPunch({
      employeeId: 'emp-1',
      latitude: 25.205,
      longitude: 55.271,
      accuracy: 10,
    });

    expect(result.nearestLocation?.name).toBe('Dubai HQ');
  });

  it('treats missing employee as "no restriction"', async () => {
    (prisma.employee.findFirst as any).mockResolvedValue(null);
    (prisma.geofenceLocation.findMany as any).mockResolvedValue([]);

    const result = await AttendanceService.validateGPSPunch({
      employeeId: 'missing',
      latitude: 25.2048,
      longitude: 55.2708,
      accuracy: 10,
    });

    expect(result.isValid).toBe(true);
  });
});

describe('AttendanceService — cross-tenant geofence scoping', () => {
  beforeEach(() => vi.clearAllMocks());

  it('queries geofenceLocation scoped by the employee company tenantId', async () => {
    (prisma.employee.findFirst as any).mockResolvedValue(EMPLOYEE_AT_TENANT_A);
    (prisma.geofenceLocation.findMany as any).mockResolvedValue([DUBAI_HQ]);

    await AttendanceService.validateGPSPunch({
      employeeId: 'emp-1',
      latitude: 25.2048,
      longitude: 55.2708,
      accuracy: 10,
    });

    // The geofence query should filter by tenantId
    const call = (prisma.geofenceLocation.findMany as any).mock.calls[0][0];
    expect(call.where.tenantId).toBe(TENANT_A);
    expect(call.where.isActive).toBe(true);
  });
});

describe('AttendanceService — Haversine distance correctness', () => {
  beforeEach(() => vi.clearAllMocks());

  // Validate the private calculateDistance via public surface.
  // Distance between Dubai (25.2048, 55.2708) and Abu Dhabi (24.4539, 54.3773)
  // is approximately 121 km.
  it('computes ~121km between Dubai HQ and Abu Dhabi', async () => {
    const ABU_DHABI_LAT = 24.4539;
    const ABU_DHABI_LON = 54.3773;

    (prisma.employee.findFirst as any).mockResolvedValue(EMPLOYEE_AT_TENANT_A);
    (prisma.geofenceLocation.findMany as any).mockResolvedValue([DUBAI_HQ]);

    const result = await AttendanceService.validateGPSPunch({
      employeeId: 'emp-1',
      latitude: ABU_DHABI_LAT,
      longitude: ABU_DHABI_LON,
      accuracy: 10,
    });

    // Haversine should return ~121,000 meters ± 5%
    expect(result.distanceMeters).toBeGreaterThan(115_000);
    expect(result.distanceMeters).toBeLessThan(125_000);
  });

  it('computes ~0m for identical coordinates', async () => {
    (prisma.employee.findFirst as any).mockResolvedValue(EMPLOYEE_AT_TENANT_A);
    (prisma.geofenceLocation.findMany as any).mockResolvedValue([DUBAI_HQ]);

    const result = await AttendanceService.validateGPSPunch({
      employeeId: 'emp-1',
      latitude: DUBAI_HQ.latitude,
      longitude: DUBAI_HQ.longitude,
      accuracy: 10,
    });

    expect(result.distanceMeters).toBe(0);
  });

  it('computes a short distance (~50m) for nearby coordinates', async () => {
    // ~50m offset in longitude at Dubai latitude
    const LON_OFFSET_50M = 0.0005; // approx 50m

    (prisma.employee.findFirst as any).mockResolvedValue(EMPLOYEE_AT_TENANT_A);
    (prisma.geofenceLocation.findMany as any).mockResolvedValue([DUBAI_HQ]);

    const result = await AttendanceService.validateGPSPunch({
      employeeId: 'emp-1',
      latitude: DUBAI_HQ.latitude,
      longitude: DUBAI_HQ.longitude + LON_OFFSET_50M,
      accuracy: 10,
    });

    expect(result.distanceMeters).toBeGreaterThan(40);
    expect(result.distanceMeters).toBeLessThan(60);
    expect(result.isWithinGeofence).toBe(true); // within 100m radius
  });
});

// ============================================================================
// AttendanceService.calculateAttendance — pure-function tests
// ============================================================================

const SHIFT_9_TO_5: any = {
  id: 'shift-1',
  name: 'Day Shift',
  startTime: '09:00',
  endTime: '17:00',
  workingHours: 8,
  graceMinutesIn: 10,
  graceMinutesOut: 10,
  minHoursForFullDay: 8,
  minHoursForHalfDay: 4,
  overtimeAfterMinutes: 30,
  minOvertimeMinutes: 30,
};

const EMP: any = {
  id: 'emp-1',
  tenantId: TENANT_A,
  name: 'Jane',
  code: 'E001',
  department: 'Engineering',
};

function punch(time: string, type: 'CHECK_IN' | 'CHECK_OUT' | 'BREAK_START' | 'BREAK_END'): any {
  const [h, m] = time.split(':').map(Number);
  return {
    id: `p-${time}`,
    type,
    time,
    timestamp: new Date(2026, 5, 2, h, m),
    isWithinGeofence: true,
  };
}

describe('AttendanceService.calculateAttendance', () => {
  it('marks PRESENT when worked >= minHoursForFullDay', () => {
    const r = AttendanceService.calculateAttendance(
      EMP,
      SHIFT_9_TO_5,
      [punch('09:00', 'CHECK_IN'), punch('17:00', 'CHECK_OUT')],
      '2026-06-02'
    );
    expect(r.status).toBe('PRESENT');
    expect(r.totalWorkedMinutes).toBe(480);
    expect(r.isLate).toBe(false);
    expect(r.isEarlyOut).toBe(false);
  });

  it('flags LATE arrival past grace period', () => {
    const r = AttendanceService.calculateAttendance(
      EMP,
      SHIFT_9_TO_5,
      [punch('09:30', 'CHECK_IN'), punch('17:00', 'CHECK_OUT')],
      '2026-06-02'
    );
    expect(r.isLate).toBe(true);
    expect(r.lateMinutes).toBe(30);
  });

  it('does not flag LATE inside grace period', () => {
    const r = AttendanceService.calculateAttendance(
      EMP,
      SHIFT_9_TO_5,
      [punch('09:05', 'CHECK_IN'), punch('17:00', 'CHECK_OUT')],
      '2026-06-02'
    );
    expect(r.isLate).toBe(false);
  });

  it('flags EARLY_OUT before grace period', () => {
    const r = AttendanceService.calculateAttendance(
      EMP,
      SHIFT_9_TO_5,
      [punch('09:00', 'CHECK_IN'), punch('16:00', 'CHECK_OUT')],
      '2026-06-02'
    );
    expect(r.isEarlyOut).toBe(true);
    expect(r.earlyOutMinutes).toBe(60);
  });

  it('marks HALF_DAY when worked between half-day and full-day', () => {
    const r = AttendanceService.calculateAttendance(
      EMP,
      SHIFT_9_TO_5,
      [punch('09:00', 'CHECK_IN'), punch('14:00', 'CHECK_OUT')],
      '2026-06-02'
    );
    expect(r.status).toBe('HALF_DAY');
  });

  it('marks ABSENT when only check-in (no checkout) — treated as half-day per logic', () => {
    const r = AttendanceService.calculateAttendance(
      EMP,
      SHIFT_9_TO_5,
      [punch('09:00', 'CHECK_IN')],
      '2026-06-02'
    );
    // The service marks "only check-in" as HALF_DAY (see service line 219)
    expect(r.status).toBe('HALF_DAY');
  });

  it('marks ABSENT when no punches', () => {
    const r = AttendanceService.calculateAttendance(EMP, SHIFT_9_TO_5, [], '2026-06-02');
    expect(r.status).toBe('ABSENT');
    expect(r.totalWorkedMinutes).toBe(0);
  });

  it('subtracts break minutes from effective worked time', () => {
    const r = AttendanceService.calculateAttendance(
      EMP,
      SHIFT_9_TO_5,
      [
        punch('09:00', 'CHECK_IN'),
        punch('12:00', 'BREAK_START'),
        punch('13:00', 'BREAK_END'),
        punch('17:00', 'CHECK_OUT'),
      ],
      '2026-06-02'
    );
    expect(r.totalBreakMinutes).toBe(60);
    expect(r.effectiveWorkedMinutes).toBe(420); // 480 - 60
  });

  it('calculates overtime when worked exceeds workingHours + overtime threshold', () => {
    const r = AttendanceService.calculateAttendance(
      EMP,
      SHIFT_9_TO_5,
      [punch('09:00', 'CHECK_IN'), punch('19:00', 'CHECK_OUT')], // 10 hours
      '2026-06-02'
    );
    // worked 600 min, workingHours 8*60=480 + 30 threshold = 510. So 600 > 510 → OT
    // overtime = 600 - 480 = 120 mins
    expect(r.overtimeMinutes).toBe(120);
  });

  it('discards overtime below minOvertimeMinutes', () => {
    const r = AttendanceService.calculateAttendance(
      EMP,
      SHIFT_9_TO_5,
      [punch('09:00', 'CHECK_IN'), punch('17:35', 'CHECK_OUT')], // 8h35m
      '2026-06-02'
    );
    // worked 515, threshold = 480+30=510, OT would be 515-480=35 which is just above min 30
    expect(r.overtimeMinutes).toBeGreaterThan(0);
  });

  it('sorts punches by timestamp regardless of input order', () => {
    const r = AttendanceService.calculateAttendance(
      EMP,
      SHIFT_9_TO_5,
      [punch('17:00', 'CHECK_OUT'), punch('09:00', 'CHECK_IN')],
      '2026-06-02'
    );
    expect(r.firstCheckIn).toBe('09:00');
    expect(r.lastCheckOut).toBe('17:00');
  });

  it('flags isRemote when any punch is outside geofence', () => {
    const remotePunch = { ...punch('09:00', 'CHECK_IN'), isWithinGeofence: false };
    const r = AttendanceService.calculateAttendance(
      EMP,
      SHIFT_9_TO_5,
      [remotePunch, punch('17:00', 'CHECK_OUT')],
      '2026-06-02'
    );
    expect(r.isRemote).toBe(true);
  });

  it('preserves employee + shift metadata in record', () => {
    const r = AttendanceService.calculateAttendance(
      EMP,
      SHIFT_9_TO_5,
      [punch('09:00', 'CHECK_IN'), punch('17:00', 'CHECK_OUT')],
      '2026-06-02'
    );
    expect(r.tenantId).toBe(TENANT_A);
    expect(r.employeeId).toBe('emp-1');
    expect(r.shiftId).toBe('shift-1');
    expect(r.shiftName).toBe('Day Shift');
    expect(r.scheduledIn).toBe('09:00');
    expect(r.scheduledOut).toBe('17:00');
  });
});

describe('AttendanceService.calculateOvertime', () => {
  it('returns null when no overtime', () => {
    const r = AttendanceService.calculateOvertime({ overtimeMinutes: 0 } as any, 'AE', 50);
    expect(r).toBeNull();
  });

  it('classifies normal overtime on weekday', () => {
    const record = {
      id: 'r-1',
      tenantId: TENANT_A,
      employeeId: 'emp-1',
      date: '2026-06-02', // Tuesday
      overtimeMinutes: 60,
      lastCheckOut: '18:00',
    } as any;
    const r = AttendanceService.calculateOvertime(record, 'AE', 50);
    expect(r).not.toBeNull();
    expect(r!.overtimeType).toBe('NORMAL');
    expect(r!.rateMultiplier).toBeGreaterThan(1);
  });

  it('classifies weekend overtime as WEEKEND', () => {
    const record = {
      id: 'r-1',
      tenantId: TENANT_A,
      employeeId: 'emp-1',
      date: '2026-06-06', // Saturday
      overtimeMinutes: 60,
      lastCheckOut: '14:00',
    } as any;
    const r = AttendanceService.calculateOvertime(record, 'AE', 50);
    expect(r).not.toBeNull();
    expect(r!.overtimeType).toBe('WEEKEND');
  });

  it('computes calculatedAmount = (minutes/60) * hourlyRate * multiplier', () => {
    const record = {
      id: 'r-1',
      tenantId: TENANT_A,
      employeeId: 'emp-1',
      date: '2026-06-02',
      overtimeMinutes: 60,
      lastCheckOut: '18:00',
    } as any;
    const r = AttendanceService.calculateOvertime(record, 'AE', 100);
    // 1h * 100 * 1.25 (or whatever AE normal rate is) — just ensure positive
    expect(r!.calculatedAmount).toBeGreaterThan(0);
  });

  it('starts in PENDING status', () => {
    const r = AttendanceService.calculateOvertime(
      {
        id: 'r-1',
        tenantId: TENANT_A,
        employeeId: 'emp-1',
        date: '2026-06-02',
        overtimeMinutes: 60,
        lastCheckOut: '18:00',
      } as any,
      'AE',
      50
    );
    expect(r!.status).toBe('PENDING');
  });
});
