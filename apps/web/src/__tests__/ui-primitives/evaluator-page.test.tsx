// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EvaluatorPage } from '@aura/ui/components/ui';

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

const FIELDS = [
  { name: 'employeeId', label: 'Employee ID', type: 'text' as const, required: true },
  { name: 'tenureMonths', label: 'Tenure (months)', type: 'number' as const, required: true },
];

describe('EvaluatorPage', () => {
  it('renders the title and form fields', () => {
    render(
      <EvaluatorPage
        title="Eligibility"
        fields={FIELDS}
        endpoint={{ method: 'POST', url: '/api/test' }}
        buildPayload={(v) => v}
        buildVerdict={() => null}
      />
    );
    expect(screen.getByText('Eligibility')).toBeInTheDocument();
    expect(screen.getByLabelText(/Employee ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tenure/i)).toBeInTheDocument();
  });

  it('refuses submit when a required field is empty', async () => {
    const user = userEvent.setup();
    render(
      <EvaluatorPage
        title="X"
        fields={FIELDS}
        endpoint={{ method: 'POST', url: '/api/test' }}
        buildPayload={(v) => v}
        buildVerdict={() => null}
      />
    );
    // Form has native required, plus our handler. Native validation
    // will block; we test the handler directly by filling one field
    // and intercepting the second via clearing.
    await user.type(screen.getByLabelText(/Employee ID/i), 'E1');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('POSTs to the configured endpoint with the built payload', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: { verdict: { eligible: true, reason: 'OK', reasonAr: 'حسنا' } },
        }),
    });
    const buildPayload = vi.fn((v) => ({ wrapped: v }));
    render(
      <EvaluatorPage
        title="X"
        fields={FIELDS}
        endpoint={{ method: 'POST', url: '/api/test' }}
        buildPayload={buildPayload}
        buildVerdict={(data: any) => ({
          outcome: data.verdict.eligible ? 'PASS' : 'FAIL',
          title: 'Eligible',
          reason: data.verdict.reason,
          reasonAr: data.verdict.reasonAr,
        })}
      />
    );
    await user.type(screen.getByLabelText(/Employee ID/i), 'E1');
    await user.type(screen.getByLabelText(/Tenure/i), '24');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/test');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ wrapped: { employeeId: 'E1', tenureMonths: '24' } });
  });

  it('renders the verdict panel on successful response', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: { verdict: { eligible: true, reason: 'All gates pass' } },
        }),
    });
    render(
      <EvaluatorPage
        title="X"
        fields={FIELDS}
        endpoint={{ method: 'POST', url: '/api/test' }}
        buildPayload={(v) => v}
        buildVerdict={(data: any) => ({
          outcome: data.verdict.eligible ? 'PASS' : 'FAIL',
          title: 'Eligible',
          reason: data.verdict.reason,
        })}
      />
    );
    await user.type(screen.getByLabelText(/Employee ID/i), 'E1');
    await user.type(screen.getByLabelText(/Tenure/i), '24');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));
    await waitFor(() => expect(screen.getByText('All gates pass')).toBeInTheDocument());
    expect(screen.getByText('Eligible')).toBeInTheDocument();
  });

  it('surfaces server error in red banner when success=false', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: false, error: { message: 'employeeId required' } }),
    });
    render(
      <EvaluatorPage
        title="X"
        fields={FIELDS}
        endpoint={{ method: 'POST', url: '/api/test' }}
        buildPayload={(v) => v}
        buildVerdict={() => null}
      />
    );
    await user.type(screen.getByLabelText(/Employee ID/i), 'E1');
    await user.type(screen.getByLabelText(/Tenure/i), '24');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));
    await waitFor(() => expect(screen.getByText(/employeeId required/i)).toBeInTheDocument());
  });

  it('uses buildQuery for GET endpoints', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: {} }),
    });
    render(
      <EvaluatorPage
        title="X"
        fields={FIELDS}
        endpoint={{ method: 'GET', url: '/api/test' }}
        buildPayload={() => ({})}
        buildQuery={(v) => `employeeId=${v.employeeId}&months=${v.tenureMonths}`}
        buildVerdict={() => null}
      />
    );
    await user.type(screen.getByLabelText(/Employee ID/i), 'E1');
    await user.type(screen.getByLabelText(/Tenure/i), '24');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/test?employeeId=E1&months=24');
    expect(init.method).toBe('GET');
  });

  it('honours custom submit label', () => {
    render(
      <EvaluatorPage
        title="X"
        fields={[]}
        endpoint={{ method: 'POST', url: '/api/test' }}
        buildPayload={(v) => v}
        buildVerdict={() => null}
        submitLabel="Run check"
      />
    );
    expect(screen.getByRole('button', { name: /Run check/i })).toBeInTheDocument();
  });

  it('renders Arabic title + submit when locale=ar', () => {
    render(
      <EvaluatorPage
        title="Eligibility"
        titleAr="الأهلية"
        fields={[]}
        endpoint={{ method: 'POST', url: '/api/test' }}
        buildPayload={(v) => v}
        buildVerdict={() => null}
        submitLabel="Run"
        submitLabelAr="تشغيل"
        locale="ar"
      />
    );
    expect(screen.getByText('الأهلية')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /تشغيل/ })).toBeInTheDocument();
  });
});
