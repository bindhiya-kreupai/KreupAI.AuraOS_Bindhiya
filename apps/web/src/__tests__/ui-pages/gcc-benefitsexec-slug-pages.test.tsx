// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CoveragePage from '@/app/dashboard/benefits-compliance/coverage-register-renewal-accrual/page';
import ExceptionsPage from '@/app/dashboard/benefits-compliance/exceptions-mandatory-gap-detection/page';
import CalcsPage from '@/app/dashboard/eosb-compliance/finalized-calculations-draft-approved-settled/page';
import AccrualsPage from '@/app/dashboard/eosb-compliance/monthly-accruals-gl-posting/page';
import DisputesPage from '@/app/dashboard/eosb-compliance/dispute-register/page';
import CorrectivePage from '@/app/dashboard/executive-compliance/corrective-action-register/page';
import HeatmapPage from '@/app/dashboard/executive-compliance/compliance-risk-heatmap-l-i/page';

const fetchMock = vi.fn();
const promptSpy = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  promptSpy.mockReset();
  (globalThis as any).fetch = fetchMock;
  (globalThis as any).window.prompt = promptSpy;
  (globalThis as any).prompt = promptSpy;
});

function envelope(items: unknown[]) {
  return {
    json: () =>
      Promise.resolve({
        success: true,
        data: { items, total: items.length, page: 1, pageSize: 50, hasNextPage: false },
      }),
  };
}

describe('GCC benefits/executive/EOSB menu-slug pages', () => {
  it('coverage register reads paginated envelope (p.data.items), not p.data', async () => {
    fetchMock.mockResolvedValueOnce(
      envelope([
        {
          id: 'c1',
          employeeId: 'E1',
          benefitCatalogueId: 'cat12345',
          vendorId: null,
          policyNumber: 'POL-1',
          startedAt: '2026-01-01',
          expiresAt: '2026-12-31',
          actualAnnualValue: '5000',
          currency: 'AED',
          dependantsCount: 0,
          status: 'ACTIVE',
          accruedBalance: '100',
        },
      ])
    );
    render(<CoveragePage />);
    await waitFor(() => expect(screen.getByText('POL-1')).toBeInTheDocument());
    expect(promptSpy).not.toHaveBeenCalled();
  });

  it('exceptions page runs findMandatoryGaps and never calls prompt', async () => {
    fetchMock.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: [] }),
    });
    render(<ExceptionsPage />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({ success: true, data: { uncovered: [{ benefitCode: 'MEDICAL' }] } }),
    });
    await user.type(screen.getByLabelText(/Employee ID/i), 'E9');
    await user.click(screen.getByRole('button', { name: /detect gaps/i }));
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(([, init]: any) => init?.body?.includes('findMandatoryGaps'))
      ).toBe(true)
    );
    expect(promptSpy).not.toHaveBeenCalled();
  });

  it('EOSB calculations page reads envelope items', async () => {
    fetchMock.mockResolvedValueOnce(
      envelope([
        {
          id: 'k1',
          employeeId: 'E2',
          countryCode: 'AE',
          joiningDate: '2024-01-01',
          lastWorkingDate: '2026-01-01',
          terminationType: 'RESIGNATION',
          basicSalary: '10000',
          totalServiceYears: '2',
          totalServiceMonths: 24,
          dailyRate: '333',
          gratuityAmount: '6666',
          socialInsuranceOffset: '0',
          netPayable: '6666',
          currency: 'AED',
          law: null,
          status: 'DRAFT',
          paymentReference: null,
        },
      ])
    );
    render(<CalcsPage />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument()
    );
    expect(promptSpy).not.toHaveBeenCalled();
  });

  it('EOSB accruals page reads envelope items', async () => {
    fetchMock.mockResolvedValueOnce(
      envelope([
        {
          id: 'a1',
          employeeId: 'E3',
          period: '2026-06',
          countryCode: 'AE',
          basicSalary: '10000',
          serviceMonths: 12,
          accruedGratuity: '3333',
          monthDelta: '277',
          currency: 'AED',
          glPosted: false,
          glJournalRef: null,
        },
      ])
    );
    render(<AccrualsPage />);
    await waitFor(() => expect(screen.getByText('2026-06')).toBeInTheDocument());
    expect(promptSpy).not.toHaveBeenCalled();
  });

  it('EOSB dispute register reads envelope items and offers inline notes', async () => {
    fetchMock.mockResolvedValueOnce(
      envelope([
        {
          id: 'd1',
          employeeId: 'E4',
          calculationId: null,
          raisedAt: '2026-06-01',
          subject: 'Basis dispute',
          claimedAmount: '100',
          calculatedAmount: '90',
          currency: 'AED',
          category: 'SALARY_BASIS',
          status: 'OPEN',
          resolutionNotes: null,
        },
      ])
    );
    render(<DisputesPage />);
    await waitFor(() => expect(screen.getByText('Basis dispute')).toBeInTheDocument());
    expect(screen.getByPlaceholderText(/resolution notes/i)).toBeInTheDocument();
    expect(promptSpy).not.toHaveBeenCalled();
  });

  it('corrective action register reads envelope items with inline verification', async () => {
    fetchMock.mockResolvedValueOnce(
      envelope([
        {
          id: 'x1',
          actionNumber: 'CA-1',
          sourceDomain: 'WPS',
          sourceRef: null,
          title: 'Fix WPS batch',
          rootCause: null,
          severity: 'HIGH',
          ownerId: null,
          raisedAt: '2026-06-01',
          dueAt: '2026-07-01',
          completedAt: null,
          status: 'OPEN',
        },
      ])
    );
    render(<CorrectivePage />);
    await waitFor(() => expect(screen.getByText('Fix WPS batch')).toBeInTheDocument());
    expect(screen.getByPlaceholderText(/verification notes/i)).toBeInTheDocument();
    expect(promptSpy).not.toHaveBeenCalled();
  });

  it('risk heatmap renders L×I matrix from envelope items', async () => {
    fetchMock.mockResolvedValueOnce(
      envelope([
        {
          id: 'r1',
          title: 'WPS delay',
          domain: 'WPS',
          country: 'AE',
          likelihood: 4,
          impact: 5,
          score: 20,
          band: 'CRITICAL',
          ownerId: null,
          mitigationNotes: null,
          nextReviewAt: null,
          status: 'OPEN',
        },
      ])
    );
    render(<HeatmapPage />);
    await waitFor(() => expect(screen.getByText('WPS delay')).toBeInTheDocument());
    expect(screen.getByText(/likelihood × impact matrix/i)).toBeInTheDocument();
    expect(promptSpy).not.toHaveBeenCalled();
  });
});
