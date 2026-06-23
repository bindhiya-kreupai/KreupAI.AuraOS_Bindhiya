// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/dashboard/emiratisation-compliance/fake-risk/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

// Helper: the main hire form has its own #evaluator-field-employeeId; the
// cohort StructuredArrayEditor renders its own "Employee ID" column header
// + rows. We address the form input by stable DOM id to avoid label clash.
function mainEmpInput() {
  return document.getElementById('evaluator-field-employeeId') as HTMLInputElement;
}
function mainSalaryInput() {
  return document.getElementById('evaluator-field-basicSalary') as HTMLInputElement;
}
function mainHiredOnInput() {
  return document.getElementById('evaluator-field-hiredOn') as HTMLInputElement;
}
function mainAttendanceInput() {
  return document.getElementById('evaluator-field-attendanceDaysLast30') as HTMLInputElement;
}

describe('Fake-Emiratisation Risk page', () => {
  it('renders title, main hire fields and cohort section', () => {
    render(<Page />);
    expect(screen.getByText(/Fake-Emiratisation risk profiling/i)).toBeInTheDocument();
    expect(mainEmpInput()).toBeInTheDocument();
    expect(mainSalaryInput()).toBeInTheDocument();
    expect(screen.getAllByText(/Cohort/i).length).toBeGreaterThan(0);
  });

  it('submits the profileHire payload to the fake-risk endpoint', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            result: {
              employeeId: 'E1',
              riskScore: 30,
              riskBand: 'LOW',
              signals: [],
              cluster: { sameDaySameRecruiter: 0, sameDaySameCostCenter: 0 },
            },
          },
        }),
    });
    const { container } = render(<Page />);
    await user.type(mainEmpInput(), 'E1');
    await user.type(mainSalaryInput(), '4000');
    await user.type(mainHiredOnInput(), '2026-06-01');
    await user.type(mainAttendanceInput(), '25');
    // Add a cohort row (required) and populate its employee ID column.
    await user.click(screen.getByRole('button', { name: /add row/i }));
    const cohortEmpRow = screen.getByLabelText(/Employee ID row 1/i);
    await user.type(cohortEmpRow, 'C1');

    fireEvent.submit(container.querySelector('form')!);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/emiratisation-compliance/fake-risk');
    expect(JSON.parse(init.body)).toMatchObject({
      action: 'profileHire',
      hire: { employeeId: 'E1', basicSalary: 4000 },
    });
  });

  it('renders the risk band in the verdict', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            result: {
              employeeId: 'E1',
              riskScore: 30,
              riskBand: 'LOW',
              signals: [],
              cluster: { sameDaySameRecruiter: 0, sameDaySameCostCenter: 0 },
            },
          },
        }),
    });
    const { container } = render(<Page />);
    await user.type(mainEmpInput(), 'E1');
    await user.type(mainSalaryInput(), '4000');
    await user.type(mainHiredOnInput(), '2026-06-01');
    await user.type(mainAttendanceInput(), '25');
    await user.click(screen.getByRole('button', { name: /add row/i }));
    await user.type(screen.getByLabelText(/Employee ID row 1/i), 'C1');

    fireEvent.submit(container.querySelector('form')!);
    await waitFor(() => expect(screen.getAllByText(/Risk score 30/).length).toBeGreaterThan(0));
  });
});
