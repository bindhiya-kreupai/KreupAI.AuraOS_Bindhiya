// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RiskHeatmap, type RiskHeatmapCell } from '@aura/ui/components/ui';

const cell = (
  domain: string,
  country: string,
  riskScore: number,
  flagCount = 3,
  maxSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'HIGH'
): RiskHeatmapCell => ({
  domain,
  country,
  riskScore,
  flagCount,
  maxSeverity,
});

describe('RiskHeatmap', () => {
  it('renders the empty-state when no cells are supplied', () => {
    render(<RiskHeatmap cells={[]} />);
    expect(screen.getByText(/no open risks/i)).toBeInTheDocument();
  });

  it('renders a column per unique country and a row per unique domain', () => {
    render(
      <RiskHeatmap
        cells={[cell('PAYROLL', 'AE', 80), cell('PAYROLL', 'SA', 50), cell('EOSB', 'AE', 20)]}
      />
    );
    // Column headers for countries
    const aeHeaders = screen.getAllByText('AE');
    expect(aeHeaders.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('SA')).toBeInTheDocument();
    // Row headers for domains
    expect(screen.getByText('PAYROLL')).toBeInTheDocument();
    expect(screen.getByText('EOSB')).toBeInTheDocument();
  });

  it('renders the risk score in each cell', () => {
    render(<RiskHeatmap cells={[cell('PAYROLL', 'AE', 80)]} />);
    expect(screen.getByText('80')).toBeInTheDocument();
  });

  it('renders an em-dash for empty (domain, country) intersections', () => {
    render(<RiskHeatmap cells={[cell('PAYROLL', 'AE', 80), cell('EOSB', 'SA', 40)]} />);
    // PAYROLL × SA and EOSB × AE should both be empty → "—"
    const emDashes = screen.getAllByText('—');
    expect(emDashes.length).toBeGreaterThanOrEqual(2);
  });

  it('invokes onCellClick with the clicked cell payload', async () => {
    const user = userEvent.setup();
    const onCellClick = vi.fn();
    render(
      <RiskHeatmap cells={[cell('PAYROLL', 'AE', 80, 5, 'CRITICAL')]} onCellClick={onCellClick} />
    );
    await user.click(screen.getByText('80'));
    expect(onCellClick).toHaveBeenCalledWith(
      expect.objectContaining({
        domain: 'PAYROLL',
        country: 'AE',
        riskScore: 80,
        flagCount: 5,
        maxSeverity: 'CRITICAL',
      })
    );
  });

  it('does NOT invoke onCellClick on an empty intersection', async () => {
    const user = userEvent.setup();
    const onCellClick = vi.fn();
    render(
      <RiskHeatmap
        cells={[cell('PAYROLL', 'AE', 80), cell('EOSB', 'SA', 40)]}
        onCellClick={onCellClick}
      />
    );
    await user.click(screen.getAllByText('—')[0]);
    expect(onCellClick).not.toHaveBeenCalled();
  });

  it('respects explicit domainOrder + countryOrder', () => {
    render(
      <RiskHeatmap
        cells={[cell('PAYROLL', 'AE', 80), cell('EOSB', 'AE', 40)]}
        domainOrder={['EOSB', 'PAYROLL']}
        countryOrder={['AE']}
      />
    );
    // First row should be EOSB, second PAYROLL (we check by aria-label order)
    const rows = screen.getAllByRole('row');
    // first row is header, second is EOSB, third PAYROLL
    expect(rows[1].textContent).toMatch(/EOSB/);
    expect(rows[2].textContent).toMatch(/PAYROLL/);
  });

  it('renders the caption when supplied', () => {
    render(<RiskHeatmap cells={[cell('PAYROLL', 'AE', 50)]} caption="Q2 risk posture" />);
    expect(screen.getByText('Q2 risk posture')).toBeInTheDocument();
  });

  it('renders the Arabic empty-state when locale=ar', () => {
    render(<RiskHeatmap cells={[]} locale="ar" />);
    expect(screen.getByText(/مخاطر/)).toBeInTheDocument();
  });

  it('applies different color classes per band', () => {
    const { container } = render(
      <RiskHeatmap
        cells={[
          cell('A', 'X', 90), // critical → red
          cell('B', 'X', 65), // hot → orange
          cell('C', 'X', 40), // warm → amber
          cell('D', 'X', 10), // cool → sky
        ]}
      />
    );
    const html = container.innerHTML;
    expect(html).toMatch(/bg-red-600/);
    expect(html).toMatch(/bg-orange-500/);
    expect(html).toMatch(/bg-amber-400/);
    expect(html).toMatch(/bg-sky-200/);
  });

  it('aria-label on each cell describes its score + severity', () => {
    render(<RiskHeatmap cells={[cell('PAYROLL', 'AE', 80, 5, 'CRITICAL')]} />);
    const button = screen.getByLabelText(/PAYROLL AE risk score 80, 5 flags, severity CRITICAL/i);
    expect(button).toBeInTheDocument();
  });
});
