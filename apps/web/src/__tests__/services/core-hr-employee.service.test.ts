import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EmployeeService } from '@/app/dashboard/core-hr/services';

describe('EmployeeService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('searches employees through the base core-HR employees endpoint', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          employees: [{ id: 'emp-1', firstName: 'Jane', lastName: 'Doe' }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const results = await EmployeeService.searchEmployees('Jane');

    expect(results).toHaveLength(1);
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain('/api/core-hr/employees?query=Jane');
  });
});