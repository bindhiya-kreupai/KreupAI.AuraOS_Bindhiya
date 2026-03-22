import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AutoNumberService } from '@/app/dashboard/core-hr/services';

describe('AutoNumberService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps auto-number sequence payloads from the core-HR route into dashboard sequence objects', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          sequences: [
            {
              entityType: 'EMPLOYEE',
              prefix: 'EMP',
              currentNumber: 1000,
              padLength: 6,
              description: 'Employee Code',
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const sequences = await AutoNumberService.getAllSequences();

    expect(sequences).toHaveLength(1);
    expect(sequences[0]).toMatchObject({
      sequenceId: 'employee',
      sequenceName: 'Employee Code',
      entityType: 'employee',
      prefix: 'EMP',
      currentNumber: 1001,
      numberLength: 6,
      resetFrequency: 'never',
      isActive: true,
    });
    expect(sequences[0]?.createdDate).toBeInstanceOf(Date);
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain('/api/core-hr/auto-numbers');
  });

  it('generates numbers through the base auto-number route and accepts the backward-compatible response shape', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          entityType: 'EMPLOYEE',
          number: 'EMP-001001',
          generatedNumber: 'EMP-001001',
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const number = await AutoNumberService.generateNumber('employee');

    expect(number).toBe('EMP-001001');
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain('/api/core-hr/auto-numbers');
    expect(vi.mocked(fetch).mock.calls[0]?.[1]).toMatchObject({ method: 'POST' });
    expect(String(vi.mocked(fetch).mock.calls[0]?.[1]?.body)).toBe(
      JSON.stringify({ entityType: 'employee' })
    );
  });
});