// @vitest-environment happy-dom
import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StructuredArrayEditor, type StructuredColumn } from '@aura/ui/components/ui';

const COLUMNS: StructuredColumn[] = [
  { key: 'domain', label: 'Domain', type: 'text', required: true },
  { key: 'ruleKey', label: 'Rule key', type: 'text', required: true },
  { key: 'value', label: 'Value', type: 'number' },
  {
    key: 'enabled',
    label: 'Enabled',
    type: 'boolean',
  },
];

function Harness({ initial }: { initial?: Array<Record<string, unknown>> }) {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>(initial ?? []);
  return (
    <>
      <StructuredArrayEditor columns={COLUMNS} value={rows} onChange={setRows} label="Overrides" />
      <pre data-testid="dump">{JSON.stringify(rows)}</pre>
    </>
  );
}

describe('StructuredArrayEditor', () => {
  it('renders the column headers', () => {
    render(<Harness />);
    expect(screen.getByText('Domain')).toBeInTheDocument();
    expect(screen.getByText('Rule key')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    expect(screen.getByText('Enabled')).toBeInTheDocument();
  });

  it('shows the empty-state row when value is empty', () => {
    render(<Harness />);
    expect(screen.getByText(/no rows/i)).toBeInTheDocument();
  });

  it('adds a new row when Add row is clicked', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: /add row/i }));
    // After add, the empty state goes away and there's exactly one editable
    // row with the domain text input.
    expect(screen.queryByText(/no rows/i)).toBeNull();
    const dump = JSON.parse(screen.getByTestId('dump').textContent ?? '[]');
    expect(dump).toHaveLength(1);
    expect(dump[0]).toEqual({ domain: '', ruleKey: '', value: 0, enabled: false });
  });

  it('removes a row when the Remove button is clicked', async () => {
    const user = userEvent.setup();
    render(<Harness initial={[{ domain: 'A', ruleKey: 'B', value: 1, enabled: true }]} />);
    await user.click(screen.getByRole('button', { name: /remove row 1/i }));
    const dump = JSON.parse(screen.getByTestId('dump').textContent ?? '[]');
    expect(dump).toEqual([]);
  });

  it('updates a text cell on change', async () => {
    const user = userEvent.setup();
    render(<Harness initial={[{ domain: '', ruleKey: '', value: 0, enabled: false }]} />);
    const input = screen.getByLabelText(/Domain row 1/i);
    await user.type(input, 'GOSI');
    const dump = JSON.parse(screen.getByTestId('dump').textContent ?? '[]');
    expect(dump[0].domain).toBe('GOSI');
  });

  it('updates a number cell on change', async () => {
    render(<Harness initial={[{ domain: '', ruleKey: '', value: 0, enabled: false }]} />);
    const input = screen.getByLabelText(/Value row 1/i);
    fireEvent.change(input, { target: { value: '42' } });
    const dump = JSON.parse(screen.getByTestId('dump').textContent ?? '[]');
    expect(dump[0].value).toBe(42);
  });

  it('updates a boolean cell when checkbox is toggled', async () => {
    const user = userEvent.setup();
    render(<Harness initial={[{ domain: '', ruleKey: '', value: 0, enabled: false }]} />);
    await user.click(screen.getByLabelText(/Enabled row 1/i));
    const dump = JSON.parse(screen.getByTestId('dump').textContent ?? '[]');
    expect(dump[0].enabled).toBe(true);
  });

  it('renders a select control when column type=select', async () => {
    const user = userEvent.setup();
    const COLS: StructuredColumn[] = [
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'ACTIVE', label: 'Active' },
          { value: 'INACTIVE', label: 'Inactive' },
        ],
      },
    ];
    function H() {
      const [r, setR] = useState<Array<Record<string, unknown>>>([{ status: '' }]);
      return (
        <>
          <StructuredArrayEditor columns={COLS} value={r} onChange={setR} />
          <pre data-testid="d">{JSON.stringify(r)}</pre>
        </>
      );
    }
    render(<H />);
    await user.selectOptions(screen.getByLabelText(/Status row 1/i), 'ACTIVE');
    const dump = JSON.parse(screen.getByTestId('d').textContent ?? '[]');
    expect(dump[0].status).toBe('ACTIVE');
  });

  it('disables Remove when value.length <= minRows', () => {
    render(
      <StructuredArrayEditor
        columns={COLUMNS}
        value={[{ domain: 'A', ruleKey: 'B', value: 1, enabled: false }]}
        onChange={vi.fn()}
        minRows={1}
      />
    );
    const removeBtn = screen.getByRole('button', { name: /remove row 1/i });
    expect(removeBtn).toBeDisabled();
  });

  it('disables Add when value.length >= maxRows', () => {
    render(
      <StructuredArrayEditor
        columns={COLUMNS}
        value={[{ domain: 'A', ruleKey: 'B', value: 1, enabled: false }]}
        onChange={vi.fn()}
        maxRows={1}
        label="X"
      />
    );
    const addBtn = screen.getByRole('button', { name: /add row/i });
    expect(addBtn).toBeDisabled();
  });

  it('renders Arabic labels when locale=ar', () => {
    render(
      <StructuredArrayEditor
        columns={[{ key: 'x', label: 'Domain', labelAr: 'النطاق', type: 'text' }]}
        value={[]}
        onChange={vi.fn()}
        label="Overrides"
        labelAr="التجاوزات"
        addLabel="Add row"
        addLabelAr="إضافة صف"
        locale="ar"
      />
    );
    expect(screen.getByText('التجاوزات')).toBeInTheDocument();
    expect(screen.getByText('النطاق')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /إضافة صف/ })).toBeInTheDocument();
  });

  it('renders the help text when supplied', () => {
    render(
      <StructuredArrayEditor
        columns={COLUMNS}
        value={[]}
        onChange={vi.fn()}
        label="Overrides"
        helpText="Each row replaces one rule for the country."
      />
    );
    expect(screen.getByText(/Each row replaces one rule/i)).toBeInTheDocument();
  });
});
