import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RecruitmentVendorService } from '@/app/dashboard/recruitment/services';

describe('recruitment vendor service', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps vendor registry rows from the v1 recruitment vendors route', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: [
            {
              id: 'vendor-1',
              vendorCode: 'VEN-0001',
              name: 'Apex Recruiters',
              category: 'recruitment_agency',
              status: 'active',
              contactPersonName: 'Sarah Connor',
              location: 'Remote',
              rating: 4.8,
              activePlacements: 12,
              totalPlacements: 45,
              totalHires: 9,
              averageTimeToFillDays: 18,
              monthlySpend: 125000,
              currency: 'USD',
              complianceStatus: 'compliant',
              specialties: ['Tech Hiring'],
              createdAt: '2026-03-22T00:00:00.000Z',
              updatedAt: '2026-03-22T00:00:00.000Z',
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const vendors = await RecruitmentVendorService.getVendors({ status: 'active' });
    const requestUrl = String(vi.mocked(fetch).mock.calls[0]?.[0]);

    expect(requestUrl).toContain('/api/v1/recruitment/vendors');
    expect(vendors).toEqual([
      expect.objectContaining({
        id: 'vendor-1',
        vendorCode: 'VEN-0001',
        name: 'Apex Recruiters',
        category: 'recruitment_agency',
        status: 'active',
        complianceStatus: 'compliant',
        activePlacements: 12,
      }),
    ]);
  });
});