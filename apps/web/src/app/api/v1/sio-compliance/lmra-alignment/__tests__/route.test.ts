// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/services/sio-compliance/lmra-alignment.service', () => ({
  alignSioLmra: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/sio-compliance/lmra-alignment/route';
import { alignSioLmra } from '@/lib/services/sio-compliance/lmra-alignment.service';

const alignMock = alignSioLmra as unknown as ReturnType<typeof vi.fn>;

function makeReq(body: unknown, permissions: string[] = ['tenant:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/sio-compliance/lmra-alignment', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({}, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on missing cpr', async () => {
    const [req, ctx] = makeReq({
      sioRecords: [{ declaredWageBhd: 400 }],
      lmraRecords: [],
    });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 with alignment result on valid input', async () => {
    alignMock.mockReturnValue({
      summary: {
        totalSio: 1,
        totalLmra: 1,
        onlyInSio: 0,
        onlyInLmra: 0,
        wageMismatch: 0,
        statusMismatch: 0,
        alignmentPct: 100,
      },
    });
    const [req, ctx] = makeReq({
      sioRecords: [{ cpr: '123', declaredWageBhd: 400, status: 'ACTIVE' }],
      lmraRecords: [{ cpr: '123', declaredWageBhd: 400, status: 'ACTIVE' }],
      wageToleranceBhd: 10,
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.result.summary.alignmentPct).toBe(100);
    expect(alignMock).toHaveBeenCalledWith(expect.objectContaining({ wageToleranceBhd: 10 }));
  });
});
