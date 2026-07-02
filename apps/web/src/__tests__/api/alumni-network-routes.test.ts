import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockContext = {
  // The enhanced-auth middleware exposes employeeId at the top level of context.
  employeeId: 'emp-auth-1',
  user: {
    tenantId: 'tenant-1',
    userId: 'user-1',
    email: 'alum@example.com',
  },
};

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => (request: Request, routeCtx: any) =>
    handler(request, { ...mockContext, ...routeCtx }),
}));

vi.mock('@aura/database', () => ({
  prisma: {
    alumniJob: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    alumniEvent: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    alumniEventRegistration: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { prisma } from '@aura/database';
import { POST as createJob, GET as listJobs } from '@/app/api/alumni-network/jobs/route';
import { POST as registerForEvent } from '@/app/api/alumni-network/events/[eventId]/register/route';

const db = prisma as any;

describe('alumni-network jobs API', () => {
  beforeEach(() => vi.clearAllMocks());

  it('binds the posted job to the authenticated employee (ignores client id)', async () => {
    db.alumniJob.create.mockResolvedValue({
      id: 'job-1',
      jobTitle: 'Senior Engineer',
      companyName: 'FutureTech',
      jobType: 'full_time',
      workLocation: 'remote',
      status: 'active',
      postedByEmployeeId: 'emp-auth-1',
      applicationCount: 0,
      savedCount: 0,
      viewCount: 0,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = new NextRequest('http://localhost/api/alumni-network/jobs', {
      method: 'POST',
      body: JSON.stringify({
        jobTitle: 'Senior Engineer',
        companyName: 'FutureTech',
        postedByEmployeeId: 'spoofed-id',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await createJob(request as any, {} as any);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(db.alumniJob.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          postedByEmployeeId: 'emp-auth-1',
        }),
      })
    );
    expect(payload.jobId).toBe('job-1');
  });

  it('rejects a job without a title with a bilingual error', async () => {
    const request = new NextRequest('http://localhost/api/alumni-network/jobs', {
      method: 'POST',
      body: JSON.stringify({ companyName: 'FutureTech' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await createJob(request as any, {} as any);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.message).toBeTruthy();
    expect(payload.messageAr).toBeTruthy();
  });

  it('scopes the job list by tenant', async () => {
    db.alumniJob.findMany.mockResolvedValue([]);
    const request = new NextRequest('http://localhost/api/alumni-network/jobs');
    const response = await listJobs(request as any, {} as any);
    expect(response.status).toBe(200);
    expect(db.alumniJob.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1' } })
    );
  });
});

describe('alumni-network event registration API (RSVP)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('registers the authenticated alumnus and increments attendance', async () => {
    db.alumniEvent.findFirst.mockResolvedValue({
      id: 'ev-1',
      maxAttendees: 100,
      currentAttendees: 5,
    });
    db.alumniEventRegistration.findFirst.mockResolvedValue(null);
    db.alumniEventRegistration.create.mockResolvedValue({ id: 'reg-1' });
    db.alumniEvent.update.mockResolvedValue({
      id: 'ev-1',
      eventName: 'Gala',
      status: 'published',
      currentAttendees: 6,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = new NextRequest('http://localhost/api/alumni-network/events/ev-1/register', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await registerForEvent(
      request as any,
      {
        params: Promise.resolve({ eventId: 'ev-1' }),
      } as any
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(db.alumniEventRegistration.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tenantId: 'tenant-1', employeeId: 'emp-auth-1' }),
      })
    );
    expect(db.alumniEvent.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { currentAttendees: { increment: 1 } } })
    );
    expect(payload.currentAttendees).toBe(6);
  });

  it('rejects a duplicate RSVP with a bilingual 409', async () => {
    db.alumniEvent.findFirst.mockResolvedValue({ id: 'ev-1', currentAttendees: 5 });
    db.alumniEventRegistration.findFirst.mockResolvedValue({ id: 'reg-existing' });

    const request = new NextRequest('http://localhost/api/alumni-network/events/ev-1/register', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await registerForEvent(
      request as any,
      {
        params: Promise.resolve({ eventId: 'ev-1' }),
      } as any
    );
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.message).toBeTruthy();
    expect(payload.messageAr).toBeTruthy();
    expect(db.alumniEventRegistration.create).not.toHaveBeenCalled();
  });
});
