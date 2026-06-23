// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  EmailRecipientPicker,
  type Recipient,
} from '@aura/ui/components/ui/email-recipient-picker';

const directory: Recipient[] = [
  { id: 'u1', name: 'Aisha Khan', email: 'aisha@example.com', kind: 'Employee' },
  { id: 'u2', name: 'Bilal Rahman', email: 'bilal@example.com', kind: 'Employee' },
  { id: 'g1', name: 'HR Managers', kind: 'Group' },
];

function search(query: string): Promise<Recipient[]> {
  const q = query.toLowerCase();
  return Promise.resolve(directory.filter((r) => r.name.toLowerCase().includes(q)));
}

describe('EmailRecipientPicker', () => {
  it('renders the panel title and Send disabled by default', () => {
    render(<EmailRecipientPicker onSearch={search} onSend={vi.fn()} />);
    expect(screen.getByText('Share by email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
  });

  it('searches for recipients on input and adds the picked one to To', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn().mockResolvedValue(undefined);
    render(<EmailRecipientPicker onSearch={search} onSend={onSend} />);

    await user.type(screen.getByPlaceholderText(/search recipients/i), 'aisha');

    const option = await screen.findByText('Aisha Khan');
    await user.click(option);

    // Pill appears
    expect(screen.getAllByText('Aisha Khan').length).toBeGreaterThan(0);
  });

  it('enables Send only with a recipient AND a subject', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn().mockResolvedValue(undefined);
    render(<EmailRecipientPicker onSearch={search} onSend={onSend} />);

    await user.type(screen.getByPlaceholderText(/search recipients/i), 'bilal');
    await user.click(await screen.findByText('Bilal Rahman'));

    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();

    await user.type(screen.getByPlaceholderText('Subject'), 'Payroll variance review');
    expect(screen.getByRole('button', { name: /send/i })).toBeEnabled();
  });

  it('calls onSend with the composed payload', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn().mockResolvedValue(undefined);
    render(
      <EmailRecipientPicker
        onSearch={search}
        onSend={onSend}
        initialSubject="Pre-filled"
        initialTo={[{ id: 'pre', name: 'Pre-load', email: 'pre@example.com' }]}
      />
    );

    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => expect(onSend).toHaveBeenCalledTimes(1));
    const payload = onSend.mock.calls[0][0] as { to: Recipient[]; subject: string };
    expect(payload.subject).toBe('Pre-filled');
    expect(payload.to[0].email).toBe('pre@example.com');
  });

  it('surfaces send errors instead of crashing', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn().mockRejectedValue(new Error('smtp down'));
    render(
      <EmailRecipientPicker
        onSearch={search}
        onSend={onSend}
        initialSubject="Test"
        initialTo={[{ id: 'pre', name: 'P', email: 'p@example.com' }]}
      />
    );

    await user.click(screen.getByRole('button', { name: /send/i }));
    await waitFor(() => expect(screen.getByText(/smtp down/i)).toBeInTheDocument());
  });

  it('hides cc/bcc rows when hideCcBcc is true', () => {
    render(<EmailRecipientPicker onSearch={search} onSend={vi.fn()} hideCcBcc />);
    expect(screen.queryByText('Cc')).not.toBeInTheDocument();
    expect(screen.queryByText('Bcc')).not.toBeInTheDocument();
  });
});
