// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/services/checklist-engine/red-flag-automation.service', () => ({
  selectFiringRules: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/checklist-engine/red-flag-automation/test/route';
import { selectFiringRules } from '@/lib/services/checklist-engine/red-flag-automation.service';

const selectMock = selectFiringRules as unknown as ReturnType<typeof vi.fn>;

function makeReq(body: unknown, permissions: string[] = ['risk_register:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/checklist-engine/red-flag-automation/test', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({}, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on missing event.type', async () => {
    const [req, ctx] = makeReq({ rules: [], event: { payload: {} } });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 with firing list + totalCandidates', async () => {
    selectMock.mockReturnValue([{ code: 'RUN_SIZE_SPIKE', thresholds: { netCap: 1000000 } }]);
    const [req, ctx] = makeReq({
      rules: [
        {
          code: 'RUN_SIZE_SPIKE',
          isActive: true,
          expression: 'payload.totalNet > thresholds.netCap',
          thresholdJson: { triggerOn: 'payroll.run.completed', netCap: 1000000 },
        },
      ],
      event: { type: 'payroll.run.completed', payload: { totalNet: 1500000 } },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.firing).toHaveLength(1);
    expect(json.data.verdict.totalCandidates).toBe(1);
    expect(selectMock).toHaveBeenCalled();
  });
});
