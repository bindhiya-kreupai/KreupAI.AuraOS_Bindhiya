import * as React from 'react';
import { AlertTriangle, Trash2, Archive, RotateCcw, AlertOctagon, CheckCircle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
  onConfirm,
}: ConfirmDialogProps) {
  const [loading, setLoading] = React.useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const colors = {
    danger: {
      bg: 'bg-rose-50',
      icon: 'text-rose-600',
      btn: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500',
      border: 'border-rose-100',
      IconComponent: Trash2,
    },
    warning: {
      bg: 'bg-amber-50',
      icon: 'text-amber-600',
      btn: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
      border: 'border-amber-100',
      IconComponent: AlertTriangle,
    },
    info: {
      bg: 'bg-slate-50',
      icon: 'text-slate-600',
      btn: 'bg-slate-900 hover:bg-slate-800 focus:ring-slate-700',
      border: 'border-slate-100',
      IconComponent: RotateCcw,
    },
    success: {
      bg: 'bg-emerald-50',
      icon: 'text-emerald-600',
      btn: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
      border: 'border-emerald-100',
      IconComponent: CheckCircle,
    },
  }[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div
        className="w-full max-w-md transform overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-left align-middle shadow-2xl transition-all duration-300 scale-95 hover:scale-100"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${colors.bg} ${colors.icon}`}
          >
            <colors.IconComponent className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold leading-6 text-slate-900">{title}</h3>
            <p className="mt-2 text-sm text-slate-500">{description}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="inline-flex justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`inline-flex justify-center rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${colors.btn}`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
