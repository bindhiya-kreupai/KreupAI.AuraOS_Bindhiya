// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

const grievanceCase = vi.hoisted(() => ({
  findMany: vi.fn(),
  count: vi.fn(),
  create: vi.fn(),
}));

vi.mock('@/lib/database', () => ({
  prisma: { erGrievanceCase: grievanceCase },
}));

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { GET, POST } from '@/app/api/my-services/grievances/route';

function ctx(employeeId?: string) {
  return { user: { tenantId: 't1', userId: 'u1' }, employeeId } as any;
}

function req(body?: unknown, url = 'http://x/api/my-services/grievances') {
  return { json: async () => body, url } as any;
}

describe('my-services/grievances route', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects when no employee is linked', async () => {
    const res = await GET(req(), ctx(undefined));
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.messageAr).toBeTruthy();
  });

  it('lists grievances scoped to tenant + complainant', async () => {
    grievanceCase.findMany.mockResolvedValue([
      {
        id: 'g1',
        caseNumber: 'GRV-2026-000001',
        grievanceType: 'Payroll Discrepancy',
        subject: 'Wrong pay',
        description: 'details',
        severity: 'HIGH',
        status: 'OPEN',
        raisedAt: new Date('2026-01-01'),
      },
    ]);
    grievanceCase.count.mockResolvedValue(1);

    const res = await GET(req(), ctx('emp-1'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data[0].id).toBe('GRV-2026-000001');
    expect(json.data[0].severity).toBe('High');
    expect(grievanceCase.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 't1', complainantId: 'emp-1' }),
      })
    );
  });

  it('validates required fields on create', async () => {
    const res = await POST(req({ subject: '' }), ctx('emp-1'));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.messageAr).toBeTruthy();
  });

  it('creates a grievance with a generated case number', async () => {
    grievanceCase.create.mockResolvedValue({
      id: 'g2',
      caseNumber: 'GRV-2026-123456',
      grievanceType: 'Workplace Safety',
      subject: 'Hazard',
      description: 'unsafe',
      severity: 'MEDIUM',
      status: 'OPEN',
      raisedAt: new Date('2026-02-02'),
    });

    const res = await POST(
      req({
        category: 'Workplace Safety',
        subject: 'Hazard',
        description: 'unsafe',
        severity: 'Medium',
      }),
      ctx('emp-1')
    );
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.severity).toBe('Medium');
    const createArg = grievanceCase.create.mock.calls[0][0];
    expect(createArg.data.tenantId).toBe('t1');
    expect(createArg.data.complainantId).toBe('emp-1');
    expect(createArg.data.severity).toBe('MEDIUM');
    expect(createArg.data.caseNumber).toMatch(/^GRV-\d{4}-\d{6}$/);
  });
});
