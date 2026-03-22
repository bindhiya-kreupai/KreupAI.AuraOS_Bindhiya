// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('../services', () => ({
    RecruitmentVendorService: {
        getVendors: vi.fn(() => Promise.resolve([])),
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

describe('Recruitment vendor pages', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it.each([
        [VendorsPage],
        [ManagementPage],
        [VendorManagementPage],
    ])('shows a live empty vendor registry for %s', async (PageComponent) => {
        render(<PageComponent />);

        await waitFor(() => {
            expect(screen.getByText('No recruitment vendors')).toBeInTheDocument();
        });

        expect(screen.getByText('Active Vendors')).toBeInTheDocument();
        expect(screen.getByText('Active Placements')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add vendor/i })).toBeDisabled();
    });

    it.each([
        [VendorsPage],
        [ManagementPage],
        [VendorManagementPage],
    ])('renders live vendor data for %s', async (PageComponent) => {
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

        render(<PageComponent />);

        await waitFor(() => {
            expect(screen.getByText('Apex Recruiters')).toBeInTheDocument();
        });

        expect(screen.getByText('VEN-0001 · Recruitment Agency')).toBeInTheDocument();
        expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
        expect(screen.getByText('Tech Hiring')).toBeInTheDocument();
        expect(screen.getByText('18 days')).toBeInTheDocument();
    });

    it.each([
        [ComplianceDocsPage, 'Vendor compliance not yet connected', /request document/i, 'Awaiting vendor compliance contract'],
        [ContractRenewalPage, 'Vendor renewals not yet connected', /review renewals/i, 'Awaiting vendor renewal contract'],
        [ContractTypesPage, 'Vendor contract types not yet connected', /configure types/i, 'Awaiting vendor contract configuration'],
        [InvoiceProcessingPage, 'Vendor invoices not yet connected', /approve invoices/i, 'Awaiting vendor finance contract'],
        [PerformanceRatingPage, 'Vendor performance not yet connected', /review ratings/i, 'Awaiting vendor analytics contract'],
        [RateCardsPage, 'Vendor rate cards not yet connected', /update rates/i, 'Awaiting vendor pricing contract'],
        [TimesheetPage, 'Vendor timesheets not yet connected', /approve timesheets/i, 'Awaiting vendor timesheet contract'],
    ])('keeps unsupported vendor subdomains explicit for %s', (PageComponent, unavailableTitle, buttonName, statusLabel) => {
        render(<PageComponent />);

        expect(screen.getByText(unavailableTitle)).toBeInTheDocument();
        expect(screen.getByText('Integration Requirement')).toBeInTheDocument();
        expect(screen.getByText(statusLabel)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: buttonName })).toBeDisabled();
    });
});