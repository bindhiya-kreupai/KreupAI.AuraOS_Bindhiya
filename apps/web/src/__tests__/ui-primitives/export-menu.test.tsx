// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExportMenu, type ExportFormat } from '@aura/ui/components/ui/export-menu';

describe('ExportMenu', () => {
  it('renders an "Export" trigger', () => {
    render(<ExportMenu onExport={vi.fn()} />);
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
  });

  it('opens the format menu on click and lists CSV / Excel / PDF by default', async () => {
    const user = userEvent.setup();
    render(<ExportMenu onExport={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /export/i }));
    expect(screen.getByRole('menuitem', { name: /csv/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /excel/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /pdf/i })).toBeInTheDocument();
  });

  it('honours a restricted format list', async () => {
    const user = userEvent.setup();
    render(<ExportMenu onExport={vi.fn()} formats={['csv']} />);
    await user.click(screen.getByRole('button', { name: /export/i }));
    expect(screen.getByRole('menuitem', { name: /csv/i })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /pdf/i })).not.toBeInTheDocument();
  });

  it('invokes onExport with the chosen format and closes the menu', async () => {
    const user = userEvent.setup();
    const handler = vi.fn().mockResolvedValue(undefined);
    render(<ExportMenu onExport={handler} />);

    await user.click(screen.getByRole('button', { name: /export/i }));
    await user.click(screen.getByRole('menuitem', { name: /csv/i }));

    expect(handler).toHaveBeenCalledTimes(1);
    const calledWith = handler.mock.calls[0][0] as ExportFormat;
    expect(calledWith).toBe('csv');
    expect(screen.queryByRole('menuitem', { name: /csv/i })).not.toBeInTheDocument();
  });

  it('shows the row count badge when rowCount > 0', () => {
    render(<ExportMenu onExport={vi.fn()} rowCount={1234} />);
    expect(screen.getByText('(1,234)')).toBeInTheDocument();
  });

  it('disables the trigger when disabled', () => {
    render(<ExportMenu onExport={vi.fn()} disabled />);
    expect(screen.getByRole('button', { name: /export/i })).toBeDisabled();
  });
});
