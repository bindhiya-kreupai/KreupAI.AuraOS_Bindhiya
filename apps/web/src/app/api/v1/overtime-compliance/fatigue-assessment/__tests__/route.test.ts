// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/services/overtime-compliance/fatigue-assessment.service', () => ({
  fatigueAssessmentService: {
    assess: vi.fn(),
  },
}));

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/overtime-compliance/fatigue-assessment/route';
import { fatigueAssessmentService } from '@/lib/services/overtime-compliance/fatigue-assessment.service';

const svc = fatigueAssessmentService as unknown as any;

function makeReq(body: unknown, permissions: string[] = ['attendance:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/overtime-compliance/fatigue-assessment', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({}, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on invalid input', async () => {
    const [req, ctx] = makeReq({ employeeId: 'e1' });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 + verdict on valid input', async () => {
    svc.assess.mockResolvedValue({ allow: false, band: 'CRITICAL', warnings: ['too many hours'] });
    const [req, ctx] = makeReq({
      employeeId: 'e1',
      proposedStart: '2026-06-01T08:00:00.000Z',
      proposedEnd: '2026-06-01T20:00:00.000Z',
      country: 'AE',
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.allow).toBe(false);
    expect(json.data.verdict.band).toBe('CRITICAL');
    expect(svc.assess).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 't1',
        employeeId: 'e1',
        country: 'AE',
        proposedStart: expect.any(Date),
        proposedEnd: expect.any(Date),
      })
    );
  });
});
