import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LetterService } from '@/app/dashboard/core-hr/services';

describe('core-HR letter service', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('accepts the current letter creation response shape from the core-HR letters route', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          letter: {
            id: 'letter-1',
            employeeId: 'emp-1',
            letterType: 'employment_verification',
            status: 'DRAFT',
          },
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const letter = await LetterService.createLetterRequest({
      employeeId: 'emp-1',
      letterType: 'employment_verification',
    } as any);

    expect(letter).toMatchObject({
      id: 'letter-1',
      employeeId: 'emp-1',
      letterType: 'employment_verification',
      status: 'DRAFT',
    });
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain('/api/core-hr/letters');
    expect(vi.mocked(fetch).mock.calls[0]?.[1]).toMatchObject({ method: 'POST' });
  });
});