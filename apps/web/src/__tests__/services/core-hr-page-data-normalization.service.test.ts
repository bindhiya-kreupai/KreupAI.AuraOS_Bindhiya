import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AnniversaryService,
  CostCenterService,
  ExitService,
  IDCardService,
} from '@/app/dashboard/core-hr/services';

describe('core-HR page data normalization', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps cost center payloads into dashboard cost center objects', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          costCenters: [
            {
              id: 'cc-1',
              code: 'FIN-001',
              name: 'Finance',
              departments: [{ id: 'dep-1', name: 'Finance' }],
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const costCenters = await CostCenterService.getAllCostCenters();

    expect(costCenters[0]).toMatchObject({
      costCenterId: 'cc-1',
      costCenterCode: 'FIN-001',
      costCenterName: 'Finance',
      department: 'Finance',
    });
    expect(costCenters[0]?.budget.totalBudget).toBe(0);
    expect(costCenters[0]?.effectiveDate).toBeInstanceOf(Date);
  });

  it('maps ID card payloads into dashboard card objects', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          cards: [
            {
              id: 'card-1',
              employeeId: 'emp-1',
              cardNumber: 'ID-001',
              issueDate: '2026-03-22T00:00:00.000Z',
              expiryDate: '2027-03-22T00:00:00.000Z',
              cardType: 'EMPLOYEE',
              accessLevel: 'Level 1',
              photoUrl: '/photo.jpg',
              status: 'ISSUED',
              employee: { firstName: 'Jane', lastName: 'Doe' },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const cards = await IDCardService.getAllIDCards();

    expect(cards[0]).toMatchObject({
      cardId: 'card-1',
      employeeName: 'Jane Doe',
      cardType: 'employee',
      accessLevel: 'Level 1',
      photo: '/photo.jpg',
      isActive: true,
    });
    expect(cards[0]?.issueDate).toBeInstanceOf(Date);
    expect(cards[0]?.expiryDate).toBeInstanceOf(Date);
  });

  it('maps exit payloads into dashboard exit process objects', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          exits: [
            {
              id: 'exit-1',
              employeeId: 'emp-1',
              exitType: 'CONTRACT_END',
              reason: 'Contract ended',
              lastWorkingDate: '2026-03-22T00:00:00.000Z',
              noticePeriodDays: 30,
              rehireEligible: true,
              status: 'PROCESSING',
              createdAt: '2026-03-01T00:00:00.000Z',
              employee: { firstName: 'Jane', lastName: 'Doe' },
              clearances: [{ id: 'clr-1', name: 'Laptop', status: 'PENDING' }],
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const exits = await ExitService.getAllExitProcesses();

    expect(exits[0]).toMatchObject({
      exitId: 'exit-1',
      employeeName: 'Jane Doe',
      exitType: 'end_of_contract',
      exitReason: 'Contract ended',
      noticePeriod: 30,
      isRehireable: true,
      status: 'in_progress',
    });
    expect(exits[0]?.lastWorkingDate).toBeInstanceOf(Date);
    expect(exits[0]?.initiatedDate).toBeInstanceOf(Date);
    expect(exits[0]?.clearanceItems[0]).toMatchObject({
      itemId: 'clr-1',
      itemName: 'Laptop',
      status: 'pending',
    });
  });

  it('maps anniversary payloads into dashboard anniversary objects', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          anniversaries: [
            {
              employeeId: 'emp-1',
              employeeName: 'Jane Doe',
              anniversaryDate: '2026-04-10T00:00:00.000Z',
              yearsOfService: 5,
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const anniversaries = await AnniversaryService.getAllAnniversaries();

    expect(anniversaries[0]).toMatchObject({
      employeeId: 'emp-1',
      employeeName: 'Jane Doe',
      anniversaryType: 'work',
      yearsOfService: 5,
      status: 'upcoming',
      celebrationPlanned: false,
    });
    expect(anniversaries[0]?.anniversaryId).toContain('emp-1-');
    expect(anniversaries[0]?.anniversaryDate).toBeInstanceOf(Date);
    expect(anniversaries[0]?.notificationDate).toBeInstanceOf(Date);
  });
});