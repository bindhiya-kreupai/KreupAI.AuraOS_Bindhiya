import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ExitService,
  MassUpdateService,
  OrganizationService,
  PositionService,
} from '@/app/dashboard/core-hr/services';

describe('core-HR route contracts', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('updates organization units through the base organization route with id in the request body', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ unit: { id: 'unit-1', name: 'Finance' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await OrganizationService.updateUnit('unit-1', { unitName: 'Finance' } as any);

    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain('/api/core-hr/organization');
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).not.toContain('/api/core-hr/organization/unit-1');
    expect(String(vi.mocked(fetch).mock.calls[0]?.[1]?.body)).toBe(
      JSON.stringify({ id: 'unit-1', unitName: 'Finance' })
    );
  });

  it('updates positions through the base positions route with id in the request body', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ position: { id: 'pos-1', title: 'Manager' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await PositionService.updatePosition('pos-1', { positionTitle: 'Manager' } as any);

    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain('/api/core-hr/positions');
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).not.toContain('/api/core-hr/positions/pos-1');
    expect(String(vi.mocked(fetch).mock.calls[0]?.[1]?.body)).toBe(
      JSON.stringify({ id: 'pos-1', positionTitle: 'Manager' })
    );
  });

  it('updates exits through the base exits route with id in the request body', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ exit: { id: 'exit-1', status: 'PROCESSING' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await ExitService.updateExit('exit-1', { status: 'in_progress' } as any);

    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain('/api/core-hr/exits');
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).not.toContain('/api/core-hr/exits/exit-1');
    expect(String(vi.mocked(fetch).mock.calls[0]?.[1]?.body)).toBe(
      JSON.stringify({ id: 'exit-1', status: 'in_progress' })
    );
  });

  it('executes mass updates through the execute sub-route', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ update: { id: 'update-1', status: 'EXECUTED' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await MassUpdateService.executeMassUpdate('update-1');

    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain('/api/core-hr/mass-updates/update-1/execute');
    expect(vi.mocked(fetch).mock.calls[0]?.[1]).toMatchObject({ method: 'POST' });
  });
});