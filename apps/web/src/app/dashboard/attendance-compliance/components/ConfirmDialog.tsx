import * as React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  desc: string;
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  desc,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
}: ConfirmDialogProps) {
  const [busy, setBusy] = React.useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  const btnColor =
    variant === 'danger'
      ? 'bg-rose-600 hover:bg-rose-700 text-white'
      : variant === 'warning'
        ? 'bg-amber-600 hover:bg-amber-700 text-white'
        : 'bg-slate-900 hover:bg-slate-800 text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all scale-100 duration-300">
        <div className="flex items-start gap-4">
          <div
            className={`rounded-full p-2 ${
              variant === 'danger' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
            }`}
          >
            <AlertTriangle className="h-6 w-6 shrink-0" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="text-sm font-medium text-slate-500 leading-normal">{desc}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2.5">
          <button
            type="button"
            disabled={busy}
            onClick={() => onOpenChange(false)}
            className="rounded-xl border border-slate-350 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-bold shadow-md transition-colors disabled:opacity-40 ${btnColor}`}
          >
            {busy ? 'Confirming...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
