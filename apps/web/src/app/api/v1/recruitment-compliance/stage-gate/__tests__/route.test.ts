// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/services/recruitment-compliance/stage-gate.service', () => ({
  evaluateTransition: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/recruitment-compliance/stage-gate/route';
import { evaluateTransition } from '@/lib/services/recruitment-compliance/stage-gate.service';

const evalMock = evaluateTransition as unknown as ReturnType<typeof vi.fn>;

function makeReq(body: unknown, permissions: string[] = ['recruitment:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/recruitment-compliance/stage-gate', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({}, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on invalid input', async () => {
    const [req, ctx] = makeReq({ snapshot: {} });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 + verdict on valid input', async () => {
    evalMock.mockReturnValue({ allow: true, blockingCode: null });
    const [req, ctx] = makeReq({
      snapshot: {
        caseId: 'c1',
        candidateId: 'cand1',
        currentStage: 'SCREENED',
        screeningScore: 85,
        screeningPassMark: 70,
      },
      toStage: 'INTERVIEWED',
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.allow).toBe(true);
    expect(evalMock).toHaveBeenCalledWith(
      expect.objectContaining({ caseId: 'c1', currentStage: 'SCREENED' }),
      'INTERVIEWED'
    );
  });
});
