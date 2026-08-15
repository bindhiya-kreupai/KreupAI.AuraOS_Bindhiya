// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import InternalAuditCompliancePage from './page';

describe('InternalAuditCompliancePage', () => {
  it('renders the landing page and quick links to the audit evaluators', () => {
    render(<InternalAuditCompliancePage />);

    expect(
      screen.getByRole('heading', { name: 'Internal Audit Compliance', level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByText(/control test cadence/i)).toBeInTheDocument();
    expect(screen.getByText(/finding closure sla/i)).toBeInTheDocument();
    expect(screen.getByText(/repeat finding detector/i)).toBeInTheDocument();
  });
});
