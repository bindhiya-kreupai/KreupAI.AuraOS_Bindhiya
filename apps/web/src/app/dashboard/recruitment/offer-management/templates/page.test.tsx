// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import OfferTemplatesPage from './page';

describe('OfferTemplatesPage', () => {
  it('shows an explicit unsupported state instead of hardcoded templates', () => {
    render(<OfferTemplatesPage />);

    expect(screen.getByText('Offer templates not yet connected')).toBeInTheDocument();
    expect(screen.getByText('Integration Requirement')).toBeInTheDocument();
    expect(screen.getByText('Awaiting template service contract')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new template/i })).toBeDisabled();
  });
});