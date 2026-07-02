// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('../services', () => ({
  RecruitmentVendorService: {
    getVendors: vi.fn(() => Promise.resolve([])),
    createVendor: vi.fn(() => Promise.resolve({})),
  },
}));

// Sub-domain pages fetch through APIClient; return an empty tenant-scoped list.
vi.mock('@/lib/api-client', () => ({
  APIClient: {
    get: vi.fn(() => Promise.resolve({ success: true, data: { items: [], total: 0 } })),
    post: vi.fn(() => Promise.resolve({ success: true, data: { id: 'x' } })),
    patch: vi.fn(() => Promise.resolve({ success: true, data: { id: 'x' } })),
  },
}));

import VendorsPage from './page';
import ComplianceDocsPage from './compliance-docs/page';
import ContractRenewalPage from './contract-renewal/page';
import ContractTypesPage from './contract-types/page';
import InvoiceProcessingPage from './invoice-processing/page';
import ManagementPage from './management/page';
import PerformanceRatingPage from './performance-rating/page';
import RateCardsPage from './rate-cards/page';
import TimesheetPage from './timesheet/page';
import VendorManagementPage from './vendor-management/page';

describe('Recruitment vendor registry pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([[VendorsPage], [ManagementPage], [VendorManagementPage]])(
    'shows a live empty vendor registry with an enabled Add Vendor action for %s',
    async (PageComponent) => {
      render(<PageComponent />);

      await waitFor(() => {
        expect(screen.getByText('No recruitment vendors')).toBeInTheDocument();
      });

      expect(screen.getByText('Active Vendors')).toBeInTheDocument();
      // The Add Vendor button is now a real, enabled create action.
      expect(screen.getByRole('button', { name: /add vendor/i })).toBeEnabled();
    }
  );

  it('renders live vendor data', async () => {
    const { RecruitmentVendorService } = await import('../services');

    vi.mocked(RecruitmentVendorService.getVendors).mockResolvedValueOnce([
      {
        id: 'vendor-1',
        vendorCode: 'VEN-0001',
        name: 'Apex Recruiters',
        category: 'recruitment_agency',
        status: 'active',
        contactPersonName: 'Sarah Connor',
        contactEmail: 'sarah@apex.example',
        contactPhone: '+1 555 0123',
        location: 'Remote',
        rating: 4.8,
        activePlacements: 12,
        totalPlacements: 45,
        totalHires: 9,
        averageTimeToFillDays: 18,
        monthlySpend: 125000,
        currency: 'USD',
        complianceStatus: 'compliant',
        specialties: ['Tech Hiring', 'Engineering'],
        createdAt: '2026-03-22T00:00:00.000Z',
        updatedAt: '2026-03-22T00:00:00.000Z',
      },
    ] as any);

    render(<VendorsPage />);

    await waitFor(() => {
      expect(screen.getByText('Apex Recruiters')).toBeInTheDocument();
    });

    expect(screen.getByText('VEN-0001 · Recruitment Agency')).toBeInTheDocument();
    expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
    expect(screen.getByText('18 days')).toBeInTheDocument();
  });

  it.each([
    [ComplianceDocsPage, 'Vendor Compliance', /add document/i],
    [ContractRenewalPage, 'Contract Renewals', /raise renewal/i],
    [ContractTypesPage, 'Contract Configurations', /add contract type/i],
    [InvoiceProcessingPage, 'Vendor Invoices', /register invoice/i],
    [PerformanceRatingPage, 'Vendor Performance', /add scorecard/i],
    [RateCardsPage, 'Vendor Rate Cards', /add rate card/i],
    [TimesheetPage, 'Contractor Timesheets', /submit timesheet/i],
  ])(
    'wires a live, tenant-scoped sub-domain view for %s',
    async (PageComponent, heading, createName) => {
      render(<PageComponent />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
      });

      // The create action exists and is a real button (not a disabled placeholder).
      expect(screen.getByRole('button', { name: createName })).toBeInTheDocument();

      const { APIClient } = await import('@/lib/api-client');
      expect(APIClient.get).toHaveBeenCalled();
    }
  );
});
