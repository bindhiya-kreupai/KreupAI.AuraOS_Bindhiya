import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Auth context injected into every handler. Includes tenant scoping, the
// authenticated user id, route params, and the permission set the routes check.
const mockContext = {
  user: { tenantId: 'tenant-1', userId: 'user-1', employeeId: 'user-1' },
  permissions: [
    'helpdesk:read',
    'helpdesk:create',
    'helpdesk:update',
    'helpdesk:delete',
    'helpdesk/tickets:read',
    'helpdesk/tickets:create',
    'helpdesk/tickets:update',
    'helpdesk/tickets:delete',
  ],
  params: { id: 'ticket-1' },
};

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => (request: Request, routeCtx?: any) =>
    handler(request, { ...mockContext, ...(routeCtx || {}) }),
}));

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

// Hoisted so the delegate spies are available inside the hoisted vi.mock factory.
const { helpdeskTicket, helpdeskKnowledgeArticle } = vi.hoisted(() => ({
  helpdeskTicket: {
    findMany: vi.fn(),
    count: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  helpdeskKnowledgeArticle: {
    findMany: vi.fn(),
    count: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@aura/database', () => ({
  prisma: { helpdeskTicket, helpdeskKnowledgeArticle },
}));

import { GET as ticketsGet, POST as ticketsPost } from '@/app/api/helpdesk/tickets/route';
import { PUT as ticketPut } from '@/app/api/helpdesk/tickets/[id]/route';
import { POST as ticketAssign } from '@/app/api/helpdesk/tickets/[id]/assign/route';
import { POST as kbPost } from '@/app/api/helpdesk/knowledge-base/route';

function req(url: string, body?: any) {
  return new NextRequest(url, {
    method: body ? 'POST' : 'GET',
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

describe('helpdesk tickets API', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lists tickets scoped by tenant', async () => {
    helpdeskTicket.findMany.mockResolvedValue([{ id: 't1' }]);
    helpdeskTicket.count.mockResolvedValue(1);

    const res = await ticketsGet(req('http://localhost/api/helpdesk/tickets') as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(1);
    expect(helpdeskTicket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1' } })
    );
  });

  it('creates a ticket with server-derived tenant + creator', async () => {
    helpdeskTicket.create.mockResolvedValue({ id: 't2' });

    const res = await ticketsPost(
      req('http://localhost/api/helpdesk/tickets', { subject: 'Help', category: 'IT' }) as any
    );
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.data.id).toBe('t2');
    expect(helpdeskTicket.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tenantId: 'tenant-1', createdBy: 'user-1' }),
      })
    );
  });

  it('sets resolvedAt when a ticket is moved to RESOLVED', async () => {
    helpdeskTicket.findFirst.mockResolvedValue({ id: 'ticket-1' });
    helpdeskTicket.update.mockResolvedValue({ id: 'ticket-1', status: 'RESOLVED' });

    const res = await ticketPut(
      new NextRequest('http://localhost/api/helpdesk/tickets/ticket-1', {
        method: 'PUT',
        body: JSON.stringify({ status: 'RESOLVED', tenantId: 'evil-tenant' }),
      }) as any
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    const updateArg = helpdeskTicket.update.mock.calls[0][0];
    expect(updateArg.data.status).toBe('RESOLVED');
    expect(updateArg.data.resolvedAt).toBeInstanceOf(Date);
    // Client-sent tenantId must never overwrite scoping.
    expect(updateArg.data.tenantId).toBeUndefined();
  });

  it('self-assigns a ticket to the authenticated user when no assignee is sent', async () => {
    helpdeskTicket.findFirst.mockResolvedValue({ id: 'ticket-1', status: 'OPEN' });
    helpdeskTicket.update.mockResolvedValue({ id: 'ticket-1', assigneeId: 'user-1' });

    const res = await ticketAssign(
      new NextRequest('http://localhost/api/helpdesk/tickets/ticket-1/assign', {
        method: 'POST',
        body: JSON.stringify({}),
      }) as any
    );

    expect(res.status).toBe(200);
    const updateArg = helpdeskTicket.update.mock.calls[0][0];
    expect(updateArg.data.assigneeId).toBe('user-1');
    expect(updateArg.data.status).toBe('IN_PROGRESS');
  });

  it('rejects ticket creation without permission (bilingual error)', async () => {
    mockContext.permissions = ['helpdesk:read'];
    const res = await ticketsPost(
      req('http://localhost/api/helpdesk/tickets', { subject: 'x' }) as any
    );
    const json = await res.json();
    expect(res.status).toBe(403);
    expect(json.error.message).toContain('Forbidden');
    expect(json.error.messageAr).toBeTruthy();
    // restore
    mockContext.permissions = [
      'helpdesk:read',
      'helpdesk:create',
      'helpdesk:update',
      'helpdesk:delete',
      'helpdesk/tickets:read',
      'helpdesk/tickets:create',
      'helpdesk/tickets:update',
      'helpdesk/tickets:delete',
    ];
  });
});

describe('helpdesk knowledge-base API', () => {
  beforeEach(() => vi.clearAllMocks());

  it('validates that a title is required on create', async () => {
    const res = await kbPost(
      req('http://localhost/api/helpdesk/knowledge-base', { summary: 'no title' }) as any
    );
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error.code).toBe('E2001');
    expect(helpdeskKnowledgeArticle.create).not.toHaveBeenCalled();
  });

  it('creates an article scoped to the tenant', async () => {
    helpdeskKnowledgeArticle.create.mockResolvedValue({ id: 'a1' });
    const res = await kbPost(
      req('http://localhost/api/helpdesk/knowledge-base', {
        title: 'Reset password',
        category: 'IT',
      }) as any
    );
    expect(res.status).toBe(201);
    expect(helpdeskKnowledgeArticle.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tenantId: 'tenant-1', createdBy: 'user-1' }),
      })
    );
  });
});
