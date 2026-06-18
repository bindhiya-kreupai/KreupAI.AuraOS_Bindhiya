// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/services/hse-compliance/safety-management.service', () => ({
  evaluatePpeCoverage: vi.fn(),
  evaluateToolboxCoverage: vi.fn(),
  evaluateDrillCadence: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/hse-compliance/safety-management/route';
import {
  evaluatePpeCoverage,
  evaluateToolboxCoverage,
  evaluateDrillCadence,
} from '@/lib/services/hse-compliance/safety-management.service';

const ppeMock = evaluatePpeCoverage as unknown as ReturnType<typeof vi.fn>;
const toolboxMock = evaluateToolboxCoverage as unknown as ReturnType<typeof vi.fn>;
const drillMock = evaluateDrillCadence as unknown as ReturnType<typeof vi.fn>;

function makeReq(body: unknown, permissions: string[] = ['hse:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/hse-compliance/safety-management', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({}, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on missing action', async () => {
    const [req, ctx] = makeReq({});
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 on ppe action', async () => {
    ppeMock.mockReturnValue({
      totals: { employeesInScope: 1, requirementsChecked: 1, failures: 0, coveragePct: 100 },
    });
    const [req, ctx] = makeReq({
      action: 'ppe',
      input: {
        employees: [{ employeeId: 'E1', role: 'DRIVER' }],
        requirements: [{ role: 'DRIVER', ppeType: 'HI_VIS' }],
        issuances: [
          {
            employeeId: 'E1',
            ppeType: 'HI_VIS',
            issuedAt: '2025-01-01T00:00:00.000Z',
            expiresAt: '2026-12-31T00:00:00.000Z',
            hasSize: true,
          },
        ],
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.totals.coveragePct).toBe(100);
    expect(ppeMock).toHaveBeenCalled();
  });

  it('returns 200 on toolbox action', async () => {
    toolboxMock.mockReturnValue({
      totals: { employeesInScope: 1, overdue: 0, coveragePct: 100 },
    });
    const [req, ctx] = makeReq({
      action: 'toolbox',
      input: {
        employees: [{ employeeId: 'E1' }],
        attendances: [{ employeeId: 'E1', attendedAt: '2026-06-10T00:00:00.000Z' }],
      },
    });
    const res = await POST(req, ctx);
    expect(res.status).toBe(200);
    expect(toolboxMock).toHaveBeenCalled();
  });

  it('returns 200 on drill action', async () => {
    drillMock.mockReturnValue({
      totals: { drillTypesInScope: 1, overdue: 0, coveragePct: 100 },
    });
    const [req, ctx] = makeReq({
      action: 'drill',
      input: {
        drills: [
          {
            drillType: 'FIRE',
            conductedAt: '2026-03-01T00:00:00.000Z',
            attendancePct: 92,
            passed: true,
          },
        ],
      },
    });
    const res = await POST(req, ctx);
    expect(res.status).toBe(200);
    expect(drillMock).toHaveBeenCalled();
  });
});
