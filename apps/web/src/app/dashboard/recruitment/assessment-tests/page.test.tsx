// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AssessmentsPage from './page';

describe('AssessmentsPage', () => {
  it('shows an explicit unsupported state instead of synthetic assessment tests', () => {
    render(<AssessmentsPage />);

    expect(screen.getByText('Assessments not yet connected')).toBeInTheDocument();
    expect(screen.getByText('Integration Requirement')).toBeInTheDocument();
    expect(screen.getByText('Awaiting dedicated service contract')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create test/i })).toBeDisabled();
  });
});