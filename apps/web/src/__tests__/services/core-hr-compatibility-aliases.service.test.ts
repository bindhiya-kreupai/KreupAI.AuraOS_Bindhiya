import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ExitService,
  LetterService,
  LifeEventService,
  MassUpdateService,
} from '@/app/dashboard/core-hr/services';

describe('core-HR compatibility aliases', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads exits through the alias used by useCoreHR', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ exits: [{ id: 'exit-1' }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const exits = await ExitService.getAllExits();

    expect(exits).toHaveLength(1);
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain('/api/core-hr/exits');
  });

  it('loads employee letter requests through the compatibility alias', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ requests: [{ id: 'letter-1', employeeId: 'emp-1' }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const requests = await LetterService.getEmployeeRequests('emp-1');

    expect(requests).toHaveLength(1);
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain('/api/core-hr/letters?employeeId=emp-1');
  });

  it('processes life events through the base route with the compatibility alias', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ event: { id: 'event-1', status: 'COMPLETED' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await LifeEventService.processEvent('event-1', 'user-1');

    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain('/api/core-hr/life-events');
    expect(vi.mocked(fetch).mock.calls[0]?.[1]).toMatchObject({ method: 'PUT' });
    expect(String(vi.mocked(fetch).mock.calls[0]?.[1]?.body)).toContain('"id":"event-1"');
  });

  it('returns hook-compatible execution counts for mass update aliases', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          update: {
            id: 'update-1',
            status: 'EXECUTED',
            results: { successful: 10, failed: 2 },
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );

    const result = await MassUpdateService.executeUpdate('update-1', 'admin');

    expect(result).toMatchObject({
      id: 'update-1',
      successCount: 10,
      failureCount: 2,
    });
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain('/api/core-hr/mass-updates/update-1/execute');
  });
});