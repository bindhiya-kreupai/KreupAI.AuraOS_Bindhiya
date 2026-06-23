import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@aura/database', () => ({
  prisma: {
    accommodationRoom: { upsert: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    accommodationBedAssignment: { create: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    accommodationHygieneCheck: { create: vi.fn() },
    accommodationSafetyCertificate: { upsert: vi.fn(), findMany: vi.fn() },
    accommodationEvacuationDrill: { create: vi.fn() },
    accommodationKitchenInspection: { create: vi.fn() },
    accommodationCost: { upsert: vi.fn() },
    accommodationRisk: { upsert: vi.fn(), update: vi.fn() },
    $transaction: vi.fn(async (fn: any) =>
      fn({
        accommodationBedAssignment: {
          create: vi.fn(async (a: any) => ({ id: 'ba-1', ...a.data })),
        },
        accommodationRoom: { update: vi.fn(async (a: any) => ({ id: a.where.id, ...a.data })) },
      })
    ),
  },
}));

import { prisma } from '@aura/database';
import {
  roomAllocationService,
  hygieneCheckService,
  HygieneCheckService,
  safetyCertificateService,
  kitchenInspectionService,
  accommodationCostService,
  AccommodationRiskRegisterService,
  accommodationRiskRegisterService,
} from '../index';

const p = prisma as unknown as any;
const auth = { tenantId: 't1', userId: 'u1' };

beforeEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// S04 — Room allocation segregation
// ---------------------------------------------------------------------------

describe('RoomAllocationService.assign (S04 segregation)', () => {
  function arrangeRoom(overrides: any = {}) {
    p.accommodationRoom.findFirst.mockResolvedValue({
      id: 'r1',
      tenantId: 't1',
      totalBeds: 4,
      occupiedBeds: 0,
      ...overrides,
    });
  }

  it('rejects gender mismatch when room is FEMALE-restricted', async () => {
    arrangeRoom({ genderRestriction: 'FEMALE' });
    await expect(
      roomAllocationService.assign(
        { roomId: 'r1', employeeId: 'e1', bedNumber: 1, gender: 'MALE' },
        auth
      )
    ).rejects.toThrow(/gender mismatch/);
  });

  it('accepts opposite gender when room is MIXED', async () => {
    arrangeRoom({ genderRestriction: 'MIXED' });
    const out = await roomAllocationService.assign(
      { roomId: 'r1', employeeId: 'e1', bedNumber: 1, gender: 'MALE' },
      auth
    );
    expect(out.id).toBe('ba-1');
  });

  it('rejects assignment when room is at capacity', async () => {
    arrangeRoom({ totalBeds: 2, occupiedBeds: 2 });
    await expect(
      roomAllocationService.assign({ roomId: 'r1', employeeId: 'e1', bedNumber: 1 }, auth)
    ).rejects.toThrow(/at capacity/);
  });

  it('enforces 3 sqm/worker minimum density', async () => {
    // 5 sqm room with 1 occupant → adding 2nd would make 2.5 sqm/worker (< 3)
    arrangeRoom({ totalBeds: 3, occupiedBeds: 1, areaSqm: 5 });
    await expect(
      roomAllocationService.assign({ roomId: 'r1', employeeId: 'e2', bedNumber: 2 }, auth)
    ).rejects.toThrow(/density too high/);
  });

  it('rejects nationality / company segregation mismatch', async () => {
    arrangeRoom({ nationalityGroup: 'IN' });
    await expect(
      roomAllocationService.assign(
        { roomId: 'r1', employeeId: 'e1', bedNumber: 1, nationality: 'PK' },
        auth
      )
    ).rejects.toThrow(/nationality segregation/);
  });
});

// ---------------------------------------------------------------------------
// S05 — Hygiene status derivation
// ---------------------------------------------------------------------------

describe('HygieneCheckService.deriveStatus (S05)', () => {
  it('returns PENDING when ratio or score is missing', () => {
    expect(HygieneCheckService.deriveStatus(null, 5)).toBe('PENDING');
    expect(HygieneCheckService.deriveStatus(7, null)).toBe('PENDING');
  });

  it('returns FAIL when ratio > 1:8 (too few fixtures per occupant)', () => {
    expect(HygieneCheckService.deriveStatus(10, 4)).toBe('FAIL');
  });

  it('returns FAIL when cleanlinessScore < 3', () => {
    expect(HygieneCheckService.deriveStatus(6, 2)).toBe('FAIL');
  });

  it('returns PASS when ratio ≤ 1:8 AND cleanlinessScore ≥ 3', () => {
    expect(HygieneCheckService.deriveStatus(8, 4)).toBe('PASS');
  });
});

// ---------------------------------------------------------------------------
// S06 — Safety certificate
// ---------------------------------------------------------------------------

describe('SafetyCertificateService.upsert (S06)', () => {
  it('rejects expiry before issued date', async () => {
    await expect(
      safetyCertificateService.upsert(
        {
          siteId: 's1',
          certType: 'CIVIL_DEFENCE',
          certNumber: 'CD-001',
          issuedDate: new Date('2026-06-01'),
          expiryDate: new Date('2026-05-01'),
        },
        auth
      )
    ).rejects.toThrow(/after issuedDate/);
  });

  it('marks past expiry as EXPIRED on upsert', async () => {
    p.accommodationSafetyCertificate.upsert.mockImplementation(async (a: any) => ({ ...a.create }));
    const out = await safetyCertificateService.upsert(
      {
        siteId: 's1',
        certType: 'CIVIL_DEFENCE',
        certNumber: 'CD-001',
        issuedDate: new Date('2020-01-01'),
        expiryDate: new Date('2021-01-01'), // long past
      },
      auth
    );
    expect(out.status).toBe('EXPIRED');
  });
});

// ---------------------------------------------------------------------------
// S07 — Kitchen inspection outcome derivation
// ---------------------------------------------------------------------------

describe('KitchenInspectionService.record (S07)', () => {
  it('derives FAIL when pestEvidence is true', async () => {
    p.accommodationKitchenInspection.create.mockImplementation(async (a: any) => ({ ...a.data }));
    const out = await kitchenInspectionService.record(
      { siteId: 's1', inspectionDate: new Date(), pestEvidence: true },
      auth
    );
    expect(out.outcome).toBe('FAIL');
  });

  it('derives FAIL when temperature log is not OK', async () => {
    p.accommodationKitchenInspection.create.mockImplementation(async (a: any) => ({ ...a.data }));
    const out = await kitchenInspectionService.record(
      { siteId: 's1', inspectionDate: new Date(), tempLogOk: false },
      auth
    );
    expect(out.outcome).toBe('FAIL');
  });

  it('derives PASS by default', async () => {
    p.accommodationKitchenInspection.create.mockImplementation(async (a: any) => ({ ...a.data }));
    const out = await kitchenInspectionService.record(
      { siteId: 's1', inspectionDate: new Date() },
      auth
    );
    expect(out.outcome).toBe('PASS');
  });
});

// ---------------------------------------------------------------------------
// S10 — Cost-per-night derivation
// ---------------------------------------------------------------------------

describe('AccommodationCostService.record (S10)', () => {
  it('computes costPerNight from totalCost / occupantNights', async () => {
    p.accommodationCost.upsert.mockImplementation(async (a: any) => ({ ...a.create }));
    const out = await accommodationCostService.record(
      {
        siteId: 's1',
        period: '2026-06',
        rentAmount: 30000,
        utilitiesAmount: 5000,
        maintenanceAmount: 2000,
        occupantNights: 3700,
      },
      auth
    );
    expect(Number(out.totalCost)).toBe(37000);
    expect(Number(out.costPerNight)).toBe(10); // 37000 / 3700
  });

  it('rejects zero / negative occupantNights', async () => {
    await expect(
      accommodationCostService.record(
        {
          siteId: 's1',
          period: '2026-06',
          rentAmount: 100,
          utilitiesAmount: 0,
          maintenanceAmount: 0,
          occupantNights: 0,
        },
        auth
      )
    ).rejects.toThrow(/occupantNights/);
  });
});

// ---------------------------------------------------------------------------
// S16 — Risk band derivation
// ---------------------------------------------------------------------------

describe('AccommodationRiskRegisterService.deriveBand (S16)', () => {
  it('derives bands consistently with the per-EPIC scale', () => {
    expect(AccommodationRiskRegisterService.deriveBand(1, 2)).toBe('LOW');
    expect(AccommodationRiskRegisterService.deriveBand(2, 2)).toBe('MEDIUM');
    expect(AccommodationRiskRegisterService.deriveBand(3, 3)).toBe('HIGH');
    expect(AccommodationRiskRegisterService.deriveBand(5, 4)).toBe('CRITICAL');
  });

  it('raise rejects out-of-range likelihood / impact', async () => {
    await expect(
      accommodationRiskRegisterService.raise(
        { code: 'r1', description: 'x', likelihood: 0, impact: 3 },
        auth
      )
    ).rejects.toThrow(/1\.\.5/);
  });
});
