// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/services/document-retention-compliance/classification.service', () => ({
  classifyDocument: vi.fn(),
  retentionExpiryDate: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/document-retention-compliance/classify/route';
import {
  classifyDocument,
  retentionExpiryDate,
} from '@/lib/services/document-retention-compliance/classification.service';

const classifyMock = classifyDocument as unknown as ReturnType<typeof vi.fn>;
const expiryMock = retentionExpiryDate as unknown as ReturnType<typeof vi.fn>;

function makeReq(body: unknown, permissions: string[] = ['document:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/document-retention-compliance/classify', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({}, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on missing filename', async () => {
    const [req, ctx] = makeReq({});
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 + classification verdict on valid input', async () => {
    classifyMock.mockReturnValue({
      category: 'PAYSLIP',
      matchedOn: 'filename',
      retention: { retentionYears: 7, retainFromSeparation: false, regulatoryBasis: 'FTA' },
    });
    expiryMock.mockReturnValue(new Date('2033-01-01').toISOString());
    const [req, ctx] = makeReq({
      filename: 'payslip-jan-2026.pdf',
      mimeType: 'application/pdf',
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.category).toBe('PAYSLIP');
    expect(json.data.verdict.expiry).toBeDefined();
    expect(classifyMock).toHaveBeenCalledWith(
      expect.objectContaining({ filename: 'payslip-jan-2026.pdf' })
    );
  });
});
