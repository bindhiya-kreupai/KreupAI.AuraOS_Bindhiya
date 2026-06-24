// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/dashboard/recruitment-compliance/stage-gate/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

describe('Recruitment Stage Gate page', () => {
  it('renders title and case ID + stage fields', () => {
    render(<Page />);
    expect(screen.getByText(/recruitment stage gate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Recruitment case ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/From stage/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/To stage/i)).toBeInTheDocument();
  });

  it('submits transition payload', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: { verdict: { allow: true, blockingCode: null, missingPrerequisites: [] } },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Recruitment case ID/i), 'C1');
    await user.type(screen.getByLabelText(/From stage/i), 'SCREENED');
    await user.type(screen.getByLabelText(/To stage/i), 'INTERVIEWED');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/recruitment-compliance/stage-gate');
    expect(JSON.parse(init.body)).toMatchObject({
      caseId: 'C1',
      fromStage: 'SCREENED',
      toStage: 'INTERVIEWED',
    });
  });

  it('renders blocked verdict with missing prerequisites', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            verdict: {
              allow: false,
              blockingCode: 'BGV_NOT_PASSED',
              reasonEn: 'BGV must pass before OFFER',
              missingPrerequisites: ['BGV_PASSED'],
            },
          },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Recruitment case ID/i), 'C1');
    await user.type(screen.getByLabelText(/From stage/i), 'BGV');
    await user.type(screen.getByLabelText(/To stage/i), 'OFFER');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));
    await waitFor(() => expect(screen.getByText(/Transition blocked/i)).toBeInTheDocument());
    expect(screen.getByText(/BGV must pass before OFFER/)).toBeInTheDocument();
  });
});
