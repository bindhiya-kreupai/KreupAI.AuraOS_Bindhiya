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
