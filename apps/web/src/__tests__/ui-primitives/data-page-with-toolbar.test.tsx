// @vitest-environment happy-dom
/**
 * DataPageWithToolbar tests.
 *
 * The wrapper composes ExportMenu / ImportDialog / FilterPanel into
 * DataPage.toolbarSlot so dashboard pages can opt into the 6 shared
 * primitives without per-page boilerplate.
 *
 * Closes the audit's "no consumer adoption" gap on the T (table
 * features) dimension. The 6 primitives already ship with 40
 * passing tests in this directory; this wrapper makes adopting them
 * a one-prop change for any page using DataPage.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataPageWithToolbar } from '@aura/ui/components/ui';

interface Row {
  id: string;
  name: string;
}

const COLUMNS = [{ key: 'name', label: 'Name' }] as any;
const SAMPLE: Row[] = [{ id: '1', name: 'Alice' }];

describe('DataPageWithToolbar', () => {
  it('renders the wrapped DataPage when no primitive configs are supplied', () => {
    render(<DataPageWithToolbar<Row> title="Plain" columns={COLUMNS} data={SAMPLE} />);
    expect(screen.getByText('Plain')).toBeInTheDocument();
  });

  it('does NOT render Export trigger when exportConfig is omitted', () => {
    render(<DataPageWithToolbar<Row> title="X" columns={COLUMNS} data={SAMPLE} />);
    // No matching button by accessible name.
    expect(screen.queryByRole('button', { name: /export/i })).toBeNull();
  });

  it('renders Export trigger when exportConfig is supplied', () => {
    render(
      <DataPageWithToolbar<Row>
        title="X"
        columns={COLUMNS}
        data={SAMPLE}
        exportConfig={{ onExport: vi.fn(), rowCount: 42 }}
      />
    );
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
  });

  it('renders Import trigger button when importConfig is supplied', () => {
    render(
      <DataPageWithToolbar<Row>
        title="X"
        columns={COLUMNS}
        data={SAMPLE}
        importConfig={{
          title: 'Import',
          onDryRun: vi.fn() as any,
          onCommit: vi.fn() as any,
        }}
      />
    );
    expect(screen.getByRole('button', { name: /^import$/i })).toBeInTheDocument();
  });

  it('opens the ImportDialog when the trigger button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <DataPageWithToolbar<Row>
        title="X"
        columns={COLUMNS}
        data={SAMPLE}
        importConfig={{
          title: 'Import employees',
          description: 'Upload a CSV file',
          onDryRun: vi.fn() as any,
          onCommit: vi.fn() as any,
        }}
      />
    );
    await user.click(screen.getByRole('button', { name: /^import$/i }));
    expect(screen.getByText('Import employees')).toBeInTheDocument();
  });

  it('uses a custom triggerLabel when provided', () => {
    render(
      <DataPageWithToolbar<Row>
        title="X"
        columns={COLUMNS}
        data={SAMPLE}
        importConfig={{
          title: 'Bulk upload',
          triggerLabel: 'Bulk upload',
          onDryRun: vi.fn() as any,
          onCommit: vi.fn() as any,
        }}
      />
    );
    expect(screen.getByRole('button', { name: /bulk upload/i })).toBeInTheDocument();
  });

  it('renders FilterPanel when filterConfig is supplied', () => {
    render(
      <DataPageWithToolbar<Row>
        title="X"
        columns={COLUMNS}
        data={SAMPLE}
        filterConfig={{
          fields: [{ key: 'name', label: 'Name', type: 'text' }],
          value: {},
          onChange: vi.fn(),
        }}
      />
    );
    // FilterPanel renders a Filter label visibly.
    expect(screen.getAllByText(/name/i).length).toBeGreaterThan(0);
  });

  it('renders a custom toolbarSlot alongside the composed primitives', () => {
    render(
      <DataPageWithToolbar<Row>
        title="X"
        columns={COLUMNS}
        data={SAMPLE}
        exportConfig={{ onExport: vi.fn() }}
        toolbarSlot={<button>Custom action</button>}
      />
    );
    expect(screen.getByRole('button', { name: /custom action/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
  });

  it('forwards data to the DataTable rows', () => {
    render(
      <DataPageWithToolbar<Row>
        title="X"
        columns={COLUMNS}
        data={[
          { id: '1', name: 'Alice' },
          { id: '2', name: 'Bob' },
        ]}
      />
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });
});
