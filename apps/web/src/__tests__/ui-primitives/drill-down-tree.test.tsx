// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DrillDownTree, type DrillNode } from '@aura/ui/components/ui';

function node(
  overrides: Partial<DrillNode> & { key: string; label: string; level: DrillNode['level'] }
): DrillNode {
  return {
    flagCount: 0,
    severityCounts: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
    maxSeverity: null,
    riskScore: 0,
    topFive: [],
    children: [],
    ...overrides,
  } as DrillNode;
}

const treeFixture: DrillNode = node({
  key: 'global',
  label: 'TenantRoot',
  level: 'GLOBAL',
  flagCount: 10,
  severityCounts: { LOW: 2, MEDIUM: 4, HIGH: 3, CRITICAL: 1 },
  maxSeverity: 'CRITICAL',
  riskScore: 85,
  children: [
    node({
      key: 'AE',
      label: 'AE',
      level: 'COUNTRY',
      flagCount: 6,
      severityCounts: { LOW: 1, MEDIUM: 3, HIGH: 2, CRITICAL: 0 },
      maxSeverity: 'HIGH',
      riskScore: 60,
      children: [
        node({
          key: 'E1',
          label: 'Entity-AE-1',
          level: 'ENTITY',
          flagCount: 4,
          severityCounts: { LOW: 1, MEDIUM: 2, HIGH: 1, CRITICAL: 0 },
          maxSeverity: 'HIGH',
          riskScore: 50,
          children: [
            node({
              key: 'D1',
              label: 'Engineering',
              level: 'DEPARTMENT',
              flagCount: 4,
              severityCounts: { LOW: 1, MEDIUM: 2, HIGH: 1, CRITICAL: 0 },
              maxSeverity: 'HIGH',
              riskScore: 50,
              topFive: [
                {
                  id: 'F1',
                  label: 'Late payroll AE-1',
                  severity: 'HIGH',
                  raisedAt: '2026-06-10',
                },
              ],
            }),
          ],
        }),
      ],
    }),
    node({
      key: 'SA',
      label: 'SA',
      level: 'COUNTRY',
      flagCount: 4,
      severityCounts: { LOW: 1, MEDIUM: 1, HIGH: 1, CRITICAL: 1 },
      maxSeverity: 'CRITICAL',
      riskScore: 75,
    }),
  ],
});

describe('DrillDownTree', () => {
  it('renders the root node label', () => {
    render(<DrillDownTree root={treeFixture} />);
    expect(screen.getByText('TenantRoot')).toBeInTheDocument();
  });

  it('shows the score pill on the root', () => {
    render(<DrillDownTree root={treeFixture} />);
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('shows the max-severity pill (CRITICAL) on the root', () => {
    render(<DrillDownTree root={treeFixture} />);
    const criticals = screen.getAllByText('CRITICAL');
    expect(criticals.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the flag count next to each visible node', () => {
    render(<DrillDownTree root={treeFixture} />);
    expect(screen.getByText(/10 flags/i)).toBeInTheDocument();
  });

  it('expands GLOBAL + COUNTRY by default — country rows visible', () => {
    render(<DrillDownTree root={treeFixture} />);
    expect(screen.getByText('AE')).toBeInTheDocument();
    expect(screen.getByText('SA')).toBeInTheDocument();
  });

  it('expands ENTITY rows (children of COUNTRY) — visible by default', () => {
    render(<DrillDownTree root={treeFixture} />);
    expect(screen.getByText('Entity-AE-1')).toBeInTheDocument();
  });

  it('does NOT expand DEPARTMENT rows by default (entity is collapsed)', () => {
    render(<DrillDownTree root={treeFixture} />);
    expect(screen.queryByText('Engineering')).toBeNull();
  });

  it('expands DEPARTMENT when the ENTITY chevron is clicked', async () => {
    const user = userEvent.setup();
    render(<DrillDownTree root={treeFixture} />);
    // ENTITY row "Entity-AE-1" has a chevron labelled "Expand" because
    // ENTITY is not in defaultExpanded. Click it.
    const expandButtons = screen.getAllByRole('button', { name: /^expand$/i });
    await user.click(expandButtons[0]);
    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });

  it('invokes onNodeClick when a node label is clicked', async () => {
    const user = userEvent.setup();
    const onNodeClick = vi.fn();
    render(<DrillDownTree root={treeFixture} onNodeClick={onNodeClick} />);
    await user.click(screen.getByText('AE'));
    expect(onNodeClick).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'AE', level: 'COUNTRY' })
    );
  });

  it('renders Arabic level labels when locale=ar', () => {
    render(<DrillDownTree root={treeFixture} locale="ar" />);
    expect(screen.getAllByText('دولة').length).toBeGreaterThanOrEqual(1);
  });

  it('renders the top-five flags under a leaf when fully expanded', () => {
    render(
      <DrillDownTree
        root={treeFixture}
        defaultExpanded={['GLOBAL', 'COUNTRY', 'ENTITY', 'DEPARTMENT']}
      />
    );
    expect(screen.getByText('Late payroll AE-1')).toBeInTheDocument();
  });
});
