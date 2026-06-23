// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  FilterPanel,
  type FilterFieldDef,
  type SavedViewSummary,
} from '@aura/ui/components/ui/filter-panel';

const fields: FilterFieldDef[] = [
  { key: 'q', label: 'Search', type: 'text', placeholder: 'Find by name' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'ACTIVE', label: 'Active' },
      { value: 'CLOSED', label: 'Closed' },
    ],
  },
  { key: 'overdueOnly', label: 'Overdue only', type: 'boolean' },
];

describe('FilterPanel', () => {
  it('renders one input per field', () => {
    render(<FilterPanel fields={fields} value={{}} onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Find by name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Overdue only')).toBeInTheDocument();
  });

  it('emits onChange with the merged payload when a text field is typed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterPanel fields={fields} value={{}} onChange={onChange} />);

    await user.type(screen.getByPlaceholderText('Find by name'), 'a');

    expect(onChange).toHaveBeenLastCalledWith({ q: 'a' });
  });

  it('drops empty values from the payload (delete behaviour)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterPanel fields={fields} value={{ q: 'foo' }} onChange={onChange} />);

    await user.clear(screen.getByDisplayValue('foo'));

    expect(onChange).toHaveBeenLastCalledWith({});
  });

  it('renders Reset only when filters are active', () => {
    const { rerender } = render(<FilterPanel fields={fields} value={{}} onChange={vi.fn()} />);
    expect(screen.queryByText(/reset/i)).not.toBeInTheDocument();

    rerender(<FilterPanel fields={fields} value={{ q: 'foo' }} onChange={vi.fn()} />);
    expect(screen.getByText(/reset/i)).toBeInTheDocument();
  });

  it('reset clears all filters', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterPanel fields={fields} value={{ q: 'foo' }} onChange={onChange} />);

    await user.click(screen.getByText(/reset/i));
    expect(onChange).toHaveBeenLastCalledWith({});
  });

  describe('saved views', () => {
    const views: SavedViewSummary[] = [
      {
        id: 'v1',
        name: 'My overdue items',
        isDefault: true,
        isShared: false,
        filters: { overdueOnly: true },
      },
      { id: 'v2', name: 'Team — shared', isDefault: false, isShared: true, filters: {} },
    ];

    it('renders the saved-views dropdown', async () => {
      const user = userEvent.setup();
      render(
        <FilterPanel
          fields={fields}
          value={{}}
          onChange={vi.fn()}
          savedViews={views}
          onPickSavedView={vi.fn()}
        />
      );
      await user.click(screen.getByText(/saved views/i));
      expect(screen.getByText('My overdue items')).toBeInTheDocument();
      expect(screen.getByText('Team — shared')).toBeInTheDocument();
    });

    it('calls onPickSavedView when a view is selected', async () => {
      const user = userEvent.setup();
      const onPick = vi.fn();
      render(
        <FilterPanel
          fields={fields}
          value={{}}
          onChange={vi.fn()}
          savedViews={views}
          onPickSavedView={onPick}
        />
      );
      await user.click(screen.getByText(/saved views/i));
      await user.click(screen.getByText('Team — shared'));
      expect(onPick).toHaveBeenCalledWith('v2');
    });

    it('save-current-as-view is disabled until the user has at least one active filter', async () => {
      const user = userEvent.setup();
      render(
        <FilterPanel
          fields={fields}
          value={{}}
          onChange={vi.fn()}
          savedViews={[]}
          onPickSavedView={vi.fn()}
          onSaveView={vi.fn()}
        />
      );

      await user.click(screen.getByText(/saved views/i));
      expect(screen.getByRole('button', { name: /save current as view/i })).toBeDisabled();
    });

    it('saves a view with a name when one is typed', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn().mockResolvedValue(undefined);

      render(
        <FilterPanel
          fields={fields}
          value={{ overdueOnly: true }}
          onChange={vi.fn()}
          savedViews={[]}
          onPickSavedView={vi.fn()}
          onSaveView={onSave}
        />
      );

      await user.click(screen.getByText(/saved views/i));
      await user.click(screen.getByRole('button', { name: /save current as view/i }));
      await user.type(screen.getByPlaceholderText(/name this view/i), 'My view');
      await user.click(screen.getByRole('button', { name: /^save$/i }));

      await waitFor(() => expect(onSave).toHaveBeenCalledWith('My view', { overdueOnly: true }));
    });

    it('triggers delete callback when the delete icon is clicked', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn().mockResolvedValue(undefined);

      render(
        <FilterPanel
          fields={fields}
          value={{}}
          onChange={vi.fn()}
          savedViews={views}
          onPickSavedView={vi.fn()}
          onDeleteSavedView={onDelete}
        />
      );

      await user.click(screen.getByText(/saved views/i));
      await user.click(screen.getByRole('button', { name: /delete view my overdue items/i }));
      expect(onDelete).toHaveBeenCalledWith('v1');
    });
  });
});
