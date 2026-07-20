import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  VendorService,
  BudgetService,
  CostCenterService,
  PettyCashPolicyService,
  exportToCsv,
} from '@/app/dashboard/finance/services';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('Finance module client services (AURA-149..160)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('VendorService.getVendors unwraps the tenant-scoped list payload', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        success: true,
        vendors: [{ id: 'v1', vendorName: 'Acme', status: 'active' }],
        items: [{ id: 'v1', vendorName: 'Acme', status: 'active' }],
        total: 1,
        page: 1,
        pageSize: 100,
        hasNextPage: false,
      })
    );

    const vendors = await VendorService.getVendors();
    expect(vendors).toHaveLength(1);
    expect(vendors[0]).toMatchObject({ id: 'v1', vendorName: 'Acme' });
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain('/api/finance/vendors');
  });

  it('VendorService.approveVendor issues a PUT to the vendor detail route', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        success: true,
        vendor: { id: 'v1', approvalStatus: 'approved', status: 'active' },
      })
    );

    const vendor = await VendorService.approveVendor('v1', '');
    expect(vendor).toMatchObject({ approvalStatus: 'approved', status: 'active' });
    const [url, init] = vi.mocked(fetch).mock.calls[0] ?? [];
    expect(String(url)).toContain('/api/finance/vendors/v1');
    expect((init as RequestInit)?.method).toBe('PUT');
  });

  it('BudgetService.getBudgets returns [] on error instead of throwing', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ error: 'boom' }, 500));
    const budgets = await BudgetService.getBudgets();
    expect(budgets).toEqual([]);
  });

  it('BudgetService.getBudgetSummary reads the tenant-scoped summary rollup (AURA-553)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        success: true,
        budgets: [],
        summary: {
          totalBudgets: 4,
          activeBudgets: 2,
          totalBudgetAmount: 500000,
          totalSpent: 120000,
          totalRemaining: 380000,
        },
      })
    );
    const summary = await BudgetService.getBudgetSummary();
    expect(summary).toEqual({
      totalBudgets: 4,
      activeBudgets: 2,
      totalBudgetAmount: 500000,
      totalSpent: 120000,
      totalRemaining: 380000,
    });
    expect(String(vi.mocked(fetch).mock.calls[0]?.[0])).toContain('/api/finance/budgets');
  });

  it('BudgetService.getBudgetSummary returns zeros on error (AURA-553)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ error: 'boom' }, 500));
    const summary = await BudgetService.getBudgetSummary();
    expect(summary).toEqual({
      totalBudgets: 0,
      activeBudgets: 0,
      totalBudgetAmount: 0,
      totalSpent: 0,
      totalRemaining: 0,
    });
  });

  it('CostCenterService.getCostCenters unwraps the costCenters key', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        success: true,
        costCenters: [
          { id: 'c1', code: 'CC-1', name: 'Ops', allocatedBudget: 100, spentBudget: 40 },
        ],
      })
    );
    const centers = await CostCenterService.getCostCenters();
    expect(centers).toHaveLength(1);
    expect(centers[0]).toMatchObject({ code: 'CC-1', name: 'Ops' });
  });

  it('PettyCashPolicyService.getPolicies passes the policyType query and unwraps policies', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        success: true,
        policies: [
          { id: 'p1', policyType: 'approval', name: 'Rule', active: true, requireReceipt: true },
        ],
      })
    );
    const policies = await PettyCashPolicyService.getPolicies('approval');
    expect(policies).toHaveLength(1);
    expect(policies[0]).toMatchObject({ policyType: 'approval', name: 'Rule' });
    expect(String(vi.mocked(fetch).mock.calls[0]?.[0])).toContain('policyType=approval');
  });

  it('exportToCsv is a no-op when window is undefined (SSR guard)', () => {
    // In the vitest node env there is no DOM; the helper must not throw.
    expect(() => exportToCsv('x', [{ a: 1 }])).not.toThrow();
  });
});
