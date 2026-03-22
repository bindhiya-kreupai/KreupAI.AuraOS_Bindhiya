import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ShiftSwapService } from '@/app/dashboard/attendance/services';

describe('attendance dashboard shift swap service', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('derives my shifts from schedules and pending swap requests', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            data: {
              schedules: [
                {
                  id: 'assignment-1',
                  employeeId: 'emp-1',
                  shiftId: 'shift-1',
                  shiftName: 'General Shift',
                  startTime: '09:00',
                  endTime: '18:00',
                  effectiveFrom: '2026-03-22',
                },
              ],
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            data: [
              {
                id: 'swap-1',
                requestorId: 'emp-1',
                requestorShiftId: 'assignment-1',
                status: 'PENDING',
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

    const result = await ShiftSwapService.getMyShifts('current-user-id');

    expect(result).toEqual([
      expect.objectContaining({
        id: 'assignment-1',
        date: '2026-03-22',
        time: '09:00 - 18:00',
        type: 'Morning',
        location: 'General Shift',
        status: 'Swap Requested',
      }),
    ]);
  });

  it('maps marketplace entries from the base shift-swap endpoint', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: [
            {
              id: 'swap-2',
              requestorName: 'Jane Doe',
              requestorDate: '2026-03-23',
              requestorTime: '14:00 - 22:00',
              requestorShiftType: 'Evening',
              reason: 'Need to swap for an appointment',
              status: 'PENDING',
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const result = await ShiftSwapService.getMarketplace();

    expect(result).toEqual([
      expect.objectContaining({
        id: 'swap-2',
        offeredBy: expect.objectContaining({ name: 'Jane Doe', role: 'Colleague' }),
        date: '2026-03-23',
        time: '14:00 - 22:00',
        type: 'Evening',
      }),
    ]);
  });

  it('submits and accepts swaps through the base route without dead sub-endpoints', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            data: { id: 'swap-3', status: 'PENDING', requestorShiftId: 'assignment-1' },
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            data: { id: 'swap-3', status: 'APPROVED', targetEmployeeId: 'emp-2' },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

    await ShiftSwapService.requestSwap({
      fromEmployeeId: 'current-user-id',
      shiftId: 'assignment-1',
      date: '2026-03-22',
      reason: 'Shift swap request',
    });

    await ShiftSwapService.acceptSwap('swap-3', 'current-user-id');

    const requestCall = vi.mocked(fetch).mock.calls[0];
    const requestBody = JSON.parse(String((requestCall?.[1] as RequestInit).body));
    const acceptCall = vi.mocked(fetch).mock.calls[1];
    const acceptUrl = String(acceptCall?.[0]);
    const acceptInit = acceptCall?.[1] as RequestInit;
    const acceptBody = JSON.parse(String(acceptInit.body));

    expect(requestBody).toEqual({
      requestorShiftId: 'assignment-1',
      requestorDate: '2026-03-22',
      targetDate: '2026-03-22',
      reason: 'Shift swap request',
    });
    expect(acceptUrl).toContain('/api/attendance/shift-swap');
    expect(acceptInit.method).toBe('PUT');
    expect(acceptBody).toEqual({ id: 'swap-3', status: 'APPROVED' });
  });
});
