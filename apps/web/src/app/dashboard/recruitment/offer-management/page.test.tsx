// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import OfferManagementPage from './page';

vi.mock('../services', () => ({
  JobOfferService: {
    getOffers: vi.fn(() => Promise.resolve([])),
    sendOffer: vi.fn(() => Promise.resolve({})),
  },
}));

describe('OfferManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders live offer fields from the normalized job offer contract', async () => {
    const { JobOfferService } = await import('../services');

    vi.mocked(JobOfferService.getOffers).mockResolvedValueOnce([
      {
        id: 'offer-1',
        offerNumber: 'OFF-1',
        applicationId: 'app-1',
        candidateName: 'Layla Hassan',
        jobTitle: 'Staff Backend Engineer',
        departmentName: 'Engineering',
        status: 'approved',
        jobType: 'full_time',
        startDate: '2026-04-01T00:00:00.000Z',
        salary: 180000,
        currency: 'USD',
        benefits: [],
        createdAt: '2026-03-20T00:00:00.000Z',
        updatedAt: '2026-03-20T00:00:00.000Z',
      },
    ] as any);

    render(<OfferManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Layla Hassan')).toBeInTheDocument();
    });

    expect(screen.getByText(/Staff Backend Engineer/)).toBeInTheDocument();
    expect(screen.getByText(/Engineering/)).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText(/USD 180,000/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send Offer' })).toBeInTheDocument();
  });

  it('sends an approved offer and refreshes the list', async () => {
    const { JobOfferService } = await import('../services');

    vi.mocked(JobOfferService.getOffers)
      .mockResolvedValueOnce([
        {
          id: 'offer-1',
          offerNumber: 'OFF-1',
          applicationId: 'app-1',
          candidateName: 'Layla Hassan',
          jobTitle: 'Staff Backend Engineer',
          departmentName: 'Engineering',
          status: 'approved',
          jobType: 'full_time',
          startDate: '2026-04-01T00:00:00.000Z',
          salary: 180000,
          currency: 'USD',
          benefits: [],
          createdAt: '2026-03-20T00:00:00.000Z',
          updatedAt: '2026-03-20T00:00:00.000Z',
        },
      ] as any)
      .mockResolvedValueOnce([] as any);

    render(<OfferManagementPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Send Offer' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Send Offer' }));

    await waitFor(() => {
      expect(JobOfferService.sendOffer).toHaveBeenCalledWith('offer-1');
    });
  });

  it('shows an empty state when there are no offers', async () => {
    render(<OfferManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('No offers yet')).toBeInTheDocument();
    });
  });
});
