// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

vi.mock('@aura/database', () => ({
  prisma: {
    benefitCampaign: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { GET, POST } from '@/app/api/benefits/campaigns/route';
import { prisma } from '@aura/database';

const db = prisma as unknown as any;

function makeReq(body: unknown, url = 'http://x/api/benefits/campaigns') {
  return [
    { json: async () => body, url } as any,
    { user: { userId: 'u1', tenantId: 't1' } } as any,
  ] as const;
}

describe('GET /api/benefits/campaigns', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns tenant-scoped campaigns in {success,data} shape', async () => {
    db.benefitCampaign.findMany.mockResolvedValue([
      { id: 'c1', title: 'Enrollment Closing', type: 'Urgent', status: 'QUEUED' },
    ]);
    const [req, ctx] = makeReq(undefined);
    const res = await GET(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(1);
    expect(db.benefitCampaign.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 't1', isDeleted: false }),
      })
    );
  });
});

describe('POST /api/benefits/campaigns', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 with bilingual error when title/message missing', async () => {
    const [req, ctx] = makeReq({ title: '', message: '' });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error.message).toBeTruthy();
    expect(json.error.messageAr).toBeTruthy();
    expect(db.benefitCampaign.create).not.toHaveBeenCalled();
  });

  it('queues a campaign scoped to the tenant with the authoring user', async () => {
    db.benefitCampaign.create.mockResolvedValue({ id: 'c9', title: 'OE Reminder' });
    const [req, ctx] = makeReq({
      title: 'OE Reminder',
      type: 'Info',
      channel: 'Email & Push',
      message: 'Please confirm your elections.',
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.messageAr).toBeTruthy();
    expect(db.benefitCampaign.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 't1',
          createdBy: 'u1',
          status: 'QUEUED',
          type: 'Info',
        }),
      })
    );
  });

  it('defaults an unknown type to Info and blank channel to Email', async () => {
    db.benefitCampaign.create.mockResolvedValue({ id: 'c10' });
    const [req, ctx] = makeReq({
      title: 'Note',
      type: 'Bogus',
      channel: '   ',
      message: 'Hello team.',
    });
    const res = await POST(req, ctx);
    await res.json();
    expect(db.benefitCampaign.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ type: 'Info', channel: 'Email' }),
      })
    );
  });
});
