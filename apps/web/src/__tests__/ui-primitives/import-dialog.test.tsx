// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImportDialog, type ImportPreview } from '@aura/ui';

function makePreview(overrides: Partial<ImportPreview> = {}): ImportPreview {
  return {
    totalRows: 3,
    validRows: 2,
    errors: [{ row: 3, column: 'email', message: 'invalid email' }],
    sample: [
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'bob@example.com' },
      { name: 'Carol', email: 'not-an-email' },
    ],
    columns: ['name', 'email'],
    ...overrides,
  };
}

function makeCsvFile(): File {
  return new File(['name,email\nA,a@x.com\n'], 'people.csv', { type: 'text/csv' });
}

describe('ImportDialog', () => {
  it('does not render content when closed', () => {
    render(
      <ImportDialog
        isOpen={false}
        onClose={vi.fn()}
        title="Import Employees"
        onDryRun={vi.fn()}
        onCommit={vi.fn()}
      />
    );
    expect(screen.queryByText(/import employees/i)).not.toBeInTheDocument();
  });

  it('shows the title and description when open', () => {
    render(
      <ImportDialog
        isOpen
        onClose={vi.fn()}
        title="Import Employees"
        description="Upload a CSV of new starters."
        onDryRun={vi.fn()}
        onCommit={vi.fn()}
      />
    );
    expect(screen.getByText('Import Employees')).toBeInTheDocument();
    expect(screen.getByText('Upload a CSV of new starters.')).toBeInTheDocument();
  });

  it('runs dry-run on file selection and shows the validation summary + sample table', async () => {
    const user = userEvent.setup();
    const dryRun = vi.fn().mockResolvedValue(makePreview());

    render(
      <ImportDialog
        isOpen
        onClose={vi.fn()}
        title="Import Employees"
        onDryRun={dryRun}
        onCommit={vi.fn()}
      />
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, makeCsvFile());

    await waitFor(() => expect(dryRun).toHaveBeenCalledTimes(1));

    // summary stats
    expect(screen.getByText('Total rows')).toBeInTheDocument();
    expect(screen.getByText('Valid')).toBeInTheDocument();
    expect(screen.getByText('Errors')).toBeInTheDocument();

    // sample table
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();

    // error list
    expect(screen.getByText('invalid email')).toBeInTheDocument();
  });

  it('disables Commit when every row is invalid', async () => {
    const user = userEvent.setup();
    const dryRun = vi.fn().mockResolvedValue(
      makePreview({
        validRows: 0,
        totalRows: 1,
        errors: [{ row: 1, message: 'bad' }],
        sample: [],
      })
    );

    render(
      <ImportDialog
        isOpen
        onClose={vi.fn()}
        title="Import Employees"
        onDryRun={dryRun}
        onCommit={vi.fn()}
      />
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, makeCsvFile());

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /commit import/i })).toBeDisabled()
    );
  });

  it('calls onCommit with the chosen file when Commit is clicked', async () => {
    const user = userEvent.setup();
    const dryRun = vi.fn().mockResolvedValue(makePreview());
    const commit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <ImportDialog
        isOpen
        onClose={onClose}
        title="Import Employees"
        onDryRun={dryRun}
        onCommit={commit}
      />
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeCsvFile();
    await user.upload(fileInput, file);

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /commit import/i })).not.toBeDisabled()
    );

    await user.click(screen.getByRole('button', { name: /commit import/i }));

    expect(commit).toHaveBeenCalledTimes(1);
    expect(commit.mock.calls[0][0]).toBe(file);
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('surfaces dry-run errors instead of crashing', async () => {
    const user = userEvent.setup();
    const dryRun = vi.fn().mockRejectedValue(new Error('Bad header row'));

    render(
      <ImportDialog
        isOpen
        onClose={vi.fn()}
        title="Import Employees"
        onDryRun={dryRun}
        onCommit={vi.fn()}
      />
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, makeCsvFile());

    await waitFor(() => expect(screen.getByText('Bad header row')).toBeInTheDocument());
  });
});
