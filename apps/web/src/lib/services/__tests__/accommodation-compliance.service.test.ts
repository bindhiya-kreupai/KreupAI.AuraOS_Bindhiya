import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  accommodationSiteService,
  accommodationAssignmentService,
  accommodationInspectionService,
  accommodationComplaintService,
  accommodationCertificateService,
  isComplaintSlaBreached,
} from '../accommodation-compliance';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.accommodationSite = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 's-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 's-1', ...data })),
  };
  m.accommodationAssignment = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'a-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'a-1', ...data })),
  };
  m.accommodationInspection = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    aggregate: vi.fn().mockResolvedValue({ _avg: { score: 0 } }),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'i-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'i-1', ...data })),
  };
  m.accommodationComplaint = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'c-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'c-1', ...data })),
  };
  m.accommodationCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'cert-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cert-1', ...data })),
  };
});

describe('isComplaintSlaBreached', () => {
  it('returns false for RESOLVED status', () => {
    expect(
      isComplaintSlaBreached({
        raisedAt: new Date(Date.now() - 100 * 3600 * 1000),
        slaHours: 48,
        status: 'RESOLVED',
      })
    ).toBe(false);
  });
  it('returns false when within SLA', () => {
    expect(
      isComplaintSlaBreached({
        raisedAt: new Date(Date.now() - 24 * 3600 * 1000),
        slaHours: 48,
        status: 'OPEN',
      })
    ).toBe(false);
  });
  it('returns true when past SLA and not resolved', () => {
    expect(
      isComplaintSlaBreached({
        raisedAt: new Date(Date.now() - 72 * 3600 * 1000),
        slaHours: 48,
        status: 'OPEN',
      })
    ).toBe(true);
  });
});

describe('accommodationAssignmentService.assign', () => {
  it('throws when site at capacity', async () => {
    m.accommodationSite.findUnique = vi
      .fn()
      .mockResolvedValue({
        id: 's-1',
        tenantId: 'tenant-1',
        currentOccupancy: 50,
        totalCapacity: 50,
      });
    await expect(
      accommodationAssignmentService.assign(
        { siteId: 's-1', employeeId: 'e-1', checkInAt: new Date() },
        auth
      )
    ).rejects.toThrow(/at capacity/);
  });
  it('increments site occupancy on assign', async () => {
    m.accommodationSite.findUnique = vi
      .fn()
      .mockResolvedValue({
        id: 's-1',
        tenantId: 'tenant-1',
        currentOccupancy: 10,
        totalCapacity: 50,
      });
    await accommodationAssignmentService.assign(
      { siteId: 's-1', employeeId: 'e-1', checkInAt: new Date() },
      auth
    );
    expect(m.accommodationSite.update).toHaveBeenCalled();
    const call = m.accommodationSite.update.mock.calls[0][0];
    expect(call.data.currentOccupancy).toEqual({ increment: 1 });
  });
});

describe('accommodationAssignmentService.checkOut', () => {
  it('decrements site occupancy on check-out', async () => {
    m.accommodationAssignment.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'a-1', siteId: 's-1', status: 'ACTIVE' });
    await accommodationAssignmentService.checkOut('a-1', new Date(), auth);
    const call = m.accommodationSite.update.mock.calls[0][0];
    expect(call.data.currentOccupancy).toEqual({ decrement: 1 });
  });
});

describe('accommodationInspectionService.record', () => {
  it('auto-closes inspection when no critical findings', async () => {
    await accommodationInspectionService.record(
      {
        siteId: 's-1',
        inspectionDate: new Date(),
        category: 'HYGIENE',
        score: 90,
        criticalFindings: 0,
      },
      auth
    );
    const call = m.accommodationInspection.create.mock.calls[0][0];
    expect(call.data.status).toBe('CLOSED');
  });
  it('leaves inspection OPEN when critical findings present', async () => {
    await accommodationInspectionService.record(
      {
        siteId: 's-1',
        inspectionDate: new Date(),
        category: 'FIRE_SAFETY',
        score: 60,
        criticalFindings: 2,
      },
      auth
    );
    const call = m.accommodationInspection.create.mock.calls[0][0];
    expect(call.data.status).toBe('OPEN');
  });
  it('schedules next inspection 3 months out', async () => {
    const inspectionDate = new Date('2026-06-15');
    await accommodationInspectionService.record(
      { siteId: 's-1', inspectionDate, category: 'HYGIENE', score: 90 },
      auth
    );
    const call = m.accommodationSite.update.mock.calls[0][0];
    const expected = new Date(inspectionDate);
    expected.setMonth(expected.getMonth() + 3);
    expect((call.data.nextInspectionAt as Date).toISOString().slice(0, 7)).toBe(
      expected.toISOString().slice(0, 7)
    );
  });
});

describe('accommodationCertificateService', () => {
  it('gates when sites over capacity', async () => {
    m.accommodationSite.findMany = vi
      .fn()
      .mockResolvedValue([{ currentOccupancy: 60, totalCapacity: 50 }]);
    const cert = await accommodationCertificateService.generate('2026-06', auth);
    expect(cert.gatingReason).toMatch(/over capacity/);
  });
  it('gates when CRITICAL findings open', async () => {
    m.accommodationInspection.count = vi.fn().mockResolvedValue(2);
    const cert = await accommodationCertificateService.generate('2026-06', auth);
    expect(cert.gatingReason).toMatch(/CRITICAL/);
  });
  it('refuses to sign while gated', async () => {
    m.accommodationCertificate.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'c-1', gatingReason: 'Blocked: 1 site(s) over capacity' });
    await expect(accommodationCertificateService.sign('2026-06', [], auth)).rejects.toThrow(
      /cannot sign while gated/
    );
  });
});
