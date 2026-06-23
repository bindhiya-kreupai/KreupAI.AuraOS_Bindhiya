// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/services/accommodation-compliance/safety-controls.service', () => ({
  evaluateHygiene: vi.fn(),
  evaluateFireSafety: vi.fn(),
  evaluateFoodSafety: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/accommodation-compliance/safety-controls/route';
import {
  evaluateHygiene,
  evaluateFireSafety,
  evaluateFoodSafety,
} from '@/lib/services/accommodation-compliance/safety-controls.service';

const hygieneMock = evaluateHygiene as unknown as ReturnType<typeof vi.fn>;
const fireMock = evaluateFireSafety as unknown as ReturnType<typeof vi.fn>;
const foodMock = evaluateFoodSafety as unknown as ReturnType<typeof vi.fn>;

function makeReq(body: unknown, permissions: string[] = ['accommodation:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/accommodation-compliance/safety-controls', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({}, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on invalid hygiene input', async () => {
    const [req, ctx] = makeReq({ action: 'hygiene', input: { occupants: -1 } });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 on hygiene action', async () => {
    hygieneMock.mockReturnValue({ pass: true, score: 90, band: 'GOOD', failures: [] });
    const [req, ctx] = makeReq({
      action: 'hygiene',
      input: {
        occupants: 4,
        toiletFixtures: 2,
        showerFixtures: 2,
        cleanlinessScore: 4,
        pestEvidence: false,
        beddingPoor: false,
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.pass).toBe(true);
    expect(hygieneMock).toHaveBeenCalled();
  });

  it('returns 200 on fire action', async () => {
    fireMock.mockReturnValue({ pass: true, score: 100, band: 'GOOD', failures: [] });
    const [req, ctx] = makeReq({
      action: 'fire',
      input: {
        smokeDetectorsWorking: true,
        fireExtinguisherWithinDate: true,
        emergencyExitsClear: true,
        fireDrillLast6Months: true,
        fireAlarmTestedMonthly: true,
        exitBlocked: false,
      },
    });
    const res = await POST(req, ctx);
    expect(res.status).toBe(200);
    expect(fireMock).toHaveBeenCalled();
  });

  it('returns 200 on food action', async () => {
    foodMock.mockReturnValue({ pass: true, score: 85, band: 'GOOD', failures: [] });
    const [req, ctx] = makeReq({
      action: 'food',
      input: {
        coldStorageTempOk: true,
        hotHoldingTempOk: true,
        handlersHealthCardsValid: true,
        pestControlQuarterly: true,
        pestEvidenceInPrep: false,
        sanitationScore: 5,
      },
    });
    const res = await POST(req, ctx);
    expect(res.status).toBe(200);
    expect(foodMock).toHaveBeenCalled();
  });
});
