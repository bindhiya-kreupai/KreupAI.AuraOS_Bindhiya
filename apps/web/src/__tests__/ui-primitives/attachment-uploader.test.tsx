// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  AttachmentUploader,
  type UploadedAttachment,
} from '@aura/ui/components/ui/attachment-uploader';

function makeFile(name = 'a.pdf', sizeBytes = 1024): File {
  return new File(['x'.repeat(sizeBytes)], name, { type: 'application/pdf' });
}

function mockAttachment(file: File): UploadedAttachment {
  return {
    id: `att-${file.name}`,
    fileName: file.name,
    contentType: file.type,
    sizeBytes: file.size,
    storageKey: `s3://bucket/${file.name}`,
  };
}

describe('AttachmentUploader', () => {
  it('renders the drop-zone copy', () => {
    render(<AttachmentUploader onUpload={vi.fn()} />);
    expect(screen.getByText(/drop files or click to browse/i)).toBeInTheDocument();
  });

  it('uploads a chosen file and emits onChange with the persisted item', async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn().mockImplementation(async (f: File) => mockAttachment(f));
    const onChange = vi.fn();

    render(<AttachmentUploader onUpload={onUpload} onChange={onChange} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, makeFile('contract.pdf'));

    await waitFor(() => expect(onUpload).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onChange).toHaveBeenCalled());

    // The "attached" list should now show the file
    await waitFor(() => expect(screen.getByText('contract.pdf')).toBeInTheDocument());
  });

  it('rejects files with an unsupported extension and shows the error inline', async () => {
    const onUpload = vi.fn();

    render(<AttachmentUploader onUpload={onUpload} acceptedExtensions={['.pdf']} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    // Bypass user-event's accept-attribute filtering by dispatching a raw
    // change event — the whole point of the test is to verify our
    // app-level extension check, not the browser's pre-filter.
    const evilFile = new File(['x'], 'evil.exe', { type: 'application/octet-stream' });
    fireEvent.change(fileInput, { target: { files: [evilFile] } });

    await waitFor(() => expect(screen.getByText(/unsupported format/i)).toBeInTheDocument());
    expect(onUpload).not.toHaveBeenCalled();
  });

  it('rejects oversized files', async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn();

    render(<AttachmentUploader onUpload={onUpload} maxFileSize={100} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, makeFile('big.pdf', 200));

    expect(onUpload).not.toHaveBeenCalled();
    expect(screen.getByText(/exceeds/i)).toBeInTheDocument();
  });

  it('surfaces upload errors in the in-flight queue', async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn().mockRejectedValue(new Error('network down'));

    render(<AttachmentUploader onUpload={onUpload} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, makeFile('a.pdf'));

    await waitFor(() => expect(screen.getByText(/network down/i)).toBeInTheDocument());
  });

  it('removes an attachment when the user clicks the close button', async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn().mockImplementation(async (f: File) => mockAttachment(f));
    const onChange = vi.fn();

    render(<AttachmentUploader onUpload={onUpload} onChange={onChange} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, makeFile('keep.pdf'));

    await waitFor(() => expect(screen.getByText('keep.pdf')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /remove keep\.pdf/i }));

    await waitFor(() => {
      const last = onChange.mock.calls.at(-1)?.[0] as UploadedAttachment[];
      expect(last).toEqual([]);
    });
  });
});
