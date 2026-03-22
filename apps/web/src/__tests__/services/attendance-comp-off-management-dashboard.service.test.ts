import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CompOffManagementService } from '@/app/dashboard/attendance/services';

describe('attendance dashboard comp-off management service', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps comp-off management data into summary and ledger transactions', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            compOffs: [
              {
                id: 'cm-1',
                employeeId: 'emp-1',
                employeeName: 'Jane Doe',
                earnedDate: '2026-03-01',
                earnedHours: 8,
                status: 'EARNED',
                expiryDate: '2099-04-15',
                remarks: 'Weekend deployment',
              },
              {
                id: 'cm-2',
                employeeId: 'emp-1',
                employeeName: 'Jane Doe',
                earnedDate: '2026-03-10',
                earnedHours: 4,
                status: 'AVAILED',
                expiryDate: '2099-05-01',
                remarks: 'Applied as leave',
              },
            ],
            summary: {
              total: 2,
              earned: 1,
              approved: 1,
            },
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const result = await CompOffManagementService.getCompOffData();

    expect(result).toMatchObject({
      balance: 0.5,
      expiringDays: 60,
      expiringSoon: 0,
      transactions: [
        expect.objectContaining({
          id: 'cm-1',
          dateWorked: '2026-03-01',
          credit: 1,
          status: 'Credited',
        }),
        expect.objectContaining({
          id: 'cm-2',
          dateWorked: '2026-03-10',
          credit: -0.5,
          status: 'Utilized',
        }),
      ],
    });
  });
});
