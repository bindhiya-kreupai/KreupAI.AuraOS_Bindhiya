// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/services/hr-forms-compliance/conditional-logic.service', () => ({
  renderForm: vi.fn(),
  findMissingRequiredFields: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/hr-forms-compliance/conditional-logic/route';
import {
  renderForm,
  findMissingRequiredFields,
} from '@/lib/services/hr-forms-compliance/conditional-logic.service';

const renderMock = renderForm as unknown as ReturnType<typeof vi.fn>;
const missingMock = findMissingRequiredFields as unknown as ReturnType<typeof vi.fn>;

function makeReq(body: unknown, permissions: string[] = ['hr_form:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/hr-forms-compliance/conditional-logic', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({}, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on missing fields array', async () => {
    const [req, ctx] = makeReq({ values: {} });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 with render + missingRequired list', async () => {
    renderMock.mockReturnValue({ fields: [{ code: 'reason', visible: true, required: true }] });
    missingMock.mockReturnValue(['reason']);
    const [req, ctx] = makeReq({
      fields: [{ code: 'reason', type: 'text', requiredWhen: "values.action == 'TERMINATE'" }],
      values: { action: 'TERMINATE', reason: '' },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.missingRequired).toEqual(['reason']);
    expect(renderMock).toHaveBeenCalled();
    expect(missingMock).toHaveBeenCalled();
  });
});
